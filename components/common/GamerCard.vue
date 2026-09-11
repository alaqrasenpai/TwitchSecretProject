<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    glow?: boolean;
    headerBorder?: boolean;
    rounded?: 'xl' | '2xl' | '3xl';
  }>(),
  {
    glow: false,
    headerBorder: true,
    rounded: '2xl'
  }
);
</script>

<template>
  <div
    :class="[
      'relative bg-arena-card/90 border border-arena-border/80 transition-all duration-300 backdrop-blur-xl shadow-arena-card',
      rounded === '3xl' ? 'rounded-3xl' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl',
      glow && 'shadow-glow-crimson border-arena-crimson/50'
    ]"
  >
    <!-- Top glowing crimson subtle accent line -->
    <div class="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-arena-crimson/40 to-transparent pointer-events-none" />

    <!-- Card Header -->
    <div
      v-if="title || $slots.header || $slots.actions"
      :class="[
        'flex items-center justify-between px-6 py-4',
        headerBorder && 'border-b border-arena-border/60'
      ]"
    >
      <div class="flex items-center gap-3">
        <slot name="header-icon" />
        <div>
          <h3 v-if="title" class="font-cairo font-black text-lg text-white flex items-center gap-2">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-xs text-arena-textDark font-tajawal">
            {{ subtitle }}
          </p>
        </div>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-6">
      <slot />
    </div>

    <!-- Card Footer -->
    <div
      v-if="$slots.footer"
      class="px-6 py-4 border-t border-arena-border/60 bg-arena-dark/60 rounded-b-2xl flex items-center justify-between"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
