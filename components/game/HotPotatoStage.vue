<script setup lang="ts">
import type { IGameSession, IPlayer } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';
import { useAudioSfx } from '~/composables/useAudioSfx';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
import confetti from 'canvas-confetti';

const props = withDefaults(
  defineProps<{
    session: IGameSession | null;
    isAdmin?: boolean;
  }>(),
  {
    isAdmin: false
  }
);

const emit = defineEmits<{
  (e: 'startGame'): void;
  (e: 'passBomb', target?: string | number): void;
  (e: 'resolveDetonation'): void;
  (e: 'nextRound'): void;
  (e: 'restartGame'): void;
}>();

const { t, isRtl } = useTranslation();
const audio = useAudioSfx();

const state = computed(() => props.session?.hotPotatoState || null);
const status = computed(() => state.value?.status || props.session?.status || 'LOBBY');
const currentHolderNumber = computed(() => state.value?.currentHolderNumber || null);
const currentHolderUsername = computed(() => state.value?.currentHolderUsername || '');
const currentHolderDisplayName = computed(() => state.value?.currentHolderDisplayName || '');
const dangerLevel = computed(() => state.value?.fuseDangerLevel || 'COOL');
const roundNumber = computed(() => state.value?.roundNumber || 1);
const eliminatedPlayer = computed(() => state.value?.eliminatedPlayer || null);
const winner = computed(() => state.value?.winner || props.session?.winner || null);
const recentPasses = computed(() => state.value?.recentPasses || []);
const totalPasses = computed(() => state.value?.totalPassesCount || 0);

const players = computed(() => props.session?.players || []);
const alivePlayers = computed(() => players.value.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED'));
const eliminatedPlayers = computed(() => players.value.filter((p) => p.status === 'ELIMINATED'));

const currentHolderPlayer = computed(() => {
  if (!currentHolderNumber.value) return null;
  return players.value.find((p) => p.number === currentHolderNumber.value) || null;
});

const sortedContenders = computed(() => {
  const all = [...players.value];
  const winUser = winner.value?.username?.toLowerCase();
  return all.sort((a, b) => {
    if (winUser && a.username.toLowerCase() === winUser) return -1;
    if (winUser && b.username.toLowerCase() === winUser) return 1;
    const aAlive = a.status === 'ALIVE' || a.status === 'REVIVED';
    const bAlive = b.status === 'ALIVE' || b.status === 'REVIVED';
    if (aAlive && !bAlive) return -1;
    if (!aAlive && bAlive) return 1;
    return a.number - b.number;
  });
});

function getPlayerPassStats(username: string) {
  const clean = username.toLowerCase();
  const passedCount = recentPasses.value.filter((p) => p.fromUsername?.toLowerCase() === clean).length;
  return { passedCount };
}

// Timer countdown & Tick Sound Interval
const remainingSeconds = ref(25);
let timerInterval: any = null;
let lastTickSecond = -1;

watch(
  () => state.value?.fuseEndsAt,
  (endsAt) => {
    if (!endsAt || endsAt <= 0 || status.value !== 'BOMB_TICKING') {
      remainingSeconds.value = 0;
      if (timerInterval) clearInterval(timerInterval);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = endsAt - now;
      const sec = Math.max(0, Math.ceil(diffMs / 1000));
      remainingSeconds.value = sec;

      // Play tick audio on every second decrease
      if (sec !== lastTickSecond && sec > 0) {
        lastTickSecond = sec;
        const isUrgent = sec <= 6;
        try {
          audio.playBombTick(isUrgent);
        } catch (e) {}
      }

      // Automatically trigger detonation when fuse runs out
      if (diffMs <= 0 && status.value === 'BOMB_TICKING') {
        if (timerInterval) clearInterval(timerInterval);
        if (props.isAdmin) {
          emit('resolveDetonation');
        }
      }
    };

    updateTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 250);
  },
  { immediate: true }
);

// Detonation & Winner watchers
watch(
  () => status.value,
  (newStatus, oldStatus) => {
    if (newStatus === 'BOMB_EXPLODED') {
      try {
        audio.playBombExplosion();
      } catch (e) {}
    } else if (newStatus === 'MATCH_OVER' || (newStatus === 'FINISHED' && winner.value)) {
      try {
        audio.playVictoryFanfare();
        triggerConfetti();
      } catch (e) {}
    }
  }
);

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function triggerConfetti() {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ef4444', '#f97316', '#eab308', '#ffffff', '#dc2626']
    });
  } catch (e) {}
}

// Pass to specific contender (Streamer Admin testing / click)
const selectedPassTarget = ref<number | ''>('');
function handleManualPass(targetNum?: number) {
  const target = targetNum !== undefined ? targetNum : selectedPassTarget.value;
  emit('passBomb', target || undefined);
  selectedPassTarget.value = '';
}
</script>

<template>
  <div
    class="relative flex-1 p-4 sm:p-6 bg-gradient-to-b from-neutral-950 via-zinc-950 to-red-950/40 border-2 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden min-h-0 transition-colors duration-500"
    :class="[
      dangerLevel === 'CRITICAL'
        ? 'border-red-600/90 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse'
        : dangerLevel === 'WARM'
          ? 'border-orange-500/80 shadow-[0_0_35px_rgba(249,115,22,0.35)]'
          : 'border-red-900/60 shadow-[0_0_30px_rgba(220,38,38,0.2)]',
      isRtl ? 'text-right' : 'text-left'
    ]"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <!-- Ambient Lava / Spark Glow Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full blur-3xl transition-all duration-700"
        :class="[
          dangerLevel === 'CRITICAL'
            ? 'bg-red-600/30 scale-125'
            : dangerLevel === 'WARM'
              ? 'bg-orange-600/25 scale-110'
              : 'bg-red-900/20 scale-100'
        ]"
      />
      <div
        v-if="status === 'BOMB_TICKING'"
        class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)] animate-ping opacity-30 pointer-events-none"
        :style="{ animationDuration: dangerLevel === 'CRITICAL' ? '0.6s' : dangerLevel === 'WARM' ? '1.2s' : '2s' }"
      />
    </div>

    <!-- Header HUD: Round, Danger Indicator, Total Passes -->
    <div class="relative z-10 flex items-center justify-between border-b border-red-900/40 pb-3 gap-2 shrink-0">
      <div class="flex items-center gap-2 sm:gap-3">
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg border transition-all duration-300"
          :class="[
            dangerLevel === 'CRITICAL'
              ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-bounce'
              : dangerLevel === 'WARM'
                ? 'bg-orange-600 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                : 'bg-neutral-900 border-red-800/80 shadow-md'
          ]"
        >
          💣
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-cairo font-black text-lg sm:text-xl text-white tracking-wide">
              {{ t('hotPotatoTitle') }}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/60 font-mono font-bold">
              R#{{ roundNumber }}
            </span>
          </div>
          <p class="text-[11px] font-tajawal text-neutral-400">
            {{ isRtl ? 'معركة التمرير السريع بالقنبلة الموقوتة' : 'Rapid chat bomb toss arena' }}
          </p>
        </div>
      </div>

      <!-- Danger Level Badge & Survivors Count -->
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="hidden sm:flex flex-col items-end">
          <span class="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            {{ isRtl ? 'الناجون' : 'Survivors' }}
          </span>
          <span class="font-cairo font-black text-sm text-emerald-400">
            {{ alivePlayers.length }} / {{ players.length }}
          </span>
        </div>

        <div
          class="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all shadow-md"
          :class="[
            dangerLevel === 'CRITICAL'
              ? 'bg-red-950 text-red-300 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse'
              : dangerLevel === 'WARM'
                ? 'bg-orange-950 text-orange-300 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700'
          ]"
        >
          <span class="w-2 h-2 rounded-full" :class="dangerLevel === 'CRITICAL' ? 'bg-red-500 animate-ping' : dangerLevel === 'WARM' ? 'bg-orange-500' : 'bg-emerald-500'" />
          <span>{{ dangerLevel === 'CRITICAL' ? (isRtl ? 'خطر حرج ⚠️' : 'CRITICAL DANGER') : dangerLevel === 'WARM' ? (isRtl ? 'حرارة مرتفعة 🔥' : 'WARMING UP') : (isRtl ? 'الفتيل يشتعل ⏳' : 'TICKING') }}</span>
        </div>
      </div>
    </div>

    <!-- CENTER STAGE -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center my-3 sm:my-5 min-h-0">
      <!-- 1. LOBBY WAITING STATE -->
      <div
        v-if="status === 'LOBBY'"
        class="text-center space-y-4 max-w-md mx-auto p-6 bg-neutral-950/80 rounded-3xl border border-red-900/50 shadow-2xl backdrop-blur-md"
      >
        <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse">
          💣
        </div>
        <div class="space-y-1">
          <h2 class="font-cairo font-black text-2xl sm:text-3xl text-white">
            {{ isRtl ? 'جاهزون لإشعال القنبلة؟' : 'Ready to Light the Fuse?' }}
          </h2>
          <p class="text-xs sm:text-sm font-tajawal text-neutral-400">
            {{ isRtl ? 'اطلب من المتابعين الدخول بكتابة !join في الشات للمشاركة!' : 'Ask chatters to join via !join in Twitch chat!' }}
          </p>
        </div>

        <div class="p-3 bg-red-950/40 rounded-2xl border border-red-800/40 text-xs font-mono text-neutral-300 flex items-center justify-around">
          <div>
            <span class="text-neutral-500 block text-[10px]">{{ isRtl ? 'المتسابقون' : 'Contenders' }}</span>
            <span class="font-black text-white text-base">{{ alivePlayers.length }}</span>
          </div>
          <div class="h-6 w-px bg-neutral-800" />
          <div>
            <span class="text-neutral-500 block text-[10px]">{{ isRtl ? 'المهلة السرية' : 'Secret Fuse' }}</span>
            <span class="font-black text-amber-400 text-base">15 - 35s</span>
          </div>
          <div class="h-6 w-px bg-neutral-800" />
          <div>
            <span class="text-neutral-500 block text-[10px]">{{ isRtl ? 'أمر التمرير' : 'Pass Command' }}</span>
            <span class="font-black text-cyan-400 text-base">!pass</span>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2">
          <GamerButton
            size="lg"
            variant="primary"
            rounded="full"
            :disabled="alivePlayers.length < 2"
            class="w-full shadow-[0_0_25px_rgba(239,68,68,0.6)] font-black text-base py-3 !bg-gradient-to-r !from-red-600 !via-orange-600 !to-amber-600 hover:!brightness-110"
            @click="emit('startGame')"
          >
            🔥 {{ isRtl ? 'إشعال القنبلة وبدء الجولة' : 'Light Fuse & Start Round' }}
          </GamerButton>
        </div>
      </div>

      <!-- 2. ACTIVE TICKING BOMB STAGE -->
      <div
        v-else-if="status === 'BOMB_TICKING'"
        class="w-full max-w-2xl flex flex-col items-center justify-center space-y-4"
      >
        <!-- Animated 3D Bomb with Sparks -->
        <div class="relative flex items-center justify-center py-2">
          <!-- Danger shockwaves -->
          <div
            class="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none"
            :style="{ animationDuration: dangerLevel === 'CRITICAL' ? '0.5s' : dangerLevel === 'WARM' ? '1s' : '1.8s' }"
          />

          <!-- Bomb Core Container -->
          <div
            class="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-neutral-800 border-4 flex items-center justify-center shadow-2xl transition-transform duration-200 select-none"
            :class="[
              dangerLevel === 'CRITICAL'
                ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.8)] scale-110 animate-bounce'
                : dangerLevel === 'WARM'
                  ? 'border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.6)] scale-105'
                  : 'border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.4)] scale-100'
            ]"
          >
            <!-- Fuse & Sparks (SVG) -->
            <div class="absolute -top-7 sm:-top-9 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <!-- Animated burning spark -->
              <span class="text-xl sm:text-2xl animate-spin text-amber-300 drop-shadow-[0_0_10px_#f59e0b]">
                ✨
              </span>
              <!-- Wick string -->
              <div class="w-1.5 h-6 bg-gradient-to-b from-amber-400 via-orange-600 to-neutral-700 rounded-full animate-pulse" />
            </div>

            <!-- Skull / Bomb Face Icon -->
            <div class="text-center space-y-1">
              <span class="text-5xl sm:text-6xl block transform transition-transform" :class="dangerLevel === 'CRITICAL' ? 'scale-125' : 'scale-100'">
                {{ dangerLevel === 'CRITICAL' ? '💀' : '💣' }}
              </span>
              <span class="font-mono font-black text-xs sm:text-sm tracking-widest text-red-400 block">
                {{ dangerLevel === 'CRITICAL' ? 'CRITICAL!' : dangerLevel === 'WARM' ? 'HEATING UP' : 'ARMED' }}
              </span>
            </div>

            <!-- Danger Ring Glow -->
            <div
              class="absolute inset-0 rounded-full border-2 border-dashed pointer-events-none animate-spin-slow"
              :class="dangerLevel === 'CRITICAL' ? 'border-red-500/80' : dangerLevel === 'WARM' ? 'border-orange-500/60' : 'border-neutral-700/60'"
            />
          </div>
        </div>

        <!-- CURRENT HOLDER SPOTLIGHT CARD -->
        <div
          class="w-full p-4 sm:p-5 bg-gradient-to-r from-red-950/80 via-neutral-950 to-red-950/80 rounded-2xl sm:rounded-3xl border-2 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
          :class="dangerLevel === 'CRITICAL' ? 'border-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'border-red-800/60'"
        >
          <!-- Player Info -->
          <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div
              class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-900 border-2 border-red-500 flex items-center justify-center font-cairo font-black text-xl sm:text-2xl text-white shadow-lg relative shrink-0"
            >
              #{{ currentHolderNumber || '?' }}
              <span class="absolute -bottom-1 -right-1 text-xs">🔥</span>
            </div>
            <div class="min-w-0">
              <span class="text-[10px] font-mono text-red-400 uppercase tracking-widest block">
                {{ isRtl ? 'حامل القنبلة الحالي 💣' : 'CURRENT BOMB HOLDER' }}
              </span>
              <h3 class="font-cairo font-black text-xl sm:text-2xl text-white truncate drop-shadow-md">
                {{ currentHolderDisplayName || currentHolderUsername || 'Contender' }}
              </h3>
              <p class="text-xs font-tajawal text-neutral-400 truncate">
                {{ isRtl ? 'اكتب في الشات للتمرير:' : 'Type in chat to pass:' }}
                <code class="text-amber-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded ml-1">!pass &lt;number&gt;</code>
              </p>
            </div>
          </div>

          <!-- Quick Action Guidance / Pass Buttons for Streamer Admin -->
          <div class="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0">
            <div class="text-[11px] font-tajawal text-neutral-300 bg-red-900/30 border border-red-700/40 px-3 py-1 rounded-full text-center">
              💬 {{ isRtl ? 'اكتب !pass أو !مرر <رقم>' : '!pass or !pass <number>' }}
            </div>

            <div v-if="isAdmin" class="flex items-center gap-2">
              <GamerButton
                size="sm"
                variant="secondary"
                rounded="full"
                class="text-xs px-3 py-1 font-bold border-amber-500/60 text-amber-300 hover:bg-amber-950/40"
                @click="handleManualPass()"
              >
                🎲 {{ isRtl ? 'رمي عشوائي' : 'Random Pass' }}
              </GamerButton>
              <GamerButton
                size="sm"
                variant="primary"
                rounded="full"
                class="text-xs px-3 py-1 font-bold !bg-red-600 hover:!bg-red-700"
                @click="emit('resolveDetonation')"
              >
                💥 {{ isRtl ? 'تفجير فوري' : 'Force Boom' }}
              </GamerButton>
            </div>
          </div>
        </div>

        <!-- Alive Contenders Fast Pass Grid (Admin Quick Click Target) -->
        <div v-if="isAdmin && alivePlayers.length > 1" class="w-full space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-tajawal text-neutral-400 px-1">
            <span>{{ isRtl ? 'تمرير سريع لمنافس آخر (تجربة الستريمر):' : 'Streamer Quick Pass to Player:' }}</span>
            <span class="font-mono text-neutral-500">{{ alivePlayers.length - 1 }} {{ isRtl ? 'أهداف متاحة' : 'targets' }}</span>
          </div>
          <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-black/40 rounded-xl border border-neutral-800">
            <button
              v-for="p in alivePlayers.filter((pl) => pl.number !== currentHolderNumber)"
              :key="p.number"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-neutral-900/90 border border-neutral-700 hover:border-red-500 hover:bg-red-950/60 text-white transition-all flex items-center gap-1.5"
              @click="handleManualPass(p.number)"
            >
              <span class="text-amber-400">#{{ p.number }}</span>
              <span class="truncate max-w-[90px]">{{ p.displayName }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. BOMB EXPLODED ROUND SUMMARY -->
      <div
        v-else-if="status === 'BOMB_EXPLODED'"
        class="text-center space-y-5 max-w-lg mx-auto p-6 sm:p-8 bg-neutral-950/90 rounded-3xl border-2 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.7)] backdrop-blur-xl animate-in zoom-in-95 duration-300"
      >
        <div class="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div class="absolute inset-0 bg-red-600/40 rounded-full blur-xl animate-ping" />
          <span class="text-6xl sm:text-7xl block relative z-10 animate-bounce">
            💥
          </span>
        </div>

        <div class="space-y-2">
          <span class="px-3 py-1 bg-red-950 text-red-300 border border-red-500 rounded-full text-xs font-mono font-black uppercase tracking-wider">
            {{ isRtl ? 'انفجار القنبلة!' : 'DETONATION CONFIRMED!' }}
          </span>
          <h2 class="font-cairo font-black text-2xl sm:text-3xl text-white">
            {{ isRtl ? 'تم استبعاد اللاعب!' : 'Contender Eliminated!' }}
          </h2>
          <div class="p-4 bg-red-950/60 rounded-2xl border border-red-700/60 space-y-1">
            <div class="font-cairo font-black text-xl text-red-300 flex items-center justify-center gap-2">
              <span>💀 #{{ eliminatedPlayer?.number || '?' }} {{ eliminatedPlayer?.displayName || 'Contender' }}</span>
            </div>
            <p class="text-xs font-tajawal text-neutral-300">
              {{ isRtl ? 'انتهت المهلة وهو يحمل القنبلة فتم إقصاؤه من المعركة!' : 'Held the bomb when the fuse reached zero!' }}
            </p>
          </div>
        </div>

        <div class="text-xs font-tajawal text-neutral-400 flex items-center justify-center gap-4 border-t border-neutral-800 pt-3">
          <span>{{ isRtl ? 'المتبقون:' : 'Remaining Survivors:' }} <strong class="text-emerald-400">{{ alivePlayers.length }}</strong></span>
          <span>•</span>
          <span>{{ isRtl ? 'إجمالي التمريرات:' : 'Total Passes:' }} <strong class="text-amber-400">{{ totalPasses }}</strong></span>
        </div>

        <div v-if="isAdmin" class="pt-2">
          <GamerButton
            size="lg"
            variant="primary"
            rounded="full"
            class="w-full shadow-[0_0_25px_rgba(239,68,68,0.6)] font-black text-base py-3 !bg-gradient-to-r !from-red-600 !to-amber-600 hover:!brightness-110"
            @click="emit('nextRound')"
          >
            🔥 {{ isRtl ? 'بدء الجولة التالية 💣' : 'Start Next Round 💣' }}
          </GamerButton>
        </div>
      </div>

      <!-- 4. MATCH OVER / GRAND SCOREBOARD -->
      <div
        v-else-if="status === 'MATCH_OVER' || status === 'FINISHED'"
        class="w-full max-w-2xl mx-auto p-5 sm:p-7 bg-gradient-to-b from-neutral-950 via-neutral-900/98 to-neutral-950 rounded-3xl border-2 border-amber-500/80 shadow-[0_0_60px_rgba(245,158,11,0.5)] backdrop-blur-xl animate-scale-up space-y-4 text-center"
      >
        <div class="inline-flex items-center gap-2 px-4 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-glow-gold">
          👑 {{ isRtl ? 'لوحة الشرف والنتائج النهائية (SCOREBOARD)' : 'FINAL STANDINGS & SURVIVORS' }}
        </div>

        <!-- Winner Spotlight -->
        <div
          v-if="winner"
          class="p-4 bg-gradient-to-r from-amber-950/60 via-neutral-900 to-red-950/60 rounded-2xl border border-amber-400/70 flex items-center justify-between gap-3 shadow-glow-gold"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative shrink-0">
              <img
                :src="winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${winner.username}`"
                class="w-14 h-14 rounded-2xl border-2 border-amber-400 shadow-xl"
              />
              <span class="absolute -top-2.5 -right-2 text-xl animate-bounce">👑</span>
            </div>
            <div :class="isRtl ? 'text-right' : 'text-left'" class="min-w-0">
              <div class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {{ isRtl ? 'بطل القنبلة الموقوتة والناجي الأخير' : 'HOT POTATO CHAMPION & SOLE SURVIVOR' }}
              </div>
              <div class="text-lg font-black text-white font-cairo truncate">
                {{ winner.displayName }}
              </div>
              <div class="text-xs text-neutral-400 font-mono">@{{ winner.username }}</div>
            </div>
          </div>

          <div class="text-right font-mono shrink-0">
            <span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-black text-xs">
              {{ isRtl ? 'صامد 🏆' : 'SURVIVOR 🏆' }}
            </span>
          </div>
        </div>

        <!-- Match Stats Header -->
        <div class="p-3 bg-black/60 rounded-2xl border border-neutral-800 text-xs font-mono text-neutral-400 flex items-center justify-around">
          <div>
            <span class="block text-[10px] text-neutral-500">{{ isRtl ? 'الجولات المكتملة' : 'Rounds Completed' }}</span>
            <span class="font-black text-white text-base">{{ roundNumber }}</span>
          </div>
          <div class="h-6 w-px bg-neutral-800" />
          <div>
            <span class="block text-[10px] text-neutral-500">{{ isRtl ? 'إجمالي التمريرات' : 'Total Passes' }}</span>
            <span class="font-black text-amber-400 text-base">{{ totalPasses }}</span>
          </div>
          <div class="h-6 w-px bg-neutral-800" />
          <div>
            <span class="block text-[10px] text-neutral-500">{{ isRtl ? 'المتسابقون' : 'Contenders' }}</span>
            <span class="font-black text-red-400 text-base">{{ players.length }}</span>
          </div>
        </div>

        <!-- Full Contenders Survival Leaderboard -->
        <div class="space-y-1.5" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="flex items-center justify-between text-xs font-cairo font-bold text-amber-300 px-1">
            <span>📊 {{ isRtl ? 'ترتيب المتسابقين حسب البقاء والتمرير:' : 'Contenders Leaderboard & Survival:' }}</span>
            <span class="text-[10px] font-mono text-neutral-500">{{ sortedContenders.length }} {{ isRtl ? 'لاعب' : 'players' }}</span>
          </div>

          <div class="max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            <template v-for="(p, idx) in sortedContenders" :key="p.username">
              <div
                class="flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all"
                :class="[
                  idx === 0 ? 'bg-amber-950/60 border-amber-400/80 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                  idx === 1 ? 'bg-neutral-800/80 border-neutral-600 text-neutral-200' :
                  idx === 2 ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' :
                  'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                ]"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="font-mono font-bold text-xs shrink-0" :class="idx < 3 ? 'text-amber-400' : 'text-neutral-500'">
                    {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                  </span>
                  <img
                    :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`"
                    class="w-7 h-7 rounded-full border shrink-0"
                    :class="p.status === 'ALIVE' || p.status === 'REVIVED' ? 'border-amber-400/70' : 'border-red-900/60 grayscale'"
                  />
                  <div class="min-w-0">
                    <div class="font-cairo font-bold text-white truncate flex items-center gap-1.5">
                      <span>{{ p.displayName }}</span>
                      <span class="text-[10px] text-neutral-400 font-mono">@{{ p.username }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 font-mono shrink-0">
                  <span v-if="getPlayerPassStats(p.username).passedCount > 0" class="text-[10px] text-amber-300 font-bold">
                    {{ getPlayerPassStats(p.username).passedCount }} {{ isRtl ? 'تمريرة' : 'passes' }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded text-[9px] font-bold uppercase border"
                    :class="p.status === 'ALIVE' || p.status === 'REVIVED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : 'bg-red-950 text-red-400 border-red-500/50'"
                  >
                    {{ p.status === 'ALIVE' || p.status === 'REVIVED' ? (isRtl ? 'صامد 🏆' : 'ALIVE 🏆') : (isRtl ? 'انفجر 💥' : 'BLASTED 💥') }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2">
          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full shadow-glow-crimson font-black text-sm py-2.5 !bg-gradient-to-r !from-red-600 !to-amber-600 hover:!brightness-110"
            @click="emit('restartGame')"
          >
            ↺ {{ isRtl ? 'إعادة اللعبة من جديد' : 'Play Another Match' }}
          </GamerButton>
        </div>
      </div>
    </div>

    <!-- FOOTER: RECENT PASSES TICKER -->
    <div class="relative z-10 border-t border-red-900/40 pt-2.5 shrink-0">
      <div class="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1.5 px-1">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          {{ isRtl ? 'سجل التمريرات المباشر:' : 'Live Pass Feed:' }}
        </span>
        <span>{{ totalPasses }} {{ isRtl ? 'تمريرات' : 'passes' }}</span>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
        <div
          v-if="recentPasses.length === 0"
          class="text-neutral-500 text-[11px] font-tajawal py-1 px-2"
        >
          {{ isRtl ? 'بانتظار أول تمريرة للقنبلة في الشات...' : 'Awaiting first bomb pass in chat...' }}
        </div>
        <div
          v-for="pass in recentPasses.slice(0, 6)"
          :key="pass.id"
          class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono shadow-sm"
        >
          <span class="text-neutral-300 font-bold">#{{ pass.fromNumber }}</span>
          <span class="text-neutral-500 truncate max-w-[70px]">{{ pass.fromDisplayName }}</span>
          <span class="text-amber-400">➔ 💣 ➔</span>
          <span class="text-red-400 font-bold">#{{ pass.toNumber }}</span>
          <span class="text-neutral-300 truncate max-w-[70px]">{{ pass.toDisplayName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin-slow {
  animation: spinSlow 12s linear infinite;
}
</style>
