/**
 * ContentTypeSelector - Dynamic enterprise content type selection
 * Fully extensible with sub-options for Training, Investor, Storytelling, etc.
 */

import React, { useState, useMemo } from 'react';
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
  TrendingUp,
  Video,
  FileText,
  Users,
  PenTool,
  ChevronDown,
  ChevronRight,
  DollarSign,
  PresentationIcon,
  BookMarked,
  Award,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLLATERAL_TYPES } from './EnhancedTemplateWorkflow';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ==========================================
// DYNAMIC CONTENT CATEGORIES (Extensible)
// ==========================================

export const CONTENT_CATEGORIES = [
  { id: 'ai-generated', label: 'AI Auto', icon: Sparkles, isAI: true, description: 'AI selects optimal mix' },
  { id: 'narrative', label: 'Narrative', icon: BookOpen, description: 'Story-driven content' },
  { id: 'storytelling', label: 'Storytelling', icon: PenTool, description: 'Engaging story arcs' }, // NEW
  { id: 'business', label: 'Business', icon: Briefcase, description: 'Professional business content' },
  { id: 'investor', label: 'Investor & VC', icon: TrendingUp, description: 'Pitch decks & updates' }, // NEW
  { id: 'training', label: 'Training', icon: GraduationCap, description: 'Learning materials', hasSubOptions: true },
  { id: 'research', label: 'Research', icon: BarChart3, description: 'Data & analysis' },
  { id: 'visual', label: 'Visual', icon: LayoutGrid, description: 'Graphics-heavy layouts' },
  { id: 'strategic', label: 'Strategic', icon: Target, description: 'Strategy frameworks' },
  { id: 'creative', label: 'Creative', icon: Lightbulb, description: 'Creative concepts' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, description: 'Campaigns & branding' },
  { id: 'compliance', label: 'Compliance', icon: Scale, description: 'Regulatory content' },
];

// ==========================================
// SUB-OPTIONS FOR SPECIFIC CATEGORIES
// ==========================================

export const CATEGORY_SUB_OPTIONS: Record<string, Array<{
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  suggestedSlides: number;
}>> = {
  'training': [
    { id: 'training-video', label: 'Training Video', description: 'Video-based learning with voiceover', icon: Video, suggestedSlides: 15 },
    { id: 'training-manual', label: 'Training Manual', description: 'Comprehensive documentation', icon: FileText, suggestedSlides: 30 },
    { id: 'training-quickref', label: 'Quick Reference', description: 'Condensed key points', icon: BookMarked, suggestedSlides: 8 },
    { id: 'training-workshop', label: 'Workshop Materials', description: 'Interactive session content', icon: Users, suggestedSlides: 20 },
    { id: 'training-elearning', label: 'E-Learning Module', description: 'Self-paced online course', icon: GraduationCap, suggestedSlides: 25 },
    { id: 'training-certification', label: 'Certification', description: 'Formal certification program', icon: Award, suggestedSlides: 35 },
  ],
  'investor': [
    { id: 'investor-seed', label: 'Seed Pitch', description: 'Early-stage funding deck', icon: Rocket, suggestedSlides: 12 },
    { id: 'investor-series', label: 'Series A/B Pitch', description: 'Growth-stage investment', icon: TrendingUp, suggestedSlides: 18 },
    { id: 'investor-update', label: 'Investor Update', description: 'Monthly/quarterly report', icon: BarChart3, suggestedSlides: 10 },
    { id: 'investor-due-diligence', label: 'Due Diligence', description: 'Comprehensive materials', icon: FileText, suggestedSlides: 40 },
  ],
  'storytelling': [
    { id: 'story-case', label: 'Case Study', description: 'Customer success narrative', icon: Users, suggestedSlides: 15 },
    { id: 'story-origin', label: 'Origin Story', description: 'Company founding narrative', icon: Rocket, suggestedSlides: 12 },
    { id: 'story-vision', label: 'Vision Story', description: 'Future state narrative', icon: Lightbulb, suggestedSlides: 10 },
    { id: 'story-transformation', label: 'Transformation', description: 'Change journey story', icon: Zap, suggestedSlides: 18 },
  ],
  'compliance': [
    { id: 'compliance-policy', label: 'Policy Document', description: 'Formal policy presentation', icon: FileText, suggestedSlides: 20 },
    { id: 'compliance-audit', label: 'Audit Report', description: 'Compliance findings', icon: AlertCircle, suggestedSlides: 25 },
    { id: 'compliance-training', label: 'Compliance Training', description: 'Regulatory training', icon: GraduationCap, suggestedSlides: 30 },
  ],
};

// ==========================================
// EXTENDED COLLATERAL TYPES (Dynamic)
// ==========================================

export const EXTENDED_COLLATERAL_TYPES = [
  ...COLLATERAL_TYPES,
  // Strategic
  { id: 'strategic-plan', name: 'Strategic Plan', description: 'Goals, initiatives, milestones', icon: <Target className="h-4 w-4" />, category: 'strategic', suggestedSlides: 20, suggestedTones: ['strategic'] },
  { id: 'competitive-analysis', name: 'Competitive Analysis', description: 'Competitor landscape, SWOT', icon: <BarChart3 className="h-4 w-4" />, category: 'strategic', suggestedSlides: 15, suggestedTones: ['analytical'] },
  { id: 'roadmap', name: 'Product Roadmap', description: 'Feature timeline, releases', icon: <Rocket className="h-4 w-4" />, category: 'strategic', suggestedSlides: 12, suggestedTones: ['strategic'] },
  { id: 'okr-presentation', name: 'OKR Presentation', description: 'Objectives and Key Results', icon: <Zap className="h-4 w-4" />, category: 'strategic', suggestedSlides: 10, suggestedTones: ['focused'] },
  
  // Creative
  { id: 'brand-campaign', name: 'Brand Campaign', description: 'Campaign concept, messaging', icon: <Megaphone className="h-4 w-4" />, category: 'creative', suggestedSlides: 18, suggestedTones: ['creative'] },
  { id: 'concept-deck', name: 'Concept Deck', description: 'Creative concepts, mood boards', icon: <Lightbulb className="h-4 w-4" />, category: 'creative', suggestedSlides: 15, suggestedTones: ['creative'] },
  
  // Marketing
  { id: 'launch-plan', name: 'Launch Plan', description: 'Go-to-market strategy', icon: <Rocket className="h-4 w-4" />, category: 'marketing', suggestedSlides: 20, suggestedTones: ['energetic'] },
  { id: 'content-calendar', name: 'Content Calendar', description: 'Editorial planning', icon: <LayoutGrid className="h-4 w-4" />, category: 'marketing', suggestedSlides: 12, suggestedTones: ['organized'] },
  
  // Compliance
  { id: 'regulatory-update', name: 'Regulatory Update', description: 'Policy changes, compliance', icon: <Scale className="h-4 w-4" />, category: 'compliance', suggestedSlides: 15, suggestedTones: ['formal'] },
  { id: 'hipaa-training', name: 'HIPAA Training', description: 'Privacy rules, security', icon: <HeartPulse className="h-4 w-4" />, category: 'compliance', suggestedSlides: 25, suggestedTones: ['educational'] },
  
  // Investor - NEW
  { id: 'pitch-deck', name: 'Pitch Deck', description: 'Investor pitch presentation', icon: <TrendingUp className="h-4 w-4" />, category: 'investor', suggestedSlides: 15, suggestedTones: ['persuasive'] },
  { id: 'investor-update', name: 'Investor Update', description: 'Progress & metrics report', icon: <BarChart3 className="h-4 w-4" />, category: 'investor', suggestedSlides: 10, suggestedTones: ['professional'] },
  
  // Storytelling - NEW
  { id: 'case-study', name: 'Case Study', description: 'Customer success story', icon: <Users className="h-4 w-4" />, category: 'storytelling', suggestedSlides: 15, suggestedTones: ['narrative'] },
  { id: 'company-story', name: 'Company Story', description: 'Origin & vision narrative', icon: <BookOpen className="h-4 w-4" />, category: 'storytelling', suggestedSlides: 12, suggestedTones: ['engaging'] },
  
  // Research
  { id: 'market-research', name: 'Market Research', description: 'Market analysis & insights', icon: <BarChart3 className="h-4 w-4" />, category: 'research', suggestedSlides: 20, suggestedTones: ['analytical'] },
  { id: 'data-report', name: 'Data Report', description: 'Analytics & findings', icon: <BarChart3 className="h-4 w-4" />, category: 'research', suggestedSlides: 18, suggestedTones: ['informative'] },
];

interface ContentTypeSelectorProps {
  contentCategory: string;
  setContentCategory: (category: string) => void;
  selectedContentTypes: string[];
  setSelectedContentTypes: (types: string[]) => void;
  workflowConfig: FinalWorkflowConfig | null;
  onSelectCollateralType: (collateralType: any) => void;
  selectedLanguages?: string[];
  selectedSubOptions?: string[];
  onSubOptionChange?: (subOptions: string[]) => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentCategory,
  setContentCategory,
  selectedContentTypes,
  setSelectedContentTypes,
  workflowConfig,
  onSelectCollateralType,
  selectedLanguages = [],
  selectedSubOptions = [],
  onSubOptionChange,
}) => {
  const [expandedSubOptions, setExpandedSubOptions] = useState(false);
  
  const filteredCollaterals = useMemo(() => 
    EXTENDED_COLLATERAL_TYPES.filter(c => c.category === contentCategory),
    [contentCategory]
  );
  
  const currentSubOptions = useMemo(() => 
    CATEGORY_SUB_OPTIONS[contentCategory] || [],
    [contentCategory]
  );
  
  const hasSubOptions = currentSubOptions.length > 0;

  const handleSubOptionToggle = (subOptionId: string) => {
    if (!onSubOptionChange) return;
    
    const newSubOptions = selectedSubOptions.includes(subOptionId)
      ? selectedSubOptions.filter(id => id !== subOptionId)
      : [...selectedSubOptions, subOptionId];
    
    onSubOptionChange(newSubOptions);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Content Type</span>
          <Badge variant="outline" className="text-[10px]">
            {CONTENT_CATEGORIES.length} categories
          </Badge>
        </div>

        {/* Category Pills - Compact Wrap with Scroll */}
        <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto">
          {CONTENT_CATEGORIES.map(category => (
            <Button
              key={category.id}
              variant={contentCategory === category.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-[11px] px-2 gap-1 shrink-0",
                category.isAI && contentCategory === category.id && "bg-gradient-to-r from-primary to-primary/80"
              )}
              onClick={() => {
                setContentCategory(category.id);
                if (category.id === 'ai-generated') {
                  setSelectedContentTypes([]);
                }
                // Reset sub-options when changing category
                if (onSubOptionChange) {
                  onSubOptionChange([]);
                }
              }}
              title={category.description}
            >
              <category.icon className="h-3 w-3" />
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* AI Generated Mode */}
        {contentCategory === 'ai-generated' && (
          <div className="p-3 rounded-lg border border-dashed border-primary/40 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Auto-Select</span>
              <Badge variant="secondary" className="text-[10px]">Recommended</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              AI will select optimal content types based on your industry, segment, and context.
            </p>
            
            {/* Multi-select hybrid mode */}
            <div className="flex flex-wrap gap-1">
              {EXTENDED_COLLATERAL_TYPES.slice(0, 8).map(ct => (
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

        {/* Sub-Options Panel (for Training, Investor, etc.) */}
        {contentCategory !== 'ai-generated' && hasSubOptions && (
          <Collapsible open={expandedSubOptions} onOpenChange={setExpandedSubOptions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-primary" />
                  <span>Select Output Format</span>
                  {selectedSubOptions.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedSubOptions.length} selected
                    </Badge>
                  )}
                </div>
                {expandedSubOptions ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-muted/30 border">
                {currentSubOptions.map(option => {
                  const isSelected = selectedSubOptions.includes(option.id);
                  const IconComponent = option.icon;
                  
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all",
                        "hover:border-primary/50 hover:bg-primary/5",
                        isSelected && "border-primary bg-primary/10 ring-1 ring-primary/20"
                      )}
                      onClick={() => handleSubOptionToggle(option.id)}
                    >
                      <div className={cn(
                        "p-1.5 rounded shrink-0",
                        isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{option.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-muted-foreground">{option.suggestedSlides} slides</span>
                      </div>
                      {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Content Type Grid */}
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
            <p className="text-xs">No content types for this category yet</p>
            <p className="text-[10px] mt-1">Select a different category or use AI Auto</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentTypeSelector;
