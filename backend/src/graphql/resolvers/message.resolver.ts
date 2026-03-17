import { IResolvers } from "@graphql-tools/utils";
import { IMessageService } from "../../services/interfaces/IMessageService";
import { IReactionService } from "../../services/interfaces/IReactionService";
import jwt from "jsonwebtoken";

export const messageResolver = (
  messageService: IMessageService,
  reactionService: IReactionService
): IResolvers => ({
  Query: {
    getMessages: async (_parent, { conversationId, cursor, limit }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.id;
      return messageService.getMessages({ conversationId, cursor, limit, userId });
    },
  },

  Mutation: {
    sendMessage: async (_parent, { input }, { token }) => {
      if (!token) throw new Error("Authentication required");
      return messageService.sendMessage(input, token);
    },

    editMessage: async (_parent, { input }, { token }) => {
      if (!token) throw new Error("Authentication required");
      return messageService.editMessage(input.messageId, input.content, token);
    },

    deleteMessage: async (_parent, { messageId }) => {
      return messageService.deleteMessage(messageId);
    },

    addReaction: async (_parent, { messageId, emoji }, { token }) => {
      if (!token) throw new Error("Authentication required");
      return reactionService.addReaction(messageId, token, emoji);
    },

    removeReaction: async (_parent, { messageId, emoji }, { token }) => {
      if (!token) throw new Error("Authentication required");
      return reactionService.removeReaction(messageId, token, emoji);
    },

    markMessageRead: async (_parent, { messageId }, { token }) => {
      if (!token) throw new Error("Authentication required");
      return messageService.markMessageRead(messageId, token);
    },
  },

  Message: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    conversationId: (parent: any) => parent.conversation?.toString() || parent.conversationId,
    sender: (parent: any) => parent.sender,
    reactions: (parent: any) =>
      parent.reactions.map((r: any) => ({
        user: r.user?.toString(),
        emoji: r.emoji,
      })),
    readBy: (parent: any) => parent.readBy?.map((u: any) => u.toString()) || [],
  },
});