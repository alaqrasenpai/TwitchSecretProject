import { User } from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return { authenticated: false, user: null };
  }

  if (user.role === 'admin') {
    return {
      authenticated: true,
      user: {
        id: user.userId,
        username: user.username,
        displayName: user.displayName || user.username,
        role: 'admin'
      }
    };
  }

  // If streamer, look up database for avatar & latest info
  let dbUser: any = null;
  try {
    dbUser = await User.findOne({ username: user.username.toLowerCase() });
  } catch (e) {}

  return {
    authenticated: true,
    user: {
      id: user.userId,
      username: user.username,
      displayName: dbUser?.displayName || user.displayName || user.username,
      avatarUrl: dbUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
      role: 'streamer',
      isBanned: dbUser?.isBanned || false
    }
  };
});
