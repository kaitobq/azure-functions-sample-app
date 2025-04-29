import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import { UserService } from "../../services/userService"
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
    try {
      const userId = request.params.id
      const userService = new UserService()
      const user = await userService.getUser(userId)

      if (!user) {
        return {
          status: 404,
          jsonBody: {
            error: "Not Found",
            message: "ユーザーが見つかりません",
          } as ErrorResponse,
        }
      }

      return {
        status: 200,
        jsonBody: { user } as UserResponse,
      }
    } catch (error) {
      context.error(`ユーザー取得エラー: ${error}`)
      return {
        status: 500,
        jsonBody: {
          error: "Internal Server Error",
          message: "サーバーエラーが発生しました",
        } as ErrorResponse,
      }
    }
  },
})
