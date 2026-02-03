/**
 * VIDEO STYLE COMPACT SELECTOR
 * 
 * Compact horizontal chip-based style selector:
 * - Categories as collapsible sections
 * - Small, clickable chips instead of large cards
 * - Multi-select support
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Share2, 
  User, 
  Palette,
  Megaphone,
  Film,
  Sparkles,
  BookOpen,
  Check,
  Image,
  Wand2,
  MousePointer,
  Box,
  Mic2,
  Camera,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type VideoStyleType = 
  | 'smart_storytelling'
  | 'educational' 
  | 'social' 
  | 'ugc_avatar_photorealistic'
  | 'ugc_avatar_3d_pixar'
  | 'ugc_avatar_2d_animated'
  | 'anime' 
  | 'video_ads' 
  | 'micro_drama'
  | 'image_to_life'
  | 'talking_photos'
  | 'interactive_quiz'
  | 'cta_videos'
  | 'hook_videos'
  | 'explainer_3d'
  | 'product_demo';

export type AvatarStyleType = 'photorealistic' | '3d_pixar' | '2d_animated';

interface VideoStyle {
  id: VideoStyleType;
  title: string;
  icon: React.ElementType;
  category: 'storytelling' | 'avatar' | 'animation' | 'interactive' | 'marketing';
  popular?: boolean;
  new?: boolean;
}

// Compact style definitions - removed unnecessary/duplicate ones
const VIDEO_STYLES: VideoStyle[] = [
  // STORYTELLING
  { id: 'smart_storytelling', title: 'Smart Storytelling', icon: BookOpen, category: 'storytelling', popular: true, new: true },
  { id: 'hook_videos', title: 'Hook Videos', icon: Sparkles, category: 'storytelling', popular: true },
  { id: 'micro_drama', title: 'Micro-Drama', icon: Film, category: 'storytelling' },
  
  // AVATAR
  { id: 'ugc_avatar_photorealistic', title: 'Photorealistic', icon: User, category: 'avatar', popular: true },
  { id: 'ugc_avatar_3d_pixar', title: '3D Pixar Style', icon: Box, category: 'avatar', new: true },
  { id: 'ugc_avatar_2d_animated', title: '2D Animated', icon: Palette, category: 'avatar' },
  { id: 'talking_photos', title: 'Talking Photos', icon: Mic2, category: 'avatar' },
  
  // ANIMATION
  { id: 'anime', title: 'Anime Style', icon: Wand2, category: 'animation', popular: true },
  { id: 'image_to_life', title: 'Image to Life', icon: Image, category: 'animation', new: true },
  { id: 'explainer_3d', title: '3D Explainer', icon: Box, category: 'animation' },
  
  // INTERACTIVE
  { id: 'educational', title: 'Educational', icon: GraduationCap, category: 'interactive', popular: true },
  { id: 'interactive_quiz', title: 'Quiz Overlay', icon: MousePointer, category: 'interactive', new: true },
  { id: 'cta_videos', title: 'CTA Videos', icon: MousePointer, category: 'interactive' },
  
  // MARKETING
  { id: 'social', title: 'Social Media', icon: Share2, category: 'marketing', popular: true },
  { id: 'video_ads', title: 'Video Ads', icon: Megaphone, category: 'marketing' },
  { id: 'product_demo', title: 'Product Demo', icon: Camera, category: 'marketing' },
];

const CATEGORY_INFO: Record<string, { label: string; icon: React.ElementType }> = {
  storytelling: { label: 'Storytelling', icon: BookOpen },
  avatar: { label: 'Avatar & Presenters', icon: User },
  animation: { label: 'Animation', icon: Wand2 },
  interactive: { label: 'Interactive', icon: MousePointer },
  marketing: { label: 'Marketing', icon: Megaphone },
};

interface VideoStyleCardsProps {
  selectedStyle?: VideoStyleType;
  selectedStyles?: VideoStyleType[];
  onSelectStyle: (style: VideoStyleType) => void;
  onSelectStyles?: (styles: VideoStyleType[]) => void;
  allowMultiple?: boolean;
  compact?: boolean;
  className?: string;
}

export const VideoStyleCards: React.FC<VideoStyleCardsProps> = ({
  selectedStyle,
  selectedStyles = [],
  onSelectStyle,
  onSelectStyles,
  allowMultiple = false,
  compact = true,
  className,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['storytelling', 'avatar', 'animation', 'interactive', 'marketing'])
  );

  const handleStyleClick = (styleId: VideoStyleType) => {
    if (allowMultiple && onSelectStyles) {
      if (selectedStyles.includes(styleId)) {
        onSelectStyles(selectedStyles.filter(s => s !== styleId));
      } else {
        onSelectStyles([...selectedStyles, styleId]);
      }
    } else {
      onSelectStyle(styleId);
    }
  };
  
  const isStyleSelected = (styleId: VideoStyleType) => {
    if (allowMultiple) {
      return selectedStyles.includes(styleId);
    }
    return selectedStyle === styleId;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group styles by category
  const groupedStyles = VIDEO_STYLES.reduce((acc, style) => {
    if (!acc[style.category]) acc[style.category] = [];
    acc[style.category].push(style);
    return acc;
  }, {} as Record<string, VideoStyle[]>);

  const categories: Array<keyof typeof CATEGORY_INFO> = ['storytelling', 'avatar', 'animation', 'interactive', 'marketing'];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-primary" />
          Video Styles
        </h3>
        <div className="flex items-center gap-1.5">
          {allowMultiple && selectedStyles.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-600">
              {selectedStyles.length} selected
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {VIDEO_STYLES.length} styles
          </Badge>
        </div>
      </div>

      {/* Compact Category Groups */}
      <div className="space-y-1.5">
        {categories.map((category) => {
          const styles = groupedStyles[category] || [];
          const info = CATEGORY_INFO[category];
          const isExpanded = expandedCategories.has(category);
          const Icon = info.icon;
          
          return (
            <div key={category} className="border border-border/50 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{info.label}</span>
                  <span className="text-[10px] text-muted-foreground">({styles.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
              
              {/* Style Chips */}
              {isExpanded && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-background">
                  {styles.map((style) => {
                    const StyleIcon = style.icon;
                    const selected = isStyleSelected(style.id);
                    
                    return (
                      <button
                        key={style.id}
                        onClick={() => handleStyleClick(style.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                          "border hover:shadow-sm",
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        {selected ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <StyleIcon className="w-3 h-3" />
                        )}
                        <span>{style.title}</span>
                        {style.popular && !selected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        {style.new && !selected && (
                          <span className="text-[9px] text-green-600 font-semibold">NEW</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoStyleCards;
