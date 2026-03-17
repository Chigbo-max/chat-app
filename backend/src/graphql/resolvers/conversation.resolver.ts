import { IResolvers } from "@graphql-tools/utils";
import { ConversationService } from "../../services/concrete/ConversationService";
import { CreateConversationDTO } from "../../dtos/request/conversation/createConversation.dto";
import jwt from "jsonwebtoken";

const conversationService = new ConversationService();

export const conversationResolver: IResolvers = {


  Query: {
    getUserConversations: async (_parent, { cursor, limit }, {token}) => {

      if (!token) throw new Error("Authentication required");    
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
      return conversationService.getUserConversations({
        userId: decoded.id,
        cursor,
        limit
      });
    },

    getConversation: async (_parent, { id }: { id: string }) => {
      return conversationService.getConversationById(id);
    }
  },
  Mutation: {
    createConversation: async (_parent, { input }: { input: CreateConversationDTO }) => {
      return conversationService.createConversation(input);
    },
    addParticipant: async (_parent, { conversationId, userId }: { conversationId: string; userId: string }) => {
      return conversationService.addParticipant(conversationId, userId);
    },
    removeParticipant: async (_parent, { conversationId, userId }: { conversationId: string; userId: string }) => {
      return conversationService.removeParticipant(conversationId, userId);
    }
  },

  Participant: {
    id: (parent: any) => parent._id?.toString() || parent.id
  },

  Conversation: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    unreadCount: (parent: any, _args: any, context: any) => {
      const userId = context.user.id;
      return parent.unreadCounts?.get(userId) || 0;
    }
  },

  LastMessage: {
    id: (parent: any) => parent._id?.toString() || parent.id
  }
};