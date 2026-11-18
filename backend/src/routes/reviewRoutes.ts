import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/anime/:animeId', reviewController.getAnimeReviews);
router.post('/', requireAuth, reviewController.createReview);
router.post('/:id/like', requireAuth, reviewController.likeReview);

export default router;
