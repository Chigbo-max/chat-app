export interface ConversationDTO {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: {
    id: string;
    username: string;
    avatar?: string;
  }[];
  lastMessage?: {
    id: string;
    content?: string;
    mediaUrl?: string;
    sender: {
      id: string;
      username: string;
    };
    status: "sent" | "delivered" | "read";
    createdAt: Date;
  };
  lastMessageAt?: Date;
  unreadCounts?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}