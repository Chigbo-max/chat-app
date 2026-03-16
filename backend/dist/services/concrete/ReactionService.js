"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionService = void 0;
const message_repository_1 = require("../../data/repositories/message.repository");
class ReactionService {
    constructor() {
        this.repo = new message_repository_1.MessageRepository();
    }
    async addReaction(messageId, userId, emoji) {
        return this.repo.addReaction(messageId, userId, emoji);
    }
    async removeReaction(messageId, userId, emoji) {
        return this.repo.removeReaction(messageId, userId, emoji);
    }
}
exports.ReactionService = ReactionService;
//# sourceMappingURL=ReactionService.js.map