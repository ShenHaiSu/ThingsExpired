import type { Context } from "hono";
import type { IUserService } from "@/service/interfaces";
import { success, failWithCode, fail } from "@/utils/response";
import { CodeParamInvalid } from "@/errors/code";
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  UpdateUserRequestSchema,
  RevokeSessionRequestSchema,
} from "@/model/dto/user";

export class UserHandler {
  constructor(private userService: IUserService) {}

  async register(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const result = RegisterRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const deviceInfo = c.req.header("User-Agent");
      const ipAddress = c.req.header("X-Forwarded-For") || c.req.header("x-real-ip");

      const data = await this.userService.register(
        result.data,
        deviceInfo,
        ipAddress,
      );

      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async login(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const result = LoginRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const deviceInfo = c.req.header("User-Agent");
      const ipAddress = c.req.header("X-Forwarded-For") || c.req.header("x-real-ip");

      const data = await this.userService.login(
        result.data,
        deviceInfo,
        ipAddress,
      );

      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async getInfo(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const data = await this.userService.getInfo(userId);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async update(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = UpdateUserRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.userService.update(userId, result.data);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async logout(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const sessionId = c.get("sessionId") as number;
      await this.userService.logout(userId, sessionId);
      return success(c, null);
    } catch (error) {
      return fail(c, error);
    }
  }

  async getSessions(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const data = await this.userService.getSessions(userId);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async revokeSession(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = RevokeSessionRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      await this.userService.revokeSession(userId, result.data.session_id);
      return success(c, null);
    } catch (error) {
      return fail(c, error);
    }
  }

  async forceLogout(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      await this.userService.forceLogout(userId);
      return success(c, null);
    } catch (error) {
      return fail(c, error);
    }
  }
}
