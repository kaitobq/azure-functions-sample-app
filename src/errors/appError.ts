import { ErrorType } from "./types"

/**
 * アプリケーション固有のエラークラス
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public readonly statusCode: number

  constructor(
    type: ErrorType,
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
    this.type = type
    this.code = code
    this.details = details
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }

  static validation(
    message: string,
    code = "VALIDATION_FAILED",
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError(ErrorType.VALIDATION_ERROR, message, code, 400, details)
  }

  static notFound(
    message: string,
    code = "RESOURCE_NOT_FOUND",
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError(ErrorType.NOT_FOUND_ERROR, message, code, 404, details)
  }

  static unauthorized(
    message: string,
    code = "UNAUTHORIZED",
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError(
      ErrorType.UNAUTHORIZED_ERROR,
      message,
      code,
      401,
      details,
    )
  }

  static forbidden(
    message: string,
    code = "FORBIDDEN",
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError(ErrorType.FORBIDDEN_ERROR, message, code, 403, details)
  }

  static businessLogic(
    message: string,
    code = "BUSINESS_LOGIC_ERROR",
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError(
      ErrorType.BUSINESS_LOGIC_ERROR,
      message,
      code,
      400,
      details,
    )
  }

  static system(
    message: string,
    code = "SYSTEM_ERROR",
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError(ErrorType.SYSTEM_ERROR, message, code, 500, details)
  }
}
