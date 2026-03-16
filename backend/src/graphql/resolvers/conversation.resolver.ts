import { IResolvers } from "@graphql-tools/utils";
import { ConversationService } from "../../services/concrete/ConversationService";
import { CreateConversationDTO } from "../../dtos/request/conversation/createConversation.dto";

const conversationService = new ConversationService();

export const conversationResolver: IResolvers = {
  Query: {
    getUserConversations: async (_parent, { cursor, limit }: { cursor?: string; limit?: number }) => {
      return conversationService.getUserConversations({ cursor, limit });
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
  }
};