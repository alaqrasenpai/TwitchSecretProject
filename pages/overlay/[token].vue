<script setup lang="ts">
import confetti from 'canvas-confetti';
import type { IGameSession } from '~/types/game';
import { useAudioSfx } from '~/composables/useAudioSfx';
import { useGameSync } from '~/composables/useSocket';
import { useTranslation, formatGameLog, getDisplayCommands } from '~/composables/useTranslation';
import RouletteWheel from '~/components/game/RouletteWheel.vue';
import TriviaStage from '~/components/game/TriviaStage.vue';
import BoardPartyStage from '~/components/game/BoardPartyStage.vue';
import GridRoyaleStage from '~/components/game/GridRoyaleStage.vue';
import TypeRaceStage from '~/components/game/TypeRaceStage.vue';
import HangmanStage from '~/components/game/HangmanStage.vue';
import HotPotatoStage from '~/components/game/HotPotatoStage.vue';
import SubwayRunnerStage from '~/components/game/SubwayRunnerStage.vue';
import PlayerGrid from '~/components/game/PlayerGrid.vue';
import TurnTimer from '~/components/game/TurnTimer.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
import CombatEventNotification from '~/components/game/CombatEventNotification.vue';

definePageMeta({
  layout: 'overlay',
  pageTransition: false,
  layoutTransition: false
});

const route = useRoute();
const overlayToken = computed(() => route.params.token as string);

const session = ref<IGameSession | null>(null);
const isSpinning = ref(false);
const audio = useAudioSfx();
const gameSync = useGameSync();
const { t, isRtl, setLocale } = useTranslation();

const players = computed(() => session.value?.players || []);
const alivePlayers = computed(() => players.value.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED'));
const activePlayer = computed(() => {
  if (!session.value?.activePlayerNumber) return null;
  return players.value.find((p) => p.number === session.value!.activePlayerNumber) || null;
});
const activePlayerCanRevive = computed(() => {
  if (!activePlayer.value) return false;
  if (!session.value?.settings?.allowRevives) return false;
  if ((activePlayer.value.revivesUsed || 0) >= (session.value.settings.maxRevivesPerGame || 1)) return false;
  return players.value.some((p) => p.status === 'ELIMINATED' && (p.timesRevived || 0) === 0);
});
const activePlayerReviveAlreadyUsed = computed(() => {
  if (!activePlayer.value) return false;
  return (activePlayer.value.revivesUsed || 0) >= 1;
});
const winner = computed(() => session.value?.winner || null);
const status = computed(() => session.value?.status || 'LOBBY');

const rankedOverlayPlayers = computed(() => {
  const winUser = winner.value?.username?.toLowerCase();
  return [...players.value].sort((a, b) => {
    if (winUser && a.username.toLowerCase() === winUser) return -1;
    if (winUser && b.username.toLowerCase() === winUser) return 1;
    const aAlive = a.status === 'ALIVE' || a.status === 'REVIVED';
    const bAlive = b.status === 'ALIVE' || b.status === 'REVIVED';
    if (aAlive && !bAlive) return -1;
    if (!aAlive && bAlive) return 1;
    const killsA = a.killsCount || 0;
    const killsB = b.killsCount || 0;
    if (killsB !== killsA) return killsB - killsA;
    return a.number - b.number;
  });
});

watch(
  () => session.value?.status,
  (newStatus) => {
    if (newStatus === 'SPINNING') {
      isSpinning.value = true;
    } else if (newStatus !== 'WAITING_ACTION') {
      isSpinning.value = false;
    }

    if (newStatus === 'FINISHED' && winner.value) {
      audio.playVictoryFanfare();
      triggerConfetti();
    }
  }
);

watch(
  () => session.value?.logs?.[0]?.id,
  () => {
    const latest = session.value?.logs?.[0];
    if (!latest) return;

    if (latest.type === 'KILL' || latest.type === 'BOMB_EXPLODE') {
      try {
        audio.playBombExplosion();
      } catch (e) {
        audio.playEliminationSound();
      }
    } else if (latest.type === 'BOMB_PASS') {
      try {
        audio.playBombTick(false);
      } catch (e) {}
    } else if (latest.type === 'REVIVE') {
      audio.playReviveSound();
    } else if (latest.type === 'SUBWAY_CRASH') {
      audio.playRunnerCrash();
    } else if (latest.type === 'SUBWAY_SPEED_UP') {
      audio.playRunnerSpeedUp();
    }
  }
);

function triggerConfetti() {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#dc2626', '#ffffff', '#eab308', '#991b1b']
    });
  } catch (e) {}
}

let overlaySyncInterval: any = null;

async function fetchLatestOverlayState() {
  if (!overlayToken.value || isSpinning.value) return;
  try {
    const res = await $fetch<{ success: boolean; session: IGameSession }>(`/api/overlay/${overlayToken.value}`);
    if (res.success && res.session) {
      session.value = res.session;
    }
  } catch (e) {}
}

onMounted(async () => {
  if (route.query.lang === 'ar' || route.query.lang === 'en') {
    setLocale(route.query.lang as any);
  }

  await fetchLatestOverlayState();

  // Connect to live SSE overlay stream for instantaneous push updates
  gameSync.connectToOverlayStream(overlayToken.value, (updatedSession) => {
    if (updatedSession) {
      session.value = updatedSession;
    }
  });

  // Fast periodic backup polling (ensures OBS Browser Source never desyncs)
  if (typeof window !== 'undefined') {
    overlaySyncInterval = setInterval(fetchLatestOverlayState, 2000);
  }
});

onUnmounted(() => {
  if (overlaySyncInterval) {
    clearInterval(overlaySyncInterval);
  }
});
</script>

<template>
  <div class="w-full h-full p-6 flex flex-col justify-between text-arena-textMain font-cairo select-none" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Combat Event Animation Notification (Kill & Revive) -->
    <CombatEventNotification :latest-log="session?.logs?.[0] || null" />

    <!-- Top Stream HUD Header -->
    <div class="flex items-center justify-between p-5 bg-arena-dark/95 border border-arena-borderLight/80 rounded-3xl shadow-glow-crimson backdrop-blur-xl">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-tr from-arena-blood via-red-600 to-arena-crimson rounded-2xl flex items-center justify-center shadow-glow-crimson border border-red-400/40">
          <span class="font-display font-black text-white text-xl">CW</span>
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="font-cairo font-black text-2xl text-white">
              CHATWAR // {{ session?.gameType || 'ROULETTE' }}
            </h1>
            <GamerBadge
              :status="status === 'LOBBY' ? 'LIVE' : 'ALIVE'"
              :label="status === 'LOBBY' ? t('liveLobby') : t('running')"
              size="sm"
            />
          </div>
          <div class="font-tajawal text-xs text-arena-textMuted flex items-center gap-3 mt-1">
            <span v-if="isRtl">
              اكتب <strong class="text-arena-crimson font-bold font-mono">{{ getDisplayCommands(session?.settings?.customCommands?.join, 'join', true).slice(0, 2).join(' / ') }}</strong> في الشات للدخول
            </span>
            <span v-else>
              Type <strong class="text-arena-crimson font-bold font-mono">{{ getDisplayCommands(session?.settings?.customCommands?.join, 'join', false).slice(0, 2).join(' / ') }}</strong> in chat to enter
            </span>
            <span>•</span>
            <span class="text-emerald-400 font-bold">{{ alivePlayers.length }} {{ t('alive') }}</span>
          </div>
        </div>
      </div>

      <!-- Turn Timer (Active when turn is active and wheel stopped spinning) -->
      <div v-if="status === 'WAITING_ACTION' && !isSpinning && session?.timerEndsAt" class="w-80">
        <TurnTimer
          :timer-ends-at="session?.timerEndsAt"
          :total-duration-seconds="session?.settings?.turnTimeLimitSeconds || 15"
        />
      </div>
    </div>

    <!-- Center Stage: Board Party, Trivia or Large Animated Wheel -->
    <div class="flex-1 flex items-center justify-center my-4 relative min-h-0">
      <!-- BOARD PARTY MODE OVERLAY STAGE -->
      <BoardPartyStage
        v-if="session?.gameType === 'BOARD_PARTY'"
        :session="session"
        :is-admin="false"
      />

      <!-- TRIVIA QUIZ MODE OVERLAY STAGE -->
      <TriviaStage
        v-else-if="session?.gameType === 'TRIVIA'"
        :session="session"
        :is-admin="false"
      />

      <!-- GRID ROYALE SURVIVAL OVERLAY STAGE -->
      <GridRoyaleStage
        v-else-if="session?.gameType === 'GRID_ROYALE'"
        :session="session"
        :is-admin="false"
      />

      <!-- TYPE RACE SPEED OVERLAY STAGE -->
      <TypeRaceStage
        v-else-if="session?.gameType === 'TYPE_RACE'"
        :session="session"
        :is-admin="false"
      />

      <!-- HANGMAN SECRET WORD OVERLAY STAGE -->
      <HangmanStage
        v-else-if="session?.gameType === 'HANGMAN'"
        :session="session"
        :is-admin="false"
      />

      <!-- HOT POTATO TICKING BOMB OVERLAY STAGE -->
      <HotPotatoStage
        v-else-if="session?.gameType === 'HOT_POTATO'"
        :session="session"
        :is-admin="false"
      />

      <!-- SUBWAY RUNNER OVERLAY STAGE -->
      <SubwayRunnerStage
        v-else-if="session?.gameType === 'SUBWAY_RUNNER'"
        :session="session"
        :is-admin="false"
        :is-overlay="true"
      />

      <!-- ROULETTE MODE OVERLAY STAGE -->
      <div v-else class="flex flex-col items-center">
        <!-- Big High-Impact Roulette Wheel -->
        <RouletteWheel
          :players="players"
          :selected-player-number="activePlayer?.number || null"
          :is-spinning="isSpinning"
          :size="520"
          @spin-complete="isSpinning = false"
        />

        <!-- Active Player Turn Instructions & Powers Display -->
        <div
          v-if="status === 'WAITING_ACTION' && !isSpinning && activePlayer"
          class="mt-4 px-8 py-3 bg-arena-cardHover/95 border-2 border-arena-crimson rounded-3xl shadow-glow-crimson text-center space-y-2 animate-pulse max-w-2xl backdrop-blur-xl"
        >
          <!-- Active Player Name & Number Header -->
          <div class="font-cairo font-black text-xl text-white flex items-center justify-center gap-2">
            <span>👉 {{ t('turnOfPlayer') }} #{{ activePlayer.number }} ({{ activePlayer.displayName }})</span>
          </div>

          <!-- Powers Available Badge Row -->
          <div class="flex items-center justify-center gap-2 font-cairo text-xs font-black">
            <span class="text-neutral-300 font-bold">{{ t('availablePowersTitle') }}</span>
            <template v-if="activePlayerCanRevive">
              <span class="px-2.5 py-0.5 bg-red-600 text-white rounded-full shadow-glow-crimson flex items-center gap-1">
                💥 {{ isRtl ? 'قتل' : 'Kill' }}
              </span>
              <span class="text-amber-300 font-bold">+</span>
              <span class="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-full shadow-glow-gold flex items-center gap-1">
                ✨ {{ isRtl ? 'إنعاش' : 'Revive' }}
              </span>
            </template>
            <template v-else>
              <span class="px-2.5 py-0.5 bg-red-600 text-white rounded-full shadow-glow-crimson flex items-center gap-1">
                💥 {{ isRtl ? 'قتل فقط' : 'Kill Only' }}
              </span>
              <span class="text-[10px] font-tajawal text-neutral-400 font-normal">
                ({{ activePlayerReviveAlreadyUsed ? t('reviveUsedNote') : t('noRevivableNote') }})
              </span>
            </template>
          </div>

          <!-- Chat Command Instructions -->
          <div class="font-tajawal text-sm text-red-200">
            <template v-if="isRtl">
              <span>اكتب في الشات: </span>
              <code class="text-white font-bold bg-red-700 px-2.5 py-0.5 rounded-full">{{ getDisplayCommands(session?.settings?.customCommands?.kill, 'kill', true).slice(0, 2).join(' / ') }} &lt;رقم&gt;</code>
              <span v-if="activePlayerCanRevive"> أو <code class="text-white font-bold bg-amber-600 px-2.5 py-0.5 rounded-full">{{ getDisplayCommands(session?.settings?.customCommands?.revive, 'revive', true).slice(0, 2).join(' / ') }} &lt;رقم&gt;</code></span>
            </template>
            <template v-else>
              <span>Type in chat: </span>
              <code class="text-white font-bold bg-red-700 px-2.5 py-0.5 rounded-full">{{ getDisplayCommands(session?.settings?.customCommands?.kill, 'kill', false).slice(0, 2).join(' / ') }} &lt;number&gt;</code>
              <span v-if="activePlayerCanRevive"> or <code class="text-white font-bold bg-amber-600 px-2.5 py-0.5 rounded-full">{{ getDisplayCommands(session?.settings?.customCommands?.revive, 'revive', false).slice(0, 2).join(' / ') }} &lt;number&gt;</code></span>
            </template>
          </div>
        </div>
      </div>

      <!-- Grand Roulette Combat Scoreboard Overlay -->
      <div
        v-if="status === 'FINISHED' && winner && session?.gameType === 'ROULETTE'"
        class="absolute inset-0 flex items-center justify-center bg-arena-dark/95 backdrop-blur-2xl rounded-3xl border-2 border-arena-crimson shadow-glow-crimson z-30 p-6 animate-scale-up"
      >
        <div class="max-w-xl w-full text-center space-y-4">
          <div class="inline-flex items-center gap-2 px-4 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-cairo font-black uppercase tracking-widest shadow-glow-crimson">
            🏆 {{ isRtl ? 'لوحة الشرف ونتائج المعركة النهائية' : 'ROULETTE COMBAT SCOREBOARD' }}
          </div>

          <!-- Winner Spotlight Card -->
          <div class="p-4 bg-gradient-to-r from-red-950/80 via-neutral-900 to-amber-950/80 rounded-2xl border border-red-500/60 flex items-center justify-between gap-4 shadow-glow-crimson">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative shrink-0">
                <img
                  :src="winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${winner.username}`"
                  class="w-16 h-16 rounded-full border-3 border-amber-400 shadow-glow-crimson"
                />
                <span class="absolute -top-2.5 -right-2 text-xl animate-bounce">👑</span>
              </div>
              <div :class="isRtl ? 'text-right' : 'text-left'" class="min-w-0">
                <div class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {{ t('championDeclared') }} • {{ t('soleSurvivor') }}
                </div>
                <div class="text-2xl font-black text-white font-cairo truncate">
                  #{{ winner.number }} // {{ winner.displayName }}
                </div>
                <div class="text-xs text-red-300 font-mono">@{{ winner.username }}</div>
              </div>
            </div>

            <div class="text-right font-mono shrink-0">
              <span class="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/50 font-black text-sm">
                🎯 {{ winner.killsCount || 0 }} {{ t('totalKills') }}
              </span>
            </div>
          </div>

          <!-- Full Combat Rankings Table -->
          <div class="space-y-1.5" :class="isRtl ? 'text-right' : 'text-left'">
            <div class="flex items-center justify-between text-xs font-cairo font-bold text-red-300 px-1">
              <span>📊 {{ isRtl ? 'ترتيب المتسابقين حسب البقاء والقتلات:' : 'Contenders Leaderboard & Kills:' }}</span>
              <span class="text-[10px] font-mono text-slate-400">{{ rankedOverlayPlayers.length }} {{ isRtl ? 'لاعب' : 'players' }}</span>
            </div>

            <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              <template v-for="(p, idx) in rankedOverlayPlayers" :key="p.username">
                <div
                  class="flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all"
                  :class="[
                    idx === 0 ? 'bg-red-950/70 border-amber-400/80 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                    idx === 1 ? 'bg-neutral-800/80 border-neutral-600 text-neutral-200' :
                    idx === 2 ? 'bg-red-950/30 border-red-800 text-red-200' :
                    'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                  ]"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="font-mono font-bold text-xs shrink-0" :class="idx < 3 ? 'text-amber-400' : 'text-neutral-500'">
                      {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                    </span>
                    <img
                      :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`"
                      class="w-7 h-7 rounded-full border shrink-0"
                      :class="p.status === 'ALIVE' || p.status === 'REVIVED' ? 'border-red-400' : 'border-red-900/60 grayscale'"
                    />
                    <div class="min-w-0">
                      <div class="font-cairo font-bold text-white truncate flex items-center gap-1.5">
                        <span>#{{ p.number }}</span>
                        <span class="truncate">{{ p.displayName }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 font-mono shrink-0">
                    <span class="text-[10px] text-red-300 font-bold">
                      🎯 {{ p.killsCount || 0 }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded text-[9px] font-bold uppercase border"
                      :class="p.status === 'ALIVE' || p.status === 'REVIVED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : 'bg-red-950 text-red-400 border-red-500/50'"
                    >
                      {{ p.status === 'ALIVE' || p.status === 'REVIVED' ? (isRtl ? 'صامد 🏆' : 'ALIVE 🏆') : (isRtl ? 'مستبعد 💀' : 'OUT 💀') }}
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom HUD: Contender Roster & Action Ticker (For Roulette mode) -->
    <div v-if="session?.gameType === 'ROULETTE'" class="p-5 bg-arena-dark/95 border border-arena-border rounded-3xl backdrop-blur-xl shadow-arena-card">
      <div class="flex items-center justify-between mb-3 pb-2 border-b border-arena-border/60">
        <span class="font-cairo font-black text-xs text-arena-textMuted">
          {{ t('contendersRoster') }} ({{ players.length }})
        </span>
        <span class="font-tajawal text-xs text-arena-crimson font-bold">
          {{ t('latestEvent') }}: {{ isSpinning ? (isRtl ? 'العجلة تدور الآن... 🎡' : 'The wheel is spinning... 🎡') : (formatGameLog(session?.logs?.[0], isRtl) || t('awaitingCommands')) }}
        </span>
      </div>

      <PlayerGrid
        :players="players"
        :active-player-number="!isSpinning && status === 'WAITING_ACTION' ? activePlayer?.number || null : null"
        :target-player-number="!isSpinning ? session?.targetPlayerNumber || null : null"
        :is-controller-mode="false"
      />
    </div>
  </div>
</template>
