/**
 * Template & Theme Selector for Presentations
 * Allows selection of templates, color themes, fonts, and formatting
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Palette,
  Type,
  Layout,
  Check,
  Sparkles,
  Briefcase,
  Heart,
  Zap,
  BookOpen,
  Building2,
  Paintbrush
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresentationTemplate, PresentationTheme, ThemeColors, ThemeFonts } from './types';

// Predefined templates
const TEMPLATES: PresentationTemplate[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate look for business presentations',
    category: 'business',
    theme: {
      id: 'professional-theme',
      name: 'Professional',
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#f59e0b',
        background: '#ffffff',
        foreground: '#1f2937',
        muted: '#f3f4f6',
        card: '#ffffff',
        cardForeground: '#1f2937',
        border: '#e5e7eb'
      },
      fonts: {
        heading: { family: 'Inter', weight: 700 },
        body: { family: 'Inter', weight: 400 },
        accent: { family: 'Inter', weight: 600 }
      },
      spacing: 'normal',
      borderRadius: 'medium',
      shadows: true
    },
    slideLayouts: []
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant with focus on content',
    category: 'minimal',
    theme: {
      id: 'minimal-theme',
      name: 'Minimal',
      colors: {
        primary: '#18181b',
        secondary: '#52525b',
        accent: '#a1a1aa',
        background: '#fafafa',
        foreground: '#18181b',
        muted: '#f4f4f5',
        card: '#ffffff',
        cardForeground: '#18181b',
        border: '#e4e4e7'
      },
      fonts: {
        heading: { family: 'Helvetica Neue', weight: 300 },
        body: { family: 'Helvetica Neue', weight: 400 },
        accent: { family: 'Helvetica Neue', weight: 500 }
      },
      spacing: 'relaxed',
      borderRadius: 'none',
      shadows: false
    },
    slideLayouts: []
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Trust-inspiring design for medical content',
    category: 'healthcare',
    theme: {
      id: 'healthcare-theme',
      name: 'Healthcare',
      colors: {
        primary: '#0891b2',
        secondary: '#06b6d4',
        accent: '#14b8a6',
        background: '#ffffff',
        foreground: '#134e4a',
        muted: '#ecfeff',
        card: '#ffffff',
        cardForeground: '#134e4a',
        border: '#99f6e4'
      },
      fonts: {
        heading: { family: 'Lato', weight: 700 },
        body: { family: 'Open Sans', weight: 400 },
        accent: { family: 'Lato', weight: 600 }
      },
      spacing: 'normal',
      borderRadius: 'medium',
      shadows: true
    },
    slideLayouts: []
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Dark, sleek design for tech presentations',
    category: 'tech',
    theme: {
      id: 'tech-theme',
      name: 'Tech Modern',
      colors: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#22d3ee',
        background: '#0f172a',
        foreground: '#f8fafc',
        muted: '#1e293b',
        card: '#1e293b',
        cardForeground: '#f8fafc',
        border: '#334155'
      },
      fonts: {
        heading: { family: 'JetBrains Mono', weight: 700 },
        body: { family: 'Inter', weight: 400 },
        accent: { family: 'JetBrains Mono', weight: 500 }
      },
      spacing: 'compact',
      borderRadius: 'large',
      shadows: true
    },
    slideLayouts: []
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and colorful for creative pitches',
    category: 'creative',
    theme: {
      id: 'creative-theme',
      name: 'Creative',
      colors: {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#fbbf24',
        background: '#fef3c7',
        foreground: '#292524',
        muted: '#fef9c3',
        card: '#fffbeb',
        cardForeground: '#292524',
        border: '#fde68a'
      },
      fonts: {
        heading: { family: 'Playfair Display', weight: 700 },
        body: { family: 'Nunito', weight: 400 },
        accent: { family: 'Playfair Display', weight: 600 }
      },
      spacing: 'relaxed',
      borderRadius: 'large',
      shadows: true
    },
    slideLayouts: []
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Friendly and accessible for learning content',
    category: 'education',
    theme: {
      id: 'education-theme',
      name: 'Education',
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#f97316',
        background: '#f0fdf4',
        foreground: '#166534',
        muted: '#dcfce7',
        card: '#ffffff',
        cardForeground: '#166534',
        border: '#bbf7d0'
      },
      fonts: {
        heading: { family: 'Poppins', weight: 600 },
        body: { family: 'Nunito', weight: 400 },
        accent: { family: 'Poppins', weight: 500 }
      },
      spacing: 'normal',
      borderRadius: 'medium',
      shadows: false
    },
    slideLayouts: []
  }
];

// Font families
const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', category: 'sans-serif' },
  { id: 'helvetica', name: 'Helvetica Neue', category: 'sans-serif' },
  { id: 'roboto', name: 'Roboto', category: 'sans-serif' },
  { id: 'poppins', name: 'Poppins', category: 'sans-serif' },
  { id: 'lato', name: 'Lato', category: 'sans-serif' },
  { id: 'open-sans', name: 'Open Sans', category: 'sans-serif' },
  { id: 'playfair', name: 'Playfair Display', category: 'serif' },
  { id: 'georgia', name: 'Georgia', category: 'serif' },
  { id: 'merriweather', name: 'Merriweather', category: 'serif' },
  { id: 'jetbrains', name: 'JetBrains Mono', category: 'mono' },
  { id: 'fira-code', name: 'Fira Code', category: 'mono' }
];

// Color palettes
const COLOR_PALETTES: { id: string; name: string; colors: Partial<ThemeColors> }[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: { primary: '#0ea5e9', secondary: '#38bdf8', accent: '#f59e0b' }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: { primary: '#22c55e', secondary: '#4ade80', accent: '#fbbf24' }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: { primary: '#f97316', secondary: '#fb923c', accent: '#ec4899' }
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#06b6d4' }
  },
  {
    id: 'coral',
    name: 'Coral',
    colors: { primary: '#f43f5e', secondary: '#fb7185', accent: '#14b8a6' }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: { primary: '#6366f1', secondary: '#818cf8', accent: '#fbbf24' }
  },
  {
    id: 'earth',
    name: 'Earth',
    colors: { primary: '#78716c', secondary: '#a8a29e', accent: '#84cc16' }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: { primary: '#18181b', secondary: '#52525b', accent: '#71717a' }
  }
];

const categoryIcons: Record<string, React.ReactNode> = {
  business: <Briefcase className="h-4 w-4" />,
  creative: <Paintbrush className="h-4 w-4" />,
  minimal: <Layout className="h-4 w-4" />,
  healthcare: <Heart className="h-4 w-4" />,
  tech: <Zap className="h-4 w-4" />,
  education: <BookOpen className="h-4 w-4" />
};

interface TemplateThemeSelectorProps {
  selectedTemplate?: PresentationTemplate;
  selectedTheme?: PresentationTheme;
  onTemplateChange: (template: PresentationTemplate) => void;
  onThemeChange: (theme: Partial<PresentationTheme>) => void;
  onColorsChange: (colors: Partial<ThemeColors>) => void;
  onFontsChange: (fonts: Partial<ThemeFonts>) => void;
  className?: string;
}

export function TemplateThemeSelector({
  selectedTemplate,
  selectedTheme,
  onTemplateChange,
  onThemeChange,
  onColorsChange,
  onFontsChange,
  className
}: TemplateThemeSelectorProps) {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full h-11 p-1 bg-muted rounded-lg">
          <TabsTrigger value="templates" className="text-xs font-medium h-9 gap-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-foreground">
            <Layout className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs font-medium h-9 gap-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-foreground">
            <Palette className="h-3.5 w-3.5" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="fonts" className="text-xs font-medium h-9 gap-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-foreground">
            <Type className="h-3.5 w-3.5" />
            Fonts
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                  selectedTemplate?.id === template.id && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => onTemplateChange(template)}
              >
                <CardContent className="p-3">
                  {/* Template preview */}
                  <div 
                    className="h-14 rounded-md mb-2 flex items-center justify-center relative overflow-hidden"
                    style={{ 
                      backgroundColor: template.theme.colors.background,
                      border: `1px solid ${template.theme.colors.border}`
                    }}
                  >
                    <div 
                      className="absolute top-0 left-0 right-0 h-3"
                      style={{ backgroundColor: template.theme.colors.primary }}
                    />
                    <div className="flex flex-col items-center gap-0.5 mt-1">
                      <div 
                        className="h-1.5 w-10 rounded-sm"
                        style={{ backgroundColor: template.theme.colors.foreground }}
                      />
                      <div 
                        className="h-1 w-6 rounded-sm opacity-50"
                        style={{ backgroundColor: template.theme.colors.foreground }}
                      />
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{template.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {template.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px] px-1.5 shrink-0">
                      {categoryIcons[template.category]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-3">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Color Palette</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    className={cn(
                      "p-2 rounded-lg border transition-all hover:border-primary/50",
                      selectedTheme?.colors.primary === palette.colors.primary && 
                        "border-primary ring-1 ring-primary"
                    )}
                    onClick={() => onColorsChange(palette.colors)}
                    title={palette.name}
                  >
                    <div className="flex gap-0.5">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: palette.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: palette.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: palette.colors.accent }}
                      />
                    </div>
                    <p className="text-[9px] mt-1 text-center text-muted-foreground">
                      {palette.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Background</Label>
                <Select 
                  value={selectedTheme?.colors.background === '#0f172a' ? 'dark' : 'light'}
                  onValueChange={(v) => onColorsChange({
                    background: v === 'dark' ? '#0f172a' : '#ffffff',
                    foreground: v === 'dark' ? '#f8fafc' : '#1f2937',
                    muted: v === 'dark' ? '#1e293b' : '#f3f4f6',
                    card: v === 'dark' ? '#1e293b' : '#ffffff',
                    cardForeground: v === 'dark' ? '#f8fafc' : '#1f2937'
                  })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Border Radius</Label>
                <Select 
                  value={selectedTheme?.borderRadius || 'medium'}
                  onValueChange={(v) => onThemeChange({ borderRadius: v as any })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Fonts Tab */}
        <TabsContent value="fonts" className="mt-3">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Heading Font</Label>
              <Select 
                value={selectedTheme?.fonts.heading.family}
                onValueChange={(v) => onFontsChange({
                  heading: { family: v, weight: 700 }
                })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select heading font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.id} value={font.name}>
                      <div className="flex items-center justify-between w-full">
                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                        <Badge variant="outline" className="text-[9px] ml-2">
                          {font.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Body Font</Label>
              <Select 
                value={selectedTheme?.fonts.body.family}
                onValueChange={(v) => onFontsChange({
                  body: { family: v, weight: 400 }
                })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select body font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.id} value={font.name}>
                      <div className="flex items-center justify-between w-full">
                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                        <Badge variant="outline" className="text-[9px] ml-2">
                          {font.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Spacing</Label>
              <Select 
                value={selectedTheme?.spacing || 'normal'}
                onValueChange={(v) => onThemeChange({ spacing: v as any })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { TEMPLATES, COLOR_PALETTES, FONT_OPTIONS };
