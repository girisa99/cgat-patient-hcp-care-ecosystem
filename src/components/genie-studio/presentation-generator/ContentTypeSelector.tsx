/**
 * ContentTypeSelector - Dynamic enterprise content type selection
 * Fully extensible with sub-options for Training, Investor, Storytelling, etc.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  BookMarked,
  Award,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLLATERAL_TYPES } from './EnhancedTemplateWorkflow';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

// ==========================================
// CUSTOM OPTION INPUT COMPONENT
// ==========================================

interface CustomOptionInputProps {
  categoryId: string;
  onAdd: (option: { id: string; label: string; description: string }) => void;
}

const CustomOptionInput: React.FC<CustomOptionInputProps> = ({ categoryId, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  
  const handleAdd = () => {
    if (customLabel.trim()) {
      onAdd({
        id: `custom-${categoryId}-${Date.now()}`,
        label: customLabel.trim(),
        description: 'Custom user-defined option'
      });
      setCustomLabel('');
      setIsAdding(false);
    }
  };
  
  if (!isAdding) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-primary/40 cursor-pointer hover:bg-primary/5 hover:border-primary transition-all"
        onClick={() => setIsAdding(true)}
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Plus className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary">Add Custom Option</p>
          <p className="text-xs text-muted-foreground">Missing something? Add your own</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 rounded-xl border-2 border-primary/40 bg-primary/5 space-y-3">
      <Input
        placeholder="Enter custom option name..."
        value={customLabel}
        onChange={(e) => setCustomLabel(e.target.value)}
        className="h-9 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
          if (e.key === 'Escape') { setIsAdding(false); setCustomLabel(''); }
        }}
      />
      <div className="flex gap-2 justify-end">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 text-xs"
          onClick={() => { setIsAdding(false); setCustomLabel(''); }}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          className="h-8 text-xs"
          onClick={handleAdd}
          disabled={!customLabel.trim()}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Option
        </Button>
      </div>
    </div>
  );
};

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
// SUB-OPTIONS FOR ALL CATEGORIES (Comprehensive)
// ==========================================

export const CATEGORY_SUB_OPTIONS: Record<string, Array<{
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  suggestedSlides: number;
  tags?: string[];
}>> = {
  // Training Options
  'training': [
    { id: 'training-video', label: 'Training Video', description: 'Video-based learning with voiceover', icon: Video, suggestedSlides: 15, tags: ['video', 'voiceover'] },
    { id: 'training-manual', label: 'Training Manual', description: 'Comprehensive documentation', icon: FileText, suggestedSlides: 30, tags: ['document', 'detailed'] },
    { id: 'training-quickref', label: 'Quick Reference', description: 'Condensed key points', icon: BookMarked, suggestedSlides: 8, tags: ['summary', 'quick'] },
    { id: 'training-workshop', label: 'Workshop Materials', description: 'Interactive session content', icon: Users, suggestedSlides: 20, tags: ['interactive', 'hands-on'] },
    { id: 'training-elearning', label: 'E-Learning Module', description: 'Self-paced online course', icon: GraduationCap, suggestedSlides: 25, tags: ['online', 'self-paced'] },
    { id: 'training-certification', label: 'Certification Program', description: 'Formal certification materials', icon: Award, suggestedSlides: 35, tags: ['certification', 'formal'] },
    { id: 'training-onboarding', label: 'Onboarding Guide', description: 'New employee/customer onboarding', icon: Users, suggestedSlides: 18, tags: ['onboarding', 'new-hire'] },
  ],
  
  // Investor & VC Options
  'investor': [
    { id: 'investor-seed', label: 'Seed Pitch', description: 'Early-stage funding deck', icon: Rocket, suggestedSlides: 12, tags: ['seed', 'early-stage'] },
    { id: 'investor-series', label: 'Series A/B Pitch', description: 'Growth-stage investment', icon: TrendingUp, suggestedSlides: 18, tags: ['growth', 'series'] },
    { id: 'investor-update', label: 'Investor Update', description: 'Monthly/quarterly progress report', icon: BarChart3, suggestedSlides: 10, tags: ['update', 'progress'] },
    { id: 'investor-due-diligence', label: 'Due Diligence Package', description: 'Comprehensive investor materials', icon: FileText, suggestedSlides: 40, tags: ['due-diligence', 'comprehensive'] },
    { id: 'investor-board', label: 'Board Deck', description: 'Board meeting presentation', icon: Users, suggestedSlides: 15, tags: ['board', 'governance'] },
    { id: 'investor-exit', label: 'Exit Strategy', description: 'M&A or IPO presentation', icon: TrendingUp, suggestedSlides: 20, tags: ['exit', 'ma', 'ipo'] },
  ],
  
  // Storytelling Options
  'storytelling': [
    { id: 'story-case', label: 'Case Study', description: 'Customer success narrative', icon: Users, suggestedSlides: 15, tags: ['customer', 'success'] },
    { id: 'story-origin', label: 'Origin Story', description: 'Company founding narrative', icon: Rocket, suggestedSlides: 12, tags: ['founding', 'history'] },
    { id: 'story-vision', label: 'Vision Story', description: 'Future state narrative', icon: Lightbulb, suggestedSlides: 10, tags: ['vision', 'future'] },
    { id: 'story-transformation', label: 'Transformation Journey', description: 'Change journey story', icon: Zap, suggestedSlides: 18, tags: ['change', 'journey'] },
    { id: 'story-testimonial', label: 'Testimonial Compilation', description: 'Customer testimonial stories', icon: Users, suggestedSlides: 12, tags: ['testimonial', 'social-proof'] },
    { id: 'story-impact', label: 'Impact Report', description: 'Social/business impact narrative', icon: Target, suggestedSlides: 20, tags: ['impact', 'results'] },
  ],
  
  // Research Options
  'research': [
    { id: 'research-market', label: 'Market Research', description: 'Market analysis & sizing', icon: BarChart3, suggestedSlides: 25, tags: ['market', 'analysis'] },
    { id: 'research-competitive', label: 'Competitive Analysis', description: 'Competitor landscape study', icon: Target, suggestedSlides: 18, tags: ['competitive', 'landscape'] },
    { id: 'research-user', label: 'User Research', description: 'User insights & personas', icon: Users, suggestedSlides: 20, tags: ['user', 'ux', 'personas'] },
    { id: 'research-data', label: 'Data Analysis Report', description: 'Statistical findings & insights', icon: BarChart3, suggestedSlides: 22, tags: ['data', 'statistics'] },
    { id: 'research-academic', label: 'Academic Research', description: 'Literature review & methodology', icon: BookMarked, suggestedSlides: 30, tags: ['academic', 'methodology'] },
    { id: 'research-industry', label: 'Industry Report', description: 'Industry trends & outlook', icon: TrendingUp, suggestedSlides: 25, tags: ['industry', 'trends'] },
    { id: 'research-feasibility', label: 'Feasibility Study', description: 'Project viability analysis', icon: Target, suggestedSlides: 20, tags: ['feasibility', 'viability'] },
  ],
  
  // Marketing Options
  'marketing': [
    { id: 'marketing-campaign', label: 'Campaign Deck', description: 'Marketing campaign overview', icon: Megaphone, suggestedSlides: 18, tags: ['campaign', 'advertising'] },
    { id: 'marketing-brand', label: 'Brand Guidelines', description: 'Brand identity & standards', icon: PenTool, suggestedSlides: 25, tags: ['brand', 'identity'] },
    { id: 'marketing-launch', label: 'Product Launch', description: 'Go-to-market strategy', icon: Rocket, suggestedSlides: 20, tags: ['launch', 'gtm'] },
    { id: 'marketing-content', label: 'Content Strategy', description: 'Content planning & calendar', icon: LayoutGrid, suggestedSlides: 15, tags: ['content', 'planning'] },
    { id: 'marketing-social', label: 'Social Media Strategy', description: 'Social media planning', icon: Users, suggestedSlides: 12, tags: ['social', 'digital'] },
    { id: 'marketing-performance', label: 'Performance Report', description: 'Campaign metrics & ROI', icon: BarChart3, suggestedSlides: 15, tags: ['metrics', 'roi'] },
    { id: 'marketing-partner', label: 'Partner/Co-Marketing', description: 'Partnership marketing deck', icon: Users, suggestedSlides: 18, tags: ['partner', 'collaboration'] },
  ],
  
  // Strategic Options
  'strategic': [
    { id: 'strategic-corporate', label: 'Corporate Strategy', description: 'Enterprise-level strategy', icon: Briefcase, suggestedSlides: 25, tags: ['corporate', 'enterprise'] },
    { id: 'strategic-it', label: 'IT Strategy', description: 'Technology roadmap & planning', icon: Target, suggestedSlides: 20, tags: ['it', 'technology'] },
    { id: 'strategic-digital', label: 'Digital Transformation', description: 'Digital strategy & roadmap', icon: Zap, suggestedSlides: 22, tags: ['digital', 'transformation'] },
    { id: 'strategic-growth', label: 'Growth Strategy', description: 'Business expansion planning', icon: TrendingUp, suggestedSlides: 18, tags: ['growth', 'expansion'] },
    { id: 'strategic-operations', label: 'Operations Strategy', description: 'Operational excellence plan', icon: Target, suggestedSlides: 20, tags: ['operations', 'efficiency'] },
    { id: 'strategic-market-entry', label: 'Market Entry', description: 'New market expansion', icon: Rocket, suggestedSlides: 22, tags: ['market-entry', 'expansion'] },
    { id: 'strategic-m&a', label: 'M&A Strategy', description: 'Merger & acquisition planning', icon: Briefcase, suggestedSlides: 25, tags: ['ma', 'acquisition'] },
    { id: 'strategic-turnaround', label: 'Turnaround Plan', description: 'Business recovery strategy', icon: Zap, suggestedSlides: 20, tags: ['turnaround', 'recovery'] },
  ],
  
  // Compliance Options
  'compliance': [
    { id: 'compliance-policy', label: 'Policy Document', description: 'Formal policy presentation', icon: FileText, suggestedSlides: 20, tags: ['policy', 'formal'] },
    { id: 'compliance-audit', label: 'Audit Report', description: 'Compliance audit findings', icon: AlertCircle, suggestedSlides: 25, tags: ['audit', 'findings'] },
    { id: 'compliance-training', label: 'Compliance Training', description: 'Regulatory training materials', icon: GraduationCap, suggestedSlides: 30, tags: ['training', 'regulatory'] },
    { id: 'compliance-hipaa', label: 'HIPAA Compliance', description: 'Healthcare privacy compliance', icon: HeartPulse, suggestedSlides: 28, tags: ['hipaa', 'healthcare'] },
    { id: 'compliance-gdpr', label: 'GDPR/Privacy', description: 'Data privacy compliance', icon: Scale, suggestedSlides: 22, tags: ['gdpr', 'privacy'] },
    { id: 'compliance-sox', label: 'SOX Compliance', description: 'Financial compliance', icon: BarChart3, suggestedSlides: 25, tags: ['sox', 'financial'] },
    { id: 'compliance-security', label: 'Security Compliance', description: 'Cybersecurity standards', icon: AlertCircle, suggestedSlides: 20, tags: ['security', 'cyber'] },
  ],
  
  // Business Options
  'business': [
    { id: 'business-plan', label: 'Business Plan', description: 'Comprehensive business strategy', icon: Briefcase, suggestedSlides: 30, tags: ['plan', 'strategy'] },
    { id: 'business-proposal', label: 'Business Proposal', description: 'Client/partner proposal', icon: FileText, suggestedSlides: 18, tags: ['proposal', 'client'] },
    { id: 'business-review', label: 'Business Review', description: 'Quarterly/annual performance', icon: BarChart3, suggestedSlides: 20, tags: ['review', 'performance'] },
    { id: 'business-case', label: 'Business Case', description: 'Investment justification', icon: Target, suggestedSlides: 15, tags: ['case', 'justification'] },
    { id: 'business-update', label: 'Status Update', description: 'Project/business status', icon: Zap, suggestedSlides: 10, tags: ['status', 'update'] },
    { id: 'business-executive', label: 'Executive Summary', description: 'C-suite briefing deck', icon: Briefcase, suggestedSlides: 12, tags: ['executive', 'summary'] },
  ],
  
  // Creative Options
  'creative': [
    { id: 'creative-concept', label: 'Concept Deck', description: 'Creative concepts & ideas', icon: Lightbulb, suggestedSlides: 15, tags: ['concept', 'ideas'] },
    { id: 'creative-mood', label: 'Mood Board', description: 'Visual inspiration board', icon: PenTool, suggestedSlides: 10, tags: ['mood', 'inspiration'] },
    { id: 'creative-portfolio', label: 'Portfolio Showcase', description: 'Work samples & projects', icon: LayoutGrid, suggestedSlides: 20, tags: ['portfolio', 'showcase'] },
    { id: 'creative-campaign', label: 'Creative Campaign', description: 'Ad campaign concepts', icon: Megaphone, suggestedSlides: 18, tags: ['campaign', 'advertising'] },
    { id: 'creative-brand', label: 'Brand Story', description: 'Brand narrative & identity', icon: BookOpen, suggestedSlides: 15, tags: ['brand', 'story'] },
  ],
  
  // Visual Options
  'visual': [
    { id: 'visual-infographic', label: 'Infographic Deck', description: 'Data visualization focus', icon: BarChart3, suggestedSlides: 12, tags: ['infographic', 'data-viz'] },
    { id: 'visual-photo', label: 'Photo Essay', description: 'Image-driven storytelling', icon: LayoutGrid, suggestedSlides: 15, tags: ['photo', 'visual'] },
    { id: 'visual-diagram', label: 'Diagram Collection', description: 'Technical diagrams & flows', icon: Target, suggestedSlides: 18, tags: ['diagram', 'technical'] },
    { id: 'visual-chart', label: 'Chart Gallery', description: 'Charts & graphs focus', icon: BarChart3, suggestedSlides: 15, tags: ['charts', 'graphs'] },
  ],
  
  // Narrative Options
  'narrative': [
    { id: 'narrative-keynote', label: 'Keynote Speech', description: 'Keynote presentation format', icon: Users, suggestedSlides: 20, tags: ['keynote', 'speech'] },
    { id: 'narrative-ted', label: 'TED-Style Talk', description: 'Idea-driven presentation', icon: Lightbulb, suggestedSlides: 15, tags: ['ted', 'ideas'] },
    { id: 'narrative-story', label: 'Story Presentation', description: 'Narrative-driven format', icon: BookOpen, suggestedSlides: 18, tags: ['story', 'narrative'] },
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

        {/* Category Pills - Responsive Grid (No Scroll) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {CONTENT_CATEGORIES.map(category => (
            <Button
              key={category.id}
              variant={contentCategory === category.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-auto py-2 px-2 flex flex-col items-center gap-1 text-[10px] sm:text-xs",
                category.isAI && contentCategory === category.id && "bg-gradient-to-r from-primary to-primary/80",
                contentCategory === category.id && "shadow-md"
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
              <category.icon className="h-4 w-4" />
              <span className="text-center leading-tight">{category.label}</span>
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

        {/* Sub-Options Panel (for All Categories with sub-options) */}
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
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-card border border-border">
                {currentSubOptions.map(option => {
                  const isSelected = selectedSubOptions.includes(option.id);
                  const IconComponent = option.icon;
                  
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                        "hover:border-primary/50 hover:bg-primary/5",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-transparent bg-muted/50"
                      )}
                      onClick={() => handleSubOptionToggle(option.id)}
                    >
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border"
                      )}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            "text-sm font-semibold",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>{option.label}</p>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {option.suggestedSlides} slides
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {/* Custom Option - Add Your Own */}
                <CustomOptionInput 
                  categoryId={contentCategory}
                  onAdd={(customOption) => {
                    handleSubOptionToggle(customOption.id);
                    toast.success(`Added: ${customOption.label}`);
                  }}
                />
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
