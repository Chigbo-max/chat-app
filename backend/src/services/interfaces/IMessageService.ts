import { SendMessageDTO } from "../../dtos/request/message/sendMessage.dto";

export interface IMessageService {
  sendMessage(data: SendMessageDTO, token: string): Promise<any>;
  editMessage(messageId: string, content: string, token: string): Promise<any>;
  deleteMessage(messageId: string): Promise<any>;
  getMessages(params: {
    conversationId: string;
    cursor?: string;
    limit?: number;
    userId: string;
  }): Promise<any>;
  markMessageRead(messageId: string, token: string): Promise<any>;
  getMessageById(messageId: string): Promise<any>;
}