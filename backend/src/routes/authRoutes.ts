import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo', authController.demoLogin);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);

export default router;
