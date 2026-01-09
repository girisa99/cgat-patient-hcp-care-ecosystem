/**
 * Presentation Script View - Slide-by-slide script display
 * Part of Genie Spark Presentation Mode
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Presentation, 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  Loader2,
  Clock,
  FileText,
  Wand2,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SlideScriptCard, SlideScript } from './SlideScriptCard';
import { supabase } from '@/integrations/supabase/client';

interface PresentationScriptViewProps {
  title: string;
  slides: SlideScript[];
  sourceType: 'pptx' | 'pdf' | 'video' | 'url';
  onSlidesUpdate?: (slides: SlideScript[]) => void;
  onExportAll?: () => void;
  className?: string;
}

export function PresentationScriptView({
  title,
  slides: initialSlides,
  sourceType,
  onSlidesUpdate,
  onExportAll,
  className,
}: PresentationScriptViewProps) {
  const [slides, setSlides] = useState<SlideScript[]>(initialSlides);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingSlideIndex, setGeneratingSlideIndex] = useState<number | null>(null);
  const [playingSlideIndex, setPlayingSlideIndex] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate totals
  const totalDuration = slides.reduce((sum, s) => sum + s.duration, 0);
  const totalWords = slides.reduce((sum, s) => sum + s.wordCount, 0);
  const slidesWithAudio = slides.filter(s => s.audioUrl).length;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate TTS for a single slide
  const generateSlideAudio = useCallback(async (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide) return;

    setGeneratingSlideIndex(slideIndex);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-voice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: slide.narration,
            voice: 'JBFqnCBsd6RMkjVDRZzb', // George - professional voice
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const updatedSlides = [...slides];
      updatedSlides[slideIndex] = {
        ...slide,
        audioUrl,
        audioBlob,
      };
      setSlides(updatedSlides);
      onSlidesUpdate?.(updatedSlides);

      toast.success(`Audio generated for Slide ${slide.slideNumber}`);
    } catch (error) {
      console.error('TTS generation failed:', error);
      toast.error(`Failed to generate audio for Slide ${slide.slideNumber}`);
    } finally {
      setGeneratingSlideIndex(null);
    }
  }, [slides, onSlidesUpdate]);

  // Generate TTS for all slides
  const generateAllAudio = useCallback(async () => {
    setIsGeneratingAll(true);
    setGenerationProgress(0);

    const slidesWithoutAudio = slides.filter(s => !s.audioUrl);
    
    for (let i = 0; i < slidesWithoutAudio.length; i++) {
      const slide = slidesWithoutAudio[i];
      const slideIndex = slides.findIndex(s => s.slideNumber === slide.slideNumber);
      
      await generateSlideAudio(slideIndex);
      setGenerationProgress(((i + 1) / slidesWithoutAudio.length) * 100);
    }

    setIsGeneratingAll(false);
    toast.success('All audio generated successfully!');
  }, [slides, generateSlideAudio]);

  // Play audio for a slide
  const playSlideAudio = useCallback((slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide?.audioUrl) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(slide.audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setPlayingSlideIndex(null);
      audioRef.current = null;
    };

    audio.play();
    setPlayingSlideIndex(slideIndex);
  }, [slides]);

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSlideIndex(null);
  }, []);

  // Update slide narration
  const updateSlideNarration = useCallback((slideIndex: number, narration: string) => {
    const updatedSlides = [...slides];
    const wordCount = narration.split(/\s+/).filter(w => w).length;
    const duration = Math.ceil((wordCount / 150) * 60); // 150 WPM
    
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      narration,
      wordCount,
      duration,
      // Clear audio if narration changed
      audioUrl: undefined,
      audioBlob: undefined,
    };
    setSlides(updatedSlides);
    onSlidesUpdate?.(updatedSlides);
  }, [slides, onSlidesUpdate]);

  // Download single slide audio
  const downloadSlideAudio = useCallback((slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide?.audioBlob) return;

    const url = URL.createObjectURL(slide.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slide-${slide.slideNumber}-voiceover.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  }, [slides]);

  // Export all audio as combined file
  const exportAllAudio = useCallback(async () => {
    const slidesWithAudio = slides.filter(s => s.audioBlob);
    if (slidesWithAudio.length === 0) {
      toast.error('No audio to export. Generate audio first.');
      return;
    }

    // For now, export as a zip or individual files
    // Full concatenation would require AudioContext
    for (const slide of slidesWithAudio) {
      if (slide.audioBlob) {
        const url = URL.createObjectURL(slide.audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `slide-${slide.slideNumber}-voiceover.mp3`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }

    toast.success(`Exported ${slidesWithAudio.length} audio files`);
  }, [slides]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Presentation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-xs">
                    {sourceType.toUpperCase()}
                  </Badge>
                  <span>{slides.length} slides</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(totalDuration)}</span>
                  <span>•</span>
                  <FileText className="h-3 w-3" />
                  <span>{totalWords} words</span>
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Generate All Button */}
              <Button
                onClick={generateAllAudio}
                disabled={isGeneratingAll || slidesWithAudio === slides.length}
                className="gap-2"
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate All Voiceovers
                  </>
                )}
              </Button>

              {/* Export Button */}
              <Button
                variant="outline"
                onClick={exportAllAudio}
                disabled={slidesWithAudio === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Audio
              </Button>
            </div>
          </div>

          {/* Generation Progress */}
          {isGeneratingAll && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Generating voiceovers...</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          {/* Audio Status */}
          {slidesWithAudio > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Volume2 className="h-3 w-3 mr-1" />
                {slidesWithAudio}/{slides.length} slides have audio
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Slide Cards */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3 pr-4">
          {slides.map((slide, index) => (
            <SlideScriptCard
              key={slide.slideNumber}
              slide={slide}
              isGeneratingAudio={generatingSlideIndex === index}
              isPlaying={playingSlideIndex === index}
              onPlayAudio={() => playSlideAudio(index)}
              onStopAudio={stopAudio}
              onGenerateTTS={() => generateSlideAudio(index)}
              onUpdateNarration={(narration) => updateSlideNarration(index, narration)}
              onDownloadAudio={() => downloadSlideAudio(index)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
