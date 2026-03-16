export interface CreateNotificationDTO {
  userId: string;
  type: string;
  message: string;
}

export interface GetNotificationsDTO {
  userId: string;
  cursor?: string;
  limit?: number;
}

export interface MarkNotificationReadDTO {
  notificationId: string;
}