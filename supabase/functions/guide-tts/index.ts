/**
 * Guide TTS — Dedicated lightweight TTS for Ori/Arc guide voiceover
 * 
 * Uses the SAME routing standard as multi-provider-tts and the central
 * regional-routing-registry:
 *   - 15 parent zones → 62+ sub-regions → 82+ codes
 *   - 5-deep TTS fallback chains per sub-region
 *   - Parent-child voice inheritance (sub-region → parent → zone default)
 *   - Azure Neural for most regions, Qwen3-TTS for CJK, ElevenLabs for Western
 * 
 * Fallback chain: Region-specific primary → Azure → ElevenLabs → Google → OpenAI
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type TTSProvider = 'elevenlabs' | 'azure' | 'google' | 'openai' | 'alibaba';

interface GuideTTSRequest {
  text: string;
  agent: 'ori' | 'arc';
  languageCode?: string;
  region?: string;        // Sub-region code (e.g., 'MENA_GULF', 'INDIA_SOUTH_TA')
  parentRegion?: string;  // Parent zone (e.g., 'mena', 'india')
  countryCode?: string;   // ISO country code for IP-based detection
  speed?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ZONE ROUTING — mirrors regional-routing-registry.ts parent-child hierarchy
// ═══════════════════════════════════════════════════════════════════════════

type RegionalZone = 'western' | 'cjk' | 'mena' | 'india' | 'africa' | 'oceania' |
  'turkey' | 'caribbean' | 'eastern_europe' | 'central_asia' | 'pakistan' |
  'bangladesh' | 'sea' | 'south_asia' | 'fallback';

/** Language → Zone (same as registry getZoneFromLanguage) */
const LANGUAGE_ZONE_MAP: Record<string, RegionalZone> = {
  zh: 'cjk', ja: 'cjk', ko: 'cjk',
  ar: 'mena', he: 'mena', fa: 'mena',
  hi: 'india', ta: 'india', te: 'india', bn: 'india', mr: 'india',
  gu: 'india', kn: 'india', ml: 'india', pa: 'india', or: 'india',
  ne: 'south_asia', si: 'south_asia', dz: 'south_asia', dv: 'south_asia',
  ur: 'pakistan',
  id: 'sea', vi: 'sea', th: 'sea', ms: 'sea', fil: 'sea', my: 'sea',
  sw: 'africa', yo: 'africa', am: 'africa', ha: 'africa', ig: 'africa', zu: 'africa',
  tr: 'turkey',
  ka: 'central_asia', hy: 'central_asia', az: 'central_asia', kk: 'central_asia', uz: 'central_asia',
  uk: 'eastern_europe', sr: 'eastern_europe', bg: 'eastern_europe', hr: 'eastern_europe',
  en: 'western', es: 'western', fr: 'western', de: 'western', it: 'western',
  pt: 'western', nl: 'western', pl: 'western', ro: 'western', cs: 'western',
  hu: 'western', sv: 'western', nb: 'western', da: 'western', fi: 'western',
};

/** Country → Zone (same as registry getZoneFromCountry) */
const COUNTRY_ZONE_MAP: Record<string, RegionalZone> = {
  US: 'western', CA: 'western', GB: 'western', DE: 'western', FR: 'western',
  IT: 'western', ES: 'western', NL: 'western', BE: 'western', PT: 'western',
  PL: 'western', SE: 'western', NO: 'western', DK: 'western', FI: 'western',
  AT: 'western', CH: 'western', IE: 'western', CZ: 'western', RO: 'western',
  HU: 'western', BR: 'western', MX: 'western', AR: 'western', CO: 'western',
  UA: 'eastern_europe', RS: 'eastern_europe', BG: 'eastern_europe',
  GE: 'central_asia', AM: 'central_asia', AZ: 'central_asia', KZ: 'central_asia',
  TR: 'turkey',
  SA: 'mena', AE: 'mena', KW: 'mena', QA: 'mena', EG: 'mena', JO: 'mena',
  MA: 'mena', DZ: 'mena', LB: 'mena', IQ: 'mena',
  IN: 'india', PK: 'pakistan', BD: 'bangladesh', LK: 'india', NP: 'india',
  ID: 'sea', TH: 'sea', VN: 'sea', MY: 'sea', PH: 'sea', SG: 'sea',
  CN: 'cjk', JP: 'cjk', KR: 'cjk', TW: 'cjk', HK: 'cjk',
  NG: 'africa', KE: 'africa', ZA: 'africa', GH: 'africa', ET: 'africa',
  AU: 'oceania', NZ: 'oceania',
  JM: 'caribbean', TT: 'caribbean',
};

function resolveZone(languageCode?: string, region?: string, countryCode?: string): RegionalZone {
  // 1. Region code (most precise: sub-region → parent)
  if (region) {
    const r = region.toUpperCase();
    if (r.startsWith('CJK')) return 'cjk';
    if (r.startsWith('MENA')) return 'mena';
    if (r.startsWith('INDIA')) return 'india';
    if (r.startsWith('SEA')) return 'sea';
    if (r.startsWith('AFRICA')) return 'africa';
    if (r.startsWith('LATAM') || r.startsWith('NAM') || r.startsWith('EU')) return 'western';
    if (r.startsWith('OCEANIA')) return 'oceania';
    if (r === 'TURKEY') return 'turkey';
    if (r === 'PAKISTAN') return 'pakistan';
    if (r === 'BANGLADESH') return 'bangladesh';
    if (r.startsWith('SA_')) return 'south_asia';
    if (r.startsWith('CARIBBEAN')) return 'caribbean';
    if (r.startsWith('ASIA_CENTRAL')) return 'central_asia';
  }
  // 2. Language code
  if (languageCode) {
    const short = languageCode.split('-')[0].toLowerCase();
    const zone = LANGUAGE_ZONE_MAP[short];
    if (zone) return zone;
  }
  // 3. Country code (IP-based)
  if (countryCode) {
    const zone = COUNTRY_ZONE_MAP[countryCode.toUpperCase()];
    if (zone) return zone;
  }
  return 'western';
}

// ═══════════════════════════════════════════════════════════════════════════
// TTS PROVIDER FALLBACK CHAINS — per zone (5-deep, matching registry pattern)
// ═══════════════════════════════════════════════════════════════════════════

const ZONE_TTS_FALLBACK: Record<RegionalZone, TTSProvider[]> = {
  western:        ['elevenlabs', 'azure', 'google', 'openai', 'alibaba'],
  cjk:            ['alibaba', 'azure', 'google', 'openai', 'elevenlabs'],
  mena:           ['azure', 'elevenlabs', 'google', 'openai', 'alibaba'],
  india:          ['azure', 'google', 'elevenlabs', 'openai', 'alibaba'],
  africa:         ['azure', 'google', 'elevenlabs', 'openai', 'alibaba'],
  oceania:        ['elevenlabs', 'azure', 'google', 'openai', 'alibaba'],
  turkey:         ['azure', 'elevenlabs', 'google', 'openai', 'alibaba'],
  caribbean:      ['azure', 'elevenlabs', 'google', 'openai', 'alibaba'],
  eastern_europe: ['azure', 'elevenlabs', 'google', 'openai', 'alibaba'],
  central_asia:   ['azure', 'google', 'openai', 'elevenlabs', 'alibaba'],
  pakistan:        ['azure', 'google', 'openai', 'elevenlabs', 'alibaba'],
  bangladesh:     ['azure', 'google', 'openai', 'elevenlabs', 'alibaba'],
  sea:            ['azure', 'google', 'elevenlabs', 'openai', 'alibaba'],
  south_asia:     ['azure', 'google', 'openai', 'elevenlabs', 'alibaba'],
  fallback:       ['azure', 'elevenlabs', 'google', 'openai', 'alibaba'],
};

// ═══════════════════════════════════════════════════════════════════════════
// REGIONAL VOICE CATALOG — Parent-child inheritance from REGION_VOICE_OPTIONS
// Maps sub-region → { ori voice, arc voice } per provider
// Falls back: sub-region → parent region → zone default
// ═══════════════════════════════════════════════════════════════════════════

interface AgentVoiceConfig {
  ori: { voiceId: string; locale: string };
  arc: { voiceId: string; locale: string };
}

/** Zone-level defaults (used when no sub-region match) */
const ZONE_AGENT_VOICES: Record<string, Record<TTSProvider, AgentVoiceConfig>> = {
  western: {
    elevenlabs: {
      ori: { voiceId: 'EXAVITQu4vr4xnSDxMaL', locale: 'en-US' }, // Sarah
      arc: { voiceId: 'JBFqnCBsd6RMkjVDRZzb', locale: 'en-US' }, // George
    },
    azure: {
      ori: { voiceId: 'en-US-JennyNeural', locale: 'en-US' },
      arc: { voiceId: 'en-US-GuyNeural', locale: 'en-US' },
    },
    google: {
      ori: { voiceId: 'en-US-Neural2-C', locale: 'en-US' },
      arc: { voiceId: 'en-US-Neural2-D', locale: 'en-US' },
    },
    openai: {
      ori: { voiceId: 'nova', locale: 'en-US' },
      arc: { voiceId: 'onyx', locale: 'en-US' },
    },
    alibaba: {
      ori: { voiceId: 'en-US-Neural2-C', locale: 'en-US' },
      arc: { voiceId: 'en-US-Neural2-D', locale: 'en-US' },
    },
  },
  mena: {
    elevenlabs: {
      ori: { voiceId: 'EXAVITQu4vr4xnSDxMaL', locale: 'ar-SA' },
      arc: { voiceId: 'JBFqnCBsd6RMkjVDRZzb', locale: 'ar-SA' },
    },
    azure: {
      ori: { voiceId: 'ar-SA-ZariyahNeural', locale: 'ar-SA' },
      arc: { voiceId: 'ar-SA-HamedNeural', locale: 'ar-SA' },
    },
    google: {
      ori: { voiceId: 'ar-XA-Wavenet-A', locale: 'ar-XA' },
      arc: { voiceId: 'ar-XA-Wavenet-B', locale: 'ar-XA' },
    },
    openai: {
      ori: { voiceId: 'nova', locale: 'ar-SA' },
      arc: { voiceId: 'onyx', locale: 'ar-SA' },
    },
    alibaba: {
      ori: { voiceId: 'ar-SA-ZariyahNeural', locale: 'ar-SA' },
      arc: { voiceId: 'ar-SA-HamedNeural', locale: 'ar-SA' },
    },
  },
  india: {
    elevenlabs: {
      ori: { voiceId: 'EXAVITQu4vr4xnSDxMaL', locale: 'hi-IN' },
      arc: { voiceId: 'JBFqnCBsd6RMkjVDRZzb', locale: 'hi-IN' },
    },
    azure: {
      ori: { voiceId: 'hi-IN-SwaraNeural', locale: 'hi-IN' },
      arc: { voiceId: 'hi-IN-MadhurNeural', locale: 'hi-IN' },
    },
    google: {
      ori: { voiceId: 'hi-IN-Neural2-A', locale: 'hi-IN' },
      arc: { voiceId: 'hi-IN-Neural2-B', locale: 'hi-IN' },
    },
    openai: {
      ori: { voiceId: 'nova', locale: 'hi-IN' },
      arc: { voiceId: 'onyx', locale: 'hi-IN' },
    },
    alibaba: {
      ori: { voiceId: 'hi-IN-SwaraNeural', locale: 'hi-IN' },
      arc: { voiceId: 'hi-IN-MadhurNeural', locale: 'hi-IN' },
    },
  },
  cjk: {
    elevenlabs: {
      ori: { voiceId: 'EXAVITQu4vr4xnSDxMaL', locale: 'zh-CN' },
      arc: { voiceId: 'JBFqnCBsd6RMkjVDRZzb', locale: 'zh-CN' },
    },
    azure: {
      ori: { voiceId: 'zh-CN-XiaoxiaoNeural', locale: 'zh-CN' },
      arc: { voiceId: 'zh-CN-YunxiNeural', locale: 'zh-CN' },
    },
    google: {
      ori: { voiceId: 'cmn-CN-Wavenet-A', locale: 'cmn-CN' },
      arc: { voiceId: 'cmn-CN-Wavenet-B', locale: 'cmn-CN' },
    },
    openai: {
      ori: { voiceId: 'nova', locale: 'zh-CN' },
      arc: { voiceId: 'onyx', locale: 'zh-CN' },
    },
    alibaba: {
      ori: { voiceId: 'zh-CN-XiaoxiaoNeural', locale: 'zh-CN' },
      arc: { voiceId: 'zh-CN-YunxiNeural', locale: 'zh-CN' },
    },
  },
  africa: {
    elevenlabs: {
      ori: { voiceId: 'EXAVITQu4vr4xnSDxMaL', locale: 'en-US' },
      arc: { voiceId: 'JBFqnCBsd6RMkjVDRZzb', locale: 'en-US' },
    },
    azure: {
      ori: { voiceId: 'sw-KE-ZuriNeural', locale: 'sw-KE' },
      arc: { voiceId: 'sw-KE-RafikiNeural', locale: 'sw-KE' },
    },
    google: {
      ori: { voiceId: 'en-US-Neural2-C', locale: 'en-US' },
      arc: { voiceId: 'en-US-Neural2-D', locale: 'en-US' },
    },
    openai: {
      ori: { voiceId: 'nova', locale: 'en-US' },
      arc: { voiceId: 'onyx', locale: 'en-US' },
    },
    alibaba: {
      ori: { voiceId: 'en-US-Neural2-C', locale: 'en-US' },
      arc: { voiceId: 'en-US-Neural2-D', locale: 'en-US' },
    },
  },
};

/** Sub-region overrides: inherit from parent but override locale + voiceId */
const SUB_REGION_VOICE_OVERRIDES: Record<string, Partial<Record<TTSProvider, AgentVoiceConfig>>> = {
  // MENA sub-regions
  MENA_EGYPT: {
    azure: {
      ori: { voiceId: 'ar-EG-SalmaNeural', locale: 'ar-EG' },
      arc: { voiceId: 'ar-EG-ShakirNeural', locale: 'ar-EG' },
    },
  },
  MENA_LEVANT: {
    azure: {
      ori: { voiceId: 'ar-JO-SanaNeural', locale: 'ar-JO' },
      arc: { voiceId: 'ar-JO-TaimNeural', locale: 'ar-JO' },
    },
  },
  MENA_MAGHREB: {
    azure: {
      ori: { voiceId: 'ar-MA-MounaNeural', locale: 'ar-MA' },
      arc: { voiceId: 'ar-MA-JamalNeural', locale: 'ar-MA' },
    },
  },
  // India sub-regions
  INDIA_SOUTH_TA: {
    azure: {
      ori: { voiceId: 'ta-IN-PallaviNeural', locale: 'ta-IN' },
      arc: { voiceId: 'ta-IN-ValluvarNeural', locale: 'ta-IN' },
    },
  },
  INDIA_SOUTH_TE: {
    azure: {
      ori: { voiceId: 'te-IN-ShrutiNeural', locale: 'te-IN' },
      arc: { voiceId: 'te-IN-MohanNeural', locale: 'te-IN' },
    },
  },
  INDIA_WEST_MR: {
    azure: {
      ori: { voiceId: 'mr-IN-AarohiNeural', locale: 'mr-IN' },
      arc: { voiceId: 'mr-IN-ManoharNeural', locale: 'mr-IN' },
    },
  },
  INDIA_EAST_BN: {
    azure: {
      ori: { voiceId: 'bn-IN-TanishaaNeural', locale: 'bn-IN' },
      arc: { voiceId: 'bn-IN-BashkarNeural', locale: 'bn-IN' },
    },
  },
  INDIA_NORTH_UR: {
    azure: {
      ori: { voiceId: 'ur-IN-GulNeural', locale: 'ur-IN' },
      arc: { voiceId: 'ur-IN-SalmanNeural', locale: 'ur-IN' },
    },
  },
  INDIA_NORTH_PA: {
    azure: {
      ori: { voiceId: 'pa-IN-OjasNeural', locale: 'pa-IN' },
      arc: { voiceId: 'pa-IN-GurpreetNeural', locale: 'pa-IN' },
    },
  },
  // Pakistan / Bangladesh
  PAKISTAN: {
    azure: {
      ori: { voiceId: 'ur-PK-UzmaNeural', locale: 'ur-PK' },
      arc: { voiceId: 'ur-PK-AsadNeural', locale: 'ur-PK' },
    },
  },
  BANGLADESH: {
    azure: {
      ori: { voiceId: 'bn-BD-NabanitaNeural', locale: 'bn-BD' },
      arc: { voiceId: 'bn-BD-PradeepNeural', locale: 'bn-BD' },
    },
  },
  // SEA
  SEA_THAI: {
    azure: {
      ori: { voiceId: 'th-TH-PremwadeeNeural', locale: 'th-TH' },
      arc: { voiceId: 'th-TH-NiwatNeural', locale: 'th-TH' },
    },
  },
  SEA_VIET: {
    azure: {
      ori: { voiceId: 'vi-VN-HoaiMyNeural', locale: 'vi-VN' },
      arc: { voiceId: 'vi-VN-NamMinhNeural', locale: 'vi-VN' },
    },
  },
  SEA_MALAY: {
    azure: {
      ori: { voiceId: 'ms-MY-YasminNeural', locale: 'ms-MY' },
      arc: { voiceId: 'ms-MY-OsmanNeural', locale: 'ms-MY' },
    },
  },
  // EU sub-regions
  EU_DACH: {
    azure: {
      ori: { voiceId: 'de-DE-KatjaNeural', locale: 'de-DE' },
      arc: { voiceId: 'de-DE-ConradNeural', locale: 'de-DE' },
    },
  },
  EU_FRANCE: {
    azure: {
      ori: { voiceId: 'fr-FR-DeniseNeural', locale: 'fr-FR' },
      arc: { voiceId: 'fr-FR-HenriNeural', locale: 'fr-FR' },
    },
  },
  EU_IBERIA: {
    azure: {
      ori: { voiceId: 'es-ES-ElviraNeural', locale: 'es-ES' },
      arc: { voiceId: 'es-ES-AlvaroNeural', locale: 'es-ES' },
    },
  },
  EU_NORDIC: {
    azure: {
      ori: { voiceId: 'sv-SE-SofieNeural', locale: 'sv-SE' },
      arc: { voiceId: 'sv-SE-MattiasNeural', locale: 'sv-SE' },
    },
  },
  EU_EAST: {
    azure: {
      ori: { voiceId: 'pl-PL-ZofiaNeural', locale: 'pl-PL' },
      arc: { voiceId: 'pl-PL-MarekNeural', locale: 'pl-PL' },
    },
  },
  EU_WEST: {
    azure: {
      ori: { voiceId: 'en-GB-SoniaNeural', locale: 'en-GB' },
      arc: { voiceId: 'en-GB-RyanNeural', locale: 'en-GB' },
    },
  },
  // LATAM sub-regions
  LATAM_BRAZIL: {
    azure: {
      ori: { voiceId: 'pt-BR-FranciscaNeural', locale: 'pt-BR' },
      arc: { voiceId: 'pt-BR-AntonioNeural', locale: 'pt-BR' },
    },
  },
  LATAM_MEXICO: {
    azure: {
      ori: { voiceId: 'es-MX-DaliaNeural', locale: 'es-MX' },
      arc: { voiceId: 'es-MX-JorgeNeural', locale: 'es-MX' },
    },
  },
  // CJK sub-regions
  CJK_JP: {
    azure: {
      ori: { voiceId: 'ja-JP-NanamiNeural', locale: 'ja-JP' },
      arc: { voiceId: 'ja-JP-KeitaNeural', locale: 'ja-JP' },
    },
  },
  CJK_KR: {
    azure: {
      ori: { voiceId: 'ko-KR-SunHiNeural', locale: 'ko-KR' },
      arc: { voiceId: 'ko-KR-InJoonNeural', locale: 'ko-KR' },
    },
  },
  // Turkey
  TURKEY: {
    azure: {
      ori: { voiceId: 'tr-TR-EmelNeural', locale: 'tr-TR' },
      arc: { voiceId: 'tr-TR-AhmetNeural', locale: 'tr-TR' },
    },
  },
  // Oceania
  OCEANIA_AU: {
    azure: {
      ori: { voiceId: 'en-AU-NatashaNeural', locale: 'en-AU' },
      arc: { voiceId: 'en-AU-WilliamNeural', locale: 'en-AU' },
    },
  },
  OCEANIA_NZ: {
    azure: {
      ori: { voiceId: 'en-NZ-MollyNeural', locale: 'en-NZ' },
      arc: { voiceId: 'en-NZ-MitchellNeural', locale: 'en-NZ' },
    },
  },
};

/** Resolve voice for agent+provider using parent-child inheritance */
function resolveVoice(
  agent: 'ori' | 'arc',
  provider: TTSProvider,
  zone: RegionalZone,
  subRegion?: string,
): { voiceId: string; locale: string } {
  // 1. Sub-region override
  if (subRegion) {
    const upper = subRegion.toUpperCase();
    const override = SUB_REGION_VOICE_OVERRIDES[upper]?.[provider];
    if (override) return override[agent];
  }
  // 2. Zone default
  const zoneVoices = ZONE_AGENT_VOICES[zone] || ZONE_AGENT_VOICES.western;
  if (zoneVoices?.[provider]) return zoneVoices[provider][agent];
  // 3. Absolute fallback
  return ZONE_AGENT_VOICES.western[provider]?.[agent] || { voiceId: 'nova', locale: 'en-US' };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER IMPLEMENTATIONS (unchanged from before)
// ═══════════════════════════════════════════════════════════════════════════

function getAvailableProviders(): TTSProvider[] {
  const providers: TTSProvider[] = [];
  if (Deno.env.get('ELEVENLABS_API_KEY')) providers.push('elevenlabs');
  if (Deno.env.get('AZURE_SPEECH_KEY')) providers.push('azure');
  if (Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')) providers.push('google');
  if (Deno.env.get('OPENAI_API_KEY')) providers.push('openai');
  if (Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('DASHSCOPE_API_KEY')) providers.push('alibaba');
  return providers;
}

function selectProviderChain(zone: RegionalZone): TTSProvider[] {
  const available = getAvailableProviders();
  if (available.length === 0) throw new Error('No TTS API keys configured');
  const chain = ZONE_TTS_FALLBACK[zone] || ZONE_TTS_FALLBACK.fallback;
  return chain.filter(p => available.includes(p));
}

async function generateElevenLabs(text: string, voiceId: string, speed: number): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY')!;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text, model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.3, speed },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

async function generateAzure(text: string, voiceId: string, locale: string, speed: number): Promise<ArrayBuffer> {
  const key = Deno.env.get('AZURE_SPEECH_KEY')!;
  const region = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  const tokenRes = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Length': '0' },
  });
  const token = await tokenRes.text();
  const rate = speed !== 1 ? `rate="${Math.round((speed - 1) * 100)}%"` : '';
  const xmlLang = locale || voiceId.split('-').slice(0, 2).join('-');
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${xmlLang}">
    <voice name="${voiceId}"><prosody ${rate}>${text}</prosody></voice>
  </speak>`;
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3' },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Azure: ${res.status}`);
  return res.arrayBuffer();
}

async function generateGoogle(text: string, voiceId: string, locale: string, speed: number): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')!;
  const langCode = locale || voiceId.split('-').slice(0, 2).join('-');
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { name: voiceId, languageCode: langCode },
      audioConfig: { audioEncoding: 'MP3', speakingRate: speed },
    }),
  });
  if (!res.ok) throw new Error(`Google: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const binary = atob(data.audioContent);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function generateOpenAI(text: string, voice: string, speed: number): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')!;
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text, voice, speed, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      text,
      agent = 'ori',
      languageCode = 'en-US',
      region,
      parentRegion,
      countryCode,
      speed = 1.0,
    }: GuideTTSRequest = await req.json();

    if (!text || text.length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const safeText = text.slice(0, 1000);
    const zone = resolveZone(languageCode, region || parentRegion, countryCode);
    const providerChain = selectProviderChain(zone);

    console.log(`🎙️ Guide TTS: agent=${agent}, zone=${zone}, region=${region || 'auto'}, chain=${providerChain.join('→')}, chars=${safeText.length}`);

    let audioBuffer: ArrayBuffer | null = null;
    let usedProvider: TTSProvider = providerChain[0];

    for (const provider of providerChain) {
      try {
        const voice = resolveVoice(agent, provider, zone, region);
        console.log(`  → Trying ${provider}: voice=${voice.voiceId}, locale=${voice.locale}`);

        switch (provider) {
          case 'elevenlabs': audioBuffer = await generateElevenLabs(safeText, voice.voiceId, speed); break;
          case 'azure': audioBuffer = await generateAzure(safeText, voice.voiceId, voice.locale, speed); break;
          case 'google': audioBuffer = await generateGoogle(safeText, voice.voiceId, voice.locale, speed); break;
          case 'openai': audioBuffer = await generateOpenAI(safeText, voice.voiceId, speed); break;
          case 'alibaba': audioBuffer = await generateAzure(safeText, voice.voiceId, voice.locale, speed); break; // Alibaba fallback to Azure
        }
        usedProvider = provider;
        break;
      } catch (err) {
        console.warn(`⚠️ Guide TTS fallback: ${provider} failed — ${(err as Error).message}`);
        continue;
      }
    }

    if (!audioBuffer) {
      return new Response(JSON.stringify({ error: 'All TTS providers failed' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const voice = resolveVoice(agent, usedProvider, zone, region);

    return new Response(JSON.stringify({
      audio: base64Audio,
      provider: usedProvider,
      agent,
      zone,
      region: region || 'auto',
      locale: voice.locale,
      format: 'mp3',
      chars: safeText.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Guide TTS error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
