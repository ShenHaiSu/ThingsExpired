import type { Context } from "hono";
import { CodeSuccess, CodeInternalError } from "../errors/code";
import { AppError } from "../errors";

interface ResponseBody {
  code: number;
  message: string;
  data: unknown;
}

export function success(c: Context, data: unknown): Response {
  return c.json({
    code: CodeSuccess,
    message: "success",
    data,
  } satisfies ResponseBody);
}

export function failWithCode(
  c: Context,
  code: number,
  message: string,
): Response {
  return c.json({
    code,
    message,
    data: null,
  } satisfies ResponseBody);
}

export function fail(c: Context, error: unknown): Response {
  if (error instanceof AppError) {
    return c.json({
      code: error.code,
      message: error.message,
      data: null,
    } satisfies ResponseBody);
  }

  // 未知错误
  console.error("Unhandled error:", error);
  return c.json({
    code: CodeInternalError,
    message: "内部错误",
    data: null,
  } satisfies ResponseBody);
}
