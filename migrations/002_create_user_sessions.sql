-- ThingsExpired 数据库迁移脚本
-- 创建用户会话表（用于多端登录控制）
-- 注意：所有时间字段均使用 UTC 时间存储，遵循 ISO 8601 标准
-- SQLite 的 CURRENT_TIMESTAMP 默认返回 UTC 时间

CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_jti TEXT NOT NULL UNIQUE,
    device_info TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- UTC 时间
    expires_at DATETIME NOT NULL,                    -- UTC 时间，由应用层确保传入 UTC
    is_revoked INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_jti ON user_sessions(token_jti);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_revoked ON user_sessions(user_id, is_revoked);