/**
 * ContentTypeSelector - Clean enterprise content type selection
 * No scroll, clean grid, proper alignment
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Check,
  BookOpen,
  Target,
  GraduationCap,
  BarChart3,
  LayoutGrid,
  Lightbulb,
  Megaphone,
  Briefcase,
  Rocket,
  Zap,
  HeartPulse,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLLATERAL_TYPES } from './EnhancedTemplateWorkflow';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';

// Content categories - streamlined
export const CONTENT_CATEGORIES = [
  { id: 'ai-generated', label: 'AI Auto', icon: Sparkles, isAI: true },
  { id: 'narrative', label: 'Narrative', icon: BookOpen },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'research', label: 'Research', icon: BarChart3 },
  { id: 'visual', label: 'Visual', icon: LayoutGrid },
  { id: 'strategic', label: 'Strategic', icon: Target },
  { id: 'creative', label: 'Creative', icon: Lightbulb },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'compliance', label: 'Compliance', icon: Scale },
];

// Extended collateral types
export const EXTENDED_COLLATERAL_TYPES = [
  ...COLLATERAL_TYPES,
  { id: 'strategic-plan', name: 'Strategic Plan', 
    description: 'Goals, initiatives, milestones',
    icon: <Target className="h-4 w-4" />, category: 'strategic', suggestedSlides: 20, suggestedTones: ['strategic'] },
  { id: 'competitive-analysis', name: 'Competitive Analysis', 
    description: 'Competitor landscape, SWOT',
    icon: <BarChart3 className="h-4 w-4" />, category: 'strategic', suggestedSlides: 15, suggestedTones: ['analytical'] },
  { id: 'roadmap', name: 'Product Roadmap', 
    description: 'Feature timeline, releases',
    icon: <Rocket className="h-4 w-4" />, category: 'strategic', suggestedSlides: 12, suggestedTones: ['strategic'] },
  { id: 'okr-presentation', name: 'OKR Presentation', 
    description: 'Objectives and Key Results',
    icon: <Zap className="h-4 w-4" />, category: 'strategic', suggestedSlides: 10, suggestedTones: ['focused'] },
  { id: 'brand-campaign', name: 'Brand Campaign', 
    description: 'Campaign concept, messaging',
    icon: <Megaphone className="h-4 w-4" />, category: 'creative', suggestedSlides: 18, suggestedTones: ['creative'] },
  { id: 'concept-deck', name: 'Concept Deck', 
    description: 'Creative concepts, mood boards',
    icon: <Lightbulb className="h-4 w-4" />, category: 'creative', suggestedSlides: 15, suggestedTones: ['creative'] },
  { id: 'launch-plan', name: 'Launch Plan', 
    description: 'Go-to-market strategy',
    icon: <Rocket className="h-4 w-4" />, category: 'marketing', suggestedSlides: 20, suggestedTones: ['energetic'] },
  { id: 'content-calendar', name: 'Content Calendar', 
    description: 'Editorial planning',
    icon: <LayoutGrid className="h-4 w-4" />, category: 'marketing', suggestedSlides: 12, suggestedTones: ['organized'] },
  { id: 'regulatory-update', name: 'Regulatory Update', 
    description: 'Policy changes, compliance',
    icon: <Scale className="h-4 w-4" />, category: 'compliance', suggestedSlides: 15, suggestedTones: ['formal'] },
  { id: 'hipaa-training', name: 'HIPAA Training', 
    description: 'Privacy rules, security',
    icon: <HeartPulse className="h-4 w-4" />, category: 'compliance', suggestedSlides: 25, suggestedTones: ['educational'] },
];

interface ContentTypeSelectorProps {
  contentCategory: string;
  setContentCategory: (category: string) => void;
  selectedContentTypes: string[];
  setSelectedContentTypes: (types: string[]) => void;
  workflowConfig: FinalWorkflowConfig | null;
  onSelectCollateralType: (collateralType: any) => void;
  selectedLanguages?: string[];
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentCategory,
  setContentCategory,
  selectedContentTypes,
  setSelectedContentTypes,
  workflowConfig,
  onSelectCollateralType,
  selectedLanguages = [],
}) => {
  const filteredCollaterals = EXTENDED_COLLATERAL_TYPES.filter(c => c.category === contentCategory);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Content Type</span>
        </div>

        {/* Category Pills - Compact Wrap */}
        <div className="flex flex-wrap gap-1">
          {CONTENT_CATEGORIES.map(category => (
            <Button
              key={category.id}
              variant={contentCategory === category.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-[11px] px-2 gap-1",
                category.isAI && contentCategory === category.id && "bg-gradient-to-r from-primary to-primary/80"
              )}
              onClick={() => {
                setContentCategory(category.id);
                if (category.id === 'ai-generated') {
                  setSelectedContentTypes([]);
                }
              }}
            >
              <category.icon className="h-3 w-3" />
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* AI Generated Mode - Compact */}
        {contentCategory === 'ai-generated' && (
          <div className="p-3 rounded-lg border border-dashed border-primary/40 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Auto-Select</span>
              <Badge variant="secondary" className="text-[10px]">Recommended</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              AI will select optimal content types based on your industry and context.
            </p>
            
            {/* Quick hybrid selection */}
            <div className="flex flex-wrap gap-1">
              {EXTENDED_COLLATERAL_TYPES.slice(0, 6).map(ct => (
                <Badge
                  key={ct.id}
                  variant={selectedContentTypes.includes(ct.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-[10px] py-0.5 transition-colors",
                    selectedContentTypes.includes(ct.id) && "bg-primary"
                  )}
                  onClick={() => {
                    const newTypes = selectedContentTypes.includes(ct.id) 
                      ? selectedContentTypes.filter(id => id !== ct.id)
                      : [...selectedContentTypes, ct.id];
                    setSelectedContentTypes(newTypes);
                  }}
                >
                  {selectedContentTypes.includes(ct.id) && <Check className="h-2.5 w-2.5 mr-1" />}
                  {ct.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Content Type Grid - No Scroll, Clean Cards */}
        {contentCategory !== 'ai-generated' && filteredCollaterals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredCollaterals.slice(0, 6).map(ct => {
              const isSelected = workflowConfig?.collateralType?.id === ct.id;
              
              return (
                <div
                  key={ct.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
                  )}
                  onClick={() => onSelectCollateralType(ct)}
                >
                  <div className={cn(
                    "p-2 rounded-md shrink-0",
                    isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {ct.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ct.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{ct.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium">{ct.suggestedSlides}</span>
                    <span className="text-[10px] text-muted-foreground ml-0.5">slides</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {contentCategory !== 'ai-generated' && filteredCollaterals.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <LayoutGrid className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No content types for this category</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentTypeSelector;
