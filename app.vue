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
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
