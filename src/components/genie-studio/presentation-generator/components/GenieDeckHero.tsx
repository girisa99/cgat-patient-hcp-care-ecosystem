/**
 * Genie Deck Hero Section
 * Engaging hero with highlight banners explaining industry challenges and solutions
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Presentation,
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
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  Wand2,
  ArrowRight,
  Target,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GenieDeckHeroProps {
  onGetStarted?: () => void;
  className?: string;
}

// Industry challenges data
const INDUSTRY_CHALLENGES = [
  { icon: Clock, text: 'Hours spent on manual slide design', stat: '8+ hrs/deck' },
  { icon: DollarSign, text: 'High agency costs for quality decks', stat: '$500-5K' },
  { icon: Globe, text: 'Translation delays for global teams', stat: '3-5 days' },
  { icon: Users, text: 'Inconsistent branding across teams', stat: '67% struggle' },
];

// What users asked for
const USER_REQUESTS = [
  'One-click professional presentations',
  'Auto-translation to 70+ languages',
  'Brand-consistent templates',
  'AI voiceover generation',
  'Consulting-grade frameworks',
  'Video export with narration',
];

// Genie Deck solutions
const GENIE_SOLUTIONS = [
  { 
    icon: Brain, 
    title: 'AI-Powered Generation', 
    description: 'Transform ideas into polished decks in minutes, not hours',
    highlight: '10x Faster',
  },
  { 
    icon: Languages, 
    title: 'Multi-Language Magic', 
    description: 'Generate in 70+ languages with native-quality translations',
    highlight: '70+ Languages',
  },
  { 
    icon: Palette, 
    title: 'Brand Intelligence', 
    description: 'Auto-extract colors from logos, maintain consistency everywhere',
    highlight: 'Brand Safe',
  },
  { 
    icon: Video, 
    title: 'Video & Voice', 
    description: 'Export as video with AI voiceovers and background music',
    highlight: '4K Export',
  },
];

// Feature highlights for rotating banner
interface HighlightItem {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  badge?: string;
}

const FEATURE_HIGHLIGHTS: Array<{
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  gradient: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  items: HighlightItem[];
}> = [
  {
    id: 'challenge',
    icon: Target,
    title: 'The Industry Challenge',
    subtitle: 'What organizations struggle with',
    gradient: 'from-destructive/20 to-warning/20',
    borderColor: 'border-destructive/30',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    items: INDUSTRY_CHALLENGES.map(c => ({ icon: c.icon, text: c.text, badge: c.stat })),
  },
  {
    id: 'users',
    icon: Users,
    title: 'What Users Asked For',
    subtitle: 'Top requested features',
    gradient: 'from-primary/20 to-accent/20',
    borderColor: 'border-primary/30',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    items: USER_REQUESTS.map(r => ({ icon: CheckCircle2, text: r, badge: undefined })),
  },
  {
    id: 'solution',
    icon: Sparkles,
    title: 'Genie Deck Delivers',
    subtitle: 'AI-powered presentation revolution',
    gradient: 'from-primary/20 to-secondary/20',
    borderColor: 'border-primary/30',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    items: GENIE_SOLUTIONS.map(s => ({ icon: s.icon, text: s.title, badge: s.highlight })),
  },
  {
    id: 'stats',
    icon: BarChart3,
    title: 'By The Numbers',
    subtitle: 'Results that speak',
    gradient: 'from-success/20 to-accent/20',
    borderColor: 'border-success/30',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    items: [
      { icon: TrendingUp, text: 'Time saved per presentation', badge: '87%' },
      { icon: Globe, text: 'Languages supported', badge: '70+' },
      { icon: Layers, text: 'Templates & frameworks', badge: '40+' },
      { icon: Shield, text: 'Enterprise security', badge: 'HIPAA' },
    ],
  },
];

export function GenieDeckHero({ onGetStarted, className }: GenieDeckHeroProps) {
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate highlights
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveHighlight(prev => (prev + 1) % FEATURE_HIGHLIGHTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentHighlight = FEATURE_HIGHLIGHTS[activeHighlight];

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-background to-violet-950/20 pointer-events-none" />
      
      {/* Animated orbs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative container py-8 space-y-6">
        {/* Main Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Enterprise Ready
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Transform Ideas into Impact
            </span>
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Create stunning, multi-language presentations in minutes with AI. 
            No design skills needed. Just your ideas.
          </p>

          {onGetStarted && (
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 gap-2 shadow-lg shadow-purple-500/25"
            >
              <Wand2 className="h-5 w-5" />
              Start Creating
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Feature Highlight Banners */}
        <div className="space-y-4">
          {/* Navigation Dots */}
          <div className="flex items-center justify-center gap-2">
            {FEATURE_HIGHLIGHTS.map((highlight, idx) => (
              <button
                key={highlight.id}
                onClick={() => setActiveHighlight(idx)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
                  idx === activeHighlight
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground"
                )}
              >
                <highlight.icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium hidden sm:inline">{highlight.title}</span>
              </button>
            ))}
          </div>

          {/* Active Highlight Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHighlight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={cn(
                "border-2 bg-gradient-to-r overflow-hidden",
                currentHighlight.gradient,
                currentHighlight.borderColor
              )}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Header */}
                    <div className="flex-shrink-0 space-y-2">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        currentHighlight.iconBg
                      )}>
                        <currentHighlight.icon className={cn("h-6 w-6", currentHighlight.iconColor)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{currentHighlight.title}</h3>
                        <p className="text-sm text-muted-foreground">{currentHighlight.subtitle}</p>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentHighlight.items.map((item, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50"
                        >
                          <item.icon className={cn("h-4 w-4 flex-shrink-0", currentHighlight.iconColor)} />
                          <span className="text-sm flex-1">{item.text}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs font-mono">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex justify-center">
            <div className="flex gap-1">
              {FEATURE_HIGHLIGHTS.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    idx === activeHighlight ? "w-8 bg-primary" : "w-2 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Generate in</span>
            <span className="font-semibold">~2 minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">70+ languages</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Layers className="h-4 w-4 text-purple-500" />
            <span className="font-semibold">50+ AI models</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-pink-500" />
            <span className="font-semibold">4K video export</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenieDeckHero;
