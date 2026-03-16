import { LoginDTO } from "../../dtos/request/auth/login.dto";
import { RegisterDTO } from "../../dtos/request/auth/register.dto";
import { AuthResponseDTO } from "../../dtos/response/auth/authResponse.dto";

export interface IAuthService {
  login(data: LoginDTO): Promise<AuthResponseDTO>;
  register(data: RegisterDTO): Promise<AuthResponseDTO>;
}