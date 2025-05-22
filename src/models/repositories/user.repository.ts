import { User } from '../entities';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  // Future methods that might be needed:
  // findByEmail(email: string): Promise<User | null>;
  // create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
}
