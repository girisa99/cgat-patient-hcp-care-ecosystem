import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { presentationSlides } from '@/data/presentation-slides';
import './PresentationStyles.css';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

export const AgenticAIPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      "relative bg-gradient-to-br from-background via-background to-muted/30",
      isFullscreen ? "fixed inset-0 z-50" : "w-full max-w-7xl mx-auto rounded-xl shadow-2xl border"
    )}>
      {/* Enhanced Header Controls */}
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Treatment Center AI Implementation
              </h1>
              <p className="text-sm text-muted-foreground">Interactive Presentation</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            {currentSlide + 1} of {presentationSlides.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={isAutoplay ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className={cn(
              "flex items-center gap-2 transition-all",
              isAutoplay && "bg-primary text-primary-foreground shadow-lg"
            )}
          >
            {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoplay ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetPresentation}
            className="flex items-center gap-2 hover:bg-muted/50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2 hover:bg-muted/50"
          >
            <Maximize2 className="w-4 h-4" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <div className="flex items-center gap-2 ml-4">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Live Interactive Mode</span>
          </div>
        </div>
      </div>

      {/* Enhanced Main Slide Area */}
      <div className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-br from-background via-muted/10 to-background",
        "border-x border-border/50",
        isFullscreen ? "h-[calc(100vh-160px)]" : "h-[700px]"
      )}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-20 w-24 h-24 bg-primary/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full animate-pulse"></div>
        </div>
        
        <div 
          className="relative w-full h-full p-8 z-10"
          data-slide-content
          data-slide-id={currentSlide}
          key={currentSlide}
        >
          {/* Enhanced Slide Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Interactive Presentation</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-3 leading-tight">
              {currentSlideData.title}
            </h2>
            {currentSlideData.subtitle && (
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {currentSlideData.subtitle}
              </p>
            )}
          </div>
          
          {/* Enhanced Slide Content */}
          <div className={cn(
            "h-[calc(100%-160px)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
            "bg-gradient-to-b from-transparent via-background/50 to-transparent",
            "rounded-xl p-6",
            currentSlideData.animation === 'fade' && "animate-fade-in",
            currentSlideData.animation === 'slide' && "animate-slide-in-right",
            currentSlideData.animation === 'zoom' && "animate-scale-in",
            currentSlideData.animation === 'flip' && "animate-scale-in"
          )}>
            {currentSlideData.content}
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="flex justify-between items-center p-6 border-t bg-gradient-to-r from-muted/20 via-background to-muted/20 backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={cn(
            "flex items-center gap-2 transition-all",
            currentSlide === 0 ? "opacity-50" : "hover:bg-primary/10 hover:border-primary/30"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {/* Enhanced Slide Indicators */}
        <div className="flex gap-3 overflow-x-auto max-w-md px-4 py-2 bg-muted/30 rounded-full">
          {presentationSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300 flex-shrink-0 border-2",
                index === currentSlide
                  ? "bg-primary border-primary shadow-lg shadow-primary/50 scale-125"
                  : "bg-muted border-muted-foreground/30 hover:bg-muted-foreground/50 hover:border-primary/50 hover:scale-110"
              )}
              title={`Slide ${index + 1}: ${presentationSlides[index]?.title || 'Slide'}`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === presentationSlides.length - 1}
          className={cn(
            "flex items-center gap-2 transition-all",
            currentSlide === presentationSlides.length - 1 ? "opacity-50" : "hover:bg-primary/10 hover:border-primary/30"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};