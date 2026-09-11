<script setup lang="ts">
import type { IPlatformStats, IStreamerManagementItem } from '~/types/admin';
import GamerCard from '~/components/common/GamerCard.vue';
import GamerButton from '~/components/common/GamerButton.vue';
import GamerBadge from '~/components/common/GamerBadge.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
});

const stats = ref<any>({});
const streamers = ref<IStreamerManagementItem[]>([]);
const isLoading = ref(true);
const actionMessage = ref('');
const errorModal = ref({
  isOpen: false,
  message: ''
});

async function loadAdminData() {
  try {
    const [statsRes, streamersRes] = await Promise.all([
      $fetch('/api/admin/stats'),
      $fetch('/api/admin/streamers')
    ]);
    stats.value = statsRes;
    streamers.value = streamersRes as IStreamerManagementItem[];
  } catch (e) {
    console.error('Failed to load admin telemetry', e);
  } finally {
    isLoading.value = false;
  }
}

async function toggleStreamerBan(streamer: IStreamerManagementItem) {
  const newStatus = !streamer.isBanned;
  try {
    await $fetch(`/api/admin/streamer/${streamer.id}/status`, {
      method: 'PUT',
      body: { isBanned: newStatus }
    });
    streamer.isBanned = newStatus;
    actionMessage.value = `Streamer ${streamer.displayName} has been ${newStatus ? 'SUSPENDED' : 'REINSTATED'}.`;
    setTimeout(() => (actionMessage.value = ''), 4000);
  } catch (e) {
    errorModal.value = {
      isOpen: true,
      message: 'Failed to update streamer status. Please try again.'
    };
  }
}

onMounted(() => {
  loadAdminData();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-900/40 pb-6">
      <div>
        <h1 class="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider flex items-center gap-3">
          <span>SYSTEM OPERATIONS VAULT</span>
          <span class="w-3 h-3 rounded-full bg-brand-crimson animate-ping" />
        </h1>
        <p class="font-mono text-xs text-red-400">
          Global Streamer Registry & Real-Time Telemetry Center
        </p>
      </div>

      <div class="flex items-center gap-3">
        <GamerButton size="sm" variant="secondary" @click="loadAdminData">
          ↻ Refresh Telemetry
        </GamerButton>
      </div>
    </div>

    <!-- Feedback Banner -->
    <div
      v-if="actionMessage"
      class="p-3 bg-red-950 border border-brand-crimson clip-tactical shadow-glow-red text-xs font-mono text-red-200"
    >
      🛡️ {{ actionMessage }}
    </div>

    <!-- Stat Telemetry Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 bg-brand-obsidian/90 border border-red-950 clip-tactical relative overflow-hidden">
        <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-crimson/10 rounded-full blur-xl" />
        <div class="font-mono text-xs text-brand-textMuted uppercase">Registered Streamers</div>
        <div class="font-display font-black text-3xl sm:text-4xl text-white mt-1">
          {{ stats.totalStreamers }}
        </div>
        <div class="text-[10px] font-mono text-emerald-400 mt-2">● Active Channels</div>
      </div>

      <div class="p-5 bg-brand-obsidian/90 border border-brand-crimson/50 clip-tactical relative overflow-hidden shadow-glow-red">
        <div class="font-mono text-xs text-brand-crimson uppercase font-bold">Active Live Rooms</div>
        <div class="font-display font-black text-3xl sm:text-4xl text-brand-crimson mt-1 text-glow-red">
          {{ stats.activeSessions }}
        </div>
        <div class="text-[10px] font-mono text-red-300 mt-2">● In-Flight Matches</div>
      </div>

      <div class="p-5 bg-brand-obsidian/90 border border-red-950 clip-tactical relative overflow-hidden">
        <div class="font-mono text-xs text-brand-textMuted uppercase">Matches Concluded</div>
        <div class="font-display font-black text-3xl sm:text-4xl text-white mt-1">
          {{ stats.totalMatchesPlayed }}
        </div>
        <div class="text-[10px] font-mono text-brand-textDark mt-2">Total Historic Games</div>
      </div>

      <div class="p-5 bg-brand-obsidian/90 border border-red-950 clip-tactical relative overflow-hidden">
        <div class="font-mono text-xs text-brand-textMuted uppercase">Chat Commands</div>
        <div class="font-display font-black text-3xl sm:text-4xl text-amber-400 mt-1">
          {{ stats.chatCommandsProcessed }}
        </div>
        <div class="text-[10px] font-mono text-amber-500/80 mt-2">Processed via IRC</div>
      </div>
    </div>

    <!-- Streamer Management Table -->
    <GamerCard title="Streamer Accounts & Channel Moderation" subtitle="Manage registered stream hosts" :glow="false">
      <div class="overflow-x-auto">
        <table class="w-full text-left font-mono text-xs">
          <thead>
            <tr class="border-b border-brand-slateLight/60 text-brand-textMuted uppercase">
              <th class="py-3 px-4">Channel / Streamer</th>
              <th class="py-3 px-4">Twitch ID</th>
              <th class="py-3 px-4">Games Hosted</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Joined Date</th>
              <th class="py-3 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-slateLight/30">
            <tr
              v-for="s in streamers"
              :key="s.id"
              class="hover:bg-brand-slateDark/50 transition-colors"
            >
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="s.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.username}`"
                    :alt="s.displayName"
                    class="w-8 h-8 rounded bg-brand-obsidian border border-brand-slateLight"
                  />
                  <div>
                    <div class="font-display font-bold text-white text-sm">
                      {{ s.displayName }}
                    </div>
                    <div class="text-[10px] text-brand-textDark">
                      twitch.tv/{{ s.username }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-4 text-brand-textMuted">
                {{ s.twitchId || 'N/A (Local Dev)' }}
              </td>

              <td class="py-3.5 px-4 text-white font-bold">
                {{ s.totalGamesHosted }} matches
              </td>

              <td class="py-3.5 px-4">
                <span
                  v-if="s.isBanned"
                  class="px-2 py-0.5 bg-red-950 text-red-300 border border-red-600 rounded font-bold"
                >
                  SUSPENDED
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded font-bold"
                >
                  ACTIVE
                </span>
              </td>

              <td class="py-3.5 px-4 text-brand-textDark">
                {{ new Date(s.createdAt).toLocaleDateString() }}
              </td>

              <td class="py-3.5 px-4 text-right">
                <button
                  type="button"
                  :class="[
                    'px-3 py-1 text-xs font-bold uppercase rounded border clip-tactical-sm transition-colors',
                    s.isBanned
                      ? 'bg-emerald-950 hover:bg-emerald-800 text-emerald-200 border-emerald-600'
                      : 'bg-red-950 hover:bg-red-800 text-red-200 border-red-600'
                  ]"
                  @click="toggleStreamerBan(s)"
                >
                  {{ s.isBanned ? 'Unban Streamer' : 'Ban Streamer' }}
                </button>
              </td>
            </tr>

            <tr v-if="streamers.length === 0">
              <td colspan="6" class="text-center py-8 text-brand-textDark italic">
                No streamers found in database.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GamerCard>

    <ConfirmModal
      :is-open="errorModal.isOpen"
      title="Admin Alert"
      :message="errorModal.message"
      confirm-text="OK"
      cancel-text="Close"
      variant="danger"
      @confirm="errorModal.isOpen = false"
      @cancel="errorModal.isOpen = false"
      @close="errorModal.isOpen = false"
    />
  </div>
</template>
