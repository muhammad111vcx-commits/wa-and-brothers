import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = (process.env.SITE_URL || 'https://wa-and-brothers.pages.dev').replace(/\/$/, '');

// Fills the canonical / Open Graph / schema URLs in index.html.
const siteUrl = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
});

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
  build: { target: 'es2020', cssMinify: true },
  server: { port: 5173, host: true },
});
