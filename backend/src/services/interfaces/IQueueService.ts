export interface IQueueService {
  enqueueNotification(data: any): Promise<void>;
  enqueueMessageEvent(data: any): Promise<void>;
}