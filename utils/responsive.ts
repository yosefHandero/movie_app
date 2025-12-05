import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const breakpoints = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const isMobile = SCREEN_WIDTH < breakpoints.md;
export const isTablet = SCREEN_WIDTH >= breakpoints.md && SCREEN_WIDTH < breakpoints.lg;
export const isDesktop = SCREEN_WIDTH >= breakpoints.lg;

export const getColumns = (mobile: number, tablet: number, desktop: number) => {
  if (isDesktop) return desktop;
  if (isTablet) return tablet;
  return mobile;
};

export const getResponsiveValue = <T,>(mobile: T, tablet: T, desktop: T): T => {
  if (isDesktop) return desktop;
  if (isTablet) return tablet;
  return mobile;
};

export const getPadding = () => {
  if (isDesktop) return 32;
  if (isTablet) return 24;
  return 16;
};

export const getMaxWidth = () => {
  if (isDesktop) return 1400;
  if (isTablet) return 1200;
  return '100%';
};

