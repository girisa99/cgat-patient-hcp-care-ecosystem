/**
 * Spark Guided Wizard
 * Step-by-step content creation guide for GenieSpark
 * Phases: Idea → Template → Generate → Refine → Export
 *
 * Day 3 (C-302): Fixed phase progression, completion tracking, back-nav guard
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WizardPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

type ContentType = 'video_script' | 'podcast_script' | 'social_post' | 'article' | null;
type TemplateCategory = 'educational' | 'entertainment' | 'business' | 'personal' | null;

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

  const phases: WizardPhase[] = [
    {
      id: 'idea',
      title: 'Your Idea',
      description: 'What do you want to create?',
      icon: <Lightbulb className="h-5 w-5" />,
      isComplete: contentType !== null,
    },
    {
      id: 'template',
      title: 'Template Style',
      description: 'Choose a content style',
      icon: <LayoutTemplate className="h-5 w-5" />,
      isComplete: templateCategory !== null,
    },
    {
      id: 'generate',
      title: 'Generate',
      description: 'AI creates your content',
      icon: <Sparkles className="h-5 w-5" />,
      isComplete: hasGeneratedContent,
    },
    {
      id: 'refine',
      title: 'Refine',
      description: 'Polish your content',
      icon: <PenTool className="h-5 w-5" />,
      isComplete: hasGeneratedContent && hasVisitedRefine,
    },
    {
      id: 'export',
      title: 'Export',
      description: 'Save or send to other tools',
      icon: <Download className="h-5 w-5" />,
      isComplete: false,
    },
  ];

  const currentPhaseData = phases[currentPhase];
  const progress = ((currentPhase + 1) / phases.length) * 100;

  const handleContentTypeChange = (value: ContentType) => {
    setContentType(value);
    onContentTypeSelect(value);
  };

  const handleTemplateChange = (value: TemplateCategory) => {
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
      // Stay on phase 2 — show success state. User clicks Next to advance.
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
      // Mark refine as visited when entering it
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

        {/* Phase Indicators */}
        <div className="flex justify-between mt-4" role="tablist" aria-label="Wizard steps">
          {phases.map((phase, index) => (
            <button
              key={phase.id}
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
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Phase Content */}
        <div className="min-h-[200px]">
          {/* Phase 1: Content Type */}
          {currentPhase === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <RadioGroup
                value={contentType || ''}
                onValueChange={(v) => handleContentTypeChange(v as ContentType)}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="video_script"
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    contentType === 'video_script'
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-muted hover:border-orange-500/50"
                  )}
                >
                  <RadioGroupItem value="video_script" id="video_script" className="sr-only" />
                  <Video className="h-8 w-8 text-orange-500" />
                  <span className="font-medium">Video Script</span>
                </Label>

                <Label
                  htmlFor="podcast_script"
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    contentType === 'podcast_script'
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-muted hover:border-orange-500/50"
                  )}
                >
                  <RadioGroupItem value="podcast_script" id="podcast_script" className="sr-only" />
                  <Mic className="h-8 w-8 text-amber-500" />
                  <span className="font-medium">Podcast Script</span>
                </Label>

                <Label
                  htmlFor="social_post"
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    contentType === 'social_post'
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-muted hover:border-orange-500/50"
                  )}
                >
                  <RadioGroupItem value="social_post" id="social_post" className="sr-only" />
                  <MessageSquare className="h-8 w-8 text-yellow-500" />
                  <span className="font-medium">Social Post</span>
                </Label>

                <Label
                  htmlFor="article"
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    contentType === 'article'
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-muted hover:border-orange-500/50"
                  )}
                >
                  <RadioGroupItem value="article" id="article" className="sr-only" />
                  <FileText className="h-8 w-8 text-orange-600" />
                  <span className="font-medium">Article/Blog</span>
                </Label>
              </RadioGroup>
            </div>
          )}

          {/* Phase 2: Template Style */}
          {currentPhase === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <RadioGroup
                value={templateCategory || ''}
                onValueChange={(v) => handleTemplateChange(v as TemplateCategory)}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { id: 'educational', label: 'Educational', desc: 'Teach & inform' },
                  { id: 'entertainment', label: 'Entertainment', desc: 'Engage & delight' },
                  { id: 'business', label: 'Business', desc: 'Professional & corporate' },
                  { id: 'personal', label: 'Personal', desc: 'Stories & vlogs' },
                ].map((cat) => (
                  <Label
                    key={cat.id}
                    htmlFor={cat.id}
                    className={cn(
                      "flex flex-col gap-1 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      templateCategory === cat.id
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-muted hover:border-orange-500/50"
                    )}
                  >
                    <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">{cat.desc}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Phase 3: Generate */}
          {currentPhase === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Describe your content idea</h3>
              <Textarea
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                placeholder="E.g., A 5-minute explainer video about sustainable energy for beginners..."
                className="min-h-[120px]"
                disabled={isGenerating}
              />

              {hasGeneratedContent && !isGenerating ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Content generated successfully! Click <strong>Next</strong> to refine or export.
                  </p>
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
              <h3 className="font-semibold">Polish your content</h3>
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
              <h3 className="font-semibold">Export or send to other tools</h3>
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
  );
};

export default SparkGuidedWizard;
