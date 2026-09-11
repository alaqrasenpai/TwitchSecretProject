import { createGameSession } from '~/server/utils/gameEngine';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  const body = await readBody(event).catch(() => ({}));
  
  const streamerUsername = body.streamerUsername || user?.username || 'streamer';
  const streamerId = user?.userId || `streamer_${streamerUsername}`;
  const gameType = body.gameType || 'ROULETTE';

  const isPreVerified = !!(user && user.username && user.username.toLowerCase() === streamerUsername.toLowerCase());
  const session = await createGameSession(streamerId, streamerUsername, gameType, isPreVerified);

  return {
    success: true,
    session
  };
});
