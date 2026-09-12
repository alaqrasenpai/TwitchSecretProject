import type {
  IGameSession,
  IPlayer,
  ISubwayRunnerState,
  ISubwayObstacle,
  ISubwayContender,
  SubwayAction,
  SubwayLane
} from '~/types/game';

/**
 * Creates the initial state for the Subway Runner chat mini-game
 */
export function createInitialSubwayRunnerState(): ISubwayRunnerState {
  return {
    status: 'LOBBY',
    currentRound: 1,
    totalRounds: 5,
    obstaclesInRound: 0,
    targetObstaclesPerRound: 4,
    distanceMeters: 0,
    speedLevel: 1,
    runnerLane: 'MIDDLE',
    runnerAnimation: 'RUN',
    currentObstacle: null,
    obstaclesPassedCount: 0,
    contenders: {},
    survivorsCount: 0,
    winner: null,
    recentEvents: []
  };
}

/**
 * Generates an obstacle based on current speed level and round number
 */
export function generateSubwayObstacle(
  speedLevel: number,
  currentLane: SubwayLane = 'MIDDLE',
  roundNumber: number = 1
): ISubwayObstacle {
  let obstacleChoices: Array<{
    type: ISubwayObstacle['type'];
    requiredAction: SubwayAction;
    labelAr: string;
    labelEn: string;
    lane: SubwayLane;
  }> = [];

  if (currentLane === 'LEFT') {
    // Runner is in leftmost track: CANNOT GO LEFT! Only RIGHT, JUMP, or DUCK!
    // The oncoming threat appears directly on the LEFT track heading toward the runner.
    obstacleChoices = [
      {
        type: 'LOW_BARRIER',
        requiredAction: 'JUMP',
        labelAr: '⬆️ حاجز في مسارك! اقفز! (JUMP)',
        labelEn: '⬆️ BARRIER AHEAD! JUMP!',
        lane: 'LEFT'
      },
      {
        type: 'HIGH_BARRIER',
        requiredAction: 'DUCK',
        labelAr: '⬇️ عائق علوي في مسارك! انزل! (DUCK)',
        labelEn: '⬇️ HIGH OBSTACLE! DUCK!',
        lane: 'LEFT'
      },
      {
        type: 'TRAIN_LEFT',
        requiredAction: 'RIGHT',
        labelAr: '➡️ قطار قادم في مسارك! اهرب يميناً! (RIGHT)',
        labelEn: '➡️ TRAIN IN LANE! DODGE RIGHT!',
        lane: 'LEFT'
      },
      {
        type: 'ROCK',
        requiredAction: 'RIGHT',
        labelAr: '➡️ صخرة عملاقة في مسارك! تفادَ يميناً! (RIGHT)',
        labelEn: '➡️ ROCK IN LANE! DODGE RIGHT!',
        lane: 'LEFT'
      }
    ];
  } else if (currentLane === 'RIGHT') {
    // Runner is in rightmost track: CANNOT GO RIGHT! Only LEFT, JUMP, or DUCK!
    // The oncoming threat appears directly on the RIGHT track heading toward the runner.
    obstacleChoices = [
      {
        type: 'LOW_BARRIER',
        requiredAction: 'JUMP',
        labelAr: '⬆️ حاجز في مسارك! اقفز! (JUMP)',
        labelEn: '⬆️ BARRIER AHEAD! JUMP!',
        lane: 'RIGHT'
      },
      {
        type: 'HIGH_BARRIER',
        requiredAction: 'DUCK',
        labelAr: '⬇️ عائق علوي في مسارك! انزل! (DUCK)',
        labelEn: '⬇️ HIGH OBSTACLE! DUCK!',
        lane: 'RIGHT'
      },
      {
        type: 'TRAIN_RIGHT',
        requiredAction: 'LEFT',
        labelAr: '⬅️ قطار قادم في مسارك! اهرب يساراً! (LEFT)',
        labelEn: '⬅️ TRAIN IN LANE! DODGE LEFT!',
        lane: 'RIGHT'
      },
      {
        type: 'ROCK',
        requiredAction: 'LEFT',
        labelAr: '⬅️ صخرة عملاقة في مسارك! تفادَ يساراً! (LEFT)',
        labelEn: '⬅️ ROCK IN LANE! DODGE LEFT!',
        lane: 'RIGHT'
      }
    ];
  } else {
    // Runner is in MIDDLE track: Can dodge LEFT, dodge RIGHT, JUMP, or DUCK!
    obstacleChoices = [
      {
        type: 'LOW_BARRIER',
        requiredAction: 'JUMP',
        labelAr: '⬆️ حاجز في مسارك! اقفز! (JUMP)',
        labelEn: '⬆️ BARRIER AHEAD! JUMP!',
        lane: 'MIDDLE'
      },
      {
        type: 'HIGH_BARRIER',
        requiredAction: 'DUCK',
        labelAr: '⬇️ عائق علوي في مسارك! انزل! (DUCK)',
        labelEn: '⬇️ HIGH OBSTACLE! DUCK!',
        lane: 'MIDDLE'
      },
      {
        type: 'TRAIN_LEFT',
        requiredAction: 'LEFT',
        labelAr: '⬅️ قطار في الوسط! اهرب يساراً! (LEFT)',
        labelEn: '⬅️ TRAIN IN MIDDLE! DODGE LEFT!',
        lane: 'MIDDLE'
      },
      {
        type: 'TRAIN_RIGHT',
        requiredAction: 'RIGHT',
        labelAr: '➡️ قطار في الوسط! اهرب يميناً! (RIGHT)',
        labelEn: '➡️ TRAIN IN MIDDLE! DODGE RIGHT!',
        lane: 'MIDDLE'
      },
      {
        type: 'ROCK',
        requiredAction: Math.random() > 0.5 ? 'LEFT' : 'RIGHT',
        labelAr: '⚡ صخرة في مسارك! غير مسارك فوراً!',
        labelEn: '⚡ ROCK IN LANE! CHANGE LANE!',
        lane: 'MIDDLE'
      }
    ];
  }

  const picked = obstacleChoices[Math.floor(Math.random() * obstacleChoices.length)];

  // Speed and reaction scaling per round:
  const effectiveRound = Math.max(roundNumber, speedLevel);
  const timeLimit = Math.max(1.1, Number((4.0 - (effectiveRound - 1) * 0.65).toFixed(1)));
  const now = Date.now();

  return {
    id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: picked.type,
    requiredAction: picked.requiredAction,
    labelAr: picked.labelAr,
    labelEn: picked.labelEn,
    timeLimitSeconds: timeLimit,
    deadline: now + timeLimit * 1000,
    lane: picked.lane
  };
}

/**
 * Starts a new Subway Runner match
 */
export function startSubwayRunnerMatch(session: IGameSession): { success: boolean; message: string } {
  if (!session.subwayRunnerState) {
    session.subwayRunnerState = createInitialSubwayRunnerState();
  }

  if (session.players.length === 0) {
    const streamer = session.streamerUsername || 'Streamer';
    session.players.push({
      id: `p_${streamer.toLowerCase()}_${Date.now()}`,
      number: 1,
      username: streamer.toLowerCase(),
      displayName: streamer,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${streamer.toLowerCase()}`,
      status: 'ALIVE',
      revivesUsed: 0,
      timesRevived: 0,
      killsCount: 0,
      score: 0,
      joinedAt: new Date().toISOString()
    });
  }

  // Ensure all existing players are marked ALIVE for the new match
  session.players.forEach((p) => {
    p.status = 'ALIVE';
  });

  const contenders: Record<string, ISubwayContender> = {};
  const activePlayers = session.players.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED');

  activePlayers.forEach((p) => {
    contenders[p.username.toLowerCase()] = {
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      hearts: 3, // Each starts with 3 lives
      status: 'ALIVE',
      score: 0,
      successfulDodges: 0
    };
  });

  const totalRounds = session.settings?.subwayTotalRounds || 5;
  const targetObstacles = session.settings?.subwayObstaclesPerRound || 4;

  const state = session.subwayRunnerState;
  state.status = 'RUNNING';
  state.currentRound = 1;
  state.totalRounds = totalRounds;
  state.obstaclesInRound = 0;
  state.targetObstaclesPerRound = targetObstacles;
  state.distanceMeters = 0;
  state.speedLevel = 1;
  state.runnerLane = 'MIDDLE';
  state.runnerAnimation = 'RUN';
  state.obstaclesPassedCount = 0;
  state.contenders = contenders;
  state.survivorsCount = activePlayers.length;
  state.winner = null;
  state.recentEvents = [];

  // Spawn first obstacle of Round 1
  const firstObstacle = generateSubwayObstacle(1, 'MIDDLE', 1);
  state.currentObstacle = firstObstacle;

  session.status = 'SUBWAY_RUNNING';
  session.turnDuration = firstObstacle.timeLimitSeconds;
  session.timerEndsAt = new Date(firstObstacle.deadline).toISOString();

  session.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: `🚇 انطلقت لعبة مسار الهروب (Subway Runner) - الجولة 1 من ${totalRounds}! السرعة: 1x (وقت الاستجابة ${firstObstacle.timeLimitSeconds}s)!`
  });

  return { success: true, message: 'Subway Runner match started!' };
}

/**
 * Submits a chatter movement action (jump, duck, left, right)
 */
export function submitSubwayAction(
  session: IGameSession,
  actorUsername: string,
  rawAction: string
): { success: boolean; message: string; dodged?: boolean } {
  const state = session.subwayRunnerState;
  if (!state || state.status !== 'RUNNING' || !state.currentObstacle) {
    return { success: false, message: 'No active obstacle to dodge right now.' };
  }

  const cleanUser = actorUsername.trim().toLowerCase();
  let contender = state.contenders[cleanUser];

  // Auto register participant dynamically if not already in contenders
  if (!contender) {
    let sessionPlayer = session.players.find((p) => p.username.toLowerCase() === cleanUser);
    if (!sessionPlayer) {
      sessionPlayer = {
        id: `p_${cleanUser}_${Date.now()}`,
        number: session.players.length + 1,
        username: cleanUser,
        displayName: actorUsername,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
        status: 'ALIVE',
        revivesUsed: 0,
        timesRevived: 0,
        killsCount: 0,
        score: 0,
        joinedAt: new Date().toISOString()
      };
      session.players.push(sessionPlayer);
    }
    contender = {
      username: sessionPlayer.username,
      displayName: sessionPlayer.displayName,
      avatarUrl: sessionPlayer.avatarUrl,
      hearts: 3,
      status: 'ALIVE',
      score: 0,
      successfulDodges: 0
    };
    state.contenders[cleanUser] = contender;
    state.survivorsCount = Object.values(state.contenders).filter((c) => c.status === 'ALIVE').length;
  }

  if (!contender || contender.status !== 'ALIVE') {
    return { success: false, message: 'You are eliminated or not in the match!' };
  }

  const obstacle = state.currentObstacle;
  const now = Date.now();
  if (now > obstacle.deadline) {
    return { success: false, message: 'Too late! The obstacle already hit.' };
  }

  // Parse action
  const cleanCmd = rawAction.trim().toLowerCase().replace(/^!/, '');
  let action: SubwayAction | null = null;

  if (['jump', 'jumb', 'jmp', 'قفز', 'نط', 'up'].includes(cleanCmd)) {
    action = 'JUMP';
  } else if (['duck', 'down', 'roll', 'slide', 'انزل', 'تحت', 'دحرج'].includes(cleanCmd)) {
    action = 'DUCK';
  } else if (['right', 'r', 'يمين'].includes(cleanCmd)) {
    action = 'RIGHT';
  } else if (['left', 'l', 'يسار', 'شمال'].includes(cleanCmd)) {
    action = 'LEFT';
  }

  if (!action) {
    return { success: false, message: 'Unknown subway command.' };
  }

  const isCorrect = action === obstacle.requiredAction;
  if (isCorrect) {
    const reactionMs = Math.max(50, Math.round(now - (obstacle.deadline - obstacle.timeLimitSeconds * 1000)));
    contender.successfulDodges = (contender.successfulDodges || 0) + 1;
    contender.score = (contender.score || 0) + 100 * state.speedLevel;
    contender.lastReactionMs = reactionMs;

    // Trigger visual dodge animation on runner
    if (action === 'JUMP') state.runnerAnimation = 'JUMP';
    else if (action === 'DUCK') state.runnerAnimation = 'DUCK';
    else if (action === 'RIGHT') {
      state.runnerAnimation = 'SWITCH_RIGHT';
      if (state.runnerLane === 'LEFT' || obstacle.lane === 'LEFT') {
        state.runnerLane = 'MIDDLE';
      } else if (state.runnerLane === 'MIDDLE') {
        state.runnerLane = 'RIGHT';
      }
    } else if (action === 'LEFT') {
      state.runnerAnimation = 'SWITCH_LEFT';
      if (state.runnerLane === 'RIGHT' || obstacle.lane === 'RIGHT') {
        state.runnerLane = 'MIDDLE';
      } else if (state.runnerLane === 'MIDDLE') {
        state.runnerLane = 'LEFT';
      }
    }

    state.recentEvents.unshift({
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text: `⚡ ${contender.displayName} تفادى العائق ببراعة! (${reactionMs}ms)`,
      type: 'DODGE'
    });

    return { success: true, message: `Great dodge by ${contender.displayName}!`, dodged: true };
  }

  return { success: false, message: 'Wrong move for this obstacle!' };
}

/**
 * Resolves the obstacle when deadline expires:
 * Deducts hearts from contenders who failed to dodge, speeds up, and spawns next obstacle.
 */
export function resolveSubwayObstacle(session: IGameSession): {
  success: boolean;
  isGameOver: boolean;
  winner: IPlayer | null;
} {
  const state = session.subwayRunnerState;
  if (!state || state.status !== 'RUNNING' || !state.currentObstacle) {
    return { success: false, isGameOver: false, winner: null };
  }

  const obstacle = state.currentObstacle;
  const aliveContenders = Object.values(state.contenders).filter((c) => c.status === 'ALIVE');

  // Check contenders who dodged
  aliveContenders.forEach((c) => {
    // If player didn't record a dodge in this obstacle window
    if (!c.lastReactionMs || c.lastReactionMs <= 0) {
      // Safety guard: if runner is already at boundary (LEFT and obstacle asked LEFT, or RIGHT and obstacle asked RIGHT)
      const isBoundaryNoOp =
        (obstacle.requiredAction === 'LEFT' && state.runnerLane === 'LEFT') ||
        (obstacle.requiredAction === 'RIGHT' && state.runnerLane === 'RIGHT');

      if (isBoundaryNoOp) {
        // Player is already safely at boundary edge, no hearts lost!
        return;
      }

      c.hearts = Math.max(0, c.hearts - 1);
      if (c.hearts <= 0) {
        c.status = 'ELIMINATED';
        const sessionP = session.players.find((p) => p.username.toLowerCase() === c.username.toLowerCase());
        if (sessionP) sessionP.status = 'ELIMINATED';

        state.recentEvents.unshift({
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          text: `💀 اصطدم ${c.displayName} بالعائق ونفدت قلوبه فتم استبعاده!`,
          type: 'ELIMINATED'
        });
      } else {
        state.recentEvents.unshift({
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          text: `💔 اصطدم ${c.displayName} وفقد قلباً! (المتبقي: ${c.hearts} ❤️)`,
          type: 'CRASH'
        });
      }
    }
    // Reset reaction for next obstacle
    c.lastReactionMs = 0;
  });

  state.obstaclesPassedCount = (state.obstaclesPassedCount || 0) + 1;
  state.obstaclesInRound = (state.obstaclesInRound || 0) + 1;
  state.distanceMeters += 80 + state.speedLevel * 35;

  // Check remaining survivors
  const remainingAlive = Object.values(state.contenders).filter((c) => c.status === 'ALIVE');
  const totalContendersCount = Object.keys(state.contenders).length;
  state.survivorsCount = remainingAlive.length;

  if (remainingAlive.length === 1 && totalContendersCount > 1) {
    const victorContender = remainingAlive[0];
    const victorPlayer = session.players.find((p) => p.username.toLowerCase() === victorContender.username.toLowerCase()) || null;
    state.winner = victorPlayer;
    session.winner = victorPlayer;
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';

    session.logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'WIN',
      message: `👑 بطل ركض المترو! فاز ${victorContender.displayName} بالمركز الأول بعد صموده لمسافة ${state.distanceMeters} متر! 🏆`
    });

    return { success: true, isGameOver: true, winner: victorPlayer };
  }

  if (remainingAlive.length === 0) {
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';
    session.logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: `🏁 انتهى السباق! صمد الجميع لمسافة ${state.distanceMeters} متر!`
    });
    return { success: true, isGameOver: true, winner: null };
  }

  // Check if current round's obstacles have been cleared!
  const targetPerRound = state.targetObstaclesPerRound || 4;
  if (state.obstaclesInRound >= targetPerRound) {
    const roundCleared = state.currentRound;
    const totalRounds = state.totalRounds || 5;

    // Award bonus score for surviving the round
    remainingAlive.forEach((c) => {
      c.score = (c.score || 0) + 300 * roundCleared;
    });

    if (roundCleared >= totalRounds) {
      // All rounds completed!
      state.status = 'MATCH_OVER';
      session.status = 'FINISHED';

      const sortedWinners = [...remainingAlive].sort((a, b) => (b.score || 0) - (a.score || 0));
      const champion = sortedWinners[0];
      const championPlayer = champion ? (session.players.find((p) => p.username.toLowerCase() === champion.username.toLowerCase()) || null) : null;
      state.winner = championPlayer;
      session.winner = championPlayer;

      session.logs.unshift({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'WIN',
        message: `🏆 أساطير مسار الهروب السريع! تم اجتياز جميع الجولات الـ ${totalRounds} بنجاح! البطل المتوج: ${champion?.displayName || 'الناجون'} بمجموع نقاط ${champion?.score || 0}! 🎉`
      });

      return { success: true, isGameOver: true, winner: championPlayer };
    } else {
      // Advance to ROUND_CLEAR transition
      state.status = 'ROUND_CLEAR';
      state.currentObstacle = null;
      session.status = 'SUBWAY_RUNNING';
      session.timerEndsAt = null;

      state.recentEvents.unshift({
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        text: `🎉 تم اجتياز الجولة ${roundCleared} بنجاح! الجولة القادمة (${roundCleared + 1} من ${totalRounds}) أسرع وأصعب! ⚡`,
        type: 'ROUND_CLEAR'
      });

      session.logs.unshift({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `🏁 اكتملت الجولة ${roundCleared} من ${totalRounds}! الاستعداد للجولة ${roundCleared + 1} - السرعة تتضاعف!`
      });

      return { success: true, isGameOver: false, winner: null };
    }
  }

  // Continue within current round: spawn next obstacle
  state.runnerAnimation = 'RUN';
  const nextObs = generateSubwayObstacle(state.speedLevel, state.runnerLane, state.currentRound);
  state.currentObstacle = nextObs;

  session.turnDuration = nextObs.timeLimitSeconds;
  session.timerEndsAt = new Date(nextObs.deadline).toISOString();

  return { success: true, isGameOver: false, winner: null };
}

/**
 * Advances the match to the next round with increased speed
 */
export function advanceSubwayNextRound(session: IGameSession): { success: boolean; message: string } {
  const state = session.subwayRunnerState;
  if (!state || state.status !== 'ROUND_CLEAR') {
    return { success: false, message: 'Not currently in round transition.' };
  }

  const remainingAlive = Object.values(state.contenders).filter((c) => c.status === 'ALIVE');
  if (remainingAlive.length === 0) {
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';
    return { success: false, message: 'No survivors remaining.' };
  }

  state.currentRound += 1;
  state.speedLevel = state.currentRound;
  state.obstaclesInRound = 0;
  state.status = 'RUNNING';
  state.runnerAnimation = 'RUN';

  const nextObs = generateSubwayObstacle(state.speedLevel, state.runnerLane, state.currentRound);
  state.currentObstacle = nextObs;

  session.status = 'SUBWAY_RUNNING';
  session.turnDuration = nextObs.timeLimitSeconds;
  session.timerEndsAt = new Date(nextObs.deadline).toISOString();

  state.recentEvents.unshift({
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    text: `⚡ انطلقت الجولة ${state.currentRound}! السرعة تضاعفت إلى ${state.speedLevel}x! وقت الاستجابة ${nextObs.timeLimitSeconds}s!`,
    type: 'SPEED_UP'
  });

  session.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: `🚀 انطلقت الجولة ${state.currentRound} من ${state.totalRounds}! السرعة: ${state.speedLevel}x - استجيبوا فوراً للأوامر في الشات!`
  });

  return { success: true, message: `Advanced to Round ${state.currentRound}!` };
}

/**
 * Resets the Subway Runner match back to lobby
 */
export function resetSubwayRunnerMatch(session: IGameSession): void {
  session.subwayRunnerState = createInitialSubwayRunnerState();
  session.status = 'LOBBY';
  session.winner = null;
  session.timerEndsAt = null;

  session.players.forEach((p) => {
    p.status = 'ALIVE';
  });

  session.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: '↺ تم إعادة ضبط مضمار المترو (Subway Runner)! اللوبي جاهز لبدء سباق جديد.'
  });
}
