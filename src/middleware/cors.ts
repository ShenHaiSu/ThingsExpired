import type { Context, Next } from "hono";

export async function corsMiddleware(
  c: Context,
  next: Next,
): Promise<Response | void> {
  // 设置 CORS 头
  c.res.headers.set("Access-Control-Allow-Origin", "*");
  c.res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, User-Agent",
  );

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
}
