/**
 * useCapabilityDiscovery — React hook for Capability Discovery Engine
 *
 * Provides the UI with browsable, searchable, filterable access to all
 * 42 chains, 50+ formats, 100+ atomic steps organized by categories.
 *
 * Usage:
 * ```tsx
 * const {
 *   categories, selectedCategory, selectCategory,
 *   gallery, selectedChain, selectChain,
 *   outputPreviews, flowSteps, searchResults, search,
 *   inputSummary, selectInput, engineStats,
 * } = useCapabilityDiscovery();
 * ```
 */

import { useState, useMemo, useCallback } from 'react';
import type { InputType } from '@/services/pipelineOrchestrator';
import type {
  DiscoveryCategory,
  CategoryDefinition,
  ChainGalleryCard,
  OutputPreview,
  FlowStep,
  InputPossibility,
} from '@/services/capabilityDiscoveryEngine';
import {
  DISCOVERY_CATEGORIES,
  INPUT_POSSIBILITIES,
  CREATE_FLOW_STEPS,
  getCategoriesForInput,
  getGalleryForCategory,
  getGalleryForTier,
  getOutputPreviewsForChain,
  getFlowStepsForChain,
  searchCapabilities,
  getInputSummary,
  getEngineStats,
} from '@/services/capabilityDiscoveryEngine';

export interface UseCapabilityDiscoveryReturn {
  // Categories
  categories: CategoryDefinition[];
  selectedCategory: DiscoveryCategory | null;
  selectCategory: (category: DiscoveryCategory | null) => void;

  // Gallery
  gallery: ChainGalleryCard[];
  selectedChainId: string | null;
  selectChain: (chainId: string | null) => void;

  // Input
  inputTypes: InputPossibility[];
  selectedInput: InputType | null;
  selectInput: (input: InputType | null) => void;
  inputSummary: ReturnType<typeof getInputSummary> | null;

  // Output previews
  outputPreviews: OutputPreview[];

  // Flow steps
  flowSteps: FlowStep[];

  // Search
  searchQuery: string;
  search: (query: string) => void;
  searchResults: ReturnType<typeof searchCapabilities> | null;

  // Stats
  engineStats: ReturnType<typeof getEngineStats>;

  // Tier filtering
  tier: string;
  setTier: (tier: string) => void;
  tierFilteredGallery: ChainGalleryCard[];
}

export function useCapabilityDiscovery(
  initialTier: string = 'pro',
): UseCapabilityDiscoveryReturn {
  const [selectedCategory, setSelectedCategory] = useState<DiscoveryCategory | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [selectedInput, setSelectedInput] = useState<InputType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tier, setTier] = useState(initialTier);

  // Categories filtered by input type
  const categories = useMemo(() => {
    if (selectedInput) return getCategoriesForInput(selectedInput);
    return DISCOVERY_CATEGORIES;
  }, [selectedInput]);

  // Gallery cards filtered by category
  const gallery = useMemo(() => {
    if (selectedCategory) return getGalleryForCategory(selectedCategory);
    if (selectedInput) {
      const cats = getCategoriesForInput(selectedInput);
      const catIds = new Set(cats.map(c => c.id));
      return getGalleryForTier(tier).filter(card => catIds.has(card.category));
    }
    return getGalleryForTier(tier);
  }, [selectedCategory, selectedInput, tier]);

  // Tier-filtered gallery (all cards the user can access)
  const tierFilteredGallery = useMemo(() => getGalleryForTier(tier), [tier]);

  // Output previews for selected chain
  const outputPreviews = useMemo(() => {
    if (!selectedChainId) return [];
    return getOutputPreviewsForChain(selectedChainId);
  }, [selectedChainId]);

  // Flow steps
  const flowSteps = useMemo(() => {
    if (!selectedChainId) return CREATE_FLOW_STEPS;
    return getFlowStepsForChain(selectedChainId);
  }, [selectedChainId]);

  // Input summary
  const inputSummary = useMemo(() => {
    if (!selectedInput) return null;
    return getInputSummary(selectedInput);
  }, [selectedInput]);

  // Search
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    return searchCapabilities(searchQuery);
  }, [searchQuery]);

  // Engine stats
  const engineStats = useMemo(() => getEngineStats(), []);

  // Actions
  const selectCategory = useCallback((category: DiscoveryCategory | null) => {
    setSelectedCategory(category);
    setSelectedChainId(null);
  }, []);

  const selectChain = useCallback((chainId: string | null) => {
    setSelectedChainId(chainId);
  }, []);

  const selectInput = useCallback((input: InputType | null) => {
    setSelectedInput(input);
    setSelectedCategory(null);
    setSelectedChainId(null);
  }, []);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    categories,
    selectedCategory,
    selectCategory,
    gallery,
    selectedChainId,
    selectChain,
    inputTypes: INPUT_POSSIBILITIES,
    selectedInput,
    selectInput,
    inputSummary,
    outputPreviews,
    flowSteps,
    searchQuery,
    search,
    searchResults,
    engineStats,
    tier,
    setTier,
    tierFilteredGallery,
  };
}
