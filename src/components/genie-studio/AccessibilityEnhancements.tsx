/**
 * Accessibility Enhancements for Genie Suite
 * Addresses Ralph Wiggum findings: Color Contrast, Content Readability
 * 
 * Provides:
 * - High contrast mode toggle
 * - Text size adjustments
 * - Reading mode for simplified content
 * - Tooltip glossary for medical/technical terms
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Eye, 
  Type, 
  Sun, 
  Moon, 
  BookOpen,
  MinusCircle,
  PlusCircle,
  RotateCcw,
  Accessibility
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Accessibility Context
interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  reducedMotion: boolean;
  readingMode: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  toggleHighContrast: () => void;
  setFontSize: (size: AccessibilitySettings['fontSize']) => void;
  toggleReducedMotion: () => void;
  toggleReadingMode: () => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'normal',
  reducedMotion: false,
  readingMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

/**
 * Accessibility Provider - Wrap your app to enable accessibility features
 */
export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('genieAccessibility');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('genieAccessibility', JSON.stringify(settings));
    
    // Apply CSS classes to root
    const root = document.documentElement;
    
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('reading-mode', settings.readingMode);
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Font size classes
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-extra-large');
    root.classList.add(`text-size-${settings.fontSize}`);
  }, [settings]);

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const setFontSize = (size: AccessibilitySettings['fontSize']) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const toggleReadingMode = () => {
    setSettings(prev => ({ ...prev, readingMode: !prev.readingMode }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleHighContrast,
        setFontSize,
        toggleReducedMotion,
        toggleReadingMode,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to access accessibility settings
 */
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    // Return default values if not in provider
    return {
      settings: defaultSettings,
      toggleHighContrast: () => {},
      setFontSize: () => {},
      toggleReducedMotion: () => {},
      toggleReadingMode: () => {},
      resetSettings: () => {},
    };
  }
  return context;
};

/**
 * Accessibility Toggle Button - Add to header/toolbar
 */
export const AccessibilityToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { 
    settings, 
    toggleHighContrast, 
    setFontSize, 
    toggleReducedMotion,
    toggleReadingMode,
    resetSettings 
  } = useAccessibility();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn('gap-2', className)}
          aria-label="Accessibility options"
        >
          <Accessibility className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Accessibility</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Accessibility className="h-4 w-4" />
          Accessibility Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* High Contrast */}
        <DropdownMenuItem onClick={toggleHighContrast}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>High Contrast</span>
            </div>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              settings.highContrast ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {settings.highContrast ? 'ON' : 'OFF'}
            </span>
          </div>
        </DropdownMenuItem>

        {/* Font Size */}
        <DropdownMenuLabel className="text-xs text-muted-foreground pt-2">
          Text Size
        </DropdownMenuLabel>
        <div className="flex items-center justify-center gap-2 px-2 py-1">
          <Button
            variant={settings.fontSize === 'normal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFontSize('normal')}
            className="flex-1"
          >
            <Type className="h-3 w-3" />
          </Button>
          <Button
            variant={settings.fontSize === 'large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFontSize('large')}
            className="flex-1"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant={settings.fontSize === 'extra-large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFontSize('extra-large')}
            className="flex-1"
          >
            <Type className="h-5 w-5" />
          </Button>
        </div>

        {/* Reading Mode */}
        <DropdownMenuItem onClick={toggleReadingMode}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Reading Mode</span>
            </div>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              settings.readingMode ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {settings.readingMode ? 'ON' : 'OFF'}
            </span>
          </div>
        </DropdownMenuItem>

        {/* Reduced Motion */}
        <DropdownMenuItem onClick={toggleReducedMotion}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <MinusCircle className="h-4 w-4" />
              <span>Reduce Motion</span>
            </div>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              settings.reducedMotion ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {settings.reducedMotion ? 'ON' : 'OFF'}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Reset */}
        <DropdownMenuItem onClick={resetSettings}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Medical/Technical Term Glossary - For content readability
 * Wrap complex terms with this to provide simple explanations
 */
interface GlossaryTermProps {
  term: string;
  definition: string;
  children: ReactNode;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ 
  term, 
  definition, 
  children 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className="underline decoration-dotted decoration-primary/50 cursor-help"
            tabIndex={0}
            role="term"
            aria-label={`${term}: ${definition}`}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs text-sm bg-popover text-popover-foreground"
        >
          <p className="font-medium">{term}</p>
          <p className="text-muted-foreground text-xs mt-1">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Common healthcare/medical term definitions
 */
export const MEDICAL_GLOSSARY: Record<string, string> = {
  'PHI': 'Protected Health Information - Any health data that can identify a person',
  'HIPAA': 'Health Insurance Portability and Accountability Act - A US law that protects patient privacy',
  'EHR': 'Electronic Health Record - Digital version of a patient\'s medical chart',
  'EMR': 'Electronic Medical Record - Similar to EHR, focused on clinical data',
  'ePHI': 'Electronic Protected Health Information - PHI stored or transmitted electronically',
  'BAA': 'Business Associate Agreement - Contract ensuring HIPAA compliance',
  'Encryption': 'A way of scrambling data so only authorized people can read it',
  'TLS': 'Transport Layer Security - Technology that keeps data safe during transfer',
  'AES-256': 'Advanced Encryption Standard - Very strong encryption method',
  'Audit Trail': 'A record of who accessed data and when',
  'Access Control': 'Rules about who can see or change information',
  'Data Breach': 'When protected information is accessed without permission',
};

/**
 * Helper to wrap text with glossary terms automatically
 */
export const withGlossaryTerms = (text: string): ReactNode => {
  const terms = Object.keys(MEDICAL_GLOSSARY);
  let result: ReactNode[] = [text];
  
  terms.forEach(term => {
    const newResult: ReactNode[] = [];
    result.forEach((part, partIndex) => {
      if (typeof part !== 'string') {
        newResult.push(part);
        return;
      }
      
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const parts = part.split(regex);
      
      if (parts.length === 1) {
        newResult.push(part);
        return;
      }
      
      parts.forEach((p, i) => {
        if (p) newResult.push(p);
        if (i < parts.length - 1) {
          newResult.push(
            <GlossaryTerm key={`${term}-${partIndex}-${i}`} term={term} definition={MEDICAL_GLOSSARY[term]}>
              {term}
            </GlossaryTerm>
          );
        }
      });
    });
    result = newResult;
  });
  
  return <>{result}</>;
};

export default {
  AccessibilityProvider,
  AccessibilityToggle,
  GlossaryTerm,
  useAccessibility,
  MEDICAL_GLOSSARY,
  withGlossaryTerms,
};
