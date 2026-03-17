import { IResolvers } from "@graphql-tools/utils";
import { AuthResponseDTO } from "../../dtos/response/auth/authResponse.dto";
import { LoginDTO } from "../../dtos/request/auth/login.dto";
import { RegisterDTO } from "../../dtos/request/auth/register.dto";
import { AuthService } from "../../services/concrete/AuthService";

const authService = new AuthService();

export const userResolver: IResolvers = {

  User: {
    id: (parent: any) => {
      if (parent._id) return parent._id.toString();
      if (parent.id) return parent.id.toString();
      return null;
    }
  },
  
  Mutation: {
    login: async (_parent, { input }: { input: LoginDTO }): Promise<AuthResponseDTO> => {
      return authService.login(input);
    },
    register: async (_parent, { input }: { input: RegisterDTO }): Promise<AuthResponseDTO> => {
      return authService.register(input);
    }
  }
};