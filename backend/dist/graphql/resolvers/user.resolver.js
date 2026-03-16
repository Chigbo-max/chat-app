"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = void 0;
const AuthService_1 = require("../../services/concrete/AuthService");
const authService = new AuthService_1.AuthService();
exports.userResolver = {
    Mutation: {
        login: async (_parent, { input }) => {
            return authService.login(input);
        },
        register: async (_parent, { input }) => {
            return authService.register(input);
        }
    }
};
//# sourceMappingURL=user.resolver.js.map