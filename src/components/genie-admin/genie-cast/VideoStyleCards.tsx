/**
 * VIDEO STYLE SELECTOR (DB-DRIVEN)
 *
 * Uses useCastContentRegistry for DB-driven visual styles from cast_visual_styles table.
 * Shows ALL style categories — no hardcoded ACTIVE_CATEGORIES filter.
 * Falls back to MASTER_VIDEO_STYLES static registry if DB is empty.
 */

import React, { useState, useMemo } from 'react';
import {
  GraduationCap, Share2, User, Palette, Megaphone, Film, Sparkles,
  BookOpen, Check, Image, Wand2, MousePointer, Box, Mic2, Camera,
  ChevronDown, ChevronRight, Building, Heart, Gamepad, Music,
  Clapperboard, Mic, Users, TrendingUp, MessageCircle, UserCheck,
  Layers, Type, PenTool, ShoppingCart, GitBranch, Scale, FileText,
  Calendar, Eye, Newspaper, Shield, Activity, Crown, Loader2,
  Globe, Brush, Monitor, Zap, Mountain, Leaf,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCastContentRegistry, type VisualStyle } from '@/hooks/useCastContentRegistry';
import {
  MASTER_VIDEO_STYLES,
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
  Building, Users, Shield, Activity, Gamepad, Music, Clapperboard, Mic,
  Globe, Brush, Monitor, Zap, Crown, Mountain, Leaf,
};

// Category display info — covers ALL possible categories from DB + static registry
const CATEGORY_INFO: Record<string, {
  label: string;
  icon: React.ElementType;
  description: string;
}> = {
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
  // DB categories that may not exist in static registry
  artistic: { label: 'Artistic', icon: Brush, description: 'Creative art styles' },
  demo: { label: 'Demo', icon: Monitor, description: 'Product demonstrations' },
  framework: { label: 'Framework', icon: Zap, description: 'Structural frameworks' },
  gaming: { label: 'Gaming', icon: Gamepad, description: 'Game-related content' },
  illustration: { label: 'Illustration', icon: PenTool, description: 'Illustrated visuals' },
  immersive: { label: 'Immersive', icon: Globe, description: 'Immersive experiences' },
  lifestyle: { label: 'Lifestyle', icon: Mountain, description: 'Lifestyle content' },
  cultural: { label: 'Cultural', icon: Globe, description: 'Cultural & regional' },
  religious: { label: 'Religious', icon: Leaf, description: 'Religious & spiritual' },
};

// Default fallback info for unknown categories
const DEFAULT_CATEGORY_INFO = { label: 'Other', icon: Sparkles, description: 'Additional styles' };

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
  const { visualStyles, loading } = useCastContentRegistry();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Use DB styles if available, fallback to static registry
  const useDbStyles = visualStyles.length > 0;

  // Normalize DB styles to a common shape
  const normalizedStyles = useMemo(() => {
    if (useDbStyles) {
      return visualStyles.map(vs => ({
        id: vs.name as VideoStyleType, // Use name as ID for backward compat
        dbId: vs.id,
        title: vs.label,
        category: vs.category as string,
        description: vs.description || '',
        icon: vs.icon || 'Sparkles',
        premium: false,
        popular: false,
        new: false,
        industries: [] as string[],
      }));
    }
    // Fallback to static registry
    return MASTER_VIDEO_STYLES.map(s => ({
      id: s.id,
      dbId: null as string | null,
      title: s.title,
      category: s.category as string,
      description: s.description,
      icon: s.icon,
      premium: s.premium,
      popular: s.popular,
      new: s.new,
      industries: s.industries,
    }));
  }, [useDbStyles, visualStyles]);

  // Filter by industry if provided
  const filteredStyles = useMemo(() => {
    let styles = normalizedStyles;
    if (industryFilter && !useDbStyles) {
      styles = styles.filter(s => s.industries.includes(industryFilter));
    }
    if (!showPremium) {
      styles = styles.filter(s => !s.premium);
    }
    return styles;
  }, [normalizedStyles, industryFilter, showPremium, useDbStyles]);

  // Group by category — ALL categories, no filter
  const groupedStyles = useMemo(() => {
    return filteredStyles.reduce((acc, style) => {
      if (!acc[style.category]) acc[style.category] = [];
      acc[style.category].push(style);
      return acc;
    }, {} as Record<string, typeof filteredStyles>);
  }, [filteredStyles]);

  // All categories that have styles, sorted by count
  const allCategories = useMemo(() => {
    return Object.keys(groupedStyles).sort((a, b) => {
      return (groupedStyles[b]?.length || 0) - (groupedStyles[a]?.length || 0);
    });
  }, [groupedStyles]);

  // Auto-expand top 5 categories on first render
  useMemo(() => {
    if (expandedCategories.size === 0 && allCategories.length > 0) {
      setExpandedCategories(new Set(allCategories.slice(0, 5)));
    }
  }, [allCategories.length]);

  const visibleCategories = showAllCategories
    ? allCategories
    : allCategories.slice(0, 8);

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
    if (allowMultiple) return selectedStyles.includes(styleId);
    return selectedStyle === styleId;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading styles...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-primary" />
          Video Styles
          {useDbStyles && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-green-600 border-green-300">DB</Badge>
          )}
        </h3>
        <div className="flex items-center gap-1.5">
          {allowMultiple && selectedStyles.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-600">
              {selectedStyles.length} selected
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {filteredStyles.length} styles · {allCategories.length} categories
          </Badge>
        </div>
      </div>

      {/* Category Groups — ALL categories shown */}
      <div className="space-y-1.5">
        {visibleCategories.map((category) => {
          const styles = groupedStyles[category] || [];
          if (styles.length === 0) return null;

          const info = CATEGORY_INFO[category] || { ...DEFAULT_CATEGORY_INFO, label: category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
          const isExpanded = expandedCategories.has(category);
          const Icon = info.icon;
          const selectedInCategory = styles.filter(s => isStyleSelected(s.id)).length;

          return (
            <div key={category} className="border border-border/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{info.label}</span>
                  <span className="text-[10px] text-muted-foreground">({styles.length})</span>
                  {selectedInCategory > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-green-500/10 text-green-600">
                      {selectedInCategory}
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>

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
      {allCategories.length > 8 && (
        <button
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1"
        >
          {showAllCategories ? 'Show fewer categories' : `Show all ${allCategories.length} categories`}
        </button>
      )}
    </div>
  );
};

export default VideoStyleCards;
