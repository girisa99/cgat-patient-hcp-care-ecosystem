/**
 * Image Script Assembler - P1 #12
 * 
 * Arranges images with script segments, adds TTS, and compiles video.
 * Flow: Images + Script → Arrange → TTS → Compile Video
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Volume2,
  Film,
  Upload,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ImageSlide {
  id: string;
  imageUrl: string;
  scriptText: string;
  duration: number; // seconds
  transition: 'none' | 'fade' | 'slide' | 'zoom';
  voiceStyle?: string;
  order: number;
}

interface ImageScriptAssemblerProps {
  onAssemblyComplete?: (slides: ImageSlide[]) => void;
  onGenerateVideo?: (slides: ImageSlide[]) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ImageScriptAssembler: React.FC<ImageScriptAssemblerProps> = ({
  onAssemblyComplete,
  onGenerateVideo,
  className,
}) => {
  const [slides, setSlides] = useState<ImageSlide[]>([
    {
      id: '1',
      imageUrl: '/placeholder.svg',
      scriptText: 'Welcome to our product presentation. Today we will explore the key features.',
      duration: 5,
      transition: 'fade',
      voiceStyle: 'professional',
      order: 0,
    },
    {
      id: '2',
      imageUrl: '/placeholder.svg',
      scriptText: 'Our solution offers seamless integration with your existing workflows.',
      duration: 6,
      transition: 'slide',
      voiceStyle: 'professional',
      order: 1,
    },
  ]);
  const [selectedSlide, setSelectedSlide] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const voiceStyles = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'calm', label: 'Calm & Soothing' },
    { value: 'authoritative', label: 'Authoritative' },
  ];

  const transitions = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
  ];

  const addSlide = useCallback(() => {
    const newSlide: ImageSlide = {
      id: Date.now().toString(),
      imageUrl: '/placeholder.svg',
      scriptText: '',
      duration: 5,
      transition: 'fade',
      voiceStyle: 'professional',
      order: slides.length,
    };
    setSlides(prev => [...prev, newSlide]);
    setSelectedSlide(newSlide.id);
  }, [slides.length]);

  const removeSlide = useCallback((id: string) => {
    setSlides(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return filtered.map((s, i) => ({ ...s, order: i }));
    });
    if (selectedSlide === id) {
      setSelectedSlide(null);
    }
  }, [selectedSlide]);

  const updateSlide = useCallback((id: string, updates: Partial<ImageSlide>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const moveSlide = useCallback((id: string, direction: 'up' | 'down') => {
    setSlides(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newSlides = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
      return newSlides.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const generateVideo = useCallback(async () => {
    setIsGenerating(true);
    // Simulate video generation
    await new Promise(r => setTimeout(r, 3000));
    setIsGenerating(false);
    onGenerateVideo?.(slides);
    onAssemblyComplete?.(slides);
  }, [slides, onGenerateVideo, onAssemblyComplete]);

  const totalDuration = slides.reduce((sum, s) => sum + s.duration, 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedSlideData = slides.find(s => s.id === selectedSlide);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          Image + Script Assembler
        </CardTitle>
        <CardDescription>
          Arrange images with script, add voiceover, and generate video
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slide List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Slides</h3>
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                {formatDuration(totalDuration)}
              </Badge>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-2">
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedSlide === slide.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedSlide(slide.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSlide(slide.id, 'up');
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSlide(slide.id, 'down');
                          }}
                          disabled={index === slides.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-16 h-10 bg-muted rounded overflow-hidden">
                            <img
                              src={slide.imageUrl}
                              alt={`Slide ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Slide {index + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              {slide.duration}s • {slide.transition}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {slide.scriptText || 'No script text'}
                        </p>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(slide.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button onClick={addSlide} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </div>

          {/* Slide Editor */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSlideData ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Edit Slide {slides.findIndex(s => s.id === selectedSlide) + 1}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Play className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Volume2 className="mr-1 h-3 w-3" />
                      Generate TTS
                    </Button>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4 max-w-md mx-auto">
                    <img
                      src={selectedSlideData.imageUrl}
                      alt="Slide preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <Button variant="ghost" className="ml-2">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </Button>
                </div>

                {/* Script Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Script Text
                  </label>
                  <Textarea
                    value={selectedSlideData.scriptText}
                    onChange={(e) => updateSlide(selectedSlide!, { scriptText: e.target.value })}
                    placeholder="Enter the narration text for this slide..."
                    rows={4}
                  />
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (sec)</label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={selectedSlideData.duration}
                      onChange={(e) => updateSlide(selectedSlide!, { duration: parseInt(e.target.value) || 5 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transition</label>
                    <Select
                      value={selectedSlideData.transition}
                      onValueChange={(v) => updateSlide(selectedSlide!, { transition: v as ImageSlide['transition'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transitions.map(t => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Voice Style</label>
                    <Select
                      value={selectedSlideData.voiceStyle}
                      onValueChange={(v) => updateSlide(selectedSlide!, { voiceStyle: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceStyles.map(v => (
                          <SelectItem key={v.value} value={v.value}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center border rounded-lg">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a slide to edit or add a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{slides.length} slides</Badge>
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              Total: {formatDuration(totalDuration)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
            >
              <Play className="mr-2 h-4 w-4" />
              Preview All
            </Button>
            <Button
              onClick={generateVideo}
              disabled={slides.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Film className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageScriptAssembler;
