<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    gameType?: 'ROULETTE' | 'TRIVIA' | 'BOARD_PARTY' | 'GRID_ROYALE' | 'TYPE_RACE' | 'HANGMAN' | 'HOT_POTATO' | 'SUBWAY_RUNNER';
  }>(),
  {
    gameType: 'ROULETTE'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t, isRtl } = useTranslation();
const isTrivia = computed(() => props.gameType === 'TRIVIA');
const isBoardParty = computed(() => props.gameType === 'BOARD_PARTY');
const isGridRoyale = computed(() => props.gameType === 'GRID_ROYALE');
const isTypeRace = computed(() => props.gameType === 'TYPE_RACE');
const isHangman = computed(() => props.gameType === 'HANGMAN');
const isHotPotato = computed(() => props.gameType === 'HOT_POTATO');
const isSubwayRunner = computed(() => props.gameType === 'SUBWAY_RUNNER');
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    @click.self="$emit('close')"
  >
    <div
      :class="[
        'relative w-full max-w-2xl bg-arena-card border-2 rounded-3xl p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200',
        isTrivia
          ? 'border-primary-500/60 shadow-[0_0_40px_rgba(99,102,241,0.3)]'
          : isBoardParty
            ? 'border-indigo-500/60 shadow-[0_0_40px_rgba(99,102,241,0.3)]'
            : isGridRoyale
              ? 'border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
              : isTypeRace
                ? 'border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
                : isHangman
                  ? 'border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                  : isHotPotato
                    ? 'border-red-600/80 shadow-[0_0_40px_rgba(220,38,38,0.4)]'
                    : isSubwayRunner
                      ? 'border-cyan-400/80 shadow-[0_0_40px_rgba(6,182,212,0.4)]'
                      : 'border-arena-crimson shadow-glow-crimson',
        isRtl ? 'text-right' : 'text-left'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-arena-border/80 pb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl font-black"
            :class="[
              isTrivia
                ? 'bg-primary-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                : isBoardParty
                  ? 'bg-gradient-to-r from-red-600 via-zinc-700 to-cyan-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                  : isGridRoyale
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                    : isTypeRace
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                      : isHangman
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : isHotPotato
                          ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                          : isSubwayRunner
                            ? 'bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                            : 'bg-arena-crimson shadow-glow-crimson'
            ]"
          >
            {{ isTrivia ? '🧠' : isBoardParty ? '🎲' : isGridRoyale ? '⚡' : isTypeRace ? '⌨️' : isHangman ? '🕵️' : isHotPotato ? '💣' : isSubwayRunner ? '🏃‍♂️' : '📜' }}
          </div>
          <div>
            <h3 class="font-cairo font-black text-2xl text-white">
              {{ isTrivia ? t('triviaRulesModalTitle') : isBoardParty ? t('boardRulesModalTitle') : isGridRoyale ? t('gridRoyaleRulesModalTitle') : isTypeRace ? t('typeRaceRulesModalTitle') : isHangman ? t('hangmanRulesModalTitle') : isHotPotato ? t('hotPotatoRulesModalTitle') : isSubwayRunner ? t('subwayRunnerRulesModalTitle') : t('rulesModalTitle') }}
            </h3>
            <p class="text-xs font-tajawal text-arena-textDark">
              {{ isTrivia ? t('triviaRulesModalSub') : isBoardParty ? t('boardRulesModalSub') : isGridRoyale ? t('gridRoyaleRulesModalSub') : isTypeRace ? t('typeRaceRulesModalSub') : isHangman ? t('hangmanRulesModalSub') : isHotPotato ? t('hotPotatoRulesModalSub') : isSubwayRunner ? t('subwayRunnerRulesModalSub') : t('rulesModalSub') }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="w-9 h-9 rounded-full bg-arena-dark border border-arena-border text-arena-textMuted hover:text-white flex items-center justify-center transition-colors"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Rules List: BOARD PARTY -->
      <div v-if="isBoardParty" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-indigo-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-indigo-400 flex items-center gap-2">
            <span>{{ t('boardRule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('boardRule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-indigo-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-indigo-400 flex items-center gap-2">
            <span>{{ t('boardRule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('boardRule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-indigo-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-indigo-400 flex items-center gap-2">
            <span>{{ t('boardRule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('boardRule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-indigo-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-indigo-400 flex items-center gap-2">
            <span>{{ t('boardRule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('boardRule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-indigo-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-indigo-400 flex items-center gap-2">
            <span>{{ t('boardRule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('boardRule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Rules List: TRIVIA -->
      <div v-else-if="isTrivia" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-primary-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-primary-400 flex items-center gap-2">
            <span>{{ t('triviaRule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('triviaRule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-primary-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-primary-400 flex items-center gap-2">
            <span>{{ t('triviaRule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('triviaRule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-primary-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-primary-400 flex items-center gap-2">
            <span>{{ t('triviaRule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('triviaRule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-primary-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-primary-400 flex items-center gap-2">
            <span>{{ t('triviaRule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('triviaRule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-primary-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-primary-400 flex items-center gap-2">
            <span>{{ t('triviaRule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('triviaRule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Rules List: GRID ROYALE -->
      <div v-else-if="isGridRoyale" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('gridRule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('gridRule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('gridRule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('gridRule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('gridRule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('gridRule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('gridRule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('gridRule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('gridRule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('gridRule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Rules List: TYPE RACE -->
      <div v-else-if="isTypeRace" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-amber-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-amber-400 flex items-center gap-2">
            <span>{{ t('typeRule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('typeRule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-amber-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-amber-400 flex items-center gap-2">
            <span>{{ t('typeRule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('typeRule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-amber-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-amber-400 flex items-center gap-2">
            <span>{{ t('typeRule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('typeRule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-amber-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-amber-400 flex items-center gap-2">
            <span>{{ t('typeRule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('typeRule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-amber-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-amber-400 flex items-center gap-2">
            <span>{{ t('typeRule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('typeRule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Rules List: HANGMAN -->
      <div v-else-if="isHangman" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-emerald-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-emerald-400 flex items-center gap-2">
            <span>{{ t('hangmanRule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hangmanRule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-emerald-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-emerald-400 flex items-center gap-2">
            <span>{{ t('hangmanRule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hangmanRule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-emerald-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-emerald-400 flex items-center gap-2">
            <span>{{ t('hangmanRule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hangmanRule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-emerald-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-emerald-400 flex items-center gap-2">
            <span>{{ t('hangmanRule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hangmanRule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-emerald-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-emerald-400 flex items-center gap-2">
            <span>{{ t('hangmanRule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hangmanRule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Rules List: HOT POTATO -->
      <div v-else-if="isHotPotato" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-red-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-red-400 flex items-center gap-2">
            <span>{{ t('hotPotatoRule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hotPotatoRule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-red-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-red-400 flex items-center gap-2">
            <span>{{ t('hotPotatoRule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hotPotatoRule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-red-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-red-400 flex items-center gap-2">
            <span>{{ t('hotPotatoRule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hotPotatoRule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-red-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-red-400 flex items-center gap-2">
            <span>{{ t('hotPotatoRule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hotPotatoRule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-red-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-red-400 flex items-center gap-2">
            <span>{{ t('hotPotatoRule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('hotPotatoRule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Rules List: SUBWAY RUNNER -->
      <div v-else-if="isSubwayRunner" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('subwayRule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('subwayRule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('subwayRule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('subwayRule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('subwayRule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('subwayRule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('subwayRule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('subwayRule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-cyan-500/20 space-y-1">
          <div class="font-cairo font-bold text-base text-cyan-400 flex items-center gap-2">
            <span>{{ t('subwayRule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('subwayRule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Rules List: ROULETTE -->
      <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-tajawal text-sm leading-relaxed">
        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-arena-border space-y-1">
          <div class="font-cairo font-bold text-base text-arena-crimson flex items-center gap-2">
            <span>{{ t('rule1Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('rule1Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-arena-border space-y-1">
          <div class="font-cairo font-bold text-base text-arena-crimson flex items-center gap-2">
            <span>{{ t('rule2Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('rule2Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-arena-border space-y-1">
          <div class="font-cairo font-bold text-base text-arena-crimson flex items-center gap-2">
            <span>{{ t('rule3Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('rule3Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-arena-border space-y-1">
          <div class="font-cairo font-bold text-base text-arena-crimson flex items-center gap-2">
            <span>{{ t('rule4Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('rule4Desc') }}
          </p>
        </div>

        <div class="p-4 bg-arena-dark/80 rounded-2xl border border-arena-border space-y-1">
          <div class="font-cairo font-bold text-base text-arena-crimson flex items-center gap-2">
            <span>{{ t('rule5Title') }}</span>
          </div>
          <p class="text-arena-textMuted text-xs">
            {{ t('rule5Desc') }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end pt-4 border-t border-arena-border/80">
        <GamerButton size="md" variant="primary" rounded="full" class="shadow-glow-crimson px-8 text-xs font-bold" @click="$emit('close')">
          {{ t('closeRulesBtn') }}
        </GamerButton>
      </div>
    </div>
  </div>
</template>
