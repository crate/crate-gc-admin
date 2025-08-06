const createLocationTestingUtility = () => {
  const originalLocation = window.location;

  function setLocation(testLocationProperties: Partial<Location>) {
    // Create a proper Location-like object
    const mockLocation = {
      ...originalLocation,
      ...testLocationProperties,
    } as Location;

    // Use Object.defineProperty to properly replace the location
    Object.defineProperty(global.window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });
  }

  return {
    setupLocation: (testLocationProperties: Partial<Location>) =>
      setLocation(testLocationProperties),
    tearDownLocation: () => {
      Object.defineProperty(global.window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    },
  };
};

export default createLocationTestingUtility;
