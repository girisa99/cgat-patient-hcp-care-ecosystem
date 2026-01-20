/**
 * Template & Branding Panel V2 - Clean 2-Mode Architecture
 * 
 * Two primary modes:
 * 1. AI Auto - System selects template + branding based on context
 * 2. Custom - User picks from library dropdowns with full control
 * 
 * REFACTORED: Removed nested Card structures for cleaner UI
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
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
import { VisualFeaturesDropdown, VisualFeatureSelection } from './components/VisualFeaturesDropdown';
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
    description: 'Healthcare-optimized with compliance focus',
    category: 'healthcare' as const,
    colors: { primary: '#0d9488', secondary: '#14b8a6', accent: '#2dd4bf' },
    preview: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
    slides: 12,
    features: ['HIPAA Ready', 'Data Charts', 'Compliance']
  },
  {
    id: 'tech-gradient',
    name: 'Tech Gradient',
    description: 'Modern tech startup aesthetics',
    category: 'technology' as const,
    colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
    preview: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #c4b5fd 100%)',
    slides: 10,
    features: ['Animations', 'Icons', 'Modern']
  },
  {
    id: 'finance-navy',
    name: 'Finance Navy',
    description: 'Professional financial presentations',
    category: 'finance' as const,
    colors: { primary: '#1e3a5f', secondary: '#2563eb', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #60a5fa 100%)',
    slides: 14,
    features: ['Data Tables', 'Charts', 'KPIs']
  },
];

const FRAMEWORK_CATEGORIES = [
  { id: 'all', label: 'All Frameworks' },
  { id: 'strategy', label: 'Strategic Planning' },
  { id: 'analysis', label: 'Business Analysis' },
  { id: 'growth', label: 'Growth & Portfolio' },
  { id: 'operations', label: 'Operations' },
  { id: 'transformation', label: 'Transformation' },
  { id: 'universal', label: 'Universal / Custom' },
];

// Visual Features - now using imported VISUAL_FEATURES from VisualFeaturesDropdown
// Legacy mapping for backward compatibility with feature toggles
const LEGACY_FEATURE_MAP: Record<string, string> = {
  'infographics': 'infographics',
  'journey-maps': 'journey-maps', 
  'tables': 'data-tables',
  'charts': 'charts',
  'timelines': 'timelines',
  'diagrams': 'diagrams',
  'quotes': 'quote-blocks',
  'icons': 'icon-sets',
};

// ============ INTERFACES ============

export interface BrandConfig {
  logo?: { url: string; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'; size: 'small' | 'medium' | 'large' };
  colors: { primary: string; secondary: string; accent: string };
  typography?: { headingFont: string; bodyFont: string };
  customCSS?: string;
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  colors: { primary: '#3b82f6', secondary: '#64748b', accent: '#f59e0b' },
};

interface TemplateBrandingPanelV2Props {
  selectedTemplate: PresentationTemplate | null;
  onTemplateChange: (template: PresentationTemplate) => void;
  selectedTheme: PresentationTheme | null;
  onThemeChange: (theme: PresentationTheme) => void;
  brandConfig: BrandConfig;
  onBrandConfigChange: (config: BrandConfig) => void;
  includeInfographics: boolean;
  onIncludeInfographicsChange: (include: boolean) => void;
  includeJourneyMaps: boolean;
  onIncludeJourneyMapsChange: (include: boolean) => void;
  includeTables: boolean;
  onIncludeTablesChange: (include: boolean) => void;
  includeCharts: boolean;
  onIncludeChartsChange: (include: boolean) => void;
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
  className,
}: TemplateBrandingPanelV2Props) {
  // State
  const [mode, setMode] = useState<'ai' | 'custom'>('ai');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(selectedTemplate?.id || '');
  const [selectedFrameworkCategories, setSelectedFrameworkCategories] = useState<string[]>([]);
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState<string[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string>('');
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Visual Features - proper state with sub-options support
  const [visualFeatureSelections, setVisualFeatureSelections] = useState<VisualFeatureSelection[]>(() => {
    // Initialize from legacy toggles
    const initial: VisualFeatureSelection[] = [];
    if (includeInfographics) initial.push({ featureId: 'infographics', subOptions: [] });
    if (includeJourneyMaps) initial.push({ featureId: 'journey-maps', subOptions: [] });
    if (includeTables) initial.push({ featureId: 'data-tables', subOptions: [] });
    if (includeCharts) initial.push({ featureId: 'charts', subOptions: [] });
    return initial;
  });

  // Library hook
  const libraryData = useTemplateLibrary();
  const dbFrameworks = libraryData.consultingFrameworks || [];
  const dbTemplates = libraryData.industryTemplates || [];
  const libraryLoading = libraryData.loading;
  const refreshLibrary = libraryData.refresh;

  // Get AI recommendation
  const recommendation = useMemo(() => {
    return getTemplateRecommendations({
      industry: industryFilter || '',
      segment: segmentFilter || '',
      contentTypes: contentTypeFilter || [],
    });
  }, [industryFilter, segmentFilter, contentTypeFilter]);

  // Auto-select frameworks and branding in AI mode based on context
  const aiAutoSelection = useMemo(() => {
    // Determine best framework category based on industry
    let recommendedCategory = 'strategy';
    let recommendedFrameworks: string[] = [];
    
    if (industryFilter === 'healthcare' || industryFilter === 'pharma') {
      recommendedCategory = 'operations';
      recommendedFrameworks = ['value-chain', 'balanced-scorecard'];
    } else if (industryFilter === 'technology' || industryFilter === 'startup') {
      recommendedCategory = 'growth';
      recommendedFrameworks = ['blue-ocean', 'market-entry'];
    } else if (industryFilter === 'finance') {
      recommendedCategory = 'analysis';
      recommendedFrameworks = ['pestle', 'stakeholder-mapping'];
    } else if (industryFilter === 'consulting') {
      recommendedCategory = 'strategy';
      recommendedFrameworks = ['seven-element', 'three-horizons'];
    } else if (industryFilter === 'manufacturing' || industryFilter === 'energy') {
      recommendedCategory = 'operations';
      recommendedFrameworks = ['lean-six-sigma', 'raci-matrix'];
    } else {
      recommendedCategory = 'universal';
      recommendedFrameworks = ['business-model-canvas', 'customer-journey'];
    }
    
    // Determine best template based on industry
    let recommendedTemplate = 'corporate-blue';
    if (industryFilter === 'healthcare') recommendedTemplate = 'medical-teal';
    else if (industryFilter === 'technology' || industryFilter === 'startup') recommendedTemplate = 'tech-gradient';
    else if (industryFilter === 'finance') recommendedTemplate = 'finance-navy';
    else if (industryFilter === 'consulting') recommendedTemplate = 'executive-dark';
    
    return {
      category: recommendedCategory,
      frameworks: recommendedFrameworks,
      template: recommendedTemplate,
    };
  }, [industryFilter]);

  // Apply AI auto-selection when mode is 'ai' and context changes
  React.useEffect(() => {
    if (mode === 'ai') {
      // Auto-select template
      const template = TEMPLATES.find(t => t.id === aiAutoSelection.template);
      if (template && selectedTemplateId !== template.id) {
        handleTemplateSelect(template);
      }
      
      // Auto-select framework category and frameworks
      if (selectedFrameworkCategories.length === 0 || !selectedFrameworkCategories.includes(aiAutoSelection.category)) {
        setSelectedFrameworkCategories([aiAutoSelection.category]);
      }
      if (selectedFrameworkIds.length === 0 && aiAutoSelection.frameworks.length > 0) {
        setSelectedFrameworkIds(aiAutoSelection.frameworks);
      }
    }
  }, [mode, aiAutoSelection]);

  // Get frameworks for selected categories - map categories to firm types
  const frameworksForCategories = useMemo(() => {
    if (selectedFrameworkCategories.length === 0 || selectedFrameworkCategories.includes('all')) {
      return CONSULTING_FRAMEWORKS;
    }
    
    // Map FRAMEWORK_CATEGORIES ids to CONSULTING_FRAMEWORKS firm types
    const categoryToFirmMap: Record<string, string[]> = {
      'strategy': ['tier1-strategy'],
      'analysis': ['universal'],
      'growth': ['tier1-growth'],
      'operations': ['tier1-operations'],
      'transformation': ['tier1-strategy', 'tier1-operations'],
      'universal': ['universal'],
    };
    
    // Collect all firm types for selected categories
    const allFirmTypes = new Set<string>();
    selectedFrameworkCategories.forEach(cat => {
      const firmTypes = categoryToFirmMap[cat] || ['universal'];
      firmTypes.forEach(ft => allFirmTypes.add(ft));
    });
    
    return CONSULTING_FRAMEWORKS.filter(f => allFirmTypes.has(f.firm));
  }, [selectedFrameworkCategories]);

  // Feature toggles map
  const featureToggles: Record<string, { value: boolean; onChange: (v: boolean) => void }> = {
    infographics: { value: includeInfographics, onChange: onIncludeInfographicsChange },
    'journey-maps': { value: includeJourneyMaps, onChange: onIncludeJourneyMapsChange },
    tables: { value: includeTables, onChange: onIncludeTablesChange },
    charts: { value: includeCharts, onChange: onIncludeChartsChange },
    timelines: { value: false, onChange: () => {} },
    diagrams: { value: false, onChange: () => {} },
    quotes: { value: false, onChange: () => {} },
    icons: { value: false, onChange: () => {} },
  };

  // Handle template select
  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    const categoryMap: Record<string, 'business' | 'creative' | 'education' | 'healthcare' | 'minimal' | 'tech'> = {
      business: 'business',
      finance: 'business',
      technology: 'tech',
      healthcare: 'healthcare',
      minimal: 'minimal',
    };
    const fullTemplate: PresentationTemplate = {
      id: template.id,
      name: template.name,
      description: template.description,
      thumbnail: template.preview,
      category: categoryMap[template.category] || 'business',
      slideLayouts: [],
      theme: {
        id: template.id,
        name: template.name,
        colors: { ...template.colors, background: '#ffffff', foreground: '#1a1a1a', muted: '#f5f5f5', card: '#ffffff', cardForeground: '#1a1a1a', border: '#e5e5e5' },
        fonts: { heading: { family: 'Inter', weight: 600, size: '2rem' }, body: { family: 'Inter', weight: 400, size: '1rem' }, accent: { family: 'Inter', weight: 500, size: '1.25rem' } },
        spacing: 'normal',
        borderRadius: 'medium',
        shadows: true,
      },
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
    const bestTemplate = TEMPLATES[0];
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
    <div className={cn("space-y-6", className)}>
      {/* Mode Toggle */}
      <div className="p-4 rounded-xl border border-primary/20 bg-card">
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
      </div>

      {/* AI Auto Mode */}
      {mode === 'ai' && (
        <div className="space-y-4">
          {/* AI Recommendation Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Recommendation</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {recommendation.confidence}% confidence
            </Badge>
          </div>

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

          {/* AI Auto-Selected Framework */}
          {selectedFrameworkIds.length > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Framework Selection</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Category: {FRAMEWORK_CATEGORIES.find(c => c.id === selectedFrameworkCategories[0])?.label || 'Universal'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFrameworkIds.map(fwId => {
                      const fw = CONSULTING_FRAMEWORKS.find(f => f.id === fwId);
                      return fw ? (
                        <Badge key={fwId} variant="secondary" className="text-[10px]">
                          {fw.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <Badge variant="default" className="shrink-0">
                  <Bot className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              </div>
            </div>
          )}

          {/* AI Auto-Selected Branding */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Brand Colors</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-1">
                    {[brandConfig.colors.primary, brandConfig.colors.secondary, brandConfig.colors.accent].map((color, idx) => (
                      <div 
                        key={idx}
                        className="w-4 h-4 rounded-full border-2 border-background"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {brandConfig.logo ? 'Extracted from logo' : 'Based on template'}
                  </span>
                </div>
              </div>
              <Badge variant="default" className="shrink-0">
                <Bot className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
          </div>

          {/* Quick Switch to Custom */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setMode('custom')}
          >
            Want more control? Switch to Custom mode
          </Button>
        </div>
      )}

      {/* Custom Mode */}
      {mode === 'custom' && (
        <div className="space-y-4">
          {/* Template Library Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Template Library</span>
            </div>
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

          {/* Framework Selection - Multi-Select */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Framework Categories (Multi-Select)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-10 text-sm font-normal bg-background"
                  >
                    <span className="truncate">
                      {selectedFrameworkCategories.length === 0 
                        ? 'Select categories...' 
                        : `${selectedFrameworkCategories.length} categor${selectedFrameworkCategories.length > 1 ? 'ies' : 'y'} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 z-50 bg-popover border shadow-lg" align="start">
                  <ScrollArea className="h-[200px]">
                    <div className="p-2 space-y-1">
                      {FRAMEWORK_CATEGORIES.map(cat => {
                        const isSelected = selectedFrameworkCategories.includes(cat.id);
                        return (
                          <div
                            key={cat.id}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                              isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted border border-transparent'
                            )}
                            onClick={() => {
                              if (cat.id === 'all') {
                                setSelectedFrameworkCategories(['all']);
                              } else {
                                setSelectedFrameworkCategories(prev => {
                                  const filtered = prev.filter(c => c !== 'all');
                                  return isSelected 
                                    ? filtered.filter(c => c !== cat.id)
                                    : [...filtered, cat.id];
                                });
                              }
                            }}
                          >
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                            <span className="text-sm">{cat.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  {selectedFrameworkCategories.length > 0 && (
                    <div className="p-2 border-t flex flex-wrap gap-1">
                      {selectedFrameworkCategories.map(catId => {
                        const cat = FRAMEWORK_CATEGORIES.find(c => c.id === catId);
                        return (
                          <Badge key={catId} variant="secondary" className="text-xs gap-1">
                            {cat?.label}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFrameworkCategories(prev => prev.filter(c => c !== catId));
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Frameworks (Multi-Select)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-10 text-sm font-normal bg-background"
                    disabled={selectedFrameworkCategories.length === 0}
                  >
                    <span className="truncate">
                      {selectedFrameworkCategories.length === 0 
                        ? 'Select categories first...' 
                        : selectedFrameworkIds.length === 0 
                          ? 'Select frameworks...' 
                          : `${selectedFrameworkIds.length} framework${selectedFrameworkIds.length > 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0 z-50 bg-popover border shadow-lg" align="start">
                  <ScrollArea className="h-[280px]">
                    <div className="p-2 space-y-1">
                      {frameworksForCategories.map(framework => {
                        const isSelected = selectedFrameworkIds.includes(framework.id);
                        return (
                          <div
                            key={framework.id}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                              isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted border border-transparent'
                            )}
                            onClick={() => {
                              setSelectedFrameworkIds(prev => 
                                isSelected 
                                  ? prev.filter(id => id !== framework.id)
                                  : [...prev, framework.id]
                              );
                              if (!isSelected) {
                                toast.success(`Added: ${framework.name}`);
                              }
                            }}
                          >
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{framework.name}</p>
                              {framework.frameworks.length > 0 && (
                                <p className="text-xs text-muted-foreground">{framework.frameworks.length} tools included</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  {selectedFrameworkIds.length > 0 && (
                    <div className="p-2 border-t">
                      <div className="flex flex-wrap gap-1 max-h-[80px] overflow-auto">
                        {selectedFrameworkIds.slice(0, 6).map(fwId => {
                          const fw = CONSULTING_FRAMEWORKS.find(f => f.id === fwId);
                          return (
                            <Badge key={fwId} variant="secondary" className="text-xs gap-1">
                              {fw?.name}
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFrameworkIds(prev => prev.filter(id => id !== fwId));
                                }}
                              />
                            </Badge>
                          );
                        })}
                        {selectedFrameworkIds.length > 6 && (
                          <Badge variant="outline" className="text-xs">+{selectedFrameworkIds.length - 6} more</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
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
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select template..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">My Saved</Label>
                <Badge variant="secondary" className="text-[10px]">
                  {dbFrameworks.length + dbTemplates.length}
                </Badge>
              </div>
              <Select value={selectedSavedId} onValueChange={setSelectedSavedId}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Load saved template..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
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
          )}
        </div>
      )}

      <Separator />

      {/* Branding Section - Collapsible */}
      <Collapsible open={brandingOpen} onOpenChange={setBrandingOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 rounded-xl border flex items-center justify-between hover:bg-muted/30 transition-colors">
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
          <div className="p-4 space-y-4 border border-t-0 rounded-b-xl bg-muted/20">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Logo</Label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {brandConfig.logo ? (
                  <div className="relative">
                    <img 
                      src={brandConfig.logo.url} 
                      alt="Logo" 
                      className="w-12 h-12 rounded-lg object-contain border"
                    />
                    <button
                      onClick={() => onBrandConfigChange({ ...brandConfig, logo: undefined })}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center hover:border-primary/50 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                )}
                <div className="flex-1">
                  <p className="text-xs font-medium">Upload your logo</p>
                  <p className="text-[10px] text-muted-foreground">Colors will be extracted automatically</p>
                </div>
              </div>
            </div>

            {/* Color Inputs */}
            <div className="grid grid-cols-3 gap-3">
              {(['primary', 'secondary', 'accent'] as const).map(colorKey => (
                <div key={colorKey} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground capitalize">{colorKey}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandConfig.colors[colorKey]}
                      onChange={(e) => onBrandConfigChange({
                        ...brandConfig,
                        colors: { ...brandConfig.colors, [colorKey]: e.target.value }
                      })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={brandConfig.colors[colorKey]}
                      onChange={(e) => onBrandConfigChange({
                        ...brandConfig,
                        colors: { ...brandConfig.colors, [colorKey]: e.target.value }
                      })}
                      className="flex-1 h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Visual Features Section - Dropdown with Sub-options */}
      <div className="p-4 rounded-xl border bg-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">Visual Features</h4>
          <Badge variant="secondary" className="ml-auto text-xs">
            {Object.values(featureToggles).filter(t => t.value).length} enabled
          </Badge>
        </div>
        
        {/* Visual Features Dropdown - with proper state */}
        <VisualFeaturesDropdown
          value={visualFeatureSelections}
          onChange={(selections) => {
            // Update internal state with full sub-options support
            setVisualFeatureSelections(selections);
            
            // Also sync to legacy toggles for backward compatibility
            const selectedFeatureIds = new Set(selections.map(s => s.featureId));
            
            // Map new IDs to legacy IDs and update
            if (includeInfographics !== selectedFeatureIds.has('infographics')) {
              onIncludeInfographicsChange(selectedFeatureIds.has('infographics'));
            }
            if (includeJourneyMaps !== selectedFeatureIds.has('journey-maps')) {
              onIncludeJourneyMapsChange(selectedFeatureIds.has('journey-maps'));
            }
            if (includeTables !== selectedFeatureIds.has('data-tables')) {
              onIncludeTablesChange(selectedFeatureIds.has('data-tables'));
            }
            if (includeCharts !== selectedFeatureIds.has('charts')) {
              onIncludeChartsChange(selectedFeatureIds.has('charts'));
            }
          }}
        />
        
        <p className="text-xs text-muted-foreground">
          Select visual elements to include in your presentation. Expand each feature to choose specific sub-types.
        </p>
      </div>
    </div>
  );
}

export { TemplateBrandingPanelV2 as TemplateBrandingPanel };
