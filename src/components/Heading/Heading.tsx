import React from 'react';
import { HEADING_LEVELS } from './HeadingConstants';
import { ValueOf } from 'types/utils';
import { cn } from 'utils';

type HeadingLevel = ValueOf<typeof HEADING_LEVELS>;
export type HeadingProps = {
  className?: string;
  level: HeadingLevel;
  displayAs?: HeadingLevel;
  light?: boolean;
  ariaLabel?: React.AriaAttributes['aria-label'];
  id?: string;
  children: React.ReactNode;
};

function Heading({
  className = '',
  children,
  level,
  displayAs,
  light,
  ariaLabel,
  id,
}: HeadingProps) {
  const displayLevel = displayAs || level;

  const classExtensions = {
    [HEADING_LEVELS.h1]: 'text-3xl',
    [HEADING_LEVELS.h2]: 'text-xl',
    [HEADING_LEVELS.h3]: 'text-lg',
    [HEADING_LEVELS.h4]: 'text-base',
    [HEADING_LEVELS.h5]: 'text-sm',
    [HEADING_LEVELS.h6]: 'text-sm',
  };
  const headingClasses = cn(
    { 'font-normal': light, 'font-bold': !light },
    classExtensions[displayLevel],
    className,
  );

  return React.createElement(
    level,
    {
      className: headingClasses,
      'aria-label': ariaLabel,
      id,
    },
    children,
  );
}

Heading.levels = HEADING_LEVELS;

export default Heading;
