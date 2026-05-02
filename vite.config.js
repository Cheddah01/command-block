import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/command-block/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        plugins: resolve(root, 'plugins.html'),
        configs: resolve(root, 'configs.html'),
        config: resolve(root, 'config.html'),
      },
    },
  },
});
