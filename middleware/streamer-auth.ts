import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && authStore.loading) {
    await authStore.fetchCurrentUser();
  }

  // Allow developer mock session if query parameter or local dev mode
  if (!authStore.isAuthenticated) {
    // If not authenticated, redirect to streamer login
    return navigateTo('/login');
  }

  if (authStore.user?.isBanned) {
    return navigateTo('/login?error=banned');
  }
});
