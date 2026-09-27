import { Router } from 'express';
import authRoutes from './authRoutes';
import animeRoutes from './animeRoutes';
import watchlistRoutes from './watchlistRoutes';
import recommendationRoutes from './recommendationRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'AnimeSenpai API (animesenpai.online)',
    version: '1.0.0',
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/anime', animeRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/reviews', reviewRoutes);

export default router;
