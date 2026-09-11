<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';

const props = withDefaults(
  defineProps<{
    value: number | null;
    isRolling: boolean;
    teamColor?: string;
    canRoll?: boolean;
    activeTeamName?: string;
    timeRemaining?: number;
    disabledReason?: string;
  }>(),
  {
    value: null,
    isRolling: false,
    teamColor: '#ef4444',
    canRoll: false,
    activeTeamName: '',
    timeRemaining: 15,
    disabledReason: ''
  }
);

const emit = defineEmits<{
  (e: 'roll'): void;
}>();

const { t, isRtl } = useTranslation();

// Temporary rolling visual number while rolling
const animatedDisplayValue = ref(1);
let rollTimer: any = null;

watch(
  () => props.isRolling,
  (rolling) => {
    if (rolling) {
      rollTimer = setInterval(() => {
        animatedDisplayValue.value = Math.floor(Math.random() * 6) + 1;
      }, 70);
    } else {
      if (rollTimer) clearInterval(rollTimer);
      if (props.value) {
        animatedDisplayValue.value = props.value;
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (rollTimer) clearInterval(rollTimer);
});

// Pip configurations for 1..6
const pipsMap: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]]
};

const currentPips = computed(() => {
  const val = props.isRolling ? animatedDisplayValue.value : (props.value || 1);
  return pipsMap[val] || pipsMap[1];
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 select-none">
    <!-- Dice Box Container -->
    <div class="relative group">
      <!-- Ambient Team Glow -->
      <div
        class="absolute -inset-2 rounded-2xl blur-xl opacity-60 transition-all duration-500"
        :style="{
          backgroundColor: teamColor,
          opacity: isRolling ? '0.9' : '0.4'
        }"
      />

      <!-- 3D Neon Dice Cube -->
      <div
        :class="[
          'relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-950 to-black border-2 transition-all duration-300 flex items-center justify-center shadow-2xl',
          isRolling ? 'animate-bounce scale-105 border-white' : 'border-slate-700 hover:scale-102',
          canRoll ? 'cursor-pointer hover:border-amber-400' : ''
        ]"
        :style="{
          borderColor: isRolling ? '#ffffff' : teamColor,
          boxShadow: `0 0 25px ${teamColor}40`
        }"
        @click="canRoll && !isRolling ? emit('roll') : null"
      >
        <!-- 3x3 Grid for Realistic Dice Pips -->
        <div class="w-16 h-16 sm:w-20 sm:h-20 grid grid-cols-3 grid-rows-3 gap-1 p-1">
          <template v-for="r in [0, 1, 2]" :key="r">
            <template v-for="c in [0, 1, 2]" :key="c">
              <div class="flex items-center justify-center">
                <div
                  v-if="currentPips.some(([pr, pc]) => pr === r && pc === c)"
                  :class="[
                    'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-[0_0_8px_currentColor] transition-all transform',
                    isRolling ? 'scale-110' : 'scale-100'
                  ]"
                  :style="{
                    backgroundColor: teamColor,
                    color: teamColor
                  }"
                />
              </div>
            </template>
          </template>
        </div>

        <!-- Glass Gloss Effect -->
        <div class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-white/5 pointer-events-none" />
      </div>
    </div>

    <!-- Active Roll / Result Label -->
    <div class="text-center">
      <div v-if="isRolling" class="text-xs font-mono font-bold text-amber-300 animate-pulse">
        🎲 {{ isRtl ? 'جاري رمي النرد التكتيكي...' : 'Rolling Tactical Dice...' }}
      </div>
      <div v-else-if="value !== null" class="flex items-center justify-center gap-2">
        <span class="text-xs font-tajawal text-slate-400">{{ isRtl ? 'النتيجة:' : 'Result:' }}</span>
        <span class="text-xl font-black font-cairo text-white px-2.5 py-0.5 rounded-lg bg-black/60 border border-slate-700 shadow-md">
          +{{ value }}
        </span>
      </div>
      <div v-else class="text-xs font-tajawal text-slate-400">
        {{ isRtl ? 'اكتب !roll في الشات أو اضغط للرمي' : 'Type !roll in chat or click to roll' }}
      </div>
    </div>

    <!-- Roll Action Button for Streamer / Host -->
    <button
      v-if="canRoll"
      type="button"
      :disabled="isRolling"
      :style="{
        backgroundColor: `${teamColor}25`,
        borderColor: teamColor,
        color: '#ffffff'
      }"
      class="px-6 py-2 rounded-xl border-2 font-cairo font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      @click="emit('roll')"
    >
      <span class="text-base">🎲</span>
      <span>{{ isRtl ? 'رمي النرد الآن' : 'Roll Dice Now' }}</span>
    </button>
  </div>
</template>
