export type UserRole = 'streamer' | 'admin';

export interface IUser {
  _id?: string;
  twitchId?: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  role: UserRole;
  isBanned: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  customOverlayToken?: string;
  totalGamesHosted?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  isBanned?: boolean;
}

export interface IJwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  displayName: string;
  iat?: number;
  exp?: number;
}
