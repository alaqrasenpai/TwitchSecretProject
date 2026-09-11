<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';

const { isRtl } = useTranslation();
</script>

<template>
  <div class="min-h-screen bg-arena-bg text-arena-textMain font-sans flex flex-col select-none overflow-x-hidden" :dir="isRtl ? 'rtl' : 'ltr'">
    <slot />
  </div>
</template>
