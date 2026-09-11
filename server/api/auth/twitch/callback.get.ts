import { exchangeTwitchCode, getTwitchUser } from '~/server/utils/twitch';
import { User } from '~/server/models/User';
import { signToken } from '~/server/utils/jwt';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = (query.code as string) || 'mock_dev_code';

  const tokens = await exchangeTwitchCode(code);
  if (!tokens) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to exchange Twitch authorization code.'
    });
  }

  const twitchProfile = await getTwitchUser(tokens.accessToken);
  if (!twitchProfile) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to retrieve Twitch profile data.'
    });
  }

  // Find or create Streamer in database
  let user: any = null;
  try {
    user = await User.findOne({
      $or: [{ twitchId: twitchProfile.id }, { username: twitchProfile.login.toLowerCase() }]
    });

    if (user) {
      if (user.isBanned) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Your streamer account has been suspended by system administration.'
        });
      }

      user.displayName = twitchProfile.displayName;
      user.avatarUrl = twitchProfile.profileImageUrl;
      user.email = twitchProfile.email || user.email;
      user.accessToken = tokens.accessToken;
      user.refreshToken = tokens.refreshToken;
      user.tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      await user.save();
    } else {
      user = await User.create({
        twitchId: twitchProfile.id,
        username: twitchProfile.login.toLowerCase(),
        displayName: twitchProfile.displayName,
        avatarUrl: twitchProfile.profileImageUrl,
        email: twitchProfile.email || '',
        role: 'streamer',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000)
      });
    }
  } catch (err: any) {
    if (err?.statusCode) throw err;
    // In-memory fallback user if Mongo is offline
    user = {
      _id: 'streamer_local_' + twitchProfile.id,
      twitchId: twitchProfile.id,
      username: twitchProfile.login.toLowerCase(),
      displayName: twitchProfile.displayName,
      avatarUrl: twitchProfile.profileImageUrl,
      role: 'streamer'
    };
  }

  const jwt = signToken({
    userId: user._id?.toString() || user.twitchId,
    username: user.username,
    role: user.role || 'streamer',
    displayName: user.displayName
  });

  // Set HTTP-only session cookie
  setCookie(event, 'stream_auth_token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });

  // Redirect to target room or Streamer Game Launcher Hub
  const state = query.state as string;
  const targetRedirect = state && state.startsWith('/') ? state : '/dashboard';
  return sendRedirect(event, targetRedirect);
});
