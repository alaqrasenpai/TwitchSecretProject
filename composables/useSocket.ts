import type { IGameSession } from '~/types/game';

export function useGameSync() {
  const session = ref<IGameSession | null>(null);
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  let eventSource: EventSource | null = null;
  let reconnectTimeout: any = null;

  function connectToSessionStream(sessionId: string, onUpdate?: (data: IGameSession) => void) {
    disconnect();

    const url = `/api/games/${sessionId}/stream`;
    initEventSource(url, onUpdate);
  }

  function connectToOverlayStream(token: string, onUpdate?: (data: IGameSession) => void) {
    disconnect();

    const url = `/api/overlay/${token}/stream`;
    initEventSource(url, onUpdate);
  }

  function initEventSource(url: string, onUpdate?: (data: IGameSession) => void) {
    if (typeof window === 'undefined') return;

    try {
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        isConnected.value = true;
        error.value = null;
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.data) {
            session.value = parsed.data;
            if (onUpdate) {
              onUpdate(parsed.data);
            }
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      eventSource.onerror = (e) => {
        isConnected.value = false;
        error.value = 'Connection disrupted. Reconnecting...';
        eventSource?.close();

        // Auto reconnect after 2 seconds
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          initEventSource(url, onUpdate);
        }, 2000);
      };
    } catch (err: any) {
      error.value = err.message;
    }
  }

  function disconnect() {
    clearTimeout(reconnectTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    isConnected.value = false;
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    session,
    isConnected,
    error,
    connectToSessionStream,
    connectToOverlayStream,
    disconnect
  };
}
