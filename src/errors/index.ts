import {
  CodeInternalError,
  CodeUserNotFound,
  CodeUnauthorized,
  CodeCategoryNotFound,
  CodeItemNotFound,
} from "@/errors/code";

export class AppError extends Error {
  constructor(
    public code: number,
    message: string,
    public override cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function userNotFound(): AppError {
  return new AppError(CodeUserNotFound, "用户不存在");
}

export function unauthorized(): AppError {
  return new AppError(CodeUnauthorized, "未授权");
}

export function internalError(cause?: unknown): AppError {
  return new AppError(CodeInternalError, "内部错误", cause);
}

export function categoryNotFound(): AppError {
  return new AppError(CodeCategoryNotFound, "分类不存在");
}

export function itemNotFound(): AppError {
  return new AppError(CodeItemNotFound, "物品不存在");
}
