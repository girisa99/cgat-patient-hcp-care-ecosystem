/**
 * ContentTypeSelector - Clean dropdown-based content type selection
 * Uses proper Select components for better UX
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  BookMarked,
  Award,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLLATERAL_TYPES } from './EnhancedTemplateWorkflow';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// ==========================================
// DYNAMIC CONTENT CATEGORIES
// ==========================================

export const CONTENT_CATEGORIES = [
  { id: 'ai-generated', label: 'AI Auto', icon: Sparkles, isAI: true, description: 'AI selects optimal mix' },
  { id: 'narrative', label: 'Narrative', icon: BookOpen, description: 'Story-driven content' },
  { id: 'storytelling', label: 'Storytelling', icon: PenTool, description: 'Engaging story arcs' },
  { id: 'business', label: 'Business', icon: Briefcase, description: 'Professional business content' },
  { id: 'investor', label: 'Investor & VC', icon: TrendingUp, description: 'Pitch decks & updates' },
  { id: 'training', label: 'Training', icon: GraduationCap, description: 'Learning materials' },
  { id: 'research', label: 'Research', icon: BarChart3, description: 'Data & analysis' },
  { id: 'visual', label: 'Visual', icon: LayoutGrid, description: 'Graphics-heavy layouts' },
  { id: 'strategic', label: 'Strategic', icon: Target, description: 'Strategy frameworks' },
  { id: 'creative', label: 'Creative', icon: Lightbulb, description: 'Creative concepts' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, description: 'Campaigns & branding' },
  { id: 'compliance', label: 'Compliance', icon: Scale, description: 'Regulatory content' },
];

// ==========================================
// SUB-OPTIONS FOR ALL CATEGORIES
// ==========================================

export const CATEGORY_SUB_OPTIONS: Record<string, Array<{
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  suggestedSlides: number;
  tags?: string[];
}>> = {
  'training': [
    { id: 'training-video', label: 'Training Video', description: 'Video-based learning', icon: Video, suggestedSlides: 15 },
    { id: 'training-manual', label: 'Training Manual', description: 'Documentation', icon: FileText, suggestedSlides: 30 },
    { id: 'training-quickref', label: 'Quick Reference', description: 'Key points', icon: BookMarked, suggestedSlides: 8 },
    { id: 'training-workshop', label: 'Workshop Materials', description: 'Interactive content', icon: Users, suggestedSlides: 20 },
    { id: 'training-elearning', label: 'E-Learning Module', description: 'Online course', icon: GraduationCap, suggestedSlides: 25 },
    { id: 'training-certification', label: 'Certification', description: 'Certification materials', icon: Award, suggestedSlides: 35 },
    { id: 'training-onboarding', label: 'Onboarding Guide', description: 'New employee guide', icon: Users, suggestedSlides: 18 },
  ],
  'investor': [
    { id: 'investor-seed', label: 'Seed Pitch', description: 'Early-stage funding', icon: Rocket, suggestedSlides: 12 },
    { id: 'investor-series', label: 'Series A/B Pitch', description: 'Growth-stage', icon: TrendingUp, suggestedSlides: 18 },
    { id: 'investor-update', label: 'Investor Update', description: 'Progress report', icon: BarChart3, suggestedSlides: 10 },
    { id: 'investor-due-diligence', label: 'Due Diligence', description: 'Comprehensive materials', icon: FileText, suggestedSlides: 40 },
    { id: 'investor-board', label: 'Board Deck', description: 'Board meeting', icon: Users, suggestedSlides: 15 },
  ],
  'storytelling': [
    { id: 'story-case', label: 'Case Study', description: 'Customer success', icon: Users, suggestedSlides: 15 },
    { id: 'story-origin', label: 'Origin Story', description: 'Company founding', icon: Rocket, suggestedSlides: 12 },
    { id: 'story-vision', label: 'Vision Story', description: 'Future state', icon: Lightbulb, suggestedSlides: 10 },
    { id: 'story-transformation', label: 'Transformation', description: 'Change journey', icon: Zap, suggestedSlides: 18 },
    { id: 'story-impact', label: 'Impact Report', description: 'Results narrative', icon: Target, suggestedSlides: 20 },
  ],
  'research': [
    { id: 'research-market', label: 'Market Research', description: 'Market analysis', icon: BarChart3, suggestedSlides: 25 },
    { id: 'research-competitive', label: 'Competitive Analysis', description: 'Competitor study', icon: Target, suggestedSlides: 18 },
    { id: 'research-user', label: 'User Research', description: 'User insights', icon: Users, suggestedSlides: 20 },
    { id: 'research-data', label: 'Data Analysis', description: 'Statistical findings', icon: BarChart3, suggestedSlides: 22 },
    { id: 'research-industry', label: 'Industry Report', description: 'Industry trends', icon: TrendingUp, suggestedSlides: 25 },
  ],
  'marketing': [
    { id: 'marketing-campaign', label: 'Campaign Deck', description: 'Campaign overview', icon: Megaphone, suggestedSlides: 18 },
    { id: 'marketing-brand', label: 'Brand Guidelines', description: 'Brand identity', icon: PenTool, suggestedSlides: 25 },
    { id: 'marketing-launch', label: 'Product Launch', description: 'Go-to-market', icon: Rocket, suggestedSlides: 20 },
    { id: 'marketing-content', label: 'Content Strategy', description: 'Content planning', icon: LayoutGrid, suggestedSlides: 15 },
    { id: 'marketing-performance', label: 'Performance Report', description: 'Metrics & ROI', icon: BarChart3, suggestedSlides: 15 },
  ],
  'strategic': [
    { id: 'strategic-corporate', label: 'Corporate Strategy', description: 'Enterprise strategy', icon: Briefcase, suggestedSlides: 25 },
    { id: 'strategic-digital', label: 'Digital Transformation', description: 'Digital roadmap', icon: Zap, suggestedSlides: 22 },
    { id: 'strategic-growth', label: 'Growth Strategy', description: 'Expansion planning', icon: TrendingUp, suggestedSlides: 18 },
    { id: 'strategic-operations', label: 'Operations Strategy', description: 'Operational excellence', icon: Target, suggestedSlides: 20 },
  ],
  'compliance': [
    { id: 'compliance-policy', label: 'Policy Document', description: 'Formal policy', icon: FileText, suggestedSlides: 20 },
    { id: 'compliance-audit', label: 'Audit Report', description: 'Audit findings', icon: AlertCircle, suggestedSlides: 25 },
    { id: 'compliance-hipaa', label: 'HIPAA Compliance', description: 'Healthcare privacy', icon: HeartPulse, suggestedSlides: 28 },
    { id: 'compliance-gdpr', label: 'GDPR/Privacy', description: 'Data privacy', icon: Scale, suggestedSlides: 22 },
  ],
  'business': [
    { id: 'business-plan', label: 'Business Plan', description: 'Business strategy', icon: Briefcase, suggestedSlides: 30 },
    { id: 'business-proposal', label: 'Business Proposal', description: 'Client proposal', icon: FileText, suggestedSlides: 18 },
    { id: 'business-review', label: 'Business Review', description: 'Performance review', icon: BarChart3, suggestedSlides: 20 },
    { id: 'business-case', label: 'Business Case', description: 'Investment case', icon: Target, suggestedSlides: 15 },
  ],
  'creative': [
    { id: 'creative-concept', label: 'Concept Deck', description: 'Creative concepts', icon: Lightbulb, suggestedSlides: 15 },
    { id: 'creative-mood', label: 'Mood Board', description: 'Visual inspiration', icon: PenTool, suggestedSlides: 10 },
    { id: 'creative-portfolio', label: 'Portfolio', description: 'Work showcase', icon: LayoutGrid, suggestedSlides: 20 },
  ],
  'visual': [
    { id: 'visual-infographic', label: 'Infographic Deck', description: 'Data visualization', icon: BarChart3, suggestedSlides: 12 },
    { id: 'visual-photo', label: 'Photo Essay', description: 'Image-driven', icon: LayoutGrid, suggestedSlides: 15 },
    { id: 'visual-diagram', label: 'Diagram Collection', description: 'Technical diagrams', icon: Target, suggestedSlides: 18 },
  ],
  'narrative': [
    { id: 'narrative-keynote', label: 'Keynote Speech', description: 'Keynote format', icon: Users, suggestedSlides: 20 },
    { id: 'narrative-ted', label: 'TED-Style Talk', description: 'Idea-driven', icon: Lightbulb, suggestedSlides: 15 },
    { id: 'narrative-story', label: 'Story Presentation', description: 'Narrative format', icon: BookOpen, suggestedSlides: 18 },
  ],
};

// ==========================================
// EXTENDED COLLATERAL TYPES
// ==========================================

export const EXTENDED_COLLATERAL_TYPES = [
  ...COLLATERAL_TYPES,
  { id: 'strategic-plan', name: 'Strategic Plan', description: 'Goals & milestones', icon: <Target className="h-4 w-4" />, category: 'strategic', suggestedSlides: 20 },
  { id: 'competitive-analysis', name: 'Competitive Analysis', description: 'Competitor landscape', icon: <BarChart3 className="h-4 w-4" />, category: 'strategic', suggestedSlides: 15 },
  { id: 'roadmap', name: 'Product Roadmap', description: 'Feature timeline', icon: <Rocket className="h-4 w-4" />, category: 'strategic', suggestedSlides: 12 },
  { id: 'brand-campaign', name: 'Brand Campaign', description: 'Campaign concept', icon: <Megaphone className="h-4 w-4" />, category: 'creative', suggestedSlides: 18 },
  { id: 'concept-deck', name: 'Concept Deck', description: 'Creative concepts', icon: <Lightbulb className="h-4 w-4" />, category: 'creative', suggestedSlides: 15 },
  { id: 'launch-plan', name: 'Launch Plan', description: 'Go-to-market strategy', icon: <Rocket className="h-4 w-4" />, category: 'marketing', suggestedSlides: 20 },
  { id: 'regulatory-update', name: 'Regulatory Update', description: 'Policy changes', icon: <Scale className="h-4 w-4" />, category: 'compliance', suggestedSlides: 15 },
  { id: 'pitch-deck', name: 'Pitch Deck', description: 'Investor pitch', icon: <TrendingUp className="h-4 w-4" />, category: 'investor', suggestedSlides: 15 },
  { id: 'case-study', name: 'Case Study', description: 'Customer success story', icon: <Users className="h-4 w-4" />, category: 'storytelling', suggestedSlides: 15 },
  { id: 'market-research', name: 'Market Research', description: 'Market analysis', icon: <BarChart3 className="h-4 w-4" />, category: 'research', suggestedSlides: 20 },
];

// ==========================================
// AI AUTO-SELECT MULTI-SELECT DROPDOWN
// ==========================================

interface AIAutoSelectDropdownProps {
  selectedContentTypes: string[];
  setSelectedContentTypes: (types: string[]) => void;
}

const AIAutoSelectDropdown: React.FC<AIAutoSelectDropdownProps> = ({
  selectedContentTypes,
  setSelectedContentTypes,
}) => {
  const [open, setOpen] = useState(false);

  const toggleType = (typeId: string) => {
    if (selectedContentTypes.includes(typeId)) {
      setSelectedContentTypes(selectedContentTypes.filter(id => id !== typeId));
    } else {
      setSelectedContentTypes([...selectedContentTypes, typeId]);
    }
  };

  const displayText = selectedContentTypes.length === 0
    ? 'Select content types...'
    : `${selectedContentTypes.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 text-sm font-normal"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 z-50 bg-popover border shadow-lg" align="start">
        <ScrollArea className="h-[250px]">
          <div className="p-2 space-y-1">
            {EXTENDED_COLLATERAL_TYPES.map(ct => (
              <div
                key={ct.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                  selectedContentTypes.includes(ct.id) && "bg-primary/10"
                )}
                onClick={() => toggleType(ct.id)}
              >
                <Checkbox
                  checked={selectedContentTypes.includes(ct.id)}
                  className="pointer-events-none"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ct.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{ct.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {selectedContentTypes.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setSelectedContentTypes([])}
            >
              Clear All
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// ==========================================
// SUB-OPTIONS MULTI-SELECT DROPDOWN
// ==========================================

interface SubOptionsDropdownProps {
  options: Array<{ id: string; label: string; description: string; icon: React.ElementType; suggestedSlides: number }>;
  selectedSubOptions: string[];
  onSubOptionChange: (subOptions: string[]) => void;
}

const SubOptionsDropdown: React.FC<SubOptionsDropdownProps> = ({
  options,
  selectedSubOptions,
  onSubOptionChange,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (optionId: string) => {
    if (selectedSubOptions.includes(optionId)) {
      onSubOptionChange(selectedSubOptions.filter(id => id !== optionId));
    } else {
      onSubOptionChange([...selectedSubOptions, optionId]);
    }
  };

  const displayText = selectedSubOptions.length === 0
    ? 'Select format...'
    : `${selectedSubOptions.length} format${selectedSubOptions.length > 1 ? 's' : ''} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 text-sm font-normal"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 z-50 bg-popover border shadow-lg" align="start">
        <ScrollArea className="h-[250px]">
          <div className="p-2 space-y-1">
            {options.map(option => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                    selectedSubOptions.includes(option.id) && "bg-primary/10"
                  )}
                  onClick={() => toggleOption(option.id)}
                >
                  <Checkbox
                    checked={selectedSubOptions.includes(option.id)}
                    className="pointer-events-none"
                  />
                  <div className="p-1.5 rounded bg-muted">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{option.label}</p>
                      <Badge variant="secondary" className="text-[10px] ml-2">{option.suggestedSlides} slides</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {selectedSubOptions.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onSubOptionChange([])}
            >
              Clear All
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

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
  const filteredCollaterals = useMemo(() => 
    EXTENDED_COLLATERAL_TYPES.filter(c => c.category === contentCategory),
    [contentCategory]
  );
  
  const currentSubOptions = useMemo(() => 
    CATEGORY_SUB_OPTIONS[contentCategory] || [],
    [contentCategory]
  );
  
  const hasSubOptions = currentSubOptions.length > 0;
  const selectedCategoryData = CONTENT_CATEGORIES.find(c => c.id === contentCategory);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Content Type</span>
          <Badge variant="outline" className="text-[10px]">
            {CONTENT_CATEGORIES.length} categories
          </Badge>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={contentCategory} onValueChange={(value) => {
            setContentCategory(value);
            if (value === 'ai-generated') {
              setSelectedContentTypes([]);
            }
            if (onSubOptionChange) {
              onSubOptionChange([]);
            }
          }}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue>
                {selectedCategoryData && (
                  <div className="flex items-center gap-2">
                    <selectedCategoryData.icon className="h-4 w-4 text-primary" />
                    <span>{selectedCategoryData.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover border shadow-lg">
              {CONTENT_CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <category.icon className={cn("h-4 w-4", category.isAI ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex flex-col">
                      <span className="font-medium">{category.label}</span>
                      <span className="text-xs text-muted-foreground">{category.description}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* AI Auto-Select Mode */}
        {contentCategory === 'ai-generated' && (
          <div className="space-y-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI Auto-Select</span>
              <Badge variant="secondary" className="text-[10px]">Recommended</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              AI will select optimal content types based on your industry, segment, and context.
            </p>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Content Types (optional)</Label>
              <AIAutoSelectDropdown
                selectedContentTypes={selectedContentTypes}
                setSelectedContentTypes={setSelectedContentTypes}
              />
            </div>
            {selectedContentTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedContentTypes.map(typeId => {
                  const ct = EXTENDED_COLLATERAL_TYPES.find(c => c.id === typeId);
                  return ct ? (
                    <Badge key={typeId} variant="default" className="text-[10px] py-0.5 bg-primary/80">
                      <Check className="h-2.5 w-2.5 mr-1" />
                      {ct.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Sub-Options Dropdown */}
        {contentCategory !== 'ai-generated' && hasSubOptions && onSubOptionChange && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              Output Format
            </Label>
            <SubOptionsDropdown
              options={currentSubOptions}
              selectedSubOptions={selectedSubOptions}
              onSubOptionChange={onSubOptionChange}
            />
            {selectedSubOptions.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedSubOptions.map(optId => {
                  const opt = currentSubOptions.find(o => o.id === optId);
                  return opt ? (
                    <Badge key={optId} variant="secondary" className="text-[10px] py-0.5">
                      <Check className="h-2.5 w-2.5 mr-1" />
                      {opt.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Content Type Selection Grid */}
        {contentCategory !== 'ai-generated' && filteredCollaterals.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Content Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredCollaterals.slice(0, 6).map(ct => {
                const isSelected = workflowConfig?.collateralType?.id === ct.id;
                
                return (
                  <div
                    key={ct.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected && "border-primary bg-primary/10 ring-1 ring-primary/30"
                    )}
                    onClick={() => onSelectCollateralType(ct)}
                  >
                    <div className={cn(
                      "p-2 rounded-md shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {ct.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{ct.name}</p>
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
