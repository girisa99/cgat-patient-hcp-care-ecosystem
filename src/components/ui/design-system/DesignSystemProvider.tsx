
import React, { createContext, useContext, ReactNode } from 'react';

interface DesignSystemContextType {
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    laptop: string;
    desktop: string;
  };
  layout: {
    headerHeight: string;
    sidebarWidth: string;
    sidebarCollapsedWidth: string;
    maxContentWidth: string;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const defaultDesignSystem: DesignSystemContextType = {
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    xxl: '4rem',    // 64px
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    laptop: '1280px',
    desktop: '1536px',
  },
  layout: {
    headerHeight: '4rem',
    sidebarWidth: '16rem',
    sidebarCollapsedWidth: '4rem',
    maxContentWidth: '80rem',
  },
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    error: 'hsl(var(--destructive))',
    info: 'hsl(217, 91%, 60%)',
  },
};

const DesignSystemContext = createContext<DesignSystemContextType>(defaultDesignSystem);

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};

interface DesignSystemProviderProps {
  children: ReactNode;
  customTheme?: Partial<DesignSystemContextType>;
}

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  customTheme,
}) => {
  const theme = customTheme 
    ? { ...defaultDesignSystem, ...customTheme }
    : defaultDesignSystem;

  return (
    <DesignSystemContext.Provider value={theme}>
      {children}
    </DesignSystemContext.Provider>
  );
};
