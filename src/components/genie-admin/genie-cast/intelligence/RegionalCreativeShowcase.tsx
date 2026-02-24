/**
 * RegionalCreativeShowcase — Visual showcase of regional creative adaptations
 *
 * Shows what content will look like in different regions with companion creatures,
 * music styles, narrative approaches, color palettes, and wardrobe hints.
 * Supports side-by-side comparison mode between two regions.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  MapPin,
  Music,
  Palette,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  enrichPromptWithRegion,
  getRegionalMusicPrompt,
  getRegionalNarrativeStyle,
  getRegionalCompanionCreature,
  getRegionalVariant,
  getAllSupportedRegionCodes,
} from '@/services/brand-intelligence';
import { cn } from '@/lib/utils';

interface RegionalCreativeShowcaseProps {
  basePrompt?: string;
  onRegionSelect?: (regionCode: string) => void;
  selectedRegion?: string;
  className?: string;
}

interface RegionZone {
  id: string;
  name: string;
  codes: string[];
  aiProvider: string;
}

const REGION_ZONES: RegionZone[] = [
  {
    id: 'western',
    name: 'Western',
    codes: ['NAM_US', 'EUROPE_UK', 'EUROPE_FRANCE', 'EUROPE_GERMANY', 'EUROPE_SPAIN', 'EUROPE_ITALY', 'EUROPE_NORDIC', 'EUROPE_POLAND'],
    aiProvider: 'Claude / GPT-4',
  },
  {
    id: 'mena',
    name: 'MENA',
    codes: ['MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_NORTH_AFRICA', 'EUROPE_TURKEY'],
    aiProvider: 'Claude / Gemini',
  },
  {
    id: 'cjk',
    name: 'CJK',
    codes: ['CJK_JP', 'CJK_KR', 'CJK_CN', 'CJK_TW_HK'],
    aiProvider: 'Qwen / Claude',
  },
  {
    id: 'india',
    name: 'India',
    codes: ['INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_WEST', 'INDIA_EAST'],
    aiProvider: 'Gemini / Claude',
  },
  {
    id: 'sea',
    name: 'SEA',
    codes: ['SEA_MALAY', 'SEA_THAI', 'SEA_PHIL', 'SEA_VIET'],
    aiProvider: 'Gemini / Claude',
  },
  {
    id: 'africa',
    name: 'Africa',
    codes: ['AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_CENTRAL'],
    aiProvider: 'Claude / GPT-4',
  },
  {
    id: 'latam',
    name: 'LatAm',
    codes: ['LATAM_MEXICO', 'LATAM_BRAZIL', 'LATAM_ANDES', 'LATAM_CARIBBEAN'],
    aiProvider: 'Claude / GPT-4',
  },
];

function RegionCodeLabel({ code }: { code: string }) {
  const variant = getRegionalVariant(code);
  return variant?.regionName || code.replace(/_/g, ' ');
}

interface RegionDetailProps {
  regionCode: string;
  basePrompt?: string;
  compact?: boolean;
}

function RegionDetail({ regionCode, basePrompt, compact = false }: RegionDetailProps) {
  const variant = getRegionalVariant(regionCode);
  const companion = getRegionalCompanionCreature(regionCode);
  const music = getRegionalMusicPrompt(regionCode);
  const narrative = getRegionalNarrativeStyle(regionCode);
  const enrichedPrompt = basePrompt ? enrichPromptWithRegion(basePrompt, regionCode) : null;

  if (!variant) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No regional data available for {regionCode}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-violet-500" />
        <h4 className="font-semibold text-sm">{variant.regionName}</h4>
        <Badge variant="outline" className="text-xs ml-auto">{regionCode}</Badge>
      </div>

      {/* Color Palette */}
      {variant.colorOverrides && variant.colorOverrides.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Color Palette</span>
          </div>
          <div className="flex gap-1.5">
            {variant.colorOverrides.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="h-8 w-8 rounded-md border border-border shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <span className="text-[10px] text-muted-foreground font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Companion Creature */}
      {companion && (
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium">Companion Creature</span>
          </div>
          <p className="text-sm font-semibold">{companion.name} <span className="text-muted-foreground font-normal">({companion.species})</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">{companion.description}</p>
          {!compact && (
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 italic">{companion.culturalSignificance}</p>
          )}
        </div>
      )}

      {/* Music Style */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Music className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Music Style</span>
        </div>
        <p className="text-sm font-medium">{music.genre}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {music.bpm} BPM | Instruments: {music.instruments.slice(0, 4).join(', ')}
          {music.instruments.length > 4 ? ` +${music.instruments.length - 4} more` : ''}
        </p>
      </div>

      {/* Narrative Style */}
      {narrative && (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Narrative Style</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Approach:</span>
              <p className="font-medium">{narrative.approach.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Humor:</span>
              <p className="font-medium">{narrative.humorStyle}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tone:</span>
              <p className="font-medium">{narrative.emotionalTone}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Formality:</span>
              <p className="font-medium">Level {narrative.formalityLevel}/5</p>
            </div>
          </div>
        </div>
      )}

      {/* Wardrobe */}
      {!compact && (
        <div>
          <span className="text-xs font-medium text-muted-foreground">Wardrobe Hints</span>
          <div className="mt-1 space-y-1 text-xs">
            <p><strong>Traditional:</strong> {variant.wardrobe.traditional}</p>
            <p><strong>Modern:</strong> {variant.wardrobe.modern}</p>
            <p><strong>Business:</strong> {variant.wardrobe.business}</p>
          </div>
        </div>
      )}

      {/* Cultural Elements */}
      {!compact && (
        <div>
          <span className="text-xs font-medium text-muted-foreground">Cultural Elements</span>
          <div className="mt-1 space-y-1 text-xs">
            <p><strong>Architecture:</strong> {variant.culturalElements.architecture}</p>
            <p><strong>Patterns:</strong> {variant.culturalElements.patterns}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {variant.culturalElements.symbolism.slice(0, 4).map((sym, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">{sym}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Environment */}
      {!compact && (
        <div className="rounded-lg border border-dashed p-2.5">
          <span className="text-xs font-medium text-muted-foreground">Environment Style</span>
          <p className="text-xs mt-0.5">{variant.environmentStyle}</p>
        </div>
      )}

      {/* Enriched Prompt Preview */}
      {enrichedPrompt && (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 border">
          <span className="text-xs font-medium text-muted-foreground">Enriched Prompt Preview</span>
          <p className="text-xs mt-1 text-foreground/80 line-clamp-4">{enrichedPrompt}</p>
        </div>
      )}
    </div>
  );
}

export function RegionalCreativeShowcase({
  basePrompt,
  onRegionSelect,
  selectedRegion,
  className,
}: RegionalCreativeShowcaseProps) {
  const [activeZone, setActiveZone] = useState<string>('western');
  const [compareRegion, setCompareRegion] = useState<string | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const allRegionCodes = useMemo(() => getAllSupportedRegionCodes(), []);

  const activeZoneData = REGION_ZONES.find((z) => z.id === activeZone);
  const availableCodes = activeZoneData
    ? activeZoneData.codes.filter((c) => allRegionCodes.includes(c))
    : [];

  const handleRegionClick = (code: string) => {
    if (isCompareMode && selectedRegion && selectedRegion !== code) {
      setCompareRegion(code);
    } else {
      onRegionSelect?.(code);
      setCompareRegion(null);
    }
  };

  const toggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    if (isCompareMode) {
      setCompareRegion(null);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Zone Selector */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {REGION_ZONES.map((zone) => (
            <Button
              key={zone.id}
              variant={activeZone === zone.id ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                setActiveZone(zone.id);
                setCompareRegion(null);
              }}
            >
              <Globe className="mr-1 h-3 w-3" />
              {zone.name}
            </Button>
          ))}
        </div>
        <Button
          variant={isCompareMode ? 'default' : 'outline'}
          size="sm"
          className="text-xs h-8 shrink-0"
          onClick={toggleCompareMode}
        >
          {isCompareMode ? 'Exit Compare' : 'Compare'}
        </Button>
      </div>

      {/* AI Provider Info */}
      {activeZoneData && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          <span className="font-medium">AI Routing:</span>
          <Badge variant="secondary" className="text-xs">{activeZoneData.aiProvider}</Badge>
          <span className="ml-auto">{availableCodes.length} regions available</span>
        </div>
      )}

      {/* Region Chips */}
      <div className="flex flex-wrap gap-2">
        {availableCodes.map((code) => {
          const isSelected = selectedRegion === code;
          const isCompared = compareRegion === code;
          return (
            <Button
              key={code}
              variant={isSelected ? 'default' : isCompared ? 'secondary' : 'outline'}
              size="sm"
              className={cn(
                'text-xs h-8',
                isCompareMode && !isSelected && !isCompared && 'border-dashed',
              )}
              onClick={() => handleRegionClick(code)}
            >
              <MapPin className="mr-1 h-3 w-3" />
              <RegionCodeLabel code={code} />
              {isSelected && <ChevronRight className="ml-1 h-3 w-3" />}
              {isCompared && <span className="ml-1 text-[10px]">(B)</span>}
            </Button>
          );
        })}
        {availableCodes.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">
            No expanded region data found for this zone. Core regions from creative styles may still be available.
          </p>
        )}
      </div>

      {isCompareMode && (
        <p className="text-xs text-muted-foreground italic">
          {!selectedRegion
            ? 'Select a region first, then select a second region to compare.'
            : !compareRegion
              ? 'Now select a second region to compare side-by-side.'
              : 'Comparing two regions below.'}
        </p>
      )}

      <Separator />

      {/* Region Details */}
      {isCompareMode && selectedRegion && compareRegion ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Region A</CardTitle>
            </CardHeader>
            <CardContent>
              <RegionDetail regionCode={selectedRegion} basePrompt={basePrompt} compact />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Region B</CardTitle>
            </CardHeader>
            <CardContent>
              <RegionDetail regionCode={compareRegion} basePrompt={basePrompt} compact />
            </CardContent>
          </Card>
        </div>
      ) : selectedRegion ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Regional Creative Preview
            </CardTitle>
            <CardDescription className="text-xs">
              Full creative adaptation for the selected region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegionDetail regionCode={selectedRegion} basePrompt={basePrompt} />
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Globe className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a region above to preview creative adaptations
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            See companion creatures, music styles, narrative approaches, and more
          </p>
        </div>
      )}
    </div>
  );
}
