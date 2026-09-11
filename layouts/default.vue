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
  <div class="min-h-screen flex flex-col bg-[#07080d] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Ambient Background Lighting Orbs (Liquid Cyber Glows) -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
      <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px]" />
      <div class="absolute -bottom-20 left-1/3 w-[650px] h-[650px] bg-cyan-600/8 rounded-full blur-[150px]" />
      <!-- Subtle Tech Grid Lines Overlay -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
    </div>

    <!-- Floating Island Navigation Bar -->
    <div class="sticky top-0 z-50 pt-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all">
      <header class="relative bg-[#0d111c]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.15)] px-4 sm:px-6 h-18 flex items-center justify-between transition-all">
        <!-- Logo Brand -->
        <NuxtLink to="/" class="flex items-center gap-3 group flex-shrink-0">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] transition-all">
            <div class="w-full h-full bg-[#0d111c] rounded-2xl flex items-center justify-center">
              <span class="font-display font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-300 via-white to-cyan-300 text-lg tracking-tighter">
                CW
              </span>
            </div>
          </div>
          <div>
            <div class="font-display font-black text-xl tracking-wider text-white flex items-center leading-none">
              <span>CHAT</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">WAR</span>
            </div>
            <div class="text-[10px] font-tajawal text-slate-400 hidden sm:flex items-center gap-1.5 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{{ t('brandTagline') }}</span>
            </div>
          </div>
        </NuxtLink>

        <!-- Center Nav Capsules -->
        <nav class="hidden md:flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/5 font-cairo font-bold text-xs">
          <!-- Home -->
          <NuxtLink
            to="/"
            :class="[
              'transition-all duration-200 flex items-center gap-1.5 px-4 py-2 rounded-xl cursor-pointer',
              route.path === '/'
                ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            ]"
          >
            <span>🏠</span>
            <span>{{ t('home') }}</span>
          </NuxtLink>

          <!-- Quick Games Showcase -->
          <NuxtLink
            to="/dashboard?type=mini"
            :class="[
              'transition-all duration-200 flex items-center gap-1.5 px-4 py-2 rounded-xl cursor-pointer',
              route.path === '/dashboard' && route.query.type === 'mini'
                ? 'text-white bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-black'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
            ]"
          >
            <span>⚡</span>
            <span>{{ t('miniGames') }}</span>
          </NuxtLink>

          <!-- All Games Library -->
          <NuxtLink
            to="/dashboard"
            :class="[
              'transition-all duration-200 flex items-center gap-1.5 px-4 py-2 rounded-xl cursor-pointer',
              route.path === '/dashboard' && !route.query.type
                ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            ]"
          >
            <span>🎮</span>
            <span>{{ t('allGames') }}</span>
          </NuxtLink>
        </nav>

        <!-- Right Quick Controls -->
        <div class="flex items-center gap-2.5">

          <!-- Language Switcher -->
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-cairo font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            @click="toggleLocale"
          >
            <span>🌐</span>
            <span>{{ locale === 'en' ? 'عربي' : 'English' }}</span>
          </button>

          <!-- Audio Toggle -->
          <button
            type="button"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
            :title="isMuted ? 'Unmute Audio' : 'Mute Audio'"
            @click="isMuted = !isMuted"
          >
            <span v-if="isMuted" class="text-red-400">🔇</span>
            <span v-else class="text-emerald-400">🔊</span>
          </button>

          <!-- Streamer Launch Button -->
          <NuxtLink to="/dashboard">
            <GamerButton
              size="sm"
              variant="primary"
              rounded="xl"
              class="font-black text-xs px-4 py-2 !bg-gradient-to-r !from-indigo-500 !via-purple-500 !to-cyan-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:!brightness-110"
            >
              <span>{{ t('games') }}</span>
              <span :class="isRtl ? 'rotate-180' : ''">→</span>
            </GamerButton>
          </NuxtLink>
        </div>
      </header>
    </div>

    <!-- Main Content Area -->
    <main class="flex-1 relative z-10">
      <slot />
    </main>

    <!-- Refined High-End Studio Footer -->
    <footer class="relative z-10 border-t border-white/10 bg-[#0a0c14]/90 backdrop-blur-xl py-10 mt-16 text-xs font-tajawal text-slate-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-display font-black text-white text-xs">
              CW
            </div>
            <div>
              <div class="font-cairo font-black text-base text-white">ChatWar Engine</div>
              <div class="text-[11px] text-slate-500">Next-Gen Live Twitch & Stream Interactive Arena</div>
            </div>
          </div>

          <!-- Supported Broadcaster Platforms -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="text-[11px] font-cairo text-slate-500">{{ isRtl ? 'متوافق مع:' : 'Certified for:' }}</span>
            <span class="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 font-bold text-[11px]">Twitch 🟣</span>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">Kick 🟢</span>
            <span class="px-2.5 py-1 rounded-lg bg-pink-950/40 border border-pink-500/30 text-pink-300 font-bold text-[11px]">TikTok 🎵</span>
            <span class="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold text-[11px]">OBS Studio 🎥</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div class="text-slate-500">
            © 2026 ChatWar • {{ t('brandTagline') }} • All rights reserved.
          </div>

          <div class="flex items-center gap-2 text-slate-400">
            <span>{{ t('developedBy') }}</span>
            <a
              href="https://alaqra.dev"
              target="_blank"
              rel="noopener noreferrer"
              class="font-cairo font-bold text-indigo-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-colors flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
            >
              <span>Alaqra.dev</span>
              <span class="text-[9px]">↗</span>
            </a>
          </div>

          <div class="flex items-center gap-4 text-slate-400">
            <NuxtLink to="/dashboard" class="hover:text-indigo-400 transition-colors">{{ t('games') }}</NuxtLink>
            <span>•</span>
            <NuxtLink to="/admin/login" class="hover:text-slate-200 transition-colors">Admin Core</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
