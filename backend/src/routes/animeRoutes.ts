import { Router } from 'express';
import { animeController } from '../controllers/animeController';

const router = Router();

router.get('/trending', animeController.getTrending);
router.get('/seasonal', animeController.getSeasonal);
router.get('/top', animeController.getTop100);
router.get('/popular', animeController.getPopular);
router.get('/search', animeController.search);
router.get('/:id', animeController.getDetails);

export default router;
