import mongoose, { Schema, Document } from 'mongoose';
import type { IUser } from '~/types/auth';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    twitchId: { type: String, sparse: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, enum: ['streamer', 'admin'], default: 'streamer', index: true },
    isBanned: { type: Boolean, default: false },
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    tokenExpiresAt: { type: Date },
    customOverlayToken: { type: String, default: '' },
    totalGamesHosted: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
