"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_repository_1 = require("../../data/repositories/message.repository");
class MessageService {
    constructor() {
        this.repo = new message_repository_1.MessageRepository();
    }
    async sendMessage(data) {
        return this.repo.create(data);
    }
    async editMessage(messageId, content) {
        return this.repo.editMessage(messageId, content);
    }
    async deleteMessage(messageId) {
        return this.repo.deleteMessage(messageId);
    }
    async getMessages(params) {
        return this.repo.getConversationMessages(params.conversationId, params.cursor, params.limit);
    }
    async markMessageRead(messageId, userId) {
        return this.repo.markAsRead(messageId, userId);
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=MessageService.js.map