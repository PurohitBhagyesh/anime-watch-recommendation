import { Router } from 'express';
import { recommendationController } from '../controllers/recommendationController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(optionalAuth);

router.get('/personalized', recommendationController.getPersonalized);
router.get('/anime/:id', recommendationController.getSimilar);

export default router;
