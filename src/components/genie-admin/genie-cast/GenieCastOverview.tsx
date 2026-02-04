/**
 * GENIE CAST OVERVIEW - COMPACT STUDIO HEADER
 * 
 * Clean, focused overview with:
 * - Multi-select style dropdown (pulls from MASTER_ECOSYSTEM_REGISTRY)
 * - AI provider chips (no marquee to prevent scroll)
 * - Compact quick action buttons
 * 
 * Now uses 43+ styles from master registry instead of hardcoded list
 */

import React, { useState, useMemo } from 'react';
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
import { 
  MASTER_VIDEO_STYLES, 
  getVideoStylesByCategory,
  calculateEcosystemMetrics,
  type VideoStyleCategory,
} from '@/config/master-ecosystem-registry';

// Style definitions derived from master registry
interface VideoStyle {
  id: VideoStyleType;
  title: string;
  category: string;
}

// Category display order
const CATEGORY_ORDER: VideoStyleCategory[] = [
  'storytelling', 'avatar', 'animation', 'interactive', 'marketing',
  'enterprise', 'healthcare', 'entertainment', 'education', 'ecommerce'
];

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  storytelling: 'Storytelling',
  avatar: 'Avatar & Presenters',
  animation: 'Animation',
  interactive: 'Interactive',
  marketing: 'Marketing',
  enterprise: 'Enterprise',
  healthcare: 'Healthcare',
  entertainment: 'Entertainment',
  education: 'Education',
  ecommerce: 'E-Commerce',
  news_media: 'News & Media',
  social_platform: 'Social Platform',
};

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
  
  // Get metrics from registry
  const metrics = useMemo(() => calculateEcosystemMetrics(), []);

  // Convert master registry to simple format
  const VIDEO_STYLES: VideoStyle[] = useMemo(() => 
    MASTER_VIDEO_STYLES.map(s => ({
      id: s.id as VideoStyleType,
      title: s.title,
      category: CATEGORY_LABELS[s.category] || s.category,
    }))
  , []);

  // Get ordered category keys for rendering
  const CATEGORIES = useMemo(() => 
    CATEGORY_ORDER
      .filter(cat => MASTER_VIDEO_STYLES.some(s => s.category === cat))
      .map(cat => CATEGORY_LABELS[cat] || cat)
  , []);

  // Group styles by category
  const groupedStyles = useMemo(() => {
    const groups: Record<string, VideoStyle[]> = {};
    CATEGORY_ORDER.forEach(cat => {
      const catStyles = MASTER_VIDEO_STYLES
        .filter(s => s.category === cat)
        .map(s => ({
          id: s.id as VideoStyleType,
          title: s.title,
          category: CATEGORY_LABELS[cat] || cat,
        }));
      if (catStyles.length > 0) {
        groups[CATEGORY_LABELS[cat] || cat] = catStyles;
      }
    });
    return groups;
  }, []);

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

  return (
    <div className={cn("space-y-3 max-w-full overflow-hidden", className)}>
      {/* Compact Header Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Film className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Genie Cast</h2>
        </div>
        <Badge variant="secondary" className="text-[10px] h-5">
          {metrics.providers.total} Providers • {metrics.videoStyles.total} Styles
        </Badge>
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
