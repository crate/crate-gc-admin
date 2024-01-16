import actWithFakeTimers from './actWithFakeTimers';
import disableConsole from './disableConsole';

export { actWithFakeTimers, disableConsole };

// this prevents ant design forms async warnings
// appearing in the console during tests
global.ASYNC_VALIDATOR_NO_WARNING = 1;
