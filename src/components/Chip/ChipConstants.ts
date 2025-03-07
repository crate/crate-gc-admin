export const AVAILABLE_CHIP_COLORS = {
  GRAY: 'GRAY',
  BLUE: 'BLUE',
  ORANGE: 'ORANGE',
  RED: 'RED',
  GREEN: 'GREEN',
} as const;
type AvailableChipColorsKeys = keyof typeof AVAILABLE_CHIP_COLORS;

export const COLOR_STYLES_MAP: {
  [key in AvailableChipColorsKeys]: string;
} = {
  [AVAILABLE_CHIP_COLORS.GRAY]: 'bg-gray-300 text-black',
  [AVAILABLE_CHIP_COLORS.BLUE]: 'bg-crate-blue text-white',
  [AVAILABLE_CHIP_COLORS.ORANGE]: 'bg-orange-400 text-white',
  [AVAILABLE_CHIP_COLORS.RED]: 'bg-red-600 text-white',
  [AVAILABLE_CHIP_COLORS.GREEN]: 'bg-green-600 text-white',
} as const;

export const AVAILABLE_CHIP_ICONS = {
  SPINNER: 'SPINNER',
} as const;

export type ICON_STYLES_MAP = keyof typeof AVAILABLE_CHIP_ICONS;
