export interface INotificationService {
  createNotification(data: {
    userId: string;
    type: string;
    message: string;
  }): Promise<any>;

  getNotifications(params: {
    userId: string;
    cursor?: string;
    limit?: number;
  }): Promise<any>;

  markNotificationRead(notificationId: string): Promise<any>;
}