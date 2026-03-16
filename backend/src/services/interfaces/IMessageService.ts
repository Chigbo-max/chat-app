import { SendMessageDTO } from "../../dtos/request/message/sendMessage.dto";

export interface IMessageService {
  sendMessage(data: SendMessageDTO): Promise<any>;
  editMessage(messageId: string, content: string): Promise<any>;
  deleteMessage(messageId: string): Promise<any>;
  getMessages(params: {
    conversationId: string;
    cursor?: string;
    limit?: number;
  }): Promise<any>;
}