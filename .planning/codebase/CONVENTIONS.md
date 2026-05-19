# Coding Conventions

**Analysis Date:** 2026-05-19

## Naming Patterns

**Files:**
- React components: PascalCase filename matching the component name — `Button.tsx`, `CardHeader.tsx`
- Component constants: PascalCase with `Constants` suffix — `ButtonConstants.ts`, `ChipConstants.ts`
- Custom hooks: camelCase with `use` prefix — `useButtonStyles.ts`, `useExecuteSql.ts`
- Utility modules: camelCase, topic-scoped — `sorting.ts`, `sqlFormatter.ts`, `statusChecks.ts`
- Test files: same name as subject file with `.test.tsx` suffix — `Button.test.tsx`
- Type files: camelCase — `api.ts`, `query.ts`, `utils.ts` under `src/types/`

**Directories:**
- Component directories: PascalCase matching component name — `src/components/Button/`, `src/components/DataTable/`
- Route directories: PascalCase, matches feature area — `src/routes/Automation/`, `src/routes/Nodes/`
- Sub-route groups: `routes/` and `views/` subdirectories within route features
- Hook tests: `__test__/` subdirectory inside `src/hooks/`

**Components:**
- PascalCase: `Button`, `ClusterHealthManager`, `GCSpin`
- Prefix `GC` for app-level global components: `GCSpin`, `GCChart`, `GCStatusIndicator`
- Props types: named `[ComponentName]Props` and exported — `export type ButtonProps = ...`

**Functions:**
- camelCase for all utility functions — `sortByString`, `cronParser`, `apiGet`
- Constants: SCREAMING_SNAKE_CASE — `BUTTON_KINDS`, `DATE_FORMAT`, `JOBS_TABLE_PAGE_SIZE`
- SWR hook exports: `useGC[ResourceName]` pattern — `useGCGetScheduledJobs`, `useGCGetScheduledJob`

**Variables:**
- camelCase throughout
- Boolean flags use descriptive adjectives — `disabled`, `loading`, `active`, `enabled`
- Enum-style const objects use SCREAMING_SNAKE_CASE keys — `BUTTON_KINDS.PRIMARY`, `Heading.levels.h3`

**Types:**
- `type` keyword preferred over `interface` for component props
- Exported types named `[ComponentName]Props` for component props
- `ValueOf<T>` utility type used to derive union types from const objects — `src/types/utils.ts`

## Code Style

**Formatting:**
- Tool: Prettier 3.x with `prettier-plugin-sort-imports` and `prettier-plugin-tailwindcss`
- Config: `.prettierrc.yaml`
- `printWidth`: 85
- `tabWidth`: 2 spaces
- `singleQuote`: true
- `trailingComma`: 'all'
- `bracketSpacing`: true
- `arrowParens`: 'avoid' (omit parens for single-argument arrow functions)
- `stripNewlines`: true

**Linting:**
- Tool: ESLint 9.x flat config (`eslint.config.mjs`)
- Extends: `eslint:recommended`, `@typescript-eslint/recommended`, Prettier integration
- Plugins: `@typescript-eslint`, `react`, `react-hooks`, `prettier`
- Formatting errors surfaced as ESLint errors (via `eslint-plugin-prettier`)
- Key rules disabled: `react/destructuring-assignment`, `import/no-cycle`, `react/forbid-prop-types`, `react/jsx-filename-extension`
- Run lint: `yarn lint` (targets `src/` with `--ext=.ts --ext=.tsx`)

## TypeScript Strictness

**Config:** `tsconfig.json`
- `strict: true` — enables all strict type checks
- `noUnusedLocals: true` — unused local variables are errors
- `noUnusedParameters: true` — unused function parameters are errors
- `noFallthroughCasesInSwitch: true` — switch fallthrough is an error
- `target`: ES2020
- `module`: ESNext
- `isolatedModules: true`

**Path Aliases (tsconfig paths):**
- `components` → `./src/components`
- `components/*` → `./src/components/*`
- `constants/*` → `./src/constants/*`
- `contexts` / `contexts/*` → `./src/contexts/*`
- `hooks` / `hooks/*` → `./src/hooks/*`
- `routes` / `routes/*` → `./src/routes/*`
- `state` / `state/*` → `./src/state/*`
- `types` / `types/*` → `./src/types/*`
- `utils` / `utils/*` → `./src/utils/*`
- `__mocks__` / `__mocks__/*` → `./__mocks__/*`

Use these aliases in all imports — never use relative paths like `../../components`.

## Import Organization

**Order (enforced by `prettier-plugin-sort-imports`):**
1. NPM packages (external) — `import React from 'react'`
2. Local value imports — `import Button from 'components/Button'`
3. Local type imports — `import type { ButtonProps } from 'components/Button'`

**Example from `src/routes/Automation/views/JobsTable.tsx`:**
```typescript
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { automationCreateJob } from 'constants/paths';
import { cronParser, cn, apiDelete } from 'utils';
import { ColumnDef, Table } from '@tanstack/react-table';
import { Link, useNavigate } from 'react-router-dom';
import { Popconfirm } from 'antd';
import { useState } from 'react';
import { Text, Chip, DataTable } from 'components';
import { Job } from 'types';
```

Note: the prettier plugin auto-sorts within groups; imports are not manually grouped by comment.

## Component Patterns

**Always functional components** — no class components observed.

**Props type:** Declared as `type [ComponentName]Props = { ... }` and exported. For components accepting `children`, use `PropsWithChildren<{ ... }>`.

**Default exports:** All components use `export default function ComponentName(...)` or `export default ComponentName`.

**Named constants attached as properties:** Enum-like option sets are attached to the component function object after definition:
```typescript
Button.sizes = BUTTON_SIZES;
Button.kinds = BUTTON_KINDS;
Heading.levels = HEADING_LEVELS;
Chip.colors = AVAILABLE_CHIP_COLORS;
```

**Tailwind for styling:** All styles applied via Tailwind utility classes. The `cn()` utility from `src/utils/cn.ts` (wrapping `clsx` + `tailwind-merge`) is used to compose conditional class names:
```typescript
const cardClasses = cn('bg-white', 'rounded', { 'opacity-50': disabled }, className);
```

**Props destructuring:** Props are always destructured in the function signature, never accessed via a `props` variable.

**Barrel files:** Each component directory exposes a single `index.ts` that re-exports the default and named exports. `src/components/index.ts` is the root barrel for all shared components.

## Git Commit Style

Based on recent commit history:

- Short imperative subject line — `Add ref to Button`, `Fix bug where error trace data was not scrollable`
- PR references in parentheses for squash merges — `Expose ClusterHealthStore (#583)`
- Dependabot bumps prefixed with package name — `Bump msw from 2.12.7 to 2.13.6`
- Fix commits optionally prefixed with `fix:` — `fix: restore dist/style.css output after Vite 5→6 upgrade`
- No enforced conventional-commits standard; tone is informal and descriptive

## Project-Specific Patterns

**Constants objects instead of enums:**
```typescript
export const BUTTON_KINDS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
} as const;
export type ButtonKind = ValueOf<typeof BUTTON_KINDS>;
```
This pattern is used everywhere instead of TypeScript `enum`.

**`ValueOf<T>` type helper** (`src/types/utils.ts`): derives a union of value types from a `const` object.

**`cn()` utility** (`src/utils/cn.ts`): always use for conditional Tailwind class composition. Never concatenate class strings manually.

**SWR for data fetching:** All API data is fetched via SWR hooks (`src/hooks/swrHooks.ts`). Hook names follow `useGC[Resource][Action]`.

**Zustand for global state:** Three stores in `src/state/` — `clusterHealth.ts`, `jwtManager.ts`, `session.ts`. State is accessed via hooks; stores reset between tests via `__mocks__/zustand.ts`.

**GC API vs JWT API:** Two fetch paths exist. `useGcApi` fetches through the GC backend proxy (`/api/`). `useExecuteSql` / `useJWTManagerStore` fetch directly against CrateDB at `localhost:4200` using JWT auth.

---

*Convention analysis: 2026-05-19*
