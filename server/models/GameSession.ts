import mongoose, { Schema, Document } from 'mongoose';
import type { IGameSession, IPlayer, IGameLog } from '~/types/game';

export interface IGameSessionDocument extends Omit<IGameSession, '_id'>, Document {}

const PlayerSchema = new Schema<IPlayer>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    status: { type: String, enum: ['ALIVE', 'ELIMINATED', 'REVIVED'], default: 'ALIVE' },
    revivesUsed: { type: Number, default: 0 },
    timesRevived: { type: Number, default: 0 },
    killsCount: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const GameLogSchema = new Schema<IGameLog>(
  {
    id: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, required: true },
    message: { type: String, required: true },
    actor: { type: String },
    target: { type: String }
  },
  { _id: false }
);

const GameSessionSchema = new Schema<IGameSessionDocument>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    streamerId: { type: String, required: true, index: true },
    streamerUsername: { type: String, required: true },
    gameType: { type: String, enum: ['ROULETTE', 'HOT_POTATO', 'GRID_ROYALE'], default: 'ROULETTE' },
    status: {
      type: String,
      enum: ['LOBBY', 'SPINNING', 'WAITING_ACTION', 'RESOLVING', 'PAUSED', 'FINISHED'],
      default: 'LOBBY',
      index: true
    },
    roundNumber: { type: Number, default: 1 },
    overlayToken: { type: String, required: true, unique: true, index: true },
    players: [PlayerSchema],
    activePlayerNumber: { type: Number, default: null },
    targetPlayerNumber: { type: Number, default: null },
    timerEndsAt: { type: Date, default: null },
    turnDuration: { type: Number, default: 15 },
    winner: { type: PlayerSchema, default: null },
    settings: {
      maxPlayers: { type: Number, default: 30 },
      turnTimeLimitSeconds: { type: Number, default: 15 },
      subOnly: { type: Boolean, default: false },
      allowRevives: { type: Boolean, default: true },
      maxRevivesPerGame: { type: Number, default: 1 },
      autoSpinWheel: { type: Boolean, default: false },
      soundEffectsEnabled: { type: Boolean, default: true },
      customCommands: {
        join: { type: [String], default: ['!join', '!دخول', '!انضمام', '!شارك'] },
        kill: { type: [String], default: ['!kill', '!قتل', '!استبعاد'] },
        revive: { type: [String], default: ['!revive', '!انعاش', '!إنعاش', '!احياء'] }
      }
    },
    logs: [GameLogSchema]
  },
  {
    timestamps: true
  }
);

export const GameSession = mongoose.models.GameSession || mongoose.model<IGameSessionDocument>('GameSession', GameSessionSchema);
