import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const reviewController = {
  // GET /api/reviews/anime/:animeId
  async getAnimeReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const animeId = Number(req.params.animeId);
      if (!Number.isSafeInteger(animeId) || animeId <= 0) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID.' } });
        return;
      }

      const reviews = await prisma.review.findMany({
        where: { animeId },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
        orderBy: { likesCount: 'desc' },
        take: 100,
      });

      res.json({ success: true, data: { reviews, total: reviews.length } });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to load reviews.' } });
    }
  },

  // POST /api/reviews
  async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const userId = req.user.id;
      const { animeId, rating, reviewText } = req.body;

      const parsedAnimeId = Number(animeId);
      const parsedRating = Number(rating);

      if (
        !Number.isSafeInteger(parsedAnimeId) ||
        parsedAnimeId <= 0 ||
        !Number.isFinite(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 10 ||
        typeof reviewText !== 'string' ||
        !reviewText.trim()
      ) {
        res.status(400).json({
          success: false,
          error: { message: 'Valid animeId, rating (1–10), and reviewText are required.' },
        });
        return;
      }

      const review = await prisma.review.create({
        data: {
          userId,
          animeId: parsedAnimeId,
          rating: Math.round(parsedRating),
          reviewText: reviewText.trim().slice(0, 2000),
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      res.status(201).json({ success: true, data: { review } });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to save review.' } });
    }
  },

  // POST /api/reviews/:id/like
  async likeReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const id = String(req.params.id || '').trim();
      if (!id || id.length > 64) {
        res.status(400).json({ success: false, error: { message: 'Invalid review ID.' } });
        return;
      }

      const review = await prisma.review.update({
        where: { id },
        data: {
          likesCount: { increment: 1 },
        },
      });

      res.json({ success: true, data: { likesCount: review.likesCount } });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to like review.' } });
    }
  },
};
