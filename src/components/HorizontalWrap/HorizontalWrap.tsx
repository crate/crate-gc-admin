import { PropsWithChildren } from 'react';
import { cn } from 'utils';

type HorizontalWrapProps = PropsWithChildren<{
  className?: string;
}>;

const HorizontalWrap = ({ className, children }: HorizontalWrapProps) => {
  return <div className={cn('flex flex-wrap', className)}>{children}</div>;
};

export default HorizontalWrap;
