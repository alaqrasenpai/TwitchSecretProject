import type { IGameSession, IPlayer, IHotPotatoState, IHotPotatoPass } from '~/types/game';

/**
 * Creates the initial state for Hot Potato Bomb game
 */
export function createInitialHotPotatoState(): IHotPotatoState {
  return {
    status: 'LOBBY',
    currentHolderNumber: null,
    currentHolderUsername: null,
    currentHolderDisplayName: null,
    previousHolderNumber: null,
    fuseTotalDurationSeconds: 25,
    fuseEndsAt: 0,
    fuseRemainingSeconds: 25,
    fuseDangerLevel: 'COOL',
    roundNumber: 0,
    eliminatedPlayer: null,
    winner: null,
    totalPassesCount: 0,
    recentPasses: [],
    passCooldownUntil: 0
  };
}

/**
 * Starts a new Hot Potato Bomb round with a randomized fuse
 */
export function startHotPotatoRound(session: IGameSession): { success: boolean; message: string } {
  if (!session.hotPotatoState) {
    session.hotPotatoState = createInitialHotPotatoState();
  }

  const alivePlayers = session.players.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED');
  if (alivePlayers.length < 2) {
    if (alivePlayers.length === 1) {
      session.winner = alivePlayers[0];
      session.hotPotatoState.winner = alivePlayers[0];
      session.status = 'FINISHED';
      session.hotPotatoState.status = 'MATCH_OVER';
      return { success: false, message: `Cannot start: only 1 survivor left (${alivePlayers[0].displayName}).` };
    }
    return { success: false, message: 'Need at least 2 contenders to start Hot Potato.' };
  }

  // Pick a random alive starter
  const randomStarter = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

  // Randomized fuse between min and max (gets slightly more intense as contenders dwindle)
  const minFuse = session.settings?.hotPotatoMinFuseSeconds || 15;
  const maxFuse = session.settings?.hotPotatoMaxFuseSeconds || 35;
  // Dynamic scale: with fewer players, fuse is faster
  const dynamicMax = alivePlayers.length <= 3 ? Math.max(minFuse + 5, maxFuse - 8) : maxFuse;
  const fuseSeconds = Math.floor(Math.random() * (dynamicMax - minFuse + 1)) + minFuse;

  const now = Date.now();
  session.hotPotatoState.status = 'BOMB_TICKING';
  session.hotPotatoState.currentHolderNumber = randomStarter.number;
  session.hotPotatoState.currentHolderUsername = randomStarter.username;
  session.hotPotatoState.currentHolderDisplayName = randomStarter.displayName;
  session.hotPotatoState.previousHolderNumber = null;
  session.hotPotatoState.fuseTotalDurationSeconds = fuseSeconds;
  session.hotPotatoState.fuseEndsAt = now + fuseSeconds * 1000;
  session.hotPotatoState.fuseRemainingSeconds = fuseSeconds;
  session.hotPotatoState.fuseDangerLevel = 'COOL';
  session.hotPotatoState.roundNumber = (session.hotPotatoState.roundNumber || 0) + 1;
  session.hotPotatoState.eliminatedPlayer = null;
  session.hotPotatoState.passCooldownUntil = now + 500;

  session.status = 'BOMB_TICKING';
  session.activePlayerNumber = randomStarter.number;
  session.timerEndsAt = new Date(now + fuseSeconds * 1000).toISOString();

  // Add event log
  session.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: `💣 Round #${session.hotPotatoState.roundNumber} started! The ticking bomb was given to #${randomStarter.number} ${randomStarter.displayName}!`,
    actor: randomStarter.displayName
  });

  return { success: true, message: `Bomb given to #${randomStarter.number} ${randomStarter.displayName}` };
}

/**
 * Passes the ticking bomb from the current holder to a target player
 */
export function passHotPotato(
  session: IGameSession,
  actorUsername: string,
  passTarget?: string | number
): { success: boolean; message: string; targetPlayer?: IPlayer } {
  const state = session.hotPotatoState;
  if (!state || state.status !== 'BOMB_TICKING') {
    return { success: false, message: 'No active ticking bomb to pass right now.' };
  }

  const cleanActor = actorUsername.trim().toLowerCase();
  if (state.currentHolderUsername?.toLowerCase() !== cleanActor) {
    return {
      success: false,
      message: `Only the current bomb holder (${state.currentHolderDisplayName}) can pass the bomb!`
    };
  }

  const now = Date.now();
  if (now < state.passCooldownUntil) {
    return { success: false, message: 'Hot potato deflection cooldown! Try again in a split second.' };
  }

  // Check if fuse already expired
  if (now >= state.fuseEndsAt) {
    resolveHotPotatoDetonation(session);
    return { success: false, message: 'BOOM! The fuse expired right as you tried to pass!' };
  }

  const alivePlayers = session.players.filter(
    (p) => (p.status === 'ALIVE' || p.status === 'REVIVED') && p.number !== state.currentHolderNumber
  );

  if (alivePlayers.length === 0) {
    return { success: false, message: 'No other alive players to pass to!' };
  }

  let target: IPlayer | undefined;

  if (typeof passTarget === 'number') {
    target = alivePlayers.find((p) => p.number === passTarget);
  } else if (typeof passTarget === 'string' && passTarget.trim()) {
    const cleanTarget = passTarget.trim().toLowerCase().replace(/^[@#]/, '');
    const asNum = parseInt(cleanTarget, 10);
    if (!isNaN(asNum)) {
      target = alivePlayers.find((p) => p.number === asNum);
    } else {
      target = alivePlayers.find(
        (p) => p.username.toLowerCase() === cleanTarget || p.displayName.toLowerCase() === cleanTarget
      );
    }
  }

  // If no target found or random pass requested, pick a random alive player
  if (!target) {
    target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  }

  if (!target) {
    return { success: false, message: 'Could not find a valid target player.' };
  }

  const currentHolderPlayer = session.players.find((p) => p.number === state.currentHolderNumber);
  const fromDisplayName = currentHolderPlayer?.displayName || state.currentHolderDisplayName || 'Contender';
  const fromNumber = state.currentHolderNumber || 0;

  const passRecord: IHotPotatoPass = {
    id: `pass-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    fromNumber,
    fromUsername: state.currentHolderUsername || '',
    fromDisplayName,
    toNumber: target.number,
    toUsername: target.username,
    toDisplayName: target.displayName,
    timestamp: new Date().toISOString()
  };

  state.previousHolderNumber = state.currentHolderNumber;
  state.currentHolderNumber = target.number;
  state.currentHolderUsername = target.username;
  state.currentHolderDisplayName = target.displayName;
  state.totalPassesCount = (state.totalPassesCount || 0) + 1;
  state.recentPasses = [passRecord, ...(state.recentPasses || []).slice(0, 14)];
  state.passCooldownUntil = now + 400; // 400ms debounce

  session.activePlayerNumber = target.number;

  // Update danger level based on remaining time
  const remainingSec = Math.max(0, Math.ceil((state.fuseEndsAt - now) / 1000));
  state.fuseRemainingSeconds = remainingSec;
  if (remainingSec <= 5) {
    state.fuseDangerLevel = 'CRITICAL';
  } else if (remainingSec <= 12) {
    state.fuseDangerLevel = 'WARM';
  } else {
    state.fuseDangerLevel = 'COOL';
  }

  session.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'BOMB_PASS',
    message: `⚡ ${fromDisplayName} tossed the bomb to #${target.number} ${target.displayName}!`,
    actor: fromDisplayName,
    target: target.displayName
  });

  return { success: true, message: `Bomb passed to #${target.number} ${target.displayName}!`, targetPlayer: target };
}

/**
 * Resolves the explosion when the fuse runs out on the current holder
 */
export function resolveHotPotatoDetonation(session: IGameSession): {
  success: boolean;
  eliminatedPlayer: IPlayer | null;
  winner: IPlayer | null;
} {
  const state = session.hotPotatoState;
  if (!state || state.status !== 'BOMB_TICKING') {
    return { success: false, eliminatedPlayer: null, winner: null };
  }

  const holder = session.players.find((p) => p.number === state.currentHolderNumber);
  if (holder) {
    holder.status = 'ELIMINATED';
    state.eliminatedPlayer = holder;
  }

  state.status = 'BOMB_EXPLODED';
  session.status = 'BOMB_EXPLODED';
  state.fuseRemainingSeconds = 0;
  state.fuseDangerLevel = 'CRITICAL';

  session.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'BOMB_EXPLODE',
    message: `💥 BOOM! The bomb detonated! #${holder?.number || '?'} ${holder?.displayName || 'Contender'} was holding it and is ELIMINATED!`,
    actor: holder?.displayName
  });

  // Check remaining alive players
  const alivePlayers = session.players.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED');

  if (alivePlayers.length === 1) {
    // We have a winner!
    const victor = alivePlayers[0];
    state.winner = victor;
    session.winner = victor;
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';

    session.logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'WIN',
      message: `👑 ${victor.displayName} survived the Hot Potato Bomb and is crowned Champion!`,
      actor: victor.displayName
    });

    return { success: true, eliminatedPlayer: holder || null, winner: victor };
  }

  if (alivePlayers.length === 0) {
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';
    return { success: true, eliminatedPlayer: holder || null, winner: null };
  }

  return { success: true, eliminatedPlayer: holder || null, winner: null };
}

/**
 * Resets the Hot Potato game state back to lobby
 */
export function resetHotPotatoGame(session: IGameSession): void {
  session.hotPotatoState = createInitialHotPotatoState();
  session.status = 'LOBBY';
  session.winner = null;
  session.activePlayerNumber = null;
  session.targetPlayerNumber = null;
  session.timerEndsAt = null;

  // Revive all players for next game
  session.players.forEach((p) => {
    p.status = 'ALIVE';
    p.revivesUsed = 0;
    p.timesRevived = 0;
  });

  session.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: '↺ Hot Potato Bomb lobby has been reset! All players revived for the next match.'
  });
}
