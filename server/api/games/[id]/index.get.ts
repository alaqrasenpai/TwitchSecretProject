import { getGameSession } from '~/server/utils/gameEngine';

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required.' });
  }

  const session = await getGameSession(sessionId);
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Game session not found.' });
  }

  // If authenticated user is the channel owner or admin, auto-verify session
  const user = event.context.user;
  if (user && user.username && session.streamerUsername) {
    if (user.username.toLowerCase() === session.streamerUsername.toLowerCase() || user.role === 'admin') {
      session.isBroadcasterVerified = true;
    }
  }

  return { success: true, session };
});
