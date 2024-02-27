import { PropsWithChildren } from 'react';
import { cn } from 'utils';

export type ChipProps = {
  className?: string;
};

export default function Chip({
  children,
  className = '',
}: PropsWithChildren<ChipProps>) {
  return (
    <span
      className={cn(
        `inline-flex items-center rounded-md bg-gray-100 p-1 text-[8px] uppercase !leading-3 text-black`,
        className,
      )}
    >
      {children}
    </span>
  );
}
