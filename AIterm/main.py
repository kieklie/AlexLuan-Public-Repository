"""
AI Terminology Expert Agent - FastAPI Main Entry
"""
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import config
import storage
import agent as agent_module


# ============== Data Models ==============

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    model: Optional[str] = "minimax"  # 可选值: minimax, deepseek


class ChatResponse(BaseModel):
    session_id: Optional[str]
    reply: str
    search_used: bool
    timestamp: str


class SessionCreateResponse(BaseModel):
    session_id: str


class ModelSwitchRequest(BaseModel):
    model: str  # minimax 或 deepseek


class ModelStatusResponse(BaseModel):
    current_model: str
    available_models: list[str]


class TTSRequest(BaseModel):
    text: str


# ============== App Setup ==============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时清空所有历史会话
    storage.storage.clear_all_sessions()
    print("All sessions cleared on startup.")

    print(f"AI Terminology Agent starting on {config.HOST}:{config.PORT}")
    print(f"MiniMax Model: {config.MINIMAX_MODEL}")

    # 检查 API Key
    if not config.MINIMAX_API_KEY:
        print("WARNING: MINIMAX_API_KEY not set. Please set it in .env file.")
    if not config.TAVILY_API_KEY:
        print("WARNING: TAVILY_API_KEY not set. Web search tool will be unavailable.")

    yield

    # 关闭时
    print("AI Terminology Agent shutting down")


app = FastAPI(
    title="AI Terminology Expert Agent",
    description="专业的 AI 术语解读智能体",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(config.STATIC_DIR)), name="static")


# ============== DeepSeek Direct API ==============

from openai import OpenAI
from datetime import datetime

# DeepSeek 客户端
deepseek_client = OpenAI(
    api_key=config.DEEPSEEK_API_KEY,
    base_url=config.DEEPSEEK_BASE_URL,
)


async def deepseek_chat(message: str) -> dict:
    """
    DeepSeek 直连模式：不经过 agent 流程，不操作数据库
    """
    try:
        response = deepseek_client.chat.completions.create(
            model=config.DEEPSEEK_MODEL,
            messages=[{"role": "user", "content": message}],
            temperature=config.DEEPSEEK_TEMPERATURE,
            max_tokens=config.MAX_TOKENS,
        )
        reply = response.choices[0].message.content

        # DeepSeek 模式：不保存任何数据到数据库
        return {
            "session_id": None,  # 无 session_id，不关联数据库
            "reply": reply,
            "search_used": False,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DeepSeek API 错误: {str(e)}")


# ============== API Routes ==============

@app.get("/")
async def root():
    """返回前端页面"""
    return FileResponse(config.STATIC_DIR / "index.html")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """发送消息并获取回复"""
    # 根据选择的模型处理
    if request.model == "deepseek":
        # DeepSeek 直连模式：不创建 session，不操作数据库
        return await deepseek_chat(request.message)
    else:
        # MiniMax Agent 模式：创建或使用 session
        session_id = request.session_id
        if not session_id:
            session_id = storage.storage.create_session()
        result = await agent_module.agent.chat(session_id, request.message)
        result["timestamp"] = datetime.now().isoformat()
        return result




@app.get("/api/history")
async def get_history():
    """获取所有对话 session 列表"""
    sessions = storage.storage.get_sessions()
    return {"sessions": sessions}


@app.get("/api/history/{session_id}")
async def get_session_history(session_id: str):
    """获取指定 session 的完整对话"""
    session = storage.storage.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.delete("/api/history/{session_id}")
async def delete_session(session_id: str):
    """删除指定 session"""
    success = storage.storage.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True}


@app.post("/api/session/new", response_model=SessionCreateResponse)
async def create_session():
    """创建新对话 session"""
    session_id = storage.storage.create_session()
    return {"session_id": session_id}


@app.get("/api/preferences")
async def get_preferences():
    """获取用户偏好"""
    return storage.storage.get_preferences()


@app.post("/api/preferences")
async def update_preferences(preferences: dict):
    """更新用户偏好"""
    storage.storage.update_preferences(preferences)
    return {"success": True}


@app.get("/api/model", response_model=ModelStatusResponse)
async def get_model():
    """获取当前模型"""
    prefs = storage.storage.get_preferences()
    current = prefs.get("current_model", "minimax")
    return {
        "current_model": current,
        "available_models": config.AVAILABLE_MODELS,
    }


@app.post("/api/model")
async def switch_model(request: ModelSwitchRequest):
    """切换模型"""
    if request.model not in config.AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail=f"不支持的模型: {request.model}")
    storage.storage.update_preferences({"current_model": request.model})
    return {"success": True, "current_model": request.model}


@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """将文本转换为语音"""
    result = await agent_module.agent.text_to_speech(request.text)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


# ============== Main Entry ==============

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=False
    )
