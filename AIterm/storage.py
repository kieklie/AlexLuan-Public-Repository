"""
AI Terminology Expert Agent - PostgreSQL Storage Management
"""
import uuid
from typing import Optional, Any

import config

from psycopg_pool import ConnectionPool


def _dt_to_iso(dt: Any) -> str:
    """把数据库返回的 datetime 转成前端可用的 ISO 字符串。"""
    if isinstance(dt, str):
        return dt
    try:
        return dt.isoformat()
    except Exception:
        return str(dt)


class PostgresStorage:
    """PostgreSQL 存储管理类。"""

    def __init__(self):
        if not config.DATABASE_URL:
            raise ValueError("DATABASE_URL is required.")

        self.pool = ConnectionPool(
            conninfo=config.DATABASE_URL,
            min_size=config.DB_MIN_POOL_SIZE,
            max_size=config.DB_MAX_POOL_SIZE,
            kwargs={"autocommit": True},
        )
        self._ensure_schema()

    def _ensure_schema(self):
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS sessions (
                        session_id TEXT PRIMARY KEY,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS messages (
                        id BIGSERIAL PRIMARY KEY,
                        session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
                        role TEXT NOT NULL,
                        content TEXT NOT NULL,
                        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    """
                )
                cur.execute(
                    """
                    CREATE INDEX IF NOT EXISTS idx_messages_session_timestamp
                    ON messages(session_id, timestamp);
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS user_preferences (
                        id INTEGER PRIMARY KEY CHECK (id = 1),
                        detail_level TEXT NOT NULL,
                        user_level TEXT NOT NULL,
                        current_model TEXT NOT NULL DEFAULT 'minimax',
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    """
                )
                # 添加缺失的 current_model 列（如果表已存在但没有此列）
                cur.execute(
                    """
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'user_preferences' AND column_name = 'current_model'
                        ) THEN
                            ALTER TABLE user_preferences ADD COLUMN current_model TEXT NOT NULL DEFAULT 'minimax';
                        END IF;
                    END $$;
                    """
                )
                cur.execute(
                    """
                    INSERT INTO user_preferences (id, detail_level, user_level, current_model)
                    VALUES (1, %s, %s, 'minimax')
                    ON CONFLICT (id) DO NOTHING;
                    """,
                    (config.DEFAULT_DETAIL_LEVEL, config.DEFAULT_USER_LEVEL),
                )
                # 术语缓存表
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS term_cache (
                        term TEXT PRIMARY KEY,
                        reply TEXT NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    """)

    # ============== Session Management ==============
    def create_session(self) -> str:
        """创建新对话会话。"""
        session_id = str(uuid.uuid4())
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO sessions(session_id) VALUES (%s) ON CONFLICT DO NOTHING;",
                    (session_id,),
                )
        return session_id

    def ensure_session(self, session_id: Optional[str]) -> str:
        """
        保证 sessions 表中存在对应行后再写入 messages。
        用于：启动时 TRUNCATE 后前端仍带旧 session_id、或预填充脚本运行中会话被清空等情况。
        """
        if not session_id:
            return self.create_session()
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT 1 FROM sessions WHERE session_id=%s;",
                    (session_id,),
                )
                if cur.fetchone():
                    return session_id
                cur.execute(
                    "INSERT INTO sessions(session_id) VALUES (%s) ON CONFLICT DO NOTHING;",
                    (session_id,),
                )
        return session_id

    def get_sessions(self) -> list:
        """获取所有会话列表。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        s.session_id,
                        s.created_at,
                        (
                            SELECT m.content
                            FROM messages m
                            WHERE m.session_id = s.session_id
                            ORDER BY m.timestamp ASC
                            LIMIT 1
                        ) AS first_content
                    FROM sessions s
                    ORDER BY s.created_at DESC;
                    """
                )
                rows = cur.fetchall()

        sessions = []
        for session_id, created_at, first_content in rows:
            preview = (first_content or "新对话")[:50]
            sessions.append(
                {
                    "session_id": session_id,
                    "created_at": _dt_to_iso(created_at),
                    "preview": preview,
                }
            )
        return sessions

    def clear_all_sessions(self):
        """清空所有会话（启动时调用）。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("TRUNCATE sessions CASCADE;")

    def get_session(self, session_id: str) -> Optional[dict]:
        """获取指定会话（含 messages）。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT session_id, created_at FROM sessions WHERE session_id=%s;",
                    (session_id,),
                )
                srow = cur.fetchone()
                if not srow:
                    return None
                cur.execute(
                    """
                    SELECT role, content, timestamp
                    FROM messages
                    WHERE session_id=%s
                    ORDER BY timestamp ASC;
                    """,
                    (session_id,),
                )
                mrows = cur.fetchall()

        created_at = srow[1]
        messages = [
            {
                "role": role,
                "content": content,
                "timestamp": _dt_to_iso(ts),
            }
            for (role, content, ts) in mrows
        ]
        return {
            "session_id": srow[0],
            "created_at": _dt_to_iso(created_at),
            "messages": messages,
        }

    def delete_session(self, session_id: str) -> bool:
        """删除指定会话。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM sessions WHERE session_id=%s;", (session_id,))
                return cur.rowcount > 0

    # ============== Message Management ==============
    def add_message(self, session_id: str, role: str, content: str):
        """添加消息到会话。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO messages(session_id, role, content)
                    VALUES (%s, %s, %s);
                    """,
                    (session_id, role, content),
                )

    def get_history(self, session_id: str) -> list:
        """获取会话历史消息。"""
        session = self.get_session(session_id)
        if session:
            return session.get("messages", [])
        return []

    def get_recent_history(self, session_id: str, limit: int = 6) -> list:
        """获取最近的消息历史（保持时间顺序）。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT role, content, timestamp
                    FROM messages
                    WHERE session_id=%s
                    ORDER BY timestamp DESC
                    LIMIT %s;
                    """,
                    (session_id, limit),
                )
                rows = cur.fetchall()

        rows.reverse()
        return [
            {
                "role": role,
                "content": content,
                "timestamp": _dt_to_iso(ts),
            }
            for (role, content, ts) in rows
        ]

    # ============== User Preferences ==============
    def get_preferences(self) -> dict:
        """获取用户偏好。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT detail_level, user_level, current_model FROM user_preferences WHERE id=1;"
                )
                row = cur.fetchone()

        if not row:
            return {
                "detail_level": config.DEFAULT_DETAIL_LEVEL,
                "user_level": config.DEFAULT_USER_LEVEL,
                "current_model": "minimax",
            }
        detail_level, user_level, current_model = row
        return {
            "detail_level": detail_level,
            "user_level": user_level,
            "current_model": current_model or "minimax",
        }

    def update_preferences(self, preferences: dict):
        """更新用户偏好。"""
        data = self.get_preferences()
        data.update(preferences)
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_preferences (id, detail_level, user_level, current_model)
                    VALUES (1, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        detail_level = EXCLUDED.detail_level,
                        user_level = EXCLUDED.user_level,
                        current_model = EXCLUDED.current_model,
                        updated_at = NOW();
                    """,
                    (data["detail_level"], data["user_level"], data["current_model"]),
                )

    # ============== Term Cache ==============
    def get_cached_reply(self, term: str) -> Optional[str]:
        """获取术语的缓存回答。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT reply FROM term_cache WHERE term=%s;",
                    (term.lower(),),
                )
                row = cur.fetchone()
        if row:
            return row[0]
        return None

    def cache_reply(self, term: str, reply: str):
        """缓存术语的回答。"""
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO term_cache (term, reply)
                    VALUES (%s, %s)
                    ON CONFLICT (term) DO UPDATE SET
                        reply = EXCLUDED.reply,
                        created_at = NOW();
                    """,
                    (term.lower(), reply),
                )


# Global storage instance
storage = PostgresStorage()
