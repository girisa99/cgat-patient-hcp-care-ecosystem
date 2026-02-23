/**
 * DeckVideoStyleSelector — Unified Style Picker for GenieDeck
 *
 * Presents ALL 93 production styles organized by super-category.
 * Highlights presentation/infographic/data-viz styles for Deck users.
 * Shared with Cast — same style IDs, same providers, same output.
 *
 * Features:
 *   - Super-category tabs (Presentation, Animation, Avatar, Data Viz, etc.)
 *   - Multi-select for combining styles
 *   - "Recommended for Deck" badge on presentation styles
 *   - Provider routing preview per style
 *   - Industry filter
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  BookOpen,
  Box,
  Building,
  Camera,
  Check,
  Clapperboard,
  Filter,
  GraduationCap,
  Heart,
  Layers,
  Megaphone,
  MousePointer,
  PenTool,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ALL_STYLES,
  getStylesBySuperCategory,
  getPresentationStyles,
  getPopularStyles,
  SUPER_CATEGORY_META,
  STYLE_COUNTS,
  type UnifiedVideoStyle,
  type StyleSuperCategory,
} from '@/config/unified-style-registry';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DeckVideoStyleSelectorProps {
  selectedStyles: string[];
  onStyleToggle: (styleId: string) => void;
  onStylesClear: () => void;
  maxSelections?: number;
  showRecommended?: boolean;
  className?: string;
}

// ─── Icon map ───────────────────────────────────────────────────────────────

const SUPER_CATEGORY_ICONS: Record<StyleSuperCategory, React.ElementType> = {
  storytelling_narrative: BookOpen,
  avatar_presenter: User,
  animation_motion: Sparkles,
  presentation_infographic: BarChart3,
  data_visualization: TrendingUp,
  interactive_immersive: MousePointer,
  marketing_social: Megaphone,
  enterprise_training: Building,
  healthcare_medical: Heart,
  entertainment_creative: Clapperboard,
  hand_drawn_artistic: PenTool,
  cyber_futuristic: Zap,
  photorealistic_cinematic: Camera,
  educational: GraduationCap,
};

// ─── Style Card ─────────────────────────────────────────────────────────────

function StyleCard({
  style,
  isSelected,
  onToggle,
  isPresentationStyle,
}: {
  style: UnifiedVideoStyle;
  isSelected: boolean;
  onToggle: () => void;
  isPresentationStyle: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative w-full text-left p-3 rounded-lg border transition-all',
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
          : 'border-border/50 hover:border-border hover:bg-muted/30',
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      {/* Title + badges */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium">{style.title}</span>
        {style.popular && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
        {style.new && <Badge className="text-[8px] px-1 py-0 h-3.5 bg-emerald-500/90">New</Badge>}
        {style.premium && <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">Pro</Badge>}
      </div>

      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{style.description}</p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1">
        {style.avatarProvider && (
          <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">
            <User className="w-2 h-2 mr-0.5" /> Avatar
          </Badge>
        )}
        {style.animationProvider && (
          <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">
            <Sparkles className="w-2 h-2 mr-0.5" /> Anim
          </Badge>
        )}
        {isPresentationStyle && (
          <Badge className="text-[8px] px-1 py-0 h-3.5 bg-blue-500/20 text-blue-600 border-blue-200">
            <Layers className="w-2 h-2 mr-0.5" /> Deck
          </Badge>
        )}
        <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
          {style.videoProvider}
        </Badge>
      </div>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DeckVideoStyleSelector({
  selectedStyles,
  onStyleToggle,
  onStylesClear,
  maxSelections = 5,
  showRecommended = true,
  className,
}: DeckVideoStyleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('recommended');

  const presentationStyleIds = useMemo(
    () => new Set(getPresentationStyles().map(s => s.id)),
    [],
  );

  // Filtered styles
  const filteredStyles = useMemo(() => {
    if (!searchQuery.trim()) return ALL_STYLES;
    const q = searchQuery.toLowerCase();
    return ALL_STYLES.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.industries.some(i => i.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Tab-filtered styles
  const tabStyles = useMemo(() => {
    if (activeTab === 'recommended') {
      return showRecommended
        ? [...getPresentationStyles(), ...getPopularStyles().filter(s => !presentationStyleIds.has(s.id))]
        : getPopularStyles();
    }
    if (activeTab === 'all') return filteredStyles;
    return getStylesBySuperCategory(activeTab as StyleSuperCategory).filter(s =>
      filteredStyles.includes(s)
    );
  }, [activeTab, filteredStyles, showRecommended, presentationStyleIds]);

  // Priority tabs for Deck
  const tabs: Array<{ key: string; label: string; icon: React.ElementType }> = [
    { key: 'recommended', label: 'Recommended', icon: Star },
    { key: 'presentation_infographic', label: 'Infographic', icon: BarChart3 },
    { key: 'data_visualization', label: 'Data Viz', icon: TrendingUp },
    { key: 'animation_motion', label: 'Animation', icon: Sparkles },
    { key: 'avatar_presenter', label: 'Avatar', icon: User },
    { key: 'storytelling_narrative', label: 'Story', icon: BookOpen },
    { key: 'hand_drawn_artistic', label: 'Artistic', icon: PenTool },
    { key: 'cyber_futuristic', label: 'Cyber', icon: Zap },
    { key: 'marketing_social', label: 'Marketing', icon: Megaphone },
    { key: 'enterprise_training', label: 'Enterprise', icon: Building },
    { key: 'healthcare_medical', label: 'Healthcare', icon: Heart },
    { key: 'educational', label: 'Education', icon: GraduationCap },
    { key: 'all', label: `All (${STYLE_COUNTS.total})`, icon: Layers },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="w-5 h-5 text-primary" />
              Visual Production Style
            </CardTitle>
            <CardDescription>
              {STYLE_COUNTS.total} styles across {Object.keys(SUPER_CATEGORY_META).length} categories — shared with Cast
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {selectedStyles.length > 0 && (
              <>
                <Badge variant="default" className="text-xs">
                  {selectedStyles.length}/{maxSelections} selected
                </Badge>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onStylesClear}>
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search styles by name, industry, or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <ScrollArea className="w-full">
            <TabsList className="h-8 flex-nowrap">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="text-[11px] gap-1 px-2 whitespace-nowrap">
                    <Icon className="w-3 h-3" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>

          {/* Single content area for all tabs */}
          <div className="mt-3">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-2">
                {tabStyles.map(style => (
                  <StyleCard
                    key={style.id}
                    style={style}
                    isSelected={selectedStyles.includes(style.id)}
                    onToggle={() => {
                      if (selectedStyles.includes(style.id) || selectedStyles.length < maxSelections) {
                        onStyleToggle(style.id);
                      }
                    }}
                    isPresentationStyle={presentationStyleIds.has(style.id)}
                  />
                ))}
              </div>

              {tabStyles.length === 0 && (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  No styles match your search.
                </div>
              )}
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default DeckVideoStyleSelector;
