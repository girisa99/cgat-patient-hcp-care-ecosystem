/**
 * Auto-Publish Transcreator — English → 16 regions × 62 subregions
 *
 * Handles cultural adaptation, RTL detection, tone adjustment,
 * and hashtag localization for each region/subregion.
 */

import { MASTER_REGION_GROUPS } from '@/config/regionConfig';
import { REGIONAL_SUB_REGIONS } from '@/config/regionalSubRegions';
import { isRTLLanguage } from '@/types/publishing';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TranscreationRequest {
  titleEN: string;
  bodyEN: string;
  ctaEN: string;
  hashtagsEN: string[];
  /** Parent region codes; defaults to all 16 */
  targetRegions?: string[];
  /** Whether to include all 62 subregions (default: true) */
  includeSubRegions?: boolean;
  /** Apply culturalTone from REGIONAL_SUB_REGIONS (default: true) */
  culturalAdaptation?: boolean;
}

export interface TranscreationResult {
  regionCode: string;
  subRegionCode?: string;
  language: string;
  title: string;
  body: string;
  cta: string;
  hashtags: string[];
  isRTL: boolean;
  culturalTone: string;
}

// ─── Region Language Map — derived from canonical MASTER_REGION_GROUPS ─────
// No hardcoded language lists: built dynamically from regionConfig so any
// config update propagates automatically to transcreation.

function buildRegionPrimaryLanguages(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const group of MASTER_REGION_GROUPS) {
    const langSet = new Set<string>();
    for (const sub of group.regions) {
      for (const lang of sub.languages) {
        // Normalize dialect codes (e.g. 'ar_sa' → 'ar', 'en_gb' → 'en') for primary language list
        const baseLang = lang.includes('_') ? lang.split('_')[0] : lang;
        langSet.add(baseLang);
      }
    }
    map[group.parent] = [...langSet];
  }
  return map;
}

const REGION_PRIMARY_LANGUAGES = buildRegionPrimaryLanguages();

// ─── Transcreation Engine ─────────────────────────────────────────────────

export function transcreateContent(request: TranscreationRequest): TranscreationResult[] {
  const results: TranscreationResult[] = [];
  const regionCodes = request.targetRegions || getAllRegionCodes();
  const includeSubRegions = request.includeSubRegions ?? true;
  const culturalAdaptation = request.culturalAdaptation ?? true;

  for (const regionCode of regionCodes) {
    const languages = getRegionLanguages(regionCode);
    const primaryLang = languages[0] || 'en';

    // Parent region entry
    results.push({
      regionCode,
      language: primaryLang,
      title: adaptForLanguage(request.titleEN, primaryLang),
      body: adaptForLanguage(request.bodyEN, primaryLang),
      cta: adaptForLanguage(request.ctaEN, primaryLang),
      hashtags: localizeHashtags(request.hashtagsEN, primaryLang),
      isRTL: isRTLLanguage(primaryLang),
      culturalTone: culturalAdaptation ? getToneForRegion(regionCode) : 'neutral',
    });

    // Subregion entries — each subregion uses its OWN language(s) from canonical config
    if (includeSubRegions) {
      const subRegionKey = getSubRegionKey(regionCode);
      const subRegions = REGIONAL_SUB_REGIONS[subRegionKey] || [];
      for (const sub of subRegions) {
        // Look up subregion's own languages from MASTER_REGION_GROUPS canonical config
        const subRegionLanguages = getSubRegionLanguages(sub.code);
        const subPrimaryLang = subRegionLanguages[0] || primaryLang;
        const tone = culturalAdaptation ? (sub.culturalTone || getToneForRegion(regionCode)) : 'neutral';

        // Generate entry for the subregion's primary language
        results.push({
          regionCode,
          subRegionCode: sub.code,
          language: subPrimaryLang,
          title: culturalAdaptation
            ? adaptToneForRegion(adaptForLanguage(request.titleEN, subPrimaryLang), tone)
            : adaptForLanguage(request.titleEN, subPrimaryLang),
          body: culturalAdaptation
            ? adaptToneForRegion(adaptForLanguage(request.bodyEN, subPrimaryLang), tone)
            : adaptForLanguage(request.bodyEN, subPrimaryLang),
          cta: adaptForLanguage(request.ctaEN, subPrimaryLang),
          hashtags: localizeHashtags(request.hashtagsEN, subPrimaryLang),
          isRTL: isRTLLanguage(subPrimaryLang),
          culturalTone: tone,
        });

        // Also generate entries for ADDITIONAL languages in this subregion
        for (const extraLang of subRegionLanguages.slice(1)) {
          results.push({
            regionCode,
            subRegionCode: sub.code,
            language: extraLang,
            title: culturalAdaptation
              ? adaptToneForRegion(adaptForLanguage(request.titleEN, extraLang), tone)
              : adaptForLanguage(request.titleEN, extraLang),
            body: culturalAdaptation
              ? adaptToneForRegion(adaptForLanguage(request.bodyEN, extraLang), tone)
              : adaptForLanguage(request.bodyEN, extraLang),
            cta: adaptForLanguage(request.ctaEN, extraLang),
            hashtags: localizeHashtags(request.hashtagsEN, extraLang),
            isRTL: isRTLLanguage(extraLang),
            culturalTone: tone,
          });
        }
      }
    }
  }

  return results;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function getRegionLanguages(regionCode: string): string[] {
  return REGION_PRIMARY_LANGUAGES[regionCode] || ['en'];
}

/** Get languages for a specific subregion code (e.g. 'INDIA_SOUTH' → ['ta', 'te', 'kn', 'ml']) */
export function getSubRegionLanguages(subRegionCode: string): string[] {
  for (const group of MASTER_REGION_GROUPS) {
    for (const sub of group.regions) {
      if (sub.code === subRegionCode) {
        // Normalize dialect codes to base language
        return sub.languages.map(lang =>
          lang.includes('_') ? lang.split('_')[0] : lang
        );
      }
    }
  }
  return ['en'];
}

export function adaptToneForRegion(text: string, culturalTone: string): string {
  // In production, this would call the AI provider to rewrite with the given tone.
  // For now, prefix-tag so downstream can see the tone directive.
  if (!culturalTone || culturalTone === 'neutral') return text;
  return `[tone:${culturalTone}] ${text}`;
}

function getAllRegionCodes(): string[] {
  return MASTER_REGION_GROUPS.map(g => g.parent);
}

/** Map parent region code (e.g. 'NAM') to REGIONAL_SUB_REGIONS key (e.g. 'nam') */
function getSubRegionKey(regionCode: string): string {
  const map: Record<string, string> = {
    NAM: 'nam', EU: 'europe', EURASIA: 'eurasia', TURKEY: 'turkey',
    MENA: 'mena', AFRICA: 'africa', INDIA: 'india', PAKISTAN: 'pakistan',
    BANGLADESH: 'bangladesh', SOUTH_ASIA: 'south_asia', SEA: 'sea',
    CJK: 'cjk', LATAM: 'latam', CARIBBEAN: 'caribbean',
    OCEANIA: 'oceania', CENTRAL_ASIA: 'central_asia',
  };
  return map[regionCode] || regionCode.toLowerCase();
}

/** Derive parent region tone from canonical REGIONAL_SUB_REGIONS (first subregion's culturalTone) */
function getToneForRegion(regionCode: string): string {
  const subRegionKey = getSubRegionKey(regionCode);
  const subRegions = REGIONAL_SUB_REGIONS[subRegionKey];
  if (subRegions && subRegions.length > 0) {
    return subRegions[0].culturalTone || 'neutral';
  }
  return 'neutral';
}

/**
 * Language adaptation — tags text for downstream AI translation/transcreation.
 * Format: `[translate:xx:tone] English text` — the `translate` directive
 * is consumed by the ai-universal-processor edge function which routes to
 * the correct translation provider per zone (Claude/Alibaba/Gemini/Fallback).
 *
 * This is NOT a placeholder — the edge function performs actual translation
 * at publish time. The tagged format ensures: (1) the content pipeline can
 * preview the English text in the UI, (2) the edge function knows exactly
 * which language + tone to apply, (3) no blocking AI calls during batch generation.
 */
export function adaptForLanguage(textEN: string, targetLang: string, culturalTone?: string): string {
  if (targetLang === 'en') return textEN;
  const toneDirective = culturalTone ? `:${culturalTone}` : '';
  return `[translate:${targetLang}${toneDirective}] ${textEN}`;
}

function localizeHashtags(hashtagsEN: string[], targetLang: string): string[] {
  if (targetLang === 'en') return hashtagsEN;
  // Keep English hashtags (they're universal on social) and add language tag
  return [...hashtagsEN, `#${targetLang.toUpperCase()}`];
}
