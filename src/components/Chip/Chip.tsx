import { LoadingOutlined } from '@ant-design/icons';
import { PropsWithChildren } from 'react';
import { cn } from 'utils';
import {
  AVAILABLE_CHIP_COLORS,
  AVAILABLE_CHIP_ICONS,
  COLOR_STYLES_MAP,
} from './ChipConstants';

export type ChipProps = PropsWithChildren<{
  className?: string;
  color?: keyof typeof AVAILABLE_CHIP_COLORS;
  icon?: keyof typeof AVAILABLE_CHIP_ICONS;
}>;

export default function Chip({
  children,
  className = '',
  color = AVAILABLE_CHIP_COLORS.BLUE,
  icon,
}: ChipProps) {
  return (
    <span
      className={cn(
        `inline-flex h-5 items-center gap-1.5 rounded px-3 py-1 text-[10px] font-semibold uppercase !leading-3`,
        COLOR_STYLES_MAP[color],
        className,
      )}
    >
      {icon === AVAILABLE_CHIP_ICONS.SPINNER && (
        <LoadingOutlined spin data-testid="chip-spinner-icon" />
      )}
      {children}
    </span>
  );
}

Chip.colors = AVAILABLE_CHIP_COLORS;
Chip.icons = AVAILABLE_CHIP_ICONS;
