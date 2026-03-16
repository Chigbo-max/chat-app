import { IResolvers } from "@graphql-tools/utils";
import { NotificationService } from "../../services/concrete/NotificationService";

const notificationService = new NotificationService();

export const notificationResolver: IResolvers = {
  Query: {
    getNotifications: async (_parent, { input }: { input: { userId: string; limit?: number; cursor?: string } }) => {
      return notificationService.getNotifications(input);
    }
  },
  Mutation: {
    markNotificationRead: async (_parent, { notificationId }: { notificationId: string }) => {
      return notificationService.markNotificationRead(notificationId);
    }
  }
};