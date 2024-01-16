// this is in use but will not have any effect
// until the global console override is
// removed from test/setup.js
const disableConsole = (...args: ('warn' | 'error')[]) =>
  args.forEach(method => jest.spyOn(console, method).mockImplementation(() => {}));

export default disableConsole;
