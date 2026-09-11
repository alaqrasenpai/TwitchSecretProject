<script setup lang="ts">
import type { IGameLog } from '~/types/game';
import { useTranslation, formatGameLog } from '~/composables/useTranslation';

const props = defineProps<{
  latestLog: IGameLog | null;
}>();

const { t, isRtl } = useTranslation();
const activeEvent = ref<IGameLog | null>(null);
const isVisible = ref(false);
let dismissTimer: any = null;

watch(
  () => props.latestLog?.id,
  () => {
    const log = props.latestLog;
    if (!log) return;

    if (log.type === 'KILL' || log.type === 'REVIVE') {
      activeEvent.value = log;
      isVisible.value = true;

      if (dismissTimer) clearTimeout(dismissTimer);
      dismissTimer = setTimeout(() => {
        isVisible.value = false;
      }, 4000);
    }
  }
);

onUnmounted(() => {
  if (dismissTimer) clearTimeout(dismissTimer);
});
</script>

<template>
  <div
    v-if="isVisible && activeEvent"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md pointer-events-auto select-none p-4"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <Transition
      appear
      enter-active-class="transform transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-75 blur-sm"
      enter-to-class="opacity-100 scale-100 blur-0"
      leave-active-class="transform transition-all duration-400 ease-in"
      leave-from-class="opacity-100 scale-100 blur-0"
      leave-to-class="opacity-0 scale-90 blur-sm"
    >
      <div class="max-w-xl w-[92vw]">
        <!-- ELIMINATION BANNER -->
        <div
          v-if="activeEvent.type === 'KILL'"
          class="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-neutral-950 via-red-950 to-neutral-950 border-2 border-arena-crimson shadow-[0_0_50px_rgba(239,68,68,0.8)] backdrop-blur-2xl flex items-center justify-between gap-4 overflow-hidden"
        >
          <!-- Ambient pulsing red laser glow -->
          <div class="absolute inset-0 bg-red-600/15 animate-pulse pointer-events-none" />

          <div class="flex items-center gap-4 relative z-10">
            <div class="w-14 h-14 rounded-2xl bg-red-900/90 border-2 border-red-500 flex items-center justify-center text-3xl shadow-glow-crimson shrink-0 animate-bounce">
              💀
            </div>
            <div>
              <div class="font-cairo font-black text-xs uppercase tracking-widest text-arena-crimson flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{{ isRtl ? 'استبعاد في الساحة 💥' : 'ELIMINATION CONFIRMED 💥' }}</span>
              </div>
              <div class="font-cairo font-black text-lg sm:text-xl text-white mt-0.5">
                <span class="text-red-400">{{ activeEvent.actor }}</span>
                <span class="text-neutral-300 font-normal px-2">{{ isRtl ? 'استبعد' : 'eliminated' }}</span>
                <span class="text-white line-through decoration-red-500 decoration-2">{{ activeEvent.target }}</span>
              </div>
            </div>
          </div>

          <div class="hidden sm:flex flex-col items-end relative z-10 shrink-0">
            <span class="px-3.5 py-1.5 bg-red-950 border border-red-500 text-red-300 text-xs font-mono font-black rounded-full shadow-glow-crimson">
              K.O.
            </span>
          </div>
        </div>

        <!-- REVIVAL BANNER -->
        <div
          v-else-if="activeEvent.type === 'REVIVE'"
          class="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-neutral-950 via-amber-950/95 to-neutral-950 border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.8)] backdrop-blur-2xl flex items-center justify-between gap-4 overflow-hidden"
        >
          <!-- Ambient pulsing gold aura glow -->
          <div class="absolute inset-0 bg-amber-500/15 animate-pulse pointer-events-none" />

          <div class="flex items-center gap-4 relative z-10">
            <div class="w-14 h-14 rounded-2xl bg-amber-900/90 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-glow-gold shrink-0 animate-pulse">
              ✨
            </div>
            <div>
              <div class="font-cairo font-black text-xs uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{{ isRtl ? 'إنعاش وعودة للعبة ✨' : 'HEROIC REVIVAL ✨' }}</span>
              </div>
              <div class="font-cairo font-black text-lg sm:text-xl text-white mt-0.5">
                <span class="text-amber-300 font-bold">{{ activeEvent.actor }}</span>
                <span class="text-neutral-300 font-normal px-2">{{ isRtl ? 'أنعش وأعاد' : 'revived' }}</span>
                <span class="text-emerald-400 font-black underline decoration-amber-400 decoration-2">{{ activeEvent.target }}</span>
              </div>
            </div>
          </div>

          <div class="hidden sm:flex flex-col items-end relative z-10 shrink-0">
            <span class="px-3.5 py-1.5 bg-amber-950 border border-amber-500 text-amber-300 text-xs font-mono font-black rounded-full shadow-glow-gold">
              REVIVED
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
