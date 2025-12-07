/**
 * Modern Design System for Movie App
 * Inspired by Netflix, Max, Spotify, TikTok
 * Optimized for Gen-Z / young adults
 */

export const colors = {
  // Dark theme base colors (lighter for better visibility)
  background: {
    primary: '#A0A0A5',      // Lighter grey
    secondary: '#A5A5A9',    // Lighter grey
    tertiary: '#AAAAAE',     // Lighter grey
    elevated: '#AFAFB3',      // Lighter grey
  },
  
  // Accent colors (vibrant purple/blue gradient system)
  accent: {
    primary: '#8B5CF6',       // Vibrant purple
    secondary: '#6366F1',     // Indigo
    tertiary: '#A855F7',      // Lighter purple
    gradient: {
      start: '#8B5CF6',
      end: '#6366F1',
    },
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',       // Pure white for headings
    secondary: '#E4E4E7',    // Light gray for body
    tertiary: '#A1A1AA',     // Muted gray for hints
    disabled: '#71717A',      // Disabled text
  },
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Overlay colors (lighter for better visibility)
  overlay: {
    dark: 'rgba(0, 0, 0, 0.5)',
    darker: 'rgba(0, 0, 0, 0.65)',
    gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
  },
  
  // Border colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(255, 255, 255, 0.05)',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const breakpoints = {
  sm: 640,   // Small phones
  md: 768,   // Large phones / small tablets
  lg: 1024,  // Tablets
  xl: 1280,  // Desktop
  '2xl': 1536, // Large desktop
} as const;

export const animation = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

