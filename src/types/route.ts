import React from 'react';

export type Route = {
  path: string;
  element: React.JSX.Element;
  label: React.JSX.Element | string;
  key: string;
};
