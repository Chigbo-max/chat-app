"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const message_1 = __importDefault(require("../models/message"));
const mongoose_1 = require("mongoose");
class MessageRepository {
    async create(data) {
        return message_1.default.create(data);
    }
    async findById(messageId) {
        return message_1.default.findById(messageId).populate("sender");
    }
    // Cursor pagination
    async getConversationMessages(conversationId, cursor, limit = 20) {
        const query = {
            conversation: new mongoose_1.Types.ObjectId(conversationId)
        };
        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) };
        }
        const messages = await message_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(limit + 1) // check if next page exists
            .populate("sender");
        const hasNextPage = messages.length > limit;
        if (hasNextPage) {
            messages.pop();
        }
        return {
            messages,
            nextCursor: messages.length
                ? messages[messages.length - 1].createdAt
                : null,
            hasNextPage
        };
    }
    async editMessage(messageId, content) {
        return message_1.default.findByIdAndUpdate(messageId, {
            content,
            edited: true
        }, { new: true }).populate("sender");
    }
    async deleteMessage(messageId) {
        return message_1.default.findByIdAndUpdate(messageId, { deleted: true }, { new: true });
    }
    async updateStatus(messageId, status) {
        return message_1.default.findByIdAndUpdate(messageId, { status }, { new: true });
    }
    async markAsRead(messageId, userId) {
        return message_1.default.findByIdAndUpdate(messageId, {
            $addToSet: {
                readBy: new mongoose_1.Types.ObjectId(userId)
            },
            status: "read"
        }, { new: true });
    }
    async addReaction(messageId, userId, emoji) {
        return message_1.default.findByIdAndUpdate(messageId, {
            $push: {
                reactions: {
                    user: new mongoose_1.Types.ObjectId(userId),
                    emoji
                }
            }
        }, { new: true });
    }
    async removeReaction(messageId, userId, emoji) {
        return message_1.default.findByIdAndUpdate(messageId, {
            $pull: {
                reactions: {
                    user: new mongoose_1.Types.ObjectId(userId),
                    emoji
                }
            }
        }, { new: true });
    }
    async markConversationMessagesAsDelivered(conversationId, userId) {
        return message_1.default.updateMany({
            conversation: conversationId,
            sender: { $ne: new mongoose_1.Types.ObjectId(userId) },
            status: "sent"
        }, {
            $set: { status: "delivered" }
        });
    }
}
exports.MessageRepository = MessageRepository;
//# sourceMappingURL=message.repository.js.map