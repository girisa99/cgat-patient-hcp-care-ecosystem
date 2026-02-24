/**
 * Spark Guided Wizard — Intuitive step-by-step content creation for GenieSpark
 *
 * NOW FULLY DB-DRIVEN:
 * - Content types from cast_content_formats (Supabase)
 * - Template categories from cast_content_categories (Supabase)
 * - Falls back to hardcoded defaults if DB is unavailable
 *
 * UX: Simplified with tooltips, dropdowns, real-time preview, and progressive disclosure
 *
 * Phases: Idea → Template → Generate → Refine → Export
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Lightbulb,
  LayoutTemplate,
  Sparkles,
  PenTool,
  Download,
  ChevronRight,
  ChevronLeft,
  Check,
  Wand2,
  Video,
  Mic,
  FileText,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Eye,
  ZoomIn,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import { useContentIntents } from '@/hooks/useContentIntents';

interface WizardPhase {
  id: string;
  title: string;
  description: string;
  tooltip: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

type ContentType = string | null;
type TemplateCategory = string | null;

// Hardcoded fallbacks
const FALLBACK_CONTENT_TYPES = [
  { value: 'video_script', label: 'Video Script', icon: 'Video', description: 'Create a video script for YouTube, social, or ads' },
  { value: 'podcast_script', label: 'Podcast Script', icon: 'Mic', description: 'Create a podcast episode script with segments' },
  { value: 'social_post', label: 'Social Post', icon: 'MessageSquare', description: 'Create social media content for any platform' },
  { value: 'article', label: 'Article / Blog', icon: 'FileText', description: 'Create long-form written content with SEO' },
];

const FALLBACK_CATEGORIES = [
  { value: 'educational', label: 'Educational', description: 'Teach & inform your audience' },
  { value: 'entertainment', label: 'Entertainment', description: 'Engage & delight viewers' },
  { value: 'business', label: 'Business', description: 'Professional & corporate content' },
  { value: 'personal', label: 'Personal', description: 'Stories, vlogs & personal brand' },
];

/** Resolve a Lucide icon name to a component */
const getIcon = (iconName: string, className?: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Zap;
  return <Icon className={className || 'h-5 w-5'} />;
};

interface SparkGuidedWizardProps {
  onContentTypeSelect: (type: ContentType) => void;
  onTemplateSelect: (category: TemplateCategory) => void;
  onGenerate: (prompt: string) => Promise<void>;
  onSendToEditor: () => void;
  onExport: (format: string) => void;
  hasGeneratedContent: boolean;
  className?: string;
}

export const SparkGuidedWizard: React.FC<SparkGuidedWizardProps> = ({
  onContentTypeSelect,
  onTemplateSelect,
  onGenerate,
  onSendToEditor,
  onExport,
  hasGeneratedContent,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [contentType, setContentType] = useState<ContentType>(null);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>(null);
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasVisitedRefine, setHasVisitedRefine] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // DB-driven data with fallbacks
  const { formats, categories, isLoading: registryLoading } = useCastContentRegistry();
  const { intents } = useContentIntents();

  // Build content type options from DB or fallback
  const contentTypeOptions = formats.length > 0
    ? formats.map(f => ({
        value: f.name,
        label: f.label,
        icon: f.icon,
        description: f.description || '',
      }))
    : FALLBACK_CONTENT_TYPES;

  // Build category options from DB or fallback
  const categoryOptions = categories.length > 0
    ? categories.map(c => ({
        value: c.name,
        label: c.label,
        description: c.description || '',
        icon: c.icon,
      }))
    : FALLBACK_CATEGORIES;

  const phases: WizardPhase[] = [
    {
      id: 'idea',
      title: 'Content Type',
      description: 'What do you want to create?',
      tooltip: 'Select the type of content you want to produce. This determines the format, structure, and AI models used.',
      icon: <Lightbulb className="h-5 w-5" />,
      isComplete: contentType !== null,
    },
    {
      id: 'template',
      title: 'Category',
      description: 'Choose a content category',
      tooltip: 'Pick a category to get templates optimized for your use case. This influences tone, pacing, and visual style.',
      icon: <LayoutTemplate className="h-5 w-5" />,
      isComplete: templateCategory !== null,
    },
    {
      id: 'generate',
      title: 'Generate',
      description: 'AI creates your content',
      tooltip: 'Describe your idea and the AI will generate a complete draft. The more detail you provide, the better the result.',
      icon: <Sparkles className="h-5 w-5" />,
      isComplete: hasGeneratedContent,
    },
    {
      id: 'refine',
      title: 'Refine',
      description: 'Polish your content',
      tooltip: 'Review and edit the generated content. You can tweak individual sections, adjust tone, or regenerate parts.',
      icon: <PenTool className="h-5 w-5" />,
      isComplete: hasGeneratedContent && hasVisitedRefine,
    },
    {
      id: 'export',
      title: 'Export',
      description: 'Save or send to tools',
      tooltip: 'Export your finished content to other tools like Vibe (video), download as a file, or send to your production pipeline.',
      icon: <Download className="h-5 w-5" />,
      isComplete: false,
    },
  ];

  const currentPhaseData = phases[currentPhase];
  const progress = ((currentPhase + 1) / phases.length) * 100;

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    onContentTypeSelect(value);
  };

  const handleTemplateChange = (value: string) => {
    setTemplateCategory(value);
    onTemplateSelect(value);
  };

  const handleGenerate = async () => {
    if (!ideaPrompt.trim()) {
      toast.error('Please describe your content idea');
      return;
    }
    setIsGenerating(true);
    try {
      await onGenerate(ideaPrompt);
    } catch {
      toast.error('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToEditor = () => {
    setHasVisitedRefine(true);
    onSendToEditor();
  };

  const handleExport = (format: string) => {
    onExport(format);
  };

  const goNext = () => {
    if (currentPhase < phases.length - 1) {
      if (currentPhase === 2 && hasGeneratedContent) {
        setHasVisitedRefine(true);
      }
      setCurrentPhase(currentPhase + 1);
    }
  };

  const goBack = () => {
    if (currentPhase > 0 && !isGenerating) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  return (
    <TooltipProvider>
      <Card className={cn("border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="h-5 w-5 text-orange-500" />
              Content Creation Wizard
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
              Step {currentPhase + 1} of {phases.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 mt-3" />

          {/* Phase Indicators with tooltips */}
          <div className="flex justify-between mt-4" role="tablist" aria-label="Wizard steps">
            {phases.map((phase, index) => (
              <Tooltip key={phase.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => !isGenerating && setCurrentPhase(index)}
                    role="tab"
                    aria-selected={index === currentPhase}
                    aria-current={index === currentPhase ? 'step' : undefined}
                    aria-label={`${phase.title}: ${phase.description}${phase.isComplete ? ' (completed)' : ''}`}
                    className={cn(
                      "flex flex-col items-center gap-1 transition-all",
                      index === currentPhase ? "opacity-100" : "opacity-50 hover:opacity-75",
                      isGenerating && "pointer-events-none"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                      phase.isComplete
                        ? "bg-green-500 text-white"
                        : index === currentPhase
                          ? "bg-orange-500 text-white"
                          : "bg-muted"
                    )}>
                      {phase.isComplete ? <Check className="h-4 w-4" /> : phase.icon}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{phase.title}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                  <p className="font-semibold">{phase.title}</p>
                  <p className="text-muted-foreground mt-0.5">{phase.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Phase Content */}
          <div className="min-h-[200px]">
            {/* Phase 1: Content Type — DROPDOWN (DB-driven) */}
            {currentPhase === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{currentPhaseData.description}</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] text-xs">
                      {currentPhaseData.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Select value={contentType || ''} onValueChange={handleContentTypeChange}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select content type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypeOptions.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        <div className="flex items-center gap-2">
                          {getIcon(ct.icon, 'h-4 w-4 text-orange-500')}
                          <div>
                            <span className="font-medium">{ct.label}</span>
                            {ct.description && (
                              <p className="text-xs text-muted-foreground">{ct.description}</p>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Quick-select cards as secondary option */}
                <div className="grid grid-cols-2 gap-3">
                  {contentTypeOptions.slice(0, 4).map((ct) => (
                    <button
                      key={ct.value}
                      onClick={() => handleContentTypeChange(ct.value)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all text-left",
                        contentType === ct.value
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-muted hover:border-orange-500/50"
                      )}
                    >
                      {getIcon(ct.icon, 'h-6 w-6 text-orange-500 flex-shrink-0')}
                      <div>
                        <span className="font-medium text-sm">{ct.label}</span>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{ct.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {registryLoading && (
                  <p className="text-xs text-muted-foreground animate-pulse">Loading content types from database...</p>
                )}
              </div>
            )}

            {/* Phase 2: Template Category — DROPDOWN (DB-driven) */}
            {currentPhase === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{currentPhaseData.description}</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] text-xs">
                      {currentPhaseData.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Select value={templateCategory || ''} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          {'icon' in cat && getIcon((cat as any).icon, 'h-4 w-4 text-orange-500')}
                          <div>
                            <span className="font-medium">{cat.label}</span>
                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category cards */}
                <div className="grid grid-cols-2 gap-3">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleTemplateChange(cat.value)}
                      className={cn(
                        "flex flex-col gap-1 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        templateCategory === cat.value
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-muted hover:border-orange-500/50"
                      )}
                    >
                      {'icon' in cat && (
                        <div className="mb-1">{getIcon((cat as any).icon, 'h-5 w-5 text-orange-500')}</div>
                      )}
                      <span className="font-medium text-sm">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.description}</span>
                    </button>
                  ))}
                </div>

                {/* Selection summary */}
                {contentType && templateCategory && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <CheckCircle2 className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Creating <strong>{contentTypeOptions.find(c => c.value === contentType)?.label}</strong> in{' '}
                      <strong>{categoryOptions.find(c => c.value === templateCategory)?.label}</strong> style
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Phase 3: Generate */}
            {currentPhase === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Describe your content idea</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] text-xs">
                      {currentPhaseData.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Context summary */}
                {(contentType || templateCategory) && (
                  <div className="flex flex-wrap gap-2">
                    {contentType && (
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 text-xs">
                        {contentTypeOptions.find(c => c.value === contentType)?.label}
                      </Badge>
                    )}
                    {templateCategory && (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-xs">
                        {categoryOptions.find(c => c.value === templateCategory)?.label}
                      </Badge>
                    )}
                  </div>
                )}

                <Textarea
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  placeholder="E.g., A 5-minute explainer video about sustainable energy for beginners..."
                  className="min-h-[120px]"
                  disabled={isGenerating}
                />

                {hasGeneratedContent && !isGenerating ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Content generated successfully! Click <strong>Next</strong> to refine or export.
                      </p>
                    </div>
                    {/* Preview toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="gap-2"
                    >
                      {showPreview ? <ZoomIn className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showPreview ? 'Hide Preview' : 'Preview Generated Content'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !ideaPrompt.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
                  >
                    {isGenerating ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Phase 4: Refine */}
            {currentPhase === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Polish your content</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] text-xs">
                      {currentPhaseData.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>
                {hasGeneratedContent ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Your content has been generated! You can now refine it in the Script Editor.
                    </p>
                    <Button onClick={handleSendToEditor} className="w-full">
                      <PenTool className="h-4 w-4 mr-2" />
                      Open in Script Editor
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Generate content first to access refinement options.
                  </p>
                )}
              </div>
            )}

            {/* Phase 5: Export */}
            {currentPhase === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Export or send to other tools</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] text-xs">
                      {currentPhaseData.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => handleExport('vibe')}>
                    <Video className="h-4 w-4 mr-2" />
                    Send to Vibe
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('download')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={currentPhase === 0 || isGenerating}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={goNext}
              disabled={currentPhase === phases.length - 1 || !phases[currentPhase].isComplete || isGenerating}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default SparkGuidedWizard;
