import { Router, Request, Response } from 'express';
import { streamService } from '../services/streamService';

const router = Router();

// GET /api/stream/sources
// Query params: animeId, title, episode, audio ('sub' | 'dub'), season
router.get('/sources', async (req: Request, res: Response): Promise<void> => {
  try {
    const animeId = parseInt(req.query.animeId as string, 10) || 1;
    const title = (req.query.title as string) || 'Anime';
    const episode = parseInt(req.query.episode as string, 10) || 1;
    const audio = (req.query.audio as 'sub' | 'dub') === 'dub' ? 'dub' : 'sub';
    const season = parseInt(req.query.season as string, 10) || 1;

    const data = await streamService.getStreamSources(animeId, title, episode, audio, season);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/stream/subtitles
// Query params: title, episode, lang
router.get('/subtitles', (req: Request, res: Response): void => {
  try {
    const title = (req.query.title as string) || 'Anime';
    const episode = parseInt(req.query.episode as string, 10) || 1;
    const lang = (req.query.lang as string) || 'English';

    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(streamService.generateVTT(title, episode, lang));
  } catch (err: any) {
    res.status(500).send('WEBVTT\n\n00:00:01.000 --> 00:00:05.000\nSubtitle load error');
  }
});

// GET /api/stream/download
// Query params: url, filename
router.get('/download', async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'anime_episode.mp4';

    if (!targetUrl) {
      res.status(400).json({ success: false, error: { message: 'Missing download target URL' } });
      return;
    }

    await streamService.downloadStream(targetUrl, filename, res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/stream/proxy
// Query params: url, referer
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
