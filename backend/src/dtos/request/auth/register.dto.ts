export interface RegisterDTO {
  username: string;
  email: string;
  password?: string; // optional if using Google SSO
  googleToken?: string; // optional for Google SSO
  avatar?: string;
}