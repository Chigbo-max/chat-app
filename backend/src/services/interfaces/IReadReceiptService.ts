export interface IReadReceiptService {
  markMessageRead(messageId: string, userId: string): Promise<any>;
}