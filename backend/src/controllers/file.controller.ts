import { Request, Response } from "express";
import { UploadService } from "../services/concrete/UploadService";

const uploadService = new UploadService();

export class FileController {

  async upload(req: Request, res: Response) {
    try {

      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const url = await uploadService.uploadFile(file.path);

      return res.json({
        success: true,
        url
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

}