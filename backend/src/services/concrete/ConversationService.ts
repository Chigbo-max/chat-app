import { ConversationRepository } from "../../data/repositories/conversation.repository";
import { IConversationService } from "../interfaces/IConversationService";

export class ConversationService implements IConversationService {

  private repo = new ConversationRepository();

async createConversation(data: any) {
  const { participantIds = [], isGroup } = data;

  // ✅ Normalize participants
  const participants = participantIds.map(String);

  // 🔥 HANDLE 1–1 CHAT (including self-chat)
  if (!isGroup) {
    const sorted = [...participants].sort();

    const existing = await this.repo.findOne({
      isGroup: false,
      participants: { $all: sorted, $size: sorted.length },
    });

    if (existing) {
      return existing; // ✅ prevent duplicates
    }
  }

  // ✅ CREATE NEW CONVERSATION
  return this.repo.create({
    ...data,
    participants,
  });
}

  async getConversationById(id: string) {
    return this.repo.findById(id);
  }

  async getUserConversations({ userId, cursor, limit = 20 }: any) {
    return this.repo.findUserConversations(userId, cursor, limit);
  }

  async addParticipant(conversationId: string, userId: string) {
    return this.repo.addParticipant(conversationId, userId);
  }

  async removeParticipant(conversationId: string, userId: string) {
    return this.repo.removeParticipant(conversationId, userId);
  }

  async makeAdmin(conversationId: string, userId: string) {
    return this.repo.addAdmin(conversationId, userId);
  }

  async removeAdmin(conversationId: string, userId: string) {
    return this.repo.removeAdmin(conversationId, userId);
  }
}