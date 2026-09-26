import { prisma } from '../config/db';
import { anilistService } from './anilistService';

export const recommendationService = {
  // Generate recommendations based on user's watchlist history and genre weights
  async getPersonalizedRecommendations(userId: string, limit: number = 10) {
    try {
      // 1. Fetch user's completed / highly rated watchlist items
      const watchlistItems = await prisma.watchlistItem.findMany({
        where: { userId },
        select: {
          animeId: true,
          title: true,
          genres: true,
          userRating: true,
          status: true,
        },
      });

      if (!watchlistItems || watchlistItems.length === 0) {
        // Fallback to top-trending anime if user has no watch history
        const trending = await anilistService.getTrending(1, limit);
        return {
          source: 'trending_fallback',
          affinityGenres: [],
          recommendations: trending.Page.media,
        };
      }

      // 2. Calculate genre affinity score
      const genreWeights: Record<string, number> = {};
      const excludedIds = new Set(watchlistItems.map((item) => item.animeId));

      watchlistItems.forEach((item) => {
        let parsedGenres: string[] = [];
        try {
          if (item.genres) {
            parsedGenres = JSON.parse(item.genres);
          }
        } catch {
          // Ignore parse errors
        }

        const scoreWeight = item.userRating ? item.userRating / 10 : item.status === 'completed' ? 1.0 : 0.7;

        parsedGenres.forEach((genre) => {
          genreWeights[genre] = (genreWeights[genre] || 0) + scoreWeight;
        });
      });

      // Top 3 preferred genres
      const topGenres = Object.entries(genreWeights)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

      // 3. Query AniList for matching high-rated anime in those genres
      const searchResult = await anilistService.searchAnime({
        genres: topGenres.length > 0 ? topGenres : undefined,
        sort: ['SCORE_DESC', 'POPULARITY_DESC'],
        perPage: limit + excludedIds.size,
      });

      const rawCandidates = searchResult?.Page?.media || [];
      const filteredRecommendations = rawCandidates
        .filter((anime: any) => !excludedIds.has(anime.id))
        .slice(0, limit);

      return {
        source: 'personalized_affinity',
        affinityGenres: topGenres,
        recommendations: filteredRecommendations,
      };
    } catch (err) {
      console.error('Failed to compute personalized recommendations:', err);
      const fallback = await anilistService.getTrending(1, limit);
      return {
        source: 'fallback',
        affinityGenres: [],
        recommendations: fallback?.Page?.media || [],
      };
    }
  },
};
