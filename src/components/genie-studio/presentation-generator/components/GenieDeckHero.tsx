/**
 * Genie Deck Hero Section
 * Premium hero with Genie Studio-style deep gradients and glassmorphism
 * Features: Industry challenges, User requests, AI models, Publishing, Stats
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Zap,
  Globe,
  Clock,
  DollarSign,
  Users,
  Palette,
  Brain,
  Languages,
  Video,
  CheckCircle2,
  TrendingUp,
  Layers,
  Wand2,
  ArrowRight,
  Target,
  Shield,
  Share2,
  Linkedin,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Mic2,
  Image,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

interface GenieDeckHeroProps {
  onGetStarted?: () => void;
  className?: string;
}

// Slide definitions with unique visual themes
const HERO_SLIDES = [
  {
    id: 'challenge',
    title: 'The Industry Challenge',
    subtitle: 'What organizations struggle with today',
    gradient: 'from-rose-900 via-red-800 to-orange-900',
    accentColor: 'text-rose-300',
    badgeClass: 'bg-rose-500/20 border-rose-400/30 text-rose-200',
    items: [
      { icon: Clock, text: 'Hours spent on manual slide design', stat: '8+ hrs/deck' },
      { icon: DollarSign, text: 'High agency costs for quality decks', stat: '$500-5K' },
      { icon: Globe, text: 'Translation delays for global teams', stat: '3-5 days' },
      { icon: Users, text: 'Inconsistent branding across teams', stat: '67%' },
    ],
  },
  {
    id: 'users',
    title: 'What Users Asked For',
    subtitle: 'Top requested features from enterprise teams',
    gradient: 'from-blue-900 via-indigo-800 to-purple-900',
    accentColor: 'text-blue-300',
    badgeClass: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
    items: [
      { icon: Wand2, text: 'One-click professional presentations', stat: null },
      { icon: Languages, text: 'Auto-translation to 70+ languages', stat: null },
      { icon: Palette, text: 'Brand-consistent templates', stat: null },
      { icon: Mic2, text: 'AI voiceover with voice cloning', stat: null },
      { icon: Video, text: '4K video export with narration', stat: null },
      { icon: Share2, text: 'Direct publish to LinkedIn & YouTube', stat: null },
    ],
  },
  {
    id: 'models',
    title: 'Universal Media Connector',
    subtitle: '50+ AI models across all media types',
    gradient: 'from-purple-900 via-violet-800 to-fuchsia-900',
    accentColor: 'text-purple-300',
    badgeClass: 'bg-purple-500/20 border-purple-400/30 text-purple-200',
    items: [
      { icon: Brain, text: 'Gemini 3 Flash • GPT-5 • Claude Opus', stat: 'Text' },
      { icon: Image, text: 'Flux • DALL-E 3 • Midjourney • ModelsLab', stat: 'Image' },
      { icon: Video, text: 'Runway Gen-3 • Kling • Luma • Pika', stat: 'Video' },
      { icon: Mic2, text: 'ElevenLabs • Azure • OpenAI TTS', stat: 'Voice' },
      { icon: MessageSquare, text: 'DeepL • Qwen-MT • Google Translate', stat: 'Translation' },
      { icon: Cpu, text: 'Alibaba • Baidu • AWS • Google Cloud', stat: 'Enterprise' },
    ],
  },
  {
    id: 'publish',
    title: 'Publish Everywhere',
    subtitle: 'One-click distribution to major platforms',
    gradient: 'from-emerald-900 via-teal-800 to-cyan-900',
    accentColor: 'text-emerald-300',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
    items: [
      { icon: Linkedin, text: 'LinkedIn native video & carousel', stat: 'Live' },
      { icon: Youtube, text: 'YouTube with chapters & thumbnails', stat: 'Live' },
      { icon: Share2, text: 'Twitter/X video posts', stat: 'Coming' },
      { icon: Share2, text: 'Instagram Reels & Stories', stat: 'Coming' },
      { icon: Share2, text: 'TikTok short-form content', stat: 'Coming' },
      { icon: Share2, text: 'Vimeo & custom embed', stat: 'Coming' },
    ],
  },
  {
    id: 'stats',
    title: 'Performance Metrics',
    subtitle: 'Real results from enterprise deployments',
    gradient: 'from-amber-900 via-orange-800 to-yellow-900',
    accentColor: 'text-amber-300',
    badgeClass: 'bg-amber-500/20 border-amber-400/30 text-amber-200',
    items: [
      { icon: TrendingUp, text: 'Time saved per presentation', stat: '92%' },
      { icon: Globe, text: 'Languages supported natively', stat: '100+' },
      { icon: Cpu, text: 'AI models integrated', stat: '100+' },
      { icon: Video, text: 'Maximum video export quality', stat: '4K HDR' },
      { icon: Zap, text: 'Average generation time', stat: '~90s' },
      { icon: Shield, text: 'Enterprise compliance', stat: 'SOC2' },
    ],
  },
];

export function GenieDeckHero({ onGetStarted, className }: GenieDeckHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setIsPaused(true);
    setCurrentSlide(index);
    // Resume after 10s
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToPrev = () => {
    setIsPaused(true);
    setCurrentSlide(prev => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToNext = () => {
    setIsPaused(true);
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className={cn("relative overflow-hidden border-b border-border/50", className)}>
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slideData, index) => (
            <div key={slideData.id} className="min-w-full relative h-[280px] md:h-[320px]">
              {/* Deep gradient background */}
              <div className={cn("absolute inset-0 bg-gradient-to-br", slideData.gradient)} />
              
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
              
              {/* Radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center w-full">
                  {/* Left: Text Content */}
                  <div className="space-y-3">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20")}>
                      <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                      <span className="text-xs text-white font-medium">AI-Powered Presentations</span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                      {slideData.title}
                    </h1>
                    
                    <p className={cn("text-sm md:text-base font-light", slideData.accentColor)}>
                      {slideData.subtitle}
                    </p>

                    {/* Items Grid - Compact */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                      {slideData.items.slice(0, 6).map((item, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/10"
                        >
                          <item.icon className={cn("h-3.5 w-3.5 flex-shrink-0", slideData.accentColor)} />
                          <span className="text-[11px] text-white/90 flex-1 truncate">{item.text}</span>
                          {item.stat && (
                            <Badge className={cn("text-[9px] font-mono shrink-0 px-1 py-0", slideData.badgeClass)}>
                              {item.stat}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {onGetStarted && index === 0 && (
                      <Button
                        size="lg" 
                        onClick={onGetStarted}
                        className="gap-2 bg-white text-gray-900 hover:bg-white/90 shadow-lg"
                      >
                        <Wand2 className="h-5 w-5" />
                        Start Creating
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Right: Logo with Tagline */}
                  <div className="hidden lg:flex justify-center lg:justify-end">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur-2xl" />
                      <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center p-6 shadow-2xl">
                        <img 
                          src={genieDeckLogo} 
                          alt="Genie Deck" 
                          className="h-40 w-auto object-contain drop-shadow-2xl" 
                        />
                        <div className="mt-4 text-center">
                          <h2 className="text-2xl font-bold text-white tracking-tight">Genie Deck</h2>
                          <p className="text-lg text-white/80 font-light mt-1">Ideas to Impact</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition-colors z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition-colors z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => goToSlide(idx)}
            className={cn(
              "transition-all duration-300 rounded-full",
              idx === currentSlide 
                ? "w-8 h-2 bg-white" 
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${idx + 1}: ${s.title}`}
          />
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="relative bg-background/95 backdrop-blur-sm border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Generate in</span>
            <span className="font-semibold">~2 min</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">70+ languages</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Cpu className="h-4 w-4 text-purple-500" />
            <span className="font-semibold">50+ AI models</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-pink-500" />
            <span className="font-semibold">4K export</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Linkedin className="h-4 w-4 text-blue-600" />
            <Youtube className="h-4 w-4 text-red-500" />
            <span className="font-semibold">Direct publish</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenieDeckHero;
