/**
 * REGIONAL TRANSCREATION SERVICE
 * 
 * Central bridge that connects ALL existing regional infrastructure
 * to the Universal Script Schema for transcreation (NOT translation).
 * 
 * Data Sources:
 * - genie-cast-regional-creative-config.ts → wardrobe, companions, music, visuals, narrative
 * - regional-routing-registry.ts → LLM providers, TTS voices, zone detection, RTL
 * - regionalContextPrompts.ts → business scene templates
 * 
 * Outputs:
 * - CulturalTraits (for UniversalScriptLine)
 * - VoiceConfig (for UniversalCharacter)
 * - TranscreationDirectionPrompt (for AI script generation)
 * 
 * Supports ALL 16 parent regions → 62+ leaf sub-regions.
 * Parent→child inheritance: leaf overrides parent defaults.
 * 
 * @see src/config/universal-script-schema.ts — consumer of this data
 * @see src/config/genie-cast-regional-creative-config.ts — creative profiles source
 * @see src/config/regional-routing-registry.ts — routing source
 */

import {
  REGIONAL_CREATIVE_PROFILES,
  type RegionalCreativeProfile,
  type SubRegionalCreative,
  type CreativeDirectionSet,
} from '@/config/genie-cast-regional-creative-config';

import {
  REGION_LLM_ROUTING,
  getZoneAIProviders,
  getRegionVoiceOptions,
  getZoneFromRegion,
  isRTLLanguage,
  toLangBCP47,
  type VoiceOption,
  type RegionalZone,
} from '@/config/regional-routing-registry';

import type {
  CulturalTraits,
  VoiceConfig,
  GenieProduct,
  EmotionalTone,
  UniversalScriptLine,
  UniversalCharacter,
} from '@/config/universal-script-schema';
import { DEFAULT_FALLBACK_VOICE } from '@/config/universal-script-schema';

// ─── TYPES ────────────────────────────────────────────────────────────────────

/** Transcreation context for AI-driven cultural adaptation */
export interface TranscreationContext {
  sourceRegion: string;
  targetRegion: string;
  product: GenieProduct;
  industry?: string;
  emotionalTone: EmotionalTone;
  sourceText: string;
  /** How deeply to culturally adapt (light = localize, deep = full reimagine) */
  adaptationLevel: 'light' | 'moderate' | 'deep';
  /** Google Places live data — real reviews, hours, competitors from source business */
  googlePlacesData?: {
    businessName: string;
    rating: number | null;
    totalReviews: number;
    topReviewQuotes: string[];
    editorialSummary: string | null;
    competitorNames: string[];
  };
}

/** Full transcreation profile combining creative + routing + voice data */
export interface TranscreationProfile {
  regionCode: string;
  parentRegion: string;
  culturalTraits: CulturalTraits;
  creativeDirection: CreativeDirectionSet;
  voiceOptions: VoiceOption[];
  llmProvider: string;
  llmModel: string;
  zone: RegionalZone;
  isRTL: boolean;
  locale: string;
}

/** Transcreated manifest wrapper */
export interface TranscreatedOutput {
  regionCode: string;
  scriptLines: UniversalScriptLine[];
  culturalTraits: CulturalTraits;
  provider: string;
  adaptationLevel: string;
  timestamp: string;
}

// ─── CORE: Region → Creative Profile Resolution ──────────────────────────────

/**
 * Find creative profile for a region code (parent or leaf).
 * Inheritance: leaf sub-region overrides parent defaults.
 * 
 * Examples:
 *   'NAM_US' → NAM parent, US sub-region creative
 *   'INDIA_SOUTH_TA' → INDIA parent, INDIA_SOUTH_TA sub-region creative
 *   'MENA' → MENA parent defaults
 *   'EU_DACH' → EU parent, EU_DACH sub-region creative
 */
function findCreativeProfile(regionCode: string): {
  parent: RegionalCreativeProfile | null;
  subRegion: SubRegionalCreative | null;
  creative: CreativeDirectionSet | null;
} {
  const code = regionCode?.toUpperCase() || '';
  
  // 1. Try exact match on parent regionId
  const exactParent = REGIONAL_CREATIVE_PROFILES.find(p => p.regionId === code);
  if (exactParent) {
    return { parent: exactParent, subRegion: null, creative: exactParent.defaults };
  }
  
  // 2. Try exact match on sub-region id
  for (const parent of REGIONAL_CREATIVE_PROFILES) {
    const sub = parent.subRegions.find(s => s.id === code);
    if (sub) {
      return { parent, subRegion: sub, creative: sub.creative };
    }
  }
  
  // 3. Try prefix match (e.g., 'INDIA_SOUTH_TA' → find parent 'INDIA')
  const parts = code.split('_');
  for (let i = parts.length - 1; i >= 1; i--) {
    const prefix = parts.slice(0, i).join('_');
    // Check sub-regions first
    for (const parent of REGIONAL_CREATIVE_PROFILES) {
      const sub = parent.subRegions.find(s => s.id === prefix);
      if (sub) {
        return { parent, subRegion: sub, creative: sub.creative };
      }
    }
    // Check parent
    const parentMatch = REGIONAL_CREATIVE_PROFILES.find(p => p.regionId === prefix);
    if (parentMatch) {
      // Check if original code matches a sub-region
      const subMatch = parentMatch.subRegions.find(s => s.id === code);
      if (subMatch) {
        return { parent: parentMatch, subRegion: subMatch, creative: subMatch.creative };
      }
      return { parent: parentMatch, subRegion: null, creative: parentMatch.defaults };
    }
  }
  
  // 4. Fallback to NAM defaults
  const fallback = REGIONAL_CREATIVE_PROFILES.find(p => p.regionId === 'NAM');
  return { parent: fallback || null, subRegion: null, creative: fallback?.defaults || null };
}

// ─── CORE: CulturalTraits Generation ─────────────────────────────────────────

/**
 * Get CulturalTraits for a region code.
 * This is the primary API — used by UniversalScriptLine.culturalTraits
 * 
 * Covers ALL 16 parent regions → 62+ leaf sub-regions.
 */
export function getTranscreationTraits(regionCode: string): CulturalTraits {
  const { creative } = findCreativeProfile(regionCode);
  if (!creative) {
    return { isRTL: false };
  }
  
  // Detect RTL from region zone
  const zone = getZoneFromRegion(regionCode);
  const rtl = zone === 'mena' || isRTLLanguage(regionCode.split('_').pop()?.toLowerCase() || '');
  
  return {
    wardrobe: creative.characters.wardrobeModifiers[0] || undefined,
    companion: creative.characters.culturalCompanions[0] || undefined,
    setting: creative.visuals.environmentModifiers[0] || undefined,
    artStyle: creative.visuals.motifs.join(', ') || undefined,
    colorPalette: creative.characters.colorInfluence.join(', ') || undefined,
    musicHint: creative.music.instruments[0] || undefined,
    greeting: undefined, // Derived from narrative.storytellingStyle if needed
    isRTL: rtl,
  };
}

/**
 * Get the FULL creative direction set for a region (not just traits).
 * Use when generating AI prompts that need wardrobe lists, music BPM, visual palettes.
 */
export function getFullCreativeDirection(regionCode: string): CreativeDirectionSet | null {
  const { creative } = findCreativeProfile(regionCode);
  return creative;
}

// ─── VOICE ROUTING ───────────────────────────────────────────────────────────

/**
 * Get VoiceConfig for characters in a specific region.
 * Maps regional TTS voices → UniversalCharacter.voice format.
 */
export function getRegionalVoiceRouting(
  regionCode: string,
  characters: Array<{ key: string; gender?: 'male' | 'female' }>,
): Record<string, VoiceConfig> {
  const voices = getRegionVoiceOptions(regionCode);
  const routing: Record<string, VoiceConfig> = {};
  
  for (const char of characters) {
    // Find best voice match by gender preference
    const preferredGender = char.gender || 'female';
    const voice = voices.find(v => v.gender === preferredGender && v.isDefault) 
      || voices.find(v => v.gender === preferredGender)
      || voices[0];
    
    if (voice) {
      routing[char.key] = {
        provider: voice.provider as VoiceConfig['provider'],
        voiceId: voice.voiceId,
        fallbackProvider: DEFAULT_FALLBACK_VOICE.provider,
        fallbackVoice: DEFAULT_FALLBACK_VOICE.voiceId,
        locale: voice.locale,
      };
    }
  }
  
  return routing;
}

// ─── DIRECTION PROMPT ENRICHMENT ─────────────────────────────────────────────

/**
 * Generate a culturally-enriched direction prompt for AI script generation.
 * Used as system/context prompt when generating UniversalScriptLine.direction.
 * 
 * Example output for INDIA_SOUTH_TA:
 * "Character wears silk lungi with tech-textile patterns. Companion: a peacock with 
 *  circuit-feather patterns. Setting: vibrant Bangalore tech park. Expression: warm 
 *  Namaste gestures, head-wobble affirmations. Music: Carnatic electronic fusion with 
 *  veena and mridangam. Pacing: dynamic. Tone: inspiring. Use Tamil cultural references 
 *  and metaphors. Colors: saffron, jasmine white, temple gold."
 */
export function getTranscreationDirectionPrompt(
  regionCode: string,
  emotionalTone: EmotionalTone,
  product: GenieProduct,
  googlePlacesData?: TranscreationContext['googlePlacesData'],
): string {
  const { creative, parent } = findCreativeProfile(regionCode);
  if (!creative) return `Tone: ${emotionalTone}. Product: ${product}.`;
  
  const parts: string[] = [];
  
  // Character direction
  if (creative.characters.wardrobeModifiers.length > 0) {
    parts.push(`Character wears ${creative.characters.wardrobeModifiers.slice(0, 2).join(' or ')}.`);
  }
  if (creative.characters.culturalCompanions.length > 0) {
    parts.push(`Companion: ${creative.characters.culturalCompanions[0]}.`);
  }
  if (creative.visuals.environmentModifiers.length > 0) {
    parts.push(`Setting: ${creative.visuals.environmentModifiers.slice(0, 2).join(', ')}.`);
  }
  parts.push(`Expression: ${creative.characters.expressionStyle}.`);
  
  // Music direction
  if (creative.music.genres.length > 0) {
    parts.push(`Music: ${creative.music.genres.slice(0, 2).join(', ')} with ${creative.music.instruments.slice(0, 2).join(' and ')}.`);
  }
  
  // Narrative direction
  parts.push(`Pacing: ${creative.narrative.pacing}.`);
  parts.push(`Tone: ${emotionalTone}.`);
  parts.push(`Storytelling: ${creative.narrative.storytellingStyle}.`);
  
  if (creative.narrative.coreValues.length > 0) {
    parts.push(`Core values: ${creative.narrative.coreValues.slice(0, 3).join(', ')}.`);
  }
  
  // Visual direction
  if (creative.characters.colorInfluence.length > 0) {
    parts.push(`Colors: ${creative.characters.colorInfluence.slice(0, 4).join(', ')}.`);
  }
  if (creative.visuals.motifs.length > 0) {
    parts.push(`Visual motifs: ${creative.visuals.motifs.slice(0, 3).join(', ')}.`);
  }
  
  // Region context
  if (parent) {
    parts.push(`Region: ${parent.regionName}.`);
  }
  
  // RTL awareness
  const zone = getZoneFromRegion(regionCode);
  if (zone === 'mena') {
    parts.push(`RTL text layout. Arabic script conventions.`);
  }
  
  // Product context
  parts.push(`Product: ${product}.`);

  // Google Places live data — inject REAL business context into transcreation
  if (googlePlacesData) {
    if (googlePlacesData.rating != null) {
      parts.push(`Real business rating: ${googlePlacesData.rating}★ (${googlePlacesData.totalReviews} reviews).`);
    }
    if (googlePlacesData.editorialSummary) {
      parts.push(`About: ${googlePlacesData.editorialSummary}.`);
    }
    if (googlePlacesData.topReviewQuotes.length > 0) {
      parts.push(`Use these real customer quotes for authenticity: "${googlePlacesData.topReviewQuotes[0]}".`);
    }
    if (googlePlacesData.competitorNames.length > 0) {
      parts.push(`Position against competitors: ${googlePlacesData.competitorNames.slice(0, 2).join(', ')}.`);
    }
  }

  return parts.join(' ');
}

// ─── FULL TRANSCREATION PROFILE ──────────────────────────────────────────────

/**
 * Get the complete transcreation profile for a region.
 * Combines creative + routing + voice data into a single object.
 * This is the comprehensive API for downstream consumers.
 */
export function getTranscreationProfile(regionCode: string): TranscreationProfile {
  const { creative, parent } = findCreativeProfile(regionCode);
  const zone = getZoneFromRegion(regionCode);
  const voices = getRegionVoiceOptions(regionCode);
  const providers = getZoneAIProviders(regionCode);
  const recommended = providers.find(p => p.isRecommended) || providers[0];
  const culturalTraits = getTranscreationTraits(regionCode);
  
  // Get language code for locale
  const regionUpper = regionCode.toUpperCase();
  let locale = 'en-US';
  if (voices.length > 0) {
    locale = voices[0].locale;
  }
  
  return {
    regionCode: regionUpper,
    parentRegion: parent?.regionId || 'NAM',
    culturalTraits,
    creativeDirection: creative || REGIONAL_CREATIVE_PROFILES[0].defaults,
    voiceOptions: voices,
    llmProvider: recommended?.id || 'claude',
    llmModel: recommended?.model || 'claude-4',
    zone,
    isRTL: culturalTraits.isRTL || false,
    locale,
  };
}

// ─── BULK OPERATIONS ─────────────────────────────────────────────────────────

/**
 * Get transcreation profiles for multiple regions at once.
 * Useful for multi-region campaign generation.
 */
export function getMultiRegionProfiles(regionCodes: string[]): Record<string, TranscreationProfile> {
  const result: Record<string, TranscreationProfile> = {};
  for (const code of regionCodes) {
    result[code] = getTranscreationProfile(code);
  }
  return result;
}

/**
 * Get ALL available parent regions with their sub-region counts.
 * Useful for region picker UIs.
 */
export function getAllAvailableRegions(): Array<{
  parentId: string;
  parentName: string;
  subRegionCount: number;
  subRegionIds: string[];
}> {
  return REGIONAL_CREATIVE_PROFILES.map(p => ({
    parentId: p.regionId,
    parentName: p.regionName,
    subRegionCount: p.subRegions.length,
    subRegionIds: p.subRegions.map(s => s.id),
  }));
}

/**
 * Validate that a region code exists in the creative profiles.
 */
export function isValidTranscreationRegion(regionCode: string): boolean {
  const { creative } = findCreativeProfile(regionCode);
  return creative !== null;
}

// ─── ENRICHMENT HELPERS ──────────────────────────────────────────────────────

/**
 * Enrich a UniversalScriptLine with regional cultural traits.
 * Call this after AI generates the base script to inject cultural context.
 */
export function enrichScriptLineWithRegion(
  line: UniversalScriptLine,
  regionCode: string,
  emotionalTone?: EmotionalTone,
): UniversalScriptLine {
  const traits = getTranscreationTraits(regionCode);
  const tone = emotionalTone || line.emotionalTone || 'conversational';
  const { creative } = findCreativeProfile(regionCode);
  
  // Build enriched direction
  const baseDirection = line.direction || '';
  const culturalDirection = creative ? [
    creative.characters.expressionStyle,
    `Lighting: ${creative.visuals.lighting}`,
    `Energy: ${creative.visuals.animationEnergy}`,
  ].join('. ') : '';
  
  return {
    ...line,
    culturalTraits: { ...traits, ...line.culturalTraits },
    emotionalTone: tone,
    regionCode,
    direction: baseDirection ? `${baseDirection}. ${culturalDirection}` : culturalDirection,
    // Add regional SFX hints if not already present
    sfx: line.sfx || (creative?.music.instruments.length ? 
      [`ambient-${creative.music.genres[0]?.replace(/\s+/g, '-')}`] : undefined),
  };
}

/**
 * Enrich a UniversalCharacter with regional wardrobe and companion.
 */
export function enrichCharacterWithRegion(
  character: UniversalCharacter,
  regionCode: string,
): UniversalCharacter {
  const { creative } = findCreativeProfile(regionCode);
  if (!creative) return character;
  
  return {
    ...character,
    props: [
      ...(character.props || []),
      ...creative.characters.wardrobeModifiers.slice(0, 1),
    ],
    companion: character.companion || (creative.characters.culturalCompanions[0] ? {
      name: creative.characters.culturalCompanions[0].split(' ')[1] || 'companion',
      description: creative.characters.culturalCompanions[0],
    } : undefined),
    motionStyle: character.motionStyle || (
      creative.visuals.animationEnergy === 'explosive' ? 'energetic' :
      creative.visuals.animationEnergy === 'vibrant' ? 'expressive' :
      creative.visuals.animationEnergy === 'contemplative' ? 'calm' : 'measured'
    ),
    regionalWardrobe: {
      ...character.regionalWardrobe,
      [regionCode]: creative.characters.wardrobeModifiers[0],
    },
  };
}

/**
 * Get music generation prompt enriched with regional cultural music context.
 */
export function getRegionalMusicPrompt(
  regionCode: string,
  sceneContext: string,
  durationSeconds: number,
): string {
  const { creative } = findCreativeProfile(regionCode);
  if (!creative) return `${sceneContext}, ${durationSeconds} seconds`;
  
  return [
    creative.music.samplePrompt,
    `Scene context: ${sceneContext}`,
    `Duration: ${durationSeconds} seconds`,
    `BPM range: ${creative.music.bpmRange[0]}-${creative.music.bpmRange[1]}`,
    `Mood: ${creative.music.mood.join(', ')}`,
  ].join('. ');
}
