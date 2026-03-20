import React from 'react';
import { ConnectionStatus } from 'types';

export type BurgerProps = {
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
  logo: React.JSX.Element;
};

export type LayoutProps = {
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  topbarLogo: React.JSX.Element;
  topbarContent: React.JSX.Element;
  children: React.JSX.Element;
};

export type NavigationProps = {
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
};

export type NavigationLinkProps = {
  icon: React.JSX.Element;
  label: React.JSX.Element;
  path: string;
  type: 'internal' | 'external';
};

export type TopBarProps = {
  logo: React.JSX.Element;
  content: React.JSX.Element;
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
};
