import { z } from "zod";

export const RegisterRequestSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少3个字符")
    .max(50, "用户名最多50个字符"),
  email: z.string().email("邮箱格式不正确"),
  password: z
    .string()
    .min(6, "密码至少6个字符")
    .max(20, "密码最多20个字符"),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "密码不能为空"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const UpdateUserRequestSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少3个字符")
    .max(50, "用户名最多50个字符")
    .optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

export const RevokeSessionRequestSchema = z.object({
  session_id: z.number().min(1, "会话ID必须大于0"),
});

export type RevokeSessionRequest = z.infer<typeof RevokeSessionRequestSchema>;
