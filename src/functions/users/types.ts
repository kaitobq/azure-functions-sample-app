export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Friend {
  id: string
  name: string
  friendshipDate: string
}

export interface FriendsResponse {
  friends: Friend[]
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

export interface ErrorResponse {
  error: string
  message: string
}
