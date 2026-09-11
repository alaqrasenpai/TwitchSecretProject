import { processGameAction } from '~/server/utils/gameEngine';
import type { IGameActionPayload } from '~/types/game';

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required.' });
  }

  const body = (await readBody(event)) as IGameActionPayload;
  if (!body || !body.action) {
    throw createError({ statusCode: 400, statusMessage: 'Valid action payload is required.' });
  }

  const result = await processGameAction(sessionId, body);
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.message });
  }

  return result;
});
