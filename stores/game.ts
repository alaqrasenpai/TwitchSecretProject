import { defineStore } from 'pinia';
import type { IGameSession, IPlayer, IGameSettings, GameActionType } from '~/types/game';

const STORAGE_KEY = 'chatwar_active_session';
const SESSION_ID_KEY = 'chatwar_session_id';

function saveToLocalStorage(session: IGameSession | null) {
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(SESSION_ID_KEY, session.sessionId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
    }
  } catch (e) {
    console.warn('[GameStore] Could not save session to localStorage:', e);
  }
}

function getFromLocalStorage(): IGameSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[GameStore] Could not parse session from localStorage:', e);
  }
  return null;
}

export const useGameStore = defineStore('game', () => {
  const currentSession = ref<IGameSession | null>(getFromLocalStorage());
  const loading = ref<boolean>(false);
  const actionLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const players = computed(() => currentSession.value?.players || []);
  const alivePlayers = computed(() => players.value.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED'));
  const eliminatedPlayers = computed(() => players.value.filter((p) => p.status === 'ELIMINATED'));
  const activePlayer = computed(() => {
    if (!currentSession.value?.activePlayerNumber) return null;
    return players.value.find((p) => p.number === currentSession.value!.activePlayerNumber) || null;
  });
  const targetPlayer = computed(() => {
    if (!currentSession.value?.targetPlayerNumber) return null;
    return players.value.find((p) => p.number === currentSession.value!.targetPlayerNumber) || null;
  });
  const winner = computed(() => currentSession.value?.winner || null);
  const status = computed(() => currentSession.value?.status || 'LOBBY');

  // Watch for session changes and persist to localStorage
  watch(
    currentSession,
    (newSession) => {
      saveToLocalStorage(newSession);
    },
    { deep: true }
  );

  async function createNewSession(gameType = 'ROULETTE', streamerUsername = '') {
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch<{ success: boolean; session: IGameSession }>('/api/games/create', {
        method: 'POST',
        body: { gameType, streamerUsername }
      });
      if (res.success && res.session) {
        currentSession.value = res.session;
        saveToLocalStorage(res.session);
        return res.session;
      }
    } catch (e: any) {
      error.value = e?.statusMessage || e?.data?.statusMessage || 'فشل إنشاء الغرفة';
    } finally {
      loading.value = false;
    }
    return null;
  }

  async function loadSession(sessionId: string) {
    loading.value = true;
    error.value = null;

    // Immediately restore from local storage if available for zero-flicker reload
    const local = getFromLocalStorage();
    if (local && local.sessionId === sessionId) {
      currentSession.value = local;
    }

    try {
      const res = await $fetch<{ success: boolean; session: IGameSession }>(`/api/games/${sessionId}`);
      if (res.success && res.session) {
        currentSession.value = res.session;
        saveToLocalStorage(res.session);
      }
    } catch (e: any) {
      // If server doesn't have the session in memory, restore it from local storage
      if (local && local.sessionId === sessionId) {
        try {
          const restoreRes = await $fetch<{ success: boolean; session: IGameSession }>('/api/games/restore', {
            method: 'POST',
            body: { session: local }
          });
          if (restoreRes.success && restoreRes.session) {
            currentSession.value = restoreRes.session;
            saveToLocalStorage(restoreRes.session);
            return;
          }
        } catch (restoreErr) {
          console.warn('[GameStore] Failed to restore session to server:', restoreErr);
        }
      }
      error.value = e?.statusMessage || e?.data?.statusMessage || 'الغرفة غير موجودة';
    } finally {
      loading.value = false;
    }
  }

  async function performAction(
    action: GameActionType,
    params: Record<string, any> = {}
  ) {
    if (!currentSession.value) return false;
    actionLoading.value = true;
    try {
      const res = await $fetch<{ success: boolean; session: IGameSession }>(
        `/api/games/${currentSession.value.sessionId}/action`,
        {
          method: 'POST',
          body: {
            action,
            ...params
          }
        }
      );
      if (res.success && res.session) {
        currentSession.value = res.session;
        saveToLocalStorage(res.session);
        return true;
      }
      return false;
    } catch (e: any) {
      error.value = e?.statusMessage || e?.data?.statusMessage || 'فشل تنفيذ الأمر';
      return false;
    } finally {
      actionLoading.value = false;
    }
  }

  async function addPlayer(username: string, displayName?: string, avatarUrl?: string) {
    if (!currentSession.value) return false;
    try {
      const res = await $fetch<{ success: boolean; session: IGameSession }>(
        `/api/games/${currentSession.value.sessionId}/join`,
        {
          method: 'POST',
          body: {
            username,
            displayName: displayName || username,
            avatarUrl
          }
        }
      );
      if (res.success && res.session) {
        currentSession.value = res.session;
        saveToLocalStorage(res.session);
        return true;
      }
    } catch (e: any) {
      console.warn('Could not add player:', e?.data?.statusMessage || e?.message);
    }
    return false;
  }

  function setSessionDirectly(session: IGameSession) {
    currentSession.value = session;
    saveToLocalStorage(session);
  }

  function clearStoredSession() {
    currentSession.value = null;
    saveToLocalStorage(null);
  }

  async function deleteCurrentSession() {
    if (currentSession.value?.sessionId) {
      try {
        await $fetch(`/api/games/${currentSession.value.sessionId}`, {
          method: 'DELETE'
        }).catch(() => {});
      } catch (e) {}
    }
    clearStoredSession();
  }

  return {
    currentSession,
    loading,
    actionLoading,
    error,
    players,
    alivePlayers,
    eliminatedPlayers,
    activePlayer,
    targetPlayer,
    winner,
    status,
    createNewSession,
    loadSession,
    performAction,
    addPlayer,
    setSessionDirectly,
    clearStoredSession,
    deleteCurrentSession,
    getFromLocalStorage
  };
});
