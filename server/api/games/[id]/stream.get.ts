export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/event-stream');
  setHeader(event, 'Cache-Control', 'no-cache, no-transform');
  setHeader(event, 'Connection', 'keep-alive');
  setHeader(event, 'X-Accel-Buffering', 'no');

  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required.' });
  }

  const initialSession = await getGameSession(sessionId);
  if (!initialSession) {
    throw createError({ statusCode: 404, statusMessage: 'Game session not found.' });
  }

  const eventStream = createEventStream(event);

  // Send initial session data immediately
  await eventStream.push(JSON.stringify({ event: 'INIT', data: initialSession }));

  // Keep-alive heartbeat interval
  const pingInterval = setInterval(async () => {
    try {
      await eventStream.push(JSON.stringify({ event: 'PING', timestamp: Date.now() }));
    } catch (e) {
      clearInterval(pingInterval);
    }
  }, 5000);

  // Subscribe to real-time game state broadcasts
  const unsubscribe = subscribeToSession(sessionId, async (eventName, data) => {
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
