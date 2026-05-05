import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import type { UserHandler } from "@/handler/user";
import type { CategoryHandler } from "@/handler/category";
import type { ItemHandler } from "@/handler/item";
import type { AuthMiddleware } from "@/middleware/auth";
import { corsMiddleware } from "@/middleware/cors";
import type { MiddlewareHandler } from "hono";
import type { Config } from "@/config";

export function createRouter(
  userHandler: UserHandler,
  categoryHandler: CategoryHandler,
  itemHandler: ItemHandler,
  authMiddleware: AuthMiddleware,
  loggerMiddleware: MiddlewareHandler,
  config: Config,
): Hono {
  const app = new Hono();

  // 全局中间件
  app.use("*", corsMiddleware);
  app.use("*", loggerMiddleware);

  // ===== SPA 静态文件服务 =====
  if (config.spa.enabled) {
    const distPath = config.spa.distPath;
    // 静态资源文件（JS、CSS、图片等）
    app.use("/assets/*", serveStatic({ root: distPath }));
    // 其他静态资源
    app.use("/favicon.ico", serveStatic({ path: `${distPath}/favicon.ico` }));
    app.use("/vite.svg", serveStatic({ path: `${distPath}/vite.svg` }));
  }

  // API 路由组（所有 API 以 /api 开头）
  const api = app.basePath("/api");

  // ===== 用户模块（无需认证） =====
  api.post("/user/register", (c) => userHandler.register(c));
  api.post("/user/login", (c) => userHandler.login(c));

  // ===== 用户模块（需认证） =====
  const user = new Hono();
  user.use("*", (c, next) => authMiddleware.handle(c, next));
  user.post("/info", (c) => userHandler.getInfo(c));
  user.post("/update", (c) => userHandler.update(c));
  user.post("/logout", (c) => userHandler.logout(c));
  user.post("/sessions", (c) => userHandler.getSessions(c));
  user.post("/revoke_session", (c) => userHandler.revokeSession(c));
  user.post("/force_logout", (c) => userHandler.forceLogout(c));
  api.route("/user", user);

  // ===== 分类模块（需认证） =====
  const category = new Hono();
  category.use("*", (c, next) => authMiddleware.handle(c, next));
  category.post("/create", (c) => categoryHandler.create(c));
  category.post("/list", (c) => categoryHandler.list(c));
  category.post("/update", (c) => categoryHandler.update(c));
  category.post("/delete", (c) => categoryHandler.delete(c));
  api.route("/category", category);

  // ===== 物品模块（需认证） =====
  const item = new Hono();
  item.use("*", (c, next) => authMiddleware.handle(c, next));
  item.post("/create", (c) => itemHandler.create(c));
  item.post("/list", (c) => itemHandler.list(c));
  item.post("/detail", (c) => itemHandler.detail(c));
  item.post("/update", (c) => itemHandler.update(c));
  item.post("/delete", (c) => itemHandler.delete(c));
  item.post("/expiring", (c) => itemHandler.getExpiring(c));
  item.post("/stats", (c) => itemHandler.getStats(c));
  item.post("/mark_used", (c) => itemHandler.markUsed(c));
  api.route("/item", item);

  // ===== SPA Fallback 路由 =====
  // 对于非 API 路由，返回 index.html，让前端路由接管
  if (config.spa.enabled) {
    const distPath = config.spa.distPath;
    app.get("*", async (c) => {
      // 如果是 API 路由，跳过（已被 basePath 处理）
      if (c.req.path.startsWith("/api")) {
        return c.notFound();
      }
      // 返回 index.html
      const file = Bun.file(`${distPath}/index.html`);
      if (await file.exists()) {
        return c.html(await file.text());
      }
      return c.notFound();
    });
  }

  return app;
}
