import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        notfound: resolve(root, '404.html'),
        opsIndex: resolve(root, 'ops/index.html'),
        opsPlugins: resolve(root, 'ops/plugins.html'),
        opsConfigs: resolve(root, 'ops/configs.html'),
        opsConfig: resolve(root, 'ops/config.html'),
        opsReference: resolve(root, 'ops/reference.html'),
      },
    },
  },
});
