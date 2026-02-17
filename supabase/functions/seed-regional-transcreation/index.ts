/**
 * SEED REGIONAL TRANSCREATION
 * 
 * Batch-generates transcreated landing page content for all 16 regions + sub-regional zones.
 * Uses ai-universal-processor for LLM-powered cultural transcreation.
 * Stores results in regional_content_cache table.
 * 
 * Modes:
 *   - "seed_parents"  → Generate content for all 16 parent regions (no sub-region)
 *   - "seed_subregions" → Generate dialect variants for specified region's zones
 *   - "seed_single" → Generate for a single region + optional sub-region
 *   - "seed_all" → Full seed: parents + all sub-regions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Content keys to transcreate (matches NativeSections interface) ──
const CONTENT_KEYS: { key: string; englishSource: string }[] = [
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

// ── Region → language + cultural context mapping ──
interface RegionMeta {
  slug: string;
  language: string;
  languageCode: string;
  culturalContext: string;
  subRegions?: { code: string; language: string; languageCode: string; dialectContext: string }[];
}

const REGION_META: RegionMeta[] = [
  {
    slug: "nam", language: "English", languageCode: "en-US",
    culturalContext: "North American English. Direct, professional, tech-forward.",
    subRegions: [
      { code: "NAM_US", language: "American English", languageCode: "en-US", dialectContext: "Silicon Valley / enterprise tech tone" },
      { code: "NAM_CA", language: "Canadian English", languageCode: "en-CA", dialectContext: "Canadian English with inclusive, polite tone" },
    ],
  },
  {
    slug: "europe", language: "German", languageCode: "de-DE",
    culturalContext: "European market. Use formal German (Sie). GDPR-conscious, quality-focused.",
    subRegions: [
      { code: "EU_DACH", language: "German", languageCode: "de-DE", dialectContext: "DACH formal German (Sie), precision-focused" },
      { code: "EU_FRANCE", language: "French", languageCode: "fr-FR", dialectContext: "Metropolitan French, elegant and formal" },
      { code: "EU_IBERIA", language: "Spanish", languageCode: "es-ES", dialectContext: "Castilian Spanish, formal vosotros" },
      { code: "EU_ITALY", language: "Italian", languageCode: "it-IT", dialectContext: "Formal Italian, design & quality emphasis" },
      { code: "EU_NORDIC", language: "Swedish", languageCode: "sv-SE", dialectContext: "Swedish/Nordic tone — practical, egalitarian" },
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
    slug: "apac", language: "Japanese", languageCode: "ja-JP",
    culturalContext: "Asia-Pacific region. Diverse, tech-forward, respect for innovation and quality.",
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
    ],
  },
  {
    slug: "central_asia", language: "Kazakh", languageCode: "kk-KZ",
    culturalContext: "Central Asia. Eurasian crossroads. Respect for tradition + modernization drive.",
    subRegions: [
      { code: "ASIA_CENTRAL_KZ", language: "Kazakh", languageCode: "kk-KZ", dialectContext: "Kazakh — steppe heritage, modern ambition" },
      { code: "ASIA_CENTRAL_UZ", language: "Uzbek", languageCode: "uz-UZ", dialectContext: "Uzbek — Silk Road heritage, digital transformation" },
    ],
  },
  {
    slug: "south_asia", language: "Nepali", languageCode: "ne-NP",
    culturalContext: "South Asia (non-India). Diverse traditions, mountainous/island cultures, resilient communities.",
    subRegions: [
      { code: "SA_NEPAL", language: "Nepali", languageCode: "ne-NP", dialectContext: "Nepali — Himalayan pride, warm hospitality" },
      { code: "SA_SRILANKA", language: "Sinhala", languageCode: "si-LK", dialectContext: "Sinhala — island resilience, Buddhist heritage" },
    ],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mode = "seed_parents", region_slug, sub_region_code, dry_run = false } = await req.json();

    console.log(`[seed-regional-transcreation] Mode: ${mode}, Region: ${region_slug || "all"}, DryRun: ${dry_run}`);

    const results: any[] = [];
    let totalGenerated = 0;
    let totalSkipped = 0;

    // Determine which regions to process
    let regionsToProcess: RegionMeta[] = [];
    
    if (mode === "seed_single" && region_slug) {
      const found = REGION_META.find(r => r.slug === region_slug);
      if (!found) {
        return new Response(JSON.stringify({ error: `Region ${region_slug} not found` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      regionsToProcess = [found];
    } else {
      regionsToProcess = REGION_META;
    }

    for (const region of regionsToProcess) {
      // ── Parent region (no sub_region_code) ──
      if (mode === "seed_parents" || mode === "seed_all" || mode === "seed_single") {
        for (const contentItem of CONTENT_KEYS) {
          // Check if already exists
          const { data: existing } = await supabase
            .from("regional_content_cache")
            .select("id")
            .eq("region_slug", region.slug)
            .eq("content_key", contentItem.key)
            .eq("content_type", "landing_page")
            .is("sub_region_code", null)
            .maybeSingle();

          if (existing) {
            totalSkipped++;
            continue;
          }

          if (dry_run) {
            results.push({ region: region.slug, key: contentItem.key, action: "would_generate" });
            continue;
          }

          // Generate via ai-universal-processor
          const transcreated = await generateTranscreation(
            supabaseUrl, supabaseKey, contentItem.englishSource,
            region.language, region.culturalContext, contentItem.key
          );

          if (transcreated) {
            const { error: insertError } = await supabase
              .from("regional_content_cache")
              .insert({
                region_slug: region.slug,
                sub_region_code: null,
                language_code: region.languageCode,
                content_type: "landing_page",
                content_key: contentItem.key,
                english_source: contentItem.englishSource,
                transcreated_content: transcreated.content,
                cultural_tone: transcreated.culturalTone,
                emotional_register: transcreated.emotionalRegister,
                llm_provider: "gemini",
                llm_model: "gemini-2.5-flash",
                status: "approved",
                version: 1,
                refresh_cadence: "weekly",
                last_refreshed_at: new Date().toISOString(),
                next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              });

            if (insertError) {
              console.error(`[seed] Insert error for ${region.slug}/${contentItem.key}:`, insertError.message);
            } else {
              totalGenerated++;
              results.push({ region: region.slug, key: contentItem.key, action: "generated" });
            }
          }

          // Rate limit protection: small delay between API calls
          await new Promise(r => setTimeout(r, 300));
        }
      }

      // ── Sub-regions ──
      if ((mode === "seed_subregions" || mode === "seed_all" || mode === "seed_single") && region.subRegions) {
        const subRegionsToProcess = sub_region_code
          ? region.subRegions.filter(sr => sr.code === sub_region_code)
          : region.subRegions;

        for (const subRegion of subRegionsToProcess) {
          for (const contentItem of CONTENT_KEYS) {
            // Check if already exists
            const { data: existing } = await supabase
              .from("regional_content_cache")
              .select("id")
              .eq("region_slug", region.slug)
              .eq("content_key", contentItem.key)
              .eq("content_type", "landing_page")
              .eq("sub_region_code", subRegion.code)
              .maybeSingle();

            if (existing) {
              totalSkipped++;
              continue;
            }

            if (dry_run) {
              results.push({ region: region.slug, subRegion: subRegion.code, key: contentItem.key, action: "would_generate" });
              continue;
            }

            const dialectContext = `${region.culturalContext} Sub-region: ${subRegion.dialectContext}`;
            const transcreated = await generateTranscreation(
              supabaseUrl, supabaseKey, contentItem.englishSource,
              subRegion.language, dialectContext, contentItem.key
            );

            if (transcreated) {
              const { error: insertError } = await supabase
                .from("regional_content_cache")
                .insert({
                  region_slug: region.slug,
                  sub_region_code: subRegion.code,
                  language_code: subRegion.languageCode,
                  content_type: "landing_page",
                  content_key: contentItem.key,
                  english_source: contentItem.englishSource,
                  transcreated_content: transcreated.content,
                  cultural_tone: transcreated.culturalTone,
                  emotional_register: transcreated.emotionalRegister,
                  dialect_variant: subRegion.code,
                  llm_provider: "gemini",
                  llm_model: "gemini-2.5-flash",
                  status: "approved",
                  version: 1,
                  refresh_cadence: "weekly",
                  last_refreshed_at: new Date().toISOString(),
                  next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                });

              if (insertError) {
                console.error(`[seed] Insert error for ${region.slug}/${subRegion.code}/${contentItem.key}:`, insertError.message);
              } else {
                totalGenerated++;
                results.push({ region: region.slug, subRegion: subRegion.code, key: contentItem.key, action: "generated" });
              }
            }

            await new Promise(r => setTimeout(r, 300));
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      mode,
      totalGenerated,
      totalSkipped,
      details: results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[seed-regional-transcreation] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── AI Transcreation Generator ──
interface TranscreationResult {
  content: string;
  culturalTone: string;
  emotionalRegister: string;
}

async function generateTranscreation(
  supabaseUrl: string,
  supabaseKey: string,
  englishSource: string,
  targetLanguage: string,
  culturalContext: string,
  contentKey: string,
): Promise<TranscreationResult | null> {
  try {
    const prompt = `You are a cultural transcreation expert. Transcreate (do NOT literally translate) the following English text into ${targetLanguage}.

Cultural context: ${culturalContext}
Content purpose: ${contentKey} (landing page element)

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

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[transcreation] AI error ${response.status} for ${contentKey}:`, errText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    console.log(`[transcreation] Gemini response keys for ${contentKey}:`, JSON.stringify(Object.keys(data)));
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawContent) {
      console.error(`[transcreation] Empty response for ${contentKey}. Full response:`, JSON.stringify(data).slice(0, 300));
      return null;
    }

    // Parse JSON from AI response
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
    } catch {
      // If JSON parse fails, use raw content
    }

    return {
      content: rawContent.trim(),
      culturalTone: "authentic",
      emotionalRegister: "professional",
    };
  } catch (error) {
    console.error(`[transcreation] Error for ${contentKey}:`, error);
    return null;
  }
}
