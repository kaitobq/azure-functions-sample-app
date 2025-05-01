import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { container } from "../config/container"
import type { IErrorHandlerService } from "../services/interfaces/errorHandlerServiceInterface"

/**
 * エラーハンドリングミドルウェア
 *
 * @param request - HTTPリクエスト
 * @param context - 実行コンテキスト
 * @param handler - 処理ハンドラー
 * @returns HTTPレスポンス
 */
export function errorHandlerMiddleware(
  request: HttpRequest,
  context: InvocationContext,
  handler: (
    request: HttpRequest,
    context: InvocationContext,
  ) => Promise<HttpResponseInit>,
): Promise<HttpResponseInit> {
  return handler(request, context).catch((error: unknown) => {
    const errorHandlerService = container.get<IErrorHandlerService>(
      "IErrorHandlerService",
    )
    return errorHandlerService.handleError(error, request, context)
  })
}
