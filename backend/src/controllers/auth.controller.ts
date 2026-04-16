import { Request, Response } from "express";
import { IAuthService } from "../services/interfaces/IAuthService";


export class AuthController {

  constructor(private authService: IAuthService) {}


  
  async register(req: Request, res: Response) {
    try {
      const result = await this.authService.register(req.body);

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
      const result = await this.authService.login(req.body);

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