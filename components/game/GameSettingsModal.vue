<script setup lang="ts">
import type { IGameSettings } from '~/types/game';
import { useTranslation, getDisplayCommands } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';

const props = defineProps<{
  isOpen: boolean;
  settings: IGameSettings;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', newSettings: Partial<IGameSettings>): void;
}>();

const { t, isRtl } = useTranslation();

const turnTimerChoice = ref<number>(props.settings.turnTimeLimitSeconds || 15);
const isUnlimitedTimer = ref<boolean>(props.settings.turnTimeLimitSeconds === 0);
const allowRevives = ref<boolean>(props.settings.allowRevives !== false);
const maxPlayers = ref<number>(props.settings.maxPlayers || 30);
const subwayRoundsChoice = ref<number>(props.settings.subwayTotalRounds || 5);

const joinCommandsInput = ref<string>('');
const killCommandsInput = ref<string>('');
const reviveCommandsInput = ref<string>('');

function initForm() {
  if (props.settings) {
    turnTimerChoice.value = props.settings.turnTimeLimitSeconds || 15;
    isUnlimitedTimer.value = props.settings.turnTimeLimitSeconds === 0;
    allowRevives.value = props.settings.allowRevives !== false;
    maxPlayers.value = props.settings.maxPlayers || 30;
    subwayRoundsChoice.value = props.settings.subwayTotalRounds || 5;
    joinCommandsInput.value = getDisplayCommands(props.settings.customCommands?.join, 'join', isRtl.value).join(', ');
    killCommandsInput.value = getDisplayCommands(props.settings.customCommands?.kill, 'kill', isRtl.value).join(', ');
    reviveCommandsInput.value = getDisplayCommands(props.settings.customCommands?.revive, 'revive', isRtl.value).join(', ');
  }
}

watch(
  () => props.isOpen,
  (opened) => {
    if (opened) {
      initForm();
    }
  },
  { immediate: true }
);

function parseCommands(input: string, defaultCmd: string): string[] {
  const parts = input
    .split(/[,،]+/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => (c.startsWith('!') ? c : `!${c}`));
  return parts.length > 0 ? Array.from(new Set(parts)) : [defaultCmd];
}

function handleSave() {
  emit('save', {
    turnTimeLimitSeconds: isUnlimitedTimer.value ? 0 : Number(turnTimerChoice.value),
    allowRevives: allowRevives.value,
    maxPlayers: Number(maxPlayers.value),
    subwayTotalRounds: Number(subwayRoundsChoice.value),
    customCommands: {
      join: parseCommands(joinCommandsInput.value, '!join'),
      kill: parseCommands(killCommandsInput.value, '!kill'),
      revive: parseCommands(reviveCommandsInput.value, '!revive')
    }
  });
  emit('close');
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    @click.self="$emit('close')"
  >
    <div
      :class="[
        'relative w-full max-w-xl max-h-[90vh] bg-[#0e111a] border border-[#27314a] rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-up overflow-y-auto',
        isRtl ? 'text-right' : 'text-left'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[#27314a]/80 pb-3.5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] font-black">
            ⚙️
          </div>
          <div>
            <h3 class="font-cairo font-black text-2xl text-white">
              {{ t('settingsModalTitle') }}
            </h3>
            <p class="text-xs font-tajawal text-slate-400">
              {{ t('settingsModalSub') }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#141824] border border-[#27314a] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Settings Form -->
      <div class="space-y-4 font-cairo">
        <!-- 1. Turn Timer Setting -->
        <div class="space-y-2">
          <label class="block font-bold text-sm text-white">
            {{ t('timerSettingLabel') }}
          </label>
          
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              :class="[
                'p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2',
                !isUnlimitedTimer
                  ? 'bg-indigo-950 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'bg-[#141824] border-[#27314a] text-slate-400 hover:text-white'
              ]"
              @click="isUnlimitedTimer = false"
            >
              <span>{{ t('limitedTimerBtn') }}</span>
            </button>

            <button
              type="button"
              :class="[
                'p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2',
                isUnlimitedTimer
                  ? 'bg-indigo-950 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'bg-[#141824] border-[#27314a] text-slate-400 hover:text-white'
              ]"
              @click="isUnlimitedTimer = true"
            >
              <span>{{ t('unlimitedTimerBtn') }}</span>
            </button>
          </div>

          <!-- Seconds dropdown if limited -->
          <div v-if="!isUnlimitedTimer" class="pt-1">
            <select
              v-model="turnTimerChoice"
              class="w-full px-4 py-2.5 bg-[#141824] border border-[#27314a] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option :value="10" class="bg-[#141824] text-white">{{ t('seconds10') }}</option>
              <option :value="15" class="bg-[#141824] text-white">{{ t('seconds15') }}</option>
              <option :value="20" class="bg-[#141824] text-white">{{ t('seconds20') }}</option>
              <option :value="30" class="bg-[#141824] text-white">{{ t('seconds30') }}</option>
              <option :value="60" class="bg-[#141824] text-white">{{ t('seconds60') }}</option>
            </select>
          </div>
        </div>

        <!-- 2. Allow Revives Toggle -->
        <div class="p-3.5 bg-[#141824] rounded-2xl border border-[#27314a] flex items-center justify-between">
          <div>
            <div class="font-bold text-sm text-white">{{ t('allowRevivesLabel') }}</div>
            <div class="text-[11px] font-tajawal text-slate-400">
              {{ t('allowRevivesSub') }}
            </div>
          </div>
          <button
            type="button"
            :class="[
              'w-14 h-7 rounded-full transition-colors relative p-1',
              allowRevives ? 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
            ]"
            @click="allowRevives = !allowRevives"
          >
            <div
              :class="[
                'w-5 h-5 rounded-full bg-white transition-transform',
                allowRevives ? (isRtl ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'
              ]"
            />
          </button>
        </div>

        <!-- 3. Subway Runner Total Rounds -->
        <div v-if="gameType === 'SUBWAY_RUNNER'" class="space-y-2 p-3.5 bg-[#141824] rounded-2xl border border-purple-500/30">
          <label class="block font-bold text-sm text-purple-300 flex items-center gap-1.5">
            <span>🏃‍♂️ {{ isRtl ? 'عدد جولات الهروب (تزداد السرعة مع كل جولة):' : 'Subway Run Total Rounds (Speed increases each round):' }}</span>
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="r in [3, 5, 7, 10]"
              :key="r"
              type="button"
              :class="[
                'p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 font-mono',
                subwayRoundsChoice === r
                  ? 'bg-purple-950 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900 border-[#27314a] text-slate-400 hover:text-white'
              ]"
              @click="subwayRoundsChoice = r"
            >
              <span>{{ r }} {{ isRtl ? 'جولات' : 'Rounds' }}</span>
            </button>
          </div>
        </div>

        <!-- 4. Max Players -->
        <div class="space-y-1.5">
          <label class="block font-bold text-sm text-white">
            {{ t('maxPlayersLabel') }}
          </label>
          <select
            v-model="maxPlayers"
            class="w-full px-4 py-2 bg-[#141824] border border-[#27314a] rounded-xl text-xs font-tajawal text-white focus:outline-none focus:border-indigo-500"
          >
            <option :value="10">10 Contenders</option>
            <option :value="20">20 Contenders</option>
            <option :value="30">30 Contenders (Recommended)</option>
            <option :value="50">50 Contenders</option>
            <option :value="100">100 Contenders (Mega Arena)</option>
          </select>
        </div>

        <!-- 4. Custom Chat Commands Section -->
        <div class="p-4 bg-[#141824] rounded-2xl border border-[#27314a] space-y-3">
          <div class="border-b border-[#27314a] pb-2">
            <div class="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
              <span>{{ t('commandsSettingsTitle') }}</span>
            </div>
            <div class="text-[11px] font-tajawal text-slate-400 mt-0.5">
              {{ t('commandsSettingsSub') }}
            </div>
          </div>

          <!-- Join Commands -->
          <div class="space-y-1">
            <label class="block font-bold text-xs text-emerald-400">
              {{ t('joinCommandsLabel') }}
            </label>
            <input
              v-model="joinCommandsInput"
              type="text"
              :placeholder="t('joinCommandsPlaceholder')"
              class="w-full px-3.5 py-2 bg-[#0e111a] border border-[#27314a] focus:border-emerald-400 rounded-xl text-xs font-mono text-white focus:outline-none shadow-sm"
              dir="ltr"
            />
            <div class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="cmd in parseCommands(joinCommandsInput, '!join')"
                :key="cmd"
                class="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold"
              >
                {{ cmd }}
              </span>
            </div>
          </div>

          <!-- Kill Commands -->
          <div class="space-y-1">
            <label class="block font-bold text-xs text-indigo-400">
              {{ t('killCommandsLabel') }}
            </label>
            <input
              v-model="killCommandsInput"
              type="text"
              :placeholder="t('killCommandsPlaceholder')"
              class="w-full px-3.5 py-2 bg-[#0e111a] border border-[#27314a] focus:border-indigo-400 rounded-xl text-xs font-mono text-white focus:outline-none shadow-sm"
              dir="ltr"
            />
            <div class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="cmd in parseCommands(killCommandsInput, '!kill')"
                :key="cmd"
                class="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 font-mono text-[10px] font-bold"
              >
                {{ cmd }}
              </span>
            </div>
          </div>

          <!-- Revive Commands -->
          <div class="space-y-1">
            <label class="block font-bold text-xs text-amber-400">
              {{ t('reviveCommandsLabel') }}
            </label>
            <input
              v-model="reviveCommandsInput"
              type="text"
              :placeholder="t('reviveCommandsPlaceholder')"
              class="w-full px-3.5 py-2 bg-[#0e111a] border border-[#27314a] focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none shadow-sm"
              dir="ltr"
            />
            <div class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="cmd in parseCommands(reviveCommandsInput, '!revive')"
                :key="cmd"
                class="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-bold"
              >
                {{ cmd }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="border-t border-[#27314a] pt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-5 py-2 text-xs font-cairo font-bold text-slate-400 hover:text-white"
          @click="$emit('close')"
        >
          {{ t('cancel') }}
        </button>
        <GamerButton size="md" variant="primary" rounded="full" @click="handleSave">
          {{ t('saveSettings') }}
        </GamerButton>
      </div>
    </div>
  </div>
</template>
