import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { sharedReactPlugin, sharedResolve } from './vite.config.base';

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
  plugins: [assetStub, sharedReactPlugin],
  resolve: sharedResolve,
  test: {
    globals: true,
    pool: 'threads',
    environment: 'jsdom',
    setupFiles: [
      './test/setupMocks.ts',
      './test/setupPolyfills.ts',
      './test/setupConsole.ts',
      './test/setup.ts',
    ],
    globalSetup: './test/global-setup.ts',
    environmentOptions: {
      customExportConditions: [''],
    },
    server: {
      deps: {
        inline: ['until-async', 'pretty-bytes'],
        optimizer: {
          ssr: {
            enabled: true,
            include: [
              'antd',
              '@ant-design/icons',
              'lodash',
              'recharts',
              'react-intl',
              'ace-builds',
              'react-ace',
              'react-syntax-highlighter',
            ],
          },
        },
      },
    },
    css: {
      modules: { classNameStrategy: 'non-scoped' },
    },
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/index.js', 'src/index.ts', 'src/lib.ts'],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
  },
});
