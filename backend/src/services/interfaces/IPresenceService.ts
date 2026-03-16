export interface IPresenceService {
  userConnected(userId: string): Promise<void>;
  userDisconnected(userId: string): Promise<void>;
}