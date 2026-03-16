export interface IUserService {
  findById(userId: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  updateOnlineStatus(userId: string ): Promise<void>;
  updateLastSeen(userId: string): Promise<void>;
}