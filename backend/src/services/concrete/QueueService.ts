import { IQueueService } from "../interfaces/IQueueService";

export class QueueService implements IQueueService {

  async enqueueNotification(data: any) {
    console.log("Queue notification", data);
  }

  async enqueueMessageEvent(data: any) {
    console.log("Queue message event", data);
  }
}