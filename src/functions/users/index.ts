import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import { container } from "../../config/container"
import { errorHandlerMiddleware } from "../../middleware/errorHandlerMiddleware"
import type { IUserService } from "../../services/interfaces/userServiceInterface"
import type { ErrorResponse, UserResponse } from "./types"

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: ユーザー情報の取得
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ユーザー情報
 *       404:
 *         description: ユーザーが見つかりません
 */
export const getUser = app.http("getUser", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{id}",
  handler: async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    return errorHandlerMiddleware(request, context, async (req, ctx) => {
      const userId = req.params.id
      const userService = container.get<IUserService>("IUserService")
      const user = await userService.getUser(userId)

      if (!user) {
        return {
          status: 404,
          jsonBody: {
          error: {
            type: ErrorType.NOT_FOUND_ERROR,
            code: "USER_NOT_FOUND",
            message: "ユーザーが見つかりません",
          },
          } as ErrorResponse,
        }
      }

      return {
        status: 200,
        jsonBody: { user } as UserResponse,
      }
    })
  },
})
