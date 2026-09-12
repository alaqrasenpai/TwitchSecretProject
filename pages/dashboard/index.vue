<script setup lang="ts">
import { useGameStore } from '~/stores/game';
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
import ConfirmModal from '~/components/common/ConfirmModal.vue';
import PlatformConnectModal from '~/components/game/PlatformConnectModal.vue';

const route = useRoute();
const gameStore = useGameStore();
const { t, isRtl } = useTranslation();
const activeFilter = ref<'ALL' | 'MINI' | 'LONG' | 'PARTY' | 'ROULETTE' | 'TRIVIA' | 'SURVIVAL' | 'CASUAL'>('ALL');
const streamerChannel = ref('');
const selectedPlatform = ref<'twitch' | 'kick' | 'tiktok'>('twitch');
const isCreating = ref(false);
const showPlatformModal = ref(false);
const pendingGameType = ref('ROULETTE');
const errorModal = ref({
  isOpen: false,
  message: ''
});
const confirmNewGameModal = ref({
  isOpen: false,
  targetGameType: '',
  activeSessionGameTitle: '',
  activeSessionId: ''
});

watch(
  () => route.query.type,
  (newType) => {
    if (newType === 'mini') {
      activeFilter.value = 'MINI';
    } else if (newType === 'long') {
      activeFilter.value = 'LONG';
    } else if (!newType && !route.query.category) {
      activeFilter.value = 'ALL';
    }
  },
  { immediate: true }
);

watch(
  () => route.query.category,
  (newCat) => {
    if (newCat) {
      activeFilter.value = String(newCat).toUpperCase() as any;
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (route.query.channel) {
    streamerChannel.value = String(route.query.channel).trim();
  } else if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatwar_streamer_channel') || localStorage.getItem('twitch_channel');
    if (saved) streamerChannel.value = saved.trim();
  }
  if (!streamerChannel.value && gameStore.currentSession?.streamerUsername && gameStore.currentSession.streamerUsername !== 'streamer') {
    streamerChannel.value = gameStore.currentSession.streamerUsername;
  }
  if (route.query.platform && ['twitch', 'kick', 'tiktok'].includes(String(route.query.platform))) {
    selectedPlatform.value = String(route.query.platform) as any;
  }
  if (route.query.type === 'mini' || route.query.type === 'long') {
    activeFilter.value = 'MINI';
  } else if (route.query.category) {
    activeFilter.value = String(route.query.category).toUpperCase() as any;
  }

  // If navigated with a gameType query parameter (e.g. from Home page quick launch)
  if (route.query.gameType) {
    const requested = String(route.query.gameType).toUpperCase();
    if (requested) {
      launchGameRoom(requested);
    }
  }
});

const platformsList = [
  { id: 'twitch', name: 'Twitch', icon: '🟣' },
  { id: 'kick', name: 'Kick', icon: '🟢' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' }
];

const gamesList = computed(() => [
  {
    id: 'ROULETTE',
    title: t('rouletteTitle'),
    gameType: 'MINI',
    category: 'ROULETTE',
    tag: t('rouletteTag'),
    typeBadge: t('miniGamesTag'),
    icon: '🎯',
    badge: '100% Interactive',
    gradient: 'from-arena-crimson to-red-800',
    description: t('rouletteDesc'),
    features: [
      t('rouletteFeat1'),
      t('rouletteFeat2'),
      t('rouletteFeat3')
    ],
    enabled: true
  },
  {
    id: 'TRIVIA',
    title: t('triviaTitle'),
    gameType: 'MINI',
    category: 'TRIVIA',
    tag: t('triviaTag'),
    typeBadge: t('miniGamesTag'),
    icon: '🧠',
    badge: '4 Choices • Live Vote',
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    description: t('triviaDesc'),
    features: [
      t('triviaFeat1'),
      t('triviaFeat2'),
      t('triviaFeat3')
    ],
    enabled: true
  },
  {
    id: 'HOT_POTATO',
    title: t('hotPotatoTitle'),
    gameType: 'MINI',
    category: 'HOT_POTATO',
    tag: t('hotPotatoTag'),
    typeBadge: t('miniGamesTag'),
    icon: '💣',
    badge: 'Ticking Fuse • 100% Chat',
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    description: t('hotPotatoDesc'),
    features: [
      t('hotPotatoFeat1'),
      t('hotPotatoFeat2'),
      t('hotPotatoFeat3')
    ],
    enabled: true
  },
  {
    id: 'GRID_ROYALE',
    title: t('gridRoyaleTitle'),
    gameType: 'MINI',
    category: 'SURVIVAL',
    tag: t('gridRoyaleTag'),
    typeBadge: t('miniGamesTag'),
    icon: '⚡',
    badge: 'Speed & Reflex • 100% Chat',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    description: t('gridRoyaleDesc'),
    features: [
      t('gridRoyaleFeat1'),
      t('gridRoyaleFeat2'),
      t('gridRoyaleFeat3')
    ],
    enabled: true
  },
  {
    id: 'TYPE_RACE',
    title: t('typeRaceTitle'),
    gameType: 'MINI',
    category: 'SPEED',
    tag: t('typeRaceTag'),
    typeBadge: t('miniGamesTag'),
    icon: '⌨️',
    badge: 'Reaction Speed • 100% Chat',
    gradient: 'from-amber-500 via-orange-600 to-yellow-500',
    description: t('typeRaceDesc'),
    features: [
      t('typeRaceFeat1'),
      t('typeRaceFeat2'),
      t('typeRaceFeat3')
    ],
    enabled: true
  },
  {
    id: 'HANGMAN',
    title: t('hangmanTitle'),
    gameType: 'MINI',
    category: 'PUZZLE',
    tag: t('hangmanTag'),
    typeBadge: t('miniGamesTag'),
    icon: '🕵️',
    badge: 'Secret Word • 100% Chat',
    gradient: 'from-emerald-500 via-teal-600 to-green-700',
    description: t('hangmanDesc'),
    features: [
      t('hangmanFeat1'),
      t('hangmanFeat2'),
      t('hangmanFeat3')
    ],
    enabled: true
  },
  {
    id: 'HOT_POTATO',
    title: t('hotPotatoTitle'),
    gameType: 'MINI',
    category: 'CASUAL',
    tag: t('hotPotatoTag'),
    typeBadge: t('miniGamesTag'),
    icon: '💣',
    badge: 'Secret Fuse • 100% Chat',
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    description: t('hotPotatoDesc'),
    features: [
      t('hotPotatoFeat1'),
      t('hotPotatoFeat2'),
      t('hotPotatoFeat3')
    ],
    enabled: true
  },
  {
    id: 'SUBWAY_RUNNER',
    title: t('subwayRunnerTitle'),
    gameType: 'MINI',
    category: 'SURVIVAL',
    tag: t('subwayRunnerTag'),
    typeBadge: t('miniGamesTag'),
    icon: '🏃‍♂️',
    badge: 'Reflex Sprint • 3 Lanes',
    gradient: 'from-cyan-500 via-sky-600 to-blue-600',
    description: t('subwayRunnerDesc'),
    features: [
      t('subwayRunnerFeat1'),
      t('subwayRunnerFeat2'),
      t('subwayRunnerFeat3')
    ],
    enabled: true
  }
]);

const filteredGames = computed(() => {
  if (activeFilter.value === 'ALL') return gamesList.value;
  if (activeFilter.value === 'MINI') return gamesList.value.filter((g) => g.gameType === 'MINI');
  if (activeFilter.value === 'LONG') return gamesList.value.filter((g) => g.gameType === 'LONG');
  return gamesList.value.filter((g) => g.category === activeFilter.value);
});

function getGameTitle(type: string) {
  const found = gamesList.value.find((g) => g.id === type);
  if (found) return found.title;
  if (type === 'SUBWAY_RUNNER') return isRtl.value ? 'مسار الهروب السريع' : 'Subway Runner';
  if (type === 'TRIVIA') return isRtl.value ? 'مسابقة الأسئلة' : 'Trivia Quiz';
  if (type === 'TYPE_RACE') return isRtl.value ? 'سرعة الكتابة' : 'Type Race';
  if (type === 'HANGMAN') return isRtl.value ? 'الكلمة المخفية' : 'Secret Word';
  if (type === 'HOT_POTATO') return isRtl.value ? 'القنبلة الموقوتة' : 'Hot Potato';
  if (type === 'GRID_ROYALE') return isRtl.value ? 'حلبة البقاء' : 'Grid Royale';
  if (type === 'ROULETTE') return isRtl.value ? 'روليت الاستبعاد' : 'Stream Roulette';
  if (type === 'BOARD_PARTY') return isRtl.value ? 'حرب المتاهة' : 'Pummel Maze War';
  return type;
}

function getGameLaunchText(gameId: string) {
  if (gameId === 'TRIVIA') return isRtl.value ? 'بدء مسابقة الأسئلة 🧠' : 'Launch Trivia Quiz 🧠';
  if (gameId === 'GRID_ROYALE') return isRtl.value ? 'بدء حلبة البقاء ⚡' : 'Launch Grid Royale ⚡';
  if (gameId === 'TYPE_RACE') return isRtl.value ? 'بدء سباق الكتابة ⌨️' : 'Launch Type Race ⌨️';
  if (gameId === 'HANGMAN') return isRtl.value ? 'بدء تحدي الكلمة المخفية 🕵️' : 'Launch Secret Word 🕵️';
  if (gameId === 'HOT_POTATO') return isRtl.value ? 'بدء القنبلة الموقوتة 💣' : 'Launch Hot Potato 💣';
  if (gameId === 'SUBWAY_RUNNER') return isRtl.value ? 'بدء الهروب السريع 🏃‍♂️' : 'Launch Subway Runner 🏃‍♂️';
  if (gameId === 'ROULETTE') return isRtl.value ? 'بدء روليت الاستبعاد 🎯' : 'Launch Roulette 🎯';
  return isRtl.value ? 'العب الآن 🚀' : 'Play Now 🚀';
}

async function executeCreateSession(gameType: string, channel: string) {
  isCreating.value = true;
  try {
    const cleanChannel = channel.trim() || 'streamer';
    if (typeof window !== 'undefined' && cleanChannel !== 'streamer') {
      localStorage.setItem('chatwar_streamer_channel', cleanChannel);
    }
    const session = await gameStore.createNewSession(gameType, cleanChannel);
    if (session && session.sessionId) {
      navigateTo(`/dashboard/room/${session.sessionId}`);
    } else {
      throw new Error('Failed to create session');
    }
  } catch (e) {
    errorModal.value = {
      isOpen: true,
      message: isRtl.value ? 'حدث خطأ أثناء إنشاء غرفة اللعب، يرجى المحاولة مرة أخرى.' : 'Error creating game room, please try again.'
    };
  } finally {
    isCreating.value = false;
  }
}

function launchGameRoom(gameType: string) {
  pendingGameType.value = gameType;

  // Retrieve channel if empty
  if (!streamerChannel.value.trim()) {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatwar_streamer_channel') || localStorage.getItem('twitch_channel');
      if (saved) streamerChannel.value = saved.trim();
    }
    if (!streamerChannel.value && gameStore.currentSession?.streamerUsername && gameStore.currentSession.streamerUsername !== 'streamer') {
      streamerChannel.value = gameStore.currentSession.streamerUsername;
    }
  }

  // Check if there is an active session already running
  const existing = gameStore.currentSession || gameStore.getFromLocalStorage();
  const isExistingActive = !!(
    existing &&
    existing.sessionId &&
    existing.status !== 'FINISHED'
  );

  if (isExistingActive && existing) {
    confirmNewGameModal.value = {
      isOpen: true,
      targetGameType: gameType,
      activeSessionGameTitle: getGameTitle(existing.gameType),
      activeSessionId: existing.sessionId
    };
    return;
  }

  proceedToStartGame(gameType);
}

function proceedToStartGame(gameType: string) {
  if (!streamerChannel.value.trim()) {
    showPlatformModal.value = true;
    return;
  }
  executeCreateSession(gameType, streamerChannel.value.trim());
}

async function confirmStartNewAndDeleteOld() {
  const targetType = confirmNewGameModal.value.targetGameType || pendingGameType.value;
  confirmNewGameModal.value.isOpen = false;

  // Delete previous game session completely
  await gameStore.deleteCurrentSession();

  // Start the new game
  const channel = streamerChannel.value.trim() || 'streamer';
  await executeCreateSession(targetType, channel);
}

function resumeExistingGame() {
  const existingId = confirmNewGameModal.value.activeSessionId;
  confirmNewGameModal.value.isOpen = false;
  if (existingId) {
    navigateTo(`/dashboard/room/${existingId}`);
  }
}

function cancelNewGamePrompt() {
  confirmNewGameModal.value.isOpen = false;
  const router = useRouter();
  router.replace({ path: '/dashboard', query: { channel: streamerChannel.value || undefined, platform: selectedPlatform.value || undefined } });
}

async function deleteOldSessionAndStay() {
  confirmNewGameModal.value.isOpen = false;
  const router = useRouter();
  router.replace({ path: '/dashboard', query: { channel: streamerChannel.value || undefined, platform: selectedPlatform.value || undefined } });
  await gameStore.deleteCurrentSession();
}

function onModalConnect(platforms: { id: string; channel: string }[]) {
  const chosen = platforms.find((p) => p.channel.trim());
  if (chosen) {
    streamerChannel.value = chosen.channel.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatwar_streamer_channel', chosen.channel.trim());
    }
    if (['twitch', 'kick', 'tiktok'].includes(chosen.id)) {
      selectedPlatform.value = chosen.id as any;
    }

    // Check if there is an active session before creating
    const existing = gameStore.currentSession || gameStore.getFromLocalStorage();
    if (existing && existing.sessionId && existing.status !== 'FINISHED') {
      confirmNewGameModal.value = {
        isOpen: true,
        targetGameType: pendingGameType.value,
        activeSessionGameTitle: getGameTitle(existing.gameType),
        activeSessionId: existing.sessionId
      };
      return;
    }

    executeCreateSession(pendingGameType.value, chosen.channel.trim());
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Channel Setup Banner -->
    <div class="p-8 bg-gradient-to-l from-arena-card to-arena-dark border border-arena-borderLight/60 rounded-3xl shadow-arena-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div class="space-y-2 relative z-10" :class="isRtl ? 'text-right' : 'text-left'">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/80 border border-indigo-500/40 rounded-full text-xs font-cairo text-indigo-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{{ streamerChannel ? (isRtl ? `القناة المتصلة: ${streamerChannel}` : `Connected Channel: ${streamerChannel}`) : t('readyToStream') }}</span>
        </div>
        <h1 class="font-cairo font-black text-3xl sm:text-4xl text-white">
          {{ isRtl ? 'اختر اللعبة التي تريد بدءها على بثك 🎮' : 'Choose Your Stream Interactive Game 🎮' }}
        </h1>
        <p class="text-sm font-tajawal text-slate-400">
          {{ isRtl ? 'حدد اللعبة التي تفضلها لبدء اللعب مع المتابعين في الشات مباشرة' : 'Select your desired game mode to launch and play live with your chat' }}
        </p>
      </div>

      <!-- Platform Selection & Channel Input Box -->
      <div class="space-y-2.5 relative z-10 w-full md:w-auto">
        <!-- Platform Choice Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-[#141824] rounded-2xl border border-[#27314a] justify-start sm:justify-end">
          <button
            v-for="plat in platformsList"
            :key="plat.id"
            type="button"
            :class="[
              'px-3 py-1 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5',
              selectedPlatform === plat.id
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            ]"
            @click="selectedPlatform = plat.id as any"
          >
            <span>{{ plat.icon }}</span>
            <span>{{ plat.name }}</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div class="relative flex-1">
            <input
              v-model="streamerChannel"
              type="text"
              :placeholder="isRtl ? `اكتب اسم قناتك على ${platformsList.find(p => p.id === selectedPlatform)?.name}...` : `Enter your ${platformsList.find(p => p.id === selectedPlatform)?.name} channel...`"
              class="w-full px-5 py-3 bg-[#141824] border border-[#27314a] focus:border-indigo-500 rounded-2xl font-tajawal text-sm text-white placeholder-slate-500 focus:outline-none transition-all min-w-[240px]"
              :class="isRtl ? 'text-right' : 'text-left'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Active Session Resume Banner (If user has ongoing match in localStorage) -->
    <div
      v-if="gameStore.currentSession && gameStore.currentSession.sessionId && gameStore.currentSession.status !== 'FINISHED'"
      class="p-5 bg-gradient-to-r from-indigo-950/90 via-[#141824] to-purple-950/90 border-2 border-indigo-500/50 rounded-3xl shadow-[0_0_35px_rgba(99,102,241,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-slow"
    >
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-inner">
          {{ gameStore.currentSession.gameType === 'TRIVIA' ? '🧠' : '🎯' }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 class="font-cairo font-black text-base sm:text-lg text-white">
              {{ isRtl ? 'لديك جولة نشطة محفوظة في الذاكرة!' : 'You have an active ongoing session!' }}
            </h3>
          </div>
          <p class="text-xs font-tajawal text-slate-300 mt-0.5">
            {{ isRtl ? `لعبة: ${gameStore.currentSession.gameType === 'TRIVIA' ? 'مسابقة الأسئلة' : 'روليت الاستبعاد'} • المتسابقين: ${gameStore.players.length} • القناة: ${gameStore.currentSession.streamerUsername}` : `Game: ${gameStore.currentSession.gameType} • Players: ${gameStore.players.length} • Channel: ${gameStore.currentSession.streamerUsername}` }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
        <NuxtLink :to="`/dashboard/room/${gameStore.currentSession.sessionId}`" class="w-full sm:w-auto">
          <GamerButton size="md" variant="primary" rounded="full" class="w-full sm:w-auto !bg-gradient-to-r !from-indigo-500 !to-purple-600 hover:!brightness-110 !font-black !px-6">
            ⚡ {{ isRtl ? 'استئناف الجلسة الحالية' : 'Resume Match' }}
          </GamerButton>
        </NuxtLink>

        <button
          type="button"
          class="px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 transition"
          :title="isRtl ? 'حذف الجلسة السابقة والبدء من جديد' : 'Discard and delete session'"
          @click="gameStore.deleteCurrentSession()"
        >
          ✕ {{ isRtl ? 'حذف الجلسة القديمة' : 'Discard Session' }}
        </button>
      </div>
    </div>

    <!-- Category & Mode Filters -->
    <div class="space-y-4 border-b border-arena-border/60 pb-6">
      <!-- Top Mode Selector Pills -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- All -->
          <button
            type="button"
            :class="[
              'px-5 py-2.5 rounded-2xl font-cairo font-black text-sm transition-all flex items-center gap-2',
              activeFilter === 'ALL'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105'
                : 'bg-arena-card text-arena-textMuted hover:text-white border border-arena-border hover:border-slate-600'
            ]"
            @click="activeFilter = 'ALL'"
          >
            <span>⚡</span>
            <span>{{ t('filterAll') }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-black/40">{{ gamesList.length }}</span>
          </button>

          <!-- Mini Games (القديمة / السريعة) -->
          <button
            type="button"
            :class="[
              'px-5 py-2.5 rounded-2xl font-cairo font-black text-sm transition-all flex items-center gap-2',
              activeFilter === 'MINI'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-105'
                : 'bg-arena-card text-cyan-400/80 hover:text-cyan-300 border border-cyan-500/30 hover:bg-cyan-950/30'
            ]"
            @click="activeFilter = 'MINI'"
          >
            <span>🎮</span>
            <span>{{ t('filterMini') }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {{ gamesList.filter(g => g.gameType === 'MINI').length }}
            </span>
          </button>
        </div>

        <!-- Subcategory Quick Pills -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs font-cairo">
          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeFilter === 'ROULETTE'
                ? 'bg-arena-crimson text-white font-bold'
                : 'bg-arena-card text-slate-400 hover:text-white border border-arena-border'
            ]"
            @click="activeFilter = 'ROULETTE'"
          >
            🎯 {{ t('rouletteCategory') }}
          </button>

          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeFilter === 'TRIVIA'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-arena-card text-slate-400 hover:text-white border border-arena-border'
            ]"
            @click="activeFilter = 'TRIVIA'"
          >
            🧠 {{ t('triviaCategory') }}
          </button>

          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeFilter === 'SURVIVAL'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-arena-card text-slate-400 hover:text-white border border-arena-border'
            ]"
            @click="activeFilter = 'SURVIVAL'"
          >
            🗺️ {{ t('survivalCategory') }}
          </button>

          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeFilter === 'SPEED'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-arena-card text-slate-400 hover:text-white border border-arena-border'
            ]"
            @click="activeFilter = 'SPEED'"
          >
            ⌨️ {{ isRtl ? 'سرعة الكتابة' : 'Type Race' }}
          </button>

          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeFilter === 'PUZZLE'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-arena-card text-slate-400 hover:text-white border border-arena-border'
            ]"
            @click="activeFilter = 'PUZZLE'"
          >
            🕵️ {{ isRtl ? 'الكلمة المخفية' : 'Word Guess' }}
          </button>
        </div>
      </div>

      <!-- Mode Explanation Callout -->
      <div
        v-if="activeFilter === 'MINI'"
        class="p-4 rounded-2xl border text-xs font-tajawal flex items-center gap-3 animate-fade-in bg-cyan-950/30 border-cyan-500/40 text-cyan-200"
      >
        <span class="text-xl">🎮</span>
        <div>
          <span class="font-cairo font-bold block text-sm">{{ t('miniGames') }}</span>
          <span>{{ t('miniGamesSub') }}</span>
        </div>
      </div>
    </div>

    <!-- Games Gallery Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="game in filteredGames"
        :key="game.id"
        :class="[
          'group p-7 bg-arena-card border rounded-3xl shadow-arena-card transition-all duration-300 flex flex-col justify-between space-y-6',
          game.enabled
            ? (game.id === 'BOARD_PARTY'
                ? 'border-amber-500/40 hover:border-amber-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:-translate-y-1'
                : (game.id === 'GRID_ROYALE'
                    ? 'border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:-translate-y-1'
                    : (game.id === 'TRIVIA'
                        ? 'border-primary-500/40 hover:border-primary-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:-translate-y-1'
                        : 'border-arena-border hover:border-arena-crimson/60 hover:shadow-glow-crimson hover:-translate-y-1')))
            : 'border-arena-border/30 opacity-60 cursor-not-allowed'
        ]"
      >
        <div class="space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5">
              <!-- Game Mode Badge (Mini vs Long) -->
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-md text-[10px] font-cairo font-black uppercase tracking-wider',
                  game.gameType === 'LONG'
                    ? 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40'
                ]"
              >
                {{ game.typeBadge }}
              </span>

              <span
                :class="[
                  'px-2.5 py-0.5 border rounded-md text-[11px] font-cairo font-bold',
                  game.enabled
                    ? (game.id === 'BOARD_PARTY'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        : (game.id === 'GRID_ROYALE'
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                            : (game.id === 'TRIVIA' ? 'bg-primary-950 text-primary-300 border-primary-500/40' : 'bg-arena-cardLight text-red-300 border-arena-borderLight')))
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                ]"
              >
                {{ game.tag }}
              </span>
            </div>

            <GamerBadge :status="game.enabled ? (game.id === 'BOARD_PARTY' ? 'FEATURED' : (game.id === 'GRID_ROYALE' ? 'NEW' : (game.id === 'TRIVIA' ? 'NEW' : 'FREE'))) : 'MUTED'" :label="game.badge" size="sm" />
          </div>

          <div
            :class="[
              'w-16 h-16 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-3xl shadow-lg',
              game.gradient
            ]"
          >
            {{ game.icon }}
          </div>

          <div>
            <h3
              :class="[
                'font-cairo font-black text-2xl text-white transition-colors',
                game.enabled ? (game.id === 'BOARD_PARTY' ? 'group-hover:text-amber-400' : (game.id === 'GRID_ROYALE' ? 'group-hover:text-cyan-300' : (game.id === 'TRIVIA' ? 'group-hover:text-primary-300' : 'group-hover:text-arena-crimson'))) : 'text-neutral-400'
              ]"
            >
              {{ game.title }}
            </h3>
            <p class="text-sm font-tajawal text-arena-textMuted mt-2 leading-relaxed">
              {{ game.description }}
            </p>
          </div>

          <ul class="text-xs font-tajawal text-arena-textMuted space-y-2 pt-3 border-t border-arena-border/60">
            <li v-for="(feat, idx) in game.features" :key="idx" class="flex items-center gap-2 text-slate-300">
              <span :class="game.enabled ? (game.id === 'BOARD_PARTY' ? 'text-amber-400' : (game.id === 'GRID_ROYALE' ? 'text-cyan-400' : (game.id === 'TRIVIA' ? 'text-primary-400' : 'text-arena-crimson'))) : 'text-neutral-500'" class="font-bold">✓</span>
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>

        <GamerButton
          v-if="game.enabled"
          size="md"
          variant="primary"
          rounded="full"
          :class="[
            'w-full font-black text-sm py-3.5',
            game.id === 'BOARD_PARTY'
              ? '!bg-gradient-to-r !from-amber-500 !to-yellow-600 hover:!brightness-110 !shadow-amber-500/25'
              : (game.id === 'GRID_ROYALE'
                  ? '!bg-gradient-to-r !from-cyan-500 via-indigo-600 !to-purple-600 hover:!brightness-110 !shadow-cyan-500/25'
                  : (game.id === 'TRIVIA' ? '!bg-gradient-to-r !from-primary-500 !to-indigo-600 hover:!brightness-110 !shadow-primary-500/25' : ''))
          ]"
          :loading="isCreating && pendingGameType === game.id"
          @click="launchGameRoom(game.id)"
        >
          {{ getGameLaunchText(game.id) }}
        </GamerButton>
        <button
          v-else
          disabled
          type="button"
          class="w-full py-3 px-6 rounded-full font-cairo font-bold text-xs bg-neutral-900/80 text-neutral-500 border border-neutral-800/80 cursor-not-allowed uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <span>🔒 {{ t('underDevelopment') }}</span>
        </button>
      </div>
    </div>

    <!-- Active Game Exists Confirmation Dialog -->
    <div
      v-if="confirmNewGameModal.isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="cancelNewGamePrompt"
    >
      <div
        :class="[
          'relative w-full max-w-lg bg-[#0e111a] border-2 border-amber-500/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] p-6 sm:p-7 space-y-6 animate-scale-up',
          isRtl ? 'text-right' : 'text-left'
        ]"
      >
        <!-- Header -->
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-lg animate-pulse">
            ⚠️
          </div>
          <div>
            <h3 class="font-cairo font-black text-xl text-white">
              {{ isRtl ? 'توجد لعبة أخرى بدأت بالفعل' : 'Another Game is Already Started' }}
            </h3>
            <p class="text-xs font-tajawal text-slate-400 mt-0.5">
              {{ isRtl ? `اللعبة السابقة: ${confirmNewGameModal.activeSessionGameTitle}` : `Previous Game: ${confirmNewGameModal.activeSessionGameTitle}` }}
            </p>
          </div>
        </div>

        <!-- Message Body -->
        <div class="p-4 bg-[#141824] rounded-2xl border border-[#27314a] space-y-2">
          <p class="font-tajawal text-sm text-slate-200 leading-relaxed">
            {{
              isRtl
                ? `هناك لعبة (${confirmNewGameModal.activeSessionGameTitle}) قيد التشغيل حالياً. هل ترغب في بدء لعبة جديدة وحذف القديمة؟`
                : `A game session for (${confirmNewGameModal.activeSessionGameTitle}) is currently running. Do you want to start a new game and delete the old one?`
            }}
          </p>
          <p class="font-tajawal text-xs text-amber-300/80">
            {{
              isRtl
                ? 'ملاحظة: بدء لعبة جديدة سيقوم بإنهاء وحذف بيانات الجولة السابقة بالكامل.'
                : 'Note: Starting a new game will permanently terminate and remove the previous match.'
            }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 rounded-full bg-[#141824] hover:bg-[#1a2030] border border-[#27314a] text-xs font-cairo font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            @click="cancelNewGamePrompt"
          >
            {{ isRtl ? 'إغلاق ✕' : 'Close ✕' }}
          </button>

          <button
            type="button"
            class="px-4 py-2.5 rounded-full bg-rose-950/70 hover:bg-rose-900/90 border border-rose-600/60 text-xs font-cairo font-bold text-rose-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            @click="deleteOldSessionAndStay"
          >
            <span>🗑️</span>
            <span>{{ isRtl ? 'لا، حذف اللعبة السابقة نهائياً' : 'No, Delete Previous Game' }}</span>
          </button>

          <button
            type="button"
            class="px-4 py-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/50 text-xs font-cairo font-bold text-emerald-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            @click="resumeExistingGame"
          >
            <span>↗️</span>
            <span>{{ isRtl ? 'متابعة اللعبة السابقة' : 'Resume Previous Game' }}</span>
          </button>

          <button
            type="button"
            class="px-5 py-2.5 rounded-full text-xs font-cairo font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/50 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            @click="confirmStartNewAndDeleteOld"
          >
            <span>🚀</span>
            <span>{{ isRtl ? 'حذف وبدء لعبة جديدة' : 'Start New & Delete Old' }}</span>
          </button>
        </div>
      </div>
    </div>

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
      :initial-channel="streamerChannel"
      @close="showPlatformModal = false"
      @connect="onModalConnect"
    />
  </div>
</template>
