import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  isGoogleUser?: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: String,

    isOnline: {
      type: Boolean,
      default: false
    },

    isGoogleUser: {
      type: Boolean,
      default: false
    },

    lastSeen: Date
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model<IUser>("User", UserSchema);