<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';
import GamerButton from '~/components/common/GamerButton.vue';

const props = defineProps<{
  isOpen: boolean;
  channelName: string;
  verificationCode?: string;
  isVerified?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t, isRtl } = useTranslation();
const isCopied = ref(false);

const verifyCommand = computed(() => `!verify ${props.verificationCode || '1234'}`);

async function copyCode() {
  try {
    await navigator.clipboard.writeText(verifyCommand.value);
    isCopied.value = true;
    setTimeout(() => (isCopied.value = false), 3000);
  } catch (e) {}
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    @click.self="$emit('close')"
  >
    <div
      :class="[
        'relative w-full max-w-lg bg-arena-card border-2 rounded-3xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 shadow-2xl',
        isVerified ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)]' : 'border-amber-500 shadow-glow-gold',
        isRtl ? 'text-right' : 'text-left'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-arena-border/80 pb-3.5">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-lg',
              isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white animate-pulse'
            ]"
          >
            {{ isVerified ? '🛡️' : '🔒' }}
          </div>
          <div>
            <h3 class="font-cairo font-black text-xl text-white">
              {{ isVerified ? t('verifiedBroadcaster') : t('verificationPromptTitle') }}
            </h3>
            <p class="text-xs font-tajawal text-arena-textDark">
              Twitch Channel: <strong class="text-white font-mono">@{{ channelName }}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-full bg-arena-dark border border-arena-border text-arena-textMuted hover:text-white flex items-center justify-center transition-colors text-sm"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Verified Success State -->
      <div v-if="isVerified" class="text-center py-4 space-y-3">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(16,185,129,0.8)]">
          ✅
        </div>
        <div class="font-cairo font-black text-lg text-emerald-300">
          {{ t('broadcasterVerifiedNotice') }}
        </div>
        <p class="font-tajawal text-xs text-neutral-300 max-w-sm mx-auto">
          {{ isRtl ? 'تملك الآن كامل الصلاحيات للتحكم بالغرفة والإعدادات وتفاعل شات البث.' : 'You have full control over the match room, game settings, and Twitch chat integration.' }}
        </p>
        <div class="pt-2">
          <GamerButton size="sm" variant="primary" rounded="full" class="px-6" @click="$emit('close')">
            {{ isRtl ? 'تم، إغلاق النافذة' : 'Got it, Close' }}
          </GamerButton>
        </div>
      </div>

      <!-- Unverified Challenge Instructions -->
      <div v-else class="space-y-4 font-cairo">
        <p class="text-xs font-tajawal text-neutral-200 leading-relaxed">
          {{ t('verificationPromptSub') }}
        </p>

        <!-- Command Copy Box -->
        <div class="p-3.5 bg-arena-dark border-2 border-amber-500/60 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
          <div class="flex items-center gap-2 overflow-hidden">
            <span class="text-lg">💬</span>
            <code class="font-mono font-black text-sm sm:text-base text-amber-300 tracking-wider select-all truncate" dir="ltr">
              {{ verifyCommand }}
            </code>
          </div>

          <button
            type="button"
            :class="[
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm',
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black'
            ]"
            @click="copyCode"
          >
            <span>{{ isCopied ? '✓' : '📋' }}</span>
            <span>{{ isCopied ? t('copiedVerifyCommand') : t('copyVerifyCommand') }}</span>
          </button>
        </div>

        <div class="p-3 bg-neutral-950/60 rounded-xl border border-arena-border/60 text-[11px] font-tajawal text-arena-textMuted space-y-1">
          <div class="font-bold text-amber-200">
            {{ isRtl ? '💡 كيف تعمل ميزة التوثيق عبر الشات؟' : '💡 How does chat verification work?' }}
          </div>
          <div>
            {{ isRtl ? 'بمجرد كتابة الأمر في شات قناتك من حسابك، يتعرف نظام اللعبة فورياً على شارة صاحب القناة (Broadcaster) ويتم توثيق الغرفة في ثوانٍ معدودة.' : 'Once you type the command into your channel chat from your account, the game system instantly detects your Broadcaster badge and verifies the room in seconds.' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
