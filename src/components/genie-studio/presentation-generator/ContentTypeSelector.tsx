/**
 * ContentTypeSelector - Enterprise-grade content type selection
 * 
 * Features:
 * - Clean horizontal pill navigation
 * - Compact grid layout for content types
 * - AI Generated mode with smart recommendations
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  FileText, 
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

// Extended content categories
export const CONTENT_CATEGORIES = [
  { id: 'ai-generated', label: 'AI Auto', icon: Sparkles, isAI: true, 
    description: 'AI analyzes and selects optimal content types' },
  { id: 'narrative', label: 'Narrative', icon: BookOpen, 
    description: 'Storytelling & case studies' },
  { id: 'business', label: 'Business', icon: Briefcase, 
    description: 'Investor & sales decks' },
  { id: 'training', label: 'Training', icon: GraduationCap, 
    description: 'Educational modules' },
  { id: 'research', label: 'Research', icon: BarChart3, 
    description: 'Data-driven reports' },
  { id: 'visual', label: 'Visual', icon: LayoutGrid, 
    description: 'Infographics & portfolios' },
  { id: 'strategic', label: 'Strategic', icon: Target, 
    description: 'Plans & roadmaps' },
  { id: 'creative', label: 'Creative', icon: Lightbulb, 
    description: 'Campaigns & concepts' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, 
    description: 'Launch & content plans' },
  { id: 'compliance', label: 'Compliance', icon: Scale, 
    description: 'Regulatory & legal' },
];

// Extended collateral types
export const EXTENDED_COLLATERAL_TYPES = [
  ...COLLATERAL_TYPES,
  { id: 'strategic-plan', name: 'Strategic Plan', 
    description: 'Long-term goals, initiatives, milestones, and resource allocation',
    icon: <Target className="h-4 w-4" />, category: 'strategic', suggestedSlides: 20, suggestedTones: ['strategic', 'professional'] },
  { id: 'competitive-analysis', name: 'Competitive Analysis', 
    description: 'Competitor landscape, SWOT analysis, market positioning',
    icon: <BarChart3 className="h-4 w-4" />, category: 'strategic', suggestedSlides: 15, suggestedTones: ['analytical', 'strategic'] },
  { id: 'roadmap', name: 'Product Roadmap', 
    description: 'Feature timeline, release milestones, dependencies',
    icon: <Rocket className="h-4 w-4" />, category: 'strategic', suggestedSlides: 12, suggestedTones: ['strategic', 'confident'] },
  { id: 'okr-presentation', name: 'OKR Presentation', 
    description: 'Objectives and Key Results with progress tracking',
    icon: <Zap className="h-4 w-4" />, category: 'strategic', suggestedSlides: 10, suggestedTones: ['focused', 'motivational'] },
  { id: 'brand-campaign', name: 'Brand Campaign', 
    description: 'Campaign concept, visual identity, messaging framework',
    icon: <Megaphone className="h-4 w-4" />, category: 'creative', suggestedSlides: 18, suggestedTones: ['creative', 'engaging'] },
  { id: 'concept-deck', name: 'Concept Deck', 
    description: 'Creative concepts, mood boards, visual directions',
    icon: <Lightbulb className="h-4 w-4" />, category: 'creative', suggestedSlides: 15, suggestedTones: ['creative', 'inspirational'] },
  { id: 'launch-plan', name: 'Launch Plan', 
    description: 'Go-to-market strategy, launch phases, KPIs',
    icon: <Rocket className="h-4 w-4" />, category: 'marketing', suggestedSlides: 20, suggestedTones: ['energetic', 'strategic'] },
  { id: 'content-calendar', name: 'Content Calendar', 
    description: 'Editorial planning, publishing schedule',
    icon: <LayoutGrid className="h-4 w-4" />, category: 'marketing', suggestedSlides: 12, suggestedTones: ['organized', 'clear'] },
  { id: 'regulatory-update', name: 'Regulatory Update', 
    description: 'Policy changes, compliance requirements, impact analysis',
    icon: <Scale className="h-4 w-4" />, category: 'compliance', suggestedSlides: 15, suggestedTones: ['formal', 'precise'] },
  { id: 'hipaa-training', name: 'HIPAA Training', 
    description: 'Privacy rules, security requirements, breach protocols',
    icon: <HeartPulse className="h-4 w-4" />, category: 'compliance', suggestedSlides: 25, suggestedTones: ['educational', 'serious'] },
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
  const calculateConfidence = (ct: any) => {
    const baseConfidence = 72;
    const industryBonus = workflowConfig?.industryCategory ? 10 : 0;
    const segmentBonus = workflowConfig?.segment ? 8 : 0;
    const categoryMatch = getIndustryContentMatch(workflowConfig?.industryCategory, contentCategory);
    return Math.min(98, baseConfidence + industryBonus + segmentBonus + categoryMatch);
  };

  const getIndustryContentMatch = (industry: string | undefined, category: string) => {
    const matches: Record<string, string[]> = {
      'consulting': ['business', 'strategic', 'research'],
      'healthcare': ['compliance', 'training', 'research'],
      'technology': ['visual', 'business', 'strategic'],
      'finance': ['business', 'compliance', 'research'],
      'education': ['training', 'narrative', 'visual'],
      'pharma': ['compliance', 'research', 'training'],
      'marketing': ['creative', 'marketing', 'visual'],
    };
    
    if (!industry) return 3;
    const matchingCategories = matches[industry] || [];
    return matchingCategories.includes(category) ? 8 : 3;
  };

  const filteredCollaterals = EXTENDED_COLLATERAL_TYPES.filter(c => c.category === contentCategory);

  return (
    <div className="space-y-4">
      {/* Category Pills - Wrapped for smaller screens */}
      <div className="flex flex-wrap gap-1.5">
        {CONTENT_CATEGORIES.map(category => (
          <Button
            key={category.id}
            variant={contentCategory === category.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 text-xs px-2.5 gap-1",
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
      
      {/* AI Generated Mode */}
      {contentCategory === 'ai-generated' && (
        <div className="p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">AI Auto-Select</span>
                <Badge variant="secondary" className="text-[10px]">Recommended</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI will analyze your topic and select optimal content types based on 
                <span className="font-medium text-foreground"> {workflowConfig?.industryCategory || 'your industry'}</span>,
                <span className="font-medium text-foreground"> {workflowConfig?.segment || 'segment'}</span>, and 
                <span className="font-medium text-foreground"> {selectedLanguages.length || 1}</span> language(s).
              </p>
              
              {/* Optional hybrid selection */}
              <div className="pt-2 border-t border-primary/20">
                <p className="text-[11px] text-muted-foreground mb-2">Or combine specific types:</p>
                <div className="flex flex-wrap gap-1">
                  {EXTENDED_COLLATERAL_TYPES.slice(0, 8).map(ct => (
                    <Badge
                      key={ct.id}
                      variant={selectedContentTypes.includes(ct.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer text-[10px] py-0.5 transition-colors",
                        selectedContentTypes.includes(ct.id) 
                          ? "bg-primary hover:bg-primary/90" 
                          : "hover:bg-primary/10"
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
            </div>
          </div>
        </div>
      )}

      {/* Content Type Grid */}
      {contentCategory !== 'ai-generated' && (
        <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
          {filteredCollaterals.length > 0 ? (
            filteredCollaterals.map(ct => {
              const isSelected = workflowConfig?.collateralType?.id === ct.id;
              const confidence = calculateConfidence(ct);
              
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
                  {/* Icon */}
                  <div className={cn(
                    "p-2 rounded-md shrink-0",
                    isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {ct.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">{ct.name}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] px-1.5 py-0 shrink-0",
                          confidence >= 90 ? "bg-green-500/10 text-green-600 border-green-200" :
                          confidence >= 80 ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                          "bg-amber-500/10 text-amber-600 border-amber-200"
                        )}
                      >
                        {confidence}%
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{ct.description}</p>
                  </div>
                  
                  {/* Slides count */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium">{ct.suggestedSlides}</span>
                    <span className="text-[10px] text-muted-foreground ml-0.5">slides</span>
                  </div>
                  
                  {/* Check */}
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No content types for this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentTypeSelector;
