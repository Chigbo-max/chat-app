import { IMessageService } from "../interfaces/IMessageService";
import { MessageRepository } from "../../data/repositories/message.repository";
import jwt from "jsonwebtoken";

export class MessageService implements IMessageService {

  private repo = new MessageRepository();

  async sendMessage(data: { conversationId: string; content?: string; mediaUrl?: string }, token: string) {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const senderId = decoded.id;

    return this.repo.create({
      conversation: data.conversationId,
      sender: senderId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      status: "sent"
    });
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

  async markMessageRead(messageId: string, token: string) {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    return this.repo.markAsRead(messageId, userId);
  }
  
}