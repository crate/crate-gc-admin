function noop() {}

const location = {
  hash: 'foo',
  key: 'bar',
  pathname: 'baz',
  search: 'quux',
  state: 'waz',
};
type Location = typeof location;

const mockRouter = {
  location,
  history: {
    push: noop,
    action: 'PUSH',
    block: noop,
    canGo: noop,
    createHref: noop,
    entries: [location],
    go: noop,
    goBack: noop,
    goForward: noop,
    index: 1,
    length: 1,
    listen: noop,
    location,
    replace: noop,
  },
  match: {
    path: 'organisation/organization-1',
    params: {
      organizationId: 'organization-1',
      projectId: 'project-1',
    },
    url: 'http://localhost:8000',
    isExact: true,
  },
};

type Match = typeof mockRouter.match;
type History = typeof mockRouter.history;

export const createLocationMock = (props: Partial<Location>) => ({
  ...mockRouter.location,
  ...props,
});

export const createMatchMock = (params: Partial<Match>) => ({
  ...mockRouter.match,
  params,
});

export const createHistoryMock = (push: Partial<History>) => ({
  ...mockRouter.history,
  push,
});

export const createRouterMock = ({
  params = {},
  pathname = '',
  search = '',
  push = jest.fn(),
} = {}) => ({
  history: createHistoryMock(push),
  location: createLocationMock({ pathname, search }),
  match: createMatchMock(params),
});
