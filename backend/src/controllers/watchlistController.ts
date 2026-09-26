import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const watchlistController = {
  // GET /api/watchlist
  async getWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.query.userId as string) || 'usr_demo_101';
      const status = req.query.status as string;

      const whereClause: any = { userId };
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      const items = await prisma.watchlistItem.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
      });

      // Transform items to match frontend structure
      const formatted = items.map((item) => {
        let genres: string[] = [];
        try {
          if (item.genres) genres = JSON.parse(item.genres);
        } catch {
          // ignore
        }

        return {
          anime: {
            id: item.animeId,
            title: {
              romaji: item.romajiTitle || item.title,
              english: item.title,
              userPreferred: item.title,
              native: null,
            },
            coverImage: {
              extraLarge: item.coverImage || '',
              large: item.coverImage || '',
              medium: item.coverImage || '',
              color: null,
            },
            bannerImage: item.bannerImage || null,
            format: item.format,
            episodes: item.totalEpisodes,
            genres,
          },
          status: item.status,
          userRating: item.userRating,
          currentEpisode: item.currentEpisode,
          notes: item.notes,
          addedAt: item.addedAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        };
      });

      res.json({
        success: true,
        data: {
          items: formatted,
          total: formatted.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // POST /api/watchlist
  async addOrUpdateItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.body.userId || 'usr_demo_101';
      const {
        animeId,
        title,
        romajiTitle,
        coverImage,
        bannerImage,
        format,
        status,
        currentEpisode,
        totalEpisodes,
        userRating,
        notes,
        genres,
      } = req.body;

      if (!animeId || !title) {
        res.status(400).json({ success: false, error: { message: 'Anime ID and Title are required' } });
        return;
      }

      const genresJson = Array.isArray(genres) ? JSON.stringify(genres) : (typeof genres === 'string' ? genres : null);

      const item = await prisma.watchlistItem.upsert({
        where: {
          userId_animeId: {
            userId,
            animeId: Number(animeId),
          },
        },
        update: {
          ...(title && { title }),
          ...(romajiTitle !== undefined && { romajiTitle }),
          ...(coverImage !== undefined && { coverImage }),
          ...(bannerImage !== undefined && { bannerImage }),
          ...(format !== undefined && { format }),
          ...(status && { status }),
          ...(currentEpisode !== undefined && { currentEpisode: Number(currentEpisode) }),
          ...(totalEpisodes !== undefined && { totalEpisodes: Number(totalEpisodes) }),
          ...(userRating !== undefined && { userRating: Number(userRating) }),
          ...(notes !== undefined && { notes }),
          ...(genresJson && { genres: genresJson }),
        },
        create: {
          userId,
          animeId: Number(animeId),
          title,
          romajiTitle: romajiTitle || title,
          coverImage: coverImage || '',
          bannerImage: bannerImage || null,
          format: format || 'TV',
          status: status || 'watching',
          currentEpisode: Number(currentEpisode) || 0,
          totalEpisodes: Number(totalEpisodes) || 0,
          userRating: userRating !== undefined ? Number(userRating) : null,
          notes: notes || null,
          genres: genresJson,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'ADDED_TO_WATCHLIST',
          animeId: Number(animeId),
          metadata: JSON.stringify({ status: item.status, episode: item.currentEpisode }),
        },
      });

      res.status(200).json({ success: true, data: { item } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // PATCH /api/watchlist/:animeId/progress
  async updateProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.query.userId as string) || 'usr_demo_101';
      const animeId = parseInt(String(req.params.animeId), 10);
      const { currentEpisode, status } = req.body;

      const existing = await prisma.watchlistItem.findUnique({
        where: { userId_animeId: { userId, animeId } },
      });

      if (!existing) {
        res.status(404).json({ success: false, error: { message: 'Watchlist entry not found.' } });
        return;
      }

      let newStatus = status || existing.status;
      const targetEp = currentEpisode !== undefined ? Number(currentEpisode) : existing.currentEpisode;

      if (existing.totalEpisodes && targetEp >= existing.totalEpisodes) {
        newStatus = 'completed';
      }

      const updated = await prisma.watchlistItem.update({
        where: { userId_animeId: { userId, animeId } },
        data: {
          currentEpisode: targetEp,
          status: newStatus,
        },
      });

      res.json({ success: true, data: { item: updated } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // DELETE /api/watchlist/:animeId
  async removeItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.query.userId as string) || 'usr_demo_101';
      const animeId = parseInt(String(req.params.animeId), 10);

      await prisma.watchlistItem.deleteMany({
        where: { userId, animeId },
      });

      res.json({ success: true, message: 'Item removed from watchlist.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // POST /api/watchlist/export
  async exportWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.query.userId as string) || 'usr_demo_101';
      const items = await prisma.watchlistItem.findMany({
        where: { userId },
      });

      res.json({
        success: true,
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        total: items.length,
        items,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // POST /api/watchlist/import
  async importWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.body.userId || 'usr_demo_101';
      const { items } = req.body;

      if (!Array.isArray(items)) {
        res.status(400).json({ success: false, error: { message: 'Invalid payload: items array required.' } });
        return;
      }

      let importedCount = 0;
      for (const item of items) {
        const aId = item.anime?.id || item.animeId;
        const title = item.anime?.title?.userPreferred || item.anime?.title?.english || item.title;
        if (!aId || !title) continue;

        const coverImage = item.anime?.coverImage?.large || item.coverImage || '';
        const bannerImage = item.anime?.bannerImage || item.bannerImage || null;
        const format = item.anime?.format || item.format || 'TV';
        const genresJson = item.anime?.genres ? JSON.stringify(item.anime.genres) : null;

        await prisma.watchlistItem.upsert({
          where: { userId_animeId: { userId, animeId: Number(aId) } },
          update: {
            title,
            status: item.status || 'watching',
            currentEpisode: Number(item.currentEpisode) || 0,
            userRating: item.userRating ? Number(item.userRating) : null,
            notes: item.notes || null,
          },
          create: {
            userId,
            animeId: Number(aId),
            title,
            romajiTitle: item.anime?.title?.romaji || title,
            coverImage,
            bannerImage,
            format,
            status: item.status || 'watching',
            currentEpisode: Number(item.currentEpisode) || 0,
            totalEpisodes: Number(item.anime?.episodes || item.totalEpisodes || 0),
            userRating: item.userRating ? Number(item.userRating) : null,
            notes: item.notes || null,
            genres: genresJson,
          },
        });
        importedCount++;
      }

      res.json({ success: true, message: `Successfully imported ${importedCount} items.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
};
