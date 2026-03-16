export interface IUploadService {
  uploadFile(file: any): Promise<string>;
}