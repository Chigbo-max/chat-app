"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../../data/repositories/user.repository");
class AuthService {
    constructor() {
        this.userRepo = new user_repository_1.UserRepository();
    }
    async login(data) {
        const user = await this.userRepo.findByEmail(data.email);
        if (!user)
            throw new Error("Invalid credentials");
        if (data.password) {
            const valid = await bcryptjs_1.default.compare(data.password, user.password);
            if (!valid)
                throw new Error("Invalid credentials");
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
        return {
            user,
            accessToken,
            refreshToken: accessToken
        };
    }
    async register(data) {
        const hashed = data.password
            ? await bcryptjs_1.default.hash(data.password, 10)
            : null;
        const user = await this.userRepo.create({
            ...data,
            password: hashed
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
        return {
            user,
            accessToken: token,
            refreshToken: token
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map