const createLocationTestingUtility = () => {
  const originalLocation = window.location;

  function setLocation(
    testLocationProperties: Partial<typeof global.window.location>,
  ) {
    global.window ??= Object.create(window);
    global.window.location = {
      ...originalLocation,
      ...testLocationProperties,
    };
  }

  return {
    setupLocation: (
      testLocationProperties: Partial<typeof global.window.location>,
    ) => setLocation(testLocationProperties),
    tearDownLocation: () => setLocation(originalLocation),
  };
};

export default createLocationTestingUtility;
