<script setup lang="ts">
import type { IBoardPartyState, IMinigameState, TeamId } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';

const props = defineProps<{
  boardState: IBoardPartyState;
  minigame: IMinigameState;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: 'resolve'): void;
}>();

const { t, isRtl } = useTranslation();

const roulette = computed(() => props.minigame.rouletteState);
const isResolved = computed(() => props.minigame.status === 'COMPLETED');

const enabledTeams = computed(() => {
  return (['crimson', 'cobalt', 'emerald', 'amber'] as TeamId[]).filter(
    (id) => props.boardState.teams[id]?.enabled
  );
});

const isSpinning = ref(true);

onMounted(() => {
  setTimeout(() => {
    isSpinning.value = false;
  }, 4000);
});
</script>

<template>
  <div class="relative w-full max-w-4xl mx-auto p-5 sm:p-7 bg-[#101422]/95 border-2 border-red-500/60 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-xl flex flex-col justify-between space-y-6 animate-fade-in" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Minigame Top Header -->
    <div class="flex items-center justify-between border-b border-red-500/30 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-400/50 flex items-center justify-center text-2xl shadow-inner animate-spin-slow">
          🎯
        </div>
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-cairo font-black bg-red-950 text-red-300 border border-red-500/40 uppercase">
            MINI GAME // ROULETTE DUEL
          </span>
          <h2 class="text-xl sm:text-2xl font-cairo font-black text-white">
            {{ isRtl ? minigame.titleAr : minigame.titleEn }}
          </h2>
        </div>
      </div>

      <!-- Timer -->
      <div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 border border-red-500/40">
        <span class="text-red-400 text-sm">⏱️</span>
        <span class="font-display font-black text-2xl text-amber-400">
          {{ minigame.timeRemainingSeconds }}s
        </span>
      </div>
    </div>

    <!-- Center Roulette Wheel Stage -->
    <div class="py-6 flex flex-col items-center justify-center space-y-6">
      <!-- Animated Spinning Wheel Frame -->
      <div class="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        <!-- Outer Glowing Ring -->
        <div class="absolute inset-0 rounded-full border-4 border-red-500/40 animate-ping opacity-20 pointer-events-none" />
        
        <!-- Rotating Wheel disc -->
        <div
          :class="[
            'w-full h-full rounded-full border-8 border-slate-800 bg-gradient-to-tr from-red-950 via-slate-900 to-amber-950 shadow-[0_0_40px_rgba(239,68,68,0.4)] flex items-center justify-center relative overflow-hidden transition-all duration-3000',
            isSpinning ? 'animate-spin' : ''
          ]"
        >
          <!-- Team Sectors Icons -->
          <div
            v-for="(teamId, idx) in enabledTeams"
            :key="teamId"
            class="absolute text-2xl font-black"
            :style="{
              transform: `rotate(${(360 / enabledTeams.length) * idx}deg) translateY(-85px)`
            }"
          >
            {{ boardState.teams[teamId]?.icon }}
          </div>

          <!-- Center Hub -->
          <div class="w-24 h-24 rounded-full bg-black border-4 border-amber-400/80 flex flex-col items-center justify-center shadow-2xl relative z-10">
            <span class="text-2xl">🏆</span>
            <span class="text-[10px] font-cairo font-black text-amber-300">+50 🪙</span>
          </div>
        </div>

        <!-- Top Pointer Needle -->
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-8 bg-amber-400 border-2 border-white shadow-lg clip-triangle z-20" />
      </div>

      <!-- Target Team Reveal Banner -->
      <div v-if="!isSpinning && roulette?.targetTeamId" class="p-4 sm:p-5 rounded-2xl bg-black/70 border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-center space-y-2 animate-bounce">
        <div class="text-xs font-cairo font-bold text-amber-300 uppercase">
          🎉 {{ isRtl ? 'الفريق الفائز بغنيمة الروليت' : 'Winning Bounty Team' }}
        </div>
        <div class="text-2xl font-cairo font-black text-white flex items-center justify-center gap-3">
          <span>{{ boardState.teams[roulette.targetTeamId]?.icon }}</span>
          <span :style="{ color: boardState.teams[roulette.targetTeamId]?.color }">
            {{ isRtl ? boardState.teams[roulette.targetTeamId]?.nameAr : boardState.teams[roulette.targetTeamId]?.nameEn }}
          </span>
          <span class="px-3 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-500/40 text-sm font-bold">
            +50 🪙
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="flex items-center justify-between pt-2 border-t border-red-500/30">
      <div class="text-xs font-tajawal text-slate-400">
        {{ isRtl ? 'تدور عجلة الروليت آلياً لتحديد الفريق الحائز على غنيمة الجولة' : 'The wheel automatically selects the bounty winning team' }}
      </div>

      <button
        v-if="isAdmin"
        type="button"
        class="px-6 py-2.5 rounded-full font-cairo font-black text-sm bg-gradient-to-r from-red-500 to-amber-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all"
        @click="emit('resolve')"
      >
        {{ isResolved ? (isRtl ? 'تم إنهاء الميني جيم ✓' : 'Minigame Ended ✓') : (isRtl ? 'تأكيد وحصد المكافآت 🏆' : 'Confirm & Collect Rewards 🏆') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.clip-triangle {
  clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
}
</style>
