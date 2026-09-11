export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/event-stream');
  setHeader(event, 'Cache-Control', 'no-cache, no-transform');
  setHeader(event, 'Connection', 'keep-alive');
  setHeader(event, 'X-Accel-Buffering', 'no');

  const token = getRouterParam(event, 'token');
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Overlay token is required.' });
  }

  const initialSession = await getGameSessionByOverlayToken(token);
  if (!initialSession) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found for overlay.' });
  }

  const eventStream = createEventStream(event);

  // Send initial payload immediately
  await eventStream.push(JSON.stringify({ event: 'INIT', data: initialSession }));

  // Keep-alive heartbeat interval to prevent dropped connections in OBS
  const pingInterval = setInterval(async () => {
    try {
      await eventStream.push(JSON.stringify({ event: 'PING', timestamp: Date.now() }));
    } catch (e) {
      clearInterval(pingInterval);
    }
  }, 5000);

  // Live broadcast listener
  const unsubscribe = subscribeToSession(initialSession.sessionId, async (eventName, data) => {
    try {
      await eventStream.push(JSON.stringify({ event: eventName, data }));
    } catch (e) {
      // Connection closed
    }
  });

  eventStream.onClosed(async () => {
    clearInterval(pingInterval);
    unsubscribe();
    await eventStream.close();
  });

  return eventStream.send();
});
