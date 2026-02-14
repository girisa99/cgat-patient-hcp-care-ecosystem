/**
 * useGenieCastRegions - Persistent Multi-Region Selection for Genie Cast
 * 
 * Global region context that persists across CREATE → PRODUCE → PUBLISH tabs.
 * Uses the same 3-level REGION_HIERARCHY as LandingPageScriptsPanel.
 * Supports multi-region batch selection with parent→zone→country hierarchy.
 * 
 * All downstream operations (LLM routing, TTS, templates, publishing) inherit this context.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  REGION_HIERARCHY,
  getGroupAllCodes,
  getGroupLeafCount,
  getGroupSelectedCount,
  getAllSelectableCodes,
  getTotalLeafCount,
  type RegionGroup,
  type RegionChild,
} from '@/config/regionHierarchy';

// Re-export types for consumer convenience
export type { RegionGroup, RegionChild } from '@/config/regionHierarchy';

// ─── Types ─────────────────────────────────────────────────────────────

export interface RegionSelection {
  selectedCodes: string[];
  updatedAt: string;
}

export interface ResolvedRegionContext {
  /** Parent groups that are fully selected */
  selectedParents: string[];
  /** All selected leaf/zone codes */
  selectedLeafCodes: string[];
  /** Total count of selected leaves */
  totalSelected: number;
  /** Total possible leaves */
  totalAvailable: number;
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

  // Toggle an entire parent group (selects/deselects ALL descendants)
  const toggleGroup = useCallback((group: RegionGroup) => {
    setSelectedCodes(prev => {
      const allCodes = getGroupAllCodes(group);
      const isFullySelected = allCodes.every(c => prev.includes(c));
      if (isFullySelected) {
        return prev.filter(c => !allCodes.includes(c));
      } else {
        return [...new Set([...prev, ...allCodes])];
      }
    });
  }, []);

  // Toggle a zone (mid-level: includes its children if any)
  const toggleZone = useCallback((zone: RegionChild) => {
    setSelectedCodes(prev => {
      const zoneCodes = zone.children
        ? [zone.code, ...zone.children.map(c => c.code)]
        : [zone.code];
      const isFullySelected = zoneCodes.every(c => prev.includes(c));
      if (isFullySelected) {
        return prev.filter(c => !zoneCodes.includes(c));
      } else {
        return [...new Set([...prev, ...zoneCodes])];
      }
    });
  }, []);

  // Toggle a single leaf node
  const toggleLeaf = useCallback((code: string) => {
    setSelectedCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  }, []);

  // Clear all
  const clearAll = useCallback(() => setSelectedCodes([]), []);

  // Select all
  const selectAll = useCallback(() => {
    setSelectedCodes(getAllSelectableCodes());
  }, []);

  // Set specific selection
  const setSelection = useCallback((codes: string[]) => {
    setSelectedCodes(codes);
  }, []);

  // Resolved context
  const resolved: ResolvedRegionContext = useMemo(() => {
    const totalAvailable = getTotalLeafCount();
    const selectedParents = REGION_HIERARCHY
      .filter(g => {
        const leafCount = getGroupLeafCount(g);
        const selCount = getGroupSelectedCount(g, selectedCodes);
        return selCount === leafCount && leafCount > 0;
      })
      .map(g => g.groupCode);

    // Gather all selected leaf codes (not parent group codes)
    const selectedLeafCodes = REGION_HIERARCHY.flatMap(g => {
      if (g.children.length === 0) {
        return (selectedCodes.includes(g.groupCode) || selectedCodes.includes(g.groupCode.toLowerCase()))
          ? [g.groupCode]
          : [];
      }
      return g.children.flatMap(c => {
        if (c.children && c.children.length > 0) {
          return c.children.filter(gc => selectedCodes.includes(gc.code)).map(gc => gc.code);
        }
        return selectedCodes.includes(c.code) ? [c.code] : [];
      });
    });

    return {
      selectedParents,
      selectedLeafCodes,
      totalSelected: selectedLeafCodes.length,
      totalAvailable,
      hasSelection: selectedLeafCodes.length > 0,
    };
  }, [selectedCodes]);

  // Summary label for display
  const summaryLabel = useMemo((): string => {
    if (resolved.totalSelected === 0) return 'No regions';
    if (resolved.totalSelected === resolved.totalAvailable) return `All regions (${resolved.totalAvailable})`;
    if (resolved.selectedParents.length === 1 && resolved.totalSelected <= 8) {
      const group = REGION_HIERARCHY.find(g => g.groupCode === resolved.selectedParents[0]);
      return `${group?.groupName || resolved.selectedParents[0]} (${resolved.totalSelected})`;
    }
    if (resolved.selectedParents.length > 0) {
      return `${resolved.selectedParents.length} regions (${resolved.totalSelected} sub)`;
    }
    return `${resolved.totalSelected} sub-region${resolved.totalSelected > 1 ? 's' : ''}`;
  }, [resolved]);

  // Check group selection status
  const getGroupStatus = useCallback((group: RegionGroup): 'all' | 'partial' | 'none' => {
    const leafCount = getGroupLeafCount(group);
    const selCount = getGroupSelectedCount(group, selectedCodes);
    if (selCount === 0) return 'none';
    if (selCount === leafCount) return 'all';
    return 'partial';
  }, [selectedCodes]);

  // Check zone selection status
  const getZoneStatus = useCallback((zone: RegionChild): 'all' | 'partial' | 'none' => {
    if (!zone.children || zone.children.length === 0) {
      return selectedCodes.includes(zone.code) ? 'all' : 'none';
    }
    const total = zone.children.length;
    const selected = zone.children.filter(c => selectedCodes.includes(c.code)).length;
    if (selected === 0) return 'none';
    if (selected === total) return 'all';
    return 'partial';
  }, [selectedCodes]);

  return {
    selectedCodes,
    resolved,
    summaryLabel,
    toggleGroup,
    toggleZone,
    toggleLeaf,
    clearAll,
    selectAll,
    setSelection,
    getGroupStatus,
    getZoneStatus,
    hierarchy: REGION_HIERARCHY,
  };
}

export type UseGenieCastRegionsReturn = ReturnType<typeof useGenieCastRegions>;
