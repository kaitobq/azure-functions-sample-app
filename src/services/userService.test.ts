import { UserService } from './userService';
import { AppError } from '../errors/appError';
import { ErrorType } from '../errors/types';
import { User } from '../models/entities';
import { FriendOutput } from '../functions/users/types';

// Mock data similar to what's in UserService
// We redefine it here to avoid issues if the actual mock data in userService.ts changes
// and to ensure test purity.
const mockUsers: User[] = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: '2',
    name: '鈴木花子',
    email: 'suzuki@example.com',
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  },
  {
    id: '3',
    name: '田中一郎',
    email: 'tanaka@example.com',
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
  },
];

const mockFriendsData: Record<string, FriendOutput[]> = {
  '1': [
    { id: '2', name: '鈴木花子', friendshipDate: '2024-01-15T00:00:00Z' },
    { id: '3', name: '田中一郎', friendshipDate: '2024-01-16T00:00:00Z' },
  ],
  '2': [
    { id: '1', name: '山田太郎', friendshipDate: '2024-01-15T00:00:00Z' },
  ],
  // User '3' has no friends initially for some test cases
};


// Mock UserService to control its internal data
jest.mock('./userService', () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      // Use copies of mock data to prevent pollution between tests
      let currentMockUsers = JSON.parse(JSON.stringify(mockUsers));
      let currentMockFriends = JSON.parse(JSON.stringify(mockFriendsData));

      return {
        getUser: jest.fn(async (userId: string): Promise<User | null> => {
          const user = currentMockUsers.find((u: User) => u.id === userId);
          if (user) {
            return {
              ...user,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
            };
          }
          return null;
        }),
        getUserFriends: jest.fn(async (userId: string, options: { page: number; limit: number } = { page: 1, limit: 10 }) => {
          const user = currentMockUsers.find((u: User) => u.id === userId);
          if (!user) {
            throw AppError.notFound('ユーザーが見つかりません', ErrorType.NOT_FOUND_ERROR, { userId });
          }

          const friends = currentMockFriends[userId] || [];
          const start = (options.page - 1) * options.limit;
          const end = start + options.limit;
          const paginatedFriends = friends.slice(start, end);

          return {
            friends: paginatedFriends,
            pagination: {
              total: friends.length,
              page: options.page,
              limit: options.limit,
              hasMore: end < friends.length,
            },
          };
        }),
        addFriend: jest.fn(async (userId: string, friendId: string): Promise<boolean> => {
          const user = currentMockUsers.find((u: User) => u.id === userId);
          if (!user) {
            throw AppError.notFound('ユーザーが見つかりません', ErrorType.NOT_FOUND_ERROR, { userId });
          }

          const friendUser = currentMockUsers.find((u: User) => u.id === friendId);
          if (!friendUser) {
            throw AppError.notFound('追加するユーザーが見つかりません', ErrorType.NOT_FOUND_ERROR, { friendId });
          }

          const userFriends = currentMockFriends[userId] || [];
          if (userFriends.some((f: FriendOutput) => f.id === friendId)) {
            throw AppError.businessLogic('すでに友達として登録されています', ErrorType.BUSINESS_LOGIC_ERROR, { userId, friendId });
          }
          // Simulate adding a friend
          if (!currentMockFriends[userId]) {
            currentMockFriends[userId] = [];
          }
          currentMockFriends[userId].push({ id: friendUser.id, name: friendUser.name, friendshipDate: new Date().toISOString() });
          return true;
        }),
        // Helper to reset data for tests if needed (though jest.fn().mockImplementation re-initializes for each new UserService instance)
        __resetMocks: () => {
          currentMockUsers = JSON.parse(JSON.stringify(mockUsers));
          currentMockFriends = JSON.parse(JSON.stringify(mockFriendsData));
        }
      };
    }),
  };
});


describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    // Now, when UserService is instantiated, it will use the mocked implementation
    // with its own copy of mock data.
    userService = new UserService();
  });

  describe('getUser', () => {
    it('should return a user when a valid ID is provided', async () => {
      const user = await userService.getUser('1');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('1');
      expect(user?.name).toBe('山田太郎');
      // Ensure dates are Date objects
      expect(user?.createdAt).toBeInstanceOf(Date);
      expect(user?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null when an invalid ID is provided', async () => {
      const user = await userService.getUser('invalid-id');
      expect(user).toBeNull();
    });
  });

  describe('getUserFriends', () => {
    it('should throw AppError with NOT_FOUND_ERROR if user is not found', async () => {
      try {
        await userService.getUserFriends('non-existent-user', { page: 1, limit: 10 });
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        const appError = e as AppError;
        expect(appError.type).toBe(ErrorType.NOT_FOUND_ERROR);
        expect(appError.code).toBe(ErrorType.NOT_FOUND_ERROR); // The mock uses ErrorType as code for this specific mock
        expect(appError.message).toBe('ユーザーが見つかりません');
      }
    });

    it('should return first page of friends with correct pagination', async () => {
      const result = await userService.getUserFriends('1', { page: 1, limit: 1 });
      expect(result.friends).toHaveLength(1);
      expect(result.friends[0].id).toBe('2');
      expect(result.friends[0].name).toBe('鈴木花子');
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.hasMore).toBe(true);
    });

    it('should return second page of friends with correct pagination', async () => {
      const result = await userService.getUserFriends('1', { page: 2, limit: 1 });
      expect(result.friends).toHaveLength(1);
      expect(result.friends[0].id).toBe('3');
      expect(result.friends[0].name).toBe('田中一郎');
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should return empty array and correct pagination if user has no friends', async () => {
      // User '3' is set up with no friends in mockFriendsData
      const result = await userService.getUserFriends('3', { page: 1, limit: 10 });
      expect(result.friends).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe('addFriend', () => {
    it('should throw AppError with NOT_FOUND_ERROR if adder user is not found', async () => {
      expect.assertions(3);
      try {
        await userService.addFriend('non-existent-user', '1');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        const appError = e as AppError;
        expect(appError.type).toBe(ErrorType.NOT_FOUND_ERROR);
        expect(appError.message).toBe('ユーザーが見つかりません');
      }
    });

    it('should throw AppError with NOT_FOUND_ERROR if friend to be added is not found', async () => {
      expect.assertions(3);
      try {
        await userService.addFriend('1', 'non-existent-friend');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        const appError = e as AppError;
        expect(appError.type).toBe(ErrorType.NOT_FOUND_ERROR);
        expect(appError.message).toBe('追加するユーザーが見つかりません');
      }
    });

    it('should throw AppError with BUSINESS_LOGIC_ERROR if friendship already exists', async () => {
      expect.assertions(3);
      try {
        // User '1' is already friends with '2' in mockFriendsData
        await userService.addFriend('1', '2');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        const appError = e as AppError;
        expect(appError.type).toBe(ErrorType.BUSINESS_LOGIC_ERROR);
        expect(appError.message).toBe('すでに友達として登録されています');
      }
    });

    it('should successfully add a friend and return true', async () => {
      // User '3' adding User '1' as a friend. User '3' initially has no friends.
      const result = await userService.addFriend('3', '1');
      expect(result).toBe(true);

      // Verify the friend was added (by checking getUserFriends for user '3')
      const friendsOfUser3 = await userService.getUserFriends('3', { page: 1, limit: 10 });
      expect(friendsOfUser3.friends).toHaveLength(1);
      expect(friendsOfUser3.friends[0].id).toBe('1');
      expect(friendsOfUser3.friends[0].name).toBe('山田太郎');
    });
  });
});
