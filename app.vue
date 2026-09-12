<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useTranslation, translations } from '~/composables/useTranslation';

const authStore = useAuthStore();
const { locale } = useTranslation();

useHead({
  title: computed(() => (translations[locale.value] as any)?.pageTitle || 'ChatWar // Interactive Twitch Stream Games'),
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: computed(() => (locale.value === 'ar' ? 'rtl' : 'ltr'))
  }
});

onMounted(async () => {
  await authStore.fetchCurrentUser();
});
</script>

<template>
  <div class="bg-brand-onyx min-h-screen text-brand-textMain">
    <NuxtLoadingIndicator
      color="repeating-linear-gradient(to right, #6366f1 0%, #a855f7 50%, #38bdf8 100%)"
      :height="3"
      :duration="1600"
      :throttle="0"
    />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
