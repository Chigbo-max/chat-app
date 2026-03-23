export interface SendMessageDTO {
  conversationId?: string;
  recipientId?: string;
  content?: string;
  mediaUrl?: string;
}