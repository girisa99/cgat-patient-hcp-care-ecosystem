/**
 * TemplateRecommendationPanel - Clean, Dropdown-based UI
 * Refactored for better UX with no duplicate sections
 * Uses generic framework names (no trademarked consulting firm names)
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Factory,
  Building2,
  Cpu,
  HeartPulse,
  ShoppingCart,
  Plane,
  Plus,
  RefreshCw,
  Database,
  ChevronRight,
  // Additional icons for expanded template styles
  Palette,
  Film,
  LayoutDashboard,
  Megaphone,
  Users,
  Crown,
  FileText,
  ArrowRightLeft,
  MousePointerClick,
  Box,
  Video,
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
import useTemplateLibrary from '@/hooks/useTemplateLibrary';
import { CreateTemplateDialog } from './CreateTemplateDialog';

// Style icons mapping - all template styles
const STYLE_ICONS: Record<TemplateStyle, React.ElementType> = {
  // Consulting & Strategy
  'pure-consulting': Briefcase,
  'consulting-hybrid': Layers,
  'strategy-planning': Target,
  'growth-portfolio': TrendingUp,
  // Industry
  'industry-focused': Target,
  'healthcare-clinical': HeartPulse,
  'pharma-biotech': Factory,
  'tech-innovation': Cpu,
  'finance-investment': Building2,
  // Creative
  'creative-narrative': Lightbulb,
  'visual-immersive': Palette,
  'motion-graphics': Sparkles,
  'cinematic': Film,
  // Data
  'data-analytical': BarChart3,
  'dashboard-style': LayoutDashboard,
  'research-academic': GraduationCap,
  // Communication
  'educational': GraduationCap,
  'investor-pitch': TrendingUp,
  'sales-enablement': Megaphone,
  'internal-comms': Users,
  'executive-summary': Crown,
  // Narrative
  'storytelling': BookOpen,
  'case-study': FileText,
  'before-after': ArrowRightLeft,
  // Interactive
  'interactive-web': MousePointerClick,
  '3d-immersive': Box,
  'video-hybrid': Video,
  // Adaptive
  'mixed-adaptive': Sparkles,
};

// Framework categories (using generic names - NO trademarked names)
const FRAMEWORK_CATEGORIES = [
  { id: 'tier1-strategy', label: 'Strategic Planning', description: 'High-level strategy & alignment frameworks' },
  { id: 'tier1-growth', label: 'Growth & Portfolio', description: 'Market expansion & portfolio analysis' },
  { id: 'tier1-operations', label: 'Operations Excellence', description: 'Customer & execution optimization' },
  { id: 'universal', label: 'Universal Frameworks', description: 'Industry-standard methodologies' },
];

// Industry categories for templates
const INDUSTRY_CATEGORIES = [
  { id: 'healthcare', label: 'Healthcare & Life Sciences', icon: HeartPulse },
  { id: 'technology', label: 'Technology & SaaS', icon: Cpu },
  { id: 'manufacturing', label: 'Manufacturing & Industrial', icon: Factory },
  { id: 'retail', label: 'Retail & E-commerce', icon: ShoppingCart },
  { id: 'finance', label: 'Financial Services', icon: Building2 },
  { id: 'travel', label: 'Travel & Hospitality', icon: Plane },
];

// Template style options
const STYLE_OPTIONS = [
  { id: 'consulting-frameworks', label: 'Strategic Frameworks', description: 'Professional consulting-style frameworks' },
  { id: 'industry-focused', label: 'Industry Templates', description: 'Sector-specific designs' },
];

// Colors for framework categories
const CATEGORY_COLORS: Record<string, string> = {
  'tier1-strategy': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700',
  'tier1-growth': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  'tier1-operations': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  'universal': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700',
};

interface TemplateRecommendationPanelProps {
  industry: string;
  segment: string;
  contentTypes: string[];
  userPrompt?: string;
  audienceLevel?: 'executive' | 'manager' | 'technical' | 'general' | 'investor' | 'student';
  onTemplateSelect?: (template: RecommendedTemplate) => void;
  onTemplatesChange?: (templates: RecommendedTemplate[]) => void;
  onStyleSelect?: (style: TemplateStyle) => void;
  selectedTemplateId?: string;
  selectedTemplateIds?: string[];
  selectedStyle?: TemplateStyle;
  compact?: boolean;
  multiSelect?: boolean;
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
  multiSelect = true,
}) => {
  const [selectedStyleType, setSelectedStyleType] = useState<string>('consulting-frameworks');
  const [selectedFrameworkCategory, setSelectedFrameworkCategory] = useState<string>('');
  const [selectedIndustryCategory, setSelectedIndustryCategory] = useState<string>('');
  const [internalSelectedTemplates, setInternalSelectedTemplates] = useState<string[]>([]);
  const [viewFrameworksDialogOpen, setViewFrameworksDialogOpen] = useState(false);
  const [activeFrameworkCategory, setActiveFrameworkCategory] = useState<string>('');

  // Use dynamic template library from database
  const { 
    consultingFrameworks: dbFrameworks, 
    industryTemplates: dbTemplates, 
    loading: libraryLoading,
    isEmpty: libraryEmpty,
    refresh: refreshLibrary,
  } = useTemplateLibrary();

  const selectedIds = selectedTemplateIds.length > 0 ? selectedTemplateIds : internalSelectedTemplates;

  // Determine the TemplateStyle based on selection
  const activeStyle: TemplateStyle = useMemo(() => {
    if (externalSelectedStyle) return externalSelectedStyle;
    if (selectedStyleType === 'consulting-frameworks') {
      return 'consulting-hybrid';
    }
    return 'industry-focused';
  }, [externalSelectedStyle, selectedStyleType]);

  // Get AI recommendations
  const recommendation = useMemo(() => {
    return getTemplateRecommendations({
      industry,
      segment,
      contentTypes,
      userPrompt,
      audienceLevel,
    });
  }, [industry, segment, contentTypes, userPrompt, audienceLevel]);

  // Get templates based on active style
  const activeTemplates = useMemo(() => {
    return getTemplatesForStyle(activeStyle, {
      industry,
      segment,
      contentTypes,
      userPrompt,
      audienceLevel,
    });
  }, [activeStyle, industry, segment, contentTypes, userPrompt, audienceLevel]);

  // Get frameworks for selected category
  const frameworksForCategory = useMemo(() => {
    if (!selectedFrameworkCategory) return [];
    return CONSULTING_FRAMEWORKS.filter(f => f.firm === selectedFrameworkCategory);
  }, [selectedFrameworkCategory]);

  const handleTemplateClick = (template: RecommendedTemplate) => {
    if (multiSelect) {
      const isSelected = selectedIds.includes(template.id);
      const newSelection = isSelected
        ? selectedIds.filter(id => id !== template.id)
        : [...selectedIds, template.id];
      
      setInternalSelectedTemplates(newSelection);
      const selectedTemplates = activeTemplates.filter(t => newSelection.includes(t.id));
      onTemplatesChange?.(selectedTemplates);
    } else {
      onTemplateSelect?.(template);
    }
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyleType(value);
    setInternalSelectedTemplates([]);
    onTemplatesChange?.([]);
    
    const mappedStyle: TemplateStyle = value === 'consulting-frameworks' ? 'consulting-hybrid' : 'industry-focused';
    onStyleSelect?.(mappedStyle);
  };

  const handleFrameworkSelect = (framework: ConsultingFramework) => {
    handleTemplateClick({
      id: framework.id,
      name: framework.name,
      category: framework.firm,
      matchScore: 85,
      frameworks: framework.frameworks,
      tags: framework.tags,
      subCategory: framework.firm
    });
    toast.success(`Selected: ${framework.name}`);
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
        {/* Library Status & Actions */}
        {!libraryLoading && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {libraryEmpty 
                  ? 'No custom templates yet'
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

        {/* AI Reasoning */}
        <div className="p-4 rounded-xl bg-muted/50 border">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.reasoning}</p>
          </div>
        </div>

        {/* Weight Visualization */}
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

        <Separator />

        {/* Style Selection Dropdown */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Template Style</p>
          <Select value={selectedStyleType} onValueChange={handleStyleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select template style" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional: Framework Category Dropdown OR Industry Category Dropdown */}
        {selectedStyleType === 'consulting-frameworks' ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Framework Category</p>
            <Select value={selectedFrameworkCategory} onValueChange={setSelectedFrameworkCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select framework category" />
              </SelectTrigger>
              <SelectContent>
                {FRAMEWORK_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex flex-col">
                      <span>{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show frameworks for selected category */}
            {selectedFrameworkCategory && frameworksForCategory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Available Frameworks</p>
                  <Badge variant="secondary" className="text-xs">{frameworksForCategory.length}</Badge>
                </div>
                <ScrollArea className="h-[200px] rounded-lg border p-2">
                  <div className="space-y-2">
                    {frameworksForCategory.map(framework => {
                      const isSelected = selectedIds.includes(framework.id);
                      return (
                        <div
                          key={framework.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            "hover:bg-primary/5 hover:border-primary/50",
                            isSelected && "bg-primary/10 border-primary"
                          )}
                          onClick={() => handleFrameworkSelect(framework)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground">{framework.name}</p>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {framework.frameworks.slice(0, 3).map(f => (
                              <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Industry Category</p>
            <Select value={selectedIndustryCategory} onValueChange={setSelectedIndustryCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Recommended Templates List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Recommended Templates</p>
              {multiSelect && (
                <Badge variant="outline" className="text-[10px]">Multi-select</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Badge variant="default" className="text-xs">{selectedIds.length} selected</Badge>
              )}
              <Badge variant="secondary" className="text-xs">{activeTemplates.length} available</Badge>
            </div>
          </div>
          
          <ScrollArea className="h-[280px] rounded-lg border p-2">
            <div className="space-y-2">
              {activeTemplates.map(template => {
                const isSelected = multiSelect 
                  ? selectedIds.includes(template.id)
                  : selectedTemplateId === template.id;
                const categoryColor = CATEGORY_COLORS[template.subCategory || template.category] || CATEGORY_COLORS.universal;
                
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected && "border-primary bg-primary/10"
                    )}
                    onClick={() => handleTemplateClick(template)}
                  >
                    {multiSelect && (
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    )}
                    
                    <div className={cn("p-2 rounded-lg border shrink-0", categoryColor)}>
                      <PieChart className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">{template.name}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {template.matchScore}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    {!multiSelect && isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Output Format Sub-Options */}
        {recommendation.subOptions && recommendation.subOptions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Output Format</p>
                <Badge variant="outline" className="text-[10px]">{recommendation.subOptions.length} options</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendation.subOptions.map(option => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => toast.info(`Selected: ${option.label}`)}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <BookOpen className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
