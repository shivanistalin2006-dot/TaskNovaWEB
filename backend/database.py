import sqlite3

DB_FILE = "tasknova.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    # Enable dict-like row access if needed, but we return tuples for backward compatibility based on existing code
    return conn

def init_pool():
    init_db()

def close_pool():
    pass
