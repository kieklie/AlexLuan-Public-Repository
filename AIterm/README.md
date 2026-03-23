# AI 术语专家 | Terminology Expert

一个基于 AI 的专业术语解释智能体，帮助用户理解人工智能领域的专业术语。

🌐 **在线体验**：https://aiterm.alexluan.xyz

---

## 功能特点

- 📖 **术语定义解读** - 深入浅出地解释 AI 专业术语
- 📄 **论文来源追溯** - 列出相关经典论文
- 🔤 **发音指导** - 提供国际音标和中文近似发音
- 🔗 **相关概念推荐** - 展示相关联的概念和术语
- 💬 **双语支持** - 中英文术语都能理解
- 🎯 **模型切换** - 支持 MiniMax 和 DeepSeek 两种 AI 模型

---

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (HTML/JS/CSS)                    │
│              部署于腾讯云 EdgeOne (aiterm.alexluan.xyz)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI 后端服务                          │
│         部署于阿里云 ECS (api.alexluan.xyz)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  /api/chat  │  │ /api/history  │  │  /api/model  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐
│ TerminologyAgent│  │DeepSeek API│  │  PostgreSQL     │
│   (MiniMax)     │  │ (直连模式)  │  │  (会话存储)     │
└─────────────────┘  └─────────────┘  └─────────────────┘
```

---

## 技术栈

| 组件 | 技术 |
|------|------|
| Web 框架 | FastAPI |
| 数据库 | PostgreSQL |
| AI 模型 (Agent) | MiniMax API (Function Calling) |
| AI 模型 (快速) | DeepSeek API (直连) |
| 网络搜索 | Tavily API |
| 前端 | 原生 HTML/JS/CSS |
| 静态托管 | 腾讯云 EdgeOne |
| 服务器 | 阿里云 ECS |

---

## 快速开始

### 前置要求

- Python 3.10+
- PostgreSQL 数据库
- MiniMax API Key
- DeepSeek API Key
- Tavily API Key (可选，用于网络搜索)

### 本地运行

1. 克隆仓库
```bash
git clone https://github.com/kieklie/AlexLuan-Public-Repository.git
cd AlexLuan-Public-Repository/AIterm
```

2. 安装依赖
```bash
pip install -r requirements.txt
pip install psycopg[binary]
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 填入你的 API Keys 和数据库连接信息
```

4. 运行
```bash
python main.py
```

5. 打开浏览器
```
http://localhost:8000
```

---

## 部署说明

本项目采用**前后端分离**架构：

- **前端**：部署在腾讯云 EdgeOne
- **后端**：部署在阿里云 ECS

详细部署步骤请参考 [AITERM_EDGEONE_ALIYUN_DEPLOYMENT.md](./AITERM_EDGEONE_ALIYUN_DEPLOYMENT.md)

---

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/chat` | POST | 发送消息获取 AI 回复 |
| `/api/history` | GET | 获取所有会话列表 |
| `/api/history/{session_id}` | GET | 获取指定会话的完整对话 |
| `/api/session/new` | POST | 创建新会话 |
| `/api/model` | GET | 获取当前模型状态 |
| `/api/model` | POST | 切换 AI 模型 |
| `/api/tts` | POST | 文本转语音 |

---

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `MINIMAX_API_KEY` | MiniMax API 密钥 | ✅ |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ |
| `TAVILY_API_KEY` | Tavily 搜索 API 密钥 | 可选 |
| `DATABASE_URL` | PostgreSQL 数据库连接串 | ✅ |
| `HOST` | 服务器地址 | ✅ |
| `PORT` | 服务器端口 | ✅ |

---

## 项目结构

```
AIterm/
├── main.py              # FastAPI 主入口
├── agent.py             # TerminologyAgent 类
├── storage.py           # PostgreSQL 数据库操作
├── prompts.py           # 系统提示词模板
├── config.py            # 配置管理
├── prepopulate_terms.py # 术语预填充脚本
├── requirements.txt     # 依赖列表
└── static/              # 前端静态文件
    ├── index.html       # 主页面
    ├── app.js           # 前端逻辑
    └── style.css        # 样式文件
```

---

## 双模型说明

### MiniMax (Agent 模式)

- 支持会话历史
- 支持 Function Calling (网络搜索)
- 有缓存机制
- 数据存储到 PostgreSQL

### DeepSeek (直连模式)

- 无会话概念
- 无工具调用
- 不存储数据
- 响应更快

---

## 相关文档

- [部署指南](./AITERM_EDGEONE_ALIYUN_DEPLOYMENT.md) - 详细的云端部署步骤
- [项目文档](./PROJECT_DOCUMENTATION.md) - 代码结构和技术细节

---

## 许可证

MIT License

---

*最后更新：2026-03-24*
