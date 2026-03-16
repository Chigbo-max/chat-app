import { IUserService } from "../interfaces/IUserService";
import { UserRepository } from "../../data/repositories/user.repository";

export class UserService implements IUserService {

      private userRepo: UserRepository;

    constructor() {
      this.userRepo = new UserRepository();
    }

  async findById(userId: string): Promise<any> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
    async updateOnlineStatus(userId: string): Promise<void> {
    await this.userRepo.setOnline(userId);
  }


  async updateLastSeen(userId: string): Promise<void> {
    await this.userRepo.setOffline(userId);
  }

}