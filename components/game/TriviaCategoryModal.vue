<script setup lang="ts">
import { useTranslation } from '~/composables/useTranslation';
import { TRIVIA_CATEGORIES, type ITriviaCategoryMeta } from '~/server/utils/triviaBank';

const props = defineProps<{
  isOpen: boolean;
  selectedCategories?: string[];
  totalQuestions?: number;
  timeLimitSeconds?: number;
  triviaLanguage?: 'AR' | 'EN' | 'BOTH';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', config: { categories: string[]; totalQuestions: number; timeLimitSeconds: number; triviaLanguage?: 'AR' | 'EN' | 'BOTH' }): void;
}>();

const { t, isRtl, locale } = useTranslation();

const localSelectedCategories = ref<string[]>([]);
const localTotalQuestions = ref(10);
const localTimeLimitSeconds = ref(20);
const localTriviaLanguage = ref<'AR' | 'EN' | 'BOTH'>('AR');

// Exclude the meta 'all' item from raw checkbox grid, or keep as toggle
const categoriesList = computed(() => {
  return TRIVIA_CATEGORIES.filter((c) => c.id !== 'all');
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.selectedCategories && props.selectedCategories.length > 0) {
        localSelectedCategories.value = [...props.selectedCategories];
      } else {
        // Default select all categories
        localSelectedCategories.value = categoriesList.value.map((c) => c.id);
      }
      localTotalQuestions.value = props.totalQuestions || 10;
      localTimeLimitSeconds.value = props.timeLimitSeconds || 20;
      localTriviaLanguage.value = props.triviaLanguage || 'AR';
    }
  },
  { immediate: true }
);

function toggleCategory(categoryId: string) {
  const idx = localSelectedCategories.value.indexOf(categoryId);
  if (idx !== -1) {
    if (localSelectedCategories.value.length > 1) {
      localSelectedCategories.value.splice(idx, 1);
    }
  } else {
    localSelectedCategories.value.push(categoryId);
  }
}

function selectAll() {
  localSelectedCategories.value = categoriesList.value.map((c) => c.id);
}

function deselectAll() {
  // Keep at least one category selected
  localSelectedCategories.value = [categoriesList.value[0].id];
}

function handleSave() {
  emit('save', {
    categories: localSelectedCategories.value.length > 0 ? localSelectedCategories.value : ['all'],
    totalQuestions: localTotalQuestions.value,
    timeLimitSeconds: localTimeLimitSeconds.value,
    triviaLanguage: localTriviaLanguage.value
  });
  emit('close');
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-cairo"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <div class="relative max-w-xl w-full bg-[#0e111a] border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(99,102,241,0.25)] space-y-6 overflow-hidden">
      
      <!-- Ambient Glow -->
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <!-- Modal Header -->
      <div class="relative z-10 flex items-center justify-between border-b border-[#27314a] pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl shadow-inner">
            🧠
          </div>
          <div>
            <h3 class="text-lg font-black text-white">
              {{ isRtl ? 'اختيار فئات ومواضيع الأسئلة' : 'Select Trivia Categories' }}
            </h3>
            <p class="text-xs text-slate-400">
              {{ isRtl ? 'يمكنك تحديد فئة واحدة أو عدة فئات لتنويع الأسئلة' : 'Select one or multiple categories for the quiz' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#141824] transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Quick Action: Select All / Deselect All -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-300 font-bold">
          {{ isRtl ? 'الفئات المختارة:' : 'Selected Categories:' }}
          <span class="text-indigo-400 font-mono">{{ localSelectedCategories.length }}</span> / {{ categoriesList.length }}
        </span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3 py-1 rounded-lg bg-[#141824] hover:bg-[#1c2234] border border-[#27314a] text-slate-300 hover:text-white text-xs transition"
            @click="selectAll"
          >
            {{ isRtl ? 'تحديد الكل' : 'Select All' }}
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-lg bg-[#141824] hover:bg-[#1c2234] border border-[#27314a] text-slate-300 hover:text-white text-xs transition"
            @click="deselectAll"
          >
            {{ isRtl ? 'إلغاء التحديد' : 'Deselect All' }}
          </button>
        </div>
      </div>

      <!-- Categories Multi-Select Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
        <div
          v-for="cat in categoriesList"
          :key="cat.id"
          @click="toggleCategory(cat.id)"
          :class="[
            'p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 select-none',
            localSelectedCategories.includes(cat.id)
              ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
              : 'bg-[#141824]/80 border-[#27314a] opacity-70 hover:opacity-100 hover:border-slate-600'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ cat.icon }}</span>
            <div>
              <h4 class="text-sm font-bold text-white leading-tight">
                {{ isRtl ? cat.nameAr : cat.nameEn }}
              </h4>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {{ isRtl ? cat.descriptionAr : cat.descriptionEn }}
              </p>
            </div>
          </div>

          <!-- Custom Checkbox Check -->
          <div
            class="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border transition-all mt-0.5"
            :class="[
              localSelectedCategories.includes(cat.id)
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-[#0e111a] border-[#27314a] text-transparent'
            ]"
          >
            ✓
          </div>
        </div>
      </div>

      <!-- Additional Match Settings: Questions Count & Time Limit -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#27314a]">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5">
            {{ isRtl ? '🔢 عدد الأسئلة:' : '🔢 Question Count:' }}
          </label>
          <select
            v-model.number="localTotalQuestions"
            class="w-full px-3.5 py-2.5 bg-[#141824] border border-[#27314a] rounded-xl text-xs font-bold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-inner"
          >
            <option :value="5" class="bg-[#141824] text-white">5 {{ isRtl ? 'أسئلة (جولة سريعة)' : 'Questions (Quick)' }}</option>
            <option :value="10" class="bg-[#141824] text-white">10 {{ isRtl ? 'أسئلة (متوازن)' : 'Questions (Balanced)' }}</option>
            <option :value="15" class="bg-[#141824] text-white">15 {{ isRtl ? 'سؤالاً' : 'Questions' }}</option>
            <option :value="20" class="bg-[#141824] text-white">20 {{ isRtl ? 'سؤالاً (بطولة طويلة)' : 'Questions (Long)' }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5">
            {{ isRtl ? '⏱️ وقت الإجابة للسؤال:' : '⏱️ Timer per Question:' }}
          </label>
          <select
            v-model.number="localTimeLimitSeconds"
            class="w-full px-3.5 py-2.5 bg-[#141824] border border-[#27314a] rounded-xl text-xs font-bold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-inner"
          >
            <option :value="0" class="bg-[#141824] text-white">♾️ {{ isRtl ? 'بدون مؤقت (تحكم يدوي)' : 'Unlimited (Manual Control)' }}</option>
            <option :value="10" class="bg-[#141824] text-white">⚡ 10 {{ isRtl ? 'ثوانٍ (سريع وحماسي)' : 'seconds (Fast & Intense)' }}</option>
            <option :value="15" class="bg-[#141824] text-white">15 {{ isRtl ? 'ثانية' : 'seconds' }}</option>
            <option :value="20" class="bg-[#141824] text-white">20 {{ isRtl ? 'ثانية (الافتراضي)' : 'seconds (Default)' }}</option>
            <option :value="30" class="bg-[#141824] text-white">30 {{ isRtl ? 'ثانية' : 'seconds' }}</option>
            <option :value="45" class="bg-[#141824] text-white">45 {{ isRtl ? 'ثانية (مريح)' : 'seconds (Relaxed)' }}</option>
            <option :value="60" class="bg-[#141824] text-white">60 {{ isRtl ? 'ثانية (دقيقة كاملة)' : 'seconds (Full Minute)' }}</option>
          </select>
        </div>
      </div>

      <!-- Question Language Selector -->
      <div class="pt-3 border-t border-[#27314a]">
        <label class="block text-xs font-bold text-slate-300 mb-2">
          {{ isRtl ? '🌐 لغة عرض الأسئلة:' : '🌐 Question Language:' }}
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            @click="localTriviaLanguage = 'AR'"
            :class="[
              'py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              localTriviaLanguage === 'AR'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-[#141824] text-slate-400 border-[#27314a] hover:text-white hover:border-slate-600'
            ]"
          >
            <span>🇸🇦</span>
            <span>{{ isRtl ? 'عربي فقط' : 'Arabic' }}</span>
          </button>
          <button
            type="button"
            @click="localTriviaLanguage = 'EN'"
            :class="[
              'py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              localTriviaLanguage === 'EN'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-[#141824] text-slate-400 border-[#27314a] hover:text-white hover:border-slate-600'
            ]"
          >
            <span>🇺🇸</span>
            <span>{{ isRtl ? 'English فقط' : 'English' }}</span>
          </button>
          <button
            type="button"
            @click="localTriviaLanguage = 'BOTH'"
            :class="[
              'py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              localTriviaLanguage === 'BOTH'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-[#141824] text-slate-400 border-[#27314a] hover:text-white hover:border-slate-600'
            ]"
          >
            <span>🌐</span>
            <span>{{ isRtl ? 'كلاهما (ثنائي)' : 'Bilingual' }}</span>
          </button>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1c2234] border border-[#27314a] text-slate-300 hover:text-white text-xs font-bold transition"
          @click="emit('close')"
        >
          {{ isRtl ? 'إلغاء' : 'Cancel' }}
        </button>

        <button
          type="button"
          class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-black hover:brightness-110 shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center gap-2"
          @click="handleSave"
        >
          <span>💾</span>
          <span>{{ isRtl ? 'حفظ وتطبيق الفئات' : 'Save & Apply' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
