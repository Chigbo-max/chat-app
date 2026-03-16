import { MessageRepository } from "../../data/repositories/message.repository";
import { IReadReceiptService } from "../interfaces/IReadReceiptService";

export class ReadReceiptService implements IReadReceiptService {

  private repo = new MessageRepository();

  async markMessageRead(messageId: string, userId: string) {
    return this.repo.markAsRead(messageId, userId);
  }
}