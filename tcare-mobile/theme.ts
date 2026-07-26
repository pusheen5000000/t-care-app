// T-Care's light campus palette. Primitive names are retained so existing
// screens can keep consuming stable semantic roles.

export const colors = {
  // Brand primitives
  uoftBlue: '#002A5C',
  teal: '#008BB0',
  red: '#E31837',
  yellow: '#FFE498',

  // Compatibility aliases for service-category treatments. Keep category
  // colors in the same blue/teal/yellow/red family.
  sky: '#008BB0',
  purple: '#002A5C',
  lightBlue: '#E8F4F8',
  magenta: '#002A5C',
  darkTeal: '#006D8C',
  green: '#008BB0',

  // Neutrals
  coolGray: '#D9E5EB',
  white: '#FFFFFF',
  black: '#000000',

  // Semantic mapping — light, high-clarity campus surfaces.
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#E8F4F8',
  border: '#B9D7E0',
  textPrimary: '#002A5C',
  textSecondary: '#204F6C',
  textMuted: '#4E7186',
  accent: '#002A5C',
  accentOn: '#FFFFFF',
  success: '#008BB0',
  danger: '#E31837',
  infoBg: '#F2F9FB',
  infoText: '#002A5C',
  dangerSurface: '#FFF9FA',

  // Resource-directory icon colors. These are intentionally limited to the
  // icon layer so the product canvas stays recognizably blue and white.
  resourcePurple: '#5846B8',
  resourceTeal: '#007791',
  resourceBlue: '#1266A4',
  resourceGreen: '#277553',
  resourceOrange: '#B85417',
  resourceIndigo: '#3055A5',
  resourceBerry: '#A13D73',
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
