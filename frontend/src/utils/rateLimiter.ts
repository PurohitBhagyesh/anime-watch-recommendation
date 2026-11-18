/**
 * Client-side sliding-window + progressive-lockout rate limiter.
 * Persists across reloads in localStorage to deter automated login/signup spam
 * and protect Firebase Auth quotas before requests leave the browser.
 */

export type RateLimitBucket = 'auth:login' | 'auth:signup' | 'auth:reset' | 'auth:google';

interface BucketConfig {
  maxAttempts: number;
  windowMs: number;
  baseCooldownMs: number;
  maxCooldownMs: number;
}

interface StoredBucketState {
  timestamps: number[];
  lockedUntil: number;
  strikes: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  strikes: number;
}

const STORAGE_PREFIX = 'animesenpai_rl_v1_';

const BUCKET_CONFIGS: Record<RateLimitBucket, BucketConfig> = {
  'auth:login': {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 attempts per 5 minutes
    baseCooldownMs: 30 * 1000, // 30s -> 60s -> 2m -> 5m
    maxCooldownMs: 5 * 60 * 1000,
  },
  'auth:signup': {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000, // 3 attempts per 10 minutes
    baseCooldownMs: 60 * 1000, // 1m -> 2m -> 4m -> 10m
    maxCooldownMs: 10 * 60 * 1000,
  },
  'auth:reset': {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000,
    baseCooldownMs: 60 * 1000,
    maxCooldownMs: 10 * 60 * 1000,
  },
  'auth:google': {
    maxAttempts: 6,
    windowMs: 5 * 60 * 1000,
    baseCooldownMs: 30 * 1000,
    maxCooldownMs: 3 * 60 * 1000,
  },
};

function readState(bucket: RateLimitBucket): StoredBucketState {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + bucket);
    if (!raw) return { timestamps: [], lockedUntil: 0, strikes: 0 };
    const parsed = JSON.parse(raw) as Partial<StoredBucketState>;
    return {
      timestamps: Array.isArray(parsed.timestamps)
        ? parsed.timestamps.filter((t) => typeof t === 'number' && Number.isFinite(t))
        : [],
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : 0,
      strikes: typeof parsed.strikes === 'number' ? parsed.strikes : 0,
    };
  } catch {
    return { timestamps: [], lockedUntil: 0, strikes: 0 };
  }
}

function writeState(bucket: RateLimitBucket, state: StoredBucketState): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + bucket, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function checkRateLimit(bucket: RateLimitBucket): RateLimitStatus {
  const cfg = BUCKET_CONFIGS[bucket];
  const now = Date.now();
  const state = readState(bucket);

  const activeTimestamps = state.timestamps.filter((t) => now - t < cfg.windowMs);

  if (state.lockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: state.lockedUntil - now,
      strikes: state.strikes,
    };
  }

  // Clean up stale timestamps if window rolled over
  if (activeTimestamps.length !== state.timestamps.length) {
    writeState(bucket, {
      timestamps: activeTimestamps,
      lockedUntil: 0,
      strikes: activeTimestamps.length === 0 ? 0 : state.strikes,
    });
  }

  const remaining = Math.max(0, cfg.maxAttempts - activeTimestamps.length);
  return {
    allowed: remaining > 0,
    remaining,
    retryAfterMs: remaining > 0 ? 0 : cfg.baseCooldownMs,
    strikes: state.strikes,
  };
}

/**
 * Records an authentication attempt and applies progressive lockout if the window limit is reached.
 */
export function recordRateLimitAttempt(bucket: RateLimitBucket): RateLimitStatus {
  const cfg = BUCKET_CONFIGS[bucket];
  const now = Date.now();
  const state = readState(bucket);

  if (state.lockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: state.lockedUntil - now,
      strikes: state.strikes,
    };
  }

  const activeTimestamps = [...state.timestamps.filter((t) => now - t < cfg.windowMs), now];

  if (activeTimestamps.length >= cfg.maxAttempts) {
    const nextStrikes = Math.min(state.strikes + 1, 5);
    const cooldownMs = Math.min(
      cfg.baseCooldownMs * Math.pow(2, nextStrikes - 1),
      cfg.maxCooldownMs
    );
    const lockedUntil = now + cooldownMs;
    writeState(bucket, {
      timestamps: [],
      lockedUntil,
      strikes: nextStrikes,
    });
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: cooldownMs,
      strikes: nextStrikes,
    };
  }

  writeState(bucket, {
    timestamps: activeTimestamps,
    lockedUntil: 0,
    strikes: state.strikes,
  });

  return {
    allowed: true,
    remaining: Math.max(0, cfg.maxAttempts - activeTimestamps.length),
    retryAfterMs: 0,
    strikes: state.strikes,
  };
}

export function resetRateLimit(bucket: RateLimitBucket): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + bucket);
  } catch {
    // Ignore storage errors
  }
}

export function formatCooldown(ms: number): string {
  const totalSec = Math.max(1, Math.ceil(ms / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
