# Coding Conventions

**Analysis Date:** 2026-04-23

## Language & Style

**TypeScript Configuration:**
- Target: `ES2020`
- Module: `ESNext`
- Strict mode enabled: `true`
- `noUnusedLocals`: enabled
- `noUnusedParameters`: enabled
- `noFallthroughCasesInSwitch`: enabled
- JSX: `react-jsx`

**Formatter:** Prettier v3.8.1
- Print width: 85 characters
- Tab width: 2 spaces
- Single quotes: `true`
- Trailing commas: `all`
- Arrow functions: avoid parentheses when possible
- Plugins: `prettier-plugin-tailwindcss`, `prettier-plugin-sort-imports`

**Linter:** ESLint v9.39.4
- Config extends: `react-app`, `react-app/jest`
- Additional plugins: `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`
- Cache enabled: `true`

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Card.tsx`, `CopyToClipboard.tsx`)
- Utilities: camelCase (e.g., `sqlFormatter.ts`, `strings.ts`)
- Constants: camelCase or SCREAMING_SNAKE_CASE for exported constants (e.g., `SHORT_MESSAGE_NOTIFICATION_DURATION`)
- Types/Interfaces: PascalCase (e.g., `ApiError<T>`, `CardProps`)
- Test files: Same name with `.test.tsx` or `.test.ts` suffix (e.g., `Card.test.tsx`)

**Variables:**
- camelCase for all variable declarations
- const preferred over let/var

**Functions:**
- camelCase naming convention
- Hook functions prefixed with `use`: `useApiCall`, `useExecuteSql`, `useGCGetScheduledJobs`
- Handler functions prefixed with `handle`: `handleApiResponse`, `handleClickHandler`

**Types and Interfaces:**
- PascalCase with suffix descriptors
- Props types suffixed with `Props`: `CardProps`, `CopyToClipboardProps`
- API types: `ApiError<T>`, `ApiOutput<T>`

**Constants:**
- SCREAMING_SNAKE_CASE for exported constants
- Located in `src/constants/` directory organized by domain (e.g., `defaults.ts`, `queries.ts`)

## Import Organization

**Order (enforced by prettier-plugin-sort-imports):**
1. NPM packages (external dependencies)
2. Local imports (values)
3. Local imports (types)

**Path Aliases (from tsconfig.json):**
- `components/*` → `./src/components/*`
- `constants/*` → `./src/constants/*`
- `contexts/*` → `./src/contexts/*`
- `hooks/*` → `./src/hooks/*`
- `routes/*` → `./src/routes/*`
- `state/*` → `./src/state/*`
- `types/*` → `./src/types/*`
- `utils/*` → `./src/utils/*`
- `__mocks__/*` → `./__mocks__/*`

Absolute imports preferred over relative paths.

## Code Organization

**Component Structure:**
- Component function declared as named function, not arrow function
- Props type exported above component
- Default export at end of file: `export default ComponentName`
- Each component in its own directory with test file co-located

**Example from `src/components/Card/Card.tsx`:**
```typescript
export type CardProps = PropsWithChildren<{
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}>;

function Card({ active = false, children, disabled = false, onClick, title }: CardProps) {
  const cardClasses = cn(/* classes */);
  return <div className={cardClasses}>{children}</div>;
}

export default Card;
```

## Error Handling

**API Error Handling Pattern:**
- Try-catch wrapping async API calls in `src/utils/api.ts`
- Error object cast to `AxiosError<T>`: `const axiosError = e as AxiosError<T>`
- Standardized `ApiOutput<T>` response wrapper with `success`, `data`, `status` fields
- Status codes handled:
  - 404: "The requested resource was not found"
  - 5xx: "An error occurred while accessing the server. Please try again later."
  - 4xx with message field: Display message from response

**Notification System:**
- Errors auto-dispatched via `useSessionStore.getState().setNotification()`
- Optional `notification` parameter to suppress notifications
- Example in `src/utils/api.ts`

**Hook Pattern:**
- Hooks return objects with `{ data, loading }` or `{ success, data, status }`
- Caller responsible for checking `success` flag before using data

## Comments & Documentation

**When to Comment:**
- Code is self-documenting; comments sparse but meaningful
- Comments explain "why", not "what"
- Section markers used in constants files for organization

**JSDoc/TSDoc:**
- Not heavily used
- Type system provides inline documentation
- Function signatures are explicit and self-describing

## Function Design

**Size:**
- Small, focused functions preferred
- Hooks typically 10-30 lines
- Utility functions tightly scoped

**Parameters:**
- Props typed via named interfaces
- Destructuring in function signatures
- Default values used in destructuring

**Return Values:**
- Async functions return `Promise<Type>`
- API calls return `ApiOutput<T>` wrapper
- React hooks return objects with named properties
- Explicit `null` returns when data unavailable

## Module Design

**Exports:**
- Named exports for utilities and hooks: `export const functionName`
- Default exports for React components
- Types always exported as named exports
- Barrel files in `index.ts` for convenience

**Utility Organization (`src/utils/`):**
- `api.ts`: API request utilities with error handling
- `strings.ts`: String manipulation helpers
- `bytes.ts`: Byte formatting
- `compare.ts`: Comparison logic
- `cn.ts`: classname utilities (clsx wrapper)

---

*Convention analysis: 2026-04-23*
