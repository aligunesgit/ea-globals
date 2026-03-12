import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel({
    functionPerRoute: false,
    nodeVersion: '20',
  }),
  site: 'https://eaglobals.com',
});
