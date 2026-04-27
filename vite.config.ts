import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite configuration for PromptArchitect-Studio.
 * Configures the development server, React plugin, and environment variable aliases.
 */
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5174,
        host: '0.0.0.0',
        proxy: {
          '/local-ai': {
            target: 'http://100.115.102.53:8080',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/local-ai/, '')
          }
        }
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
