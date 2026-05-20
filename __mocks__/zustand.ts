// __mocks__/zustand.ts
import type * as Zustand from 'zustand';

// Holds reset functions for all stores created in the app
export const storeResetFns = new Set<() => void>();

const createUncurried = <T>(
  stateCreator: Zustand.StateCreator<T>,
  actualCreate: typeof Zustand.create,
) => {
  const store = actualCreate(stateCreator);
  const initialState = store.getInitialState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

const createStoreUncurried = <T>(
  stateCreator: Zustand.StateCreator<T>,
  actualCreateStore: typeof Zustand.createStore,
) => {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getInitialState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// Async factory — invoked by vi.mock('zustand', async () => { ... }) in test/setup.ts.
// vi.importActual returns a Promise (unlike the old sync API).
export default async () => {
  const actual = await vi.importActual<typeof Zustand>('zustand');

  const create = (<T>(stateCreator: Zustand.StateCreator<T>) =>
    typeof stateCreator === 'function'
      ? createUncurried(stateCreator, actual.create)
      : createUncurried) as typeof Zustand.create;

  const createStore = (<T>(stateCreator: Zustand.StateCreator<T>) =>
    typeof stateCreator === 'function'
      ? createStoreUncurried(stateCreator, actual.createStore)
      : createStoreUncurried) as typeof Zustand.createStore;

  return { ...actual, create, createStore };
};
