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

// STRICT CANONICAL ROUTES ONLY:
// Google Search Console flags parameter variations (?genre=, ?sort=, ?seasonal=)
// as "Alternate page with proper canonical tag" when included in sitemaps.
// Sitemaps MUST strictly contain 100% canonical, indexable destination URLs.
const staticRoutes = [
  { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
  { loc: `${SITE_URL}/discover`, changefreq: 'daily', priority: '0.9' },
  { loc: `${SITE_URL}/watchlist`, changefreq: 'daily', priority: '0.8' },
  { loc: `${SITE_URL}/about`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${SITE_URL}/privacy`, changefreq: 'monthly', priority: '0.4' },
  { loc: `${SITE_URL}/terms`, changefreq: 'monthly', priority: '0.4' },
  { loc: `${SITE_URL}/license`, changefreq: 'monthly', priority: '0.4' },
  { loc: `${SITE_URL}/security`, changefreq: 'monthly', priority: '0.4' },
];

const animeRoutes = Array.from(animeIds).sort((a, b) => a - b).map((id) => ({
  loc: `${SITE_URL}/anime/${id}`,
  changefreq: 'weekly',
  priority: '0.8',
}));

const allUrls = [...staticRoutes, ...animeRoutes];

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
console.log(`Successfully generated canonical sitemap.xml with ${allUrls.length} URLs at ${sitemapPath}`);
