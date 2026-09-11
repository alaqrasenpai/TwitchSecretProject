import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // If not yet loaded, attempt to fetch user
  if (!authStore.isAuthenticated && authStore.loading) {
    await authStore.fetchCurrentUser();
  }

  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    return navigateTo('/admin/login');
  }
});
