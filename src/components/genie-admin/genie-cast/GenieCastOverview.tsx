/**
 * GENIE CAST OVERVIEW - COMPACT STUDIO HEADER
 * 
 * Clean, focused overview with:
 * - Multi-select style dropdown at the top
 * - AI provider chips (no marquee to prevent scroll)
 * - Compact quick action buttons
 */

import React, { useState } from 'react';
import { 
  Camera, 
  Zap, 
  Grid3X3,
  Film,
  ChevronDown,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { VideoStyleType } from './VideoStyleCards';

// Style definitions with categories
interface VideoStyle {
  id: VideoStyleType;
  title: string;
  category: string;
}

const VIDEO_STYLES: VideoStyle[] = [
  { id: 'smart_storytelling', title: 'Smart Storytelling', category: 'Storytelling' },
  { id: 'hook_videos', title: 'Hook Videos', category: 'Storytelling' },
  { id: 'micro_drama', title: 'Micro-Drama', category: 'Storytelling' },
  { id: 'ugc_avatar_photorealistic', title: 'Photorealistic Avatar', category: 'Avatar' },
  { id: 'ugc_avatar_3d_pixar', title: '3D Pixar Style', category: 'Avatar' },
  { id: 'ugc_avatar_2d_animated', title: '2D Animated', category: 'Avatar' },
  { id: 'talking_photos', title: 'Talking Photos', category: 'Avatar' },
  { id: 'anime', title: 'Anime Style', category: 'Animation' },
  { id: 'image_to_life', title: 'Image to Life', category: 'Animation' },
  { id: 'explainer_3d', title: '3D Explainer', category: 'Animation' },
  { id: 'educational', title: 'Educational', category: 'Interactive' },
  { id: 'interactive_quiz', title: 'Quiz Overlay', category: 'Interactive' },
  { id: 'cta_videos', title: 'CTA Videos', category: 'Interactive' },
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

  const groupedStyles = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = VIDEO_STYLES.filter(s => s.category === cat);
    return acc;
  }, {} as Record<string, VideoStyle[]>);

  return (
    <div className={cn("space-y-3 max-w-full overflow-hidden", className)}>
      {/* Compact Header Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Film className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-base font-semibold">Genie Cast</h2>
        </div>
        <Badge variant="secondary" className="text-[10px] h-5">30 AI Models</Badge>
      </div>

      {/* Style Selector - Compact */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Styles:</span>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
            >
              {selectedStyles.length === 0 ? (
                'Select styles...'
              ) : (
                `${selectedStyles.length} selected`
              )}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 p-0 bg-popover border shadow-lg z-50" 
            align="start"
            sideOffset={4}
          >
            <div className="flex items-center justify-between p-2 border-b bg-muted/50">
              <span className="text-xs font-medium">Video Styles</span>
              {selectedStyles.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-5 text-[10px] px-1.5">
                  Clear
                </Button>
              )}
            </div>
            <ScrollArea className="h-56">
              <div className="p-1.5 space-y-2">
                {CATEGORIES.map(category => (
                  <div key={category}>
                    <div className="px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
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
                              "w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors",
                              isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                            )}
                          >
                            <span>{style.title}</span>
                            {isSelected && <Check className="w-3 h-3" />}
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

        {/* Selected Style Chips */}
        {selectedStyles.slice(0, 3).map(styleId => (
          <Badge 
            key={styleId} 
            variant="secondary"
            className="text-[10px] h-5 gap-0.5 cursor-pointer hover:bg-destructive/20"
            onClick={() => removeStyle(styleId)}
          >
            {getStyleTitle(styleId)}
            <X className="w-2.5 h-2.5" />
          </Badge>
        ))}
        {selectedStyles.length > 3 && (
          <Badge variant="outline" className="text-[10px] h-5">
            +{selectedStyles.length - 3}
          </Badge>
        )}
      </div>

      {/* Quick Actions - Inline Buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs gap-1.5"
          onClick={() => onNavigate('screenshots')}
        >
          <Camera className="w-3.5 h-3.5" />
          Upload Screenshots
        </Button>
        <Button 
          size="sm" 
          className="h-8 text-xs gap-1.5"
          onClick={() => onNavigate('generate')}
        >
          <Zap className="w-3.5 h-3.5" />
          Generate
          <ArrowRight className="w-3 h-3" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs gap-1.5"
          onClick={() => onNavigate('matrix')}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          Batch Matrix
        </Button>
      </div>
    </div>
  );
};

export default GenieCastOverview;
