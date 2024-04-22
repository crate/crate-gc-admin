export const AVAILABLE_CHIP_COLORS = {
  GRAY: 'GRAY',
  BLUE: 'BLUE',
  ORANGE: 'ORANGE',
  RED: 'RED',
  GREEN: 'GREEN',
} as const;

export const COLOR_STYLES_MAP: {
  [key in keyof typeof AVAILABLE_CHIP_COLORS]: string;
} = {
  [AVAILABLE_CHIP_COLORS.GRAY]: 'bg-gray-100 text-black',
  [AVAILABLE_CHIP_COLORS.BLUE]: 'bg-crate-blue text-white',
  [AVAILABLE_CHIP_COLORS.ORANGE]: 'bg-orange-400 text-white',
  [AVAILABLE_CHIP_COLORS.RED]: 'bg-red-600 text-white',
  [AVAILABLE_CHIP_COLORS.GREEN]: 'bg-green-600 text-white',
} as const;
