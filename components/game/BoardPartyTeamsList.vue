<script setup lang="ts">
import type { IPlayer, IBoardPartyState, TeamId } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';

const props = defineProps<{
  players: IPlayer[];
  boardState?: IBoardPartyState | null;
}>();

const { t, isRtl } = useTranslation();

const activeTeamTab = ref<TeamId | 'ALL'>('ALL');

const teamsData = computed(() => {
  if (!props.boardState?.teams) return [];
  return [
    props.boardState.teams.crimson,
    props.boardState.teams.cobalt,
    props.boardState.teams.emerald,
    props.boardState.teams.amber
  ].filter((t) => t && t.enabled !== false);
});

function getTeamPlayers(teamId: TeamId) {
  return props.players.filter((p) => p.team === teamId);
}

const filteredPlayers = computed(() => {
  if (activeTeamTab.value === 'ALL') return props.players;
  return props.players.filter((p) => p.team === activeTeamTab.value);
});
</script>

<template>
  <div class="flex flex-col h-full space-y-3 overflow-hidden">
    <!-- 4 Teams Summary Cards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
      <template v-for="team in teamsData" :key="team.id">
        <div
          :class="[
            'p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer shadow-sm',
            team.id === 'crimson' ? 'bg-red-950/40 border-red-500/50 hover:border-red-400' : '',
            team.id === 'cobalt' ? 'bg-blue-950/40 border-blue-500/50 hover:border-blue-400' : '',
            team.id === 'emerald' ? 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400' : '',
            team.id === 'amber' ? 'bg-amber-950/40 border-amber-500/50 hover:border-amber-400' : '',
            activeTeamTab === team.id ? 'ring-2 ring-white shadow-lg scale-102' : ''
          ]"
          @click="activeTeamTab = activeTeamTab === team.id ? 'ALL' : team.id"
        >
          <!-- Team Header -->
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-base">{{ team.icon }}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-slate-300">
              #{{ team.tileIndex }}
            </span>
          </div>

          <!-- Team Name -->
          <div class="font-cairo font-black text-xs text-white truncate">
            {{ isRtl ? team.nameAr : team.nameEn }}
          </div>

          <!-- Team Stats: Coins & Trophies -->
          <div class="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-bold">
            <span class="text-amber-400">🪙 {{ team.coins }}</span>
            <span class="text-yellow-400">🏆 {{ team.trophies }}</span>
          </div>

          <!-- Member count -->
          <div class="mt-1 text-[10px] font-tajawal text-slate-400 text-center">
            {{ getTeamPlayers(team.id).length }} {{ isRtl ? 'لاعب' : 'players' }}
          </div>
        </div>
      </template>
    </div>

    <!-- Players Roster List -->
    <div class="flex-1 flex flex-col min-h-0 bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
      <!-- Roster Header -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-800/60 shrink-0 text-xs">
        <div class="font-cairo font-bold text-slate-300 flex items-center gap-1.5">
          <span>👥</span>
          <span>{{ isRtl ? 'قائمة أعضاء الفرق' : 'Team Roster' }} ({{ filteredPlayers.length }})</span>
        </div>
        <button
          v-if="activeTeamTab !== 'ALL'"
          type="button"
          class="text-[10px] text-cyan-400 hover:underline"
          @click="activeTeamTab = 'ALL'"
        >
          {{ isRtl ? 'عرض الكل' : 'Show All' }}
        </button>
      </div>

      <!-- Scrollable List -->
      <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-2 min-h-0">
        <template v-if="filteredPlayers.length > 0">
          <div
            v-for="player in filteredPlayers"
            :key="player.id"
            :class="[
              'flex items-center justify-between p-2 rounded-lg border text-xs transition-colors',
              player.team === 'crimson' ? 'bg-red-950/20 border-red-500/30' : '',
              player.team === 'cobalt' ? 'bg-blue-950/20 border-blue-500/30' : '',
              player.team === 'emerald' ? 'bg-emerald-950/20 border-emerald-500/30' : '',
              player.team === 'amber' ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/20 border-slate-800'
            ]"
          >
            <!-- Player Info -->
            <div class="flex items-center gap-2 min-w-0">
              <img
                :src="player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`"
                class="w-6 h-6 rounded-full border border-slate-700 shrink-0"
              />
              <div class="truncate">
                <div class="font-cairo font-bold text-white truncate">
                  {{ player.displayName }}
                </div>
                <div class="text-[10px] font-mono text-slate-400">
                  @{{ player.username }}
                </div>
              </div>
            </div>

            <!-- Team Tag -->
            <div class="shrink-0 flex items-center gap-1">
              <span v-if="player.team === 'crimson'" class="text-xs">🔴</span>
              <span v-else-if="player.team === 'cobalt'" class="text-xs">🔵</span>
              <span v-else-if="player.team === 'emerald'" class="text-xs">🟢</span>
              <span v-else-if="player.team === 'amber'" class="text-xs">🟡</span>
            </div>
          </div>
        </template>
        <div v-else class="h-32 flex flex-col items-center justify-center text-slate-500 text-xs font-tajawal">
          <span>🎮 {{ isRtl ? 'لم ينضم أي لاعب بعد' : 'No players joined yet' }}</span>
          <span class="text-[10px] mt-1">{{ isRtl ? 'اكتب !join في الشات للمشاركة' : 'Type !join in chat to participate' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
