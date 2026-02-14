/**
 * useGenieCastRegions - Persistent Multi-Region Selection for Genie Cast
 * 
 * Global region context that persists across CREATE → PRODUCE → PUBLISH tabs.
 * Supports multi-region batch selection with parent→sub-region hierarchy.
 * All downstream operations (LLM routing, TTS, templates, publishing) inherit this context.
 * 
 * Uses localStorage for persistence across tab changes and refreshes.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  MASTER_REGION_GROUPS,
  ALL_REGIONS,
  toggleParentRegion,
  getRegionAIRouting,
  getLanguagesForRegions,
  type RegionGroupConfig,
  type SubRegionConfig,
} from '@/config/regionConfig';

// ─── Types ─────────────────────────────────────────────────────────────

export interface RegionSelection {
  /** All selected codes (parent names + sub-region codes) */
  selectedCodes: string[];
  /** Timestamp of last update */
  updatedAt: string;
}

export interface ResolvedRegionContext {
  /** Parent region names that are fully selected (all subs included) */
  selectedParents: string[];
  /** Individual sub-region codes selected */
  selectedSubRegions: SubRegionConfig[];
  /** Aggregated languages across all selected regions */
  languages: { value: string; label: string }[];
  /** Per-region AI routing map: regionCode → { llm, ttsProvider, ttsLocale } */
  routingMap: Record<string, { llm: string; ttsProvider: string; ttsLocale: string }>;
  /** Total count of selected sub-regions */
  totalSubRegions: number;
  /** Whether any region is selected */
  hasSelection: boolean;
}

const STORAGE_KEY = 'genie-cast-regions';

const loadPersistedSelection = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: RegionSelection = JSON.parse(stored);
      return parsed.selectedCodes || [];
    }
  } catch (e) {
    console.warn('[useGenieCastRegions] Failed to load:', e);
  }
  return [];
};

// ─── Hook ──────────────────────────────────────────────────────────────

export function useGenieCastRegions() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(loadPersistedSelection);

  // Persist to localStorage
  useEffect(() => {
    try {
      const data: RegionSelection = {
        selectedCodes,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[useGenieCastRegions] Failed to save:', e);
    }
  }, [selectedCodes]);

  // Toggle a parent region (selects/deselects all sub-regions)
  const toggleParent = useCallback((parentName: string) => {
    setSelectedCodes(prev => toggleParentRegion(parentName, prev));
  }, []);

  // Toggle a single sub-region
  const toggleSubRegion = useCallback((subCode: string) => {
    setSelectedCodes(prev => {
      if (prev.includes(subCode)) {
        // Also remove parent if it was selected
        const group = MASTER_REGION_GROUPS.find(g =>
          g.regions.some(r => r.code === subCode)
        );
        const parentName = group?.parent;
        return prev.filter(c => c !== subCode && c !== parentName);
      } else {
        // Add sub-region; if all subs now selected, also add parent
        const newCodes = [...prev, subCode];
        const group = MASTER_REGION_GROUPS.find(g =>
          g.regions.some(r => r.code === subCode)
        );
        if (group) {
          const allSubsSelected = group.regions.every(r => newCodes.includes(r.code));
          if (allSubsSelected && !newCodes.includes(group.parent)) {
            newCodes.push(group.parent);
          }
        }
        return newCodes;
      }
    });
  }, []);

  // Set specific selection (for programmatic use)
  const setSelection = useCallback((codes: string[]) => {
    setSelectedCodes(codes);
  }, []);

  // Clear all selections
  const clearAll = useCallback(() => {
    setSelectedCodes([]);
  }, []);

  // Select all regions
  const selectAll = useCallback(() => {
    const allCodes = MASTER_REGION_GROUPS.flatMap(g => [
      g.parent,
      ...g.regions.map(r => r.code),
    ]);
    setSelectedCodes(allCodes);
  }, []);

  // Resolved context — computed from selections
  const resolved: ResolvedRegionContext = useMemo(() => {
    const selectedParents = MASTER_REGION_GROUPS
      .filter(g => selectedCodes.includes(g.parent))
      .map(g => g.parent);

    const selectedSubRegions = ALL_REGIONS.filter(r => selectedCodes.includes(r.code));
    
    const languages = getLanguagesForRegions(selectedCodes);

    const routingMap: Record<string, { llm: string; ttsProvider: string; ttsLocale: string }> = {};
    selectedSubRegions.forEach(sub => {
      routingMap[sub.code] = getRegionAIRouting(sub.code);
    });

    return {
      selectedParents,
      selectedSubRegions,
      languages,
      routingMap,
      totalSubRegions: selectedSubRegions.length,
      hasSelection: selectedSubRegions.length > 0,
    };
  }, [selectedCodes]);

  // Check if a parent is fully selected (all subs selected)
  const isParentFullySelected = useCallback((parentName: string): boolean => {
    const group = MASTER_REGION_GROUPS.find(g => g.parent === parentName);
    if (!group) return false;
    return group.regions.every(r => selectedCodes.includes(r.code));
  }, [selectedCodes]);

  // Check if a parent is partially selected (some subs selected)
  const isParentPartiallySelected = useCallback((parentName: string): boolean => {
    const group = MASTER_REGION_GROUPS.find(g => g.parent === parentName);
    if (!group) return false;
    const selectedCount = group.regions.filter(r => selectedCodes.includes(r.code)).length;
    return selectedCount > 0 && selectedCount < group.regions.length;
  }, [selectedCodes]);

  // Get summary label for display
  const summaryLabel = useMemo((): string => {
    if (resolved.totalSubRegions === 0) return 'No regions';
    if (resolved.totalSubRegions === ALL_REGIONS.length) return 'All regions';
    
    if (resolved.selectedParents.length === 1 && resolved.totalSubRegions <= 6) {
      return `${resolved.selectedParents[0]} (${resolved.totalSubRegions})`;
    }
    if (resolved.selectedParents.length > 0) {
      return `${resolved.selectedParents.length} regions (${resolved.totalSubRegions} sub)`;
    }
    return `${resolved.totalSubRegions} sub-region${resolved.totalSubRegions > 1 ? 's' : ''}`;
  }, [resolved]);

  return {
    // State
    selectedCodes,
    resolved,
    summaryLabel,
    
    // Actions
    toggleParent,
    toggleSubRegion,
    setSelection,
    clearAll,
    selectAll,
    
    // Helpers
    isParentFullySelected,
    isParentPartiallySelected,
    
    // Static data
    regionGroups: MASTER_REGION_GROUPS,
  };
}

export type UseGenieCastRegionsReturn = ReturnType<typeof useGenieCastRegions>;
