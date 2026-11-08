/**
 * Design tokens exported from DESIGN.md (source of truth).
 * These feed Tailwind config and any programmatic styling needs.
 */
export const colors = {
  surface: '#f8f9ff',
  surfaceDim: '#cbdbf5',
  surfaceBright: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#414754',
  inverseSurface: '#213145',
  inverseOnSurface: '#eaf1ff',
  outline: '#727785',
  outlineVariant: '#c1c6d6',
  surfaceTint: '#005bc0',
  primary: '#005bbf',
  onPrimary: '#ffffff',
  primaryContainer: '#1a73e8',
  onPrimaryContainer: '#ffffff',
  inversePrimary: '#adc7ff',
  secondary: '#565e74',
  onSecondary: '#ffffff',
  secondaryContainer: '#dae2fd',
  onSecondaryContainer: '#5c647a',
  tertiary: '#006d2c',
  onTertiary: '#ffffff',
  tertiaryContainer: '#008939',
  onTertiaryContainer: '#ffffff',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  primaryFixed: '#d8e2ff',
  primaryFixedDim: '#adc7ff',
  onPrimaryFixed: '#001a41',
  onPrimaryFixedVariant: '#004493',
  secondaryFixed: '#dae2fd',
  secondaryFixedDim: '#bec6e0',
  onSecondaryFixed: '#131b2e',
  onSecondaryFixedVariant: '#3f465c',
  tertiaryFixed: '#89fa9b',
  tertiaryFixedDim: '#6ddd81',
  onTertiaryFixed: '#002108',
  onTertiaryFixedVariant: '#005320',
  background: '#f8f9ff',
  surfaceVariant: '#d3e4fe',
};

// Google landmark accents (verbatim per DESIGN.md)
export const googleColors = {
  blue: '#1A73E8',
  red: '#EA4335',
  yellow: '#FBBC04',
  green: '#34A853',
  navy: '#0F172A',
};

export const typography = {
  displayHero: '40px / 48px -0.03em weight-800',
  displayHeroMobile: '28px / 34px -0.02em weight-800',
  headlineLg: '30px / 38px -0.02em weight-700',
  headlineLgMobile: '22px / 28px -0.01em weight-700',
  headlineMd: '22px / 28px -0.01em weight-700',
  headlineSm: '18px / 24px weight-600',
  bodyLg: '16px / 24px weight-400',
  bodyMd: '14px / 20px weight-400',
  bodySm: '12px / 16px weight-400',
  labelLg: '14px / 20px weight-600 letter-0.01em',
  labelMd: '12px / 16px weight-600 letter-0.02em',
  labelCaps: '11px / 14px weight-700 letter-0.06em',
};

export const spacing = {
  gutter: '1.5rem',
  gutterMobile: '0.75rem',
  margin: '2rem',
  marginMobile: '1rem',
  '2xs': '0.125rem',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
};

export const radius = {
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
};

export const elevation = {
  level0: 'none',
  level1: '0 1px 3px 0 rgba(15,23,42,0.05), 0 1px 2px -1px rgba(15,23,42,0.03)',
  level2: '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.03)',
  level3: '0 20px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.04)',
};

// Step badge color sequence per DESIGN.md
export const stepColors = ['#1A73E8', '#34A853', '#FBBC04', '#EA4335', '#6366F1'];
