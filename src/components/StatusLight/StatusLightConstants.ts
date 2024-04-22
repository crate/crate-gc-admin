export const AVAILABLE_LIGHT_COLORS = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
  GRAY: 'GRAY',
  BLUE: 'BLUE',
} as const;

export const COLOR_STYLES_MAP: {
  [key in keyof typeof AVAILABLE_LIGHT_COLORS]: string;
} = {
  [AVAILABLE_LIGHT_COLORS.GREEN]: 'fill-green-400',
  [AVAILABLE_LIGHT_COLORS.YELLOW]: 'fill-amber-400',
  [AVAILABLE_LIGHT_COLORS.RED]: 'fill-red-400',
  [AVAILABLE_LIGHT_COLORS.GRAY]: 'fill-neutral-400',
  [AVAILABLE_LIGHT_COLORS.BLUE]: 'fill-crate-blue',
} as const;
