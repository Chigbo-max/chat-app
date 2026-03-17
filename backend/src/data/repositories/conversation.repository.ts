import Conversation from "../models/conversation";
import { Types } from "mongoose";

export class ConversationRepository {

  async create(data: any) {
    const conversation = await Conversation.create(data);
    return conversation.populate("participants");

  }

  async findById(id: string) {
    return Conversation.findById(id)
      .populate("participants")
      .populate("lastMessage");
  }

  // Cursor pagination for conversations
  async findUserConversations(
    userId: string,
    cursor?: string,
    limit = 20
  ) {
    const query: any = {
      participants: new Types.ObjectId(userId)
    };

    if (cursor) {
      query.lastMessageAt = { $lt: new Date(cursor) };
    }

    const conversations = await Conversation.find(query)
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

  async updateLastMessage(
    conversationId: string,
    messageId: string,
    timestamp: Date
  ) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: new Types.ObjectId(messageId),
        lastMessageAt: timestamp
      },
      { new: true }
    );
  }

  async incrementUnreadCounts(
    conversationId: string,
    participants: string[],
    senderId: string
  ) {
    const update: any = {};

    participants.forEach((userId) => {
      if (userId !== senderId) {
        update[`unreadCounts.${userId}`] = 1;
      }
    });

    return Conversation.findByIdAndUpdate(
      conversationId,
      { $inc: update },
      { new: true }
    );
  }

  async resetUnreadCount(conversationId: string, userId: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          [`unreadCounts.${userId}`]: 0
        }
      },
      { new: true }
    );
  }

  async addParticipant(conversationId: string, userId: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { participants: new Types.ObjectId(userId) }
      },
      { new: true }
    );
  }

  async removeParticipant(conversationId: string, userId: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: { participants: new Types.ObjectId(userId) }
      },
      { new: true }
    );
  }

}