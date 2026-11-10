import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://damiecodes.com',
  integrations: [sitemap()],
  build: {
    // External, immutable-cached CSS keeps the size budget measurable and the CSP simple.
    inlineStylesheets: 'never',
  },
});
