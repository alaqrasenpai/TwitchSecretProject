<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useAudioSfx } from '~/composables/useAudioSfx';
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';

const route = useRoute();
const authStore = useAuthStore();
const { isMuted } = useAudioSfx();
const { t, locale, toggleLocale, isRtl } = useTranslation();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-arena-bg text-arena-textMain font-sans" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Top ChatWar Navigation Bar -->
    <header class="sticky top-0 z-50 bg-arena-dark/90 backdrop-blur-xl border-b border-arena-border/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3.5 group flex-shrink-0">
          <div class="w-11 h-11 bg-gradient-to-tr from-indigo-900 via-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-glow-crimson group-hover:scale-105 transition-transform border border-indigo-400/40">
            <span class="font-display font-black text-white text-xl tracking-tighter">CW</span>
          </div>
          <div>
            <div class="font-display font-black text-2xl tracking-wider text-white flex items-center">
              <span>CHAT</span><span class="text-arena-crimson text-glow-crimson">WAR</span>
            </div>
            <div class="text-[11px] font-tajawal text-arena-textDark hidden sm:block">
              {{ t('brandTagline') }}
            </div>
          </div>
        </NuxtLink>

        <!-- Center Nav Links -->
        <nav class="hidden md:flex items-center gap-2 lg:gap-3 font-cairo font-bold text-xs lg:text-sm bg-black/40 p-1.5 rounded-2xl border border-arena-border/60">
          <!-- Home -->
          <NuxtLink
            to="/"
            :class="[
              'transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
              route.path === '/'
                ? 'text-white bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            ]"
          >
            <span>🏠</span>
            <span>{{ t('home') }}</span>
          </NuxtLink>

          <!-- Mini Games (القديمة / السريعة) -->
          <NuxtLink
            to="/dashboard?type=mini"
            :class="[
              'transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
              route.path === '/dashboard' && route.query.type === 'mini'
                ? 'text-white bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
            ]"
          >
            <span>🎮</span>
            <span>{{ t('miniGames') }}</span>
          </NuxtLink>

          <!-- All Games -->
          <NuxtLink
            to="/dashboard"
            :class="[
              'transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
              route.path === '/dashboard' && !route.query.type
                ? 'text-white bg-arena-crimson shadow-glow-crimson'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            ]"
          >
            <span>⚡</span>
            <span>{{ t('allGames') }}</span>
          </NuxtLink>
        </nav>

        <!-- Right User & Action Buttons -->
        <div class="flex items-center gap-3">
          <!-- Language Switcher Pill -->
          <button
            type="button"
            class="px-3.5 py-2 rounded-full bg-arena-card border border-arena-border text-xs font-cairo font-bold text-arena-textMuted hover:text-white hover:border-arena-crimson/50 transition-all flex items-center gap-1.5 shadow-sm"
            @click="toggleLocale"
          >
            <span>🌐</span>
            <span>{{ locale === 'en' ? 'عربي' : 'English' }}</span>
          </button>

          <!-- Audio Toggle -->
          <button
            type="button"
            class="p-2.5 rounded-full bg-arena-card border border-arena-border text-arena-textMuted hover:text-white hover:border-arena-crimson/50 transition-all text-xs font-tajawal"
            :title="isMuted ? 'Unmute Audio' : 'Mute Audio'"
            @click="isMuted = !isMuted"
          >
            <span v-if="isMuted" class="text-red-400">🔇 {{ t('sfxMuted') }}</span>
            <span v-else class="text-arena-neon">🔊 {{ t('sfxOn') }}</span>
          </button>

          <!-- Browse Games Button -->
          <NuxtLink to="/dashboard">
            <GamerButton size="sm" variant="primary" rounded="full">
              <span>{{ t('games') }}</span>
              <span :class="isRtl ? 'rotate-180' : ''">→</span>
            </GamerButton>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-arena-border/40 bg-arena-dark/70 py-8 text-center text-xs font-tajawal text-arena-textDark">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-cairo font-black text-base text-white">ChatWar</span>
          <span>• {{ t('brandTagline') }}</span>
        </div>

        <div class="flex items-center gap-2 text-arena-textMuted font-medium">
          <span>{{ t('developedBy') }}</span>
          <a
            href="https://alaqra.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="font-cairo font-bold text-arena-crimson hover:text-indigo-300 underline-offset-4 hover:underline transition-colors flex items-center gap-1 bg-arena-cardLight/60 px-2.5 py-1 rounded-md border border-indigo-500/20"
          >
            <span>Alaqra.dev</span>
            <span class="text-[10px]">↗</span>
          </a>
        </div>

        <div class="flex items-center gap-6 text-arena-textMuted">
          <NuxtLink to="/dashboard" class="hover:text-arena-crimson">{{ t('games') }}</NuxtLink>
          <span>Twitch IRC Gaming Engine</span>
        </div>
      </div>
    </footer>
  </div>
</template>
