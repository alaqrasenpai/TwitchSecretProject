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
  if (currentLane.value === 'LEFT') return '20%';
  if (currentLane.value === 'RIGHT') return '80%';
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

        <!-- Lane Labels (Top) -->
        <div class="absolute top-2 inset-x-0 flex justify-around px-8 text-xs font-black text-slate-400/60 uppercase tracking-widest pointer-events-none z-10">
          <span :class="{ 'text-cyan-400 font-black scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]': currentLane === 'LEFT' }">LEFT | يسار</span>
          <span :class="{ 'text-cyan-400 font-black scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]': currentLane === 'MIDDLE' }">MIDDLE | وسط</span>
          <span :class="{ 'text-cyan-400 font-black scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]': currentLane === 'RIGHT' }">RIGHT | يمين</span>
        </div>

        <!-- ONCOMING OBSTACLE -->
        <div
          v-if="currentObstacle && (status === 'SUBWAY_OBSTACLE' || status === 'SUBWAY_RUNNING' || state?.status === 'RUNNING')"
          class="absolute transition-all duration-300 transform-gpu -translate-x-1/2 flex flex-col items-center z-20"
          :style="{
            left: getObstacleLaneX(currentObstacle.lane),
            top: '30%',
            animation: 'obstacle-approach 1.8s ease-in forwards'
          }"
        >
          <!-- Obstacle Graphic & Label -->
          <div
            class="px-4 py-2.5 rounded-xl border-2 flex items-center gap-2 shadow-2xl backdrop-blur-md animate-bounce"
            :class="[
              currentObstacle.requiredAction === 'JUMP' ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-500/50' :
              currentObstacle.requiredAction === 'DUCK' ? 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-amber-500/50' :
              'bg-blue-950/90 border-cyan-400 text-cyan-100 shadow-cyan-500/50'
            ]"
          >
            <span class="text-3xl">
              {{
                currentObstacle.type === 'LOW_BARRIER' ? '🚧' :
                currentObstacle.type === 'HIGH_BARRIER' ? '⚡' :
                currentObstacle.type === 'ROCK' ? '🪨' : '🚄'
              }}
            </span>
            <div class="text-center">
              <div class="text-xs font-black uppercase tracking-wider text-white">
                {{ isRtl ? currentObstacle.labelAr : currentObstacle.labelEn }}
              </div>
              <div class="text-[10px] font-bold opacity-80">
                {{ isRtl ? ('المسار: ' + (currentObstacle.lane === 'LEFT' ? 'اليسار' : currentObstacle.lane === 'RIGHT' ? 'اليمين' : 'الوسط')) : ('Lane: ' + currentObstacle.lane) }}
              </div>
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
                  currentObstacle.requiredAction === 'JUMP' ? 'jump / قفز' :
                  currentObstacle.requiredAction === 'DUCK' ? 'duck / انزل' :
                  currentObstacle.requiredAction === 'LEFT' ? 'left / يسار' : 'right / يمين'
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
            <div class="text-[11px] font-bold text-cyan-300">jump / قفز</div>
          </div>
          <div class="bg-slate-950 p-2 rounded-xl border border-cyan-500/30">
            <div class="text-lg">⬇️</div>
            <div class="text-[11px] font-bold text-cyan-300">duck / انزل</div>
          </div>
          <div class="bg-slate-950 p-2 rounded-xl border border-cyan-500/30">
            <div class="text-lg">⬅️</div>
            <div class="text-[11px] font-bold text-cyan-300">left / يسار</div>
          </div>
          <div class="bg-slate-950 p-2 rounded-xl border border-cyan-500/30">
            <div class="text-lg">➡️</div>
            <div class="text-[11px] font-bold text-cyan-300">right / يمين</div>
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

      <!-- GAME CRASHED / FINISHED OVERLAY -->
      <div
        v-if="status === 'SUBWAY_CRASHED' || status === 'FINISHED' || state?.status === 'MATCH_OVER'"
        class="text-center p-6 bg-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-rose-500/50 max-w-lg shadow-2xl my-auto animate-fade-in"
      >
        <div class="text-5xl mb-2">💥🏁</div>
        <h2 class="text-2xl font-black text-rose-400 mb-1">
          {{ isRtl ? 'انتهت جولة الهروب السريع!' : 'Subway Run Ended!' }}
        </h2>
        <div class="text-lg font-bold text-white mb-4">
          {{ isRtl ? 'المسافة النهائية:' : 'Final Distance:' }}
          <span class="text-cyan-400 font-mono text-xl">{{ distanceMeters.toLocaleString() }} m</span>
        </div>

        <!-- Winner / MVP -->
        <div v-if="winner" class="bg-slate-950/80 p-4 rounded-xl border border-amber-500/40 mb-5 flex items-center justify-center gap-3">
          <span class="text-3xl">👑</span>
          <div class="text-right">
            <div class="text-[10px] text-amber-400 font-bold uppercase">
              {{ isRtl ? 'الناجي الأسطوري وبطل السباق' : 'MVP Survivor' }}
            </div>
            <div class="text-base font-black text-white">
              {{ winner.displayName }}
            </div>
          </div>
        </div>

        <div v-if="isAdmin" class="flex justify-center gap-3">
          <GamerButton
            variant="secondary"
            class="px-6 py-2.5 font-bold"
            @click="emit('restartGame')"
          >
            🔄 {{ isRtl ? 'إعادة المحاولة' : 'Play Again' }}
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
              ⬆️ Jump
            </GamerButton>
            <GamerButton
              size="sm"
              variant="ghost"
              class="text-xs px-2.5 py-1 text-cyan-300"
              @click="emit('submitAction', 'DUCK')"
            >
              ⬇️ Duck
            </GamerButton>
            <GamerButton
              size="sm"
              variant="ghost"
              class="text-xs px-2.5 py-1 text-cyan-300"
              @click="emit('submitAction', 'LEFT')"
            >
              ⬅️ Left
            </GamerButton>
            <GamerButton
              size="sm"
              variant="ghost"
              class="text-xs px-2.5 py-1 text-cyan-300"
              @click="emit('submitAction', 'RIGHT')"
            >
              ➡️ Right
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
    transform: translate(-50%, -80px) scale(0.3);
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 40px) scale(1);
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
