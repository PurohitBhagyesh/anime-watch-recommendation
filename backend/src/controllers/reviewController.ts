import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const reviewController = {
  // GET /api/reviews/anime/:animeId
  async getAnimeReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const animeId = parseInt(String(req.params.animeId), 10);
      if (isNaN(animeId)) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID' } });
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
      });

      res.json({ success: true, data: { reviews, total: reviews.length } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // POST /api/reviews
  async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.body.userId || 'usr_demo_101';
      const { animeId, rating, reviewText } = req.body;

      if (!animeId || !rating || !reviewText) {
        res.status(400).json({ success: false, error: { message: 'animeId, rating, and reviewText are required.' } });
        return;
      }

      const review = await prisma.review.create({
        data: {
          userId,
          animeId: Number(animeId),
          rating: Number(rating),
          reviewText: reviewText.trim(),
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      res.status(201).json({ success: true, data: { review } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // POST /api/reviews/:id/like
  async likeReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const review = await prisma.review.update({
        where: { id },
        data: {
          likesCount: { increment: 1 },
        },
      });

      res.json({ success: true, data: { likesCount: review.likesCount } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
};
