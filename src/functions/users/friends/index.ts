import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import { UserService } from "../../../services/userService"
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
    try {
      const userId = request.params.id
      const page = parseInt(request.query.get("page") || "1")
      const limit = parseInt(request.query.get("limit") || "10")

      const userService = new UserService()
      const friends = await userService.getUserFriends(userId, { page, limit })

      return {
        status: 200,
        jsonBody: friends as FriendsResponse,
      }
    } catch (error) {
      context.error(`友達リスト取得エラー: ${error}`)
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
    try {
      const userId = request.params.id
      const friendId = request.params.friendId

      const userService = new UserService()
      const success = await userService.addFriend(userId, friendId)

      if (!success) {
        return {
          status: 400,
          jsonBody: {
            error: "Bad Request",
            message: "友達の追加に失敗しました",
          } as ErrorResponse,
        }
      }

      return {
        status: 201,
        jsonBody: {
          message: "友達を追加しました",
        },
      }
    } catch (error) {
      context.error(`友達追加エラー: ${error}`)
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
