import { signToken } from '~/server/utils/jwt';
import { ActivityLog } from '~/server/models/ActivityLog';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const username = body.username?.trim();
  const password = body.password?.trim();

  const expectedUser = config.adminUsername || 'admin';
  const expectedPass = config.adminPassword || 'crimson_admin_2026!';
  const adminDisplayName = config.adminName || 'Security Core Admin';

  if (!username || !password || username !== expectedUser || password !== expectedPass) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Administrator Security Credentials.'
    });
  }

  const token = signToken({
    userId: 'admin_root_master',
    username: expectedUser,
    role: 'admin',
    displayName: adminDisplayName
  });

  setCookie(event, 'stream_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  try {
    await ActivityLog.create({
      eventType: 'ADMIN_LOGIN',
      details: `Admin user [${expectedUser}] logged into Security Vault.`
    });
  } catch (e) {}

  return {
    success: true,
    token,
    user: {
      id: 'admin_root_master',
      username: expectedUser,
      displayName: adminDisplayName,
      role: 'admin'
    }
  };
});
