/**
 * useCelebrationProduction
 *
 * React hook that wires the celebration registries, cultural preview,
 * pipeline generation, and orchestrator integration together.
 *
 * Provides the main API for the CelebrationCreator UI component.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  getCeremonyType,
  getCeremonyTypesByCategory,
  getAllCategories,
  searchCeremonyTypes,
  getFormatsForCeremony,
  getCategoryDisplayInfo,
  type CeremonyCategory,
  type CeremonyTypeDefinition,
  type CelebrationOutputFormat,
} from '@/config/celebrations/ceremony-type-registry';
import {
  getCulturalOverrideWithFallback,
  type CeremonyCulturalOverride,
} from '@/config/celebrations/ceremony-cultural-config';
import {
  getSceneTemplate,
  getSceneCount,
  getTargetDuration,
  type CeremonySceneTemplate,
} from '@/config/celebrations/ceremony-scene-templates';
import {
  buildCelebrationEnrichmentInput,
  type CelebrationProductionRequest,
  type CelebrationPersonalization,
  type CelebrationPhotos,
  type CelebrationEnrichmentResult,
} from '@/services/celebrations/celebrationProductionBridge';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface CelebrationSelectionState {
  /** Selected ceremony type */
  ceremonyId: string | null;
  /** Selected category tab */
  category: CeremonyCategory | null;
  /** Selected region */
  regionCode: string | null;
  /** Selected subregion */
  subregionCode: string | null;
  /** City name */
  city: string;
  /** Selected output format */
  format: CelebrationOutputFormat | null;
  /** Language code */
  language: string;
  /** Visual style */
  visualStyle: string;
  /** Personalization data */
  personalization: CelebrationPersonalization;
  /** Photos with consent */
  photos: CelebrationPhotos;
  /** Current wizard step (1-6) */
  wizardStep: number;
}

export interface CulturalPreview {
  colorPalette: { primary: string; accent: string };
  symbols: Array<{ name: string; description: string }>;
  music: { genres: string[]; instruments: string[] };
  attire: { primary: string; secondary: string };
  localName: string;
  ritualPhases: string[];
  greetingPhrase?: string;
  blessingPhrase?: string;
  artStyle?: string;
}

const initialSelection: CelebrationSelectionState = {
  ceremonyId: null,
  category: null,
  regionCode: null,
  subregionCode: null,
  city: '',
  format: null,
  language: 'en',
  visualStyle: 'cinematic',
  personalization: {
    names: {},
  },
  photos: {},
  wizardStep: 1,
};

// ─── HOOK ────────────────────────────────────────────────────────────────────

export function useCelebrationProduction() {
  const [selection, setSelection] = useState<CelebrationSelectionState>(initialSelection);
  const [enrichmentResult, setEnrichmentResult] = useState<CelebrationEnrichmentResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Registry Access ─────────────────────────────────────────────────────

  const categories = useMemo(() => getCategoryDisplayInfo(), []);
  const allCategories = useMemo(() => getAllCategories(), []);

  const ceremoniesForCategory = useMemo(() => {
    if (!selection.category) return [];
    return getCeremonyTypesByCategory(selection.category);
  }, [selection.category]);

  const selectedCeremony = useMemo((): CeremonyTypeDefinition | undefined => {
    if (!selection.ceremonyId) return undefined;
    return getCeremonyType(selection.ceremonyId);
  }, [selection.ceremonyId]);

  const availableFormats = useMemo((): CelebrationOutputFormat[] => {
    if (!selection.ceremonyId) return [];
    return getFormatsForCeremony(selection.ceremonyId);
  }, [selection.ceremonyId]);

  // ── Cultural Preview ──────────────────────────────────────────────────

  const culturalPreview = useMemo((): CulturalPreview | null => {
    if (!selection.ceremonyId || !selection.regionCode || !selectedCeremony) return null;

    const regionCode = selection.subregionCode || selection.regionCode;
    const override = getCulturalOverrideWithFallback(
      selection.ceremonyId,
      regionCode,
      selectedCeremony.category,
    );

    return {
      colorPalette: {
        primary: override.colorPalette.primary,
        accent: override.colorPalette.accent,
      },
      symbols: override.symbols.map(s => ({ name: s.name, description: s.description })),
      music: {
        genres: override.music.genres,
        instruments: override.music.instruments,
      },
      attire: {
        primary: override.attire.primary,
        secondary: override.attire.secondary,
      },
      localName: override.localName,
      ritualPhases: override.ritualPhases,
      greetingPhrase: override.narrative.greetingPhrase,
      blessingPhrase: override.narrative.blessingPhrase,
      artStyle: override.artStylePreference,
    };
  }, [selection.ceremonyId, selection.regionCode, selection.subregionCode, selectedCeremony]);

  // ── Scene Template Preview ────────────────────────────────────────────

  const scenePreview = useMemo(() => {
    if (!selection.ceremonyId || !selection.format) return null;

    const template = getSceneTemplate(selection.ceremonyId, selection.format);
    if (!template) return null;

    return {
      scenes: template.scenes.map(s => ({
        key: s.sceneKey,
        title: s.title,
        duration: s.durationRange,
        optional: s.optional,
        productionHint: s.productionHint,
      })),
      sceneCount: getSceneCount(selection.ceremonyId, selection.format),
      targetDuration: getTargetDuration(selection.ceremonyId, selection.format),
    };
  }, [selection.ceremonyId, selection.format]);

  // ── Selection Actions ─────────────────────────────────────────────────

  const selectCategory = useCallback((category: CeremonyCategory) => {
    setSelection(prev => ({ ...prev, category, ceremonyId: null, format: null, wizardStep: 1 }));
  }, []);

  const selectCeremony = useCallback((ceremonyId: string) => {
    setSelection(prev => ({ ...prev, ceremonyId, format: null, wizardStep: 2 }));
  }, []);

  const selectRegion = useCallback((regionCode: string, subregionCode?: string) => {
    setSelection(prev => ({ ...prev, regionCode, subregionCode: subregionCode || null }));
  }, []);

  const setCity = useCallback((city: string) => {
    setSelection(prev => ({ ...prev, city }));
  }, []);

  const selectFormat = useCallback((format: CelebrationOutputFormat) => {
    setSelection(prev => ({ ...prev, format, wizardStep: 4 }));
  }, []);

  const setLanguage = useCallback((language: string) => {
    setSelection(prev => ({ ...prev, language }));
  }, []);

  const setVisualStyle = useCallback((visualStyle: string) => {
    setSelection(prev => ({ ...prev, visualStyle }));
  }, []);

  const updatePersonalization = useCallback((updates: Partial<CelebrationPersonalization>) => {
    setSelection(prev => ({
      ...prev,
      personalization: { ...prev.personalization, ...updates },
    }));
  }, []);

  const updateName = useCallback((role: string, name: string) => {
    setSelection(prev => ({
      ...prev,
      personalization: {
        ...prev.personalization,
        names: { ...prev.personalization.names, [role]: name },
      },
    }));
  }, []);

  const setWizardStep = useCallback((step: number) => {
    setSelection(prev => ({ ...prev, wizardStep: step }));
  }, []);

  const searchCeremonies = useCallback((query: string) => {
    return searchCeremonyTypes(query);
  }, []);

  // ── Pipeline Generation ───────────────────────────────────────────────

  const generateProduction = useCallback((): CelebrationEnrichmentResult | null => {
    if (!selection.ceremonyId || !selection.regionCode || !selection.format) {
      return null;
    }

    setIsGenerating(true);

    const request: CelebrationProductionRequest = {
      ceremonyId: selection.ceremonyId,
      regionCode: selection.regionCode,
      subregionCode: selection.subregionCode || undefined,
      format: selection.format,
      language: selection.language,
      city: selection.city || undefined,
      personalization: selection.personalization,
      visualStyle: selection.visualStyle,
      quality: 'production',
      photos: Object.keys(selection.photos).length > 0 ? selection.photos : undefined,
    };

    const result = buildCelebrationEnrichmentInput(request);
    setEnrichmentResult(result);
    setIsGenerating(false);

    return result;
  }, [selection]);

  // ── Reset ─────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setSelection(initialSelection);
    setEnrichmentResult(null);
    setIsGenerating(false);
  }, []);

  return {
    // Registry access
    categories,
    allCategories,
    ceremoniesForCategory,
    selectedCeremony,
    availableFormats,

    // Cultural preview
    culturalPreview,
    scenePreview,

    // Selection state & actions
    selection,
    selectCategory,
    selectCeremony,
    selectRegion,
    setCity,
    selectFormat,
    setLanguage,
    setVisualStyle,
    updatePersonalization,
    updateName,
    setWizardStep,
    searchCeremonies,

    // Production
    generateProduction,
    enrichmentResult,
    isGenerating,

    // Reset
    reset,
  };
}
