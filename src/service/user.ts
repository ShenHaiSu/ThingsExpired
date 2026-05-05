import type { IUserRepository, ISessionRepository } from "@/repository/interfaces";
import type { IUserService } from "@/service/interfaces";
import type { UserVO } from "@/model/vo/user";
import type {
  RegisterRequest,
  LoginRequest,
  UpdateUserRequest,
} from "@/model/dto/user";
import { toUserVO } from "@/model/vo/user";
import { AppError } from "@/errors";
import {
  CodeUserNotFound,
  CodeUserExists,
  CodePasswordWrong,
  CodeForbidden,
  CodeDatabaseError,
} from "@/errors/code";
import { nowUTC, formatTime } from "@/utils/time";
import jwt from "jsonwebtoken";

interface JWTConfig {
  secret: string;
  expireHours: number;
}

interface SessionConfig {
  maxSessions: number;
}

export class UserService implements IUserService {
  constructor(
    private userRepo: IUserRepository,
    private sessionRepo: ISessionRepository,
    private jwtConfig: JWTConfig,
    private sessionConfig: SessionConfig,
  ) {}

  async register(
    req: RegisterRequest,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<{
    user_id: number;
    username: string;
    email: string;
    status: number;
    created_at: string;
  }> {
    // 检查邮箱是否已存在
    const existingEmail = await this.userRepo.findByEmail(req.email);
    if (existingEmail) {
      throw new AppError(CodeUserExists, "邮箱已被注册");
    }

    // 检查用户名是否已存在
    const existingUsername = await this.userRepo.findByUsername(req.username);
    if (existingUsername) {
      throw new AppError(CodeUserExists, "用户名已被注册");
    }

    // 加密密码
    const hashedPassword = await Bun.password.hash(req.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const now = nowUTC();
    const user = await this.userRepo.create({
      username: req.username,
      email: req.email,
      password: hashedPassword,
      status: 1,
      createdAt: now,
      updatedAt: now,
    });

    return {
      user_id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      created_at: user.createdAt,
    };
  }

  async login(
    req: LoginRequest,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<{
    user_id: number;
    token: string;
    expired: string;
  }> {
    // 查找用户
    const user = await this.userRepo.findByEmail(req.email);
    if (!user) {
      throw new AppError(CodeUserNotFound, "用户不存在");
    }

    // 检查账户状态
    if (user.status !== 1) {
      throw new AppError(CodeForbidden, "账户已禁用");
    }

    // 验证密码
    const isMatch = await Bun.password.verify(req.password, user.password);
    if (!isMatch) {
      throw new AppError(CodePasswordWrong, "密码错误");
    }

    // 检查会话数量限制
    const activeSessions = await this.sessionRepo.countActiveByUserId(user.id);
    if (activeSessions >= this.sessionConfig.maxSessions) {
      // 撤销最早的会话
      const sessions = await this.sessionRepo.listByUserId(user.id);
      const oldestActive = sessions
        .filter((s) => !s.isRevoked)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )[0];
      if (oldestActive) {
        await this.sessionRepo.revoke(oldestActive.id);
      }
    }

    // 生成 JWT
    const jti = crypto.randomUUID();
    const now = new Date();
    const expireDate = new Date(
      now.getTime() + this.jwtConfig.expireHours * 60 * 60 * 1000,
    );

    const token = jwt.sign(
      {
        userId: user.id,
        jti,
        iat: Math.floor(now.getTime() / 1000),
      },
      this.jwtConfig.secret,
      { expiresIn: `${this.jwtConfig.expireHours}h` },
    );

    // 创建会话记录
    await this.sessionRepo.create({
      userId: user.id,
      jti,
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || null,
      createdAt: nowUTC(),
      expiresAt: formatTime(expireDate),
      isRevoked: 0,
    });

    return {
      user_id: user.id,
      token,
      expired: formatTime(expireDate),
    };
  }

  async getInfo(userId: number): Promise<UserVO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(CodeUserNotFound, "用户不存在");
    }
    if (user.status !== 1) {
      throw new AppError(CodeForbidden, "账户已禁用");
    }
    return toUserVO(user);
  }

  async update(userId: number, req: UpdateUserRequest): Promise<UserVO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(CodeUserNotFound, "用户不存在");
    }

    const updateData: Record<string, string> = {};
    if (req.username) {
      // 检查用户名是否已被使用
      const existing = await this.userRepo.findByUsername(req.username);
      if (existing && existing.id !== userId) {
        throw new AppError(CodeUserExists, "用户名已被使用");
      }
      updateData.username = req.username;
    }

    updateData.updatedAt = nowUTC();

    const updated = await this.userRepo.update(userId, updateData);
    if (!updated) {
      throw new AppError(CodeDatabaseError, "更新用户信息失败");
    }

    return toUserVO(updated);
  }

  async logout(userId: number, sessionId: number): Promise<void> {
    // 验证会话属于该用户
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new AppError(CodeForbidden, "无权操作此会话");
    }

    await this.sessionRepo.revoke(sessionId);
  }

  async getSessions(userId: number): Promise<{
    sessions: Array<{
      session_id: number;
      user_id: number;
      device_info: string | null;
      ip_address: string | null;
      created_at: string;
      expires_at: string;
      is_revoked: boolean;
    }>;
    total: number;
  }> {
    const sessionList = await this.sessionRepo.listByUserId(userId);

    const sessions = sessionList.map((s) => ({
      session_id: s.id,
      user_id: s.userId,
      device_info: s.deviceInfo,
      ip_address: s.ipAddress,
      created_at: s.createdAt,
      expires_at: s.expiresAt,
      is_revoked: s.isRevoked === 1,
    }));

    return {
      sessions,
      total: sessions.length,
    };
  }

  async revokeSession(userId: number, sessionId: number): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new AppError(CodeForbidden, "会话不存在");
    }
    if (session.userId !== userId) {
      throw new AppError(CodeForbidden, "无权操作此会话");
    }

    await this.sessionRepo.revoke(sessionId);
  }

  async forceLogout(userId: number): Promise<void> {
    await this.sessionRepo.revokeAllByUserId(userId);
  }
}
