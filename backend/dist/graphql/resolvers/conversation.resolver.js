"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationResolver = void 0;
const ConversationService_1 = require("../../services/concrete/ConversationService");
const conversationService = new ConversationService_1.ConversationService();
exports.conversationResolver = {
    Query: {
        getUserConversations: async (_parent, { cursor, limit }) => {
            return conversationService.getUserConversations({ cursor, limit });
        },
        getConversation: async (_parent, { id }) => {
            return conversationService.getConversationById(id);
        }
    },
    Mutation: {
        createConversation: async (_parent, { input }) => {
            return conversationService.createConversation(input);
        },
        addParticipant: async (_parent, { conversationId, userId }) => {
            return conversationService.addParticipant(conversationId, userId);
        },
        removeParticipant: async (_parent, { conversationId, userId }) => {
            return conversationService.removeParticipant(conversationId, userId);
        }
    }
};
//# sourceMappingURL=conversation.resolver.js.map