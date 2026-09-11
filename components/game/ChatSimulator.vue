<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';

const props = defineProps<{
  activePlayerUsername?: string;
  activePlayerNumber?: number | null;
  playersCount: number;
  verificationCode?: string;
  isBroadcasterVerified?: boolean;
  streamerUsername?: string;
  gameType?: string;
  currentWord?: string;
}>();

const emit = defineEmits<{
  (e: 'sendCommand', username: string, message: string): void;
  (e: 'populateMockPlayers', count: number): void;
}>();

const { t, isRtl } = useTranslation();

const customUser = ref('Viewer_Ahmed');
const customMessage = ref('!join');

function submitCustom() {
  if (!customUser.value || !customMessage.value) return;
  emit('sendCommand', customUser.value.trim(), customMessage.value.trim());
  customMessage.value = '';
}

function sendQuick(cmd: string, usernameOverride?: string) {
  const user = usernameOverride || props.activePlayerUsername || 'TestViewer';
  emit('sendCommand', user, cmd);
}

function simulateRandomTriviaVote(choiceStr: string) {
  const sampleUsers = ['Fahad_Gamer', 'Sara_Twitch', 'Kareem99', 'Nasser_Pro', 'Reem_Live', 'Omar_Stream', 'Tariq_VIP'];
  const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
  emit('sendCommand', randomUser, choiceStr);
}

function sendVerify() {
  if (!props.verificationCode) return;
  const broadcaster = props.streamerUsername || 'streamer';
  emit('sendCommand', broadcaster, `!verify ${props.verificationCode}`);
}

function sendHotPotatoPass(targetNum?: number) {
  const user = props.activePlayerUsername || 'BombHolder';
  const cmd = targetNum !== undefined ? `!pass ${targetNum}` : '!pass';
  emit('sendCommand', user, cmd);
}
</script>

<template>
  <div class="p-5 bg-arena-card/90 border border-arena-border rounded-2xl shadow-arena-card" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-between pb-3 mb-4 border-b border-arena-border/60">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-arena-crimson animate-ping" />
        <h4 class="font-cairo font-black text-sm text-white">
          {{ t('simulatorTitle') }}
        </h4>
      </div>
      <span class="text-xs font-tajawal text-arena-textDark">
        {{ t('simulatorSubtitle') }}
      </span>
    </div>

    <!-- Quick Action Helper Bar -->
    <div class="flex flex-wrap gap-2.5 mb-4">
      <button
        v-if="!isBroadcasterVerified && verificationCode"
        type="button"
        class="px-4 py-1.5 text-xs font-cairo font-bold bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
        @click="sendVerify"
      >
        <span>🛡️</span>
        <span>{{ t('simulateVerifyFrom') }}</span>
      </button>

      <!-- Trivia Specific Quick Actions -->
      <template v-if="gameType === 'TRIVIA'">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 rounded-full transition-all flex items-center gap-1"
          @click="simulateRandomTriviaVote('1')"
        >
          <span>🗳️</span>
          <span>تصويت (A / 1)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-full transition-all flex items-center gap-1"
          @click="simulateRandomTriviaVote('2')"
        >
          <span>🗳️</span>
          <span>تصويت (B / 2)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-full transition-all flex items-center gap-1"
          @click="simulateRandomTriviaVote('3')"
        >
          <span>🗳️</span>
          <span>تصويت (C / 3)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-full transition-all flex items-center gap-1"
          @click="simulateRandomTriviaVote('4')"
        >
          <span>🗳️</span>
          <span>تصويت (D / 4)</span>
        </button>
      </template>

      <!-- Board Party Specific Quick Actions -->
      <template v-else-if="gameType === 'BOARD_PARTY'">
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-arena-cardLight hover:bg-arena-cardHover text-emerald-300 border border-emerald-500/40 rounded-full transition-all"
          @click="$emit('populateMockPlayers', 6)"
        >
          {{ t('autoFillBtn') }}
        </button>

        <button
          type="button"
          class="px-3.5 py-1.5 text-xs font-cairo font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!roll')"
        >
          <span>🎲</span>
          <span>رمي النرد (!roll)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!up')"
        >
          <span>⬆️</span>
          <span>!up</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!down')"
        >
          <span>⬇️</span>
          <span>!down</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!left')"
        >
          <span>⬅️</span>
          <span>!left</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!right')"
        >
          <span>➡️</span>
          <span>!right</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-full transition-all flex items-center gap-1"
          @click="sendQuick('A')"
        >
          <span>🧠</span>
          <span>إجابة (A)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-full transition-all flex items-center gap-1"
          @click="sendQuick('B')"
        >
          <span>🧠</span>
          <span>إجابة (B)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-full transition-all flex items-center gap-1"
          @click="sendQuick('!zone 1')"
        >
          <span>⚡</span>
          <span>!zone 1</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-full transition-all flex items-center gap-1"
          @click="sendQuick('!zone 2')"
        >
          <span>⚡</span>
          <span>!zone 2</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-full transition-all flex items-center gap-1"
          @click="sendQuick('!zone 3')"
        >
          <span>⚡</span>
          <span>!zone 3</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-full transition-all flex items-center gap-1"
          @click="sendQuick('!zone 4')"
        >
          <span>⚡</span>
          <span>!zone 4</span>
        </button>
      </template>

      <!-- Grid Royale Specific Quick Actions -->
      <template v-else-if="gameType === 'GRID_ROYALE'">
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-arena-cardLight hover:bg-arena-cardHover text-cyan-300 border border-cyan-500/40 rounded-full transition-all"
          @click="$emit('populateMockPlayers', 6)"
        >
          {{ t('autoFillBtn') }}
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!A1')"
        >
          <span>🏃</span>
          <span>!A1</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!B2')"
        >
          <span>🏃</span>
          <span>!B2</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!B3')"
        >
          <span>🏃</span>
          <span>!B3</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!C2')"
        >
          <span>🏃</span>
          <span>!C2</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!C3')"
        >
          <span>🏃</span>
          <span>!C3</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!D4')"
        >
          <span>🏃</span>
          <span>!D4</span>
        </button>
      </template>

      <!-- Type Race Specific Quick Actions -->
      <template v-else-if="gameType === 'TYPE_RACE'">
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-arena-cardLight hover:bg-arena-cardHover text-amber-300 border border-amber-500/40 rounded-full transition-all"
          @click="$emit('populateMockPlayers', 6)"
        >
          {{ t('autoFillBtn') }}
        </button>

        <button
          v-if="currentWord"
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-amber-950/90 hover:bg-amber-800 text-amber-300 border border-amber-400 rounded-full transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse"
          @click="sendQuick(currentWord, 'FastRacer99')"
        >
          <span>⚡</span>
          <span>كتابة سريعة: [{{ currentWord }}]</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('فورتنايت', 'Fahad_Pro')"
        >
          <span>⌨️</span>
          <span>فورتنايت</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('كلاش اوف كلانس', 'Sara_VIP')"
        >
          <span>⌨️</span>
          <span>كلاش اوف كلانس</span>
        </button>
      </template>

      <!-- Hangman Specific Quick Actions -->
      <template v-else-if="gameType === 'HANGMAN'">
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-arena-cardLight hover:bg-arena-cardHover text-emerald-300 border border-emerald-500/40 rounded-full transition-all"
          @click="$emit('populateMockPlayers', 6)"
        >
          {{ t('autoFillBtn') }}
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!guess ماينكرافت', 'SmartGuesser1')"
        >
          <span>🕵️</span>
          <span>!guess ماينكرافت</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!guess ون بيس', 'AnimeFan')"
        >
          <span>🕵️</span>
          <span>!guess ون بيس</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('!تخمين فورتنايت', 'GamerOmar')"
        >
          <span>🟩</span>
          <span>!تخمين فورتنايت</span>
        </button>
      </template>

      <!-- Hot Potato Specific Quick Actions -->
      <template v-else-if="gameType === 'HOT_POTATO'">
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-arena-cardLight hover:bg-arena-cardHover text-red-300 border border-red-500/40 rounded-full transition-all"
          @click="$emit('populateMockPlayers', 6)"
        >
          {{ t('autoFillBtn') }}
        </button>

        <button
          type="button"
          class="px-3.5 py-1.5 text-xs font-cairo font-bold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendHotPotatoPass()"
        >
          <span>🎲</span>
          <span>رمي عشوائي (!pass)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendHotPotatoPass(2)"
        >
          <span>💣</span>
          <span>تمرير للاعب 2 (!pass 2)</span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-cairo font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendHotPotatoPass(3)"
        >
          <span>💣</span>
          <span>تمرير للاعب 3 (!pass 3)</span>
        </button>
      </template>

      <!-- Subway Runner Specific Quick Actions -->
      <template v-else-if="gameType === 'SUBWAY_RUNNER'">
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-arena-cardLight hover:bg-arena-cardHover text-cyan-300 border border-cyan-500/40 rounded-full transition-all"
          @click="$emit('populateMockPlayers', 6)"
        >
          {{ t('autoFillBtn') }}
        </button>

        <button
          type="button"
          class="px-3.5 py-1.5 text-xs font-cairo font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('jump', 'Speedy_Ahmed')"
        >
          <span>⬆️</span>
          <span>قفز (jump)</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-1.5 text-xs font-cairo font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('duck', 'ProGamer')"
        >
          <span>⬇️</span>
          <span>انزل (duck)</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-1.5 text-xs font-cairo font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('left', 'Sara_VIP')"
        >
          <span>⬅️</span>
          <span>يسار (left)</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-1.5 text-xs font-cairo font-bold bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 rounded-full transition-all flex items-center gap-1 shadow-sm"
          @click="sendQuick('right', 'Tariq_Twitch')"
        >
          <span>➡️</span>
          <span>يمين (right)</span>
        </button>
      </template>

      <!-- Roulette Specific Quick Actions -->
      <template v-else>
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-arena-cardLight hover:bg-arena-cardHover text-emerald-300 border border-emerald-500/40 rounded-full transition-all"
          @click="$emit('populateMockPlayers', 6)"
        >
          {{ t('autoFillBtn') }}
        </button>

        <button
          v-if="activePlayerNumber"
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/40 rounded-full transition-all"
          @click="sendQuick('!kill 1')"
        >
          {{ t('simulateKillFrom') }} #{{ activePlayerNumber }})
        </button>

        <button
          v-if="activePlayerNumber"
          type="button"
          class="px-4 py-1.5 text-xs font-cairo font-bold bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-500/40 rounded-full transition-all"
          @click="sendQuick('!revive 2')"
        >
          {{ t('simulateReviveFrom') }} #{{ activePlayerNumber }})
        </button>
      </template>
    </div>

    <!-- Manual Simulator Input Form -->
    <form class="flex flex-col sm:flex-row gap-2.5" @submit.prevent="submitCustom">
      <input
        v-model="customUser"
        type="text"
        :placeholder="t('viewerPlaceholder')"
        class="w-full sm:w-1/3 px-4 py-2 bg-arena-dark border border-arena-border rounded-full text-xs font-tajawal text-white focus:outline-none focus:border-arena-crimson"
      />
      <input
        v-model="customMessage"
        type="text"
        :placeholder="t('commandPlaceholder')"
        class="w-full sm:w-1/2 px-4 py-2 bg-arena-dark border border-arena-border rounded-full text-xs font-tajawal text-white focus:outline-none focus:border-arena-crimson text-left"
        dir="ltr"
      />
      <GamerButton size="sm" variant="primary" type="submit">
        {{ t('sendToChatBtn') }}
      </GamerButton>
    </form>
  </div>
</template>
