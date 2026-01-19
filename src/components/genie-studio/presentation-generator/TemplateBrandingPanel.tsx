/**
 * Enterprise Template & Branding Panel
 * Redesigned with consistent UI matching ContentContextPanel
 * Clean cards, no overflow, clickable feature cards with sub-options
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Briefcase,
  Paintbrush,
  Zap,
  Sparkles,
  Upload,
  Palette,
  Check,
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
  Layout,
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
  Map,
  Workflow,
  LineChart,
  Activity,
  Network,
  Presentation,
  X
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PresentationTemplate, PresentationTheme } from './types';
import { TemplateRepository } from './TemplateRepository';
import { TemplateRecommendationPanel } from './components/TemplateRecommendationPanel';
import { RecommendedTemplate } from './services/templateRecommendationService';

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

type TemplateCategory = 'business' | 'creative' | 'minimal' | 'healthcare' | 'tech' | 'education';

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
    description: 'Clean, professional business presentation',
    category: 'business',
    colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    slides: 12,
    features: ['Charts', 'Tables', 'Icons']
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    description: 'Elegant dark theme for executives',
    category: 'business',
    colors: { primary: '#1f2937', secondary: '#374151', accent: '#f59e0b' },
    preview: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    slides: 10,
    features: ['Infographics', 'Timeline', 'Stats']
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Minimalist design for clarity',
    category: 'minimal',
    colors: { primary: '#18181b', secondary: '#71717a', accent: '#a1a1aa' },
    preview: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    slides: 8,
    features: ['Typography', 'Whitespace', 'Clean']
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    description: 'Light and airy minimal style',
    category: 'minimal',
    colors: { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
    preview: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
    slides: 8,
    features: ['Simple', 'Elegant', 'Focus']
  },
  {
    id: 'medical-teal',
    name: 'Medical Teal',
    description: 'Trust-inspiring healthcare design',
    category: 'healthcare',
    colors: { primary: '#0891b2', secondary: '#06b6d4', accent: '#14b8a6' },
    preview: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
    slides: 14,
    features: ['HIPAA Ready', 'Charts', 'Icons']
  },
  {
    id: 'clinical-white',
    name: 'Clinical White',
    description: 'Clean clinical presentation',
    category: 'healthcare',
    colors: { primary: '#0d9488', secondary: '#2dd4bf', accent: '#5eead4' },
    preview: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)',
    slides: 12,
    features: ['Clean', 'Professional', 'Data']
  },
  {
    id: 'neon-future',
    name: 'Neon Future',
    description: 'Cutting-edge tech aesthetic',
    category: 'tech',
    colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#06b6d4' },
    preview: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
    slides: 10,
    features: ['Animations', 'Modern', 'Bold']
  },
  {
    id: 'cyber-dark',
    name: 'Cyber Dark',
    description: 'Modern dark tech theme',
    category: 'tech',
    colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#22d3ee' },
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    slides: 12,
    features: ['Dark Mode', 'Tech', 'Sharp']
  },
  {
    id: 'vibrant-splash',
    name: 'Vibrant Splash',
    description: 'Bold and colorful creative design',
    category: 'creative',
    colors: { primary: '#ec4899', secondary: '#f97316', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #fbbf24 100%)',
    slides: 10,
    features: ['Colorful', 'Dynamic', 'Fun']
  },
  {
    id: 'artistic-gradient',
    name: 'Artistic Gradient',
    description: 'Artistic multi-color theme',
    category: 'creative',
    colors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#06b6d4' },
    preview: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)',
    slides: 8,
    features: ['Artistic', 'Vibrant', 'Modern']
  },
  {
    id: 'academic-navy',
    name: 'Academic Navy',
    description: 'Traditional educational style',
    category: 'education',
    colors: { primary: '#1e3a5f', secondary: '#2563eb', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)',
    slides: 14,
    features: ['Academic', 'Structured', 'Clear']
  },
  {
    id: 'learning-green',
    name: 'Learning Green',
    description: 'Fresh engaging training theme',
    category: 'education',
    colors: { primary: '#166534', secondary: '#22c55e', accent: '#fbbf24' },
    preview: 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #4ade80 100%)',
    slides: 12,
    features: ['Engaging', 'Fresh', 'Friendly']
  }
];

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

// Visual Features with Sub-Options
const VISUAL_FEATURES_CONFIG = [
  { 
    key: 'infographics', 
    label: 'Infographics', 
    desc: 'Visual data representations', 
    icon: BarChart3,
    subOptions: [
      { id: 'stat-cards', label: 'Stat Cards', desc: 'Key metrics display' },
      { id: 'comparison', label: 'Comparison Views', desc: 'Side-by-side analysis' },
      { id: 'process-flow', label: 'Process Flow', desc: 'Step-by-step visuals' },
      { id: 'icon-grids', label: 'Icon Grids', desc: 'Feature showcases' }
    ]
  },
  { 
    key: 'journeyMaps', 
    label: 'Journey Maps', 
    desc: 'Process flow visuals', 
    icon: Map,
    subOptions: [
      { id: 'customer-journey', label: 'Customer Journey', desc: 'User experience path' },
      { id: 'workflow', label: 'Workflow Maps', desc: 'Process documentation' },
      { id: 'roadmap', label: 'Roadmaps', desc: 'Timeline planning' },
      { id: 'funnel', label: 'Funnel Charts', desc: 'Conversion flows' }
    ]
  },
  { 
    key: 'tables', 
    label: 'Data Tables', 
    desc: 'Structured data display', 
    icon: Table,
    subOptions: [
      { id: 'comparison-table', label: 'Comparison Table', desc: 'Feature matrices' },
      { id: 'pricing-table', label: 'Pricing Table', desc: 'Plan comparisons' },
      { id: 'data-grid', label: 'Data Grid', desc: 'Detailed information' },
      { id: 'schedule', label: 'Schedule Table', desc: 'Timeline grids' }
    ]
  },
  { 
    key: 'charts', 
    label: 'Charts', 
    desc: 'Bar, line, pie charts', 
    icon: PieChart,
    subOptions: [
      { id: 'bar-chart', label: 'Bar Charts', desc: 'Category comparisons' },
      { id: 'line-chart', label: 'Line Charts', desc: 'Trend analysis' },
      { id: 'pie-chart', label: 'Pie Charts', desc: 'Distribution views' },
      { id: 'area-chart', label: 'Area Charts', desc: 'Volume tracking' }
    ]
  }
];

// Additional Features with Sub-Options
const ADDITIONAL_FEATURES_CONFIG = [
  { 
    key: 'timelines', 
    label: 'Timelines', 
    desc: 'Chronological progressions', 
    icon: Calendar,
    subOptions: [
      { id: 'horizontal', label: 'Horizontal', desc: 'Left to right flow' },
      { id: 'vertical', label: 'Vertical', desc: 'Top to bottom flow' },
      { id: 'milestone', label: 'Milestone', desc: 'Key achievements' },
      { id: 'gantt', label: 'Gantt Style', desc: 'Project timelines' }
    ]
  },
  { 
    key: 'diagrams', 
    label: 'Diagrams', 
    desc: 'Technical illustrations', 
    icon: Network,
    subOptions: [
      { id: 'org-chart', label: 'Org Charts', desc: 'Hierarchy views' },
      { id: 'flowchart', label: 'Flowcharts', desc: 'Decision trees' },
      { id: 'venn', label: 'Venn Diagrams', desc: 'Overlap analysis' },
      { id: 'architecture', label: 'Architecture', desc: 'System designs' }
    ]
  },
  { 
    key: 'icons', 
    label: 'Icon Sets', 
    desc: 'Visual iconography', 
    icon: Sparkles,
    subOptions: [
      { id: 'outline', label: 'Outline Icons', desc: 'Clean line style' },
      { id: 'filled', label: 'Filled Icons', desc: 'Solid style' },
      { id: 'colored', label: 'Colored Icons', desc: 'Multi-color' },
      { id: 'custom', label: 'Custom Icons', desc: 'Brand specific' }
    ]
  },
  { 
    key: 'quotes', 
    label: 'Quote Blocks', 
    desc: 'Testimonial layouts', 
    icon: Quote,
    subOptions: [
      { id: 'testimonial', label: 'Testimonials', desc: 'Customer quotes' },
      { id: 'callout', label: 'Callout Box', desc: 'Key highlights' },
      { id: 'pull-quote', label: 'Pull Quotes', desc: 'Emphasis text' },
      { id: 'citation', label: 'Citations', desc: 'Source references' }
    ]
  }
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
  industryFilter?: string;
  segmentFilter?: string;
  contentTypeFilter?: string[];
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
  industryFilter,
  segmentFilter,
  contentTypeFilter,
  className
}: TemplateBrandingPanelProps) {
  const [activeTab, setActiveTab] = useState<'ai-recommendations' | 'templates' | 'repository' | 'branding' | 'features'>('ai-recommendations');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAIDefault, setIsAIDefault] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [showColorPalettes, setShowColorPalettes] = useState(false);
  const [showTypography, setShowTypography] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [selectedSubOptions, setSelectedSubOptions] = useState<Record<string, string[]>>({});
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
        } catch {
          setIsExtractingColors(false);
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
    const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    handleTemplateSelect(randomTemplate);
    toast.success(`AI selected: ${randomTemplate.name}`);
  };

  // Render Feature Card with Sub-Options
  const renderFeatureCard = (feature: typeof VISUAL_FEATURES_CONFIG[0], isCore: boolean = true) => {
    const Icon = feature.icon;
    const isEnabled = getFeatureState(feature.key);
    const isExpanded = expandedFeature === feature.key;
    const subSelections = selectedSubOptions[feature.key] || [];

    return (
      <Card 
        key={feature.key}
        className={cn(
          "overflow-hidden transition-all",
          isEnabled ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        {/* Feature Header - Clickable */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => {
            if (!isEnabled) {
              toggleFeature(feature.key, true);
            }
            setExpandedFeature(isExpanded ? null : feature.key);
          }}
        >
          <div className={cn(
            "p-2.5 rounded-lg shrink-0",
            isEnabled ? "bg-primary/10" : "bg-muted"
          )}>
            <Icon className={cn("h-5 w-5", isEnabled ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{feature.label}</p>
              {subSelections.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {subSelections.length} selected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{feature.desc}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
        </div>

        {/* Sub-Options - Expandable */}
        {isExpanded && isEnabled && (
          <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground py-2">Select sub-options:</p>
            <div className="grid grid-cols-2 gap-2">
              {feature.subOptions.map(option => {
                const isSelected = subSelections.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleSubOption(feature.key, option.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                    )}>
                      {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{option.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{option.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header - Consistent with ContentContextPanel */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Template & Branding</h3>
            <p className="text-sm text-muted-foreground">Choose template and customize branding</p>
          </div>
        </div>
        {isAIDefault && (
          <Badge variant="default" className="gap-1">
            <Bot className="h-3 w-3" />
            AI Mode
          </Badge>
        )}
      </div>

      {/* Tab Navigation - Clean Grid (Matches Step 1 Add Source Buttons) */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { id: 'ai-recommendations', label: 'AI', icon: Wand2 },
          { id: 'templates', label: 'Templates', icon: Layout },
          { id: 'repository', label: 'Saved', icon: Layers },
          { id: 'branding', label: 'Branding', icon: Palette },
          { id: 'features', label: 'Features', icon: Settings2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-auto py-3 flex flex-col items-center gap-1.5",
                isActive && "shadow-md"
              )}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* AI Recommendations Tab */}
      {activeTab === 'ai-recommendations' && (
        <div className="space-y-4">
          <TemplateRecommendationPanel
            industry={industryFilter || 'general'}
            segment={segmentFilter || 'general'}
            contentTypes={contentTypeFilter || []}
            audienceLevel="general"
            selectedTemplateId={selectedTemplate?.id}
            onTemplateSelect={(template: RecommendedTemplate) => {
              const matchingTemplate = TEMPLATES.find(t => 
                t.name.toLowerCase().includes(template.name.toLowerCase().split(' ')[0]) ||
                template.tags.some(tag => t.name.toLowerCase().includes(tag))
              );
              
              if (matchingTemplate) {
                handleTemplateSelect(matchingTemplate);
              } else {
                const fallbackTemplate = TEMPLATES[0];
                handleTemplateSelect(fallbackTemplate);
                toast.success(`Applied: ${template.name} framework`);
              }
            }}
            onStyleSelect={(style) => {
              const styleTemplateMap: Record<string, string> = {
                'pure-consulting': 'business',
                'consulting-hybrid': 'business',
                'data-analytical': 'tech',
                'creative-narrative': 'creative',
                'educational': 'education',
                'investor-pitch': 'business',
                'storytelling': 'creative',
                'industry-focused': 'healthcare',
                'mixed-adaptive': 'all'
              };
              
              const targetCategory = styleTemplateMap[style] || 'all';
              setActiveCategory(targetCategory);
              
              const matchingTemplate = TEMPLATES.find(t => t.category === targetCategory);
              if (matchingTemplate) {
                handleTemplateSelect(matchingTemplate);
              }
            }}
          />
          
          {/* Quick Actions */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">Need more control?</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('templates')}
              >
                Browse Templates
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      )}

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
              if (!isAIDefault) handleAutoTemplate();
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  isAIDefault ? "bg-primary/10" : "bg-muted"
                )}>
                  <Bot className={cn("h-6 w-6", isAIDefault ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">AI Default Template</h4>
                    {isAIDefault && (
                      <Badge variant="default" className="bg-primary">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI selects optimal template based on your content
                  </p>
                </div>
                <Switch 
                  checked={isAIDefault} 
                  onCheckedChange={(checked) => {
                    setIsAIDefault(checked);
                    if (checked) handleAutoTemplate();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Pills - Scrollable on mobile, Grid on desktop */}
          <ScrollArea className="w-full">
            <div className={cn(
              "flex gap-2 pb-2",
              isAIDefault && "opacity-50 pointer-events-none"
            )}>
              {TEMPLATE_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => !isAIDefault && setActiveCategory(cat.id)}
                    disabled={isAIDefault}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
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
          </ScrollArea>

          {/* Template Grid */}
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-3",
            isAIDefault && "opacity-60 pointer-events-none"
          )}>
            {filteredTemplates.map(template => {
              const isSelected = selectedTemplate?.id === template.id;
              
              return (
                <Card
                  key={template.id}
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all hover:shadow-md",
                    isSelected && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => !isAIDefault && handleTemplateSelect(template)}
                >
                  {/* Preview Banner */}
                  <div 
                    className="h-20 relative"
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
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{template.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {template.features.map(feature => (
                        <Badge key={feature} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Repository Tab */}
      {activeTab === 'repository' && (
        <TemplateRepository onSelectTemplate={(template) => toast.success(`Loaded: ${template.name}`)} />
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-4">
          {isAIDefault && (
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-primary flex-1">
                  <span className="font-medium">AI Mode Active:</span> Branding is auto-configured.
                </p>
                <Button size="sm" variant="outline" onClick={() => setIsAIDefault(false)}>
                  Manual Mode
                </Button>
              </div>
            </Card>
          )}
          
          <div className={cn(isAIDefault && "opacity-50 pointer-events-none", "space-y-4")}>
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
                    <div className="w-14 h-14 rounded-lg bg-background flex items-center justify-center overflow-hidden border shrink-0">
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
                      size="icon"
                      onClick={() => onBrandConfigChange({ ...brandConfig, logo: undefined })}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Company Name</Label>
                    <Input
                      placeholder="Your Company"
                      value={brandConfig.companyName || ''}
                      onChange={(e) => onBrandConfigChange({ ...brandConfig, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Tagline</Label>
                    <Input
                      placeholder="Your tagline here"
                      value={brandConfig.tagline || ''}
                      onChange={(e) => onBrandConfigChange({ ...brandConfig, tagline: e.target.value })}
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                              "p-3 rounded-lg border-2 transition-all text-center",
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex justify-center gap-0.5 mb-1.5">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.primary }} />
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.secondary }} />
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
                            </div>
                            <p className="text-xs font-medium text-foreground">{palette.name}</p>
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
                          {FONT_OPTIONS.find(f => f.id === brandConfig.font)?.name || 'Inter'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showTypography && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      )}

      {/* Features Tab - Redesigned with Expandable Cards */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          {/* Visual Elements Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Visual Elements</h4>
              <Badge variant="secondary" className="text-[10px]">
                Click to expand
              </Badge>
            </div>
            <div className="space-y-2">
              {VISUAL_FEATURES_CONFIG.map(feature => renderFeatureCard(feature, true))}
            </div>
          </div>

          <Separator />

          {/* Additional Features Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Additional Features</h4>
            </div>
            <div className="space-y-2">
              {ADDITIONAL_FEATURES_CONFIG.map(feature => renderFeatureCard(feature, false))}
            </div>
          </div>

          {/* Selected Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">Selection Summary</p>
              <Badge variant="outline">
                {Object.values(selectedSubOptions).flat().length} sub-options
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(selectedSubOptions).flatMap(([key, options]) => 
                options.map(opt => (
                  <Badge 
                    key={`${key}-${opt}`} 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => toggleSubOption(key, opt)}
                  >
                    {opt.replace('-', ' ')}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))
              )}
              {Object.values(selectedSubOptions).flat().length === 0 && (
                <p className="text-xs text-muted-foreground">No sub-options selected. Click features above to customize.</p>
              )}
            </div>
          </Card>
        </div>
      )}
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
