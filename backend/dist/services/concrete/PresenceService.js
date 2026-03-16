"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceService = void 0;
const user_repository_1 = require("../../data/repositories/user.repository");
class PresenceService {
    constructor() {
        this.repo = new user_repository_1.UserRepository();
    }
    async userConnected(userId) {
        await this.repo.setOnline(userId);
    }
    async userDisconnected(userId) {
        await this.repo.setOffline(userId);
    }
}
exports.PresenceService = PresenceService;
//# sourceMappingURL=PresenceService.js.map