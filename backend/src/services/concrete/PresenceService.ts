import { UserRepository } from "../../data/repositories/user.repository";
import { IPresenceService } from "../interfaces/IPresenceService";

export class PresenceService implements IPresenceService {

  private repo = new UserRepository();

  async userConnected(userId: string) {
    await this.repo.setOnline(userId);
  }

  async userDisconnected(userId: string) {
    await this.repo.setOffline(userId);
  }
}