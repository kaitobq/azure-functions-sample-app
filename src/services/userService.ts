import { AppError } from "../errors/appError"
import type { Friend, FriendsResponse, User } from "../functions/users/types"

// モックデータ
const mockUsers: User[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@example.com",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "鈴木花子",
    email: "suzuki@example.com",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
]

const mockFriends: Record<string, Friend[]> = {
  "1": [
    {
      id: "2",
      name: "鈴木花子",
      friendshipDate: "2024-01-15T00:00:00Z",
    },
  ],
  "2": [
    {
      id: "1",
      name: "山田太郎",
      friendshipDate: "2024-01-15T00:00:00Z",
    },
  ],
}

export class UserService {
  async getUser(id: string): Promise<User | null> {
    const user = mockUsers.find((u) => u.id === id)
    return user || null
  }

  async getUserFriends(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<FriendsResponse> {
    const user = await this.getUser(userId)
    if (!user) {
      throw AppError.notFound("ユーザーが見つかりません", "USER_NOT_FOUND", {
        userId,
      })
    }

    const friends = mockFriends[userId] || []
    const { page, limit } = options
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedFriends = friends.slice(start, end)

    return {
      friends: paginatedFriends,
      pagination: {
        total: friends.length,
        page,
        limit,
        hasMore: end < friends.length,
      },
    }
  }

  async addFriend(userId: string, friendId: string): Promise<boolean> {
    const user = await this.getUser(userId)
    if (!user) {
      throw AppError.notFound("ユーザーが見つかりません", "USER_NOT_FOUND", {
        userId,
      })
    }

    const friend = await this.getUser(friendId)
    if (!friend) {
      throw AppError.notFound(
        "追加するユーザーが見つかりません",
        "FRIEND_NOT_FOUND",
        { friendId },
      )
    }

    const userFriends = mockFriends[userId] || []
    if (userFriends.some((f) => f.id === friendId)) {
      throw AppError.businessLogic(
        "すでに友達として登録されています",
        "FRIEND_ALREADY_EXISTS",
        { userId, friendId },
      )
    }

    // 実際のアプリケーションではここでDBに保存する処理を行う
    return true
  }
}
