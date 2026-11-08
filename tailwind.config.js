/**
 * Tailwind config (derived from DESIGN.md tokens)
 */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // surface layers
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
        // primary
        primary: '#005bbf',
        onPrimary: '#ffffff',
        primaryContainer: '#1a73e8',
        onPrimaryContainer: '#ffffff',
        inversePrimary: '#adc7ff',
        // secondary
        secondary: '#565e74',
        onSecondary: '#ffffff',
        secondaryContainer: '#dae2fd',
        onSecondaryContainer: '#5c647a',
        // tertiary
        tertiary: '#006d2c',
        onTertiary: '#ffffff',
        tertiaryContainer: '#008939',
        onTertiaryContainer: '#ffffff',
        // accents (Google landmarks)
        googleBlue: '#1A73E8',
        googleRed: '#EA4335',
        googleYellow: '#FBBC04',
        googleGreen: '#34A853',
        googleNavy: '#0F172A',
        // error
        error: '#ba1a1a',
        onError: '#ffffff',
        errorContainer: '#ffdad6',
        onErrorContainer: '#93000a',
        // static
        background: '#f8f9ff',
        surfaceVariant: '#d3e4fe',
      },
      spacing: {
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
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      fontFamily: {
        'plus-jakarta': ['Plus Jakarta Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        'material-icons': ['"Material Symbols Outlined"', 'sans-serif'],
      },
      fontSize: {
        // from DESIGN.md map
        'display-hero': ['40px', { lineHeight: '48px', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-hero-mobile': ['28px', { lineHeight: '34px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg-mobile': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'label-caps': ['11px', { lineHeight: '14px', letterSpacing: '0.06em', fontWeight: '700' }],
      },
      boxShadow: {
        'level-1': '0 1px 3px 0 rgba(15,23,42,0.05), 0 1px 2px -1px rgba(15,23,42,0.03)',
        'level-2': '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.03)',
        'level-3': '0 20px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.04)',
      },
    },
  },
  darkMode: 'class',
}