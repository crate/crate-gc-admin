# Project Structure

## Top-Level Directory Map

```
crate-gc-admin/
├── src/                  Main application source
├── test/                 Global test infrastructure (setup, MSW, utils)
├── __mocks__/            Root-level Jest module mocks
├── public/               Static assets served as-is
├── build/                Library build output (vite.config.lib.ts)
├── dist/                 Application build output (vite.config.ts)
├── conf/                 nginx configuration for Docker deployment
├── devtools/             Internal developer tools / scripts
├── components.json       shadcn/ui component registry config
├── eslint.config.mjs     ESLint flat config
├── jest.config.js        Jest configuration
├── tailwind.config.js    Tailwind CSS configuration
├── tsconfig.json         Main TypeScript config (app)
├── tsconfig.build.json   TypeScript config for library build
├── tsconfig.node.json    TypeScript config for Vite/Node scripts
├── vite.config.ts        Vite app build config
├── vite.config.lib.ts    Vite library build config
├── postcss.config.js     PostCSS (Tailwind pipeline)
├── Dockerfile            Production Docker image
├── yarn.lock             Yarn dependency lockfile
└── index.html            Vite HTML entry point
```

## Source Tree (`src/`)

```
src/
├── main.tsx              App entry point — mounts React into #root with BrowserRouter
├── App.tsx               Root component — route definitions, auth gate, ClusterHealthManager
├── index.css             Global CSS imports (Tailwind base + ant design overrides)
├── assets/               Static images and SVG icons
├── components/           Reusable UI components (see below)
├── constants/            App-wide constant values
├── hooks/                Shared React hooks
├── hooks/__test__/       Unit tests for hooks
├── routes/               Page-level route components
├── state/                Zustand global stores
├── swr/                  SWR fetcher configuration and JWT handling
├── swr/jwt/              JWT-aware SWR fetcher
├── types/                Shared TypeScript interfaces and types
├── types/policies/       Policy-specific types
└── utils/                Pure utility functions
```

## Components (`src/components/`)

50+ reusable components, each in its own directory with component file + optional test:

| Component | Purpose |
|-----------|---------|
| `Button` | Styled button variants |
| `Card` | Container card |
| `ClusterHealthManager` | Polls cluster health, stores in Zustand |
| `DataTable` | Generic sortable/paginated data table |
| `GCChart` | Recharts wrapper for cluster metrics |
| `GcAdminAntdProvider` | Ant Design theme provider |
| `GCSpin` | Loading spinner |
| `GCStatusIndicator` | Green/yellow/red health indicator |
| `Layout` | App shell with sidebar navigation |
| `NotificationHandler` | Toast/notification system |
| `SQLEditor` | Ace-based SQL editor (428 lines) |
| `SQLHistory` | SQL query history panel |
| `SQLResults` | Results grid with JSON tree view |
| `StatusBar` | Bottom status bar |
| `Tree` | Collapsible tree component |

## Routes (`src/routes/`)

| Route | Path (approximate) | Description |
|-------|-------------------|-------------|
| `Auth` | `/login` | Authentication screen |
| `Overview` | `/` | Cluster health dashboard |
| `Nodes` | `/nodes` | Node list and health |
| `Tables` | `/tables` | Table browser |
| `TablesShards` | `/shards` | Shard distribution view |
| `SQLConsole` | `/sql` | Interactive SQL console |
| `Users` | `/users` | User management |
| `Help` | `/help` | Documentation links |
| `Automation` | `/automation` | Jobs and table policies |
| `Automation/routes` | sub-routes | Job scheduler, policy editor |
| `Automation/views` | — | JobsTable, PolicyForm (729 lines), etc. |
| `Automation/hooks` | — | Automation-specific hooks |

## State (`src/state/`)

Zustand stores:
- `jwtManager` — JWT token storage, refresh, URL param extraction
- Session / cluster connection state
- Cluster health state (fed by `ClusterHealthManager`)

## SWR (`src/swr/`)

- `swr/jwt/` — JWT-aware fetch wrapper used as SWR fetcher
- Hooks that use SWR live in `src/hooks/swrHooks.ts`

## Types (`src/types/`)

- `query.ts` — SQL result shapes (`rows: any[][]`, column metadata)
- `policies/` — Automation policy type definitions
- Other shared domain types

## Test Infrastructure (`test/`)

```
test/
├── setup.ts              Per-file setup (jest-dom, MSW server start, browser mocks)
├── global-setup.ts       Global setup (TZ = Europe/Vienna)
├── index.ts              Re-exports
├── msw/
│   ├── server.ts         MSW server instance
│   ├── handlers.ts       Default handler list
│   ├── handlers/         Per-feature handler files
│   ├── handlerFactory.ts Factory for reusable handlers
│   └── getRequestSpy.ts  Spy utility for MSW requests
└── testUtils/
    ├── renderWithTestWrapper.tsx  Render wrapper with providers
    ├── createLocationTestUtil.ts  Mock location factory
    ├── actWithFakeTimers.ts       Fake timers + act() helper
    ├── disableConsole.ts          Suppress expected console errors
    └── treeUtils.ts               Tree query helpers
```

## Root Mocks (`__mocks__/`)

Applied automatically by Jest `moduleNameMapper`:
- `react-router-dom` — navigation mocks
- `localStorageMock` — in-memory localStorage
- `ace-builds` — no-op for browser-only SQL editor
- `empty-module.ts` — stub for SVG/PNG imports

## Entry Points

| File | Role |
|------|------|
| `index.html` | Vite HTML template |
| `src/main.tsx` | React mount point, BrowserRouter wrapping |
| `src/App.tsx` | Route definitions, auth gate |
| `src/index.css` | Global styles |

## File Naming Conventions

- Components: `PascalCase.tsx` matching directory name (e.g., `Button/Button.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useExecuteSql.ts`)
- Utilities: `camelCase.ts` (e.g., `nodes.ts`, `statusChecks.ts`)
- Tests: `ComponentName.test.tsx` or `hookName.test.ts`
- Types: `camelCase.ts` or `PascalCase.ts` for domain models

## Where to Add New Code

| What | Where |
|------|-------|
| New reusable UI component | `src/components/NewComponent/NewComponent.tsx` |
| New page/view | `src/routes/NewRoute/NewRoute.tsx` + register in `src/App.tsx` |
| New global state | `src/state/newStore.ts` (Zustand) |
| New SWR-based data hook | `src/hooks/swrHooks.ts` or new file in `src/hooks/` |
| New utility function | `src/utils/newUtil.ts` |
| New shared types | `src/types/newType.ts` |
| New MSW handlers (for tests) | `test/msw/handlers/newFeature.ts` + import in `handlers.ts` |
