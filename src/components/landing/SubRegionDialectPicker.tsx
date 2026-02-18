/**
 * SUB-REGION DIALECT PICKER
 * 
 * Renders a horizontal pill selector for sub-regional dialects on landing pages.
 * Uses REGION_HIERARCHY as the source of truth for available sub-regions,
 * cross-referenced with regional_content_cache for availability badges.
 * 
 * When a dialect is selected, the parent useRegionalTranscreation hook
 * fetches that dialect's cached content automatically.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Languages, ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { REGION_HIERARCHY, type RegionGroup } from '@/config/regionHierarchy';
import type { RegionSlug } from '@/config/regionalLandingConfig';

// Map region slugs to hierarchy group codes
const SLUG_TO_GROUP: Record<string, string> = {
  nam: 'NAM', europe: 'EU', latam: 'LATAM', mena: 'MENA', africa: 'AFRICA',
  india: 'INDIA', sea: 'SEA', cjk: 'CJK', oceania: 'OCEANIA', turkey: 'TURKEY',
  caribbean: 'CARIBBEAN', eastern_europe: 'EURASIA', central_asia: 'CENTRAL_ASIA',
  pakistan: 'PAKISTAN', bangladesh: 'BANGLADESH', south_asia: 'SOUTH_ASIA',
};

interface SubRegionOption {
  code: string;
  name: string;
  flag: string;
  hasContent: boolean;
}

interface SubRegionDialectPickerProps {
  regionSlug: RegionSlug;
  selectedSubRegion: string | null;
  onSubRegionChange: (code: string | null) => void;
  className?: string;
}

export const SubRegionDialectPicker: React.FC<SubRegionDialectPickerProps> = ({
  regionSlug,
  selectedSubRegion,
  onSubRegionChange,
  className = '',
}) => {
  const [subRegions, setSubRegions] = useState<SubRegionOption[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableCodes, setAvailableCodes] = useState<Set<string>>(new Set());

  // Get sub-regions from hierarchy
  useEffect(() => {
    const groupCode = SLUG_TO_GROUP[regionSlug];
    if (!groupCode) return;

    const group = REGION_HIERARCHY.find(g => g.groupCode === groupCode);
    if (!group || group.children.length === 0) return;

    // Flatten children (include nested children too)
    const flatChildren: SubRegionOption[] = [];
    for (const child of group.children) {
      flatChildren.push({
        code: child.code,
        name: child.name,
        flag: child.flag,
        hasContent: false,
      });
    }

    setSubRegions(flatChildren);
  }, [regionSlug]);

  // Check which sub-regions have cached content
  useEffect(() => {
    if (subRegions.length === 0) return;

    const checkAvailability = async () => {
      const { data } = await supabase
        .from('regional_content_cache')
        .select('sub_region_code')
        .eq('region_slug', regionSlug)
        .not('sub_region_code', 'is', null)
        .eq('status', 'approved');

      if (data) {
        const codes = new Set(data.map(r => r.sub_region_code).filter(Boolean) as string[]);
        setAvailableCodes(codes);
        setSubRegions(prev => prev.map(sr => ({
          ...sr,
          hasContent: codes.has(sr.code),
        })));
      }
    };

    checkAvailability();
  }, [regionSlug, subRegions.length]);

  // Don't render if no sub-regions exist for this region
  if (subRegions.length === 0) return null;

  const availableCount = availableCodes.size;
  const selectedOption = subRegions.find(sr => sr.code === selectedSubRegion);

  return (
    <div className={`${className}`}>
      {/* Compact trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all w-full group"
      >
        <Languages className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">
          {selectedOption ? (
            <>{selectedOption.flag} {selectedOption.name}</>
          ) : (
            <>All {subRegions.length} Dialects</>
          )}
        </span>
        {availableCount > 0 && (
          <Badge variant="secondary" className="text-[10px] shrink-0 ml-auto mr-1">
            {availableCount} transcreated
          </Badge>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded picker */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1">
              {/* "All dialects" option */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSubRegion === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onSubRegionChange(null);
                    setIsExpanded(false);
                  }}
                  className="rounded-full text-xs h-8 gap-1.5"
                >
                  <Globe className="h-3 w-3" />
                  Regional Default
                </Button>

                {subRegions.map((sr) => (
                  <Button
                    key={sr.code}
                    variant={selectedSubRegion === sr.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      onSubRegionChange(sr.code);
                      setIsExpanded(false);
                    }}
                    className={`rounded-full text-xs h-8 gap-1.5 ${
                      sr.hasContent 
                        ? 'border-primary/30 hover:border-primary' 
                        : 'opacity-60'
                    }`}
                    disabled={!sr.hasContent}
                    title={sr.hasContent ? `View ${sr.name} transcreation` : `${sr.name} — coming soon`}
                  >
                    <span>{sr.flag}</span>
                    <span className="truncate max-w-[120px]">{sr.name}</span>
                    {sr.hasContent && (
                      <Sparkles className="h-2.5 w-2.5 text-primary" />
                    )}
                  </Button>
                ))}
              </div>

              {availableCount > 0 && availableCount < subRegions.length && (
                <p className="text-[10px] text-muted-foreground mt-2 px-1">
                  {availableCount}/{subRegions.length} dialects transcreated · More coming soon
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubRegionDialectPicker;
