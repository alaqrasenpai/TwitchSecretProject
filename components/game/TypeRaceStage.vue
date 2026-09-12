<script setup lang="ts">
import type { IGameSession } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';
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
  (e: 'startGame', languageMode?: 'AR' | 'EN' | 'MIXED', totalRounds?: number): void;
  (e: 'nextRound'): void;
  (e: 'timeout'): void;
  (e: 'restartGame'): void;
  (e: 'submitWord', word: string): void;
  (e: 'setLanguage', languageMode: 'AR' | 'EN' | 'MIXED'): void;
}>();

const { t, isRtl } = useTranslation();

const selectedLanguage = ref<'AR' | 'EN' | 'MIXED'>('AR');
const selectedWordsCount = ref<number>(props.session?.settings?.typeRaceTotalRounds || props.session?.typeRaceState?.totalRounds || 7);

watch(
  () => props.session?.settings?.typeRaceLanguage || props.session?.typeRaceState?.languageMode,
  (lang) => {
    if (lang) selectedLanguage.value = lang;
  },
  { immediate: true }
);

watch(
  () => props.session?.settings?.typeRaceTotalRounds || props.session?.typeRaceState?.totalRounds,
  (cnt) => {
    if (cnt) selectedWordsCount.value = cnt;
  }
);

const state = computed(() => props.session?.typeRaceState || null);
const status = computed(() => state.value?.status || 'LOBBY');
const currentWord = computed(() => state.value?.currentWord || '');
const currentWordEn = computed(() => state.value?.currentWordEn || '');
const currentRound = computed(() => state.value?.currentRound || 1);
const totalRounds = computed(() => state.value?.totalRounds || 7);
const targetScore = computed(() => state.value?.targetScore || 3);
const fastestTypist = computed(() => state.value?.fastestTypist || null);
const winner = computed(() => state.value?.winner || props.session?.winner || null);
const roundWinners = computed(() => state.value?.roundWinners || []);

const sortedPlayersByScore = computed(() => {
  const players = props.session?.players || [];
  return [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
});

const isMatchFinished = computed(() => {
  return status.value === 'MATCH_OVER' || props.session?.status === 'FINISHED';
});

// Timer countdown computation
const timeRemaining = ref(15);
const isTimingOut = ref(false);
let timerInterval: any = null;

// Auto advance timer for round won / timeout transitions
const autoAdvanceSeconds = ref(0);
let autoAdvanceTimer: any = null;

function startAutoAdvance(seconds = 4) {
  autoAdvanceSeconds.value = seconds;
  if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
  autoAdvanceTimer = setInterval(() => {
    autoAdvanceSeconds.value--;
    if (autoAdvanceSeconds.value <= 0) {
      clearInterval(autoAdvanceTimer);
      if (props.isAdmin && !isMatchFinished.value) {
        emit('nextRound');
      }
    }
  }, 1000);
}

function stopAutoAdvance() {
  if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
  autoAdvanceSeconds.value = 0;
}

function handleRoundTimeout() {
  if (isTimingOut.value || isMatchFinished.value) return;
  isTimingOut.value = true;
  setTimeout(() => {
    isTimingOut.value = false;
    if (props.isAdmin && !isMatchFinished.value) {
      emit('timeout');
    }
  }, 2200);
}

watch(
  () => props.session?.timerEndsAt,
  (endsAt) => {
    if (!endsAt) {
      timeRemaining.value = 0;
      if (timerInterval) clearInterval(timerInterval);
      return;
    }
    const updateTime = () => {
      const remainingMs = new Date(endsAt).getTime() - Date.now();
      timeRemaining.value = Math.max(0, Math.ceil(remainingMs / 1000));
      if (timeRemaining.value <= 0 && timerInterval) {
        clearInterval(timerInterval);
        if (props.isAdmin && status.value === 'WORD_ACTIVE' && !isTimingOut.value) {
          handleRoundTimeout();
        }
      }
    };
    updateTime();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTime, 200);
  },
  { immediate: true }
);

watch(
  () => status.value,
  (newStatus) => {
    if (newStatus === 'ROUND_WON') {
      startAutoAdvance(4);
    } else {
      stopAutoAdvance();
    }

    if (newStatus === 'MATCH_OVER' || isMatchFinished.value) {
      triggerConfetti();
    }
  },
  { immediate: true }
);

watch(
  () => props.session?.status,
  (s) => {
    if (s === 'FINISHED') {
      triggerConfetti();
    }
  }
);

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  stopAutoAdvance();
});

function triggerConfetti() {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#fbbf24', '#f97316', '#ffffff', '#e11d48']
    });
  } catch (e) {}
}

const mockInput = ref('');
function submitManualWord() {
  if (!mockInput.value.trim()) return;
  emit('submitWord', mockInput.value.trim());
  mockInput.value = '';
}
</script>

<template>
  <div class="relative flex-1 p-4 bg-gradient-to-b from-arena-card/95 via-arena-dark/95 to-arena-card/90 border-2 border-amber-500/40 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.2)] flex flex-col justify-between overflow-hidden min-h-0 select-none">
    <!-- Ambient Golden Glow -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
    </div>

    <!-- Header HUD -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300/40">
          ⚡
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-cairo font-black text-lg sm:text-xl text-white tracking-wide">
              {{ isRtl ? 'سباق سرعة الكتابة' : 'Type Race Arena' }}
            </h2>
            <GamerBadge
              :status="isMatchFinished ? 'DEAD' : status === 'WORD_ACTIVE' ? 'LIVE' : status === 'ROUND_WON' ? 'ALIVE' : 'LOBBY'"
              :label="isMatchFinished ? (isRtl ? 'لوحة النتائج 🏆' : 'SCOREBOARD 🏆') : status === 'WORD_ACTIVE' ? (isRtl ? 'اكتب الآن!' : 'TYPE NOW!') : status === 'ROUND_WON' ? (isRtl ? 'حُسمت الجولة' : 'ROUND WON') : (isRtl ? 'انتظار البدء' : 'LOBBY')"
              size="xs"
            />
          </div>
          <div class="text-[11px] font-tajawal text-arena-textMuted flex items-center gap-2">
            <span>{{ isRtl ? `الجولة ${currentRound} من ${totalRounds}` : `Round ${currentRound} of ${totalRounds}` }}</span>
            <span>•</span>
            <span class="text-amber-400 font-bold">{{ isRtl ? 'الأعلى نقاطاً يفوز 🏆' : 'Highest Score Wins 🏆' }}</span>
          </div>
        </div>
      </div>

      <!-- Right HUD: Timer Display -->
      <div v-if="status === 'WORD_ACTIVE' && !isMatchFinished" class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] font-tajawal text-slate-400 font-bold uppercase tracking-wider">
            {{ isRtl ? 'الوقت المتبقي' : 'TIME REMAINING' }}
          </div>
          <div
            class="font-mono font-black text-2xl"
            :class="timeRemaining <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-300'"
          >
            00:{{ timeRemaining.toString().padStart(2, '0') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Center Arena: The Word Display & Screens -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center my-3 min-h-0 w-full px-2 overflow-y-auto">
      <!-- 1. LOBBY SCREEN -->
      <div v-if="status === 'LOBBY' && !isMatchFinished" class="text-center space-y-4 max-w-lg mx-auto p-6 bg-arena-card/80 border border-amber-500/30 rounded-3xl backdrop-blur-md shadow-2xl">
        <div class="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-3xl animate-bounce shadow-glow-gold">
          ⌨️
        </div>
        <div class="space-y-1">
          <h3 class="font-cairo font-black text-2xl text-white">
            {{ isRtl ? 'تجهيز أسرع أصابع في الشات!' : 'Ready Your Fastest Fingers!' }}
          </h3>
          <p class="font-tajawal text-xs text-amber-200/80 leading-relaxed">
            {{ isRtl ? 'ستظهر كلمة واحدة سريعة على الشاشة، وأول شخص يكتب الكلمة بدقة في الشات يحصل على نقطة الجولة! تتوالى الجولات تلقائياً حتى نهاية السباق.' : 'A single word will appear on screen. First person to type it in chat scores the point! Rounds advance automatically until match ends.' }}
          </p>
        </div>

        <div class="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-700/60 text-xs font-tajawal text-slate-300 space-y-1.5">
          <div class="font-bold text-amber-400 flex items-center justify-center gap-1.5">
            <span>💡</span>
            <span>{{ isRtl ? 'كيف تشارك؟' : 'How to play?' }}</span>
          </div>
          <div class="text-amber-200">
            {{ isRtl ? 'المشاركة فورية بدون !join - فقط اكتب الكلمة المطلوبة في الشات فور ظهورها بأقصى سرعة!' : 'Instant play without !join - just type the displayed word directly into Twitch chat as fast as possible!' }}
          </div>
        </div>

        <!-- Word Count (Rounds) Selector for Streamer -->
        <div v-if="isAdmin" class="space-y-1.5 text-center">
          <label class="block text-xs font-bold text-amber-300">
            {{ isRtl ? '📝 عدد كلمات السباق (الجولات):' : '📝 Number of Words (Rounds):' }}
          </label>
          <div class="grid grid-cols-6 gap-1.5">
            <button
              v-for="count in [3, 5, 7, 10, 15, 20]"
              :key="count"
              type="button"
              @click="selectedWordsCount = count"
              :class="[
                'py-1.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer',
                selectedWordsCount === count
                  ? 'bg-amber-500 text-black border-amber-300 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-neutral-900 text-slate-400 border-neutral-700 hover:text-white'
              ]"
            >
              {{ count }}
            </button>
          </div>
        </div>

        <!-- Language Selector for Streamer -->
        <div v-if="isAdmin" class="space-y-1.5 text-center">
          <label class="block text-xs font-bold text-amber-300">
            {{ isRtl ? '🌐 اختيار لغة الكلمات للسباق:' : '🌐 Race Language Mode:' }}
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="selectedLanguage = 'AR'"
              :class="[
                'py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                selectedLanguage === 'AR'
                  ? 'bg-amber-500 text-black border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-neutral-900 text-slate-400 border-neutral-700 hover:text-white'
              ]"
            >
              <span>🇸🇦</span>
              <span>{{ isRtl ? 'عربي فقط' : 'Arabic' }}</span>
            </button>
            <button
              type="button"
              @click="selectedLanguage = 'EN'"
              :class="[
                'py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                selectedLanguage === 'EN'
                  ? 'bg-amber-500 text-black border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-neutral-900 text-slate-400 border-neutral-700 hover:text-white'
              ]"
            >
              <span>🇺🇸</span>
              <span>{{ isRtl ? 'English فقط' : 'English' }}</span>
            </button>
            <button
              type="button"
              @click="selectedLanguage = 'MIXED'"
              :class="[
                'py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                selectedLanguage === 'MIXED'
                  ? 'bg-amber-500 text-black border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-neutral-900 text-slate-400 border-neutral-700 hover:text-white'
              ]"
            >
              <span>🌐</span>
              <span>{{ isRtl ? 'مختلط (ثنائي)' : 'Mixed' }}</span>
            </button>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2">
          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="shadow-[0_0_30px_rgba(245,158,11,0.6)] font-black text-sm px-8 py-2.5 !bg-gradient-to-r !from-amber-500 !via-orange-500 !to-yellow-500 hover:!brightness-110"
            @click="$emit('startGame', selectedLanguage, selectedWordsCount)"
          >
            ⚡ {{ isRtl ? 'انطلاق سباق السرعة' : 'Start Type Race' }}
          </GamerButton>
        </div>
      </div>

      <!-- 2. WORD ACTIVE SCREEN -->
      <div v-else-if="status === 'WORD_ACTIVE' && !isMatchFinished" class="w-full max-w-2xl text-center space-y-5">
        <!-- Word Category & Tip -->
        <div class="flex items-center justify-center gap-2">
          <span class="px-3 py-1 rounded-full text-[11px] font-cairo font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            🔥 {{ isRtl ? 'اكتب الكلمة التالية في الشات بأقصى سرعة:' : 'Type this word in chat as fast as possible:' }}
          </span>
        </div>

        <!-- Giant Neon Word Card (STRICT SINGLE LANGUAGE) -->
        <div class="relative p-6 sm:p-10 bg-gradient-to-b from-neutral-900/95 via-neutral-950/95 to-neutral-900/95 border-3 border-amber-400 rounded-3xl shadow-[0_0_45px_rgba(245,158,11,0.4)] backdrop-blur-xl group hover:border-amber-300 transition-all">
          <!-- Animated Top Glowing Accent -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent blur-xs" />

          <!-- Main Word Display (Only the active language) -->
          <div class="font-cairo font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-wide leading-tight drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] select-all">
            {{ currentWord }}
          </div>

          <!-- SUBTITLE ONLY SHOWN IF THE STREAMER EXPLICITLY CHOSE 'MIXED' MODE -->
          <div
            v-if="state?.languageMode === 'MIXED' && currentWordEn && currentWordEn !== currentWord"
            class="font-mono text-sm sm:text-base text-amber-300/70 mt-2 font-bold tracking-widest uppercase"
          >
            {{ currentWordEn }}
          </div>

          <!-- Progress Bar at bottom of card -->
          <div class="mt-6 w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div
              class="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-300"
              :style="{ width: `${(timeRemaining / (state?.timeLimitSeconds || 15)) * 100}%` }"
            />
          </div>
        </div>

        <!-- Timeout Notification Banner -->
        <div v-if="isTimingOut" class="p-3 bg-red-950/90 border border-red-500 rounded-2xl text-red-200 font-bold text-sm animate-pulse shadow-lg">
          ⌛ {{ isRtl ? 'انتهى الوقت! لم يحزر أحد الكلمة... الانتقال للكلمة التالية!' : 'Time up! No one typed the word... Moving to next word!' }}
        </div>

        <!-- Chat Instruction -->
        <div v-else class="text-xs font-tajawal text-slate-300 flex items-center justify-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{{ isRtl ? 'الشات يستمع لإجاباتكم الآن... من الأسرع؟ 🚀' : 'Listening to live chat answers... Who is fastest? 🚀' }}</span>
        </div>
      </div>

      <!-- 3. ROUND WON SCREEN (WITH AUTOMATIC ADVANCE COUNTDOWN) -->
      <div v-else-if="status === 'ROUND_WON' && fastestTypist && !isMatchFinished" class="w-full max-w-xl text-center space-y-4 p-6 bg-arena-card/90 border-2 border-amber-400 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.5)] backdrop-blur-xl animate-scale-up">
        <div class="inline-flex items-center gap-2 px-4 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-cairo font-bold">
          ⚡ {{ isRtl ? 'فائز الجولة السريعة' : 'Fastest Typist' }}
        </div>

        <div class="flex items-center justify-center gap-4 py-2">
          <img
            :src="fastestTypist.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${fastestTypist.username}`"
            class="w-16 h-16 rounded-full border-3 border-amber-400 shadow-glow-gold"
          />
          <div class="text-left" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="font-cairo font-black text-2xl text-white">
              {{ fastestTypist.displayName }}
            </div>
            <div class="font-mono text-sm text-amber-300 font-bold flex items-center gap-2 mt-0.5">
              <span>⏱️ {{ fastestTypist.timeFormatted }}</span>
              <span>•</span>
              <span>🏆 +1 {{ isRtl ? 'نقطة' : 'Point' }}</span>
            </div>
          </div>
        </div>

        <div class="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-700 text-xs font-tajawal text-slate-300">
          {{ isRtl ? `كتب [${fastestTypist.word}] في زمن قياسي قدره ${fastestTypist.timeFormatted}!` : `Typed [${fastestTypist.word}] in a record time of ${fastestTypist.timeFormatted}!` }}
        </div>

        <!-- Automatic Round Transition Bar -->
        <div class="p-2.5 bg-amber-950/70 border border-amber-500/50 rounded-2xl text-xs font-bold text-amber-200 flex items-center justify-between px-4">
          <span>🔄 {{ isRtl ? (currentRound >= totalRounds ? 'الانتقال للنتائج النهائية تلقائياً خلال:' : 'الانتقال للجولة التالية تلقائياً خلال:') : (currentRound >= totalRounds ? 'Final results starting in:' : 'Next round starting in:') }}</span>
          <span class="font-mono font-black text-base text-amber-300">{{ autoAdvanceSeconds }}s</span>
        </div>

        <div v-if="isAdmin" class="pt-2 flex items-center justify-center gap-3">
          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="shadow-glow-gold font-black text-xs px-6 py-2 !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!brightness-110"
            @click="stopAutoAdvance(); $emit('nextRound');"
          >
            {{ currentRound >= totalRounds ? (isRtl ? '🏆 عرض لوحة النتائج النهائية' : '🏆 View Final Scoreboard') : (isRtl ? '⏭️ تجاوز والبدء فوراً' : '⏭️ Skip & Start Now') }}
          </GamerButton>
        </div>
      </div>

      <!-- 4. GRAND SCOREBOARD / MATCH OVER SCREEN -->
      <div v-else-if="isMatchFinished" class="w-full max-w-2xl text-center space-y-5 p-6 sm:p-8 bg-gradient-to-b from-amber-950/95 via-arena-dark to-slate-950 border-3 border-amber-400 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.6)] backdrop-blur-xl animate-scale-up">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/50 rounded-full text-xs font-cairo font-black uppercase tracking-widest shadow-glow-gold">
          🏆 {{ isRtl ? 'لوحة الترتيب والنتائج النهائية (SCOREBOARD)' : 'FINAL SCOREBOARD & CHAMPIONS' }}
        </div>

        <!-- Winner Spotlight Card -->
        <div v-if="winner" class="relative p-5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-400/80 rounded-3xl shadow-glow-gold flex flex-col items-center">
          <div class="text-3xl mb-1">👑🥇</div>
          <img
            :src="winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${winner.username}`"
            class="w-20 h-20 rounded-full border-4 border-amber-400 shadow-glow-gold animate-pulse mb-2"
          />
          <div class="font-cairo font-black text-2xl sm:text-3xl text-white">
            #{{ winner.number }} // {{ winner.displayName }}
          </div>
          <div class="text-sm font-tajawal text-amber-300 font-bold mt-1">
            {{ isRtl ? `بطل سباق سرعة الكتابة برصيد ${state?.scores[winner.username.toLowerCase()] || winner.score || 0} نقاط!` : `Champion with ${state?.scores[winner.username.toLowerCase()] || winner.score || 0} Points!` }}
          </div>
        </div>

        <div v-else class="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 text-slate-300 text-sm">
          {{ isRtl ? 'انتهت جولات السباق! استعرض ترتيب المتسابقين أدناه 🏁' : 'Race concluded! View leaderboard below 🏁' }}
        </div>

        <!-- Full Scoreboard Rankings Table -->
        <div class="space-y-2 text-right" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="text-xs font-cairo font-bold text-amber-300 px-1">
            {{ isRtl ? '📊 جدول ترتيب المتسابقين:' : '📊 Contenders Leaderboard:' }}
          </div>

          <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            <template v-for="(p, idx) in sortedPlayersByScore" :key="p.username">
              <div
                class="flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all"
                :class="[
                  idx === 0 && (p.score || 0) > 0 ? 'bg-amber-950/80 border-amber-400 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  idx === 1 && (p.score || 0) > 0 ? 'bg-slate-800/80 border-slate-500 text-slate-200' :
                  idx === 2 && (p.score || 0) > 0 ? 'bg-amber-950/40 border-amber-700 text-amber-200' :
                  'bg-slate-950/60 border-slate-800 text-slate-400'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <span class="font-mono font-bold text-xs" :class="idx < 3 ? 'text-amber-400' : 'text-slate-500'">
                    {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                  </span>
                  <img :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`" class="w-6 h-6 rounded-full" />
                  <span class="font-cairo font-bold text-white">{{ p.displayName }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">@{{ p.username }}</span>
                </div>

                <div class="flex items-center gap-3 font-mono">
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black">
                    {{ p.score || 0 }} {{ isRtl ? 'نقاط' : 'pts' }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2 flex justify-center gap-3">
          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="shadow-glow-gold font-black text-xs px-8 py-2.5 !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!brightness-110"
            @click="$emit('restartGame')"
          >
            🔄 {{ isRtl ? 'بدء سباق جديد' : 'Play Again' }}
          </GamerButton>
        </div>
      </div>
    </div>

    <!-- Bottom HUD: Top Speed Typists Mini Leaderboard -->
    <div class="relative z-10 pt-3 border-t border-amber-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="font-cairo font-bold text-xs text-amber-400 flex items-center gap-1.5">
          <span>🏆</span>
          <span>{{ isRtl ? 'ترتيب أسرع الكتّاب' : 'Speed Leaderboard' }}</span>
        </span>
        <span class="text-[11px] font-tajawal text-slate-400">
          {{ sortedPlayersByScore.length }} {{ isRtl ? 'متسابق' : 'Contenders' }}
        </span>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <template v-for="(p, index) in sortedPlayersByScore.slice(0, 8)" :key="p.username">
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0"
            :class="index === 0 && (p.score || 0) > 0 ? 'bg-amber-950/70 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-arena-card/80 border-arena-border/60'"
          >
            <span class="font-mono text-xs font-bold text-amber-300">#{{ index + 1 }}</span>
            <img
              :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`"
              class="w-6 h-6 rounded-full border border-amber-400/40"
            />
            <span class="font-cairo font-bold text-xs text-white max-w-[90px] truncate">{{ p.displayName }}</span>
            <span class="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-black">
              {{ p.score || 0 }} {{ isRtl ? 'ن' : 'pts' }}
            </span>
          </div>
        </template>
        <div v-if="sortedPlayersByScore.length === 0" class="text-xs font-tajawal text-slate-500 py-1">
          {{ isRtl ? 'لا يوجد متسابقون بعد. اكتبوا !join للدخول!' : 'No contenders yet. Type !join to enter!' }}
        </div>
      </div>
    </div>
  </div>
</template>
