/**
 * TemplateRecommendationPanel - Integrates templateRecommendationService into Step 2
 * Shows context-aware template recommendations with consulting frameworks
 * Now integrates with dynamic useTemplateLibrary for database-driven templates
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  BarChart3,
  BookOpen,
  Lightbulb,
  Target,
  GraduationCap,
  Check,
  Info,
  Layers,
  Wand2,
  PieChart,
  ChevronDown,
  ChevronRight,
  Factory,
  Building2,
  Cpu,
  HeartPulse,
  ShoppingCart,
  Plane,
  Plus,
  RefreshCw,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getTemplateRecommendations,
  getTemplatesForStyle,
  TemplateStyle,
  RecommendedTemplate,
  CONSULTING_FRAMEWORKS,
  ConsultingFramework,
} from '../services/templateRecommendationService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import useTemplateLibrary from '@/hooks/useTemplateLibrary';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { TemplateAIModelSelector } from './TemplateAIModelSelector';

// Style icons mapping
const STYLE_ICONS: Record<TemplateStyle, React.ElementType> = {
  'pure-consulting': Briefcase,
  'consulting-hybrid': Layers,
  'industry-focused': Target,
  'creative-narrative': Lightbulb,
  'data-analytical': BarChart3,
  'educational': GraduationCap,
  'investor-pitch': TrendingUp,
  'storytelling': BookOpen,
  'mixed-adaptive': Sparkles,
};

// Simplified 2-style options for UI
type SimplifiedStyle = 'consulting-frameworks' | 'industry-focused';

const SIMPLIFIED_STYLES: Array<{
  id: SimplifiedStyle;
  label: string;
  description: string;
  icon: React.ElementType;
  mapsToStyles: TemplateStyle[];
}> = [
  {
    id: 'consulting-frameworks',
    label: 'Consulting Frameworks',
    description: 'McKinsey, BCG, Bain-style strategic frameworks',
    icon: Briefcase,
    mapsToStyles: ['pure-consulting', 'consulting-hybrid', 'investor-pitch'],
  },
  {
    id: 'industry-focused',
    label: 'Industry Focused',
    description: 'Templates tailored to your specific sector',
    icon: Target,
    mapsToStyles: ['industry-focused', 'creative-narrative', 'data-analytical', 'educational', 'storytelling', 'mixed-adaptive'],
  },
];

// Industry-specific visual libraries
const INDUSTRY_LIBRARIES: Array<{
  id: string;
  label: string;
  icon: React.ElementType;
  industries: string[];
  templates: string[];
}> = [
  {
    id: 'healthcare',
    label: 'Healthcare & Life Sciences',
    icon: HeartPulse,
    industries: ['healthcare', 'pharma', 'biotech', 'medical'],
    templates: ['Clinical Workflow', 'Patient Journey', 'Regulatory Compliance', 'Research Pipeline'],
  },
  {
    id: 'technology',
    label: 'Technology & SaaS',
    icon: Cpu,
    industries: ['technology', 'software', 'saas', 'it', 'tech'],
    templates: ['Product Roadmap', 'Architecture Overview', 'Sprint Review', 'Technical Deep-dive'],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing & Industrial',
    icon: Factory,
    industries: ['manufacturing', 'industrial', 'automotive', 'engineering'],
    templates: ['Process Flow', 'Supply Chain', 'Quality Metrics', 'Lean Operations'],
  },
  {
    id: 'retail',
    label: 'Retail & E-commerce',
    icon: ShoppingCart,
    industries: ['retail', 'ecommerce', 'consumer', 'cpg'],
    templates: ['Customer Funnel', 'Omnichannel Strategy', 'Seasonal Campaign', 'Inventory Analytics'],
  },
  {
    id: 'finance',
    label: 'Financial Services',
    icon: Building2,
    industries: ['finance', 'banking', 'insurance', 'fintech'],
    templates: ['Risk Assessment', 'Portfolio Analysis', 'Compliance Report', 'Investment Thesis'],
  },
  {
    id: 'travel',
    label: 'Travel & Hospitality',
    icon: Plane,
    industries: ['travel', 'hospitality', 'tourism', 'airline'],
    templates: ['Guest Experience', 'Revenue Management', 'Destination Marketing', 'Loyalty Program'],
  },
];

// Framework category colors (using generic names)
const FRAMEWORK_COLORS: Record<string, string> = {
  'tier1-strategy': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700',
  'tier1-growth': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  'tier1-operations': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  'universal': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700',
  'custom': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

// Framework category labels
const FRAMEWORK_LABELS: Record<string, { name: string; description: string }> = {
  'tier1-strategy': { name: 'Strategy Frameworks', description: 'Strategic alignment & planning' },
  'tier1-growth': { name: 'Growth Frameworks', description: 'Portfolio & competitive analysis' },
  'tier1-operations': { name: 'Operations Frameworks', description: 'Customer & execution focus' },
  'universal': { name: 'Universal Frameworks', description: 'Industry-standard methodologies' },
};

interface TemplateRecommendationPanelProps {
  industry: string;
  segment: string;
  contentTypes: string[];
  userPrompt?: string;
  audienceLevel?: 'executive' | 'manager' | 'technical' | 'general' | 'investor' | 'student';
  onTemplateSelect?: (template: RecommendedTemplate) => void;
  onTemplatesChange?: (templates: RecommendedTemplate[]) => void; // Multi-select
  onStyleSelect?: (style: TemplateStyle) => void;
  selectedTemplateId?: string;
  selectedTemplateIds?: string[]; // Multi-select
  selectedStyle?: TemplateStyle;
  compact?: boolean;
  multiSelect?: boolean; // Enable multi-select mode
}

export const TemplateRecommendationPanel: React.FC<TemplateRecommendationPanelProps> = ({
  industry,
  segment,
  contentTypes,
  userPrompt,
  audienceLevel,
  onTemplateSelect,
  onTemplatesChange,
  onStyleSelect,
  selectedTemplateId,
  selectedTemplateIds = [],
  selectedStyle: externalSelectedStyle,
  compact = false,
  multiSelect = true, // Default to multi-select
}) => {
  const [showFrameworkDetails, setShowFrameworkDetails] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<ConsultingFramework | null>(null);
  const [simplifiedStyle, setSimplifiedStyle] = useState<SimplifiedStyle>('consulting-frameworks');
  const [internalSelectedTemplates, setInternalSelectedTemplates] = useState<string[]>([]);
  const [showAIConfig, setShowAIConfig] = useState(false);

  // Use dynamic template library from database
  const { 
    consultingFrameworks: dbFrameworks, 
    industryTemplates: dbTemplates, 
    loading: libraryLoading,
    isEmpty: libraryEmpty,
    refresh: refreshLibrary,
    getFrameworksByCategory,
    getTemplatesByIndustry,
  } = useTemplateLibrary();

  // Track selected templates (internal or external)
  const selectedIds = selectedTemplateIds.length > 0 ? selectedTemplateIds : internalSelectedTemplates;

  // Determine the TemplateStyle based on simplified selection
  const activeStyle: TemplateStyle = useMemo(() => {
    if (externalSelectedStyle) return externalSelectedStyle;
    
    // Map simplified style to actual TemplateStyle based on context
    if (simplifiedStyle === 'consulting-frameworks') {
      // Choose between pure-consulting and consulting-hybrid based on industry
      const industryLower = industry.toLowerCase();
      if (industryLower.includes('consult') || industryLower.includes('strategy')) {
        return 'pure-consulting';
      }
      return 'consulting-hybrid';
    } else {
      // Choose industry-focused style based on content types
      const hasData = contentTypes.some(ct => ct.toLowerCase().includes('data') || ct.toLowerCase().includes('analytic'));
      const hasTraining = contentTypes.some(ct => ct.toLowerCase().includes('training') || ct.toLowerCase().includes('education'));
      const hasCreative = contentTypes.some(ct => ct.toLowerCase().includes('creative') || ct.toLowerCase().includes('story'));
      
      if (hasData) return 'data-analytical';
      if (hasTraining) return 'educational';
      if (hasCreative) return 'creative-narrative';
      return 'industry-focused';
    }
  }, [externalSelectedStyle, simplifiedStyle, industry, contentTypes]);

  // Get relevant industry library based on selected industry
  const relevantIndustryLibraries = useMemo(() => {
    const industryLower = industry.toLowerCase();
    return INDUSTRY_LIBRARIES.filter(lib => 
      lib.industries.some(ind => industryLower.includes(ind))
    );
  }, [industry]);

  // Get AI recommendations (initial)
  const recommendation = useMemo(() => {
    return getTemplateRecommendations({
      industry,
      segment,
      contentTypes,
      userPrompt,
      audienceLevel,
    });
  }, [industry, segment, contentTypes, userPrompt, audienceLevel]);

  // Get templates based on active style (regenerates when style changes)
  const activeTemplates = useMemo(() => {
    return getTemplatesForStyle(activeStyle, {
      industry,
      segment,
      contentTypes,
      userPrompt,
      audienceLevel,
    });
  }, [activeStyle, industry, segment, contentTypes, userPrompt, audienceLevel]);

  const handleTemplateClick = (template: RecommendedTemplate) => {
    if (multiSelect) {
      // Toggle selection
      const isSelected = selectedIds.includes(template.id);
      const newSelection = isSelected
        ? selectedIds.filter(id => id !== template.id)
        : [...selectedIds, template.id];
      
      setInternalSelectedTemplates(newSelection);
      
      // Notify parent with full template objects
      const selectedTemplates = activeTemplates.filter(t => newSelection.includes(t.id));
      onTemplatesChange?.(selectedTemplates);
    } else {
      // Single select mode
      onTemplateSelect?.(template);
    }
  };

  const handleSimplifiedStyleChange = (style: SimplifiedStyle) => {
    setSimplifiedStyle(style);
    // Clear template selection when style changes
    setInternalSelectedTemplates([]);
    onTemplatesChange?.([]);
    
    // Map to actual TemplateStyle and notify parent
    const mappedStyle = SIMPLIFIED_STYLES.find(s => s.id === style)?.mapsToStyles[0] || 'mixed-adaptive';
    onStyleSelect?.(mappedStyle);
  };

  const StyleIcon = STYLE_ICONS[activeStyle];

  if (compact) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <StyleIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{activeStyle.replace(/-/g, ' ')}</p>
                <p className="text-[10px] text-muted-foreground">{recommendation.confidence}% match</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {activeTemplates.length} templates
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            AI Template Recommendations
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {recommendation.confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dynamic Library Status */}
        {!libraryLoading && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {libraryEmpty 
                  ? 'No templates in library - create your first!'
                  : `${dbFrameworks.length} frameworks · ${dbTemplates.length} templates`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => refreshLibrary()}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <CreateTemplateDialog 
                type="framework" 
                defaultIndustry={industry}
                trigger={
                  <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                    <Plus className="h-3 w-3" />
                    <span className="text-xs">Framework</span>
                  </Button>
                }
              />
              <CreateTemplateDialog 
                type="template" 
                defaultIndustry={industry}
                trigger={
                  <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                    <Plus className="h-3 w-3" />
                    <span className="text-xs">Template</span>
                  </Button>
                }
              />
            </div>
          </div>
        )}

        {/* Reasoning - Clean Card */}
        <div className="p-4 rounded-xl bg-muted/50 border">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.reasoning}</p>
          </div>
        </div>

        {/* Weight Visualization - Clean Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-card border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Consulting</span>
              <span className="text-sm font-semibold text-foreground">{recommendation.consultingWeight}%</span>
            </div>
            <Progress value={recommendation.consultingWeight} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Visual</span>
              <span className="text-sm font-semibold text-foreground">{recommendation.visualWeight}%</span>
            </div>
            <Progress value={recommendation.visualWeight} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Data</span>
              <span className="text-sm font-semibold text-foreground">{recommendation.dataWeight}%</span>
            </div>
            <Progress value={recommendation.dataWeight} className="h-2" />
          </div>
        </div>

        {/* Style Selection - Collapsible Dropdowns */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Style Selection</p>
          
          <div className="space-y-2">
            {SIMPLIFIED_STYLES.map((styleOption) => {
              const Icon = styleOption.icon;
              const isActive = simplifiedStyle === styleOption.id;
              const isConsulting = styleOption.id === 'consulting-frameworks';
              
              return (
                <Collapsible
                  key={styleOption.id}
                  open={isActive}
                  onOpenChange={() => handleSimplifiedStyleChange(styleOption.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-full h-auto py-3 px-4 flex items-center justify-between gap-3",
                        isActive && "shadow-md"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 shrink-0" />
                        <div className="text-left">
                          <span className="text-sm font-medium block">{styleOption.label}</span>
                          <span className="text-xs opacity-70">{styleOption.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && <Check className="h-4 w-4" />}
                        {isActive ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2">
                    {isConsulting ? (
                      /* Consulting Framework Library */
                      <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">Framework Library</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(FRAMEWORK_LABELS).map(([firmKey, { name, description }]) => {
                            const firmFrameworks = CONSULTING_FRAMEWORKS.filter(f => f.firm === firmKey);
                            const firmColor = FRAMEWORK_COLORS[firmKey];
                            
                            if (firmFrameworks.length === 0) return null;
                            
                            return (
                              <Dialog key={firmKey}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "h-auto py-2 px-3 flex flex-col items-start gap-1 text-left",
                                      firmColor
                                    )}
                                  >
                                    <span className="text-xs font-medium">{name}</span>
                                    <span className="text-[10px] opacity-70">{firmFrameworks.length} frameworks</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Briefcase className="h-5 w-5" />
                                      {name}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3 mt-4">
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                    <div className="space-y-2">
                                      {firmFrameworks.map(framework => (
                                        <div
                                          key={framework.id}
                                          className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                          onClick={() => {
                                            setSelectedFramework(framework);
                                            toast.success(`Selected: ${framework.name}`);
                                          }}
                                        >
                                          <p className="text-sm font-medium">{framework.name}</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {framework.frameworks.slice(0, 3).map(f => (
                                              <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Explore strategic frameworks from top consulting methodologies
                        </p>
                      </div>
                    ) : (
                      /* Industry Library */
                      <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">Industry Template Library</p>
                        <div className="grid grid-cols-2 gap-2">
                          {(relevantIndustryLibraries.length > 0 ? relevantIndustryLibraries : INDUSTRY_LIBRARIES.slice(0, 4)).map((lib) => {
                            const LibIcon = lib.icon;
                            
                            return (
                              <Dialog key={lib.id}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-auto py-2 px-3 flex flex-col items-start gap-1 text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <LibIcon className="h-4 w-4" />
                                      <span className="text-xs font-medium">{lib.label}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{lib.templates.length} templates</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <LibIcon className="h-5 w-5" />
                                      {lib.label}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3 mt-4">
                                    <p className="text-sm text-muted-foreground">
                                      Industry-specific templates designed for {lib.label.toLowerCase()}
                                    </p>
                                    <div className="space-y-2">
                                      {lib.templates.map(template => (
                                        <div
                                          key={template}
                                          className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                          onClick={() => {
                                            toast.success(`Template style: ${template}`);
                                          }}
                                        >
                                          <p className="text-sm font-medium">{template}</p>
                                          <p className="text-xs text-muted-foreground">Optimized for {lib.label}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Templates tailored to your specific industry sector
                        </p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Recommended Templates - Multi-Select Card List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Recommended Templates</p>
              {multiSelect && (
                <Badge variant="outline" className="text-[10px]">
                  Multi-select
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Badge variant="default" className="text-xs">
                  {selectedIds.length} selected
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {activeTemplates.length} available
              </Badge>
            </div>
          </div>
          
          {multiSelect && selectedIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected templates will be combined for a mixed-style presentation
            </p>
          )}
          
          <div className="space-y-2">
            {activeTemplates.map(template => {
              const isSelected = multiSelect 
                ? selectedIds.includes(template.id)
                : selectedTemplateId === template.id;
              const categoryColor = FRAMEWORK_COLORS[template.subCategory || template.category] || FRAMEWORK_COLORS.universal;
              
              return (
                <div
                  key={template.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected && "border-primary bg-primary/10 shadow-sm"
                  )}
                  onClick={() => handleTemplateClick(template)}
                >
                  {/* Checkbox for multi-select */}
                  {multiSelect && (
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/30 hover:border-primary/50"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  )}
                  
                  <div className={cn("p-3 rounded-lg border", categoryColor)}>
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{template.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {template.matchScore}% match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.tags.slice(0, 4).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {!multiSelect && isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Framework Library Section - Using Generic Names */}
        {(activeStyle === 'pure-consulting' || activeStyle === 'consulting-hybrid') && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Framework Library</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(FRAMEWORK_LABELS).map(([firmKey, { name, description }]) => {
                  const firmFrameworks = CONSULTING_FRAMEWORKS.filter(f => f.firm === firmKey);
                  const firmColor = FRAMEWORK_COLORS[firmKey];
                  
                  if (firmFrameworks.length === 0) return null;
                  
                  return (
                    <Dialog key={firmKey}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn("h-auto py-2 flex-col items-start gap-1", firmColor)}
                        >
                          <span className="text-xs font-medium">{name}</span>
                          <span className="text-[10px] opacity-80">{firmFrameworks.length} templates</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{name}</DialogTitle>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </DialogHeader>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {firmFrameworks.map(framework => (
                            <div
                              key={framework.id}
                              className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleTemplateClick({
                                  id: framework.id,
                                  name: framework.name,
                                  category: framework.firm,
                                  matchScore: 85,
                                  frameworks: framework.frameworks,
                                  tags: framework.tags,
                                  subCategory: framework.firm
                                });
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm text-foreground">{framework.name}</p>
                                <Badge variant="outline" className="text-[10px]">
                                  {framework.visualStyle}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {framework.frameworks.map(f => (
                                  <Badge key={f} variant="secondary" className="text-[10px] text-foreground">
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Sub-Options with IMPROVED STYLING - Full Readable Cards */}
        {recommendation.subOptions && recommendation.subOptions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Select Output Format</p>
                <Badge variant="outline" className="text-[10px]">
                  {recommendation.subOptions.length} options
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendation.subOptions.map(option => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 bg-card",
                      "cursor-pointer hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all"
                    )}
                    onClick={() => toast.info(`Selected: ${option.label}`)}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateRecommendationPanel;
