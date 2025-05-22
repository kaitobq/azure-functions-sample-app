import { User, Friendship } from '../entities';

export interface PaginatedFriendsResult {
  friends: User[]; // Array of User objects representing the friends
  totalCount: number;
}

export interface IFriendshipRepository {
  /**
   * Finds friends for a given user with pagination.
   * This method will retrieve Friendship records and then the associated friend User details.
   * @param userId The ID of the user whose friends are to be fetched.
   * @param page The page number for pagination.
   * @param limit The number of friends per page.
   * @returns A promise that resolves to a PaginatedFriendsResult.
   */
  findFriendsByUserId(userId: string, page: number, limit: number): Promise<PaginatedFriendsResult>;

  /**
   * Checks if a friendship already exists between two users.
   * @param userId The ID of the first user.
   * @param friendUserId The ID of the second user.
   * @returns A promise that resolves to true if the friendship exists, false otherwise.
   */
  exists(userId: string, friendUserId: string): Promise<boolean>;

  /**
   * Creates a new friendship link between two users.
   * @param userId The ID of the user initiating the friendship.
   * @param friendUserId The ID of the user being added as a friend.
   * @returns A promise that resolves to the created Friendship object.
   */
  create(userId: string, friendUserId: string): Promise<Friendship>;
}
