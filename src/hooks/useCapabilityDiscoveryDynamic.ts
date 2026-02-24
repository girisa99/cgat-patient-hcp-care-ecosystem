/**
 * useCapabilityDiscoveryDynamic — DB-driven capability discovery engine
 *
 * Replaces the hardcoded 9-category discovery engine (capabilityDiscoveryEngine.ts)
 * with a fully dynamic approach driven by the cast_content_* DB tables (18 categories,
 * 16 formats, 62+ sub-formats) via useCastContentRegistry.
 *
 * Pipeline resolution uses CATEGORY_REGISTRY (21 pipeline categories, 206 pipelines)
 * and PIPELINE_CHAINS (C1-C42) from the orchestrator layer to compute activated
 * chains, products, pipeline counts, and credit estimates from user selections.
 *
 * @see src/hooks/useCastContentRegistry.ts — DB data source
 * @see src/constants/ecosystemRegistry.ts — CATEGORY_REGISTRY (21 categories)
 * @see src/services/pipelineOrchestrator.ts — PIPELINE_CHAINS (C1-C42)
 * @see src/services/capabilityDiscoveryEngine.ts — legacy hardcoded engine (replaced)
 */

import { useState, useMemo, useCallback } from 'react';
import {
  useCastContentRegistry,
  type ContentCategory,
  type ContentFormat as RegistryContentFormat,
  type ContentSubFormat,
} from './useCastContentRegistry';
import {
  CATEGORY_REGISTRY,
  type CategoryId,
} from '@/constants/ecosystemRegistry';
import {
  PIPELINE_CHAINS,
  type PipelineChain,
} from '@/services/pipelineOrchestrator';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface DiscoverySelection {
  /** Selected industry category — cast_content_categories.id */
  industryCategory: string | null;
  /** Selected format IDs — cast_content_formats.id[] */
  formats: string[];
  /** Selected sub-format IDs — cast_content_sub_formats.id[] */
  contentTypes: string[];
}

export interface DiscoveryResult {
  /** Activated combination chain IDs (e.g. 'business_to_campaign', 'training_manual') */
  activatedChains: string[];
  /** Activated product names (Spark, Mind, Vibe, etc.) */
  activatedProducts: string[];
  /** Total count of individual pipelines across activated categories */
  totalPipelines: number;
  /** Count of available visual styles from the registry */
  availableVisualStyles: number;
  /** Estimated credit range { min, max } */
  estimatedCredits: { min: number; max: number };
  /** Detailed info per activated chain */
  chainDetails: Array<{
    chainId: string;
    name: string;
    product: string;
    pipelineCount: number;
    outputFormats: string[];
  }>;
  /** Whether any activated chain uses Google Places data */
  hasGooglePlaces: boolean;
}

export interface UseCapabilityDiscoveryDynamic {
  // Data from DB
  categories: ContentCategory[];
  formats: RegistryContentFormat[];
  subFormats: ContentSubFormat[];
  isLoading: boolean;

  // Selection state
  selection: DiscoverySelection;
  setIndustryCategory: (id: string | null) => void;
  setFormats: (ids: string[]) => void;
  setContentTypes: (ids: string[]) => void;

  // Computed results
  result: DiscoveryResult;

  // Helpers
  getFormatsForCategory: (categoryId: string) => RegistryContentFormat[];
  getSubFormatsForFormat: (formatId: string) => ContentSubFormat[];
}

// ─── Sub-Format to Pipeline Category Mapping ────────────────────────────────
//
// Maps sub-format names (from cast_content_sub_formats) to pipeline category
// keys (from CATEGORY_REGISTRY in ecosystemRegistry.ts). Each sub-format may
// activate one or more of the 21 pipeline categories. This is the bridge
// between the DB-driven content taxonomy and the pipeline orchestration layer.

export const SUB_FORMAT_TO_PIPELINE_MAP: Record<string, CategoryId[]> = {
  // ─── Video sub-formats ─────────────────────────────────────────────
  explainer_video:         ['video-generation', 'script-generation', 'tts-generation'],
  promo_video:             ['video-generation', 'script-generation', 'distribution'],
  testimonial_video:       ['video-generation', 'video-editing', 'script-generation'],
  product_demo_video:      ['video-generation', 'script-generation', 'visual-design'],
  brand_story_video:       ['video-generation', 'script-generation', 'tts-generation', 'music-generation'],
  tutorial_video:          ['video-generation', 'script-generation', 'tts-generation'],
  short_social_clip:       ['video-generation', 'video-editing', 'distribution'],
  long_form_video:         ['video-generation', 'video-editing', 'script-generation', 'tts-generation'],
  animated_video:          ['video-generation', 'visual-design', 'music-generation'],
  cinematic_video:         ['video-generation', 'avatar-lipsync', 'music-generation'],
  whiteboard_video:        ['video-generation', 'visual-design', 'script-generation'],
  video_remix:             ['video-editing', 'video-generation', 'audio-production'],
  highlight_reel:          ['video-editing', 'video-generation'],
  teaser_trailer:          ['video-editing', 'video-generation', 'music-generation'],
  platform_clips:          ['video-editing', 'distribution'],

  // ─── Podcast & Audio sub-formats ───────────────────────────────────
  podcast_episode:         ['podcast-webcast', 'audio-production', 'tts-generation', 'music-generation'],
  interview_podcast:       ['podcast-webcast', 'audio-production', 'tts-generation'],
  solo_podcast:            ['podcast-webcast', 'audio-production', 'tts-generation', 'script-generation'],
  audio_drama:             ['podcast-webcast', 'audio-production', 'music-generation', 'tts-generation'],
  audiogram:               ['podcast-webcast', 'audio-production', 'video-generation'],
  podcast_from_scratch:    ['podcast-webcast', 'script-generation', 'tts-generation', 'audio-production', 'music-generation'],
  video_podcast:           ['podcast-webcast', 'video-generation', 'avatar-lipsync', 'audio-production'],
  soundscape:              ['audio-production', 'music-generation'],

  // ─── Meeting Intelligence sub-formats ──────────────────────────────
  meeting_recap:           ['script-enhancement', 'script-generation', 'distribution'],
  minutes_of_meeting:      ['script-enhancement', 'script-generation'],
  task_extraction:         ['script-enhancement', 'collaboration'],
  architecture_diagram:    ['visual-design', 'script-enhancement'],
  business_flow_diagram:   ['visual-design', 'script-enhancement'],
  poc_wireframe:           ['visual-design', 'script-enhancement'],
  meeting_follow_up:       ['script-generation', 'distribution', 'marketing'],

  // ─── Website & Digital sub-formats ─────────────────────────────────
  landing_page:            ['presentation', 'visual-design', 'script-generation'],
  full_website:            ['presentation', 'visual-design', 'script-generation', 'distribution'],
  hero_banner:             ['visual-design', 'video-generation'],
  product_page:            ['presentation', 'visual-design', 'script-generation'],
  microsite:               ['presentation', 'visual-design', 'script-generation'],
  interactive_demo:        ['presentation', 'visual-design', '3d-immersive'],
  infographic:             ['visual-design', 'script-generation'],
  animated_infographic:    ['visual-design', 'video-generation', 'script-generation'],

  // ─── Training & Education sub-formats ──────────────────────────────
  training_manual:         ['script-generation', 'visual-design', 'presentation', 'video-generation'],
  course_series:           ['script-generation', 'video-generation', 'tts-generation', 'presentation'],
  kids_book:               ['visual-design', 'video-generation', 'tts-generation', 'music-generation'],
  e_learning_module:       ['script-generation', 'video-generation', 'presentation'],
  tutorial_series:         ['video-generation', 'script-generation', 'tts-generation', 'video-editing'],
  animated_journey:        ['video-generation', 'visual-design', 'script-generation'],
  slide_deck_video:        ['presentation', 'video-generation', 'tts-generation'],
  quiz_assessment:         ['script-generation', 'script-enhancement'],

  // ─── Presentation & Business Docs sub-formats ──────────────────────
  investor_pitch:          ['presentation', 'script-generation', 'visual-design'],
  pitch_deck:              ['presentation', 'script-generation', 'visual-design'],
  sales_deck:              ['presentation', 'script-generation'],
  competitor_battlecard:   ['script-generation', 'visual-design', 'input-processing'],
  whitepaper:              ['script-generation', 'visual-design', 'content-extraction'],
  case_study:              ['script-generation', 'visual-design'],
  executive_summary:       ['script-generation', 'script-enhancement'],

  // ─── Social & Marketing sub-formats ────────────────────────────────
  social_carousel:         ['visual-design', 'script-generation', 'distribution'],
  email_campaign:          ['script-generation', 'marketing', 'distribution'],
  newsletter:              ['script-generation', 'marketing'],
  blog_post:               ['script-generation', 'content-extraction'],
  social_video_ad:         ['video-generation', 'script-generation', 'distribution'],
  instagram_reel:          ['video-generation', 'video-editing', 'distribution'],
  tiktok_video:            ['video-generation', 'video-editing', 'distribution'],
  youtube_short:           ['video-generation', 'video-editing', 'distribution'],
  facebook_video:          ['video-generation', 'distribution'],
  linkedin_video:          ['video-generation', 'script-generation', 'distribution'],

  // ─── Live & Webcast sub-formats ────────────────────────────────────
  webcast_replay:          ['podcast-webcast', 'video-editing', 'script-generation'],
  product_demo_webcast:    ['podcast-webcast', 'video-editing', 'presentation'],
  webinar_replay:          ['podcast-webcast', 'video-editing', 'script-generation'],
  live_recording:          ['podcast-webcast', 'audio-production', 'video-editing'],
  screen_recording:        ['video-editing', 'script-generation', 'tts-generation'],

  // ─── Remix & Repurpose sub-formats ─────────────────────────────────
  video_stitch:            ['video-editing', 'video-generation'],
  testimonial_compilation: ['video-editing', 'video-generation', 'script-generation'],
  ugc_compilation:         ['video-editing', 'video-generation', 'distribution'],
  event_recap:             ['video-editing', 'video-generation', 'script-generation', 'distribution'],
  content_repurpose:       ['video-editing', 'script-generation', 'distribution'],

  // ─── Multilingual & Localization sub-formats ───────────────────────
  transcreation:           ['translation', 'dubbing', 'script-enhancement'],
  dubbing:                 ['dubbing', 'avatar-lipsync', 'tts-generation'],
  subtitle_generation:     ['translation', 'script-generation'],
  multi_language_campaign: ['translation', 'dubbing', 'video-generation', 'distribution'],
  franchise_local:         ['script-generation', 'distribution', 'marketing', 'input-processing'],
};

// ─── Chain-to-Category Mapping ──────────────────────────────────────────────
//
// Maps sub-format names to the PIPELINE_CHAINS keys they most likely activate.
// Built by cross-referencing the CHAIN_GALLERY categories and chain output formats.

const SUB_FORMAT_TO_CHAINS_MAP: Record<string, string[]> = {
  // Video
  explainer_video:         ['business_to_campaign', 'brand_to_video', 'quick_promo'],
  promo_video:             ['quick_promo', 'brand_to_video', 'business_to_campaign'],
  testimonial_video:       ['testimonial_compilation', 'video_remix'],
  product_demo_video:      ['interactive_demo_package', 'webcast_product_demo'],
  brand_story_video:       ['brand_to_video', 'business_to_campaign', 'long_form_production'],
  tutorial_video:          ['screen_to_tutorial', 'recording_to_course'],
  short_social_clip:       ['long_to_shorts', 'video_to_everything'],
  long_form_video:         ['long_form_production', 'business_to_campaign'],
  animated_video:          ['kids_book_animator', 'training_manual'],
  cinematic_video:         ['long_form_production', 'brand_to_video'],
  whiteboard_video:        ['training_manual', 'course_series'],
  video_remix:             ['video_remix'],
  highlight_reel:          ['event_recap_empire', 'video_remix'],
  teaser_trailer:          ['long_form_production', 'video_remix'],
  platform_clips:          ['long_to_shorts', 'video_to_everything'],

  // Podcast & Audio
  podcast_episode:         ['audio_to_podcast', 'podcast_multichannel'],
  interview_podcast:       ['audio_to_podcast', 'record_to_everywhere'],
  solo_podcast:            ['podcast_from_scratch', 'audio_to_podcast'],
  audio_drama:             ['podcast_from_scratch'],
  audiogram:               ['audio_to_podcast', 'record_to_everywhere'],
  podcast_from_scratch:    ['podcast_from_scratch'],
  video_podcast:           ['podcast_to_video_chain', 'podcast_multichannel'],
  soundscape:              ['podcast_from_scratch'],

  // Meeting Intelligence
  meeting_recap:           ['meeting_intelligence', 'live_to_everything'],
  minutes_of_meeting:      ['meeting_intelligence'],
  task_extraction:         ['meeting_intelligence'],
  architecture_diagram:    ['tech_meeting_to_arch'],
  business_flow_diagram:   ['meeting_intelligence'],
  poc_wireframe:           ['tech_meeting_to_arch', 'meeting_intelligence'],
  meeting_follow_up:       ['meeting_intelligence'],

  // Website & Digital
  landing_page:            ['landing_page_quick', 'website_package'],
  full_website:            ['website_package'],
  hero_banner:             ['hero_banner_only', 'website_package'],
  product_page:            ['interactive_demo_package', 'website_package'],
  microsite:               ['website_package'],
  interactive_demo:        ['interactive_demo_package'],
  infographic:             ['whitepaper_package', 'website_package'],
  animated_infographic:    ['training_manual', 'whitepaper_package'],

  // Training & Education
  training_manual:         ['training_manual'],
  course_series:           ['course_series', 'recording_to_course'],
  kids_book:               ['kids_book_animator'],
  e_learning_module:       ['course_series', 'training_manual'],
  tutorial_series:         ['screen_to_tutorial', 'recording_to_course'],
  animated_journey:        ['training_manual'],
  slide_deck_video:        ['training_manual', 'course_series'],
  quiz_assessment:         ['training_manual', 'course_series'],

  // Presentation & Business Docs
  investor_pitch:          ['investor_deck'],
  pitch_deck:              ['investor_deck', 'smart_presentation'],
  sales_deck:              ['smart_presentation'],
  competitor_battlecard:   ['competitor_battlecard'],
  whitepaper:              ['whitepaper_package'],
  case_study:              ['whitepaper_package'],
  executive_summary:       ['smart_presentation'],

  // Social & Marketing
  social_carousel:         ['blog_to_multimedia', 'newsletter_to_social'],
  email_campaign:          ['newsletter_to_social', 'blog_to_multimedia'],
  newsletter:              ['newsletter_to_social'],
  blog_post:               ['blog_to_multimedia', 'video_to_everything'],
  social_video_ad:         ['quick_promo', 'brand_to_video'],
  instagram_reel:          ['long_to_shorts', 'video_to_everything'],
  tiktok_video:            ['long_to_shorts', 'video_to_everything'],
  youtube_short:           ['long_to_shorts', 'video_to_everything'],
  facebook_video:          ['quick_promo', 'brand_to_video'],
  linkedin_video:          ['brand_to_video', 'business_to_campaign'],

  // Live & Webcast
  webcast_replay:          ['webcast_product_demo', 'webinar_replay'],
  product_demo_webcast:    ['webcast_product_demo'],
  webinar_replay:          ['webinar_replay'],
  live_recording:          ['live_to_everything'],
  screen_recording:        ['screen_to_tutorial'],

  // Remix & Repurpose
  video_stitch:            ['video_remix'],
  testimonial_compilation: ['testimonial_compilation'],
  ugc_compilation:         ['ugc_curation'],
  event_recap:             ['event_recap_empire'],
  content_repurpose:       ['video_to_everything', 'blog_to_multimedia'],

  // Multilingual & Localization
  transcreation:           ['transcreation_video', 'multilingual_campaign'],
  dubbing:                 ['transcreation_video', 'multilingual_campaign'],
  subtitle_generation:     ['multilingual_campaign'],
  multi_language_campaign: ['multilingual_campaign', 'franchise_multi_location'],
  franchise_local:         ['franchise_multi_location'],
};

// ─── Google Places chain IDs ────────────────────────────────────────────────
// Chains whose first step is google_places_enrich or that require business data

const GOOGLE_PLACES_CHAINS = new Set([
  'business_to_campaign',
  'brand_to_video',
  'quick_promo',
  'competitor_battlecard',
  'investor_deck',
  'website_package',
  'landing_page_quick',
  'hero_banner_only',
  'whitepaper_package',
  'interactive_demo_package',
  'long_form_production',
  'testimonial_compilation',
  'ab_testing_variants',
  'franchise_multi_location',
  'multilingual_campaign',
  'episodic_series',
  'podcast_from_scratch',
]);

// ─── Product label mapping ──────────────────────────────────────────────────

const PRODUCT_LABELS: Record<string, string> = {
  spark: 'Spark',
  mind: 'Mind',
  vibe: 'Vibe',
  cast: 'Cast',
  deck: 'Deck',
  hub: 'Hub',
  arc: 'Arc',
};

// ─── Hook Implementation ────────────────────────────────────────────────────

export function useCapabilityDiscoveryDynamic(): UseCapabilityDiscoveryDynamic {
  const registry = useCastContentRegistry();

  // ─── Selection state ────────────────────────────────────────────────
  const [selection, setSelection] = useState<DiscoverySelection>({
    industryCategory: null,
    formats: [],
    contentTypes: [],
  });

  const setIndustryCategory = useCallback((id: string | null) => {
    setSelection(prev => ({ ...prev, industryCategory: id }));
  }, []);

  const setFormats = useCallback((ids: string[]) => {
    setSelection(prev => ({ ...prev, formats: ids }));
  }, []);

  const setContentTypes = useCallback((ids: string[]) => {
    setSelection(prev => ({ ...prev, contentTypes: ids }));
  }, []);

  // ─── Resolve selected sub-format names ──────────────────────────────
  const selectedSubFormatNames = useMemo(() => {
    if (selection.contentTypes.length === 0) return [];
    return selection.contentTypes
      .map(id => registry.subFormats.find(sf => sf.id === id))
      .filter((sf): sf is ContentSubFormat => sf !== undefined)
      .map(sf => sf.name);
  }, [selection.contentTypes, registry.subFormats]);

  // ─── Compute activated pipeline categories ──────────────────────────
  const activatedPipelineCategories = useMemo((): CategoryId[] => {
    if (selectedSubFormatNames.length === 0) return [];
    const categorySet = new Set<CategoryId>();
    for (const sfName of selectedSubFormatNames) {
      const mapped = SUB_FORMAT_TO_PIPELINE_MAP[sfName];
      if (mapped) {
        for (const cat of mapped) {
          categorySet.add(cat);
        }
      }
    }
    return Array.from(categorySet);
  }, [selectedSubFormatNames]);

  // ─── Compute activated chains ───────────────────────────────────────
  const activatedChainIds = useMemo((): string[] => {
    if (selectedSubFormatNames.length === 0) return [];
    const chainSet = new Set<string>();
    for (const sfName of selectedSubFormatNames) {
      const mapped = SUB_FORMAT_TO_CHAINS_MAP[sfName];
      if (mapped) {
        for (const chainId of mapped) {
          // Verify chain exists in PIPELINE_CHAINS
          if (PIPELINE_CHAINS[chainId]) {
            chainSet.add(chainId);
          }
        }
      }
    }
    return Array.from(chainSet);
  }, [selectedSubFormatNames]);

  // ─── Compute full result ────────────────────────────────────────────
  const result = useMemo((): DiscoveryResult => {
    // No selection => empty result
    if (activatedChainIds.length === 0 && activatedPipelineCategories.length === 0) {
      return {
        activatedChains: [],
        activatedProducts: [],
        totalPipelines: 0,
        availableVisualStyles: registry.visualStyles.length,
        estimatedCredits: { min: 0, max: 0 },
        chainDetails: [],
        hasGooglePlaces: false,
      };
    }

    // Gather unique products from activated chains
    const productSet = new Set<string>();
    const chainDetails: DiscoveryResult['chainDetails'] = [];
    let totalCreditsMin = 0;
    let totalCreditsMax = 0;
    let hasGooglePlaces = false;

    for (const chainId of activatedChainIds) {
      const chain: PipelineChain = PIPELINE_CHAINS[chainId];
      if (!chain) continue;

      for (const prod of chain.products) {
        productSet.add(PRODUCT_LABELS[prod] || prod);
      }

      const stepCredits = chain.steps.reduce(
        (sum, step) => sum + step.creditMultiplier,
        0,
      );

      chainDetails.push({
        chainId: chain.id,
        name: chain.name,
        product: chain.products.map(p => PRODUCT_LABELS[p] || p).join(', '),
        pipelineCount: chain.steps.length,
        outputFormats: chain.outputFormats as string[],
      });

      // Accumulate credit estimates (min assumes shared steps, max assumes all unique)
      totalCreditsMin += Math.ceil(stepCredits * 0.6);
      totalCreditsMax += stepCredits;

      if (GOOGLE_PLACES_CHAINS.has(chainId)) {
        hasGooglePlaces = true;
      }
    }

    // Also add products from activated pipeline categories
    for (const catId of activatedPipelineCategories) {
      const catEntry = CATEGORY_REGISTRY[catId];
      if (catEntry) {
        productSet.add(PRODUCT_LABELS[catEntry.product] || catEntry.product);
      }
    }

    // Count total pipelines from activated pipeline categories
    let totalPipelines = 0;
    for (const catId of activatedPipelineCategories) {
      const catEntry = CATEGORY_REGISTRY[catId];
      if (catEntry) {
        totalPipelines += catEntry.pipelines;
      }
    }

    return {
      activatedChains: activatedChainIds,
      activatedProducts: Array.from(productSet).sort(),
      totalPipelines,
      availableVisualStyles: registry.visualStyles.length,
      estimatedCredits: {
        min: totalCreditsMin,
        max: totalCreditsMax,
      },
      chainDetails,
      hasGooglePlaces,
    };
  }, [activatedChainIds, activatedPipelineCategories, registry.visualStyles]);

  // ─── Helpers — delegate to registry ─────────────────────────────────
  const getFormatsForCategory = useCallback(
    (categoryId: string): RegistryContentFormat[] => {
      return registry.getFormatsForCategory(categoryId);
    },
    [registry.getFormatsForCategory],
  );

  const getSubFormatsForFormat = useCallback(
    (formatId: string): ContentSubFormat[] => {
      return registry.getSubFormatsForFormat(formatId);
    },
    [registry.getSubFormatsForFormat],
  );

  return {
    // Data from DB
    categories: registry.categories,
    formats: registry.formats,
    subFormats: registry.subFormats,
    isLoading: registry.isLoading,

    // Selection state
    selection,
    setIndustryCategory,
    setFormats,
    setContentTypes,

    // Computed results
    result,

    // Helpers
    getFormatsForCategory,
    getSubFormatsForFormat,
  };
}
