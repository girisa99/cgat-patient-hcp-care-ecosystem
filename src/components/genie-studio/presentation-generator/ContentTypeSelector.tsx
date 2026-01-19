/**
 * ContentTypeSelector - Focused component for selecting presentation content types
 * 
 * Features:
 * - AI Generated mode with multi-selection
 * - Extended content types with detailed descriptions
 * - Dynamic confidence scoring based on industry/segment
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Users,
  Briefcase,
  Building2,
  Rocket,
  Zap,
  HeartPulse,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLLATERAL_TYPES } from './EnhancedTemplateWorkflow';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';

// Extended content categories with detailed descriptions
export const CONTENT_CATEGORIES = [
  { id: 'ai-generated', label: 'AI Generated', icon: Sparkles, isAI: true, 
    description: 'Let AI analyze your topic and auto-select optimal content types' },
  { id: 'narrative', label: 'Narrative', icon: BookOpen, 
    description: 'Storytelling, case studies, customer journeys with emotional arcs' },
  { id: 'business', label: 'Business', icon: Briefcase, 
    description: 'Investor pitches, sales decks, board presentations, quarterly reviews' },
  { id: 'training', label: 'Training', icon: GraduationCap, 
    description: 'Educational modules, onboarding programs, workshops, certifications' },
  { id: 'research', label: 'Research', icon: BarChart3, 
    description: 'Data-driven reports, market analysis, whitepapers, scientific findings' },
  { id: 'visual', label: 'Visual', icon: LayoutGrid, 
    description: 'Infographic decks, product showcases, portfolios, galleries' },
  { id: 'strategic', label: 'Strategic', icon: Target, 
    description: 'Strategic plans, roadmaps, competitive analysis, OKR presentations' },
  { id: 'creative', label: 'Creative', icon: Lightbulb, 
    description: 'Brand campaigns, creative briefs, concept presentations, mood boards' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, 
    description: 'Campaign decks, content calendars, social media strategies, launch plans' },
  { id: 'compliance', label: 'Compliance', icon: Scale, 
    description: 'Regulatory updates, policy presentations, audit reports, legal briefings' },
];

// Extended collateral types beyond the base set
export const EXTENDED_COLLATERAL_TYPES = [
  ...COLLATERAL_TYPES,
  // Strategic types
  { id: 'strategic-plan', name: 'Strategic Plan', 
    description: 'Long-term goals, initiatives, and key milestones with timelines and resource allocation',
    icon: <Target className="h-5 w-5" />, category: 'strategic', suggestedSlides: 20, suggestedTones: ['strategic', 'professional', 'visionary'] },
  { id: 'competitive-analysis', name: 'Competitive Analysis', 
    description: 'Detailed competitor landscape, SWOT analysis, market positioning, and differentiation strategies',
    icon: <BarChart3 className="h-5 w-5" />, category: 'strategic', suggestedSlides: 15, suggestedTones: ['analytical', 'strategic', 'objective'] },
  { id: 'roadmap', name: 'Product Roadmap', 
    description: 'Feature timeline, release milestones, dependencies, and strategic priorities',
    icon: <Rocket className="h-5 w-5" />, category: 'strategic', suggestedSlides: 12, suggestedTones: ['strategic', 'confident', 'innovative'] },
  { id: 'okr-presentation', name: 'OKR Presentation', 
    description: 'Objectives and Key Results with progress tracking, alignment visualization, and team accountability',
    icon: <Zap className="h-5 w-5" />, category: 'strategic', suggestedSlides: 10, suggestedTones: ['focused', 'motivational', 'data-driven'] },
  // Creative types
  { id: 'brand-campaign', name: 'Brand Campaign', 
    description: 'Campaign concept, visual identity, messaging framework, and execution timeline',
    icon: <Megaphone className="h-5 w-5" />, category: 'creative', suggestedSlides: 18, suggestedTones: ['creative', 'engaging', 'bold'] },
  { id: 'concept-deck', name: 'Concept Deck', 
    description: 'Creative concepts, mood boards, visual directions, and design rationale',
    icon: <Lightbulb className="h-5 w-5" />, category: 'creative', suggestedSlides: 15, suggestedTones: ['creative', 'inspirational', 'innovative'] },
  // Marketing types
  { id: 'launch-plan', name: 'Launch Plan', 
    description: 'Go-to-market strategy, launch phases, marketing channels, KPIs, and success metrics',
    icon: <Rocket className="h-5 w-5" />, category: 'marketing', suggestedSlides: 20, suggestedTones: ['energetic', 'strategic', 'persuasive'] },
  { id: 'content-calendar', name: 'Content Calendar', 
    description: 'Editorial planning, content themes, publishing schedule, and channel distribution',
    icon: <LayoutGrid className="h-5 w-5" />, category: 'marketing', suggestedSlides: 12, suggestedTones: ['organized', 'clear', 'actionable'] },
  // Compliance types
  { id: 'regulatory-update', name: 'Regulatory Update', 
    description: 'Policy changes, compliance requirements, impact analysis, and implementation timeline',
    icon: <Scale className="h-5 w-5" />, category: 'compliance', suggestedSlides: 15, suggestedTones: ['formal', 'precise', 'authoritative'] },
  { id: 'hipaa-training', name: 'HIPAA Training', 
    description: 'Privacy rules, security requirements, breach protocols, and compliance checklists',
    icon: <HeartPulse className="h-5 w-5" />, category: 'compliance', suggestedSlides: 25, suggestedTones: ['educational', 'serious', 'practical'] },
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
  // Calculate dynamic confidence based on industry + segment + category match
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
      'travel': ['narrative', 'visual', 'marketing'],
      'startup': ['business', 'visual', 'marketing'],
      'pharma': ['compliance', 'research', 'training'],
      'legal': ['compliance', 'business', 'training'],
      'marketing': ['creative', 'marketing', 'visual'],
    };
    
    if (!industry) return 3;
    const matchingCategories = matches[industry] || [];
    if (matchingCategories.includes(category)) return 8;
    return 3;
  };

  const filteredCollaterals = EXTENDED_COLLATERAL_TYPES.filter(c => c.category === contentCategory);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        Content Type
        {contentCategory === 'ai-generated' && (
          <Badge variant="outline" className="ml-2 text-[10px] bg-primary/10 text-primary">
            Auto-detect
          </Badge>
        )}
      </Label>
      
      {/* Category Filter Pills - Horizontal Scroll */}
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-2">
          {CONTENT_CATEGORIES.map(category => (
            <Button
              key={category.id}
              variant={contentCategory === category.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-9 text-xs px-3 gap-1.5 whitespace-nowrap shrink-0",
                category.isAI && contentCategory === category.id && "bg-gradient-to-r from-primary to-accent"
              )}
              onClick={() => {
                setContentCategory(category.id);
                if (category.id === 'ai-generated') {
                  setSelectedContentTypes([]);
                }
              }}
              title={category.description}
            >
              <category.icon className="h-3.5 w-3.5" />
              {category.label}
              {!category.isAI && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5">
                  {EXTENDED_COLLATERAL_TYPES.filter(c => c.category === category.id).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      {/* AI Generated Mode - Enhanced with context-aware messaging */}
      {contentCategory === 'ai-generated' && (
        <Card className="border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium">AI Auto-Select Mode</h4>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                    Recommended
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on your <span className="font-medium text-foreground">{workflowConfig?.industryCategory || 'industry'}</span> industry 
                  {workflowConfig?.segment && <>, <span className="font-medium text-foreground">{workflowConfig.segment}</span> segment</>}, 
                  and <span className="font-medium text-foreground">{selectedLanguages.length || 1}</span> target language(s), 
                  AI will analyze your topic and automatically select the optimal combination of content types.
                </p>
                
                {/* Optional: Multi-select specific types for hybrid mode */}
                <div className="pt-3 border-t border-primary/20 space-y-2">
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Or select specific combinations (optional):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXTENDED_COLLATERAL_TYPES.slice(0, 12).map(ct => (
                      <Badge
                        key={ct.id}
                        variant={selectedContentTypes.includes(ct.id) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer text-[10px] py-0.5 hover:bg-primary/10 transition-colors",
                          selectedContentTypes.includes(ct.id) && "bg-primary hover:bg-primary/90"
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
                  {selectedContentTypes.length > 0 && (
                    <p className="text-[10px] text-primary">
                      ✓ AI will blend {selectedContentTypes.length} content type{selectedContentTypes.length > 1 ? 's' : ''} intelligently
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Type Cards - Detailed & Scrollable */}
      {contentCategory !== 'ai-generated' && (
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {filteredCollaterals.length > 0 ? (
              filteredCollaterals.map(ct => {
                const isSelected = workflowConfig?.collateralType?.id === ct.id;
                const dynamicConfidence = calculateConfidence(ct);
                
                return (
                  <Card
                    key={ct.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
                      isSelected && "border-primary ring-2 ring-primary/20 bg-primary/5"
                    )}
                    onClick={() => onSelectCollateralType(ct)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn(
                          "p-2 rounded-lg shrink-0",
                          isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {ct.icon}
                        </div>
                        
                        {/* Content - Detailed */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-sm text-foreground">{ct.name}</h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  dynamicConfidence >= 90 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300" :
                                  dynamicConfidence >= 80 ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300" :
                                  "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300"
                                )}
                              >
                                {dynamicConfidence}% match
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {ct.suggestedSlides} slides
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Detailed description */}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {ct.description}
                          </p>
                          
                          {/* Suggested tones - always visible */}
                          {ct.suggestedTones && ct.suggestedTones.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              <span className="text-[10px] text-muted-foreground">Tones:</span>
                              {ct.suggestedTones.slice(0, 4).map((tone: string) => (
                                <Badge 
                                  key={tone} 
                                  variant="outline" 
                                  className={cn(
                                    "text-[9px] capitalize py-0 px-1.5",
                                    isSelected && "bg-primary/10 border-primary/30"
                                  )}
                                >
                                  {tone}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Selection indicator */}
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No content types available for this category</p>
                <p className="text-xs mt-1">Select a different category above</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ContentTypeSelector;
