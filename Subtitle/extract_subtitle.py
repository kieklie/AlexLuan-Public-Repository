#!/usr/bin/env python3
"""
视频字幕提取工具
使用Whisper进行语音识别，支持多种视频源和输出格式

支持平台:
    - Bilibili (BV号或URL)
    - YouTube
    - 本地视频文件
    - 任何yt-dlp支持的平台

用法:
    python extract_subtitle.py <url_or_path> [--model base] [--language zh]

依赖:
    pip install openai-whisper yt-dlp
"""

import argparse
import json
import logging
import os
import sys
import subprocess
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# 尝试导入whisper，不存在则提示安装
try:
    import whisper
except ImportError:
    logger.error("请先安装 whisper: pip install openai-whisper")
    sys.exit(1)


def find_ffmpeg() -> Path:
    """查找ffmpeg位置"""
    # 1. 环境变量
    ffmpeg_env = os.environ.get('FFMPEG_PATH')
    if ffmpeg_env and Path(ffmpeg_env).exists():
        return Path(ffmpeg_env)

    # 2. 脚本同目录的output
    script_dir = Path(__file__).parent
    ffmpeg_path = script_dir / "output" / "ffmpeg-8.1-essentials_build" / "bin"
    if ffmpeg_path.exists():
        return ffmpeg_path

    # 3. 系统PATH
    for exe in ['ffmpeg.exe', 'ffmpeg', 'ffprobe.exe', 'ffprobe']:
        if subprocess.run(['where', exe], capture_output=True).returncode == 0:
            result = subprocess.run(['where', exe], capture_output=True, text=True)
            return Path(result.stdout.strip().split('\n')[0]).parent

    raise FileNotFoundError("未找到ffmpeg，请安装ffmpeg或设置FFMPEG_PATH环境变量")


def check_audio_integrity(audio_path: str) -> dict:
    """检查音频文件完整性"""
    try:
        ffmpeg_path = find_ffmpeg()
        ffprobe_path = ffmpeg_path / "ffprobe.exe" if (ffmpeg_path / "ffprobe.exe").exists() else ffmpeg_path / "ffprobe"
    except FileNotFoundError:
        return {"valid": False, "error": "ffprobe not found"}

    try:
        result = subprocess.run(
            [str(ffprobe_path), "-v", "error",
             "-show_entries", "format=duration,size",
             "-of", "default=noprint_wrappers=1:nokey=1",
             audio_path],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            if len(lines) >= 2:
                return {
                    "valid": True,
                    "duration": float(lines[0]),
                    "size": int(lines[1])
                }
        return {"valid": False, "error": result.stderr}
    except Exception as e:
        return {"valid": False, "error": str(e)}


def is_bilibili_url(url: str) -> bool:
    """判断是否为B站链接"""
    return 'bilibili.com' in url


def extract_bilibili_episode(url: str) -> tuple[str, Optional[int]]:
    """从B站URL中提取基础URL和集数"""
    # 处理BV号
    bv_match = re.search(r'BV[a-zA-Z0-9]+', url)
    if bv_match:
        bv = bv_match.group(0)
        p_match = re.search(r'[?&]p=(\d+)', url)
        episode = int(p_match.group(1)) if p_match else None
        return f"https://www.bilibili.com/video/{bv}", episode
    return url, None


def download_audio(url: str, output_dir: str, episode_num: int = None,
                   video_title: str = "") -> str:
    """下载视频音频，支持多种平台"""

    # 自动检测B站集数
    if is_bilibili_url(url) and episode_num is None:
        url, detected_ep = extract_bilibili_episode(url)
        episode_num = episode_num or detected_ep

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 构建输出文件名
    if episode_num:
        safe_title = re.sub(r'[^\w\u4e00-\u9fff-]', '_', video_title)[:50]
        output_file = output_dir / f"audio_{safe_title}_p{episode_num}.mp3"
    else:
        safe_title = re.sub(r'[^\w\u4e00-\u9fff-]', '_', video_title)[:50]
        output_file = output_dir / f"audio_{safe_title}.mp3"

    # 清除旧文件
    if output_file.exists():
        output_file.unlink()

    try:
        ffmpeg_path = find_ffmpeg()
    except FileNotFoundError:
        logger.warning("未找到ffmpeg，将尝试使用系统ffmpeg")
        ffmpeg_path = ""

    cmd = [
        "yt-dlp",
        "-x", "--audio-format", "mp3", "--audio-quality", "0",
        "--keep-video",  # 提取音频后保留中间视频文件
        "-o", str(output_file),
    ]

    if ffmpeg_path:
        cmd.extend(["--ffmpeg-location", str(ffmpeg_path)])

    # B站分集处理
    if is_bilibili_url(url) and episode_num:
        # 检查URL是否已包含p参数
        if "?p=" not in url:
            url = f"{url}?p={episode_num}"

    cmd.append(url)

    logger.info(f"下载音频: {url}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"下载失败: {result.stderr}")

    return str(output_file)


def transcribe_audio(audio_path: str, model_name: str = "base",
                     language: str = "zh") -> dict:
    """使用Whisper转录音频"""
    # 确保ffmpeg在PATH中
    try:
        ffmpeg_path = find_ffmpeg()
        os.environ['PATH'] = os.environ.get('PATH', '') + os.pathsep + str(ffmpeg_path)
    except FileNotFoundError:
        pass

    logger.info(f"加载模型: {model_name}...")
    model = whisper.load_model(model_name)

    logger.info(f"转录中: {Path(audio_path).name}")
    result = model.transcribe(
        audio_path,
        language=language,
        word_timestamps=True,
        verbose=False
    )

    return result


def format_timestamp(seconds: float, fmt: str = "short") -> str:
    """格式化时间戳
    fmt: 'short' -> MM:SS, 'srt' -> HH:MM:SS,mmm
    """
    if fmt == "srt":
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
    else:
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{minutes:02d}:{secs:02d}"


def save_srt_subtitle(result: dict, output_path: str):
    """保存SRT格式字幕(通用视频字幕格式)"""
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, seg in enumerate(result['segments'], 1):
            start = format_timestamp(seg['start'], "srt")
            end = format_timestamp(seg['end'], "srt")
            text = seg['text'].strip()

            f.write(f"{i}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{text}\n\n")

    logger.info(f"SRT字幕已保存: {output_path}")


def save_segmented_subtitle(result: dict, output_path: str,
                             title: str = "视频字幕",
                             subtitle_name: str = ""):
    """保存带时间戳的分段字幕(可读格式)"""

    with open(output_path, 'w', encoding='utf-8') as f:
        # 写入标题
        f.write('=' * 60 + '\n')
        f.write(f'{title}\n')
        if subtitle_name:
            f.write(f'{subtitle_name}\n')
        f.write('=' * 60 + '\n\n')

        # 写入每个片段
        for i, seg in enumerate(result['segments'], 1):
            start = format_timestamp(seg['start'])
            end = format_timestamp(seg['end'])

            f.write(f'[{start} --> {end}] 第{i}段\n')
            f.write(seg['text'].strip() + '\n')
            f.write('-' * 40 + '\n\n')

    logger.info(f"分段字幕已保存: {output_path}")


def save_raw_segments(result: dict, output_path: str):
    """保存原始分段数据(JSON格式)"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result['segments'], f, ensure_ascii=False, indent=2)
    logger.info(f"原始数据已保存: {output_path}")


def new_run_output_dir(base_output: Path) -> Path:
    """在基准输出目录下按当前时间新建子文件夹，每次运行唯一。"""
    base_output = base_output.resolve()
    base_output.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = base_output / stamp
    n = 0
    while run_dir.exists():
        n += 1
        run_dir = base_output / f"{stamp}_{n}"
    run_dir.mkdir(parents=True, exist_ok=False)
    return run_dir


def process_video(url: str, output_dir: str,
                  model_name: str = "base",
                  language: str = "zh",
                  episode_num: int = None,
                  video_title: str = "",
                  save_srt: bool = True):
    """处理单个视频"""

    logger.info(f"\n{'='*50}\n开始处理: {url}\n{'='*50}")

    # 1. 下载音频
    audio_path = download_audio(url, output_dir, episode_num, video_title)

    # 2. 检查音频完整性
    logger.info("检查音频完整性...")
    integrity = check_audio_integrity(audio_path)
    if not integrity["valid"]:
        raise RuntimeError(f"音频文件无效: {integrity.get('error', '未知错误')}")

    duration_min = integrity["duration"] / 60
    logger.info(f"音频时长: {duration_min:.2f} 分钟, 大小: {integrity['size']/1024/1024:.2f} MB")

    # 3. 转录
    result = transcribe_audio(audio_path, model_name, language)

    # 4. 保存结果
    safe_title = re.sub(r'[^\w\u4e00-\u9fff-]', '_', video_title)[:30]
    base_name = f"subtitle_{safe_title}_p{episode_num}" if episode_num else f"subtitle_{safe_title}"

    output_path = Path(output_dir) / f"{base_name}_segmented.txt"
    save_segmented_subtitle(result, str(output_path), video_title or url)

    json_path = Path(output_dir) / f"{base_name}_segments.json"
    save_raw_segments(result, str(json_path))

    if save_srt:
        srt_path = Path(output_dir) / f"{base_name}.srt"
        save_srt_subtitle(result, str(srt_path))

    # 5. 保留下载/提取的音频与视频（不删除中间文件）
    logger.info(f"已保留音频: {audio_path}")

    logger.info(f"\n处理完成! 共 {len(result['segments'])} 个片段")
    return output_path


def process_playlist(url: str, output_dir: str,
                     model_name: str = "base",
                     language: str = "zh",
                     start_ep: int = 1,
                     end_ep: Optional[int] = None):
    """批量处理分集视频"""

    # 获取总集数(通过yt-dlp --list-subs)
    logger.info("获取播放列表信息...")
    result = subprocess.run(
        ["yt-dlp", "--list-subs", url],
        capture_output=True,
        text=True
    )

    # 解析总集数
    playlist_match = re.search(r'Downloading part 1 \((.+?) of (\d+?)\)', result.stderr)
    if playlist_match:
        total_eps = int(playlist_match.group(2))
    else:
        # 尝试从视频标题估算
        total_eps = end_ep or 10  # 默认10集

    end_ep = end_ep or total_eps
    logger.info(f"共 {total_eps} 集，将处理第 {start_ep} 到 {end_ep} 集")

    success_count = 0
    failed_eps = []

    for ep in range(start_ep, end_ep + 1):
        try:
            logger.info(f"\n>>> 处理第 {ep}/{end_ep} 集 <<<")
            process_video(
                url=url,
                output_dir=output_dir,
                model_name=model_name,
                language=language,
                episode_num=ep,
                video_title=""
            )
            success_count += 1
        except Exception as e:
            logger.error(f"第 {ep} 集处理失败: {e}")
            failed_eps.append((ep, str(e)))

    logger.info(f"\n{'='*50}")
    logger.info(f"批量处理完成: 成功 {success_count}/{end_ep - start_ep + 1} 集")
    if failed_eps:
        logger.warning(f"失败集数: {[ep for ep, _ in failed_eps]}")
    logger.info(f"{'='*50}")


def main():
    parser = argparse.ArgumentParser(
        description="视频字幕提取工具 - 支持B站、YouTube等平台",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 处理B站单个视频
  python extract_subtitle.py BV1GN4y127CU

  # 处理B站分集视频指定集数
  python extract_subtitle.py BV1GN4y127CU -p 1

  # 批量处理B站视频1-10集
  python extract_subtitle.py BV1GN4y127CU --batch 1-10

  # 处理YouTube视频
  python extract_subtitle.py "https://www.youtube.com/watch?v=xxx"

  # 处理本地视频
  python extract_subtitle.py /path/to/video.mp4

  # 使用更大模型(更准确但更慢)
  python extract_subtitle.py <url> -m small
        """
    )
    parser.add_argument("url", help="视频URL、BV号或本地文件路径")
    parser.add_argument("-o", "--output", default="output",
                       help="输出根目录，每次运行会在其下新建以时间命名的子文件夹 (默认: output)")
    parser.add_argument("-m", "--model", default="base",
                       choices=["tiny", "base", "small", "medium", "large"],
                       help="Whisper模型 (默认: base)")
    parser.add_argument("-l", "--language", default="zh",
                       help="语言代码 (默认: zh), auto为自动检测")
    parser.add_argument("-p", "--part", type=int,
                       help="指定集数 (用于分集视频)")
    parser.add_argument("--batch",
                       help="批量处理范围，如 '1-10'")
    parser.add_argument("--no-srt",
                       action="store_true",
                       help="不生成SRT字幕文件")

    args = parser.parse_args()

    run_output_dir = new_run_output_dir(Path(args.output))
    logger.info(f"本次结果将保存至: {run_output_dir}")

    # 解析URL
    url = args.url
    if os.path.isfile(url):
        # 本地文件
        url = Path(url).absolute()
    elif not url.startswith("http") and not url.startswith("BV"):
        url = f"https://www.bilibili.com/video/{url}"

    # 批量处理
    if args.batch:
        match = re.match(r'(\d+)-(\d+)', args.batch)
        if match:
            start_ep = int(match.group(1))
            end_ep = int(match.group(2))
            process_playlist(
                url=url,
                output_dir=str(run_output_dir),
                model_name=args.model,
                language=args.language,
                start_ep=start_ep,
                end_ep=end_ep
            )
        else:
            logger.error("batch格式应为: 1-10")
            sys.exit(1)
    else:
        process_video(
            url=url,
            output_dir=str(run_output_dir),
            model_name=args.model,
            language=args.language if args.language != 'auto' else None,
            episode_num=args.part,
            save_srt=not args.no_srt
        )


if __name__ == "__main__":
    main()
