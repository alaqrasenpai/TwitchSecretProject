<script setup lang="ts">
import type { IBoardPartyState, IMinigameState, TeamId } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';

const props = defineProps<{
  boardState: IBoardPartyState;
  minigame: IMinigameState;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit-vote', choice: number | string): void;
  (e: 'resolve'): void;
}>();

const { t, isRtl } = useTranslation();

const question = computed(() => props.minigame.triviaQuestion);
const isResolved = computed(() => props.minigame.status === 'COMPLETED');

const optionLetters = ['A', 'B', 'C', 'D'];

function getTeamVoteCount(teamId: TeamId, optionIdx: number) {
  const votes = props.minigame.teamVotes?.[teamId];
  if (!votes) return 0;
  return (votes[optionIdx] || 0) + (votes[optionLetters[optionIdx]] || 0) + (votes[String(optionIdx + 1)] || 0);
}

const enabledTeams = computed(() => {
  return (['crimson', 'cobalt', 'emerald', 'amber'] as TeamId[]).filter(
    (id) => props.boardState.teams[id]?.enabled
  );
});
</script>

<template>
  <div class="relative w-full max-w-4xl mx-auto p-5 sm:p-7 bg-[#101422]/95 border-2 border-indigo-500/60 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.3)] backdrop-blur-xl flex flex-col justify-between space-y-6 animate-fade-in" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Minigame Top Header -->
    <div class="flex items-center justify-between border-b border-indigo-500/30 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-2xl shadow-inner animate-pulse">
          🧠
        </div>
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-cairo font-black bg-indigo-950 text-indigo-300 border border-indigo-500/40 uppercase">
            MINI GAME // TRIVIA CLASH
          </span>
          <h2 class="text-xl sm:text-2xl font-cairo font-black text-white">
            {{ isRtl ? minigame.titleAr : minigame.titleEn }}
          </h2>
        </div>
      </div>

      <!-- Turn Timer -->
      <div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 border border-indigo-500/40">
        <span class="text-indigo-400 text-sm">⏱️</span>
        <span class="font-display font-black text-2xl text-amber-400">
          {{ minigame.timeRemainingSeconds }}s
        </span>
      </div>
    </div>

    <!-- Question Prompt Card -->
    <div v-if="question" class="p-5 sm:p-6 rounded-2xl bg-black/50 border border-indigo-500/40 shadow-inner space-y-2 text-center">
      <div class="text-xs font-cairo font-bold text-indigo-400 uppercase tracking-wider">
        📌 {{ isRtl ? (question.category || 'معلومات عامة') : (question.categoryEn || 'General Knowledge') }}
      </div>
      <p class="text-lg sm:text-2xl font-cairo font-black text-white leading-relaxed">
        {{ isRtl ? question.question : (question.questionEn || question.question) }}
      </p>
    </div>

    <!-- 4 Options Grid -->
    <div v-if="question" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <button
        v-for="(opt, idx) in (isRtl ? question.options : (question.optionsEn || question.options))"
        :key="idx"
        type="button"
        :class="[
          'relative p-4 rounded-2xl border-2 transition-all flex flex-col justify-between text-right overflow-hidden group',
          isResolved
            ? (idx === question.correctIndex
                ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-102 ring-2 ring-emerald-400'
                : 'bg-black/40 border-slate-800 text-slate-500 opacity-60')
            : 'bg-black/60 border-slate-700/80 hover:border-indigo-400 text-white hover:bg-indigo-950/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]'
        ]"
        @click="emit('submit-vote', idx)"
      >
        <div class="flex items-center justify-between w-full relative z-10">
          <span class="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center font-display font-black text-sm text-indigo-300">
            {{ optionLetters[idx] }}
          </span>
          <span class="font-cairo font-bold text-base flex-1 px-3" :class="isRtl ? 'text-right' : 'text-left'">
            {{ opt }}
          </span>
          <span v-if="isResolved && idx === question.correctIndex" class="text-emerald-400 font-bold text-lg animate-bounce">
            ✓
          </span>
        </div>

        <!-- Team Live Votes Mini Bar -->
        <div class="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 w-full justify-end text-[11px] font-cairo">
          <span v-for="teamId in enabledTeams" :key="teamId" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-slate-700">
            <span>{{ boardState.teams[teamId]?.icon }}</span>
            <span class="font-bold text-white">{{ getTeamVoteCount(teamId, idx) }}</span>
          </span>
        </div>
      </button>
    </div>

    <!-- Resolved Explanation / Reward Banner -->
    <div v-if="isResolved && question?.explanation" class="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-sm font-tajawal flex items-center gap-3">
      <span class="text-2xl">💡</span>
      <div>
        <strong class="font-cairo font-bold block">{{ isRtl ? 'معلومة إثرائية:' : 'Bonus Fact:' }}</strong>
        <span>{{ isRtl ? question.explanation : (question.explanationEn || question.explanation) }}</span>
      </div>
    </div>

    <!-- Bottom Action Controls -->
    <div class="flex items-center justify-between pt-2">
      <div class="text-xs font-tajawal text-slate-400">
        {{ isRtl ? 'اكتب في شات البث رقم أو حرف الإجابة: 1، 2، 3، 4 أو A، B، C، D' : 'Viewers vote in live chat: 1, 2, 3, 4 or A, B, C, D' }}
      </div>

      <button
        v-if="isAdmin"
        type="button"
        class="px-6 py-2.5 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
        @click="emit('resolve')"
      >
        {{ isResolved ? (isRtl ? 'تم إنهاء الميني جيم ✓' : 'Minigame Ended ✓') : (isRtl ? 'كشف النتيجة وتوزيع العملات 🏆' : 'Reveal & Award Coins 🏆') }}
      </button>
    </div>
  </div>
</template>
