import { addPlayerToSession } from '~/server/utils/gameEngine';

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required.' });
  }

  const body = await readBody(event);
  const username = body.username?.trim();
  const displayName = body.displayName?.trim() || username;
  const avatarUrl = body.avatarUrl?.trim();

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Username is required to join.' });
  }

  const result = await addPlayerToSession(sessionId, username, displayName, avatarUrl);
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.message });
  }

  return result;
});
