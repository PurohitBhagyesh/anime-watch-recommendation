import { Request, Response, NextFunction } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

interface HitBucket {
  count: number;
  resetAt: number;
}

const MAX_TRACKED_KEYS = 10_000;

/**
 * Memory-bounded sliding-window rate limiter with standard RateLimit headers.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please slow down and try again shortly.',
    keyGenerator,
  } = options;

  const hits = new Map<string, HitBucket>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, Math.max(windowMs, 60_000)).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const defaultIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = keyGenerator ? keyGenerator(req) : defaultIp;
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      if (hits.size >= MAX_TRACKED_KEYS) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      entry = { count: 1, resetAt: now + windowMs };
      hits.set(key, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSec = Math.ceil(entry.resetAt / 1000);

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(resetSec));

    if (entry.count > maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        success: false,
        error: {
          message,
          retryAfterSeconds: retryAfterSec,
        },
      });
      return;
    }

    next();
  };
}
