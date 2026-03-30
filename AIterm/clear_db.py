"""
清除 PostgreSQL 数据库中所有表的数据
"""
import os
from dotenv import load_dotenv

load_dotenv()

from psycopg_pool import ConnectionPool

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    print("错误: 未设置 DATABASE_URL")
    exit(1)

pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=2, kwargs={"autocommit": True})

with pool.connection() as conn:
    with conn.cursor() as cur:
        cur.execute("TRUNCATE sessions CASCADE;")
        cur.execute("TRUNCATE term_cache CASCADE;")
        cur.execute("DELETE FROM user_preferences;")
        print("已清空 sessions, messages, term_cache, user_preferences")

pool.close()
print("Done.")
