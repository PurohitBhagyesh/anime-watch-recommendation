import { Request, Response } from 'express';
import { anilistService } from '../services/anilistService';

export const animeController = {
  // GET /api/anime/trending
  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.perPage as string, 10) || 20;
      const data = await anilistService.getTrending(page, perPage);
      res.json({ success: true, data: data.Page });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // GET /api/anime/seasonal
  async getSeasonal(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.perPage as string, 10) || 20;
      const season = (req.query.season as string) || 'FALL';
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

      const data = await anilistService.getSeasonal(season.toUpperCase(), year, page, perPage);
      res.json({ success: true, data: data.Page });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // GET /api/anime/top
  async getTop100(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.perPage as string, 10) || 20;
      const data = await anilistService.getTop100(page, perPage);
      res.json({ success: true, data: data.Page });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // GET /api/anime/popular
  async getPopular(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.perPage as string, 10) || 20;
      const data = await anilistService.getPopular(page, perPage);
      res.json({ success: true, data: data.Page });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // GET /api/anime/search
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { search, genre, format, status, season, seasonYear, sort, page, perPage } = req.query;

      const genres = genre ? (Array.isArray(genre) ? (genre as string[]) : [genre as string]) : undefined;
      const sortList = sort ? (Array.isArray(sort) ? (sort as string[]) : [sort as string]) : undefined;

      const data = await anilistService.searchAnime({
        search: search as string,
        genres,
        format: format as string,
        status: status as string,
        season: season as string,
        seasonYear: seasonYear ? parseInt(seasonYear as string, 10) : undefined,
        sort: sortList,
        page: page ? parseInt(page as string, 10) : 1,
        perPage: perPage ? parseInt(perPage as string, 10) : 24,
      });

      res.json({ success: true, data: data.Page });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  // GET /api/anime/:id
  async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const animeId = parseInt(String(req.params.id), 10);
      if (isNaN(animeId)) {
        res.status(400).json({ success: false, error: { message: 'Invalid anime ID' } });
        return;
      }

      const data = await anilistService.getAnimeDetails(animeId);
      if (!data?.Media) {
        res.status(404).json({ success: false, error: { message: 'Anime details not found' } });
        return;
      }

      res.json({ success: true, data: data.Media });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
};
