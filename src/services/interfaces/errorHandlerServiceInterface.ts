import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"

export interface IErrorHandlerService {
  handleError(
    error: unknown,
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit>
}
