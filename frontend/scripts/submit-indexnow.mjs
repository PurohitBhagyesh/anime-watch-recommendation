import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'www.animesenpai.online';
const KEY = '9749e52c037f457da21b22561e35988c';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const publicDir = path.resolve(__dirname, '../public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

if (!fs.existsSync(sitemapPath)) {
  console.error(`Sitemap not found at ${sitemapPath}. Run "npm run generate-sitemap" first.`);
  process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locMatches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)];
const urls = locMatches.map((match) => match[1].trim());

if (urls.length === 0) {
  console.error('No URLs found in sitemap.xml');
  process.exit(1);
}

console.log(`Found ${urls.length} URLs to submit to IndexNow for ${HOST}`);

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

async function submitToIndexNow(endpointUrl, endpointName) {
  try {
    console.log(`Submitting ${urls.length} URLs to ${endpointName} (${endpointUrl})...`);
    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await res.text();
    if (res.status === 200 || res.status === 202) {
      console.log(`[${endpointName}] Success (${res.status}): URLs submitted successfully.`);
    } else {
      console.warn(`[${endpointName}] Response (${res.status}): ${bodyText || res.statusText}`);
    }
  } catch (err) {
    console.error(`[${endpointName}] Request failed:`, err.message);
  }
}

async function run() {
  await submitToIndexNow('https://api.indexnow.org/indexnow', 'IndexNow API');
  await submitToIndexNow('https://www.bing.com/indexnow', 'Bing IndexNow');
  await submitToIndexNow('https://yandex.com/indexnow', 'Yandex IndexNow');
}

run();
