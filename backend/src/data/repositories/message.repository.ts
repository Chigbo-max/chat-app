import Message from "../models/message";
import { Types } from "mongoose";

export class MessageRepository {

  async create(data: any) {
    const message = await Message.create(data);
    return message.populate("sender");
  }

  async findById(messageId: string) {
    return Message.findById(messageId).populate("sender");
  }

  // Cursor pagination
  async getConversationMessages(
    conversationId: string,
    cursor?: string,
    limit = 20
  ) {
    const query: any = {
      conversation: new Types.ObjectId(conversationId)
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
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

  async editMessage(messageId: string, content: string) {
    return Message.findByIdAndUpdate(
      messageId,
      {
        content,
        edited: true
      },
      { new: true }
    ).populate("sender");
  }

  async deleteMessage(messageId: string) {
    return Message.findByIdAndUpdate(
      messageId,
      { deleted: true },
      { new: true }
    );
  }

  async updateStatus(
    messageId: string,
    status: "sent" | "delivered" | "read"
  ) {
    return Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );
  }

  async markAsRead(messageId: string, userId: string) {
    return Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: {
          readBy: new Types.ObjectId(userId)
        },
        status: "read"
      },
      { new: true }
    );
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ) {
    return Message.findByIdAndUpdate(
      messageId,
      {
        $push: {
          reactions: {
            user: new Types.ObjectId(userId),
            emoji
          }
        }
      },
      { new: true }
    );
  }

  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string
  ) {
    return Message.findByIdAndUpdate(
      messageId,
      {
        $pull: {
          reactions: {
            user: new Types.ObjectId(userId),
            emoji
          }
        }
      },
      { new: true }
    );
  }

  async markConversationMessagesAsDelivered(
    conversationId: string,
    userId: string
  ) {
    return Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: new Types.ObjectId(userId) },
        status: "sent"
      },
      {
        $set: { status: "delivered" }
      }
    );
  }

}