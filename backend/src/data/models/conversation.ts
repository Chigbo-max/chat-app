import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
    name?: string;
    isGroup: boolean;
    participants: Types.ObjectId[];
    admins: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    lastMessageAt?: Date;
    unreadCounts?: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        name: String,

        isGroup: {
            type: Boolean,
            default: false
        },

        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message"
        },

        lastMessageAt: Date,

        unreadCounts: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    { timestamps: true }
);

ConversationSchema.set("toJSON", {
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });



ConversationSchema.index({ participants: 1 });


export default mongoose.model<IConversation>(
    "Conversation",
    ConversationSchema
);