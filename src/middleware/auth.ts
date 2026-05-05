import type { Context, Next } from "hono";
import { failWithCode } from "../utils/response";
import { CodeUnauthorized } from "../errors/code";
import type { ISessionRepository } from "../repository/interfaces";
import jwt from "jsonwebtoken";

interface JWTConfig {
  secret: string;
  expireHours: number;
}

interface JwtPayload {
  userId: number;
  jti: string;
  iat: number;
}

export class AuthMiddleware {
  constructor(
    private jwtConfig: JWTConfig,
    private sessionRepo: ISessionRepository,
  ) {}

  async handle(c: Context, next: Next): Promise<Response | void> {
    // 获取 Authorization header
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return failWithCode(c, CodeUnauthorized, "缺少认证信息");
    }

    // 解析 Bearer token
    const token = authHeader.replace("Bearer ", "");
    if (token === authHeader) {
      return failWithCode(c, CodeUnauthorized, "Token 格式无效");
    }

    try {
      // 验证 token
      const payload = jwt.verify(token, this.jwtConfig.secret) as JwtPayload;

      // 验证会话是否有效
      const session = await this.sessionRepo.findByJTI(payload.jti);
      if (!session || session.isRevoked === 1) {
        return failWithCode(c, CodeUnauthorized, "会话已失效");
      }

      // 将用户信息存入 context
      c.set("userId", payload.userId);
      c.set("sessionId", session.id);

      await next();
    } catch (error) {
      return failWithCode(c, CodeUnauthorized, "Token 无效或已过期");
    }
  }
}
