/**
 * Real-Time Slide Streamer Component
 * 
 * Displays slides as they generate with:
 * - Live streaming updates
 * - Content type decision badges
 * - Per-slide confidence scores
 * - Language version thumbnails
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Loader2,
  Check,
  X,
  Clock,
  Image as ImageIcon,
  BarChart3,
  Map,
  Table,
  Quote,
  FileText,
  Brain,
  Globe,
  Download,
  Eye,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  LanguageGenerationState, 
  StreamingSlide 
} from '@/hooks/useAgentPresentationGenerator';
import { ContentTypeDecision } from '@/services/agentPresentationGeneratorService';
import { GeneratedSlide } from '@/services/universalPresentationService';

interface RealTimeSlideStreamerProps {
  languageStates: Map<string, LanguageGenerationState>;
  streamingSlides: Map<string, StreamingSlide>;
  primaryLanguage: string;
  totalSlides: number;
  onSlideClick?: (languageCode: string, slideNumber: number) => void;
  onDownload?: (languageCode: string) => void;
  onPreview?: (languageCode: string) => void;
  className?: string;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-3 w-3" />,
  infographic: <BarChart3 className="h-3 w-3" />,
  journey_map: <Map className="h-3 w-3" />,
  table: <Table className="h-3 w-3" />,
  chart: <BarChart3 className="h-3 w-3" />,
  quote: <Quote className="h-3 w-3" />,
  stats: <BarChart3 className="h-3 w-3" />,
  text_only: <FileText className="h-3 w-3" />,
};

const contentTypeLabels: Record<string, string> = {
  image: 'Image',
  infographic: 'Infographic',
  journey_map: 'Journey Map',
  table: 'Table',
  chart: 'Chart',
  quote: 'Quote',
  stats: 'Statistics',
  text_only: 'Text Only',
};

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <Badge variant="outline" className={cn("text-[9px] px-1.5", color, "text-white border-0")}>
      {score}%
    </Badge>
  );
}

function ContentTypeBadge({ decision }: { decision?: ContentTypeDecision }) {
  if (!decision) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[9px] px-1.5 gap-1">
            {contentTypeIcons[decision.contentType]}
            {contentTypeLabels[decision.contentType]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs font-medium">{decision.reasoning}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Confidence: {(decision.confidence * 100).toFixed(0)}%
            {decision.alternativeType && (
              <span className="ml-1">
                (Alt: {contentTypeLabels[decision.alternativeType]} {((decision.alternativeConfidence || 0) * 100).toFixed(0)}%)
              </span>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SlideStreamCard({ 
  slide, 
  streamingSlide,
  contentDecision,
  onClick 
}: { 
  slide?: GeneratedSlide; 
  streamingSlide: StreamingSlide;
  contentDecision?: ContentTypeDecision;
  onClick?: () => void;
}) {
  const isActive = streamingSlide.status === 'generating_content' || streamingSlide.status === 'generating_image';
  const isComplete = streamingSlide.status === 'complete';
  const isError = streamingSlide.status === 'error';

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-lg border transition-all cursor-pointer hover:shadow-md",
        isActive && "border-primary bg-primary/10 animate-pulse",
        isComplete && "border-green-500/50 bg-green-500/5",
        isError && "border-destructive/50 bg-destructive/5",
        !isActive && !isComplete && !isError && "border-muted bg-muted/20"
      )}
    >
      {/* Slide number and status */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold">#{streamingSlide.slideNumber}</span>
        <div className="flex items-center gap-1">
          {isActive && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
          {isComplete && <Check className="h-3 w-3 text-green-500" />}
          {isError && <X className="h-3 w-3 text-destructive" />}
          {streamingSlide.status === 'pending' && <Clock className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>

      {/* Content preview */}
      {slide ? (
        <div className="space-y-1">
          <p className="text-[10px] font-medium truncate">{slide.title}</p>
          {slide.content?.bullets?.[0] && (
            <p className="text-[9px] text-muted-foreground truncate">
              {typeof slide.content.bullets[0] === 'string' 
                ? slide.content.bullets[0] 
                : (slide.content.bullets[0] as any)?.text}
            </p>
          )}
          
          {/* Content type decision */}
          <ContentTypeBadge decision={contentDecision} />
          
          {/* Image indicator */}
          {slide.image && (
            <div className="mt-1 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-primary" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-12 flex items-center justify-center">
          {isActive ? (
            <span className="text-[9px] text-muted-foreground">Generating...</span>
          ) : (
            <span className="text-[9px] text-muted-foreground">Pending</span>
          )}
        </div>
      )}

      {/* Progress bar for active slides */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
          <div 
            className="h-full bg-primary animate-pulse" 
            style={{ width: streamingSlide.status === 'generating_image' ? '75%' : '40%' }}
          />
        </div>
      )}
    </div>
  );
}

function LanguageVersionCard({
  state,
  streamingSlides,
  isPrimary,
  onSlideClick,
  onDownload,
  onPreview,
}: {
  state: LanguageGenerationState;
  streamingSlides: Map<string, StreamingSlide>;
  isPrimary: boolean;
  onSlideClick?: (slideNumber: number) => void;
  onDownload?: () => void;
  onPreview?: () => void;
}) {
  const languageSlides = Array.from({ length: state.totalSlides }, (_, i) => {
    const key = `${state.languageCode}-${i + 1}`;
    return streamingSlides.get(key);
  }).filter(Boolean) as StreamingSlide[];

  const completedSlides = languageSlides.filter(s => s.status === 'complete').length;

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isPrimary && "ring-2 ring-primary/30",
      state.status === 'complete' && "border-green-500/30",
      state.status === 'error' && "border-destructive/30"
    )}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{state.flag}</span>
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                {state.languageName}
                {isPrimary && (
                  <Badge variant="default" className="text-[9px] px-1.5">Primary</Badge>
                )}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">
                {state.modelConfig.textModel.split('/').pop()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {state.status === 'complete' && (
              <ConfidenceBadge score={state.confidenceScore} />
            )}
            
            {state.status === 'generating' && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            {state.status === 'complete' && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {state.status === 'error' && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{completedSlides}/{state.totalSlides} slides</span>
            <span>{state.progress.toFixed(0)}%</span>
          </div>
          <Progress value={state.progress} className="h-1.5" />
        </div>

        {/* Slide grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {languageSlides.slice(0, 8).map((streamSlide, idx) => (
            <SlideStreamCard
              key={streamSlide.slideNumber}
              slide={state.slides[idx]}
              streamingSlide={streamSlide}
              contentDecision={state.contentDecisions[idx]}
              onClick={() => onSlideClick?.(streamSlide.slideNumber)}
            />
          ))}
        </div>

        {state.totalSlides > 8 && (
          <p className="text-center text-[10px] text-muted-foreground">
            +{state.totalSlides - 8} more slides
          </p>
        )}

        {/* Actions */}
        {state.status === 'complete' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={onPreview}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={onDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              {state.fileName.split('_').pop()}
            </Button>
          </div>
        )}

        {/* Error message */}
        {state.status === 'error' && state.error && (
          <p className="text-[10px] text-destructive bg-destructive/10 p-2 rounded">
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function RealTimeSlideStreamer({
  languageStates,
  streamingSlides,
  primaryLanguage,
  totalSlides,
  onSlideClick,
  onDownload,
  onPreview,
  className,
}: RealTimeSlideStreamerProps) {
  const languages = Array.from(languageStates.keys());
  const primaryState = languageStates.get(primaryLanguage);
  const secondaryLanguages = languages.filter(l => l !== primaryLanguage);

  if (languageStates.size === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Real-Time Generation</h3>
          <Badge variant="outline" className="text-[10px]">
            <Globe className="h-2.5 w-2.5 mr-1" />
            {languages.length} language{languages.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Brain className="h-3 w-3" />
          AI Content Decisions
        </div>
      </div>

      {/* Primary Language - Featured */}
      {primaryState && (
        <LanguageVersionCard
          state={primaryState}
          streamingSlides={streamingSlides}
          isPrimary={true}
          onSlideClick={(slideNum) => onSlideClick?.(primaryLanguage, slideNum)}
          onDownload={() => onDownload?.(primaryLanguage)}
          onPreview={() => onPreview?.(primaryLanguage)}
        />
      )}

      {/* Secondary Languages */}
      {secondaryLanguages.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Background Generation ({secondaryLanguages.length} languages)
            </h4>
            
            <ScrollArea className="max-h-[400px]">
              <div className="grid gap-3 md:grid-cols-2">
                {secondaryLanguages.map(langCode => {
                  const state = languageStates.get(langCode);
                  if (!state) return null;
                  
                  return (
                    <LanguageVersionCard
                      key={langCode}
                      state={state}
                      streamingSlides={streamingSlides}
                      isPrimary={false}
                      onSlideClick={(slideNum) => onSlideClick?.(langCode, slideNum)}
                      onDownload={() => onDownload?.(langCode)}
                      onPreview={() => onPreview?.(langCode)}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Content Type Decision Legend */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-[10px] font-medium text-muted-foreground mb-2">
          AI Content Type Decisions:
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(contentTypeLabels).slice(0, 6).map(([type, label]) => (
            <Badge key={type} variant="outline" className="text-[9px] gap-1">
              {contentTypeIcons[type]}
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
