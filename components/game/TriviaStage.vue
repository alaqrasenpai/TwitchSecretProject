<script setup lang="ts">
import type { IGameSession, IPlayer, ITriviaState } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';
import TurnTimer from '~/components/game/TurnTimer.vue';

const props = defineProps<{
  session: IGameSession;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: 'startTrivia'): void;
  (e: 'revealAnswer'): void;
  (e: 'nextQuestion'): void;
  (e: 'restartTrivia'): void;
  (e: 'submitVote', choiceIndex: number): void;
  (e: 'openCategoryModal'): void;
}>();

const { t, isRtl, locale } = useTranslation();

const triviaState = computed<ITriviaState | null>(() => {
  return props.session?.triviaState || null;
});

const isLobby = computed(() => {
  return props.session?.status === 'LOBBY' || triviaState.value?.status === 'LOBBY';
});

const currentQuestion = computed(() => {
  return triviaState.value?.currentQuestion || null;
});

const isEnglish = computed(() => locale.value === 'en');

const triviaLang = computed(() => {
  return triviaState.value?.language || props.session?.settings?.triviaLanguage || (isEnglish.value ? 'EN' : 'AR');
});

const displayQuestionText = computed(() => {
  if (!currentQuestion.value) return isEnglish.value ? 'Loading question...' : 'جاري تجهيز السؤال...';
  if (triviaLang.value === 'EN') {
    return currentQuestion.value.questionEn || currentQuestion.value.question;
  }
  if (triviaLang.value === 'BOTH') {
    if (currentQuestion.value.questionEn && currentQuestion.value.questionEn !== currentQuestion.value.question) {
      return `${currentQuestion.value.question} \n[ ${currentQuestion.value.questionEn} ]`;
    }
    return currentQuestion.value.question;
  }
  return currentQuestion.value.question;
});

const displayOptions = computed(() => {
  if (!currentQuestion.value?.options) return ['', '', '', ''];
  if (triviaLang.value === 'EN' && currentQuestion.value.optionsEn) {
    return currentQuestion.value.optionsEn;
  }
  if (triviaLang.value === 'BOTH' && currentQuestion.value.optionsEn) {
    return currentQuestion.value.options.map((opt, i) => {
      const enOpt = currentQuestion.value?.optionsEn?.[i];
      if (enOpt && enOpt !== opt) {
        return `${opt} (${enOpt})`;
      }
      return opt;
    }) as [string, string, string, string];
  }
  return currentQuestion.value.options;
});

const displayCategory = computed(() => {
  if (!currentQuestion.value) return isEnglish.value ? 'Trivia Quiz' : 'مسابقة الأسئلة';
  return triviaLang.value === 'EN'
    ? (currentQuestion.value.categoryEn || currentQuestion.value.category)
    : currentQuestion.value.category;
});

const displayExplanation = computed(() => {
  if (!currentQuestion.value) return '';
  return triviaLang.value === 'EN'
    ? (currentQuestion.value.explanationEn || currentQuestion.value.explanation)
    : currentQuestion.value.explanation;
});

const isAnswerRevealed = computed(() => {
  return !isLobby.value && (triviaState.value?.status === 'ANSWER_REVEALED' || props.session?.status === 'ANSWER_REVEALED');
});

const isQuestionActive = computed(() => {
  return !isLobby.value && (triviaState.value?.status === 'QUESTION_ACTIVE' || props.session?.status === 'QUESTION_ACTIVE');
});

const isFinished = computed(() => {
  return !isLobby.value && (props.session?.status === 'FINISHED' || triviaState.value?.status === 'ROUND_SUMMARY');
});

const totalVotes = computed(() => {
  return triviaState.value?.totalVotesCount || 0;
});

const optionVoteStats = computed(() => {
  const counts = triviaState.value?.voteCounts || [0, 0, 0, 0];
  const total = totalVotes.value;
  return counts.map((count) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { count, percentage };
  });
});

const topPlayers = computed<IPlayer[]>(() => {
  return [...(props.session?.players || [])]
    .filter((p) => (p.score || 0) > 0 || (p.correctAnswersCount || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);
});

const allRankedPlayers = computed<IPlayer[]>(() => {
  return [...(props.session?.players || [])].sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const correctA = a.correctAnswersCount || 0;
    const correctB = b.correctAnswersCount || 0;
    if (correctB !== correctA) return correctB - correctA;
    return (a.number || 0) - (b.number || 0);
  });
});

const optionLetters = ['A', 'B', 'C', 'D'];
const optionNumbers = ['1', '2', '3', '4'];
const optionColorThemes = [
  { border: 'border-blue-500/30', bg: 'bg-blue-500/10', fill: 'bg-blue-500', text: 'text-blue-400', activeGlow: 'hover:border-blue-500 shadow-blue-500/20' },
  { border: 'border-purple-500/30', bg: 'bg-purple-500/10', fill: 'bg-purple-500', text: 'text-purple-400', activeGlow: 'hover:border-purple-500 shadow-purple-500/20' },
  { border: 'border-amber-500/30', bg: 'bg-amber-500/10', fill: 'bg-amber-500', text: 'text-amber-400', activeGlow: 'hover:border-amber-500 shadow-amber-500/20' },
  { border: 'border-rose-500/30', bg: 'bg-rose-500/10', fill: 'bg-rose-500', text: 'text-rose-400', activeGlow: 'hover:border-rose-500 shadow-rose-500/20' },
];

function getOptionClass(index: number) {
  const isCorrect = currentQuestion.value?.correctIndex === index;
  
  if (isAnswerRevealed.value) {
    if (isCorrect) {
      return 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.35)] scale-[1.02] ring-2 ring-emerald-400';
    } else {
      return 'border-dark-800 bg-dark-900/40 opacity-40 grayscale';
    }
  }

  return `${optionColorThemes[index].border} ${optionColorThemes[index].bg} ${optionColorThemes[index].activeGlow}`;
}

function onQuestionTimerTimeout() {
  if (isQuestionActive.value && props.isAdmin) {
    emit('revealAnswer');
  }
}
</script>

<template>
  <div class="relative w-full max-w-5xl mx-auto flex flex-col gap-6 select-none font-cairo" :dir="isRtl ? 'rtl' : 'ltr'">
    
    <!-- ================= 1. LOBBY STATE (Waiting for Streamer to Press Start) ================= -->
    <div
      v-if="isLobby"
      class="relative bg-gradient-to-b from-dark-900/95 via-dark-900 to-dark-950 border-2 border-primary-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-7 overflow-hidden"
    >
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

      <!-- Big Header Badge -->
      <div class="relative z-10 flex flex-col items-center gap-3">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-600 to-indigo-600 border-2 border-primary-400 flex items-center justify-center text-4xl shadow-[0_0_35px_rgba(99,102,241,0.5)] animate-pulse">
          🧠
        </div>
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-wide">
          {{ isRtl ? 'ساحة مسابقة الأسئلة العامة جاهزة!' : 'Trivia Quiz Arena is Ready!' }}
        </h2>
        <p class="text-sm sm:text-base text-dark-300 max-w-xl mx-auto leading-relaxed">
          {{ isRtl ? 'المسابقة مجهزة بـ 4 خيارات لكل سؤال وتصويت مباشر عبر الشات. اضغط على الزر أدناه لبدء المسابقة فوراً.' : 'Interactive 4-choice quiz arena with live chat voting. Click below to launch the match.' }}
        </p>
      </div>

      <!-- Match Configurations Chips -->
      <div class="relative z-10 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold">
        <div class="px-4 py-2 rounded-2xl bg-dark-800/90 border border-dark-700 text-primary-300 flex items-center gap-2">
          <span>🏷️</span>
          <span>{{ isRtl ? 'الفئات:' : 'Categories:' }} <b class="text-white font-mono">{{ session.settings.triviaCategories?.length || 1 }}</b></span>
        </div>

        <div class="px-4 py-2 rounded-2xl bg-dark-800/90 border border-dark-700 text-indigo-300 flex items-center gap-2">
          <span>🔢</span>
          <span>{{ isRtl ? 'عدد الأسئلة:' : 'Questions:' }} <b class="text-white font-mono">{{ session.settings.triviaTotalQuestions || 10 }}</b></span>
        </div>

        <div class="px-4 py-2 rounded-2xl bg-dark-800/90 border border-dark-700 text-amber-300 flex items-center gap-2">
          <span>⏱️</span>
          <span v-if="(session.settings.triviaTimeLimitSeconds ?? 20) > 0">
            {{ isRtl ? 'مهلة السؤال:' : 'Timer per Q:' }} <b class="text-white font-mono">{{ session.settings.triviaTimeLimitSeconds }}s</b>
          </span>
          <span v-else>
            {{ isRtl ? 'مهلة السؤال:' : 'Timer:' }} <b class="text-white font-mono">♾️ {{ isRtl ? 'غير محدود (يدوي)' : 'Unlimited' }}</b>
          </span>
        </div>

        <div class="px-4 py-2 rounded-2xl bg-dark-800/90 border border-dark-700 text-emerald-300 flex items-center gap-2">
          <span>👥</span>
          <span>{{ isRtl ? 'المتسابقون:' : 'Players:' }} <b class="text-white font-mono">{{ session.players?.length || 0 }}</b></span>
        </div>
      </div>

      <!-- Prominent Streamer Action Buttons -->
      <div v-if="isAdmin" class="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          type="button"
          @click="emit('startTrivia')"
          class="px-10 py-4 rounded-full bg-gradient-to-r from-primary-500 via-indigo-600 to-purple-600 hover:from-primary-400 hover:to-indigo-500 text-white font-black text-base sm:text-lg shadow-[0_0_40px_rgba(99,102,241,0.6)] border-2 border-primary-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 animate-pulse"
        >
          <span>🚀</span>
          <span>{{ isRtl ? 'بدء المسابقة الآن' : 'Start Trivia Match' }}</span>
        </button>

        <button
          type="button"
          @click="emit('openCategoryModal')"
          class="px-6 py-3.5 rounded-full bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white font-bold text-sm hover:border-primary-400 transition flex items-center gap-2"
        >
          <span>⚙️</span>
          <span>{{ isRtl ? 'تخصيص الفئات والوقت' : 'Customize Categories & Timer' }}</span>
        </button>
      </div>

      <!-- Non-admin waiting state -->
      <div v-else class="relative z-10 text-dark-400 text-sm animate-pulse">
        ⏳ {{ isRtl ? 'بانتظار أن يضغط الستريمر على بدء المسابقة...' : 'Waiting for broadcaster to start the quiz...' }}
      </div>
    </div>

    <!-- ================= 2. ACTIVE QUIZ STAGE (Question, Timer, Options, Reveal) ================= -->
    <template v-else>
      <!-- TOP STATUS & CONTROLS BAR -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-dark-900/80 backdrop-blur-xl border border-dark-800 p-4 rounded-2xl shadow-xl">
        <!-- Category & Counter -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-500/15 border border-primary-500/30 text-primary-300 font-bold text-sm">
            <span class="text-base">🧠</span>
            <span>{{ displayCategory }}</span>
          </div>

          <div class="px-3 py-1.5 rounded-xl bg-dark-800 border border-dark-700 text-dark-200 font-black text-sm font-mono">
            {{ isRtl ? 'السؤال' : 'Question' }} 
            <span class="text-primary-400">{{ triviaState?.questionIndex || 1 }}</span>
            /
            <span>{{ triviaState?.totalQuestions || session.settings.triviaTotalQuestions || 10 }}</span>
          </div>

          <div v-if="currentQuestion?.difficulty" class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
            :class="{
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': currentQuestion.difficulty === 'EASY',
              'bg-amber-500/10 text-amber-400 border border-amber-500/20': currentQuestion.difficulty === 'MEDIUM',
              'bg-rose-500/10 text-rose-400 border border-rose-500/20': currentQuestion.difficulty === 'HARD'
            }">
            {{ currentQuestion.difficulty === 'EASY' ? (isRtl ? 'سهل' : 'Easy') : currentQuestion.difficulty === 'MEDIUM' ? (isRtl ? 'متوسط' : 'Medium') : (isRtl ? 'صعب' : 'Hard') }}
          </div>
        </div>

        <!-- State Pill & Live Votes Counter & Action Controls -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-800/80 border border-dark-700 text-xs text-dark-300">
            <span class="w-2 h-2 rounded-full" :class="isQuestionActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'"></span>
            <span>{{ isRtl ? 'إجمالي الأصوات:' : 'Total Votes:' }} <b class="text-white font-mono text-sm">{{ totalVotes }}</b></span>
          </div>

          <!-- Category Customizer Button -->
          <button
            v-if="isAdmin"
            type="button"
            @click="emit('openCategoryModal')"
            class="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            :title="isRtl ? 'اختيار فئات وتصنيفات الأسئلة' : 'Select Trivia Categories'"
          >
            <span>🏷️</span>
            <span class="hidden sm:inline">{{ isRtl ? 'الفئات' : 'Categories' }}</span>
          </button>

          <!-- Streamer Action Controls -->
          <div v-if="isAdmin" class="flex items-center gap-2">
            <button
              v-if="isQuestionActive"
              type="button"
              @click="emit('revealAnswer')"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-dark-950 font-black text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>💡</span>
              <span>{{ isRtl ? 'كشف الإجابة' : 'Reveal Answer' }}</span>
            </button>

            <button
              v-else-if="isAnswerRevealed"
              type="button"
              @click="emit('nextQuestion')"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-black text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-primary-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>{{ isRtl ? 'السؤال التالي' : 'Next Question' }}</span>
              <span>{{ isRtl ? '⬅️' : '➡️' }}</span>
            </button>

            <button
              v-if="isFinished"
              type="button"
              @click="emit('restartTrivia')"
              class="px-4 py-2 rounded-xl bg-emerald-500 text-dark-950 font-black text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>🔄</span>
              <span>{{ isRtl ? 'بدء مسابقة جديدة' : 'New Match' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Turn Timer Countdown Bar (When Timer is Active) -->
      <div v-if="isQuestionActive && session.timerEndsAt && (session.turnDuration || 0) > 0" class="w-full px-1">
        <TurnTimer
          :duration-seconds="session.turnDuration"
          :timer-ends-at="session.timerEndsAt"
          @timeout="onQuestionTimerTimeout"
        />
      </div>

      <!-- MAIN QUESTION CARD -->
      <div class="relative bg-gradient-to-b from-dark-900/90 to-dark-950 border border-primary-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden text-center">
        <!-- Glow decoration -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <!-- Question Text -->
        <div class="relative z-10">
          <h2 class="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-relaxed tracking-wide drop-shadow-md">
            {{ displayQuestionText }}
          </h2>
        </div>

        <!-- Live Chat Instructions Badge -->
        <div class="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/80 border border-dark-700 text-dark-300 text-xs sm:text-sm">
          <span>💬</span>
          <span>{{ isRtl ? 'أرسل في شات البث رقم الخيار' : 'Type in chat option number' }} <b class="text-primary-400 font-mono">1, 2, 3, 4</b> {{ isRtl ? 'أو الحرف' : 'or letter' }} <b class="text-indigo-400 font-mono">A, B, C, D</b></span>
        </div>
      </div>

      <!-- 4 OPTIONS GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(option, idx) in displayOptions"
          :key="idx"
          @click="isAdmin && isQuestionActive ? emit('submitVote', idx) : null"
          :class="[
            'relative group overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col justify-between min-h-[110px]',
            getOptionClass(idx)
          ]"
        >
          <!-- Background Vote Percentage Bar -->
          <div
            class="absolute inset-y-0 transition-all duration-500 ease-out opacity-20 pointer-events-none"
            :class="[optionColorThemes[idx].fill, isRtl ? 'right-0' : 'left-0']"
            :style="{ width: `${optionVoteStats[idx].percentage}%` }"
          />

          <!-- Top Content: Letter Badge + Option Text -->
          <div class="relative z-10 flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner shrink-0 border"
              :class="[
                isAnswerRevealed && currentQuestion?.correctIndex === idx
                  ? 'bg-emerald-500 text-dark-950 border-emerald-300'
                  : 'bg-dark-800 text-white border-dark-700'
              ]"
            >
              {{ optionLetters[idx] }}
            </div>

            <div class="flex-1 pt-1" :class="isRtl ? 'text-right' : 'text-left'">
              <p class="text-base sm:text-lg font-bold text-white group-hover:text-primary-200 transition leading-snug">
                {{ option }}
              </p>
            </div>
          </div>

          <!-- Bottom Stats: Vote count & Percentage -->
          <div class="relative z-10 mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-dark-300 font-mono">
            <div class="flex items-center gap-1.5 font-bold">
              <span :class="optionColorThemes[idx].text">{{ optionNumbers[idx] }}</span>
              <span class="text-dark-500">•</span>
              <span>{{ optionVoteStats[idx].count }} {{ isRtl ? 'صوت' : 'votes' }}</span>
            </div>

            <div class="font-black text-sm" :class="isAnswerRevealed && currentQuestion?.correctIndex === idx ? 'text-emerald-400' : 'text-white'">
              {{ optionVoteStats[idx].percentage }}%
            </div>
          </div>

          <!-- Answer Revealed Status Badge (Fixed: Positioned opposite of letter badge to prevent overlap in both AR & EN) -->
          <div
            v-if="isAnswerRevealed && currentQuestion?.correctIndex === idx"
            :class="[
              'absolute top-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-dark-950 font-black text-xs flex items-center gap-1 shadow-lg z-20',
              isRtl ? 'left-3' : 'right-3'
            ]"
          >
            <span>✓</span>
            <span>{{ isRtl ? 'صحيحة' : 'Correct' }}</span>
          </div>
        </div>
      </div>

      <!-- QUESTION EXPLANATION (Revealed State) -->
      <div
        v-if="isAnswerRevealed && displayExplanation"
        class="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-3 animate-fade-in"
        :class="isRtl ? 'text-right' : 'text-left'"
      >
        <span class="text-2xl">💡</span>
        <div class="flex-1">
          <h4 class="text-emerald-300 font-bold text-sm mb-1">
            {{ isRtl ? 'معلومة إضافية' : 'Explanation & Facts' }}
          </h4>
          <p class="text-emerald-100/90 text-sm leading-relaxed font-tajawal">
            {{ displayExplanation }}
          </p>
        </div>
      </div>

      <!-- GRAND SCOREBOARD / FINISHED SCREEN -->
      <div
        v-if="isFinished"
        class="w-full max-w-2xl mx-auto p-5 sm:p-7 bg-gradient-to-b from-dark-950 via-slate-900/98 to-dark-950 border-2 border-amber-400/80 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.4)] backdrop-blur-xl animate-scale-up space-y-4 text-center"
      >
        <div class="inline-flex items-center gap-2 px-4 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/50 rounded-full text-xs font-cairo font-black uppercase tracking-wider shadow-glow-gold">
          🏆 {{ isRtl ? 'لوحة الشرف والترتيب النهائي (SCOREBOARD)' : 'FINAL TRIVIA SCOREBOARD' }}
        </div>

        <!-- Winner Spotlight Card -->
        <div
          v-if="session.winner"
          class="p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-400/80 rounded-2xl shadow-glow-gold flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative shrink-0">
              <img
                :src="session.winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.winner.username}`"
                class="w-14 h-14 rounded-2xl border-2 border-amber-400 shadow-xl"
              />
              <span class="absolute -top-2.5 -right-2 text-xl animate-bounce">👑</span>
            </div>
            <div :class="isRtl ? 'text-right' : 'text-left'" class="min-w-0">
              <div class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {{ isRtl ? 'بطل مسابقة الأسئلة بالمركز الأول' : 'TRIVIA QUIZ CHAMPION' }}
              </div>
              <div class="text-lg font-black text-white font-cairo truncate">
                {{ session.winner.displayName }}
              </div>
              <div class="text-xs text-slate-400 font-mono">@{{ session.winner.username }}</div>
            </div>
          </div>

          <div class="text-right font-mono shrink-0">
            <div class="text-base font-black text-amber-300">
              {{ session.winner.score || 0 }} {{ isRtl ? 'نقطة' : 'pts' }}
            </div>
            <div v-if="session.winner.correctAnswersCount" class="text-[10px] text-emerald-400 font-bold">
              ✓ {{ session.winner.correctAnswersCount }} {{ isRtl ? 'إجابات صحيحة' : 'correct' }}
            </div>
          </div>
        </div>

        <div v-else class="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 text-slate-300 text-sm">
          {{ isRtl ? 'اكتملت مسابقة الأسئلة! استعرض جدول ترتيب المتسابقين أدناه 🏁' : 'Quiz concluded! View final rankings below 🏁' }}
        </div>

        <!-- Full Contenders Scoreboard Leaderboard Table -->
        <div class="space-y-1.5" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="flex items-center justify-between text-xs font-cairo font-bold text-amber-300 px-1">
            <span>📊 {{ isRtl ? 'جدول ترتيب جميع المتسابقين بالنقاط:' : 'Contenders Leaderboard by Points:' }}</span>
            <span class="text-[10px] font-mono text-slate-400">{{ allRankedPlayers.length }} {{ isRtl ? 'متسابق' : 'players' }}</span>
          </div>

          <div class="max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            <template v-for="(p, idx) in allRankedPlayers" :key="p.username">
              <div
                class="flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all"
                :class="[
                  idx === 0 && (p.score || 0) > 0 ? 'bg-amber-950/60 border-amber-400/80 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                  idx === 1 && (p.score || 0) > 0 ? 'bg-slate-800/80 border-slate-500 text-slate-200' :
                  idx === 2 && (p.score || 0) > 0 ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' :
                  'bg-slate-950/60 border-slate-800 text-slate-400'
                ]"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="font-mono font-bold text-xs shrink-0" :class="idx < 3 ? 'text-amber-400' : 'text-slate-500'">
                    {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                  </span>
                  <img
                    :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`"
                    class="w-7 h-7 rounded-full border border-amber-400/40 shrink-0"
                  />
                  <div class="min-w-0">
                    <div class="font-cairo font-bold text-white truncate flex items-center gap-1.5">
                      <span>{{ p.displayName }}</span>
                      <span class="text-[10px] text-slate-400 font-mono">@{{ p.username }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 font-mono shrink-0">
                  <span v-if="p.correctAnswersCount" class="text-[10px] text-emerald-400 font-bold">
                    ✓ {{ p.correctAnswersCount }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black text-xs">
                    {{ p.score || 0 }} {{ isRtl ? 'نقاط' : 'pts' }}
                  </span>
                </div>
              </div>
            </template>

            <div v-if="allRankedPlayers.length === 0" class="text-center py-3 text-slate-500 text-xs font-tajawal">
              {{ isRtl ? 'لم يشارك أحد في هذه المسابقة' : 'No recorded participants' }}
            </div>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-2 flex justify-center gap-3">
          <button
            type="button"
            class="px-8 py-2.5 rounded-full font-cairo font-black text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-dark-950 shadow-glow-gold hover:brightness-110 active:scale-95 transition"
            @click="emit('restartTrivia')"
          >
            🔄 {{ isRtl ? 'إعادة ضبط وبدء مسابقة جديدة' : 'Restart Quiz Match' }}
          </button>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes bounceShort {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-bounce-short {
  animation: bounceShort 2s infinite ease-in-out;
}
</style>
