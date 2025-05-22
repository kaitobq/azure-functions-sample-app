import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import { container } from "../../../config/container"
import { errorHandlerMiddleware } from "../../../middleware/errorHandlerMiddleware"
import type { IUserService } from "../../../services/interfaces/userServiceInterface"
import type { ErrorResponse, FriendsResponse } from "../types"

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

      const userService = container.get<IUserService>("IUserService")
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

      const userService = container.get<IUserService>("IUserService")
      const success = await userService.addFriend(userId, friendId)

      if (!success) {
        return {
          status: 400,
          jsonBody: {
          error: {
            type: ErrorType.VALIDATION_ERROR,
            code: "ADD_FRIEND_FAILED",
            message: "友達の追加に失敗しました",
          },
          } as ErrorResponse,
        }
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
