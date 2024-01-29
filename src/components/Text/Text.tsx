import React from 'react';
import cx from 'classnames';
import { TEXT_ELEMENTS } from './TextConstants';
import { ValueOf } from '../../types/utils';

export type TextProps = {
  className?: string;
  displayAs?: ValueOf<typeof TEXT_ELEMENTS>;
  pale?: boolean;
  truncate?: boolean;
  children: React.ReactNode;
  id?: string;
  testId?: string;
};

function Text({
  className = '',
  displayAs = TEXT_ELEMENTS.DIV,
  pale = false,
  truncate = false,
  children,
  id,
  testId,
}: TextProps) {
  const textClasses = cx(
    'text-sm leading-5 tracking-wide',
    { 'text-neutral-500': pale, truncate },
    className,
  );

  return React.createElement(
    displayAs,
    {
      className: textClasses,
      id,
      'data-testid': testId,
    },
    children,
  );
}

Text.elements = TEXT_ELEMENTS;

export default Text;
