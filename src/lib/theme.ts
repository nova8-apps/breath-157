// Breathing Exercise App — Design Tokens
export const colors = {
  // Backgrounds
  bg: '#0a0e27',
  bgCard: '#111638',
  bgNested: '#181e4a',
  bgInput: '#1f2660',

  // Accent — teal (Mindfulness / Wellness)
  primary: '#20b2aa',
  primaryDark: '#1a7f7b',
  primaryLight: '#2dd4c8',
  primaryGlow: 'rgba(32, 178, 170, 0.15)',
  primarySubtle: 'rgba(32, 178, 170, 0.08)',
  primaryGlowStrong: 'rgba(32, 178, 170, 0.25)',
  successGlow: 'rgba(52, 211, 153, 0.15)',
  warningGlow: 'rgba(251, 191, 36, 0.12)',

  // Text
  textPrimary: '#f0f0f5',
  textSecondary: '#8b8fa8',
  textMuted: '#5c6080',

  // Surface
  surfaceElevated: '#161b42',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',

  // Semantic
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',

  // Phase colors
  inhale: '#20b2aa',
  hold: '#6366f1',
  exhale: '#8b5cf6',
  pause: '#64748b',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
