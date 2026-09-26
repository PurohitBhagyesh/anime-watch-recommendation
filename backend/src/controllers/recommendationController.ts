import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { recommendationService } from '../services/recommendationService';
import { anilistService } from '../services/anilistService';

export const recommendationController = {
  // GET /api/recommendations/personalized
  async getPersonalized(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.query.userId as string) || 'usr_demo_101';
      const limit = parseInt(req.query.limit as string, 10) || 12;

      const result = await recommendationService.getPersonalizedRecommendations(userId, limit);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // GET /api/recommendations/anime/:id
  async getSimilar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const animeId = parseInt(String(req.params.id), 10);
      if (isNaN(animeId)) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID' } });
        return;
      }

      const details = await anilistService.getAnimeDetails(animeId);
      const recommendations = details?.Media?.recommendations?.nodes || [];
      const relations = details?.Media?.relations?.edges || [];

      res.json({
        success: true,
        data: {
          animeId,
          recommendations: recommendations.map((r: any) => r.mediaRecommendation).filter(Boolean),
          relations: relations.map((rel: any) => ({
            relationType: rel.relationType,
            anime: rel.node,
          })),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
};
