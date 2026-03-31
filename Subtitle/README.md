# 视频字幕提取工具

使用 Whisper AI 从视频中提取语音字幕，支持多种视频平台和格式。

## 功能特性

- 支持 **B站、YouTube、本地视频** 等yt-dlp支持的任意平台
- 输出多种字幕格式：**SRT（通用）**、**分段TXT（可读）**、**JSON（数据）**
- 自动检测音频完整性
- 批量处理分集视频
- 灵活配置Whisper模型

## 环境准备

### 1. 安装依赖

```bash
pip install openai-whisper yt-dlp
```

### 2. 安装 ffmpeg（视频处理必需）

**Windows:**
```bash
# 方法1: winget (推荐)
winget install --id=Gyan.FFmpeg -e --accept-source-agreements

# 方法2: 下载后放到项目 output/ffmpeg-8.1-essentials_build/bin/
# 下载地址: https://www.gyan.dev/ffmpeg/builds/
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg  # Ubuntu/Debian
sudo yum install ffmpeg  # CentOS
```

### 3. 设置环境变量（可选）

```bash
# Windows
set FFMPEG_PATH=C:\path\to\ffmpeg\bin

# macOS/Linux
export FFMPEG_PATH=/usr/local/bin
```

## 使用方法

### 基本用法

```bash
# B站视频 - 直接使用BV号
python extract_subtitle.py BV1GN4y127CU

# B站视频 - 使用完整URL
python extract_subtitle.py "https://www.bilibili.com/video/BV1GN4y127CU/"

# YouTube视频
python extract_subtitle.py "https://www.youtube.com/watch?v=xxxxx"

# 本地视频文件
python extract_subtitle.py /path/to/video.mp4
```

### 分集视频处理

```bash
# 处理第1集
python extract_subtitle.py BV1GN4y127CU -p 1

# 批量处理第1-10集
python extract_subtitle.py BV1GN4y127CU --batch 1-10

# 指定输出目录
python extract_subtitle.py <url> -o my_subtitles
```

### 高级选项

```bash
# 使用更大模型（更准确，但更慢）
# 模型选择: tiny < base < small < medium < large
python extract_subtitle.py <url> -m small

# 指定语言（默认自动检测中文）
python extract_subtitle.py <url> -l en   # 英文
python extract_subtitle.py <url> -l auto # 自动检测

# 不生成SRT文件
python extract_subtitle.py <url> --no-srt
```

## 输出文件

处理完成后，在输出目录会生成以下文件：

| 文件 | 格式 | 用途 |
|------|------|------|
| `subtitle_xxx.srt` | SRT | 通用视频字幕，可用任何播放器打开 |
| `subtitle_xxx_segmented.txt` | TXT | 带时间戳的分段字幕，方便阅读 |
| `subtitle_xxx_segments.json` | JSON | 原始分段数据，可用于其他处理 |

### SRT字幕示例
```
1
00:00:00,000 --> 00:00:02,500
Hello 小伙伴们大家好,我是索尔,

2
00:00:02,500 --> 00:00:04,300
曾在阿里做加娃娇国师,
```

### 分段字幕示例
```
============================================================
Oracle数据库从入门到精通 - 第1集
============================================================

[00:00 --> 00:02] 第1段
Hello 小伙伴们大家好,我是索尔,
----------------------------------------

[00:02 --> 00:04] 第2段
曾在阿里做加娃娇国师,
----------------------------------------
```

## Whisper模型选择

| 模型 | 参数量 | 速度 | 准确率 | 内存需求 |
|------|--------|------|--------|----------|
| tiny | 39M | 最快 | 较低 | ~1GB |
| base | 74M | 快 | 中等 | ~1GB |
| small | 244M | 中等 | 高 | ~2GB |
| medium | 769M | 慢 | 很高 | ~5GB |
| large | 1550M | 最慢 | 最高 | ~10GB |

**默认使用 `base` 模型，平衡速度和准确率。**

## 项目结构

```
D:/CSagent/Subtitle/
├── extract_subtitle.py    # 主脚本
├── README.md               # 本文件
└── output/                 # 输出目录
    ├── ffmpeg-8.1-essentials_build/  # ffmpeg工具
    ├── subtitle_xxx.srt              # SRT字幕
    ├── subtitle_xxx_segmented.txt    # 分段字幕
    └── subtitle_xxx_segments.json    # 原始数据
```

## 复用到其他视频源

### yt-dlp支持的平台

本工具基于yt-dlp，理论上支持其支持的任何平台：

| 平台 | 示例URL |
|------|---------|
| YouTube | `https://www.youtube.com/watch?v=xxx` |
| Twitter/X | `https://twitter.com/xxx` |
| TikTok | `https://www.tiktok.com/@xxx` |
| 抖音 | `https://www.douyin.com/video/xxx` |
| 微博 | `https://weibo.com/xxx` |
| ... | yt-dlp支持数百个平台 |

### 本地文件

直接传入文件路径即可：
```bash
python extract_subtitle.py /path/to/video.mp4
python extract_subtitle.py "C:\Videos\lecture.mp4"
```

## 常见问题

### Q: 下载失败，提示需要登录？
A: 部分B站视频需要登录才能下载高清版本。可使用浏览器Cookie认证：
```bash
yt-dlp --cookies-from-browser chrome "https://www.bilibili.com/video/BVxxx"
```

### Q: 内存不足？
A: 使用更小的模型：
```bash
python extract_subtitle.py <url> -m tiny
```

### Q: 转录太慢？
A: 使用更小的模型或关闭word_timestamps（修改代码中的`word_timestamps=True`）

### Q: 如何处理没有声音的视频？
A: 本工具无法处理无音轨视频，请确认视频包含音频。

### Q: ffmpeg not found?
A: 确保ffmpeg安装并添加到PATH，或设置FFMPEG_PATH环境变量。

## 技术栈

- [Whisper](https://github.com/openai/whisper) - OpenAI语音识别
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - 视频下载
- [ffmpeg](https://ffmpeg.org/) - 音视频处理
