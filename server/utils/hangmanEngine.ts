import type {
  IGameSession,
  IHangmanState,
  IHangmanGuess,
  IHangmanLetterFeedback,
  IHangmanPlayerProgress,
  IPlayer,
  IGameLog
} from '~/types/game';

export function normalizeWord(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Tashkeel
    .replace(/\u0640/g, '') // Remove Tatweel
    .replace(/[أإآٱ]/g, 'ا') // Normalize Alef
    .replace(/ة/g, 'ه') // Normalize Taa Marbouta
    .replace(/ى/g, 'ي') // Normalize Alif Maqsoora
    .replace(/\s+/g, ' ');
}

export function createInitialHangmanState(
  timeLimitSeconds: number = 60,
  maxAttempts: number = 5,
  totalRounds: number = 5
): IHangmanState {
  return {
    status: 'LOBBY',
    secretWord: '',
    wordLength: 0,
    revealedMask: [],
    category: '',
    hint: '',
    maxAttemptsPerPlayer: maxAttempts,
    timeLimitSeconds,
    roundStartedAt: null,
    timeRemainingSeconds: timeLimitSeconds,
    playersProgress: {},
    recentGuesses: [],
    winner: null,
    roundNumber: 1,
    currentRound: 1,
    totalRounds: totalRounds || 5,
    scores: {},
    roundWinners: []
  };
}

export function setHangmanSecretWord(
  state: IHangmanState,
  rawSecretWord: string,
  category: string = 'عام',
  hint: string = '',
  timeLimit: number = 60
): void {
  const cleanWord = rawSecretWord.trim();
  const normalized = normalizeWord(cleanWord);
  const chars = Array.from(normalized);

  state.secretWord = cleanWord;
  state.wordLength = chars.length;
  // Initialize mask with spaces preserved or underscores
  state.revealedMask = chars.map((c) => (c === ' ' ? ' ' : '_'));
  state.category = category || 'عام';
  state.hint = hint || '';
  state.timeLimitSeconds = timeLimit;
  state.timeRemainingSeconds = timeLimit;
  state.roundStartedAt = Date.now();
  state.status = 'GUESSING_ACTIVE';
  state.playersProgress = {};
  state.recentGuesses = [];
  state.winner = null;
}

export function evaluateGuessFeedback(
  guessWord: string,
  secretWord: string
): { feedback: IHangmanLetterFeedback[]; isExactMatch: boolean } {
  const normGuess = normalizeWord(guessWord);
  const normSecret = normalizeWord(secretWord);

  const guessChars = Array.from(normGuess);
  const secretChars = Array.from(normSecret);

  const isExactMatch = normGuess === normSecret;

  // Track remaining letters in secret word for correct yellow/green letter counts
  const secretLetterCounts: Record<string, number> = {};
  secretChars.forEach((c) => {
    secretLetterCounts[c] = (secretLetterCounts[c] || 0) + 1;
  });

  const feedback: IHangmanLetterFeedback[] = [];

  // Pass 1: find exact matches (Green / CORRECT)
  for (let i = 0; i < guessChars.length; i++) {
    const char = guessChars[i];
    if (i < secretChars.length && char === secretChars[i]) {
      feedback.push({ char, status: 'CORRECT' });
      secretLetterCounts[char] = (secretLetterCounts[char] || 1) - 1;
    } else {
      // Placeholder for pass 2
      feedback.push({ char, status: 'ABSENT' });
    }
  }

  // Pass 2: find wrong position matches (Yellow / WRONG_POSITION)
  for (let i = 0; i < guessChars.length; i++) {
    if (feedback[i].status === 'CORRECT') continue;
    const char = guessChars[i];
    if ((secretLetterCounts[char] || 0) > 0) {
      feedback[i].status = 'WRONG_POSITION';
      secretLetterCounts[char]--;
    } else {
      feedback[i].status = 'ABSENT';
    }
  }

  return { feedback, isExactMatch };
}

export function submitHangmanGuess(
  state: IHangmanState,
  username: string,
  rawGuess: string,
  session: IGameSession
): {
  success: boolean;
  messageAr: string;
  messageEn: string;
  guess?: IHangmanGuess;
  isExactMatch?: boolean;
  winner?: IPlayer | null;
  log?: Partial<IGameLog>;
} {
  if (state.status !== 'GUESSING_ACTIVE') {
    return {
      success: false,
      messageAr: 'تحدي الكلمة غير نشط حالياً!',
      messageEn: 'Word challenge is not currently active!'
    };
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

  // Initialize player progress if not present
  if (!state.playersProgress[cleanUser]) {
    state.playersProgress[cleanUser] = {
      username: player.username,
      displayName: player.displayName,
      avatarUrl: player.avatarUrl,
      attemptsLeft: state.maxAttemptsPerPlayer || 5,
      attemptsUsed: 0,
      guesses: [],
      hasWon: false
    };
  }

  const progress = state.playersProgress[cleanUser];

  if (progress.hasWon) {
    return {
      success: false,
      messageAr: 'لقد قمت بحزر الكلمة بالفعل بنجاح!',
      messageEn: 'You already guessed the word successfully!'
    };
  }

  if (progress.attemptsLeft <= 0) {
    return {
      success: false,
      messageAr: `❌ استنفذت جميع محاولاتك الـ 5 لهذه الجولة! انتظر كشف الكلمة.`,
      messageEn: `❌ You exhausted all 5 attempts for this round!`
    };
  }

  const cleanGuess = rawGuess.trim().replace(/^(!guess|!تخمين|!احزر|!كلمة)\s*/i, '');
  if (!cleanGuess) {
    return {
      success: false,
      messageAr: 'الرجاء كتابة كلمة التخمين!',
      messageEn: 'Please provide a guess word!'
    };
  }

  const { feedback, isExactMatch } = evaluateGuessFeedback(cleanGuess, state.secretWord || '');

  progress.attemptsUsed++;
  progress.attemptsLeft--;

  const guessRecord: IHangmanGuess = {
    id: `hm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    username: player.username,
    displayName: player.displayName,
    avatarUrl: player.avatarUrl,
    guessWord: cleanGuess,
    feedback,
    isExactMatch,
    timestamp: new Date().toISOString(),
    attemptNumber: progress.attemptsUsed
  };

  progress.guesses.push(guessRecord);
  state.recentGuesses.unshift(guessRecord);
  if (state.recentGuesses.length > 25) {
    state.recentGuesses.pop();
  }

  // Update revealed mask for any correct letters in position
  const normSecretChars = Array.from(normalizeWord(state.secretWord || ''));
  const normGuessChars = Array.from(normalizeWord(cleanGuess));
  for (let i = 0; i < Math.min(normSecretChars.length, normGuessChars.length); i++) {
    if (normGuessChars[i] === normSecretChars[i]) {
      state.revealedMask[i] = Array.from(state.secretWord || '')[i] || normSecretChars[i];
    }
  }

  let winner: IPlayer | null = null;
  let log: Partial<IGameLog> | undefined;

  if (isExactMatch) {
    progress.hasWon = true;
    progress.wonAt = new Date().toISOString();
    winner = player;
    state.winner = player;

    // Fully reveal the word in mask
    state.revealedMask = Array.from(state.secretWord || '');

    // Award points based on attempts used (1st try = 1000pts, 2nd = 850, 3rd = 700, 4th = 550, 5th = 400)
    const pointsAwarded = Math.max(200, 1000 - (progress.attemptsUsed - 1) * 150);
    if (!state.scores) state.scores = {};
    state.scores[cleanUser] = (state.scores[cleanUser] || 0) + pointsAwarded;
    player.score = state.scores[cleanUser];
    player.killsCount = (player.killsCount || 0) + 1;

    // Track round winner
    if (!state.roundWinners) state.roundWinners = [];
    state.roundWinners.push({
      round: state.currentRound || 1,
      word: state.secretWord || '',
      username: player.username,
      displayName: player.displayName,
      avatarUrl: player.avatarUrl,
      attemptsUsed: progress.attemptsUsed,
      pointsAwarded
    });

    const isLastRound = (state.currentRound || 1) >= (state.totalRounds || 5);
    if (isLastRound) {
      state.status = 'MATCH_OVER';
      session.status = 'FINISHED';
      session.timerEndsAt = null;

      // Overall winner is player with the highest total score
      let topPlayer = player;
      let topScore = -1;
      for (const p of session.players) {
        const sc = state.scores[p.username.toLowerCase()] || 0;
        if (sc > topScore) {
          topScore = sc;
          topPlayer = p;
        }
      }
      session.winner = topPlayer;
      state.winner = topPlayer;
    } else {
      state.status = 'ROUND_RESOLVED';
      session.status = 'ROUND_RESOLVED';
      session.timerEndsAt = null;
    }

    log = {
      id: `hm-win-${player.number}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'HANGMAN_WIN',
      message: `🎉 كفووو! ${player.displayName} حزر الكلمة المخفية [${state.secretWord}] من المحاولة رقم (${progress.attemptsUsed}/5) ونال ${pointsAwarded} نقطة!`,
      actor: player.displayName
    };

    return {
      success: true,
      messageAr: `🎉 مبروك! حزرت الكلمة بالكامل وحصلت على ${pointsAwarded} نقطة!`,
      messageEn: `🎉 Congrats! You guessed the entire word and earned ${pointsAwarded} points!`,
      guess: guessRecord,
      isExactMatch: true,
      winner,
      log
    };
  }

  log = {
    id: `hm-guess-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'HANGMAN_GUESS',
    message: `🔍 خمن ${player.displayName} الكلمة [${cleanGuess}] (المحاولة ${progress.attemptsUsed}/5)`,
    actor: player.displayName
  };

  return {
    success: true,
    messageAr: `المحاولة (${progress.attemptsUsed}/5): تم فحص الكلمة وإظهار الحروف`,
    messageEn: `Attempt (${progress.attemptsUsed}/5): Letter feedback evaluated`,
    guess: guessRecord,
    isExactMatch: false,
    log
  };
}

export function resolveHangmanRound(
  state: IHangmanState,
  session: IGameSession
): { revealedWord: string; winner: IPlayer | null; log: Partial<IGameLog> } {
  state.revealedMask = Array.from(state.secretWord || '');
  session.timerEndsAt = null;

  const winner = state.winner || null;
  const isLastRound = (state.currentRound || 1) >= (state.totalRounds || 5);

  if (isLastRound) {
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';

    let topPlayer: IPlayer | null = null;
    let topScore = 0;
    for (const p of session.players) {
      const sc = (state.scores && state.scores[p.username.toLowerCase()]) || 0;
      if (sc > topScore) {
        topScore = sc;
        topPlayer = p;
      }
    }
    session.winner = topPlayer || winner;
    state.winner = topPlayer || winner;
  } else {
    state.status = 'ROUND_RESOLVED';
    session.status = 'ROUND_RESOLVED';
  }

  const log: Partial<IGameLog> = {
    id: `hm-reveal-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: winner
      ? `👑 انتهت الجولة ${state.currentRound || 1} بفوز ${winner.displayName}! الكلمة المخفية كانت: [${state.secretWord}]`
      : `⌛ انتهى وقت الجولة ${state.currentRound || 1}! الكلمة المخفية كانت: [${state.secretWord}]`
  };

  return {
    revealedWord: state.secretWord || '',
    winner,
    log
  };
}

export function advanceHangmanNextRound(
  session: IGameSession,
  nextSecretWord?: string,
  category?: string,
  hint?: string
): void {
  const state = session.hangmanState;
  if (!state) return;

  if ((state.currentRound || 1) >= (state.totalRounds || 5)) {
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';
    session.timerEndsAt = null;
    return;
  }

  state.currentRound = (state.currentRound || 1) + 1;
  state.roundNumber = state.currentRound;
  state.playersProgress = {};
  state.recentGuesses = [];
  state.winner = null;

  if (nextSecretWord && nextSecretWord.trim()) {
    setHangmanSecretWord(
      state,
      nextSecretWord.trim(),
      category || 'عام',
      hint || '',
      state.timeLimitSeconds || 60
    );
    session.status = 'GUESSING_ACTIVE';
    session.turnDuration = state.timeLimitSeconds || 60;
    session.timerEndsAt = new Date(Date.now() + (state.timeLimitSeconds || 60) * 1000).toISOString();
  } else {
    state.status = 'SETTING_WORD';
    state.secretWord = '';
    state.wordLength = 0;
    state.revealedMask = [];
    state.category = '';
    state.hint = '';
    session.status = 'SETTING_WORD';
    session.timerEndsAt = null;
  }
}
