import { PropsWithChildren } from 'react';
import { cn } from 'utils';
import { AVAILABLE_CHIP_COLORS, COLOR_STYLES_MAP } from './ChipConstants';

export type ChipProps = PropsWithChildren<{
  color?: keyof typeof AVAILABLE_CHIP_COLORS;
  className?: string;
}>;

export default function Chip({
  children,
  className = '',
  color = AVAILABLE_CHIP_COLORS.BLUE,
}: ChipProps) {
  return (
    <span
      className={cn(
        `inline-flex items-center rounded-md p-1 text-[8px] uppercase !leading-3`,
        COLOR_STYLES_MAP[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

Chip.colors = AVAILABLE_CHIP_COLORS;
