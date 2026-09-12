<script setup lang="ts">
import { useGameStore } from '~/stores/game';
import { useAudioSfx } from '~/composables/useAudioSfx';
import { useTwitchChat } from '~/composables/useTwitchChat';
import { useGameSync } from '~/composables/useSocket';
import { useTranslation, formatGameLog, getDisplayCommands } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerCard from '~/components/common/GamerCard.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';
import RouletteWheel from '~/components/game/RouletteWheel.vue';
import TriviaStage from '~/components/game/TriviaStage.vue';
import TriviaContendersList from '~/components/game/TriviaContendersList.vue';
import TriviaCategoryModal from '~/components/game/TriviaCategoryModal.vue';
import BoardPartyStage from '~/components/game/BoardPartyStage.vue';
import BoardPartyTeamsList from '~/components/game/BoardPartyTeamsList.vue';
import GridRoyaleStage from '~/components/game/GridRoyaleStage.vue';
import TypeRaceStage from '~/components/game/TypeRaceStage.vue';
import HangmanStage from '~/components/game/HangmanStage.vue';
import HotPotatoStage from '~/components/game/HotPotatoStage.vue';
import SubwayRunnerStage from '~/components/game/SubwayRunnerStage.vue';
import PlayerGrid from '~/components/game/PlayerGrid.vue';
import TurnTimer from '~/components/game/TurnTimer.vue';
import GameLogs from '~/components/game/GameLogs.vue';
import ChatSimulator from '~/components/game/ChatSimulator.vue';
import GameRulesModal from '~/components/game/GameRulesModal.vue';
import GameSettingsModal from '~/components/game/GameSettingsModal.vue';
import PlatformConnectModal from '~/components/game/PlatformConnectModal.vue';
import CombatEventNotification from '~/components/game/CombatEventNotification.vue';
import ChannelVerifyModal from '~/components/game/ChannelVerifyModal.vue';
import ConfirmModal from '~/components/common/ConfirmModal.vue';

definePageMeta({
  layout: 'game'
});

const route = useRoute();
const gameStore = useGameStore();
const audio = useAudioSfx();
const twitchChat = useTwitchChat();
const gameSync = useGameSync();
const { t, locale, toggleLocale, isRtl } = useTranslation();

const sessionId = computed(() => route.params.id as string);
const isSpinning = ref(false);
const customChannelInput = ref('');
const showTriviaCategoryModal = ref(false);
const hangmanStageRef = ref<InstanceType<typeof HangmanStage> | null>(null);
const connectedPlatforms = ref<Array<{ id: string; channel: string }>>([
  { id: 'twitch', channel: '' }
]);
const platformIcons: Record<string, { icon: string; name: string; badgeClass: string }> = {
  twitch: { icon: '🟣', name: 'Twitch', badgeClass: 'border-purple-500/40 text-purple-300' },
  kick: { icon: '🟢', name: 'Kick', badgeClass: 'border-emerald-500/40 text-emerald-300' },
  tiktok: { icon: '🎵', name: 'TikTok', badgeClass: 'border-rose-500/40 text-rose-300' }
};
const showRulesModal = ref(false);
const showSettingsModal = ref(false);
const showPlatformModal = ref(false);
const showVerifyModal = ref(false);
const activeSidebarTab = ref<'PLAYERS' | 'LOGS' | 'CHAT'>('PLAYERS');
const isSidebarOpen = ref(true);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 900);

const activePlayer = computed(() => gameStore.activePlayer);
const activePlayerCanRevive = computed(() => {
  if (!gameStore.activePlayer) return false;
  if (!gameStore.currentSession?.settings?.allowRevives) return false;
  if ((gameStore.activePlayer.revivesUsed || 0) >= (gameStore.currentSession.settings.maxRevivesPerGame || 1)) return false;
  return gameStore.players.some((p) => p.status === 'ELIMINATED' && (p.timesRevived || 0) === 0);
});
const activePlayerReviveAlreadyUsed = computed(() => {
  if (!gameStore.activePlayer) return false;
  return (gameStore.activePlayer.revivesUsed || 0) >= 1;
});
const winner = computed(() => gameStore.winner);

// Dynamic responsive wheel sizing based on viewport width & height
const dynamicWheelSize = computed(() => {
  const maxAvailableH = Math.max(260, windowHeight.value - 220);
  const overheadW = isSidebarOpen.value ? 420 : 80;
  const maxAvailableW = Math.max(260, windowWidth.value - overheadW);
  return Math.max(260, Math.min(maxAvailableH, maxAvailableW, 520));
});

function handleWindowResize() {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  }
}

watch(
  () => gameStore.currentSession?.status,
  (newStatus) => {
    if (newStatus === 'SPINNING') {
      isSpinning.value = true;
    } else if (newStatus !== 'WAITING_ACTION') {
      isSpinning.value = false;
    }

    if (newStatus === 'FINISHED' && gameStore.winner) {
      audio.playVictoryFanfare();
    }
  }
);

watch(
  () => gameStore.currentSession?.logs?.[0]?.id,
  () => {
    const latest = gameStore.currentSession?.logs?.[0];
    if (!latest) return;

    if (latest.type === 'KILL') {
      audio.playEliminationSound();
    } else if (latest.type === 'REVIVE') {
      audio.playReviveSound();
    }
  }
);

function onSpinComplete() {
  isSpinning.value = false;
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleWindowResize);
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  }

  await gameStore.loadSession(sessionId.value);

  // Connect SSE real-time state sync
  gameSync.connectToSessionStream(sessionId.value, (updatedSession) => {
    gameStore.setSessionDirectly(updatedSession);
  });

  // Connect to streamer's Twitch IRC chat channel
  const targetChannel = gameStore.currentSession?.streamerUsername || 'streamer';
  customChannelInput.value = targetChannel;
  connectedPlatforms.value = [{ id: 'twitch', channel: targetChannel }];
  connectTwitch(targetChannel);
});

let syncInterval: any = null;

onMounted(() => {
  if (typeof window !== 'undefined') {
    syncInterval = setInterval(() => {
      if (sessionId.value && !isSpinning.value) {
        gameStore.loadSession(sessionId.value);
      }
    }, 3000);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleWindowResize);
    if (syncInterval) clearInterval(syncInterval);
  }
});

function connectTwitch(channel: string) {
  if (!channel) return;
  const clean = channel.trim().replace(/^#/, '');
  customChannelInput.value = clean;
  twitchChat.connectToChannel(clean, handleChatCommand);
}

function handleMultiPlatformConnect(platforms: { id: string; channel: string }[], autoConnect: boolean) {
  connectedPlatforms.value = platforms;
  const twitchPlat = platforms.find((p) => p.id === 'twitch');
  if (twitchPlat && twitchPlat.channel) {
    connectTwitch(twitchPlat.channel);
  } else if (platforms.length > 0 && platforms[0].channel) {
    connectTwitch(platforms[0].channel);
  }
}

function matchesCommand(cmd: string, list?: string[], defaultCmd?: string): boolean {
  const cleanCmd = cmd.trim().toLowerCase();
  const withBang = cleanCmd.startsWith('!') ? cleanCmd : `!${cleanCmd}`;
  const targets = list && list.length > 0 ? list : defaultCmd ? [defaultCmd] : [];
  return targets.some((c) => {
    const cleanC = c.trim().toLowerCase();
    const targetWithBang = cleanC.startsWith('!') ? cleanC : `!${cleanC}`;
    return targetWithBang === withBang;
  });
}

function handleChatCommand(
  cmd: string,
  args: string[],
  user: { username: string; displayName: string; isBroadcaster?: boolean },
  rawMessage?: string
) {
  if (!gameStore.currentSession) return;
  const custom = gameStore.currentSession.settings?.customCommands;

  // 1. Broadcaster Ownership Verification Command (!verify <code>)
  const verifyList = ['!verify', '!تأكيد', '!توثيق', '!اثبات', '!auth'];
  if (matchesCommand(cmd, verifyList)) {
    const code = args[0]?.trim();
    if (
      code === gameStore.currentSession.verificationCode &&
      (user.isBroadcaster || user.username.toLowerCase() === gameStore.currentSession.streamerUsername.toLowerCase())
    ) {
      gameStore.performAction('VERIFY_BROADCASTER');
      return;
    }
  }

  // 2. Trivia Quiz Mode Chat Answers (1, 2, 3, 4 / A, B, C, D / !1..!4, !a..!d)
  if (gameStore.currentSession.gameType === 'TRIVIA') {
    const rawClean = cmd.trim().toLowerCase().replace(/^!/, '');
    let choiceIdx: number | null = null;
    if (rawClean === '1' || rawClean === 'a' || rawClean === 'أ' || rawClean === 'ا') choiceIdx = 0;
    else if (rawClean === '2' || rawClean === 'b' || rawClean === 'ب') choiceIdx = 1;
    else if (rawClean === '3' || rawClean === 'c' || rawClean === 'ج') choiceIdx = 2;
    else if (rawClean === '4' || rawClean === 'd' || rawClean === 'د') choiceIdx = 3;

    if (choiceIdx !== null) {
      gameStore.performAction('TRIVIA_SUBMIT_VOTE', {
        actorUsername: user.username,
        choiceIndex: choiceIdx
      });
      return;
    }
  }

  // 3. Board Party Mode Chat Commands (!roll, !up, !down, !left, !right, !zone 1..4)
  if (gameStore.currentSession.gameType === 'BOARD_PARTY') {
    const rawClean = cmd.trim().toLowerCase();
    const rollList = ['!roll', '!نرد', '!رمي', '!roll-dice', '!dice', 'roll', 'نرد'];
    if (matchesCommand(cmd, rollList) || rollList.includes(rawClean)) {
      gameStore.performAction('BOARD_ROLL_DICE', { actorUsername: user.username });
      return;
    }

    // Direction choices
    const dirMap: Record<string, string> = {
      up: 'up', '!up': 'up', 'فوق': 'up', '!فوق': 'up', 'اعلى': 'up', '!اعلى': 'up', 'أعلى': 'up', '!أعلى': 'up',
      down: 'down', '!down': 'down', 'تحت': 'down', '!تحت': 'down', 'اسفل': 'down', '!اسفل': 'down', 'أسفل': 'down', '!أسفل': 'down',
      left: 'left', '!left': 'left', 'يسار': 'left', '!يسار': 'left', 'شمال': 'left', '!شمال': 'left',
      right: 'right', '!right': 'right', 'يمين': 'right', '!يمين': 'right'
    };

    if (dirMap[rawClean]) {
      gameStore.performAction('BOARD_SUBMIT_DIRECTION', {
        actorUsername: user.username,
        direction: dirMap[rawClean]
      });
      return;
    }

    if (rawClean.startsWith('!zone') || rawClean.startsWith('zone') || rawClean.startsWith('!منطقة') || rawClean.startsWith('منطقة')) {
      const parsed = rawClean.replace(/^(!zone|zone|!منطقة|منطقة)\s*/, '').replace(/^!/, '').trim() || (args[0] || '').trim();
      const zoneNum = parseInt(parsed, 10);
      if ([1, 2, 3, 4].includes(zoneNum)) {
        gameStore.performAction('BOARD_SUBMIT_MINIGAME_ACTION', {
          actorUsername: user.username,
          zoneIndex: zoneNum
        });
        return;
      }
    }

    // Minigame Trivia & Zone numeric/letter choices (1..4, A..D)
    if (['1', '2', '3', '4', 'a', 'b', 'c', 'd', '!1', '!2', '!3', '!4', '!a', '!b', '!c', '!d'].includes(rawClean)) {
      const choice = rawClean.replace(/^!/, '').toUpperCase();
      gameStore.performAction('BOARD_SUBMIT_MINIGAME_ACTION', {
        actorUsername: user.username,
        choice
      });
      return;
    }
  }

  // 4. Grid Royale Mode Chat Commands (A1..D4, 1..16, !A1..!D4, !1..!16, !move <tile>)
  if (gameStore.currentSession.gameType === 'GRID_ROYALE') {
    const rawClean = cmd.trim().toUpperCase().replace(/^!/, '');
    const isLetterNum = /^[A-D][1-4]$/.test(rawClean);
    const numVal = parseInt(rawClean, 10);
    const isNumber1To16 = !isNaN(numVal) && numVal >= 1 && numVal <= 16;

    let targetTile = '';
    if (isLetterNum) {
      targetTile = rawClean;
    } else if (isNumber1To16) {
      targetTile = String(numVal);
    } else if (rawClean === 'MOVE' || rawClean === 'حجز' || rawClean === 'تحرك') {
      const parsed = (args[0] || '').trim().toUpperCase().replace(/^!/, '');
      if (/^[A-D][1-4]$/.test(parsed) || (!isNaN(parseInt(parsed, 10)) && parseInt(parsed, 10) >= 1 && parseInt(parsed, 10) <= 16)) {
        targetTile = parsed;
      }
    }

    if (targetTile) {
      gameStore.performAction('GRID_ROYALE_MOVE', {
        actorUsername: user.username,
        targetTile
      });
      return;
    }
  }

  // 5. Type Race Mode Chat Commands (Fastest exact word match)
  if (gameStore.currentSession.gameType === 'TYPE_RACE') {
    if (gameStore.currentSession.status === 'WORD_ACTIVE' || gameStore.currentSession.typeRaceState?.status === 'WORD_ACTIVE') {
      const fullText = (rawMessage || [cmd, ...args].join(' ')).trim();
      if (fullText && fullText.length > 0 && !fullText.startsWith('!join') && !fullText.startsWith('!دخول')) {
        gameStore.performAction('TYPE_RACE_SUBMIT_WORD', {
          actorUsername: user.username,
          submittedWord: fullText
        });
      }
    }
  }

  // 6. Hangman Secret Word Chat Commands (!guess <word>, !تخمين <word>, !حزر <word>, or direct word during GUESSING_ACTIVE)
  if (gameStore.currentSession.gameType === 'HANGMAN') {
    const isGuessingActive = gameStore.currentSession.status === 'GUESSING_ACTIVE' || gameStore.currentSession.hangmanState?.status === 'GUESSING_ACTIVE';
    if (isGuessingActive) {
      const cleanCmd = cmd.trim().toLowerCase();
      let guessText = '';
      if (cleanCmd.startsWith('!guess') || cleanCmd.startsWith('!تخمين') || cleanCmd.startsWith('!حزر') || cleanCmd.startsWith('!كلمة')) {
        guessText = (args.join(' ') || '').trim();
      } else if (!cleanCmd.startsWith('!') && !cleanCmd.startsWith('/')) {
        // Direct word typed into chat without exclamation mark
        guessText = (rawMessage || [cmd, ...args].join(' ')).trim();
      }

      if (guessText && guessText.length > 0) {
        gameStore.performAction('HANGMAN_SUBMIT_GUESS', {
          actorUsername: user.username,
          guessWord: guessText
        });
        return;
      }
    }
  }

  // 7. Hot Potato Bomb Chat Commands (!pass, !مرر, !رمي, !باص, etc.)
  if (gameStore.currentSession.gameType === 'HOT_POTATO') {
    const isBombTicking = gameStore.currentSession.status === 'BOMB_TICKING' || gameStore.currentSession.hotPotatoState?.status === 'BOMB_TICKING';
    const passList = gameStore.currentSession.settings?.customCommands?.pass || ['!pass', '!مرر', '!رمي', '!باص', '!ارمي', '!حول', 'pass', 'مرر', 'رمي'];
    const lowerCmd = cmd.toLowerCase().trim();
    if (isBombTicking && (matchesCommand(cmd, passList) || lowerCmd.startsWith('!pass') || lowerCmd.startsWith('!مرر') || lowerCmd.startsWith('!رمي'))) {
      const targetArg = args[0] ? args[0].trim() : undefined;
      gameStore.performAction('HOT_POTATO_PASS', {
        actorUsername: user.username,
        passTarget: targetArg
      });
      return;
    }
  }

  // 8. Subway Runner Mode Chat Commands (jump, jumb, duck, left, right, etc.)
  if (gameStore.currentSession.gameType === 'SUBWAY_RUNNER') {
    const rawAction = (rawMessage || [cmd, ...args].join(' ')).trim().toLowerCase();
    const jumpMatches = ['jump', 'jumb', 'jmp', '!jump', '!jumb', '!jmp', 'نط', 'قفز', '!نط', '!قفز', 'فوق', '!فوق', 'up', '!up'];
    const duckMatches = ['duck', 'down', 'slide', 'dck', '!duck', '!down', '!slide', 'انزل', 'تحت', 'انبطح', '!انزل', '!تحت'];
    const leftMatches = ['left', 'lft', '!left', '!lft', 'يسار', 'شمال', '!يسار', '!شمال'];
    const rightMatches = ['right', 'rgt', 'rit', '!right', '!rgt', 'يمين', '!يمين'];

    let action: 'JUMP' | 'DUCK' | 'LEFT' | 'RIGHT' | null = null;
    if (jumpMatches.some((m) => rawAction === m || rawAction.startsWith(m))) {
      action = 'JUMP';
    } else if (duckMatches.some((m) => rawAction === m || rawAction.startsWith(m))) {
      action = 'DUCK';
    } else if (leftMatches.some((m) => rawAction === m || rawAction.startsWith(m))) {
      action = 'LEFT';
    } else if (rightMatches.some((m) => rawAction === m || rawAction.startsWith(m))) {
      action = 'RIGHT';
    }

    if (action) {
      gameStore.performAction('SUBWAY_SUBMIT_ACTION', {
        actorUsername: user.username,
        subwayAction: action
      });
      return;
    }
  }

  const joinList = custom?.join || ['!join', '!دخول', '!انضمام', '!شارك'];
  const killList = custom?.kill || ['!kill', '!قتل', '!استبعاد', '!طرد'];
  const reviveList = custom?.revive || ['!revive', '!انعاش', '!إنعاش', '!احياء'];

  if (matchesCommand(cmd, joinList)) {
    gameStore.addPlayer(user.username, user.displayName);
    return;
  }

  if (matchesCommand(cmd, killList)) {
    if (args[0]) {
      const cleanNum = args[0].replace(/[#№]/g, '');
      const targetNum = parseInt(cleanNum, 10);
      if (!isNaN(targetNum)) {
        gameStore.performAction('ACTION_KILL', {
          actorUsername: user.username,
          targetNumber: targetNum
        });
      }
    }
    return;
  }

  if (matchesCommand(cmd, reviveList)) {
    if (args[0]) {
      const cleanNum = args[0].replace(/[#№]/g, '');
      const targetNum = parseInt(cleanNum, 10);
      if (!isNaN(targetNum)) {
        gameStore.performAction('ACTION_REVIVE', {
          actorUsername: user.username,
          targetNumber: targetNum
        });
      }
    }
    return;
  }
}

function handleSimulatorCommand(username: string, message: string) {
  twitchChat.simulateChatCommand(username, message, handleChatCommand);
}

function populateMockContenders(count = 6) {
  const sampleNames = ['Mazen', 'Fahad', 'Faisal', 'Nasser', 'Ali', 'Sara', 'Reem', 'Sultan'];
  const start = gameStore.players.length;
  for (let i = 0; i < count; i++) {
    const name = sampleNames[(start + i) % sampleNames.length] + `_${Math.floor(Math.random() * 90 + 10)}`;
    gameStore.addPlayer(name.toLowerCase(), name);
  }
}

async function spinRoulette() {
  await gameStore.performAction('SPIN_WHEEL');
  isSpinning.value = true;
}

const confirmModalState = ref<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info' | 'primary';
  onConfirm: () => void;
}>({
  isOpen: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  variant: 'danger',
  onConfirm: () => {}
});

function openConfirm(options: {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  onConfirm: () => void;
}) {
  confirmModalState.value = {
    isOpen: true,
    title: options.title || '',
    message: options.message,
    confirmText: options.confirmText || '',
    cancelText: options.cancelText || '',
    variant: options.variant || 'danger',
    onConfirm: options.onConfirm
  };
}

function handleModalConfirm() {
  confirmModalState.value.isOpen = false;
  if (confirmModalState.value.onConfirm) {
    confirmModalState.value.onConfirm();
  }
}

async function eliminatePlayer(playerNumber: number) {
  await gameStore.performAction('ACTION_KILL', { targetNumber: playerNumber });
}

async function revivePlayer(playerNumber: number) {
  await gameStore.performAction('ACTION_REVIVE', { targetNumber: playerNumber });
}

function kickPlayer(playerNumber: number) {
  const target = gameStore.players.find((p) => p.number === playerNumber);
  const nameDisplay = target ? `${target.displayName} (#${playerNumber})` : `#${playerNumber}`;
  openConfirm({
    title: isRtl.value ? 'استبعاد متسابق' : 'Kick Contender',
    message: isRtl.value ? `هل أنت متأكد من رغبتك في استبعاد المتسابق ${nameDisplay} من اللعبة؟` : `Are you sure you want to kick ${nameDisplay} from the game?`,
    confirmText: isRtl.value ? 'نعم، استبعاد' : 'Kick Contender',
    variant: 'danger',
    onConfirm: async () => {
      await gameStore.performAction('KICK_PLAYER', { targetNumber: playerNumber });
    }
  });
}

function promptResetGame() {
  if (gameStore.players.length > 0 && gameStore.status !== 'FINISHED') {
    openConfirm({
      title: isRtl.value ? 'إعادة ضبط اللعبة' : 'Reset Match',
      message: isRtl.value ? 'هل أنت متأكد من إعادة ضبط اللعبة وحذف جميع البيانات الحالية وبدء جولة جديدة؟' : 'Are you sure you want to reset the current match and restart the game arena?',
      confirmText: isRtl.value ? 'إعادة الضبط' : 'Reset Arena',
      variant: 'warning',
      onConfirm: async () => {
        await gameStore.performAction('RESET_GAME');
      }
    });
  } else {
    gameStore.performAction('RESET_GAME');
  }
}

function promptStartNewGame() {
  openConfirm({
    title: isRtl.value ? 'بدء لعبة جديدة وحذف الحالية' : 'Start New Game & Delete Current',
    message: isRtl.value
      ? 'هل ترغب في إنهاء وحذف اللعبة الحالية والعودة لاختيار وبدء لعبة جديدة؟'
      : 'Do you want to terminate and delete the current game and return to choose a new game?',
    confirmText: isRtl.value ? 'نعم، بدء لعبة جديدة' : 'Yes, Start New Game',
    cancelText: isRtl.value ? 'البقاء في اللعبة' : 'Stay in Game',
    variant: 'danger',
    onConfirm: async () => {
      await gameStore.deleteCurrentSession();
      navigateTo('/dashboard');
    }
  });
}

async function handleTriviaCategorySave(config: { categories: string[]; totalQuestions: number; timeLimitSeconds: number; triviaLanguage?: 'AR' | 'EN' | 'BOTH' }) {
  await gameStore.performAction('UPDATE_SETTINGS', {
    settings: {
      triviaCategories: config.categories,
      triviaTotalQuestions: config.totalQuestions,
      triviaTimeLimitSeconds: config.timeLimitSeconds,
      triviaLanguage: config.triviaLanguage || 'AR'
    }
  });
  if (config.triviaLanguage) {
    await gameStore.performAction('TRIVIA_SET_LANGUAGE', { triviaLanguage: config.triviaLanguage });
  }
  await gameStore.performAction('TRIVIA_RESTART');
}
</script>

<template>
  <div class="h-screen max-h-screen bg-arena-bg text-arena-textMain px-3 sm:px-5 py-3 flex flex-col justify-between gap-3 overflow-hidden select-none" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Combat Event Animation Notification (Kill & Revive) -->
    <CombatEventNotification :latest-log="gameStore.currentSession?.logs?.[0] || null" />

    <!-- Modals -->
    <GameRulesModal
      :is-open="showRulesModal"
      :game-type="gameStore.currentSession?.gameType || 'ROULETTE'"
      @close="showRulesModal = false"
    />
    <GameSettingsModal
      :is-open="showSettingsModal"
      :settings="gameStore.currentSession?.settings || { maxPlayers: 30, turnTimeLimitSeconds: 15, allowRevives: true }"
      @close="showSettingsModal = false"
      @save="saveGameSettings"
    />
    <PlatformConnectModal
      :is-open="showPlatformModal"
      :initial-channel="customChannelInput"
      :initial-platforms="connectedPlatforms"
      @close="showPlatformModal = false"
      @connect="handleMultiPlatformConnect"
    />
    <ChannelVerifyModal
      :is-open="showVerifyModal"
      :channel-name="customChannelInput || gameStore.currentSession?.streamerUsername || 'streamer'"
      :verification-code="gameStore.currentSession?.verificationCode || '1234'"
      :is-verified="gameStore.currentSession?.isBroadcasterVerified"
      @close="showVerifyModal = false"
    />
    <ConfirmModal
      :is-open="confirmModalState.isOpen"
      :title="confirmModalState.title"
      :message="confirmModalState.message"
      :confirm-text="confirmModalState.confirmText"
      :cancel-text="confirmModalState.cancelText"
      :variant="confirmModalState.variant"
      @confirm="handleModalConfirm"
      @cancel="confirmModalState.isOpen = false"
      @close="confirmModalState.isOpen = false"
    />

    <!-- Top Master HUD Action Bar (Compact & Space-Optimized) -->
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-arena-dark/95 border border-arena-borderLight/80 rounded-2xl shadow-glow-crimson backdrop-blur-xl shrink-0">
      <!-- Left: Home Button, Room Info & Status -->
      <div class="flex items-center gap-3">
        <!-- Return Home Button -->
        <NuxtLink to="/">
          <button
            type="button"
            class="px-3 py-1.5 bg-arena-card hover:bg-indigo-950/80 border border-arena-border hover:border-indigo-500 text-xs font-cairo font-bold text-white rounded-full transition-all flex items-center gap-1.5 shadow-sm group"
          >
            <span class="group-hover:-translate-x-0.5 transition-transform" :class="isRtl ? 'rotate-180' : ''">←</span>
            <span>{{ t('home') }}</span>
          </button>
        </NuxtLink>

        <div class="flex items-center gap-2.5">
          <h1 class="font-cairo font-black text-base sm:text-lg text-white flex items-center gap-1.5">
            <span class="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">ChatWar</span>
            <span class="text-indigo-400 text-xs font-mono">// {{ gameStore.currentSession?.gameType || 'ROULETTE' }}</span>
          </h1>
          <GamerBadge
            :status="gameStore.status === 'LOBBY' ? 'LIVE' : 'ALIVE'"
            :label="gameStore.status === 'LOBBY' ? t('liveLobby') : t('running')"
            size="xs"
          />
        </div>

        <!-- Connected Platforms & Verification HUD Badges -->
        <div class="hidden md:flex font-tajawal text-[11px] text-arena-textMuted items-center gap-2 border-l border-arena-border/50 pl-3">
          <!-- Platforms Multi-Badge Button -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 py-1 bg-arena-card/80 hover:bg-indigo-950/60 border border-arena-border hover:border-indigo-500/80 rounded-full transition-all"
            title="Manage Platforms"
            @click="showPlatformModal = true"
          >
            <div class="flex items-center gap-1.5">
              <template v-for="plat in connectedPlatforms.filter(p => p.channel)" :key="plat.id">
                <span class="flex items-center gap-1 font-mono font-bold text-white">
                  <span>{{ platformIcons[plat.id]?.icon || '🟣' }}</span>
                  <span class="text-[11px]">{{ plat.channel }}</span>
                </span>
              </template>
              <template v-if="!connectedPlatforms.some(p => p.channel)">
                <span class="text-slate-400 font-sans">{{ t('notConnected') || 'Not Connected' }}</span>
              </template>
            </div>
            <span class="text-[10px] text-indigo-400 ml-0.5">✏️</span>
          </button>

          <span>•</span>
          <!-- Broadcaster Ownership Verification Badge -->
          <button
            type="button"
            :class="[
              'px-2.5 py-0.5 rounded-full text-[10px] font-cairo font-bold flex items-center gap-1 transition-all',
              gameStore.currentSession?.isBroadcasterVerified
                ? 'bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-amber-950/90 border border-amber-500/80 text-amber-300 animate-pulse hover:bg-amber-900 shadow-glow-gold'
            ]"
            :title="gameStore.currentSession?.isBroadcasterVerified ? t('verifiedBroadcaster') : t('unverifiedBroadcaster')"
            @click="showVerifyModal = true"
          >
            <span>{{ gameStore.currentSession?.isBroadcasterVerified ? '🛡️' : '🔒' }}</span>
            <span>{{ gameStore.currentSession?.isBroadcasterVerified ? t('verifiedBroadcaster') : t('unverifiedBroadcaster') }}</span>
          </button>
          <span>•</span>
          <span class="text-amber-300 font-bold">
            {{ gameStore.currentSession?.settings?.turnTimeLimitSeconds === 0 ? t('unlimitedTimer') : `${gameStore.currentSession?.settings?.turnTimeLimitSeconds || 15}s` }}
          </span>
        </div>
      </div>

      <!-- Right: Controls, Language, Audio & OBS Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Action Button (Primary Action) -->
        <GamerButton
          v-if="gameStore.currentSession?.gameType === 'BOARD_PARTY'"
          size="sm"
          variant="primary"
          rounded="full"
          :disabled="gameStore.currentSession?.boardPartyState?.status !== 'TEAM_TURN' || gameStore.currentSession?.boardPartyState?.isRollingDice"
          class="shadow-glow-crimson font-black text-xs px-5 py-1.5"
          @click="gameStore.performAction('BOARD_ROLL_DICE', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer' })"
        >
          🎲 {{ isRtl ? 'رمي النرد' : 'Roll Dice' }}
        </GamerButton>
        <GamerButton
          v-else-if="gameStore.currentSession?.gameType === 'GRID_ROYALE'"
          size="sm"
          variant="primary"
          rounded="full"
          :disabled="gameStore.currentSession?.gridRoyaleState?.status === 'MATCH_OVER'"
          class="shadow-[0_0_20px_rgba(6,182,212,0.6)] font-black text-xs px-5 py-1.5 !bg-gradient-to-r !from-cyan-500 !to-indigo-600 hover:!brightness-110"
          @click="gameStore.currentSession?.gridRoyaleState?.status === 'LOBBY' ? gameStore.performAction('GRID_ROYALE_START') : (gameStore.currentSession?.gridRoyaleState?.status === 'ROUND_SUMMARY' ? gameStore.performAction('GRID_ROYALE_NEXT_WAVE') : gameStore.performAction('GRID_ROYALE_RESOLVE_WAVE'))"
        >
          ⚡ {{ gameStore.currentSession?.gridRoyaleState?.status === 'LOBBY' ? (isRtl ? 'بدء الحلبة' : 'Start Grid') : (gameStore.currentSession?.gridRoyaleState?.status === 'ROUND_SUMMARY' ? (isRtl ? 'الموجة التالية' : 'Next Wave') : (isRtl ? 'حسم الناجين' : 'Resolve Wave')) }}
        </GamerButton>
        <GamerButton
          v-else-if="gameStore.currentSession?.gameType === 'TYPE_RACE'"
          size="sm"
          variant="primary"
          rounded="full"
          :disabled="gameStore.currentSession?.typeRaceState?.status === 'MATCH_OVER'"
          class="shadow-[0_0_20px_rgba(245,158,11,0.6)] font-black text-xs px-5 py-1.5 !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!brightness-110"
          @click="gameStore.currentSession?.typeRaceState?.status === 'LOBBY' ? gameStore.performAction('TYPE_RACE_START') : (gameStore.currentSession?.typeRaceState?.status === 'ROUND_WON' ? gameStore.performAction('TYPE_RACE_NEXT_ROUND') : gameStore.performAction('TYPE_RACE_RESTART'))"
        >
          ⌨️ {{ gameStore.currentSession?.typeRaceState?.status === 'LOBBY' ? (isRtl ? 'انطلاق السباق' : 'Start Race') : (gameStore.currentSession?.typeRaceState?.status === 'ROUND_WON' ? (isRtl ? 'الجولة التالية' : 'Next Round') : (isRtl ? 'إعادة الضبط' : 'Restart')) }}
        </GamerButton>
        <GamerButton
          v-else-if="gameStore.currentSession?.gameType === 'HANGMAN'"
          size="sm"
          variant="primary"
          rounded="full"
          class="shadow-[0_0_20px_rgba(16,185,129,0.6)] font-black text-xs px-5 py-1.5 !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!brightness-110"
          @click="gameStore.currentSession?.hangmanState?.status === 'ROUND_RESOLVED' ? gameStore.performAction('HANGMAN_RESTART') : (gameStore.currentSession?.hangmanState?.status === 'GUESSING_ACTIVE' ? gameStore.performAction('HANGMAN_RESOLVE_ROUND', { reason: 'GIVE_UP' }) : (hangmanStageRef?.openAdminModal ? hangmanStageRef.openAdminModal() : null))"
        >
          🕵️ {{ gameStore.currentSession?.hangmanState?.status === 'ROUND_RESOLVED' ? (isRtl ? 'جولة جديدة' : 'New Round') : (gameStore.currentSession?.hangmanState?.status === 'GUESSING_ACTIVE' ? (isRtl ? 'كشف الكلمة' : 'Reveal Word') : (isRtl ? 'تعيين الكلمة' : 'Set Word')) }}
        </GamerButton>
        <GamerButton
          v-else-if="gameStore.currentSession?.gameType === 'HOT_POTATO'"
          size="sm"
          variant="primary"
          rounded="full"
          class="shadow-[0_0_20px_rgba(239,68,68,0.6)] font-black text-xs px-5 py-1.5 !bg-gradient-to-r !from-red-600 !to-amber-600 hover:!brightness-110"
          @click="gameStore.currentSession?.hotPotatoState?.status === 'BOMB_TICKING' ? gameStore.performAction('HOT_POTATO_RESOLVE_DETONATION') : (gameStore.currentSession?.hotPotatoState?.status === 'MATCH_OVER' || gameStore.currentSession?.status === 'FINISHED' ? gameStore.performAction('HOT_POTATO_RESTART') : (gameStore.currentSession?.hotPotatoState?.status === 'BOMB_EXPLODED' ? gameStore.performAction('HOT_POTATO_NEXT_ROUND') : gameStore.performAction('HOT_POTATO_START')))"
        >
          💣 {{ gameStore.currentSession?.hotPotatoState?.status === 'BOMB_TICKING' ? (isRtl ? 'تفجير القنبلة' : 'Detonate Bomb') : (gameStore.currentSession?.hotPotatoState?.status === 'MATCH_OVER' || gameStore.currentSession?.status === 'FINISHED' ? (isRtl ? 'إعادة اللعبة' : 'Restart Match') : (gameStore.currentSession?.hotPotatoState?.status === 'BOMB_EXPLODED' ? (isRtl ? 'الجولة التالية' : 'Next Round') : (isRtl ? 'إشعال القنبلة' : 'Ignite Bomb'))) }}
        </GamerButton>
        <GamerButton
          v-else-if="gameStore.currentSession?.gameType === 'SUBWAY_RUNNER'"
          size="sm"
          variant="primary"
          rounded="full"
          class="shadow-[0_0_20px_rgba(6,182,212,0.6)] font-black text-xs px-5 py-1.5 !bg-gradient-to-r !from-cyan-500 !to-blue-600 hover:!brightness-110"
          @click="gameStore.currentSession?.subwayRunnerState?.status === 'SUBWAY_CRASHED' || gameStore.currentSession?.status === 'FINISHED' ? gameStore.performAction('SUBWAY_RESTART') : (gameStore.currentSession?.subwayRunnerState?.status === 'SUBWAY_OBSTACLE' ? gameStore.performAction('SUBWAY_RESOLVE_OBSTACLE') : gameStore.performAction('SUBWAY_START'))"
        >
          🏃‍♂️ {{ gameStore.currentSession?.subwayRunnerState?.status === 'SUBWAY_CRASHED' || gameStore.currentSession?.status === 'FINISHED' ? (isRtl ? 'إعادة المحاولة' : 'Restart Run') : (gameStore.currentSession?.subwayRunnerState?.status === 'SUBWAY_OBSTACLE' ? (isRtl ? 'حسم العقبة' : 'Resolve Obstacle') : (isRtl ? 'انطلاق الركض' : 'Start Running')) }}
        </GamerButton>
        <GamerButton
          v-else-if="gameStore.currentSession?.gameType !== 'TRIVIA'"
          size="sm"
          variant="primary"
          rounded="full"
          :disabled="isSpinning || gameStore.alivePlayers.length <= 1"
          class="shadow-glow-crimson font-black text-xs px-5 py-1.5"
          @click="spinRoulette"
        >
          {{ t('spinWheelBtn') }}
        </GamerButton>

        <!-- Lock / Open Lobby -->
        <GamerButton
          v-if="gameStore.status === 'LOBBY'"
          size="sm"
          variant="secondary"
          rounded="full"
          :disabled="gameStore.players.length < 2"
          class="text-xs px-3.5 py-1"
          @click="gameStore.performAction('LOCK_ENTRIES')"
        >
          {{ t('lockEntriesBtn') }}
        </GamerButton>
        <GamerButton
          v-else
          size="sm"
          variant="secondary"
          rounded="full"
          class="text-xs px-3.5 py-1"
          @click="gameStore.performAction('START_LOBBY')"
        >
          {{ t('openLobbyBtn') }}
        </GamerButton>

        <!-- Rules -->
        <button
          type="button"
          class="px-2.5 py-1 bg-arena-card border border-arena-border text-xs font-cairo font-bold text-amber-300 hover:text-white hover:border-amber-400 rounded-full transition-all flex items-center gap-1"
          @click="showRulesModal = true"
        >
          <span>📜</span>
          <span class="hidden sm:inline">{{ t('gameRulesBtn') }}</span>
        </button>

        <!-- Settings -->
        <button
          type="button"
          class="px-2.5 py-1 bg-arena-card border border-arena-border text-xs font-cairo font-bold text-red-300 hover:text-white hover:border-arena-crimson rounded-full transition-all flex items-center gap-1"
          @click="showSettingsModal = true"
        >
          <span>⚙️</span>
          <span class="hidden sm:inline">{{ t('gameSettingsBtn') }}</span>
        </button>

        <!-- Reset -->
        <button
          type="button"
          class="px-2.5 py-1 bg-arena-dark hover:bg-red-950/60 border border-arena-border text-xs font-cairo font-bold text-red-400 rounded-full transition-colors cursor-pointer"
          @click="promptResetGame"
        >
          {{ t('resetGameBtn') }}
        </button>

        <!-- New Game / Switch Game -->
        <button
          type="button"
          class="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/50 text-xs font-cairo font-bold text-indigo-300 hover:text-white rounded-full transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          @click="promptStartNewGame"
        >
          <span>🎮</span>
          <span>{{ isRtl ? 'لعبة جديدة' : 'New Game' }}</span>
        </button>

        <!-- Language Switcher -->
        <button
          type="button"
          class="px-2.5 py-1 rounded-full bg-arena-card border border-arena-border text-xs font-cairo font-bold text-arena-textMuted hover:text-white transition-all flex items-center gap-1 shadow-sm"
          @click="toggleLocale"
        >
          <span>🌐</span>
          <span>{{ locale === 'en' ? 'Arabic' : 'EN' }}</span>
        </button>

        <!-- Audio Toggle -->
        <button
          type="button"
          class="px-2.5 py-1 rounded-full bg-arena-card border border-arena-border text-xs font-cairo font-bold text-arena-textMuted hover:text-white transition-all shadow-sm"
          :title="audio.isMuted.value ? 'Unmute Audio' : 'Mute Audio'"
          @click="audio.isMuted.value = !audio.isMuted.value"
        >
          <span v-if="audio.isMuted.value" class="text-red-400">🔇</span>
          <span v-else class="text-emerald-400">🔊</span>
        </button>

        <!-- Toggle Sidebar Width / Focus -->
        <button
          type="button"
          class="p-1.5 bg-arena-card border border-arena-border rounded-full text-arena-textMuted hover:text-white transition-colors"
          :title="isSidebarOpen ? 'Maximize Stage View' : 'Show Roster Sidebar'"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <span v-if="isSidebarOpen">⛶</span>
          <span v-else>◨</span>
        </button>
      </div>
    </div>

    <!-- Live Stage Grid Layout: Grand Center Arena (Left) & Tactical Sidebar (Right) -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden items-stretch">
      <!-- ================= GRAND CENTER STAGE (Party Board, Trivia Arena or Massive Wheel Arena) ================= -->
      <div :class="[isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12', 'flex flex-col justify-between min-h-0 overflow-y-auto transition-all duration-500 pr-1']">
        <!-- BOARD PARTY MODE STAGE -->
        <BoardPartyStage
          v-if="gameStore.currentSession?.gameType === 'BOARD_PARTY'"
          :session="gameStore.currentSession"
          :is-admin="true"
          @start-game="gameStore.performAction('BOARD_START_GAME')"
          @roll-dice="gameStore.performAction('BOARD_ROLL_DICE', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer' })"
          @submit-direction="(d) => gameStore.performAction('BOARD_SUBMIT_DIRECTION', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer', direction: d })"
          @select-direction="(d) => gameStore.performAction('BOARD_SELECT_DIRECTION', { direction: d })"
          @next-turn="gameStore.performAction('BOARD_NEXT_TURN')"
          @trigger-minigame="(t) => gameStore.performAction('BOARD_TRIGGER_MINIGAME', { minigameType: t })"
          @submit-minigame-action="(p) => gameStore.performAction('BOARD_SUBMIT_MINIGAME_ACTION', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer', ...p })"
          @resolve-minigame="gameStore.performAction('BOARD_RESOLVE_MINIGAME')"
          @next-round="gameStore.performAction('BOARD_NEXT_ROUND')"
          @restart-game="gameStore.performAction('BOARD_RESTART')"
          @toggle-team="(p) => gameStore.performAction('BOARD_TOGGLE_TEAM', p)"
          @shuffle-teams="() => gameStore.performAction('BOARD_SHUFFLE_TEAMS')"
          @set-map="(m) => gameStore.performAction('BOARD_SET_MAP', { mapTheme: m })"
        />

        <!-- TRIVIA QUIZ MODE STAGE -->
        <TriviaStage
          v-else-if="gameStore.currentSession?.gameType === 'TRIVIA'"
          :session="gameStore.currentSession"
          :is-admin="true"
          @start-trivia="gameStore.performAction('TRIVIA_START_QUIZ')"
          @reveal-answer="gameStore.performAction('TRIVIA_REVEAL_ANSWER')"
          @next-question="gameStore.performAction('TRIVIA_NEXT_QUESTION')"
          @restart-trivia="gameStore.performAction('TRIVIA_RESTART')"
          @open-category-modal="showTriviaCategoryModal = true"
          @submit-vote="(idx) => gameStore.performAction('TRIVIA_SUBMIT_VOTE', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer', choiceIndex: idx })"
        />

        <!-- GRID ROYALE SURVIVAL STAGE -->
        <GridRoyaleStage
          v-else-if="gameStore.currentSession?.gameType === 'GRID_ROYALE'"
          :session="gameStore.currentSession"
          :is-admin="true"
          @start-game="gameStore.performAction('GRID_ROYALE_START')"
          @next-wave="gameStore.performAction('GRID_ROYALE_NEXT_WAVE')"
          @resolve-wave="gameStore.performAction('GRID_ROYALE_RESOLVE_WAVE')"
          @restart-game="gameStore.performAction('GRID_ROYALE_RESTART')"
          @move-tile="(tileId) => gameStore.performAction('GRID_ROYALE_MOVE', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer', targetTile: tileId })"
        />

        <!-- TYPE RACE SPEED STAGE -->
        <TypeRaceStage
          v-else-if="gameStore.currentSession?.gameType === 'TYPE_RACE'"
          :session="gameStore.currentSession"
          :is-admin="true"
          @start-game="(lang, totalWords) => { if (lang) gameStore.performAction('TYPE_RACE_SET_LANGUAGE', { languageMode: lang }); gameStore.performAction('TYPE_RACE_START', { languageMode: lang, totalRounds: totalWords }); }"
          @next-round="gameStore.performAction('TYPE_RACE_NEXT_ROUND')"
          @timeout="gameStore.performAction('TYPE_RACE_TIMEOUT')"
          @restart-game="gameStore.performAction('TYPE_RACE_RESTART')"
          @submit-word="(w) => gameStore.performAction('TYPE_RACE_SUBMIT_WORD', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer', submittedWord: w })"
        />

        <!-- HANGMAN SECRET WORD STAGE -->
        <HangmanStage
          v-else-if="gameStore.currentSession?.gameType === 'HANGMAN'"
          ref="hangmanStageRef"
          :session="gameStore.currentSession"
          :is-admin="true"
          @start-lobby="(rounds) => gameStore.performAction('HANGMAN_START_LOBBY', { totalRounds: rounds })"
          @set-secret-word="(p) => gameStore.performAction('HANGMAN_SET_SECRET_WORD', p)"
          @next-round="(p) => gameStore.performAction('HANGMAN_NEXT_ROUND', p || {})"
          @submit-guess="(w) => gameStore.performAction('HANGMAN_SUBMIT_GUESS', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer', guessWord: w })"
          @reveal-hint="gameStore.performAction('HANGMAN_REVEAL_HINT')"
          @resolve-round="(p) => gameStore.performAction('HANGMAN_RESOLVE_ROUND', p || {})"
          @restart-game="gameStore.performAction('HANGMAN_RESTART')"
        />

        <!-- HOT POTATO TICKING BOMB STAGE -->
        <HotPotatoStage
          v-else-if="gameStore.currentSession?.gameType === 'HOT_POTATO'"
          :session="gameStore.currentSession"
          :is-admin="true"
          @start-game="gameStore.performAction('HOT_POTATO_START')"
          @pass-bomb="(target) => gameStore.performAction('HOT_POTATO_PASS', { actorUsername: gameStore.currentSession?.hotPotatoState?.currentHolderUsername || gameStore.currentSession?.streamerUsername || 'Streamer', passTarget: target })"
          @resolve-detonation="gameStore.performAction('HOT_POTATO_RESOLVE_DETONATION')"
          @next-round="gameStore.performAction('HOT_POTATO_NEXT_ROUND')"
          @restart-game="gameStore.performAction('HOT_POTATO_RESTART')"
        />

        <!-- SUBWAY RUNNER CHAT REFLEX STAGE -->
        <SubwayRunnerStage
          v-else-if="gameStore.currentSession?.gameType === 'SUBWAY_RUNNER'"
          :session="gameStore.currentSession"
          :is-admin="true"
          @start-game="gameStore.performAction('SUBWAY_START')"
          @submit-action="(act) => gameStore.performAction('SUBWAY_SUBMIT_ACTION', { actorUsername: gameStore.currentSession?.streamerUsername || 'Streamer', subwayAction: act })"
          @resolve-obstacle="gameStore.performAction('SUBWAY_RESOLVE_OBSTACLE')"
          @next-round="gameStore.performAction('SUBWAY_NEXT_ROUND')"
          @restart-game="gameStore.performAction('SUBWAY_RESTART')"
        />

        <!-- ROULETTE MODE STAGE -->
        <div
          v-else
          class="relative flex-1 p-4 bg-gradient-to-b from-arena-card/95 via-arena-dark/95 to-arena-card/90 border-2 border-arena-borderLight/80 rounded-2xl shadow-arena-card flex flex-col items-center justify-between overflow-hidden min-h-0"
        >
          <!-- Ambient Indigo Radial Glow behind the wheel -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" />
          </div>

          <!-- Wheel Stage Title / Indicator -->
          <div class="relative z-10 text-center mb-1 shrink-0">
            <div class="font-cairo font-black text-lg sm:text-xl text-white tracking-wider">
              {{ t('wheelStageTitle') }}
            </div>
            <div class="text-[11px] font-tajawal text-arena-textMuted">
              {{ t('wheelStageSub') }}
            </div>
          </div>

          <!-- The Superstar Massive Wheel Component -->
          <div class="relative z-10 flex-1 flex items-center justify-center min-h-0 w-full">
            <RouletteWheel
              :players="gameStore.players"
              :selected-player-number="gameStore.activePlayer?.number || null"
              :is-spinning="isSpinning"
              :size="dynamicWheelSize"
              @spin-complete="onSpinComplete"
            />
          </div>

          <!-- PROMINENT CENTER STAGE SPIN ACTION BUTTON -->
          <div
            v-if="gameStore.status !== 'FINISHED' && !isSpinning && gameStore.status !== 'WAITING_ACTION'"
            class="relative z-20 my-2 flex items-center justify-center shrink-0"
          >
            <button
              type="button"
              :disabled="gameStore.alivePlayers.length < 2 || isSpinning"
              class="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-cairo font-black text-base sm:text-lg rounded-full shadow-[0_0_35px_rgba(99,102,241,0.7)] border-2 border-indigo-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 animate-pulse"
              @click="spinRoulette"
            >
              <span class="text-xl">🎲</span>
              <span>{{ t('spinWheelBtn') }}</span>
              <span class="text-xs font-mono font-bold bg-black/40 px-2.5 py-0.5 rounded-full border border-white/20">
                {{ gameStore.alivePlayers.length }} {{ t('alive') }}
              </span>
            </button>
          </div>

          <!-- Stage Quick Stats Footer (Always pinned inside stage card at the bottom) -->
          <div class="relative z-10 mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-tajawal text-arena-textMuted pt-2 border-t border-arena-border/50 w-full shrink-0">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{{ t('alive') }}: <strong class="text-white font-mono">{{ gameStore.alivePlayers.length }}</strong></span>
            </span>
            <span>•</span>
            <span>{{ t('totalContenders') }}: <strong class="text-white font-mono">{{ gameStore.players.length }}</strong></span>
            <span>•</span>
            <span class="text-indigo-400 font-bold truncate max-w-[400px]">
              {{ t('latestEvent') }}: {{ isSpinning ? (isRtl ? 'العجلة تدور الآن... 🎡' : 'The wheel is spinning... 🎡') : (formatGameLog(gameStore.currentSession?.logs?.[0], isRtl) || t('awaitingCommands')) }}
            </span>
          </div>

          <!-- ================= FLOATING TURN DECISION POPUP MODAL (Fullscreen Backdrop Blur) ================= -->
          <div
            v-if="gameStore.status === 'WAITING_ACTION' && !isSpinning && gameStore.activePlayer"
            class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          >
            <div class="relative max-w-md w-full p-5 sm:p-6 bg-arena-dark/98 border-2 border-indigo-500 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.4)] text-center space-y-3.5 animate-scale-up">
              <!-- Top Indicator Bar -->
              <div class="flex items-center justify-between border-b border-arena-border/60 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  <span class="font-cairo font-black text-xs uppercase tracking-wider text-indigo-400">
                    {{ t('turnTimerCountdown') }}
                  </span>
                </div>
                <div class="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500 text-xs font-mono text-indigo-200 font-bold">
                  #{{ gameStore.activePlayer.number }}
                </div>
              </div>

              <!-- Active Player Avatar & Title -->
              <div class="flex items-center justify-center gap-3.5 py-1">
                <div class="relative shrink-0">
                  <img
                    :src="gameStore.activePlayer.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${gameStore.activePlayer.username}`"
                    :alt="gameStore.activePlayer.displayName"
                    class="w-16 h-16 rounded-full border-3 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)] object-cover bg-arena-bg"
                  />
                  <div class="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-indigo-600 border border-white text-[10px] font-mono font-black text-white rounded-full">
                    #{{ gameStore.activePlayer.number }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-cairo font-black text-lg text-white leading-tight">
                    {{ gameStore.activePlayer.displayName }}
                  </div>
                  <div class="text-xs font-mono text-indigo-300">
                    @{{ gameStore.activePlayer.username }}
                  </div>
                  <div class="text-[11px] font-tajawal text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <span>⚔️ {{ gameStore.activePlayer.killsCount || 0 }} {{ t('kills') }}</span>
                    <span>•</span>
                    <span v-if="gameStore.activePlayer.timesRevived" class="text-amber-400 font-bold">✨ {{ t('revivedBadge') }}</span>
                  </div>
                </div>
              </div>

              <!-- Decision Instruction Notice -->
              <div class="p-2.5 bg-indigo-950/70 border border-indigo-500/40 rounded-2xl text-xs font-tajawal text-indigo-200 leading-relaxed">
                {{ isRtl ? `المتسابق #${gameStore.activePlayer.number} (${gameStore.activePlayer.displayName}) يملك حق القرار الآن عبر شات البث!` : `Contender #${gameStore.activePlayer.number} (${gameStore.activePlayer.displayName}) has execution authority in chat!` }}
                <div class="text-[11px] font-mono text-amber-300 mt-1 font-bold">
                  {{ t('chatInstructions') }}
                </div>
              </div>

              <!-- Available Powers Badges -->
              <div class="flex items-center justify-center gap-2 pt-1">
                <span class="px-3 py-1 bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-cairo font-bold rounded-full flex items-center gap-1 shadow-sm">
                  <span>💥</span>
                  <span>{{ t('eliminateBtn') }}</span>
                </span>
                <span
                  v-if="activePlayerCanRevive"
                  class="px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-cairo font-bold rounded-full flex items-center gap-1 shadow-sm animate-pulse"
                >
                  <span>✨</span>
                  <span>{{ t('reviveBtn') }}</span>
                </span>
                <span
                  v-else-if="activePlayerReviveAlreadyUsed"
                  class="px-3 py-1 bg-neutral-900 border border-neutral-700 text-neutral-400 text-xs font-cairo rounded-full flex items-center gap-1 opacity-70"
                >
                  <span>⚡</span>
                  <span>{{ t('reviveUsedBadge') }}</span>
                </span>
              </div>

              <!-- Turn Timer Bar -->
              <div class="pt-2">
                <TurnTimer
                  :duration-seconds="gameStore.turnDuration"
                  :timer-ends-at="gameStore.timerEndsAt"
                  @timeout="onTimerTimeout"
                />
              </div>
            </div>
          </div>

          <!-- ================= VICTORY BANNER POPUP ================= -->
          <div
            v-if="gameStore.status === 'FINISHED' && gameStore.winner"
            class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          >
            <div class="relative max-w-md w-full p-6 bg-gradient-to-b from-indigo-950/90 via-arena-dark to-arena-dark border-2 border-indigo-500 rounded-3xl shadow-glow-crimson text-center space-y-3 animate-scale-up">
              <div class="text-xs font-cairo text-indigo-400 font-bold uppercase tracking-widest">
                {{ t('championDeclared') }}
              </div>
              <img
                :src="gameStore.winner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${gameStore.winner.username}`"
                class="w-20 h-20 mx-auto rounded-full border-3 border-indigo-400 shadow-glow-crimson"
              />
              <div class="font-cairo font-black text-2xl text-white">
                #{{ gameStore.winner.number }} // {{ gameStore.winner.displayName }}
              </div>
              <div class="font-tajawal text-sm text-indigo-200">
                {{ t('totalKills') }}: <strong class="text-white">{{ gameStore.winner.killsCount || 0 }}</strong> • {{ t('soleSurvivor') }}
              </div>
              <GamerButton
                size="sm"
                variant="primary"
                rounded="full"
                class="mt-2 text-xs"
                @click="gameStore.performAction('RESET_GAME')"
              >
                {{ t('resetGameBtn') }}
              </GamerButton>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= TACTICAL COMMAND SIDEBAR (Right Panel, 4 cols) ================= -->
      <div v-if="isSidebarOpen" class="lg:col-span-4 flex flex-col min-h-0 overflow-hidden space-y-2.5">
        <!-- Sidebar Navigation Tabs -->
        <div class="p-1 bg-arena-card border border-arena-border rounded-xl flex items-center justify-between gap-1 shadow-sm shrink-0">
          <button
            type="button"
            :class="[
              'flex-1 py-1.5 rounded-lg text-xs font-cairo font-bold transition-all flex items-center justify-center gap-1',
              activeSidebarTab === 'PLAYERS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'text-arena-textMuted hover:text-white'
            ]"
            @click="activeSidebarTab = 'PLAYERS'"
          >
            <span v-if="gameStore.currentSession?.gameType === 'BOARD_PARTY'">🛡️</span>
            <span v-else-if="gameStore.currentSession?.gameType === 'TRIVIA'">🏆</span>
            <span v-else-if="gameStore.currentSession?.gameType === 'TYPE_RACE'">⚡</span>
            <span v-else-if="gameStore.currentSession?.gameType === 'HANGMAN'">🕵️</span>
            <span v-else-if="gameStore.currentSession?.gameType === 'SUBWAY_RUNNER'">🏃‍♂️</span>
            <span v-else>👥</span>
            <span v-if="gameStore.currentSession?.gameType === 'BOARD_PARTY'">
              {{ isRtl ? 'الفرق' : 'Teams' }} ({{ gameStore.players.length }})
            </span>
            <span v-else-if="gameStore.currentSession?.gameType === 'HANGMAN'">
              {{ isRtl ? 'المشاركون والمحاولات' : 'Contenders & Guesses' }} ({{ gameStore.players.length }})
            </span>
            <span v-else-if="gameStore.currentSession?.gameType === 'TRIVIA' || gameStore.currentSession?.gameType === 'TYPE_RACE'">
              {{ isRtl ? 'المتسابقون والنقاط' : 'Contenders & Scores' }} ({{ gameStore.players.length }})
            </span>
            <span v-else-if="gameStore.currentSession?.gameType === 'SUBWAY_RUNNER'">
              {{ isRtl ? 'المتسابقون والقلوب' : 'Contenders & Hearts' }} ({{ Object.keys(gameStore.currentSession?.subwayRunnerState?.contenders || {}).length || gameStore.players.length }})
            </span>
            <span v-else>
              {{ t('contendersRoster') }} ({{ gameStore.alivePlayers.length }})
            </span>
          </button>

          <button
            type="button"
            :class="[
              'flex-1 py-1.5 rounded-lg text-xs font-cairo font-bold transition-all flex items-center justify-center gap-1',
              activeSidebarTab === 'LOGS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'text-arena-textMuted hover:text-white'
            ]"
            @click="activeSidebarTab = 'LOGS'"
          >
            <span v-if="gameStore.currentSession?.gameType === 'BOARD_PARTY'">🎲</span>
            <span v-else-if="gameStore.currentSession?.gameType === 'TRIVIA'">📊</span>
            <span v-else-if="gameStore.currentSession?.gameType === 'TYPE_RACE'">⚡</span>
            <span v-else-if="gameStore.currentSession?.gameType === 'HANGMAN'">🕵️</span>
            <span v-else>⚔️</span>
            <span>{{ gameStore.currentSession?.gameType === 'BOARD_PARTY' ? (isRtl ? 'سجل الأحداث' : 'Board Feed') : (gameStore.currentSession?.gameType === 'TRIVIA' ? (isRtl ? 'سجل الإجابات' : 'Answers Feed') : (gameStore.currentSession?.gameType === 'TYPE_RACE' ? (isRtl ? 'سجل السرعة' : 'Speed Feed') : (gameStore.currentSession?.gameType === 'HANGMAN' ? (isRtl ? 'سجل التخمينات' : 'Guesses Feed') : t('battleFeed')))) }}</span>
          </button>

          <button
            type="button"
            :class="[
              'flex-1 py-1.5 rounded-lg text-xs font-cairo font-bold transition-all flex items-center justify-center gap-1',
              activeSidebarTab === 'CHAT'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'text-arena-textMuted hover:text-white'
            ]"
            @click="activeSidebarTab = 'CHAT'"
          >
            <span>💬</span>
            <span>{{ t('simulatorTab') }}</span>
          </button>
        </div>

        <!-- TAB 1: Contenders Roster Panel -->
        <div v-if="activeSidebarTab === 'PLAYERS'" class="flex-1 min-h-0 overflow-y-auto pr-1">
          <!-- Board Party Teams Roster -->
          <GamerCard
            v-if="gameStore.currentSession?.gameType === 'BOARD_PARTY'"
            :title="isRtl ? `لوحة الفرق التكتيكية (${gameStore.players.length})` : `Faction Teams (${gameStore.players.length})`"
            :subtitle="isRtl ? 'توزيع المشاهدين على الفرق الثلاثة' : '3-Team Audience Distribution'"
          >
            <BoardPartyTeamsList
              :players="gameStore.players"
              :board-state="gameStore.currentSession?.boardPartyState"
            />
          </GamerCard>

          <!-- Trivia Roster -->
          <GamerCard
            v-else-if="gameStore.currentSession?.gameType === 'TRIVIA'"
            :title="isRtl ? `لوحة المتسابقين والنقاط (${gameStore.players.length})` : `Contenders & Scores (${gameStore.players.length})`"
            :subtitle="isRtl ? 'المشاركون وإجاباتهم في الشات' : 'Chat contenders and their live answers'"
          >
            <TriviaContendersList
              :players="gameStore.players"
              :trivia-state="gameStore.currentSession?.triviaState"
              :is-admin="true"
              @kick-player="kickPlayer"
            />
          </GamerCard>

          <!-- Type Race Roster -->
          <GamerCard
            v-else-if="gameStore.currentSession?.gameType === 'TYPE_RACE'"
            :title="isRtl ? `لوحة صدارة السرعة (${gameStore.players.length})` : `Speed Leaderboard (${gameStore.players.length})`"
            :subtitle="isRtl ? 'نقاط وسرعة استجابة المتسابقين' : 'Contenders scores & reaction speed'"
          >
            <div class="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <template v-for="(p, index) in [...gameStore.players].sort((a, b) => (b.score || 0) - (a.score || 0))" :key="p.username">
                <div class="flex items-center justify-between p-2.5 bg-arena-card hover:bg-amber-950/40 border border-arena-border/80 hover:border-amber-500/50 rounded-2xl transition-all">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="font-mono text-xs font-bold text-amber-400 w-5">#{{ index + 1 }}</span>
                    <img
                      :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`"
                      class="w-8 h-8 rounded-full border border-amber-400/50 shrink-0"
                    />
                    <div class="min-w-0">
                      <div class="font-cairo font-bold text-xs text-white truncate">{{ p.displayName }}</div>
                      <div class="text-[10px] font-tajawal text-slate-400 font-mono">@{{ p.username }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/40">
                      {{ p.score || 0 }} {{ isRtl ? 'نقطة' : 'pts' }}
                    </span>
                    <button
                      type="button"
                      class="w-6 h-6 rounded-full bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                      title="Kick"
                      @click="kickPlayer(p.number)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </template>
              <div v-if="gameStore.players.length === 0" class="text-center py-6 space-y-2">
                <div class="text-xs font-tajawal text-arena-textMuted">{{ t('emptyLobbyMsg') }}</div>
                <GamerButton size="sm" variant="secondary" rounded="full" class="text-xs" @click="populateMockContenders(6)">
                  {{ t('autoFillBtn') }}
                </GamerButton>
              </div>
            </div>
          </GamerCard>

          <!-- Hangman Word Guess Roster -->
          <GamerCard
            v-else-if="gameStore.currentSession?.gameType === 'HANGMAN'"
            :title="isRtl ? `لوحة المتسابقين والتخمينات (${gameStore.players.length})` : `Contenders & Guesses (${gameStore.players.length})`"
            :subtitle="isRtl ? 'المحاولات المتبقية (5 لكل متسابق) وحالة التخمين' : 'Remaining attempts (5 per player) & guess status'"
          >
            <div class="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <template v-for="(p, index) in gameStore.players" :key="p.username">
                <div class="flex items-center justify-between p-2.5 bg-arena-card hover:bg-emerald-950/40 border border-arena-border/80 hover:border-emerald-500/50 rounded-2xl transition-all">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="font-mono text-xs font-bold text-emerald-400 w-5">#{{ index + 1 }}</span>
                    <img
                      :src="p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`"
                      class="w-8 h-8 rounded-full border border-emerald-400/50 shrink-0"
                    />
                    <div class="min-w-0">
                      <div class="font-cairo font-bold text-xs text-white truncate flex items-center gap-1.5">
                        <span>{{ p.displayName }}</span>
                        <span
                          v-if="gameStore.currentSession?.hangmanState?.playersProgress?.[p.username.toLowerCase()]?.hasWon"
                          class="text-xs text-yellow-400 font-black animate-bounce"
                        >
                          👑 {{ isRtl ? 'فائز' : 'SOLVED' }}
                        </span>
                      </div>
                      <div class="text-[10px] font-tajawal text-slate-400 font-mono">@{{ p.username }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded-lg font-mono font-bold text-xs border"
                      :class="
                        (gameStore.currentSession?.hangmanState?.playersProgress?.[p.username.toLowerCase()]?.attemptsLeft ?? 5) === 0
                          ? 'bg-red-950/80 text-red-400 border-red-500/50'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      "
                    >
                      {{ (gameStore.currentSession?.hangmanState?.playersProgress?.[p.username.toLowerCase()]?.attemptsLeft ?? 5) }}/5 {{ isRtl ? 'محاولات' : 'left' }}
                    </span>
                    <button
                      type="button"
                      class="w-6 h-6 rounded-full bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                      title="Kick"
                      @click="kickPlayer(p.number)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </template>
              <div v-if="gameStore.players.length === 0" class="text-center py-6 space-y-2">
                <div class="text-xs font-tajawal text-arena-textMuted">{{ t('emptyLobbyMsg') }}</div>
                <GamerButton size="sm" variant="secondary" rounded="full" class="text-xs" @click="populateMockContenders(6)">
                  {{ t('autoFillBtn') }}
                </GamerButton>
              </div>
            </div>
          </GamerCard>

          <!-- Roulette Roster -->
          <GamerCard
            v-else
            :title="`${t('contendersRoster')} (${gameStore.alivePlayers.length}/${gameStore.players.length})`"
            :subtitle="t('clickToKick')"
          >
            <div class="max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
              <PlayerGrid
                :players="gameStore.players"
                :active-player-number="!isSpinning && gameStore.status === 'WAITING_ACTION' ? gameStore.activePlayer?.number || null : null"
                :target-player-number="!isSpinning ? gameStore.targetPlayer?.number || null : null"
                :is-controller-mode="true"
                :waiting-action="!isSpinning && gameStore.status === 'WAITING_ACTION'"
                @kill-player="eliminatePlayer"
                @revive-player="revivePlayer"
                @kick-player="kickPlayer"
              />
            </div>

            <!-- Empty Lobby State -->
            <div v-if="gameStore.players.length === 0" class="text-center py-6 space-y-2">
              <div class="text-xs font-tajawal text-arena-textMuted">
                {{ t('emptyLobbyMsg') }}
              </div>
              <GamerButton size="sm" variant="secondary" rounded="full" class="text-xs" @click="populateMockContenders(6)">
                {{ t('autoFillBtn') }}
              </GamerButton>
            </div>
          </GamerCard>
        </div>

        <!-- TAB 2: Battle Feed & Event Logs -->
        <div v-else-if="activeSidebarTab === 'LOGS'" class="flex-1 min-h-0 overflow-y-auto pr-1">
          <GamerCard
            :title="gameStore.currentSession?.gameType === 'BOARD_PARTY' ? (isRtl ? 'سجل أحداث حلبة الفرق' : 'Board Combat Log') : (gameStore.currentSession?.gameType === 'TRIVIA' ? (isRtl ? 'سجل الإجابات والتصويت' : 'Live Answers Feed') : t('actionFeedTitle'))"
            :subtitle="gameStore.currentSession?.gameType === 'BOARD_PARTY' ? (isRtl ? 'أحداث حركة الفرق والفخاخ' : 'Pawn movements & tile events') : (gameStore.currentSession?.gameType === 'TRIVIA' ? (isRtl ? 'تفاعل الشات لايف' : 'Live chat interaction') : t('battleFeed'))"
          >
            <GameLogs :logs="gameStore.currentSession?.logs || []" />
          </GamerCard>
        </div>

        <!-- TAB 3: Chat Command Simulator -->
        <div v-else-if="activeSidebarTab === 'CHAT'" class="flex-1 min-h-0 overflow-y-auto pr-1">
          <ChatSimulator
            :active-player-username="gameStore.activePlayer?.username"
            :active-player-number="gameStore.activePlayer?.number"
            :players-count="gameStore.players.length"
            :verification-code="gameStore.currentSession?.verificationCode"
            :is-broadcaster-verified="gameStore.currentSession?.isBroadcasterVerified"
            :streamer-username="gameStore.currentSession?.streamerUsername"
            :game-type="gameStore.currentSession?.gameType"
            :current-word="gameStore.currentSession?.typeRaceState?.currentWord"
            @send-command="handleSimulatorCommand"
            @populate-mock-players="populateMockContenders"
          />
        </div>

        <!-- Twitch IRC Live Connection Status Bar -->
        <div class="p-2.5 bg-arena-card/90 border border-arena-border rounded-xl flex items-center justify-between gap-2 text-xs shrink-0">
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                twitchChat.isConnected.value ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-amber-400'
              ]"
            />
            <span class="font-cairo text-[11px] text-arena-textMuted truncate max-w-[180px]">
              {{ twitchChat.isConnected.value ? `${t('chatStatusConnected')} (${twitchChat.channelName.value})` : t('chatStatusConnecting') }}
            </span>
          </div>

          <button
            type="button"
            class="px-2.5 py-0.5 bg-arena-dark hover:bg-arena-crimson border border-arena-border text-white rounded-full font-cairo text-[11px] font-bold transition-colors"
            @click="showPlatformModal = true"
          >
            {{ t('changeChannel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TriviaCategoryModal
      :is-open="showTriviaCategoryModal"
      :selected-categories="gameStore.currentSession?.settings?.triviaCategories"
      :total-questions="gameStore.currentSession?.settings?.triviaTotalQuestions"
      :time-limit-seconds="gameStore.currentSession?.settings?.triviaTimeLimitSeconds"
      @close="showTriviaCategoryModal = false"
      @save="handleTriviaCategorySave"
    />

    <GameRulesModal
      :is-open="showRulesModal"
      :game-type="gameStore.currentSession?.gameType"
      @close="showRulesModal = false"
    />

    <GameSettingsModal
      :is-open="showSettingsModal"
      :settings="gameStore.currentSession?.settings"
      :game-type="gameStore.currentSession?.gameType"
      @close="showSettingsModal = false"
      @save="(s) => gameStore.updateSettings(s)"
    />

    <PlatformConnectModal
      :is-open="showPlatformModal"
      :platforms="connectedPlatforms"
      @close="showPlatformModal = false"
      @save="handleMultiPlatformConnect"
    />

    <ChannelVerifyModal
      :is-open="showVerifyModal"
      :verification-code="gameStore.currentSession?.verificationCode"
      :is-verified="gameStore.currentSession?.isBroadcasterVerified"
      :streamer-username="gameStore.currentSession?.streamerUsername"
      @close="showVerifyModal = false"
      @verify="gameStore.performAction('VERIFY_BROADCASTER')"
    />

    <ConfirmModal
      :is-open="confirmModalState.isOpen"
      :title="confirmModalState.title"
      :message="confirmModalState.message"
      :confirm-text="confirmModalState.confirmText"
      :cancel-text="confirmModalState.cancelText"
      :variant="confirmModalState.variant"
      @close="confirmModalState.isOpen = false"
      @confirm="confirmModalState.onConfirm"
    />
  </div>
</template>
