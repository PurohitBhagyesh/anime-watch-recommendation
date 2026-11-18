import crypto from 'crypto';

let cachedDevSecret: string | null = null;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required JWT_SECRET environment variable in production.');
  }

  if (!cachedDevSecret) {
    cachedDevSecret = crypto.randomBytes(32).toString('hex');
  }
  return cachedDevSecret;
}
