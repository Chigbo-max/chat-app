export interface GetUserConversationsDTO {
  cursor?: string;
  limit?: number;
}

export interface AddParticipantDTO {
  userId: string;
}

export interface RemoveParticipantDTO {
  userId: string;
}