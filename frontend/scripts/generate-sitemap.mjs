import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://www.animesenpai.online';
const publicDir = path.resolve(__dirname, '../public');
const initialDataPath = path.resolve(__dirname, '../src/data/initialHomeData.json');

// Read bundled anime catalog to extract canonical anime IDs
const rawData = fs.readFileSync(initialDataPath, 'utf8');
const catalog = JSON.parse(rawData);

const animeIds = new Set();

function extractIds(item) {
  if (!item) return;
  if (Array.isArray(item)) {
    item.forEach(extractIds);
  } else if (item && typeof item === 'object') {
    if (item.id && typeof item.id === 'number') {
      animeIds.add(item.id);
    }
  }
}

for (const key of Object.keys(catalog)) {
  extractIds(catalog[key]);
}

const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
  { loc: `${SITE_URL}/discover`, changefreq: 'daily', priority: '0.9' },
  { loc: `${SITE_URL}/about`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${SITE_URL}/discover?sort=TRENDING_DESC`, changefreq: 'daily', priority: '0.8' },
  { loc: `${SITE_URL}/discover?sort=POPULARITY_DESC`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${SITE_URL}/discover?sort=SCORE_DESC`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${SITE_URL}/discover?format=TV`, changefreq: 'weekly', priority: '0.7' },
  { loc: `${SITE_URL}/discover?format=MOVIE`, changefreq: 'weekly', priority: '0.7' },
  { loc: `${SITE_URL}/privacy`, changefreq: 'monthly', priority: '0.4' },
  { loc: `${SITE_URL}/terms`, changefreq: 'monthly', priority: '0.4' },
];

const genreList = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

const genreRoutes = genreList.map((genre) => ({
  loc: `${SITE_URL}/discover?genre=${encodeURIComponent(genre)}`,
  changefreq: 'weekly',
  priority: '0.7',
}));

const animeRoutes = Array.from(animeIds).sort((a, b) => a - b).map((id) => ({
  loc: `${SITE_URL}/anime/${id}`,
  changefreq: 'weekly',
  priority: '0.8',
}));

const allUrls = [...staticRoutes, ...genreRoutes, ...animeRoutes];

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const sitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, xmlContent, 'utf8');

console.log(`Successfully generated sitemap.xml with ${allUrls.length} canonical URLs at ${sitemapPath}`);
