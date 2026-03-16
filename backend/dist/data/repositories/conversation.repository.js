"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRepository = void 0;
const conversation_1 = __importDefault(require("../models/conversation"));
const mongoose_1 = require("mongoose");
class ConversationRepository {
    async create(data) {
        return conversation_1.default.create(data);
    }
    async findById(id) {
        return conversation_1.default.findById(id)
            .populate("participants")
            .populate("lastMessage");
    }
    // Cursor pagination for conversations
    async findUserConversations(userId, cursor, limit = 20) {
        const query = {
            participants: new mongoose_1.Types.ObjectId(userId)
        };
        if (cursor) {
            query.lastMessageAt = { $lt: new Date(cursor) };
        }
        const conversations = await conversation_1.default.find(query)
            .populate("participants")
            .populate("lastMessage")
            .sort({ lastMessageAt: -1 })
            .limit(limit + 1);
        const hasNextPage = conversations.length > limit;
        if (hasNextPage) {
            conversations.pop();
        }
        return {
            conversations,
            nextCursor: conversations.length
                ? conversations[conversations.length - 1].lastMessageAt
                : null,
            hasNextPage
        };
    }
    async updateLastMessage(conversationId, messageId, timestamp) {
        return conversation_1.default.findByIdAndUpdate(conversationId, {
            lastMessage: new mongoose_1.Types.ObjectId(messageId),
            lastMessageAt: timestamp
        }, { new: true });
    }
    async incrementUnreadCounts(conversationId, participants, senderId) {
        const update = {};
        participants.forEach((userId) => {
            if (userId !== senderId) {
                update[`unreadCounts.${userId}`] = 1;
            }
        });
        return conversation_1.default.findByIdAndUpdate(conversationId, { $inc: update }, { new: true });
    }
    async resetUnreadCount(conversationId, userId) {
        return conversation_1.default.findByIdAndUpdate(conversationId, {
            $set: {
                [`unreadCounts.${userId}`]: 0
            }
        }, { new: true });
    }
    async addParticipant(conversationId, userId) {
        return conversation_1.default.findByIdAndUpdate(conversationId, {
            $addToSet: { participants: new mongoose_1.Types.ObjectId(userId) }
        }, { new: true });
    }
    async removeParticipant(conversationId, userId) {
        return conversation_1.default.findByIdAndUpdate(conversationId, {
            $pull: { participants: new mongoose_1.Types.ObjectId(userId) }
        }, { new: true });
    }
}
exports.ConversationRepository = ConversationRepository;
//# sourceMappingURL=conversation.repository.js.map