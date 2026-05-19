import { pathsToModuleNameMapper } from 'ts-jest';
import tsconfig from './tsconfig.json' with { type: 'json' };

export default {
  bail: false,
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: '.',
  testRegex: '(/__tests__/*.test.js|\\.(test))\\.(jsx|js|tsx|ts)$',
  moduleFileExtensions: ['jsx', 'js', 'mjs', 'tsx', 'ts', 'json'],
  collectCoverage: false,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.js',
    '!src/index.ts',
    '!src/lib.ts',
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: '<rootDir>',
    }),
    '.+\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(svg|png)$': '<rootDir>/test/__mocks__/empty-module.ts',
  },
  testEnvironment: 'jest-fixed-jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  transform: {
    'node_modules/until-async/.*\\.js$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
        },
      },
    ],
    'node_modules/rettime/.*\\.mjs$': ['<rootDir>/test/esm-to-cjs.cjs'],
    'node_modules/@open-draft/deferred-promise/.*\\.mjs$': ['<rootDir>/test/esm-to-cjs.cjs'],
  },
  transformIgnorePatterns: ['node_modules/(?!(until-async|pretty-bytes|rettime|@open-draft/deferred-promise)/.*)'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  globalSetup: './test/global-setup.ts',
};
