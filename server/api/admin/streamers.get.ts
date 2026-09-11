import { User } from '~/server/models/User';
import type { IStreamerManagementItem } from '~/types/admin';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Administrator privilege required.' });
  }

  let streamers: IStreamerManagementItem[] = [];

  try {
    const docs = await User.find({ role: 'streamer' }).sort({ createdAt: -1 });
    streamers = docs.map((d) => ({
      id: d._id.toString(),
      twitchId: d.twitchId,
      username: d.username,
      displayName: d.displayName,
      avatarUrl: d.avatarUrl,
      role: d.role,
      isBanned: d.isBanned,
      totalGamesHosted: d.totalGamesHosted || 0,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString()
    }));
  } catch (e) {
    // In-memory mock streamers if database is offline
    streamers = [
      {
        id: 'mock_1',
        twitchId: '101',
        username: 'crimson_warlord',
        displayName: 'CrimsonWarlord',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=crimson_warlord',
        role: 'streamer',
        isBanned: false,
        totalGamesHosted: 14,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'mock_2',
        twitchId: '102',
        username: 'shadow_ninja',
        displayName: 'ShadowNinja',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=shadow_ninja',
        role: 'streamer',
        isBanned: false,
        totalGamesHosted: 8,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'mock_3',
        twitchId: '103',
        username: 'toxic_viper',
        displayName: 'ToxicViper',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=toxic_viper',
        role: 'streamer',
        isBanned: true,
        totalGamesHosted: 2,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ];
  }

  return { success: true, streamers };
});
