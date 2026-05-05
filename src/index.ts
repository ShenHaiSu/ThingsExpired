import { loadConfig } from "./config";
import { createDB, initDB } from "./repository/db";
import { UserRepository } from "./repository/user";
import { CategoryRepository } from "./repository/category";
import { ItemRepository } from "./repository/item";
import { SessionRepository } from "./repository/session";
import { UserService } from "./service/user";
import { CategoryService } from "./service/category";
import { ItemService } from "./service/item";
import { ItemExpirationService } from "./service/item_expiration";
import { UserHandler } from "./handler/user";
import { CategoryHandler } from "./handler/category";
import { ItemHandler } from "./handler/item";
import { AuthMiddleware } from "./middleware/auth";
import { createRouter } from "./router";
import { createLogger } from "./utils/logger";
import { createLoggerMiddleware } from "./middleware/logger";

async function main() {
  // 1. 加载配置
  const config = loadConfig();

  // 2. 创建日志器
  const logger = createLogger(config.log);

  // 3. 初始化数据库
  logger.info("正在初始化数据库...");
  const { sqlite, db } = createDB(config.database);
  await initDB(db);
  logger.info({ path: config.database.path }, "数据库已初始化");

  // 4. 创建 Repository 实例
  const userRepo = new UserRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const itemRepo = new ItemRepository(db);
  const sessionRepo = new SessionRepository(db);

  // 5. 创建 Service 实例
  const userService = new UserService(
    userRepo,
    sessionRepo,
    config.jwt,
    config.session,
  );
  const categoryService = new CategoryService(categoryRepo, itemRepo);
  const itemService = new ItemService(itemRepo);

  // 6. 创建后台定时任务
  const expirationService = new ItemExpirationService(
    itemRepo,
    config.expiration,
    logger,
  );

  // 7. 创建中间件
  const authMiddleware = new AuthMiddleware(config.jwt, sessionRepo);
  const loggerMiddleware = createLoggerMiddleware(logger);

  // 8. 创建 Handler 实例
  const userHandler = new UserHandler(userService);
  const categoryHandler = new CategoryHandler(categoryService);
  const itemHandler = new ItemHandler(itemService);

  // 9. 创建路由
  const app = createRouter(
    userHandler,
    categoryHandler,
    itemHandler,
    authMiddleware,
    loggerMiddleware,
  );

  // 10. 启动定时任务
  expirationService.start();

  // 11. 启动服务器
  logger.info(
    { host: config.app.host, port: config.app.port },
    "服务器启动中",
  );
  Bun.serve({
    fetch: app.fetch,
    port: config.app.port,
    hostname: config.app.host,
  });

  logger.info(
    { host: config.app.host, port: config.app.port },
    "服务器已启动",
  );

  // 12. 优雅关闭
  process.on("SIGINT", () => {
    logger.info("收到 SIGINT 信号，正在关闭服务...");
    expirationService.stop();
    sqlite.close();
    logger.info("服务已关闭");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("收到 SIGTERM 信号，正在关闭服务...");
    expirationService.stop();
    sqlite.close();
    logger.info("服务已关闭");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("启动失败:", err);
  process.exit(1);
});
