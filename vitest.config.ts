import { defineConfig, type Plugin } from 'vitest/config';
import fs from 'fs';

const srcRoot = process.cwd().replace(/\\/g, '/') + '/src';

const atAliasPlugin: Plugin = {
  name: 'at-alias-resolver',
  enforce: 'pre',
  resolveId(id: string) {
    if (!id.startsWith('@/')) return null;
    const rel = id.slice(2);
    const full = srcRoot + '/' + rel;
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      if (fs.existsSync(full + ext)) return full + ext;
    }
    if (fs.existsSync(full + '/index.ts')) return full + '/index.ts';
    if (fs.existsSync(full + '/index.js')) return full + '/index.js';
    if (fs.existsSync(full)) return full;
    return full + '.ts';
  },
};

export default defineConfig({
  plugins: [atAliasPlugin],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/.git/**', '**/sentry-actions.test.ts'],
  },
});
