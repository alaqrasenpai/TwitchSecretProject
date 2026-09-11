import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLogDocument extends Document {
  streamerId?: string;
  streamerUsername?: string;
  sessionId?: string;
  eventType: string;
  details: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    streamerId: { type: String, index: true },
    streamerUsername: { type: String, index: true },
    sessionId: { type: String, index: true },
    eventType: { type: String, required: true, index: true },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);
