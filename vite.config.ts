import crypto from 'crypto';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {chrome98Css} from './scripts/chrome98-css.mjs';

function chrome98CssPlugin(): Plugin {
  const renames: Array<[string, string]> = [];
  return {
    name: 'chrome98-css',
    generateBundle(_options, bundle) {
      renames.length = 0;
      for (const item of Object.values(bundle)) {
        if (item.type !== 'asset' || !item.fileName.endsWith('.css')) continue;
        const source = typeof item.source === 'string' ? item.source : Buffer.from(item.source).toString('utf8');
        const next = chrome98Css(source);
        const hash = crypto.createHash('sha256').update(next).digest('hex').slice(0, 8);
        const file = item.fileName.split('/').pop() || item.fileName;
        const renamed = file.replace(/-[A-Za-z0-9_]+\.css$/, `-${hash}.css`);
        if (renamed !== file) renames.push([file, renamed]);
        item.source = next;
        item.fileName = item.fileName.replace(file, renamed);
      }
    },
    writeBundle(options) {
      if (!renames.length) return;
      const root = options.dir ? path.resolve(options.dir) : path.resolve('dist');
      const visit = (dir: string) => {
        for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
          const full = path.join(dir, ent.name);
          if (ent.isDirectory()) {
            visit(full);
            continue;
          }
          if (!/\.(html|js|css|map)$/.test(ent.name)) continue;
          const text = fs.readFileSync(full, 'utf8');
          let next = text;
          for (const [from, to] of renames) next = next.split(from).join(to);
          if (next !== text) fs.writeFileSync(full, next);
        }
      };
      visit(root);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), chrome98CssPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: "chrome98",
      cssMinify: true,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/") || id.includes("node_modules/react-router")) {
              return "react";
            }
            if (id.includes("node_modules/motion") || id.includes("node_modules/framer-motion")) {
              return "motion";
            }
            if (id.includes("src/data/productsData")) {
              return "catalog";
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
