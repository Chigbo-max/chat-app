"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const notification_1 = __importDefault(require("../models/notification"));
class NotificationRepository {
    async create(data) {
        return notification_1.default.create(data);
    }
    async getUserNotifications(userId) {
        return notification_1.default.find({ user: userId })
            .sort({ createdAt: -1 });
    }
    async markRead(notificationId) {
        return notification_1.default.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=notification.repository.js.map