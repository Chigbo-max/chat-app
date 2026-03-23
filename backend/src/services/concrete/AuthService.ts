import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthService } from "../interfaces/IAuthService";
import { UserRepository } from "../../data/repositories/user.repository";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService implements IAuthService {
  private userRepo = new UserRepository();

  async login(data: any) {
    try {
      let user;
  
      if (data.googleToken) {
        const ticket = await client.verifyIdToken({
          idToken: data.googleToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
  
        const payload = ticket.getPayload();
  
        if (!payload || !payload.email)
          throw new Error("Google authentication failed");
         
        user = await this.userRepo.findByEmail(payload.email);
  
        if (!user) throw new Error("User not found");
      } else {

        user = await this.userRepo.findByEmail(data.email);
  
        if (!user) throw new Error("Invalid credentials");
  
        const valid = await bcrypt.compare(data.password, user.password);
        if (!valid) throw new Error("Invalid credentials");
      }
  
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
  
      await this.userRepo.setOnline(user.id);
  
      return {
        user,
        accessToken,
        refreshToken: accessToken,
      };
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  }



  async register(data: any) {

    try{
    let userData = { ...data };

    if (data.googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: data.googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email)
        throw new Error("Google authentication failed");

      userData = {
        email: payload.email,
        username: payload.name,
        avatar: payload.picture,
        isGoogleUser: true,
        password: null,
      };
    }

    let user = await this.userRepo.findByEmail(userData.email);
    if (!user) {
      const hashed = userData.password
        ? await bcrypt.hash(userData.password, 10)
        : null;

      user = await this.userRepo.create({
        ...userData,
        password: hashed,
      });
    }else{
      throw new Error("User already exists, please login instead");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

    return {
      user,
      accessToken: token,
      refreshToken: token,
    };
  }
    catch(error: any){
      throw new Error(error.message || "Registration failed");
    }
  }
}
