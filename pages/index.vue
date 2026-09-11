<script setup lang="ts">
import { useGameStore } from '~/stores/game';
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
import GamerCard from '~/components/common/GamerCard.vue';
import ConfirmModal from '~/components/common/ConfirmModal.vue';
import PlatformConnectModal from '~/components/game/PlatformConnectModal.vue';

const gameStore = useGameStore();
const { t, isRtl } = useTranslation();
const twitchChannelInput = ref('');
const selectedPlatform = ref<'twitch' | 'kick' | 'tiktok'>('twitch');
const isLaunching = ref(false);
const showPlatformModal = ref(false);
const errorModal = ref({
  isOpen: false,
  message: ''
});

const platformsList = [
  { id: 'twitch', name: 'Twitch', icon: '🟣' },
  { id: 'kick', name: 'Kick', icon: '🟢' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' }
];

function quickStartStream(gameType?: string) {
  const channel = twitchChannelInput.value.trim();
  if (!channel) {
    showPlatformModal.value = true;
    return;
  }
  navigateTo({
    path: '/dashboard',
    query: {
      channel,
      platform: selectedPlatform.value,
      ...(gameType ? { gameType } : {})
    }
  });
}

function onModalConnect(platforms: { id: string; channel: string }[]) {
  const chosen = platforms.find((p) => p.channel.trim());
  if (chosen) {
    twitchChannelInput.value = chosen.channel.trim();
    if (['twitch', 'kick', 'tiktok'].includes(chosen.id)) {
      selectedPlatform.value = chosen.id as any;
    }
    showPlatformModal.value = false;
    navigateTo({
      path: '/dashboard',
      query: {
        channel: chosen.channel.trim(),
        platform: chosen.id
      }
    });
  }
}
</script>

<template>
  <div class="space-y-20 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Hero Section (StreamArena Cyber-Tactical Dark Crimson) -->
    <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6 pb-12">
      <!-- Glow Background Orbs -->
      <div class="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute top-1/2 right-10 w-[400px] h-[400px] bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

      <!-- Left Column: Visual Gaming Mockup Showcase (5 cols) -->
      <div class="lg:col-span-6 order-2 lg:order-1 relative flex items-center justify-center">
        <div class="relative w-full max-w-lg flex items-center justify-center gap-4">
          <!-- Mockup Phone 1 (Roulette Wheel) -->
          <div class="w-56 sm:w-64 arena-phone-mockup transform -rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl z-20 border-2 border-indigo-500/30">
            <!-- Top bar -->
            <div class="h-6 bg-black flex items-center justify-center">
              <div class="w-16 h-3 bg-neutral-900 rounded-full" />
            </div>
            <!-- Screen Content -->
            <div class="p-4 bg-gradient-to-b from-arena-card to-arena-dark min-h-[380px] flex flex-col justify-between text-center">
              <div class="flex items-center justify-between text-[10px] font-tajawal text-arena-textDark">
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> LIVE STREAM</span>
                <span class="text-arena-crimson font-bold">CHATWAR</span>
              </div>

              <!-- Mini Roulette Wheel Animation -->
              <div class="my-2 relative flex items-center justify-center">
                <div class="w-36 h-36 rounded-full border-4 border-indigo-500/60 bg-gradient-to-tr from-arena-card to-purple-950/40 flex items-center justify-center shadow-glow-crimson animate-spin-slow">
                  <div class="w-16 h-16 rounded-full bg-black border-2 border-indigo-500 flex items-center justify-center text-xs font-display font-black text-white">
                    CHATWAR
                  </div>
                </div>
              </div>

              <div class="space-y-1.5 p-2.5 bg-black/80 rounded-xl border border-arena-border">
                <div class="text-[11px] font-cairo font-bold text-white">
                  Turn: <span class="text-arena-crimson">Alex_99</span>
                </div>
                <div class="text-[9px] font-tajawal text-arena-textDark">
                  Type in chat: !kill 3
                </div>
              </div>
            </div>
          </div>

          <!-- Mockup Phone 2 (Live Chat Stream) -->
          <div class="w-52 sm:w-60 arena-phone-mockup transform rotate-6 hover:rotate-0 transition-transform duration-500 shadow-xl hidden sm:block -mr-8 z-10 opacity-90 border-2 border-indigo-950">
            <div class="h-6 bg-black flex items-center justify-center">
              <div class="w-16 h-3 bg-neutral-900 rounded-full" />
            </div>
            <div class="p-3 bg-arena-dark min-h-[340px] flex flex-col justify-between">
              <div class="text-xs font-cairo font-bold text-arena-textMuted border-b border-arena-border pb-2 flex items-center justify-between">
                <span>💬 Twitch IRC Chat</span>
                <span class="text-[10px] text-emerald-400">Connected</span>
              </div>
              <div class="space-y-2 text-[10px] font-tajawal text-left py-2">
                <div class="p-1.5 bg-arena-card rounded-lg"><strong class="text-indigo-400">GamerOne:</strong> !join</div>
                <div class="p-1.5 bg-arena-card rounded-lg"><strong class="text-cyan-400">StreamFan:</strong> !join</div>
                <div class="p-1.5 bg-arena-card rounded-lg"><strong class="text-purple-400">Victor:</strong> !kill 2 💥</div>
                <div class="p-1.5 bg-indigo-950/80 rounded-lg border border-indigo-500/30 text-indigo-200">
                  ⚡ Player #2 eliminated!
                </div>
              </div>
              <div class="text-[9px] font-mono text-center text-arena-textDark">
                Zero-lag instant IRC reader
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Hero Typography & Direct Twitch Connect (7 cols) -->
      <div class="lg:col-span-6 order-1 lg:order-2 space-y-6" :class="isRtl ? 'text-right' : 'text-left'">
        <!-- Top Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-arena-cardLight/90 border border-arena-borderLight rounded-full shadow-glow-crimson">
          <span class="w-2 h-2 rounded-full bg-arena-crimson animate-ping" />
          <span class="font-cairo text-xs text-indigo-300 font-bold">
            {{ t('badgeInteractive') }}
          </span>
        </div>

        <!-- Main Title -->
        <h1 class="font-cairo font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.15]">
          {{ t('heroTitleLine1') }} <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-arena-crimson via-red-500 to-amber-500 text-glow-crimson">
            {{ t('heroTitleLine2') }}
          </span>
        </h1>

        <p class="text-lg sm:text-xl text-arena-textMuted font-tajawal max-w-xl leading-relaxed">
          {{ t('heroSubtitle') }}
        </p>

        <!-- Direct Multi-Platform Channel Connect Box -->
        <div class="p-6 bg-[#0e111a]/95 border border-[#27314a] rounded-3xl shadow-2xl backdrop-blur-xl space-y-3.5 max-w-lg">
          <div class="flex items-center justify-between">
            <label class="block font-cairo font-bold text-sm text-white">
              {{ isRtl ? 'اختر منصتك واكتب اسم القناة:' : 'Select Platform & Enter Channel:' }}
            </label>
            <!-- Mini Platform Switcher -->
            <div class="flex items-center gap-1 p-1 bg-[#141824] rounded-xl border border-[#27314a]">
              <button
                v-for="plat in platformsList"
                :key="plat.id"
                type="button"
                :class="[
                  'px-2.5 py-0.5 rounded-lg text-xs font-cairo font-bold transition-all flex items-center gap-1',
                  selectedPlatform === plat.id
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                    : 'text-slate-400 hover:text-white'
                ]"
                @click="selectedPlatform = plat.id as any"
              >
                <span>{{ plat.icon }}</span>
                <span>{{ plat.name }}</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2.5">
            <input
              v-model="twitchChannelInput"
              type="text"
              :placeholder="isRtl ? `اكتب اسم قناتك على ${platformsList.find(p => p.id === selectedPlatform)?.name}...` : `Enter your ${platformsList.find(p => p.id === selectedPlatform)?.name} channel...`"
              class="w-full px-5 py-3 bg-[#141824] border border-[#27314a] focus:border-indigo-500 rounded-full font-tajawal text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
              :class="isRtl ? 'text-right' : 'text-left'"
              @keyup.enter="quickStartStream('ROULETTE')"
            />
            <GamerButton
              size="md"
              variant="primary"
              rounded="full"
              :loading="isLaunching"
              class="flex-shrink-0"
              @click="quickStartStream('ROULETTE')"
            >
              <span>{{ t('connectAndPlay') }}</span>
              <span :class="isRtl ? 'rotate-180' : ''">→</span>
            </GamerButton>
          </div>
          <div class="text-[11px] font-tajawal text-arena-textDark">
            {{ t('channelNotice') }}
          </div>
        </div>

        <!-- Platform Badges -->
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <span class="text-xs font-cairo text-arena-textDark">{{ t('compatibleWith') }}</span>
          <span class="px-3 py-1 bg-arena-card border border-arena-border rounded-full text-xs font-cairo text-purple-300">
            Twitch 🟣
          </span>
          <span class="px-3 py-1 bg-arena-card border border-arena-border rounded-full text-xs font-cairo text-emerald-300">
            Kick 🟢
          </span>
          <span class="px-3 py-1 bg-arena-card border border-arena-border rounded-full text-xs font-cairo text-pink-300">
            TikTok 🎵
          </span>
          <span class="px-3 py-1 bg-arena-card border border-arena-border rounded-full text-xs font-cairo text-amber-300">
            OBS Studio 🎥
          </span>
        </div>
      </div>
    </div>

    <!-- Games Showcase Section -->
    <div class="space-y-8 pt-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-arena-border/60 pb-6">
        <div :class="isRtl ? 'text-right' : 'text-left'">
          <h2 class="font-cairo font-black text-3xl sm:text-4xl text-white">
            {{ t('availableGames') }}
          </h2>
          <p class="text-sm font-tajawal text-arena-textMuted mt-1">
            {{ t('availableGamesSub') }}
          </p>
        </div>

        <NuxtLink to="/dashboard">
          <GamerButton size="sm" variant="secondary" rounded="full">
            {{ t('allGames') }} (5)
          </GamerButton>
        </NuxtLink>
      </div>

      <!-- Game Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Game 1: Stream Roulette (Mini Game) -->
        <div class="group relative p-6 bg-arena-card border-2 border-arena-crimson/60 rounded-3xl shadow-glow-crimson hover:shadow-glow-crimson-lg transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1">
          <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-cairo font-bold">
                {{ t('miniGamesTag') }}
              </span>
              <GamerBadge status="FEATURED" :label="t('rouletteTag')" size="sm" />
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-arena-crimson to-red-800 flex items-center justify-center shadow-glow-crimson text-2xl">
              🎯
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-arena-crimson transition-colors">
              {{ t('rouletteTitle') }}
            </h3>

            <p class="text-xs text-arena-textMuted font-tajawal leading-relaxed">
              {{ t('rouletteDesc') }}
            </p>

            <ul class="text-xs font-tajawal text-arena-textMuted space-y-1.5 pt-2 border-t border-arena-border/60">
              <li class="flex items-center gap-2 text-red-300">✓ {{ t('rouletteFeat1') }}</li>
              <li class="flex items-center gap-2 text-red-300">✓ {{ t('rouletteFeat2') }}</li>
              <li class="flex items-center gap-2 text-red-300">✓ {{ t('rouletteFeat3') }}</li>
            </ul>
          </div>

          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full"
            @click="quickStartStream('ROULETTE')"
          >
            {{ isRtl ? 'بدء روليت الاستبعاد 🎯' : 'Launch Roulette 🎯' }}
          </GamerButton>
        </div>

        <!-- Game 3: Trivia Quiz (Mini Game) -->
        <div class="group relative p-6 bg-arena-card border-2 border-primary-500/60 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1">
          <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-cairo font-bold">
                {{ t('miniGamesTag') }}
              </span>
              <GamerBadge status="NEW" :label="t('triviaTag')" size="sm" />
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] text-2xl">
              🧠
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-primary-400 transition-colors">
              {{ t('triviaTitle') }}
            </h3>

            <p class="text-xs text-arena-textMuted font-tajawal leading-relaxed">
              {{ t('triviaDesc') }}
            </p>

            <ul class="text-xs font-tajawal text-arena-textMuted space-y-1.5 pt-2 border-t border-arena-border/60">
              <li class="flex items-center gap-2 text-indigo-300">✓ {{ t('triviaFeat1') }}</li>
              <li class="flex items-center gap-2 text-indigo-300">✓ {{ t('triviaFeat2') }}</li>
              <li class="flex items-center gap-2 text-indigo-300">✓ {{ t('triviaFeat3') }}</li>
            </ul>
          </div>

          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full !bg-gradient-to-r !from-primary-500 !to-indigo-600 hover:!brightness-110 !font-black"
            @click="quickStartStream('TRIVIA')"
          >
            {{ isRtl ? 'بدء مسابقة الأسئلة 🧠' : 'Launch Trivia Quiz 🧠' }}
          </GamerButton>
        </div>

        <!-- Game 4: Grid Royale (Mini Game) -->
        <div class="group relative p-6 bg-arena-card border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1">
          <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-cairo font-bold">
                {{ t('miniGamesTag') }}
              </span>
              <GamerBadge status="FEATURED" :label="t('gridRoyaleTag')" size="sm" />
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] text-2xl">
              ⚡
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-cyan-400 transition-colors">
              {{ t('gridRoyaleTitle') }}
            </h3>

            <p class="text-xs text-arena-textMuted font-tajawal leading-relaxed">
              {{ t('gridRoyaleDesc') }}
            </p>

            <ul class="text-xs font-tajawal text-arena-textMuted space-y-1.5 pt-2 border-t border-arena-border/60">
              <li class="flex items-center gap-2 text-cyan-300">✓ {{ t('gridRoyaleFeat1') }}</li>
              <li class="flex items-center gap-2 text-cyan-300">✓ {{ t('gridRoyaleFeat2') }}</li>
              <li class="flex items-center gap-2 text-cyan-300">✓ {{ t('gridRoyaleFeat3') }}</li>
            </ul>
          </div>

          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full !bg-gradient-to-r !from-cyan-500 !to-indigo-600 hover:!brightness-110 !font-black"
            @click="quickStartStream('GRID_ROYALE')"
          >
            {{ isRtl ? 'بدء حلبة البقاء ⚡' : 'Launch Grid Royale ⚡' }}
          </GamerButton>
        </div>

        <!-- Game 5: Type Race (Mini Game) -->
        <div class="group relative p-6 bg-arena-card border-2 border-amber-500/60 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1">
          <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full text-xs font-cairo font-bold">
                {{ t('miniGamesTag') }}
              </span>
              <GamerBadge status="NEW" :label="t('typeRaceTag')" size="sm" />
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] text-2xl">
              ⌨️
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-amber-400 transition-colors">
              {{ t('typeRaceTitle') }}
            </h3>

            <p class="text-xs text-arena-textMuted font-tajawal leading-relaxed">
              {{ t('typeRaceDesc') }}
            </p>

            <ul class="text-xs font-tajawal text-arena-textMuted space-y-1.5 pt-2 border-t border-arena-border/60">
              <li class="flex items-center gap-2 text-amber-300">✓ {{ t('typeRaceFeat1') }}</li>
              <li class="flex items-center gap-2 text-amber-300">✓ {{ t('typeRaceFeat2') }}</li>
              <li class="flex items-center gap-2 text-amber-300">✓ {{ t('typeRaceFeat3') }}</li>
            </ul>
          </div>

          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!brightness-110 !font-black"
            @click="quickStartStream('TYPE_RACE')"
          >
            {{ isRtl ? 'بدء سباق الكتابة ⌨️' : 'Launch Type Race ⌨️' }}
          </GamerButton>
        </div>

        <!-- Game 6: Hangman Secret Word (Mini Game) -->
        <div class="group relative p-6 bg-arena-card border-2 border-emerald-500/60 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1">
          <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-cairo font-bold">
                {{ t('miniGamesTag') }}
              </span>
              <GamerBadge status="NEW" :label="t('hangmanTag')" size="sm" />
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] text-2xl">
              🕵️
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-emerald-400 transition-colors">
              {{ t('hangmanTitle') }}
            </h3>

            <p class="text-xs text-arena-textMuted font-tajawal leading-relaxed">
              {{ t('hangmanDesc') }}
            </p>

            <ul class="text-xs font-tajawal text-arena-textMuted space-y-1.5 pt-2 border-t border-arena-border/60">
              <li class="flex items-center gap-2 text-emerald-300">✓ {{ t('hangmanFeat1') }}</li>
              <li class="flex items-center gap-2 text-emerald-300">✓ {{ t('hangmanFeat2') }}</li>
              <li class="flex items-center gap-2 text-emerald-300">✓ {{ t('hangmanFeat3') }}</li>
            </ul>
          </div>

          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!brightness-110 !font-black"
            @click="quickStartStream('HANGMAN')"
          >
            {{ isRtl ? 'بدء تحدي الكلمة المخفية 🕵️' : 'Launch Secret Word 🕵️' }}
          </GamerButton>
        </div>

        <!-- Game 7: Hot Potato (Mini Game) -->
        <div class="group relative p-6 bg-arena-card border-2 border-red-500/60 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1">
          <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 bg-red-950 text-red-300 border border-red-500/40 rounded-full text-xs font-cairo font-bold">
                {{ t('miniGamesTag') }}
              </span>
              <GamerBadge status="NEW" :label="t('hotPotatoTag')" size="sm" />
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] text-2xl">
              💣
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-red-400 transition-colors">
              {{ t('hotPotatoTitle') }}
            </h3>

            <p class="text-xs text-arena-textMuted font-tajawal leading-relaxed">
              {{ t('hotPotatoDesc') }}
            </p>

            <ul class="text-xs font-tajawal text-arena-textMuted space-y-1.5 pt-2 border-t border-arena-border/60">
              <li class="flex items-center gap-2 text-red-300">✓ {{ t('hotPotatoFeat1') }}</li>
              <li class="flex items-center gap-2 text-red-300">✓ {{ t('hotPotatoFeat2') }}</li>
              <li class="flex items-center gap-2 text-red-300">✓ {{ t('hotPotatoFeat3') }}</li>
            </ul>
          </div>

          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full !bg-gradient-to-r !from-red-600 !via-orange-600 !to-amber-600 hover:!brightness-110 !font-black"
            @click="quickStartStream('HOT_POTATO')"
          >
            {{ isRtl ? 'بدء القنبلة الموقوتة 💣' : 'Launch Hot Potato 💣' }}
          </GamerButton>
        </div>

        <!-- Game 8: Subway Runner (Mini Game) -->
        <div class="group relative p-6 bg-arena-card border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1">
          <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-cairo font-bold">
                {{ t('miniGamesTag') }}
              </span>
              <GamerBadge status="NEW" :label="t('subwayRunnerTag')" size="sm" />
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] text-2xl">
              🏃‍♂️
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-cyan-400 transition-colors">
              {{ t('subwayRunnerTitle') }}
            </h3>

            <p class="text-xs text-arena-textMuted font-tajawal leading-relaxed">
              {{ t('subwayRunnerDesc') }}
            </p>

            <ul class="text-xs font-tajawal text-arena-textMuted space-y-1.5 pt-2 border-t border-arena-border/60">
              <li class="flex items-center gap-2 text-cyan-300">✓ {{ t('subwayRunnerFeat1') }}</li>
              <li class="flex items-center gap-2 text-cyan-300">✓ {{ t('subwayRunnerFeat2') }}</li>
              <li class="flex items-center gap-2 text-cyan-300">✓ {{ t('subwayRunnerFeat3') }}</li>
            </ul>
          </div>

          <GamerButton
            size="md"
            variant="primary"
            rounded="full"
            class="w-full !bg-gradient-to-r !from-cyan-500 !via-sky-600 !to-blue-600 hover:!brightness-110 !font-black"
            @click="quickStartStream('SUBWAY_RUNNER')"
          >
            {{ isRtl ? 'بدء الهروب السريع 🏃‍♂️' : 'Launch Subway Runner 🏃‍♂️' }}
          </GamerButton>
        </div>
      </div>
    </div>

    <!-- How It Works (3 Steps) -->
    <GamerCard :title="t('howItWorksTitle')" :subtitle="t('howItWorksSub')" :rounded="'3xl'">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" :class="isRtl ? 'text-right' : 'text-left'">
        <div class="p-5 bg-arena-dark/80 border border-arena-border rounded-2xl space-y-2">
          <div class="w-10 h-10 rounded-full bg-arena-crimson flex items-center justify-center font-cairo font-black text-white text-lg shadow-glow-crimson">
            1
          </div>
          <h4 class="font-cairo font-bold text-base text-white">{{ t('step1Title') }}</h4>
          <p class="text-xs font-tajawal text-arena-textDark leading-relaxed">
            {{ t('step1Desc') }}
          </p>
        </div>

        <div class="p-5 bg-arena-dark/80 border border-arena-border rounded-2xl space-y-2">
          <div class="w-10 h-10 rounded-full bg-arena-crimson flex items-center justify-center font-cairo font-black text-white text-lg shadow-glow-crimson">
            2
          </div>
          <h4 class="font-cairo font-bold text-base text-white">{{ t('step2Title') }}</h4>
          <p class="text-xs font-tajawal text-arena-textDark leading-relaxed">
            {{ t('step2Desc') }}
          </p>
        </div>

        <div class="p-5 bg-arena-dark/80 border border-arena-border rounded-2xl space-y-2">
          <div class="w-10 h-10 rounded-full bg-arena-crimson flex items-center justify-center font-cairo font-black text-white text-lg shadow-glow-crimson">
            3
          </div>
          <h4 class="font-cairo font-bold text-base text-white">{{ t('step3Title') }}</h4>
          <p class="text-xs font-tajawal text-arena-textDark leading-relaxed">
            {{ t('step3Desc') }}
          </p>
        </div>
      </div>
    </GamerCard>

    <ConfirmModal
      :is-open="errorModal.isOpen"
      :title="isRtl ? 'خطأ' : 'Error'"
      :message="errorModal.message"
      :confirm-text="isRtl ? 'حسناً' : 'OK'"
      :cancel-text="isRtl ? 'إغلاق' : 'Close'"
      variant="danger"
      @confirm="errorModal.isOpen = false"
      @cancel="errorModal.isOpen = false"
      @close="errorModal.isOpen = false"
    />

    <PlatformConnectModal
      :is-open="showPlatformModal"
      :initial-channel="twitchChannelInput"
      @close="showPlatformModal = false"
      @connect="onModalConnect"
    />
  </div>
</template>
