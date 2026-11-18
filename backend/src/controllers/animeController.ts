import { Request, Response } from 'express';
import { anilistService } from '../services/anilistService';

const ALLOWED_SEASONS = new Set(['WINTER', 'SPRING', 'SUMMER', 'FALL']);
const ALLOWED_FORMATS = new Set(['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC']);
const ALLOWED_STATUSES = new Set(['FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS']);

function parseClampedInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export const animeController = {
  // GET /api/anime/trending
  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const page = parseClampedInt(req.query.page, 1, 1, 500);
      const perPage = parseClampedInt(req.query.perPage, 20, 1, 50);
      const data = await anilistService.getTrending(page, perPage);
      res.json({ success: true, data: data.Page });
    } catch {
      res.status(502).json({ success: false, error: { message: 'Failed to load trending anime' } });
    }
  },

  // GET /api/anime/seasonal
  async getSeasonal(req: Request, res: Response): Promise<void> {
    try {
      const page = parseClampedInt(req.query.page, 1, 1, 500);
      const perPage = parseClampedInt(req.query.perPage, 20, 1, 50);
      const rawSeason = typeof req.query.season === 'string' ? req.query.season.trim().toUpperCase() : 'FALL';
      const season = ALLOWED_SEASONS.has(rawSeason) ? rawSeason : 'FALL';
      const year = parseClampedInt(req.query.year, new Date().getFullYear(), 1917, 2100);

      const data = await anilistService.getSeasonal(season, year, page, perPage);
      res.json({ success: true, data: data.Page });
    } catch {
      res.status(502).json({ success: false, error: { message: 'Failed to load seasonal anime' } });
    }
  },

  // GET /api/anime/top
  async getTop100(req: Request, res: Response): Promise<void> {
    try {
      const page = parseClampedInt(req.query.page, 1, 1, 500);
      const perPage = parseClampedInt(req.query.perPage, 20, 1, 50);
      const data = await anilistService.getTop100(page, perPage);
      res.json({ success: true, data: data.Page });
    } catch {
      res.status(502).json({ success: false, error: { message: 'Failed to load top anime' } });
    }
  },

  // GET /api/anime/popular
  async getPopular(req: Request, res: Response): Promise<void> {
    try {
      const page = parseClampedInt(req.query.page, 1, 1, 500);
      const perPage = parseClampedInt(req.query.perPage, 20, 1, 50);
      const data = await anilistService.getPopular(page, perPage);
      res.json({ success: true, data: data.Page });
    } catch {
      res.status(502).json({ success: false, error: { message: 'Failed to load popular anime' } });
    }
  },

  // GET /api/anime/search
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { search, genre, format, status, season, seasonYear, sort, page, perPage } = req.query;

      const cleanSearch =
        typeof search === 'string' ? search.trim().slice(0, 120) || undefined : undefined;
      const genres =
        typeof genre === 'string' && genre.trim()
          ? [genre.trim().slice(0, 40)]
          : Array.isArray(genre)
          ? (genre as string[]).slice(0, 10).map((g) => String(g).trim().slice(0, 40)).filter(Boolean)
          : undefined;
      const sortList =
        typeof sort === 'string' && sort.trim()
          ? [sort.trim().slice(0, 40)]
          : Array.isArray(sort)
          ? (sort as string[]).slice(0, 3).map((s) => String(s).trim().slice(0, 40)).filter(Boolean)
          : undefined;

      const cleanFormat =
        typeof format === 'string' && ALLOWED_FORMATS.has(format.toUpperCase())
          ? format.toUpperCase()
          : undefined;
      const cleanStatus =
        typeof status === 'string' && ALLOWED_STATUSES.has(status.toUpperCase())
          ? status.toUpperCase()
          : undefined;
      const cleanSeason =
        typeof season === 'string' && ALLOWED_SEASONS.has(season.toUpperCase())
          ? season.toUpperCase()
          : undefined;
      const cleanYear =
        seasonYear !== undefined && String(seasonYear).trim() !== ''
          ? parseClampedInt(seasonYear, new Date().getFullYear(), 1917, 2100)
          : undefined;

      const data = await anilistService.searchAnime({
        search: cleanSearch,
        genres,
        format: cleanFormat,
        status: cleanStatus,
        season: cleanSeason,
        seasonYear: cleanYear,
        sort: sortList,
        page: parseClampedInt(page, 1, 1, 500),
        perPage: parseClampedInt(perPage, 24, 1, 50),
      });

      res.json({ success: true, data: data.Page });
    } catch {
      res.status(502).json({ success: false, error: { message: 'Failed to search anime' } });
    }
  },

  // GET /api/anime/:id
  async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const animeId = Number(req.params.id);
      if (!Number.isSafeInteger(animeId) || animeId <= 0) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID' } });
        return;
      }

      const data = await anilistService.getAnimeDetails(animeId);
      if (!data?.Media) {
        res.status(404).json({ success: false, error: { message: 'Anime details not found' } });
        return;
      }

      res.json({ success: true, data: data.Media });
    } catch {
      res.status(502).json({ success: false, error: { message: 'Failed to load anime details' } });
    }
  },
};
