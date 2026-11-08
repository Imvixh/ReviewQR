# Design System — ReviewQR (from `stitch_reviewqr_poster_saas_suite/.../DESIGN.md`)

Tokens are exported from `src/lib/design-tokens.ts` and consumed by Tailwind config.

## Colors
```ts
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
  onBackground: '#0b1c30',
  surfaceVariant: '#d3e4fe',
};
```

## Google landmark accents (used verbatim in UI)
```ts
export const googleColors = {
  blue: '#1A73E8',
  red: '#EA4335',
  yellow: '#FBBC04',
  green: '#34A853',
  navy: '#0F172A',
};
```

## Typography
```ts
export const typography = {
  // Plus Jakarta Sans
  displayHero:       { fontFamily: 'Plus Jakarta Sans', fontSize: '40px', fontWeight: 800, lineHeight: '48px', letterSpacing: '-0.03em' },
  displayHeroMobile: { fontFamily: 'Plus Jakarta Sans', fontSize: '28px', fontWeight: 800, lineHeight: '34px', letterSpacing: '-0.02em' },
  headlineLg:        { fontFamily: 'Plus Jakarta Sans', fontSize: '30px', fontWeight: 700, lineHeight: '38px', letterSpacing: '-0.02em' },
  headlineLgMobile:  { fontFamily: 'Plus Jakarta Sans', fontSize: '22px', fontWeight: 700, lineHeight: '28px', letterSpacing: '-0.01em' },
  headlineMd:        { fontFamily: 'Plus Jakarta Sans', fontSize: '22px', fontWeight: 700, lineHeight: '28px', letterSpacing: '-0.01em' },
  headlineSm:        { fontFamily: 'Plus Jakarta Sans', fontSize: '18px', fontWeight: 600, lineHeight: '24px' },
  // Inter
  bodyLg:            { fontFamily: 'Inter', fontSize: '16px', fontWeight: 400, lineHeight: '24px' },
  bodyMd:            { fontFamily: 'Inter', fontSize: '14px', fontWeight: 400, lineHeight: '20px' },
  bodySm:            { fontFamily: 'Inter', fontSize: '12px', fontWeight: 400, lineHeight: '16px' },
  labelLg:           { fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, lineHeight: '20px', letterSpacing: '0.01em' },
  labelMd:           { fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, lineHeight: '16px', letterSpacing: '0.02em' },
  labelCaps:         { fontFamily: 'Inter', fontSize: '11px', fontWeight: 700, lineHeight: '14px', letterSpacing: '0.06em' },
};
```

## Spacing (Tailwind tokens)
```ts
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
```

## Border radius
```ts
export const radius = {
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
};
```

## Elevation (box-shadow utilities)
```ts
export const elevation = {
  level0: 'none',
  level1: '0 1px 3px 0 rgba(15,23,42,0.05), 0 1px 2px -1px rgba(15,23,42,0.03)',
  level2: '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.03)',
  level3: '0 20px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.04)',
};
```

## Component specs (implemented as reusable React components)
- **ButtonPrimary**: `#1A73E8` bg, white text, `label-lg`, h-11 (44px) / h-12 (48px mobile), hover `#1557B0` + level2, active `scale-[0.98]`.
- **ButtonSecondary**: white bg, `#CBD5E1` border, `#0F172A` text, hover `#F1F5F9`.
- **ButtonDestructive**: `#EA4335` text, `#FEF2F2` bg, `#FCA5A5` border.
- **SuggestionChip**: default white + `#E2E8F0` border, r-3 (12px), p-3 p-4; selected `#EFF6FF` + `border-2 border-[#1A73E8]`, checkmark `#1A73E8`.
- **StarRating**: 5 stars, 36px touch, inactive `#E2E8F0` stroke, active `#FBBC04` fill, spring transition.
- **Input**: white bg, `#CBD5E1` border, r-2 (8px), h-11 (42px), px-3.5, focus ring `0 0 0 3px rgba(26,115,232,0.15)`, error ring `0 0 0 3px rgba(234,67,53,0.15)`.
- **StepBadge**: 32px circle, label-md centered, sequence: 1=`#1A73E8`, 2=`#34A853`, 3=`#FBBC04`, 4=`#EA4335`, 5=`#6366F1`.
- **QRPosterFrame**: fixed aspect-ratio container (acrylic stand), bleed zones, logo watermark, star bar, centered QR SVG.

## Responsive breakpoints
```ts
export const breakpoints = {
  mobile: '768px',   // < 768: 4-col / single stack, gutterMobile, marginMobile
  tablet: '1024px',  // 768–1023: 8-col, gutter 1rem, margin 1.5rem
  desktop: '1024px', // ≥ 1024: 12-col, gutter 1.5rem, margin 2rem
};
```

## Icon font
Material Symbols Outlined, variable font opsz 20..48, wght 100..700, FILL 0..1, GRAD -50..200. Imported from `@fontsource/material-symbols-outlined`.

## Font loading
Plus Jakarta Sans (600,700,800) + Inter (400,500,600,700) via `next/font/google` with `display: 'swap'` and preload.