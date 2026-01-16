/**
 * Generation Progress Panel - Shows real-time slide generation progress
 * Displays each slide as it's being generated with status
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Check,
  Clock,
  Sparkles,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Map,
  Presentation,
  MessageSquare,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SlideGenerationStatus {
  slideNumber: number;
  title?: string;
  type: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  phase?: 'content' | 'image' | 'speaker-notes';
  progress?: number;
  error?: string;
}

interface GenerationProgressPanelProps {
  isGenerating: boolean;
  totalSlides: number;
  currentSlide: number;
  slideStatuses: SlideGenerationStatus[];
  phase: 'analyzing' | 'structuring' | 'generating' | 'images' | 'complete';
  overallProgress: number;
  estimatedTime?: number;
  className?: string;
}

const slideTypeIcons: Record<string, React.ReactNode> = {
  title: <Presentation className="h-3 w-3" />,
  content: <FileText className="h-3 w-3" />,
  section: <FileText className="h-3 w-3" />,
  stats: <BarChart3 className="h-3 w-3" />,
  journey: <Map className="h-3 w-3" />,
  infographic: <BarChart3 className="h-3 w-3" />,
  conclusion: <Check className="h-3 w-3" />,
  cta: <MessageSquare className="h-3 w-3" />,
};

const phaseLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  analyzing: { label: 'Analyzing content...', icon: <Sparkles className="h-4 w-4" /> },
  structuring: { label: 'Creating slide structure...', icon: <FileText className="h-4 w-4" /> },
  generating: { label: 'Generating slide content...', icon: <Wand2 className="h-4 w-4" /> },
  images: { label: 'Generating images...', icon: <ImageIcon className="h-4 w-4" /> },
  complete: { label: 'Generation complete!', icon: <Check className="h-4 w-4" /> },
};

export function GenerationProgressPanel({
  isGenerating,
  totalSlides,
  currentSlide,
  slideStatuses,
  phase,
  overallProgress,
  estimatedTime,
  className
}: GenerationProgressPanelProps) {
  if (!isGenerating && phase !== 'complete') return null;

  const phaseInfo = phaseLabels[phase];
  const completedSlides = slideStatuses.filter(s => s.status === 'complete').length;

  return (
    <Card className={cn("border-primary/30 bg-gradient-to-br from-primary/5 to-transparent", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {phase === 'complete' ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          <span>
            {phase === 'complete' 
              ? `Generated ${totalSlides} slides!` 
              : `Generating Presentation`
            }
          </span>
          {estimatedTime && phase !== 'complete' && (
            <Badge variant="outline" className="ml-auto text-[10px]">
              <Clock className="h-2.5 w-2.5 mr-1" />
              ~{Math.ceil(estimatedTime / 60)}m remaining
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {phaseInfo.icon}
              <span>{phaseInfo.label}</span>
            </div>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{completedSlides} of {totalSlides} slides</span>
            {phase === 'images' && (
              <span>Generating visuals...</span>
            )}
          </div>
        </div>

        {/* Slide Status Grid */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Slide Progress
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
            {slideStatuses.map((slide) => (
              <div
                key={slide.slideNumber}
                className={cn(
                  "relative p-2 rounded-lg border text-center transition-all",
                  slide.status === 'complete' && "border-green-500/50 bg-green-500/10",
                  slide.status === 'generating' && "border-primary bg-primary/10 animate-pulse",
                  slide.status === 'pending' && "border-muted bg-muted/30",
                  slide.status === 'error' && "border-destructive bg-destructive/10"
                )}
              >
                {/* Slide Number */}
                <div className="text-xs font-bold">
                  {slide.slideNumber}
                </div>
                
                {/* Type Icon */}
                <div className="mt-0.5 flex justify-center text-muted-foreground">
                  {slideTypeIcons[slide.type] || <FileText className="h-3 w-3" />}
                </div>

                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1">
                  {slide.status === 'complete' && (
                    <div className="h-3 w-3 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {slide.status === 'generating' && (
                    <div className="h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 className="h-2 w-2 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Title (if available and complete) */}
                {slide.title && slide.status === 'complete' && (
                  <div className="mt-1 text-[8px] text-muted-foreground truncate" title={slide.title}>
                    {slide.title.slice(0, 15)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Slide Detail */}
        {phase !== 'complete' && slideStatuses[currentSlide - 1] && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="font-medium">
                Generating Slide {currentSlide}: {slideStatuses[currentSlide - 1]?.type}
              </span>
            </div>
            {slideStatuses[currentSlide - 1]?.phase && (
              <div className="mt-1 text-[10px] text-muted-foreground">
                Phase: {slideStatuses[currentSlide - 1].phase === 'content' && 'Writing content...'}
                {slideStatuses[currentSlide - 1].phase === 'image' && 'Creating visual...'}
                {slideStatuses[currentSlide - 1].phase === 'speaker-notes' && 'Adding speaker notes...'}
              </div>
            )}
          </div>
        )}

        {/* Completion Summary */}
        {phase === 'complete' && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span className="font-medium">
                All {totalSlides} slides generated successfully!
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Review and edit each slide below. Click on any slide to modify content.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
