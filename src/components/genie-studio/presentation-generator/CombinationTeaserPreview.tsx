/**
 * Combination Teaser Preview Component
 * 
 * PURPOSE: Show watermarked previews of premium combination features
 * - Displays 30-60 second previews with watermark overlay
 * - Like/Dislike/Interested feedback buttons
 * - Connects to Label Studio for AI learning
 * - Smart dismissal and "remind me later" options
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Clock, 
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronRight,
  Star,
  Layers,
  User,
  Box,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  useCombinationTeaser, 
  type TeaserPreview, 
  type CombinationType,
  type TeaserEngagement 
} from '@/services/combinationTeaserService';

// ============================================
// TYPES
// ============================================

interface CombinationTeaserPreviewProps {
  teaser: TeaserPreview;
  generationNumber: number;
  context?: {
    industry?: string;
    contentType?: string;
    slideNumber?: number;
  };
  onDismiss: () => void;
  onInterested: () => void;
  className?: string;
}

interface TeaserFeedbackPanelProps {
  teaser: TeaserPreview;
  onFeedback: (action: TeaserEngagement['action']) => void;
  isCompact?: boolean;
}

// ============================================
// ICON MAPPING
// ============================================

const COMBINATION_ICONS: Record<CombinationType, React.ElementType> = {
  animated_slides: Layers,
  avatar_narrator: User,
  '3d_elements': Box,
  immersive_journey: Sparkles,
  kinetic_typography: Wand2,
  data_visualization: Zap,
  talking_photo: User,
  full_body_avatar: User
};

// ============================================
// MAIN COMPONENT
// ============================================

export function CombinationTeaserPreview({
  teaser,
  generationNumber,
  context,
  onDismiss,
  onInterested,
  className
}: CombinationTeaserPreviewProps) {
  const { recordEngagement } = useCombinationTeaser();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const Icon = COMBINATION_ICONS[teaser.combinationType] || Sparkles;

  // Simulate video progress
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + (100 / (teaser.durationSeconds * 10));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, teaser.durationSeconds]);

  const handleFeedback = (action: TeaserEngagement['action']) => {
    setHasInteracted(true);
    
    const engagement: TeaserEngagement = {
      teaserId: teaser.id,
      combinationType: teaser.combinationType,
      action,
      timestamp: new Date().toISOString(),
      generationNumber,
      context: context || {}
    };

    recordEngagement(engagement);

    if (action === 'interested' || action === 'like') {
      onInterested();
    } else {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn(
          "fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]",
          className
        )}
      >
        <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl bg-card">
          {/* Video Preview Area */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
            {/* Placeholder for actual video - shows animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse" />
            
            {/* Teaser Visual Representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-primary/40"
              >
                <Icon className="h-20 w-20" />
              </motion.div>
            </div>

            {/* Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.03)_20px,rgba(255,255,255,0.03)_40px)]" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <p className="text-xs text-foreground/40 font-medium tracking-wider uppercase">
                  {teaser.watermarkText}
                </p>
              </motion.div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-background/50 hover:bg-background/80"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1 h-1 bg-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-background/50 hover:bg-background/80"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 bg-background/50 hover:bg-background/80"
              onClick={() => handleFeedback('skip')}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Tier Badge */}
            <Badge 
              className="absolute top-2 left-2 capitalize"
              variant={teaser.tier === 'business' ? 'default' : 'secondary'}
            >
              <Star className="h-3 w-3 mr-1" />
              {teaser.tier}
            </Badge>
          </div>

          {/* Content Area */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                {teaser.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {teaser.description}
              </p>
            </div>

            {/* Duration & Credits */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {teaser.durationSeconds}s preview
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {teaser.creditCost} credits
              </span>
            </div>

            {/* Feedback Buttons */}
            <TeaserFeedbackPanel 
              teaser={teaser} 
              onFeedback={handleFeedback} 
            />
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// FEEDBACK PANEL
// ============================================

function TeaserFeedbackPanel({ 
  teaser, 
  onFeedback,
  isCompact = false 
}: TeaserFeedbackPanelProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => onFeedback('like')}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => onFeedback('dislike')}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Primary CTA */}
      <Button
        className="w-full"
        onClick={() => onFeedback('interested')}
        onMouseEnter={() => setHoveredAction('interested')}
        onMouseLeave={() => setHoveredAction(null)}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        I'm Interested
        <ChevronRight className="h-4 w-4 ml-auto" />
      </Button>

      {/* Secondary Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onFeedback('not_now')}
        >
          <Clock className="h-4 w-4 mr-1" />
          Maybe Later
        </Button>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8",
              hoveredAction === 'like' && "text-primary"
            )}
            onClick={() => onFeedback('like')}
            onMouseEnter={() => setHoveredAction('like')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8",
              hoveredAction === 'dislike' && "text-destructive"
            )}
            onClick={() => onFeedback('dislike')}
            onMouseEnter={() => setHoveredAction('dislike')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-[10px] text-center text-muted-foreground">
        Your feedback helps us show you relevant features
      </p>
    </div>
  );
}

// ============================================
// INLINE TEASER CARD (For use within slides)
// ============================================

interface InlineTeaserCardProps {
  combinationType: CombinationType;
  slideNumber?: number;
  onTryIt: () => void;
  onDismiss: () => void;
  className?: string;
}

export function InlineTeaserCard({
  combinationType,
  slideNumber,
  onTryIt,
  onDismiss,
  className
}: InlineTeaserCardProps) {
  const { TEASER_CATALOG, recordEngagement } = useCombinationTeaser();
  const teaser = TEASER_CATALOG[combinationType];
  
  if (!teaser) return null;

  const Icon = COMBINATION_ICONS[combinationType] || Sparkles;

  const handleAction = (action: TeaserEngagement['action']) => {
    recordEngagement({
      teaserId: teaser.id,
      combinationType,
      action,
      timestamp: new Date().toISOString(),
      generationNumber: 0,
      context: { slideNumber }
    });

    if (action === 'interested') {
      onTryIt();
    } else {
      onDismiss();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative p-3 rounded-lg border border-dashed border-primary/30",
        "bg-gradient-to-r from-primary/5 to-secondary/5",
        className
      )}
    >
      {/* Dismiss */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 h-6 w-6"
        onClick={() => handleAction('skip')}
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">
            ✨ This slide could be even better!
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add {teaser.title.toLowerCase()} for more impact
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleAction('interested')}
            >
              Try It
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => handleAction('not_now')}
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// TEASER GALLERY (Show all available teasers)
// ============================================

interface TeaserGalleryProps {
  userTier: string;
  onSelectTeaser: (teaser: TeaserPreview) => void;
  className?: string;
}

export function TeaserGallery({
  userTier,
  onSelectTeaser,
  className
}: TeaserGalleryProps) {
  const { getTeasersForTier, getContextualRecommendations } = useCombinationTeaser();
  const availableTeasers = getTeasersForTier(userTier);
  const recommended = getContextualRecommendations({});

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Enhance Your Presentation</h3>
        <Badge variant="outline">
          {availableTeasers.length} upgrades available
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {availableTeasers.map((teaser) => {
          const Icon = COMBINATION_ICONS[teaser.combinationType] || Sparkles;
          const isRecommended = recommended.includes(teaser.combinationType);

          return (
            <Card
              key={teaser.id}
              className={cn(
                "p-3 cursor-pointer transition-all hover:border-primary/50",
                isRecommended && "ring-1 ring-primary/30"
              )}
              onClick={() => onSelectTeaser(teaser)}
            >
              {isRecommended && (
                <Badge className="absolute -top-2 -right-2 text-[10px]">
                  Recommended
                </Badge>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {teaser.tier}
                </Badge>
              </div>
              <h4 className="text-xs font-medium line-clamp-1">{teaser.title}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                {teaser.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                <Zap className="h-3 w-3" />
                {teaser.creditCost} credits
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CombinationTeaserPreview;
