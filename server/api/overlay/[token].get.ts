import { getGameSessionByOverlayToken } from '~/server/utils/gameEngine';

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token');
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Overlay token is required.' });
  }

  const session = await getGameSessionByOverlayToken(token);
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Overlay token invalid or session expired.' });
  }

  return { success: true, session };
});
