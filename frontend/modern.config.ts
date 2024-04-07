import { URL } from 'url';
import { appTools, defineConfig } from '@modern-js/app-tools';

const apiBase = new URL(process.env.API_BASE || 'http://localhost:8000');

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  bff: {
    proxy: {
      '/api': {
        target: apiBase.origin,
        changeOrigin: true,
        pathRewrite: { '^/api': apiBase.pathname },
      },
    },
  },
  runtime: {
    router: true,
  },
  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
  ],
});
