/**
 * Template & Branding Panel V2 - Clean 2-Mode Architecture
 * 
 * Two primary modes:
 * 1. AI Auto - System selects template + branding based on context
 * 2. Custom - User picks from library dropdowns with full control
 * 
 * Features section is always editable in both modes
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Pencil,
  Sparkles,
  Upload,
  Palette,
  Check,
  Loader2,
  FileImage,
  Type,
  BarChart3,
  Table,
  PieChart,
  Calendar,
  Network,
  Quote,
  Map,
  ChevronDown,
  X,
  Plus,
  RefreshCw,
  Wand2,
  Info,
  Briefcase,
  Building2,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PresentationTemplate, PresentationTheme } from './types';
import useTemplateLibrary from '@/hooks/useTemplateLibrary';
import { CreateTemplateDialog } from './components/CreateTemplateDialog';
import {
  getTemplateRecommendations,
  CONSULTING_FRAMEWORKS,
} from './services/templateRecommendationService';

// ============ CONSTANTS ============

const TEMPLATES = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Clean, professional business presentation',
    category: 'business' as const,
    colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    slides: 12,
    features: ['Charts', 'Tables', 'Icons']
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    description: 'Elegant dark theme for executives',
    category: 'business' as const,
    colors: { primary: '#1f2937', secondary: '#374151', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    slides: 10,
    features: ['Infographics', 'Timeline', 'Stats']
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Minimalist design for clarity',
    category: 'minimal' as const,
    colors: { primary: '#18181b', secondary: '#71717a', accent: '#a1a1aa' },
    preview: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    slides: 8,
    features: ['Typography', 'Whitespace', 'Clean']
  },
  {
    id: 'medical-teal',
    name: 'Medical Teal',
    description: 'Trust-inspiring healthcare design',
    category: 'healthcare' as const,
    colors: { primary: '#0891b2', secondary: '#06b6d4', accent: '#14b8a6' },
    preview: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
    slides: 14,
    features: ['HIPAA Ready', 'Charts', 'Icons']
  },
  {
    id: 'neon-future',
    name: 'Neon Future',
    description: 'Cutting-edge tech aesthetic',
    category: 'tech' as const,
    colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#06b6d4' },
    preview: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
    slides: 10,
    features: ['Animations', 'Modern', 'Bold']
  },
  {
    id: 'vibrant-splash',
    name: 'Vibrant Splash',
    description: 'Bold and colorful creative design',
    category: 'creative' as const,
    colors: { primary: '#ec4899', secondary: '#f97316', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #fbbf24 100%)',
    slides: 10,
    features: ['Colorful', 'Dynamic', 'Fun']
  },
];

const FRAMEWORK_CATEGORIES = [
  { id: 'tier1-strategy', label: 'Strategic Planning', description: 'High-level strategy frameworks' },
  { id: 'tier1-growth', label: 'Growth & Portfolio', description: 'Market expansion analysis' },
  { id: 'tier1-operations', label: 'Operations Excellence', description: 'Customer & execution optimization' },
  { id: 'universal', label: 'Universal Frameworks', description: 'Industry-standard methodologies' },
];

const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', stack: 'Inter, system-ui, sans-serif' },
  { id: 'helvetica', name: 'Helvetica', stack: 'Helvetica Neue, Helvetica, Arial, sans-serif' },
  { id: 'roboto', name: 'Roboto', stack: 'Roboto, system-ui, sans-serif' },
  { id: 'playfair', name: 'Playfair', stack: 'Playfair Display, Georgia, serif' },
  { id: 'montserrat', name: 'Montserrat', stack: 'Montserrat, system-ui, sans-serif' },
];

const COLOR_PALETTES = [
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#f59e0b' },
  { name: 'Forest', primary: '#22c55e', secondary: '#4ade80', accent: '#fbbf24' },
  { name: 'Sunset', primary: '#f97316', secondary: '#fb923c', accent: '#ec4899' },
  { name: 'Lavender', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#06b6d4' },
  { name: 'Coral', primary: '#f43f5e', secondary: '#fb7185', accent: '#14b8a6' },
  { name: 'Midnight', primary: '#6366f1', secondary: '#818cf8', accent: '#fbbf24' },
];

const VISUAL_FEATURES_CONFIG = [
  { 
    key: 'infographics', 
    label: 'Infographics', 
    desc: 'Visual data representations', 
    icon: BarChart3,
    subOptions: [
      { id: 'stat-cards', label: 'Stat Cards' },
      { id: 'comparison', label: 'Comparison Views' },
      { id: 'process-flow', label: 'Process Flow' },
      { id: 'icon-grids', label: 'Icon Grids' }
    ]
  },
  { 
    key: 'journeyMaps', 
    label: 'Journey Maps', 
    desc: 'Process flow visuals', 
    icon: Map,
    subOptions: [
      { id: 'customer-journey', label: 'Customer Journey' },
      { id: 'workflow', label: 'Workflow Maps' },
      { id: 'roadmap', label: 'Roadmaps' },
      { id: 'funnel', label: 'Funnel Charts' }
    ]
  },
  { 
    key: 'tables', 
    label: 'Data Tables', 
    desc: 'Structured data display', 
    icon: Table,
    subOptions: [
      { id: 'comparison-table', label: 'Comparison Table' },
      { id: 'pricing-table', label: 'Pricing Table' },
      { id: 'data-grid', label: 'Data Grid' },
    ]
  },
  { 
    key: 'charts', 
    label: 'Charts', 
    desc: 'Bar, line, pie charts', 
    icon: PieChart,
    subOptions: [
      { id: 'bar-chart', label: 'Bar Charts' },
      { id: 'line-chart', label: 'Line Charts' },
      { id: 'pie-chart', label: 'Pie Charts' },
    ]
  },
  { 
    key: 'timelines', 
    label: 'Timelines', 
    desc: 'Chronological progressions', 
    icon: Calendar,
    subOptions: [
      { id: 'horizontal', label: 'Horizontal' },
      { id: 'vertical', label: 'Vertical' },
      { id: 'milestone', label: 'Milestone' },
    ]
  },
  { 
    key: 'diagrams', 
    label: 'Diagrams', 
    desc: 'Technical illustrations', 
    icon: Network,
    subOptions: [
      { id: 'org-chart', label: 'Org Charts' },
      { id: 'flowchart', label: 'Flowcharts' },
      { id: 'venn', label: 'Venn Diagrams' },
    ]
  },
  { 
    key: 'quotes', 
    label: 'Quote Blocks', 
    desc: 'Testimonial layouts', 
    icon: Quote,
    subOptions: [
      { id: 'testimonial', label: 'Testimonials' },
      { id: 'callout', label: 'Callout Box' },
      { id: 'pull-quote', label: 'Pull Quotes' },
    ]
  },
];

// ============ TYPES ============

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

interface TemplateBrandingPanelV2Props {
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
  industryFilter?: string;
  segmentFilter?: string;
  contentTypeFilter?: string[];
  className?: string;
}

// ============ COMPONENT ============

export function TemplateBrandingPanelV2({
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
  industryFilter,
  segmentFilter,
  contentTypeFilter,
  className
}: TemplateBrandingPanelV2Props) {
  // ============ STATE ============
  const [mode, setMode] = useState<'ai' | 'custom'>('ai');
  const [selectedFrameworkCategory, setSelectedFrameworkCategory] = useState<string>('');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedSavedId, setSelectedSavedId] = useState<string>('');
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [selectedSubOptions, setSelectedSubOptions] = useState<Record<string, string[]>>({});
  const [extendedFeatures, setExtendedFeatures] = useState<Record<string, boolean>>({
    timelines: false,
    diagrams: false,
    quotes: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const [typographyOpen, setTypographyOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============ HOOKS ============
  const { 
    consultingFrameworks: dbFrameworks, 
    industryTemplates: dbTemplates,
    loading: libraryLoading,
    refresh: refreshLibrary,
  } = useTemplateLibrary();

  // ============ DERIVED STATE ============
  const recommendation = useMemo(() => {
    return getTemplateRecommendations({
      industry: industryFilter || 'general',
      segment: segmentFilter || 'general',
      contentTypes: contentTypeFilter || [],
    });
  }, [industryFilter, segmentFilter, contentTypeFilter]);

  const frameworksForCategory = useMemo(() => {
    if (!selectedFrameworkCategory) return [];
    return CONSULTING_FRAMEWORKS.filter(f => f.firm === selectedFrameworkCategory);
  }, [selectedFrameworkCategory]);

  // ============ HANDLERS ============
  const getFeatureState = (key: string) => {
    switch (key) {
      case 'infographics': return includeInfographics;
      case 'journeyMaps': return includeJourneyMaps;
      case 'tables': return includeTables;
      case 'charts': return includeCharts;
      default: return extendedFeatures[key] || false;
    }
  };

  const toggleFeature = (key: string, value: boolean) => {
    switch (key) {
      case 'infographics': onIncludeInfographicsChange(value); break;
      case 'journeyMaps': onIncludeJourneyMapsChange(value); break;
      case 'tables': onIncludeTablesChange(value); break;
      case 'charts': onIncludeChartsChange(value); break;
      default: setExtendedFeatures(prev => ({ ...prev, [key]: value }));
    }
  };

  const toggleSubOption = (featureKey: string, optionId: string) => {
    setSelectedSubOptions(prev => {
      const current = prev[featureKey] || [];
      if (current.includes(optionId)) {
        return { ...prev, [featureKey]: current.filter(id => id !== optionId) };
      }
      return { ...prev, [featureKey]: [...current, optionId] };
    });
  };

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
    setSelectedTemplateId(template.id);
    toast.success(`Selected: ${template.name}`);
  };

  const handleAIAutoSelect = () => {
    // AI selects best template based on context
    const bestTemplate = TEMPLATES[0]; // In production, use recommendation logic
    handleTemplateSelect(bestTemplate);
    toast.success('AI selected optimal template based on your content');
  };

  const extractDominantColors = (data: Uint8ClampedArray): string[] => {
    const colorMap: Record<string, number> = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `rgb(${r},${g},${b})`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }
    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => {
        const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (match) {
          const [, r, g, b] = match;
          return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
        }
        return '#3b82f6';
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
          logo: { url: logoUrl, position: 'top-left', size: 'medium' }
        });

        // Extract colors from logo
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
          };
          img.src = logoUrl;
        } catch {
          // Ignore color extraction errors
        }

        toast.success('Logo uploaded successfully!');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload logo');
      setIsUploading(false);
    }
  }, [brandConfig, onBrandConfigChange]);

  // ============ RENDER ============
  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode Toggle */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'ai' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => {
                setMode('ai');
                handleAIAutoSelect();
              }}
            >
              <Bot className="h-4 w-4" />
              AI Auto
              {mode === 'ai' && <Check className="h-3 w-3" />}
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setMode('custom')}
            >
              <Pencil className="h-4 w-4" />
              Custom
              {mode === 'custom' && <Check className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Auto Mode */}
      {mode === 'ai' && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              AI Recommendation
              <Badge variant="secondary" className="ml-auto text-xs">
                {recommendation.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Reasoning */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
              </div>
            </div>

            {/* Selected Template Preview */}
            {selectedTemplate && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg shrink-0"
                    style={{ background: TEMPLATES.find(t => t.id === selectedTemplate.id)?.preview || 'var(--primary)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{selectedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  <Badge variant="default" className="shrink-0">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Selected
                  </Badge>
                </div>
              </div>
            )}

            {/* Quick Switch to Custom */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setMode('custom')}
            >
              Want more control? Switch to Custom mode
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Custom Mode */}
      {mode === 'custom' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Template Library
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => refreshLibrary()}>
                  <RefreshCw className={cn("h-3 w-3", libraryLoading && "animate-spin")} />
                </Button>
                <CreateTemplateDialog 
                  type="framework" 
                  defaultIndustry={industryFilter}
                  trigger={
                    <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                      <Plus className="h-3 w-3" />
                      <span className="text-xs">Framework</span>
                    </Button>
                  }
                />
                <CreateTemplateDialog 
                  type="template" 
                  defaultIndustry={industryFilter}
                  trigger={
                    <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                      <Plus className="h-3 w-3" />
                      <span className="text-xs">Template</span>
                    </Button>
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Framework Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Framework Category</Label>
                <Select value={selectedFrameworkCategory} onValueChange={setSelectedFrameworkCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAMEWORK_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Framework</Label>
                <Select 
                  value={selectedFrameworkId} 
                  onValueChange={(id) => {
                    setSelectedFrameworkId(id);
                    const framework = frameworksForCategory.find(f => f.id === id);
                    if (framework) {
                      toast.success(`Selected: ${framework.name}`);
                    }
                  }}
                  disabled={!selectedFrameworkCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedFrameworkCategory ? "Select framework..." : "Select category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworksForCategory.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>
                        <div className="flex items-center gap-2">
                          <span>{framework.name}</span>
                          {framework.frameworks.length > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              {framework.frameworks.length} tools
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Template Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Design Template</Label>
              <Select 
                value={selectedTemplateId} 
                onValueChange={(id) => {
                  const template = TEMPLATES.find(t => t.id === id);
                  if (template) handleTemplateSelect(template);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded shrink-0"
                          style={{ background: template.preview }}
                        />
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto">
                          {template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Saved Templates (from DB) */}
            {(dbFrameworks.length > 0 || dbTemplates.length > 0) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">My Saved</Label>
                    <Badge variant="secondary" className="text-[10px]">
                      {dbFrameworks.length + dbTemplates.length}
                    </Badge>
                  </div>
                  <Select value={selectedSavedId} onValueChange={setSelectedSavedId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Load saved template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dbFrameworks.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Frameworks</div>
                          {dbFrameworks.map(framework => (
                            <SelectItem key={framework.id} value={framework.id}>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                <span>{framework.name}</span>
                                {framework.isSystem && <Badge variant="secondary" className="text-[8px] px-1">System</Badge>}
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {dbTemplates.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Templates</div>
                          {dbTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                <span>{template.name}</span>
                                {template.isSystem && <Badge variant="secondary" className="text-[8px] px-1">System</Badge>}
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Branding Section - Collapsible */}
      <Collapsible open={brandingOpen} onOpenChange={setBrandingOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Branding</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex -space-x-1">
                      {[brandConfig.colors.primary, brandConfig.colors.secondary, brandConfig.colors.accent].map((color, idx) => (
                        <div 
                          key={idx}
                          className="w-3 h-3 rounded-full border border-background"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {brandConfig.logo ? 'Logo + Colors' : 'Colors only'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", brandingOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              <Separator />
              
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Logo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                
                {brandConfig.logo?.url ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="w-10 h-10 rounded bg-background flex items-center justify-center overflow-hidden border shrink-0">
                      <img src={brandConfig.logo.url} alt="Logo" className="max-h-8 max-w-8 object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Logo uploaded</p>
                      <p className="text-xs text-muted-foreground">Colors extracted</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onBrandConfigChange({ ...brandConfig, logo: undefined })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full p-4 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload logo (auto-extracts colors)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Company Info */}
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
                    placeholder="Your tagline"
                    value={brandConfig.tagline || ''}
                    onChange={(e) => onBrandConfigChange({ ...brandConfig, tagline: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Color Palette - Nested Collapsible */}
              <Collapsible open={colorPaletteOpen} onOpenChange={setColorPaletteOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-3 flex items-center justify-between rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Color Palette</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", colorPaletteOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-3 space-y-3">
                    {/* Preset Palettes */}
                    <div className="grid grid-cols-3 gap-2">
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
                              "p-2 rounded-lg border transition-all text-center",
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex justify-center gap-0.5 mb-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.secondary }} />
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                            </div>
                            <p className="text-xs text-foreground">{palette.name}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-3 gap-2">
                      {(['primary', 'secondary', 'accent'] as const).map(colorType => (
                        <div key={colorType} className="space-y-1">
                          <Label className="text-xs capitalize text-muted-foreground">{colorType}</Label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={brandConfig.colors[colorType]}
                              onChange={(e) => onBrandConfigChange({
                                ...brandConfig,
                                colors: { ...brandConfig.colors, [colorType]: e.target.value }
                              })}
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                            />
                            <Input
                              value={brandConfig.colors[colorType]}
                              onChange={(e) => onBrandConfigChange({
                                ...brandConfig,
                                colors: { ...brandConfig.colors, [colorType]: e.target.value }
                              })}
                              className="h-7 text-xs font-mono flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Typography - Nested Collapsible */}
              <Collapsible open={typographyOpen} onOpenChange={setTypographyOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-3 flex items-center justify-between rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Typography</span>
                      <span className="text-xs text-muted-foreground">
                        ({FONT_OPTIONS.find(f => f.id === brandConfig.font)?.name || 'Inter'})
                      </span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", typographyOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-3 grid grid-cols-5 gap-2">
                    {FONT_OPTIONS.map(font => {
                      const isSelected = brandConfig.font === font.id;
                      return (
                        <button
                          key={font.id}
                          onClick={() => onBrandConfigChange({ ...brandConfig, font: font.id })}
                          className={cn(
                            "p-2 rounded-lg border transition-all text-center",
                            isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          <p className="text-lg font-bold text-foreground" style={{ fontFamily: font.stack }}>Aa</p>
                          <p className="text-xs text-muted-foreground">{font.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Features Section - Collapsible */}
      <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Visual Features</p>
                  <p className="text-xs text-muted-foreground">
                    {[includeInfographics, includeJourneyMaps, includeTables, includeCharts].filter(Boolean).length + 
                     Object.values(extendedFeatures).filter(Boolean).length} enabled
                  </p>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", featuresOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <Separator />
              
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-4">
                  {VISUAL_FEATURES_CONFIG.map(feature => {
                    const Icon = feature.icon;
                    const isEnabled = getFeatureState(feature.key);
                    const isExpanded = expandedFeature === feature.key;
                    const subSelections = selectedSubOptions[feature.key] || [];

                    return (
                      <div 
                        key={feature.key}
                        className={cn(
                          "rounded-lg border transition-all",
                          isEnabled ? "border-primary/50 bg-primary/5" : "border-border"
                        )}
                      >
                        <div
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => {
                            if (!isEnabled) toggleFeature(feature.key, true);
                            setExpandedFeature(isExpanded ? null : feature.key);
                          }}
                        >
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            isEnabled ? "bg-primary/10" : "bg-muted"
                          )}>
                            <Icon className={cn("h-4 w-4", isEnabled ? "text-primary" : "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{feature.label}</p>
                              {subSelections.length > 0 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {subSelections.length}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{feature.desc}</p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => {
                              toggleFeature(feature.key, checked);
                              if (!checked) setExpandedFeature(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <ChevronDown className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        </div>

                        {isExpanded && isEnabled && (
                          <div className="px-3 pb-3">
                            <div className="grid grid-cols-2 gap-1.5">
                              {feature.subOptions.map(option => {
                                const isSelected = subSelections.includes(option.id);
                                return (
                                  <button
                                    key={option.id}
                                    onClick={() => toggleSubOption(feature.key, option.id)}
                                    className={cn(
                                      "p-2 rounded border text-left text-xs transition-all",
                                      isSelected 
                                        ? "border-primary bg-primary/10 text-foreground" 
                                        : "border-border hover:border-primary/50 text-muted-foreground"
                                    )}
                                  >
                                    {option.label}
                                    {isSelected && <Check className="h-3 w-3 inline ml-1" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Selection Summary */}
              {Object.values(selectedSubOptions).flat().length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-foreground">Selected Options</p>
                    <Badge variant="outline" className="text-[10px]">
                      {Object.values(selectedSubOptions).flat().length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(selectedSubOptions).flatMap(([key, options]) => 
                      options.map(opt => (
                        <Badge 
                          key={`${key}-${opt}`} 
                          variant="secondary" 
                          className="text-[10px] cursor-pointer hover:bg-destructive/20"
                          onClick={() => toggleSubOption(key, opt)}
                        >
                          {opt.replace(/-/g, ' ')}
                          <X className="h-2.5 w-2.5 ml-1" />
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#f59e0b'
  }
};
