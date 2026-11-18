import { Request, Response, NextFunction } from 'express';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Defense-in-depth SQL injection & command/script probe patterns.
 * All database access already uses 100% parameterized Prisma ORM queries (zero raw SQL);
 * this firewall blocks overt SQLi/null-byte/prototype-pollution probes at the API boundary.
 */
const SQL_INJECTION_PATTERNS: RegExp[] = [
  /\0/, // Null byte injection
  /(\bunion\b[\s/*]+(\ball\b[\s/*]+)?\bselect\b)/i,
  /(;\s*(drop|alter|truncate|delete|insert|update|create|exec|execute)\b)/i,
  /(['"`]\s*(or|and)\s+['"`]?\d+['"`]?\s*=\s*['"`]?\d+)/i,
  /(\bor\b\s+1\s*=\s*1\b|\band\b\s+1\s*=\s*1\b)/i,
  /(\/\*[\s\S]*?\*\/|--\s*$)/m,
  /\b(information_schema|sqlite_master|pg_catalog|xp_cmdshell|load_file|into\s+outfile)\b/i,
  /\b(sleep\s*\(|benchmark\s*\(|waitfor\s+delay)\b/i,
];

const SKIP_INSPECTION_KEYS = new Set(['password', 'currentPassword', 'newPassword', 'avatar']);

function stripPrototypePollution(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripPrototypePollution(item, depth + 1));
  }
  const clean: Record<string, unknown> = Object.create(null);
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(k)) continue;
    clean[k] = stripPrototypePollution(v, depth + 1);
  }
  return clean;
}

function containsMaliciousPayload(value: unknown, keyName = '', depth = 0): boolean {
  if (depth > 8 || value === null || value === undefined) return false;
  if (SKIP_INSPECTION_KEYS.has(keyName)) {
    // Still block null bytes even in skipped fields
    return typeof value === 'string' && value.includes('\0');
  }

  if (typeof value === 'string') {
    return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsMaliciousPayload(item, keyName, depth + 1));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([k, v]) =>
      containsMaliciousPayload(v, k, depth + 1)
    );
  }

  return false;
}

export const securityInputGuard = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Strip prototype pollution keys from body
  if (req.body && typeof req.body === 'object') {
    req.body = stripPrototypePollution(req.body);
  }

  // 2. HTTP Parameter Pollution guard: collapse duplicate string query params safely
  if (req.query && typeof req.query === 'object') {
    for (const [k, v] of Object.entries(req.query)) {
      if (FORBIDDEN_KEYS.has(k)) {
        delete (req.query as Record<string, unknown>)[k];
        continue;
      }
      if (Array.isArray(v) && v.length > 0) {
        (req.query as Record<string, unknown>)[k] = v[v.length - 1];
      }
    }
  }

  // 3. Reject null bytes & overt SQL injection payloads before hitting controllers
  if (
    containsMaliciousPayload(req.params) ||
    containsMaliciousPayload(req.query) ||
    containsMaliciousPayload(req.body)
  ) {
    res.status(400).json({
      success: false,
      error: { message: 'Request rejected by input security policy.' },
    });
    return;
  }

  next();
};
