import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Custom color palette for your skin check app
const customColors = {
  primary: '#6200EE',
  primaryContainer: '#BB86FC',
  secondary: '#03DAC6',
  secondaryContainer: '#018786',
  tertiary: '#FF5722',
  tertiaryContainer: '#FF8A65',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  background: '#FAFAFA',
  error: '#B00020',
  errorContainer: '#F9DEDC',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#21005D',
  onSecondary: '#000000',
  onSecondaryContainer: '#002020',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#2C0800',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  onError: '#FFFFFF',
  onErrorContainer: '#410E0B',
  onBackground: '#1C1B1F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
};

const customDarkColors = {
  primary: '#D0BCFF',
  primaryContainer: '#4F378B',
  secondary: '#4FD3BC',
  secondaryContainer: '#004D40',
  tertiary: '#FF8A65',
  tertiaryContainer: '#D84315',
  surface: '#121212',
  surfaceVariant: '#1E1E1E',
  background: '#121212',
  error: '#CF6679',
  errorContainer: '#93000A',
  onPrimary: '#21005D',
  onPrimaryContainer: '#EADDFF',
  onSecondary: '#003B32',
  onSecondaryContainer: '#70F2D9',
  onTertiary: '#2C0800',
  onTertiaryContainer: '#FFDBCF',
  onSurface: '#E6E1E5',
  onSurfaceVariant: '#CAC4D0',
  onError: '#690005',
  onErrorContainer: '#FFDAD6',
  onBackground: '#E6E1E5',
  outline: '#938F99',
  outlineVariant: '#49454F',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750A4',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customDarkColors,
  },
};

// Helper function to get theme based on color scheme
export const getTheme = (isDark: boolean) => isDark ? darkTheme : lightTheme;
