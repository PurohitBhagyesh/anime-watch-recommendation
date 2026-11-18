import { Router } from 'express';
import { recommendationController } from '../controllers/recommendationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/personalized', requireAuth, recommendationController.getPersonalized);
router.get('/anime/:id', recommendationController.getSimilar);

export default router;
