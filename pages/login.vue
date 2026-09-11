<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerCard from '~/components/common/GamerCard.vue';

const authStore = useAuthStore();
const route = useRoute();

const isBannedError = computed(() => route.query.error === 'banned');

function loginWithTwitch() {
  window.location.href = '/api/auth/twitch/login';
}

function loginAsDevStreamer() {
  authStore.setDevStreamer('crimson_warlord', 'CrimsonWarlord');
  navigateTo('/dashboard');
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <GamerCard title="Streamer Authorization" subtitle="Connect with your Twitch Channel" :glow="true">
        <div class="space-y-6 text-center py-4">
          <div class="w-16 h-16 mx-auto bg-brand-obsidian border-2 border-brand-crimson clip-tactical flex items-center justify-center shadow-glow-red">
            <svg class="w-8 h-8 text-brand-crimson" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
            </svg>
          </div>

          <div class="space-y-1">
            <h3 class="font-display font-black text-xl text-white uppercase tracking-wider">
              Streamer Portal
            </h3>
            <p class="text-xs font-mono text-brand-textMuted">
              Sign in with your Twitch account to read chat commands and broadcast to OBS.
            </p>
          </div>

          <div v-if="isBannedError" class="p-3 bg-red-950/80 border border-red-500 clip-tactical text-xs text-red-200 font-mono">
            ⚠️ This streamer account has been suspended by system administrators.
          </div>

          <div class="space-y-3 pt-2">
            <GamerButton
              size="lg"
              variant="primary"
              class="w-full"
              @click="loginWithTwitch"
            >
              Sign In with Twitch OAuth
            </GamerButton>

            <div class="relative flex py-2 items-center">
              <div class="flex-grow border-t border-brand-slateLight/40"></div>
              <span class="flex-shrink mx-4 text-[10px] font-mono text-brand-textDark uppercase">OR TEST LOCALLY</span>
              <div class="flex-grow border-t border-brand-slateLight/40"></div>
            </div>

            <GamerButton
              size="md"
              variant="secondary"
              class="w-full"
              @click="loginAsDevStreamer"
            >
              Simulate Dev Streamer Account
            </GamerButton>
          </div>
        </div>
      </GamerCard>
    </div>
  </div>
</template>
