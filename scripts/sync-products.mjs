// Pulls the catalogue from Shopify and writes src/data/products.ts.
// Order of sources:
//   1. https://{store}/products.json  (works once the storefront password is removed)
//   2. assets/products.csv            (Shopify admin > Products > Export)
//   3. data/shopify-snapshot.json     (last known copy of the Shopify catalogue)
// Nothing here invents or rewrites product copy: names, prices, notes and
// descriptions are taken from Shopify exactly as they are.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = process.env.SHOPIFY_STORE || '1i8isv-fb.myshopify.com';
const CSV = path.join(ROOT, 'assets', 'products.csv');
const SNAPSHOT = path.join(ROOT, 'data', 'shopify-snapshot.json');
const IMG_DIR = path.join(ROOT, 'public', 'products');
const OUT = path.join(ROOT, 'src', 'data', 'products.ts');

const exists = (p) => access(p).then(() => true, () => false);

// ---------- sources ----------

async function fromFeed() {
  const all = [];
  for (let page = 1; page < 50; page++) {
    const res = await fetch(`https://${STORE}/products.json?limit=250&page=${page}`, {
      headers: { accept: 'application/json' },
      redirect: 'manual',
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const { products } = await res.json();
    all.push(...products);
    if (products.length < 250) break;
  }
  return all;
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift().map((h) => h.replace(/^﻿/, '').trim());
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

async function fromCsv() {
  const rows = parseCsv(await readFile(CSV, 'utf8'));
  const byHandle = new Map();
  for (const r of rows) {
    const handle = r['Handle'];
    if (!handle) continue;
    if (!byHandle.has(handle)) byHandle.set(handle, { handle, variants: [], images: [], tags: [] });
    const p = byHandle.get(handle);
    if (r['Title']) {
      p.title = r['Title'];
      p.body_html = r['Body (HTML)'] || '';
      p.vendor = r['Vendor'] || '';
      p.tags = (r['Tags'] || '').split(',').map((t) => t.trim()).filter(Boolean);
      p.status = (r['Status'] || 'active').toLowerCase();
      p.published = (r['Published'] || 'true').toLowerCase();
    }
    if (r['Variant Price']) {
      const title = [r['Option1 Value'], r['Option2 Value'], r['Option3 Value']].filter(Boolean).join(' / ');
      p.variants.push({
        title: title || 'Default Title',
        price: r['Variant Price'],
        compare_at_price: r['Variant Compare At Price'] || null,
        available: true,
      });
    }
    if (r['Image Src'] && !p.images.some((im) => im.src === r['Image Src'])) {
      p.images.push({ src: r['Image Src'], alt: r['Image Alt Text'] || '' });
    }
  }
  return [...byHandle.values()].filter((p) => p.title && p.status === 'active');
}

async function loadProducts() {
  try {
    const products = await fromFeed();
    console.log(`[sync] ${products.length} product(s) from https://${STORE}/products.json`);
    await mkdir(path.dirname(SNAPSHOT), { recursive: true });
    await writeFile(SNAPSHOT, JSON.stringify({
      _note: 'Last known copy of the Shopify catalogue, in the same shape as /products.json. Rewritten automatically whenever the live feed is reachable. Do not edit by hand: change products in Shopify.',
      fetchedAt: new Date().toISOString().slice(0, 10),
      products,
    }, null, 2));
    return { products, source: 'feed' };
  } catch (err) {
    console.warn(`[sync] Live feed unavailable (${err.message}). The storefront is probably password-protected.`);
  }
  if (await exists(CSV)) {
    const products = await fromCsv();
    console.log(`[sync] ${products.length} product(s) from assets/products.csv`);
    return { products, source: 'csv' };
  }
  if (await exists(SNAPSHOT)) {
    const { products, fetchedAt } = JSON.parse(await readFile(SNAPSHOT, 'utf8'));
    console.warn(`[sync] Using data/shopify-snapshot.json from ${fetchedAt}. Prices may be out of date.`);
    return { products, source: 'snapshot' };
  }
  throw new Error('No product source: the feed failed and neither assets/products.csv nor data/shopify-snapshot.json exists.');
}

// ---------- text ----------

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;|&rsquo;/g, "'").replace(/&middot;/g, '·');
const strip = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const splitNotes = (s) => s.split(/[·,•|/]| and /).map((n) => n.trim()).filter(Boolean);

// Scent notes exactly as written under "Fragrance notes" in the description.
function parseNotes(html) {
  const at = html.search(/fragrance notes/i);
  if (at < 0) return [];
  const rest = html.slice(at);
  const list = rest.match(/^[^]*?<\/p>\s*<ul>([^]*?)<\/ul>/i);
  const inline = rest.match(/^fragrance notes:?\s*<\/strong>:?\s*([^<]+)/i);
  if (inline && strip(inline[1])) return [{ label: null, items: splitNotes(strip(inline[1])) }];
  if (list) {
    return [...list[1].matchAll(/<li>([^]*?)<\/li>/gi)].map((m) => {
      const text = strip(m[1]);
      const tier = text.match(/^([A-Za-z ]{2,12}):\s*(.+)$/);
      return tier ? { label: tier[1].trim(), items: splitNotes(tier[2]) } : { label: null, items: splitNotes(text) };
    }).filter((t) => t.items.length);
  }
  return [];
}

function parseBlocks(html) {
  const paragraphs = [...html.matchAll(/<p>([^]*?)<\/p>/gi)].map((m) => strip(m[1])).filter(Boolean);
  const lead = (paragraphs[0] || '').replace(/^[^:]{2,40}:\s*/, '');
  const summary = paragraphs[1] || '';
  const benefitsBlock = html.match(/why you'll love it[^]*?<ul>([^]*?)<\/ul>/i);
  const benefits = benefitsBlock ? [...benefitsBlock[1].matchAll(/<li>([^]*?)<\/li>/gi)].map((m) => strip(m[1])) : [];
  const how = paragraphs.find((p) => /^how to use/i.test(p));
  return { lead, summary, benefits, howToUse: how ? how.replace(/^how to use:?\s*/i, '') : '' };
}

// ---------- images ----------

// Removes solid white letterbox bars (a crop, nothing else) and reports whether
// the photo has a light or dark surround so the page can frame it properly.
async function processImage(buf, base) {
  const img = sharp(buf).rotate();
  const { data, info } = await img.clone().greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const rowStats = (y) => {
    let min = 255, dark = 0;
    for (let x = 0; x < w; x++) { const v = data[y * w + x]; if (v < min) min = v; if (v < 215) dark++; }
    return { white: min > 228, cover: dark / w };
  };
  let top = 0, bottom = h - 1;
  while (top < h / 3 && rowStats(top).white) top++;
  while (bottom > (2 * h) / 3 && rowStats(bottom).white) bottom--;
  // Only treat it as a letterbox bar if the picture starts as a full-width edge.
  if (top > 0 && rowStats(Math.min(top + 3, h - 1)).cover < 0.6) top = 0;
  if (bottom < h - 1 && rowStats(Math.max(bottom - 3, 0)).cover < 0.6) bottom = h - 1;
  if (top > 0) top += 2;
  if (bottom < h - 1) bottom -= 2;
  const ch = bottom - top + 1;

  let sum = 0, n = 0;
  const ring = Math.max(4, Math.round(w * 0.03));
  for (let y = top; y <= bottom; y++) for (let x = 0; x < w; x++) {
    if (y - top < ring || bottom - y < ring || x < ring || w - x <= ring) { sum += data[y * w + x]; n++; }
  }
  const border = Math.round(sum / n);

  const cropped = img.extract({ left: 0, top, width: w, height: ch });
  const outW = Math.min(w, 900);
  const outH = Math.round((ch * outW) / w);
  await cropped.clone().resize({ width: outW }).webp({ quality: 80 }).toFile(path.join(IMG_DIR, `${base}.webp`));
  await cropped.clone().resize({ width: Math.min(w, 480) }).webp({ quality: 74 }).toFile(path.join(IMG_DIR, `${base}-sm.webp`));
  return { width: outW, height: outH, border, tone: border < 120 ? 'dark' : 'light' };
}

const labelFromFile = (src) => {
  const file = decodeURIComponent(new URL(src).pathname.split('/').pop() || '');
  return file.replace(/\.[a-z0-9]+$/i, '').replace(/_[0-9a-f-]{20,}$/i, '').replace(/^.*?-\d{2}-/, '').replace(/[-_]+/g, ' ').trim();
};

async function buildImages(p, name) {
  const out = [];
  for (let i = 0; i < p.images.length; i++) {
    const im = p.images[i];
    const base = `${p.handle}-${i + 1}`;
    try {
      const res = await fetch(im.src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const meta = await processImage(Buffer.from(await res.arrayBuffer()), base);
      const view = labelFromFile(im.src);
      out.push({
        src: `/products/${base}.webp`,
        srcSmall: `/products/${base}-sm.webp`,
        width: meta.width,
        height: meta.height,
        alt: im.alt || `${name} attar bottle${view ? `, ${view}` : ''}`,
        tone: meta.tone,
        border: meta.border,
      });
    } catch (err) {
      console.warn(`[sync] Skipped image ${im.src}: ${err.message}`);
    }
  }
  return out;
}

// ---------- main ----------

const { products: raw, source } = await loadProducts();
await mkdir(IMG_DIR, { recursive: true });
await mkdir(path.dirname(OUT), { recursive: true });

const products = [];
const missingNotes = [];
for (const p of raw) {
  const [name, ...sub] = p.title.split('|').map((s) => s.trim());
  const html = p.body_html || '';
  const tags = Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  const notes = parseNotes(html);
  if (!notes.length) missingNotes.push(p.title);
  products.push({
    id: String(p.id ?? p.handle),
    handle: p.handle,
    title: p.title,
    name,
    subtitle: sub.join(' | '),
    descriptionHtml: html,
    descriptionText: strip(html),
    ...parseBlocks(html),
    tags,
    notes,
    variants: p.variants.map((v) => ({
      title: v.title,
      price: Number(v.price),
      compareAtPrice: v.compare_at_price && Number(v.compare_at_price) > Number(v.price) ? Number(v.compare_at_price) : null,
      available: v.available !== false,
    })),
    url: `https://${STORE}/products/${p.handle}`,
    images: await buildImages(p, name),
  });
}

const file = `// GENERATED by scripts/sync-products.mjs from Shopify (${source}). Do not edit.
// Change products in Shopify, then run: npm run sync-products

export interface ProductImage { src: string; srcSmall: string; width: number; height: number; alt: string; tone: 'dark' | 'light'; border: number }
export interface ProductVariant { title: string; price: number; compareAtPrice: number | null; available: boolean }
export interface NoteTier { label: string | null; items: string[] }
export interface Product {
  id: string; handle: string; title: string; name: string; subtitle: string;
  descriptionHtml: string; descriptionText: string; lead: string; summary: string;
  benefits: string[]; howToUse: string; tags: string[]; notes: NoteTier[];
  variants: ProductVariant[]; url: string; images: ProductImage[];
}

export const productSource = ${JSON.stringify(source)};

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;
await writeFile(OUT, file);
console.log(`[sync] Wrote src/data/products.ts (${products.length} products, ${products.reduce((n, p) => n + p.images.length, 0)} images)`);
if (missingNotes.length) {
  console.warn(`[sync] No "Fragrance notes" found in Shopify for: ${missingNotes.join(', ')}. Add them to the product description; none were invented.`);
}
