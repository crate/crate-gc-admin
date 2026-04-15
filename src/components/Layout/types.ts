import React from 'react';
import { ConnectionStatus } from 'types';

export type BurgerProps = {
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
  logo: React.ReactElement;
};

export type LayoutProps = {
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  topbarLogo: React.ReactElement;
  topbarContent: React.ReactElement;
  children: React.ReactElement;
};

export type NavigationProps = {
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
};

export type NavigationLinkProps = {
  icon: React.ReactElement;
  label: React.ReactElement;
  path: string;
  type: 'internal' | 'external';
};

export type TopBarProps = {
  logo: React.ReactElement;
  content: React.ReactElement;
  navIsExpanded: boolean;
  setNavIsExpanded: (navIsExpanded: boolean) => void;
  bottomNavigation: NavigationLinkProps[];
  topNavigation: NavigationLinkProps[];
  gcStatus?: ConnectionStatus;
};
