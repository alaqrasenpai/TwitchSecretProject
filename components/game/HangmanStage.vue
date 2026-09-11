<script setup lang="ts">
import type { IGameSession } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
import confetti from 'canvas-confetti';
import { getRandomHangmanPreset } from '~/server/utils/hangmanBank';

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
  (e: 'startLobby', totalRounds?: number): void;
  (e: 'setSecretWord', payload: { secretWord: string; category: string; hint: string }): void;
  (e: 'nextRound', payload?: { secretWord?: string; category?: string; hint?: string }): void;
  (e: 'submitGuess', word: string): void;
  (e: 'revealHint'): void;
  (e: 'resolveRound'): void;
  (e: 'restartGame'): void;
}>();

const { t, isRtl } = useTranslation();

const state = computed(() => props.session?.hangmanState || null);
const status = computed(() => state.value?.status || 'LOBBY');
const wordLength = computed(() => state.value?.wordLength || 0);
const revealedMask = computed(() => state.value?.revealedMask || []);
const category = computed(() => state.value?.category || '');
const hint = computed(() => state.value?.hint || '');
const winner = computed(() => state.value?.winner || props.session?.winner || null);
const recentGuesses = computed(() => state.value?.recentGuesses || []);
const maxAttempts = computed(() => state.value?.maxAttemptsPerPlayer || 5);
const currentRound = computed(() => state.value?.currentRound || 1);
const totalRounds = computed(() => state.value?.totalRounds || props.session?.settings?.hangmanTotalRounds || 5);
const scores = computed(() => state.value?.scores || {});
const roundWinners = computed(() => state.value?.roundWinners || []);

const isMatchFinished = computed(() => {
  return status.value === 'MATCH_OVER' || props.session?.status === 'FINISHED';
});

const sortedPlayersByScore = computed(() => {
  const players = props.session?.players || [];
  return [...players]
    .map((p) => ({
      ...p,
      hangmanScore: (scores.value && scores.value[p.username.toLowerCase()]) || p.score || 0,
      roundsWon: (roundWinners.value || []).filter((rw) => rw.username.toLowerCase() === p.username.toLowerCase()).length
    }))
    .sort((a, b) => b.hangmanScore - a.hangmanScore);
});

// Streamer Word Form state (Admin only)
const inputWord = ref('');
const inputCategory = ref('ألعاب');
const inputHint = ref('');
const isWordMasked = ref(true);
const showAdminFormModal = ref(false);
const selectedTotalRounds = ref<number>(props.session?.settings?.hangmanTotalRounds || props.session?.hangmanState?.totalRounds || 5);

watch(
  () => props.session?.settings?.hangmanTotalRounds || props.session?.hangmanState?.totalRounds,
  (cnt) => {
    if (cnt) selectedTotalRounds.value = cnt;
  }
);

function pickRandomPreset() {
  const preset = getRandomHangmanPreset();
  inputWord.value = preset.word;
  inputCategory.value = preset.category;
  inputHint.value = preset.hint;
}

function handleLockWord() {
  if (!inputWord.value.trim()) return;
  const payload = {
    secretWord: inputWord.value.trim(),
    category: inputCategory.value.trim() || 'عام',
    hint: inputHint.value.trim()
  };
  if (status.value === 'ROUND_RESOLVED' && !isMatchFinished.value) {
    emit('nextRound', payload);
  } else {
    emit('setSecretWord', payload);
  }
  inputWord.value = '';
  inputHint.value = '';
  showAdminFormModal.value = false;
}

function handleStartLobbyWithRounds() {
  emit('startLobby', selectedTotalRounds.value);
  showAdminFormModal.value = true;
}

function handleQuickPresetStart() {
  const preset = getRandomHangmanPreset();
  emit('startLobby', selectedTotalRounds.value);
  setTimeout(() => {
    emit('setSecretWord', {
      secretWord: preset.word,
      category: preset.category,
      hint: preset.hint
    });
  }, 100);
}

function handleQuickNextPreset() {
  const preset = getRandomHangmanPreset();
  emit('nextRound', {
    secretWord: preset.word,
    category: preset.category,
    hint: preset.hint
  });
}

// Timer countdown
const timeRemaining = ref(60);
let timerInterval: any = null;

watch(
  () => props.session?.timerEndsAt,
  (endsAt) => {
    if (!endsAt) {
      timeRemaining.value = 0;
      if (timerInterval) clearInterval(timerInterval);
      return;
    }
    const update = () => {
      const ms = new Date(endsAt).getTime() - Date.now();
      timeRemaining.value = Math.max(0, Math.ceil(ms / 1000));
      if (timeRemaining.value <= 0 && timerInterval) {
        clearInterval(timerInterval);
      }
    };
    update();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(update, 200);
  },
  { immediate: true }
);

watch(
  () => isMatchFinished.value,
  (finished) => {
    if (finished) {
      triggerConfetti();
    }
  }
);

watch(
  () => status.value,
  (newStatus) => {
    if (newStatus === 'ROUND_RESOLVED' && winner.value) {
      triggerConfetti();
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
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ffffff']
    });
  } catch (e) {}
}

const mockGuessInput = ref('');
function submitManualGuess() {
  if (!mockGuessInput.value.trim()) return;
  emit('submitGuess', mockGuessInput.value.trim());
  mockGuessInput.value = '';
}

defineExpose({
  openAdminModal: () => {
    showAdminFormModal.value = true;
  }
});
</script>

<template>
  <div class="relative flex-1 p-4 bg-gradient-to-b from-arena-card/95 via-arena-dark/95 to-arena-card/90 border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.2)] flex flex-col justify-between overflow-hidden min-h-0 select-none">
    <!-- Ambient Emerald Glow -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
    </div>

    <!-- Top HUD Bar -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-700 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-300/40">
          🔤
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-cairo font-black text-lg sm:text-xl text-white tracking-wide">
              {{ isRtl ? 'تحدي تخمين الكلمة (Wordle / Hangman)' : 'Secret Word Challenge' }}
            </h2>
            <GamerBadge
              :status="isMatchFinished ? 'DEAD' : status === 'GUESSING_ACTIVE' ? 'LIVE' : status === 'ROUND_RESOLVED' ? 'ALIVE' : 'LOBBY'"
              :label="isMatchFinished ? (isRtl ? 'انتهت المنافسة' : 'MATCH OVER') : status === 'GUESSING_ACTIVE' ? (isRtl ? 'خمنوا الآن!' : 'GUESS NOW!') : status === 'ROUND_RESOLVED' ? (isRtl ? 'كشف الكلمة' : 'REVEALED') : (isRtl ? 'تجهيز الكلمة' : 'LOBBY')"
              size="xs"
            />
          </div>
          <div class="text-[11px] font-tajawal text-arena-textMuted flex items-center gap-2 flex-wrap">
            <span class="text-amber-400 font-bold">🏆 {{ isRtl ? `الجولة ${currentRound} من ${totalRounds}` : `Round ${currentRound} of ${totalRounds}` }}</span>
            <span>•</span>
            <span v-if="category" class="text-emerald-400 font-bold">🏷️ {{ category }}</span>
            <span v-if="category">•</span>
            <span>{{ isRtl ? `عدد الحروف: ${wordLength || '؟'}` : `Letters: ${wordLength || '?'}` }}</span>
            <span>•</span>
            <span class="text-cyan-400 font-bold">{{ isRtl ? `5 محاولات لكل متسابق` : `5 attempts per player` }}</span>
          </div>
        </div>
      </div>

      <!-- Right HUD: Timer & Quick Admin Controls -->
      <div class="flex items-center gap-3">
        <div v-if="status === 'GUESSING_ACTIVE' && !isMatchFinished" class="text-right">
          <div class="text-[10px] font-tajawal text-slate-400 font-bold uppercase tracking-wider">
            {{ isRtl ? 'الوقت المتبقي' : 'TIME REMAINING' }}
          </div>
          <div
            class="font-mono font-black text-2xl"
            :class="timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-emerald-300'"
          >
            00:{{ timeRemaining.toString().padStart(2, '0') }}
          </div>
        </div>

        <button
          v-if="isAdmin && (status === 'LOBBY' || status === 'SETTING_WORD') && !isMatchFinished"
          type="button"
          class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-cairo font-bold text-xs shadow-glow-gold transition-all flex items-center gap-1.5 cursor-pointer"
          @click="showAdminFormModal = true"
        >
          <span>✍️</span>
          <span>{{ isRtl ? 'تعيين الكلمة المخفية' : 'Set Secret Word' }}</span>
        </button>

        <button
          v-if="isAdmin && status === 'GUESSING_ACTIVE' && !isMatchFinished"
          type="button"
          class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-slate-300 rounded-full font-cairo font-bold text-xs border border-neutral-600 transition-all flex items-center gap-1 cursor-pointer"
          @click="$emit('resolveRound')"
        >
          <span>👁️</span>
          <span>{{ isRtl ? 'كشف الكلمة' : 'Reveal Word' }}</span>
        </button>
      </div>
    </div>

    <!-- Center Arena: The Secret Word Letter Boxes & Screens -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center my-3 min-h-0 w-full px-2 overflow-y-auto">
      <!-- 1. LOBBY & WORD SETUP PROMPT -->
      <div v-if="!isMatchFinished && (status === 'LOBBY' || status === 'SETTING_WORD')" class="text-center space-y-4 max-w-lg mx-auto p-6 bg-arena-card/80 border border-emerald-500/30 rounded-3xl backdrop-blur-md shadow-2xl">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center text-3xl animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          🔒
        </div>
        <div class="space-y-1">
          <h3 class="font-cairo font-black text-2xl text-white">
            {{ isRtl ? 'تحدي تخمين الكلمة السرية' : 'Secret Word Guess Challenge' }}
          </h3>
          <p class="font-tajawal text-xs text-emerald-200/80 leading-relaxed">
            {{ isRtl ? 'يقوم الستريمر بكتابة كلمة سرية مخفية لا تظهر للشات، ويبدأ المشاهدون بتخمين الكلمة مباشرة في الشات بنظام ووردل والحروف الخضراء والصفراء!' : 'The streamer sets a secret word. Viewers guess directly in chat with Wordle-style green/yellow clues for each letter with 5 attempts max!' }}
          </p>
        </div>

        <!-- No !join instruction -->
        <div class="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-700/60 text-xs font-tajawal text-slate-300 space-y-1 text-center">
          <div class="font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <span>💡</span>
            <span>{{ isRtl ? 'المشاركة فورية بدون !join' : 'Instant play without !join' }}</span>
          </div>
          <div class="text-emerald-200/90">
            {{ isRtl ? 'فقط اكتب تخمينك للكلمة مباشرة في الشات وسيتم احتسابه فوراً!' : 'Just type your guess directly into chat and it is recorded instantly!' }}
          </div>
        </div>

        <!-- Word Count (Rounds) Selector for Streamer -->
        <div v-if="isAdmin" class="space-y-1.5 text-center">
          <label class="block text-xs font-bold text-emerald-300">
            {{ isRtl ? '📝 عدد كلمات التحدي (الجولات):' : '📝 Number of Words (Rounds):' }}
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="count in [3, 5, 7, 10]"
              :key="count"
              type="button"
              @click="selectedTotalRounds = count"
              :class="[
                'py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer',
                selectedTotalRounds === count
                  ? 'bg-emerald-500 text-black border-emerald-300 font-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-neutral-900 text-slate-400 border-neutral-700 hover:text-white'
              ]"
            >
              {{ count }} {{ isRtl ? 'كلمات' : 'Words' }}
            </button>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="shadow-[0_0_25px_rgba(16,185,129,0.5)] font-black text-xs px-6 py-2.5 !bg-gradient-to-r !from-emerald-500 !via-teal-600 !to-indigo-600 hover:!brightness-110"
            @click="handleStartLobbyWithRounds"
          >
            🔒 {{ isRtl ? 'إدخال الكلمة وبدء التحدي' : 'Enter Secret Word & Start' }}
          </GamerButton>
          <button
            type="button"
            class="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 rounded-full font-cairo font-bold text-xs border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            @click="handleQuickPresetStart"
          >
            <span>🎲</span>
            <span>{{ isRtl ? 'كلمة عشوائية فوراً' : 'Random Preset Word' }}</span>
          </button>
        </div>
        <div v-else class="text-xs font-tajawal text-slate-400">
          {{ isRtl ? 'بانتظار قيام الستريمر بإدخال الكلمة المخفية... جهزوا أنفسكم في الشات!' : 'Waiting for streamer to lock in secret word... Get ready in chat!' }}
        </div>
      </div>

      <!-- 2. GUESSING ACTIVE SCREEN (THE SECRET WORD TILES) -->
      <div v-else-if="status === 'GUESSING_ACTIVE' && !isMatchFinished" class="w-full max-w-3xl flex flex-col items-center justify-center space-y-6">
        <!-- Optional Hint Banner -->
        <div v-if="hint" class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-cairo font-bold animate-pulse">
          <span>💡</span>
          <span>{{ isRtl ? `تلميح: ${hint}` : `Hint: ${hint}` }}</span>
        </div>

        <!-- The Big Word Tiles (Hangman Letter Boxes) -->
        <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-4 bg-neutral-950/80 border-2 border-emerald-500/40 rounded-3xl shadow-[0_0_35px_rgba(16,185,129,0.3)] backdrop-blur-xl">
          <template v-for="(letter, idx) in revealedMask" :key="idx">
            <div
              v-if="letter === ' '"
              class="w-6 sm:w-8 h-12 sm:h-16 flex items-center justify-center"
            >
              <span class="text-slate-600 font-bold text-lg">•</span>
            </div>
            <div
              v-else
              class="w-11 sm:w-14 md:w-16 h-14 sm:h-18 md:h-20 rounded-2xl flex items-center justify-center font-cairo font-black text-2xl sm:text-3xl md:text-4xl transition-all duration-500 border-2"
              :class="[
                letter !== '_'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)] rotate-0 scale-105'
                  : 'bg-neutral-900/90 text-slate-600 border-neutral-700 shadow-inner'
              ]"
            >
              <span>{{ letter !== '_' ? letter : '?' }}</span>
            </div>
          </template>
        </div>

        <!-- Chat Instructions -->
        <div class="text-center space-y-1">
          <div class="text-xs sm:text-sm font-tajawal text-slate-300 flex items-center justify-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{{ isRtl ? 'اكتب تخمينك للكلمة مباشرة في الشات! (أو !guess <كلمة>)' : 'Type your word guess directly in Twitch chat! (or !guess <word>)' }}</span>
          </div>
          <div class="text-[11px] font-tajawal text-emerald-400/90 font-bold">
            {{ isRtl ? '🟩 الحرف الأخضر: بمكانه الصحيح • 🟨 الأصفر: موجود بمكان آخر • ⬛ الرمادي: غير موجود' : '🟩 Green: Correct spot • 🟨 Yellow: Wrong spot • ⬛ Gray: Not in word' }}
          </div>
        </div>
      </div>

      <!-- 3. ROUND RESOLVED BANNER (BETWEEN ROUNDS) -->
      <div v-else-if="status === 'ROUND_RESOLVED' && !isMatchFinished" class="w-full max-w-lg p-6 bg-gradient-to-b from-emerald-950/95 via-arena-dark to-arena-dark border-2 border-emerald-400 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.5)] text-center space-y-4 animate-scale-up">
        <div v-if="winner" class="space-y-2">
          <div class="text-xs font-cairo text-emerald-400 font-bold uppercase tracking-widest">
            👑 {{ isRtl ? `بطل الجولة ${currentRound}!` : `Round ${currentRound} Winner!` }}
          </div>
          <img
            :src="winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${winner.username}`"
            class="w-16 h-16 mx-auto rounded-full border-3 border-emerald-400 shadow-glow-gold"
          />
          <div class="font-cairo font-black text-2xl text-white">
            {{ winner.displayName }}
          </div>
          <div class="text-xs font-tajawal text-emerald-200">
            {{ isRtl ? `اكتشف الكلمة المخفية [${state?.secretWord}] بنجاح وحصل على النقاط!` : `Discovered the hidden word [${state?.secretWord}] successfully!` }}
          </div>
        </div>
        <div v-else class="space-y-1">
          <div class="text-xs font-cairo text-amber-400 font-bold uppercase tracking-widest">
            ⌛ {{ isRtl ? `انتهى وقت الجولة ${currentRound}!` : `Round ${currentRound} Time Expired!` }}
          </div>
          <div class="font-cairo font-black text-xl text-white">
            {{ isRtl ? `الكلمة كانت:` : `The word was:` }} <span class="text-emerald-400 underline">{{ state?.secretWord }}</span>
          </div>
        </div>

        <!-- Next Round Streamer Buttons -->
        <div v-if="isAdmin" class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <GamerButton
            size="sm"
            variant="primary"
            rounded="full"
            class="text-xs px-6 py-2 shadow-glow-gold !bg-gradient-to-r !from-emerald-500 !to-teal-600 font-bold"
            @click="showAdminFormModal = true"
          >
            ✍️ {{ isRtl ? `تعيين الكلمة ${currentRound + 1} من ${totalRounds}` : `Set Word ${currentRound + 1}/${totalRounds}` }}
          </GamerButton>
          <button
            type="button"
            class="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 rounded-full font-cairo font-bold text-xs border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
            @click="handleQuickNextPreset"
          >
            <span>🎲</span>
            <span>{{ isRtl ? 'كلمة عشوائية والانطلاق' : 'Quick Random Word' }}</span>
          </button>
        </div>
      </div>

      <!-- 4. GRAND FINAL SCOREBOARD / MATCH OVER SCREEN -->
      <div v-else-if="isMatchFinished" class="w-full max-w-2xl text-center space-y-5 p-6 sm:p-8 bg-gradient-to-b from-emerald-950/95 via-arena-dark to-slate-950 border-3 border-emerald-400 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.6)] backdrop-blur-xl animate-scale-up">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 rounded-full text-xs font-cairo font-black uppercase tracking-widest shadow-glow-gold">
          🏆 {{ isRtl ? 'لوحة الترتيب والنتائج النهائية (SCOREBOARD)' : 'FINAL SCOREBOARD & CHAMPIONS' }}
        </div>

        <!-- Winner Spotlight Card -->
        <div v-if="winner" class="relative p-5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-emerald-400/80 rounded-3xl shadow-glow-gold flex flex-col items-center">
          <div class="text-3xl mb-1">👑🥇</div>
          <img
            :src="winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${winner.username}`"
            class="w-20 h-20 rounded-full border-4 border-emerald-400 shadow-glow-gold animate-pulse mb-2"
          />
          <div class="font-cairo font-black text-2xl sm:text-3xl text-white">
            #{{ winner.number }} // {{ winner.displayName }}
          </div>
          <div class="text-sm font-tajawal text-emerald-300 font-bold mt-1">
            {{ isRtl ? `بطل تحدي تخمين الكلمات برصيد ${(scores && scores[winner.username.toLowerCase()]) || winner.score || 0} نقطة!` : `Champion with ${(scores && scores[winner.username.toLowerCase()]) || winner.score || 0} Points!` }}
          </div>
        </div>

        <div v-else class="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 text-slate-300 text-sm">
          {{ isRtl ? 'انتهت جولات التحدي! استعرض ترتيب المتسابقين أدناه 🏁' : 'Challenge concluded! View leaderboard below 🏁' }}
        </div>

        <!-- Full Scoreboard Rankings Table -->
        <div class="space-y-2 text-right" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="text-xs font-cairo font-bold text-emerald-300 px-1">
            {{ isRtl ? '📊 جدول ترتيب المتسابقين بالنقاط:' : '📊 Contenders Leaderboard:' }}
          </div>

          <div class="max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            <template v-for="(p, idx) in sortedPlayersByScore" :key="p.username">
              <div
                class="flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all"
                :class="[
                  idx === 0 && p.hangmanScore > 0 ? 'bg-emerald-950/80 border-emerald-400 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                  idx === 1 && p.hangmanScore > 0 ? 'bg-slate-800/80 border-slate-500 text-slate-200' :
                  idx === 2 && p.hangmanScore > 0 ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200' :
                  'bg-slate-950/60 border-slate-800 text-slate-400'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <span class="font-mono font-bold text-xs" :class="idx < 3 ? 'text-emerald-400' : 'text-slate-500'">
                    {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                  </span>
                  <img :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`" class="w-6 h-6 rounded-full" />
                  <span class="font-cairo font-bold text-white">{{ p.displayName }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">@{{ p.username }}</span>
                </div>

                <div class="flex items-center gap-3 font-mono">
                  <span v-if="p.roundsWon > 0" class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    🏆 {{ p.roundsWon }} {{ isRtl ? 'جولات' : 'rounds' }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black">
                    {{ p.hangmanScore }} {{ isRtl ? 'نقطة' : 'pts' }}
                  </span>
                </div>
              </div>
            </template>
            <div v-if="sortedPlayersByScore.length === 0" class="text-center py-2 text-slate-500 text-xs font-tajawal">
              {{ isRtl ? 'لم يشارك أحد في هذه الجولات' : 'No recorded participants' }}
            </div>
          </div>
        </div>

        <!-- Words History Log (Round breakdown) -->
        <div v-if="roundWinners.length > 0" class="space-y-1 text-right" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="text-[11px] font-cairo font-bold text-emerald-400 px-1">
            {{ isRtl ? '📜 سجل الكلمات المحزورة خلال التحدي:' : '📜 Rounds Recap:' }}
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div
              v-for="rw in roundWinners"
              :key="rw.round"
              class="px-3 py-1.5 rounded-xl bg-neutral-900 border border-emerald-500/30 text-xs shrink-0 flex items-center gap-2"
            >
              <span class="text-amber-400 font-bold font-mono">J{{ rw.round }}:</span>
              <span class="text-white font-black font-cairo">[{{ rw.word }}]</span>
              <span class="text-emerald-300 font-bold">👑 {{ rw.displayName }}</span>
              <span class="text-slate-400 text-[10px]">({{ rw.attemptsUsed }}/5)</span>
            </div>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2 flex justify-center gap-3">
          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="shadow-glow-gold font-black text-xs px-8 py-2.5 !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!brightness-110"
            @click="$emit('restartGame')"
          >
            🔄 {{ isRtl ? 'بدء تحدي جديد' : 'Play Again' }}
          </GamerButton>
        </div>
      </div>
    </div>

    <!-- Bottom HUD: Recent Wordle Guesses Feed with Colored Letter Clues -->
    <div class="relative z-10 pt-3 border-t border-emerald-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="font-cairo font-bold text-xs text-emerald-400 flex items-center gap-1.5">
          <span>🎯</span>
          <span>{{ isRtl ? 'آخر تخمينات الشات والحروف' : 'Live Chat Guesses & Letter Feedback' }}</span>
        </span>
        <span class="text-[11px] font-tajawal text-slate-400">
          {{ recentGuesses.length }} {{ isRtl ? 'محاولة مسجلة' : 'Recorded Guesses' }}
        </span>
      </div>

      <!-- Horizontal scrolling guesses with Wordle letter pills -->
      <div class="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        <template v-for="g in recentGuesses" :key="g.id">
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all shrink-0 backdrop-blur-md"
            :class="g.isExactMatch ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-neutral-900/90 border-neutral-700/80'"
          >
            <img
              :src="g.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${g.username}`"
              class="w-6 h-6 rounded-full border border-emerald-400/50"
            />
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="font-cairo font-bold text-[11px] text-white max-w-[80px] truncate">{{ g.displayName }}</span>
                <span class="text-[9px] font-mono text-slate-400">({{ g.attemptNumber }}/5)</span>
              </div>
              <!-- Wordle Letter Boxes -->
              <div class="flex items-center gap-1 mt-0.5">
                <template v-for="(letter, lIdx) in g.feedback" :key="lIdx">
                  <span
                    class="w-5 h-5 rounded-md flex items-center justify-center font-cairo font-black text-[10px] text-white border"
                    :class="[
                      letter.status === 'CORRECT'
                        ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                        : letter.status === 'WRONG_POSITION'
                        ? 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.7)] text-slate-950'
                        : 'bg-neutral-800 border-neutral-700 text-slate-400'
                    ]"
                  >
                    {{ letter.char }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </template>
        <div v-if="recentGuesses.length === 0" class="text-xs font-tajawal text-slate-500 py-1.5">
          {{ isRtl ? 'لا توجد تخمينات بعد. اكتبوا كلمتكم في الشات!' : 'No guesses yet. Type your word in chat!' }}
        </div>
      </div>
    </div>

    <!-- STREAMER SECRET WORD INPUT MODAL -->
    <div
      v-if="showAdminFormModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="showAdminFormModal = false"
    >
      <div class="relative w-full max-w-md bg-arena-card border-2 border-emerald-500/80 rounded-3xl p-6 space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-scale-up text-right" :dir="isRtl ? 'rtl' : 'ltr'">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-arena-border pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔒</span>
            <h3 class="font-cairo font-black text-lg text-white">
              {{ isRtl ? 'تعيين الكلمة المخفية للشات' : 'Set Secret Hidden Word' }}
            </h3>
          </div>
          <button
            type="button"
            class="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs"
            @click="showAdminFormModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 font-tajawal text-xs">
          <!-- Quick Preset Button -->
          <div class="flex items-center justify-between bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-700">
            <span class="text-slate-300">{{ isRtl ? 'اختر كلمة عشوائية جاهزة من البنك:' : 'Pick a random word preset:' }}</span>
            <button
              type="button"
              class="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-cairo font-bold transition-all text-xs flex items-center gap-1 shadow-sm"
              @click="pickRandomPreset"
            >
              <span>🎲</span>
              <span>{{ isRtl ? 'كلمة عشوائية' : 'Random Word' }}</span>
            </button>
          </div>

          <!-- Secret Word Input -->
          <div class="space-y-1">
            <label class="font-cairo font-bold text-white flex items-center justify-between">
              <span>{{ isRtl ? 'الكلمة المخفية المطلوبة:' : 'Secret Word:' }}</span>
              <button
                type="button"
                class="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                @click="isWordMasked = !isWordMasked"
              >
                <span>{{ isWordMasked ? '👁️ إظهار' : '🔒 إخفاء' }}</span>
              </button>
            </label>
            <input
              v-model="inputWord"
              :type="isWordMasked ? 'password' : 'text'"
              :placeholder="isRtl ? 'اكتب الكلمة هنا (مثال: فورتنايت أو ميسي)' : 'Type secret word (e.g. Fortnite)'"
              class="w-full px-4 py-2.5 bg-neutral-900 border border-emerald-500/50 rounded-xl text-white font-cairo font-black text-lg focus:outline-none focus:border-emerald-400 transition-all text-center tracking-wider"
            />
            <div class="text-[10px] text-slate-400 flex items-center justify-between px-1">
              <span>{{ isRtl ? 'لن تظهر هذه الكلمة مطلقاً في شاشة البث أو في الـ Overlay!' : 'This word is strictly masked from the live broadcast and overlay!' }}</span>
              <span class="font-mono text-emerald-400 font-bold">{{ inputWord.trim().length }} {{ isRtl ? 'حروف' : 'letters' }}</span>
            </div>
          </div>

          <!-- Category Input -->
          <div class="space-y-1">
            <label class="font-cairo font-bold text-white">{{ isRtl ? 'تصنيف الكلمة (يظهر للشات كدليل):' : 'Category / Topic:' }}</label>
            <input
              v-model="inputCategory"
              type="text"
              :placeholder="isRtl ? 'مثال: ألعاب، مشاهير، أنمي، كرة قدم' : 'e.g. Gaming, Anime, Sports'"
              class="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-tajawal focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>

          <!-- Optional Hint Input -->
          <div class="space-y-1">
            <label class="font-cairo font-bold text-white">{{ isRtl ? 'تلميح إضافي (اختياري):' : 'Optional Hint:' }}</label>
            <input
              v-model="inputHint"
              type="text"
              :placeholder="isRtl ? 'مثال: باتل رويال وبناء' : 'e.g. Famous battle royale game'"
              class="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-tajawal focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-arena-border">
          <button
            type="button"
            class="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-slate-300 rounded-xl font-cairo font-bold text-xs"
            @click="showAdminFormModal = false"
          >
            {{ isRtl ? 'إلغاء' : 'Cancel' }}
          </button>
          <GamerButton
            size="sm"
            variant="primary"
            rounded="xl"
            :disabled="!inputWord.trim()"
            class="px-6 py-2 text-xs font-black shadow-glow-gold !bg-gradient-to-r !from-emerald-500 !to-teal-600"
            @click="handleLockWord"
          >
            🚀 {{ isRtl ? 'قفل الكلمة وبدء التخمين!' : 'Lock & Start Guessing!' }}
          </GamerButton>
        </div>
      </div>
    </div>
  </div>
</template>
