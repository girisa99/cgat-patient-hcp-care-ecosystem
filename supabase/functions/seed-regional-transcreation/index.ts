/**
 * SEED REGIONAL TRANSCREATION — SHARED CROSS-PRODUCT SEEDER
 * 
 * Batch-generates transcreated content for all 16 regions + 48 sub-regional zones.
 * Routes to zone-correct LLM providers per regional-routing-registry:
 *   - Claude (Anthropic): EU, NAM, LATAM, Oceania, Turkey
 *   - Qwen Max (Alibaba): MENA, CJK
 *   - Gemini (Google): India, SEA, Africa, Bangladesh, South Asia
 *   - GPT-4o (OpenAI): Pakistan, Caribbean, Eastern Europe, Central Asia
 *   - DeepSeek V3: Fallback across all zones
 * 
 * CROSS-PRODUCT SUPPORT:
 *   Pass custom content_type & content_keys to reuse for any product:
 *   - landing_page (default), genie_cast, spark, mind, vibe, deck
 * 
 * Stores results in regional_content_cache table.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Default content keys (landing page) ──
const DEFAULT_CONTENT_KEYS: { key: string; englishSource: string }[] = [
  { key: "nativeSections.ctaFooterHeadline", englishSource: "Your Audience Deserves Content That Feels Like Home." },
  { key: "nativeSections.ctaFooterSubheadline", englishSource: "From idea to global distribution — every format, every market, every language." },
  { key: "nativeSections.comparisonTranslationLabel", englishSource: "Translation" },
  { key: "nativeSections.comparisonTranscreationLabel", englishSource: "Transcreation" },
  { key: "nativeSections.comparisonTranslationExample", englishSource: "Take your medicine on time for good health results." },
  { key: "nativeSections.comparisonTranscreationExample", englishSource: "Your health journey starts with one small step — let's make it count." },
  { key: "nativeSections.statsLanguagesLabel", englishSource: "Languages" },
  { key: "nativeSections.statsDialectsLabel", englishSource: "Dialects" },
  { key: "nativeSections.statsRegionsLabel", englishSource: "Regions" },
  { key: "nativeSections.statsSubRegionsLabel", englishSource: "Sub-Regions" },
  { key: "nativeSections.demoHubHeadline", englishSource: "True Localization. Not Translation." },
  { key: "nativeSections.demoHubSubheadline", englishSource: "We adapt meaning, culture, and context — this is transcreation." },
  { key: "nativeSections.scheduleDemoLabel", englishSource: "Schedule a Guided Demo" },
  { key: "nativeSections.readyForRegion", englishSource: "Ready for Your Region" },
  { key: "nativeSections.signInPrompt", englishSource: "Already have an account? Sign in" },
];

// ═══════════════════════════════════════════════════════════════════════════
// LLM ROUTING — Mirrors regional-routing-registry.ts exactly
// ═══════════════════════════════════════════════════════════════════════════

interface LLMRoute {
  provider: 'anthropic' | 'alibaba' | 'gemini' | 'openai' | 'deepseek';
  model: string;
  fallbackProviders: ('anthropic' | 'alibaba' | 'gemini' | 'openai' | 'deepseek')[];
}

const REGION_LLM_ROUTING: Record<string, LLMRoute> = {
  // Claude Zone
  nam:            { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallbackProviders: ['openai', 'gemini', 'deepseek'] },
  europe:         { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallbackProviders: ['openai', 'gemini', 'deepseek'] },
  latam:          { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallbackProviders: ['openai', 'gemini', 'deepseek'] },
  oceania:        { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallbackProviders: ['openai', 'gemini', 'deepseek'] },
  turkey:         { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallbackProviders: ['openai', 'gemini', 'deepseek'] },
  // Alibaba Zone
  mena:           { provider: 'alibaba', model: 'qwen-max', fallbackProviders: ['deepseek', 'anthropic', 'openai'] },
  cjk:            { provider: 'alibaba', model: 'qwen-max', fallbackProviders: ['deepseek', 'anthropic', 'openai'] },
  // Gemini Zone
  india:          { provider: 'gemini', model: 'gemini-2.5-pro', fallbackProviders: ['alibaba', 'anthropic', 'deepseek'] },
  sea:            { provider: 'gemini', model: 'gemini-2.5-pro', fallbackProviders: ['alibaba', 'anthropic', 'deepseek'] },
  africa:         { provider: 'gemini', model: 'gemini-2.5-pro', fallbackProviders: ['anthropic', 'alibaba', 'deepseek'] },
  bangladesh:     { provider: 'gemini', model: 'gemini-2.5-pro', fallbackProviders: ['alibaba', 'anthropic', 'deepseek'] },
  south_asia:     { provider: 'gemini', model: 'gemini-2.5-pro', fallbackProviders: ['alibaba', 'anthropic', 'deepseek'] },
  // GPT-4o Zone
  pakistan:        { provider: 'openai', model: 'gpt-4o', fallbackProviders: ['anthropic', 'deepseek', 'gemini'] },
  caribbean:      { provider: 'openai', model: 'gpt-4o', fallbackProviders: ['anthropic', 'deepseek', 'gemini'] },
  eastern_europe: { provider: 'openai', model: 'gpt-4o', fallbackProviders: ['anthropic', 'deepseek', 'gemini'] },
  central_asia:   { provider: 'openai', model: 'gpt-4o', fallbackProviders: ['anthropic', 'deepseek', 'gemini'] },
};

// ═══════════════════════════════════════════════════════════════════════════
// REGION METADATA — COMPLETE 16 parents + ALL sub-regions (synced with regionHierarchy.ts)
// ═══════════════════════════════════════════════════════════════════════════

interface SubRegionMeta {
  code: string;
  language: string;
  languageCode: string;
  dialectContext: string;
}

interface RegionMeta {
  slug: string;
  language: string;
  languageCode: string;
  culturalContext: string;
  subRegions?: SubRegionMeta[];
}

const REGION_META: RegionMeta[] = [
  {
    slug: "nam", language: "English", languageCode: "en-US",
    culturalContext: "North American English. Direct, professional, tech-forward.",
    subRegions: [
      { code: "NAM_US", language: "American English", languageCode: "en-US", dialectContext: "Silicon Valley / enterprise tech tone" },
      { code: "NAM_CA", language: "Canadian English/French", languageCode: "en-CA", dialectContext: "Canadian bilingual, inclusive, polite tone" },
    ],
  },
  {
    slug: "europe", language: "German", languageCode: "de-DE",
    culturalContext: "European market. Use formal German (Sie). GDPR-conscious, quality-focused.",
    subRegions: [
      { code: "EU_WEST", language: "British English", languageCode: "en-GB", dialectContext: "UK & Ireland — understated, dry wit, NHS/public-health aware" },
      { code: "EU_DACH", language: "German", languageCode: "de-DE", dialectContext: "DACH formal German (Sie), precision-focused" },
      { code: "EU_FRANCE", language: "French", languageCode: "fr-FR", dialectContext: "Metropolitan French, elegant and formal" },
      { code: "EU_BENELUX", language: "Dutch", languageCode: "nl-NL", dialectContext: "Dutch/Flemish — pragmatic, direct, trade-oriented" },
      { code: "EU_IBERIA", language: "Spanish", languageCode: "es-ES", dialectContext: "Castilian Spanish, formal vosotros" },
      { code: "EU_ITALY", language: "Italian", languageCode: "it-IT", dialectContext: "Formal Italian, design & quality emphasis" },
      { code: "EU_NORDIC", language: "Swedish", languageCode: "sv-SE", dialectContext: "Swedish/Nordic tone — practical, egalitarian" },
      { code: "EU_EAST", language: "Polish", languageCode: "pl-PL", dialectContext: "Eastern EU members — pragmatic, emerging tech, resilient" },
    ],
  },
  {
    slug: "mena", language: "Arabic", languageCode: "ar-SA",
    culturalContext: "Middle East. RTL Arabic. Formal, respectful, trust-building. Reference Islamic values where appropriate.",
    subRegions: [
      { code: "MENA_GULF", language: "Gulf Arabic", languageCode: "ar-AE", dialectContext: "Gulf/Khaleeji Arabic — prestigious, business-forward" },
      { code: "MENA_EGYPT", language: "Egyptian Arabic", languageCode: "ar-EG", dialectContext: "Egyptian Arabic — warm, relatable, media-savvy" },
      { code: "MENA_LEVANT", language: "Levantine Arabic", languageCode: "ar-LB", dialectContext: "Levantine Arabic — elegant, cosmopolitan" },
      { code: "MENA_MAGHREB", language: "Maghrebi Arabic", languageCode: "ar-MA", dialectContext: "Maghrebi Arabic/Darija — French-influenced, dynamic" },
      { code: "MENA_MSA", language: "Modern Standard Arabic", languageCode: "ar-MSA", dialectContext: "MSA — formal pan-Arab, media/government tone" },
      { code: "MENA_ISRAEL", language: "Hebrew", languageCode: "he-IL", dialectContext: "Hebrew — startup nation, tech-forward, direct" },
    ],
  },
  {
    slug: "india", language: "Hindi", languageCode: "hi-IN",
    culturalContext: "India. Use Hindi with respect for diversity. Family values, aspiration, Bollywood cultural references.",
    subRegions: [
      { code: "INDIA_NORTH", language: "Hindi", languageCode: "hi-IN", dialectContext: "North Indian Hindi — Bollywood, family-centric" },
      { code: "INDIA_SOUTH_TA", language: "Tamil", languageCode: "ta-IN", dialectContext: "Tamil — proud Dravidian culture, cinema references" },
      { code: "INDIA_SOUTH_TE", language: "Telugu", languageCode: "te-IN", dialectContext: "Telugu — Tollywood, tech hub Hyderabad" },
      { code: "INDIA_SOUTH_KN", language: "Kannada", languageCode: "kn-IN", dialectContext: "Kannada — Bangalore tech culture" },
      { code: "INDIA_SOUTH_ML", language: "Malayalam", languageCode: "ml-IN", dialectContext: "Malayalam — Kerala literary tradition" },
      { code: "INDIA_WEST_MR", language: "Marathi", languageCode: "mr-IN", dialectContext: "Marathi — Mumbai business culture" },
      { code: "INDIA_WEST_GU", language: "Gujarati", languageCode: "gu-IN", dialectContext: "Gujarati — entrepreneurial, diaspora-connected" },
      { code: "INDIA_EAST_BN", language: "Bengali", languageCode: "bn-IN", dialectContext: "Bengali — intellectual, artistic tradition" },
      { code: "INDIA_PAN", language: "Indian English", languageCode: "en-IN", dialectContext: "Pan-India English — professional, inclusive, aspirational" },
    ],
  },
  {
    slug: "africa", language: "Swahili", languageCode: "sw-KE",
    culturalContext: "Africa. Community-first, mobile-first, Ubuntu philosophy. Respect for oral tradition.",
    subRegions: [
      { code: "AFRICA_EAST", language: "Swahili", languageCode: "sw-KE", dialectContext: "East African Swahili — community, Ubuntu values" },
      { code: "AFRICA_WEST", language: "Nigerian English", languageCode: "en-NG", dialectContext: "West African English — Nollywood, vibrant, entrepreneurial" },
      { code: "AFRICA_SOUTH", language: "South African English", languageCode: "en-ZA", dialectContext: "South African — Ubuntu, rainbow nation, diverse" },
      { code: "AFRICA_FRANCO", language: "French", languageCode: "fr-SN", dialectContext: "Francophone Africa — formal French with local warmth" },
    ],
  },
  {
    slug: "sea", language: "Bahasa Indonesia", languageCode: "id-ID",
    culturalContext: "Southeast Asia. Respect for hierarchy, community harmony, mobile-first digital economy.",
    subRegions: [
      { code: "SEA_MALAY", language: "Bahasa Melayu", languageCode: "ms-MY", dialectContext: "Malaysian Malay — formal, government-friendly" },
      { code: "SEA_THAI", language: "Thai", languageCode: "th-TH", dialectContext: "Thai — polite particles, respect for hierarchy" },
      { code: "SEA_VIET", language: "Vietnamese", languageCode: "vi-VN", dialectContext: "Vietnamese — tonal, formal business register" },
      { code: "SEA_PHIL", language: "Filipino", languageCode: "tl-PH", dialectContext: "Filipino/Taglish — casual, social-media-savvy" },
      { code: "SEA_PAN", language: "Singapore English", languageCode: "en-SG", dialectContext: "Pan-SEA / Singapore English — professional, multicultural hub" },
    ],
  },
  {
    slug: "cjk", language: "Japanese", languageCode: "ja-JP",
    culturalContext: "CJK markets. Precision, quality, attention to detail. Honorific language where appropriate.",
    subRegions: [
      { code: "CJK_CN", language: "Simplified Chinese", languageCode: "zh-CN", dialectContext: "Mainland China — formal, WeChat-era digital" },
      { code: "CJK_TW", language: "Traditional Chinese", languageCode: "zh-TW", dialectContext: "Taiwan — traditional characters, democratic values" },
      { code: "CJK_JP", language: "Japanese", languageCode: "ja-JP", dialectContext: "Japanese — keigo formality, perfectionism" },
      { code: "CJK_KR", language: "Korean", languageCode: "ko-KR", dialectContext: "Korean — K-culture, pali-pali speed, innovation" },
    ],
  },
  {
    slug: "latam", language: "Spanish", languageCode: "es-MX",
    culturalContext: "Latin America. Warm, family-oriented, passionate. Use Latin American Spanish, not Castilian.",
    subRegions: [
      { code: "LATAM_BRAZIL", language: "Brazilian Portuguese", languageCode: "pt-BR", dialectContext: "Brazilian Portuguese — informal, warm, jeitinho" },
      { code: "LATAM_MEXICO", language: "Mexican Spanish", languageCode: "es-MX", dialectContext: "Mexican Spanish — respectful usted, warm" },
      { code: "LATAM_ANDEAN", language: "Andean Spanish", languageCode: "es-CO", dialectContext: "Andean Spanish — polite, clear, community-oriented" },
      { code: "LATAM_CONESUR", language: "Rioplatense Spanish", languageCode: "es-AR", dialectContext: "Argentine/Uruguayan voseo, literary, passionate" },
      { code: "LATAM_CARIB", language: "Caribbean Spanish", languageCode: "es-DO", dialectContext: "Caribbean LATAM (DR, PR, Cuba) — lively, musical, warm" },
    ],
  },
  {
    slug: "caribbean", language: "Jamaican English", languageCode: "en-JM",
    culturalContext: "Caribbean. Vibrant, music-influenced, community-driven. Mix of English, Patois, and French Creole.",
    subRegions: [
      { code: "CARIBBEAN_EN", language: "Caribbean English", languageCode: "en-JM", dialectContext: "English Caribbean — reggae/soca influenced, warm" },
      { code: "CARIBBEAN_FR", language: "Haitian Creole", languageCode: "ht", dialectContext: "French Caribbean/Haitian Creole — resilient, community" },
    ],
  },
  {
    slug: "oceania", language: "Australian English", languageCode: "en-AU",
    culturalContext: "Oceania. Laid-back but professional. Respect for indigenous culture. Progressive.",
    subRegions: [
      { code: "OCEANIA_AU", language: "Australian English", languageCode: "en-AU", dialectContext: "Australian — casual, fair-go ethos, multicultural" },
      { code: "OCEANIA_NZ", language: "NZ English", languageCode: "en-NZ", dialectContext: "New Zealand — Māori respect, kiwi ingenuity" },
    ],
  },
  {
    slug: "turkey", language: "Turkish", languageCode: "tr-TR",
    culturalContext: "Turkey. Bridge between East and West. Formal siz address. Tech-savvy, ambitious market.",
  },
  {
    slug: "pakistan", language: "Urdu", languageCode: "ur-PK",
    culturalContext: "Pakistan. RTL Urdu. Respectful, family-centric. Cricket & entertainment references resonate.",
  },
  {
    slug: "bangladesh", language: "Bengali", languageCode: "bn-BD",
    culturalContext: "Bangladesh. Bengali pride. Mobile-first economy. Garment/tech innovation narrative.",
  },
  {
    slug: "eastern_europe", language: "Ukrainian", languageCode: "uk-UA",
    culturalContext: "Eastern Europe. Resilient, tech-talented. Respect for sovereignty and innovation.",
    subRegions: [
      { code: "EU_UKRAINE", language: "Ukrainian", languageCode: "uk-UA", dialectContext: "Ukrainian — national pride, tech talent, resilience" },
      { code: "EU_BALKANS", language: "Serbian", languageCode: "sr-RS", dialectContext: "Balkans — pragmatic, direct, emerging tech" },
      { code: "EU_CAUCASUS", language: "Georgian", languageCode: "ka-GE", dialectContext: "Caucasus (Georgia, Armenia) — ancient culture, bridge of civilizations" },
    ],
  },
  {
    slug: "central_asia", language: "Kazakh", languageCode: "kk-KZ",
    culturalContext: "Central Asia. Eurasian crossroads. Respect for tradition + modernization drive.",
    subRegions: [
      { code: "ASIA_CENTRAL_KZ", language: "Kazakh", languageCode: "kk-KZ", dialectContext: "Kazakh — steppe heritage, modern ambition" },
      { code: "ASIA_CENTRAL_UZ", language: "Uzbek", languageCode: "uz-UZ", dialectContext: "Uzbek — Silk Road heritage, digital transformation" },
      { code: "ASIA_CENTRAL_AZ", language: "Azerbaijani", languageCode: "az-AZ", dialectContext: "Azerbaijani — Turkic heritage, energy sector, modernization" },
    ],
  },
  {
    slug: "south_asia", language: "Nepali", languageCode: "ne-NP",
    culturalContext: "South Asia (non-India). Diverse traditions, mountainous/island cultures, resilient communities.",
    subRegions: [
      { code: "SA_NEPAL", language: "Nepali", languageCode: "ne-NP", dialectContext: "Nepali — Himalayan pride, warm hospitality" },
      { code: "SA_SRILANKA", language: "Sinhala", languageCode: "si-LK", dialectContext: "Sinhala — island resilience, Buddhist heritage" },
      { code: "SA_BHUTAN", language: "Dzongkha", languageCode: "dz-BT", dialectContext: "Bhutan — Gross National Happiness, Buddhist kingdom, pristine nature" },
      { code: "SA_MALDIVES", language: "Dhivehi", languageCode: "dv-MV", dialectContext: "Maldives — island nation, tourism-driven, Islamic values" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCREATION PROMPT & PARSING
// ═══════════════════════════════════════════════════════════════════════════

function buildTranscreationPrompt(
  englishSource: string,
  targetLanguage: string,
  culturalContext: string,
  contentKey: string,
  productContext?: string,
): string {
  const productLine = productContext ? `\nProduct context: ${productContext}` : '';
  return `You are a cultural transcreation expert. Transcreate (do NOT literally translate) the following English text into ${targetLanguage}.

Cultural context: ${culturalContext}${productLine}
Content purpose: ${contentKey} (marketing/product element)

English source: "${englishSource}"

Requirements:
1. TRANSCREATE, not translate — adapt the meaning, emotion, and cultural resonance
2. Use natural, native-sounding ${targetLanguage} that a local would actually say
3. Maintain the marketing intent but make it culturally authentic
4. For short labels (1-3 words), keep them concise in the target language
5. For headlines, make them emotionally compelling in the target culture

Respond in this exact JSON format:
{
  "transcreated": "The transcreated text in ${targetLanguage}",
  "cultural_tone": "Brief description of the cultural tone used (e.g., 'formal respectful', 'warm familial')",
  "emotional_register": "The emotional register (e.g., 'aspirational', 'trustworthy', 'warm')"
}`;
}

interface TranscreationResult {
  content: string;
  culturalTone: string;
  emotionalRegister: string;
}

function parseTranscreationResponse(rawContent: string): TranscreationResult | null {
  if (!rawContent) return null;
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        content: parsed.transcreated || parsed.text || rawContent,
        culturalTone: parsed.cultural_tone || "authentic",
        emotionalRegister: parsed.emotional_register || "professional",
      };
    }
  } catch { /* fall through */ }
  return { content: rawContent.trim(), culturalTone: "authentic", emotionalRegister: "professional" };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER-SPECIFIC API CALLERS (5-provider differentiated chain)
// ═══════════════════════════════════════════════════════════════════════════

async function callAnthropic(prompt: string): Promise<string | null> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) { console.error("[transcreation] ANTHROPIC_API_KEY not configured"); return null; }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 500, temperature: 0.7, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) { const err = await response.text(); console.error(`[transcreation] Anthropic error ${response.status}:`, err.slice(0, 200)); return null; }
  const data = await response.json();
  return data?.content?.[0]?.text || null;
}

async function callOpenAI(prompt: string): Promise<string | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) { console.error("[transcreation] OPENAI_API_KEY not configured"); return null; }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o", temperature: 0.7, max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) { const err = await response.text(); console.error(`[transcreation] OpenAI error ${response.status}:`, err.slice(0, 200)); return null; }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) { console.error("[transcreation] GEMINI_API_KEY not configured"); return null; }
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 500 } }),
  });
  if (!response.ok) { const err = await response.text(); console.error(`[transcreation] Gemini error ${response.status}:`, err.slice(0, 200)); return null; }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function callAlibaba(prompt: string): Promise<string | null> {
  const apiKey = Deno.env.get("ALIBABA_SINGAPORE_API_KEY") || Deno.env.get("ALIBABA_API_KEY");
  if (!apiKey) { console.error("[transcreation] ALIBABA_API_KEY not configured"); return null; }
  const response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "qwen-max", temperature: 0.7, max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) { const err = await response.text(); console.error(`[transcreation] Alibaba/Qwen error ${response.status}:`, err.slice(0, 200)); return null; }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

async function callDeepSeek(prompt: string): Promise<string | null> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) { console.error("[transcreation] DEEPSEEK_API_KEY not configured"); return null; }
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", temperature: 0.7, max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) { const err = await response.text(); console.error(`[transcreation] DeepSeek error ${response.status}:`, err.slice(0, 200)); return null; }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

// ── Unified caller with fallback chain ──
const PROVIDER_CALLERS: Record<string, (prompt: string) => Promise<string | null>> = {
  anthropic: callAnthropic, openai: callOpenAI, gemini: callGemini, alibaba: callAlibaba, deepseek: callDeepSeek,
};

async function generateTranscreation(
  regionSlug: string,
  englishSource: string,
  targetLanguage: string,
  culturalContext: string,
  contentKey: string,
  productContext?: string,
): Promise<{ result: TranscreationResult; provider: string; model: string } | null> {
  const route = REGION_LLM_ROUTING[regionSlug];
  if (!route) { console.error(`[transcreation] No routing for region: ${regionSlug}`); return null; }

  const prompt = buildTranscreationPrompt(englishSource, targetLanguage, culturalContext, contentKey, productContext);
  const providersToTry = [route.provider, ...route.fallbackProviders];

  for (const provider of providersToTry) {
    const caller = PROVIDER_CALLERS[provider];
    if (!caller) continue;

    console.log(`[transcreation] Trying ${provider} for ${regionSlug}/${contentKey}`);
    const rawContent = await caller(prompt);

    if (rawContent) {
      const result = parseTranscreationResponse(rawContent);
      if (result && result.content) {
        const model = provider === 'anthropic' ? 'claude-sonnet-4-20250514'
          : provider === 'openai' ? 'gpt-4o'
          : provider === 'gemini' ? 'gemini-2.5-pro'
          : provider === 'deepseek' ? 'deepseek-v3'
          : 'qwen-max';
        console.log(`[transcreation] ✓ ${provider}/${model} succeeded for ${regionSlug}/${contentKey}`);
        return { result, provider, model };
      }
    }
    console.warn(`[transcreation] ${provider} failed for ${regionSlug}/${contentKey}, trying fallback...`);
  }

  console.error(`[transcreation] All providers failed for ${regionSlug}/${contentKey}`);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const {
      mode = "seed_parents",
      region_slug,
      sub_region_code,
      dry_run = false,
      // Cross-product params
      content_type = "landing_page",
      content_keys,          // optional custom keys: { key, englishSource }[]
      product_context,       // e.g. "Genie Cast video production platform"
      throttle_ms = 500,     // configurable throttle
    } = body;

    const activeContentKeys = content_keys || DEFAULT_CONTENT_KEYS;

    console.log(`[seed-regional-transcreation] Mode: ${mode}, Region: ${region_slug || "all"}, ContentType: ${content_type}, Keys: ${activeContentKeys.length}, DryRun: ${dry_run}`);

    // ── Cleanup mode ──
    if (mode === "cleanup") {
      const { data: emptyRows, error: fetchErr } = await supabase
        .from("regional_content_cache")
        .select("id")
        .eq("content_type", content_type)
        .or("transcreated_content.is.null,transcreated_content.eq.");

      if (fetchErr) return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      let deleted = 0;
      if (emptyRows && emptyRows.length > 0) {
        const ids = emptyRows.map(r => r.id);
        const { error: delErr } = await supabase.from("regional_content_cache").delete().in("id", ids);
        if (delErr) return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        deleted = ids.length;
      }

      return new Response(JSON.stringify({ success: true, mode: "cleanup", content_type, deleted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Dedup mode ──
    if (mode === "dedup") {
      const { data: allRows, error: fetchErr } = await supabase
        .from("regional_content_cache")
        .select("id, region_slug, content_key, sub_region_code, content_type, created_at")
        .eq("content_type", content_type)
        .order("created_at", { ascending: true });

      if (fetchErr) return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const seen = new Set<string>();
      const dupeIds: string[] = [];
      for (const row of allRows || []) {
        const key = `${row.region_slug}|${row.content_key}|${row.sub_region_code || 'null'}|${row.content_type}`;
        if (seen.has(key)) { dupeIds.push(row.id); } else { seen.add(key); }
      }

      if (dupeIds.length > 0) {
        for (let i = 0; i < dupeIds.length; i += 50) {
          await supabase.from("regional_content_cache").delete().in("id", dupeIds.slice(i, i + 50));
        }
      }

      return new Response(JSON.stringify({ success: true, mode: "dedup", content_type, duplicatesRemoved: dupeIds.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Status mode: show what's seeded vs missing ──
    if (mode === "status") {
      // Paginate to avoid Supabase default 1000-row limit
      const allRows: { region_slug: string; sub_region_code: string | null; content_key: string }[] = [];
      const PAGE_SIZE = 1000;
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const { data: page } = await supabase
          .from("regional_content_cache")
          .select("region_slug, sub_region_code, content_key")
          .eq("content_type", content_type)
          .range(offset, offset + PAGE_SIZE - 1);
        if (page && page.length > 0) {
          allRows.push(...page);
          offset += page.length;
          hasMore = page.length === PAGE_SIZE;
        } else {
          hasMore = false;
        }
      }

      const parentCounts: Record<string, number> = {};
      const subRegionCounts: Record<string, number> = {};
      for (const row of allRows) {
        if (row.sub_region_code) {
          subRegionCounts[row.sub_region_code] = (subRegionCounts[row.sub_region_code] || 0) + 1;
        } else {
          parentCounts[row.region_slug] = (parentCounts[row.region_slug] || 0) + 1;
        }
      }

      const keysCount = activeContentKeys.length;
      const status = REGION_META.map(r => {
        const parentSeeded = (parentCounts[r.slug] || 0) >= keysCount;
        const subStatuses = (r.subRegions || []).map(sr => ({
          code: sr.code,
          language: sr.language,
          seeded: (subRegionCounts[sr.code] || 0) >= keysCount,
          keys: subRegionCounts[sr.code] || 0,
        }));
        return {
          region: r.slug,
          parentSeeded,
          parentKeys: parentCounts[r.slug] || 0,
          totalSubRegions: r.subRegions?.length || 0,
          subRegionsSeeded: subStatuses.filter(s => s.seeded).length,
          subRegionsPending: subStatuses.filter(s => !s.seeded).length,
          subRegions: subStatuses,
        };
      });

      const totalSubRegions = REGION_META.reduce((s, r) => s + (r.subRegions?.length || 0), 0);
      const seededSubRegions = Object.values(subRegionCounts).filter(c => c >= keysCount).length;

      return new Response(JSON.stringify({
        success: true,
        content_type,
        keysPerEntity: keysCount,
        parents: { total: REGION_META.length, seeded: Object.values(parentCounts).filter(c => c >= keysCount).length },
        subRegions: { total: totalSubRegions, seeded: seededSubRegions, pending: totalSubRegions - seededSubRegions },
        details: status,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Batch async mode: fire-and-forget individual sub-region calls ──
    if (mode === "batch_seed_subregions") {
      const selfUrl = `${supabaseUrl}/functions/v1/seed-regional-transcreation`;
      const regionsToFan = region_slug
        ? REGION_META.filter(r => r.slug === region_slug)
        : REGION_META;

      const dispatched: { region: string; subRegion: string; language: string }[] = [];

      for (const region of regionsToFan) {
        if (!region.subRegions) continue;
        for (const sr of region.subRegions) {
          // Fire each sub-region as its own edge function call (non-blocking)
          fetch(selfUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              mode: "seed_subregions",
              region_slug: region.slug,
              sub_region_code: sr.code,
              content_type,
              content_keys,
              product_context,
              throttle_ms: body.throttle_ms || 300,
            }),
          }).catch(err => console.error(`[batch] Failed to dispatch ${region.slug}/${sr.code}:`, err));

          dispatched.push({ region: region.slug, subRegion: sr.code, language: sr.language });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        mode: "batch_seed_subregions",
        content_type,
        dispatched: dispatched.length,
        message: `Fired ${dispatched.length} async sub-region seeding jobs. Check logs for progress.`,
        jobs: dispatched,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Seeding modes ──
    const results: any[] = [];
    let totalGenerated = 0;
    let totalSkipped = 0;

    let regionsToProcess: RegionMeta[] = [];
    if (region_slug) {
      const found = REGION_META.find(r => r.slug === region_slug);
      if (!found) return new Response(JSON.stringify({ error: `Region ${region_slug} not found` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      regionsToProcess = [found];
    } else {
      regionsToProcess = REGION_META;
    }

    for (const region of regionsToProcess) {
      // ── Parent region seeding ──
      if (mode === "seed_parents" || mode === "seed_all" || mode === "seed_single") {
        for (const contentItem of activeContentKeys) {
          const { data: existing } = await supabase
            .from("regional_content_cache")
            .select("id")
            .eq("region_slug", region.slug)
            .eq("content_key", contentItem.key)
            .eq("content_type", content_type)
            .is("sub_region_code", null)
            .maybeSingle();

          if (existing) { totalSkipped++; continue; }

          if (dry_run) {
            results.push({ region: region.slug, key: contentItem.key, action: "would_generate", provider: REGION_LLM_ROUTING[region.slug]?.provider });
            continue;
          }

          const generated = await generateTranscreation(
            region.slug, contentItem.englishSource, region.language, region.culturalContext, contentItem.key, product_context
          );

          if (generated) {
            const { error: insertError } = await supabase.from("regional_content_cache").insert({
              region_slug: region.slug,
              sub_region_code: null,
              language_code: region.languageCode,
              content_type,
              content_key: contentItem.key,
              english_source: contentItem.englishSource,
              transcreated_content: generated.result.content,
              cultural_tone: generated.result.culturalTone,
              emotional_register: generated.result.emotionalRegister,
              llm_provider: generated.provider,
              llm_model: generated.model,
              status: "approved",
              version: 1,
              refresh_cadence: "weekly",
              last_refreshed_at: new Date().toISOString(),
              next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });

            if (insertError) { console.error(`[seed] Insert error for ${region.slug}/${contentItem.key}:`, insertError.message); }
            else { totalGenerated++; results.push({ region: region.slug, key: contentItem.key, action: "generated", provider: generated.provider }); }
          }

          await new Promise(r => setTimeout(r, throttle_ms));
        }
      }

      // ── Sub-region seeding ──
      if ((mode === "seed_subregions" || mode === "seed_all" || mode === "seed_single") && region.subRegions) {
        const subRegionsToProcess = sub_region_code
          ? region.subRegions.filter(sr => sr.code === sub_region_code)
          : region.subRegions;

        for (const subRegion of subRegionsToProcess) {
          for (const contentItem of activeContentKeys) {
            const { data: existing } = await supabase
              .from("regional_content_cache")
              .select("id")
              .eq("region_slug", region.slug)
              .eq("content_key", contentItem.key)
              .eq("content_type", content_type)
              .eq("sub_region_code", subRegion.code)
              .maybeSingle();

            if (existing) { totalSkipped++; continue; }

            if (dry_run) {
              results.push({ region: region.slug, subRegion: subRegion.code, key: contentItem.key, action: "would_generate", provider: REGION_LLM_ROUTING[region.slug]?.provider });
              continue;
            }

            const dialectContext = `${region.culturalContext} Sub-region: ${subRegion.dialectContext}`;
            const generated = await generateTranscreation(
              region.slug, contentItem.englishSource, subRegion.language, dialectContext, contentItem.key, product_context
            );

            if (generated) {
              const { error: insertError } = await supabase.from("regional_content_cache").insert({
                region_slug: region.slug,
                sub_region_code: subRegion.code,
                language_code: subRegion.languageCode,
                content_type,
                content_key: contentItem.key,
                english_source: contentItem.englishSource,
                transcreated_content: generated.result.content,
                cultural_tone: generated.result.culturalTone,
                emotional_register: generated.result.emotionalRegister,
                dialect_variant: subRegion.code,
                llm_provider: generated.provider,
                llm_model: generated.model,
                status: "approved",
                version: 1,
                refresh_cadence: "weekly",
                last_refreshed_at: new Date().toISOString(),
                next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              });

              if (insertError) { console.error(`[seed] Insert error for ${region.slug}/${subRegion.code}/${contentItem.key}:`, insertError.message); }
              else { totalGenerated++; results.push({ region: region.slug, subRegion: subRegion.code, key: contentItem.key, action: "generated", provider: generated.provider }); }
            }

            await new Promise(r => setTimeout(r, throttle_ms));
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      mode,
      content_type,
      totalGenerated,
      totalSkipped,
      routing: "5-provider differentiated (anthropic/alibaba/gemini/openai/deepseek)",
      details: results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[seed-regional-transcreation] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
