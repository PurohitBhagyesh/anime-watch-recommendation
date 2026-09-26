import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(optionalAuth);

router.get('/anime/:animeId', reviewController.getAnimeReviews);
router.post('/', reviewController.createReview);
router.post('/:id/like', reviewController.likeReview);

export default router;
