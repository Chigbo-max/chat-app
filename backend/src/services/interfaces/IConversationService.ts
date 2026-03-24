import { CreateConversationDTO } from "../../dtos/request/conversation/createConversation.dto";

export interface IConversationService {
  createConversation(data: CreateConversationDTO): Promise<any>;
  getConversationById(conversationId: string): Promise<any>;
  getUserConversations(params: { userId: string, cursor?: string; limit?: number }): Promise<any>;
  addParticipant(conversationId: string, userId: string): Promise<any>;
  removeParticipant(conversationId: string, userId: string): Promise<any>;
  makeAdmin(conversationId: string, userId: string): Promise<any>;
  removeAdmin(conversationId: string, userId: string): Promise<any>;
  editConversation(conversationId: string, name: string): Promise<any>;
  deleteConversation(conversationId: string): Promise<string>;
  markConversationRead(conversationId: string, userId: string): Promise<any>;
}