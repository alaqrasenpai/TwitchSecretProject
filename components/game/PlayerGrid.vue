<script setup lang="ts">
import type { IPlayer } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';
import GamerBadge from '~/components/common/GamerBadge.vue';

const props = withDefaults(
  defineProps<{
    players: IPlayer[];
    activePlayerNumber: number | null;
    targetPlayerNumber: number | null;
    isControllerMode?: boolean;
    waitingAction?: boolean;
  }>(),
  {
    isControllerMode: false,
    waitingAction: false
  }
);

const emit = defineEmits<{
  (e: 'killPlayer', playerNumber: number): void;
  (e: 'revivePlayer', playerNumber: number): void;
  (e: 'kickPlayer', playerNumber: number): void;
}>();

const { t, isRtl } = useTranslation();
const activeFilter = ref<'ALL' | 'ALIVE' | 'REVIVABLE' | 'DEAD'>('ALL');

const revivablePlayersCount = computed(() => {
  return props.players.filter((p) => p.status === 'ELIMINATED' && p.timesRevived === 0).length;
});

const filteredPlayers = computed(() => {
  if (activeFilter.value === 'ALIVE') {
    return props.players.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED');
  }
  if (activeFilter.value === 'REVIVABLE') {
    return props.players.filter((p) => p.status === 'ELIMINATED' && p.timesRevived === 0);
  }
  if (activeFilter.value === 'DEAD') {
    return props.players.filter((p) => p.status === 'ELIMINATED');
  }
  return props.players;
});
</script>

<template>
  <div class="space-y-2.5" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Filter Tabs (Controller Mode Only) -->
    <div v-if="isControllerMode" class="flex items-center gap-1 p-1 bg-arena-dark/90 rounded-xl border border-arena-border/80 text-[11px] font-cairo">
      <button
        type="button"
        :class="[
          'px-2.5 py-1 rounded-lg font-bold transition-all',
          activeFilter === 'ALL' ? 'bg-arena-crimson text-white shadow-glow-crimson' : 'text-arena-textMuted hover:text-white'
        ]"
        @click="activeFilter = 'ALL'"
      >
        {{ t('allContendersTab') }} ({{ players.length }})
      </button>

      <button
        type="button"
        :class="[
          'px-2.5 py-1 rounded-lg font-bold transition-all',
          activeFilter === 'ALIVE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-arena-textMuted hover:text-white'
        ]"
        @click="activeFilter = 'ALIVE'"
      >
        {{ t('aliveContendersTab') }} ({{ players.filter(p => p.status === 'ALIVE' || p.status === 'REVIVED').length }})
      </button>

      <button
        type="button"
        :class="[
          'px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1',
          activeFilter === 'REVIVABLE' ? 'bg-amber-600 text-white shadow-glow-gold' : 'text-amber-300 hover:text-white'
        ]"
        @click="activeFilter = 'REVIVABLE'"
      >
        <span>{{ t('revivableContendersTab') }}</span>
        <span v-if="revivablePlayersCount > 0" class="px-1 bg-amber-400 text-slate-900 rounded-full text-[9px] font-black">{{ revivablePlayersCount }}</span>
      </button>

      <button
        type="button"
        :class="[
          'px-2.5 py-1 rounded-lg font-bold transition-all',
          activeFilter === 'DEAD' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
        ]"
        @click="activeFilter = 'DEAD'"
      >
        {{ t('eliminatedContendersTab') }}
      </button>
    </div>

    <!-- Players Cards Grid -->
    <div
      :class="[
        'grid gap-2',
        isControllerMode
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
      ]"
    >
      <div
        v-for="player in filteredPlayers"
        :key="player.id || player.number"
        :class="[
          'relative p-2.5 bg-arena-card/90 border transition-all duration-300 rounded-2xl flex flex-col justify-between shadow-arena-card group/card overflow-hidden',
          player.status === 'ELIMINATED' && player.timesRevived === 0
            ? 'border-amber-500/60 bg-amber-950/20 hover:border-amber-400'
            : player.status === 'ELIMINATED'
            ? 'border-neutral-800/80 opacity-50 bg-neutral-950/40 filter grayscale'
            : player.status === 'REVIVED'
            ? 'border-emerald-500/80 shadow-glow-emerald bg-emerald-950/30'
            : 'border-arena-border/80 hover:border-arena-crimson/60 hover:bg-arena-cardHover',
          activePlayerNumber === player.number && 'border-arena-crimson shadow-glow-crimson ring-2 ring-arena-crimson/50 bg-red-950/40 animate-pulse',
          targetPlayerNumber === player.number && 'border-red-600 shadow-glow-blood bg-red-950/50'
        ]"
      >
        <!-- Top Row: Number, Kick Action & Status Badge -->
        <div class="flex items-center justify-between gap-1 mb-1.5">
          <div class="flex items-center gap-1.5 shrink-0">
            <span
              :class="[
                'font-cairo font-black text-xs px-2 py-0.5 rounded-full border shrink-0',
                activePlayerNumber === player.number
                  ? 'bg-arena-crimson text-white border-red-300 shadow-glow-crimson'
                  : 'bg-arena-dark text-arena-textDark border-arena-border'
              ]"
            >
              #{{ player.number }}
            </span>

            <!-- Instant Kick Player Button (Streamer Direct Tool) -->
            <button
              v-if="isControllerMode"
              type="button"
              class="w-5 h-5 rounded-full bg-neutral-900 hover:bg-red-900 border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-white text-[10px] flex items-center justify-center transition-colors opacity-70 group-hover/card:opacity-100 shrink-0"
              :title="t('kickTooltip')"
              @click.stop="$emit('kickPlayer', player.number)"
            >
              ✕
            </button>
          </div>

          <!-- Status badge or Revivable tag -->
          <div class="flex items-center gap-1">
            <span
              v-if="player.status === 'ELIMINATED' && player.timesRevived === 0"
              class="px-1.5 py-0.5 rounded-md bg-amber-950 border border-amber-500/80 text-amber-300 font-cairo font-bold text-[9px] animate-pulse"
            >
              {{ t('canBeRevivedBadge') }}
            </span>
            <GamerBadge :status="player.status" size="xs" />
          </div>
        </div>

        <!-- Player Avatar & Name -->
        <div class="flex items-center gap-2 my-1">
          <div class="relative shrink-0">
            <img
              :src="player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`"
              :alt="player.displayName"
              class="w-8 h-8 rounded-full bg-arena-dark border border-arena-borderLight object-cover shadow-sm shrink-0"
            />
            <div
              v-if="activePlayerNumber === player.number"
              class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-arena-crimson rounded-full animate-ping border border-white"
            />
          </div>

          <div class="overflow-hidden min-w-0 flex-1">
            <div class="font-cairo font-bold text-xs text-arena-textMain truncate">
              {{ player.displayName }}
            </div>
            <div class="text-[10px] font-tajawal text-arena-textDark truncate">
              @{{ player.username }}
            </div>
          </div>
        </div>

        <!-- Kills & Stats Counter -->
        <div class="flex items-center justify-between text-[10px] font-cairo text-arena-textDark pt-1.5 mt-1 border-t border-arena-border/50">
          <span>{{ t('kills') }} <strong class="text-arena-crimson font-bold">{{ player.killsCount || 0 }}</strong></span>
          <div class="flex items-center gap-1">
            <!-- Revive power badge for alive contenders -->
            <span
              v-if="player.status === 'ALIVE' || player.status === 'REVIVED'"
              :class="[
                'text-[9px] font-bold px-1.5 py-0.2 rounded-full border',
                (player.revivesUsed || 0) === 0
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 opacity-75'
              ]"
            >
              {{ (player.revivesUsed || 0) === 0 ? t('reviveAvailableBadge') : t('reviveUsedBadge') }}
            </span>
            <span v-if="player.timesRevived > 0" class="text-emerald-400 font-bold text-[9px]">{{ t('revivedBadge') }}</span>
          </div>
        </div>

        <!-- Manual Action Buttons when waiting for action -->
        <div
          v-if="isControllerMode && waitingAction && activePlayerNumber !== player.number"
          class="mt-1.5 pt-1.5 border-t border-arena-border/50 flex items-center gap-1.5"
        >
          <button
            v-if="player.status === 'ALIVE' || player.status === 'REVIVED'"
            type="button"
            class="w-full py-1 text-[11px] font-cairo font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white rounded-full transition-all shadow-glow-crimson"
            @click="$emit('killPlayer', player.number)"
          >
            {{ t('eliminateBtn') }}
          </button>
          <button
            v-else-if="player.status === 'ELIMINATED' && player.timesRevived === 0"
            type="button"
            class="w-full py-1 text-[11px] font-cairo font-bold bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-slate-900 rounded-full transition-all shadow-glow-gold"
            @click="$emit('revivePlayer', player.number)"
          >
            {{ t('reviveBtn') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
