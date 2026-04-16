import { MessageRepository } from "../../data/repositories/message.repository";
import { IReactionService } from "../interfaces/IReactionService";
import jwt from "jsonwebtoken";

export class ReactionService implements IReactionService {
  private repo = new MessageRepository();

  async addReaction(messageId: string, token: string, emoji: string) {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    return this.repo.addReaction(messageId, userId, emoji);
  }

  async removeReaction(messageId: string, token: string, emoji: string) {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    return this.repo.removeReaction(messageId, userId, emoji);
  }
}
