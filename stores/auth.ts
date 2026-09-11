import { defineStore } from 'pinia';
import type { IAuthUser } from '~/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IAuthUser | null>(null);
  const isAuthenticated = ref<boolean>(false);
  const loading = ref<boolean>(true);
  const error = ref<string | null>(null);

  const isStreamer = computed(() => user.value?.role === 'streamer');
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function fetchCurrentUser() {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<{ authenticated: boolean; user: IAuthUser | null }>('/api/auth/me');
      if (data.authenticated && data.user) {
        user.value = data.user;
        isAuthenticated.value = true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
      }
    } catch (e: any) {
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function loginAdmin(credentials: { username: string; password: string }) {
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch<{ success: boolean; token: string; user: IAuthUser }>('/api/auth/admin/login', {
        method: 'POST',
        body: credentials
      });
      if (res.success) {
        user.value = res.user;
        isAuthenticated.value = true;
        return true;
      }
      return false;
    } catch (e: any) {
      error.value = e?.statusMessage || e?.data?.statusMessage || 'Invalid Admin Credentials';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    user.value = null;
    isAuthenticated.value = false;
    navigateTo('/');
  }

  // Developer / Streamer Quick Mock Login for local zero-config testing
  function setDevStreamer(username = 'crimson_streamer', displayName = 'CrimsonStreamer') {
    user.value = {
      id: 'dev_streamer_123',
      username,
      displayName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      role: 'streamer'
    };
    isAuthenticated.value = true;
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    isStreamer,
    isAdmin,
    fetchCurrentUser,
    loginAdmin,
    logout,
    setDevStreamer
  };
});
