import { MessageRepository } from "../../data/repositories/message.repository";
import { IReactionService } from "../interfaces/IReactionService";

export class ReactionService implements IReactionService {

  private repo = new MessageRepository();

  async addReaction(messageId: string, userId: string, emoji: string) {
    return this.repo.addReaction(messageId, userId, emoji);
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    return this.repo.removeReaction(messageId, userId, emoji);
  }
}