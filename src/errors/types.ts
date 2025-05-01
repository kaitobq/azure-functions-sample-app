/**
 * アプリケーションのエラー種別を定義する列挙型
 */
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  UNAUTHORIZED_ERROR = "UNAUTHORIZED_ERROR",
  FORBIDDEN_ERROR = "FORBIDDEN_ERROR",
  BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
  SYSTEM_ERROR = "SYSTEM_ERROR",
}

/**
 * エラーレスポンスの型定義
 */
export interface ErrorResponse {
  error: {
    type: string
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
