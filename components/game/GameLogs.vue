<script setup lang="ts">
import type { IGameLog } from '~/types/game';
import { useTranslation, formatGameLog } from '~/composables/useTranslation';

const props = defineProps<{
  logs: IGameLog[];
}>();

const { t, isRtl } = useTranslation();

function formatLogMessage(log: IGameLog): string {
  return formatGameLog(log, isRtl.value);
}

function getBadgeStyle(type: string) {
  switch (type) {
    case 'KILL':
      return 'bg-red-950 text-red-300 border-red-600';
    case 'REVIVE':
      return 'bg-amber-950 text-amber-300 border-amber-500';
    case 'SPIN':
      return 'bg-cyan-950 text-cyan-300 border-cyan-600';
    case 'WIN':
      return 'bg-yellow-950 text-yellow-300 border-yellow-500 font-bold';
    case 'JOIN':
      return 'bg-emerald-950 text-emerald-300 border-emerald-600';
    case 'TIMEOUT':
      return 'bg-neutral-900 text-neutral-400 border-neutral-700';
    default:
      return 'bg-arena-cardLight text-arena-textMuted border-arena-border';
  }
}
</script>

<template>
  <div class="h-64 overflow-y-auto space-y-2 pr-1 font-mono text-xs" :dir="isRtl ? 'rtl' : 'ltr'">
    <div
      v-for="log in logs"
      :key="log.id"
      class="p-2.5 bg-arena-dark/90 border border-arena-border/80 rounded-xl flex items-start gap-2.5 transition-all hover:border-arena-crimson/40"
    >
      <span
        :class="[
          'px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border shrink-0',
          getBadgeStyle(log.type)
        ]"
      >
        {{ log.type }}
      </span>

      <div class="flex-1 text-arena-textMain leading-relaxed break-words font-tajawal text-xs">
        {{ formatLogMessage(log) }}
      </div>

      <span class="text-[10px] text-arena-textDark shrink-0">
        {{ new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
      </span>
    </div>

    <div v-if="logs.length === 0" class="text-center py-8 text-arena-textDark italic font-tajawal">
      {{ t('noLogsYet') }}
    </div>
  </div>
</template>
