export interface CreateConversationDTO {
  name?: string;
  isGroup?: boolean; // default false
  participantIds: string[]; // IDs of participants
}