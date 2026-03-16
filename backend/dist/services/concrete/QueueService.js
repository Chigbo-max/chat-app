"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
class QueueService {
    async enqueueNotification(data) {
        console.log("Queue notification", data);
    }
    async enqueueMessageEvent(data) {
        console.log("Queue message event", data);
    }
}
exports.QueueService = QueueService;
//# sourceMappingURL=QueueService.js.map