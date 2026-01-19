/**
 * Enterprise Template & Branding Panel
 * Redesigned with horizontal layouts, clear details, and proper alignment
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  RefreshCw,
  ChevronRight,
  ChevronDown,
  X,
  Layout,
  Monitor,
  Smartphone,
  FileImage,
  GraduationCap,
  Stethoscope,
  Code2,
  PenTool,
  PieChart,
  Calendar,
  Shapes,
  Quote,
  Bot,
  Lightbulb
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PresentationTemplate, PresentationTheme } from './types';

// Template Categories
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All', icon: Layers, count: 12 },
  { id: 'business', name: 'Professional', icon: Briefcase, count: 2 },
  { id: 'minimal', name: 'Minimal', icon: Paintbrush, count: 2 },
  { id: 'healthcare', name: 'Healthcare', icon: Stethoscope, count: 2 },
  { id: 'tech', name: 'Tech Modern', icon: Code2, count: 2 },
  { id: 'creative', name: 'Creative', icon: PenTool, count: 2 },
  { id: 'education', name: 'Education', icon: GraduationCap, count: 2 }
];

// Template category type
type TemplateCategory = 'business' | 'creative' | 'minimal' | 'healthcare' | 'tech' | 'education';

// Enhanced Templates with slide preview images
const TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  colors: { primary: string; secondary: string; accent: string };
  preview: string;
  slides: number;
  features: string[];
}> = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Clean, professional business presentation with modern layouts',
    category: 'business',
    colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    slides: 12,
    features: ['Charts', 'Tables', 'Icons']
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    description: 'Elegant dark theme perfect for C-suite presentations',
    category: 'business',
    colors: { primary: '#1f2937', secondary: '#374151', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    slides: 10,
    features: ['Infographics', 'Timeline', 'Stats']
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Minimalist design focusing on content clarity',
    category: 'minimal',
    colors: { primary: '#18181b', secondary: '#71717a', accent: '#a1a1aa' },
    preview: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    slides: 8,
    features: ['Typography', 'Whitespace', 'Clean']
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    description: 'Light and airy minimal style for readability',
    category: 'minimal',
    colors: { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
    preview: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
    slides: 8,
    features: ['Simple', 'Elegant', 'Focus']
  },
  {
    id: 'medical-teal',
    name: 'Medical Teal',
    description: 'Trust-inspiring healthcare design with clinical aesthetics',
    category: 'healthcare',
    colors: { primary: '#0891b2', secondary: '#06b6d4', accent: '#14b8a6' },
    preview: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
    slides: 14,
    features: ['HIPAA Ready', 'Charts', 'Icons']
  },
  {
    id: 'clinical-white',
    name: 'Clinical White',
    description: 'Clean clinical presentation for medical professionals',
    category: 'healthcare',
    colors: { primary: '#0d9488', secondary: '#2dd4bf', accent: '#5eead4' },
    preview: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)',
    slides: 12,
    features: ['Clean', 'Professional', 'Data']
  },
  {
    id: 'neon-future',
    name: 'Neon Future',
    description: 'Cutting-edge tech aesthetic for innovation presentations',
    category: 'tech',
    colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#06b6d4' },
    preview: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
    slides: 10,
    features: ['Animations', 'Modern', 'Bold']
  },
  {
    id: 'cyber-dark',
    name: 'Cyber Dark',
    description: 'Modern dark tech theme for product launches',
    category: 'tech',
    colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#22d3ee' },
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    slides: 12,
    features: ['Dark Mode', 'Tech', 'Sharp']
  },
  {
    id: 'vibrant-splash',
    name: 'Vibrant Splash',
    description: 'Bold and colorful creative design for marketing',
    category: 'creative',
    colors: { primary: '#ec4899', secondary: '#f97316', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #fbbf24 100%)',
    slides: 10,
    features: ['Colorful', 'Dynamic', 'Fun']
  },
  {
    id: 'artistic-gradient',
    name: 'Artistic Gradient',
    description: 'Artistic multi-color theme for creative agencies',
    category: 'creative',
    colors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#06b6d4' },
    preview: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)',
    slides: 8,
    features: ['Artistic', 'Vibrant', 'Modern']
  },
  {
    id: 'academic-navy',
    name: 'Academic Navy',
    description: 'Traditional educational style for institutions',
    category: 'education',
    colors: { primary: '#1e3a5f', secondary: '#2563eb', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)',
    slides: 14,
    features: ['Academic', 'Structured', 'Clear']
  },
  {
    id: 'learning-green',
    name: 'Learning Green',
    description: 'Fresh and engaging theme for training materials',
    category: 'education',
    colors: { primary: '#166534', secondary: '#22c55e', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #4ade80 100%)',
    slides: 12,
    features: ['Engaging', 'Fresh', 'Friendly']
  }
];

// Font Options with better styling
const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', category: 'Modern', preview: 'Aa', stack: 'Inter, system-ui, sans-serif' },
  { id: 'helvetica', name: 'Helvetica', category: 'Classic', preview: 'Aa', stack: 'Helvetica Neue, Helvetica, Arial, sans-serif' },
  { id: 'roboto', name: 'Roboto', category: 'Modern', preview: 'Aa', stack: 'Roboto, system-ui, sans-serif' },
  { id: 'playfair', name: 'Playfair', category: 'Elegant', preview: 'Aa', stack: 'Playfair Display, Georgia, serif' },
  { id: 'georgia', name: 'Georgia', category: 'Classic', preview: 'Aa', stack: 'Georgia, Cambria, Times New Roman, serif' },
  { id: 'lato', name: 'Lato', category: 'Modern', preview: 'Aa', stack: 'Lato, system-ui, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', category: 'Modern', preview: 'Aa', stack: 'Montserrat, system-ui, sans-serif' },
  { id: 'opensans', name: 'Open Sans', category: 'Versatile', preview: 'Aa', stack: 'Open Sans, system-ui, sans-serif' }
];

// Preset Color Palettes with descriptions
const COLOR_PALETTES = [
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#f59e0b', desc: 'Calm & Professional' },
  { name: 'Forest', primary: '#22c55e', secondary: '#4ade80', accent: '#fbbf24', desc: 'Fresh & Natural' },
  { name: 'Sunset', primary: '#f97316', secondary: '#fb923c', accent: '#ec4899', desc: 'Warm & Energetic' },
  { name: 'Lavender', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#06b6d4', desc: 'Creative & Modern' },
  { name: 'Coral', primary: '#f43f5e', secondary: '#fb7185', accent: '#14b8a6', desc: 'Bold & Dynamic' },
  { name: 'Midnight', primary: '#6366f1', secondary: '#818cf8', accent: '#fbbf24', desc: 'Sleek & Tech' },
  { name: 'Emerald', primary: '#059669', secondary: '#34d399', accent: '#3b82f6', desc: 'Growth & Trust' },
  { name: 'Rose', primary: '#e11d48', secondary: '#fb7185', accent: '#8b5cf6', desc: 'Elegant & Vibrant' }
];

// Extended Visual Features
const VISUAL_FEATURES = [
  { key: 'infographics', label: 'Infographics', desc: 'Visual data representations', iconType: 'barChart' as const },
  { key: 'journeyMaps', label: 'Journey Maps', desc: 'Process flow visuals', iconType: 'gitBranch' as const },
  { key: 'tables', label: 'Data Tables', desc: 'Structured data display', iconType: 'table' as const },
  { key: 'charts', label: 'Charts', desc: 'Bar, line, pie charts', iconType: 'pieChart' as const },
  { key: 'timelines', label: 'Timelines', desc: 'Chronological progressions', iconType: 'calendar' as const },
  { key: 'diagrams', label: 'Diagrams', desc: 'Technical illustrations', iconType: 'shapes' as const },
  { key: 'icons', label: 'Icon Sets', desc: 'Visual iconography', iconType: 'sparkles' as const },
  { key: 'quotes', label: 'Quote Blocks', desc: 'Testimonial layouts', iconType: 'quote' as const }
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
  const [activeTab, setActiveTab] = useState<'templates' | 'branding' | 'features'>('templates');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAutoTemplate, setIsAutoTemplate] = useState(false);
  const [isAIDefault, setIsAIDefault] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<typeof TEMPLATES[0] | null>(null);
  const [showColorPalettes, setShowColorPalettes] = useState(false);
  const [showTypography, setShowTypography] = useState(false);
  const [extendedFeatures, setExtendedFeatures] = useState<Record<string, boolean>>({
    timelines: false,
    diagrams: false,
    icons: true,
    quotes: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = activeCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
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
    onBrandConfigChange({
      ...brandConfig,
      colors: template.colors
    });
    setSelectedPreview(null);
    toast.success(`Selected: ${template.name}`);
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
          logo: { url: logoUrl, position: 'top-left', size: 'medium' }
        });

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
                  logo: { url: logoUrl, position: 'top-left', size: 'medium' },
                  colors: { primary: colors[0], secondary: colors[1], accent: colors[2] }
                });
                toast.success('Colors extracted from logo!');
              }
            }
            setIsExtractingColors(false);
          };
          img.src = logoUrl;
        } catch (err) {
          setIsExtractingColors(false);
        }

        toast.success('Logo uploaded successfully!');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload logo');
      setIsUploading(false);
    }
  }, [brandConfig, onBrandConfigChange]);

  const extractDominantColors = (data: Uint8ClampedArray): string[] => {
    const colors: Record<string, number> = {};
    
    for (let i = 0; i < data.length; i += 16) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const a = data[i + 3];
      
      if (a > 200) {
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
    setTimeout(() => {
      const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      handleTemplateSelect(randomTemplate);
      setIsAutoTemplate(false);
      toast.success(`AI selected: ${randomTemplate.name}`);
    }, 1500);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Template & Branding</h3>
            <p className="text-sm text-muted-foreground">Choose a template and customize your brand</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoTemplate}
          disabled={isAutoTemplate}
          className="gap-2"
        >
          {isAutoTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          AI Auto-Select
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {[
          { id: 'templates', label: 'Templates', icon: Layout },
          { id: 'branding', label: 'Branding', icon: Upload },
          { id: 'features', label: 'Features', icon: Settings2 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* AI Default Option */}
          <Card 
            className={cn(
              "border-2 transition-all cursor-pointer",
              isAIDefault ? "border-primary bg-primary/5" : "border-dashed border-muted-foreground/30 hover:border-primary/50"
            )}
            onClick={() => {
              setIsAIDefault(!isAIDefault);
              if (!isAIDefault) {
                handleAutoTemplate();
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  isAIDefault ? "bg-primary/10" : "bg-muted"
                )}>
                  <Bot className={cn("h-6 w-6", isAIDefault ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">AI Default Template</h4>
                    {isAIDefault && (
                      <Badge variant="default" className="bg-primary">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI selects optimal template, colors & features based on your content
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={isAIDefault} 
                    onCheckedChange={(checked) => {
                      setIsAIDefault(checked);
                      if (checked) handleAutoTemplate();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              {/* AI Selection Summary - shown when active */}
              {isAIDefault && (
                <div className="mt-4 pt-4 border-t border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">AI Recommendations</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutoTemplate();
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Template Preview */}
                    <div className="p-2 rounded-lg bg-background border">
                      <p className="text-[10px] text-muted-foreground mb-1">Template</p>
                      <p className="text-xs font-medium truncate">{selectedTemplate?.name || 'Corporate Pro'}</p>
                    </div>
                    {/* Colors Preview */}
                    <div className="p-2 rounded-lg bg-background border">
                      <p className="text-[10px] text-muted-foreground mb-1">Colors</p>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: brandConfig.colors.primary }} />
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: brandConfig.colors.secondary }} />
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: brandConfig.colors.accent }} />
                      </div>
                    </div>
                    {/* Features Preview */}
                    <div className="p-2 rounded-lg bg-background border">
                      <p className="text-[10px] text-muted-foreground mb-1">Features</p>
                      <p className="text-xs font-medium">{Object.values(extendedFeatures).filter(Boolean).length} selected</p>
                    </div>
                  </div>

                  {/* Feature Selection for AI Default */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Select features for AI template:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {VISUAL_FEATURES.map(feature => {
                        const IconComponent = feature.iconType === 'barChart' ? BarChart3 
                          : feature.iconType === 'gitBranch' ? GitBranch
                          : feature.iconType === 'table' ? Table
                          : feature.iconType === 'pieChart' ? PieChart
                          : feature.iconType === 'calendar' ? Calendar
                          : feature.iconType === 'shapes' ? Shapes
                          : feature.iconType === 'quote' ? Quote
                          : Sparkles;
                        const isActive = extendedFeatures[feature.key] === true;
                        return (
                          <button
                            key={feature.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExtendedFeatures(prev => ({
                                ...prev,
                                [feature.key]: !prev[feature.key]
                              }));
                            }}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all",
                              isActive 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            <IconComponent className="h-3 w-3" />
                            {feature.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Divider with explanation */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-muted" />
            <span className="text-xs text-muted-foreground">
              {isAIDefault ? 'Or select manually to override AI' : 'Choose a template'}
            </span>
            <div className="flex-1 border-t border-muted" />
          </div>

          {/* Category Pills - Horizontal */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TEMPLATE_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                  <Badge variant={isActive ? "secondary" : "outline"} className="h-5 text-xs">
                    {cat.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Template Grid - Always visible and selectable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map(template => {
              const isSelected = selectedTemplate?.id === template.id;
              const isPreview = selectedPreview?.id === template.id;
              const isAIRecommended = isAIDefault && isSelected;
              
              return (
                <Card
                  key={template.id}
                  className={cn(
                    "transition-all cursor-pointer overflow-hidden group",
                    isSelected && "ring-2 ring-primary border-primary",
                    isPreview && !isSelected && "ring-1 ring-primary/50",
                    isAIRecommended && "relative"
                  )}
                  onClick={() => setSelectedPreview(isPreview ? null : template)}
                >
                  {/* AI Recommended Badge */}
                  {isAIRecommended && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-medium py-0.5 px-2 flex items-center justify-center gap-1 z-10">
                      <Sparkles className="h-3 w-3" />
                      AI Recommended
                    </div>
                  )}
                  
                  {/* Preview Banner */}
                  <div 
                    className={cn("h-20 relative", isAIRecommended && "mt-5")}
                    style={{ background: template.preview }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{template.name}</h4>
                        <p className="text-white/70 text-xs">{template.slides} slides</p>
                      </div>
                      <div className="flex -space-x-1">
                        {[template.colors.primary, template.colors.secondary, template.colors.accent].map((color, idx) => (
                          <div 
                            key={idx}
                            className="w-4 h-4 rounded-full border-2 border-white/50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    {isSelected && !isAIRecommended && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {template.features.slice(0, 2).map(feature => (
                          <Badge key={feature} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                          setIsAIDefault(false); // Turn off AI Default when manually selecting
                        }}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : 'Select'}
                      </Button>
                    </div>
                  </CardContent>

                  {/* Expanded Preview */}
                  {isPreview && (
                    <div className="border-t bg-muted/30 p-3">
                      <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        <div className="p-2 rounded-lg bg-background">
                          <p className="text-sm font-bold text-foreground">{template.slides}</p>
                          <p className="text-[10px] text-muted-foreground">Slides</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background">
                          <p className="text-sm font-bold text-foreground">4</p>
                          <p className="text-[10px] text-muted-foreground">Layouts</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background">
                          <p className="text-sm font-bold text-foreground">3</p>
                          <p className="text-[10px] text-muted-foreground">Colors</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-[10px]">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-3">
          {/* Logo Upload */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileImage className="h-4 w-4 text-primary" />
                Logo Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              {brandConfig.logo?.url ? (
                <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/30">
                  <div className="w-14 h-14 rounded-lg bg-background flex items-center justify-center overflow-hidden border">
                    <img 
                      src={brandConfig.logo.url} 
                      alt="Logo" 
                      className="max-h-12 max-w-12 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Logo uploaded</p>
                    <div className="flex gap-1 mt-1">
                      {[brandConfig.colors.primary, brandConfig.colors.secondary, brandConfig.colors.accent].map((color, idx) => (
                        <div 
                          key={idx}
                          className="w-4 h-4 rounded-full border border-background"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">Extracted</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBrandConfigChange({ ...brandConfig, logo: undefined })}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-6 border-2 border-dashed rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-all flex flex-col items-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <div className="p-2 rounded-full bg-primary/10">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Upload logo</p>
                        <p className="text-xs text-muted-foreground">Auto-extracts brand colors</p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Company Name</Label>
                  <Input
                    placeholder="Your Company"
                    value={brandConfig.companyName || ''}
                    onChange={(e) => onBrandConfigChange({ ...brandConfig, companyName: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tagline</Label>
                  <Input
                    placeholder="Your tagline here"
                    value={brandConfig.tagline || ''}
                    onChange={(e) => onBrandConfigChange({ ...brandConfig, tagline: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette - Collapsible */}
          <Collapsible open={showColorPalettes} onOpenChange={setShowColorPalettes}>
            <Card>
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Palette className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Color Palette</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex -space-x-1">
                          {[brandConfig.colors.primary, brandConfig.colors.secondary, brandConfig.colors.accent].map((color, idx) => (
                            <div 
                              key={idx}
                              className="w-4 h-4 rounded-full border-2 border-background"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">3 colors</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showColorPalettes && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4">
                  <Separator />
                  
                  {/* Preset Palettes */}
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PALETTES.map(palette => {
                      const isSelected = brandConfig.colors.primary === palette.primary;
                      return (
                        <button
                          key={palette.name}
                          onClick={() => onBrandConfigChange({ 
                            ...brandConfig, 
                            colors: { primary: palette.primary, secondary: palette.secondary, accent: palette.accent }
                          })}
                          className={cn(
                            "p-2 rounded-lg border-2 transition-all text-center",
                            isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex justify-center gap-0.5 mb-1.5">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.primary }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.secondary }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
                          </div>
                          <p className="text-xs font-medium text-foreground">{palette.name}</p>
                          <p className="text-[10px] text-muted-foreground">{palette.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-3 gap-3">
                    {(['primary', 'secondary', 'accent'] as const).map(colorType => (
                      <div key={colorType} className="space-y-1.5">
                        <Label className="text-xs capitalize text-muted-foreground">{colorType}</Label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={brandConfig.colors[colorType]}
                            onChange={(e) => onBrandConfigChange({
                              ...brandConfig,
                              colors: { ...brandConfig.colors, [colorType]: e.target.value }
                            })}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
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
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Typography - Collapsible */}
          <Collapsible open={showTypography} onOpenChange={setShowTypography}>
            <Card>
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Type className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Typography</p>
                      <p className="text-xs text-muted-foreground">
                        {FONT_OPTIONS.find(f => f.id === brandConfig.font)?.name || 'Inter'} • {FONT_OPTIONS.find(f => f.id === brandConfig.font)?.category || 'Modern'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showTypography && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-4 gap-2">
                    {FONT_OPTIONS.map(font => {
                      const isSelected = brandConfig.font === font.id;
                      return (
                        <button
                          key={font.id}
                          onClick={() => onBrandConfigChange({ ...brandConfig, font: font.id })}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all text-center",
                            isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          <p className="text-xl font-bold text-foreground mb-0.5" style={{ fontFamily: font.stack }}>
                            {font.preview}
                          </p>
                          <p className="text-xs font-medium text-foreground">{font.name}</p>
                          <p className="text-[10px] text-muted-foreground">{font.category}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          {/* Core Visual Features */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Core Visual Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'infographics', label: 'Infographics', desc: 'Visual data representations', icon: BarChart3, checked: includeInfographics, onChange: onIncludeInfographicsChange },
                  { key: 'journeyMaps', label: 'Journey Maps', desc: 'Process flow visuals', icon: GitBranch, checked: includeJourneyMaps, onChange: onIncludeJourneyMapsChange },
                  { key: 'tables', label: 'Data Tables', desc: 'Structured data display', icon: Table, checked: includeTables, onChange: onIncludeTablesChange },
                  { key: 'charts', label: 'Charts', desc: 'Bar, line, pie charts', icon: PieChart, checked: includeCharts, onChange: onIncludeChartsChange }
                ].map(feature => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.key}
                      onClick={() => feature.onChange(!feature.checked)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        feature.checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        feature.checked ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Icon className={cn("h-4 w-4", feature.checked ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{feature.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{feature.desc}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        feature.checked ? "bg-primary border-primary" : "border-muted-foreground/30"
                      )}>
                        {feature.checked && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Extended Visual Features */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Additional Features
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'timelines', label: 'Timelines', desc: 'Chronological progressions', icon: Calendar },
                  { key: 'diagrams', label: 'Diagrams', desc: 'Technical illustrations', icon: Shapes },
                  { key: 'icons', label: 'Icon Sets', desc: 'Visual iconography', icon: Sparkles },
                  { key: 'quotes', label: 'Quote Blocks', desc: 'Testimonial layouts', icon: Quote }
                ].map(feature => {
                  const Icon = feature.icon;
                  const isChecked = extendedFeatures[feature.key] || false;
                  return (
                    <button
                      key={feature.key}
                      onClick={() => setExtendedFeatures(prev => ({ ...prev, [feature.key]: !prev[feature.key] }))}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        isChecked ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        isChecked ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Icon className={cn("h-4 w-4", isChecked ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{feature.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{feature.desc}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isChecked ? "bg-primary border-primary" : "border-muted-foreground/30"
                      )}>
                        {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Selected Features</p>
                  <div className="flex flex-wrap gap-1">
                    {includeInfographics && <Badge variant="secondary" className="text-xs">Infographics</Badge>}
                    {includeJourneyMaps && <Badge variant="secondary" className="text-xs">Journey Maps</Badge>}
                    {includeTables && <Badge variant="secondary" className="text-xs">Tables</Badge>}
                    {includeCharts && <Badge variant="secondary" className="text-xs">Charts</Badge>}
                    {extendedFeatures.timelines && <Badge variant="secondary" className="text-xs">Timelines</Badge>}
                    {extendedFeatures.diagrams && <Badge variant="secondary" className="text-xs">Diagrams</Badge>}
                    {extendedFeatures.icons && <Badge variant="secondary" className="text-xs">Icons</Badge>}
                    {extendedFeatures.quotes && <Badge variant="secondary" className="text-xs">Quotes</Badge>}
                    {!includeInfographics && !includeJourneyMaps && !includeTables && !includeCharts && 
                     !Object.values(extendedFeatures).some(v => v) && (
                      <span className="text-xs text-muted-foreground">No features selected</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
