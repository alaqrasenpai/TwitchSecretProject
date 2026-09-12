import type {
  IGameSession,
  ITypeRaceState,
  ITypeRaceWord,
  ITypeRaceRoundWinner,
  IPlayer,
  IGameLog
} from '~/types/game';
import { getRandomWord } from './typeRaceBank';

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // Remove Arabic Tashkeel / Harakat
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel / Kashida
    .replace(/\u0640/g, '')
    // Normalize Alef variations (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbouta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Alif Maqsoora (ى -> ي)
    .replace(/ى/g, 'ي')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ');
}

export function createInitialTypeRaceState(
  targetScore: number = 0,
  totalRounds: number = 7,
  timeLimitSeconds: number = 15,
  language: 'AR' | 'EN' | 'MIXED' = 'AR'
): ITypeRaceState {
  const { word, displayWord } = getRandomWord(language);
  const wordEn = language === 'MIXED' ? (displayWord === word.textAr ? word.textEn : word.textAr) : '';

  return {
    status: 'LOBBY',
    currentRound: 1,
    totalRounds,
    currentWord: displayWord,
    currentWordEn: wordEn,
    category: word.category,
    difficulty: word.difficulty,
    roundStartedAt: null,
    timeRemainingSeconds: timeLimitSeconds,
    timeLimitSeconds,
    fastestTypist: null,
    scores: {},
    roundWinners: [],
    winner: null,
    targetScore,
    languageMode: language
  };
}

export function startTypeRaceRound(
  state: ITypeRaceState,
  language: 'AR' | 'EN' | 'MIXED' = 'AR',
  excludeIds: string[] = []
): void {
  const lang = state.languageMode || language || 'AR';
  const { word, displayWord } = getRandomWord(lang, excludeIds);

  state.status = 'WORD_ACTIVE';
  state.currentWord = displayWord;
  state.currentWordEn = lang === 'MIXED' ? (displayWord === word.textAr ? word.textEn : word.textAr) : '';
  state.category = word.category;
  state.difficulty = word.difficulty;
  state.roundStartedAt = Date.now();
  state.timeRemainingSeconds = state.timeLimitSeconds;
  state.fastestTypist = null;
  state.languageMode = lang;
}

export function submitTypeRaceAttempt(
  state: ITypeRaceState,
  username: string,
  submittedText: string,
  session: IGameSession
): {
  success: boolean;
  isCorrect: boolean;
  timeMs?: number;
  timeFormatted?: string;
  isMatchOver?: boolean;
  winner?: IPlayer | null;
  log?: Partial<IGameLog>;
} {
  if (state.status !== 'WORD_ACTIVE' || !state.roundStartedAt) {
    return { success: false, isCorrect: false };
  }

  const cleanUser = username.toLowerCase().trim();
  let player = session.players.find((p) => p.username.toLowerCase() === cleanUser);

  if (!player) {
    player = {
      id: `p_${cleanUser}_${Date.now()}`,
      number: session.players.length + 1,
      username: cleanUser,
      displayName: username,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
      status: 'ALIVE',
      revivesUsed: 0,
      timesRevived: 0,
      killsCount: 0,
      score: 0,
      joinedAt: new Date().toISOString()
    };
    session.players.push(player);
  }

  const normSubmitted = normalizeText(submittedText);
  const normTargetAr = normalizeText(state.currentWord);
  const normTargetEn = normalizeText(state.currentWordEn || '');

  // Exact match with either Arabic or English version
  const isMatch =
    normSubmitted === normTargetAr ||
    (normTargetEn && normSubmitted === normTargetEn);

  if (!isMatch) {
    return { success: true, isCorrect: false };
  }

  // FIRST TO TYPE CORRECTLY WINS THE ROUND!
  const now = Date.now();
  const timeMs = Math.max(50, now - state.roundStartedAt);
  const timeSeconds = (timeMs / 1000).toFixed(2);
  const timeFormatted = `${timeSeconds}s`;

  state.status = 'ROUND_WON';

  // Increment score
  state.scores[cleanUser] = (state.scores[cleanUser] || 0) + 1;
  player.score = state.scores[cleanUser];
  player.killsCount = (player.killsCount || 0) + 1;

  const roundWinner: ITypeRaceRoundWinner = {
    round: state.currentRound,
    word: state.currentWord,
    username: player.username,
    displayName: player.displayName,
    avatarUrl: player.avatarUrl,
    timeMs,
    timeFormatted
  };

  state.fastestTypist = roundWinner;
  state.roundWinners.push(roundWinner);

  const log: Partial<IGameLog> = {
    id: `type-win-${player.number}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'TYPE_WIN',
    message: `⚡ ${player.displayName} طار بالكلمة [${state.currentWord}] في سرعة قياسية (${timeFormatted})! النتيجة: ${state.scores[cleanUser]} نقطة!`,
    actor: player.displayName
  };

  return {
    success: true,
    isCorrect: true,
    timeMs,
    timeFormatted,
    isMatchOver: false,
    winner: null,
    log
  };
}

export function advanceTypeRaceNextRound(
  state: ITypeRaceState,
  language: 'AR' | 'EN' | 'MIXED' = 'AR',
  players: IPlayer[] = []
): { isMatchOver: boolean; winner: IPlayer | null } {
  // If we reached or exceeded the configured total rounds, finish match!
  if (state.currentRound >= state.totalRounds) {
    state.status = 'MATCH_OVER';
    const sorted = [...players].sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      // Tiebreak by total time in roundWinners (lower time is better)
      const userA = (a.username || '').toLowerCase();
      const userB = (b.username || '').toLowerCase();
      const timeA = state.roundWinners.filter((w) => (w.username || '').toLowerCase() === userA).reduce((s, w) => s + (w.timeMs || 0), 0);
      const timeB = state.roundWinners.filter((w) => (w.username || '').toLowerCase() === userB).reduce((s, w) => s + (w.timeMs || 0), 0);
      return timeA - timeB;
    });
    const winner = sorted.length > 0 && (sorted[0].score || 0) > 0 ? sorted[0] : null;
    state.winner = winner;
    return { isMatchOver: true, winner };
  }

  state.currentRound++;
  const excludeIds = state.roundWinners.map((w) => w.word);
  startTypeRaceRound(state, language, excludeIds);
  return { isMatchOver: false, winner: null };
}
