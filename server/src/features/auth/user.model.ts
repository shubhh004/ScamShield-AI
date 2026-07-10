import mongoose, { type Document, type Model, Schema } from 'mongoose';
import { UserRole } from './auth.constants';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  avatar: string | null;
  role: (typeof UserRole)[keyof typeof UserRole];
  isEmailVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  refreshTokenHash: string | null;
}

export type UserDocument = IUser & Document;

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

// email index is created by unique:true on the field; only declare the compound index here
userSchema.index({ isDeleted: 1, createdAt: -1 });

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);
