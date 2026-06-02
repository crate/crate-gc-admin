// Vitest does NOT auto-apply __mocks__/ for node_modules without explicit vi.mock() calls.
vi.mock('react-router-dom');
vi.mock('react-ace');
vi.mock('react-syntax-highlighter');
vi.mock('react-resizable-panels');
vi.mock('ace-builds');

// Register zustand mock globally (replaces Jest auto-hoisting).
vi.mock('zustand', async () => {
  const factory = (await import('../__mocks__/zustand')).default;
  return factory();
});
