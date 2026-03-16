export interface IReactionService {
  addReaction(messageId: string, userId: string, emoji: string): Promise<any>;
  removeReaction(messageId: string, userId: string, emoji: string): Promise<any>;
}