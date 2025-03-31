export const Colors = {
  blue: {
    50: '#F1F6F8',
    100: '#E4F4FA',
    150: '#D9EDF5',
    200: '#D2EDF7',
    300: '#BCE4F4',
    400: '#A6DBF0',
    500: '#8FD2EC',
    525: '#79C9E8', // Base level
    550: '#70B8D5',
    600: '#65A8C1',
    700: '#51869B',
    800: '#3D6574',
    900: '#28434D',
    1000: '#18282E',
    1100: '#0F1B1F',
  },
  green: {
    100: '#DBF6E6',
    200: '#C3F0D5',
    300: '#A6E9C1',
    400: '#88E1AC',
    500: '#6ADA97',
    550: '#4CD282', // Base level
    600: '#3FAF6C',
    700: '#338C57',
    800: '#266941',
    900: '#19462B',
    1000: '#0f2A1A',
  },
  purple: {
    100: '#F2EBFB',
    200: '#E9DDF9',
    300: '#DECCF5',
    400: '#D4BCF2',
    500: '#C9ABEF',
    550: '#BE9AEC', // Base level
    600: '#9E80C5',
    700: '#7F679D',
    800: '#5F4D76',
    900: '#3F334F',
    1000: '#261F2F',
  },
  yellow: {
    100: '#FFFCE1',
    200: '#FEFACC',
    300: '#FEF7B3',
    400: '#FEF49A',
    500: '#FDF280',
    550: '#FDEF67', // Base level
    600: '#D3C756',
    700: '#A99F45',
    800: '#7F7834',
    900: '#545022',
    1000: '#333015',
  },
  orange: {
    100: '#FFE4D9',
    200: '#FFD3BF',
    300: '#FFBC9F',
    400: '#FFA680',
    500: '#FF9060',
    550: '#FF7A40', // Base level
    600: '#D46635',
    700: '#AA512B',
    800: '#803D20',
    900: '#552915',
    1000: '#33180D',
  },
  grey: {
    0: '#FFFFFF',
    100: '#FFFDFD',
    200: '#E0D9D6',
    300: '#9BA1A3',
    400: '#6F7679',
    500: '#FFFFFF20',
    600: '#FFFFFF50',
  },
};

export const lightColors = {
  background: '#FFFFFF',
  text: Colors.blue[1100],
};

export const darkColors = {
  background: Colors.blue[1100],
  text: '#F3F2ED',
};

export type ColorScheme = typeof lightColors;
