"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const conversation_repository_1 = require("../../data/repositories/conversation.repository");
class ConversationService {
    constructor() {
        this.repo = new conversation_repository_1.ConversationRepository();
    }
    async createConversation(data) {
        return this.repo.create({
            ...data,
            participants: data.participantIds
        });
    }
    async getConversationById(id) {
        return this.repo.findById(id);
    }
    async getUserConversations({ cursor, limit = 20 }) {
        return this.repo.findUserConversations(cursor, limit);
    }
    async addParticipant(conversationId, userId) {
        return this.repo.addParticipant(conversationId, userId);
    }
    async removeParticipant(conversationId, userId) {
        return this.repo.removeParticipant(conversationId, userId);
    }
}
exports.ConversationService = ConversationService;
//# sourceMappingURL=ConversationService.js.map