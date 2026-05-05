import { mkdir } from "fs/promises";
import { existsSync, createWriteStream, unlinkSync, readdirSync } from "fs";
import type { LogConfig } from "@/config";
import path from "path";

/**
 * 日志文件写入器
 * 按日期分文件，逐行 append 纯文本
 */
class DailyFileWriter {
  private currentDate: string = "";
  private stream: ReturnType<typeof createWriteStream> | null = null;
  private readonly logPath: string;
  private readonly maxFiles: number;

  constructor(logPath: string, maxFiles: number) {
    this.logPath = logPath;
    this.maxFiles = maxFiles;
  }

  /**
   * 确保日志目录存在
   */
  async ensureDir(): Promise<void> {
    if (!existsSync(this.logPath)) {
      await mkdir(this.logPath, { recursive: true });
    }
  }

  /**
   * 获取当前日期字符串
   */
  private getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取日志文件路径
   */
  private getLogFilePath(): string {
    return path.join(this.logPath, `${this.currentDate}.log`);
  }

  /**
   * 清理过期日志文件
   */
  private cleanOldLogs(): void {
    try {
      const files = readdirSync(this.logPath);
      const logFiles = files
        .filter((f: string) => /^\d{4}-\d{2}-\d{2}\.log$/.test(f))
        .sort()
        .reverse();

      if (logFiles.length > this.maxFiles) {
        const filesToDelete = logFiles.slice(this.maxFiles);
        for (const file of filesToDelete) {
          try {
            unlinkSync(path.join(this.logPath, file));
          } catch {
            // 忽略删除失败
          }
        }
      }
    } catch {
      // 忽略清理失败
    }
  }

  /**
   * 写入日志行
   * @param text 日志文本
   */
  write(text: string): void {
    const today = this.getDateString();

    // 日期变化或流未打开时，切换文件
    if (today !== this.currentDate || !this.stream) {
      this.close();
      this.currentDate = today;
      this.stream = createWriteStream(this.getLogFilePath(), {
        flags: "a",
        encoding: "utf-8",
      });
      this.cleanOldLogs();
    }

    if (this.stream) {
      this.stream.write(text + "\n");
    }
  }

  /**
   * 刷新并关闭写入流
   */
  close(): void {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
  }
}

/**
 * 创建格式化日志文本
 * @param level 日志级别
 * @param msg 消息内容
 * @param meta 元数据
 * @returns 格式化后的日志行
 */
function formatLogLine(level: string, msg: string, meta?: Record<string, unknown>): string {
  // 时间戳: UTC ISO 8601 格式
  const timestamp = new Date().toISOString();

  // 基本格式: 时间戳 [级别] 消息
  let line = `${timestamp} [${level.toUpperCase()}] ${msg}`;

  // 如果有额外元数据，追加 JSON 格式
  if (meta && Object.keys(meta).length > 0) {
    line += ` ${JSON.stringify(meta)}`;
  }

  return line;
}

/**
 * 简单日志写入器接口
 */
export interface SimpleLogger {
  debug(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void;
  info(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void;
  warn(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void;
  error(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void;
  fatal(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): SimpleLogger;
  close(): void;
}

/**
 * 简单日志写入器实现
 */
class SimpleLoggerImpl implements SimpleLogger {
  private fileWriter: DailyFileWriter;
  private level: string;
  private useColor: boolean;

  constructor(logPath: string, maxFiles: number, level: string, useColor: boolean) {
    this.fileWriter = new DailyFileWriter(logPath, maxFiles);
    this.level = level;
    this.useColor = useColor;
  }

  async ensureDir(): Promise<void> {
    await this.fileWriter.ensureDir();
  }

  private shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warn", "error", "fatal"];
    const currentLevelIdx = levels.indexOf(this.level);
    const targetLevelIdx = levels.indexOf(level);
    return targetLevelIdx >= currentLevelIdx;
  }

  /**
   * 解析日志参数
   * 支持两种调用方式:
   * - logger.info("message", { key: "value" })
   * - logger.info({ key: "value" }, "message")
   */
  private parseArgs(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): { msg: string; meta?: Record<string, unknown> } {
    if (typeof msgOrMeta === "string") {
      // logger.info("message", { key: "value" })
      return {
        msg: msgOrMeta,
        meta: typeof metaOrMsg === "object" ? metaOrMsg : undefined,
      };
    } else {
      // logger.info({ key: "value" }, "message")
      return {
        msg: typeof metaOrMsg === "string" ? metaOrMsg : "",
        meta: msgOrMeta,
      };
    }
  }

  private formatConsole(level: string, msg: string): string {
    // 根据日志级别添加颜色
    const colorMap: Record<string, string> = {
      debug: "\x1b[36m", // 青色
      info: "\x1b[32m",  // 绿色
      warn: "\x1b[33m",  // 黄色
      error: "\x1b[31m", // 红色
      fatal: "\x1b[35m", // 紫色
    };
    const reset = "\x1b[0m";
    const color = this.useColor ? (colorMap[level] || "") : "";
    return `${color}${formatLogLine(level, msg)}${reset}`;
  }

  private log(level: string, msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const { msg, meta } = this.parseArgs(msgOrMeta, metaOrMsg);
    const line = formatLogLine(level, msg, meta);

    // 写入文件
    this.fileWriter.write(line);

    // 输出到控制台
    console.log(this.formatConsole(level, msg));
  }

  debug(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void {
    this.log("debug", msgOrMeta, metaOrMsg);
  }

  info(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void {
    this.log("info", msgOrMeta, metaOrMsg);
  }

  warn(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void {
    this.log("warn", msgOrMeta, metaOrMsg);
  }

  error(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void {
    this.log("error", msgOrMeta, metaOrMsg);
  }

  fatal(msgOrMeta: string | Record<string, unknown>, metaOrMsg?: string | Record<string, unknown>): void {
    this.log("fatal", msgOrMeta, metaOrMsg);
  }

  child(bindings: Record<string, unknown>): SimpleLogger {
    // 返回新的实例，保持简单
    return this;
  }

  close(): void {
    this.fileWriter.close();
  }
}

/**
 * 创建日志器
 * @param config 日志配置
 * @returns 简单日志器实例
 */
export function createLogger(config: LogConfig): SimpleLogger {
  const logger = new SimpleLoggerImpl(config.path, config.maxFiles, config.level, config.level === "debug");

  // 确保目录存在
  logger.ensureDir().catch((err) => {
    console.error("创建日志目录失败:", err);
  });

  // 在进程退出时关闭写入流
  process.on("beforeExit", () => {
    logger.close();
  });

  return logger;
}

/**
 * 创建日志器（简化版，用于无配置场景）
 * @param mode 运行环境模式
 * @returns 简单日志器实例
 */
export function createSimpleLogger(mode: "debug" | "release"): SimpleLogger {
  return createLogger({
    path: "./logs",
    level: mode === "debug" ? "debug" : "info",
    maxFiles: 7,
  });
}

// 导出 SimpleLogger 接口和类型别名
export { SimpleLoggerImpl };
export type { SimpleLogger as PinoLogger };
