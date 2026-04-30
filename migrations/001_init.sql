-- ThingsExpired 数据库初始化脚本
-- 注意：所有时间字段均使用 UTC 时间存储，遵循 ISO 8601 标准
-- SQLite 的 CURRENT_TIMESTAMP 默认返回 UTC 时间

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- UTC 时间
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- UTC 时间
);

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#000000',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- UTC 时间
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- UTC 时间
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建物品表
-- expired_at 字段必须存储 UTC 时间，前端传入的时间需转换为 UTC 后存储
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit TEXT,
    expired_at DATETIME NOT NULL,                     -- UTC 时间，由应用层确保传入 UTC
    remind_days INTEGER DEFAULT 3,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- UTC 时间
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,     -- UTC 时间
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_expired_at ON items(expired_at);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
