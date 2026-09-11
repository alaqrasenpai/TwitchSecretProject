import { getTwitchAuthUrl } from '~/server/utils/twitch';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const state = (query.redirect as string) || (query.state as string) || '';
  const redirectUrl = getTwitchAuthUrl(state);

  // If query is json mode, return URL
  if (query.format === 'json') {
    return { url: redirectUrl };
  }

  // Otherwise redirect directly to Twitch
  return sendRedirect(event, redirectUrl);
});
