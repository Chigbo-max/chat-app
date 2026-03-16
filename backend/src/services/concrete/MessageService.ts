import { IMessageService } from "../interfaces/IMessageService";
import { MessageRepository } from "../../data/repositories/message.repository";

export class MessageService implements IMessageService {

  private repo = new MessageRepository();

  async sendMessage(data: any) {
    return this.repo.create(data);
  }

  async editMessage(messageId: string, content: string) {
    return this.repo.editMessage(messageId, content);
  }

  async deleteMessage(messageId: string) {
    return this.repo.deleteMessage(messageId);
  }

  async getMessages(params: any) {
    return this.repo.getConversationMessages(
      params.conversationId,
      params.cursor,
      params.limit
    );
  }

  async markMessageRead(messageId: string, userId: string) {
    return this.repo.markAsRead(messageId, userId);
  }
}