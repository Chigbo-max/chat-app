import Notification from "../models/notification";

export class NotificationRepository {

  async create(data: any) {
    return Notification.create(data);
  }

  async getUserNotifications(userId: string) {
    return Notification.find({ user: userId })
      .sort({ createdAt: -1 });
  }

  async markRead(notificationId: string) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

}