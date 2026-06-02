const SUPPRESSED_ERROR_PATTERNS = [
  'was not wrapped in act(',
  'trigger element and popup element should in same shadow root',
];

function shouldSuppressConsoleError(args: unknown[]): boolean {
  const first = args[0];
  return (
    typeof first === 'string' &&
    SUPPRESSED_ERROR_PATTERNS.some(pattern => first.includes(pattern))
  );
}

const nativeConsoleError = console.error.bind(console);

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (shouldSuppressConsoleError(args)) {
      return;
    }
    nativeConsoleError(...args);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});
