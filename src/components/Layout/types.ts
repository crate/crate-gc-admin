import { ConnectionStatus } from 'types';

export type BurgerProps = {
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
  logo: JSX.Element;
};

export type LayoutProps = {
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  topbarLogo: JSX.Element;
  topbarContent: JSX.Element;
  children: JSX.Element;
};

export type NavigationProps = {
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
};

export type NavigationLinkProps = {
  icon: JSX.Element;
  label: JSX.Element;
  path: string;
  type: 'internal' | 'external';
};

export type TopBarProps = {
  logo: JSX.Element;
  content: JSX.Element;
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
};
