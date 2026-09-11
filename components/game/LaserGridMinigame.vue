<script setup lang="ts">
import type { IBoardPartyState, IMinigameState, TeamId } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';

const props = defineProps<{
  boardState: IBoardPartyState;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit-zone', zone: number): void;
  (e: 'resolve-minigame'): void;
  (e: 'next-round'): void;
}>();

const { t, isRtl } = useTranslation();

const minigame = computed<IMinigameState | null>(() => props.boardState.minigameState || null);
const teams = computed(() => props.boardState.teams);

const zoneNames = [
  { id: 1, nameAr: 'المنطقة الشمالية الغربية (A1)', nameEn: 'North-West (A1)', icon: '⚡' },
  { id: 2, nameAr: 'المنطقة الشمالية الشرقية (B2)', nameEn: 'North-East (B2)', icon: '🛡️' },
  { id: 3, nameAr: 'المنطقة الجنوبية الغربية (C3)', nameEn: 'South-West (C3)', icon: '🔋' },
  { id: 4, nameAr: 'المنطقة الجنوبية الشرقية (D4)', nameEn: 'South-East (D4)', icon: '🎯' }
];

const totalVotes = computed(() => {
  if (!minigame.value) return 0;
  return Object.keys(minigame.value.votes || {}).length;
});

function getZoneTeamCount(teamId: TeamId, zone: number): number {
  if (!minigame.value?.teamVotes?.[teamId]) return 0;
  return minigame.value.teamVotes[teamId][zone] || 0;
}

function isDangerZone(zone: number): boolean {
  return minigame.value?.dangerZones?.includes(zone) || false;
}
</script>

<template>
  <div v-if="minigame" class="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-slate-950 via-zinc-950 to-black rounded-2xl border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.25)] overflow-hidden">
    <!-- Hazard Ambient Flashing Lines -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#ef444410_1px,transparent_1px),linear-gradient(to_bottom,#ef444410_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

    <!-- Minigame Header Banner -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-red-500/30">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse">
          🚨
        </div>
        <div>
          <div class="font-cairo font-black text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
            <span>{{ isRtl ? 'لعبة الإغلاق التكتيكي: شبكة الليزر' : 'Minigame: Laser Grid Lockdown' }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-red-900/60 border border-red-500 text-red-300 font-mono">
              {{ minigame.status }}
            </span>
          </div>
          <div class="text-xs font-tajawal text-slate-400">
            {{ isRtl ? 'اختر منطقتك الآمنة! سيتم تدمير منطقتين عشوائياً بأشعة الليزر الفتاكة!' : 'Choose your safe zone! 2 random zones will be vaporized by orbital lasers!' }}
          </div>
        </div>
      </div>

      <!-- Live Countdown Timer -->
      <div class="flex items-center gap-2">
        <div
          v-if="minigame.status === 'ACTIVE'"
          class="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-950/90 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse"
        >
          <span class="text-xs font-tajawal text-red-300 font-bold">{{ isRtl ? 'الوقت المتبقي:' : 'Time Left:' }}</span>
          <span class="text-2xl font-black font-mono text-white">{{ minigame.timeRemainingSeconds }}s</span>
        </div>
        <div v-else class="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold font-mono">
          {{ isRtl ? 'تم حسم النتيجة' : 'RESOLVED' }}
        </div>
      </div>
    </div>

    <!-- 4-Quadrant Laser Grid Area -->
    <div class="relative z-10 flex-1 grid grid-cols-2 grid-rows-2 gap-3 my-3 min-h-[260px]">
      <template v-for="z in zoneNames" :key="z.id">
        <div
          :class="[
            'relative rounded-2xl p-3 sm:p-4 border-2 flex flex-col justify-between transition-all duration-500 overflow-hidden',
            minigame.status === 'ACTIVE'
              ? 'bg-slate-900/70 border-slate-700 hover:border-red-400 hover:bg-slate-800/80 cursor-pointer shadow-lg'
              : isDangerZone(z.id)
                ? 'bg-red-950/90 border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.8)]'
                : 'bg-emerald-950/70 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
          ]"
          @click="minigame.status === 'ACTIVE' ? emit('submit-zone', z.id) : null"
        >
          <!-- Laser Beam Blast Animation when Eliminated -->
          <div
            v-if="minigame.status !== 'ACTIVE' && isDangerZone(z.id)"
            class="absolute inset-0 bg-gradient-to-b from-red-600/30 via-red-500/50 to-red-900/80 flex flex-col items-center justify-center animate-pulse z-20 pointer-events-none"
          >
            <div class="text-4xl sm:text-5xl animate-bounce">⚡💥</div>
            <span class="text-xs sm:text-sm font-cairo font-black text-red-200 uppercase tracking-widest mt-1 bg-black/60 px-3 py-0.5 rounded-full border border-red-500">
              {{ isRtl ? 'تم التدمير بالليزر' : 'LASER DESTROYED' }}
            </span>
          </div>

          <!-- Safe Zone Badge -->
          <div
            v-else-if="minigame.status !== 'ACTIVE' && !isDangerZone(z.id)"
            class="absolute top-2 right-2 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-cairo font-bold px-2 py-0.5 rounded-full z-20"
          >
            ✓ {{ isRtl ? 'منطقة آمنة' : 'SAFE ZONE' }}
          </div>

          <!-- Zone Title & Quick Command -->
          <div class="flex items-center justify-between z-10">
            <div class="flex items-center gap-2">
              <span class="text-xl sm:text-2xl">{{ z.icon }}</span>
              <div>
                <div class="font-cairo font-bold text-sm sm:text-base text-white">
                  {{ isRtl ? z.nameAr : z.nameEn }}
                </div>
                <div class="text-[11px] font-mono font-bold text-red-400">
                  !zone {{ z.id }}
                </div>
              </div>
            </div>
            <button
              v-if="minigame.status === 'ACTIVE'"
              type="button"
              class="px-3 py-1 rounded-lg bg-red-600/30 hover:bg-red-600 border border-red-500 text-white text-xs font-cairo font-bold transition-all"
              @click.stop="emit('submit-zone', z.id)"
            >
              {{ isRtl ? 'اختيار' : 'Select' }}
            </button>
          </div>

          <!-- Team Presence Breakdown Inside Zone -->
          <div class="z-10 mt-3 pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-2 sm:gap-3">
            <!-- Crimson Presence -->
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-xs font-mono text-red-300">
              <span>🔴</span>
              <span class="font-bold">{{ getZoneTeamCount('crimson', z.id) }}</span>
            </div>
            <!-- Onyx Presence -->
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/80 border border-zinc-500/40 text-xs font-mono text-zinc-300">
              <span>⚫</span>
              <span class="font-bold">{{ getZoneTeamCount('onyx', z.id) }}</span>
            </div>
            <!-- Silver Presence -->
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-cyan-400/40 text-xs font-mono text-cyan-300">
              <span>⚪</span>
              <span class="font-bold">{{ getZoneTeamCount('silver', z.id) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Minigame Bottom / Resolution Banner -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
      <div class="text-xs font-tajawal text-slate-300 flex items-center gap-2">
        <span>👥 {{ isRtl ? 'إجمالي اللاعبين المتموقعين:' : 'Total Locked In:' }}</span>
        <strong class="text-white font-mono text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{{ totalVotes }}</strong>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          v-if="minigame.status === 'ACTIVE' && isAdmin"
          type="button"
          class="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-cairo font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all flex items-center gap-1.5"
          @click="emit('resolve-minigame')"
        >
          <span>⚡</span>
          <span>{{ isRtl ? 'إطلاق الليزر الآن (حسم)' : 'Trigger Lasers Now' }}</span>
        </button>

        <button
          v-if="minigame.status === 'COMPLETED' && isAdmin"
          type="button"
          class="px-5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-cairo font-black text-xs shadow-lg transition-all flex items-center gap-1.5 animate-pulse"
          @click="emit('next-round')"
        >
          <span>🚀</span>
          <span>{{ isRtl ? 'بدء الجولة التالية ➔' : 'Proceed to Next Round ➔' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
