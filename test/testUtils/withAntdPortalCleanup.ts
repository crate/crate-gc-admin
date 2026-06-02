import { flushAntdPortals } from './flushAntdPortals';

export function withAntdPortalCleanup() {
  afterEach(async () => {
    await flushAntdPortals();
  });
}
