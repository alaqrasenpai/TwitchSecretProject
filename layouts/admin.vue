<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import GamerBadge from '~/components/common/GamerBadge.vue';

const authStore = useAuthStore();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-brand-onyx text-brand-textMain">
    <!-- Security Vault Banner -->
    <header class="bg-brand-bloodDark/40 border-b border-red-800/60 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-brand-blood clip-tactical flex items-center justify-center shadow-glow-blood">
            <span class="font-display font-black text-white text-base">V</span>
          </div>
          <div>
            <div class="font-display font-black text-base tracking-wider text-red-100 flex items-center gap-2">
              <span>SECURITY VAULT</span>
              <GamerBadge status="ADMIN" size="sm" />
            </div>
            <div class="text-[10px] font-mono text-red-400">
              System Administration & Telemetry
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <NuxtLink
            to="/dashboard"
            class="text-xs font-display font-bold uppercase tracking-wider text-brand-textMuted hover:text-white"
          >
            Streamer Hub
          </NuxtLink>
          <button
            type="button"
            class="text-xs font-mono text-red-400 hover:text-white px-3 py-1 bg-brand-slateDark border border-red-900/60 rounded"
            @click="authStore.logout"
          >
            Lock Vault
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <slot />
    </main>
  </div>
</template>
