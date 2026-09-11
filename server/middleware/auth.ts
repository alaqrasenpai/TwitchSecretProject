import { verifyToken } from '~/server/utils/jwt';

export default defineEventHandler((event) => {
  // Read auth token from Authorization header or cookie
  const authHeader = getHeader(event, 'authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = getCookie(event, 'stream_auth_token') || '';
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      event.context.user = payload;
    }
  }
});
