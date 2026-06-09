const actWithFakeTimers = (action: () => void) => {
  vi.useFakeTimers();
  action();
  vi.runAllTimers();
};

export default actWithFakeTimers;
