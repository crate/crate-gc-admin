import { act } from '@testing-library/react';

const actWithFakeTimers = (action: () => void) => {
  vi.useFakeTimers();
  try {
    act(() => {
      action();
      vi.runAllTimers();
    });
  } finally {
    vi.useRealTimers();
  }
};

export default actWithFakeTimers;
