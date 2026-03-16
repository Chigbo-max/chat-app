import { Request, Response } from "express";
import { AuthService } from "../services/concrete/AuthService";

const authService = new AuthService();

export class AuthController {

  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);

      return res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

}