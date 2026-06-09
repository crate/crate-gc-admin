import React, { PropsWithChildren } from 'react';
import type { Mock } from 'vitest';

export const navigateMock: Mock = vi.fn();

export const useLocation: Mock = vi.fn();
export const useRouteMatch: Mock = vi.fn();
export const useNavigate = (): Mock => navigateMock;
export const useParams: Mock = vi.fn();
export const withRouter = (children: React.ReactNode) => children;
export const Route = ({
  path = 'index',
  element,
}: {
  element: React.ReactNode;
  path?: string;
}) => (
  <div>
    <div data-testid={`${path}_path`}>{element}</div>
  </div>
);
export const Link = ({ children, to }: PropsWithChildren<{ to: string }>) => (
  <a href={to}>{children}</a>
);
export const NavLink = ({ children }: PropsWithChildren) => <div>{children}</div>;
export const BrowserRouter = ({ children }: PropsWithChildren) => (
  <div>{children}</div>
);
export const Redirect = ({ children }: PropsWithChildren) => <div>{children}</div>;
export const Routes = ({ children }: PropsWithChildren) => <div>{children}</div>;
