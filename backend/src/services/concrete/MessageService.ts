import { IMessageService } from "../interfaces/IMessageService";
import { MessageRepository } from "../../data/repositories/message.repository";
import { ConversationRepository } from "../../data/repositories/conversation.repository";
import jwt from "jsonwebtoken";

export class MessageService implements IMessageService {
  private repo = new MessageRepository();
  private conversationRepo = new ConversationRepository();

  async sendMessage(
    data: { conversationId: string; content?: string; mediaUrl?: string },
    token: string
  ) {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const senderId = decoded.id;

    const message: any = await this.repo.create({
      conversation: data.conversationId,
      sender: senderId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      status: "sent",
    });

    await this.conversationRepo.updateLastMessage(
      data.conversationId,
      message._id,
      message.createdAt
    );

    const conversation: any = await this.conversationRepo.findById(
      data.conversationId
    );

    await this.conversationRepo.incrementUnreadCounts(
      data.conversationId,
      conversation.participants.map((p: any) => p.toString()),
      senderId
    );

    return message;
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
