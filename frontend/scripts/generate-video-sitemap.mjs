import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://www.animesenpai.online';
const publicDir = path.resolve(__dirname, '../public');
const trailersPath = path.resolve(__dirname, '../src/data/animeTrailers.json');

// Read pre-cached anime trailers
let trailers = {};
if (fs.existsSync(trailersPath)) {
  trailers = JSON.parse(fs.readFileSync(trailersPath, 'utf8'));
}

const trailerEntries = Object.values(trailers).filter(
  (t) => t.trailerId && /^[a-zA-Z0-9_-]{6,32}$/.test(t.trailerId)
);

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const xmlEntries = trailerEntries
  .sort((a, b) => a.id - b.id)
  .map((item) => {
    const loc = `${SITE_URL}/anime/${item.id}`;
    const title = escapeXml(`${item.title} Official Trailer`);
    const desc = escapeXml(
      item.description || `Watch the official HD trailer for ${item.title} on AnimeSenpai.`
    );
    const thumbnailLoc = `https://img.youtube.com/vi/${item.trailerId}/hqdefault.jpg`;
    const playerLoc = `https://www.youtube.com/embed/${item.trailerId}`;
    const pubYear = item.publicationYear || 2024;
    const pubDate = `${pubYear}-01-01T00:00:00+00:00`;

    return `  <url>
    <loc>${loc}</loc>
    <video:video>
      <video:thumbnail_loc>${thumbnailLoc}</video:thumbnail_loc>
      <video:title>${title}</video:title>
      <video:description>${desc}</video:description>
      <video:player_loc allow_embed="yes" autoplay="ap=1">${playerLoc}</video:player_loc>
      <video:publication_date>${pubDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`;
  })
  .join('\n');

const videoSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${xmlEntries}
</urlset>
`;

const videoSitemapPath = path.join(publicDir, 'video-sitemap.xml');
fs.writeFileSync(videoSitemapPath, videoSitemapXml, 'utf8');
console.log(
  `Successfully generated Google Video Sitemap with ${trailerEntries.length} videos at ${videoSitemapPath}`
);
