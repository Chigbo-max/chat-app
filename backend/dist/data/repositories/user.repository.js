"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_1 = __importDefault(require("../models/user"));
class UserRepository {
    async create(data) {
        return user_1.default.create(data);
    }
    async findById(id) {
        return user_1.default.findById(id);
    }
    async findByEmail(email) {
        return user_1.default.findOne({ email });
    }
    async setOnline(userId) {
        return user_1.default.findByIdAndUpdate(userId, {
            isOnline: true
        });
    }
    async setOffline(userId) {
        return user_1.default.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date()
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map