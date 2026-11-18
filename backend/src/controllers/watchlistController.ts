import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const ALLOWED_STATUSES = new Set([
  'watching',
  'plan_to_watch',
  'completed',
  'rewatching',
  'paused',
  'dropped',
  'favorite',
]);

function parsePositiveInt(val: unknown): number | null {
  const num = Number(val);
  if (!Number.isSafeInteger(num) || num <= 0) return null;
  return num;
}

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export const watchlistController = {
  // GET /api/watchlist
  async getWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const userId = req.user.id;
      const status = typeof req.query.status === 'string' ? req.query.status : '';

      const whereClause: { userId: string; status?: string } = { userId };
      if (status && status !== 'all' && ALLOWED_STATUSES.has(status)) {
        whereClause.status = status;
      }

      const items = await prisma.watchlistItem.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
      });

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
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to load watchlist.' } });
    }
  },

  // POST /api/watchlist
  async addOrUpdateItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const userId = req.user.id;
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

      const parsedAnimeId = parsePositiveInt(animeId);
      if (!parsedAnimeId || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ success: false, error: { message: 'Valid Anime ID and Title are required.' } });
        return;
      }

      const safeStatus =
        typeof status === 'string' && ALLOWED_STATUSES.has(status) ? status : 'watching';
      const safeTitle = title.trim().slice(0, 200);
      const safeRomaji = typeof romajiTitle === 'string' ? romajiTitle.trim().slice(0, 200) : safeTitle;
      const safeCover = typeof coverImage === 'string' ? coverImage.slice(0, 500) : '';
      const safeBanner = typeof bannerImage === 'string' ? bannerImage.slice(0, 500) : null;
      const safeFormat = typeof format === 'string' ? format.trim().slice(0, 32) : 'TV';
      const safeNotes = typeof notes === 'string' ? notes.trim().slice(0, 500) : null;
      const genresJson = Array.isArray(genres)
        ? JSON.stringify(genres.filter((g) => typeof g === 'string').slice(0, 20))
        : null;

      const item = await prisma.watchlistItem.upsert({
        where: {
          userId_animeId: {
            userId,
            animeId: parsedAnimeId,
          },
        },
        update: {
          title: safeTitle,
          romajiTitle: safeRomaji,
          ...(coverImage !== undefined && { coverImage: safeCover }),
          ...(bannerImage !== undefined && { bannerImage: safeBanner }),
          ...(format !== undefined && { format: safeFormat }),
          ...(status !== undefined && { status: safeStatus }),
          ...(currentEpisode !== undefined && { currentEpisode: clampInt(currentEpisode, 0, 10000, 0) }),
          ...(totalEpisodes !== undefined && { totalEpisodes: clampInt(totalEpisodes, 0, 10000, 0) }),
          ...(userRating !== undefined && { userRating: clampInt(userRating, 0, 10, 0) }),
          ...(notes !== undefined && { notes: safeNotes }),
          ...(genresJson && { genres: genresJson }),
        },
        create: {
          userId,
          animeId: parsedAnimeId,
          title: safeTitle,
          romajiTitle: safeRomaji,
          coverImage: safeCover,
          bannerImage: safeBanner,
          format: safeFormat,
          status: safeStatus,
          currentEpisode: clampInt(currentEpisode, 0, 10000, 0),
          totalEpisodes: clampInt(totalEpisodes, 0, 10000, 0),
          userRating: userRating !== undefined ? clampInt(userRating, 0, 10, 0) : null,
          notes: safeNotes,
          genres: genresJson,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          action: 'ADDED_TO_WATCHLIST',
          animeId: parsedAnimeId,
          metadata: JSON.stringify({ status: item.status, episode: item.currentEpisode }),
        },
      });

      res.status(200).json({ success: true, data: { item } });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to update watchlist.' } });
    }
  },

  // PATCH /api/watchlist/:animeId/progress
  async updateProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const userId = req.user.id;
      const animeId = parsePositiveInt(req.params.animeId);
      if (!animeId) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID.' } });
        return;
      }

      const { currentEpisode, status } = req.body;

      const existing = await prisma.watchlistItem.findUnique({
        where: { userId_animeId: { userId, animeId } },
      });

      if (!existing) {
        res.status(404).json({ success: false, error: { message: 'Watchlist entry not found.' } });
        return;
      }

      let newStatus =
        typeof status === 'string' && ALLOWED_STATUSES.has(status) ? status : existing.status;
      const targetEp =
        currentEpisode !== undefined
          ? clampInt(currentEpisode, 0, 10000, existing.currentEpisode)
          : existing.currentEpisode;

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
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to update episode progress.' } });
    }
  },

  // DELETE /api/watchlist/:animeId
  async removeItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const userId = req.user.id;
      const animeId = parsePositiveInt(req.params.animeId);
      if (!animeId) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID.' } });
        return;
      }

      await prisma.watchlistItem.deleteMany({
        where: { userId, animeId },
      });

      res.json({ success: true, message: 'Item removed from watchlist.' });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to remove item.' } });
    }
  },

  // POST /api/watchlist/export
  async exportWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const items = await prisma.watchlistItem.findMany({
        where: { userId: req.user.id },
      });

      res.json({
        success: true,
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        total: items.length,
        items,
      });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to export watchlist.' } });
    }
  },

  // POST /api/watchlist/import
  async importWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const userId = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length > 500) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid payload: items array required (max 500 items per import).' },
        });
        return;
      }

      let importedCount = 0;
      for (const item of items) {
        const aId = parsePositiveInt(item?.anime?.id ?? item?.animeId);
        const rawTitle = item?.anime?.title?.userPreferred || item?.anime?.title?.english || item?.title;
        if (!aId || typeof rawTitle !== 'string' || !rawTitle.trim()) continue;

        const safeTitle = rawTitle.trim().slice(0, 200);
        const safeStatus =
          typeof item?.status === 'string' && ALLOWED_STATUSES.has(item.status)
            ? item.status
            : 'watching';
        const coverImage =
          typeof (item?.anime?.coverImage?.large || item?.coverImage) === 'string'
            ? String(item?.anime?.coverImage?.large || item?.coverImage).slice(0, 500)
            : '';
        const bannerImage =
          typeof (item?.anime?.bannerImage || item?.bannerImage) === 'string'
            ? String(item?.anime?.bannerImage || item?.bannerImage).slice(0, 500)
            : null;
        const format =
          typeof (item?.anime?.format || item?.format) === 'string'
            ? String(item?.anime?.format || item?.format).slice(0, 32)
            : 'TV';
        const genresJson = Array.isArray(item?.anime?.genres)
          ? JSON.stringify(item.anime.genres.filter((g: unknown) => typeof g === 'string').slice(0, 20))
          : null;

        await prisma.watchlistItem.upsert({
          where: { userId_animeId: { userId, animeId: aId } },
          update: {
            title: safeTitle,
            status: safeStatus,
            currentEpisode: clampInt(item?.currentEpisode, 0, 10000, 0),
            userRating: item?.userRating ? clampInt(item.userRating, 0, 10, 0) : null,
            notes: typeof item?.notes === 'string' ? item.notes.trim().slice(0, 500) : null,
          },
          create: {
            userId,
            animeId: aId,
            title: safeTitle,
            romajiTitle:
              typeof item?.anime?.title?.romaji === 'string'
                ? item.anime.title.romaji.trim().slice(0, 200)
                : safeTitle,
            coverImage,
            bannerImage,
            format,
            status: safeStatus,
            currentEpisode: clampInt(item?.currentEpisode, 0, 10000, 0),
            totalEpisodes: clampInt(item?.anime?.episodes ?? item?.totalEpisodes, 0, 10000, 0),
            userRating: item?.userRating ? clampInt(item.userRating, 0, 10, 0) : null,
            notes: typeof item?.notes === 'string' ? item.notes.trim().slice(0, 500) : null,
            genres: genresJson,
          },
        });
        importedCount++;
      }

      res.json({ success: true, message: `Successfully imported ${importedCount} items.` });
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to import watchlist.' } });
    }
  },
};
