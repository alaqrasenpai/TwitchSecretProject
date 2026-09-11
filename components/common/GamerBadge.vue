<script setup lang="ts">
import type { PlayerStatus } from '~/types/game';
import { useTranslation } from '~/composables/useTranslation';

const props = withDefaults(
  defineProps<{
    status?: PlayerStatus | 'ADMIN' | 'STREAMER' | 'LIVE' | 'OFFLINE' | 'FEATURED' | 'FREE';
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
  }>(),
  {
    size: 'sm'
  }
);

const { t } = useTranslation();

const badgeConfig = computed(() => {
  switch (props.status) {
    case 'ALIVE':
      return {
        label: props.label || t('alive'),
        classes: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
        dot: 'bg-emerald-400 animate-pulse'
      };
    case 'ELIMINATED':
      return {
        label: props.label || t('eliminated'),
        classes: 'bg-slate-900/80 border-slate-700 text-slate-400 line-through opacity-70',
        dot: 'bg-slate-500'
      };
    case 'REVIVED':
      return {
        label: props.label || t('revived'),
        classes: 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-glow-gold animate-pulse',
        dot: 'bg-amber-400'
      };
    case 'LIVE':
      return {
        label: props.label || 'LIVE',
        classes: 'bg-red-950/90 border-arena-crimson text-red-200 shadow-glow-crimson animate-pulse',
        dot: 'bg-arena-crimson'
      };
    case 'STREAMER':
      return {
        label: props.label || 'STREAMER',
        classes: 'bg-arena-cardLight border-arena-borderLight text-arena-neon',
        dot: 'bg-arena-neon'
      };
    case 'FEATURED':
      return {
        label: props.label || 'HOT 🔥',
        classes: 'bg-gradient-to-r from-red-950/90 to-rose-950/90 border-red-500/60 text-red-200 shadow-glow-crimson',
        dot: 'bg-red-400'
      };
    case 'FREE':
      return {
        label: props.label || 'FREE',
        classes: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
        dot: 'bg-emerald-400'
      };
    default:
      return {
        label: props.label || 'STATUS',
        classes: 'bg-arena-cardLight border-arena-border text-arena-textMain',
        dot: 'bg-arena-textMuted'
      };
  }
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 font-cairo font-bold border rounded-full select-none whitespace-nowrap shrink-0',
      badgeConfig.classes,
      size === 'xs' && 'px-1.5 py-0.5 text-[9px] leading-none',
      size === 'sm' && 'px-2 py-0.5 text-[10px] leading-tight',
      size === 'md' && 'px-2.5 py-1 text-xs',
      size === 'lg' && 'px-3.5 py-1.5 text-sm'
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full shrink-0', badgeConfig.dot]" />
    <span class="truncate">{{ badgeConfig.label }}</span>
  </span>
</template>
