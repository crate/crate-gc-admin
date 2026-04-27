# Testing Patterns

**Analysis Date:** 2026-04-23

## Test Framework

**Runner:**
- Jest v29.7.0
- Config: `jest.config.js`

**Assertion Library:**
- Testing Library React v16.0.0
- @testing-library/jest-dom v6.9.1

**Run Commands:**
```bash
yarn test              # Run all tests
yarn test --watch     # Watch mode
```

## Test File Organization

**Location:**
- Co-located with source files
- Same directory as component/hook being tested

**Naming:**
- Pattern: `FileName.test.tsx` or `FileName.test.ts`
- Examples: `Card.test.tsx`, `useExecuteSql.test.tsx`

**Directory Structure:**
```
src/
├── components/Card/
│   ├── Card.tsx
│   ├── Card.test.tsx
│   └── index.ts
├── hooks/__test__/
│   ├── useExecuteSql.test.tsx
│   └── useExecuteMultiSql.test.tsx
```

## Test Structure

**Suite Organization from `src/components/Card/Card.test.tsx`:**
```typescript
describe('The Card component', () => {
  describe('displaying the title and childnodes', () => {
    it('displays the card title if a title is given in the props', () => {
      setup();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('when it is clickable', () => {
    it('renders the card as a button', () => {
      setup({ onClick: onClickSpy });
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

**Setup Pattern:**
- `setup()` helper function with default props
- Props can be overridden per test
- Helpers return render result with `user` and `container`

**Teardown Pattern:**
```typescript
afterEach(() => {
  onClickSpy.mockClear();
  jest.clearAllMocks();
  server.resetHandlers();
});
```

## Test Utilities

**Custom Render Function (`test/testUtils/renderWithTestWrapper.tsx`):**
- Wraps UI in test providers (SWRConfig)
- Returns `{ user: UserEvent, container }`
- Configures fetcher and SWR provider
- Usage: `const { user } = render(<Component />)`

**Custom Screen Utility:**
- Re-exports Testing Library screen
- Adds custom `getByName(name: string)` method
- Example: `screen.getByName('fieldName')`

**Test Wrapper Providers:**
```typescript
const TestWrapper = ({ children }) => (
  <main>
    <SWRConfig value={{ fetcher, provider, isVisible }}>
      {children}
    </SWRConfig>
  </main>
);
```

## Mocking

**Framework:** Mock Service Worker (MSW) v2.12.7

**Server Setup (`test/msw/server.ts`):**
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export default setupServer(...handlers);
```

**Global Setup (`test/setup.ts`):**
- Initializes MSW server for all tests
- Resets handlers after each test
- Closes server after all tests
- Sets up Ant Design compatibility for React 19
- Polyfills: `window.matchMedia`, `ResizeObserver`, `localStorage`

**Request Spying Pattern (`src/hooks/__test__/useExecuteSql.test.tsx`):**
```typescript
const executeQuerySpy = getRequestSpy('POST', 'api/_sql');
setup();
await waitForResults();
expect(executeQuerySpy).toHaveBeenCalled();
```

**What to Mock:**
- HTTP requests (via MSW handlers)
- External API calls
- Browser APIs (matchMedia, ResizeObserver)
- localStorage
- Window methods (open, scrollTo)

**What NOT to Mock:**
- React components under test
- React hooks utilities
- User interactions (use userEvent instead)
- DOM APIs (leverage Testing Library)

## Fixtures and Factories

**Test Data Pattern:**
```typescript
const defaultProps: CardProps = {
  title: 'Title',
  disabled: false,
  children: <div>Children</div>,
  active: false,
};

const setup = (props: Partial<CardProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<Card {...combinedProps} />);
};
```

**Mock Component Pattern:**
```typescript
function MockComponent() {
  const executeSql = useExecuteSql();
  const [response, setResponse] = useState<ExecuteSqlResult | null>(null);

  useEffect(() => {
    executeSql('SELECT 1').then(queryRes => setResponse(queryRes));
  }, []);

  return <div data-testid="status">{response?.status}</div>;
}
```

**Location:**
- Test fixtures defined in test files
- Factories (if needed) in `test/` directory
- MSW handlers in `test/msw/handlers/`

## Coverage

**Requirements:** 80% coverage threshold
```
global: {
  branches: 80,
  functions: 80,
  lines: 80,
  statements: 80,
}
```

**Excluded from Coverage:**
- `src/index.js`
- `src/index.ts`
- `src/lib.ts`

**View Coverage:**
```bash
yarn test --coverage
```

## Test Types

**Unit Tests:**
- Scope: Single component or hook
- Approach: Test props, state changes, event handlers
- Example: `Card.test.tsx` tests component rendering with different props

**Integration Tests:**
- Scope: Multiple components or hook with API calls
- Approach: Mock API with MSW, test full data flow
- Example: `useExecuteSql.test.tsx` tests hook with mocked SQL endpoint
- Uses `getRequestSpy` to verify API calls

**E2E Tests:**
- Status: Not used
- Framework: None configured

## Common Patterns

**Async Testing with Hooks:**
```typescript
function MockComponent() {
  const executeSql = useExecuteSql();

  useEffect(() => {
    executeSql('SELECT 1').then(queryRes => {
      setResponse(queryRes);
    });
  }, []);

  return <div>{response?.data}</div>;
}

const setup = () => render(<MockComponent />);
const waitForResults = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('status')).toBeInTheDocument();
  });
};

test('executes the query', async () => {
  setup();
  await waitForResults();
  expect(screen.getByTestId('data')).toBeInTheDocument();
});
```

**User Interaction Testing:**
```typescript
it('calls onClick when clicked', async () => {
  const { user } = setup({ onClick: onClickSpy });
  await user.click(screen.getByRole('button'));
  expect(onClickSpy).toHaveBeenCalled();
});
```

**Error Testing:**
- Errors tested via MSW handler overrides
- Update handler response in test to trigger error state
- Assert error message or status displayed

**Accessibility Testing:**
- Uses semantic queries: `getByRole`, `getByLabelText`
- Tests ARIA attributes: `aria-pressed`, `data-testid`
- Example in `Card.test.tsx`: `expect(screen.getByRole('button')).toHaveAttribute('aria-pressed')`

## Test Environment

**Environment:** jest-fixed-jsdom v0.0.11
- Provides JSDOM with custom export conditions
- Allows testing React DOM components

**Module Transformation:**
- Uses `ts-jest` with TypeScript compilation
- Special handling for `until-async` package
- CSS imports mapped to identity-obj-proxy
- SVG/PNG imports mapped to empty module

---

*Testing analysis: 2026-04-23*
