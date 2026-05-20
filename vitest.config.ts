import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,                              // D-03: vi/describe/it/expect available globally
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
  resolve: {
    alias: [
      {
        find: /\.(svg|png)$/,                   // D-14: array form required; object-form keys are not regexes
        replacement: fileURLToPath(
          new URL('./test/__mocks__/empty-module.ts', import.meta.url),
        ),
      },
    ],
  },
});
