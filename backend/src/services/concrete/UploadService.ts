import { v2 as cloudinary } from "cloudinary";
import { IUploadService } from "../interfaces/IUploadService";

export class UploadService implements IUploadService {

  async uploadFile(file: any): Promise<string> {
    try {
      // Configure cloudinary if not already configured
      if (!cloudinary.config().cloud_name) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: "chat_app"
      });

      return result.secure_url;
    } catch (error) {
      throw new Error("Failed to upload file");
    }
  }
}