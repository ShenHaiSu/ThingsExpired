import { describe, expect, mock, test } from "bun:test";
import type { IUserRepository, ISessionRepository } from "../../src/repository/interfaces";
import { UserService } from "../../src/service/user";
import { AppError } from "../../src/errors";
import { CodeUserNotFound, CodeUserExists, CodePasswordWrong } from "../../src/errors/code";

describe("UserService", () => {
  const jwtConfig = { secret: "test-secret", expireHours: 24 };
  const sessionConfig = { maxSessions: 3 };

  test("getInfo - 用户存在时返回用户信息", async () => {
    const mockUserRepo: IUserRepository = {
      findById: mock(() =>
        Promise.resolve({
          id: 1,
          username: "testuser",
          email: "test@example.com",
          password: "hashed_password",
          status: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      ),
    } as IUserRepository;

    const mockSessionRepo = {} as ISessionRepository;

    const service = new UserService(mockUserRepo, mockSessionRepo, jwtConfig, sessionConfig);
    const result = await service.getInfo(1);

    expect(result.user_id).toBe(1);
    expect(result.username).toBe("testuser");
    expect(result.email).toBe("test@example.com");
    expect(result.status).toBe(1);
    expect(mockUserRepo.findById).toHaveBeenCalledWith(1);
  });

  test("getInfo - 用户不存在时抛出异常", async () => {
    const mockUserRepo: IUserRepository = {
      findById: mock(() => Promise.resolve(null)),
    } as IUserRepository;

    const service = new UserService(mockUserRepo, {} as ISessionRepository, jwtConfig, sessionConfig);

    await expect(service.getInfo(999)).rejects.toThrow(AppError);
    await expect(service.getInfo(999)).rejects.toMatchObject({
      code: CodeUserNotFound,
    });
  });

  test("register - 邮箱已存在时抛出异常", async () => {
    const mockUserRepo: IUserRepository = {
      findByEmail: mock(() =>
        Promise.resolve({
          id: 1,
          username: "existing",
          email: "existing@example.com",
          password: "hashed",
          status: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      ),
    } as IUserRepository;

    const service = new UserService(mockUserRepo, {} as ISessionRepository, jwtConfig, sessionConfig);

    await expect(
      service.register({
        username: "newuser",
        email: "existing@example.com",
        password: "123456",
      }),
    ).rejects.toMatchObject({
      code: CodeUserExists,
    });
  });
});
