# Technology Stack

**Analysis Date:** 2026-04-23

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code in `src/` and configuration files
- CSS/LESS - Component styling via `less@4.6.4`

**Secondary:**
- JavaScript (ES modules)
- HTML5 (JSX/TSX templates)
- SQL - Via SQL editor component

## Runtime

**Environment:**
- Node.js 24.12.0 (specified in `.nvmrc`)

**Package Manager:**
- Yarn 1.22.22+ (configured via `packageManager` in `package.json`)
- Lockfile: `yarn.lock` (implied)

## Frameworks

**Core:**
- React 19.0.0 - UI framework, `peerDependency` allows 18.2.0+
- React DOM 19.0.0 - React rendering target
- React Router DOM 6.30.3 - Client-side routing (peerDependency allows 6.28.0+)

**UI Components:**
- Ant Design (antd) 5.29.3 - Design system and component library
- Radix UI - Unstyled accessible components: dropdown-menu, label, popover, select, slot, switch, tabs
- TailwindCSS 3.4.19 - Utility-first CSS framework
- Tailwind Merge 3.5.0 - Merge Tailwind classes intelligently
- Tailwind Animate 1.0.7 - Animation utilities

**Forms & Validation:**
- React Hook Form 7.73.1 - Form state management
- @hookform/resolvers 3.10.0 - Form validation resolvers
- Zod 3.25.76 - TypeScript-first schema validation

**Data Fetching:**
- SWR 2.4.1 - React hooks for data fetching with caching via `src/hooks/swrHooks.ts`
- Axios 1.15.2 - HTTP client with interceptors for JWT auth via `src/utils/api.ts`

**Code Editor:**
- Ace 1.43.6 - Code editor component via `ace-builds@1.43.6`
- React Ace 14.0.1 - React wrapper for Ace editor
- SQL Formatter 15.7.3 - SQL formatting utility

**Utilities:**
- Zustand 5.0.12 - Lightweight state management in `src/state/`
- React Intl 7.1.11 - Internationalization (i18n)
- React Icons 5.6.0 - Icon library
- React Resizable Panels 2.1.9 - Resizable panel layout
- React Syntax Highlighter 15.6.6 - Code syntax highlighting
- JWT Decode 4.0.0 - JWT token parsing in `src/state/jwtManager.ts`
- Lodash 4.18.1 - Utility functions
- Moment 2.30.1 - Date/time manipulation
- PapaParse 5.5.3 - CSV parsing
- Compare Versions 6.1.1 - Version comparison for feature flags
- Cronstrue 2.59.0 - Cron expression parsing
- CrateDB SQL Parser @cratedb/cratedb-sqlparse 0.0.17 - Custom SQL parsing

**Charts:**
- Recharts 2.15.4 - React charts library

**Styling:**
- Class Variance Authority 0.7.1 - CSS-in-JS variant pattern system
- clsx 2.1.0 - Class name utility

**Utilities:**
- Pretty Bytes 6.1.1 - Format byte sizes
- Word Wrap 1.2.5 - Text wrapping utility
- Path Parser 6.1.0 - URL path parsing
- Web Vitals 4.2.4 - Core Web Vitals measurement

## Testing & Build

**Testing:**
- Jest 29.7.0 - Test runner
- TS Jest 29.4.9 - Jest transformer for TypeScript
- Jest Environment JSDOM 29.7.0 - DOM environment
- Jest Fixed JSDOM 0.0.11 - JSDOM compatibility fix
- @testing-library/react 16.0.0 - React component testing utilities
- @testing-library/dom 10.0.0 - DOM testing utilities
- @testing-library/jest-dom 6.9.1 - Jest matchers for DOM
- @testing-library/user-event 14.6.1 - User event simulation
- MSW 2.12.7 - Mock Service Worker for API mocking in tests

**Build:**
- Vite 6.4.2 - Build tool and dev server (port 5000)
- @vitejs/plugin-react-swc 3.11.0 - React plugin using SWC compiler
- Vite TSConfig Paths 5.1.4 - Path alias resolution
- Vite Plugin DTS 4.5.4 - TypeScript declaration files generation
- Vite Plugin ESLint 1.8.1 - ESLint integration

**Linting & Formatting:**
- ESLint 9.39.4 - Code linting via `eslint.config.mjs`
- @typescript-eslint/parser 8.59.0 - TypeScript parser
- @typescript-eslint/eslint-plugin 8.59.0 - TypeScript rules
- eslint-config-airbnb 19.0.4 - Airbnb style guide
- eslint-config-prettier 10.1.8 - Disable ESLint conflicts with Prettier
- eslint-plugin-prettier 5.5.5 - Run Prettier as ESLint rule
- eslint-plugin-react 7.37.5 - React linting rules
- eslint-plugin-react-hooks 5.0.0 - React Hooks linting
- Prettier 3.8.1 - Code formatter with plugins:
  - prettier-plugin-sort-imports 1.8.11
  - prettier-plugin-tailwindcss 0.7.2

**CSS Processing:**
- PostCSS 8.5.10 - CSS transformation tool
- Autoprefixer 10.5.0 - Vendor prefixes

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Main configuration with path aliases for `components`, `hooks`, `state`, `types`, `utils`, `constants`, `routes`, `contexts`
- `tsconfig.node.json` - Node tooling configuration
- `tsconfig.build.json` - Build-specific overrides

**Build & Dev:**
- `vite.config.ts` - Development server config (port 5000, base: '')
- `vite.config.lib.ts` - Library build config
- `jest.config.js` - Test runner config with 80% coverage threshold

**Code Quality:**
- `.prettierrc.yaml` - Formatter with tailwind plugin, 85 char print width, trailing commas
- `eslint.config.mjs` - ESLint configuration
- `components.json` - UI component metadata (shadcn/ui style)

**CSS:**
- `tailwind.config.js` - Tailwind theming
- `postcss.config.js` - PostCSS config

**Package Management:**
- `.yarnrc.yml` - Yarn configuration
- `package.json` - Dependencies and scripts

## Build Outputs

**Dual Export (Library Mode):**
- ES Module: `dist/index.es.js`
- UMD: `dist/index.umd.js`
- TypeScript Declarations: `dist/index.d.ts`
- Stylesheet: `dist/style.css`
- Output directory (dev): `build/`
- Output directory (lib): `dist/`

## Scripts

- `start` - Run Vite dev server
- `build` - TypeScript check + build with Vite
- `build-lib` - TypeScript check + library build
- `check-types` - TypeScript type checking only
- `test` - Run Jest
- `lint` - Run ESLint on src/
- `link-local` - Link local React/ReactDOM (for development)
- `unlink-local` - Unlink local React/ReactDOM

## Module System

- **Format:** ES Modules (`"type": "module"`)
- **Target:** ES2020
- **Strict Mode:** Enabled in TypeScript
- **JSX:** React 17+ transform (`react-jsx`)

## Browser Support

**Production:** >0.2%, not dead, not op_mini all
**Development:** Last version of Chrome, Firefox, Safari

## Notable Configuration Patterns

- **Path Aliases:** Configured for `components`, `constants`, `contexts`, `hooks`, `routes`, `state`, `types`, `utils` to enable absolute imports
- **Monorepo Publishing:** Published to npm as `@cratedb/crate-gc-admin` via `publishConfig.registry`
- **Type Safety:** Strict TypeScript, isolated modules, no unused variables/parameters allowed
- **Pre-commit Hooks:** `.pre-commit-config.yaml` present for automatic checks

---

*Stack analysis: 2026-04-23*
