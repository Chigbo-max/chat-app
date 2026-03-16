import mongoose, { Document, Schema, Types } from "mongoose";

interface Reaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  conversation: Types.ObjectId;
  content?: string;
  mediaUrl?: string;
  reactions: Reaction[];
  readBy: Types.ObjectId[];
  edited: boolean;
  status: "sent" | "delivered" | "read";
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    emoji: String
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },

    content: String,

    mediaUrl: String,

    reactions: [ReactionSchema],

    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    edited: {
      type: Boolean,
      default: false
    },

    deleted: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent"
    }
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });


export default mongoose.model<IMessage>("Message", MessageSchema);