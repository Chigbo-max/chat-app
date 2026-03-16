import { NotificationRepository } from "../../data/repositories/notification.repository";
import { INotificationService } from "../interfaces/INotificationService";

export class NotificationService implements INotificationService {

  private repo = new NotificationRepository();

  async createNotification(data: any) {
    return this.repo.create(data);
  }

  async getNotifications(params: any) {
    return this.repo.getUserNotifications(
      params.userId
    );
  }

  async markNotificationRead(notificationId: string) {
    return this.repo.markRead(notificationId);
  }
}