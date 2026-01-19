/**
 * Enterprise Template & Branding Panel
 * Comprehensive template selection with branding customization
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  Paintbrush,
  Heart,
  Zap,
  BookOpen,
  Sparkles,
  Upload,
  Palette,
  Check,
  Eye,
  Loader2,
  Image as ImageIcon,
  Type,
  BarChart3,
  GitBranch,
  Table,
  Layers,
  Wand2,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PresentationTemplate, PresentationTheme } from './types';

// Template Categories
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All', icon: Layers },
  { id: 'business', name: 'Professional', icon: Briefcase },
  { id: 'minimal', name: 'Minimal', icon: Paintbrush },
  { id: 'healthcare', name: 'Healthcare', icon: Heart },
  { id: 'tech', name: 'Tech Modern', icon: Zap },
  { id: 'creative', name: 'Creative', icon: Sparkles },
  { id: 'education', name: 'Education', icon: BookOpen }
];

// Template category type
type TemplateCategory = 'business' | 'creative' | 'minimal' | 'healthcare' | 'tech' | 'education';

// Predefined Templates
const TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  colors: { primary: string; secondary: string; accent: string };
  preview: string;
}> = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional business presentation',
    category: 'business',
    colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1e40af, #3b82f6)'
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    description: 'Elegant dark theme for executives',
    category: 'business',
    colors: { primary: '#1f2937', secondary: '#374151', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1f2937, #374151)'
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Minimalist design with focus on content',
    category: 'minimal',
    colors: { primary: '#18181b', secondary: '#71717a', accent: '#a1a1aa' },
    preview: 'linear-gradient(135deg, #18181b, #71717a)'
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    description: 'Light and airy minimal style',
    category: 'minimal',
    colors: { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
    preview: 'linear-gradient(135deg, #f9fafb, #e5e7eb)'
  },
  {
    id: 'medical-teal',
    name: 'Medical Teal',
    description: 'Trust-inspiring healthcare design',
    category: 'healthcare',
    colors: { primary: '#0891b2', secondary: '#06b6d4', accent: '#14b8a6' },
    preview: 'linear-gradient(135deg, #0891b2, #06b6d4)'
  },
  {
    id: 'clinical-white',
    name: 'Clinical White',
    description: 'Clean clinical presentation',
    category: 'healthcare',
    colors: { primary: '#0d9488', secondary: '#2dd4bf', accent: '#5eead4' },
    preview: 'linear-gradient(135deg, #0d9488, #2dd4bf)'
  },
  {
    id: 'neon-future',
    name: 'Neon Future',
    description: 'Cutting-edge tech aesthetic',
    category: 'tech',
    colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#06b6d4' },
    preview: 'linear-gradient(135deg, #7c3aed, #06b6d4)'
  },
  {
    id: 'cyber-dark',
    name: 'Cyber Dark',
    description: 'Modern dark tech theme',
    category: 'tech',
    colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#22d3ee' },
    preview: 'linear-gradient(135deg, #0f172a, #22d3ee)'
  },
  {
    id: 'vibrant-splash',
    name: 'Vibrant Splash',
    description: 'Bold and colorful creative design',
    category: 'creative',
    colors: { primary: '#ec4899', secondary: '#f97316', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #ec4899, #f97316)'
  },
  {
    id: 'artistic-gradient',
    name: 'Artistic Gradient',
    description: 'Artistic multi-color theme',
    category: 'creative',
    colors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#06b6d4' },
    preview: 'linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)'
  },
  {
    id: 'academic-navy',
    name: 'Academic Navy',
    description: 'Traditional educational style',
    category: 'education',
    colors: { primary: '#1e3a5f', secondary: '#2563eb', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #1e3a5f, #2563eb)'
  },
  {
    id: 'learning-green',
    name: 'Learning Green',
    description: 'Fresh and engaging for learners',
    category: 'education',
    colors: { primary: '#166534', secondary: '#22c55e', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #166534, #22c55e)'
  }
];

// Font Options
const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', category: 'Modern' },
  { id: 'helvetica', name: 'Helvetica', category: 'Classic' },
  { id: 'roboto', name: 'Roboto', category: 'Modern' },
  { id: 'playfair', name: 'Playfair', category: 'Elegant' },
  { id: 'georgia', name: 'Georgia', category: 'Classic' },
  { id: 'lato', name: 'Lato', category: 'Modern' }
];

// Preset Color Palettes
const COLOR_PALETTES = [
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#f59e0b' },
  { name: 'Forest', primary: '#22c55e', secondary: '#4ade80', accent: '#fbbf24' },
  { name: 'Sunset', primary: '#f97316', secondary: '#fb923c', accent: '#ec4899' },
  { name: 'Lavender', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#06b6d4' },
  { name: 'Coral', primary: '#f43f5e', secondary: '#fb7185', accent: '#14b8a6' },
  { name: 'Midnight', primary: '#6366f1', secondary: '#818cf8', accent: '#fbbf24' }
];

export interface BrandConfig {
  logo?: {
    url: string;
    position: string;
    size: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  companyName?: string;
  tagline?: string;
  font?: string;
}

interface TemplateBrandingPanelProps {
  selectedTemplate: PresentationTemplate | null;
  onTemplateChange: (template: PresentationTemplate | null) => void;
  selectedTheme: PresentationTheme | null;
  onThemeChange: (theme: PresentationTheme | null) => void;
  brandConfig: BrandConfig;
  onBrandConfigChange: (config: BrandConfig) => void;
  // Visual features
  includeInfographics: boolean;
  onIncludeInfographicsChange: (value: boolean) => void;
  includeJourneyMaps: boolean;
  onIncludeJourneyMapsChange: (value: boolean) => void;
  includeTables: boolean;
  onIncludeTablesChange: (value: boolean) => void;
  includeCharts: boolean;
  onIncludeChartsChange: (value: boolean) => void;
  className?: string;
}

export function TemplateBrandingPanel({
  selectedTemplate,
  onTemplateChange,
  selectedTheme,
  onThemeChange,
  brandConfig,
  onBrandConfigChange,
  includeInfographics,
  onIncludeInfographicsChange,
  includeJourneyMaps,
  onIncludeJourneyMapsChange,
  includeTables,
  onIncludeTablesChange,
  includeCharts,
  onIncludeChartsChange,
  className
}: TemplateBrandingPanelProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAutoTemplate, setIsAutoTemplate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = activeCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    // Create a proper PresentationTemplate object
    const fullTemplate: PresentationTemplate = {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      theme: {
        id: `${template.id}-theme`,
        name: template.name,
        colors: {
          primary: template.colors.primary,
          secondary: template.colors.secondary,
          accent: template.colors.accent,
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
    };
    
    onTemplateChange(fullTemplate);
    onThemeChange(fullTemplate.theme);
    
    // Update brand colors to match template
    onBrandConfigChange({
      ...brandConfig,
      colors: template.colors
    });
  };

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const logoUrl = event.target?.result as string;
        
        onBrandConfigChange({
          ...brandConfig,
          logo: {
            url: logoUrl,
            position: 'top-left',
            size: 'medium'
          }
        });

        // Extract colors from logo
        setIsExtractingColors(true);
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const colors = extractDominantColors(imageData.data);
              if (colors.length >= 3) {
                onBrandConfigChange({
                  ...brandConfig,
                  logo: {
                    url: logoUrl,
                    position: 'top-left',
                    size: 'medium'
                  },
                  colors: {
                    primary: colors[0],
                    secondary: colors[1],
                    accent: colors[2]
                  }
                });
                toast.success('Colors extracted from logo!');
              }
            }
            setIsExtractingColors(false);
          };
          img.src = logoUrl;
        } catch (err) {
          console.error('Error extracting colors:', err);
          setIsExtractingColors(false);
        }

        toast.success('Logo uploaded successfully!');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      setIsUploading(false);
    }
  }, [brandConfig, onBrandConfigChange]);

  // Simple color extraction helper
  const extractDominantColors = (data: Uint8ClampedArray): string[] => {
    const colors: Record<string, number> = {};
    
    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const a = data[i + 3];
      
      if (a > 200) { // Only non-transparent pixels
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colors[hex] = (colors[hex] || 0) + 1;
      }
    }

    return Object.entries(colors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => color);
  };

  const handleAutoTemplate = () => {
    setIsAutoTemplate(true);
    // Simulate AI selection
    setTimeout(() => {
      const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      handleTemplateSelect(randomTemplate);
      setIsAutoTemplate(false);
      toast.success(`AI selected: ${randomTemplate.name}`);
    }, 1500);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Step Header */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base">Template & Branding</h3>
          <p className="text-sm text-muted-foreground">
            Choose a professional template and customize your brand identity
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoTemplate}
          disabled={isAutoTemplate}
          className="gap-2"
        >
          {isAutoTemplate ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">AI Auto-Select</span>
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="templates" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="h-7 text-xs gap-1.5"
                >
                  <Icon className="h-3 w-3" />
                  {cat.name}
                </Button>
              );
            })}
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50 group overflow-hidden",
                  selectedTemplate?.id === template.id && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="relative">
                  <div 
                    className="w-full h-20 transition-transform group-hover:scale-105"
                    style={{ background: template.preview }}
                  />
                  {selectedTemplate?.id === template.id && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <CardContent className="p-2.5">
                  <p className="text-xs font-medium truncate">{template.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Template Preview */}
          {selectedTemplate && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${brandConfig.colors.primary}, ${brandConfig.colors.secondary})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{selectedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                    <div className="flex gap-2 mt-2">
                      {[brandConfig.colors.primary, brandConfig.colors.secondary, brandConfig.colors.accent].map((color, idx) => (
                        <div 
                          key={idx}
                          className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="mt-4 space-y-4">
          {/* Logo Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Logo Upload
              </CardTitle>
              <CardDescription className="text-xs">
                Upload your logo to auto-extract brand colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              {brandConfig.logo?.url ? (
                <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                  <img 
                    src={brandConfig.logo.url} 
                    alt="Logo" 
                    className="h-12 w-auto object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Logo uploaded</p>
                    <p className="text-[10px] text-muted-foreground">Colors extracted automatically</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBrandConfigChange({ ...brandConfig, logo: undefined })}
                    className="h-8"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-20 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-xs">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs">Click to upload logo</span>
                    </div>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Company Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Company Name</Label>
                  <Input
                    placeholder="Your Company"
                    value={brandConfig.companyName || ''}
                    onChange={(e) => onBrandConfigChange({ ...brandConfig, companyName: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tagline</Label>
                  <Input
                    placeholder="Your tagline here"
                    value={brandConfig.tagline || ''}
                    onChange={(e) => onBrandConfigChange({ ...brandConfig, tagline: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Palettes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Color Palette
              </CardTitle>
              <CardDescription className="text-xs">
                Quick presets or customize your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Preset Palettes */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {COLOR_PALETTES.map(palette => (
                  <button
                    key={palette.name}
                    onClick={() => onBrandConfigChange({ ...brandConfig, colors: palette })}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:border-primary/50",
                      JSON.stringify(brandConfig.colors) === JSON.stringify(palette) && "border-primary ring-1 ring-primary/20"
                    )}
                  >
                    <div className="flex gap-0.5">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.primary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.secondary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{palette.name}</span>
                  </button>
                ))}
              </div>

              <Separator />

              {/* Custom Colors */}
              <div className="grid grid-cols-3 gap-3">
                {(['primary', 'secondary', 'accent'] as const).map(colorType => (
                  <div key={colorType} className="space-y-1.5">
                    <Label className="text-xs capitalize">{colorType}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandConfig.colors[colorType]}
                        onChange={(e) => onBrandConfigChange({
                          ...brandConfig,
                          colors: { ...brandConfig.colors, [colorType]: e.target.value }
                        })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={brandConfig.colors[colorType]}
                        onChange={(e) => onBrandConfigChange({
                          ...brandConfig,
                          colors: { ...brandConfig.colors, [colorType]: e.target.value }
                        })}
                        className="h-8 text-xs font-mono flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Font Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {FONT_OPTIONS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => onBrandConfigChange({ ...brandConfig, font: font.id })}
                    className={cn(
                      "p-2 rounded-lg border text-center transition-all hover:border-primary/50",
                      brandConfig.font === font.id && "border-primary ring-1 ring-primary/20"
                    )}
                  >
                    <p className="text-xs font-medium truncate" style={{ fontFamily: font.name }}>{font.name}</p>
                    <p className="text-[10px] text-muted-foreground">{font.category}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Visual Features
              </CardTitle>
              <CardDescription className="text-xs">
                Toggle visual elements for your presentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-primary/10">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Infographics</span>
                      <p className="text-[10px] text-muted-foreground">Visual data representations</p>
                    </div>
                  </div>
                  <Switch checked={includeInfographics} onCheckedChange={onIncludeInfographicsChange} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-primary/10">
                      <GitBranch className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Journey Maps</span>
                      <p className="text-[10px] text-muted-foreground">Process flow visuals</p>
                    </div>
                  </div>
                  <Switch checked={includeJourneyMaps} onCheckedChange={onIncludeJourneyMapsChange} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-primary/10">
                      <Table className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Data Tables</span>
                      <p className="text-[10px] text-muted-foreground">Structured data display</p>
                    </div>
                  </div>
                  <Switch checked={includeTables} onCheckedChange={onIncludeTablesChange} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-primary/10">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Charts</span>
                      <p className="text-[10px] text-muted-foreground">Bar, line, pie charts</p>
                    </div>
                  </div>
                  <Switch checked={includeCharts} onCheckedChange={onIncludeChartsChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Preview */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Features Summary</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {includeInfographics && <Badge variant="secondary" className="text-[10px]">Infographics</Badge>}
                    {includeJourneyMaps && <Badge variant="secondary" className="text-[10px]">Journey Maps</Badge>}
                    {includeTables && <Badge variant="secondary" className="text-[10px]">Tables</Badge>}
                    {includeCharts && <Badge variant="secondary" className="text-[10px]">Charts</Badge>}
                    {!includeInfographics && !includeJourneyMaps && !includeTables && !includeCharts && (
                      <span className="text-xs text-muted-foreground">No visual features selected</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
