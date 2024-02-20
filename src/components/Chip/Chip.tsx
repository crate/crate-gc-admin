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
        `uppercase p-1 rounded-md text-[8px] bg-gray-100 text-black inline-flex items-center !leading-3`,
        className,
      )}
    >
      {children}
    </span>
  );
}
