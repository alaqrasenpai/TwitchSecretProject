<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerCard from '~/components/common/GamerCard.vue';

const authStore = useAuthStore();
const username = ref('admin');
const password = ref('crimson_admin_2026!');
const errorMessage = ref('');
const isSubmitting = ref(false);

async function handleAdminLogin() {
  errorMessage.value = '';
  isSubmitting.value = true;
  try {
    const success = await authStore.loginAdmin({
      username: username.value,
      password: password.value
    });

    if (success) {
      navigateTo('/admin');
    } else {
      errorMessage.value = authStore.error || 'Access Denied: Invalid Security Passcode.';
    }
  } catch (e: any) {
    errorMessage.value = 'Failed to connect to Security Vault.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <GamerCard
        title="SECURITY VAULT ACCESS"
        subtitle="RESTRICTED // ROOT ADMINISTRATIVE CLEARANCE ONLY"
        variant="blood"
        :glow="true"
      >
        <div class="space-y-6 py-2">
          <!-- Crimson Lock Icon -->
          <div class="w-16 h-16 mx-auto bg-brand-bloodDark border-2 border-brand-crimson clip-tactical flex items-center justify-center shadow-glow-blood">
            <svg class="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div v-if="errorMessage" class="p-3 bg-red-950 border border-red-500 clip-tactical text-xs text-red-200 font-mono">
            ⚠️ {{ errorMessage }}
          </div>

          <form class="space-y-4" @submit.prevent="handleAdminLogin">
            <div class="space-y-1 text-left">
              <label class="font-mono text-xs text-red-300 font-bold uppercase tracking-wider">
                Admin Username
              </label>
              <input
                v-model="username"
                type="text"
                required
                class="w-full px-4 py-2.5 bg-brand-obsidian border border-red-900/80 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-crimson"
                placeholder="admin"
              />
            </div>

            <div class="space-y-1 text-left">
              <label class="font-mono text-xs text-red-300 font-bold uppercase tracking-wider">
                Vault Passcode
              </label>
              <input
                v-model="password"
                type="password"
                required
                class="w-full px-4 py-2.5 bg-brand-obsidian border border-red-900/80 rounded font-mono text-sm text-white focus:outline-none focus:border-brand-crimson"
                placeholder="••••••••••••"
              />
            </div>

            <div class="pt-2">
              <GamerButton
                size="lg"
                variant="primary"
                type="submit"
                :loading="isSubmitting"
                class="w-full"
              >
                Authenticate & Unlock Vault
              </GamerButton>
            </div>
          </form>

          <div class="p-2.5 bg-brand-obsidian/70 border border-neutral-800 rounded text-[11px] font-mono text-brand-textDark text-center">
            Credentials configured in <code class="text-red-400">.env</code> (ADMIN_USERNAME / ADMIN_PASSWORD)
          </div>
        </div>
      </GamerCard>
    </div>
  </div>
</template>
