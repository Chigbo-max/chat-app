import User, { IUser } from "../models/user";

export class UserRepository {
  async create(data: Partial<IUser>) {
    return User.create(data);
  }

  async findById(id: string) {
    return User.findById(id);
  }

  async findByEmail(email: string) {
    return User.findOne({ email });
  }

  async setOnline(userId: string) {
    return User.findByIdAndUpdate(userId, {
      isOnline: true
    });
  }

  async setOffline(userId: string) {
    return User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date()
    });
  }
}