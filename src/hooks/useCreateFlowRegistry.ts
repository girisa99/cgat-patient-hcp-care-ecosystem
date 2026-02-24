/**
 * useCreateFlowRegistry — Bridge between DB-driven content registry and CreateFlowWizard
 *
 * Replaces hardcoded OUTPUT_FORMAT_CONFIGS, scene styles, and content scenarios
 * with DB-driven data from useCastContentRegistry + useContentIntents.
 * Falls back to hardcoded constants if DB is unavailable.
 *
 * Also wires:
 * - Auto-enrichment triggers (Google Places, brand profile) on mode selection
 * - Category → Format → SubFormat cascading dropdown data
 * - Intent-driven style recommendations
 *
 * @see src/hooks/useCastContentRegistry.ts — DB source for categories/formats/styles
 * @see src/hooks/useContentIntents.ts — DB source for intents
 * @see src/services/createFlowOrchestrator.ts — fallback hardcoded data
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useCastContentRegistry, type ContentCategory, type ContentFormat as RegistryFormat, type ContentSubFormat, type VisualStyle, type OutputPreset } from './useCastContentRegistry';
import { useContentIntents, type ContentIntent } from './useContentIntents';
import { fetchLocalBusinessEnrichment, type LocalEnrichmentResult } from '@/lib/api/localBusinessEnrichment';
import { SCRIPT_GEN_MODES, OUTPUT_FORMAT_CONFIGS, type ScriptGenerationMode, type OutputFormatConfig } from '@/services/createFlowOrchestrator';
import type { ContentFormat } from '@/services/pipelineOrchestrator';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateFlowRegistryData {
  // ─── Categories (DB-driven) ────────────────────────────────────────────
  categories: ContentCategory[];
  selectedCategoryId: string | null;
  selectCategory: (id: string | null) => void;

  // ─── Formats (DB-driven with fallback) ─────────────────────────────────
  formats: RegistryFormat[];
  formatsForCategory: RegistryFormat[];
  selectedFormatId: string | null;
  selectFormat: (id: string | null) => void;

  // ─── Sub-Formats (DB-driven) ──────────────────────────────────────────
  subFormats: ContentSubFormat[];
  subFormatsForFormat: ContentSubFormat[];
  selectedSubFormatId: string | null;
  selectSubFormat: (id: string | null) => void;

  // ─── Intents (DB-driven with fallback) ─────────────────────────────────
  intents: ContentIntent[];
  intentsByCategory: Record<string, ContentIntent[]>;
  selectedIntentKey: string | null;
  selectIntent: (key: string | null) => void;

  // ─── Visual Styles (DB-driven) ────────────────────────────────────────
  visualStyles: VisualStyle[];
  parentStyles: VisualStyle[];
  getChildStyles: (parentId: string) => VisualStyle[];

  // ─── Output Presets (DB-driven) ───────────────────────────────────────
  outputPresets: OutputPreset[];

  // ─── Format configs (DB → orchestrator bridge) ────────────────────────
  /** Formats grouped by category for the FormatStep in CreateFlowWizard */
  formatsByCategory: Record<string, OutputFormatConfig[]>;
  /** DB format → orchestrator format key mapping */
  dbFormatToOrchestratorKey: (dbFormatName: string) => ContentFormat | null;

  // ─── Enrichment Triggers ──────────────────────────────────────────────
  /** Auto-trigger enrichment based on selected mode */
  triggerAutoEnrichment: (mode: ScriptGenerationMode, businessName?: string, businessLocation?: string) => Promise<void>;
  /** Google Places enrichment result (when auto-triggered) */
  googlePlacesResult: LocalEnrichmentResult | null;
  /** Whether enrichment is currently loading */
  isEnriching: boolean;
  /** Enrichment error message */
  enrichmentError: string | null;

  // ─── Loading State ────────────────────────────────────────────────────
  isLoading: boolean;
  isRegistryReady: boolean;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCreateFlowRegistry(): CreateFlowRegistryData {
  // ─── DB Sources ────────────────────────────────────────────────────────
  const registry = useCastContentRegistry();
  const { intents: dbIntents, isLoading: intentsLoading } = useContentIntents();

  // ─── Selection State ──────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [selectedSubFormatId, setSelectedSubFormatId] = useState<string | null>(null);
  const [selectedIntentKey, setSelectedIntentKey] = useState<string | null>(null);

  // ─── Enrichment State ─────────────────────────────────────────────────
  const [googlePlacesResult, setGooglePlacesResult] = useState<LocalEnrichmentResult | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);
  const enrichAbort = useRef<AbortController | null>(null);

  // ─── Cascading Format Selection ───────────────────────────────────────
  const formatsForCategory = useMemo(() => {
    if (!selectedCategoryId) return registry.formats;
    return registry.getFormatsForCategory(selectedCategoryId);
  }, [selectedCategoryId, registry.formats, registry.getFormatsForCategory]);

  const subFormatsForFormat = useMemo(() => {
    if (!selectedFormatId) return [];
    return registry.getSubFormatsForFormat(selectedFormatId);
  }, [selectedFormatId, registry.getSubFormatsForFormat]);

  // ─── Reset child selections when parent changes ──────────────────────
  const selectCategory = useCallback((id: string | null) => {
    setSelectedCategoryId(id);
    setSelectedFormatId(null);
    setSelectedSubFormatId(null);
  }, []);

  const selectFormat = useCallback((id: string | null) => {
    setSelectedFormatId(id);
    setSelectedSubFormatId(null);
  }, []);

  const selectSubFormat = useCallback((id: string | null) => {
    setSelectedSubFormatId(id);
  }, []);

  const selectIntent = useCallback((key: string | null) => {
    setSelectedIntentKey(key);
  }, []);

  // ─── Intents grouped by category ─────────────────────────────────────
  const intentsByCategory = useMemo(() => {
    const grouped: Record<string, ContentIntent[]> = {};
    (dbIntents || []).forEach(intent => {
      if (!intent.parent_intent_id) {
        if (!grouped[intent.category]) grouped[intent.category] = [];
        grouped[intent.category].push(intent);
      }
    });
    return grouped;
  }, [dbIntents]);

  // ─── Visual Styles (parent/child hierarchy) ──────────────────────────
  const parentStyles = useMemo(
    () => registry.visualStyles.filter(s => !s.parent_style_id),
    [registry.visualStyles],
  );

  const getChildStyles = useCallback(
    (parentId: string) => registry.visualStyles.filter(s => s.parent_style_id === parentId),
    [registry.visualStyles],
  );

  // ─── DB Format → Orchestrator Key Bridge ─────────────────────────────
  // Maps DB format names (e.g. "short_video") to orchestrator ContentFormat keys
  const dbFormatToOrchestratorKey = useCallback((dbFormatName: string): ContentFormat | null => {
    const normalized = dbFormatName.toLowerCase().replace(/\s+/g, '_');
    if (OUTPUT_FORMAT_CONFIGS[normalized as ContentFormat]) {
      return normalized as ContentFormat;
    }
    // Try partial match
    const keys = Object.keys(OUTPUT_FORMAT_CONFIGS) as ContentFormat[];
    const match = keys.find(k => k.includes(normalized) || normalized.includes(k));
    return match || null;
  }, []);

  // ─── Merged formatsByCategory (DB + fallback) ────────────────────────
  // Uses DB categories if available, falls back to hardcoded OUTPUT_FORMAT_CONFIGS
  const formatsByCategory = useMemo(() => {
    if (registry.formats.length > 0) {
      // DB-driven: group DB formats as OutputFormatConfig-compatible entries
      const grouped: Record<string, OutputFormatConfig[]> = {};
      registry.formats.forEach(dbFmt => {
        const orchKey = dbFormatToOrchestratorKey(dbFmt.name);
        // Use orchestrator config if it exists, else build a minimal config from DB
        const config: OutputFormatConfig = orchKey && OUTPUT_FORMAT_CONFIGS[orchKey]
          ? OUTPUT_FORMAT_CONFIGS[orchKey]
          : {
              format: (dbFmt.name as ContentFormat),
              label: dbFmt.label,
              description: dbFmt.description || '',
              icon: dbFmt.icon,
              category: 'video', // default
              aspectRatios: ['16:9', '9:16', '1:1'],
              durationRange: { min: 15, max: 600 },
              primaryChainId: 'quick_promo',
              supportsTranscreation: true,
              supportsMultiLanguage: true,
              minTier: 'free',
              creditMultiplier: 1,
              canCombine: true,
              crossFormatConversions: [],
            };

        // Group by DB category link or orchestrator category
        const catName = selectedCategoryId
          ? (registry.categories.find(c => c.id === selectedCategoryId)?.name || config.category)
          : config.category;

        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(config);
      });
      return grouped;
    }

    // Fallback: hardcoded
    const grouped: Record<string, OutputFormatConfig[]> = {};
    Object.values(OUTPUT_FORMAT_CONFIGS).forEach(config => {
      if (!grouped[config.category]) grouped[config.category] = [];
      grouped[config.category].push(config);
    });
    return grouped;
  }, [registry.formats, registry.categories, selectedCategoryId, dbFormatToOrchestratorKey]);

  // ─── Auto-Enrichment Trigger ─────────────────────────────────────────
  const triggerAutoEnrichment = useCallback(async (
    mode: ScriptGenerationMode,
    businessName?: string,
    businessLocation?: string,
  ) => {
    const modeConfig = SCRIPT_GEN_MODES[mode];
    if (!modeConfig) return;

    // Cancel any previous enrichment in progress
    if (enrichAbort.current) {
      enrichAbort.current.abort();
    }
    enrichAbort.current = new AbortController();

    // Auto-trigger Google Places enrichment
    if (modeConfig.autoEnrichGooglePlaces && businessName) {
      setIsEnriching(true);
      setEnrichmentError(null);

      try {
        // Parse location into city/state
        const locationParts = (businessLocation || '').split(',').map(s => s.trim());
        const city = locationParts[0] || undefined;
        const state = locationParts[1] || undefined;

        const result = await fetchLocalBusinessEnrichment({
          businessName,
          city,
          state,
        });

        if (result.success && result.data) {
          setGooglePlacesResult(result.data);
          toast.success(`Enriched with Google Places data for "${businessName}"`);
        } else {
          setEnrichmentError(result.error || 'Failed to fetch business data');
          toast.error('Google Places enrichment failed — you can still proceed manually');
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setEnrichmentError(err.message || 'Enrichment failed');
          toast.error('Enrichment request failed');
        }
      } finally {
        setIsEnriching(false);
      }
    }

    // Auto-trigger brand profile enrichment (for modes that support it)
    if (modeConfig.autoEnrichBrand) {
      // Brand enrichment is handled by useUniversalEnrichment
      // which is already wired into the enrichment step.
      // Here we just ensure the flag is set so the enrichment step knows.
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enrichAbort.current) enrichAbort.current.abort();
    };
  }, []);

  // ─── Ready State ─────────────────────────────────────────────────────
  const isRegistryReady = !registry.isLoading && !intentsLoading;

  return {
    // Categories
    categories: registry.categories,
    selectedCategoryId,
    selectCategory,

    // Formats
    formats: registry.formats,
    formatsForCategory,
    selectedFormatId,
    selectFormat,

    // Sub-Formats
    subFormats: registry.subFormats,
    subFormatsForFormat,
    selectedSubFormatId,
    selectSubFormat,

    // Intents
    intents: dbIntents || [],
    intentsByCategory,
    selectedIntentKey,
    selectIntent,

    // Visual Styles
    visualStyles: registry.visualStyles,
    parentStyles,
    getChildStyles,

    // Output Presets
    outputPresets: registry.outputPresets,

    // Format bridge
    formatsByCategory,
    dbFormatToOrchestratorKey,

    // Enrichment
    triggerAutoEnrichment,
    googlePlacesResult,
    isEnriching,
    enrichmentError,

    // Loading
    isLoading: registry.isLoading || intentsLoading,
    isRegistryReady,
  };
}
