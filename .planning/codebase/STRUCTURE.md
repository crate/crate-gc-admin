# Directory Structure

**Analysis Date:** 2026-04-23

## Top-Level Layout

```
crate-gc-admin/
├── src/                   - Application source code
├── test/                  - Test utilities, MSW setup, fixtures
├── __mocks__/             - Jest module mocks
├── public/                - Static assets
├── conf/                  - nginx config (Docker deployment)
├── devtools/              - Development tooling
├── build/                 - Build output (gitignored)
├── dist/                  - Library build output (gitignored)
├── App.tsx                - Root component (src-level)
├── index.html             - HTML entry point for Vite
├── package.json           - Dependencies and scripts
├── tsconfig.json          - TypeScript config
├── vite.config.ts         - App build config
├── vite.config.lib.ts     - Library build config
├── jest.config.js         - Test config
├── tailwind.config.js     - Tailwind CSS config
├── eslint.config.mjs      - ESLint config
└── components.json        - shadcn/ui component config
```

## Key Directories

**`src/routes/`** — Feature pages (self-contained)
```
routes/
├── Auth/                  - Login/auth screens
├── Automation/            - Scheduled jobs and table policies
│   ├── hooks/             - Feature-specific hooks
│   ├── routes/            - Subroutes
│   ├── views/             - View components
│   └── tablePoliciesUtils/- Utility functions for policies
├── Help/                  - Help/documentation screen
├── Nodes/                 - Cluster node management
├── Overview/              - Cluster overview dashboard
├── SQLConsole/            - Interactive SQL console
├── Tables/                - Table browser
├── TablesShards/          - Shard distribution view
└── Users/                 - User and role management
```

**`src/components/`** — Shared UI primitives
```
components/
├── Button/
├── Card/
├── DataTable/
├── SQLEditor/             - CodeMirror-based SQL editor with localStorage history
├── SQLResults/            - Result display with JSON tree, type-aware values
├── Layout/                - App shell layout
├── StatusBar/             - Connection status display
├── ClusterHealthManager/  - Background health polling
├── NotificationHandler/   - Toast notifications
├── Form/                  - Form primitives
└── ... (~40 total)
```

**`src/hooks/`** — Shared custom hooks
```
hooks/
├── useGcApi.ts            - Axios instance factory with JWT auth
├── useExecuteSql.ts       - Execute SQL against CrateDB
├── useExecuteMultiSql.ts  - Execute multiple SQL statements
├── useApiCall.ts          - Generic API call wrapper
├── queryHooks.ts          - SWR-based query hooks
├── swrHooks.ts            - Additional SWR hooks
└── __test__/              - Hook test files
```

**`src/swr/`** — SWR data hooks (cluster data)
```
swr/
├── jwt/                   - JWT-related SWR hooks
├── useClusterInfo.ts
├── useClusterNodeStatus.ts
├── useTables.ts
├── useShards.ts
├── useSchemaTree.ts
└── ... (domain-specific hooks)
```

**`src/state/`** — Zustand global stores
```
state/
├── jwtManager.ts          - Auth: token, GC URL, connection status
├── session.ts             - UI: notifications, display prefs
└── clusterHealth.ts       - Cluster health state
```

**`src/constants/`** — App-wide constants
```
constants/
├── routes.ts              - Route definitions and component assignments
├── navigation.ts          - Nav menu structure
├── paths.ts               - Route path builders
├── queries.ts             - SQL query constants
└── defaults.ts            - Default values
```

**`src/utils/`** — Pure utility functions
```
utils/
├── api.ts                 - HTTP request wrappers (apiGet/Post/Put/Delete)
├── strings.ts             - String helpers
├── bytes.ts               - Byte formatting
├── compare.ts             - Comparison utilities
└── cn.ts                  - classname helper (clsx wrapper)
```

**`src/types/`** — Shared TypeScript types
```
types/
├── index.ts               - Core types (ConnectionStatus, ApiError, ApiOutput)
└── policies/              - Table policy type definitions
```

**`test/`** — Test infrastructure
```
test/
├── setup.ts               - Jest global setup (MSW, polyfills)
├── testUtils/
│   └── renderWithTestWrapper.tsx - Custom render with SWR provider
├── msw/
│   ├── server.ts          - MSW server instance
│   └── handlers/          - HTTP mock handlers per endpoint
└── screen.ts              - Extended Testing Library screen
```

## Naming Conventions

- **Route directories:** PascalCase (e.g., `SQLConsole`, `TablesShards`)
- **Component files:** PascalCase matching directory (e.g., `Card/Card.tsx`)
- **Hook files:** camelCase with `use` prefix (e.g., `useExecuteSql.ts`)
- **Utility files:** camelCase (e.g., `sqlFormatter.ts`, `strings.ts`)
- **Type files:** camelCase (e.g., `index.ts`)
- **Test files:** `*.test.tsx` or `*.test.ts`, co-located with source
- **Barrel exports:** Each component/module directory has `index.ts`

## Module Boundaries

- Routes are self-contained; they import from shared components/hooks but not from each other
- Shared components do not import from routes
- Hooks import from state stores and utils but not from routes or shared components
- State stores are pure Zustand; no UI imports
- Utils are pure functions; no React/hooks
