/**
 * Generation Progress Panel - Shows real-time slide generation progress
 * Supports all output types: 2D Static, 2D Animated, 3D, Video, Interactive
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
  Wand2,
  Box,
  Video,
  Film,
  Play,
  MousePointerClick,
  Layers,
  Clapperboard,
  Music,
  Mic,
  Package,
  Orbit,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutputType } from './types';

// ==========================================
// ELEMENT-LEVEL GENERATION STATUS
// ==========================================

export interface ElementGenerationStatus {
  id: string;
  name: string;
  type: 'text' | 'image' | 'chart' | 'table' | 'animation' | '3d-model' | 'audio' | 'video';
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress?: number;
}

export interface SlideGenerationStatus {
  slideNumber: number;
  title?: string;
  type: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  phase?: 'content' | 'image' | 'speaker-notes' | 'animation' | '3d-render' | 'video-render' | 'audio' | 'compositing';
  progress?: number;
  error?: string;
  elements?: ElementGenerationStatus[];
}

export interface ChapterGenerationStatus {
  chapterNumber: number;
  title: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  slides: SlideGenerationStatus[];
  progress?: number;
}

// Extended generation phases for different output types
export type GenerationPhase = 
  | 'analyzing'       // Analyzing content
  | 'structuring'     // Creating slide structure
  | 'generating'      // Generating content
  | 'images'          // Generating images
  | 'animations'      // Adding animations (2D animated)
  | '3d-modeling'     // Creating 3D models
  | '3d-rendering'    // Rendering 3D scenes
  | 'video-scenes'    // Generating video scenes
  | 'video-compositing' // Compositing video
  | 'audio-tts'       // Text-to-speech
  | 'audio-music'     // Background music
  | 'interactive'     // Building interactive elements
  | 'finalizing'      // Final processing
  | 'complete';       // Done

interface GenerationProgressPanelProps {
  isGenerating: boolean;
  totalSlides: number;
  currentSlide: number;
  slideStatuses: SlideGenerationStatus[];
  chapters?: ChapterGenerationStatus[];
  phase: GenerationPhase;
  overallProgress: number;
  estimatedTime?: number;
  outputType?: OutputType;
  showDetailedBreakdown?: boolean;
  className?: string;
}

// Icons for different slide types
const slideTypeIcons: Record<string, React.ReactNode> = {
  title: <Presentation className="h-3 w-3" />,
  content: <FileText className="h-3 w-3" />,
  section: <FileText className="h-3 w-3" />,
  stats: <BarChart3 className="h-3 w-3" />,
  journey: <Map className="h-3 w-3" />,
  infographic: <BarChart3 className="h-3 w-3" />,
  conclusion: <Check className="h-3 w-3" />,
  cta: <MessageSquare className="h-3 w-3" />,
  // Video types
  'video-intro': <Play className="h-3 w-3" />,
  'video-scene': <Film className="h-3 w-3" />,
  'video-outro': <Clapperboard className="h-3 w-3" />,
  'chapter-cover': <BookOpen className="h-3 w-3" />,
  // 3D types
  '3d-scene': <Box className="h-3 w-3" />,
  '3d-model': <Package className="h-3 w-3" />,
  '3d-animated': <Orbit className="h-3 w-3" />,
  // Interactive
  interactive: <MousePointerClick className="h-3 w-3" />,
};

// Element type icons
const elementTypeIcons: Record<string, React.ReactNode> = {
  text: <FileText className="h-2.5 w-2.5" />,
  image: <ImageIcon className="h-2.5 w-2.5" />,
  chart: <BarChart3 className="h-2.5 w-2.5" />,
  table: <FileText className="h-2.5 w-2.5" />,
  animation: <Sparkles className="h-2.5 w-2.5" />,
  '3d-model': <Box className="h-2.5 w-2.5" />,
  audio: <Mic className="h-2.5 w-2.5" />,
  video: <Film className="h-2.5 w-2.5" />,
};

// Phase labels with icons for all output types
const phaseLabels: Record<GenerationPhase, { label: string; icon: React.ReactNode }> = {
  analyzing: { label: 'Analyzing content...', icon: <Sparkles className="h-4 w-4" /> },
  structuring: { label: 'Creating slide structure...', icon: <FileText className="h-4 w-4" /> },
  generating: { label: 'Generating slide content...', icon: <Wand2 className="h-4 w-4" /> },
  images: { label: 'Generating images...', icon: <ImageIcon className="h-4 w-4" /> },
  animations: { label: 'Adding animations...', icon: <Sparkles className="h-4 w-4" /> },
  '3d-modeling': { label: 'Creating 3D models...', icon: <Package className="h-4 w-4" /> },
  '3d-rendering': { label: 'Rendering 3D scenes...', icon: <Box className="h-4 w-4" /> },
  'video-scenes': { label: 'Generating video scenes...', icon: <Film className="h-4 w-4" /> },
  'video-compositing': { label: 'Compositing video...', icon: <Video className="h-4 w-4" /> },
  'audio-tts': { label: 'Generating voiceover...', icon: <Mic className="h-4 w-4" /> },
  'audio-music': { label: 'Adding background music...', icon: <Music className="h-4 w-4" /> },
  interactive: { label: 'Building interactive elements...', icon: <MousePointerClick className="h-4 w-4" /> },
  finalizing: { label: 'Finalizing output...', icon: <Layers className="h-4 w-4" /> },
  complete: { label: 'Generation complete!', icon: <Check className="h-4 w-4" /> },
};

// Output type labels
const outputTypeLabels: Record<OutputType, string> = {
  '2d-static': '2D Slides',
  '2d-animated': '2D Animated',
  '3d-scene': '3D Scene',
  '3d-animated': '3D Animated',
  'video-intro': 'Video Intro',
  'video-full': 'Full Video',
  'interactive': 'Interactive',
  'mixed': 'Mixed Output',
};

// Get expected phases for each output type
const getExpectedPhases = (outputType: OutputType): GenerationPhase[] => {
  switch (outputType) {
    case '2d-static':
      return ['analyzing', 'structuring', 'generating', 'images', 'complete'];
    case '2d-animated':
      return ['analyzing', 'structuring', 'generating', 'images', 'animations', 'complete'];
    case '3d-scene':
      return ['analyzing', 'structuring', 'generating', '3d-modeling', '3d-rendering', 'complete'];
    case '3d-animated':
      return ['analyzing', 'structuring', 'generating', '3d-modeling', '3d-rendering', 'animations', 'complete'];
    case 'video-intro':
      return ['analyzing', 'structuring', 'generating', 'images', 'video-scenes', 'audio-tts', 'video-compositing', 'complete'];
    case 'video-full':
      return ['analyzing', 'structuring', 'generating', 'images', 'video-scenes', 'audio-tts', 'audio-music', 'video-compositing', 'finalizing', 'complete'];
    case 'interactive':
      return ['analyzing', 'structuring', 'generating', 'images', 'interactive', 'complete'];
    case 'mixed':
      return ['analyzing', 'structuring', 'generating', 'images', 'animations', '3d-modeling', 'video-scenes', 'finalizing', 'complete'];
    default:
      return ['analyzing', 'structuring', 'generating', 'images', 'complete'];
  }
};

export function GenerationProgressPanel({
  isGenerating,
  totalSlides,
  currentSlide,
  slideStatuses,
  chapters,
  phase,
  overallProgress,
  estimatedTime,
  outputType = '2d-static',
  showDetailedBreakdown = true,
  className
}: GenerationProgressPanelProps) {
  const [expandedChapters, setExpandedChapters] = React.useState<number[]>([]);
  const [expandedSlides, setExpandedSlides] = React.useState<string[]>([]);
  
  if (!isGenerating && phase !== 'complete') return null;

  const phaseInfo = phaseLabels[phase] || phaseLabels.generating;
  const completedSlides = slideStatuses.filter(s => s.status === 'complete').length;
  const expectedPhases = getExpectedPhases(outputType);
  const currentPhaseIndex = expectedPhases.indexOf(phase);
  
  // Toggle chapter expansion
  const toggleChapter = (chapterNum: number) => {
    setExpandedChapters(prev => 
      prev.includes(chapterNum) 
        ? prev.filter(c => c !== chapterNum)
        : [...prev, chapterNum]
    );
  };
  
  // Toggle slide expansion (for element details)
  const toggleSlide = (slideId: string) => {
    setExpandedSlides(prev => 
      prev.includes(slideId) 
        ? prev.filter(s => s !== slideId)
        : [...prev, slideId]
    );
  };

  // Output type specific completion message
  const getCompletionMessage = () => {
    const chapterCount = chapters?.length || 1;
    switch (outputType) {
      case 'video-intro':
      case 'video-full':
        return `Generated ${chapterCount} chapter${chapterCount > 1 ? 's' : ''} with ${totalSlides} video scenes!`;
      case '3d-scene':
      case '3d-animated':
        return `Rendered ${chapterCount} chapter${chapterCount > 1 ? 's' : ''} with ${totalSlides} 3D scenes!`;
      case 'interactive':
        return `Built ${chapterCount} chapter${chapterCount > 1 ? 's' : ''} with ${totalSlides} interactive slides!`;
      default:
        return `Generated ${chapterCount} chapter${chapterCount > 1 ? 's' : ''} with ${totalSlides} slides!`;
    }
  };
  
  // Get item label based on output type
  const getItemLabel = (singular: boolean = true) => {
    if (outputType.includes('video')) return singular ? 'scene' : 'scenes';
    if (outputType.includes('3d')) return singular ? '3D scene' : '3D scenes';
    return singular ? 'slide' : 'slides';
  };

  return (
    <Card className={cn("border-primary/30 bg-gradient-to-br from-primary/5 to-transparent", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {phase === 'complete' ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          <span>
            {phase === 'complete' 
              ? getCompletionMessage() 
              : `Generating ${outputTypeLabels[outputType]}`
            }
          </span>
          
          {/* Output Type Badge */}
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {outputTypeLabels[outputType]}
          </Badge>
          
          {estimatedTime && phase !== 'complete' && (
            <Badge variant="outline" className="ml-auto text-[10px]">
              <Clock className="h-2.5 w-2.5 mr-1" />
              ~{Math.ceil(estimatedTime / 60)}m remaining
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {/* Phase Progress Pipeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {expectedPhases.filter(p => p !== 'complete').map((p, idx) => {
              const isComplete = currentPhaseIndex > idx;
              const isCurrent = phase === p;
              const pInfo = phaseLabels[p];
              
              return (
                <React.Fragment key={p}>
                  <div 
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-[9px] whitespace-nowrap transition-all",
                      isComplete && "bg-success/20 text-success",
                      isCurrent && "bg-primary/20 text-primary animate-pulse",
                      !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : isCurrent ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full border border-current" />
                    )}
                    <span className="hidden sm:inline">{pInfo.label.replace('...', '')}</span>
                  </div>
                  {idx < expectedPhases.filter(pp => pp !== 'complete').length - 1 && (
                    <div className={cn(
                      "w-3 h-0.5",
                      isComplete ? "bg-success" : "bg-muted"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

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
            <span>{completedSlides} of {totalSlides} {getItemLabel(false)}</span>
            {phase === 'images' && <span>Generating visuals...</span>}
            {phase === 'video-scenes' && <span>Rendering video clips...</span>}
            {phase === '3d-rendering' && <span>Rendering 3D models...</span>}
            {phase === 'audio-tts' && <span>Synthesizing voiceover...</span>}
            {phase === 'animations' && <span>Adding motion effects...</span>}
          </div>
        </div>

        {/* DETAILED BREAKDOWN: Chapters > Slides > Elements */}
        {showDetailedBreakdown && chapters && chapters.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Chapter Progress
            </p>
            <div className="space-y-2">
              {chapters.map((chapter) => {
                const isExpanded = expandedChapters.includes(chapter.chapterNumber);
                const chapterComplete = chapter.slides.every(s => s.status === 'complete');
                const chapterProgress = chapter.slides.length > 0 
                  ? Math.round((chapter.slides.filter(s => s.status === 'complete').length / chapter.slides.length) * 100)
                  : 0;
                
                return (
                  <div key={chapter.chapterNumber} className="border rounded-lg overflow-hidden">
                    {/* Chapter Header */}
                    <button
                      onClick={() => toggleChapter(chapter.chapterNumber)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 text-left transition-colors",
                        chapterComplete ? "bg-success/10" : chapter.status === 'generating' ? "bg-primary/10" : "bg-muted/30"
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium flex-1">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {chapter.slides.filter(s => s.status === 'complete').length}/{chapter.slides.length}
                        </span>
                        {chapterComplete ? (
                          <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-success-foreground" />
                          </div>
                        ) : chapter.status === 'generating' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <div className="h-4 w-16">
                            <Progress value={chapterProgress} className="h-1.5" />
                          </div>
                        )}
                      </div>
                    </button>
                    
                    {/* Expanded Slides */}
                    {isExpanded && (
                      <div className="p-2 pt-0 space-y-1.5 bg-background/50">
                        {chapter.slides.map((slide) => {
                          const slideId = `ch${chapter.chapterNumber}-slide${slide.slideNumber}`;
                          const isSlideExpanded = expandedSlides.includes(slideId);
                          const hasElements = slide.elements && slide.elements.length > 0;
                          
                          return (
                            <div key={slide.slideNumber} className="rounded border bg-background">
                              {/* Slide Row */}
                              <div
                                className={cn(
                                  "flex items-center gap-2 p-2 cursor-pointer transition-colors",
                                  slide.status === 'complete' && "border-l-2 border-l-success",
                                  slide.status === 'generating' && "border-l-2 border-l-primary",
                                  slide.status === 'error' && "border-l-2 border-l-destructive"
                                )}
                                onClick={() => hasElements && toggleSlide(slideId)}
                              >
                                {hasElements && (
                                  isSlideExpanded ? (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  )
                                )}
                                {!hasElements && <span className="w-3" />}
                                
                                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold">
                                  {slide.slideNumber}
                                </div>
                                
                                <div className="flex-1 flex items-center gap-2">
                                  {slideTypeIcons[slide.type] || <FileText className="h-3 w-3" />}
                                  <span className="text-xs truncate">{slide.title || slide.type}</span>
                                </div>
                                
                                {/* Slide Status */}
                                {slide.status === 'complete' && (
                                  <Check className="h-3.5 w-3.5 text-success" />
                                )}
                                {slide.status === 'generating' && (
                                  <div className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                    {slide.phase && (
                                      <span className="text-[9px] text-muted-foreground">{slide.phase}</span>
                                    )}
                                  </div>
                                )}
                                {slide.status === 'error' && (
                                  <span className="text-[9px] text-destructive">Error</span>
                                )}
                              </div>
                              
                              {/* Element Details */}
                              {isSlideExpanded && hasElements && (
                                <div className="px-2 pb-2 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-1">
                                  {slide.elements?.map((element) => (
                                    <div
                                      key={element.id}
                                      className={cn(
                                        "flex items-center gap-1.5 p-1.5 rounded text-[9px] border",
                                        element.status === 'complete' && "bg-success/10 border-success/30",
                                        element.status === 'generating' && "bg-primary/10 border-primary/30 animate-pulse",
                                        element.status === 'pending' && "bg-muted/30 border-muted",
                                        element.status === 'error' && "bg-destructive/10 border-destructive/30"
                                      )}
                                    >
                                      {elementTypeIcons[element.type] || <Layers className="h-2.5 w-2.5" />}
                                      <span className="truncate flex-1">{element.name}</span>
                                      {element.status === 'complete' && <Check className="h-2 w-2 text-success" />}
                                      {element.status === 'generating' && <Loader2 className="h-2 w-2 animate-spin" />}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Simple Slide Grid (fallback when no chapters) */
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {outputType.includes('video') ? 'Scene Progress' : 'Slide Progress'}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
              {slideStatuses.map((slide) => (
                <div
                  key={slide.slideNumber}
                  className={cn(
                    "relative p-2 rounded-lg border text-center transition-all",
                    slide.status === 'complete' && "border-success/50 bg-success/10",
                    slide.status === 'generating' && "border-primary bg-primary/10 animate-pulse",
                    slide.status === 'pending' && "border-muted bg-muted/30",
                    slide.status === 'error' && "border-destructive bg-destructive/10"
                  )}
                >
                  <div className="text-xs font-bold">{slide.slideNumber}</div>
                  <div className="mt-0.5 flex justify-center text-muted-foreground">
                    {slideTypeIcons[slide.type] || <FileText className="h-3 w-3" />}
                  </div>
                  <div className="absolute -top-1 -right-1">
                    {slide.status === 'complete' && (
                      <div className="h-3 w-3 rounded-full bg-success flex items-center justify-center">
                        <Check className="h-2 w-2 text-success-foreground" />
                      </div>
                    )}
                    {slide.status === 'generating' && (
                      <div className="h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                        <Loader2 className="h-2 w-2 text-primary-foreground animate-spin" />
                      </div>
                    )}
                  </div>
                  {slide.title && slide.status === 'complete' && (
                    <div className="mt-1 text-[8px] text-muted-foreground truncate" title={slide.title}>
                      {slide.title.slice(0, 15)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Slide/Scene Detail */}
        {phase !== 'complete' && slideStatuses[currentSlide - 1] && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="font-medium">
                Generating {getItemLabel()} {currentSlide}: {slideStatuses[currentSlide - 1]?.type}
              </span>
            </div>
            {slideStatuses[currentSlide - 1]?.phase && (
              <div className="mt-1 text-[10px] text-muted-foreground">
                Phase: 
                {slideStatuses[currentSlide - 1].phase === 'content' && ' Writing content...'}
                {slideStatuses[currentSlide - 1].phase === 'image' && ' Creating visual...'}
                {slideStatuses[currentSlide - 1].phase === 'speaker-notes' && ' Adding speaker notes...'}
                {slideStatuses[currentSlide - 1].phase === 'animation' && ' Adding animations...'}
                {slideStatuses[currentSlide - 1].phase === '3d-render' && ' Rendering 3D...'}
                {slideStatuses[currentSlide - 1].phase === 'video-render' && ' Rendering video...'}
                {slideStatuses[currentSlide - 1].phase === 'audio' && ' Generating audio...'}
                {slideStatuses[currentSlide - 1].phase === 'compositing' && ' Compositing layers...'}
              </div>
            )}
          </div>
        )}

        {/* Completion Summary */}
        {phase === 'complete' && (
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-success">
              <Check className="h-4 w-4" />
              <span className="font-medium">
                {getCompletionMessage()}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {outputType === '2d-static' && 'Review and edit each slide below. Click on any slide to modify content.'}
              {outputType === '2d-animated' && 'Preview animations and edit content. Adjust timing in the editor.'}
              {outputType.includes('3d') && 'Explore 3D scenes in the viewer. Adjust camera angles and lighting.'}
              {outputType.includes('video') && 'Preview your video. Edit scenes, adjust voiceover, and add music.'}
              {outputType === 'interactive' && 'Test interactive elements. Configure click actions and data bindings.'}
              {outputType === 'mixed' && 'Review all output formats. Each slide may have different media types.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
