import React, { createContext, useContext, useState } from 'react';

// FlowiseAI-inspired theme configuration
export interface FlowiseTheme {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    node: {
      agent: string;
      data: string;
      logic: string;
      integration: string;
      start: string;
      end: string;
    };
    border: {
      default: string;
      active: string;
      success: string;
    };
  };
  typography: {
    fontFamily: string;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    node: string;
    active: string;
    glow: string;
  };
}

const flowiseDarkTheme: FlowiseTheme = {
  dark: true,
  colors: {
    background: '#0f0f23',
    surface: '#1a1a2e',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    text: {
      primary: '#ffffff',
      secondary: '#e5e7eb',
      muted: '#9ca3af'
    },
    node: {
      agent: '#10b981',
      data: '#06b6d4',
      logic: '#f59e0b',
      integration: '#8b5cf6',
      start: '#22c55e',
      end: '#ef4444'
    },
    border: {
      default: '#374151',
      active: '#6366f1',
      success: '#10b981'
    }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  shadows: {
    node: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    active: '0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -2px rgba(99, 102, 241, 0.05)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)'
  }
};

const flowiseLightTheme: FlowiseTheme = {
  ...flowiseDarkTheme,
  dark: false,
  colors: {
    ...flowiseDarkTheme.colors,
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
      muted: '#6b7280'
    },
    border: {
      default: '#e5e7eb',
      active: '#6366f1',
      success: '#10b981'
    }
  }
};

interface FlowiseThemeContextType {
  theme: FlowiseTheme;
  toggleTheme: () => void;
  setTheme: (theme: FlowiseTheme) => void;
}

const FlowiseThemeContext = createContext<FlowiseThemeContextType | undefined>(undefined);

export const FlowiseThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<FlowiseTheme>(flowiseDarkTheme);

  const toggleTheme = () => {
    setThemeState(current => current.dark ? flowiseLightTheme : flowiseDarkTheme);
  };

  const setTheme = (newTheme: FlowiseTheme) => {
    setThemeState(newTheme);
  };

  return (
    <FlowiseThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </FlowiseThemeContext.Provider>
  );
};

export const useFlowiseTheme = () => {
  const context = useContext(FlowiseThemeContext);
  if (!context) {
    throw new Error('useFlowiseTheme must be used within a FlowiseThemeProvider');
  }
  return context;
};

// CSS-in-JS styles for ReactFlow components
export const getFlowiseStyles = (theme: FlowiseTheme) => ({
  reactFlow: {
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  node: {
    backgroundColor: theme.colors.surface,
    border: `2px solid ${theme.colors.border.default}`,
    borderRadius: '12px',
    boxShadow: theme.shadows.node,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    padding: theme.spacing.md,
  },
  nodeSelected: {
    border: `2px solid ${theme.colors.border.active}`,
    boxShadow: theme.shadows.glow,
  },
  nodeAgent: {
    backgroundColor: theme.colors.node.agent,
    color: '#ffffff',
  },
  nodeData: {
    backgroundColor: theme.colors.node.data,
    color: '#ffffff',
  },
  nodeLogic: {
    backgroundColor: theme.colors.node.logic,
    color: '#ffffff',
  },
  nodeIntegration: {
    backgroundColor: theme.colors.node.integration,
    color: '#ffffff',
  },
  handle: {
    backgroundColor: theme.colors.primary,
    border: `2px solid ${theme.colors.surface}`,
    width: '12px',
    height: '12px',
  },
  edge: {
    stroke: theme.colors.border.default,
    strokeWidth: 2,
  },
  edgeSelected: {
    stroke: theme.colors.primary,
    strokeWidth: 3,
  },
  miniMap: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: '8px',
  },
  controls: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: '8px',
  },
  panel: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: '12px',
    boxShadow: theme.shadows.node,
    color: theme.colors.text.primary,
  }
});