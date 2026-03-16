export interface MessageDTO {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  content?: string;
  mediaUrl?: string;
  reactions: {
    userId: string;
    emoji: string;
  }[];
  readBy: string[];
  edited: boolean;
  deleted: boolean;
  status: "sent" | "delivered" | "read";
  createdAt: Date;
  updatedAt: Date;
}