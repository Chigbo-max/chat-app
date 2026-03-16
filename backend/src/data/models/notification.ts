import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String
    },

    message: {
      type: String
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: { updatedAt: false } }
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);