const actWithFakeTimers = (action: () => void) => {
  vi.useFakeTimers();
  try {
    action();
    vi.runAllTimers();
  } finally {
    vi.useRealTimers();
  }
};

export default actWithFakeTimers;
