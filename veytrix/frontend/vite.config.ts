import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

function resolveNodeModulesFallback(): Plugin {
  return {
    name: 'resolve-node-modules-fallback',
    async resolveId(source, importer, options) {
      if (importer && importer.replace(/\\/g, '/').includes('command-centre') && !source.startsWith('.') && !source.startsWith('/')) {
        const resolved = await this.resolve(source, path.resolve(__dirname, 'src/index.html'), { ...options, skipSelf: true });
        if (resolved) return resolved;
      }
      return null;
    },
  };
}


export default defineConfig({
  plugins: [resolveNodeModulesFallback(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@command-centre': path.resolve(__dirname, '../command-centre'),
    },
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: ['..'],
    },
  },
});


