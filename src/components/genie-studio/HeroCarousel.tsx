/**
 * HeroCarousel Component - Extracted from GenieStudio.tsx
 * Displays the rotating hero slides for Genie products
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Calendar, 
  Cpu, 
  Zap, 
  Video, 
  Users, 
  Mail,
  FileText,
  Mic,
  Music,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import Genie logos
import genieStudioLogo from '@/assets/logos/genie-studio-banner.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';

interface HeroCarouselProps {
  onOpenCreateShowDialog: () => void;
  onNavigateToVibe: () => void;
}

export function HeroCarousel({ onOpenCreateShowDialog, onNavigateToVibe }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const TOTAL_SLIDES = 5;
  
  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev === TOTAL_SLIDES - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);
  
  // Pause carousel on user interaction, resume after 10 seconds
  const handleInteraction = useCallback((slideIndex?: number) => {
    setIsPaused(true);
    if (slideIndex !== undefined) {
      setCurrentSlide(slideIndex);
    }
    // Resume auto-scroll after 10 seconds of inactivity
    const resumeTimer = setTimeout(() => {
      setIsPaused(false);
    }, 10000);
    return () => clearTimeout(resumeTimer);
  }, []);
  
  const goToSlide = (index: number) => {
    handleInteraction(index);
  };
  
  const goToPrev = () => {
    handleInteraction();
    setCurrentSlide(prev => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1));
  };
  
  const goToNext = () => {
    handleInteraction();
    setCurrentSlide(prev => (prev === TOTAL_SLIDES - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative border-b border-border/50">
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Slide 1: Genie Suite - The Complete Suite */}
          <div className="min-w-full relative h-[480px] md:h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-800" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
            <div className="relative h-full max-w-7xl mx-auto px-8 py-12 flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm text-white font-medium">AI-Powered Production Suite</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                    Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">Studio</span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/90 font-light">
                    Mind to Media — Complete Content Creation Suite
                  </p>
                  <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                    Your all-in-one AI production studio. Orchestrate the entire creative journey from initial concept to published content.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Calendar className="h-4 w-4 text-indigo-300" />
                      <span className="text-sm text-white">Arc</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Cpu className="h-4 w-4 text-purple-300" />
                      <span className="text-sm text-white">Mind</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Zap className="h-4 w-4 text-amber-300" />
                      <span className="text-sm text-white">Spark</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Video className="h-4 w-4 text-pink-300" />
                      <span className="text-sm text-white">Vibe</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl" />
                    <div className="relative h-64 w-80 md:h-72 md:w-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl">
                      <img src={genieStudioLogo} alt="Genie Suite" className="h-full w-full object-contain drop-shadow-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Genie Hub - Team Coordination */}
          <div className="min-w-full relative h-[480px] md:h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(129,140,248,0.3),transparent_60%)]" />
            <div className="relative h-full max-w-7xl mx-auto px-8 py-12 flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                    <Calendar className="h-4 w-4 text-indigo-300" />
                    <span className="text-sm text-white font-medium">Team Coordination Hub</span>
                    <Badge className="bg-indigo-400/20 text-indigo-200 border-indigo-300/30 text-xs">Optional</Badge>
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                    Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Hub</span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/90 font-light">
                    Your Creative Command Center — Plan, Coordinate, Execute
                  </p>
                  <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                    <strong className="text-white/90">Optional for solo creators.</strong> The Hub is your command center for multi-person productions.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Calendar className="h-4 w-4 text-indigo-300" />
                      <span className="text-sm text-white">Show Scheduling</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Users className="h-4 w-4 text-purple-300" />
                      <span className="text-sm text-white">Guest Management</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Mail className="h-4 w-4 text-blue-300" />
                      <span className="text-sm text-white">Auto Invitations</span>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={onOpenCreateShowDialog}
                    className="mt-4 bg-white text-indigo-700 hover:bg-white/90 shadow-xl font-semibold px-8"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Open Genie Hub
                  </Button>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl" />
                    <div 
                      className="relative h-64 w-80 md:h-72 md:w-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                      onClick={onOpenCreateShowDialog}
                    >
                      <img src={genieArcLogo} alt="Genie Hub" className="h-full w-full object-contain drop-shadow-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Genie Mind - Pre-Production Command Center */}
          <div className="min-w-full relative h-[480px] md:h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.3),transparent_60%)]" />
            <div className="relative h-full max-w-7xl mx-auto px-8 py-12 flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                    <Cpu className="h-4 w-4 text-purple-300" />
                    <span className="text-sm text-white font-medium">Pre-Production Intelligence</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs ml-2">Active</Badge>
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                    Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Mind</span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/90 font-light">
                    AI That Understands — Your Creative Command Center
                  </p>
                  <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                    The brain of your production workflow. Write and enhance scripts with AI assistance, generate ultra-realistic voiceovers.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <FileText className="h-4 w-4 text-purple-300" />
                      <span className="text-sm text-white">AI Script Writing</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Mic className="h-4 w-4 text-pink-300" />
                      <span className="text-sm text-white">50+ AI Voices</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                      <Music className="h-4 w-4 text-violet-300" />
                      <span className="text-sm text-white">Music Generation</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl" />
                    <div className="relative h-64 w-80 md:h-72 md:w-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl">
                      <img src={genieMindLogo} alt="Genie Mind" className="h-full w-full object-contain drop-shadow-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4: Genie Spark - Content Transformation Engine */}
          <div className="min-w-full relative h-[480px] md:h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.3),transparent_60%)]" />
            <div className="relative h-full max-w-7xl mx-auto px-8 py-12 flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span className="text-sm text-white font-medium">AI Content Transformation Engine</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                    Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">Spark</span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/90 font-light">
                    Ignite Your Ideas — Transform Any Content into Scripts
                  </p>
                  <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                    Transform documents, URLs, images, audio, and video into production-ready scripts. AI-powered content pipeline.
                  </p>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-3xl blur-2xl" />
                    <div className="relative h-64 w-80 md:h-72 md:w-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl">
                      <img src={genieSparkLogo} alt="Genie Spark" className="h-full w-full object-contain drop-shadow-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: Genie Vibe - Recording Experience */}
          <div className="min-w-full relative h-[480px] md:h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900 via-rose-800 to-red-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.3),transparent_60%)]" />
            <div className="relative h-full max-w-7xl mx-auto px-8 py-12 flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                    <Video className="h-4 w-4 text-pink-300" />
                    <span className="text-sm text-white font-medium">Recording Experience</span>
                    <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs ml-2">Live</Badge>
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                    Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300">Vibe</span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/90 font-light">
                    Lights, Camera, Action — Record with Confidence
                  </p>
                  <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                    Professional recording studio with AI teleprompter. Record camera, screen, or both with synchronized scripts.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={onNavigateToVibe}
                    className="mt-4 bg-white text-pink-700 hover:bg-white/90 shadow-xl font-semibold px-8"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Open Genie Vibe
                  </Button>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/30 to-rose-500/30 rounded-3xl blur-2xl" />
                    <div 
                      className="relative h-64 w-80 md:h-72 md:w-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                      onClick={onNavigateToVibe}
                    >
                      <img src={genieVibeLogo} alt="Genie Vibe" className="h-full w-full object-contain drop-shadow-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
          onClick={goToPrev}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
          onClick={goToNext}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                currentSlide === i 
                  ? "bg-white w-8" 
                  : "bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
