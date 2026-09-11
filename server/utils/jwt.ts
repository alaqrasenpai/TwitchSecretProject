import jwt from 'jsonwebtoken';
import type { IJwtPayload, UserRole } from '~/types/auth';

export function signToken(payload: { userId: string; username: string; role: UserRole; displayName: string }): string {
  const config = useRuntimeConfig();
  const secret = config.jwtSecret || 'super_secret_gamer_jwt_key_twitch_arena_9988776655';
  const expiresIn = config.jwtExpiresIn || '7d';

  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): IJwtPayload | null {
  const config = useRuntimeConfig();
  const secret = config.jwtSecret || 'super_secret_gamer_jwt_key_twitch_arena_9988776655';

  try {
    return jwt.verify(token, secret) as IJwtPayload;
  } catch (e) {
    return null;
  }
}
