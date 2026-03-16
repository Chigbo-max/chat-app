"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../../data/repositories/user.repository");
class UserService {
    constructor() {
        this.userRepo = new user_repository_1.UserRepository();
    }
    async findById(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async findByEmail(email) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async updateOnlineStatus(userId) {
        await this.userRepo.setOnline(userId);
    }
    async updateLastSeen(userId) {
        await this.userRepo.setOffline(userId);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map