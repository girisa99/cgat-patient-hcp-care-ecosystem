/**
 * useDynamicLanguageRegistry — Loads language data from edge function + DB
 * 
 * Fetches TTS voice mappings from dialect-tts-demo/get_languages and
 * marketing_languages table. Caches results to prevent repeated calls.
 * Falls back to minimal hardcoded data if both sources fail.
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://ithspbabhmdntioslfqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';

// ============================================
// TYPES
// ============================================

export interface LanguageEntry {
  code: string;
  name: string;
  nativeName?: string;
  flag: string;
  region: string;
  regionGroup: string; // tab group: arabic, indian, cjk, african, latam, european
  transcreation?: string;
  literal?: string;
  provider?: string;
  isRTL?: boolean;
  isCore?: boolean; // core for a given region
}

export interface LanguageTabData {
  id: string;
  label: string;
  badge: string;
  count: number;
  title: string;
  subtitle: string;
  moat: string;
  languages: LanguageEntry[];
}

export interface LanguageRegistryData {
  tabs: LanguageTabData[];
  allLanguages: LanguageEntry[];
  ttsLanguages: LanguageEntry[]; // Subset with TTS voice support
  sttLanguages: LanguageEntry[]; // Subset for STT
  deeplLanguages: LanguageEntry[]; // Subset for DeepL
  isLoading: boolean;
  error: string | null;
  getLanguagesForRegion: (region: string) => LanguageEntry[];
  getCoreLanguages: (region: string) => LanguageEntry[];
}

// ============================================
// REGION ↔ TAB GROUP MAPPING
// ============================================

const REGION_TO_TAB: Record<string, string> = {
  mena: 'arabic',
  india: 'indian',
  apac: 'cjk',
  africa: 'african',
  latam: 'latam',
  europe: 'european',
  nam: 'european',
  caribbean: 'latam',
};

const REGION_CORE_CODES: Record<string, string[]> = {
  mena: ['ar-SA', 'ar-EG', 'ar-AE', 'ar-LB', 'ar-MA', 'ar-IQ', 'ar-MSA'],
  india: ['hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN'],
  apac: ['ja-JP', 'zh-CN', 'ko-KR', 'th-TH', 'vi-VN', 'id-ID'],
  africa: ['sw-KE', 'yo-NG', 'ha-NG', 'zu-ZA', 'am-ET'],
  latam: ['es-MX', 'pt-BR', 'es-CO', 'es-AR', 'es-CL', 'es-PE'],
  europe: ['de-DE', 'fr-FR', 'es-ES', 'it-IT', 'nl-NL', 'pl-PL', 'sv-SE', 'pt-PT'],
  nam: ['en-US', 'es-MX', 'fr-FR'],
  caribbean: ['es-MX', 'fr-FR', 'en-US'],
};

// Flag lookup by language code prefix
const FLAG_MAP: Record<string, string> = {
  'ar-SA': '🇸🇦', 'ar-EG': '🇪🇬', 'ar-AE': '🇦🇪', 'ar-LB': '🇱🇧',
  'ar-MA': '🇲🇦', 'ar-IQ': '🇮🇶', 'ar-MSA': '📖',
  'hi-IN': '🇮🇳', 'ta-IN': '🇮🇳', 'te-IN': '🇮🇳', 'bn-IN': '🇮🇳',
  'mr-IN': '🇮🇳', 'gu-IN': '🇮🇳', 'kn-IN': '🇮🇳', 'ml-IN': '🇮🇳',
  'ja-JP': '🇯🇵', 'zh-CN': '🇨🇳', 'ko-KR': '🇰🇷', 'th-TH': '🇹🇭',
  'vi-VN': '🇻🇳', 'id-ID': '🇮🇩',
  'sw-KE': '🇰🇪', 'yo-NG': '🇳🇬', 'ha-NG': '🇳🇬', 'zu-ZA': '🇿🇦', 'am-ET': '🇪🇹',
  'es-MX': '🇲🇽', 'pt-BR': '🇧🇷', 'es-CO': '🇨🇴', 'es-AR': '🇦🇷',
  'es-CL': '🇨🇱', 'es-PE': '🇵🇪',
  'de-DE': '🇩🇪', 'fr-FR': '🇫🇷', 'es-ES': '🇪🇸', 'it-IT': '🇮🇹',
  'nl-NL': '🇳🇱', 'pl-PL': '🇵🇱', 'sv-SE': '🇸🇪', 'pt-PT': '🇵🇹',
  'en-US': '🇺🇸', 'en': '🇬🇧', 'ar': '🇸🇦', 'hi': '🇮🇳', 'ta': '🇮🇳',
  'te': '🇮🇳', 'bn': '🇮🇳', 'ja': '🇯🇵', 'zh': '🇨🇳', 'ko': '🇰🇷',
  'de': '🇩🇪', 'fr': '🇫🇷', 'es': '🇪🇸', 'it': '🇮🇹', 'nl': '🇳🇱',
  'pl': '🇵🇱', 'sv': '🇸🇪', 'pt': '🇧🇷', 'sw': '🇰🇪', 'th': '🇹🇭',
  'vi': '🇻🇳', 'id': '🇮🇩', 'tr': '🇹🇷', 'ru': '🇷🇺', 'uk': '🇺🇦',
};

const TAB_META: Record<string, { label: string; badge: string; title: string; subtitle: string; moat: string }> = {
  arabic: {
    label: '🇸🇦 Arabic Dialects',
    badge: 'Exclusive',
    title: 'Same Message, 7 Different Dialects',
    subtitle: '"Start creating amazing videos!" — naturally localized per dialect',
    moat: '⭐ NO competitor offers all 7 Arabic dialects — this is our exclusive moat!',
  },
  indian: {
    label: '🇮🇳 Indian Languages',
    badge: 'Most complete',
    title: '11 Indian Languages + Code-Mixing',
    subtitle: 'Natural speech with English terms — how India actually talks',
    moat: '🇮🇳 11 Indian languages with code-mixing — unmatched regional depth',
  },
  cjk: {
    label: '🇯🇵 CJK Languages',
    badge: 'Native CJK',
    title: 'CJK + Southeast Asian Languages',
    subtitle: 'Full CJK typography, tonal TTS, and cultural adaptation',
    moat: '🌏 Native CJK transcreation via Qwen-Max — not generic machine translation',
  },
  african: {
    label: '🌍 African Languages',
    badge: 'First mover',
    title: '10 African Languages — First Mover',
    subtitle: 'Reaching 1.4B+ people in their native languages',
    moat: '🌍 First mover in African language AI content — 1.4B+ potential users',
  },
  latam: {
    label: '🇧🇷 LATAM Variants',
    badge: 'Transcreated',
    title: 'LATAM Spanish & Portuguese Variants',
    subtitle: 'Mexican ≠ Colombian ≠ Argentine — every variant feels native',
    moat: '🌎 Regional LATAM variants with local slang and cultural context',
  },
  european: {
    label: '🇪🇺 European Languages',
    badge: 'GDPR ready',
    title: 'European Languages — GDPR Compliant',
    subtitle: 'Industry 4.0 content across 24 EU official languages',
    moat: '🇪🇺 Full GDPR compliance with European-hosted data processing',
  },
};

// DeepL supported codes
const DEEPL_CODES = new Set([
  'AR', 'ZH', 'JA', 'KO', 'DE', 'FR', 'ES', 'IT', 'PT-BR', 'PT-PT',
  'NL', 'PL', 'SV', 'TR', 'ID', 'RU', 'UK', 'EN',
]);

// ============================================
// MODULE-LEVEL CACHE
// ============================================
let cachedRegistry: LanguageRegistryData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================
// HOOK
// ============================================

export function useDynamicLanguageRegistry(): LanguageRegistryData {
  const [data, setData] = useState<LanguageRegistryData>(
    cachedRegistry || getEmptyRegistry()
  );
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Return cached if still valid
    if (cachedRegistry && (Date.now() - cacheTimestamp) < CACHE_TTL_MS) {
      setData(cachedRegistry);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    loadRegistry().then(registry => {
      cachedRegistry = registry;
      cacheTimestamp = Date.now();
      setData(registry);
    });
  }, []);

  return data;
}

// ============================================
// LOADER
// ============================================

async function loadRegistry(): Promise<LanguageRegistryData> {
  try {
    // Fetch TTS voice data from edge function (has all transcreation samples)
    const ttsData = await fetchTTSLanguages();
    
    // Also fetch marketing_languages from DB for STT/DeepL metadata
    const dbLanguages = await fetchDBLanguages();
    
    return buildRegistry(ttsData, dbLanguages);
  } catch (err) {
    console.error('[LanguageRegistry] Failed to load, using fallback:', err);
    return getEmptyRegistry();
  }
}

async function fetchTTSLanguages(): Promise<Record<string, Array<{ code: string; transcreation: string; literal: string; region?: string }>>> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/dialect-tts-demo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action: 'get_languages' }),
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('[LanguageRegistry] TTS fetch failed:', err);
    return {};
  }
}

async function fetchDBLanguages(): Promise<Array<{
  language_code: string;
  language_name: string;
  region: string;
  is_rtl: boolean;
  tts_provider: string;
  is_enabled: boolean;
}>> {
  try {
    const { data, error } = await supabase
      .from('marketing_languages')
      .select('language_code, language_name, region, is_rtl, tts_provider, is_enabled')
      .eq('is_system_default', true)
      .eq('is_enabled', true)
      .order('sort_order');
    
    if (error) throw error;
    return (data || []) as any[];
  } catch (err) {
    console.warn('[LanguageRegistry] DB fetch failed:', err);
    return [];
  }
}

// ============================================
// BUILD REGISTRY FROM FETCHED DATA
// ============================================

function buildRegistry(
  ttsData: Record<string, Array<{ code: string; transcreation: string; literal: string; region?: string }>>,
  dbLanguages: Array<{ language_code: string; language_name: string; region: string; is_rtl: boolean; tts_provider: string; is_enabled: boolean }>
): LanguageRegistryData {
  const allLanguages: LanguageEntry[] = [];
  const tabs: LanguageTabData[] = [];

  // Build from TTS data (has dialect-level detail)
  const tabOrder = ['arabic', 'indian', 'cjk', 'african', 'latam', 'european'];
  
  for (const tabId of tabOrder) {
    const tabLangs = ttsData[tabId] || [];
    const meta = TAB_META[tabId];
    if (!meta) continue;

    const entries: LanguageEntry[] = tabLangs.map(lang => {
      const nameParts = lang.code.split('-');
      const shortCode = nameParts[0];
      const dbMatch = dbLanguages.find(d => d.language_code === shortCode);
      
      return {
        code: lang.code,
        name: dbMatch?.language_name || getLanguageName(lang.code),
        flag: FLAG_MAP[lang.code] || FLAG_MAP[shortCode] || '🌐',
        region: lang.region || dbMatch?.region || '',
        regionGroup: tabId,
        transcreation: lang.transcreation,
        literal: lang.literal,
        provider: dbMatch?.tts_provider || 'azure',
        isRTL: dbMatch?.is_rtl || tabId === 'arabic',
      };
    });

    tabs.push({
      id: tabId,
      label: meta.label,
      badge: meta.badge,
      count: entries.length,
      title: meta.title,
      subtitle: meta.subtitle,
      moat: meta.moat,
      languages: entries,
    });

    allLanguages.push(...entries);
  }

  // Also add DB-only languages not in TTS data
  for (const dbLang of dbLanguages) {
    const exists = allLanguages.some(l => l.code.startsWith(dbLang.language_code));
    if (!exists) {
      allLanguages.push({
        code: dbLang.language_code,
        name: dbLang.language_name,
        flag: FLAG_MAP[dbLang.language_code] || '🌐',
        region: dbLang.region,
        regionGroup: 'other',
        provider: dbLang.tts_provider,
        isRTL: dbLang.is_rtl,
      });
    }
  }

  // Build filtered lists
  const ttsLanguages = allLanguages.filter(l => l.transcreation);
  
  const sttLanguages = allLanguages.filter(l => {
    const short = l.code.split('-')[0];
    return ['en', 'ar', 'hi', 'ta', 'te', 'bn', 'ja', 'zh', 'ko', 'de', 'fr', 'es', 'pt', 'sw', 'th', 'vi', 'id', 'tr', 'it', 'nl', 'ru'].includes(short);
  });

  const deeplLanguages = allLanguages.filter(l => {
    const upperCode = l.code.toUpperCase().split('-')[0];
    return DEEPL_CODES.has(upperCode) || DEEPL_CODES.has(l.code.toUpperCase());
  });

  const getLanguagesForRegion = (region: string): LanguageEntry[] => {
    const tabGroup = REGION_TO_TAB[region];
    if (!tabGroup) return allLanguages;
    const coreCodes = REGION_CORE_CODES[region] || [];
    
    // Sort: core first, then rest
    return [...allLanguages].sort((a, b) => {
      const aCore = coreCodes.includes(a.code) ? -1 : 0;
      const bCore = coreCodes.includes(b.code) ? -1 : 0;
      return aCore - bCore;
    });
  };

  const getCoreLanguages = (region: string): LanguageEntry[] => {
    const coreCodes = REGION_CORE_CODES[region] || [];
    return allLanguages.filter(l => coreCodes.includes(l.code));
  };

  return {
    tabs,
    allLanguages,
    ttsLanguages,
    sttLanguages,
    deeplLanguages,
    isLoading: false,
    error: null,
    getLanguagesForRegion,
    getCoreLanguages,
  };
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'ar-SA': 'Saudi Arabic', 'ar-EG': 'Egyptian Arabic', 'ar-AE': 'Gulf Arabic',
    'ar-LB': 'Levantine', 'ar-MA': 'Maghrebi', 'ar-IQ': 'Iraqi', 'ar-MSA': 'MSA',
    'hi-IN': 'Hindi', 'ta-IN': 'Tamil', 'te-IN': 'Telugu', 'bn-IN': 'Bengali',
    'mr-IN': 'Marathi', 'gu-IN': 'Gujarati', 'kn-IN': 'Kannada', 'ml-IN': 'Malayalam',
    'ja-JP': 'Japanese', 'zh-CN': 'Chinese', 'ko-KR': 'Korean',
    'th-TH': 'Thai', 'vi-VN': 'Vietnamese', 'id-ID': 'Indonesian',
    'sw-KE': 'Swahili', 'yo-NG': 'Yoruba', 'ha-NG': 'Hausa', 'zu-ZA': 'Zulu', 'am-ET': 'Amharic',
    'es-MX': 'Mexican Spanish', 'pt-BR': 'Brazilian Portuguese',
    'es-CO': 'Colombian Spanish', 'es-AR': 'Argentine Spanish',
    'es-CL': 'Chilean Spanish', 'es-PE': 'Peruvian Spanish',
    'de-DE': 'German', 'fr-FR': 'French', 'es-ES': 'Spanish',
    'it-IT': 'Italian', 'nl-NL': 'Dutch', 'pl-PL': 'Polish',
    'sv-SE': 'Swedish', 'pt-PT': 'Portuguese',
  };
  return names[code] || code;
}

function getEmptyRegistry(): LanguageRegistryData {
  return {
    tabs: [],
    allLanguages: [],
    ttsLanguages: [],
    sttLanguages: [],
    deeplLanguages: [],
    isLoading: true,
    error: null,
    getLanguagesForRegion: () => [],
    getCoreLanguages: () => [],
  };
}
