<script setup lang="ts">
import type { IPlayer, ITriviaState } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';

const props = defineProps<{
  players: IPlayer[];
  triviaState?: ITriviaState | null;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: 'kickPlayer', playerNumber: number): void;
}>();

const { t, isRtl } = useTranslation();

const activeFilter = ref<'ALL' | 'VOTED' | 'TOP'>('ALL');
const searchQuery = ref('');

const isAnswerRevealed = computed(() => {
  return props.triviaState?.status === 'ANSWER_REVEALED';
});

const correctIndex = computed(() => {
  return props.triviaState?.currentQuestion?.correctIndex ?? null;
});

const optionLetters = ['A', 'B', 'C', 'D'];
const optionColorClasses = [
  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'bg-rose-500/20 text-rose-300 border-rose-500/40'
];

const processedPlayers = computed(() => {
  let list = [...props.players];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((p) => p.displayName.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
  }

  if (activeFilter.value === 'VOTED') {
    list = list.filter((p) => {
      const vote = props.triviaState?.votes?.[p.username.toLowerCase()];
      return vote !== undefined && vote >= 0;
    });
  }

  // Always sort by highest score first, then correct answers
  return list.sort((a, b) => (b.score || 0) - (a.score || 0));
});

const votedCount = computed(() => {
  return props.triviaState?.totalVotesCount || 0;
});
</script>

<template>
  <div class="flex flex-col h-full space-y-3 font-cairo" :dir="isRtl ? 'rtl' : 'ltr'">
    
    <!-- Filter Tabs -->
    <div class="flex items-center gap-1.5 p-1 bg-dark-900 border border-dark-800 rounded-xl">
      <button
        type="button"
        :class="[
          'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center',
          activeFilter === 'ALL'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-dark-400 hover:text-white'
        ]"
        @click="activeFilter = 'ALL'"
      >
        {{ isRtl ? 'الكل' : 'All' }} ({{ players.length }})
      </button>

      <button
        type="button"
        :class="[
          'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center',
          activeFilter === 'VOTED'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-dark-400 hover:text-white'
        ]"
        @click="activeFilter = 'VOTED'"
      >
        {{ isRtl ? 'صوّتوا الآن' : 'Voted' }} ({{ votedCount }})
      </button>

      <button
        type="button"
        :class="[
          'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center',
          activeFilter === 'TOP'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-dark-400 hover:text-white'
        ]"
        @click="activeFilter = 'TOP'"
      >
        🏆 {{ isRtl ? 'المتصدرون' : 'Top Scorers' }}
      </button>
    </div>

    <!-- Search input if many players -->
    <div v-if="players.length > 5" class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="isRtl ? 'بحث عن متسابق في الشات...' : 'Search chatter...'"
        class="w-full px-3.5 py-1.5 bg-dark-950 border border-dark-800 rounded-xl text-xs text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
      />
    </div>

    <!-- Empty State -->
    <div v-if="processedPlayers.length === 0" class="text-center py-10 text-dark-500 text-xs">
      <div class="text-2xl mb-1.5">💬</div>
      <p>{{ isRtl ? 'بانتظار تصويت وإجابات المشاهدين في الشات...' : 'Waiting for chatters to vote...' }}</p>
      <p class="text-[11px] text-dark-600 mt-1 font-mono">1, 2, 3, 4 / A, B, C, D</p>
    </div>

    <!-- Contenders List -->
    <div v-else class="space-y-2 overflow-y-auto pr-1 max-h-[calc(100vh-280px)]">
      <div
        v-for="(player, idx) in processedPlayers"
        :key="player.id"
        class="relative group p-2.5 bg-dark-900/90 hover:bg-dark-800/90 border border-dark-800 hover:border-primary-500/40 rounded-xl transition-all flex items-center justify-between gap-2.5 shadow-sm"
      >
        <!-- Left / Start: Rank + Avatar + Name + Streak -->
        <div class="flex items-center gap-2.5 min-w-0">
          <span
            class="w-6 text-center font-black text-xs shrink-0"
            :class="{
              'text-amber-400 font-bold': idx === 0 && (player.score || 0) > 0,
              'text-slate-300 font-bold': idx === 1 && (player.score || 0) > 0,
              'text-amber-600 font-bold': idx === 2 && (player.score || 0) > 0,
              'text-dark-500': idx > 2 || (player.score || 0) === 0
            }"
          >
            {{ idx === 0 && (player.score || 0) > 0 ? '🥇' : idx === 1 && (player.score || 0) > 0 ? '🥈' : idx === 2 && (player.score || 0) > 0 ? '🥉' : `#${idx + 1}` }}
          </span>

          <img
            :src="player.avatarUrl"
            :alt="player.displayName"
            class="w-8 h-8 rounded-full border border-dark-700 bg-dark-950 object-cover shrink-0"
          />

          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[120px]">
                {{ player.displayName }}
              </span>
              <!-- Streak Badge -->
              <span
                v-if="(player.currentStreak || 0) >= 2"
                class="px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-0.5"
                title="Streak Multiplier"
              >
                🔥 x{{ player.currentStreak }}
              </span>
            </div>

            <!-- Correct Answers Count -->
            <div class="text-[10px] text-dark-400 font-medium">
              ✓ {{ player.correctAnswersCount || 0 }} {{ isRtl ? 'صحيحة' : 'correct' }}
            </div>
          </div>
        </div>

        <!-- Right / End: Active Question Choice Badge + Score + Kick -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Active Choice Badge for Current Question -->
          <template v-if="triviaState?.votes?.[player.username.toLowerCase()] !== undefined">
            <div
              class="px-2 py-1 rounded-lg border text-xs font-black font-mono shadow-sm flex items-center gap-1"
              :class="[
                isAnswerRevealed && triviaState.votes[player.username.toLowerCase()] === correctIndex
                  ? 'bg-emerald-500 text-dark-950 border-emerald-300 ring-1 ring-emerald-400'
                  : isAnswerRevealed
                  ? 'bg-dark-950/80 text-dark-500 border-dark-800 line-through'
                  : optionColorClasses[triviaState.votes[player.username.toLowerCase()]]
              ]"
            >
              <span>{{ optionLetters[triviaState.votes[player.username.toLowerCase()]] }}</span>
              <span v-if="isAnswerRevealed && triviaState.votes[player.username.toLowerCase()] === correctIndex">✓</span>
            </div>
          </template>
          <span v-else class="text-[10px] text-dark-600 font-mono italic">
            {{ isRtl ? 'لم يصوت' : 'no vote' }}
          </span>

          <!-- Score Display -->
          <div class="text-left w-14">
            <span class="font-black text-primary-400 font-mono text-sm block">
              {{ player.score || 0 }}
            </span>
            <span class="text-[9px] text-dark-500 block -mt-1 font-sans">
              {{ isRtl ? 'نقطة' : 'pts' }}
            </span>
          </div>

          <!-- Kick Player Button for Admin -->
          <button
            v-if="isAdmin"
            type="button"
            class="opacity-0 group-hover:opacity-100 p-1 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            :title="isRtl ? 'طرد المتسابق' : 'Kick chatter'"
            @click="emit('kickPlayer', player.number)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
