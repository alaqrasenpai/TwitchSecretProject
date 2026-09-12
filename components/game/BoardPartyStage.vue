<script setup lang="ts">
import type { IGameSession, IBoardPartyState, IBoardTile, TeamId, MoveDirection } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';
import DiceRoller from '~/components/game/DiceRoller.vue';
import BoardTeamTriviaMinigame from '~/components/game/BoardTeamTriviaMinigame.vue';

const props = defineProps<{
  session: IGameSession;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: 'start-game'): void;
  (e: 'roll-dice'): void;
  (e: 'submit-direction', dir: MoveDirection): void;
  (e: 'select-direction', dir: MoveDirection): void;
  (e: 'next-turn'): void;
  (e: 'trigger-minigame', type?: string): void;
  (e: 'submit-minigame-action', payload: any): void;
  (e: 'resolve-minigame'): void;
  (e: 'next-round'): void;
  (e: 'restart-game'): void;
  (e: 'toggle-team', payload: { teamId: TeamId; enabled: boolean }): void;
  (e: 'shuffle-teams'): void;
  (e: 'set-map', mapTheme: 'winter_outpost' | 'suburbia_town'): void;
}>();

const { t, isRtl } = useTranslation();

const boardState = computed<IBoardPartyState | null>(() => props.session.boardPartyState || null);
const teams = computed(() => boardState.value?.teams);
const activeTeam = computed(() => {
  if (!boardState.value || !teams.value) return null;
  return teams.value[boardState.value.activeTeamId];
});

const currentMapTheme = computed<'winter_outpost' | 'suburbia_town'>(() => {
  return boardState.value?.mapTheme || 'winter_outpost';
});

const allTeamIds: TeamId[] = ['crimson', 'cobalt', 'emerald', 'amber'];

// Enabled teams sorted by rank (trophies desc, coins desc)
const rankedTeams = computed(() => {
  if (!teams.value) return [];
  return allTeamIds
    .filter((id) => teams.value![id]?.enabled)
    .sort((a, b) => {
      const ta = teams.value![a];
      const tb = teams.value![b];
      const scoreA = (ta.trophies * 1000) + ta.coins;
      const scoreB = (tb.trophies * 1000) + tb.coins;
      return scoreB - scoreA;
    });
});

const rankBadges = ['1ST', '2ND', '3RD', '4TH'];

// Map coordinates for 0..100% responsive Board Canvas
function getTilePositionStyle(tile: IBoardTile) {
  return {
    left: `${tile.x}%`,
    top: `${tile.y}%`
  };
}

// Calculate SVG path connections with directional and fork flags
const pathConnections = computed(() => {
  if (!boardState.value?.tiles) return [];
  const lines: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    id: string;
    isFork: boolean;
    fromIndex: number;
    toIndex: number;
  }[] = [];
  const processed = new Set<string>();

  for (const tile of boardState.value.tiles) {
    if (!tile.neighbors) continue;
    const x1 = tile.x;
    const y1 = tile.y;
    const neighborEntries = Object.entries(tile.neighbors).filter(([_, nIdx]) => nIdx !== undefined);
    const isFork = neighborEntries.length > 1;

    for (const [dir, neighborIndex] of neighborEntries) {
      if (neighborIndex === undefined) continue;
      const neighbor = boardState.value.tiles.find((t) => t.index === neighborIndex);
      if (!neighbor) continue;

      const key = `${tile.index}->${neighbor.index}`;
      if (processed.has(key)) continue;
      processed.add(key);

      const x2 = neighbor.x;
      const y2 = neighbor.y;
      lines.push({
        x1,
        y1,
        x2,
        y2,
        id: key,
        isFork,
        fromIndex: tile.index,
        toIndex: neighbor.index
      });
    }
  }
  return lines;
});

function getTeamPawnsOnTile(tileIndex: number) {
  if (!teams.value) return [];
  const list = [];
  for (const id of allTeamIds) {
    const tm = teams.value[id];
    if (tm && tm.enabled && tm.tileIndex === tileIndex) {
      list.push(tm);
    }
  }
  return list;
}

const directionLabels: Record<MoveDirection, { ar: string; en: string; icon: string }> = {
  up: { ar: 'أعلى ↑', en: 'Up ↑', icon: '⬆️' },
  down: { ar: 'أسفل ↓', en: 'Down ↓', icon: '⬇️' },
  left: { ar: 'يسار ←', en: 'Left ←', icon: '⬅️' },
  right: { ar: 'يمين →', en: 'Right →', icon: '➡️' }
};

function getTileIcon(type: string) {
  switch (type) {
    case 'START': return '🏁';
    case 'COIN_10': return '🗝️';
    case 'COIN_20': return '💰';
    case 'TRAP': return '☠️';
    case 'EVENT': return '❗';
    case 'SHOP': return '➕';
    case 'WARP': return '🌀';
    default: return '●';
  }
}

function getTileThemeClass(tile: IBoardTile) {
  if (tile.index === boardState.value?.trophyTileIndex) {
    return 'trophy-pad shadow-[0_0_35px_rgba(245,158,11,0.9)] scale-110 z-25 border-amber-400 bg-amber-950/90 text-amber-300';
  }
  switch (tile.type) {
    case 'START':
      return 'border-emerald-500/90 bg-emerald-950/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    case 'COIN_10':
      return 'border-amber-600/70 bg-[#261c14]/90 text-amber-300';
    case 'COIN_20':
      return 'border-yellow-400/80 bg-yellow-950/80 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
    case 'TRAP':
      return 'border-red-600/80 bg-red-950/80 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    case 'EVENT':
      return 'border-purple-500/80 bg-purple-950/80 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
    case 'SHOP':
      return 'border-teal-500/80 bg-teal-950/80 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.4)]';
    default:
      return 'border-slate-600 bg-slate-900/80 text-slate-300';
  }
}
</script>

<template>
  <div v-if="boardState" class="relative flex-1 p-2 sm:p-4 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden min-h-0 select-none border-2 border-slate-800 transition-colors duration-700" :class="currentMapTheme === 'winter_outpost' ? 'bg-[#0f172a]' : 'bg-[#142314]'">
    <!-- ================= AUTHENTIC MAP THEME TERRAIN BACKDROPS ================= -->
    <!-- MAP 1: WINTER OUTPOST (Snow Mountain) Backdrop -->
    <template v-if="currentMapTheme === 'winter_outpost'">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617] pointer-events-none" />
      <div class="absolute inset-0 bg-[radial-gradient(#38bdf815_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-50" />

      <!-- Left Glacier Oval Lake -->
      <div class="absolute top-[28%] left-[4%] w-[32%] h-[56%] rounded-full bg-cyan-950/40 border-2 border-cyan-500/20 blur-[1px] pointer-events-none" />

      <!-- Central Railway Wooden Bridge Spine Overlay -->
      <div class="absolute top-[18%] left-[54%] -translate-x-1/2 w-[7%] h-[60%] bg-[#2d1b0f] border-x-2 border-amber-800/60 rounded-md shadow-2xl pointer-events-none opacity-80 flex flex-col justify-between py-2">
        <div v-for="n in 12" :key="n" class="w-full h-1 bg-amber-900/80" />
      </div>

      <!-- Top Ice Crystal Cave Cavern Glow -->
      <div class="absolute top-[8%] left-[50%] -translate-x-1/2 w-32 h-20 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none animate-pulse-slow" />
      <div class="absolute top-[10%] left-[50%] -translate-x-1/2 text-2xl pointer-events-none drop-shadow-[0_0_15px_cyan]">
        🏔️
      </div>

      <!-- Right Forest Cozy Cabin Area -->
      <div class="absolute top-[64%] left-[70%] text-3xl pointer-events-none opacity-80">
        🛖
      </div>

      <!-- Scattered Pine Trees & Snow Rocks -->
      <div class="absolute top-[15%] left-[82%] text-lg pointer-events-none opacity-70">🌲</div>
      <div class="absolute top-[35%] left-[86%] text-xl pointer-events-none opacity-70">🌲</div>
      <div class="absolute top-[48%] left-[74%] text-base pointer-events-none opacity-60">🌲</div>
      <div class="absolute top-[22%] left-[24%] text-lg pointer-events-none opacity-70">❄️</div>
      <div class="absolute top-[68%] left-[10%] text-xl pointer-events-none opacity-70">❄️</div>
      <div class="absolute top-[40%] left-[48%] text-base pointer-events-none opacity-80">🏮</div>
      <div class="absolute top-[60%] left-[48%] text-base pointer-events-none opacity-80">🏮</div>
    </template>

    <!-- MAP 2: SUBURBIA TOWN Backdrop -->
    <template v-else>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1c3319] via-[#0f1d0d] to-[#080d07] pointer-events-none" />
      <div class="absolute inset-0 bg-[radial-gradient(#84cc1615_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      <!-- Left Houses Area Background -->
      <div class="absolute top-[12%] left-[6%] w-[26%] h-[76%] rounded-3xl bg-emerald-950/30 border border-emerald-800/30 pointer-events-none flex flex-col justify-around items-center opacity-80">
        <span class="text-4xl">🏡</span>
        <span class="text-4xl">🏠</span>
      </div>

      <!-- Central Asphalt Boulevard Road with White Zebra Crossings -->
      <div class="absolute top-[16%] left-[45%] -translate-x-1/2 w-[8%] h-[68%] bg-[#171717] border-x-2 border-slate-700/80 pointer-events-none shadow-2xl flex flex-col justify-around items-center">
        <div v-for="n in 8" :key="n" class="w-1.5 h-6 bg-yellow-400/80 rounded-full" />
      </div>

      <!-- Pedestrian Crosswalks (Horizontal) -->
      <div class="absolute top-[42%] left-[28%] w-[16%] h-[3.5%] bg-slate-800/80 border-y border-white/40 flex items-center justify-around pointer-events-none">
        <div v-for="n in 6" :key="n" class="w-2 h-full bg-white/60" />
      </div>
      <div class="absolute top-[20%] left-[28%] w-[16%] h-[3.5%] bg-slate-800/80 border-y border-white/40 flex items-center justify-around pointer-events-none">
        <div v-for="n in 6" :key="n" class="w-2 h-full bg-white/60" />
      </div>
      <div class="absolute top-[67%] left-[28%] w-[16%] h-[3.5%] bg-slate-800/80 border-y border-white/40 flex items-center justify-around pointer-events-none">
        <div v-for="n in 6" :key="n" class="w-2 h-full bg-white/60" />
      </div>

      <!-- Top Center Fenced Community Garden Patch -->
      <div class="absolute top-[8%] left-[48%] w-[18%] h-[26%] bg-amber-950/30 border-2 border-amber-700/40 rounded-2xl pointer-events-none flex items-center justify-center">
        <span class="text-2xl opacity-70">🥕 🌻 🌾</span>
      </div>

      <!-- Top Right Church & Diner -->
      <div class="absolute top-[24%] left-[72%] text-3xl pointer-events-none opacity-80">⛪</div>
      <div class="absolute top-[50%] left-[88%] text-3xl pointer-events-none opacity-80">🍔</div>

      <!-- Bottom Right Haunted Spooky Graveyard -->
      <div class="absolute top-[62%] left-[52%] w-[42%] h-[32%] rounded-3xl bg-[#1c141d]/70 border-2 border-purple-900/40 pointer-events-none flex items-center justify-around">
        <span class="text-3xl opacity-70">🪦</span>
        <span class="text-4xl opacity-80 drop-shadow-[0_0_10px_purple]">🌳</span>
        <span class="text-3xl opacity-70">🪦</span>
      </div>
    </template>

    <!-- ================= PUMMEL PARTY TOP HUD ================= -->
    <div class="relative z-30 flex items-start justify-between gap-4 pointer-events-none shrink-0">
      <!-- Top Left: Pummel Party Stacked Player/Team Cards -->
      <div class="flex flex-col gap-1.5 w-64 sm:w-72 pointer-events-auto">
        <div
          v-for="(teamId, idx) in rankedTeams"
          :key="teamId"
          :class="[
            'relative px-3 py-1.5 rounded-xl border transition-all flex items-center justify-between overflow-hidden backdrop-blur-md',
            boardState.activeTeamId === teamId && boardState.status !== 'LOBBY'
              ? 'bg-black/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] ring-2 ring-amber-400/80 scale-102 z-10'
              : 'bg-black/70 border-slate-800/90 text-slate-300'
          ]"
        >
          <!-- Left Team Color Ribbon -->
          <div
            class="absolute top-0 bottom-0 left-0 w-2.5 shadow-sm"
            :style="{ backgroundColor: boardState.teams[teamId]?.color }"
          />

          <!-- Team Info & Stats -->
          <div class="flex items-center gap-2 pl-2">
            <span class="text-base">{{ boardState.teams[teamId]?.pawnIcon || '👑' }}</span>
            <div class="leading-tight">
              <div class="text-xs font-cairo font-black text-white flex items-center gap-1.5">
                <span>{{ isRtl ? boardState.teams[teamId]?.nameAr : boardState.teams[teamId]?.nameEn }}</span>
                <span v-if="boardState.activeTeamId === teamId && boardState.status !== 'LOBBY'" class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-black font-black animate-pulse">
                  TURN
                </span>
              </div>
              <!-- Trophies, Keys & Members Row -->
              <div class="flex items-center gap-3 text-[11px] font-tajawal text-slate-200 mt-0.5">
                <span class="inline-flex items-center gap-0.5 text-amber-300 font-bold">
                  🏆 {{ boardState.teams[teamId]?.trophies }}
                </span>
                <span class="inline-flex items-center gap-0.5 text-yellow-400 font-bold">
                  🗝️ {{ boardState.teams[teamId]?.coins }}
                </span>
                <span class="inline-flex items-center gap-0.5 text-slate-400 text-[10px]">
                  👥 {{ boardState.teams[teamId]?.membersCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rank Badge (1st, 2nd, 3rd, 4th) -->
          <div
            :class="[
              'px-2 py-0.5 rounded-lg text-[10px] font-display font-black tracking-wider',
              idx === 0 ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.8)]' : (idx === 1 ? 'bg-slate-300 text-black' : (idx === 2 ? 'bg-amber-800 text-white' : 'bg-slate-800 text-slate-400'))
            ]"
          >
            {{ rankBadges[idx] }}
          </div>
        </div>
      </div>

      <!-- Top Right: Pummel Party Game Tracker HUD & Map Info -->
      <div class="flex flex-col items-end gap-1.5 pointer-events-auto">
        <div class="px-4 py-2 rounded-2xl bg-black/85 border border-amber-500/40 shadow-xl text-right backdrop-blur-md space-y-1">
          <!-- Active Map Badge -->
          <div class="flex items-center justify-end gap-1.5 text-[11px] font-cairo text-cyan-300 font-bold border-b border-slate-800 pb-1">
            <span>🗺️</span>
            <span>{{ currentMapTheme === 'winter_outpost' ? (isRtl ? 'القمة الثلجية' : 'Winter Outpost') : (isRtl ? 'حي الضواحي' : 'Suburbia Town') }}</span>
          </div>

          <!-- Trophy Target Price (Strict Purchase Price) -->
          <div class="flex items-center justify-end gap-2 text-xs font-cairo text-slate-300">
            <span>{{ isRtl ? 'سعر الكأس:' : 'Trophy Cost:' }}</span>
            <span class="font-black text-amber-400 text-sm flex items-center gap-1">
              🏆 {{ boardState.trophyPrice }} 🗝️
            </span>
          </div>

          <!-- Round Tracker -->
          <div class="flex items-center justify-end gap-2 text-xs font-cairo text-slate-300">
            <span>{{ isRtl ? `الجولة: ${boardState.roundNumber} / ${boardState.maxRounds}` : `Round: ${boardState.roundNumber} / ${boardState.maxRounds}` }}</span>
          </div>

          <!-- Turn Order Sequence Blocks -->
          <div class="flex items-center gap-1 pt-0.5 justify-end">
            <span class="text-[10px] font-cairo text-slate-400 mr-1">{{ isRtl ? 'الدور:' : 'Order:' }}</span>
            <div
              v-for="teamId in rankedTeams"
              :key="teamId"
              class="w-3.5 h-3.5 rounded-md border"
              :class="boardState.activeTeamId === teamId ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-60'"
              :style="{ backgroundColor: boardState.teams[teamId]?.color, borderColor: 'rgba(255,255,255,0.4)' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ================= PUMMEL PARTY 3D ISOMETRIC BOARD STAGE ================= -->
    <div class="relative flex-1 my-2 min-h-[380px] sm:min-h-[480px] flex items-center justify-center overflow-hidden">
      <!-- 100% Scaled Responsive Board Canvas Container -->
      <div class="relative w-full h-full max-w-6xl max-h-[620px] isometric-board-viewport">
        <!-- SVG Ground Path Arrows & Directional Lines -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <!-- Standard White/Yellow Arrow Marker -->
            <marker id="path-arrow-standard" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fef08a" opacity="0.9" />
            </marker>
            <!-- PUMMEL PARTY RED FORK INTERSECTION ARROW MARKER -->
            <marker id="path-arrow-fork-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" stroke="#ffffff" stroke-width="0.8" />
            </marker>
          </defs>

          <g v-for="line in pathConnections" :key="line.id">
            <!-- Under path glow -->
            <line
              :x1="`${line.x1}%`"
              :y1="`${line.y1}%`"
              :x2="`${line.x2}%`"
              :y2="`${line.y2}%`"
              :stroke="line.isFork ? '#ef4444' : '#d97706'"
              :stroke-width="line.isFork ? '4' : '3'"
              stroke-opacity="0.35"
              stroke-linecap="round"
            />
            <!-- Main Path Line with Arrowhead -->
            <line
              :x1="`${line.x1}%`"
              :y1="`${line.y1}%`"
              :x2="`${line.x2}%`"
              :y2="`${line.y2}%`"
              :stroke="line.isFork ? '#ef4444' : '#fef08a'"
              :stroke-width="line.isFork ? '2.5' : '1.8'"
              :stroke-dasharray="line.isFork ? 'none' : '5 4'"
              stroke-linecap="round"
              :marker-end="line.isFork ? 'url(#path-arrow-fork-red)' : 'url(#path-arrow-standard)'"
            />
          </g>
        </svg>

        <!-- 3D Stepped Octagonal Tile Pads -->
        <div
          v-for="tile in boardState.tiles"
          :key="tile.index"
          class="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300 group"
          :style="getTilePositionStyle(tile)"
        >
          <!-- 3D Stepped Octagonal Pad -->
          <div
            :class="[
              'pummel-octagonal-pad relative flex items-center justify-center transition-all duration-300 border-2 rounded-xl',
              getTileThemeClass(tile),
              tile.index === boardState.trophyTileIndex ? 'trophy-pad' : 'hover:scale-110'
            ]"
          >
            <!-- Vertical Beacon Beam for Trophy Tile -->
            <div v-if="tile.index === boardState.trophyTileIndex" class="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-48 bg-gradient-to-t from-amber-400/90 via-yellow-300/30 to-transparent blur-sm pointer-events-none animate-pulse-slow" />

            <!-- Floating 3D Trophy Model on Trophy Pad -->
            <div v-if="tile.index === boardState.trophyTileIndex" class="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-30">
              <span class="text-3xl drop-shadow-[0_0_15px_rgba(255,215,0,1)]">🏆</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-black shadow-md border border-white whitespace-nowrap">
                {{ boardState.trophyPrice }} 🗝️
              </span>
            </div>

            <!-- In-Pad Symbol -->
            <div class="pad-symbol text-base sm:text-lg drop-shadow font-bold">
              {{ getTileIcon(tile.type) }}
            </div>

            <!-- Tile Index Badge (Small) -->
            <div class="absolute -bottom-2 -right-2 px-1 py-0.2 rounded bg-black/85 border border-slate-600 text-[8px] font-mono text-slate-300">
              #{{ tile.index }}
            </div>
          </div>

          <!-- Character Figurines / Pawns standing on this tile -->
          <div class="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 z-30 pointer-events-none">
            <div
              v-for="pawnTeam in getTeamPawnsOnTile(tile.index)"
              :key="pawnTeam.id"
              :class="[
                'pummel-character-pawn flex flex-col items-center animate-bob transition-all duration-500',
                boardState.activeTeamId === pawnTeam.id ? 'scale-125 z-40' : 'scale-95 opacity-90'
              ]"
            >
              <!-- Floating Active Turn Arrow Indicator -->
              <div v-if="boardState.activeTeamId === pawnTeam.id && boardState.status === 'TEAM_TURN'" class="text-amber-400 text-xs animate-bounce font-black drop-shadow-[0_0_5px_gold]">
                ▼
              </div>

              <!-- 3D Character Avatar / Mascot -->
              <div
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl border-2 flex items-center justify-center text-lg shadow-2xl relative"
                :style="{
                  backgroundColor: pawnTeam.color,
                  borderColor: '#ffffff',
                  boxShadow: `0 0 20px ${pawnTeam.color}aa`
                }"
              >
                <span>{{ pawnTeam.icon }}</span>
                <div class="absolute -bottom-2 w-7 h-2 bg-black/60 rounded-full blur-[1px]" />
              </div>

              <!-- Team Short Label -->
              <span class="px-1 rounded text-[8px] font-cairo font-black bg-black/90 text-white shadow mt-0.5">
                {{ pawnTeam.nameEn.split(' ')[0] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= DIRECTION CHOICE VOTING MODAL ================= -->
    <div
      v-if="boardState.status === 'DIRECTION_CHOICE' && boardState.directionChoice"
      class="absolute inset-x-4 top-20 z-40 max-w-xl mx-auto p-5 bg-[#121624]/98 border-2 border-amber-400/90 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.4)] backdrop-blur-2xl text-center space-y-4 animate-scale-up"
    >
      <div class="flex items-center justify-between border-b border-amber-500/40 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-2xl animate-spin-slow">🧭</span>
          <h3 class="font-cairo font-black text-lg sm:text-xl text-white">
            {{ isRtl ? `مفترق طرق! صوتوا يا فريق ${activeTeam?.nameAr}!` : `Intersection! Vote ${activeTeam?.nameEn}!` }}
          </h3>
        </div>
        <span class="px-3 py-1 rounded-full bg-amber-950 text-amber-300 font-display font-black text-sm border border-amber-500/40">
          ⏱️ {{ boardState.directionChoice.timeRemainingSeconds }}s
        </span>
      </div>

      <p class="text-xs font-tajawal text-slate-300">
        {{ isRtl ? 'صوتوا في الشات بكتابة الأمر المطلوب لتوجيه حركة الفريق:' : 'Team members vote in chat to choose movement direction:' }}
      </p>

      <!-- Direction Voting Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          v-for="dir in boardState.directionChoice.availableDirections"
          :key="dir"
          type="button"
          class="p-3 rounded-2xl bg-black/60 border-2 border-red-500/70 hover:border-amber-400 text-white hover:bg-amber-950/40 transition-all flex flex-col items-center justify-between space-y-1.5 group shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          @click="isAdmin ? emit('select-direction', dir) : emit('submit-direction', dir)"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform">
            {{ directionLabels[dir]?.icon }}
          </span>
          <span class="font-cairo font-black text-xs">
            {{ isRtl ? directionLabels[dir]?.ar : directionLabels[dir]?.en }}
          </span>
          <span class="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
            {{ boardState.directionChoice.voteCounts[dir] || 0 }} {{ isRtl ? 'صوت' : 'votes' }}
          </span>
        </button>
      </div>

      <div v-if="isAdmin" class="pt-2">
        <span class="text-[11px] font-tajawal text-slate-400 block">
          {{ isRtl ? 'بإمكان الستريمر النقر مباشرة على أي اتجاه لتخطي التصويت' : 'Streamer can click any direction above to override' }}
        </span>
      </div>
    </div>

    <!-- ================= INTEGRATED MINIGAMES MODAL VIEW (TRIVIA ONLY) ================= -->
    <div
      v-if="boardState.status === 'MINIGAME' && boardState.minigameState"
      class="absolute inset-0 z-50 p-4 bg-black/92 backdrop-blur-2xl flex items-center justify-center overflow-y-auto"
    >
      <BoardTeamTriviaMinigame
        :board-state="boardState"
        :minigame="boardState.minigameState"
        :is-admin="isAdmin"
        @submit-vote="(choice) => emit('submit-minigame-action', { choice })"
        @resolve="emit('resolve-minigame')"
      />
    </div>

    <!-- ================= ROUND END / CHAMPION REVEAL ================= -->
    <div
      v-if="boardState.status === 'ROUND_END' || boardState.status === 'MATCH_OVER'"
      class="absolute inset-0 z-40 p-6 bg-black/92 backdrop-blur-2xl flex flex-col items-center justify-center space-y-6 text-center animate-fade-in"
    >
      <!-- Final Match Over / Grand Teams Scoreboard -->
      <div v-if="boardState.status === 'MATCH_OVER'" class="space-y-4 max-w-xl w-full">
        <div class="inline-flex items-center gap-2 px-4 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/50 rounded-full text-xs font-cairo font-black uppercase tracking-widest shadow-glow-gold">
          🏆 {{ isRtl ? 'لوحة الشرف ونتائج حرب المتاهة النهائية' : 'PUMMEL MAZE WAR FINAL SCOREBOARD' }}
        </div>

        <!-- Champion Team Card -->
        <div class="p-5 rounded-2xl bg-black/85 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="text-4xl shrink-0">{{ boardState.teams[boardState.winnerTeamId || 'crimson']?.icon }}</div>
            <div :class="isRtl ? 'text-right' : 'text-left'" class="min-w-0">
              <div class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {{ isRtl ? 'الفريق البطل الفائز بالمركز الأول 👑' : 'CHAMPION TEAM & 1ST PLACE 👑' }}
              </div>
              <div class="text-2xl font-black text-white font-cairo truncate">
                {{ isRtl ? boardState.teams[boardState.winnerTeamId || 'crimson']?.nameAr : boardState.teams[boardState.winnerTeamId || 'crimson']?.nameEn }}
              </div>
              <div class="text-xs text-amber-300 font-mono">
                👥 {{ boardState.teams[boardState.winnerTeamId || 'crimson']?.membersCount }} {{ isRtl ? 'لاعب في الفريق' : 'team members' }}
              </div>
            </div>
          </div>

          <div class="text-right font-mono shrink-0">
            <div class="text-base font-black text-amber-300">
              🏆 {{ boardState.teams[boardState.winnerTeamId || 'crimson']?.trophies }} {{ isRtl ? 'كؤوس' : 'Trophies' }}
            </div>
            <div class="text-xs text-yellow-400 font-bold">
              🪙 {{ boardState.teams[boardState.winnerTeamId || 'crimson']?.coins }} {{ isRtl ? 'عملة' : 'Coins' }}
            </div>
          </div>
        </div>

        <!-- Full Teams Leaderboard Table -->
        <div class="space-y-1.5" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="flex items-center justify-between text-xs font-cairo font-bold text-amber-300 px-1">
            <span>📊 {{ isRtl ? 'ترتيب الفرق النهائي حسب الكؤوس والعملات:' : 'Final Teams Leaderboard & Rankings:' }}</span>
            <span class="text-[10px] font-mono text-slate-400">{{ rankedTeams.length }} {{ isRtl ? 'فرق' : 'teams' }}</span>
          </div>

          <div class="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
            <template v-for="(tId, idx) in rankedTeams" :key="tId">
              <div
                class="flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs transition-all"
                :class="[
                  idx === 0 ? 'bg-amber-950/60 border-amber-400/80 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                  idx === 1 ? 'bg-slate-800/80 border-slate-600 text-slate-200' :
                  idx === 2 ? 'bg-amber-950/30 border-amber-800 text-amber-200' :
                  'bg-slate-950/60 border-slate-800 text-slate-400'
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span class="font-mono font-bold text-xs shrink-0" :class="idx < 3 ? 'text-amber-400' : 'text-slate-500'">
                    {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                  </span>
                  <span class="text-2xl">{{ teams?.[tId]?.icon }}</span>
                  <div class="min-w-0">
                    <div class="font-cairo font-bold text-white text-sm truncate">
                      {{ isRtl ? teams?.[tId]?.nameAr : teams?.[tId]?.nameEn }}
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono">
                      {{ teams?.[tId]?.membersCount }} {{ isRtl ? 'مشارك' : 'members' }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4 font-mono shrink-0">
                  <span class="text-amber-300 font-bold">
                    🏆 {{ teams?.[tId]?.trophies }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-black text-xs">
                    🪙 {{ teams?.[tId]?.coins }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <button
          v-if="isAdmin"
          type="button"
          class="px-8 py-2.5 rounded-full font-cairo font-black text-xs bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xl hover:brightness-110 active:scale-95 transition"
          @click="emit('restart-game')"
        >
          🔄 {{ isRtl ? 'بدء مباراة جديدة' : 'Start New Match' }}
        </button>
      </div>

      <div v-else class="space-y-4 max-w-lg">
        <span class="text-4xl">🏁</span>
        <h2 class="text-2xl sm:text-3xl font-cairo font-black text-white">
          {{ isRtl ? `اكتملت الجولة ${boardState.roundNumber}!` : `Round ${boardState.roundNumber} Completed!` }}
        </h2>
        <p class="text-sm font-tajawal text-slate-300">
          {{ isRtl ? 'تم توزيع عملات الميني جيم وتحديث لوحة الصدارة. هل أنتم جاهزون للجولة التالية؟' : 'Minigame rewards awarded! Ready for next round?' }}
        </p>

        <button
          v-if="isAdmin"
          type="button"
          class="px-8 py-3 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-glow-amber hover:brightness-110"
          @click="emit('next-round')"
        >
          ⚡ {{ isRtl ? 'الانطلاق إلى الجولة التالية' : 'Launch Next Round' }}
        </button>
      </div>
    </div>

    <!-- ================= STREAMER BOTTOM CONTROLS & LOBBY BAR ================= -->
    <div class="relative z-30 p-3 bg-black/85 border border-slate-800 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
      <!-- Left: Map Selector & Team Management -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Map Selector (Winter Outpost vs Suburbia Town) -->
        <div v-if="boardState.status === 'LOBBY' && isAdmin" class="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-cairo font-bold transition-all flex items-center gap-1',
              currentMapTheme === 'winter_outpost' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow' : 'text-slate-400 hover:text-white'
            ]"
            @click="emit('set-map', 'winter_outpost')"
          >
            <span>❄️</span>
            <span>{{ isRtl ? 'القمة الثلجية' : 'Winter' }}</span>
          </button>
          <button
            type="button"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-cairo font-bold transition-all flex items-center gap-1',
              currentMapTheme === 'suburbia_town' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow' : 'text-slate-400 hover:text-white'
            ]"
            @click="emit('set-map', 'suburbia_town')"
          >
            <span>🏘️</span>
            <span>{{ isRtl ? 'حي الضواحي' : 'Suburbia' }}</span>
          </button>
        </div>

        <!-- Team Toggles (Crimson, Cobalt, Emerald, Amber) -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            v-for="id in allTeamIds"
            :key="id"
            type="button"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-cairo font-bold transition-all flex items-center gap-1',
              boardState.teams[id]?.enabled
                ? 'bg-slate-800 text-white border border-slate-600 shadow'
                : 'text-slate-600 opacity-40 hover:opacity-80'
            ]"
            :title="isRtl ? `تفعيل/تعطيل ${boardState.teams[id]?.nameAr}` : `Toggle ${boardState.teams[id]?.nameEn}`"
            @click="isAdmin ? emit('toggle-team', { teamId: id, enabled: !boardState.teams[id]?.enabled }) : null"
          >
            <span>{{ boardState.teams[id]?.icon }}</span>
            <span class="hidden sm:inline">{{ isRtl ? boardState.teams[id]?.nameAr.split(' ')[1] : boardState.teams[id]?.nameEn.split(' ')[0] }}</span>
          </button>
        </div>

        <!-- Shuffle Teams Button -->
        <button
          v-if="isAdmin"
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-cairo font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow"
          :title="isRtl ? 'إعادة خلط وتوزيع المشاهدين عشوائياً بين الفرق' : 'Shuffle players evenly across active teams'"
          @click="emit('shuffle-teams')"
        >
          <span>🔀</span>
          <span>{{ isRtl ? 'خلط الفرق' : 'Shuffle Teams' }}</span>
        </button>
      </div>

      <!-- Right: Dice Roll & Actions -->
      <div class="flex items-center gap-3">
        <!-- Start Game Button in Lobby -->
        <button
          v-if="boardState.status === 'LOBBY' && isAdmin"
          type="button"
          class="px-6 py-2 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow-glow-amber transition-all"
          @click="emit('start-game')"
        >
          🚀 {{ isRtl ? 'بدء اللعبة (Start Game)' : 'Start Game' }}
        </button>

        <!-- Streamer Roll Dice Button -->
        <div v-if="boardState.status === 'TEAM_TURN'" class="flex items-center gap-3">
          <div class="text-xs font-cairo text-right hidden sm:block">
            <span class="text-slate-400 block">{{ isRtl ? 'دور الفريق النشط:' : 'Active Turn:' }}</span>
            <span class="font-black text-white" :style="{ color: activeTeam?.color }">
              {{ isRtl ? activeTeam?.nameAr : activeTeam?.nameEn }}
            </span>
          </div>

          <button
            v-if="isAdmin"
            type="button"
            class="px-6 py-2.5 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-white shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center gap-2"
            @click="emit('roll-dice')"
          >
            <span>🎲</span>
            <span>{{ isRtl ? 'رمي النرد (Roll)' : 'Roll Dice' }}</span>
          </button>
        </div>

        <!-- Next Turn Button when Tile Action Completed -->
        <button
          v-if="boardState.status === 'TILE_ACTION' && isAdmin"
          type="button"
          class="px-5 py-2 rounded-full font-cairo font-black text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-all flex items-center gap-1.5"
          @click="emit('next-turn')"
        >
          <span>▶️</span>
          <span>{{ isRtl ? 'الدور التالي' : 'Next Turn' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Pummel Party 2.5D Stepped Octagonal Tile Design */
.pummel-octagonal-pad {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  box-shadow: 0 4px 0 #0d0a08, 0 8px 15px rgba(0, 0, 0, 0.7);
  transform: rotateX(15deg);
}

.trophy-pad {
  border-color: #fbbf24 !important;
  box-shadow: 0 6px 0 #451a03, 0 10px 25px rgba(245, 158, 11, 0.8) !important;
}

.pad-symbol {
  transform: rotateX(-15deg);
}

/* Character Figurines Bobbing */
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-bob {
  animation: bob 2s ease-in-out infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}
</style>
