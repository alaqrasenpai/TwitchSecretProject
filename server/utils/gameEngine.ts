import crypto from 'crypto';
import type { IGameSession, IPlayer, IGameLog, IGameActionPayload, TeamId } from '~/types/game';
import { getLocalTriviaQuestions } from '~/server/utils/triviaBank';
import {
  createInitialBoardPartyState,
  setBoardMap,
  assignPlayerToNextTeam,
  rollDice,
  getAvailableDirections,
  stepTeamInDirection,
  submitDirectionVote,
  resolveDirectionChoice,
  createRandomMinigame,
  resolveMinigame,
  advanceToNextTurn,
  advanceToNextRound,
  TEAM_ORDER
} from '~/server/utils/boardEngine';
import {
  createInitialGridRoyaleState,
  prepareWaveStorm,
  claimGridTile,
  resolveGridWave
} from '~/server/utils/gridRoyaleEngine';
import {
  createInitialTypeRaceState,
  startTypeRaceRound,
  submitTypeRaceAttempt,
  advanceTypeRaceNextRound
} from '~/server/utils/typeRaceEngine';
import {
  createInitialHangmanState,
  setHangmanSecretWord,
  submitHangmanGuess,
  resolveHangmanRound,
  advanceHangmanNextRound
} from '~/server/utils/hangmanEngine';
import {
  createInitialHotPotatoState,
  startHotPotatoRound,
  passHotPotato,
  resolveHotPotatoDetonation,
  resetHotPotatoGame
} from '~/server/utils/hotPotatoEngine';
import {
  createInitialSubwayRunnerState,
  startSubwayRunnerMatch,
  submitSubwayAction,
  resolveSubwayObstacle,
  advanceSubwayNextRound,
  resetSubwayRunnerMatch
} from '~/server/utils/subwayRunnerEngine';

// In-memory active game room cache for zero-db high performance
const activeRooms = new Map<string, IGameSession>();
// Overlay token to session mapping
const overlayToSessionMap = new Map<string, string>();
// Event listeners for SSE streaming (key: sessionId, value: set of response streams)
const sessionListeners = new Map<string, Set<(event: string, data: any) => void>>();

export function broadcastGameEvent(sessionId: string, event: string, data: any) {
  const listeners = sessionListeners.get(sessionId);
  if (listeners) {
    listeners.forEach((send) => {
      try {
        send(event, data);
      } catch (e) {
        // Connection closed
      }
    });
  }
}

export function subscribeToSession(sessionId: string, callback: (event: string, data: any) => void): () => void {
  if (!sessionListeners.has(sessionId)) {
    sessionListeners.set(sessionId, new Set());
  }
  sessionListeners.get(sessionId)!.add(callback);

  return () => {
    const set = sessionListeners.get(sessionId);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        sessionListeners.delete(sessionId);
      }
    }
  };
}

export async function getGameSession(sessionId: string): Promise<IGameSession | null> {
  return activeRooms.get(sessionId) || null;
}

export function sanitizeSessionForViewer(session: IGameSession): IGameSession {
  if (session.gameType !== 'HANGMAN' || !session.hangmanState) {
    return session;
  }
  // During active guessing or word setting, strip secretWord so viewers/overlay cannot inspect DOM or network
  if (session.hangmanState.status === 'GUESSING_ACTIVE' || session.hangmanState.status === 'SETTING_WORD') {
    return {
      ...session,
      hangmanState: {
        ...session.hangmanState,
        secretWord: ''
      }
    };
  }
  return session;
}

export async function getGameSessionByOverlayToken(overlayToken: string): Promise<IGameSession | null> {
  const cleanToken = overlayToken.trim();
  let sessionId = overlayToSessionMap.get(cleanToken);
  if (sessionId && activeRooms.has(sessionId)) {
    return sanitizeSessionForViewer(activeRooms.get(sessionId)!);
  }
  // Fallback scan across all active rooms
  for (const [id, s] of activeRooms.entries()) {
    if (s.overlayToken === cleanToken) {
      overlayToSessionMap.set(cleanToken, id);
      return sanitizeSessionForViewer(s);
    }
  }
  return null;
}

export async function restoreGameSession(session: IGameSession): Promise<IGameSession> {
  if (!session || !session.sessionId) {
    throw new Error('Invalid session payload for restoration');
  }
  activeRooms.set(session.sessionId, session);
  if (session.overlayToken) {
    overlayToSessionMap.set(session.overlayToken, session.sessionId);
  }
  return session;
}

export async function createGameSession(
  streamerId: string,
  streamerUsername: string,
  gameType: any = 'ROULETTE',
  isPreVerified: boolean = false
): Promise<IGameSession> {
  const sessionId = `room_${crypto.randomBytes(4).toString('hex')}`;
  const overlayToken = `ovl_${crypto.randomBytes(12).toString('hex')}`;
  const controllerSecret = `sec_${crypto.randomBytes(16).toString('hex')}`;
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const cleanStreamer = streamerUsername.trim() || 'streamer';
  const isTrivia = gameType === 'TRIVIA';
  const isBoardParty = gameType === 'BOARD_PARTY';
  const isGridRoyale = gameType === 'GRID_ROYALE';
  const isTypeRace = gameType === 'TYPE_RACE';
  const isHangman = gameType === 'HANGMAN';
  const isHotPotato = gameType === 'HOT_POTATO';
  const isSubwayRunner = gameType === 'SUBWAY_RUNNER';

  let initialTriviaQuestions = isTrivia ? getLocalTriviaQuestions(10) : [];
  const triviaTimeLimit = 20;

  const newSession: IGameSession = {
    sessionId,
    streamerId: streamerId || `user_${cleanStreamer}`,
    streamerUsername: cleanStreamer,
    isBroadcasterVerified: isPreVerified || cleanStreamer.toLowerCase() === 'streamer',
    verificationCode,
    controllerSecret,
    gameType,
    status: 'LOBBY',
    roundNumber: 1,
    overlayToken,
    players: [],
    activePlayerNumber: null,
    targetPlayerNumber: null,
    timerEndsAt: null,
    turnDuration: isTrivia ? triviaTimeLimit : (isBoardParty ? 15 : (isTypeRace ? 15 : (isHangman ? 60 : (isHotPotato ? 25 : (isSubwayRunner ? 5 : 15))))),
    winner: null,
    settings: {
      maxPlayers: isTrivia ? 200 : (isBoardParty ? 150 : (isTypeRace ? 100 : (isHangman ? 150 : (isHotPotato ? 100 : (isSubwayRunner ? 200 : 30))))),
      turnTimeLimitSeconds: 15,
      subOnly: false,
      allowRevives: true,
      maxRevivesPerGame: 1,
      autoSpinWheel: false,
      soundEffectsEnabled: true,
      triviaTimeLimitSeconds: triviaTimeLimit,
      triviaTotalQuestions: 10,
      triviaCategory: 'ALL',
      triviaCategories: ['all'],
      triviaLanguage: 'AR',
      boardMaxRounds: 5,
      boardTurnTimerSeconds: 15,
      gridWaveTimeSeconds: 10,
      gridTileCapacity: 1,
      typeRaceTimeLimitSeconds: 15,
      typeRaceTotalRounds: 7,
      typeRaceTargetScore: 3,
      typeRaceLanguage: 'AR',
      hangmanTimeLimitSeconds: 60,
      hangmanMaxAttempts: 5,
      hotPotatoMinFuseSeconds: 15,
      hotPotatoMaxFuseSeconds: 35,
      hotPotatoMode: 'SECRET_FUSE',
      subwaySpeedLevel: 1,
      customCommands: {
        join: ['!join', '!دخول', '!انضمام', '!شارك'],
        kill: ['!kill', '!قتل', '!استبعاد'],
        revive: ['!revive', '!انعاش', '!إنعاش', '!احياء'],
        pass: ['!pass', '!مرر', '!رمي', '!حول'],
        roll: ['!roll', '!نرد', '!رمي'],
        zone: ['!zone', '!منطقة', '!1', '!2', '!3', '!4']
      }
    },
    triviaState: isTrivia && initialTriviaQuestions.length > 0
      ? {
          currentQuestion: initialTriviaQuestions[0],
          questionIndex: 1,
          totalQuestions: 10,
          status: 'LOBBY',
          votes: {},
          voteCounts: [0, 0, 0, 0],
          totalVotesCount: 0,
          timeRemainingSeconds: triviaTimeLimit
        }
      : null,
    boardPartyState: isBoardParty ? createInitialBoardPartyState(5) : null,
    gridRoyaleState: isGridRoyale ? createInitialGridRoyaleState(1, 10) : null,
    typeRaceState: isTypeRace ? createInitialTypeRaceState(3, 7, 15, 'AR') : null,
    hangmanState: isHangman ? createInitialHangmanState(60, 5) : null,
    hotPotatoState: isHotPotato ? createInitialHotPotatoState() : null,
    subwayRunnerState: isSubwayRunner ? createInitialSubwayRunnerState() : null,
    logs: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: isTrivia
          ? `تم تجهيز ساحة مسابقة الأسئلة العامة! 🧠 اضغط على بدء المسابقة للانطلاق.`
          : isBoardParty
            ? `تم تجهيز خريطة حرب الفرق واللوحة التفاعلية (Party Board Battle) 🎲 اكتبوا !join في الشات للانضمام للفرق!`
            : isGridRoyale
              ? `تم تجهيز حلبة البقاء (Grid Royale) ⚡ اكتبوا !join للمشاركة!`
              : isTypeRace
                ? `تم تجهيز سباق سرعة الكتابة (Type Race) ⚡ اكتبوا !join للمشاركة وتجهيز أصابعكم!`
                : isHangman
                  ? `تم تجهيز تحدي تخمين الكلمة المخفية (Hangman Wordle) 🔤 اكتبوا !join للمشاركة!`
                  : isHotPotato
                    ? `تم تجهيز لعبة القنبلة الموقوتة (Hot Potato Bomb) 💣🔥 اكتبوا !join في الشات للمشاركة!`
                    : isSubwayRunner
                      ? `تم تجهيز مسار الهروب السريع (Subway Runner) 🏃‍♂️💨 اكتبوا !join للمشاركة وتجهيز أوامر الشات للركض!`
                      : `تم فتح اللوبي بواسطة ${cleanStreamer}. اكتبوا !join في الشات للمشاركة 🎮`
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  activeRooms.set(sessionId, newSession);
  overlayToSessionMap.set(overlayToken, sessionId);

  return newSession;
}

export async function addPlayerToSession(
  sessionId: string,
  username: string,
  displayName: string,
  avatarUrl?: string
): Promise<{ success: boolean; message: string; session?: IGameSession }> {
  const session = await getGameSession(sessionId);
  if (!session) return { success: false, message: 'الغرفة غير موجودة' };

  const canJoinMidGame = [
    'BOARD_PARTY',
    'TYPE_RACE',
    'HANGMAN',
    'SUBWAY_RUNNER',
    'TRIVIA',
    'HOT_POTATO'
  ].includes(session.gameType);

  if (session.status !== 'LOBBY' && !canJoinMidGame) {
    return { success: false, message: 'تم إغلاق باب الدخول للعبة الحالية' };
  }

  const cleanUser = username.toLowerCase().trim();
  const existing = session.players.find((p) => p.username.toLowerCase() === cleanUser);
  if (existing) {
    return { success: false, message: `${displayName} مسجل مسبقاً برقم #${existing.number}` };
  }

  if (session.players.length >= session.settings.maxPlayers) {
    return { success: false, message: `اللوبي ممتلئ (${session.settings.maxPlayers} لاعب)` };
  }

  let assignedTeam: TeamId | undefined = undefined;
  if (session.gameType === 'BOARD_PARTY') {
    assignedTeam = assignPlayerToNextTeam(session.players, session.boardPartyState || undefined);
    if (session.boardPartyState?.teams[assignedTeam]) {
      session.boardPartyState.teams[assignedTeam].membersCount++;
    }
  }

  const newNumber = session.players.length + 1;
  const newPlayer: IPlayer = {
    id: `p_${crypto.randomBytes(4).toString('hex')}`,
    number: newNumber,
    username: cleanUser,
    displayName: displayName || username,
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
    status: 'ALIVE',
    team: assignedTeam,
    revivesUsed: 0,
    timesRevived: 0,
    killsCount: 0,
    score: 0,
    correctAnswersCount: 0,
    currentStreak: 0,
    lastAnswerChoice: null,
    joinedAt: new Date().toISOString()
  };

  session.players.push(newPlayer);

  if (session.gameType === 'SUBWAY_RUNNER' && session.subwayRunnerState) {
    session.subwayRunnerState.contenders[cleanUser] = {
      username: cleanUser,
      displayName: displayName || username,
      avatarUrl: newPlayer.avatarUrl,
      hearts: 3,
      status: 'ALIVE',
      score: 0,
      successfulDodges: 0
    };
    session.subwayRunnerState.survivorsCount = Object.values(session.subwayRunnerState.contenders).filter((c) => c.status === 'ALIVE').length;
  }
  
  const teamLabel = assignedTeam === 'crimson' ? '🔴 الفريق الأحمر' : assignedTeam === 'onyx' ? '⚫ فريق الأونيكس' : assignedTeam === 'silver' ? '⚪ الفريق الفضي' : '';
  session.logs.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: 'JOIN',
    message: session.gameType === 'BOARD_PARTY'
      ? `انضم ${newPlayer.displayName} إلى ${teamLabel}!`
      : `انضم اللاعب ${newPlayer.displayName} كمتسابق رقم #${newNumber} 🎯`,
    actor: newPlayer.displayName,
    teamId: assignedTeam
  });
  session.updatedAt = new Date().toISOString();

  activeRooms.set(sessionId, session);
  broadcastGameEvent(sessionId, 'STATE_UPDATE', session);

  return { success: true, message: `انضم كلاعب رقم #${newNumber}`, session };
}

export async function processGameAction(
  sessionId: string,
  payload: IGameActionPayload
): Promise<{ success: boolean; message: string; session?: IGameSession }> {
  const session = await getGameSession(sessionId);
  if (!session) return { success: false, message: 'الغرفة غير موجودة' };

  const { action, actorUsername, targetNumber, settings, forcePlayerNumber } = payload;

  switch (action) {
    case 'START_LOBBY': {
      session.status = 'LOBBY';
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: 'تم فتح اللوبي لدخول لاعبين جدد.'
      });
      break;
    }

    case 'LOCK_ENTRIES': {
      if (session.players.length < 2) {
        return { success: false, message: 'يجب توفر لاعبين اثنين على الأقل لبدء اللعبة.' };
      }
      session.status = 'PAUSED';
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `تم قفل الدخول مع ${session.players.length} متسابق جاهز.`
      });
      break;
    }

    case 'SPIN_WHEEL': {
      const alivePlayers = session.players.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED');
      if (alivePlayers.length <= 1) {
        checkWinCondition(session);
        break;
      }

      // Pick random alive player
      const randomIndex = Math.floor(Math.random() * alivePlayers.length);
      const chosenPlayer = alivePlayers[randomIndex];

      session.status = 'SPINNING';
      session.activePlayerNumber = chosenPlayer.number;
      session.targetPlayerNumber = null;

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'SPIN',
        message: 'تدور العجلة لاختيار المتسابق القادم! 🎡'
      });

      const turnSecs = session.settings.turnTimeLimitSeconds;
      session.turnDuration = turnSecs;
      
      // If turnSecs is 0, it means unlimited timer (no timeout)
      if (turnSecs && turnSecs > 0) {
        session.timerEndsAt = new Date(Date.now() + (turnSecs + 4) * 1000).toISOString();
      } else {
        session.timerEndsAt = null;
      }
      session.status = 'WAITING_ACTION';
      break;
    }

    case 'ACTION_KILL': {
      if (session.status !== 'WAITING_ACTION') {
        return { success: false, message: 'القرعة ليست في مرحلة انتظار التنفيذ.' };
      }

      const activePlayer = session.players.find((p) => p.number === session.activePlayerNumber);
      if (!activePlayer) return { success: false, message: 'لم يتم تحديد اللاعب الحالي.' };

      if (actorUsername && activePlayer.username.toLowerCase() !== actorUsername.toLowerCase()) {
        return { success: false, message: `فقط اللاعب رقم #${activePlayer.number} (${activePlayer.displayName}) هو صاحب القرار الآن.` };
      }

      if (!targetNumber) {
        return { success: false, message: 'يجب تحديد رقم اللاعب المراد استبعاده: !kill <رقم>' };
      }

      const targetPlayer = session.players.find((p) => p.number === Number(targetNumber));
      if (!targetPlayer) {
        return { success: false, message: `اللاعب رقم #${targetNumber} غير موجود.` };
      }

      if (targetPlayer.number === activePlayer.number) {
        return { success: false, message: 'لا يمكنك استبعاد نفسك!' };
      }

      if (targetPlayer.status === 'ELIMINATED') {
        return { success: false, message: `اللاعب رقم #${targetNumber} مستبعد مسبقاً!` };
      }

      targetPlayer.status = 'ELIMINATED';
      activePlayer.killsCount = (activePlayer.killsCount || 0) + 1;
      session.targetPlayerNumber = targetPlayer.number;
      session.status = 'RESOLVING';

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'KILL',
        message: `💥 قام المتسابق #${activePlayer.number} (${activePlayer.displayName}) باستبعاد المتسابق #${targetPlayer.number} (${targetPlayer.displayName})!`,
        actor: activePlayer.displayName,
        target: targetPlayer.displayName
      });

      checkWinCondition(session);
      break;
    }

    case 'ACTION_REVIVE': {
      if (session.status !== 'WAITING_ACTION') {
        return { success: false, message: 'ليست في مرحلة تنفيذ الأوامر.' };
      }

      const activePlayer = session.players.find((p) => p.number === session.activePlayerNumber);
      if (!activePlayer) return { success: false, message: 'لم يتم تحديد المتسابق صاحب الدور' };

      if (actorUsername && activePlayer.username.toLowerCase() !== actorUsername.toLowerCase()) {
        return { success: false, message: `فقط المتسابق #${activePlayer.number} (${activePlayer.displayName}) يمكنه الإنعاش الآن.` };
      }

      if (!session.settings.allowRevives) {
        return { success: false, message: 'خاصية الإنعاش معطلة في هذه الجولة.' };
      }

      if (activePlayer.revivesUsed >= (session.settings.maxRevivesPerGame || 1)) {
        return { success: false, message: `${activePlayer.displayName} استخدم فرصة الإنعاش مسبقاً!` };
      }

      if (!targetNumber) {
        return { success: false, message: 'يجب تحديد رقم المتسابق المراد إنعاشه: !revive <رقم>' };
      }

      const targetPlayer = session.players.find((p) => p.number === Number(targetNumber));
      if (!targetPlayer) {
        return { success: false, message: `المتسابق رقم #${targetNumber} غير موجود.` };
      }

      if (targetPlayer.status !== 'ELIMINATED') {
        return { success: false, message: `المتسابق رقم #${targetNumber} غير مستبعد ولا يحتاج إنعاشاً!` };
      }

      if (targetPlayer.timesRevived >= 1) {
        return { success: false, message: `المتسابق رقم #${targetNumber} تم إنعاشه مسبقاً ولا يمكن إنعاشه مرة ثانية!` };
      }

      targetPlayer.status = 'REVIVED';
      targetPlayer.timesRevived = (targetPlayer.timesRevived || 0) + 1;
      activePlayer.revivesUsed = (activePlayer.revivesUsed || 0) + 1;
      session.targetPlayerNumber = targetPlayer.number;
      session.status = 'RESOLVING';

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'REVIVE',
        message: `✨ قام المتسابق #${activePlayer.number} (${activePlayer.displayName}) بإنعاش المتسابق #${targetPlayer.number} (${targetPlayer.displayName}) وإعادته للعبة!`,
        actor: activePlayer.displayName,
        target: targetPlayer.displayName
      });
      break;
    }

    case 'TIMEOUT_PASS':
    case 'ACTION_PASS': {
      const activePlayer = session.players.find((p) => p.number === session.activePlayerNumber);
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'TIMEOUT',
        message: activePlayer
          ? `⏰ انتهى الوقت المخصص للمتسابق #${activePlayer.number} (${activePlayer.displayName}). انتقل الدور.`
          : 'انتهى الوقت.',
        actor: activePlayer?.displayName
      });
      session.status = 'RESOLVING';
      break;
    }

    case 'RESET_GAME': {
      session.status = 'LOBBY';
      session.roundNumber = 1;
      session.activePlayerNumber = null;
      session.targetPlayerNumber = null;
      session.timerEndsAt = null;
      session.winner = null;
      session.players = session.players.map((p) => ({
        ...p,
        status: 'ALIVE',
        revivesUsed: 0,
        timesRevived: 0,
        killsCount: 0
      }));
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: 'تمت إعادة ضبط اللعبة وعودة جميع اللاعبين للحياة.'
      });
      break;
    }

    case 'UPDATE_SETTINGS': {
      if (settings) {
        session.settings = { ...session.settings, ...settings };
        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          message: `تم تحديث إعدادات اللعبة (الوقت: ${session.settings.turnTimeLimitSeconds === 0 ? 'غير محدود' : session.settings.turnTimeLimitSeconds + ' ثانية'} • الإنعاش: ${session.settings.allowRevives ? 'مفعّل' : 'معطّل'})`
        });
      }
      break;
    }

    case 'KICK_PLAYER': {
      if (targetNumber) {
        const idx = session.players.findIndex((p) => p.number === Number(targetNumber));
        if (idx !== -1) {
          const removed = session.players.splice(idx, 1)[0];
          session.players.forEach((p, i) => {
            p.number = i + 1;
          });
          session.logs.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'INFO',
            message: `تم طرد المتسابق ${removed.displayName} من اللوبي.`
          });
          checkWinCondition(session);
        }
      }
      break;
    }

    case 'FORCE_WINNER': {
      if (forcePlayerNumber) {
        const p = session.players.find((pl) => pl.number === Number(forcePlayerNumber));
        if (p) {
          session.winner = p;
          session.status = 'FINISHED';
          session.logs.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'WIN',
            message: `👑 مبروووك! المتسابق #${p.number} (${p.displayName}) فاز بالجولة!`,
            actor: p.displayName
          });
        }
      }
      break;
    }

    case 'VERIFY_BROADCASTER': {
      session.isBroadcasterVerified = true;
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🛡️ تم التحقق بنجاح وتأكيد ملكية القناة بواسطة الستريمر (${session.streamerUsername})!`
      });
      break;
    }

    case 'TRIVIA_SUBMIT_VOTE': {
      if (!session.triviaState || session.triviaState.status !== 'QUESTION_ACTIVE') {
        return { success: false, message: 'لا يوجد سؤال نشط حالياً للتصويت' };
      }

      const cleanUser = (actorUsername || '').toLowerCase().trim();
      if (!cleanUser) {
        return { success: false, message: 'اسم المستخدم غير متوفر' };
      }

      const choice = payload.choiceIndex;
      if (choice === undefined || choice < 0 || choice > 3) {
        return { success: false, message: 'الخيار المختار غير صالح (اختر 1-4 أو A-D)' };
      }

      // Auto-register player in trivia participants if not already added
      let player = session.players.find((p) => p.username.toLowerCase() === cleanUser);
      if (!player) {
        player = {
          id: `p_${crypto.randomBytes(4).toString('hex')}`,
          number: session.players.length + 1,
          username: cleanUser,
          displayName: actorUsername || cleanUser,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
          status: 'ALIVE',
          revivesUsed: 0,
          timesRevived: 0,
          killsCount: 0,
          score: 0,
          correctAnswersCount: 0,
          currentStreak: 0,
          lastAnswerChoice: null,
          joinedAt: new Date().toISOString()
        };
        session.players.push(player);
      }

      // Handle changing vote
      const prevChoice = session.triviaState.votes[cleanUser];
      if (prevChoice !== undefined && prevChoice >= 0 && prevChoice <= 3) {
        session.triviaState.voteCounts[prevChoice] = Math.max(0, session.triviaState.voteCounts[prevChoice] - 1);
      }

      session.triviaState.votes[cleanUser] = choice;
      session.triviaState.voteCounts[choice] = (session.triviaState.voteCounts[choice] || 0) + 1;
      session.triviaState.totalVotesCount = Object.keys(session.triviaState.votes).length;
      player.lastAnswerChoice = choice;

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'TRIVIA_ANSWER',
        message: `📥 صوّت ${player.displayName} للخيار [${['A (1)', 'B (2)', 'C (3)', 'D (4)'][choice]}]`,
        actor: player.displayName
      });
      break;
    }

    case 'TRIVIA_START_QUIZ': {
      if (!session.triviaState) {
        return { success: false, message: 'لا توجد مسابقة أسئلة مجهزة' };
      }

      const timeLimit = session.settings.triviaTimeLimitSeconds ?? 20;
      const selectedCats = session.settings.triviaCategories && session.settings.triviaCategories.length > 0
        ? session.settings.triviaCategories
        : session.settings.triviaCategory || 'all';
      const initialQuestions = getLocalTriviaQuestions(session.settings.triviaTotalQuestions || 10, selectedCats);

      session.triviaState = {
        currentQuestion: initialQuestions[0] || null,
        questionIndex: 1,
        totalQuestions: session.settings.triviaTotalQuestions || 10,
        status: 'QUESTION_ACTIVE',
        votes: {},
        voteCounts: [0, 0, 0, 0],
        totalVotesCount: 0,
        timeRemainingSeconds: timeLimit
      };
      session.status = 'QUESTION_ACTIVE';
      session.turnDuration = timeLimit;
      session.timerEndsAt = timeLimit > 0 ? new Date(Date.now() + timeLimit * 1000).toISOString() : null;
      session.winner = null;

      session.players.forEach((p) => {
        p.score = 0;
        p.correctAnswersCount = 0;
        p.currentStreak = 0;
        p.lastAnswerChoice = null;
        p.status = 'ALIVE';
      });

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🚀 انطلقت مسابقة الأسئلة! السؤال الأول: ${session.triviaState.currentQuestion?.question}`
      });
      break;
    }

    case 'TRIVIA_REVEAL_ANSWER': {
      if (!session.triviaState) {
        return { success: false, message: 'لا توجد لعبة أسئلة جارية' };
      }

      session.triviaState.status = 'ANSWER_REVEALED';
      session.status = 'ANSWER_REVEALED';
      session.timerEndsAt = null;

      const correctIdx = session.triviaState.currentQuestion?.correctIndex ?? 0;
      const correctText = session.triviaState.currentQuestion?.options[correctIdx] || '';
      const letters = ['A', 'B', 'C', 'D'];

      let correctCount = 0;
      session.players.forEach((p) => {
        const userVote = session.triviaState?.votes[p.username.toLowerCase()];
        if (userVote === correctIdx) {
          correctCount++;
          const streak = p.currentStreak || 0;
          const streakBonus = Math.min(streak * 25, 100);
          const pointsEarned = 100 + streakBonus;
          p.score = (p.score || 0) + pointsEarned;
          p.correctAnswersCount = (p.correctAnswersCount || 0) + 1;
          p.currentStreak = streak + 1;
        } else if (userVote !== undefined) {
          p.currentStreak = 0;
        }
      });

      // Sort players by highest score
      session.players.sort((a, b) => (b.score || 0) - (a.score || 0));

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'TRIVIA_REVEAL',
        message: `✅ الإجابة الصحيحة هي: [${letters[correctIdx]}] ${correctText} (${correctCount} إجابة صحيحة)`
      });
      break;
    }

    case 'TRIVIA_NEXT_QUESTION': {
      if (!session.triviaState) {
        return { success: false, message: 'لا توجد لعبة أسئلة جارية' };
      }

      const nextIdx = session.triviaState.questionIndex + 1;
      const totalQ = session.settings.triviaTotalQuestions || 10;

      if (nextIdx > totalQ) {
        session.triviaState.status = 'ROUND_SUMMARY';
        session.status = 'FINISHED';
        session.timerEndsAt = null;
        session.players.sort((a, b) => (b.score || 0) - (a.score || 0));
        session.winner = session.players[0] || null;

        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'WIN',
          message: session.winner
            ? `👑 اكتمل التحدي! الفائز الأول بالمركز الأول هو: ${session.winner.displayName} بمجموع ${session.winner.score || 0} نقطة! 🎉`
            : 'اكتملت جميع جولات الأسئلة!'
        });
      } else {
        const timeLimit = session.settings.triviaTimeLimitSeconds ?? 20;
        const selectedCats = session.settings.triviaCategories && session.settings.triviaCategories.length > 0
          ? session.settings.triviaCategories
          : session.settings.triviaCategory || 'all';
        const newQuestions = getLocalTriviaQuestions(1, selectedCats);
        const nextQuestion = newQuestions[0] || session.triviaState.currentQuestion;

        session.triviaState.questionIndex = nextIdx;
        session.triviaState.currentQuestion = nextQuestion;
        session.triviaState.votes = {};
        session.triviaState.voteCounts = [0, 0, 0, 0];
        session.triviaState.totalVotesCount = 0;
        session.triviaState.status = 'QUESTION_ACTIVE';
        session.triviaState.timeRemainingSeconds = timeLimit;
        session.status = 'QUESTION_ACTIVE';
        session.turnDuration = timeLimit;
        session.timerEndsAt = timeLimit > 0 ? new Date(Date.now() + timeLimit * 1000).toISOString() : null;

        session.players.forEach((p) => {
          p.lastAnswerChoice = null;
        });

        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          message: `❓ السؤال رقم (${nextIdx}/${totalQ}): ${nextQuestion?.question}`
        });
      }
      break;
    }

    case 'TRIVIA_RESTART': {
      const timeLimit = session.settings.triviaTimeLimitSeconds ?? 20;
      const selectedCats = session.settings.triviaCategories && session.settings.triviaCategories.length > 0
        ? session.settings.triviaCategories
        : session.settings.triviaCategory || 'all';
      const initialQuestions = getLocalTriviaQuestions(session.settings.triviaTotalQuestions || 10, selectedCats);
      
      session.triviaState = {
        currentQuestion: initialQuestions[0] || null,
        questionIndex: 1,
        totalQuestions: session.settings.triviaTotalQuestions || 10,
        status: 'LOBBY',
        votes: {},
        voteCounts: [0, 0, 0, 0],
        totalVotesCount: 0,
        timeRemainingSeconds: timeLimit
      };
      session.status = 'LOBBY';
      session.turnDuration = timeLimit;
      session.timerEndsAt = null;
      session.winner = null;

      session.players.forEach((p) => {
        p.score = 0;
        p.correctAnswersCount = 0;
        p.currentStreak = 0;
        p.lastAnswerChoice = null;
        p.status = 'ALIVE';
      });

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: '🔄 تم إعادة تهيئة مسابقة الأسئلة العامة. اضغط على بدء المسابقة للانطلاق!'
      });
      break;
    }

    // ================= BOARD PARTY GAME ACTIONS =================
    // ================= PUMMEL PARTY MAZE BOARD ACTIONS =================
    case 'BOARD_START_GAME': {
      if (!session.boardPartyState) {
        session.boardPartyState = createInitialBoardPartyState();
      }
      const turnDuration = session.settings.boardTurnTimerSeconds || 15;
      session.boardPartyState.status = 'TEAM_TURN';
      session.boardPartyState.activeTurnIndex = 0;
      session.boardPartyState.activeTeamId = 'crimson';
      session.boardPartyState.roundNumber = 1;
      session.boardPartyState.winnerTeamId = null;
      session.boardPartyState.isRollingDice = false;
      session.boardPartyState.lastDiceRoll = null;
      session.boardPartyState.remainingSteps = 0;
      session.boardPartyState.directionChoice = null;
      session.status = 'TEAM_TURN';
      session.turnDuration = turnDuration;
      session.timerEndsAt = new Date(Date.now() + turnDuration * 1000).toISOString();

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🚀 انطلقت حرب المتاهة التكتيكية! الجولة 1 - دور الفريق الأحمر 🔴 اضغطوا على رمي النرد لبدء التحرك!`,
        teamId: 'crimson'
      });
      break;
    }

    case 'BOARD_ROLL_DICE': {
      if (!session.boardPartyState || session.boardPartyState.status !== 'TEAM_TURN') {
        return { success: false, message: 'ليس دور رمي النرد حالياً' };
      }

      const activeTeamId = session.boardPartyState.activeTeamId;
      const team = session.boardPartyState.teams[activeTeamId];
      const roll = payload.forcedRoll && payload.forcedRoll >= 1 && payload.forcedRoll <= 6
        ? payload.forcedRoll
        : rollDice();

      session.boardPartyState.lastDiceRoll = roll;
      session.boardPartyState.remainingSteps = roll;
      session.boardPartyState.isRollingDice = false;

      const currentTile = session.boardPartyState.tiles[team.tileIndex];
      const availableDirs = getAvailableDirections(currentTile, team.previousTileIndex);

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'SPIN',
        message: `🎲 رَمَى الستريمر النرد لـ ${team.nameAr} وحصل على [${roll}] خطوات!`,
        teamId: activeTeamId
      });

      if (availableDirs.length > 1) {
        // Fork at starting tile: team in chat votes on direction!
        session.boardPartyState.status = 'DIRECTION_CHOICE';
        session.boardPartyState.directionChoice = {
          teamId: activeTeamId,
          fromTileIndex: currentTile.index,
          availableDirections: availableDirs,
          votes: {},
          voteCounts: { up: 0, down: 0, left: 0, right: 0 },
          timeRemainingSeconds: 15,
          remainingSteps: roll
        };
        session.status = 'DIRECTION_CHOICE';
        session.turnDuration = 15;
        session.timerEndsAt = new Date(Date.now() + 15000).toISOString();

        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          message: `🧭 مفترق طرق! صوتوا في الشات لاختيار المسار: [${availableDirs.map(d => `!${d}`).join(' / ')}]`,
          teamId: activeTeamId
        });
      } else if (availableDirs.length === 1) {
        const { logs, isIntersection } = stepTeamInDirection(session.boardPartyState, availableDirs[0]);
        logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));

        if (isIntersection && session.boardPartyState.status === 'DIRECTION_CHOICE') {
          session.status = 'DIRECTION_CHOICE';
          session.turnDuration = 15;
          session.timerEndsAt = new Date(Date.now() + 15000).toISOString();
        } else {
          session.status = session.boardPartyState.status;
          session.timerEndsAt = null;
        }
      }
      break;
    }

    case 'BOARD_SUBMIT_DIRECTION': {
      if (!session.boardPartyState || session.boardPartyState.status !== 'DIRECTION_CHOICE' || !session.boardPartyState.directionChoice) {
        return { success: false, message: 'لا يوجد تصويت اتجاه نشط حالياً' };
      }

      const dir = (payload.direction || 'right').toLowerCase() as any;
      const cleanUser = (actorUsername || '').toLowerCase().trim();

      // Ensure voter is a player
      let player = session.players.find((p) => p.username.toLowerCase() === cleanUser);
      if (!player) {
        const assignedTeam = assignPlayerToNextTeam(session.players);
        player = {
          id: `p_${crypto.randomBytes(4).toString('hex')}`,
          number: session.players.length + 1,
          username: cleanUser,
          displayName: actorUsername || cleanUser,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
          status: 'ALIVE',
          team: assignedTeam,
          revivesUsed: 0,
          timesRevived: 0,
          killsCount: 0,
          joinedAt: new Date().toISOString()
        };
        session.players.push(player);
        if (session.boardPartyState.teams[assignedTeam]) {
          session.boardPartyState.teams[assignedTeam].membersCount++;
        }
      }

      // Record vote
      submitDirectionVote(session.boardPartyState, cleanUser, dir);
      break;
    }

    case 'BOARD_SELECT_DIRECTION': {
      if (!session.boardPartyState || session.boardPartyState.status !== 'DIRECTION_CHOICE' || !session.boardPartyState.directionChoice) {
        return { success: false, message: 'لا يوجد مفترق طرق قيد الانتظار' };
      }

      const manualDir = payload.direction as any;
      const { logs } = resolveDirectionChoice(session.boardPartyState, manualDir);
      logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));

      if (session.boardPartyState.status === 'DIRECTION_CHOICE') {
        session.status = 'DIRECTION_CHOICE';
        session.turnDuration = 15;
        session.timerEndsAt = new Date(Date.now() + 15000).toISOString();
      } else {
        session.status = session.boardPartyState.status;
        session.timerEndsAt = null;
      }
      break;
    }

    case 'BOARD_TOGGLE_TEAM': {
      if (!session.boardPartyState) return { success: false, message: 'لا توجد لعبة جارية' };
      const { teamId, enabled } = payload;
      const ok = toggleTeamEnabled(session.boardPartyState, teamId, enabled, session.players);
      if (!ok) {
        return { success: false, message: 'يجب الإبقاء على فريقين مفعّلين على الأقل' };
      }
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `⚙️ قام الستريمر بـ ${enabled ? 'تفعيل' : 'تعطيل'} ${session.boardPartyState.teams[teamId]?.nameAr || teamId}!`
      });
      break;
    }

    case 'BOARD_SHUFFLE_TEAMS': {
      if (!session.boardPartyState) return { success: false, message: 'لا توجد لعبة جارية' };
      const { logs } = shufflePlayersAcrossTeams(session.players, session.boardPartyState);
      logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));
      break;
    }

    case 'BOARD_NEXT_TURN': {
      if (!session.boardPartyState) return { success: false, message: 'لا توجد لعبة جارية' };

      const { isRoundEnd, isMatchOver, logs } = advanceToNextTurn(session.boardPartyState, session.players);
      logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));

      if (isMatchOver) {
        session.status = 'FINISHED';
        session.timerEndsAt = null;
      } else if (isRoundEnd) {
        session.status = 'MINIGAME';
        const duration = session.boardPartyState.minigameState?.timeRemainingSeconds || 15;
        session.turnDuration = duration;
        session.timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();
      } else {
        session.status = 'TEAM_TURN';
        const turnDuration = session.settings.boardTurnTimerSeconds || 15;
        session.turnDuration = turnDuration;
        session.timerEndsAt = new Date(Date.now() + turnDuration * 1000).toISOString();
      }
      break;
    }

    case 'BOARD_TRIGGER_MINIGAME': {
      if (!session.boardPartyState) return { success: false, message: 'لا توجد لعبة جارية' };

      const preferredType = payload.minigameType || undefined;
      session.boardPartyState.status = 'MINIGAME';
      session.boardPartyState.minigameState = createRandomMinigame(session.boardPartyState, session.players, preferredType);
      session.status = 'MINIGAME';
      const duration = session.boardPartyState.minigameState.timeRemainingSeconds || 15;
      session.turnDuration = duration;
      session.timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `⚡ انطلقت لعبة الميني جيم: ${session.boardPartyState.minigameState.titleAr}!`
      });
      break;
    }

    case 'BOARD_SUBMIT_MINIGAME_ACTION': {
      if (!session.boardPartyState || !session.boardPartyState.minigameState || session.boardPartyState.status !== 'MINIGAME') {
        return { success: false, message: 'الميني جيم غير نشط حالياً' };
      }

      const cleanUser = (actorUsername || '').toLowerCase().trim();
      let player = session.players.find((p) => p.username.toLowerCase() === cleanUser);
      if (!player) {
        const assignedTeam = assignPlayerToNextTeam(session.players, session.boardPartyState);
        player = {
          id: `p_${crypto.randomBytes(4).toString('hex')}`,
          number: session.players.length + 1,
          username: cleanUser,
          displayName: actorUsername || cleanUser,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
          status: 'ALIVE',
          team: assignedTeam,
          revivesUsed: 0,
          timesRevived: 0,
          killsCount: 0,
          joinedAt: new Date().toISOString()
        };
        session.players.push(player);
        if (session.boardPartyState.teams[assignedTeam]) {
          session.boardPartyState.teams[assignedTeam].membersCount++;
        }
      }

      const teamId = player.team || 'crimson';
      const minigame = session.boardPartyState.minigameState;

      // Handle votes by minigame type
      const voteValue = payload.choice !== undefined ? payload.choice : (payload.zoneIndex !== undefined ? payload.zoneIndex : payload.optionIndex);
      const prevChoice = minigame.votes[cleanUser];

      if (prevChoice !== undefined && minigame.teamVotes[teamId] && minigame.teamVotes[teamId][prevChoice] !== undefined) {
        minigame.teamVotes[teamId][prevChoice] = Math.max(0, minigame.teamVotes[teamId][prevChoice] - 1);
      }

      minigame.votes[cleanUser] = voteValue;
      if (!minigame.teamVotes[teamId]) {
        minigame.teamVotes[teamId] = {};
      }
      minigame.teamVotes[teamId][voteValue] = (minigame.teamVotes[teamId][voteValue] || 0) + 1;
      break;
    }

    case 'BOARD_RESOLVE_MINIGAME': {
      if (!session.boardPartyState || !session.boardPartyState.minigameState) {
        return { success: false, message: 'لا يوجد ميني جيم قيد المعالجة' };
      }

      const { logs } = resolveMinigame(session.boardPartyState, session.players);
      logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));

      session.timerEndsAt = null;
      session.boardPartyState.status = 'ROUND_END';
      session.status = 'ROUND_END';
      break;
    }

    case 'BOARD_NEXT_ROUND': {
      if (!session.boardPartyState) return { success: false, message: 'لا توجد لعبة جارية' };

      const { isMatchOver, logs } = advanceToNextRound(session.boardPartyState, session.players);
      logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));

      if (isMatchOver) {
        session.status = 'FINISHED';
        session.timerEndsAt = null;
      } else {
        session.status = 'TEAM_TURN';
        const turnDuration = session.settings.boardTurnTimerSeconds || 15;
        session.turnDuration = turnDuration;
        session.timerEndsAt = new Date(Date.now() + turnDuration * 1000).toISOString();
      }
      break;
    }

    case 'BOARD_SET_MAP': {
      if (!session.boardPartyState) return { success: false, message: 'لا توجد لعبة جارية' };
      const mapTheme = payload.mapTheme || 'winter_outpost';
      session.settings.boardMap = mapTheme;
      const { logs } = setBoardMap(session.boardPartyState, mapTheme);
      logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));
      break;
    }

    case 'BOARD_RESTART': {
      const mapTheme = session.settings.boardMap || session.boardPartyState?.mapTheme || 'winter_outpost';
      session.boardPartyState = createInitialBoardPartyState(mapTheme);
      session.status = 'LOBBY';
      session.timerEndsAt = null;
      session.winner = null;

      // Re-assign existing players evenly across enabled teams
      session.players.forEach((p) => {
        p.team = assignPlayerToNextTeam(session.players.filter((x) => x.id !== p.id), session.boardPartyState || undefined);
      });
      session.players.forEach((p) => {
        if (p.team && session.boardPartyState?.teams[p.team]) {
          session.boardPartyState.teams[p.team].membersCount++;
        }
      });

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: '🔄 تم إعادة تهيئة مباراة المتاهة (Pummel Maze War) بنجاح!'
      });
      break;
    }

    // ================= GRID ROYALE (BATTLE ROYALE ARENA) ACTIONS =================
    case 'GRID_ROYALE_START': {
      const cap = session.settings.gridTileCapacity || 1;
      const duration = session.settings.gridWaveTimeSeconds || 10;
      session.gridRoyaleState = createInitialGridRoyaleState(cap, duration);
      prepareWaveStorm(session.gridRoyaleState, 1);
      session.gridRoyaleState.status = 'WAVE_ACTIVE';
      session.status = 'WAVE_ACTIVE';
      session.turnDuration = duration;
      session.timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();
      session.winner = null;

      // Mark all players alive
      session.players.forEach((p) => {
        p.status = 'ALIVE';
      });
      session.gridRoyaleState.alivePlayersCount = session.players.length;

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `⚡ انطلقت الموجة 1 من حلبة البقاء (Grid Royale)! سارعوا بحجز المربعات الآمنة قبل انتهاء العداد!`
      });
      break;
    }

    case 'GRID_ROYALE_MOVE': {
      if (!session.gridRoyaleState || session.gridRoyaleState.status !== 'WAVE_ACTIVE') {
        return { success: false, message: 'الموجة غير نشطة حالياً للحركة' };
      }

      const cleanUser = (actorUsername || '').toLowerCase().trim();
      let player = session.players.find((p) => p.username.toLowerCase() === cleanUser);
      if (!player) {
        player = {
          id: `p_${crypto.randomBytes(4).toString('hex')}`,
          number: session.players.length + 1,
          username: cleanUser,
          displayName: actorUsername || cleanUser,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
          status: 'ALIVE',
          revivesUsed: 0,
          timesRevived: 0,
          killsCount: 0,
          joinedAt: new Date().toISOString()
        };
        session.players.push(player);
      }

      const target = payload.targetTile || '';
      const result = claimGridTile(session.gridRoyaleState, cleanUser, target, session);

      if (result.success) {
        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'GRID_MOVE',
          message: result.messageAr,
          actor: player.displayName
        });
      }
      break;
    }

    case 'GRID_ROYALE_RESOLVE_WAVE': {
      if (!session.gridRoyaleState) {
        return { success: false, message: 'لا توجد لعبة جارية' };
      }

      const { isGameOver, winner, logs } = resolveGridWave(session.gridRoyaleState, session);
      logs.forEach((l) => session.logs.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: (l.type as any) || 'INFO', message: l.message || '' }));

      session.timerEndsAt = null;
      if (isGameOver) {
        session.status = 'FINISHED';
        session.winner = winner;
      } else {
        session.status = 'ROUND_SUMMARY';
      }
      break;
    }

    case 'GRID_ROYALE_NEXT_WAVE': {
      if (!session.gridRoyaleState) {
        return { success: false, message: 'لا توجد لعبة جارية' };
      }

      const nextWave = session.gridRoyaleState.waveNumber + 1;
      const duration = Math.max(5, (session.settings.gridWaveTimeSeconds || 10) - (nextWave - 1) * 2);
      session.gridRoyaleState.timeRemainingSeconds = duration;
      prepareWaveStorm(session.gridRoyaleState, nextWave);
      session.gridRoyaleState.status = 'WAVE_ACTIVE';
      session.status = 'WAVE_ACTIVE';
      session.turnDuration = duration;
      session.timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'GRID_COLLAPSE',
        message: `🚨 بدأت الموجة ${nextWave}! العاصفة تضيق والحلبة تصغر (${session.gridRoyaleState.safeTilesCount} مربعات آمنة فقط)! اسرعوا!`
      });
      break;
    }

    case 'GRID_ROYALE_RESTART': {
      const cap = session.settings.gridTileCapacity || 1;
      const duration = session.settings.gridWaveTimeSeconds || 10;
      session.gridRoyaleState = createInitialGridRoyaleState(cap, duration);
      session.status = 'LOBBY';
      session.timerEndsAt = null;
      session.winner = null;

      session.players.forEach((p) => {
        p.status = 'ALIVE';
      });

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: '🔄 تم إعادة تهيئة حلبة البقاء (Grid Royale) بنجاح!'
      });
      break;
    }

    // ================= TYPE RACE GAME ACTIONS =================
    case 'TYPE_RACE_START': {
      const lang = payload.languageMode || session.settings.typeRaceLanguage || 'AR';
      const rounds = payload.totalRounds || session.settings.typeRaceTotalRounds || 7;
      session.settings.typeRaceLanguage = lang;
      session.settings.typeRaceTotalRounds = rounds;
      if (!session.typeRaceState) {
        session.typeRaceState = createInitialTypeRaceState(
          session.settings.typeRaceTargetScore || 3,
          rounds,
          session.settings.typeRaceTimeLimitSeconds || 15,
          lang
        );
      } else {
        session.typeRaceState.languageMode = lang;
        session.typeRaceState.totalRounds = rounds;
      }

      startTypeRaceRound(session.typeRaceState, lang);
      const timeLimit = session.settings.typeRaceTimeLimitSeconds || 15;
      session.status = 'WORD_ACTIVE';
      session.turnDuration = timeLimit;
      session.timerEndsAt = new Date(Date.now() + timeLimit * 1000).toISOString();

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `⚡ انطلق سباق سرعة الكتابة! الجولة 1: اكتبوا الكلمة [${session.typeRaceState.currentWord}] في الشات بأقصى سرعة! 🔥`
      });
      break;
    }

    case 'TYPE_RACE_SUBMIT_WORD': {
      if (!session.typeRaceState || session.typeRaceState.status !== 'WORD_ACTIVE') {
        return { success: false, message: 'لا توجد جولة كتابة نشطة حالياً' };
      }

      const submitted = payload.submittedWord || '';
      const actor = payload.actorUsername || 'viewer';

      const result = submitTypeRaceAttempt(session.typeRaceState, actor, submitted, session);

      if (result.isCorrect) {
        session.timerEndsAt = null;
        if (result.log) {
          session.logs.unshift({
            id: result.log.id || crypto.randomUUID(),
            timestamp: result.log.timestamp || new Date().toISOString(),
            type: (result.log.type as any) || 'TYPE_WIN',
            message: result.log.message || '',
            actor: result.log.actor
          });
        }

        if (result.isMatchOver && result.winner) {
          session.status = 'FINISHED';
          session.winner = result.winner;
          session.logs.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'WIN',
            message: `👑 مبروووك الفوز! المتسابق #${result.winner.number} (${result.winner.displayName}) هو أسرع كاتب وتوّج بطلاً لسباق السرعة! ⚡🎉`,
            actor: result.winner.displayName
          });
        } else {
          session.status = 'ROUND_WON';
        }
      }
      break;
    }

    case 'TYPE_RACE_NEXT_ROUND': {
      if (!session.typeRaceState) {
        return { success: false, message: 'لا توجد لعبة جارية' };
      }

      const lang = session.settings.typeRaceLanguage || session.typeRaceState.languageMode || 'AR';
      const result = advanceTypeRaceNextRound(session.typeRaceState, lang, session.players);

      if (result.isMatchOver) {
        session.status = 'FINISHED';
        session.winner = result.winner;
        session.timerEndsAt = null;
        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'WIN',
          message: result.winner
            ? `👑 انتهت جولات سباق السرعة! وتوّج #${result.winner.number} (${result.winner.displayName}) بطلاً للمنافسة! 🏆🎉`
            : `🏁 انتهت جولات سباق سرعة الكتابة!`
        });
      } else {
        const timeLimit = session.settings.typeRaceTimeLimitSeconds || 15;
        session.status = 'WORD_ACTIVE';
        session.turnDuration = timeLimit;
        session.timerEndsAt = new Date(Date.now() + timeLimit * 1000).toISOString();

        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          message: `⚡ بدأت الجولة ${session.typeRaceState.currentRound} من ${session.typeRaceState.totalRounds}! الكلمة الجديدة: [${session.typeRaceState.currentWord}]! اسرعوا في الشات!`
        });
      }
      break;
    }

    case 'TYPE_RACE_TIMEOUT': {
      if (!session.typeRaceState || session.typeRaceState.status !== 'WORD_ACTIVE') {
        return { success: false, message: 'لا توجد جولة كتابة نشطة حالياً' };
      }

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `⌛ انتهى وقت الكلمة [${session.typeRaceState.currentWord}] دون إجابة صحيحة!`
      });

      const lang = session.settings.typeRaceLanguage || session.typeRaceState.languageMode || 'AR';
      const result = advanceTypeRaceNextRound(session.typeRaceState, lang, session.players);

      if (result.isMatchOver) {
        session.status = 'FINISHED';
        session.winner = result.winner;
        session.timerEndsAt = null;
        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'WIN',
          message: result.winner
            ? `👑 انتهت جولات سباق السرعة! وتوّج #${result.winner.number} (${result.winner.displayName}) بطلاً للمنافسة! 🏆🎉`
            : `🏁 انتهت جولات سباق سرعة الكتابة!`
        });
      } else {
        const timeLimit = session.settings.typeRaceTimeLimitSeconds || 15;
        session.status = 'WORD_ACTIVE';
        session.turnDuration = timeLimit;
        session.timerEndsAt = new Date(Date.now() + timeLimit * 1000).toISOString();

        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          message: `⚡ بدأت الجولة ${session.typeRaceState.currentRound} من ${session.typeRaceState.totalRounds}! الكلمة الجديدة: [${session.typeRaceState.currentWord}]! اسرعوا في الشات!`
        });
      }
      break;
    }

    case 'TYPE_RACE_RESTART': {
      const target = session.settings.typeRaceTargetScore || 3;
      const rounds = session.settings.typeRaceTotalRounds || 7;
      const duration = session.settings.typeRaceTimeLimitSeconds || 15;
      const lang = session.settings.typeRaceLanguage || 'AR';

      session.typeRaceState = createInitialTypeRaceState(target, rounds, duration, lang);
      session.status = 'LOBBY';
      session.timerEndsAt = null;
      session.winner = null;

      session.players.forEach((p) => {
        p.score = 0;
        p.killsCount = 0;
      });

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: '🔄 تم إعادة تهيئة سباق سرعة الكتابة (Type Race) بنجاح!'
      });
      break;
    }

    // ================= HANGMAN / WORDLE GAME ACTIONS =================
    case 'HANGMAN_START_LOBBY': {
      const totalRounds = payload.totalRounds || session.settings.hangmanTotalRounds || 5;
      session.settings.hangmanTotalRounds = totalRounds;
      if (!session.hangmanState) {
        session.hangmanState = createInitialHangmanState(
          session.settings.hangmanTimeLimitSeconds || 60,
          session.settings.hangmanMaxAttempts || 5,
          totalRounds
        );
      } else {
        session.hangmanState.totalRounds = totalRounds;
      }
      session.hangmanState.status = 'SETTING_WORD';
      session.status = 'SETTING_WORD';
      session.timerEndsAt = null;
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🔤 الستريمر يقوم بإدخال الكلمة المخفية للجولة ${session.hangmanState.currentRound || 1} من ${totalRounds}... استعدوا في الشات!`
      });
      break;
    }

    case 'HANGMAN_SET_SECRET_WORD': {
      if (!session.hangmanState) {
        session.hangmanState = createInitialHangmanState(
          session.settings.hangmanTimeLimitSeconds || 60,
          session.settings.hangmanMaxAttempts || 5,
          session.settings.hangmanTotalRounds || 5
        );
      }

      const word = payload.secretWord || 'فورتنايت';
      const category = payload.category || 'ألعاب';
      const hint = payload.hint || '';
      const duration = session.settings.hangmanTimeLimitSeconds || 60;

      setHangmanSecretWord(session.hangmanState, word, category, hint, duration);
      session.status = 'GUESSING_ACTIVE';
      session.turnDuration = duration;
      session.timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🔒 الجولة ${session.hangmanState.currentRound || 1}/${session.hangmanState.totalRounds || 5}: تم قفل الكلمة السرية (${session.hangmanState.wordLength} حروف)! التصنيف: [${category}]. لكل متسابق 5 محاولات! انطلقوا بالتخمين في الشات! 🔥`
      });
      break;
    }

    case 'HANGMAN_SUBMIT_GUESS': {
      if (!session.hangmanState || session.hangmanState.status !== 'GUESSING_ACTIVE') {
        return { success: false, message: 'تحدي الكلمة غير نشط حالياً' };
      }

      const guess = payload.guessWord || '';
      const actor = payload.actorUsername || 'viewer';

      const result = submitHangmanGuess(session.hangmanState, actor, guess, session);

      if (result.log) {
        session.logs.unshift({
          id: result.log.id || crypto.randomUUID(),
          timestamp: result.log.timestamp || new Date().toISOString(),
          type: (result.log.type as any) || 'HANGMAN_GUESS',
          message: result.log.message || '',
          actor: result.log.actor
        });
      }

      if (result.isExactMatch && result.winner) {
        if (session.hangmanState.status === 'MATCH_OVER') {
          session.status = 'FINISHED';
          session.winner = result.winner;
          session.logs.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'WIN',
            message: `👑 اختتمت منافسات الكلمات المخفية وتوّج #${result.winner.number} (${result.winner.displayName}) بطلاً للتحدي! 🏆🎉`
          });
        } else {
          session.status = 'ROUND_RESOLVED';
        }
        session.timerEndsAt = null;
      }
      break;
    }

    case 'HANGMAN_REVEAL_HINT': {
      if (!session.hangmanState) {
        return { success: false, message: 'لا توجد لعبة جارية' };
      }
      if (payload.hint) {
        session.hangmanState.hint = payload.hint;
      }
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `💡 تلميح من الستريمر: [${session.hangmanState.hint || 'كلمة مميزة!'}]`
      });
      break;
    }

    case 'HANGMAN_RESOLVE_ROUND': {
      if (!session.hangmanState) {
        return { success: false, message: 'لا توجد لعبة جارية' };
      }

      const { log } = resolveHangmanRound(session.hangmanState, session);
      if (session.hangmanState.status === 'MATCH_OVER') {
        session.status = 'FINISHED';
        session.timerEndsAt = null;
        if (session.winner) {
          session.logs.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'WIN',
            message: `👑 اختتمت منافسات الكلمات وتوّج #${session.winner.number} (${session.winner.displayName}) بطلاً للتحدي! 🏆🎉`
          });
        }
      } else {
        session.status = 'ROUND_RESOLVED';
        session.timerEndsAt = null;
      }

      session.logs.unshift({
        id: log.id || crypto.randomUUID(),
        timestamp: log.timestamp || new Date().toISOString(),
        type: 'INFO',
        message: log.message || ''
      });
      break;
    }

    case 'HANGMAN_NEXT_ROUND': {
      if (!session.hangmanState) {
        return { success: false, message: 'لا توجد لعبة جارية' };
      }

      advanceHangmanNextRound(
        session,
        payload.secretWord,
        payload.category,
        payload.hint
      );

      if (session.hangmanState.status === 'MATCH_OVER') {
        session.status = 'FINISHED';
        session.timerEndsAt = null;
        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'WIN',
          message: session.winner
            ? `👑 انتهت منافسة تخمين الكلمات! وتوّج #${session.winner.number} (${session.winner.displayName}) بطلاً للتحدي! 🏆🎉`
            : `🏁 انتهت جولات تخمين الكلمات!`
        });
      } else if (session.hangmanState.status === 'GUESSING_ACTIVE') {
        const duration = session.settings.hangmanTimeLimitSeconds || 60;
        session.status = 'GUESSING_ACTIVE';
        session.turnDuration = duration;
        session.timerEndsAt = new Date(Date.now() + duration * 1000).toISOString();
        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          message: `🔒 بدأت الجولة ${session.hangmanState.currentRound} من ${session.hangmanState.totalRounds}! الكلمة السرية (${session.hangmanState.wordLength} حروف). التصنيف: [${session.hangmanState.category}]. انطلقوا بالتخمين في الشات! 🔥`
        });
      } else {
        session.status = 'SETTING_WORD';
        session.timerEndsAt = null;
        session.logs.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          message: `🔤 استعدوا للجولة ${session.hangmanState.currentRound} من ${session.hangmanState.totalRounds}! الستريمر يدخل الكلمة الجديدة...`
        });
      }
      break;
    }

    case 'HANGMAN_RESTART': {
      const timeLimit = session.settings.hangmanTimeLimitSeconds || 60;
      const maxAttempts = session.settings.hangmanMaxAttempts || 5;
      const totalRounds = session.settings.hangmanTotalRounds || 5;

      session.hangmanState = createInitialHangmanState(timeLimit, maxAttempts, totalRounds);
      session.status = 'LOBBY';
      session.timerEndsAt = null;
      session.winner = null;

      session.players.forEach((p) => {
        p.score = 0;
        p.killsCount = 0;
      });

      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: '🔄 تم إعادة ضبط تحدي تخمين الكلمة المخفية (Hangman) بنجاح!'
      });
      break;
    }

    case 'HOT_POTATO_START': {
      startHotPotatoRound(session);
      break;
    }

    case 'HOT_POTATO_PASS': {
      passHotPotato(session, payload.actorUsername || '', payload.passTarget);
      break;
    }

    case 'HOT_POTATO_RESOLVE_DETONATION': {
      resolveHotPotatoDetonation(session);
      break;
    }

    case 'HOT_POTATO_NEXT_ROUND': {
      startHotPotatoRound(session);
      break;
    }

    case 'HOT_POTATO_RESTART': {
      resetHotPotatoGame(session);
      break;
    }

    // ================= SUBWAY RUNNER GAME ACTIONS =================
    case 'SUBWAY_START': {
      startSubwayRunnerMatch(session);
      break;
    }

    case 'SUBWAY_SUBMIT_ACTION': {
      if (payload.subwayAction) {
        submitSubwayAction(session, payload.actorUsername || '', payload.subwayAction);
      }
      break;
    }

    case 'SUBWAY_RESOLVE_OBSTACLE': {
      resolveSubwayObstacle(session);
      break;
    }

    case 'SUBWAY_NEXT_ROUND': {
      advanceSubwayNextRound(session);
      break;
    }

    case 'SUBWAY_RESTART': {
      resetSubwayRunnerMatch(session);
      break;
    }

    // ================= LANGUAGE SELECTION ACTIONS =================
    case 'TYPE_RACE_SET_LANGUAGE': {
      const lang = payload.languageMode || 'AR';
      session.settings.typeRaceLanguage = lang;
      if (session.typeRaceState) {
        session.typeRaceState.languageMode = lang;
      }
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🌐 تم ضبط لغة سباق الكتابة إلى: ${lang === 'AR' ? 'العربية 🇸🇦' : lang === 'EN' ? 'English 🇺🇸' : 'مختلط (ثنائي) 🌐'}`
      });
      break;
    }

    case 'TRIVIA_SET_LANGUAGE': {
      const lang = payload.triviaLanguage || 'AR';
      session.settings.triviaLanguage = lang;
      if (session.triviaState) {
        session.triviaState.triviaLanguage = lang;
      }
      session.logs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🌐 تم ضبط لغة مسابقة الأسئلة إلى: ${lang === 'AR' ? 'العربية 🇸🇦' : lang === 'EN' ? 'English 🇺🇸' : 'كلاهما (ثنائي) 🌐'}`
      });
      break;
    }
  }

  session.updatedAt = new Date().toISOString();
  activeRooms.set(sessionId, session);
  broadcastGameEvent(sessionId, 'STATE_UPDATE', session);

  return { success: true, message: 'تم تنفيذ العملية بنجاح', session };
}

function checkWinCondition(session: IGameSession) {
  const alivePlayers = session.players.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED');
  if (alivePlayers.length === 1 && session.players.length > 1) {
    session.winner = alivePlayers[0];
    session.status = 'FINISHED';
    session.logs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'WIN',
      message: `🏆 مبروووك الفوز! المتسابق #${alivePlayers[0].number} (${alivePlayers[0].displayName}) هو الناجي الأخير وبطل الجولة!`,
      actor: alivePlayers[0].displayName
    });
  } else if (alivePlayers.length === 0 && session.players.length > 0) {
    session.status = 'FINISHED';
    session.winner = null;
    session.logs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: '💀 تم استبعاد جميع اللاعبين! لا يوجد فائز في هذه الجولة.'
    });
  }
}
