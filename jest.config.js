export default {
  bail: false,
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: '.',
  testRegex: '(/__tests__/*.test.js|\\.(test))\\.(jsx|js|tsx|ts)$',
  moduleFileExtensions: ['jsx', 'js', 'tsx', 'ts', 'json'],
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
  moduleNameMapper: {
    '.+\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(svg|png)$': '<rootDir>/test/__mocks__/empty-module.js',
    'react-syntax-highlighter/dist/esm/styles/hljs': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'ts-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!troublesome-dependency/.*)'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  globalSetup: './test/global-setup.ts',
};
