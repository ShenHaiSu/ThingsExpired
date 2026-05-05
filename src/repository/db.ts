import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import type { DatabaseConfig } from "../config";
import * as schema from "../model";

export type DBInstance = BunSQLiteDatabase<typeof schema>;

export function createDB(config: DatabaseConfig): { sqlite: Database; db: DBInstance } {
  const sqlite = new Database(config.path);

  // 启用 WAL 模式提升并发性能
  sqlite.run("PRAGMA journal_mode = WAL;");
  sqlite.run("PRAGMA foreign_keys = ON;");

  const db = drizzle(sqlite, {
    schema,
    logger: config.mode === "debug",
  });

  return { sqlite, db };
}

/**
 * 初始化数据库表结构
 * 使用 Drizzle ORM 的 schema 自动创建表
 */
export async function initDB(db: DBInstance): Promise<void> {
  // 使用 Drizzle 的 push 机制创建表
  const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
  // 注意: 这里我们采用运行时创建表的方式
  // 生产环境建议使用 drizzle-kit migrate

  // 创建表（如果不存在）
  const sqlite = (db as any).session?.client;
  if (sqlite) {
    // 表会通过 drizzle 的 schema 自动创建
    // 这里通过执行一次简单查询来确保表存在
    try {
      // 使用 raw 查询创建表
      sqlite.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          status INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      sqlite.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          color TEXT,
          icon TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      sqlite.run(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit TEXT,
          expired_at TEXT NOT NULL,
          remind_days INTEGER NOT NULL DEFAULT 3,
          status INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      sqlite.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          jti TEXT NOT NULL UNIQUE,
          device_info TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          is_revoked INTEGER NOT NULL DEFAULT 0
        )
      `);

      // 创建索引
      const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)",
        "CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id)",
        "CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)",
        "CREATE INDEX IF NOT EXISTS idx_items_expired_at ON items(expired_at)",
        "CREATE INDEX IF NOT EXISTS idx_items_user_status_expired ON items(user_id, status, expired_at)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(jti)",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)",
      ];

      for (const indexSql of indexes) {
        sqlite.run(indexSql);
      }
    } catch (err) {
      console.error("Failed to initialize database tables:", err);
      throw err;
    }
  }
}
