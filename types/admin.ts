export interface IPlatformStats {
  totalStreamers: number;
  activeSessions: number;
  totalMatchesPlayed: number;
  totalUniqueParticipants: number;
  chatCommandsProcessed: number;
  systemUptimeSeconds: number;
}

export interface IStreamerManagementItem {
  id: string;
  twitchId?: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  isBanned: boolean;
  totalGamesHosted: number;
  createdAt: string;
  lastActive?: string;
}

export interface IGlobalConfig {
  maintenanceMode: boolean;
  allowedGameTypes: string[];
  maxLobbyCapacity: number;
  defaultTurnTimeSeconds: number;
}
