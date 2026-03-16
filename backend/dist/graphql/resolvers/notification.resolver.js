"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationResolver = void 0;
const NotificationService_1 = require("../../services/concrete/NotificationService");
const notificationService = new NotificationService_1.NotificationService();
exports.notificationResolver = {
    Query: {
        getNotifications: async (_parent, { input }) => {
            return notificationService.getNotifications(input);
        }
    },
    Mutation: {
        markNotificationRead: async (_parent, { notificationId }) => {
            return notificationService.markNotificationRead(notificationId);
        }
    }
};
//# sourceMappingURL=notification.resolver.js.map