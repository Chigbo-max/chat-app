import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthService } from "../interfaces/IAuthService";
import { UserRepository } from "../../data/repositories/user.repository";

export class AuthService implements IAuthService {
  private userRepo = new UserRepository();

  async login(data: any) {
    const user = await this.userRepo.findByEmail(data.email);

    if (!user) throw new Error("Invalid credentials");

    if (data.password) {
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) throw new Error("Invalid credentials");
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

    return {
      user,
      accessToken,
      refreshToken: accessToken
    };
  }

  async register(data: any) {
    const hashed = data.password
      ? await bcrypt.hash(data.password, 10)
      : null;

    const user = await this.userRepo.create({
      ...data,
      password: hashed
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

    return {
      user,
      accessToken: token,
      refreshToken: token
    };
  }
}