import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import { AppError } from "../../errors/appError"
import { errorHandlerMiddleware } from "../../middleware/errorHandlerMiddleware"
import { UserService } from "../../services/userService"
import type { UserResponse } from "./types"

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
      const userService = new UserService()
      const user = await userService.getUser(userId)

      if (!user) {
        throw AppError.notFound("ユーザーが見つかりません", "USER_NOT_FOUND", {
          userId,
        })
      }

      return {
        status: 200,
        jsonBody: { user } as UserResponse,
      }
    })
  },
})
