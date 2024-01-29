import { PropsWithChildren } from 'react';
import cn from '../../utils/cn';

export type RoundedIconProps = {
  className?: string;
  testId?: string;
};

export default function RoundedIcon({
  children,
  className = '',
  testId,
}: PropsWithChildren<RoundedIconProps>) {
  return (
    <i
      className={cn(
        'text-white',
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-gray-500',
        className,
      )}
      data-testid={testId}
    >
      {children}
    </i>
  );
}
