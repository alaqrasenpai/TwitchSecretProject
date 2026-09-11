<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  badge: string;
  themeColor: string;
  accentBorder: string;
  bgGlow: string;
  selected: boolean;
  channelName: string;
}

const props = defineProps<{
  isOpen: boolean;
  initialChannel?: string;
  initialPlatforms?: { id: string; channel: string }[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'connect', platforms: { id: string; channel: string }[], autoConnect: boolean): void;
}>();

const { t, isRtl } = useTranslation();

const autoConnect = ref(true);
const validationError = ref('');

const platforms = ref<PlatformConfig[]>([
  {
    id: 'twitch',
    name: 'Twitch',
    icon: '🟣',
    badge: 'IRC Realtime',
    themeColor: 'text-purple-400',
    accentBorder: 'border-purple-500/60 focus-within:border-purple-400',
    bgGlow: 'bg-purple-950/40',
    selected: true,
    channelName: props.initialChannel || ''
  },
  {
    id: 'kick',
    name: 'Kick',
    icon: '🟢',
    badge: 'Live Webhook',
    themeColor: 'text-emerald-400',
    accentBorder: 'border-emerald-500/60 focus-within:border-emerald-400',
    bgGlow: 'bg-emerald-950/40',
    selected: false,
    channelName: ''
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    badge: 'Chat Stream',
    themeColor: 'text-rose-400',
    accentBorder: 'border-rose-500/60 focus-within:border-rose-400',
    bgGlow: 'bg-rose-950/40',
    selected: false,
    channelName: ''
  }
]);

watch(
  () => props.initialPlatforms,
  (newPlatforms) => {
    if (newPlatforms && newPlatforms.length > 0) {
      platforms.value.forEach((p) => {
        const match = newPlatforms.find((np) => np.id === p.id);
        if (match) {
          p.selected = true;
          p.channelName = match.channel;
        }
      });
    }
  },
  { immediate: true }
);

function togglePlatform(plat: PlatformConfig) {
  plat.selected = !plat.selected;
  validationError.value = '';
}

function handleConnect() {
  const activeSelected = platforms.value
    .filter((p) => p.selected && p.channelName.trim())
    .map((p) => ({ id: p.id, channel: p.channelName.trim() }));

  if (activeSelected.length === 0) {
    validationError.value = isRtl.value
      ? 'يرجى تفعيل منصة واحدة على الأقل وإدخال اسم القناة'
      : 'Please enable at least one platform and enter your channel name';
    return;
  }

  validationError.value = '';
  emit('connect', activeSelected, autoConnect.value);
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
        'relative w-full max-w-xl bg-[#090d16] border border-[#222d45] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 sm:p-7 space-y-5 animate-scale-up overflow-hidden',
        isRtl ? 'text-right' : 'text-left'
      ]"
    >
      <!-- Cyber Ambient Glow Behind Header -->
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-32 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <!-- Top Header & Close -->
      <div class="flex items-start justify-between relative z-10 border-b border-[#1c2438] pb-4">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span>{{ isRtl ? 'بوابة ربط البث التفاعلي' : 'LIVE TRANSMISSION GATEWAY' }}</span>
          </div>
          <h3 class="font-cairo font-black text-2xl text-white">
            {{ isRtl ? 'إعداد قنوات البث المباشر' : 'Broadcast Channel Feeds' }}
          </h3>
          <p class="text-xs font-tajawal text-slate-400">
            {{ isRtl ? 'فعل المنصات التي تبث عليها واكتب اسم القناة لربط شات المتابعين باللعبة' : 'Enable your streaming platforms and enter channel names to sync chat commands' }}
          </p>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#111827] border border-[#222d45] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm shrink-0"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Integrated Channel Slots (Platform Card + Embedded Input Strip) -->
      <div class="space-y-3 relative z-10">
        <div
          v-for="plat in platforms"
          :key="plat.id"
          :class="[
            'p-4 rounded-2xl border transition-all duration-300 space-y-3',
            plat.selected
              ? `${plat.accentBorder} ${plat.bgGlow} shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-gradient-to-r from-[#111625] to-[#0c101d]`
              : 'border-[#1e273b] bg-[#0e131f]/70 opacity-60 hover:opacity-90'
          ]"
        >
          <!-- Platform Header Strip (Icon, Title, Badge & Toggle) -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 cursor-pointer" @click="togglePlatform(plat)">
              <div
                :class="[
                  'w-10 h-10 rounded-xl flex items-center justify-center text-xl border transition-all',
                  plat.selected ? 'bg-[#182033] border-indigo-500/50 shadow-sm' : 'bg-[#111625] border-slate-700/50'
                ]"
              >
                {{ plat.icon }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-cairo font-black text-sm text-white">{{ plat.name }}</span>
                  <span class="px-2 py-0.5 rounded-md bg-[#161c2e] border border-[#283552] text-[10px] font-mono font-bold text-slate-300">
                    {{ plat.badge }}
                  </span>
                </div>
                <div class="text-[11px] font-tajawal text-slate-400">
                  {{ plat.selected ? (isRtl ? 'المنصة نشطة وجاهزة للربط' : 'Active Channel Feed') : (isRtl ? 'انقر للتفعيل والربط' : 'Click to enable') }}
                </div>
              </div>
            </div>

            <!-- Custom Cyber Toggle Switch -->
            <button
              type="button"
              :class="[
                'w-12 h-6 rounded-full transition-all relative p-0.5 shrink-0 border',
                plat.selected ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]' : 'bg-[#161c2d] border-[#27334d]'
              ]"
              @click="togglePlatform(plat)"
            >
              <div
                :class="[
                  'w-4 h-4 rounded-full bg-white transition-transform shadow-md',
                  plat.selected ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                ]"
              />
            </button>
          </div>

          <!-- Embedded Channel Input (Shown only when active) -->
          <div v-if="plat.selected" class="pt-1 transition-all">
            <div class="relative flex items-center">
              <div class="absolute inset-y-0 flex items-center pointer-events-none px-3.5 text-xs text-indigo-400 font-mono font-bold" :class="isRtl ? 'right-0' : 'left-0'">
                @
              </div>
              <input
                v-model="plat.channelName"
                type="text"
                :placeholder="isRtl ? `اكتب اسم قناة ${plat.name} هنا...` : `Enter ${plat.name} channel or username...`"
                :class="[
                  'w-full py-2.5 bg-[#090d16] border border-[#222d45] focus:border-indigo-400 rounded-xl font-tajawal text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner',
                  isRtl ? 'pr-8 pl-4 text-right' : 'pl-8 pr-4 text-left'
                ]"
                @input="validationError = ''"
                @keyup.enter="handleConnect"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Error Message -->
      <div v-if="validationError" class="p-3 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-xs font-tajawal text-rose-200 flex items-center gap-2 animate-shake">
        <span>⚠️</span>
        <span>{{ validationError }}</span>
      </div>

      <!-- Auto-Connect Memory Chip -->
      <div class="p-3.5 bg-[#0e1320] rounded-2xl border border-[#1e273b] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm">
            ⚡
          </div>
          <div>
            <div class="font-cairo font-bold text-xs text-white">
              {{ isRtl ? 'حفظ القنوات تلقائياً' : 'Remember Channel Preferences' }}
            </div>
            <div class="text-[10px] font-tajawal text-slate-400">
              {{ isRtl ? 'سيتم تذكر إعدادات البث واستخدامها في الجولات القادمة' : 'Automatically sync these feeds in future tournament sessions' }}
            </div>
          </div>
        </div>

        <button
          type="button"
          :class="[
            'w-11 h-5 rounded-full transition-all relative p-0.5 shrink-0 border',
            autoConnect ? 'bg-indigo-600 border-indigo-400' : 'bg-[#161c2d] border-[#27334d]'
          ]"
          @click="autoConnect = !autoConnect"
        >
          <div
            :class="[
              'w-3.5 h-3.5 rounded-full bg-white transition-transform',
              autoConnect ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
            ]"
          />
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 pt-2">
        <button
          type="button"
          class="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cairo font-black text-sm shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-indigo-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          @click="handleConnect"
        >
          <span>⚡</span>
          <span>{{ isRtl ? 'إطلاق ومزامنة البث المباشر' : 'Launch & Sync Live Feeds' }}</span>
        </button>

        <button
          type="button"
          class="px-6 py-3.5 rounded-2xl bg-[#111827] border border-[#222d45] text-xs font-cairo font-bold text-slate-300 hover:text-white transition-colors"
          @click="$emit('close')"
        >
          {{ isRtl ? 'إلغاء' : 'Cancel' }}
        </button>
      </div>
    </div>
  </div>
</template>
