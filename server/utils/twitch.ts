export function getTwitchAuthUrl(state?: string): string {
  const config = useRuntimeConfig();
  const clientId = config.twitchClientId;
  const redirectUri = encodeURIComponent(config.twitchRedirectUri);
  const scopes = encodeURIComponent(['user:read:email'].join(' '));
  const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';

  return `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&force_verify=true${stateParam}`;
}

export async function exchangeTwitchCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  const config = useRuntimeConfig();

  // If mock credentials in dev, return simulated token
  if (!config.twitchClientId || config.twitchClientId === 'mock_twitch_client_id') {
    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      expiresIn: 3600 * 24
    };
  }

  try {
    const params = new URLSearchParams({
      client_id: config.twitchClientId,
      client_secret: config.twitchClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.twitchRedirectUri
    });

    const res = await $fetch<any>('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      body: params
    });

    return {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      expiresIn: res.expires_in
    };
  } catch (err: any) {
    console.error('Error exchanging Twitch code:', err?.data || err?.message);
    return null;
  }
}

export async function getTwitchUser(accessToken: string): Promise<{
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  email?: string;
} | null> {
  const config = useRuntimeConfig();

  // If mock credentials in dev, return simulated streamer profile
  if (!config.twitchClientId || config.twitchClientId === 'mock_twitch_client_id' || accessToken.startsWith('mock_')) {
    return {
      id: '12345678',
      login: 'crimson_streamer',
      displayName: 'CrimsonStreamer',
      profileImageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      email: 'streamer@crimsonarena.gg'
    };
  }

  try {
    const res = await $fetch<any>('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': config.twitchClientId,
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (res.data && res.data.length > 0) {
      const user = res.data[0];
      return {
        id: user.id,
        login: user.login,
        displayName: user.display_name,
        profileImageUrl: user.profile_image_url,
        email: user.email
      };
    }
    return null;
  } catch (err: any) {
    console.error('Error fetching Twitch user:', err?.data || err?.message);
    return null;
  }
}
