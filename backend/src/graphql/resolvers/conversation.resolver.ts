import { IResolvers } from "@graphql-tools/utils";
import { ConversationService } from "../../services/concrete/ConversationService";
import { CreateConversationDTO } from "../../dtos/request/conversation/createConversation.dto";
import { MessageService } from "../../services/concrete/MessageService";
import User from "../../data/models/user";
import jwt from "jsonwebtoken";

const conversationService = new ConversationService();
const messageService = new MessageService();

export const conversationResolver: IResolvers = {
  Query: {
    getUserConversations: async (_parent, { cursor, limit }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      return conversationService.getUserConversations({
        userId: decoded.id,
        cursor,
        limit,
      });
    },

    getConversation: async (_parent, { id }: { id: string }) => {
      return conversationService.getConversationById(id);
    },

    getAllUsers: async () => {
      const users = await User.find().select("_id username avatar");
      return users.map((user: any) => ({
        id: user._id?.toString() || user.id,
        username: user.username,
        avatar: user.avatar,
      }));
    },
  },
  Mutation: {
    createConversation: async (_parent, { input }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const creatorId = decoded.id;
      const participants = input.participantIds || [];
      if (input.isGroup && !participants.includes(creatorId)) {
        participants.push(creatorId);
      }

      const conversation = await conversationService.createConversation({
        ...input,
        participants,
        admins: input.isGroup ? [creatorId] : [],
      });

      return conversation;
    },

    addParticipant: async (
      _parent,
      { conversationId, userId },
      { token }
    ) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const currentUserId = decoded.id;

      const conversation = await conversationService.getConversationById(
        conversationId
      );

      if (!conversation) throw new Error("Conversation not found");

      if (!conversation.isGroup)
        throw new Error("Cannot add participants to a non-group conversation");
      if (!conversation.admins.includes(currentUserId))
        throw new Error("Only admins can add participants");

      return conversationService.addParticipant(conversationId, userId);
    },

    removeParticipant: async (_parent, { conversationId, userId }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const currentUserId = decoded.id;
  
      const conversation = await conversationService.getConversationById(conversationId);

      if (!conversation) throw new Error("Conversation not found");
  
      if (!conversation.isGroup) throw new Error("Cannot remove participants from a non-group conversation");
      if (!conversation.admins.includes(currentUserId)) throw new Error("Only admins can remove participants");
  
      return conversationService.removeParticipant(conversationId, userId);
    },

    makeAdmin: async (_parent, { conversationId, userId }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const currentUserId = decoded.id;
  
      const conversation = await conversationService.getConversationById(conversationId);

      if (!conversation) throw new Error("Conversation not found");
  
      if (!conversation.admins.includes(currentUserId)) throw new Error("Only admins can make someone an admin");
  
      return conversationService.makeAdmin(conversationId, userId);
    },

    removeAdmin: async (_parent, { conversationId, userId }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const currentUserId = decoded.id;

      const conversation = await conversationService.getConversationById(conversationId);
      if (!conversation) throw new Error("Conversation not found");
      
      if (!conversation.admins.includes(currentUserId)) throw new Error("Only admins can remove admin rights");
      if (userId === currentUserId) throw new Error("Admins cannot remove their own admin rights");
      return conversationService.removeAdmin(conversationId, userId);
    },

    editConversation: async (_parent, { conversationId, name }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const currentUserId = decoded.id;

      const conversation = await conversationService.getConversationById(conversationId);
      if (!conversation) throw new Error("Conversation not found");
      if (!conversation.isGroup) throw new Error("Cannot edit non-group conversation name");
      if (!conversation.admins.includes(currentUserId)) throw new Error("Only admins can edit conversation name");

      return conversationService.editConversation(conversationId, name);
    },

    deleteConversation: async (_parent, { conversationId }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const currentUserId = decoded.id;

      const conversation = await conversationService.getConversationById(conversationId);
      if (!conversation) throw new Error("Conversation not found");
      
      // For groups, only admins can delete. For 1-1, either participant can "delete" (usually it just hides it for them, but here we delete it for everyone for simplicity if requested)
      if (conversation.isGroup && !conversation.admins.includes(currentUserId)) {
        throw new Error("Only admins can delete this group chat");
      }

      return conversationService.deleteConversation(conversationId);
    },

    markConversationRead: async (_parent, { conversationId }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const currentUserId = decoded.id;

      return conversationService.markConversationRead(conversationId, currentUserId);
    },

    deleteMessage: async (_parent, { messageId }, { token }) => {
      if (!token) throw new Error("Authentication required");
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.id;
  
      const message = await messageService.getMessageById(messageId);

      if (!message) throw new Error("Message not found");
  
      const conversation = await conversationService.getConversationById(message.conversation.toString());

      if(!conversation) throw new Error("Conversation not found");
  
      if (message.sender.toString() !== userId && !conversation.admins.includes(userId)) {
        throw new Error("Only the sender or group admins can delete this message");
      }
  
      return messageService.deleteMessage(messageId);
    },
  },

  Participant: {
    id: (parent: any) => parent._id?.toString() || parent.id,
  },

  Conversation: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    unreadCount: (parent: any, _args: any, context: any) => {
      const userId = context.user.id;
      return parent.unreadCounts?.get(userId) || 0;
    },
  },

  LastMessage: {
    id: (parent: any) => parent._id?.toString() || parent.id,
  },
};
