import { Router, Request, Response } from 'express';
import { streamService } from '../services/streamService';

const router = Router();

// GET /api/stream/sources
router.get('/sources', async (req: Request, res: Response): Promise<void> => {
  try {
    const animeId = parseInt(req.query.animeId as string, 10) || 1;
    const title = (req.query.title as string) || 'Anime';
    const episode = parseInt(req.query.episode as string, 10) || 1;

    const data = await streamService.getStreamSources(animeId, title, episode);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/stream/proxy
router.get('/proxy', async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUrl = req.query.url as string;
    const referer = (req.query.referer as string) || 'https://anitaku.so';

    if (!targetUrl) {
      res.status(400).json({ success: false, error: { message: 'Missing target stream URL' } });
      return;
    }

    await streamService.proxyStream(targetUrl, referer, res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
