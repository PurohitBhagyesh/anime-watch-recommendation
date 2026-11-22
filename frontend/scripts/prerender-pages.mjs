import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://www.animesenpai.online';
const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const trailersPath = path.resolve(__dirname, '../src/data/animeTrailers.json');
const initialDataPath = path.resolve(__dirname, '../src/data/initialHomeData.json');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found! Run vite build before prerendering.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Load catalog & trailers
let trailers = {};
if (fs.existsSync(trailersPath)) {
  trailers = JSON.parse(fs.readFileSync(trailersPath, 'utf8'));
}

const catalogRaw = JSON.parse(fs.readFileSync(initialDataPath, 'utf8'));
const animeMap = new Map();

function extractAnime(item) {
  if (!item) return;
  if (Array.isArray(item)) {
    item.forEach(extractAnime);
  } else if (item && typeof item === 'object' && item.id) {
    if (!animeMap.has(item.id)) {
      animeMap.set(item.id, item);
    }
  }
}

for (const k of Object.keys(catalogRaw)) {
  extractAnime(catalogRaw[k]);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildStaticPage({
  canonicalPath,
  title,
  description,
  keywords,
  ogImage,
  videoData,
  jsonLd,
  bodyContent,
}) {
  const fullCanonical = `${SITE_URL}${canonicalPath}`;
  let html = baseHtml;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  // 2. Replace Canonical
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="${fullCanonical}" />`
  );

  // 3. Replace Description
  html = html.replace(
    /<meta name="description"\s+content=".*?" \/>/s,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // 4. Replace OG URL & Title
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="${fullCanonical}" />`
  );
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description"\s+content=".*?" \/>/s,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );

  // 5. Replace Twitter URL & Title
  html = html.replace(
    /<meta name="twitter:url" content=".*?" \/>/,
    `<meta name="twitter:url" content="${fullCanonical}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description"\s+content=".*?" \/>/s,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  // 6. Optional Video Tags (for Google Video Indexing & Rich Cards)
  if (videoData) {
    const videoTags = `
  <meta property="og:type" content="video.other" />
  <meta property="og:video" content="https://www.youtube.com/embed/${videoData.trailerId}" />
  <meta property="og:video:url" content="https://www.youtube.com/embed/${videoData.trailerId}" />
  <meta property="og:video:secure_url" content="https://www.youtube.com/embed/${videoData.trailerId}" />
  <meta property="og:video:type" content="text/html" />
  <meta property="og:video:width" content="1280" />
  <meta property="og:video:height" content="720" />
  <meta name="twitter:card" content="player" />
  <meta name="twitter:player" content="https://www.youtube.com/embed/${videoData.trailerId}" />
  <meta name="twitter:player:width" content="1280" />
  <meta name="twitter:player:height" content="720" />`;
    html = html.replace('<!-- Open Graph / Social Sharing Preview -->', `<!-- Open Graph / Social Sharing Preview -->${videoTags}`);
  }

  // 7. Inject Page-Level JSON-LD
  if (jsonLd) {
    const jsonLdScript = `\n  <script type="application/ld+json" id="prerender-jsonld">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;
    html = html.replace('</head>', `${jsonLdScript}\n</head>`);
  }

  // 8. Inject Crawlable Fallback Content inside <div id="root">
  if (bodyContent) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${bodyContent}</div>`
    );
  }

  return html;
}

// 1. PRERENDER STATIC PAGES
const staticPages = [
  {
    path: '/discover',
    title: 'Discover Anime • Top Recommendations & Seasonal Schedules • AnimeSenpai',
    description: 'Explore 20,000+ anime titles, discover top seasonal anime, filter by genre, and track your watchlist on AnimeSenpai.',
    bodyContent: `
      <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-8 max-w-7xl mx-auto">
        <h1 class="text-3xl font-black tracking-tight mb-4 text-white">Discover Anime Catalog</h1>
        <p class="text-[#9a9aa6] text-sm mb-6 leading-relaxed">
          Filter and explore over 20,000+ anime series, movies, and upcoming seasonal releases powered live by AniList.
        </p>
        <nav aria-label="Catalog categories" class="flex flex-wrap gap-2 text-xs">
          <a href="/discover?sort=POPULARITY_DESC" class="px-3 py-1.5 rounded-full bg-[#121217] border border-[#23232b] text-white">Top 100 Popular</a>
          <a href="/discover?sort=SCORE_DESC" class="px-3 py-1.5 rounded-full bg-[#121217] border border-[#23232b] text-white">Highest Rated</a>
          <a href="/discover?seasonal=true" class="px-3 py-1.5 rounded-full bg-[#121217] border border-[#23232b] text-white">Current Season</a>
        </nav>
      </main>
    `,
  },
  {
    path: '/watchlist',
    title: 'My Watchlist • AnimeSenpai',
    description: 'Track your anime watch progress, manage watching, planning, completed series, and sync your watchlist seamlessly on AnimeSenpai.',
    bodyContent: `
      <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-8 max-w-7xl mx-auto">
        <h1 class="text-3xl font-black tracking-tight mb-4 text-white">My Anime Watchlist</h1>
        <p class="text-[#9a9aa6] text-sm leading-relaxed">
          Manage your personal anime tracker with offline storage, real-time AniList progress, and JSON backups.
        </p>
      </main>
    `,
  },
  {
    path: '/about',
    title: 'About AnimeSenpai • Mission, Transparency & Open Source Platform',
    description: 'Learn about AnimeSenpai: an independent, open-source anime discovery catalog and watchlist tracker powered live by AniList GraphQL and official YouTube trailer embeds.',
    bodyContent: `
      <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-black tracking-tight mb-4 text-white">About AnimeSenpai</h1>
        <p class="text-[#c8c8d2] text-sm mb-4 leading-relaxed">
          AnimeSenpai was created strictly to give anime enthusiasts a fast, clean, and modern interface to explore seasonal schedules, track watchlist progress, and watch official trailers via verified public APIs.
        </p>
        <p class="text-[#9a9aa6] text-xs leading-relaxed">
          We never host or distribute pirated files. All trailers are official YouTube embeds, and all data comes from licensed public sources.
        </p>
      </main>
    `,
  },
  {
    path: '/privacy',
    title: 'Privacy Policy • AnimeSenpai',
    description: 'Read the AnimeSenpai Privacy Policy. We respect your data, never sell personal information, and prioritize offline-first guest watchlists.',
    bodyContent: `
      <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-black tracking-tight mb-4 text-white">Privacy Policy</h1>
        <p class="text-[#c8c8d2] text-sm leading-relaxed">
          You can browse the full anime catalog, search 20,000+ titles, and watch official trailers without creating an account.
        </p>
      </main>
    `,
  },
  {
    path: '/terms',
    title: 'Terms of Service • AnimeSenpai',
    description: 'Review the Terms of Service for AnimeSenpai. Understand user guidelines, acceptable use, and open-source platform policies.',
    bodyContent: `
      <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-black tracking-tight mb-4 text-white">Terms of Service</h1>
        <p class="text-[#c8c8d2] text-sm leading-relaxed">
          AnimeSenpai is a discovery index and personal tracking tool. Review our full terms of service and acceptable use guidelines.
        </p>
      </main>
    `,
  },
  {
    path: '/license',
    title: 'License • AnimeSenpai',
    description: 'Review the open source software license and content attributions governing the AnimeSenpai platform.',
    bodyContent: `
      <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-black tracking-tight mb-4 text-white">License</h1>
        <p class="text-[#c8c8d2] text-sm leading-relaxed">
          AnimeSenpai open source license details, AniList API attributions, and third-party library licenses.
        </p>
      </main>
    `,
  },
  {
    path: '/security',
    title: 'Security Center • AnimeSenpai',
    description: 'Learn how AnimeSenpai secures user data with strict Content Security Policy, zero stored passwords, and client-side encryption.',
    bodyContent: `
      <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-black tracking-tight mb-4 text-white">Security Center</h1>
        <p class="text-[#c8c8d2] text-sm leading-relaxed">
          Our defense-in-depth security model: strict CSP, HTTPS-only, Google Firebase authentication, and zero third-party telemetry.
        </p>
      </main>
    `,
  },
];

for (const sp of staticPages) {
  const targetDir = path.join(distDir, sp.path.replace(/^\//, ''));
  ensureDir(targetDir);
  const html = buildStaticPage({
    canonicalPath: sp.path,
    title: sp.title,
    description: sp.description,
    bodyContent: sp.bodyContent,
  });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
}
console.log(`Prerendered ${staticPages.length} core static pages`);

// 2. PRERENDER ANIME DETAIL PAGES (WITH 100% VIDEO INDEXING METADATA)
let animeCount = 0;
for (const [id, anime] of animeMap.entries()) {
  const animeTitle =
    anime.title?.english || anime.title?.romaji || anime.title?.native || `Anime ${id}`;
  const cleanSynopsis = (anime.description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
  const pageDesc = cleanSynopsis
    ? `${cleanSynopsis}... Discover, track episodes, and watch trailers on AnimeSenpai.`
    : `Explore ${animeTitle} on AnimeSenpai. Ratings, characters, airing schedules, and official trailers.`;

  const trailerInfo = trailers[id];
  const hasTrailer = Boolean(trailerInfo?.trailerId);

  // Schema.org VideoObject for Google Video Indexing
  const videoObjectSchema = hasTrailer
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: `${animeTitle} Official Trailer`,
        description: `Official HD trailer for ${animeTitle} on AnimeSenpai.`,
        thumbnailUrl: [
          `https://img.youtube.com/vi/${trailerInfo.trailerId}/maxresdefault.jpg`,
          `https://img.youtube.com/vi/${trailerInfo.trailerId}/hqdefault.jpg`,
        ],
        uploadDate: anime.seasonYear ? `${anime.seasonYear}-01-01T00:00:00+00:00` : '2024-01-01T00:00:00+00:00',
        embedUrl: `https://www.youtube.com/embed/${trailerInfo.trailerId}`,
        contentUrl: `https://www.youtube.com/watch?v=${trailerInfo.trailerId}`,
      }
    : null;

  // Schema.org TVSeries / Movie
  const mediaSchema = {
    '@context': 'https://schema.org',
    '@type': anime.format === 'MOVIE' ? 'Movie' : 'TVSeries',
    name: animeTitle,
    description: cleanSynopsis,
    image: anime.coverImage?.large || anime.coverImage?.extraLarge,
    genre: anime.genres || [],
    numberOfEpisodes: anime.episodes || undefined,
    datePublished: anime.seasonYear ? `${anime.seasonYear}` : undefined,
    url: `${SITE_URL}/anime/${id}`,
    trailer: videoObjectSchema || undefined,
  };

  // Crawlable DOM content
  const trailerDom = hasTrailer
    ? `
      <section aria-label="${escapeHtml(animeTitle)} Official Trailer" class="my-6 p-5 rounded-2xl bg-[#0c0c0f] border border-[#23232b]">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-white">${escapeHtml(animeTitle)} Official Trailer</h2>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16161b] text-[#818cf8] border border-[#23232b]">1080p HD</span>
        </div>
        <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailerInfo.trailerId)}?rel=0&modestbranding=1"
            title="${escapeHtml(animeTitle)} Official Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            class="w-full h-full border-0"
          ></iframe>
        </div>
      </section>
    `
    : '';

  const animeBodyContent = `
    <main class="min-h-screen bg-[#070709] text-[#f5f5f7] p-4 sm:p-8 max-w-7xl mx-auto">
      <article>
        <header class="mb-6">
          <h1 class="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">${escapeHtml(animeTitle)}</h1>
          <p class="text-xs sm:text-sm text-[#9a9aa6]">
            ${escapeHtml((anime.genres || []).join(' • '))} ${anime.seasonYear ? `• ${anime.seasonYear}` : ''}
          </p>
        </header>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-1">
            ${anime.coverImage?.large ? `<img src="${anime.coverImage.large}" alt="${escapeHtml(animeTitle)} poster" class="w-full rounded-2xl shadow-xl border border-[#23232b]" />` : ''}
          </div>
          <div class="md:col-span-2">
            <h2 class="text-xs font-mono uppercase tracking-wider text-[#9a9aa6] mb-2">Synopsis</h2>
            <p class="text-sm text-[#c8c8d2] leading-relaxed mb-6">${escapeHtml(cleanSynopsis)}</p>
            ${trailerDom}
          </div>
        </div>
      </article>
    </main>
  `;

  const targetDir = path.join(distDir, 'anime', String(id));
  ensureDir(targetDir);

  const html = buildStaticPage({
    canonicalPath: `/anime/${id}`,
    title: `${animeTitle} • AnimeSenpai`,
    description: pageDesc,
    videoData: hasTrailer ? trailerInfo : null,
    jsonLd: mediaSchema,
    bodyContent: animeBodyContent,
  });

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  animeCount++;
}

console.log(`Prerendered ${animeCount} canonical anime detail pages (with video structured data & players)`);
