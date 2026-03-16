"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageResolver = void 0;
const MessageService_1 = require("../../services/concrete/MessageService");
const ReactionService_1 = require("../../services/concrete/ReactionService");
const messageService = new MessageService_1.MessageService();
const reactionService = new ReactionService_1.ReactionService();
exports.messageResolver = {
    Query: {
        getMessages: async (_parent, { conversationId, cursor, limit }) => {
            return messageService.getMessages({ conversationId, cursor, limit });
        }
    },
    Mutation: {
        sendMessage: async (_parent, { input }) => {
            return messageService.sendMessage(input);
        },
        editMessage: async (_parent, { input }) => {
            return messageService.editMessage(input.messageId, input.content);
        },
        deleteMessage: async (_parent, { messageId }) => {
            return messageService.deleteMessage(messageId);
        },
        addReaction: async (_parent, { input }) => {
            return reactionService.addReaction(input.messageId, input.userId, input.emoji);
        },
        removeReaction: async (_parent, { input }) => {
            return reactionService.removeReaction(input.messageId, input.userId, input.emoji);
        },
        markMessageRead: async (_parent, { messageId, userId }) => {
            return messageService.markMessageRead(messageId, userId);
        }
    }
};
//# sourceMappingURL=message.resolver.js.map