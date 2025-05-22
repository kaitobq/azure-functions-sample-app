import { User } from "../../../models/entities";

export interface FriendOutput {
  id: string; // User ID of the friend
  name: string;
  friendshipDate: string; // Or Date, keep as string for now to match mock data
}

export interface FriendsResponse {
  friends: FriendOutput[];
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface UserResponse {
  user: User
}

import { ErrorResponse } from "../../../errors/types";
