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
    return mockUsers.find((user) => user.id === id) || null
  }

  async getUserFriends(
    userId: string,
    options: { page: number; limit: number } = { page: 1, limit: 10 },
  ): Promise<FriendsResponse> {
    const friends = mockFriends[userId] || []
    const start = (options.page - 1) * options.limit
    const end = start + options.limit

    return {
      friends: friends.slice(start, end),
      pagination: {
        page: options.page,
        limit: options.limit,
        total: friends.length,
      },
    }
  }

  async addFriend(userId: string, friendId: string): Promise<boolean> {
    // モック実装では常に成功を返す
    return true
  }
}
