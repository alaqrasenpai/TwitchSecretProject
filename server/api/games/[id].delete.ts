import { deleteGameSession } from '~/server/utils/gameEngine';

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID is required'
    });
  }

  const success = deleteGameSession(sessionId);
  return {
    success,
    sessionId
  };
});
