import { restoreGameSession } from '~/server/utils/gameEngine';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  if (!body.session || !body.session.sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session payload is required for restoration.' });
  }

  const restored = await restoreGameSession(body.session);
  return {
    success: true,
    session: restored
  };
});
