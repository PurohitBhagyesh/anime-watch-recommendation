import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const rawId = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 80) : '';
    return rawId ? `login:${ip}:${rawId}` : `login:${ip}`;
  },
});

const registerRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many account creation attempts from this network. Please try again later.',
});

const demoRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many demo login attempts. Please try again shortly.',
});

router.post('/register', registerRateLimit, authController.register);
router.post('/login', loginRateLimit, authController.login);
router.post('/demo', demoRateLimit, authController.demoLogin);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);

export default router;
