"""
AI Terminology Expert Agent - Core Agent Logic
"""
import asyncio
import json
import re
from typing import Any, Optional

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessage
from tavily import TavilyClient

import config
import prompts
import storage
import aiohttp


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "搜索互联网获取 AI 术语的最新信息。**仅当**用户明确要求「最新」信息、查询罕见术语、或术语不在常见AI范围内时才使用。对于 Transformer、Attention、BERT、GPT、LSTM、CNN 等常见术语，**禁止**使用此工具，直接基于已有知识回答。",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索关键词",
                    }
                },
                "required": ["query"],
            },
        },
    }
]

MAX_TOOL_ROUNDS = 1

# 常见 AI 术语列表（用于快速匹配）
COMMON_TERMS = {
    "transformer", "attention", "bert", "gpt", "lora", "rag", "gan", "vae",
    "diffusion", "llm", "mlp", "cnn", "rnn", "lstm", "gru", "resnet", "vit",
    "clip", "dalle", "stable diffusion", "midjourney", "word2vec", "glove",
    "elmo", "gpt-2", "gpt-3", "gpt-4", "instructgpt", "chatgpt", "t5",
    "bart", "roberta", "albert", "electra", "deberta", "xlnet", "ctrl",
    "peft", "adapter", "prefix tuning", "prompt tuning", "cold start",
    "retrieval augmented", "self-attention", "multi-head attention", "cross-attention",
    "scaled dot-product", "layer norm", "batch norm", "dropout", "positional encoding",
    "feed forward", "encoder", "decoder", "embedding", "token", "tokenizer",
}


def extract_term(text: str) -> Optional[str]:
    """从用户消息中提取 AI 术语"""
    # 清理输入
    text = text.strip().lower()

    # 直接匹配常见术语
    for term in COMMON_TERMS:
        # 确保是完整单词匹配
        pattern = r'\b' + re.escape(term) + r'\b'
        if re.search(pattern, text):
            return term

    # 尝试提取第一个大写开头的单词（通常是英文术语）
    match = re.search(r'\b([A-Z][a-zA-Z0-9]+)\b', text)
    if match:
        return match.group(1).lower()

    return None


class TerminologyAgent:
    """AI 术语专家 Agent 核心类"""

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=config.MINIMAX_API_KEY,
            base_url=config.MINIMAX_BASE_URL,
        )
        self.storage = storage.storage
        self._tavily: Optional[TavilyClient] = None
        if config.TAVILY_API_KEY:
            self._tavily = TavilyClient(api_key=config.TAVILY_API_KEY)

    def _build_messages(self, session_id: str, user_message: str) -> list[dict[str, Any]]:
        """组装 OpenAI 格式的对话消息（含系统提示与历史）。"""
        chat_history = self.storage.get_recent_history(session_id, limit=6)
        messages: list[dict[str, Any]] = [
            {"role": "system", "content": prompts.SYSTEM_PROMPT},
        ]
        for msg in chat_history:
            role = msg.get("role")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content is not None:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_message})
        return messages

    def _format_tavily_response(self, raw: dict) -> str:
        """将 Tavily API 返回格式化为模型可读的文本。"""
        results = raw.get("results") or []
        if not results:
            return "未找到相关搜索结果。"
        lines: list[str] = []
        for i, r in enumerate(results[: config.TAVILY_MAX_RESULTS], 1):
            title = r.get("title") or "(无标题)"
            content = (r.get("content") or r.get("snippet") or "").strip()
            url = r.get("url") or ""
            lines.append(f"{i}. {title}")
            if content:
                lines.append(f"   {content}")
            if url:
                lines.append(f"   来源: {url}")
            lines.append("")
        return "\n".join(lines).strip()

    async def _execute_web_search(self, query: str) -> str:
        if not query or not query.strip():
            return "错误：搜索关键词为空。"
        if not self._tavily:
            return "错误：未配置 TAVILY_API_KEY，无法执行网络搜索。"

        def _search() -> str:
            try:
                resp = self._tavily.search(query.strip(), max_results=config.TAVILY_MAX_RESULTS)
                return self._format_tavily_response(resp)
            except Exception as e:
                return f"搜索执行失败：{e}"

        return await asyncio.to_thread(_search)

    @staticmethod
    def _assistant_message_to_dict(message: ChatCompletionMessage) -> dict[str, Any]:
        """将 SDK 返回的 assistant message 转为可再次传入 API 的 dict。"""
        d: dict[str, Any] = {
            "role": "assistant",
            "content": message.content or "",
        }
        if message.tool_calls:
            d["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments or "{}",
                    },
                }
                for tc in message.tool_calls
            ]
        return d

    async def _chat_completion_with_tools(self, messages: list[dict[str, Any]], use_tools: bool = True):
        return await self.client.chat.completions.create(
            model=config.MINIMAX_MODEL,
            messages=messages,
            tools=TOOLS if use_tools else None,
            tool_choice="auto" if use_tools else None,
            max_tokens=config.MAX_TOKENS,
            temperature=config.MINIMAX_TEMPERATURE,
        )

    async def _handle_tool_calls(
        self,
        message: ChatCompletionMessage,
        messages: list[dict[str, Any]],
    ) -> bool:
        """处理单轮 tool_calls，将结果追加到 messages。返回是否使用了搜索。"""
        search_used = False
        messages.append(self._assistant_message_to_dict(message))

        for tc in message.tool_calls:
            name = tc.function.name
            raw_args = tc.function.arguments or "{}"
            try:
                args = json.loads(raw_args)
            except json.JSONDecodeError:
                args = {}

            if name == "web_search":
                search_used = True
                query = args.get("query", "")
                tool_output = await self._execute_web_search(str(query))
            else:
                tool_output = f"未知工具: {name}"

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": tool_output,
                }
            )
        return search_used

    async def _run_tool_loop(
        self, messages: list[dict[str, Any]], use_tools: bool = True
    ) -> tuple[str, bool]:
        """
        Function Calling 循环（非流式），直到模型不再请求工具。
        返回 (assistant 文本, 是否曾调用 web_search)。
        """
        search_used = False

        # 如果不需要使用工具，直接调用一次后返回
        if not use_tools:
            response = await self._chat_completion_with_tools(messages, use_tools=False)
            message = response.choices[0].message
            return (message.content or "").strip(), False

        for _ in range(MAX_TOOL_ROUNDS):
            response = await self._chat_completion_with_tools(messages, use_tools=True)
            message = response.choices[0].message

            if not message.tool_calls:
                return (message.content or "").strip(), search_used

            if await self._handle_tool_calls(message, messages):
                search_used = True

        return "抱歉：工具调用次数过多，已中止。请简化问题后重试。", search_used

    async def chat(self, session_id: str, user_message: str) -> dict:
        """
        处理用户对话

        Args:
            session_id: 会话 ID
            user_message: 用户消息

        Returns:
            包含回复内容的字典
        """
        # 检查缓存 - 查找是否有相同术语的历史回答
        term = extract_term(user_message)
        if term:
            cached_reply = self.storage.get_cached_reply(term)
            if cached_reply:
                # 缓存命中，直接返回
                self.storage.add_message(session_id, "user", user_message)
                self.storage.add_message(session_id, "assistant", cached_reply)
                return {
                    "session_id": session_id,
                    "reply": cached_reply,
                    "search_used": False,
                    "cached": True,
                }

        messages = self._build_messages(session_id, user_message)

        try:
            assistant_reply, search_used = await self._run_tool_loop(messages, use_tools=True)
        except Exception as e:
            assistant_reply = f"抱歉，处理您的请求时发生了错误：{str(e)}"
            search_used = False

        self.storage.add_message(session_id, "user", user_message)
        self.storage.add_message(session_id, "assistant", assistant_reply)

        # 更新缓存
        if term and assistant_reply and not assistant_reply.startswith("抱歉"):
            self.storage.cache_reply(term, assistant_reply)

        return {
            "session_id": session_id,
            "reply": assistant_reply,
            "search_used": search_used,
        }

    async def text_to_speech(self, text: str) -> dict:
        """
        将文本转换为语音

        Args:
            text: 要转换的文本（通常是术语英文名）

        Returns:
            包含音频数据的字典或错误信息
        """
        if not text or not text.strip():
            return {"error": "文本不能为空"}

        if not config.MINIMAX_API_KEY:
            return {"error": "未配置 MINIMAX_API_KEY"}

        url = "https://api-bj.minimaxi.com/v1/t2a_v2"

        headers = {
            "Authorization": f"Bearer {config.MINIMAX_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": config.TTS_MODEL,
            "text": text,
            "output_format": "url",
            "audio_setting": {
                "format": "mp3"
            },
            "stream": False
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        return {"error": f"TTS API 错误: {response.status} - {error_text}"}

                    result = await response.json()

                    # 检查 API 返回格式
                    if "data" in result and "audio_file" in result["data"]:
                        # 返回的是音频文件路径
                        return {
                            "audio_url": result["data"]["audio_file"],
                            "model": config.TTS_MODEL
                        }
                    elif "data" in result and "content" in result["data"]:
                        # 返回的是 base64 编码的音频数据
                        audio_data = result["data"]["content"]
                        return {
                            "audio_data": audio_data,
                            "format": config.TTS_OUTPUT_FORMAT,
                            "model": config.TTS_MODEL
                        }
                    else:
                        return {"error": "TTS 返回格式未知", "raw": result}

        except aiohttp.ClientError as e:
            return {"error": f"TTS 请求失败: {str(e)}"}
        except Exception as e:
            return {"error": f"TTS 处理失败: {str(e)}"}


# Global agent instance
agent = TerminologyAgent()
