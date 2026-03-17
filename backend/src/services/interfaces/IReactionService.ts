export interface IReactionService {
  addReaction(messageId: string, token: string, emoji: string): Promise<any>;
  removeReaction(messageId: string, token: string, emoji: string): Promise<any>;
}