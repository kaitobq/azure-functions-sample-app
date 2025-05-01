import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import { AppError } from "../../../errors/appError"
import { errorHandlerMiddleware } from "../../../middleware/errorHandlerMiddleware"
import { UserService } from "../../../services/userService"
import type { FriendsResponse } from "../types"

/**
 * @swagger
 * /api/user/{id}/friends:
 *   get:
 *     summary: 友達リストの取得
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 */
export const getFriends = app.http("getUserFriends", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{id}/friends",
  handler: async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    return errorHandlerMiddleware(request, context, async (req, ctx) => {
      const userId = req.params.id
      const page = parseInt(req.query.get("page") || "1")
      const limit = parseInt(req.query.get("limit") || "10")

      const userService = new UserService()
      const friends = await userService.getUserFriends(userId, { page, limit })

      return {
        status: 200,
        jsonBody: friends as FriendsResponse,
      }
    })
  },
})

/**
 * @swagger
 * /api/user/{id}/friends/{friendId}:
 *   post:
 *     summary: 友達の追加
 */
export const addFriend = app.http("addUserFriend", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{id}/friends/{friendId}",
  handler: async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    return errorHandlerMiddleware(request, context, async (req, ctx) => {
      const userId = req.params.id
      const friendId = req.params.friendId

      const userService = new UserService()
      const success = await userService.addFriend(userId, friendId)

      if (!success) {
        throw AppError.businessLogic(
          "友達の追加に失敗しました",
          "FRIEND_ADD_FAILED",
          {
            userId,
            friendId,
          },
        )
      }

      return {
        status: 201,
        jsonBody: {
          message: "友達を追加しました",
        },
      }
    })
  },
})
