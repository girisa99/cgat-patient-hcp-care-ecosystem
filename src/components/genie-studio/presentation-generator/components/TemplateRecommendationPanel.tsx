/**
 * TemplateRecommendationPanel - Integrates templateRecommendationService into Step 2
 * Shows context-aware template recommendations with consulting frameworks
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
  ChevronRight,
  Info,
  Layers,
  Wand2,
  PieChart,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getTemplateRecommendations,
  getQuickStyleSuggestions,
  getTemplatesForStyle,
  TemplateRecommendation,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  onStyleSelect?: (style: TemplateStyle) => void;
  selectedTemplateId?: string;
  selectedStyle?: TemplateStyle;
  compact?: boolean;
}

export const TemplateRecommendationPanel: React.FC<TemplateRecommendationPanelProps> = ({
  industry,
  segment,
  contentTypes,
  userPrompt,
  audienceLevel,
  onTemplateSelect,
  onStyleSelect,
  selectedTemplateId,
  selectedStyle: externalSelectedStyle,
  compact = false,
}) => {
  const [showFrameworkDetails, setShowFrameworkDetails] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<ConsultingFramework | null>(null);
  const [internalSelectedStyle, setInternalSelectedStyle] = useState<TemplateStyle | null>(null);

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

  // Get quick style suggestions
  const quickStyles = useMemo(() => {
    return getQuickStyleSuggestions(industry);
  }, [industry]);

  // Use external or internal selected style, fallback to AI recommendation
  const activeStyle = externalSelectedStyle || internalSelectedStyle || recommendation.style;

  // Get templates based on active style (regenerates when style changes)
  const activeTemplates = useMemo(() => {
    if (activeStyle === recommendation.style) {
      // Use AI-generated templates
      return recommendation.templates;
    }
    // Regenerate templates for manually selected style
    return getTemplatesForStyle(activeStyle, {
      industry,
      segment,
      contentTypes,
      userPrompt,
      audienceLevel,
    });
  }, [activeStyle, recommendation, industry, segment, contentTypes, userPrompt, audienceLevel]);

  const handleTemplateClick = (template: RecommendedTemplate) => {
    onTemplateSelect?.(template);
    toast.success(`Selected: ${template.name}`);
  };

  const handleStyleClick = (style: TemplateStyle) => {
    setInternalSelectedStyle(style);
    onStyleSelect?.(style);
    toast.info(`Style changed to: ${style.replace(/-/g, ' ')}`);
  };

  const handleFrameworkPreview = (framework: ConsultingFramework) => {
    setSelectedFramework(framework);
    setShowFrameworkDetails(true);
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

        {/* Quick Style Selector - Clean Grid with text truncation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Style Selection</p>
            {internalSelectedStyle && internalSelectedStyle !== recommendation.style && (
              <Badge variant="outline" className="text-[10px]">
                Manual Override
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickStyles.map(({ style, label, description }) => {
              const Icon = STYLE_ICONS[style];
              const isActive = activeStyle === style;
              const isAIRecommended = recommendation.style === style;
              
              return (
                <Button
                  key={style}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-auto py-2.5 px-2 flex flex-col items-center gap-1.5 min-w-0 relative",
                    isActive && "shadow-md",
                    !isActive && isAIRecommended && "border-primary/50"
                  )}
                  onClick={() => handleStyleClick(style)}
                  title={description}
                >
                  {isAIRecommended && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] font-medium truncate w-full text-center leading-tight">{label}</span>
                  {isActive && <Check className="h-3 w-3 shrink-0" />}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Recommended Templates - Clean Card List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recommended Templates</p>
            <Badge variant="secondary" className="text-xs">
              {activeTemplates.length} matches
            </Badge>
          </div>
          
          <div className="space-y-2">
            {activeTemplates.map(template => {
              const isSelected = selectedTemplateId === template.id;
              const categoryColor = FRAMEWORK_COLORS[template.subCategory || template.category] || FRAMEWORK_COLORS.universal;
              
              return (
                <div
                  key={template.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected && "border-primary bg-primary/5 shadow-sm"
                  )}
                  onClick={() => handleTemplateClick(template)}
                >
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
                  {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
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
