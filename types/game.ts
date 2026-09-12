export type GameType = 'ROULETTE' | 'TRIVIA' | 'BOARD_PARTY' | 'HOT_POTATO' | 'GRID_ROYALE' | 'TYPE_RACE' | 'HANGMAN' | 'SUBWAY_RUNNER';

export type GameStatus =
  | 'LOBBY'
  | 'SPINNING'
  | 'WAITING_ACTION'
  | 'RESOLVING'
  | 'PAUSED'
  | 'FINISHED'
  | 'QUESTION_ACTIVE'
  | 'ANSWER_REVEALED'
  | 'ROUND_SUMMARY'
  | 'TEAM_TURN'
  | 'TILE_ACTION'
  | 'MINIGAME'
  | 'ROUND_END'
  | 'MATCH_OVER'
  | 'WORD_ACTIVE'
  | 'ROUND_WON'
  | 'SETTING_WORD'
  | 'GUESSING_ACTIVE'
  | 'ROUND_RESOLVED'
  | 'BOMB_TICKING'
  | 'BOMB_EXPLODED'
  | 'SUBWAY_RUNNING'
  | 'SUBWAY_OBSTACLE'
  | 'SUBWAY_CRASHED';

export type PlayerStatus = 'ALIVE' | 'ELIMINATED' | 'REVIVED';
export type TeamId = 'crimson' | 'cobalt' | 'emerald' | 'amber';
export type MoveDirection = 'up' | 'down' | 'left' | 'right';

export interface IPlayer {
  id: string;
  number: number; // 1-indexed identifier
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: PlayerStatus;
  team?: TeamId; // For Party Board Game mode
  revivesUsed: number; // Max 1 per player
  timesRevived: number; // Max 1 per player
  killsCount: number;
  score?: number; // Score for Trivia / Quiz mode
  correctAnswersCount?: number;
  currentStreak?: number;
  lastAnswerChoice?: number | null; // 0, 1, 2, 3
  joinedAt: Date | string;
}

export interface ITriviaQuestion {
  id: string;
  categoryId: string; // e.g. 'anime_gaming' | 'cinema_tv' | 'general' | 'tech_science' | 'sports' | 'history_geo' | 'islamic_arab'
  question: string;
  questionEn?: string;
  options: [string, string, string, string];
  optionsEn?: [string, string, string, string];
  correctIndex: number; // 0 | 1 | 2 | 3
  category: string;
  categoryEn?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  explanation?: string;
  explanationEn?: string;
}

export interface ITriviaState {
  currentQuestion: ITriviaQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  status: 'LOBBY' | 'QUESTION_ACTIVE' | 'ANSWER_REVEALED' | 'ROUND_SUMMARY';
  votes: Record<string, number>; // username -> choice index (0..3)
  voteCounts: [number, number, number, number]; // [A_count, B_count, C_count, D_count]
  totalVotesCount: number;
  timeRemainingSeconds: number;
  language?: 'AR' | 'EN' | 'BOTH';
}

export type BoardTileType = 'START' | 'COIN_10' | 'COIN_20' | 'TRAP' | 'SHOP' | 'WARP' | 'EVENT';

export interface IBoardTile {
  index: number;
  x: number; // Grid column (0..7)
  y: number; // Grid row (0..4)
  type: BoardTileType;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  descriptionAr: string;
  descriptionEn: string;
  neighbors: Partial<Record<MoveDirection, number>>; // direction -> target tile index
  hasTrophy?: boolean;
}

export interface ITeamState {
  id: TeamId;
  nameAr: string;
  nameEn: string;
  color: string;
  badgeClass: string;
  icon: string;
  pawnIcon: string;
  characterType: 'knight' | 'boxhead' | 'panda' | 'beast';
  coins: number;
  trophies: number;
  tileIndex: number;
  previousTileIndex?: number;
  membersCount: number;
  lastRoll: number | null;
  enabled: boolean;
}

export interface IDirectionChoice {
  teamId: TeamId;
  fromTileIndex: number;
  availableDirections: MoveDirection[];
  votes: Record<string, MoveDirection>; // username -> direction
  voteCounts: Record<MoveDirection, number>;
  timeRemainingSeconds: number;
  remainingSteps: number;
}

export interface IMinigameState {
  type: 'TEAM_TRIVIA' | 'TEAM_ROULETTE' | 'LASER_GRID';
  status: 'ACTIVE' | 'RESOLVING' | 'COMPLETED';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  timeRemainingSeconds: number;
  dangerZones?: number[]; // For laser grid
  triviaQuestion?: ITriviaQuestion | null; // For team trivia
  rouletteState?: {
    spinning: boolean;
    targetTeamId: TeamId | null;
    bountyCoins: number;
    winnerTeamId: TeamId | null;
    duelLog?: string;
  } | null;
  votes: Record<string, any>; // username -> choice
  teamVotes: Record<TeamId, Record<string | number, number>>; // teamId -> choice -> count
  teamScores?: Record<TeamId, number>; // teamId -> score/points
  teamSurvivals?: Record<TeamId, number>; // teamId -> survivors count
  teamRewards: Record<TeamId, number>; // teamId -> bonus coins awarded
  winnerTeamId: TeamId | null;
}

export interface IBoardPartyState {
  status: 'LOBBY' | 'TEAM_TURN' | 'DIRECTION_CHOICE' | 'TILE_ACTION' | 'MINIGAME' | 'ROUND_END' | 'MATCH_OVER';
  activeTeamId: TeamId;
  activeTurnIndex: number; // Index in enabled & active teams
  roundNumber: number;
  maxRounds: number;
  tiles: IBoardTile[];
  teams: Record<TeamId, ITeamState>;
  trophyTileIndex: number;
  trophyPrice: number; // default 30
  lastDiceRoll: number | null;
  remainingSteps: number;
  isRollingDice: boolean;
  directionChoice?: IDirectionChoice | null;
  lastTileEventMessage?: { ar: string; en: string } | null;
  minigameState?: IMinigameState | null;
  mapTheme?: 'winter_outpost' | 'suburbia_town';
  winnerTeamId?: TeamId | null;
}

export interface IGridRoyaleTile {
  id: string; // e.g. 'A1', 'B2', etc.
  label: string; // 'A1'
  row: number; // 0..3
  col: number; // 0..3
  index: number; // 1..16
  status: 'SAFE' | 'WARNING' | 'COLLAPSED';
  maxCapacity: number; // Default 1 or 2
  occupants: string[]; // usernames of players who claimed this spot
}

export interface IGridRoyaleState {
  status: 'LOBBY' | 'WAVE_ACTIVE' | 'WAVE_RESOLVING' | 'MATCH_OVER';
  waveNumber: number;
  maxWaves: number;
  gridSize: number; // 4x4
  tileCapacity: number; // 1
  tiles: IGridRoyaleTile[];
  timeRemainingSeconds: number;
  alivePlayersCount: number;
  eliminatedThisWave: string[];
  safeTilesCount: number;
  winner: IPlayer | null;
}

export interface ITypeRaceWord {
  id: string;
  textAr: string;
  textEn: string;
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ITypeRaceRoundWinner {
  round: number;
  word: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  timeMs: number;
  timeFormatted: string;
}

export interface ITypeRaceState {
  status: 'LOBBY' | 'WORD_ACTIVE' | 'ROUND_WON' | 'MATCH_OVER';
  currentRound: number;
  totalRounds: number;
  currentWord: string;
  currentWordEn?: string;
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  roundStartedAt: number | null;
  timeRemainingSeconds: number;
  timeLimitSeconds: number;
  fastestTypist: ITypeRaceRoundWinner | null;
  scores: Record<string, number>; // username -> points won
  roundWinners: ITypeRaceRoundWinner[];
  winner: IPlayer | null;
  targetScore: number;
  languageMode?: 'AR' | 'EN' | 'MIXED';
}

export type HangmanLetterStatus = 'CORRECT' | 'WRONG_POSITION' | 'ABSENT';

export interface IHangmanLetterFeedback {
  char: string;
  status: HangmanLetterStatus;
}

export interface IHangmanGuess {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  guessWord: string;
  feedback: IHangmanLetterFeedback[];
  isExactMatch: boolean;
  timestamp: string;
  attemptNumber: number; // 1..5
}

export interface IHangmanPlayerProgress {
  username: string;
  displayName: string;
  avatarUrl?: string;
  attemptsLeft: number; // starts at 5
  attemptsUsed: number;
  guesses: IHangmanGuess[];
  hasWon: boolean;
  wonAt?: string;
  timeTakenMs?: number;
}

export interface IHangmanRoundWinner {
  round: number;
  word: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  attemptsUsed: number;
  pointsAwarded: number;
}

export interface IHangmanState {
  status: 'LOBBY' | 'SETTING_WORD' | 'GUESSING_ACTIVE' | 'ROUND_RESOLVED' | 'MATCH_OVER';
  secretWord?: string; // Stored securely on server, stripped for overlay/clients during guessing
  wordLength: number;
  revealedMask: string[]; // e.g. ['ف', '_', 'ر', '_', '_']
  category?: string;
  hint?: string;
  maxAttemptsPerPlayer: number; // default 5
  timeLimitSeconds: number; // default 60
  roundStartedAt: number | null;
  timeRemainingSeconds: number;
  playersProgress: Record<string, IHangmanPlayerProgress>;
  recentGuesses: IHangmanGuess[];
  winner: IPlayer | null;
  roundNumber: number;
  currentRound: number;
  totalRounds: number;
  scores: Record<string, number>;
  roundWinners: IHangmanRoundWinner[];
}

export interface IHotPotatoPass {
  id: string;
  fromNumber: number;
  fromUsername: string;
  fromDisplayName: string;
  toNumber: number;
  toUsername: string;
  toDisplayName: string;
  timestamp: string;
}

export interface IHotPotatoState {
  status: 'LOBBY' | 'BOMB_TICKING' | 'BOMB_EXPLODED' | 'ROUND_SUMMARY' | 'MATCH_OVER';
  currentHolderNumber: number | null;
  currentHolderUsername: string | null;
  currentHolderDisplayName: string | null;
  previousHolderNumber: number | null;
  fuseTotalDurationSeconds: number;
  fuseEndsAt: number; // ms epoch timestamp
  fuseRemainingSeconds: number;
  fuseDangerLevel: 'COOL' | 'WARM' | 'CRITICAL';
  roundNumber: number;
  eliminatedPlayer: IPlayer | null;
  winner: IPlayer | null;
  totalPassesCount: number;
  recentPasses: IHotPotatoPass[];
  passCooldownUntil: number; // ms timestamp to prevent ping-pong deflection
}

export type SubwayLane = 'LEFT' | 'MIDDLE' | 'RIGHT';
export type SubwayAction = 'JUMP' | 'DUCK' | 'LEFT' | 'RIGHT';

export interface ISubwayObstacle {
  id: string;
  type: 'LOW_BARRIER' | 'HIGH_BARRIER' | 'TRAIN_LEFT' | 'TRAIN_RIGHT' | 'TRAIN_MIDDLE' | 'ROCK';
  requiredAction: SubwayAction;
  labelAr: string;
  labelEn: string;
  timeLimitSeconds: number;
  deadline: number;
  lane: SubwayLane;
}

export interface ISubwayContender {
  username: string;
  displayName: string;
  avatarUrl?: string;
  hearts: number; // starts at 3
  status: 'ALIVE' | 'ELIMINATED';
  score: number;
  successfulDodges: number;
  lastReactionMs?: number;
}

export interface ISubwayRunnerState {
  status: 'LOBBY' | 'RUNNING' | 'OBSTACLE_APPROACHING' | 'ROUND_CLEAR' | 'MATCH_OVER';
  currentRound: number;
  totalRounds: number;
  obstaclesInRound: number;
  targetObstaclesPerRound: number;
  distanceMeters: number;
  speedLevel: number; // 1..10 (increases each round!)
  runnerLane: SubwayLane;
  runnerAnimation: 'RUN' | 'JUMP' | 'DUCK' | 'SWITCH_LEFT' | 'SWITCH_RIGHT' | 'CRASH';
  currentObstacle: ISubwayObstacle | null;
  obstaclesPassedCount: number;
  contenders: Record<string, ISubwayContender>;
  survivorsCount: number;
  winner: IPlayer | null;
  recentEvents: Array<{ id: string; text: string; type: 'DODGE' | 'CRASH' | 'SPEED_UP' | 'ELIMINATED' | 'ROUND_CLEAR' }>;
}

export interface ICustomCommands {
  join: string[];
  kill: string[];
  revive: string[];
  pass?: string[];
  roll?: string[];
  direction?: string[];
  zone?: string[];
  subway?: string[];
}

export interface IGameSettings {
  maxPlayers: number;
  turnTimeLimitSeconds: number; // e.g. 15
  subOnly: boolean;
  allowRevives: boolean;
  maxRevivesPerGame: number;
  autoSpinWheel: boolean;
  soundEffectsEnabled: boolean;
  triviaTimeLimitSeconds?: number; // 0 = unlimited / no timeout
  triviaTotalQuestions?: number;
  triviaCategory?: string;
  triviaCategories?: string[]; // Multiple selected categories
  triviaLanguage?: 'AR' | 'EN' | 'BOTH'; // default 'AR'
  boardMaxRounds?: number; // default 5
  boardTurnTimerSeconds?: number; // default 15
  boardMap?: 'winter_outpost' | 'suburbia_town';
  gridWaveTimeSeconds?: number; // default 10
  gridTileCapacity?: number; // default 1
  typeRaceTimeLimitSeconds?: number; // default 15
  typeRaceTotalRounds?: number; // default 7
  typeRaceTargetScore?: number; // default 3
  typeRaceLanguage?: 'AR' | 'EN' | 'MIXED'; // default 'AR'
  hangmanTimeLimitSeconds?: number; // default 60
  hangmanMaxAttempts?: number; // default 5
  hangmanTotalRounds?: number; // default 5
  hangmanSecretWord?: string;
  hangmanCategory?: string;
  hangmanHint?: string;
  hotPotatoMinFuseSeconds?: number; // default 15
  hotPotatoMaxFuseSeconds?: number; // default 35
  hotPotatoMode?: 'SECRET_FUSE' | 'VISIBLE_TIMER'; // default 'SECRET_FUSE'
  subwayTotalRounds?: number; // default 5
  subwayObstaclesPerRound?: number; // default 4
  customCommands?: ICustomCommands;
}

export interface IGameLog {
  id: string;
  timestamp: Date | string;
  type:
    | 'INFO'
    | 'JOIN'
    | 'SPIN'
    | 'TARGET'
    | 'KILL'
    | 'REVIVE'
    | 'TIMEOUT'
    | 'WIN'
    | 'TRIVIA_ANSWER'
    | 'TRIVIA_REVEAL'
    | 'BOARD_ROLL'
    | 'BOARD_RELIC'
    | 'BOARD_TRAP'
    | 'BOARD_COIN'
    | 'MINIGAME_WIN'
    | 'GRID_MOVE'
    | 'GRID_COLLAPSE'
    | 'TYPE_WIN'
    | 'TYPE_TIMEOUT'
    | 'HANGMAN_GUESS'
    | 'HANGMAN_WIN'
    | 'HANGMAN_TIMEOUT'
    | 'BOMB_PASS'
    | 'BOMB_EXPLODE'
    | 'SUBWAY_DODGE'
    | 'SUBWAY_CRASH'
    | 'SUBWAY_SPEED_UP';
  message: string;
  actor?: string;
  target?: string;
  teamId?: TeamId;
}

export interface IGameSession {
  _id?: string;
  sessionId: string;
  streamerId: string;
  streamerUsername: string;
  isBroadcasterVerified?: boolean;
  verificationCode?: string;
  controllerSecret?: string;
  gameType: GameType;
  status: GameStatus;
  roundNumber: number;
  overlayToken: string;
  players: IPlayer[];
  activePlayerNumber: number | null;
  targetPlayerNumber: number | null;
  timerEndsAt: Date | string | null;
  turnDuration: number;
  winner: IPlayer | null;
  settings: IGameSettings;
  triviaState?: ITriviaState | null;
  boardPartyState?: IBoardPartyState | null;
  gridRoyaleState?: IGridRoyaleState | null;
  typeRaceState?: ITypeRaceState | null;
  hangmanState?: IHangmanState | null;
  hotPotatoState?: IHotPotatoState | null;
  subwayRunnerState?: ISubwayRunnerState | null;
  logs: IGameLog[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type GameActionType =
  | 'START_LOBBY'
  | 'LOCK_ENTRIES'
  | 'SPIN_WHEEL'
  | 'ACTION_KILL'
  | 'ACTION_REVIVE'
  | 'ACTION_PASS'
  | 'TIMEOUT_PASS'
  | 'PAUSE_GAME'
  | 'RESUME_GAME'
  | 'RESET_GAME'
  | 'END_GAME'
  | 'UPDATE_SETTINGS'
  | 'KICK_PLAYER'
  | 'FORCE_WINNER'
  | 'VERIFY_BROADCASTER'
  | 'TRIVIA_START_QUIZ'
  | 'TRIVIA_NEXT_QUESTION'
  | 'TRIVIA_REVEAL_ANSWER'
  | 'TRIVIA_SUBMIT_VOTE'
  | 'TRIVIA_SET_LANGUAGE'
  | 'TRIVIA_RESTART'
  | 'BOARD_START_GAME'
  | 'BOARD_ROLL_DICE'
  | 'BOARD_NEXT_TURN'
  | 'BOARD_TRIGGER_MINIGAME'
  | 'BOARD_SUBMIT_MINIGAME_ACTION'
  | 'BOARD_RESOLVE_MINIGAME'
  | 'BOARD_SET_MAP'
  | 'BOARD_RESTART'
  | 'GRID_ROYALE_START'
  | 'GRID_ROYALE_NEXT_WAVE'
  | 'GRID_ROYALE_MOVE'
  | 'GRID_ROYALE_RESOLVE_WAVE'
  | 'GRID_ROYALE_RESTART'
  | 'TYPE_RACE_START'
  | 'TYPE_RACE_SUBMIT_WORD'
  | 'TYPE_RACE_NEXT_ROUND'
  | 'TYPE_RACE_TIMEOUT'
  | 'TYPE_RACE_SET_LANGUAGE'
  | 'TYPE_RACE_RESTART'
  | 'HANGMAN_START_LOBBY'
  | 'HANGMAN_SET_SECRET_WORD'
  | 'HANGMAN_SUBMIT_GUESS'
  | 'HANGMAN_REVEAL_HINT'
  | 'HANGMAN_RESOLVE_ROUND'
  | 'HANGMAN_NEXT_ROUND'
  | 'HANGMAN_RESTART'
  | 'HOT_POTATO_START'
  | 'HOT_POTATO_PASS'
  | 'HOT_POTATO_RESOLVE_DETONATION'
  | 'HOT_POTATO_NEXT_ROUND'
  | 'HOT_POTATO_RESTART'
  | 'SUBWAY_START'
  | 'SUBWAY_SUBMIT_ACTION'
  | 'SUBWAY_RESOLVE_OBSTACLE'
  | 'SUBWAY_NEXT_ROUND'
  | 'SUBWAY_RESTART';

export interface IGameActionPayload {
  action: GameActionType;
  actorUsername?: string;
  targetNumber?: number;
  settings?: Partial<IGameSettings>;
  forcePlayerNumber?: number;
  choiceIndex?: number; // For TRIVIA_SUBMIT_VOTE (0, 1, 2, 3)
  zoneIndex?: number; // For BOARD_SUBMIT_MINIGAME_ACTION (1, 2, 3, 4)
  forcedRoll?: number; // For manual roll testing (1..6)
  mapTheme?: 'winter_outpost' | 'suburbia_town';
  targetTile?: string; // For GRID_ROYALE_MOVE (e.g. 'A1', 'B2', '12')
  submittedWord?: string; // For TYPE_RACE_SUBMIT_WORD
  secretWord?: string; // For HANGMAN_SET_SECRET_WORD
  guessWord?: string; // For HANGMAN_SUBMIT_GUESS
  hint?: string; // For HANGMAN_SET_SECRET_WORD / HANGMAN_REVEAL_HINT
  category?: string; // For HANGMAN_SET_SECRET_WORD
  passTarget?: string | number; // For HOT_POTATO_PASS (e.g. 3 or 'Ahmed')
  subwayAction?: SubwayAction; // For SUBWAY_SUBMIT_ACTION
  languageMode?: 'AR' | 'EN' | 'MIXED'; // For TYPE_RACE_SET_LANGUAGE
  triviaLanguage?: 'AR' | 'EN' | 'BOTH'; // For TRIVIA_SET_LANGUAGE
  totalRounds?: number; // For TYPE_RACE_START / HANGMAN_START_LOBBY
}
