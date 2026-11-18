import { Router } from 'express';
import { watchlistController } from '../controllers/watchlistController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Strictly authenticated — prevents cross-user IDOR access
router.use(requireAuth);

router.get('/', watchlistController.getWatchlist);
router.post('/', watchlistController.addOrUpdateItem);
router.patch('/:animeId/progress', watchlistController.updateProgress);
router.delete('/:animeId', watchlistController.removeItem);
router.post('/export', watchlistController.exportWatchlist);
router.post('/import', watchlistController.importWatchlist);

export default router;
