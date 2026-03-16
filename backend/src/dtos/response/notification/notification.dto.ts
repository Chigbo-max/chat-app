export interface NotificationResponseDTO {
  id: string;
  user: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface GetNotificationsResponseDTO {
  notifications: NotificationResponseDTO[];
  hasMore: boolean;
  nextCursor?: string;
}