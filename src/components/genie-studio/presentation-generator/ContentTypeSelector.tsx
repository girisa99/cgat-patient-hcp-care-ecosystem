/**
 * ContentTypeSelector - Clean dropdown-based content type selection
 * Uses proper Select components for better UX
 */

import React, { useState, useMemo, useEffect } from 'react';
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

// ==========================================
// CONTENT TYPE MULTI-SELECT DROPDOWN
// ==========================================

interface ContentTypeDropdownProps {
  options: typeof EXTENDED_COLLATERAL_TYPES;
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  onSelectCollateral: (ct: any) => void;
}

const ContentTypeDropdown: React.FC<ContentTypeDropdownProps> = ({
  options,
  selectedTypes,
  onTypesChange,
  onSelectCollateral,
}) => {
  const [open, setOpen] = useState(false);

  const toggleType = (typeId: string, ct: any) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter(id => id !== typeId));
    } else {
      onTypesChange([...selectedTypes, typeId]);
      onSelectCollateral(ct);
    }
  };

  const displayText = selectedTypes.length === 0
    ? 'Select content types...'
    : `${selectedTypes.length} content type${selectedTypes.length > 1 ? 's' : ''} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 text-sm font-normal bg-background"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 z-50 bg-popover border shadow-lg" align="start">
        <ScrollArea className="h-[280px]">
          <div className="p-2 space-y-1">
            {options.map(ct => (
              <div
                key={ct.id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
                  selectedTypes.includes(ct.id) && "bg-primary/10 border border-primary/30"
                )}
                onClick={() => toggleType(ct.id, ct)}
              >
                <Checkbox
                  checked={selectedTypes.includes(ct.id)}
                  className="pointer-events-none"
                />
                <div className="p-1.5 rounded bg-muted">
                  {ct.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ct.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{ct.description}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {ct.suggestedSlides} slides
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
        {selectedTypes.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onTypesChange([])}
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
// CATEGORY MULTI-SELECT DROPDOWN
// ==========================================

interface CategoryMultiSelectProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  selectedCategories,
  onCategoriesChange,
}) => {
  const [open, setOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const displayText = selectedCategories.length === 0
    ? 'Select categories...'
    : selectedCategories.length === 1
      ? CONTENT_CATEGORIES.find(c => c.id === selectedCategories[0])?.label || '1 selected'
      : `${selectedCategories.length} categories`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 text-sm font-normal bg-background"
        >
          <div className="flex items-center gap-2 truncate">
            {selectedCategories.length === 1 ? (
              <>
                {(() => {
                  const cat = CONTENT_CATEGORIES.find(c => c.id === selectedCategories[0]);
                  if (cat) {
                    const Icon = cat.icon;
                    return <Icon className="h-4 w-4 text-primary" />;
                  }
                  return null;
                })()}
                <span>{displayText}</span>
              </>
            ) : (
              <span>{displayText}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 z-50 bg-popover border shadow-lg" align="start">
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-1">
            {CONTENT_CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
                    selectedCategories.includes(category.id) && "bg-primary/10 border border-primary/30"
                  )}
                  onClick={() => toggleCategory(category.id)}
                >
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    className="pointer-events-none"
                  />
                  <div className={cn(
                    "p-1.5 rounded",
                    category.isAI ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn("h-4 w-4", category.isAI ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{category.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                  </div>
                  {category.isAI && (
                    <Badge variant="secondary" className="text-[10px]">AI</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {selectedCategories.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onCategoriesChange([])}
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
  // Support multiple categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    contentCategory ? [contentCategory] : ['ai-generated']
  );

  // Get content types for all selected categories
  const filteredCollaterals = useMemo(() => {
    if (selectedCategories.includes('ai-generated')) {
      return EXTENDED_COLLATERAL_TYPES;
    }
    return EXTENDED_COLLATERAL_TYPES.filter(c => selectedCategories.includes(c.category));
  }, [selectedCategories]);
  
  // Get sub-options for selected categories
  const currentSubOptions = useMemo(() => {
    const allSubOptions: typeof CATEGORY_SUB_OPTIONS['training'] = [];
    selectedCategories.forEach(cat => {
      if (CATEGORY_SUB_OPTIONS[cat]) {
        allSubOptions.push(...CATEGORY_SUB_OPTIONS[cat]);
      }
    });
    return allSubOptions;
  }, [selectedCategories]);
  
  const hasSubOptions = currentSubOptions.length > 0;
  const isAIMode = selectedCategories.includes('ai-generated');

  // Sync with parent when categories change
  useEffect(() => {
    if (selectedCategories.length === 1) {
      setContentCategory(selectedCategories[0]);
    } else if (selectedCategories.length > 1) {
      setContentCategory('mixed');
    }
  }, [selectedCategories, setContentCategory]);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Content Type</span>
          <Badge variant="outline" className="text-[10px]">
            Multi-select
          </Badge>
        </div>

        {/* Category Multi-Select Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Categories</Label>
          <CategoryMultiSelect
            selectedCategories={selectedCategories}
            onCategoriesChange={(cats) => {
              setSelectedCategories(cats);
              if (onSubOptionChange) {
                onSubOptionChange([]);
              }
            }}
          />
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedCategories.map(catId => {
                const cat = CONTENT_CATEGORIES.find(c => c.id === catId);
                if (!cat) return null;
                const Icon = cat.icon;
                return (
                  <Badge key={catId} variant="secondary" className="text-[10px] py-0.5 gap-1">
                    <Icon className="h-3 w-3" />
                    {cat.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        {/* AI Auto-Select Info */}
        {isAIMode && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">AI Mode:</span> All content types available for intelligent selection
            </p>
          </div>
        )}

        {/* Sub-Options Dropdown */}
        {!isAIMode && hasSubOptions && onSubOptionChange && (
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

        {/* Content Type Multi-Select Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Content Types</Label>
          <ContentTypeDropdown
            options={filteredCollaterals}
            selectedTypes={selectedContentTypes}
            onTypesChange={setSelectedContentTypes}
            onSelectCollateral={onSelectCollateralType}
          />
          {selectedContentTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedContentTypes.map(typeId => {
                const ct = EXTENDED_COLLATERAL_TYPES.find(c => c.id === typeId);
                return ct ? (
                  <Badge key={typeId} variant="default" className="text-[10px] py-0.5 bg-primary/80">
                    <Check className="h-2.5 w-2.5 mr-1" />
                    {ct.name}
                    <span className="ml-1 opacity-70">{ct.suggestedSlides} slides</span>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredCollaterals.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <LayoutGrid className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No content types for selected categories</p>
            <p className="text-[10px] mt-1">Select different categories or add AI Auto</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentTypeSelector;
