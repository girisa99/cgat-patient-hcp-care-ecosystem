/**
 * TRANSCREATION REGION PICKER
 * 
 * Reusable region/sub-region selector with cultural preview cards.
 * Powered by regionalTranscreationService — shows full richness
 * (wardrobe, companion, music, art style, LLM provider, RTL status).
 * 
 * Supports:
 * - 16 parent regions → 62+ sub-regions
 * - Single or multi-select mode
 * - Cultural preview cards on hover/expand
 * - All 7 Genie Suite products
 * 
 * @see src/services/regionalTranscreationService.ts — data source
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Globe, ChevronRight, ChevronDown, Sparkles, Music, Palette,
  MapPin, Shirt, PawPrint, Brain, ArrowRightLeft, Check, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  getAllAvailableRegions,
  getTranscreationProfile,
  getTranscreationTraits,
  type TranscreationProfile,
} from '@/services/regionalTranscreationService';
import type { CulturalTraits } from '@/config/universal-script-schema';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface TranscreationRegionPickerProps {
  /** Currently selected region codes */
  selectedRegions: string[];
  /** Callback when selection changes */
  onRegionsChange: (regions: string[]) => void;
  /** Single select (radio) or multi-select (checkbox) */
  mode?: 'single' | 'multi';
  /** Show cultural preview card for selected/hovered region */
  showPreview?: boolean;
  /** Compact mode (smaller, no preview) */
  compact?: boolean;
  /** Max height for the dropdown */
  maxHeight?: string;
  /** Additional className */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label override */
  label?: string;
}

// ─── REGION ICONS (from existing patterns) ────────────────────────────────────

const REGION_ICONS: Record<string, string> = {
  NAM: '🇺🇸', LATAM: '🌎', EU: '🇪🇺', MENA: '🌍', INDIA: '🇮🇳',
  CJK: '🏯', SEA: '🌏', AFRICA: '🌍', OCEANIA: '🌊', TURKEY: '🇹🇷',
  CARIBBEAN: '🏝️', EURASIA: '🔷', CENTRAL_ASIA: '🏔️',
  BANGLADESH: '🇧🇩', PAKISTAN: '🇵🇰', SRI_LANKA: '🇱🇰',
};

const getRegionIcon = (regionId: string): string => {
  const upper = regionId.toUpperCase();
  return REGION_ICONS[upper] || '🌐';
};

// ─── CULTURAL PREVIEW CARD ───────────────────────────────────────────────────

const CulturalPreviewCard: React.FC<{ profile: TranscreationProfile }> = ({ profile }) => {
  const { culturalTraits, creativeDirection, llmProvider, llmModel, zone, isRTL, locale, voiceOptions } = profile;

  return (
    <Card className="border-border/50 bg-card/95 backdrop-blur-sm shadow-lg">
      <CardContent className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRegionIcon(profile.parentRegion)}</span>
            <div>
              <p className="text-xs font-semibold text-foreground">{profile.regionCode}</p>
              <p className="text-[10px] text-muted-foreground">Zone: {zone} • {locale}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isRTL && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-destructive/50 text-destructive">
                <ArrowRightLeft className="w-2.5 h-2.5 mr-0.5" /> RTL
              </Badge>
            )}
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Cultural Traits Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {culturalTraits.wardrobe && (
            <TraitItem icon={<Shirt className="w-3 h-3" />} label="Wardrobe" value={culturalTraits.wardrobe} />
          )}
          {culturalTraits.companion && (
            <TraitItem icon={<PawPrint className="w-3 h-3" />} label="Companion" value={culturalTraits.companion} />
          )}
          {culturalTraits.setting && (
            <TraitItem icon={<MapPin className="w-3 h-3" />} label="Setting" value={culturalTraits.setting} />
          )}
          {culturalTraits.artStyle && (
            <TraitItem icon={<Palette className="w-3 h-3" />} label="Art Style" value={culturalTraits.artStyle} />
          )}
          {culturalTraits.musicHint && (
            <TraitItem icon={<Music className="w-3 h-3" />} label="Music" value={culturalTraits.musicHint} />
          )}
          {culturalTraits.colorPalette && (
            <TraitItem icon={<Sparkles className="w-3 h-3" />} label="Colors" value={culturalTraits.colorPalette} />
          )}
        </div>

        {/* AI Provider */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/20">
          <Brain className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">AI:</span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
            {llmProvider} / {llmModel}
          </Badge>
          {voiceOptions.length > 0 && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
              {voiceOptions.length} voices
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TraitItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-1.5 min-w-0">
    <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[9px] text-muted-foreground leading-none">{label}</p>
      <p className="text-[10px] text-foreground truncate leading-tight">{value}</p>
    </div>
  </div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export const TranscreationRegionPicker: React.FC<TranscreationRegionPickerProps> = ({
  selectedRegions,
  onRegionsChange,
  mode = 'single',
  showPreview = true,
  compact = false,
  maxHeight = '70vh',
  className,
  placeholder = 'Select region…',
  label,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Get all regions from transcreation service
  const allRegions = useMemo(() => getAllAvailableRegions(), []);

  // Get profile for hovered/selected region (for preview card)
  const previewProfile = useMemo(() => {
    const code = hoveredRegion || (selectedRegions.length === 1 ? selectedRegions[0] : null);
    if (!code) return null;
    try {
      return getTranscreationProfile(code);
    } catch {
      return null;
    }
  }, [hoveredRegion, selectedRegions]);

  const toggleExpandParent = useCallback((parentId: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      next.has(parentId) ? next.delete(parentId) : next.add(parentId);
      return next;
    });
  }, []);

  const handleSelect = useCallback((code: string) => {
    if (mode === 'single') {
      onRegionsChange([code]);
      setOpen(false);
    } else {
      const isSelected = selectedRegions.includes(code);
      onRegionsChange(
        isSelected
          ? selectedRegions.filter(r => r !== code)
          : [...selectedRegions, code]
      );
    }
  }, [mode, selectedRegions, onRegionsChange]);

  const handleSelectParent = useCallback((parentId: string, subRegionIds: string[]) => {
    if (mode === 'single') {
      // In single mode, select the parent code itself
      onRegionsChange([parentId]);
      setOpen(false);
    } else {
      // In multi mode, toggle all sub-regions (or parent if no children)
      const codes = subRegionIds.length > 0 ? subRegionIds : [parentId];
      const allSelected = codes.every(c => selectedRegions.includes(c));
      if (allSelected) {
        onRegionsChange(selectedRegions.filter(r => !codes.includes(r)));
      } else {
        onRegionsChange([...new Set([...selectedRegions, ...codes])]);
      }
    }
  }, [mode, selectedRegions, onRegionsChange]);

  const clearAll = useCallback(() => onRegionsChange([]), [onRegionsChange]);

  // Summary label
  const summaryLabel = useMemo(() => {
    if (selectedRegions.length === 0) return placeholder;
    if (selectedRegions.length === 1) {
      return `${getRegionIcon(selectedRegions[0])} ${selectedRegions[0]}`;
    }
    return `${selectedRegions.length} regions`;
  }, [selectedRegions, placeholder]);

  // Count total sub-regions
  const totalSubRegions = useMemo(() => 
    allRegions.reduce((sum, r) => sum + Math.max(r.subRegionCount, 1), 0),
    [allRegions]
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>}
      <Globe className="w-4 h-4 text-primary flex-shrink-0" />

      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className={cn(
              "justify-between bg-background border-border",
              compact ? "h-7 text-[11px] min-w-[140px] max-w-[220px]" : "h-9 text-xs min-w-[180px] max-w-[300px]"
            )}
          >
            <span className="truncate">{summaryLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 z-[100000] bg-popover border-border shadow-xl"
          align="start"
          side="bottom"
          sideOffset={4}
          style={{ maxHeight, width: showPreview ? '640px' : '360px' }}
        >
          <div className="flex">
            {/* Region list */}
            <div className={cn("flex flex-col", showPreview ? "w-[340px]" : "w-full")}>
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 sticky top-0 z-10">
                <span className="text-xs font-semibold text-foreground">
                  🌍 Transcreation Regions
                  <span className="ml-1.5 text-muted-foreground font-normal">
                    ({allRegions.length} parents • {totalSubRegions} total)
                  </span>
                </span>
                {mode === 'multi' && selectedRegions.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={clearAll}>
                    Clear
                  </Button>
                )}
              </div>

              {/* Scrollable region list */}
              <ScrollArea className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
                <div className="py-1">
                  {allRegions.map((region) => {
                    const isExpanded = expandedParents.has(region.parentId);
                    const hasChildren = region.subRegionCount > 0;
                    const isParentSelected = selectedRegions.includes(region.parentId);
                    const selectedChildCount = region.subRegionIds.filter(id => selectedRegions.includes(id)).length;

                    return (
                      <div key={region.parentId} className="border-b border-border/20 last:border-b-0">
                        {/* Parent row */}
                        <div
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-2 hover:bg-muted/40 cursor-pointer transition-colors",
                            isParentSelected && "bg-primary/5"
                          )}
                          onMouseEnter={() => setHoveredRegion(region.parentId)}
                          onMouseLeave={() => setHoveredRegion(null)}
                        >
                          {hasChildren ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); toggleExpandParent(region.parentId); }}
                            >
                              <ChevronRight className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")} />
                            </Button>
                          ) : (
                            <div className="w-5" />
                          )}

                          <div
                            className="flex items-center gap-2 flex-1 min-w-0"
                            onClick={() => handleSelectParent(region.parentId, region.subRegionIds)}
                          >
                            <span className="text-sm flex-shrink-0">{getRegionIcon(region.parentId)}</span>
                            <span className="text-xs font-medium flex-1 truncate">{region.parentName}</span>
                            {(isParentSelected || selectedChildCount > 0) && (
                              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            )}
                            {hasChildren && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 flex-shrink-0">
                                {selectedChildCount > 0 ? `${selectedChildCount}/` : ''}{region.subRegionCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Sub-regions */}
                        {isExpanded && hasChildren && (
                          <div className="pl-7 pb-1.5">
                            {region.subRegionIds.map((subId) => {
                              const isSelected = selectedRegions.includes(subId);
                              return (
                                <div
                                  key={subId}
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 hover:bg-muted/30 rounded-sm cursor-pointer transition-colors",
                                    isSelected && "bg-primary/8"
                                  )}
                                  onClick={() => handleSelect(subId)}
                                  onMouseEnter={() => setHoveredRegion(subId)}
                                  onMouseLeave={() => setHoveredRegion(null)}
                                >
                                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-[11px] flex-1 truncate">{subId}</span>
                                  {isSelected && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="px-3 py-2 border-t bg-muted/20 flex items-center justify-between sticky bottom-0">
                <span className="text-[10px] text-muted-foreground">
                  {selectedRegions.length} selected
                </span>
                <Button
                  variant="default"
                  size="sm"
                  className="h-6 text-[10px] px-3"
                  onClick={() => setOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>

            {/* Cultural Preview Panel */}
            {showPreview && (
              <div className="w-[300px] border-l border-border/30 bg-muted/10 p-3 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 4px)' }}>
                {previewProfile ? (
                  <CulturalPreviewCard profile={previewProfile} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Globe className="w-8 h-8 text-muted-foreground/30 mb-3" />
                    <p className="text-xs text-muted-foreground">
                      Hover over a region to preview
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      cultural traits, AI routing & voice config
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick badges for selected regions (max 4) */}
      {!compact && selectedRegions.length > 0 && selectedRegions.length <= 4 && (
        <div className="hidden lg:flex items-center gap-1 flex-wrap">
          {selectedRegions.map(code => (
            <Badge key={code} variant="secondary" className="text-[9px] px-1.5 py-0 h-5 gap-0.5">
              {getRegionIcon(code)} {code}
              {mode === 'multi' && (
                <X
                  className="w-2.5 h-2.5 ml-0.5 cursor-pointer opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegionsChange(selectedRegions.filter(r => r !== code));
                  }}
                />
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscreationRegionPicker;
