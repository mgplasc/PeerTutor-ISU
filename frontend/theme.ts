// theme.ts - Centralized color palette

export const Colors = {
  // Primary
  redbirdRed: '#CE1126',
  white: '#FFFFFF',
  
  // Secondary
  redbirdYellow: '#F9DD16',
  black: '#000000',
  
  // Neutrals
  lightGray: '#F5F7FA',
  mediumGray: '#E0E0E0',
  darkGray: '#6B7280',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

//Semantic color mapping for UI components
export const SemanticColors = {
  primary: Colors.redbirdRed,
  primaryText: Colors.black,
  secondaryText: Colors.darkGray,
  background: Colors.white,
  cardBackground: Colors.lightGray,
  border: Colors.mediumGray,
  accent: Colors.redbirdYellow,
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
} as const;