// theme.ts
// Colors pulled from the official U of T brand "Colour Quick Guide"
// (brand.utoronto.ca/guidelines/#colour)
// Semantic mapping below is flipped to a dark theme, using the same
// brand palette as accents on dark surfaces.

export const colors = {
  // Primary
  uoftBlue: '#1E3765',      // Pantone 655 — always present per brand guide

  // Secondary (use as accents only, per brand guide)
  sky: '#007FA3',           // Pantone 633
  purple: '#6D247A',        // Pantone 2613
  red: '#DC4633',           // Pantone Warm Red
  lightBlue: '#6FC7EA',     // Pantone 2985
  teal: '#00A189',          // Pantone 3285
  magenta: '#AB1368',       // Pantone 227
  darkTeal: '#0D534D',      // Pantone 7722
  yellow: '#F1C500',        // Pantone 7406
  green: '#8DBF2E',         // Pantone 376

  // Neutrals
  coolGray: '#D0D1C9',      // Pantone Cool Gray 2
  white: '#FFFFFF',
  black: '#000000',

  // Semantic mapping for the app — dark mode.
  background: '#0B1F3A',      // dark navy background
  surface: '#142B4D',         // slightly lighter navy for bars/cards
  surfaceMuted: '#1E3765',    // UofT blue buttons/cards
  border: '#34527A',
  textPrimary: '#F2F3F4',
  textSecondary: '#C6D0E0',
  textMuted: '#8FA0BE',
  accent: '#0091f2',          // light blue send button
  accentOn: '#0B1F33',
  success: '#8DBF2E',
  danger: '#FF6B55',
  infoBg: '#17293A',
  infoText: '#DCEEF6',


};

// Rounded corners
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const fontSize = {
  sm: 12,
  base: 14,
  md: 15,
  lg: 18,
  xl: 22,
};