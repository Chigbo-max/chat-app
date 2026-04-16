import { IMessageService } from "../interfaces/IMessageService";
import { MessageRepository } from "../../data/repositories/message.repository";
import { ConversationRepository } from "../../data/repositories/conversation.repository";
import jwt from "jsonwebtoken";

export class MessageService implements IMessageService {
  private repo = new MessageRepository();
  private conversationRepo = new ConversationRepository();

  async sendMessage(
    data: { conversationId?: string; recipientId?: string; content?: string; mediaUrl?: string },
    token: string
  ) {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const senderId = decoded.id;
  
    let conversationId = data.conversationId;
  
    //  If no conversationId, create/find 1–1 conversation
    if (!conversationId && data.recipientId) {
      let conversation = await this.conversationRepo.findOneOnOneConversation(
        senderId,
        data.recipientId
      );
  
      if (!conversation) {
        conversation = await this.conversationRepo.create({
          isGroup: false,
          participants: [senderId, data.recipientId],
          admins: [],
        });
      }
  
      conversationId = conversation._id.toString();
    }
  
    if (!conversationId) {
      throw new Error("ConversationId or recipientId is required");
    }
  
    const message: any = await this.repo.create({
      conversation: conversationId,
      sender: senderId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      status: "sent",
    });
  
    await this.conversationRepo.updateLastMessage(
      conversationId,
      message._id,
      message.createdAt
    );
  
    const conversation: any = await this.conversationRepo.findById(conversationId);
  
    await this.conversationRepo.incrementUnreadCounts(
      conversationId,
      conversation.participants.map((p: any) => p.toString()),
      senderId
    );
  
return {
  id: message._id.toString(),              
  conversationId: conversationId,            
  sender: message.sender,
  content: message.content,
  mediaUrl: message.mediaUrl,
  reactions: message.reactions || [],
  readBy: message.readBy || [],
  edited: message.edited || false,
  deleted: message.deleted || false,
  status: message.status,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
};


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

  async getMessageById(messageId: string) {
    return this.repo.findById(messageId);
  }
}
