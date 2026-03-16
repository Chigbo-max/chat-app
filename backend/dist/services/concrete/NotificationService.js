"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_repository_1 = require("../../data/repositories/notification.repository");
class NotificationService {
    constructor() {
        this.repo = new notification_repository_1.NotificationRepository();
    }
    async createNotification(data) {
        return this.repo.create(data);
    }
    async getNotifications(params) {
        return this.repo.getUserNotifications(params.userId);
    }
    async markNotificationRead(notificationId) {
        return this.repo.markRead(notificationId);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map