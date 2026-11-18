import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Hide framework signature & trust reverse proxy IP headers safely
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Strict CORS origin allowlist (never combine wildcard '*' with credentials)
const allowedOrigins = new Set<string>([
  'https://www.animesenpai.online',
  'https://animesenpai.online',
  ...(process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : []),
  ...(!IS_PROD
    ? ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173']
    : []),
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server health checks (no Origin header)
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
);

// Hardened HTTP security response headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  if (IS_PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
});

// Lightweight in-memory sliding-window rate limiter
function createRateLimiter(windowMs: number, maxRequests: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits.entries()) {
      if (entry.resetAt <= now) hits.delete(ip);
    }
  }, Math.max(windowMs, 60_000)).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const existing = hits.get(ip);

    if (!existing || existing.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    existing.count += 1;
    if (existing.count > maxRequests) {
      const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        success: false,
        error: { message: 'Too many requests. Please slow down and try again shortly.' },
      });
      return;
    }

    next();
  };
}

// Strict payload size caps (prevents large-body DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Minimal request logger (never logs authorization headers or bodies)
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Lightweight Health/Ping Endpoints
app.get(['/ping', '/healthz'], (_req, res) => {
  res.status(200).send('pong');
});

// Minimal Root Status (no internal route disclosure)
app.get('/', (_req, res) => {
  res.json({
    name: 'AnimeSenpai API',
    status: 'online',
  });
});

// Brute-force & flood protection on Auth and API routes
app.use('/api/auth', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
}, createRateLimiter(15 * 60 * 1000, 25));

app.use('/api', createRateLimiter(60 * 1000, 180), apiRoutes);

// 404 Fallback Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found.',
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

async function startServer() {
  await connectDB();

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(
      `[AnimeSenpai API] Listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to launch AnimeSenpai server:', err);
  process.exit(1);
});

export default app;
