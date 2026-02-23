/**
 * VIDEO STYLE SELECTOR (EXPANDED)
 * 
 * Uses MASTER_ECOSYSTEM_REGISTRY for 43+ video styles
 * across all industries, segments, and use cases.
 * 
 * Categories:
 * - Storytelling (6): Smart, Hook, Micro-Drama, Documentary, Narrative, Testimonial
 * - Avatar (7): Photorealistic, 3D Pixar, 2D, Talking Photos, Full-Body, Digital Twin, Mascot
 * - Animation (6): Anime, Image-to-Life, 3D Explainer, Motion Graphics, Kinetic, Whiteboard
 * - Interactive (5): Educational, Quiz, CTA, Shoppable, Branching
 * - Marketing (8): Social, Ads, Demo, Comparison, Case Study, Event, BTS, News
 * - Enterprise (4): Training, Internal Comms, Investor, Compliance
 * - Healthcare (3): Patient Ed, Provider Training, Medical Explainer
 * - Entertainment (4): Gaming, Music Video, Short Film, Podcast
 */

import React, { useState, useMemo } from 'react';
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
  ChevronRight,
  Building,
  Heart,
  Gamepad,
  Music,
  Clapperboard,
  Mic,
  Users,
  TrendingUp,
  MessageCircle,
  UserCheck,
  Layers,
  Type,
  PenTool,
  ShoppingCart,
  GitBranch,
  Scale,
  FileText,
  Calendar,
  Eye,
  Newspaper,
  Shield,
  Activity,
  Crown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  MASTER_VIDEO_STYLES, 
  getVideoStylesByCategory,
  type VideoStyleId,
  type VideoStyleCategory,
} from '@/config/master-ecosystem-registry';

// Re-export types for backward compatibility
export type VideoStyleType = VideoStyleId;
export type AvatarStyleType = 'photorealistic' | '3d_pixar' | '2d_animated';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Sparkles, Film, Camera, TrendingUp, MessageCircle,
  User, Box, Palette, Mic2, UserCheck, Heart,
  Wand2, Image, Layers, Type, PenTool,
  GraduationCap, MousePointer, ShoppingCart, GitBranch,
  Share2, Megaphone, Scale, FileText, Calendar, Eye, Newspaper,
  Building, Users, Shield, Activity,
  Gamepad, Music, Clapperboard, Mic,
};

// Category display info
const CATEGORY_INFO: Partial<Record<VideoStyleCategory, { 
  label: string; 
  icon: React.ElementType;
  description: string;
}>> = {
  storytelling: { label: 'Storytelling', icon: BookOpen, description: 'Narrative-driven content' },
  avatar: { label: 'Avatar & Presenters', icon: User, description: 'AI presenters and characters' },
  animation: { label: 'Animation', icon: Wand2, description: 'Motion and visual effects' },
  interactive: { label: 'Interactive', icon: MousePointer, description: 'Engaging interactive content' },
  marketing: { label: 'Marketing', icon: Megaphone, description: 'Promotional content' },
  education: { label: 'Education', icon: GraduationCap, description: 'Learning content' },
  enterprise: { label: 'Enterprise', icon: Building, description: 'Business & corporate' },
  ecommerce: { label: 'E-Commerce', icon: ShoppingCart, description: 'Product & sales content' },
  healthcare: { label: 'Healthcare', icon: Heart, description: 'Medical & wellness' },
  entertainment: { label: 'Entertainment', icon: Film, description: 'Creative & media' },
  news_media: { label: 'News & Media', icon: Newspaper, description: 'Journalism & reporting' },
  social_platform: { label: 'Social Platforms', icon: Share2, description: 'Platform-specific content' },
  presentation: { label: 'Presentation', icon: Layers, description: 'Slides & decks' },
  infographic: { label: 'Infographic', icon: TrendingUp, description: 'Data visualizations' },
  data_visualization: { label: 'Data Viz', icon: Activity, description: 'Charts & analytics' },
  hand_drawn: { label: 'Hand-Drawn', icon: PenTool, description: 'Sketch-style content' },
  photorealistic: { label: 'Photorealistic', icon: Camera, description: 'Realistic imagery' },
  character: { label: 'Character', icon: Users, description: 'Character-driven content' },
  cyber_tech: { label: 'Cyber Tech', icon: Crown, description: 'Futuristic tech aesthetic' },
};

// Get categories that have styles
const ACTIVE_CATEGORIES: VideoStyleCategory[] = [
  'storytelling', 'avatar', 'animation', 'interactive', 
  'marketing', 'enterprise', 'healthcare', 'entertainment'
];

interface VideoStyleCardsProps {
  selectedStyle?: VideoStyleType;
  selectedStyles?: VideoStyleType[];
  onSelectStyle: (style: VideoStyleType) => void;
  onSelectStyles?: (styles: VideoStyleType[]) => void;
  allowMultiple?: boolean;
  compact?: boolean;
  showPremium?: boolean;
  industryFilter?: string;
  className?: string;
}

export const VideoStyleCards: React.FC<VideoStyleCardsProps> = ({
  selectedStyle,
  selectedStyles = [],
  onSelectStyle,
  onSelectStyles,
  allowMultiple = false,
  compact = true,
  showPremium = true,
  industryFilter,
  className,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['storytelling', 'avatar', 'animation', 'interactive', 'marketing'])
  );
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Filter styles based on industry if provided
  const filteredStyles = useMemo(() => {
    let styles = MASTER_VIDEO_STYLES;
    
    if (industryFilter) {
      styles = styles.filter(s => s.industries.includes(industryFilter));
    }
    
    if (!showPremium) {
      styles = styles.filter(s => !s.premium);
    }
    
    return styles;
  }, [industryFilter, showPremium]);

  // Group styles by category
  const groupedStyles = useMemo(() => {
    return filteredStyles.reduce((acc, style) => {
      if (!acc[style.category]) acc[style.category] = [];
      acc[style.category].push(style);
      return acc;
    }, {} as Record<string, typeof MASTER_VIDEO_STYLES>);
  }, [filteredStyles]);

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

  // Categories to show (primary 5 or all 8)
  const visibleCategories = showAllCategories 
    ? ACTIVE_CATEGORIES 
    : ACTIVE_CATEGORIES.slice(0, 5);

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
            {filteredStyles.length} styles
          </Badge>
          {!showAllCategories && ACTIVE_CATEGORIES.length > 5 && (
            <button
              onClick={() => setShowAllCategories(true)}
              className="text-[10px] text-primary hover:underline"
            >
              +{ACTIVE_CATEGORIES.length - 5} more
            </button>
          )}
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-1.5">
        {visibleCategories.map((category) => {
          const styles = groupedStyles[category] || [];
          if (styles.length === 0) return null;
          
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
                    const StyleIcon = ICON_MAP[style.icon] || Sparkles;
                    const selected = isStyleSelected(style.id);
                    
                    return (
                      <button
                        key={style.id}
                        onClick={() => handleStyleClick(style.id)}
                        title={style.description}
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
                        {style.premium && !selected && (
                          <Crown className="w-3 h-3 text-amber-500" />
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

      {/* Show More/Less Toggle */}
      {ACTIVE_CATEGORIES.length > 5 && (
        <button
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1"
        >
          {showAllCategories ? 'Show fewer categories' : `Show all ${ACTIVE_CATEGORIES.length} categories`}
        </button>
      )}
    </div>
  );
};

export default VideoStyleCards;
