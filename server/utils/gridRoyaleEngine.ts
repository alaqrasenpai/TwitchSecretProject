import type {
  IGameSession,
  IGridRoyaleState,
  IGridRoyaleTile,
  IPlayer,
  IGameLog
} from '~/types/game';

export const ROW_LABELS = ['A', 'B', 'C', 'D'];
export const COL_LABELS = ['1', '2', '3', '4'];

export function createInitialGridTiles(capacity: number = 1): IGridRoyaleTile[] {
  const tiles: IGridRoyaleTile[] = [];
  let index = 1;

  for (let r = 0; r < ROW_LABELS.length; r++) {
    for (let c = 0; c < COL_LABELS.length; c++) {
      const rowLetter = ROW_LABELS[r];
      const colNum = COL_LABELS[c];
      const id = `${rowLetter}${colNum}`;

      tiles.push({
        id,
        label: id,
        row: r,
        col: c,
        index,
        status: 'SAFE',
        maxCapacity: capacity,
        occupants: []
      });
      index++;
    }
  }

  return tiles;
}

export function createInitialGridRoyaleState(
  capacity: number = 1,
  waveTime: number = 10
): IGridRoyaleState {
  const tiles = createInitialGridTiles(capacity);

  return {
    status: 'LOBBY',
    waveNumber: 1,
    maxWaves: 4,
    gridSize: 4,
    tileCapacity: capacity,
    tiles,
    timeRemainingSeconds: waveTime,
    alivePlayersCount: 0,
    eliminatedThisWave: [],
    safeTilesCount: tiles.length,
    winner: null
  };
}

export function prepareWaveStorm(
  state: IGridRoyaleState,
  wave: number
): { safeTilesCount: number; warningCount: number } {
  state.waveNumber = wave;

  state.tiles.forEach((t) => {
    t.occupants = [];
  });

  const centerIds = ['B2', 'B3', 'C2', 'C3'];
  const innerRingIds = ['A2', 'A3', 'B1', 'B4', 'C1', 'C4', 'D2', 'D3'];
  const outerCornerIds = ['A1', 'A4', 'D1', 'D4'];

  if (wave === 1) {
    state.tiles.forEach((t) => {
      if (outerCornerIds.includes(t.id)) {
        t.status = 'COLLAPSED';
      } else {
        t.status = 'SAFE';
      }
    });
  } else if (wave === 2) {
    state.tiles.forEach((t) => {
      if (centerIds.includes(t.id) || ['B1', 'C4'].includes(t.id)) {
        t.status = 'SAFE';
      } else {
        t.status = 'COLLAPSED';
      }
    });
  } else if (wave === 3) {
    state.tiles.forEach((t) => {
      if (centerIds.includes(t.id)) {
        t.status = 'SAFE';
      } else {
        t.status = 'COLLAPSED';
      }
    });
  } else {
    const pickedCenter = centerIds[Math.floor(Math.random() * centerIds.length)];
    state.tiles.forEach((t) => {
      if (t.id === pickedCenter) {
        t.status = 'SAFE';
      } else {
        t.status = 'COLLAPSED';
      }
    });
  }

  state.safeTilesCount = state.tiles.filter((t) => t.status === 'SAFE').length;
  state.eliminatedThisWave = [];

  return {
    safeTilesCount: state.safeTilesCount,
    warningCount: state.tiles.filter((t) => t.status === 'WARNING').length
  };
}

export function claimGridTile(
  state: IGridRoyaleState,
  username: string,
  rawTarget: string,
  session: IGameSession
): {
  success: boolean;
  messageAr: string;
  messageEn: string;
  tile?: IGridRoyaleTile;
} {
  const cleanUser = username.toLowerCase().trim();
  const player = session.players.find((p) => p.username.toLowerCase() === cleanUser);

  if (!player) {
    return {
      success: false,
      messageAr: 'يجب الانضمام للعبة أولاً بكتابة !join',
      messageEn: 'Must join lobby first by typing !join'
    };
  }

  if (player.status !== 'ALIVE' && player.status !== 'REVIVED') {
    return {
      success: false,
      messageAr: `${player.displayName} مستبعد من حلبة البقاء!`,
      messageEn: `${player.displayName} is eliminated!`
    };
  }

  if (state.status !== 'WAVE_ACTIVE') {
    return {
      success: false,
      messageAr: 'الحلبة غير نشطة حالياً للحركة!',
      messageEn: 'Grid Royale wave is not currently active!'
    };
  }

  const cleanTarget = rawTarget.toUpperCase().trim().replace(/^!/, '');
  const targetNum = parseInt(cleanTarget, 10);

  const targetTile = state.tiles.find((t) => {
    if (t.id.toUpperCase() === cleanTarget) return true;
    if (!isNaN(targetNum) && t.index === targetNum) return true;
    return false;
  });

  if (!targetTile) {
    return {
      success: false,
      messageAr: `المربع [${cleanTarget}] غير موجود في الحلبة! (اختر من A1 إلى D4 أو 1 إلى 16)`,
      messageEn: `Tile [${cleanTarget}] not found! (Choose A1..D4 or 1..16)`
    };
  }

  if (targetTile.status === 'COLLAPSED') {
    return {
      success: false,
      messageAr: `⚠️ المربع [${targetTile.id}] ابتلعته العاصفة ومحرم الوقوف فيه!`,
      messageEn: `⚠️ Tile [${targetTile.id}] is swallowed by the storm!`
    };
  }

  if (targetTile.occupants.includes(cleanUser)) {
    return {
      success: true,
      messageAr: `✅ ${player.displayName} متمركز بالفعل في المربع [${targetTile.id}]!`,
      messageEn: `✅ ${player.displayName} is already on tile [${targetTile.id}]!`,
      tile: targetTile
    };
  }

  if (targetTile.occupants.length >= targetTile.maxCapacity) {
    const occupant = targetTile.occupants[0];
    return {
      success: false,
      messageAr: `❌ المربع [${targetTile.id}] ممتلئ بالكامل ومحجوز بواسطة @${occupant}! ابحث عن مربع آخر فوراً!`,
      messageEn: `❌ Tile [${targetTile.id}] is already full (claimed by @${occupant})! Find another spot quickly!`
    };
  }

  state.tiles.forEach((t) => {
    t.occupants = t.occupants.filter((u) => u !== cleanUser);
  });

  targetTile.occupants.push(cleanUser);

  return {
    success: true,
    messageAr: `🏃‍♂️ حجز ${player.displayName} المربع الآمن [${targetTile.id}] بنجاح (${targetTile.occupants.length}/${targetTile.maxCapacity})!`,
    messageEn: `🏃‍♂️ ${player.displayName} secured safe spot [${targetTile.id}] (${targetTile.occupants.length}/${targetTile.maxCapacity})!`,
    tile: targetTile
  };
}

export function resolveGridWave(
  state: IGridRoyaleState,
  session: IGameSession
): {
  survivors: IPlayer[];
  eliminated: IPlayer[];
  isGameOver: boolean;
  winner: IPlayer | null;
  logs: Partial<IGameLog>[];
} {
  state.status = 'WAVE_RESOLVING';
  const logs: Partial<IGameLog>[] = [];
  const safeUsers = new Set<string>();

  state.tiles.forEach((t) => {
    if (t.status === 'SAFE') {
      t.occupants.forEach((u) => safeUsers.add(u.toLowerCase()));
    }
  });

  const survivors: IPlayer[] = [];
  const eliminated: IPlayer[] = [];

  session.players.forEach((player) => {
    if (player.status !== 'ALIVE' && player.status !== 'REVIVED') return;

    const cleanUser = player.username.toLowerCase();
    if (safeUsers.has(cleanUser)) {
      survivors.push(player);
      player.killsCount = (player.killsCount || 0) + 1;
    } else {
      player.status = 'ELIMINATED';
      eliminated.push(player);
      state.eliminatedThisWave.push(player.displayName);

      logs.push({
        id: `grid-elim-${player.number}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'KILL',
        message: `💀 ابتلعت العاصفة المتسابق #${player.number} (${player.displayName}) لعدم وصوله لمربع آمن في الوقت المناسب!`,
        target: player.displayName
      });
    }
  });

  state.alivePlayersCount = survivors.length;

  let isGameOver = false;
  let winner: IPlayer | null = null;

  if (survivors.length === 1) {
    isGameOver = true;
    winner = survivors[0];
    state.winner = winner;
    state.status = 'MATCH_OVER';
    session.winner = winner;
    session.status = 'FINISHED';

    logs.push({
      id: `grid-winner-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'WIN',
      message: `👑 مبروووك الفوز الأسطوري! المتسابق #${winner.number} (${winner.displayName}) هو الناجي الأخير وبطل حلبة البقاء (Grid Royale)! 🎉`,
      actor: winner.displayName
    });
  } else if (survivors.length === 0) {
    isGameOver = true;
    state.status = 'MATCH_OVER';
    session.status = 'FINISHED';

    logs.push({
      id: `grid-wipe-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: '💥 ابتلعت العاصفة جميع المتسابقين! انتهت الحلبة بدون ناجين.'
    });
  } else if (state.waveNumber >= state.maxWaves) {
    isGameOver = true;
    winner = survivors[0];
    state.winner = winner;
    state.status = 'MATCH_OVER';
    session.winner = winner;
    session.status = 'FINISHED';

    logs.push({
      id: `grid-survived-all-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'WIN',
      message: `🏆 صمد ${survivors.length} متسابقين حتى النهاية! الفائز الأول بالقرعة: ${winner.displayName}!`,
      actor: winner.displayName
    });
  }

  return {
    survivors,
    eliminated,
    isGameOver,
    winner,
    logs
  };
}
