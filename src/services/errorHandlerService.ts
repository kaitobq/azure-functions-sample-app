import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { injectable } from "inversify"
import { config } from "../config/env"
import { AppError } from "../errors/appError"
import type { ErrorResponse } from "../errors/types"
import { ErrorType } from "../errors/types"
import type { IErrorHandlerService } from "./interfaces/errorHandlerServiceInterface"

@injectable()
export class ErrorHandlerService implements IErrorHandlerService {
  async handleError(
    error: unknown,
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> {
    // AppErrorの場合は、そのままエラー情報を使用
    if (error instanceof AppError) {
      context.error(
        `[${error.type}] ${error.message}${
          error.details ? ` Details: ${JSON.stringify(error.details)}` : ""
        }`,
      )

      return {
        status: error.statusCode,
        jsonBody: {
          error: {
            type: error.type,
            code: error.code,
            message: error.message,
            details: error.details,
          },
        } as ErrorResponse,
      }
    }

    // その他のエラーの場合は、システムエラーとして扱う
    const systemError =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : "Unknown error")

    context.error(`[${ErrorType.SYSTEM_ERROR}] ${systemError.message}`)
    context.error(systemError.stack || "No stack trace available")

    // 開発環境では詳細なエラー情報を返す
    const isDevelopment = config.appEnv === "development"

    return {
      status: 500,
      jsonBody: {
        error: {
          type: ErrorType.SYSTEM_ERROR,
          code: "SYSTEM_ERROR",
          message: "サーバーエラーが発生しました",
          details: isDevelopment
            ? {
                originalMessage: systemError.message,
                stack: systemError.stack,
              }
            : undefined,
        },
      } as ErrorResponse,
    }
  }
}
