import tmi from 'tmi.js';
import type { IGameSession } from '~/types/game';

export function useTwitchChat() {
  const isConnected = ref(false);
  const channelName = ref('');
  const chatMessages = ref<Array<{ id: string; user: string; message: string; timestamp: Date; isCommand: boolean }>>([]);
  const error = ref<string | null>(null);

  let client: any = null;

  async function connectToChannel(
    channel: string,
    onCommand: (
      command: string,
      args: string[],
      user: { username: string; displayName: string; isBroadcaster?: boolean },
      rawMessage?: string
    ) => void
  ) {
    if (!channel) return;
    const cleanChannel = channel.toLowerCase().trim().replace(/^#/, '');
    if (!cleanChannel) return;
    channelName.value = cleanChannel;

    disconnect();

    try {
      client = new tmi.Client({
        options: { debug: false },
        connection: {
          reconnect: true,
          secure: true
        },
        channels: [cleanChannel]
      });

      client.on('message', (chan: string, tags: any, message: string, self: boolean) => {
        if (self) return;

        const username = tags.username || 'anonymous';
        const displayName = tags['display-name'] || username;
        const trimmed = message.trim();

        const isCommand = trimmed.startsWith('!') || trimmed.startsWith('！') || trimmed.startsWith('/');

        chatMessages.value.unshift({
          id: tags.id || Math.random().toString(),
          user: displayName,
          message: trimmed,
          timestamp: new Date(),
          isCommand
        });

        const isBroadcaster = !!(
          tags.badges?.broadcaster === '1' ||
          tags.username?.toLowerCase() === cleanChannel ||
          tags['user-id'] === tags['room-id']
        );

        if (chatMessages.value.length > 60) {
          chatMessages.value.pop();
        }

        // Pass every chat message to onCommand (command or plain text for games like Type Race, Hangman, Subway Runner)
        const parts = trimmed.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        onCommand(cmd, args, { username, displayName, isBroadcaster }, trimmed);
      });

      client.on('connected', () => {
        isConnected.value = true;
        error.value = null;
      });

      client.on('join', () => {
        isConnected.value = true;
        error.value = null;
      });

      client.on('disconnected', () => {
        isConnected.value = false;
      });

      client.on('close', () => {
        isConnected.value = false;
      });

      await client.connect();
      isConnected.value = true;
      error.value = null;
    } catch (err: any) {
      console.warn('Twitch IRC connection notice:', err?.message || err);
      isConnected.value = false;
      error.value = 'Failed to connect to Twitch IRC. Live chat simulator available.';
    }
  }

  function disconnect() {
    if (client) {
      try {
        client.disconnect();
      } catch (e) {}
      client = null;
    }
    isConnected.value = false;
  }

  // Simulate chat command locally for testing
  function simulateChatCommand(
    username: string,
    message: string,
    onCommand: (
      command: string,
      args: string[],
      user: { username: string; displayName: string; isBroadcaster?: boolean },
      rawMessage?: string
    ) => void
  ) {
    const trimmed = message.trim();
    const isCommand = trimmed.startsWith('!') || trimmed.startsWith('！') || trimmed.startsWith('/');
    const cleanUser = username.trim();
    const isBroadcaster = cleanUser.toLowerCase() === channelName.value.toLowerCase() || cleanUser.toLowerCase() === 'streamer' || cleanUser.toLowerCase() === 'broadcaster';

    chatMessages.value.unshift({
      id: Math.random().toString(),
      user: cleanUser,
      message: trimmed,
      timestamp: new Date(),
      isCommand
    });

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    onCommand(cmd, args, { username: cleanUser, displayName: cleanUser, isBroadcaster }, trimmed);
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    channelName,
    chatMessages,
    error,
    connectToChannel,
    disconnect,
    simulateChatCommand
  };
}
