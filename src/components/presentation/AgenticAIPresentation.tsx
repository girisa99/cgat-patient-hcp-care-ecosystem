import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, Download, FileText, Presentation, Database, Cloud, MessageSquare, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenCaptureExport } from '@/hooks/useScreenCaptureExport';
import { useTextBasedExport } from '@/hooks/useTextBasedExport';
import { presentationSlides } from '@/data/presentation-slides';
import './PresentationStyles.css';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

// Use imported slides from data file

export const AgenticAIPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { generatePowerPoint: generateImagePPT, generatePDF: generateImagePDF } = useScreenCaptureExport();
  const { generateTextPowerPoint, generateTextPDF } = useTextBasedExport();

  // DEBUG: Log what slides are being used
  console.log('🔍 AgenticAIPresentation - Slides loaded:', {
    totalSlides: presentationSlides.length,
    slideIds: presentationSlides.map(s => s.id),
    slideTitles: presentationSlides.map(s => s.title),
    firstSlideContent: presentationSlides[0]?.content ? 'HAS CONTENT' : 'NO CONTENT'
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % presentationSlides.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % presentationSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + presentationSlides.length) % presentationSlides.length);
  };

  const resetPresentation = () => {
    setCurrentSlide(0);
    setIsAutoplay(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleExport = async (format: 'text-pdf' | 'text-ppt' | 'image-pdf' | 'image-ppt') => {
    try {
      switch (format) {
        case 'text-pdf':
          await generateTextPDF();
          break;
        case 'text-ppt':
          await generateTextPowerPoint();
          break;
        case 'image-pdf':
          await generateImagePDF();
          break;
        case 'image-ppt':
          await generateImagePPT();
          break;
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    }
  };

  const currentSlideData = presentationSlides[currentSlide];
  
  // DEBUG: Log current slide data
  console.log('🎯 Current slide data:', {
    slideIndex: currentSlide,
    slideId: currentSlideData?.id,
    title: currentSlideData?.title,
    hasContent: currentSlideData?.content ? 'YES' : 'NO',
    contentType: typeof currentSlideData?.content
  });

  return (
    <div className={cn(
      "relative bg-background",
      isFullscreen ? "fixed inset-0 z-50" : "w-full max-w-6xl mx-auto"
    )}>
      {/* Header Controls */}
      <div className="flex justify-between items-center p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">
            Treatment Center AI Implementation
          </h1>
          <Badge variant="secondary">
            {currentSlide + 1} of {presentationSlides.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="flex items-center gap-2"
          >
            {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoplay ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetPresentation}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('text-pdf')}
              title="Generate PDF with actual text content (recommended)"
            >
              <FileText className="w-4 h-4" />
              <span className="ml-1 text-xs">TEXT</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('text-ppt')}
              title="Generate PowerPoint with actual text content (recommended)"
            >
              <Presentation className="w-4 h-4" />
              <span className="ml-1 text-xs">TEXT</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('image-pdf')}
              title="Generate PDF with slide images (visual fidelity)"
            >
              <Download className="w-4 h-4" />
              <span className="ml-1 text-xs">IMG</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className={cn(
        "relative bg-gradient-to-br from-background via-muted/20 to-background",
        isFullscreen ? "h-[calc(100vh-120px)]" : "h-[600px]"
      )}>
        <div 
          className="w-full h-full p-8"
          data-slide-content
          data-slide-id={currentSlide}
          key={currentSlide}
        >
          {/* Slide Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary mb-2">
              {currentSlideData.title}
            </h2>
            {currentSlideData.subtitle && (
              <p className="text-lg text-muted-foreground">
                {currentSlideData.subtitle}
              </p>
            )}
          </div>
          
          {/* Slide Content */}
          <div className={cn(
            "h-[calc(100%-120px)] overflow-y-auto", // Calculate available space minus header
            currentSlideData.animation === 'fade' && "animate-fade-in",
            currentSlideData.animation === 'slide' && "animate-slide-in-right",
            currentSlideData.animation === 'zoom' && "animate-scale-in",
            currentSlideData.animation === 'flip' && "animate-scale-in"
          )}>
            {currentSlideData.content}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center p-4 border-t bg-card/50 backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {/* Slide Indicators */}
        <div className="flex gap-2 overflow-x-auto max-w-md">
          {presentationSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0",
                index === currentSlide
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === presentationSlides.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};