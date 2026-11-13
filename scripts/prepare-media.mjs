// Looks at what really exists in assets/ and prepares it for the site.
// Drop files in and re-run (npm run dev / npm run build do it automatically):
//   assets/logo.(svg|png|webp|jpg)   -> preloader, header, favicon
//   assets/reels/*.mp4               -> hero video (first file) + reels gallery
//   assets/bottle-360/<any video>    -> scroll-scrubbed frame sequence (needs ffmpeg)
// Nothing is generated or substituted when a file is missing: the section
// falls back to real Shopify photos instead.
import { mkdir, readdir, copyFile, writeFile, access, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets');
const PUBLIC = path.join(ROOT, 'public');
const SITE_URL = (process.env.SITE_URL || 'https://wa-and-brothers.pages.dev').replace(/\/$/, '');
const FRAMES = 72;

const exists = (p) => access(p).then(() => true, () => false);
const list = async (dir) => ((await exists(dir)) ? (await readdir(dir)).sort() : []);
const isVideo = (f) => /\.(mp4|webm|mov|m4v)$/i.test(f);
const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const ffmpeg = (args) => spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' }).status === 0;

await mkdir(path.join(PUBLIC, 'brand'), { recursive: true });
const media = { logo: null, heroVideo: null, heroPoster: null, reels: [], bottleFrames: 0, bottleFrameSize: null };
const notes = [];

// ---- logo + favicon ----
const logoFile = (await list(ASSETS)).find((f) => /^logo\.(svg|png|webp|jpe?g)$/i.test(f));
if (logoFile) {
  const ext = path.extname(logoFile).toLowerCase();
  await copyFile(path.join(ASSETS, logoFile), path.join(PUBLIC, 'brand', `logo${ext}`));
  media.logo = `/brand/logo${ext}`;
  const src = sharp(path.join(ASSETS, logoFile), { density: 300 });
  const fit = { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } };
  await src.clone().resize(32, 32, fit).png().toFile(path.join(PUBLIC, 'favicon-32.png'));
  await src.clone().resize(180, 180, fit).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
  await src.clone().resize(512, 512, fit).png().toFile(path.join(PUBLIC, 'icon-512.png'));
} else {
  notes.push('No assets/logo.* found: using the brand name as a text wordmark and a text favicon.');
  const mono = (size, fontSize) => Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2D58A"/><stop offset="1" stop-color="#C9A24B"/></linearGradient></defs>
      <rect width="64" height="64" rx="12" fill="#0A0A0A"/>
      <rect x="3.500" y="3.500" width="57" height="57" rx="9" fill="none" stroke="url(#g)" stroke-width="1.500"/>
      <text x="32" y="41" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="url(#g)">W.A</text>
    </svg>`);
  await writeFile(path.join(PUBLIC, 'favicon.svg'), mono(64, 24));
  await sharp(mono(64, 24), { density: 300 }).resize(32, 32).png().toFile(path.join(PUBLIC, 'favicon-32.png'));
  await sharp(mono(64, 24), { density: 600 }).resize(180, 180).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
  await sharp(mono(64, 24), { density: 900 }).resize(512, 512).png().toFile(path.join(PUBLIC, 'icon-512.png'));
}

// ---- reels + hero video ----
const reelDir = path.join(ASSETS, 'reels');
const reelFiles = (await list(reelDir)).filter(isVideo);
if (reelFiles.length) {
  await mkdir(path.join(PUBLIC, 'reels'), { recursive: true });
  for (let i = 0; i < reelFiles.length; i++) {
    const ext = path.extname(reelFiles[i]).toLowerCase();
    const name = `reel-${i + 1}`;
    await copyFile(path.join(reelDir, reelFiles[i]), path.join(PUBLIC, 'reels', `${name}${ext}`));
    let poster = null;
    if (hasFfmpeg && ffmpeg(['-ss', '0.5', '-i', path.join(reelDir, reelFiles[i]), '-frames:v', '1', '-vf', 'scale=540:-2', path.join(PUBLIC, 'reels', `${name}.webp`)])) {
      poster = `/reels/${name}.webp`;
    }
    media.reels.push({ src: `/reels/${name}${ext}`, poster });
  }
  media.heroVideo = media.reels[0].src;
  media.heroPoster = media.reels[0].poster;
  if (!hasFfmpeg) notes.push('ffmpeg is not installed: reels have no poster frames and are not re-compressed.');
} else {
  notes.push('No videos in assets/reels/: the hero uses real Shopify photos and the reels section links to Instagram.');
}

// ---- bottle turntable frames ----
const bottleDir = path.join(ASSETS, 'bottle-360');
const bottleVideo = (await list(bottleDir)).find(isVideo);
const framesDir = path.join(PUBLIC, 'bottle');
if (bottleVideo && hasFfmpeg) {
  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });
  const input = path.join(bottleDir, bottleVideo);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input], { encoding: 'utf8' });
  const duration = Number(probe.stdout) || 6;
  if (ffmpeg(['-i', input, '-vf', `fps=${(FRAMES / duration).toFixed(4)},scale=-2:900`, '-frames:v', String(FRAMES), '-c:v', 'libwebp', '-quality', '72', path.join(framesDir, 'f-%03d.webp')])) {
    const frames = (await list(framesDir)).filter((f) => f.endsWith('.webp'));
    const meta = await sharp(path.join(framesDir, frames[0])).metadata();
    media.bottleFrames = frames.length;
    media.bottleFrameSize = { width: meta.width, height: meta.height };
  }
} else if (bottleVideo) {
  notes.push('assets/bottle-360 has a video but ffmpeg is not installed, so frames could not be extracted.');
} else {
  notes.push('No video in assets/bottle-360/: the bottle story uses the Shopify product photo with parallax.');
}

// ---- Open Graph image (real product photo + brand name) ----
const productDir = path.join(PUBLIC, 'products');
const shots = (await list(productDir)).filter((f) => f.endsWith('.webp') && !f.endsWith('-sm.webp'));
let ogPhoto = null, darkest = 256;
for (const f of shots) {
  const { channels } = await sharp(path.join(productDir, f)).stats();
  const lum = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
  if (lum < darkest) { darkest = lum; ogPhoto = f; }
}
if (ogPhoto) {
  const photo = await sharp(path.join(productDir, ogPhoto)).resize(630, 630, { fit: 'cover' }).toBuffer();
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9A24B"/><stop offset="1" stop-color="#F2D58A"/></linearGradient>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0A0A0A"/><stop offset="1" stop-color="#0A0A0A" stop-opacity="0"/></linearGradient>
    </defs>
    <rect x="570" width="240" height="630" fill="url(#fade)"/>
    <rect x="24" y="24" width="1152" height="582" fill="none" stroke="url(#g)" stroke-width="1.500"/>
    <text x="80" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="30" letter-spacing="8" fill="#C9A24B">KANNAUJ · INDIA</text>
    <text x="80" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="url(#g)">W.A. AND</text>
    <text x="80" y="404" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="url(#g)">BROTHERS</text>
    <text x="80" y="468" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#F3EBDD">Alcohol-free attar. Order on WhatsApp.</text>
  </svg>`);
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0A0A0A' } })
    .composite([{ input: photo, left: 570, top: 0 }, { input: text, left: 0, top: 0 }])
    .jpeg({ quality: 84 }).toFile(path.join(PUBLIC, 'og-image.jpg'));
}

// ---- sitemap, robots, manifest ----
const today = new Date().toISOString().slice(0, 10);
await writeFile(path.join(PUBLIC, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
`);
await writeFile(path.join(PUBLIC, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
await writeFile(path.join(PUBLIC, 'site.webmanifest'), JSON.stringify({
  name: 'W.A. AND BROTHERS', short_name: 'W.A. Attar', start_url: '/', display: 'standalone',
  background_color: '#0A0A0A', theme_color: '#0A0A0A',
  icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
}, null, 2));
await writeFile(path.join(PUBLIC, '_headers'), `/products/*\n  Cache-Control: public, max-age=604800\n/bottle/*\n  Cache-Control: public, max-age=604800\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);

await mkdir(path.join(ROOT, 'src', 'data'), { recursive: true });
await writeFile(path.join(ROOT, 'src', 'data', 'media.ts'), `// GENERATED by scripts/prepare-media.mjs from what exists in assets/. Do not edit.
export interface Reel { src: string; poster: string | null }
export const media: {
  logo: string | null; heroVideo: string | null; heroPoster: string | null;
  reels: Reel[]; bottleFrames: number; bottleFrameSize: { width: number; height: number } | null;
} = ${JSON.stringify(media, null, 2)};
`);
console.log(`[media] logo: ${media.logo ?? 'none'} | reels: ${media.reels.length} | bottle frames: ${media.bottleFrames}`);
for (const n of notes) console.warn(`[media] ${n}`);
