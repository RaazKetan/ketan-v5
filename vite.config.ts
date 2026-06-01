import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { apiHandlers } from './vite-plugin-api'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  /* Make ALL env vars (not just VITE_*) available to process.env in dev so
     the local API handlers (api/sarvam/*) can read SARVAM_API_KEY from
     .env.local without needing a VITE_ prefix. Vite only loads VITE_* into
     import.meta.env by default. */
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of Object.keys(env)) {
    if (!(key in process.env)) process.env[key] = env[key];
  }

  return {
    plugins: [react(), tailwindcss(), apiHandlers(), cloudflare()],
  };
});