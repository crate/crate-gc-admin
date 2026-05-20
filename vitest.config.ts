import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { Plugin } from 'vite';

// D-14: Stub SVG/PNG imports in tests — replaces Jest moduleNameMapper.
// Vite 8 (Rolldown) resolve.alias regex is unreliable; use a plugin instead.
const assetStub: Plugin = {
  name: 'asset-stub',
  enforce: 'pre',
  resolveId(id) {
    if (/\.(svg|png)$/.test(id)) return '\0asset-stub';
  },
  load(id) {
    if (id === '\0asset-stub') {
      return "const content = 'div'; export const ReactComponent = content; export default content;";
    }
  },
};

export default defineConfig({
  plugins: [assetStub, react(), tsconfigPaths()],
  test: {
    globals: true,                              // D-03: vi/describe/it/expect available globally
    testTimeout: 15000,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globalSetup: './test/global-setup.ts',
    environmentOptions: {
      customExportConditions: [''],             // D-04: carry-over from jest.config.js
    },
    server: {
      deps: {
        inline: ['until-async', 'pretty-bytes'], // replaces transformIgnorePatterns
      },
    },
    css: {
      modules: { classNameStrategy: 'non-scoped' }, // mirrors identity-obj-proxy
    },
    coverage: {
      provider: 'istanbul',                     // D-01: istanbul NOT v8
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/index.js', 'src/index.ts', 'src/lib.ts'],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
  },
});
