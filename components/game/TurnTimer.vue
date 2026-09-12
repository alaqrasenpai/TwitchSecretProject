<script setup lang="ts">
import { useAudioSfx } from '~/composables/useAudioSfx';
import { useTranslation } from '~/composables/useTranslation';

const props = withDefaults(
  defineProps<{
    timerEndsAt: string | Date | null;
    totalDurationSeconds?: number;
    durationSeconds?: number;
    active?: boolean;
  }>(),
  {
    totalDurationSeconds: 15,
    active: true
  }
);

const emit = defineEmits<{
  (e: 'timeout'): void;
}>();

const { playCountdownPulse } = useAudioSfx();
const { t, isRtl } = useTranslation();

const effectiveDuration = computed(() => {
  if (props.durationSeconds !== undefined) return props.durationSeconds;
  return props.totalDurationSeconds || 15;
});

const isUnlimited = computed(() => effectiveDuration.value === 0);

const timeLeftSeconds = ref(effectiveDuration.value);
let intervalId: any = null;
let lastPlayedSecond = -1;

const progressPercent = computed(() => {
  if (isUnlimited.value) return 100;
  if (effectiveDuration.value <= 0) return 100;
  return Math.max(0, Math.min(100, (timeLeftSeconds.value / effectiveDuration.value) * 100));
});

const isWarning = computed(() => !isUnlimited.value && timeLeftSeconds.value <= 5 && timeLeftSeconds.value > 0);
const isUrgent = computed(() => !isUnlimited.value && timeLeftSeconds.value <= 3 && timeLeftSeconds.value > 0);

watch(
  () => props.timerEndsAt,
  () => {
    lastPlayedSecond = -1;
    updateTime();
  }
);

watch(
  effectiveDuration,
  (newDur) => {
    if (isUnlimited.value) {
      timeLeftSeconds.value = 0;
    } else if (!props.timerEndsAt) {
      timeLeftSeconds.value = newDur;
    }
  }
);

onMounted(() => {
  updateTime();
  intervalId = setInterval(updateTime, 200);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

function updateTime() {
  if (isUnlimited.value) {
    timeLeftSeconds.value = 0;
    return;
  }

  if (!props.timerEndsAt || !props.active) {
    timeLeftSeconds.value = effectiveDuration.value;
    return;
  }

  const endMs = new Date(props.timerEndsAt).getTime();
  const nowMs = Date.now();
  const diffSecs = Math.max(0, (endMs - nowMs) / 1000);

  timeLeftSeconds.value = Math.ceil(diffSecs);

  const currentSec = Math.floor(diffSecs);
  if (currentSec <= 5 && currentSec > 0 && currentSec !== lastPlayedSecond) {
    lastPlayedSecond = currentSec;
    playCountdownPulse(currentSec === 1);
  }

  if (diffSecs <= 0 && lastPlayedSecond !== 0) {
    lastPlayedSecond = 0;
    emit('timeout');
  }
}
</script>

<template>
  <div
    :class="[
      'relative p-5 bg-arena-card/95 border transition-all duration-300 backdrop-blur-xl rounded-2xl shadow-arena-card',
      isUrgent
        ? 'border-arena-crimson shadow-glow-crimson-lg bg-red-950/60 animate-pulse'
        : isWarning
        ? 'border-arena-crimson shadow-glow-crimson bg-red-950/40'
        : 'border-arena-border'
    ]"
  >
    <div class="flex items-center justify-between mb-2.5">
      <span class="font-cairo font-black text-xs text-arena-textMuted flex items-center gap-2">
        <span
          :class="[
            'w-2.5 h-2.5 rounded-full',
            isWarning ? 'bg-arena-crimson animate-ping' : 'bg-arena-neon'
          ]"
        />
        {{ t('turnTimerCountdown') }}
      </span>
      <span
        :class="[
          'font-cairo font-black text-2xl',
          isUrgent ? 'text-arena-crimson text-glow-crimson' : isWarning ? 'text-red-300' : 'text-white'
        ]"
      >
        <template v-if="isUnlimited">
          {{ isRtl ? '♾️ غير محدود' : '♾️ Unlimited' }}
        </template>
        <template v-else>
          {{ String(timeLeftSeconds).padStart(2, '0') }} {{ t('secondsRemaining') }}
        </template>
      </span>
    </div>

    <!-- Rounded Progress Bar -->
    <div class="w-full h-3 bg-arena-dark rounded-full overflow-hidden border border-arena-border p-[1px]">
      <div
        :class="[
          'h-full rounded-full transition-all duration-200',
          isUrgent
            ? 'bg-gradient-to-r from-red-600 to-rose-700 shadow-glow-crimson'
            : isWarning
            ? 'bg-gradient-to-r from-amber-400 to-red-500 shadow-glow-crimson'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
        ]"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
  </div>
</template>
