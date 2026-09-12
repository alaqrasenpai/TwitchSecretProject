<script setup lang="ts">
import type { IGameSession, SubwayAction, SubwayLane } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';
import { useAudioSfx } from '~/composables/useAudioSfx';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
import confetti from 'canvas-confetti';

const props = withDefaults(
  defineProps<{
    session: IGameSession | null;
    isAdmin?: boolean;
    isOverlay?: boolean;
  }>(),
  {
    isAdmin: false,
    isOverlay: false
  }
);

const emit = defineEmits<{
  (e: 'startGame'): void;
  (e: 'submitAction', action: SubwayAction): void;
  (e: 'resolveObstacle'): void;
  (e: 'nextRound'): void;
  (e: 'restartGame'): void;
}>();

const { t, isRtl } = useTranslation();
const audio = useAudioSfx();

const state = computed(() => props.session?.subwayRunnerState || null);
const status = computed(() => state.value?.status || props.session?.status || 'LOBBY');
const currentLane = computed<SubwayLane>(() => state.value?.runnerLane || 'MIDDLE');
const currentObstacle = computed(() => state.value?.currentObstacle || null);
const speedLevel = computed(() => state.value?.speedLevel || 1);
const distanceMeters = computed(() => state.value?.distanceMeters || 0);
const obstaclesDodged = computed(() => state.value?.obstaclesPassedCount || 0);
const currentRound = computed(() => state.value?.currentRound || 1);
const totalRounds = computed(() => state.value?.totalRounds || props.session?.settings?.subwayTotalRounds || 5);
const obstaclesInRound = computed(() => state.value?.obstaclesInRound || 0);
const targetObstaclesPerRound = computed(() => state.value?.targetObstaclesPerRound || 4);

const contenders = computed(() => Object.values(state.value?.contenders || {}));
const winner = computed(() => state.value?.winner || props.session?.winner || null);

// Dynamic railway ties animation speed (gets much faster with each round)
const trackSpeedSeconds = computed(() => {
  const round = currentRound.value;
  // Round 1: 0.60s, Round 2: 0.46s, Round 3: 0.34s, Round 4: 0.24s, Round 5: 0.16s!
  return Math.max(0.14, Number((0.60 - (round - 1) * 0.11).toFixed(2)));
});

// Contenders breakdown
const aliveContenders = computed(() => contenders.value.filter((c) => c.status === 'ALIVE'));
const crashedContenders = computed(() => contenders.value.filter((c) => c.status === 'ELIMINATED'));

const sortedContendersByScore = computed(() => {
  return [...contenders.value].sort((a, b) => {
    if (a.status === 'ALIVE' && b.status !== 'ALIVE') return -1;
    if (a.status !== 'ALIVE' && b.status === 'ALIVE') return 1;
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const dodgesA = a.successfulDodges || 0;
    const dodgesB = b.successfulDodges || 0;
    if (dodgesB !== dodgesA) return dodgesB - dodgesA;
    const heartsA = a.hearts || 0;
    const heartsB = b.hearts || 0;
    if (heartsB !== heartsA) return heartsB - heartsA;
    const reactA = a.lastReactionMs || 9999;
    const reactB = b.lastReactionMs || 9999;
    return reactA - reactB;
  });
});

// Animation state for character
const isJumping = ref(false);
const isDucking = ref(false);

// Reaction timer
const reactionRemainingMs = ref(0);
const reactionTotalMs = ref(3000);
let timerAnimFrame: any = null;
let hasAutoResolvedThisObstacle = false;

const timerPercentage = computed(() => {
  if (reactionTotalMs.value <= 0) return 0;
  return Math.max(0, Math.min(100, (reactionRemainingMs.value / reactionTotalMs.value) * 100));
});

// Auto-countdown between rounds
const roundClearCountdown = ref(4);
let roundClearTimer: any = null;

watch(
  () => status.value,
  (newStatus) => {
    if (newStatus === 'ROUND_CLEAR') {
      audio.playVictoryFanfare();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 }
      });
      roundClearCountdown.value = 4;
      if (roundClearTimer) clearInterval(roundClearTimer);
      roundClearTimer = setInterval(() => {
        roundClearCountdown.value -= 1;
        if (roundClearCountdown.value <= 0) {
          clearInterval(roundClearTimer);
          if (props.isAdmin) {
            emit('nextRound');
          }
        }
      }, 1000);
    } else {
      if (roundClearTimer) clearInterval(roundClearTimer);
    }

    if (newStatus === 'SUBWAY_CRASHED' || newStatus === 'FINISHED' || state.value?.status === 'MATCH_OVER') {
      audio.playRunnerCrash();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }
);

// Watch obstacle appearance to start countdown and trigger sounds
watch(
  () => currentObstacle.value,
  (obs) => {
    hasAutoResolvedThisObstacle = false;
    if (obs && (status.value === 'SUBWAY_OBSTACLE' || status.value === 'SUBWAY_RUNNING' || state.value?.status === 'RUNNING')) {
      const endsAt = obs.deadline;
      const durationMs = obs.timeLimitSeconds * 1000;
      reactionTotalMs.value = durationMs;

      // Animate jump/duck based on prompt
      if (obs.requiredAction === 'JUMP') {
        isJumping.value = true;
        setTimeout(() => { isJumping.value = false; }, 850);
        audio.playRunnerJump();
      } else if (obs.requiredAction === 'DUCK') {
        isDucking.value = true;
        setTimeout(() => { isDucking.value = false; }, 850);
        audio.playRunnerSlide();
      }

      if (timerAnimFrame) cancelAnimationFrame(timerAnimFrame);

      const updateTimer = () => {
        const now = Date.now();
        const diff = endsAt - now;
        if (diff <= 0) {
          reactionRemainingMs.value = 0;
          // Auto resolve if admin and obstacle expired
          if (!hasAutoResolvedThisObstacle && props.isAdmin && (status.value === 'SUBWAY_RUNNING' || status.value === 'SUBWAY_OBSTACLE' || state.value?.status === 'RUNNING')) {
            hasAutoResolvedThisObstacle = true;
            emit('resolveObstacle');
          }
        } else {
          reactionRemainingMs.value = diff;
          timerAnimFrame = requestAnimationFrame(updateTimer);
        }
      };
      timerAnimFrame = requestAnimationFrame(updateTimer);
    } else {
      reactionRemainingMs.value = 0;
      if (timerAnimFrame) cancelAnimationFrame(timerAnimFrame);
    }
  },
  { immediate: true }
);

// Watch for speed ups
watch(
  () => speedLevel.value,
  (newVal, oldVal) => {
    if (oldVal && newVal > oldVal) {
      audio.playRunnerSpeedUp();
    }
  }
);

onUnmounted(() => {
  if (timerAnimFrame) cancelAnimationFrame(timerAnimFrame);
  if (roundClearTimer) clearInterval(roundClearTimer);
});

// Obstacle style helper
const getObstacleLaneX = (lane: SubwayLane) => {
  if (lane === 'LEFT') return '18%';
  if (lane === 'RIGHT') return '82%';
  return '50%';
};

// Runner character position
const runnerX = computed(() => {
  if (currentLane.value === 'LEFT') return '18%';
  if (currentLane.value === 'RIGHT') return '82%';
  return '50%';
});
</script>

<template>
  <div class="relative w-full h-full min-h-[580px] flex flex-col justify-between overflow-hidden bg-slate-950 font-sans select-none border border-slate-800/80 rounded-2xl p-4 shadow-2xl">
    <!-- Cyber Neon Animated Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-950/80 to-black"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-fuchsia-600/10 blur-3xl"></div>
    </div>

    <!-- TOP HUD: Round Badge, Distance, Speed, Dodged & Contenders Count -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 shadow-lg">
      <div class="flex items-center gap-2.5">
        <!-- Round Progress Badge -->
        <div class="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-lg border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
          <span class="text-xl">🏆</span>
          <div>
            <div class="text-[10px] text-purple-300 font-black uppercase tracking-wider">
              {{ isRtl ? 'الجولة' : 'Round' }} {{ currentRound }}/{{ totalRounds }}
            </div>
            <div class="flex items-center gap-1 mt-0.5">
              <span
                v-for="i in targetObstaclesPerRound"
                :key="i"
                class="w-2 h-2 rounded-full transition-all duration-300"
                :class="i <= obstaclesInRound ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,1)] scale-110' : 'bg-slate-700'"
              ></span>
            </div>
          </div>
        </div>

        <!-- Distance Tracker -->
        <div class="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-cyan-500/40">
          <span class="text-xl">🏃</span>
          <div>
            <div class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {{ isRtl ? 'المسافة' : 'Distance' }}
            </div>
            <div class="text-sm font-black text-white font-mono tracking-tight">
              {{ distanceMeters.toLocaleString() }} m
            </div>
          </div>
        </div>

        <!-- Speed Level (Multiplied each round!) -->
        <div class="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-amber-500/40">
          <span class="text-xl animate-pulse">⚡</span>
          <div>
            <div class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              {{ isRtl ? 'السرعة' : 'Speed' }}
            </div>
            <div class="text-sm font-black text-amber-300 font-mono">
              {{ speedLevel }}x
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/40">
          <span class="text-xl">🛡️</span>
          <div>
            <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              {{ isRtl ? 'تم تفاديه' : 'Dodged' }}
            </div>
            <div class="text-sm font-black text-emerald-300 font-mono">
              {{ obstaclesDodged }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-purple-500/40">
          <span class="text-xl">👥</span>
          <div>
            <div class="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
              {{ isRtl ? 'الناجون' : 'Survivors' }}
            </div>
            <div class="text-sm font-black text-white font-mono">
              {{ aliveContenders.length }} / {{ contenders.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN TRACK & RUNNER VIEW -->
    <div class="relative z-10 flex-1 my-3 flex flex-col items-center justify-center min-h-[380px]">
      <!-- 3D Track Container with Perspective -->
      <div class="relative w-full max-w-2xl h-[360px] overflow-hidden rounded-2xl border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-gradient-to-b from-indigo-950/50 via-slate-950 to-black perspective-[600px]">
        <!-- Moving 3D Grid Track -->
        <div class="subway-track absolute inset-0 w-full h-full transform-gpu rotate-x-45 origin-bottom">
          <!-- 3 Lanes Dividing Lines -->
          <div class="absolute inset-0 flex justify-between px-[33%] pointer-events-none">
            <div class="w-1.5 h-full bg-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
            <div class="w-1.5 h-full bg-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
          </div>

          <!-- Railway Ties / Sleepers Moving Down (Speed dynamically scales with round!) -->
          <div
            class="railway-ties absolute inset-0"
            :style="{ animationDuration: `${trackSpeedSeconds}s` }"
          ></div>
        </div>

        <!-- Lane Labels (Top) with Live Danger Warning -->
        <div class="absolute top-2 inset-x-0 flex justify-around px-8 text-xs font-black uppercase tracking-widest pointer-events-none z-10">
          <span :class="[
            currentObstacle?.lane === 'LEFT' ? 'text-rose-500 font-black scale-110 drop-shadow-[0_0_14px_rgba(244,63,94,1)] animate-pulse' :
            currentLane === 'LEFT' ? 'text-cyan-400 font-black scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400/60'
          ]">
            {{ currentObstacle?.lane === 'LEFT' ? '⚠️ ' : '' }}{{ isRtl ? 'مسار اليسار' : 'LEFT LANE' }}
          </span>
          <span :class="[
            currentObstacle?.lane === 'MIDDLE' ? 'text-rose-500 font-black scale-110 drop-shadow-[0_0_14px_rgba(244,63,94,1)] animate-pulse' :
            currentLane === 'MIDDLE' ? 'text-cyan-400 font-black scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400/60'
          ]">
            {{ currentObstacle?.lane === 'MIDDLE' ? '⚠️ ' : '' }}{{ isRtl ? 'مسار الوسط' : 'MIDDLE LANE' }}
          </span>
          <span :class="[
            currentObstacle?.lane === 'RIGHT' ? 'text-rose-500 font-black scale-110 drop-shadow-[0_0_14px_rgba(244,63,94,1)] animate-pulse' :
            currentLane === 'RIGHT' ? 'text-cyan-400 font-black scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400/60'
          ]">
            {{ currentObstacle?.lane === 'RIGHT' ? '⚠️ ' : '' }}{{ isRtl ? 'مسار اليمين' : 'RIGHT LANE' }}
          </span>
        </div>

        <!-- Ground Danger Lane Target Strip on Rails -->
        <div
          v-if="currentObstacle && (status === 'SUBWAY_OBSTACLE' || status === 'SUBWAY_RUNNING' || state?.status === 'RUNNING')"
          class="absolute bottom-0 w-36 h-64 bg-gradient-to-t from-rose-600/35 via-rose-500/15 to-transparent border-x-2 border-rose-500/50 pointer-events-none -translate-x-1/2 z-10 transition-all duration-300"
          :style="{ left: getObstacleLaneX(currentObstacle.lane) }"
        >
          <div class="absolute bottom-3 inset-x-0 flex flex-col items-center gap-1 text-[10px] font-black text-rose-400 uppercase tracking-wider animate-pulse">
            <span>🚨 {{ isRtl ? 'مسار خطر قادم!' : 'DANGER IN THIS LANE!' }} 🚨</span>
            <div class="w-20 h-1 bg-rose-500/80 rounded-full animate-ping"></div>
          </div>
        </div>

        <!-- ONCOMING OBSTACLE -->
        <div
          v-if="currentObstacle && (status === 'SUBWAY_OBSTACLE' || status === 'SUBWAY_RUNNING' || state?.status === 'RUNNING')"
          :key="currentObstacle.id"
          class="absolute transition-all duration-300 transform-gpu -translate-x-1/2 flex flex-col items-center z-20"
          :style="{
            left: getObstacleLaneX(currentObstacle.lane),
            top: '25%',
            animation: `obstacle-approach ${Math.min(2.0, currentObstacle.timeLimitSeconds * 0.9)}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
          }"
        >
          <!-- Obstacle Graphic -->
          <div class="flex flex-col items-center select-none">
            <!-- 1. Train Model (Trains oncoming down the rails) -->
            <template v-if="currentObstacle.type.includes('TRAIN')">
              <div class="relative flex flex-col items-center">
                <!-- Dual Halogen Headlights Beams on Rails -->
                <div class="w-32 h-28 bg-gradient-to-b from-amber-300/40 via-amber-400/10 to-transparent blur-md -mb-6 pointer-events-none"></div>
                <!-- Train Body -->
                <div class="w-24 h-24 rounded-2xl bg-gradient-to-b from-slate-800 via-rose-950 to-slate-950 border-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.9)] flex flex-col items-center justify-between p-2 relative overflow-hidden">
                  <!-- Red Warning Beacon -->
                  <div class="w-6 h-2 bg-red-500 rounded-full shadow-[0_0_12px_red] animate-ping"></div>
                  <!-- Windshield -->
                  <div class="w-full h-7 bg-cyan-950/80 rounded-md border border-cyan-400/60 flex items-center justify-center">
                    <span class="text-[9px] font-mono font-black text-cyan-300 tracking-wider">BULLET 🚅</span>
                  </div>
                  <!-- Dual Headlights & Bumper -->
                  <div class="w-full flex items-center justify-between px-1">
                    <div class="w-4 h-4 rounded-full bg-amber-300 shadow-[0_0_15px_rgba(252,211,77,1)] border border-white"></div>
                    <span class="text-[8px] font-black text-rose-300 font-mono tracking-tighter uppercase">DANGER</span>
                    <div class="w-4 h-4 rounded-full bg-amber-300 shadow-[0_0_15px_rgba(252,211,77,1)] border border-white"></div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 2. Low Barrier Model (Jump Prompt) -->
            <template v-else-if="currentObstacle.type === 'LOW_BARRIER'">
              <div class="flex flex-col items-center">
                <div class="px-3 py-1 bg-rose-600 text-white font-black text-[10px] rounded-t-lg shadow-lg animate-bounce flex items-center gap-1">
                  <span>⬆️</span>
                  <span>{{ isRtl ? 'اقفز فوق الحاجز' : 'JUMP OVER' }}</span>
                </div>
                <!-- Hazard Barricade -->
                <div class="w-28 h-10 rounded-xl bg-amber-500 border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex items-center justify-between px-2 overflow-hidden relative">
                  <div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#f59e0b_10px,#f59e0b_20px)] opacity-60"></div>
                  <span class="relative z-10 text-lg">🚧</span>
                  <span class="relative z-10 text-xs font-black text-black tracking-wider font-mono">BARRIER</span>
                  <span class="relative z-10 text-lg">🚧</span>
                </div>
              </div>
            </template>

            <!-- 3. High Barrier Model (Duck / Slide Prompt) -->
            <template v-else-if="currentObstacle.type === 'HIGH_BARRIER'">
              <div class="flex flex-col items-center">
                <!-- Overhead Laser Barricade -->
                <div class="w-32 h-8 rounded-xl bg-purple-950 border-2 border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.9)] flex items-center justify-around px-2 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent animate-pulse opacity-80"></div>
                  <span class="relative z-10 text-sm">⚡</span>
                  <span class="relative z-10 text-[10px] font-black text-white font-mono uppercase tracking-widest">HIGH LASER</span>
                  <span class="relative z-10 text-sm">⚡</span>
                </div>
                <div class="px-3 py-1 bg-amber-500 text-black font-black text-[10px] rounded-b-lg shadow-lg flex items-center gap-1 mt-0.5 animate-bounce">
                  <span>⬇️</span>
                  <span>{{ isRtl ? 'انزل / تزحلق تحته' : 'DUCK / SLIDE' }}</span>
                </div>
              </div>
            </template>

            <!-- 4. Giant Boulder / Rock Model -->
            <template v-else>
              <div class="flex flex-col items-center">
                <div class="w-24 h-20 rounded-3xl bg-gradient-to-b from-stone-700 to-stone-900 border-2 border-amber-600 shadow-[0_0_25px_rgba(217,119,6,0.8)] flex flex-col items-center justify-center p-2 relative overflow-hidden">
                  <span class="text-3xl animate-pulse">🪨</span>
                  <span class="text-[9px] font-black text-amber-400 font-mono tracking-wider">BOULDER</span>
                </div>
              </div>
            </template>

            <!-- Info Pill Under Obstacle -->
            <div class="mt-1 px-3 py-0.5 rounded-full bg-black/90 border border-slate-700 text-[10px] font-bold text-slate-300 shadow-md">
              {{ isRtl ? currentObstacle.labelAr : currentObstacle.labelEn }}
            </div>
          </div>
        </div>

        <!-- RUNNER AVATAR -->
        <div
          class="absolute bottom-6 transform-gpu -translate-x-1/2 flex flex-col items-center transition-all duration-300 ease-out z-30"
          :style="{ left: runnerX }"
          :class="{
            'runner-jumping': isJumping,
            'runner-ducking': isDucking
          }"
        >
          <!-- Neon Shadow under avatar -->
          <div class="w-16 h-4 bg-cyan-500/40 rounded-full blur-sm mb-1 animate-pulse"></div>

          <!-- Character Body / Avatar -->
          <div class="relative w-16 h-16 rounded-2xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)] bg-slate-900 flex items-center justify-center overflow-hidden">
            <span class="text-3xl animate-bounce">🏃‍♂️</span>
            <div class="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none"></div>
          </div>

          <!-- Contenders Mini Floating Icons (Top chatters running along) -->
          <div class="flex -space-x-2 mt-1 overflow-hidden max-w-[120px]">
            <template v-for="c in aliveContenders.slice(0, 4)" :key="c.username">
              <img
                :src="c.avatarUrl"
                :title="c.displayName"
                class="w-5 h-5 rounded-full border border-cyan-400 shadow-sm bg-slate-800"
              />
            </template>
            <div
              v-if="aliveContenders.length > 4"
              class="w-5 h-5 rounded-full bg-slate-800 border border-cyan-500/60 text-[8px] text-cyan-300 font-bold flex items-center justify-center"
            >
              +{{ aliveContenders.length - 4 }}
            </div>
          </div>
        </div>
      </div>

      <!-- HUGE PROMPT BANNER OVER TRACK -->
      <div
        v-if="currentObstacle && (status === 'SUBWAY_OBSTACLE' || status === 'SUBWAY_RUNNING' || state?.status === 'RUNNING')"
        class="mt-3 w-full max-w-xl flex flex-col items-center gap-2 z-20"
      >
        <div
          class="w-full flex items-center justify-between px-5 py-3 rounded-2xl border-2 shadow-2xl backdrop-blur-xl animate-pulse"
          :class="[
            currentObstacle.requiredAction === 'JUMP' ? 'bg-rose-950/95 border-rose-500 text-white shadow-rose-500/40' :
            currentObstacle.requiredAction === 'DUCK' ? 'bg-amber-950/95 border-amber-500 text-white shadow-amber-500/40' :
            currentObstacle.requiredAction === 'LEFT' ? 'bg-cyan-950/95 border-cyan-400 text-white shadow-cyan-500/40' :
            'bg-purple-950/95 border-purple-400 text-white shadow-purple-500/40'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black">
              {{
                currentObstacle.requiredAction === 'JUMP' ? '⬆️' :
                currentObstacle.requiredAction === 'DUCK' ? '⬇️' :
                currentObstacle.requiredAction === 'LEFT' ? '⬅️' : '➡️'
              }}
            </span>
            <div>
              <div class="text-xs uppercase tracking-wider font-extrabold opacity-90">
                {{ isRtl ? 'اكتب في الشات فوراً!' : 'TYPE IN CHAT QUICKLY!' }}
              </div>
              <div class="text-2xl font-black tracking-wide font-mono">
                {{
                  currentObstacle.requiredAction === 'JUMP' ? (isRtl ? 'قفز / jump' : 'JUMP') :
                  currentObstacle.requiredAction === 'DUCK' ? (isRtl ? 'انزل / duck' : 'DUCK') :
                  currentObstacle.requiredAction === 'LEFT' ? (isRtl ? 'يسار / left' : 'LEFT') :
                  (isRtl ? 'يمين / right' : 'RIGHT')
                }}
              </div>
            </div>
          </div>

          <div class="text-right font-mono">
            <div class="text-xs font-bold opacity-80">
              {{ isRtl ? 'الوقت المتبقي' : 'Time Left' }}
            </div>
            <div class="text-2xl font-black">
              {{ (reactionRemainingMs / 1000).toFixed(1) }}s
            </div>
          </div>
        </div>

        <!-- Reaction Time Countdown Progress Bar -->
        <div class="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
          <div
            class="h-full rounded-full transition-all duration-75"
            :class="[
              timerPercentage > 50 ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' :
              timerPercentage > 25 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
            ]"
            :style="{ width: `${timerPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- ROUND CLEAR TRANSITION BANNER -->
      <div
        v-if="status === 'ROUND_CLEAR' || state?.status === 'ROUND_CLEAR'"
        class="text-center p-6 bg-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-emerald-500/60 max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.3)] my-auto animate-fade-in z-30"
      >
        <div class="text-5xl mb-2">🎉⚡</div>
        <div class="text-xs font-black uppercase text-emerald-400 tracking-widest mb-1">
          {{ isRtl ? 'اكتملت الجولة بنجاح!' : 'ROUND CLEARED!' }}
        </div>
        <h2 class="text-2xl font-black text-white mb-3">
          {{ isRtl ? `تم اجتياز الجولة ${currentRound} من ${totalRounds} بنجاح!` : `Round ${currentRound} of ${totalRounds} Cleared!` }}
        </h2>

        <!-- Stats row -->
        <div class="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 mb-4 flex items-center justify-around">
          <div>
            <div class="text-[10px] text-slate-400 font-bold uppercase">{{ isRtl ? 'المسافة المقطوعة' : 'Distance' }}</div>
            <div class="text-base font-black text-cyan-400 font-mono">{{ distanceMeters.toLocaleString() }} m</div>
          </div>
          <div class="w-px h-8 bg-slate-800"></div>
          <div>
            <div class="text-[10px] text-slate-400 font-bold uppercase">{{ isRtl ? 'السرعة القادمة' : 'Next Speed' }}</div>
            <div class="text-base font-black text-amber-400 font-mono">{{ currentRound + 1 }}x 🚀</div>
          </div>
          <div class="w-px h-8 bg-slate-800"></div>
          <div>
            <div class="text-[10px] text-slate-400 font-bold uppercase">{{ isRtl ? 'الناجون' : 'Survivors' }}</div>
            <div class="text-base font-black text-emerald-400 font-mono">{{ aliveContenders.length }}</div>
          </div>
        </div>

        <p class="text-xs text-amber-300 mb-4 animate-pulse font-bold">
          ⚡ {{ isRtl ? `انتبهوا! الجولة ${currentRound + 1} ستكون أسرع بكثير ووقت الاستجابة أقصر!` : `Attention! Round ${currentRound + 1} will be faster and obstacles more sudden!` }}
        </p>

        <div v-if="isAdmin" class="flex flex-col items-center gap-2">
          <GamerButton
            variant="primary"
            class="px-8 py-2.5 text-base font-black shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            @click="emit('nextRound')"
          >
            ⚡ {{ isRtl ? `الانطلاق للجولة ${currentRound + 1} الآن (${roundClearCountdown}s)` : `Start Round ${currentRound + 1} (${roundClearCountdown}s)` }}
          </GamerButton>
        </div>
        <div v-else class="text-sm font-bold text-slate-400 font-mono">
          {{ isRtl ? `الانطلاق خلال: ${roundClearCountdown} ثوانٍ...` : `Next round in: ${roundClearCountdown}s...` }}
        </div>
      </div>

      <!-- LOBBY STATE / INSTRUCTIONS -->
      <div
        v-if="status === 'LOBBY' || state?.status === 'LOBBY'"
        class="text-center p-6 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/40 max-w-lg shadow-2xl my-auto"
      >
        <div class="text-5xl mb-3">🏃‍♂️💨</div>
        <h2 class="text-2xl font-black text-white mb-2">
          {{ isRtl ? 'مسار الهروب السريع (Subway Runner)' : 'Subway Runner Challenge' }}
        </h2>
        <p class="text-sm text-slate-300 mb-4 leading-relaxed">
          {{ isRtl
            ? `سباق حماسي يتكون من ${totalRounds} جولات متتالية! تزداد السرعة مع كل جولة ويصبح وقت ردة الفعل أقصر وأصعب! تفادوا العقبات بكتابة الأوامر في الشات.`
            : `An adrenaline-fueled sprint across ${totalRounds} rounds! Speed increases each round and reaction time gets shorter!`
          }}
        </p>

        <div class="grid grid-cols-4 gap-2 mb-6 text-center">
          <div class="bg-slate-950 p-2 rounded-xl border border-cyan-500/30">
            <div class="text-lg">⬆️</div>
            <div class="text-[11px] font-bold text-cyan-300">{{ isRtl ? 'قفز / jump' : 'jump' }}</div>
          </div>
          <div class="bg-slate-950 p-2 rounded-xl border border-cyan-500/30">
            <div class="text-lg">⬇️</div>
            <div class="text-[11px] font-bold text-cyan-300">{{ isRtl ? 'انزل / duck' : 'duck' }}</div>
          </div>
          <div class="bg-slate-950 p-2 rounded-xl border border-cyan-500/30">
            <div class="text-lg">⬅️</div>
            <div class="text-[11px] font-bold text-cyan-300">{{ isRtl ? 'يسار / left' : 'left' }}</div>
          </div>
          <div class="bg-slate-950 p-2 rounded-xl border border-cyan-500/30">
            <div class="text-lg">➡️</div>
            <div class="text-[11px] font-bold text-cyan-300">{{ isRtl ? 'يمين / right' : 'right' }}</div>
          </div>
        </div>

        <div v-if="isAdmin" class="flex justify-center">
          <GamerButton
            variant="primary"
            class="px-8 py-3 text-lg font-black shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            @click="emit('startGame')"
          >
            🚀 {{ isRtl ? 'انطلاق السباق الآن!' : 'Start Running Now!' }}
          </GamerButton>
        </div>
      </div>

      <!-- GAME CRASHED / FINISHED GRAND SCOREBOARD OVERLAY -->
      <div
        v-if="status === 'SUBWAY_CRASHED' || status === 'FINISHED' || state?.status === 'MATCH_OVER'"
        class="w-full max-w-2xl text-center space-y-4 p-5 sm:p-7 bg-gradient-to-b from-slate-950 via-slate-900/98 to-slate-950 border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] backdrop-blur-xl my-auto animate-scale-up"
      >
        <div class="inline-flex items-center gap-2 px-4 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 rounded-full text-xs font-cairo font-black uppercase tracking-widest shadow-glow-cyan">
          🏁 {{ isRtl ? 'لوحة النتائج والترتيب النهائي (SCOREBOARD)' : 'FINAL SCOREBOARD & RUNNERS' }}
        </div>

        <div class="flex items-center justify-around p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-mono">
          <div>
            <span class="block text-[10px] text-slate-400">{{ isRtl ? 'المسافة المقطوعة' : 'Distance' }}</span>
            <span class="font-black text-cyan-400 text-base">{{ distanceMeters.toLocaleString() }} m</span>
          </div>
          <div class="h-6 w-px bg-slate-800" />
          <div>
            <span class="block text-[10px] text-slate-400">{{ isRtl ? 'الجولة' : 'Round' }}</span>
            <span class="font-black text-amber-400 text-base">{{ currentRound }} / {{ totalRounds }}</span>
          </div>
          <div class="h-6 w-px bg-slate-800" />
          <div>
            <span class="block text-[10px] text-slate-400">{{ isRtl ? 'عقبات تم تفاديها' : 'Dodged' }}</span>
            <span class="font-black text-emerald-400 text-base">{{ obstaclesDodged }}</span>
          </div>
        </div>

        <!-- Winner / MVP Spotlight Card -->
        <div
          v-if="winner"
          class="p-3.5 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-amber-950/60 rounded-2xl border border-amber-400/60 flex items-center justify-between gap-3 shadow-glow-gold"
        >
          <div class="flex items-center gap-3">
            <div class="relative">
              <img
                :src="winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${winner.username}`"
                class="w-12 h-12 rounded-full border-2 border-amber-400 shadow-md"
              />
              <span class="absolute -top-2 -right-1 text-base">👑</span>
            </div>
            <div :class="isRtl ? 'text-right' : 'text-left'">
              <div class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {{ isRtl ? 'بطل السباق والناجي الأسطوري' : 'MVP SURVIVOR & CHAMPION' }}
              </div>
              <div class="text-base font-black text-white font-cairo leading-tight">
                {{ winner.displayName }}
              </div>
              <div class="text-[10px] text-slate-400 font-mono">@{{ winner.username }}</div>
            </div>
          </div>

          <div class="text-right font-mono">
            <div class="text-xs font-bold text-cyan-300">
              {{ winner.successfulDodges || 0 }} {{ isRtl ? 'تفادي' : 'dodges' }}
            </div>
            <div class="text-xs font-black text-amber-400">
              {{ winner.score || 0 }} {{ isRtl ? 'نقطة' : 'pts' }}
            </div>
          </div>
        </div>

        <!-- Full Contenders Scoreboard Leaderboard Table -->
        <div class="space-y-1.5" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="flex items-center justify-between text-xs font-cairo font-bold text-cyan-300 px-1">
            <span>📊 {{ isRtl ? 'ترتيب المتسابقين حسب الصمود والنقاط:' : 'Contenders Leaderboard & Dodges:' }}</span>
            <span class="text-[10px] font-mono text-slate-400">{{ sortedContendersByScore.length }} {{ isRtl ? 'متسابق' : 'runners' }}</span>
          </div>

          <div class="max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            <template v-for="(c, idx) in sortedContendersByScore" :key="c.username">
              <div
                class="flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all"
                :class="[
                  idx === 0 && (c.score || 0) > 0 ? 'bg-amber-950/50 border-amber-400/80 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                  idx === 1 && (c.score || 0) > 0 ? 'bg-slate-800/80 border-slate-500 text-slate-200' :
                  idx === 2 && (c.score || 0) > 0 ? 'bg-cyan-950/40 border-cyan-700 text-cyan-200' :
                  'bg-slate-950/60 border-slate-800 text-slate-400'
                ]"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="font-mono font-bold text-xs shrink-0" :class="idx < 3 ? 'text-amber-400' : 'text-slate-500'">
                    {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                  </span>
                  <img
                    :src="c.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.username}`"
                    class="w-7 h-7 rounded-full border shrink-0"
                    :class="c.status === 'ALIVE' ? 'border-cyan-400/60' : 'border-rose-900/60 grayscale'"
                  />
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 truncate">
                      <span class="font-cairo font-bold text-white truncate">{{ c.displayName }}</span>
                      <span
                        class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase shrink-0"
                        :class="c.status === 'ALIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-red-950 text-red-400 border border-red-500/40'"
                      >
                        {{ c.status === 'ALIVE' ? (isRtl ? 'صامد' : 'ALIVE') : (isRtl ? 'مستبعد' : 'OUT') }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span v-for="h in 3" :key="h" class="text-[10px]">
                        {{ h <= c.hearts ? '❤️' : '🖤' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 font-mono shrink-0">
                  <div class="text-right">
                    <div class="text-[10px] text-cyan-300 font-bold">
                      {{ c.successfulDodges || 0 }} {{ isRtl ? 'تفادي' : 'dodges' }}
                    </div>
                    <div v-if="c.lastReactionMs" class="text-[9px] text-slate-400">
                      ⚡ {{ c.lastReactionMs }}ms
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-black text-xs">
                    {{ c.score || 0 }} {{ isRtl ? 'نقاط' : 'pts' }}
                  </span>
                </div>
              </div>
            </template>

            <div v-if="sortedContendersByScore.length === 0" class="text-center py-3 text-slate-500 text-xs font-tajawal">
              {{ isRtl ? 'لم يشارك أحد في هذا السباق' : 'No contenders joined this run' }}
            </div>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2 flex justify-center gap-3">
          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="shadow-glow-cyan font-black text-xs px-8 py-2.5 !bg-gradient-to-r !from-cyan-500 !to-indigo-600 hover:!brightness-110"
            @click="emit('restartGame')"
          >
            🔄 {{ isRtl ? 'إعادة المحاولة والركض من جديد' : 'Play Again' }}
          </GamerButton>
        </div>
      </div>
    </div>

    <!-- CONTENDERS HEARTS & RECENT ACTIONS BAR -->
    <div class="relative z-10 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800 flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs font-bold text-slate-400">
        <span>{{ isRtl ? 'قلوب المتسابقين في الشات (3 محاولات):' : 'Chat Contenders Lives (3 Hearts):' }}</span>
        <span class="text-cyan-400">{{ contenders.length }} {{ isRtl ? 'مشارك' : 'players' }}</span>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1 max-h-20 scrollbar-thin">
        <template v-for="contender in contenders" :key="contender.username">
          <div
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap"
            :class="[
              contender.status === 'ALIVE' ? 'bg-slate-950/90 border-slate-700 text-slate-200' :
              'bg-rose-950/40 border-rose-800/60 text-slate-400 line-through opacity-60'
            ]"
          >
            <img :src="contender.avatarUrl" class="w-5 h-5 rounded-full" />
            <span class="font-bold">{{ contender.displayName }}</span>
            <div class="flex text-xs">
              <span v-for="i in 3" :key="i">
                {{ i <= contender.hearts ? '❤️' : '🖤' }}
              </span>
            </div>
            <span
              v-if="contender.successfulDodges > 0"
              class="text-[9px] px-1 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-400 rounded"
            >
              ✓ {{ contender.lastReactionMs ? `${contender.lastReactionMs}ms` : (isRtl ? 'تفادى' : 'Dodged') }}
            </span>
          </div>
        </template>

        <div v-if="contenders.length === 0" class="text-xs text-slate-500 py-2 italic">
          {{ isRtl ? 'اكتبوا أي أمر في الشات (!join أو jump أو duck) للمشاركة تلقائياً!' : 'Type commands in chat to auto-join!' }}
        </div>
      </div>

      <!-- Admin Manual Trigger Buttons -->
      <div v-if="isAdmin && (status === 'SUBWAY_OBSTACLE' || status === 'SUBWAY_RUNNING' || state?.status === 'RUNNING' || status === 'ROUND_CLEAR' || state?.status === 'ROUND_CLEAR')" class="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs gap-2">
        <div class="text-slate-400 font-bold">
          {{ isRtl ? 'تحكم يدوي للمذيع / الستريمر:' : 'Manual Streamer Controls:' }}
        </div>
        <div class="flex flex-wrap gap-1.5">
          <template v-if="status === 'ROUND_CLEAR' || state?.status === 'ROUND_CLEAR'">
            <GamerButton
              size="sm"
              variant="primary"
              class="text-xs px-3 py-1 font-bold shadow-lg"
              @click="emit('nextRound')"
            >
              ⏭️ {{ isRtl ? 'الانطلاق للجولة التالية فوراً' : 'Next Round Now' }}
            </GamerButton>
          </template>
          <template v-else>
            <GamerButton
              size="sm"
              variant="ghost"
              class="text-xs px-2.5 py-1 text-cyan-300"
              @click="emit('submitAction', 'JUMP')"
            >
              ⬆️ {{ isRtl ? 'قفز' : 'Jump' }}
            </GamerButton>
            <GamerButton
              size="sm"
              variant="ghost"
              class="text-xs px-2.5 py-1 text-cyan-300"
              @click="emit('submitAction', 'DUCK')"
            >
              ⬇️ {{ isRtl ? 'انزل' : 'Duck' }}
            </GamerButton>
            <GamerButton
              size="sm"
              variant="ghost"
              class="text-xs px-2.5 py-1 text-cyan-300"
              @click="emit('submitAction', 'LEFT')"
            >
              ⬅️ {{ isRtl ? 'يسار' : 'Left' }}
            </GamerButton>
            <GamerButton
              size="sm"
              variant="ghost"
              class="text-xs px-2.5 py-1 text-cyan-300"
              @click="emit('submitAction', 'RIGHT')"
            >
              ➡️ {{ isRtl ? 'يمين' : 'Right' }}
            </GamerButton>
            <GamerButton
              size="sm"
              variant="primary"
              class="text-xs px-3 py-1 font-bold ml-2"
              @click="emit('resolveObstacle')"
            >
              ⏭️ {{ isRtl ? 'تخطي / حسم العقبة الآن' : 'Resolve Now' }}
            </GamerButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Perspective 3D Track */
.subway-track {
  background: linear-gradient(180deg, #090d16 0%, #030712 100%);
  background-size: 100% 60px;
}

.railway-ties {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 35px,
    rgba(6, 182, 212, 0.25) 35px,
    rgba(6, 182, 212, 0.25) 45px
  );
  animation: move-ties 0.6s linear infinite;
}

@keyframes move-ties {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(45px);
  }
}

@keyframes obstacle-approach {
  0% {
    transform: translate(-50%, -85px) scale(0.2);
    opacity: 0.2;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 45px) scale(1.15);
    opacity: 1;
  }
}

/* Character Jump Animation */
.runner-jumping {
  animation: runner-jump 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes runner-jump {
  0% { transform: translate(-50%, 0) scale(1); }
  50% { transform: translate(-50%, -90px) scale(1.1); }
  100% { transform: translate(-50%, 0) scale(1); }
}

/* Character Duck / Slide Animation */
.runner-ducking {
  animation: runner-duck 0.8s ease-in-out;
}

@keyframes runner-duck {
  0% { transform: translate(-50%, 0) scaleY(1); }
  30% { transform: translate(-50%, 15px) scaleY(0.4) rotate(-10deg); }
  70% { transform: translate(-50%, 15px) scaleY(0.4) rotate(-5deg); }
  100% { transform: translate(-50%, 0) scaleY(1); }
}
</style>
