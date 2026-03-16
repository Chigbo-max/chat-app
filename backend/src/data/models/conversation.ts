import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
    name?: string;
    isGroup: boolean;
    participants: Types.ObjectId[];
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

ConversationSchema.index({ participants: 1 });


export default mongoose.model<IConversation>(
    "Conversation",
    ConversationSchema
);