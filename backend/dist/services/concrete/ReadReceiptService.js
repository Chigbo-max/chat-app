"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadReceiptService = void 0;
const message_repository_1 = require("../../data/repositories/message.repository");
class ReadReceiptService {
    constructor() {
        this.repo = new message_repository_1.MessageRepository();
    }
    async markMessageRead(messageId, userId) {
        return this.repo.markAsRead(messageId, userId);
    }
}
exports.ReadReceiptService = ReadReceiptService;
//# sourceMappingURL=ReadReceiptService.js.map