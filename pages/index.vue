<script setup lang="ts">
import { useGameStore } from '~/stores/game';
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
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

// Live Interactive Demo State for Hero Screen
const activeHeroDemo = ref<'SUBWAY' | 'WORDLE' | 'TYPERACE'>('SUBWAY');
const simulatedChatFeed = ref([
  { user: 'Sultan_99', text: 'jump ⬆️', time: 'الآن', color: 'text-cyan-400', badge: 'VIP' },
  { user: 'Gamer_KSA', text: 'right ➡️', time: 'الآن', color: 'text-amber-400', badge: 'SUB' },
  { user: 'Sara_Stream', text: 'فورتنايت 🎯', time: 'الآن', color: 'text-emerald-400', badge: 'MOD' },
  { user: 'Fahad_Pro', text: 'left ⬅️', time: 'الآن', color: 'text-purple-400', badge: 'SUB' },
  { user: 'Tariq_live', text: 'اسطورييي 🔥', time: 'الآن', color: 'text-indigo-400', badge: 'VIP' }
]);

let chatCycleInterval: any = null;
onMounted(() => {
  chatCycleInterval = setInterval(() => {
    const mockUsers = ['Rakan_X', 'Nora_Gaming', 'Speedy_07', 'DarkKnight', 'Legend_99', 'Meshari_Live'];
    const mockMsgs = [
      'jump ⬆️', 'duck ⬇️', 'right ➡️', 'left ⬅️',
      'ماين كرافت', 'ميسي', 'رونالدو', 'سرعة خيالية!', 'فزت بالجولة 👑'
    ];
    const colors = ['text-cyan-400', 'text-amber-400', 'text-emerald-400', 'text-pink-400', 'text-indigo-400'];
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const randomMsg = mockMsgs[Math.floor(Math.random() * mockMsgs.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    simulatedChatFeed.value.unshift({
      user: randomUser,
      text: randomMsg,
      time: 'الآن',
      color: randomColor,
      badge: Math.random() > 0.5 ? 'SUB' : 'VIP'
    });
    if (simulatedChatFeed.value.length > 5) {
      simulatedChatFeed.value.pop();
    }
  }, 2200);
});

onUnmounted(() => {
  if (chatCycleInterval) clearInterval(chatCycleInterval);
});

const platformsList = [
  { id: 'twitch', name: 'Twitch', icon: '🟣', brandClass: 'from-purple-600 to-indigo-600' },
  { id: 'kick', name: 'Kick', icon: '🟢', brandClass: 'from-emerald-600 to-green-500' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', brandClass: 'from-pink-600 to-cyan-500' }
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
  <div class="space-y-28 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- ================= 1. EPIC HERO STAGE (LIQUID CYBER-ARCADE) ================= -->
    <div class="relative pt-6 pb-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <!-- Left: High-Impact Typography & Broadcaster Launchpad (7 cols) -->
        <div class="lg:col-span-7 space-y-7" :class="isRtl ? 'text-right' : 'text-left'">
          <!-- Live Engine Badge -->
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span class="font-mono text-xs text-indigo-300 font-black tracking-wide uppercase">
              {{ isRtl ? 'منظومة تفاعل البثوث المباشرة 2026' : 'NEXT-GEN BROADCAST GAMING ENGINE' }}
            </span>
          </div>

          <!-- Hero Editorial Headline -->
          <div class="space-y-3">
            <h1 class="font-cairo font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.18]">
              {{ isRtl ? 'حوّل شات البث إلى' : 'Turn Your Stream Chat Into' }} <br />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                {{ isRtl ? 'حلبة ألعاب ومنافسة فورية' : 'An Interactive Live Arena' }}
              </span>
            </h1>
            <p class="text-base sm:text-lg text-slate-300 font-tajawal max-w-xl leading-relaxed">
              {{ isRtl ? 'ألعاب تفاعلية خفيفة تُلعب مباشرة من شات تويتش بدون تحميل، بدون تأخير، وبطبقة شفافة 100% لبرامج البث (OBS) - وبدون الحاجة لكتابة !join!' : 'Zero-lag live interactive games powered directly by Twitch chat. 100% transparent OBS overlays with instant viewer participation without typing !join!' }}
            </p>
          </div>

          <!-- Broadcaster Quick Launchpad Box -->
          <div class="p-6 bg-gradient-to-b from-[#101424]/90 via-[#0c0f1d]/90 to-[#0c0f1d]/90 border border-white/10 rounded-3xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.9),0_0_30px_rgba(99,102,241,0.15)] backdrop-blur-2xl space-y-4 max-w-xl">
            <!-- Platform Selector Tabs -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="font-cairo font-bold text-xs text-slate-300">
                {{ isRtl ? 'اختر منصة البث:' : 'Select Streaming Platform:' }}
              </span>
              <div class="flex items-center gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/5">
                <button
                  v-for="plat in platformsList"
                  :key="plat.id"
                  type="button"
                  :class="[
                    'px-3 py-1 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                    selectedPlatform === plat.id
                      ? 'bg-gradient-to-r ' + plat.brandClass + ' text-white shadow-md font-black scale-102'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  ]"
                  @click="selectedPlatform = plat.id as any"
                >
                  <span>{{ plat.icon }}</span>
                  <span>{{ plat.name }}</span>
                </button>
              </div>
            </div>

            <!-- Channel Input & Launch Button -->
            <div class="flex flex-col sm:flex-row gap-2.5">
              <div class="relative flex-1">
                <input
                  v-model="twitchChannelInput"
                  type="text"
                  :placeholder="isRtl ? `اكتب اسم قناتك على ${platformsList.find(p => p.id === selectedPlatform)?.name}...` : `Enter your ${platformsList.find(p => p.id === selectedPlatform)?.name} channel...`"
                  class="w-full px-5 py-3.5 bg-black/60 border border-white/10 focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.3)] rounded-2xl font-tajawal text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  :class="isRtl ? 'text-right' : 'text-left'"
                  @keyup.enter="quickStartStream('SUBWAY_RUNNER')"
                />
              </div>

              <GamerButton
                size="md"
                variant="primary"
                rounded="2xl"
                :loading="isLaunching"
                class="px-7 py-3.5 !bg-gradient-to-r !from-indigo-500 !via-purple-600 !to-cyan-500 hover:!brightness-115 shadow-[0_0_25px_rgba(99,102,241,0.5)] font-black text-sm flex-shrink-0"
                @click="quickStartStream('SUBWAY_RUNNER')"
              >
                <span>🚀 {{ isRtl ? 'بدء اللعب فوراً' : 'Launch Games' }}</span>
                <span :class="isRtl ? 'rotate-180' : ''">→</span>
              </GamerButton>
            </div>

            <div class="flex items-center justify-between text-[11px] font-tajawal text-slate-400 px-1 pt-1">
              <span class="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {{ isRtl ? 'ربط مباشر ولحظي مع الشات بدون الحاجة لكلمات سر' : 'Instant IRC live socket connection with 0 login required' }}
              </span>
              <button
                type="button"
                class="text-indigo-400 hover:text-indigo-300 underline font-bold cursor-pointer"
                @click="showPlatformModal = true"
              >
                {{ isRtl ? 'خيارات إضافية' : 'More Options' }}
              </button>
            </div>
          </div>

          <!-- Feature Pills Strip -->
          <div class="flex flex-wrap items-center gap-2.5 pt-1">
            <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-cairo text-cyan-300 font-bold flex items-center gap-1.5">
              <span>⚡</span> {{ isRtl ? 'بدون تأخير 0ms' : '0ms Latency' }}
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-cairo text-amber-300 font-bold flex items-center gap-1.5">
              <span>💬</span> {{ isRtl ? 'بدون !join (مشاركة فورية)' : 'No !join required' }}
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-cairo text-purple-300 font-bold flex items-center gap-1.5">
              <span>🎥</span> {{ isRtl ? 'شفافية 100% لـ OBS' : '100% Transparent OBS' }}
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-cairo text-emerald-300 font-bold flex items-center gap-1.5">
              <span>🏆</span> {{ isRtl ? 'سكوربورد وتتويج آلي' : 'Auto Grand Scoreboards' }}
            </span>
          </div>
        </div>

        <!-- Right: Live Interactive OBS Studio Console Mockup (5 cols) -->
        <div class="lg:col-span-5 relative flex items-center justify-center">
          <!-- Glass Studio Console Frame -->
          <div class="w-full max-w-lg bg-[#0c0f1c]/90 border border-white/15 rounded-3xl p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(99,102,241,0.2)] backdrop-blur-2xl space-y-3">
            <!-- Console Top Bar -->
            <div class="flex items-center justify-between border-b border-white/10 pb-3 px-1">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span class="font-mono text-xs font-bold text-slate-300 ml-2">OBS_BROWSER_OVERLAY_1080P.EXE</span>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-mono font-black animate-pulse">
                <span>● REC LIVE</span>
              </div>
            </div>

            <!-- Console Screen Mode Switcher -->
            <div class="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-cairo font-bold">
              <button
                type="button"
                :class="[
                  'flex-1 py-1 rounded-lg transition-all',
                  activeHeroDemo === 'SUBWAY' ? 'bg-cyan-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-white'
                ]"
                @click="activeHeroDemo = 'SUBWAY'"
              >
                🏃‍♂️ الهروب السريع
              </button>
              <button
                type="button"
                :class="[
                  'flex-1 py-1 rounded-lg transition-all',
                  activeHeroDemo === 'WORDLE' ? 'bg-emerald-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-white'
                ]"
                @click="activeHeroDemo = 'WORDLE'"
              >
                🔤 الكلمة المخفية
              </button>
              <button
                type="button"
                :class="[
                  'flex-1 py-1 rounded-lg transition-all',
                  activeHeroDemo === 'TYPERACE' ? 'bg-amber-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-white'
                ]"
                @click="activeHeroDemo = 'TYPERACE'"
              >
                ⌨️ سرعة الكتابة
              </button>
            </div>

            <!-- Simulated Game Visual (Transparent Canvas Simulation) -->
            <div class="relative h-56 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#090b14] via-[#0f1426] to-[#090b14] p-3 flex flex-col justify-between">
              <!-- Grid background lines -->
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_70%)] pointer-events-none" />

              <!-- Active Game Demo 1: Subway Runner -->
              <div v-if="activeHeroDemo === 'SUBWAY'" class="relative z-10 h-full flex flex-col justify-between">
                <div class="flex items-center justify-between text-[11px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">⚡ الجولة 2/5 • السرعة 1.4x</span>
                  <span class="text-amber-300 font-bold">⏱️ 02.4s</span>
                </div>

                <!-- 3 Runner Lanes -->
                <div class="grid grid-cols-3 gap-2 my-auto px-2">
                  <div class="h-20 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-slate-500 text-xs font-cairo">
                    <span class="text-lg">🛤️</span>
                    <span class="text-[10px]">اليسار</span>
                  </div>
                  <!-- Middle lane with Obstacle & Jumping Runner -->
                  <div class="h-20 rounded-xl bg-cyan-500/15 border-2 border-cyan-400 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <div class="text-3xl animate-bounce">🏃‍♂️</div>
                    <span class="text-[10px] font-mono text-cyan-300 font-bold">JUMP! ⬆️</span>
                  </div>
                  <div class="h-20 rounded-xl bg-red-500/20 border border-red-500/40 flex flex-col items-center justify-center text-red-300 text-xs font-cairo">
                    <span class="text-xl">🚧</span>
                    <span class="text-[10px] font-bold">حاجز</span>
                  </div>
                </div>

                <div class="text-center text-[10px] font-tajawal text-slate-400">
                  {{ isRtl ? 'الأمر المطلوب في الشات: اكتب jump لتخطي الحاجز!' : 'Chat Command: Type jump to leap over barrier!' }}
                </div>
              </div>

              <!-- Active Game Demo 2: Wordle / Hangman -->
              <div v-else-if="activeHeroDemo === 'WORDLE'" class="relative z-10 h-full flex flex-col justify-between">
                <div class="flex items-center justify-between text-[11px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">🏆 الجولة 1/5 • التصنيف: ألعاب</span>
                  <span class="text-emerald-300 font-bold">⏱️ 38s</span>
                </div>

                <!-- Letter Tiles -->
                <div class="flex items-center justify-center gap-1.5 my-auto">
                  <span class="w-9 h-11 rounded-xl bg-emerald-600 border border-emerald-300 text-white font-black text-xl flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.7)]">ف</span>
                  <span class="w-9 h-11 rounded-xl bg-emerald-600 border border-emerald-300 text-white font-black text-xl flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.7)]">و</span>
                  <span class="w-9 h-11 rounded-xl bg-neutral-900 border border-white/20 text-slate-500 font-black text-xl flex items-center justify-center">?</span>
                  <span class="w-9 h-11 rounded-xl bg-amber-500 border border-amber-300 text-black font-black text-xl flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.7)]">ت</span>
                  <span class="w-9 h-11 rounded-xl bg-neutral-900 border border-white/20 text-slate-500 font-black text-xl flex items-center justify-center">?</span>
                  <span class="w-9 h-11 rounded-xl bg-emerald-600 border border-emerald-300 text-white font-black text-xl flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.7)]">ت</span>
                </div>

                <div class="text-center text-[10px] font-tajawal text-emerald-300 font-bold">
                  {{ isRtl ? 'المشاهدون يكتبون تخميناتهم مباشرة في الشات!' : 'Chatters type guesses directly with green/yellow clues!' }}
                </div>
              </div>

              <!-- Active Game Demo 3: Type Race -->
              <div v-else class="relative z-10 h-full flex flex-col justify-between">
                <div class="flex items-center justify-between text-[11px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">⚡ الجولة 3/7 • سرعة الكتابة</span>
                  <span class="text-amber-300 font-bold">⏱️ 08s</span>
                </div>

                <div class="my-auto text-center space-y-1">
                  <div class="text-xs font-cairo text-amber-300 font-bold">اكتب الكلمة بأسرع ما يمكن:</div>
                  <div class="font-cairo font-black text-3xl text-white tracking-widest bg-white/5 py-2 rounded-2xl border border-amber-500/30">
                    أسطورة
                  </div>
                </div>

                <div class="text-center text-[10px] font-tajawal text-slate-400">
                  {{ isRtl ? 'أول شخص يكتب الكلمة بدقة يفوز بنقطة الجولة!' : 'First viewer to type exact word wins round point!' }}
                </div>
              </div>
            </div>

            <!-- Simulated Live Chat Waterfall (IRC Ticker) -->
            <div class="space-y-1.5 p-3 bg-black/70 rounded-2xl border border-white/5">
              <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-white/5">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-purple-500" />
                  <span>TWITCH IRC STREAM</span>
                </span>
                <span class="text-emerald-400 font-bold">ONLINE</span>
              </div>

              <div class="space-y-1 text-xs font-tajawal max-h-24 overflow-hidden">
                <div
                  v-for="(msg, i) in simulatedChatFeed"
                  :key="i"
                  class="flex items-center justify-between py-0.5 px-2 rounded-lg bg-white/5 text-[11px] transition-all animate-fade-in"
                >
                  <div class="flex items-center gap-1.5">
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold" :class="msg.badge === 'SUB' ? 'bg-purple-900 text-purple-200' : 'bg-amber-900 text-amber-200'">
                      {{ msg.badge }}
                    </span>
                    <span class="font-cairo font-bold text-slate-300">{{ msg.user }}:</span>
                    <span :class="msg.color" class="font-bold">{{ msg.text }}</span>
                  </div>
                  <span class="text-[9px] text-slate-500 font-mono">{{ msg.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= 2. THE ASYMMETRIC BENTO GRID (GAMES SHOWCASE) ================= -->
    <div class="space-y-10">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div :class="isRtl ? 'text-right' : 'text-left'" class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-cairo font-bold">
            🎮 {{ isRtl ? 'مكتبة ألعاب الشات المتكاملة' : 'Chat Arena Game Catalog' }}
          </div>
          <h2 class="font-cairo font-black text-3xl sm:text-4xl text-white">
            {{ isRtl ? 'اختر نمط اللعبة وأشعل البث' : 'Choose Your Game Mode' }}
          </h2>
          <p class="text-sm font-tajawal text-slate-400 max-w-xl">
            {{ isRtl ? 'جميع الألعاب مصممة بدقة لتعمل مباشرة عبر أوامر الشات الطبيعية مع شاشات شفافة لـ OBS وتتويج نهائي.' : 'Every game is optimized for broadcast stability, real-time chat input, and transparent overlay graphics.' }}
          </p>
        </div>

        <NuxtLink to="/dashboard">
          <GamerButton size="sm" variant="secondary" rounded="xl" class="font-bold text-xs px-5 py-2.5 border-white/10 hover:border-white/30">
            <span>{{ isRtl ? 'استعراض كافة الألعاب (6)' : 'View All Games (6)' }}</span>
            <span :class="isRtl ? 'rotate-180' : ''">→</span>
          </GamerButton>
        </NuxtLink>
      </div>

      <!-- Bento Grid Container -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- BENTO CARD 1: SUBWAY RUNNER (Large Featured 2-Cols) -->
        <div class="lg:col-span-2 group relative p-7 bg-gradient-to-br from-[#0e1628] via-[#0d1222] to-[#0a0d18] border border-cyan-500/30 hover:border-cyan-400 rounded-3xl shadow-[0_10px_35px_rgba(6,182,212,0.15)] hover:shadow-[0_15px_50px_rgba(6,182,212,0.3)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
          <!-- Background Atmospheric Flare -->
          <div class="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl group-hover:bg-cyan-500/25 transition-all pointer-events-none" />

          <div class="relative z-10 space-y-5" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-cairo font-black tracking-wide">
                🏃‍♂️ {{ isRtl ? 'الأكثر طلباً وحماساً' : 'FEATURED REFLEX' }}
              </span>
              <span class="text-xs font-mono text-cyan-400 font-bold bg-black/40 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                MULTI-ROUND 5x
              </span>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <h3 class="font-cairo font-black text-2xl sm:text-3xl text-white group-hover:text-cyan-300 transition-colors">
                  {{ isRtl ? 'مسار الهروب السريع (Subway Runner)' : 'Subway Chat Runner' }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-300 font-tajawal max-w-md leading-relaxed">
                  {{ isRtl ? 'شخصية تركض على 3 مسارات وتظهر حواجز وعوائق سريعة! يكتب المشاهدون الأوامر في الشات (jump, duck, left, right) لتفادي الاصطدام. تزداد السرعة مع كل جولة!' : 'A runner dashes through 3 lanes with oncoming obstacles. Viewers shout commands in chat to survive progressively faster rounds!' }}
                </p>
              </div>

              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform shrink-0">
                🏃‍♂️
              </div>
            </div>

            <!-- Visual Mini Track Preview -->
            <div class="grid grid-cols-4 gap-2 pt-2">
              <div class="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 text-center space-y-1">
                <div class="text-sm">⬆️</div>
                <div class="font-mono text-[10px] text-cyan-300 font-bold">jump</div>
                <div class="text-[9px] text-slate-400 font-tajawal">قفز فوق الحاجز</div>
              </div>
              <div class="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 text-center space-y-1">
                <div class="text-sm">⬇️</div>
                <div class="font-mono text-[10px] text-cyan-300 font-bold">duck</div>
                <div class="text-[9px] text-slate-400 font-tajawal">انحناء تحت العائق</div>
              </div>
              <div class="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 text-center space-y-1">
                <div class="text-sm">⬅️</div>
                <div class="font-mono text-[10px] text-cyan-300 font-bold">left</div>
                <div class="text-[9px] text-slate-400 font-tajawal">المسار الأيسر</div>
              </div>
              <div class="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 text-center space-y-1">
                <div class="text-sm">➡️</div>
                <div class="font-mono text-[10px] text-cyan-300 font-bold">right</div>
                <div class="text-[9px] text-slate-400 font-tajawal">المسار الأيمن</div>
              </div>
            </div>
          </div>

          <div class="pt-6 relative z-10">
            <GamerButton
              size="md"
              variant="primary"
              rounded="2xl"
              class="w-full !bg-gradient-to-r !from-cyan-500 !to-blue-600 hover:!brightness-110 font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              @click="quickStartStream('SUBWAY_RUNNER')"
            >
              🚀 {{ isRtl ? 'تشغيل مسار الهروب السريع' : 'Launch Subway Runner' }}
            </GamerButton>
          </div>
        </div>

        <!-- BENTO CARD 2: HANGMAN / WORDLE (Tall Spotlight Card - Emerald) -->
        <div class="group relative p-7 bg-gradient-to-b from-[#0c1f19] via-[#0d1715] to-[#090d0c] border border-emerald-500/30 hover:border-emerald-400 rounded-3xl shadow-[0_10px_35px_rgba(16,185,129,0.15)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.3)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
          <div class="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl group-hover:bg-emerald-500/25 transition-all pointer-events-none" />

          <div class="relative z-10 space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-cairo font-black">
                🔤 {{ isRtl ? 'ووردل الشات التنافسي' : 'WORDLE ARENA' }}
              </span>
              <span class="text-xs font-mono text-emerald-400 font-bold bg-black/40 px-2 py-0.5 rounded-lg">
                5 ATTEMPTS
              </span>
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform">
              🕵️
            </div>

            <h3 class="font-cairo font-black text-2xl text-white group-hover:text-emerald-300 transition-colors">
              {{ isRtl ? 'الكلمة المخفية (Wordle / Hangman)' : 'Secret Word Challenge' }}
            </h3>

            <p class="text-xs text-slate-300 font-tajawal leading-relaxed">
              {{ isRtl ? 'يحدد الستريمر أو بنك الكلمات كلمة سرية، ويبدأ المشاهدون بتخمينها مع أدلة الحروف الخضراء والصفراء وجولات متعددة وسكوربورد بالنقاط!' : 'Wordle-style multi-round secret word guessing with green/yellow letter clues and grand final podium!' }}
            </p>

            <!-- Letter Clues Visual -->
            <div class="flex items-center justify-center gap-1.5 p-3 bg-black/50 rounded-2xl border border-emerald-500/20">
              <span class="w-7 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center">ف</span>
              <span class="w-7 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center">و</span>
              <span class="w-7 h-8 rounded-lg bg-amber-500 text-black font-black text-sm flex items-center justify-center">ر</span>
              <span class="w-7 h-8 rounded-lg bg-neutral-800 text-slate-400 font-black text-sm flex items-center justify-center">ت</span>
              <span class="w-7 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center">!</span>
            </div>
          </div>

          <div class="pt-6 relative z-10">
            <GamerButton
              size="md"
              variant="primary"
              rounded="2xl"
              class="w-full !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!brightness-110 font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              @click="quickStartStream('HANGMAN')"
            >
              🎯 {{ isRtl ? 'بدء تحدي الكلمات' : 'Launch Secret Word' }}
            </GamerButton>
          </div>
        </div>

        <!-- BENTO CARD 3: TYPE RACE (Medium Card - Amber Flame) -->
        <div class="group relative p-6 bg-gradient-to-br from-[#241708] via-[#1a1208] to-[#0e0a05] border border-amber-500/30 hover:border-amber-400 rounded-3xl shadow-[0_10px_35px_rgba(245,158,11,0.15)] hover:shadow-[0_15px_50px_rgba(245,158,11,0.3)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
          <div class="relative z-10 space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-cairo font-black">
                ⌨️ {{ isRtl ? 'أسرع أصابع' : 'SPEED RACER' }}
              </span>
              <span class="text-[10px] font-mono text-amber-400 font-bold">
                SELECTABLE WORDS
              </span>
            </div>

            <div class="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform">
              ⚡
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-amber-300 transition-colors">
              {{ isRtl ? 'سباق سرعة الكتابة (Type Race)' : 'Type Race Championship' }}
            </h3>

            <p class="text-xs text-slate-300 font-tajawal leading-relaxed">
              {{ isRtl ? 'تظهر كلمة واحدة على الشاشة في كل جولة، وأسرع متسابق يكتبها بدقة يحصل على النقطة! يدعم تحديد عدد الكلمات (3 حتى 20).' : 'A single word appears on screen per round. Fastest chatter to type it scores the round point. Supports 3 to 20 words!' }}
            </p>
          </div>

          <div class="pt-5 relative z-10">
            <GamerButton
              size="md"
              variant="primary"
              rounded="2xl"
              class="w-full !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!brightness-110 font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              @click="quickStartStream('TYPE_RACE')"
            >
              ⌨️ {{ isRtl ? 'انطلاق سباق السرعة' : 'Start Type Race' }}
            </GamerButton>
          </div>
        </div>

        <!-- BENTO CARD 4: HOT POTATO (Medium Card - Fiery Red Bomb) -->
        <div class="group relative p-6 bg-gradient-to-br from-[#290c0c] via-[#1c0a0a] to-[#0e0505] border border-red-500/30 hover:border-red-400 rounded-3xl shadow-[0_10px_35px_rgba(239,68,68,0.15)] hover:shadow-[0_15px_50px_rgba(239,68,68,0.3)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
          <div class="relative z-10 space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-cairo font-black">
                💣 {{ isRtl ? 'توتر وانفجار' : 'RANDOM FUSE' }}
              </span>
              <span class="text-[10px] font-mono text-red-400 font-bold">
                PASS MECHANIC
              </span>
            </div>

            <div class="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(239,68,68,0.6)] group-hover:scale-110 transition-transform">
              🔥
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-red-300 transition-colors">
              {{ isRtl ? 'القنبلة الموقوتة (Hot Potato)' : 'Hot Potato Detonation' }}
            </h3>

            <p class="text-xs text-slate-300 font-tajawal leading-relaxed">
              {{ isRtl ? 'قنبلة بفتيل سري تتنقل بين المشاركين بأوامر التمرير (!pass 3 أو !مرر أحمد)، وتنفجر في يد حاملها عند الصفر مع مؤثرات صوتية وبصرية!' : 'A ticking plasma bomb passed between chatters with !pass commands. When the secret timer hits zero, it explodes!' }}
            </p>
          </div>

          <div class="pt-5 relative z-10">
            <GamerButton
              size="md"
              variant="primary"
              rounded="2xl"
              class="w-full !bg-gradient-to-r !from-red-600 !to-orange-600 hover:!brightness-110 font-black text-xs shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              @click="quickStartStream('HOT_POTATO')"
            >
              💣 {{ isRtl ? 'بدء القنبلة الموقوتة' : 'Launch Hot Potato' }}
            </GamerButton>
          </div>
        </div>

        <!-- BENTO CARD 5: TRIVIA QUIZ (Medium Card - Cyber Violet) -->
        <div class="group relative p-6 bg-gradient-to-br from-[#160d29] via-[#110a20] to-[#090512] border border-purple-500/30 hover:border-purple-400 rounded-3xl shadow-[0_10px_35px_rgba(168,85,247,0.15)] hover:shadow-[0_15px_50px_rgba(168,85,247,0.3)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
          <div class="relative z-10 space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-cairo font-black">
                🧠 {{ isRtl ? 'معلومات وأسئلة' : 'LIVE AUDIENCE POLL' }}
              </span>
              <span class="text-[10px] font-mono text-purple-400 font-bold">
                4 CHOICES
              </span>
            </div>

            <div class="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:scale-110 transition-transform">
              💡
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-purple-300 transition-colors">
              {{ isRtl ? 'تحدي الأسئلة والذكاء (Trivia Quiz)' : 'Live Trivia Arena' }}
            </h3>

            <p class="text-xs text-slate-300 font-tajawal leading-relaxed">
              {{ isRtl ? 'أسئلة تفاعلية بـ 4 خيارات في الأنمي والألعاب والسينما والرياضة، مع أعمدة تصويت حية وتكبير الإجابة الصحيحة واحتساب أسرع إجابة.' : 'Real-time 4-option trivia arena across Anime, Gaming, Cinema, and Science with live vote percentage bars!' }}
            </p>
          </div>

          <div class="pt-5 relative z-10">
            <GamerButton
              size="md"
              variant="primary"
              rounded="2xl"
              class="w-full !bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!brightness-110 font-black text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              @click="quickStartStream('TRIVIA')"
            >
              🧠 {{ isRtl ? 'بدء مسابقة الأسئلة' : 'Launch Trivia' }}
            </GamerButton>
          </div>
        </div>

        <!-- BENTO CARD 6: STREAM ROULETTE (Medium Card - Indigo Primary) -->
        <div class="group relative p-6 bg-gradient-to-br from-[#0e122b] via-[#0b0e20] to-[#070914] border border-indigo-500/30 hover:border-indigo-400 rounded-3xl shadow-[0_10px_35px_rgba(99,102,241,0.15)] hover:shadow-[0_15px_50px_rgba(99,102,241,0.3)] transition-all duration-500 flex flex-col justify-between overflow-hidden">
          <div class="relative z-10 space-y-4" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-cairo font-black">
                🎯 {{ isRtl ? 'الكلاسيكية المحبوبة' : 'ELIMINATION' }}
              </span>
              <span class="text-[10px] font-mono text-indigo-400 font-bold">
                LAST STANDING
              </span>
            </div>

            <div class="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(99,102,241,0.6)] group-hover:scale-110 transition-transform">
              🎲
            </div>

            <h3 class="font-cairo font-black text-xl text-white group-hover:text-indigo-300 transition-colors">
              {{ isRtl ? 'روليت الاستبعاد (Stream Roulette)' : 'Roulette Elimination' }}
            </h3>

            <p class="text-xs text-slate-300 font-tajawal leading-relaxed">
              {{ isRtl ? 'عجلة الحظ تدور لاختيار صاحب الدور، ويختار متسابقاً لتصفيته بأمر !kill أو إنعاش زميل له. البطل الأخير الصامد يفوز بالعرش!' : 'The wheel spins to select an executioner who has 15s to eliminate an opponent or revive an ally. Last survivor wins!' }}
            </p>
          </div>

          <div class="pt-5 relative z-10">
            <GamerButton
              size="md"
              variant="primary"
              rounded="2xl"
              class="w-full !bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!brightness-110 font-black text-xs shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              @click="quickStartStream('ROULETTE')"
            >
              🎯 {{ isRtl ? 'بدء روليت الاستبعاد' : 'Launch Roulette' }}
            </GamerButton>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= 3. HOW IT WORKS (3 STREAMLINED STEPS) ================= -->
    <div class="relative p-8 sm:p-12 bg-gradient-to-b from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 rounded-3xl backdrop-blur-2xl space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-cairo font-bold">
          ⚡ {{ isRtl ? 'بساطة فائقة بدون تعقيد' : 'Seamless 3-Step Setup' }}
        </div>
        <h2 class="font-cairo font-black text-3xl sm:text-4xl text-white">
          {{ isRtl ? 'ابدأ اللعب في بثك خلال 15 ثانية فقط' : 'Ready to Stream in 15 Seconds' }}
        </h2>
        <p class="text-sm font-tajawal text-slate-400">
          {{ isRtl ? 'صممنا المنظومة لتكون خفيفة تماماً على جهاز الستريمر بدون تثبيت برامج أو تفعيل بوتات معقدة.' : 'No heavy client installations, no complex bot authorizations. Just pure browser-native speed.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" :class="isRtl ? 'text-right' : 'text-left'">
        <!-- Step 1 -->
        <div class="relative p-6 rounded-2xl bg-[#0d111c]/80 border border-white/10 space-y-4 hover:border-indigo-500/50 transition-all group">
          <div class="flex items-center justify-between">
            <span class="font-display font-black text-3xl text-indigo-400/30 group-hover:text-indigo-400 transition-colors">01</span>
            <span class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl">✍️</span>
          </div>
          <h4 class="font-cairo font-black text-lg text-white">
            {{ isRtl ? 'أدخل اسم قناتك' : 'Enter Your Channel' }}
          </h4>
          <p class="text-xs font-tajawal text-slate-400 leading-relaxed">
            {{ isRtl ? 'اختر المنصة (Twitch أو Kick أو TikTok) واكتب اسم القناة فقط. المنظومة ترتبط بالشات فوراً بدون كلمات مرور.' : 'Pick your platform and enter channel name. The IRC socket links to your chat instantly.' }}
          </p>
        </div>

        <!-- Step 2 -->
        <div class="relative p-6 rounded-2xl bg-[#0d111c]/80 border border-white/10 space-y-4 hover:border-cyan-500/50 transition-all group">
          <div class="flex items-center justify-between">
            <span class="font-display font-black text-3xl text-cyan-400/30 group-hover:text-cyan-400 transition-colors">02</span>
            <span class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">🎥</span>
          </div>
          <h4 class="font-cairo font-black text-lg text-white">
            {{ isRtl ? 'انسخ رابط الـ Overlay لـ OBS' : 'Paste Overlay to OBS' }}
          </h4>
          <p class="text-xs font-tajawal text-slate-400 leading-relaxed">
            {{ isRtl ? 'أضف Browser Source في OBS بأبعاد 1920x1080. ستحصل على شاشة شفافة تفاعلية 60FPS بدون استهلاك لمعالجك.' : 'Add a Browser Source at 1920x1080. Enjoy a 100% transparent 60FPS overlay with zero GPU load.' }}
          </p>
        </div>

        <!-- Step 3 -->
        <div class="relative p-6 rounded-2xl bg-[#0d111c]/80 border border-white/10 space-y-4 hover:border-emerald-500/50 transition-all group">
          <div class="flex items-center justify-between">
            <span class="font-display font-black text-3xl text-emerald-400/30 group-hover:text-emerald-400 transition-colors">03</span>
            <span class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">🎮</span>
          </div>
          <h4 class="font-cairo font-black text-lg text-white">
            {{ isRtl ? 'الشات يلعب مباشرة وبدون !join' : 'Chat Plays Instantly' }}
          </h4>
          <p class="text-xs font-tajawal text-slate-400 leading-relaxed">
            {{ isRtl ? 'يكتب المشاهدون الأوامر والكلمات في الشات، وتتحرك اللعبة في شاشة البث مباشرة مع لوحات صدارة وتتويج آلي!' : 'Viewers chat directly. Games resolve automatically with instant leaderboards and crowned winners!' }}
          </p>
        </div>
      </div>
    </div>

    <!-- ================= 4. BROADCAST ADVANTAGES ================= -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" :class="isRtl ? 'text-right' : 'text-left'">
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
        <div class="text-2xl">⚡</div>
        <div class="font-cairo font-black text-sm text-white">{{ isRtl ? 'استجابة فائقة السرعة' : 'Ultra-Fast Sockets' }}</div>
        <div class="text-xs font-tajawal text-slate-400 leading-relaxed">
          {{ isRtl ? 'معالجة مباشرة لأوامر الشات في أجزاء من الثانية لمزامنة البث الحي دون أي تأخير.' : 'Sub-millisecond chat message processing synchronized with your live stream.' }}
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
        <div class="text-2xl">🛡️</div>
        <div class="font-cairo font-black text-sm text-white">{{ isRtl ? 'حماية وتحكم الستريمر' : 'Broadcaster Controls' }}</div>
        <div class="text-xs font-tajawal text-slate-400 leading-relaxed">
          {{ isRtl ? 'تحكم كامل من الستريمر بإعادة ضبط الجولات، اختيار بنك الأسئلة، وطرد المخالفين.' : 'Complete host controls to pause, skip, reset rounds, or customize game rules.' }}
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
        <div class="text-2xl">🎨</div>
        <div class="font-cairo font-black text-sm text-white">{{ isRtl ? 'شفافية كاملة لـ OBS' : '100% Alpha Transparent' }}</div>
        <div class="text-xs font-tajawal text-slate-400 leading-relaxed">
          {{ isRtl ? 'طبقات ألعاب شفافة تمتزج بانسيابية فوق كاميرا اللعب في OBS أو Streamlabs.' : 'Clean transparent overlays that float naturally above your webcam and gameplay.' }}
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
        <div class="text-2xl">🏆</div>
        <div class="font-cairo font-black text-sm text-white">{{ isRtl ? 'تتويج وسكوربورد آلي' : 'Automated Podium' }}</div>
        <div class="text-xs font-tajawal text-slate-400 leading-relaxed">
          {{ isRtl ? 'احتساب دقيق للنقاط وترتيب الفائزين بالميداليات مع مؤثرات الاحتفال والكونفيتي.' : 'Automatic medal rankings, score accumulation, and celebratory confetti effects.' }}
        </div>
      </div>
    </div>

    <!-- ================= 5. FINAL CALL-TO-ACTION LAUNCHPAD ================= -->
    <div class="relative p-10 sm:p-14 bg-gradient-to-r from-indigo-950/80 via-[#0e1324]/90 to-purple-950/80 border-2 border-indigo-500/40 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.25)] text-center space-y-6 overflow-hidden">
      <!-- Glow ambient orb -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-[500px] h-[300px] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" />
      </div>

      <div class="relative z-10 space-y-3 max-w-2xl mx-auto">
        <div class="text-3xl sm:text-4xl">🚀🎮🔥</div>
        <h2 class="font-cairo font-black text-3xl sm:text-5xl text-white tracking-tight">
          {{ isRtl ? 'هل أنت مستعد لإشعال بثك المباشر؟' : 'Ready to Elevate Your Live Stream?' }}
        </h2>
        <p class="text-sm sm:text-base font-tajawal text-indigo-200/90 leading-relaxed">
          {{ isRtl ? 'اختر أي لعبة الآن وابدأ بث تفاعلي يرفع تفاعل الشات والمشاهدات فوراً!' : 'Pick your favorite game mode and launch an interactive stream in seconds!' }}
        </p>
      </div>

      <div class="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <NuxtLink to="/dashboard">
          <GamerButton
            size="lg"
            variant="primary"
            rounded="2xl"
            class="px-9 py-4 font-black text-base !bg-gradient-to-r !from-indigo-500 !via-purple-500 !to-cyan-400 shadow-[0_0_35px_rgba(99,102,241,0.6)] hover:!brightness-110 cursor-pointer"
          >
            <span>🎮 {{ isRtl ? 'انتقل لغرفة الألعاب والتحكم' : 'Go to Game Room' }}</span>
            <span :class="isRtl ? 'rotate-180' : ''">→</span>
          </GamerButton>
        </NuxtLink>

        <button
          type="button"
          class="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-cairo font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          @click="showPlatformModal = true"
        >
          <span>🌐</span>
          <span>{{ isRtl ? 'ربط القناة والمنصات' : 'Connect Channel & Platforms' }}</span>
        </button>
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
      :initial-channel="twitchChannelInput"
      @close="showPlatformModal = false"
      @connect="onModalConnect"
    />
  </div>
</template>
