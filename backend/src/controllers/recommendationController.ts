import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { recommendationService } from '../services/recommendationService';
import { anilistService } from '../services/anilistService';

export const recommendationController = {
  // GET /api/recommendations/personalized
  async getPersonalized(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const userId = req.user.id;
      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit)
        ? Math.max(1, Math.min(50, Math.round(rawLimit)))
        : 12;

      const result = await recommendationService.getPersonalizedRecommendations(userId, limit);
      res.json({ success: true, data: result });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to load recommendations.' } });
    }
  },

  // GET /api/recommendations/anime/:id
  async getSimilar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const animeId = Number(req.params.id);
      if (!Number.isSafeInteger(animeId) || animeId <= 0) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID.' } });
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
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to load similar anime.' } });
    }
  },
};
