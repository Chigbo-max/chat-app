import { ConversationRepository } from "../../data/repositories/conversation.repository";
import { IConversationService } from "../interfaces/IConversationService";

export class ConversationService implements IConversationService {

  private repo = new ConversationRepository();

  async createConversation(data: any) {
    return this.repo.create({
      ...data,
      participants: data.participantIds
    });
  }

  async getConversationById(id: string) {
    return this.repo.findById(id);
  }

  async getUserConversations({ cursor, limit = 20 }: any) {
    return this.repo.findUserConversations(cursor, limit);
  }

  async addParticipant(conversationId: string, userId: string) {
    return this.repo.addParticipant(conversationId, userId);
  }

  async removeParticipant(conversationId: string, userId: string) {
    return this.repo.removeParticipant(conversationId, userId);
  }
}