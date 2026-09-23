export const theme = {
  colors: {
    background: '#0F0F13', // Very dark background
    surface: '#1C1C22',    // Slightly lighter for cards/sheets
    primary: '#7C3AED',    // Vibrant Purple accent
    primaryHover: '#6D28D9',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    danger: '#EF4444',
    success: '#10B981',
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};
