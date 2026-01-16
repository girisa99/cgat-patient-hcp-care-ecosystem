/**
 * Post-Generation Actions Component
 * Provides actions after script generation: Download, Script Editor, Vibe, Production Hub, Knowledge Base
 * + Advanced Generation: Multi-Language Dub, Content Recycling, Template Variants, Voice Cloning
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Download, 
  PenTool, 
  Mic, 
  Database,
  ArrowRight,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  ChevronDown,
  Film,
  Globe,
  Recycle,
  Layers,
  AudioWaveform,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineTrainAIFeedback } from './InlineTrainAIFeedback';

export interface GeneratedContent {
  script: string;
  title?: string;
  type: 'video_script' | 'podcast_script' | 'presentation_script' | 'webinar_script' | 'tutorial_script' | 'narration';
  duration?: number;
  sourceType: 'document' | 'image' | 'audio' | 'video' | 'url' | 'text' | 'full-pipeline';
  slides?: SlideVoiceover[];
  metadata?: {
    wordCount?: number;
    estimatedDuration?: number;
    provider?: string;
    timestamp?: number;
  };
}

interface SlideVoiceover {
  slideNumber: number;
  title?: string;
  narration: string;
  visualNotes?: string;
  duration: number;
  wordCount: number;
  audioUrl?: string;
}

export type PostAction = 'download' | 'script-editor' | 'vibe' | 'production-hub' | 'knowledge-base';

interface ActionOption {
  id: PostAction;
  label: string;
  description: string;
  icon: React.ReactNode;
  flow?: string;
  recommended?: boolean;
}

const ACTION_OPTIONS: ActionOption[] = [
  {
    id: 'download',
    label: 'Download Script',
    description: 'Save script as .txt or .md file',
    icon: <Download className="h-5 w-5" />,
    flow: 'Immediate download',
  },
  {
    id: 'script-editor',
    label: 'Open in Script Editor',
    description: 'Analyze, enhance, add TTS voice → then to Vibe',
    icon: <PenTool className="h-5 w-5" />,
    flow: 'Script Editor → TTS → Vibe Recording',
    recommended: true,
  },
  {
    id: 'vibe',
    label: 'Send to Vibe Recording',
    description: 'Go directly to recording studio',
    icon: <Mic className="h-5 w-5" />,
    flow: 'Direct to Vibe for recording',
  },
  {
    id: 'production-hub',
    label: 'Send to Production Hub',
    description: 'Link script to a show in Arc/Productions',
    icon: <Film className="h-5 w-5" />,
    flow: 'Arc → Schedule Show → Record',
  },
  {
    id: 'knowledge-base',
    label: 'Save to Knowledge Base',
    description: 'Store for future AI reference',
    icon: <Database className="h-5 w-5" />,
    flow: 'Saved for RAG retrieval',
  },
];

// P2 Advanced Generation Enhancement Options
export type EnhancementFeature = 'multi-language-dub' | 'content-recycling' | 'template-variants' | 'voice-cloning';

interface EnhancementOption {
  id: EnhancementFeature;
  label: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
  estimatedTime: string;
}

const ENHANCEMENT_OPTIONS: EnhancementOption[] = [
  {
    id: 'multi-language-dub',
    label: 'Multi-Language Quick Dub',
    description: 'Translate and dub your script into multiple languages',
    icon: <Globe className="h-5 w-5" />,
    steps: ['Select target languages', 'Choose voice style per language', 'Generate dubbed versions'],
    estimatedTime: '2-5 min per language',
  },
  {
    id: 'content-recycling',
    label: 'Content Recycling Engine',
    description: 'Transform your script into social posts, blogs, emails',
    icon: <Recycle className="h-5 w-5" />,
    steps: ['Select output formats', 'Adjust tone per platform', 'Generate recycled content'],
    estimatedTime: '1-2 min',
  },
  {
    id: 'template-variants',
    label: 'Template Variant Generation',
    description: 'Create A/B versions with different tones or lengths',
    icon: <Layers className="h-5 w-5" />,
    steps: ['Define variant parameters', 'Select number of versions', 'Generate and compare'],
    estimatedTime: '2-3 min',
  },
  {
    id: 'voice-cloning',
    label: 'Voice Cloning for Dubs',
    description: 'Clone a voice sample for consistent narration',
    icon: <AudioWaveform className="h-5 w-5" />,
    steps: ['Upload voice sample (30s+)', 'Train voice model', 'Apply to script'],
    estimatedTime: '3-5 min',
  },
];

interface PostGenerationActionsProps {
  content: GeneratedContent;
  onAction: (action: PostAction) => void;
  onEnhancement?: (enhancement: EnhancementFeature, content: GeneratedContent) => void;
  onMultipleActions?: (actions: PostAction[]) => void;
  selectedActions?: PostAction[];
  className?: string;
  compact?: boolean;
  showEnhancements?: boolean;
}

export function PostGenerationActions({
  content,
  onAction,
  onEnhancement,
  onMultipleActions,
  selectedActions = [],
  className,
  compact = false,
  showEnhancements = true,
}: PostGenerationActionsProps) {
  const [localSelected, setLocalSelected] = useState<PostAction[]>(selectedActions);
  const [enhancementsOpen, setEnhancementsOpen] = useState(false);
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFeature | null>(null);

  const toggleAction = (actionId: PostAction) => {
    setLocalSelected(prev => 
      prev.includes(actionId) 
        ? prev.filter(a => a !== actionId)
        : [...prev, actionId]
    );
  };

  const handleProceed = () => {
    if (localSelected.length === 1) {
      onAction(localSelected[0]);
    } else if (localSelected.length > 1 && onMultipleActions) {
      onMultipleActions(localSelected);
    }
  };

  const handleEnhancementSelect = (enhancementId: EnhancementFeature) => {
    setSelectedEnhancement(enhancementId);
    onEnhancement?.(enhancementId, content);
  };

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm font-medium text-muted-foreground">What would you like to do next?</p>
        <div className="flex flex-wrap gap-2">
          {ACTION_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={option.recommended ? "default" : "outline"}
              size="sm"
              onClick={() => onAction(option.id)}
              className="gap-2"
            >
              {option.icon}
              {option.label}
              {option.recommended && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  Recommended
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-2 border-dashed border-primary/30", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Script Generated Successfully!
        </CardTitle>
        <CardDescription>
          Choose what to do with your generated script
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Script Summary */}
        <div className="p-3 rounded-lg bg-secondary/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-sm">{content.title || 'Generated Script'}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{content.metadata?.wordCount || 0} words</span>
                <span>•</span>
                <span>~{content.metadata?.estimatedDuration || 0}s duration</span>
                <span>•</span>
                <span>From {content.sourceType}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {content.type.replace('_', ' ')}
          </Badge>
        </div>
        
        {/* Inline feedback for generated content */}
        <InlineTrainAIFeedback
          data={{
            context: 'content_generation',
            product: 'spark',
            originalContent: content.script?.slice(0, 500),
            contentId: content.title,
            metadata: { 
              type: content.type,
              sourceType: content.sourceType,
              wordCount: content.metadata?.wordCount 
            }
          }}
          variant="compact"
          showTextFeedback={true}
        />

        <Separator />

        {/* Action Options */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Select action(s):</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACTION_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleAction(option.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all relative",
                  localSelected.includes(option.id)
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-secondary/30"
                )}
              >
                {option.recommended && (
                  <Badge 
                    variant="default" 
                    className="absolute top-2 right-2 text-[10px] px-1.5"
                  >
                    Recommended
                  </Badge>
                )}
                
                {localSelected.includes(option.id) && (
                  <div className="absolute top-2 left-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div className="flex items-start gap-3 mt-1">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                    localSelected.includes(option.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                    {option.flow && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        <ArrowRight className="h-3 w-3" />
                        <span>{option.flow}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Flow Visualization */}
        {localSelected.includes('script-editor') && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-primary mb-2">Your Workflow:</p>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                Script
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="secondary" className="gap-1">
                <PenTool className="h-3 w-3" />
                Script Editor
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Enhance + TTS
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="secondary" className="gap-1">
                <Mic className="h-3 w-3" />
                Vibe Recording
              </Badge>
            </div>
          </div>
        )}

        {/* Production Hub Flow Visualization */}
        {localSelected.includes('production-hub') && (
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs font-medium text-blue-600 mb-2">Production Workflow:</p>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                Script
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Badge className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Film className="h-3 w-3" />
                Production Hub
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="gap-1">
                📅 Schedule
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="secondary" className="gap-1">
                <Mic className="h-3 w-3" />
                Record
              </Badge>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleProceed}
          disabled={localSelected.length === 0}
          className="w-full"
          size="lg"
        >
          {localSelected.length === 0 
            ? 'Select an action to continue'
            : localSelected.length === 1
              ? `Proceed to ${ACTION_OPTIONS.find(o => o.id === localSelected[0])?.label}`
              : `Execute ${localSelected.length} actions`
          }
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Advanced Enhancements - Collapsible Section */}
        {showEnhancements && (
          <>
            <Separator className="my-2" />
            
            <Collapsible open={enhancementsOpen} onOpenChange={setEnhancementsOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between px-3 py-2 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/10">
                      <Wand2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Advanced Enhancements</p>
                      <p className="text-xs text-muted-foreground">
                        Multi-language dub, content recycling, variants & more
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    enhancementsOpen && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="p-2 rounded-lg bg-muted/50 border border-muted">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Guided workflows that enhance your script step-by-step
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ENHANCEMENT_OPTIONS.map((enhancement) => (
                    <button
                      key={enhancement.id}
                      onClick={() => handleEnhancementSelect(enhancement.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-secondary/30",
                        selectedEnhancement === enhancement.id && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                          {enhancement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{enhancement.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {enhancement.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {enhancement.steps.length} steps
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              ~{enhancement.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Step Preview on Hover/Focus */}
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          {enhancement.steps.map((step, idx) => (
                            <React.Fragment key={idx}>
                              <span className="bg-muted px-1.5 py-0.5 rounded">
                                {idx + 1}. {step}
                              </span>
                              {idx < enhancement.steps.length - 1 && (
                                <ChevronRight className="h-3 w-3 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export { ACTION_OPTIONS, ENHANCEMENT_OPTIONS };
