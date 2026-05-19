# Technology Stack

**Analysis Date:** 2026-05-19

## Languages

**Primary:**
- TypeScript 5.9.x — all source code in `src/`
- TSX — React component files throughout `src/components/`, `src/routes/`

**Secondary:**
- JavaScript — `jest.config.js`, `postcss.config.js`, `tailwind.config.js`
- CSS / Less — `src/index.css`, component stylesheets; Less is a runtime dependency for Ant Design theming

## Runtime

**Environment:**
- Node.js 24.12.0 (pinned via `.nvmrc`)
- Browser-only at runtime — no server-side rendering; app is a pure SPA

**Target:**
- Production: `>0.2%` coverage (browserslist), excluding dead/op_mini browsers
- Development: latest Chrome, Firefox, Safari

**Package Manager:**
- yarn 1.22.22 (pinned in `package.json` `packageManager` field)
- Lockfile: `yarn.lock` present

## Frameworks

**Core:**
- React 19.0.x — UI rendering (`src/main.tsx` entry, `src/App.tsx` root component)
- react-router-dom 6.30.x — client-side routing (`src/constants/paths.ts`, `src/constants/routes.tsx`)

**State Management:**
- zustand 5.0.x — three stores: `src/state/jwtManager.ts`, `src/state/session.ts`, `src/state/clusterHealth.ts`

**Data Fetching:**
- swr 2.4.x — SWR hooks for polling Grand Central and CrateDB (`src/hooks/swrHooks.ts`, `src/swr/jwt/`)
- axios 1.15.x — HTTP client used via `src/hooks/useGcApi.ts` and `src/utils/api.ts`

**UI Component Libraries:**
- antd (Ant Design) 5.29.x — primary component library; wrapped via `src/components/GcAdminAntdProvider/`
- @radix-ui/react-dropdown-menu, react-label, react-popover, react-select, react-slot, react-switch, react-tabs — headless UI primitives for shadcn-style components
- shadcn/ui configuration present (`components.json`), using Radix primitives with Tailwind CSS

**Forms:**
- react-hook-form 7.73.x — form state management
- @hookform/resolvers 3.10.x — Zod integration for validation
- zod 3.25.x — schema validation

**SQL Editor:**
- react-ace 14.0.x + ace-builds 1.43.x — SQL editor component (`src/components/SQLEditor/`)
- @cratedb/cratedb-sqlparse 0.0.17 — CrateDB-specific SQL parsing
- sql-formatter 15.7.x — SQL formatting (`src/utils/sqlFormatter.ts`)

**Tables:**
- @tanstack/react-table 8.21.x — data table component (`src/components/DataTable/`, `src/components/Table/`)

**Charts:**
- recharts 2.15.x — used in `src/components/GCChart/`

**Utilities:**
- moment 2.30.x — date formatting (constants: `DATE_FORMAT`, `DATE_FORMAT_WITH_TZ`)
- lodash 4.18.x — general utility functions
- jwt-decode 4.0.x — JWT decoding in `src/state/jwtManager.ts`
- compare-versions 6.1.x — semver comparisons in `src/state/jwtManager.ts`
- cronstrue 2.59.x — human-readable cron descriptions (Automation views)
- papaparse 5.5.x — CSV parsing
- pretty-bytes 6.1.x — file size display
- path-parser 6.1.x — typed URL path building (`src/constants/paths.ts`)
- react-intl 7.1.x — i18n/formatting
- react-syntax-highlighter 15.6.x — code display (`src/components/SyntaxHighlighter/`)

## Build Tooling

**Bundler:**
- Vite 6.4.x — two configs:
  - `vite.config.ts` — dev server (port 5000, `build/` output) and production app build
  - `vite.config.lib.ts` — library build (`dist/`) producing ES and UMD bundles for NPM publish

**Compiler/Transpiler:**
- TypeScript 5.9.x (`tsconfig.json`, `tsconfig.build.json`, `tsconfig.node.json`)
  - Target: ES2020; module: ESNext; strict mode on
  - `tsconfig.build.json` extends base, excludes test files
- @vitejs/plugin-react-swc 3.11.x — SWC-powered React Fast Refresh (replaces Babel)

**Type Declarations:**
- vite-plugin-dts 4.5.4 — generates `.d.ts` files for library distribution

**CSS:**
- Tailwind CSS 3.4.x (`tailwind.config.js`) with custom CrateDB brand colors
- PostCSS 8.5.x (`postcss.config.js`)
- autoprefixer 10.5.x
- tailwindcss-animate 1.0.7 — accordion/animation utilities

**Path Aliases:**
Configured in `tsconfig.json` `paths` and mirrored for Jest in `jest.config.js`:
- `components/*` → `./src/components/*`
- `hooks/*` → `./src/hooks/*`
- `routes/*` → `./src/routes/*`
- `state/*` → `./src/state/*`
- `types/*` → `./src/types/*`
- `utils/*` → `./src/utils/*`
- `constants/*` → `./src/constants/*`
- `contexts/*` → `./src/contexts/*`
- `__mocks__/*` → `./__mocks__/*`

## Testing Framework

**Runner:** Jest 29.7.x (`jest.config.js`)
- Preset: `ts-jest/presets/js-with-ts`
- Environment: `jest-fixed-jsdom` (patched jsdom for React 19)
- Config: `jest.config.js`

**DOM Utilities:**
- @testing-library/react 16.0.x
- @testing-library/jest-dom 6.9.x
- @testing-library/user-event 14.6.1
- @testing-library/dom 10.x

**Network Mocking:**
- msw 2.13.x (Mock Service Worker) — intercepts HTTP in tests (`test/msw/`)

**Coverage threshold** (when enabled): 80% branches/functions/lines/statements

## Dev Tools

**Linter:**
- ESLint 9.39.x — flat config at `eslint.config.mjs`
  - Plugins: `@typescript-eslint`, `prettier`, `react`, `react-hooks`
  - Extends: `eslint:recommended`, `@typescript-eslint/recommended`, `eslint-config-prettier`
  - Airbnb config listed in devDependencies but primary config is flat format

**Formatter:**
- Prettier 3.8.x — config at `.prettierrc.yaml`
  - `singleQuote: true`, `printWidth: 85`, `tabWidth: 2`, `trailingComma: 'all'`
  - Plugins: `prettier-plugin-tailwindcss` (class sorting), `prettier-plugin-sort-imports`
  - Import order: NPMPackages → localImportsValue → localImportsType

**Type Checker:**
- TypeScript 5.9.x (`tsc --noemit` via `yarn check-types`)

## Key Scripts

```bash
yarn start          # Vite dev server on port 5000 (app mode)
yarn build          # tsc + vite build → build/ (app bundle)
yarn build-lib      # tsc + vite build --config vite.config.lib.ts → dist/ (NPM library)
yarn check-types    # tsc --noemit (type check only)
yarn test           # Jest (all tests)
yarn lint           # ESLint with cache on src/
yarn prepack        # Automatically runs build-lib before npm publish
```

## Dual Build Outputs

This project has two distinct build modes:

| Mode | Config | Output | Purpose |
|------|--------|--------|---------|
| App | `vite.config.ts` | `build/` | Standalone SPA served by nginx (embedded in CrateDB or standalone) |
| Library | `vite.config.lib.ts` | `dist/` | NPM package `@cratedb/crate-gc-admin` imported by cloud-ui |

Library externals: `react`, `react-dom`, `react-router-dom` (peer deps, not bundled).
Library exports: `dist/index.es.js`, `dist/index.umd.js`, `dist/index.d.ts`, `dist/style.css`.

## CI/CD

- GitHub Actions: `.github/workflows/pr.yml` (lint + build + test on PRs)
- GitHub Actions: `.github/workflows/publish.yml` (auto-publish to NPM on merge)
- Node version sourced from `.nvmrc` in CI
- Dependabot configured for NPM updates (`.github/dependabot.yml`)

---

*Stack analysis: 2026-05-19*
