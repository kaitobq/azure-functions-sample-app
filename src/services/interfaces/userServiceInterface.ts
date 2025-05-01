import type { FriendsResponse, User } from "../../functions/users/types"

export interface IUserService {
  getUser(id: string): Promise<User | null>
  getUserFriends(
    userId: string,
    options?: { page: number; limit: number },
  ): Promise<FriendsResponse>
  addFriend(userId: string, friendId: string): Promise<boolean>
}
