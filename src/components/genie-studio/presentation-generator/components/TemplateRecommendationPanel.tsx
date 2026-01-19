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

// Firm colors
const FIRM_COLORS: Record<string, string> = {
  mckinsey: 'bg-blue-500/10 text-blue-600 border-blue-200',
  bcg: 'bg-green-500/10 text-green-600 border-green-200',
  bain: 'bg-red-500/10 text-red-600 border-red-200',
  deloitte: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  kpmg: 'bg-purple-500/10 text-purple-600 border-purple-200',
  generic: 'bg-gray-500/10 text-gray-600 border-gray-200',
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
  compact = false,
}) => {
  const [showFrameworkDetails, setShowFrameworkDetails] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<ConsultingFramework | null>(null);

  // Get recommendations
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

  const handleTemplateClick = (template: RecommendedTemplate) => {
    onTemplateSelect?.(template);
    toast.success(`Selected: ${template.name}`);
  };

  const handleStyleClick = (style: TemplateStyle) => {
    onStyleSelect?.(style);
    toast.info(`Style changed to: ${style.replace('-', ' ')}`);
  };

  const handleFrameworkPreview = (framework: ConsultingFramework) => {
    setSelectedFramework(framework);
    setShowFrameworkDetails(true);
  };

  const StyleIcon = STYLE_ICONS[recommendation.style];

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
                <p className="text-sm font-medium">{recommendation.style.replace(/-/g, ' ')}</p>
                <p className="text-[10px] text-muted-foreground">{recommendation.confidence}% match</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {recommendation.templates.length} templates
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          AI Template Recommendations
          <Badge variant="outline" className="ml-auto text-[10px]">
            {recommendation.confidence}% confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reasoning */}
        <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{recommendation.reasoning}</p>
          </div>
        </div>

        {/* Weight Visualization */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Consulting</span>
              <span className="font-medium">{recommendation.consultingWeight}%</span>
            </div>
            <Progress value={recommendation.consultingWeight} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Visual</span>
              <span className="font-medium">{recommendation.visualWeight}%</span>
            </div>
            <Progress value={recommendation.visualWeight} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium">{recommendation.dataWeight}%</span>
            </div>
            <Progress value={recommendation.dataWeight} className="h-1.5" />
          </div>
        </div>

        {/* Quick Style Selector */}
        <div className="space-y-2">
          <p className="text-xs font-medium">Quick Style Selection</p>
          <div className="flex flex-wrap gap-1.5">
            {quickStyles.map(({ style, label, description }) => {
              const Icon = STYLE_ICONS[style];
              const isActive = recommendation.style === style;
              
              return (
                <TooltipProvider key={style}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-7 text-[11px] gap-1",
                          isActive && "bg-primary"
                        )}
                        onClick={() => handleStyleClick(style)}
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                        {isActive && <Check className="h-3 w-3 ml-1" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Recommended Templates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Recommended Templates</p>
            <Badge variant="secondary" className="text-[10px]">
              {recommendation.templates.length} matches
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
            {recommendation.templates.map(template => {
              const isSelected = selectedTemplateId === template.id;
              const firmColor = FIRM_COLORS[template.subCategory || template.category] || FIRM_COLORS.generic;
              
              return (
                <div
                  key={template.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
                  )}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className={cn("p-2 rounded-md border", firmColor)}>
                    <PieChart className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        {template.matchScore}% match
                      </Badge>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[9px] py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Consulting Frameworks Section */}
        {(recommendation.style === 'pure-consulting' || recommendation.style === 'consulting-hybrid') && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium">Consulting Frameworks Library</p>
              <div className="grid grid-cols-2 gap-2">
                {['mckinsey', 'bcg', 'bain', 'generic'].map(firm => {
                  const firmFrameworks = CONSULTING_FRAMEWORKS.filter(f => f.firm === firm);
                  const firmColor = FIRM_COLORS[firm];
                  
                  return (
                    <Dialog key={firm}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn("h-auto py-2 flex-col items-start gap-1", firmColor)}
                        >
                          <span className="text-xs font-medium capitalize">{firm}</span>
                          <span className="text-[10px] opacity-70">{firmFrameworks.length} frameworks</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="capitalize">{firm} Frameworks</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {firmFrameworks.map(framework => (
                            <div
                              key={framework.id}
                              className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
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
                                <p className="font-medium text-sm">{framework.name}</p>
                                <Badge variant="outline" className="text-[10px]">
                                  {framework.visualStyle}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {framework.frameworks.map(f => (
                                  <Badge key={f} variant="secondary" className="text-[10px]">
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

        {/* Sub-Options for Training, etc. */}
        {recommendation.subOptions && recommendation.subOptions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium">Output Format Options</p>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.subOptions.map(option => (
                  <Badge
                    key={option.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 text-[10px] py-1"
                    onClick={() => toast.info(`Selected: ${option.label}`)}
                  >
                    {option.label}
                    <ChevronRight className="h-2.5 w-2.5 ml-1" />
                  </Badge>
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
