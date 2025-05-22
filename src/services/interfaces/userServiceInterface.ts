import { FriendsResponse } from "../../functions/users/types";
import { User } from "../../models/entities"; // Friend import removed

export interface IUserService {
  getUser(id: string): Promise<User | null>
  getUserFriends(
    userId: string,
    options?: { page: number; limit: number },
  ): Promise<FriendsResponse>
  addFriend(userId: string, friendId: string): Promise<boolean>
}
