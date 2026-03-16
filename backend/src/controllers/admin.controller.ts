import { Request, Response } from "express";
import User from "../data/models/user";
import Conversation from "../data/models/conversation";

export class AdminController {

  async getUsers(req: Request, res: Response) {
    try {

      const users = await User.find().sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: users
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }

  async getConversations(req: Request, res: Response) {
    try {

      const conversations = await Conversation
        .find()
        .populate("participants")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: conversations
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }

}