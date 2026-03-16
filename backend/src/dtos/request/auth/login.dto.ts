export interface LoginDTO {
  email: string;
  password?: string; // optional if using Google SSO
  googleToken?: string; // optional for Google SSO
}