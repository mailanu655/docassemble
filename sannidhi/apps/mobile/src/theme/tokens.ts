export const colors = {
  bg: '#FFFFFF',
  ink: '#16130F',
  ink2: '#4A443D',
  muted: '#7A736B',
  faint: '#9A938B',
  line: '#ECE8E3',
  soft: '#F6F4F1',
  saffron: '#D9480F',
  saffronTint: '#FFF1E8',
  green: '#2F9E44',
  greenTint: '#E6F4EA',
  amber: '#E8890C',
  amberText: '#B4610A',
  amberTint: '#FDF0DC',
  red: '#C92A2A',
  redTint: '#FDECEC',
} as const;

export const radius = { sm: 10, md: 14, lg: 16, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

/** Font family names registered in the root layout. */
export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type Weight = keyof typeof font;
