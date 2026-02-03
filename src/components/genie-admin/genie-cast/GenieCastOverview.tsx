/**
 * GENIE CAST OVERVIEW - COMPACT STUDIO HEADER
 * 
 * Clean, focused overview with:
 * - Multi-select style dropdown at the top
 * - AI provider marquee
 * - Quick action cards
 * - No metrics, no demo videos, no non-functional buttons
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Camera, 
  Zap, 
  Grid3X3,
  Film,
  ChevronDown,
  Check,
  Palette,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AIProviderShowcase } from './AIProviderShowcase';
import type { VideoStyleType } from './VideoStyleCards';

// Style definitions with categories
interface VideoStyle {
  id: VideoStyleType;
  title: string;
  category: string;
}

const VIDEO_STYLES: VideoStyle[] = [
  // STORYTELLING
  { id: 'smart_storytelling', title: 'Smart Storytelling', category: 'Storytelling' },
  { id: 'hook_videos', title: 'Hook Videos', category: 'Storytelling' },
  { id: 'micro_drama', title: 'Micro-Drama', category: 'Storytelling' },
  // AVATAR
  { id: 'ugc_avatar_photorealistic', title: 'Photorealistic Avatar', category: 'Avatar' },
  { id: 'ugc_avatar_3d_pixar', title: '3D Pixar Style', category: 'Avatar' },
  { id: 'ugc_avatar_2d_animated', title: '2D Animated', category: 'Avatar' },
  { id: 'talking_photos', title: 'Talking Photos', category: 'Avatar' },
  // ANIMATION
  { id: 'anime', title: 'Anime Style', category: 'Animation' },
  { id: 'image_to_life', title: 'Image to Life', category: 'Animation' },
  { id: 'explainer_3d', title: '3D Explainer', category: 'Animation' },
  // INTERACTIVE
  { id: 'educational', title: 'Educational', category: 'Interactive' },
  { id: 'interactive_quiz', title: 'Quiz Overlay', category: 'Interactive' },
  { id: 'cta_videos', title: 'CTA Videos', category: 'Interactive' },
  // MARKETING
  { id: 'social', title: 'Social Media', category: 'Marketing' },
  { id: 'video_ads', title: 'Video Ads', category: 'Marketing' },
  { id: 'product_demo', title: 'Product Demo', category: 'Marketing' },
];

const CATEGORIES = ['Storytelling', 'Avatar', 'Animation', 'Interactive', 'Marketing'];

interface GenieCastOverviewProps {
  selectedStyles: VideoStyleType[];
  onStylesChange: (styles: VideoStyleType[]) => void;
  onNavigate: (tab: string) => void;
  className?: string;
}

export const GenieCastOverview: React.FC<GenieCastOverviewProps> = ({
  selectedStyles,
  onStylesChange,
  onNavigate,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleStyle = (styleId: VideoStyleType) => {
    if (selectedStyles.includes(styleId)) {
      onStylesChange(selectedStyles.filter(s => s !== styleId));
    } else {
      onStylesChange([...selectedStyles, styleId]);
    }
  };

  const removeStyle = (styleId: VideoStyleType) => {
    onStylesChange(selectedStyles.filter(s => s !== styleId));
  };

  const clearAll = () => {
    onStylesChange([]);
  };

  const getStyleTitle = (id: VideoStyleType) => {
    return VIDEO_STYLES.find(s => s.id === id)?.title || id;
  };

  // Group styles by category
  const groupedStyles = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = VIDEO_STYLES.filter(s => s.category === cat);
    return acc;
  }, {} as Record<string, VideoStyle[]>);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Title and Style Selector */}
      <div className="flex flex-col gap-3">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Genie Cast</h2>
              <p className="text-xs text-muted-foreground">AI Video Production Studio</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            30 AI Models
          </Badge>
        </div>

        {/* Style Selector - Multi-select Dropdown */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Video Styles</span>
            {selectedStyles.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {selectedStyles.length} selected
              </Badge>
            )}
          </div>
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className="w-full justify-between h-auto min-h-[40px] py-2"
              >
                <div className="flex flex-wrap gap-1 flex-1 text-left">
                  {selectedStyles.length === 0 ? (
                    <span className="text-muted-foreground text-sm">Select styles to combine...</span>
                  ) : (
                    selectedStyles.slice(0, 3).map(styleId => (
                      <Badge 
                        key={styleId} 
                        variant="secondary"
                        className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStyle(styleId);
                        }}
                      >
                        {getStyleTitle(styleId)}
                        <X className="w-3 h-3" />
                      </Badge>
                    ))
                  )}
                  {selectedStyles.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedStyles.length - 3} more
                    </Badge>
                  )}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="text-sm font-medium">Select Video Styles</span>
                {selectedStyles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-3">
                  {CATEGORIES.map(category => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="space-y-0.5">
                        {groupedStyles[category].map(style => {
                          const isSelected = selectedStyles.includes(style.id);
                          return (
                            <button
                              key={style.id}
                              onClick={() => toggleStyle(style.id)}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                                isSelected 
                                  ? "bg-primary/10 text-primary" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <span>{style.title}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* AI Provider Showcase - Compact */}
      <AIProviderShowcase />

      {/* Quick Action Cards - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card 
            className="border-border/50 hover:border-primary/40 transition-colors cursor-pointer group h-full"
            onClick={() => onNavigate('screenshots')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">Upload Screenshots</h4>
                <p className="text-xs text-muted-foreground truncate">Add product visuals</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card 
            className="border-border/50 hover:border-green-500/40 transition-colors cursor-pointer group h-full"
            onClick={() => onNavigate('generate')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">Quick Generate</h4>
                <p className="text-xs text-muted-foreground truncate">Create video in minutes</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="border-border/50 hover:border-violet-500/40 transition-colors cursor-pointer group h-full"
            onClick={() => onNavigate('matrix')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Grid3X3 className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">Batch Matrix</h4>
                <p className="text-xs text-muted-foreground truncate">All languages at once</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GenieCastOverview;
