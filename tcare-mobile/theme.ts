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
  // Uses near-black surfaces with the U of T blue family as accents,
  // and lightBlue as the interactive/accent color since it reads
  // better than the dark uoftBlue against a dark background.
  background: '#121417',
  surface: '#1B1E23',
  surfaceMuted: '#23262C',
  border: '#33373E',
  textPrimary: '#F2F3F4',
  textSecondary: '#B7BCC4',
  textMuted: '#7E848C',
  accent: '#6FC7EA',            // U of T light blue — pops on dark surfaces
  accentOn: '#0B1F33',          // dark text on the light-blue accent
  success: '#8DBF2E',
  danger: '#FF6B55',
  infoBg: '#17293A',             // dark tint of sky/uoftBlue for info cards
  infoText: '#DCEEF6',
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