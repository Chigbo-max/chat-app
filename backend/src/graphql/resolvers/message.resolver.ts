import { IResolvers } from "@graphql-tools/utils";
import { MessageService } from "../../services/concrete/MessageService";
import { ReactionService } from "../../services/concrete/ReactionService";
import { SendMessageDTO } from "../../dtos/request/message/sendMessage.dto";
import { EditMessageDTO } from "../../dtos/request/message/editMessage.dto";
import { AddReactionDTO } from "../../dtos/request/message/addReaction.dto";

const messageService = new MessageService();
const reactionService = new ReactionService();

export const messageResolver: IResolvers = {
  Query: {
    getMessages: async (_parent, { conversationId, cursor, limit }: { conversationId: string; cursor?: string; limit?: number }) => {
      return messageService.getMessages({ conversationId, cursor, limit });
    }
  },
  Mutation: {
    sendMessage: async (_parent, { input }: { input: SendMessageDTO }) => {
      return messageService.sendMessage(input);
    },
    editMessage: async (_parent, { input }: { input: EditMessageDTO }) => {
      return messageService.editMessage(input.messageId, input.content);
    },
    deleteMessage: async (_parent, { messageId }: { messageId: string }) => {
      return messageService.deleteMessage(messageId);
    },
    addReaction: async (_parent, { input }: { input: AddReactionDTO }) => {
      return reactionService.addReaction(input.messageId, input.userId, input.emoji);
    },
    removeReaction: async (_parent, { input }: { input: AddReactionDTO }) => {
      return reactionService.removeReaction(input.messageId, input.userId, input.emoji);
    },
    markMessageRead: async (_parent, { messageId, userId }: { messageId: string, userId: string }) => {
      return messageService.markMessageRead(messageId, userId);
    }
  }
};