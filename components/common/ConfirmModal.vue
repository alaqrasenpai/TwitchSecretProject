<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  icon?: string;
}

const props = withDefaults(defineProps<ConfirmModalProps>(), {
  title: '',
  confirmText: '',
  cancelText: '',
  variant: 'danger',
  icon: ''
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'close'): void;
}>();

const { t, isRtl } = useTranslation();

const defaultTitle = computed(() => {
  if (props.title) return props.title;
  if (props.variant === 'danger') return isRtl.value ? 'تأكيد الإجراء' : 'Confirm Action';
  if (props.variant === 'warning') return isRtl.value ? 'تنبيه' : 'Warning';
  return isRtl.value ? 'رسالة' : 'Notice';
});

const defaultConfirmText = computed(() => {
  if (props.confirmText) return props.confirmText;
  if (props.variant === 'danger') return isRtl.value ? 'نعم، استمرار' : 'Yes, Confirm';
  return isRtl.value ? 'موافق' : 'OK';
});

const defaultCancelText = computed(() => {
  if (props.cancelText) return props.cancelText;
  return isRtl.value ? 'إلغاء' : 'Cancel';
});

const iconDisplay = computed(() => {
  if (props.icon) return props.icon;
  if (props.variant === 'danger') return '⚠️';
  if (props.variant === 'warning') return '⚡';
  if (props.variant === 'info') return 'ℹ️';
  return '✨';
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    @click.self="$emit('cancel')"
  >
    <div
      :class="[
        'relative w-full max-w-md bg-[#0e111a] border rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-up',
        variant === 'danger' ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : '',
        variant === 'warning' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : '',
        variant === 'info' || variant === 'primary' ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : '',
        isRtl ? 'text-right' : 'text-left'
      ]"
    >
      <!-- Header with Icon -->
      <div class="flex items-center gap-3.5">
        <div
          :class="[
            'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border',
            variant === 'danger' ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : '',
            variant === 'warning' ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : '',
            variant === 'info' || variant === 'primary' ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300' : ''
          ]"
        >
          {{ iconDisplay }}
        </div>
        <div>
          <h3 class="font-cairo font-black text-xl text-white">
            {{ defaultTitle }}
          </h3>
          <p class="text-xs font-tajawal text-slate-400 mt-0.5">
            ChatWar Arena
          </p>
        </div>
      </div>

      <!-- Message Body -->
      <div class="p-4 bg-[#141824] rounded-2xl border border-[#27314a] font-tajawal text-sm text-slate-200 leading-relaxed">
        {{ message }}
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          class="px-5 py-2.5 rounded-full bg-[#141824] hover:bg-[#1a2030] border border-[#27314a] text-xs font-cairo font-bold text-slate-300 hover:text-white transition-colors"
          @click="$emit('cancel')"
        >
          {{ defaultCancelText }}
        </button>

        <button
          type="button"
          :class="[
            'px-6 py-2.5 rounded-full text-xs font-cairo font-black text-white transition-all shadow-lg hover:scale-105 active:scale-95',
            variant === 'danger' ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-900/50' : '',
            variant === 'warning' ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black shadow-amber-900/50' : '',
            variant === 'info' || variant === 'primary' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-900/50' : ''
          ]"
          @click="$emit('confirm')"
        >
          {{ defaultConfirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
