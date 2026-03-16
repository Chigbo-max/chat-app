import { Request, Response } from "express";
import { NotificationService } from "../services/concrete/NotificationService";

const notificationService = new NotificationService();

export class NotificationController {

  async getUserNotifications(req: Request, res: Response) {
    try {

      const { userId } = req.params;
      const { cursor, limit } = req.query;

      const notifications = await notificationService.getNotifications({
        userId,
        cursor: cursor as string,
        limit: Number(limit) || 20
      });

      return res.json({
        success: true,
        data: notifications
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }

  async markRead(req: Request, res: Response) {
    try {

      const { notificationId } = req.params;

      const notification = await notificationService.markNotificationRead(notificationId);

      return res.json({
        success: true,
        data: notification
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }

}