<script setup lang="ts">
import type { IGameSession, IGridRoyaleState, IGridRoyaleTile, IPlayer } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';

const props = defineProps<{
  session: IGameSession;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: 'start-game'): void;
  (e: 'next-wave'): void;
  (e: 'resolve-wave'): void;
  (e: 'restart-game'): void;
  (e: 'move-tile', tileId: string): void;
}>();

const { t, isRtl } = useTranslation();

const gridState = computed<IGridRoyaleState | null>(() => props.session.gridRoyaleState || null);
const players = computed(() => props.session.players || []);
const alivePlayers = computed(() => players.value.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED'));
const eliminatedPlayers = computed(() => players.value.filter((p) => p.status === 'ELIMINATED'));

const rowLetters = ['A', 'B', 'C', 'D'];
const colNumbers = ['1', '2', '3', '4'];

function getTileAt(r: number, c: number): IGridRoyaleTile | undefined {
  return gridState.value?.tiles.find((tile) => tile.row === r && tile.col === c);
}

function getPlayerByUsername(username: string): IPlayer | undefined {
  return players.value.find((p) => p.username.toLowerCase() === username.toLowerCase());
}

function getTileStatusClass(tile: IGridRoyaleTile) {
  if (tile.status === 'COLLAPSED') {
    return 'bg-red-950/80 border-red-600/90 text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] opacity-60 pointer-events-none';
  }
  if (tile.status === 'WARNING') {
    return 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse';
  }
  if (tile.occupants.length >= tile.maxCapacity) {
    return 'bg-indigo-950/90 border-indigo-400 text-indigo-200 shadow-[0_0_25px_rgba(99,102,241,0.6)] ring-1 ring-indigo-400';
  }
  return 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:border-emerald-300 hover:scale-[1.02] cursor-pointer';
}
</script>

<template>
  <div
    v-if="gridState"
    class="relative flex-1 p-3 sm:p-5 bg-[#090b14] border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden min-h-0 select-none"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <!-- Cyberpunk Battle Royale Grid Background -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#070913] to-[#030408] pointer-events-none" />
    <div class="absolute inset-0 bg-[radial-gradient(#06b6d415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

    <!-- ================= GRID ROYALE TOP HUD ================= -->
    <div class="relative z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/80 border border-cyan-500/40 backdrop-blur-xl shadow-xl">
      <!-- Title & Wave Info -->
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 border border-cyan-400 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse">
          ⚡
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-cairo font-black text-white">
              {{ isRtl ? 'حلبة البقاء (Grid Royale)' : 'Grid Royale Arena' }}
            </h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-950 border border-cyan-500/50 text-cyan-300">
              MINI GAME
            </span>
          </div>
          <div class="flex items-center gap-3 text-xs font-tajawal text-slate-300 mt-0.5">
            <span class="text-amber-400 font-bold">
              🌊 {{ isRtl ? `الموجة: ${gridState.waveNumber} / ${gridState.maxWaves}` : `Wave: ${gridState.waveNumber} / ${gridState.maxWaves}` }}
            </span>
            <span>•</span>
            <span class="text-emerald-400 font-bold">
              🟢 {{ isRtl ? `${gridState.safeTilesCount} مربعات آمنة` : `${gridState.safeTilesCount} Safe Spots` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Stats & Countdown Timer -->
      <div class="flex items-center gap-4">
        <!-- Alive / Eliminated Counter -->
        <div class="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <span class="text-emerald-400 font-bold flex items-center gap-1">
            👥 {{ alivePlayers.length }} {{ isRtl ? 'أحياء' : 'Alive' }}
          </span>
          <span class="text-slate-600">|</span>
          <span class="text-red-400 font-bold flex items-center gap-1">
            💀 {{ eliminatedPlayers.length }} {{ isRtl ? 'مستبعد' : 'Out' }}
          </span>
        </div>

        <!-- Wave Timer -->
        <div
          class="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-black/90 border-2"
          :class="gridState.status === 'WAVE_ACTIVE' ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse' : 'border-slate-700'"
        >
          <span class="text-base animate-spin-slow">⏱️</span>
          <span class="text-xl font-display font-black text-amber-400">
            {{ gridState.timeRemainingSeconds }}s
          </span>
        </div>
      </div>
    </div>

    <!-- ================= 4x4 BATTLE ROYALE ARENA GRID ================= -->
    <div class="relative flex-1 my-3 flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden">
      <!-- Grid Wrapper with Row/Col Headers -->
      <div class="w-full max-w-xl aspect-square p-3 sm:p-4 rounded-3xl bg-black/75 border-2 border-indigo-500/40 shadow-2xl backdrop-blur-md flex flex-col justify-between">
        <!-- Column Numbers Header (1, 2, 3, 4) -->
        <div class="grid grid-cols-4 gap-2.5 text-center text-xs font-display font-black text-cyan-400 py-1">
          <div v-for="c in colNumbers" :key="c" class="flex items-center justify-center gap-1">
            <span class="opacity-60">COL</span> {{ c }}
          </div>
        </div>

        <!-- 4 Rows Grid -->
        <div class="flex-1 grid grid-rows-4 gap-2.5">
          <div v-for="(rowLetter, rIdx) in rowLetters" :key="rowLetter" class="grid grid-cols-4 gap-2.5">
            <!-- Individual Grid Tile Cell -->
            <button
              v-for="(colNum, cIdx) in colNumbers"
              :key="colNum"
              type="button"
              :class="[
                'relative rounded-2xl border-2 p-2 transition-all duration-300 flex flex-col justify-between overflow-hidden group select-none',
                getTileAt(rIdx, cIdx) ? getTileStatusClass(getTileAt(rIdx, cIdx)!) : ''
              ]"
              @click="isAdmin && getTileAt(rIdx, cIdx)?.status !== 'COLLAPSED' ? emit('move-tile', getTileAt(rIdx, cIdx)!.id) : null"
            >
              <!-- Tile Header: ID & Capacity -->
              <div class="flex items-center justify-between w-full relative z-10 text-[11px] font-mono">
                <span class="font-black text-sm text-white drop-shadow">
                  {{ rowLetter }}{{ colNum }}
                </span>
                <!-- Spot Status Badge -->
                <span
                  v-if="getTileAt(rIdx, cIdx)?.status === 'COLLAPSED'"
                  class="px-1.5 py-0.2 rounded bg-red-950 text-red-400 text-[9px] font-bold border border-red-700/60"
                >
                  ☠️ STORM
                </span>
                <span
                  v-else-if="(getTileAt(rIdx, cIdx)?.occupants.length || 0) >= (getTileAt(rIdx, cIdx)?.maxCapacity || 1)"
                  class="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[9px] font-bold border border-indigo-500/60"
                >
                  🔒 FULL
                </span>
                <span
                  v-else
                  class="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[9px] font-bold border border-emerald-500/60 animate-pulse"
                >
                  🟢 OPEN
                </span>
              </div>

              <!-- Center Graphic: Storm Lightning or Safe Pad -->
              <div class="flex-1 flex items-center justify-center my-1 relative z-10">
                <span v-if="getTileAt(rIdx, cIdx)?.status === 'COLLAPSED'" class="text-3xl opacity-80 animate-pulse text-red-400">
                  ⚡
                </span>
                <!-- Occupant Avatars on this Spot -->
                <div v-else-if="getTileAt(rIdx, cIdx)?.occupants.length" class="flex items-center justify-center -space-x-2 overflow-hidden">
                  <div
                    v-for="occupant in getTileAt(rIdx, cIdx)?.occupants"
                    :key="occupant"
                    class="relative flex flex-col items-center animate-scale-up"
                  >
                    <img
                      :src="getPlayerByUsername(occupant)?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${occupant}`"
                      class="w-9 h-9 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] object-cover bg-black"
                    />
                    <span class="px-1.5 py-0.2 rounded bg-black/90 border border-indigo-400 text-[9px] font-cairo font-bold text-white max-w-[70px] truncate mt-0.5 shadow">
                      {{ getPlayerByUsername(occupant)?.displayName || occupant }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-xs font-tajawal text-slate-500 opacity-60">
                  {{ isRtl ? 'مربع شاغر' : 'Empty Spot' }}
                </div>
              </div>

              <!-- Tile Index Number in Footer -->
              <div class="flex items-center justify-between text-[9px] font-mono text-slate-400 w-full relative z-10">
                <span>#{{ getTileAt(rIdx, cIdx)?.index }}</span>
                <span v-if="getTileAt(rIdx, cIdx)?.status !== 'COLLAPSED'" class="text-emerald-400 font-bold">
                  {{ getTileAt(rIdx, cIdx)?.occupants.length }} / {{ getTileAt(rIdx, cIdx)?.maxCapacity }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= CHAT COMMANDS INSTRUCTION BANNER ================= -->
    <div class="relative z-20 p-2.5 rounded-2xl bg-black/85 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-tajawal text-slate-300 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <span class="text-base animate-pulse">💬</span>
        <span>
          {{ isRtl ? 'اكتب في الشات فوراً رمز أو رقم المربع الآمن لحجزه بسرعة (مثال: A1 أو B2 أو 1 إلى 16):' : 'Type in chat: tile code or number to claim spot (e.g. A1, B2, C3, 1..16):' }}
        </span>
      </div>
      <div class="flex items-center gap-2 font-mono text-[11px] text-cyan-300">
        <span class="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">!A1</span>
        <span class="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">!B2</span>
        <span class="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">!12</span>
      </div>
    </div>

    <!-- ================= WINNER / WAVE SUMMARY OVERLAY ================= -->
    <div
      v-if="gridState.status === 'MATCH_OVER' || gridState.status === 'ROUND_SUMMARY'"
      class="absolute inset-0 z-40 p-6 bg-black/92 backdrop-blur-2xl flex flex-col items-center justify-center space-y-5 text-center animate-fade-in"
    >
      <!-- Match Champion Reveal -->
      <div v-if="gridState.status === 'MATCH_OVER' && gridState.winner" class="space-y-4 max-w-md">
        <span class="text-6xl animate-bounce">👑</span>
        <h2 class="text-2xl sm:text-4xl font-cairo font-black text-amber-400 text-glow-amber">
          {{ isRtl ? 'بطل حلبة البقاء (Grid Royale Champion)!' : 'Grid Royale Champion!' }}
        </h2>
        <div class="p-5 rounded-3xl bg-black/80 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)] flex items-center justify-center gap-4">
          <img
            :src="gridState.winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${gridState.winner.username}`"
            class="w-16 h-16 rounded-full border-3 border-amber-400 shadow-xl"
          />
          <div class="text-right">
            <h3 class="text-xl font-cairo font-black text-white leading-tight">
              {{ gridState.winner.displayName }}
            </h3>
            <span class="text-xs font-mono text-amber-300">@{{ gridState.winner.username }}</span>
            <div class="text-xs text-slate-300 mt-1">
              🏆 {{ isRtl ? 'الناجي الأخير وصاحب أسرع ردة فعل!' : 'Sole Survivor & Fastest Reflex!' }}
            </div>
          </div>
        </div>

        <button
          v-if="isAdmin"
          type="button"
          class="px-8 py-3 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xl hover:brightness-110"
          @click="emit('restart-game')"
        >
          🔄 {{ isRtl ? 'بدء جولة جديدة' : 'Start New Match' }}
        </button>
      </div>

      <!-- Wave Summary -->
      <div v-else class="space-y-4 max-w-lg">
        <span class="text-5xl">⚡</span>
        <h2 class="text-2xl sm:text-3xl font-cairo font-black text-white">
          {{ isRtl ? `اكتملت الموجة ${gridState.waveNumber}!` : `Wave ${gridState.waveNumber} Completed!` }}
        </h2>
        <p class="text-sm font-tajawal text-slate-300">
          {{ isRtl ? `صمد ${alivePlayers.length} متسابقين في الأماكن الآمنة وتم استبعاد ${gridState.eliminatedThisWave.length} متسابقين بواسطة العاصفة!` : `${alivePlayers.length} contenders survived! ${gridState.eliminatedThisWave.length} were eliminated by the storm!` }}
        </p>

        <button
          v-if="isAdmin"
          type="button"
          class="px-8 py-3 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:brightness-110"
          @click="emit('next-wave')"
        >
          🚨 {{ isRtl ? 'إطلاق الموجة التالية وتضييق الحلبة' : 'Launch Next Shrinking Wave' }}
        </button>
      </div>
    </div>

    <!-- ================= STREAMER BOTTOM ACTION CONTROLS ================= -->
    <div class="relative z-20 mt-3 p-3 bg-black/85 border border-slate-800 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
      <!-- Left Info -->
      <div class="text-xs font-tajawal text-slate-400">
        <span>🎮 {{ isRtl ? 'السرعة هي الفيصل: من يحجز المربع أولاً ينجو من العاصفة!' : 'Speed is key: First to claim a spot survives!' }}</span>
      </div>

      <!-- Right Buttons -->
      <div class="flex items-center gap-3">
        <!-- Start Game Button in Lobby -->
        <button
          v-if="gridState.status === 'LOBBY' && isAdmin"
          type="button"
          class="px-7 py-2.5 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2"
          @click="emit('start-game')"
        >
          <span>🚀</span>
          <span>{{ isRtl ? 'بدء حلبة البقاء (Start)' : 'Start Grid Royale' }}</span>
        </button>

        <!-- Resolve Wave Button during active wave -->
        <button
          v-if="gridState.status === 'WAVE_ACTIVE' && isAdmin"
          type="button"
          class="px-6 py-2 rounded-full font-cairo font-black text-xs bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow-lg transition-all flex items-center gap-1.5"
          @click="emit('resolve-wave')"
        >
          <span>⚡</span>
          <span>{{ isRtl ? 'حسم الناجين واستبعاد المتأخرين' : 'Resolve Safe Survivors' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
}
</style>
