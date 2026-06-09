const actWithFakeTimers = (action: () => void) => {
  jest.useFakeTimers();
  action();
  jest.runAllTimers();
};

export default actWithFakeTimers;
