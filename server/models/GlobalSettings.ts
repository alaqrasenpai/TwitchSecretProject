import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalSettingsDocument extends Document {
  key: string;
  maintenanceMode: boolean;
  allowedGameTypes: string[];
  maxLobbyCapacity: number;
  defaultTurnTimeSeconds: number;
  updatedAt: Date;
}

const GlobalSettingsSchema = new Schema<IGlobalSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'global_config' },
    maintenanceMode: { type: Boolean, default: false },
    allowedGameTypes: { type: [String], default: ['ROULETTE', 'HOT_POTATO', 'GRID_ROYALE'] },
    maxLobbyCapacity: { type: Number, default: 50 },
    defaultTurnTimeSeconds: { type: Number, default: 15 }
  },
  {
    timestamps: true
  }
);

export const GlobalSettings =
  mongoose.models.GlobalSettings ||
  mongoose.model<IGlobalSettingsDocument>('GlobalSettings', GlobalSettingsSchema);
