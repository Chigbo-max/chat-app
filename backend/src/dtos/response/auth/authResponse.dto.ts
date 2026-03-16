export interface AuthResponseDTO {
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
  };
  accessToken: string;
  refreshToken: string;
}