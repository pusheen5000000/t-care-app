// theme.ts
// Colors pulled from the official U of T brand "Colour Quick Guide"
// (brand.utoronto.ca/guidelines/#colour)

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

  // Semantic mapping for the app (built from the palette above —
  // brand guide says avoid black as a background, so we lean on
  // white/coolGray for surfaces and uoftBlue/sky for structure)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F5F3',      // tint of coolGray
  border: '#D0D1C9',
  textPrimary: '#000000',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',
  accent: '#1E3765',            // U of T Blue — primary actions
  accentOn: '#FFFFFF',
  success: '#8DBF2E',
  danger: '#DC4633',
  infoBg: '#E8F1F5',             // light tint for info/answer cards (from sky)
  infoText: '#1E3765',
};

// Everything square — no rounded corners anywhere in the app.
// Keep this constant at 0 rather than deleting radius usage,
// so it stays a single switch if that ever changes.
export const radius = {
  none: 0,
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
