/**
 * AI Terminology Expert Agent - Frontend Application
 */

// 生产环境（EdgeOne 等）：在 index.html 中先于本脚本设置
//   <script>window.__API_BASE__ = 'https://api.aiterm.xyz';</script>
// 本地不设置时为空，请求仍为同源的 /api/...
const API_BASE = String(window.__API_BASE__ ?? '').replace(/\/$/, '');
function apiUrl(path) {
    const p = path.startsWith('/') ? path : `/${path}`;
    return API_BASE ? `${API_BASE}${p}` : p;
}

// ============== State Management ==============
const state = {
    currentSessionId: null,
    sessions: [],
    isLoading: false,
    currentModel: 'minimax'
};

// ============== DOM Elements ==============
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sessionList: document.getElementById('sessionList'),
    newChatBtn: document.getElementById('newChatBtn'),

    // Main
    menuToggle: document.getElementById('menuToggle'),
    chatTitle: document.getElementById('chatTitle'),
    clearBtn: document.getElementById('clearBtn'),
    modelSelect: document.getElementById('modelSelect'),

    // Messages
    messagesContainer: document.getElementById('messagesContainer'),
    messagesList: document.getElementById('messagesList'),
    welcomeMessage: document.getElementById('welcomeMessage'),

    // Input
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),

    // Loading
    loadingIndicator: document.getElementById('loadingIndicator')
};

// ============== Helper Functions ==============

function getCurrentModel() {
    return elements.modelSelect.value;
}

// ============== API Functions ==============

async function createSession() {
    try {
        const response = await fetch(apiUrl('/api/session/new'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        state.currentSessionId = data.session_id;
        await loadSessions();
        return data.session_id;
    } catch (error) {
        console.error('Create session error:', error);
        return null;
    }
}

async function loadSessions() {
    try {
        const response = await fetch(apiUrl('/api/history'));
        const data = await response.json();
        state.sessions = data.sessions || [];
        renderSessions();
    } catch (error) {
        console.error('Load sessions error:', error);
    }
}

async function loadModelPreference() {
    // No longer used - always default to MiniMax on page load
}

async function switchModel(model) {
    try {
        const response = await fetch(apiUrl('/api/model'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });
        const data = await response.json();
        if (data.success) {
            state.currentModel = model;
            elements.modelSelect.value = model;
        }
    } catch (error) {
        console.error('Switch model error:', error);
    }
}

async function loadSessionHistory(sessionId) {
    try {
        const response = await fetch(apiUrl(`/api/history/${sessionId}`));
        const session = await response.json();
        return session.messages || [];
    } catch (error) {
        console.error('Load session history error:', error);
        return [];
    }
}

async function deleteSession(sessionId) {
    try {
        await fetch(apiUrl(`/api/history/${sessionId}`), { method: 'DELETE' });
        await loadSessions();

        // 如果删除的是当前会话，切换到新会话
        if (state.currentSessionId === sessionId) {
            const newSessionId = await createSession();
            if (newSessionId) {
                state.currentSessionId = newSessionId;
                clearMessages();
            }
        }
    } catch (error) {
        console.error('Delete session error:', error);
    }
}

async function sendMessage(message) {
    try {
        // Use current selected value from UI to avoid race condition with model switch
        const model = getCurrentModel();
        const isDeepSeek = model === 'deepseek';

        // DeepSeek 模式：不传 session_id，不操作数据库
        const payload = {
            message: message,
            model: model
        };
        if (!isDeepSeek && state.currentSessionId) {
            payload.session_id = state.currentSessionId;
        }

        const response = await fetch(apiUrl('/api/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Send message error:', error);
        return { reply: '发送消息失败，请稍后重试。', search_used: false };
    }
}

// ============== UI Rendering ==============

function renderSessions() {
    elements.sessionList.innerHTML = '';

    if (state.sessions.length === 0) {
        elements.sessionList.innerHTML = `
            <div class="empty-sessions" style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
                暂无对话记录
            </div>
        `;
        return;
    }

    state.sessions.forEach(session => {
        const isActive = session.session_id === state.currentSessionId;
        const item = document.createElement('div');
        item.className = `session-item ${isActive ? 'active' : ''}`;
        item.innerHTML = `
            <span class="session-icon">💬</span>
            <span class="session-preview">${escapeHtml(session.preview || '新对话')}</span>
            <button class="delete-session" title="删除">✕</button>
        `;

        // Click to switch session
        item.addEventListener('click', async (e) => {
            if (!e.target.classList.contains('delete-session')) {
                await switchSession(session.session_id);
            }
        });

        // Delete session
        item.querySelector('.delete-session').addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteSession(session.session_id);
        });

        elements.sessionList.appendChild(item);
    });
}

function renderMessages(messages) {
    // Clear existing messages
    elements.messagesList.innerHTML = '';
    elements.welcomeMessage.style.display = 'none';

    // Hide welcome message when there are messages
    if (messages.length > 0) {
        elements.welcomeMessage.style.display = 'none';
    }

    messages.forEach(msg => {
        appendMessage(msg.content, msg.role);
    });

    scrollToBottom();
}

function appendMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = role === 'user' ? '👤' : '🤖';

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="markdown-body">${parseMarkdown(content)}</div>
        </div>
    `;

    elements.messagesList.appendChild(messageDiv);
    scrollToBottom();
}

function clearMessages() {
    elements.messagesList.innerHTML = '';
    elements.welcomeMessage.style.display = 'block';
    elements.chatTitle.textContent = '新对话';
}

function showLoading() {
    state.isLoading = true;
    elements.loadingIndicator.style.display = 'flex';
    elements.sendBtn.disabled = true;
}

function hideLoading() {
    state.isLoading = false;
    elements.loadingIndicator.style.display = 'none';
    elements.sendBtn.disabled = false;
}

// ============== Helpers ==============

// Markdown renderer 配置：链接在新标签页打开
if (typeof marked !== 'undefined') {
    const renderer = new marked.Renderer();
    const originalLink = renderer.link;
    renderer.link = function (href, title, text) {
        const html = originalLink
            ? originalLink.call(this, href, title, text)
            : `<a href="${href}" title="${title || ''}">${text}</a>`;
        // 确保 target 与 rel
        return html.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ');
    };
    marked.use({ renderer, breaks: true, gfm: true });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseMarkdown(text) {
    // 过滤思考过程：移除正文开始前的所有思考内容
    // 思考内容通常包含：用户查询、让我xxx、关于xxx等主观描述

    // 方法1：移除 <thinking>...</thinking> 或<think>...</think>格式的思考内容
    text = text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    text = text.replace(/<THINKING>[\s\S]*?<\/THINKING>/g, '');
    text = text.replace(/<think>[\s\S]*?<\/thinking>/g, '');

    // 方法2：找到 📖 术语： 的位置，之前的全部移除
    const termMatch = text.match(/📖\s*术语：/);
    if (termMatch) {
        text = text.substring(termMatch.index);
    }

    // 方法3：移除「分析」开头的整段思考内容
    text = text.replace(/「分析」[\s\S]*?「」/g, '');
    // 移除剩余的「...」或【...】包裹的思考碎片
    text = text.replace(/[「【][\s\S]*?[」】]/g, '');

    // 使用 marked.js 解析 Markdown（启用 GFM 表格）
    return marked.parse(text, { gfm: true, breaks: true });
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// ============== Event Handlers ==============

async function switchSession(sessionId) {
    state.currentSessionId = sessionId;

    // Update UI
    renderSessions();

    // Load messages
    const messages = await loadSessionHistory(sessionId);

    if (messages.length === 0) {
        clearMessages();
    } else {
        renderMessages(messages);
        elements.welcomeMessage.style.display = 'none';
    }

    // Update title
    const session = state.sessions.find(s => s.session_id === sessionId);
    elements.chatTitle.textContent = session?.preview?.substring(0, 20) || '新对话';

    // Close sidebar on mobile
    elements.sidebar.classList.remove('open');
}

async function handleSendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message || state.isLoading) return;

    // Only create session for MiniMax (DeepSeek mode doesn't use database)
    const model = getCurrentModel();
    const isDeepSeek = model === 'deepseek';

    if (!isDeepSeek && !state.currentSessionId) {
        await createSession();
    }

    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';

    // Show user message
    appendMessage(message, 'user');
    elements.welcomeMessage.style.display = 'none';

    // Show loading
    showLoading();

    // Send message and get response
    const response = await sendMessage(message);

    // Hide loading
    hideLoading();

    // Show assistant response
    if (response.reply) {
        appendMessage(response.reply, 'assistant');
    }

    // Reload sessions to update preview
    await loadSessions();
}

// ============== Event Listeners ==============

// Send button
elements.sendBtn.addEventListener('click', handleSendMessage);

// Input Enter key
elements.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Auto-resize textarea
elements.messageInput.addEventListener('input', () => {
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 150) + 'px';
});

// New chat button
elements.newChatBtn.addEventListener('click', async () => {
    const sessionId = await createSession();
    if (sessionId) {
        clearMessages();
        elements.chatTitle.textContent = '新对话';
    }
});

// Clear button
elements.clearBtn.addEventListener('click', () => {
    if (confirm('确定要清空当前对话吗？')) {
        clearMessages();
    }
});

// Model selector
elements.modelSelect.addEventListener('change', async (e) => {
    const model = e.target.value;
    await switchModel(model);
});

// Mobile menu toggle
elements.menuToggle.addEventListener('click', () => {
    elements.sidebar.classList.toggle('open');
});

// Quick term buttons
document.querySelectorAll('.quick-term-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const term = btn.dataset.term;

        // Only create session for MiniMax (DeepSeek mode doesn't use database)
        const model = getCurrentModel();
        const isDeepSeek = model === 'deepseek';

        if (!isDeepSeek) {
            const sessionId = await createSession();
            state.currentSessionId = sessionId;
        }

        // Send query
        elements.messageInput.value = term;
        await handleSendMessage();
    });
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        !elements.sidebar.contains(e.target) &&
        !elements.menuToggle.contains(e.target)) {
        elements.sidebar.classList.remove('open');
    }
});

// ============== Initialize ==============

async function init() {
    // Always default to MiniMax on page load (ignore saved preference)
    state.currentModel = 'minimax';
    elements.modelSelect.value = 'minimax';

    // Load sessions
    await loadSessions();

    // If there are existing sessions, load the most recent one
    if (state.sessions.length > 0) {
        await switchSession(state.sessions[0].session_id);
    }
}

// Start the app
init();
