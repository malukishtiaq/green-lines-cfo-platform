// Central theme configuration - Change this file to update the entire app's design
export const themeConfig = {
  colors: {
    primary: '#1890ff',
    secondary: '#52c41a',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    background: '#ffffff',
    surface: '#fafafa',
    text: {
      primary: '#262626',
      secondary: '#8c8c8c',
      disabled: '#bfbfbf',
    },
    border: '#d9d9d9',
    divider: '#f0f0f0',
  },
  typography: {
    fontFamily: {
      primary: 'Segoe UI, Tahoma, Arial, sans-serif',
      arabic: 'Segoe UI, Tahoma, Arial, sans-serif',
      mono: 'Consolas, Monaco, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    xs: '480px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1600px',
  },
  components: {
    button: {
      height: {
        small: '24px',
        medium: '32px',
        large: '40px',
      },
      padding: {
        small: '4px 8px',
        medium: '6px 16px',
        large: '8px 24px',
      },
    },
    card: {
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px 0 rgba(29,35,41,.05)',
    },
    input: {
      height: '32px',
      padding: '4px 11px',
      borderRadius: '6px',
    },
  },
};

// Theme variants - Create different design themes
export const themes = {
  default: themeConfig,
  modern: {
    ...themeConfig,
    colors: { 
      ...themeConfig.colors, 
      primary: '#6366f1',
      secondary: '#10b981',
    },
    borderRadius: { 
      ...themeConfig.borderRadius, 
      md: '16px',
      lg: '20px',
    },
  },
  minimal: {
    ...themeConfig,
    colors: { 
      ...themeConfig.colors, 
      primary: '#000000',
      secondary: '#6b7280',
    },
    shadows: { 
      ...themeConfig.shadows, 
      md: 'none',
      lg: 'none',
    },
    borderRadius: {
      ...themeConfig.borderRadius,
      md: '0',
      lg: '0',
    },
  },
  colorful: {
    ...themeConfig,
    colors: {
      ...themeConfig.colors,
      primary: '#ff6b35',
      secondary: '#4ecdc4',
      success: '#45b7d1',
      warning: '#f9ca24',
      error: '#f0932b',
    },
  },
};

// Export current theme (change this to switch themes)
export const currentTheme = themes.default;
