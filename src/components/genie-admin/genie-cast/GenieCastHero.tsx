/**
 * GENIE CAST HERO SECTION
 * 
 * Rich hero component for the video production studio:
 * - Gradient backgrounds with glass morphism
 * - Real-time stats display
 * - Video showcase carousel
 * - Trust indicators and social proof
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Sparkles, 
  Globe, 
  Video, 
  Users, 
  Clock,
  Star,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GenieCastHeroProps {
  onGetStarted: () => void;
  onWatchDemo?: () => void;
  totalVideos?: number;
  totalLanguages?: number;
  className?: string;
}

const SAMPLE_THUMBNAILS = [
  { id: 1, title: 'EP01 — Launch', gradient: 'from-amber-500 to-orange-600' },
  { id: 2, title: 'EP02 — Product', gradient: 'from-slate-700 to-slate-900' },
  { id: 3, title: 'EP03 — Scale', gradient: 'from-red-600 to-rose-800' },
  { id: 4, title: 'EP04 — Global', gradient: 'from-orange-700 to-amber-900' },
];

export const GenieCastHero: React.FC<GenieCastHeroProps> = ({
  onGetStarted,
  onWatchDemo,
  totalVideos = 100,
  totalLanguages = 50,
  className,
}) => {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl" />
      
      {/* Content - Reduced padding for compact layout */}
      <div className="relative z-10 px-4 py-6 lg:px-8 lg:py-8">
        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 mb-6">
           <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/20 px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
            <span className="text-xs font-medium">Dogfooded Daily</span>
          </Badge>
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-green-500/30 px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-green-500" />
            <span className="text-xs font-medium">Universal Enrichment</span>
          </Badge>
        </div>

        {/* Headline - Compact spacing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-5"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Make It. Show It.{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Scale It.
            </span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            We use our own tools to market our products — now use them to market yours. Universal Enrichment powers every asset across 14 regions × 6+ platforms.
          </p>
        </motion.div>

        {/* CTA Buttons - Compact spacing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="gap-2 px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
          >
            <Zap className="w-4 h-4" />
            Get Started
          </Button>
          {onWatchDemo && (
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onWatchDemo}
              className="gap-2 px-6 bg-background/80 backdrop-blur-sm"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          )}
        </motion.div>

        {/* Video Showcase Carousel - Compact */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar"
        >
          {SAMPLE_THUMBNAILS.map((thumb, index) => (
            <motion.div
              key={thumb.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className={cn(
                "relative flex-shrink-0 w-[180px] md:w-[220px] aspect-video rounded-xl overflow-hidden cursor-pointer group",
                "bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                thumb.gradient
              )}
            >
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-slate-900 ml-0.5" />
                </div>
              </div>
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-semibold">{thumb.title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-8 md:gap-12 flex-wrap"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-2xl md:text-3xl font-bold">14</span>
            </div>
            <p className="text-xs text-muted-foreground">Regions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-2xl md:text-3xl font-bold">40+</span>
            </div>
            <p className="text-xs text-muted-foreground">Sub-Regions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Video className="w-4 h-4 text-green-500" />
              <span className="text-2xl md:text-3xl font-bold">6+</span>
            </div>
            <p className="text-xs text-muted-foreground">Platforms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-2xl md:text-3xl font-bold">5</span>
            </div>
            <p className="text-xs text-muted-foreground">Enrichment Layers</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GenieCastHero;
