<script setup lang="ts">
import { useAudioSfx } from '~/composables/useAudioSfx';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'crimson' | 'danger' | 'warning' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    playSound?: boolean;
    rounded?: 'full' | 'xl' | '2xl';
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
    playSound: true,
    rounded: 'full'
  }
);

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const { playWheelTick } = useAudioSfx();

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return;
  if (props.playSound) {
    playWheelTick(1.2);
  }
  emit('click', event);
}

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
    case 'crimson':
      return 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-glow-crimson hover:shadow-glow-crimson-lg hover:brightness-110 border border-indigo-400/40';
    case 'secondary':
      return 'bg-arena-cardLight/80 text-arena-textMain border border-arena-borderLight hover:border-indigo-500/60 hover:bg-arena-cardHover shadow-arena-card';
    case 'danger':
      return 'bg-gradient-to-r from-rose-700 to-red-900 text-red-100 shadow-glow-blood hover:brightness-110 border border-rose-500/30';
    case 'warning':
      return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-glow-gold hover:brightness-110 border border-cyan-300/40';
    case 'ghost':
      return 'bg-transparent text-arena-textMuted hover:text-white hover:bg-arena-cardLight/50 border border-transparent';
    default:
      return '';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-4 py-1.5 text-xs font-semibold';
    case 'md':
      return 'px-6 py-2.5 text-sm font-bold';
    case 'lg':
      return 'px-8 py-3.5 text-base font-extrabold tracking-wide';
    case 'xl':
      return 'px-10 py-4 text-lg font-black tracking-wide';
    default:
      return '';
  }
});

const roundedClasses = computed(() => {
  switch (props.rounded) {
    case 'full':
      return 'rounded-full';
    case '2xl':
      return 'rounded-2xl';
    default:
      return 'rounded-xl';
  }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'group relative inline-flex items-center justify-center gap-2 select-none transition-all duration-300 cursor-pointer font-cairo',
      variantClasses,
      sizeClasses,
      roundedClasses,
      disabled ? 'opacity-40 cursor-not-allowed filter grayscale pointer-events-none' : 'active:scale-95 hover:-translate-y-0.5'
    ]"
    @click="handleClick"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>

    <slot />
  </button>
</template>
