/**
 * DIALECT TTS DEMO - Landing Page Language Showcase
 * 
 * Provides TTS samples for ALL regional language tabs:
 * Arabic dialects, Indian languages, CJK, African, LATAM, European
 * 
 * TTS ROUTING (per master-provider-routing-registry):
 *   CJK: Alibaba Qwen3-TTS-Flash (Singapore) PRIMARY → Azure Neural → ElevenLabs
 *   All other zones: Azure Neural PRIMARY → ElevenLabs
 * 
 * TRANSCREATION LLM ROUTING (zone-routed):
 *   Western/EU/LATAM: Claude 4 → GPT-4o → Gemini Pro → DeepSeek
 *   CJK/MENA: Qwen-Max → GPT-4o → Claude → DeepSeek
 *   India/SEA/Africa: Gemini 3 Pro → GPT-4o → Claude → DeepSeek
 * 
 * CRITICAL: custom_tts transcreates text into the target language FIRST,
 * then passes the transcreated text to TTS — ensuring cultural + linguistic accuracy.
 * 
 * SECURITY: Rate-limited per IP, input-validated, public endpoint (no JWT)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================
// RATE LIMITING — In-memory per IP
// ============================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const CUSTOM_TTS_LIMIT = 10;

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('cf-connecting-ip') 
    || req.headers.get('x-real-ip') 
    || 'unknown';
}

function checkRateLimit(ip: string, limit: number = RATE_LIMIT_MAX_REQUESTS): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetIn: entry.resetAt - now };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

// ============================================
// INPUT VALIDATION
// ============================================
const MAX_CUSTOM_TEXT_LENGTH = 500;
const VALID_ACTIONS = ['get_languages', 'generate_tts', 'custom_tts'];
const VALID_MODES = ['transcreation', 'literal', undefined];

function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .slice(0, MAX_CUSTOM_TEXT_LENGTH);
}

// ============================================
// LANGUAGE NAME MAP — for translation prompts
// ============================================
const LANGUAGE_NAMES: Record<string, string> = {
  'ar-SA': 'Saudi Arabic', 'ar-EG': 'Egyptian Arabic', 'ar-AE': 'Gulf Arabic',
  'ar-LB': 'Levantine Arabic', 'ar-MA': 'Moroccan Arabic', 'ar-IQ': 'Iraqi Arabic',
  'ar-MSA': 'Modern Standard Arabic',
  'hi-IN': 'Hindi', 'ta-IN': 'Tamil', 'te-IN': 'Telugu', 'bn-IN': 'Bengali',
  'mr-IN': 'Marathi', 'gu-IN': 'Gujarati', 'kn-IN': 'Kannada', 'ml-IN': 'Malayalam',
  'ja-JP': 'Japanese', 'zh-CN': 'Simplified Chinese', 'ko-KR': 'Korean',
  'th-TH': 'Thai', 'vi-VN': 'Vietnamese', 'id-ID': 'Indonesian',
  'sw-KE': 'Swahili', 'yo-NG': 'Yoruba', 'ha-NG': 'Hausa', 'zu-ZA': 'Zulu', 'am-ET': 'Amharic',
  'es-MX': 'Mexican Spanish', 'pt-BR': 'Brazilian Portuguese', 'es-CO': 'Colombian Spanish',
  'es-AR': 'Argentine Spanish', 'es-CL': 'Chilean Spanish', 'es-PE': 'Peruvian Spanish',
  'de-DE': 'German', 'fr-FR': 'French', 'es-ES': 'Spanish', 'it-IT': 'Italian',
  'nl-NL': 'Dutch', 'pl-PL': 'Polish', 'sv-SE': 'Swedish', 'pt-PT': 'European Portuguese',
};

// ============================================
// VOICE REGISTRIES — ALL REGIONS
// ============================================

const ARABIC_VOICES: Record<string, { voice: string; region: string; transcreation: string; literal: string }> = {
  'ar-SA': { voice: 'ar-SA-ZariyahNeural', region: 'Saudi Arabia', transcreation: 'ابدأ تسوي فيديوهات روعة — مجاناً!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-EG': { voice: 'ar-EG-ShakirNeural', region: 'Egypt', transcreation: 'ابدأ اعمل فيديوهات جامدة — ببلاش!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-AE': { voice: 'ar-AE-FatimaNeural', region: 'UAE/Gulf', transcreation: 'ابدا سوّي فيديوهات حلوة — مجان!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-LB': { voice: 'ar-JO-TaimNeural', region: 'Lebanon/Syria', transcreation: 'بلّش اعمل فيديوهات كتير حلوة!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-MA': { voice: 'ar-MA-MounaNeural', region: 'Morocco', transcreation: 'بدا دير فيديوهات زوينين!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-IQ': { voice: 'ar-IQ-BasselNeural', region: 'Iraq', transcreation: 'ابدي سوّي فيديوهات روعة!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-MSA': { voice: 'ar-SA-HamedNeural', region: 'Formal/News', transcreation: 'ابدأ بإنشاء مقاطع فيديو احترافية', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
};

const INDIAN_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'hi-IN': { voice: 'hi-IN-MadhurNeural', transcreation: 'AI course creator फ्री में ट्राई करो! एकदम मस्त है!', literal: 'कृपया हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं' },
  'ta-IN': { voice: 'ta-IN-PallaviNeural', transcreation: 'AI course creator free-ஆ try பண்ணு! சூப்பரா இருக்கு!', literal: 'எங்கள் AI-இயக்கப்படும் பாடநெறி உருவாக்கியை இலவசமாக முயற்சிக்கவும்' },
  'te-IN': { voice: 'te-IN-MohanNeural', transcreation: 'AI course creator free-గా try చెయ్యి! చాలా బాగుంది!', literal: 'దయచేసి మా AI-ఆధారిత కోర్సు సృష్టికర్తను ఉచితంగా ప్రయత్నించండి' },
  'bn-IN': { voice: 'bn-IN-BashkarNeural', transcreation: 'AI course creator free-তে try করো! একদম ঝাক্কাস!', literal: 'অনুগ্রহ করে আমাদের AI-চালিত কোর্স নির্মাতা বিনামূল্যে চেষ্টা করুন' },
  'mr-IN': { voice: 'mr-IN-AarohiNeural', transcreation: 'AI course creator free मध्ये try करा! एकदम भारी आहे!', literal: 'कृपया आमचे AI-संचालित कोर्स निर्माता विनामूल्य वापरून पहा' },
  'gu-IN': { voice: 'gu-IN-DhwaniNeural', transcreation: 'AI course creator free માં try કરો! એકદમ મસ્ત છે!', literal: 'કૃપા કરીને અમારા AI-સંચાલિત કોર્સ નિર્માતાને મફતમાં અજમાવો' },
  'kn-IN': { voice: 'kn-IN-SapnaNeural', transcreation: 'AI course creator free ಆಗಿ try ಮಾಡಿ! ಸೂಪರ್ ಇದೆ!', literal: 'ದಯವಿಟ್ಟು ನಮ್ಮ AI-ಚಾಲಿತ ಕೋರ್ಸ್ ಸೃಷ್ಟಿಕರ್ತವನ್ನು ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ' },
  'ml-IN': { voice: 'ml-IN-MidhunNeural', transcreation: 'AI course creator free ആയി try ചെയ്യൂ! കിടുക്കാച്ചി!', literal: 'ദയവായി ഞങ്ങളുടെ AI-പവർഡ് കോഴ്സ് ക്രിയേറ്റർ സൗജന്യമായി പരീക്ഷിക്കുക' },
};

const CJK_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'ja-JP': { voice: 'ja-JP-NanamiNeural', transcreation: 'AIで動画制作を始めよう — 無料で、すぐに使えます！', literal: '当社のAI動画制作ツールを無料でお試しください' },
  'zh-CN': { voice: 'zh-CN-XiaoxiaoNeural', transcreation: '用AI来创作精彩视频吧——完全免费，立即上手！', literal: '请免费试用我们的AI视频制作工具' },
  'ko-KR': { voice: 'ko-KR-SunHiNeural', transcreation: 'AI로 멋진 영상 만들어 보세요 — 무료로 바로 시작!', literal: '당사의 AI 비디오 제작 도구를 무료로 사용해 보세요' },
  'th-TH': { voice: 'th-TH-PremwadeeNeural', transcreation: 'เริ่มสร้างวิดีโอสุดเจ๋งด้วย AI — ฟรี ไม่มีข้อผูกมัด!', literal: 'กรุณาลองใช้เครื่องมือสร้างวิดีโอ AI ของเราฟรี' },
  'vi-VN': { voice: 'vi-VN-HoaiMyNeural', transcreation: 'Bắt đầu tạo video tuyệt vời với AI — miễn phí hoàn toàn!', literal: 'Vui lòng dùng thử công cụ tạo video AI của chúng tôi miễn phí' },
  'id-ID': { voice: 'id-ID-GadisNeural', transcreation: 'Mulai bikin video keren pakai AI — gratis, tanpa ribet!', literal: 'Silakan coba alat pembuat video AI kami secara gratis' },
};

const AFRICAN_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'sw-KE': { voice: 'sw-KE-ZuriNeural', transcreation: 'Anza kuunda video za kushangaza — bure kabisa!', literal: 'Begin creating excellent video content for free' },
  'yo-NG': { voice: 'yo-NG-EzeNeural', transcreation: 'Bẹ̀rẹ̀ ṣíṣe fidio to dára — ọfẹ́ ni!', literal: 'Begin creating excellent video content for free' },
  'ha-NG': { voice: 'ha-NG-LamisNeural', transcreation: 'Fara yin bidiyo mai kyau — ba tare da biyan kuɗi ba!', literal: 'Begin creating excellent video content for free' },
  'zu-ZA': { voice: 'zu-ZA-ThandoNeural', transcreation: 'Qala ukwenza amavidiyo amahle — mahhala!', literal: 'Begin creating excellent video content for free' },
  'am-ET': { voice: 'am-ET-AmehaNeural', transcreation: 'አስደናቂ ቪዲዮዎችን መፍጠር ጀምር — ነጻ!', literal: 'Begin creating excellent video content for free' },
};

const LATAM_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'es-MX': { voice: 'es-MX-DaliaNeural', transcreation: '¡Échale ganas y crea videos chidos con IA — es gratis, neta!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'pt-BR': { voice: 'pt-BR-FranciscaNeural', transcreation: 'Começa a criar vídeos incríveis com IA — de graça, sem pegadinha!', literal: 'Por favor, experimente nossa ferramenta de vídeo com IA gratuitamente' },
  'es-CO': { voice: 'es-CO-SalomeNeural', transcreation: '¡Empieza a crear videos bacanos con IA — gratis, parce!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'es-AR': { voice: 'es-AR-ElenaNeural', transcreation: '¡Arrancá a crear videos re piolas con IA — es gratis, posta!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'es-CL': { voice: 'es-CL-CatalinaNeural', transcreation: '¡Empieza a crear videos bacanes con IA — gratis, al tiro!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'es-PE': { voice: 'es-PE-AlexNeural', transcreation: '¡Empieza a crear videos chéveres con IA — es gratis, causa!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
};

const ENGLISH_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'en-US': { voice: 'en-US-JennyNeural', transcreation: 'Start creating amazing videos with AI — free, no strings attached!', literal: 'Start creating amazing videos with AI — free, no strings attached!' },
  'en-GB': { voice: 'en-GB-SoniaNeural', transcreation: 'Start creating brilliant videos with AI — free, no catches!', literal: 'Start creating brilliant videos with AI — free, no catches!' },
  'en-AU': { voice: 'en-AU-NatashaNeural', transcreation: 'Start creating ripper videos with AI — free, no worries!', literal: 'Start creating amazing videos with AI — free, no strings attached!' },
  'en-KE': { voice: 'en-KE-AsiliaNeural', transcreation: 'Start creating amazing videos with AI — free, no strings attached!', literal: 'Start creating amazing videos with AI — free, no strings attached!' },
};

const EUROPEAN_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'de-DE': { voice: 'de-DE-KatjaNeural', transcreation: 'Leg los mit genialen Videos — kostenlos und ohne Haken!', literal: 'Beginnen Sie mit der Erstellung hervorragender Videoinhalte' },
  'fr-FR': { voice: 'fr-FR-DeniseNeural', transcreation: 'Lancez-vous dans la création vidéo — c\'est gratuit et sans engagement !', literal: 'Commencez à créer d\'excellents contenus vidéo' },
  'es-ES': { voice: 'es-ES-ElviraNeural', transcreation: '¡Empieza a crear vídeos increíbles — gratis y sin compromiso!', literal: 'Comience a crear contenido de video excelente' },
  'it-IT': { voice: 'it-IT-ElsaNeural', transcreation: 'Inizia a creare video fantastici — è gratis, senza impegno!', literal: 'Inizia a creare contenuti video eccellenti' },
  'nl-NL': { voice: 'nl-NL-ColetteNeural', transcreation: 'Begin met het maken van geweldige video\'s — gratis en vrijblijvend!', literal: 'Begin met het maken van uitstekende video-inhoud' },
  'pl-PL': { voice: 'pl-PL-AgnieszkaNeural', transcreation: 'Zacznij tworzyć genialne filmy z AI — za darmo, bez zobowiązań!', literal: 'Proszę bezpłatnie wypróbować nasze narzędzie do tworzenia wideo AI' },
  'sv-SE': { voice: 'sv-SE-SofieNeural', transcreation: 'Börja skapa fantastiska videor med AI — gratis, inga krångel!', literal: 'Vänligen prova vårt AI-videoverktyg gratis' },
  'pt-PT': { voice: 'pt-PT-RaquelNeural', transcreation: 'Começa a criar vídeos espetaculares com IA — grátis e sem compromisso!', literal: 'Por favor, experimente a nossa ferramenta de criação de vídeo com IA gratuitamente' },
  'fr-CA': { voice: 'fr-CA-SylvieNeural', transcreation: 'Commence à créer des vidéos incroyables avec l\'IA — gratuit!', literal: 'Commencez à créer d\'excellents contenus vidéo' },
  'tr-TR': { voice: 'tr-TR-EmelNeural', transcreation: 'AI ile harika videolar oluşturmaya başlayın — ücretsiz!', literal: 'Lütfen AI video oluşturma aracımızı ücretsiz deneyin' },
  'he-IL': { voice: 'he-IL-AvriNeural', transcreation: '!התחילו ליצור סרטונים מדהימים עם AI — בחינם', literal: 'אנא נסו את כלי יצירת הוידאו שלנו בחינם' },
  'ur-PK': { voice: 'ur-PK-AsadNeural', transcreation: '!AI کے ساتھ شاندار ویڈیوز بنانا شروع کریں — مفت', literal: 'براہ کرم ہمارے AI ویڈیو ٹول کو مفت میں آزمائیں' },
  'as-IN': { voice: 'as-IN-PriyomNeural', transcreation: 'AI ৰে ভিডিঅ বনাওক — ফ্ৰী!', literal: 'AI ভিডিঅ সঁজুলি বিনামূলীয়াকৈ চেষ্টা কৰক' },
};

function lookupVoice(code: string): { voice: string; transcreation: string; literal: string } | null {
  return ARABIC_VOICES[code] || INDIAN_VOICES[code] || CJK_VOICES[code] 
    || AFRICAN_VOICES[code] || LATAM_VOICES[code] || EUROPEAN_VOICES[code] || ENGLISH_VOICES[code] || null;
}

// ============================================
// ZONE-ROUTED LLM TRANSCREATION
// Claude 4 (Western/EU/LATAM) | Qwen-Max (CJK/MENA) | Gemini 3 Pro (India/SEA/Africa)
// Fallback: GPT-4o → DeepSeek → Gemini Flash
// ============================================

const MENA_LANG_CODES = ['ar-SA', 'ar-EG', 'ar-AE', 'ar-LB', 'ar-MA', 'ar-IQ', 'ar-MSA', 'he-IL', 'ur-PK', 'fa-IR'];
const INDIA_SEA_AFRICA_CODES = ['hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'as-IN',
  'th-TH', 'vi-VN', 'id-ID', 'ms-MY', 'sw-KE', 'yo-NG', 'ha-NG', 'zu-ZA', 'am-ET'];
const WESTERN_EU_LATAM_CODES = ['en-US', 'en-GB', 'en-AU', 'en-KE', 'de-DE', 'fr-FR', 'fr-CA', 'es-ES', 'it-IT',
  'nl-NL', 'pl-PL', 'sv-SE', 'pt-PT', 'tr-TR', 'es-MX', 'pt-BR', 'es-CO', 'es-AR', 'es-CL', 'es-PE'];

type TranscreationZone = 'claude' | 'qwen' | 'gemini';

function detectTranscreationZone(langCode: string): TranscreationZone {
  if (CJK_LANG_CODES.includes(langCode)) return 'qwen';
  if (MENA_LANG_CODES.includes(langCode)) return 'qwen';
  if (INDIA_SEA_AFRICA_CODES.includes(langCode)) return 'gemini';
  if (WESTERN_EU_LATAM_CODES.includes(langCode)) return 'claude';
  return 'gemini'; // default fallback zone
}

async function transcreateWithClaude(text: string, langName: string): Promise<string | null> {
  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: `Transcreate the following English text into ${langName}. Use natural, culturally appropriate language — this is for TTS so it must sound natural when spoken aloud. Adapt idioms, references, and tone for the target culture. Return ONLY the transcreated text.\n\nText: ${text}` }],
      }),
    });
    if (!res.ok) { console.error(`[dialect-tts-demo] Claude error: ${res.status}`); return null; }
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (e) { console.error('[dialect-tts-demo] Claude failed:', e); return null; }
}

async function transcreateWithQwen(text: string, langName: string): Promise<string | null> {
  const key = Deno.env.get('ALIBABA_SINGAPORE_API_KEY') || Deno.env.get('ALIBABA_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen-max',
        messages: [
          { role: 'system', content: 'You are a professional transcreation specialist. Adapt text culturally, not just translate literally. Output ONLY the transcreated text.' },
          { role: 'user', content: `Transcreate into ${langName} for TTS (must sound natural spoken aloud). Adapt idioms, cultural references, and tone.\n\nText: ${text}` },
        ],
        temperature: 0.3,
      }),
    });
    if (!res.ok) { console.error(`[dialect-tts-demo] Qwen error: ${res.status}`); return null; }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) { console.error('[dialect-tts-demo] Qwen failed:', e); return null; }
}

async function transcreateWithGemini(text: string, langName: string): Promise<string | null> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Transcreate the following English text into ${langName}. Use natural, culturally appropriate language — this is for TTS so it must sound natural when spoken aloud. Adapt idioms, references, and tone for the target culture. Return ONLY the transcreated text.\n\nText: ${text}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });
    if (!res.ok) { console.error(`[dialect-tts-demo] Gemini error: ${res.status}`); return null; }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (e) { console.error('[dialect-tts-demo] Gemini failed:', e); return null; }
}

async function transcreateWithGPT4o(text: string, langName: string): Promise<string | null> {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a professional transcreation specialist. Adapt text culturally for TTS. Output ONLY the transcreated text.' },
          { role: 'user', content: `Transcreate into ${langName}:\n\n${text}` },
        ],
        temperature: 0.3,
      }),
    });
    if (!res.ok) { console.error(`[dialect-tts-demo] GPT-4o error: ${res.status}`); return null; }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) { console.error('[dialect-tts-demo] GPT-4o failed:', e); return null; }
}

async function transcreateWithDeepSeek(text: string, langName: string): Promise<string | null> {
  const key = Deno.env.get('DEEPSEEK_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a transcreation specialist. Adapt text culturally for TTS. Output ONLY the transcreated text.' },
          { role: 'user', content: `Transcreate into ${langName}:\n\n${text}` },
        ],
        temperature: 0.3,
      }),
    });
    if (!res.ok) { console.error(`[dialect-tts-demo] DeepSeek error: ${res.status}`); return null; }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) { console.error('[dialect-tts-demo] DeepSeek failed:', e); return null; }
}

async function translateTextForTTS(text: string, targetLangCode: string): Promise<{ translatedText: string; wasTranslated: boolean; transcreationProvider?: string }> {
  const langName = LANGUAGE_NAMES[targetLangCode];
  if (!langName) {
    console.log(`[dialect-tts-demo] No language name for ${targetLangCode}, skipping transcreation`);
    return { translatedText: text, wasTranslated: false };
  }

  const baseLang = targetLangCode.split('-')[0];
  if (baseLang === 'en') {
    return { translatedText: text, wasTranslated: false };
  }

  const zone = detectTranscreationZone(targetLangCode);
  console.log(`[dialect-tts-demo] 🌐 Transcreation zone: ${zone} for ${langName} (${targetLangCode})`);

  // Zone-routed primary → fallback chain
  let result: string | null = null;
  let provider = '';

  if (zone === 'claude') {
    // Western/EU/LATAM: Claude → GPT-4o → Gemini → DeepSeek
    result = await transcreateWithClaude(text, langName);
    if (result) provider = 'claude-4';
    if (!result) { result = await transcreateWithGPT4o(text, langName); if (result) provider = 'gpt-4o'; }
    if (!result) { result = await transcreateWithGemini(text, langName); if (result) provider = 'gemini-pro'; }
    if (!result) { result = await transcreateWithDeepSeek(text, langName); if (result) provider = 'deepseek'; }
  } else if (zone === 'qwen') {
    // CJK/MENA: Qwen-Max → GPT-4o → Claude → DeepSeek
    result = await transcreateWithQwen(text, langName);
    if (result) provider = 'qwen-max';
    if (!result) { result = await transcreateWithGPT4o(text, langName); if (result) provider = 'gpt-4o'; }
    if (!result) { result = await transcreateWithClaude(text, langName); if (result) provider = 'claude-4'; }
    if (!result) { result = await transcreateWithDeepSeek(text, langName); if (result) provider = 'deepseek'; }
  } else {
    // India/SEA/Africa: Gemini Pro → GPT-4o → Claude → DeepSeek
    result = await transcreateWithGemini(text, langName);
    if (result) provider = 'gemini-pro';
    if (!result) { result = await transcreateWithGPT4o(text, langName); if (result) provider = 'gpt-4o'; }
    if (!result) { result = await transcreateWithClaude(text, langName); if (result) provider = 'claude-4'; }
    if (!result) { result = await transcreateWithDeepSeek(text, langName); if (result) provider = 'deepseek'; }
  }

  if (result && result.length > 0) {
    console.log(`[dialect-tts-demo] ✅ Transcreated via ${provider}: "${text.slice(0, 40)}..." → "${result.slice(0, 40)}..."`);
    return { translatedText: result, wasTranslated: true, transcreationProvider: provider };
  }

  console.warn(`[dialect-tts-demo] ⚠️ All transcreation providers failed for ${langName}, using original text`);
  return { translatedText: text, wasTranslated: false };
}

// ============================================
// TTS PROVIDERS — Azure Neural PRIMARY
// ============================================

async function generateAzureTTS(text: string, voice: string): Promise<ArrayBuffer | null> {
  const azureKey = Deno.env.get('AZURE_SPEECH_KEY');
  const azureRegion = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  if (!azureKey) {
    console.log('[dialect-tts-demo] Azure key not configured');
    return null;
  }

  try {
    const langCode = voice.split('-').slice(0, 2).join('-');
    
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${langCode}">
        <voice name="${voice}">
          ${text}
        </voice>
      </speak>
    `;

    const response = await fetch(
      `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      console.error(`[dialect-tts-demo] Azure TTS error: ${response.status} ${await response.text()}`);
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('[dialect-tts-demo] Azure TTS failed:', error);
    return null;
  }
}

async function generateElevenLabsTTS(text: string, voiceId: string = 'JBFqnCBsd6RMkjVDRZzb'): Promise<ArrayBuffer | null> {
  const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
  
  if (!elevenLabsKey) {
    console.log('[dialect-tts-demo] ElevenLabs key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(`[dialect-tts-demo] ElevenLabs TTS error: ${response.status}`);
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('[dialect-tts-demo] ElevenLabs TTS failed:', error);
    return null;
  }
}

// ============================================
// ALIBABA QWEN3-TTS-FLASH — Singapore endpoint for CJK zone
// (Replaces legacy CosyVoice WebSocket — Qwen3-TTS-Flash is the current production TTS)
// ============================================
const CJK_LANG_CODES = ['ja-JP', 'zh-CN', 'ko-KR', 'th-TH', 'vi-VN', 'id-ID'];

async function generateAlibabaTTS(text: string, languageCode: string): Promise<ArrayBuffer | null> {
  const alibabaKey = Deno.env.get('ALIBABA_SINGAPORE_API_KEY') || Deno.env.get('ALIBABA_API_KEY');
  if (!alibabaKey) {
    console.log('[dialect-tts-demo] No Alibaba key configured');
    return null;
  }

  // Use qwen3-tts-flash (confirmed available in Singapore workspace)
  const model = 'qwen3-tts-flash';
  console.log(`[dialect-tts-demo] 🌸 Alibaba TTS: model=${model}, lang=${languageCode}`);

  try {
    // DashScope multimodal-generation endpoint for Qwen3-TTS
    const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${alibabaKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: { text },
        parameters: { voice: 'Cherry' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[dialect-tts-demo] Alibaba TTS error ${response.status}:`, errText);
      return null;
    }

    // Check content type - DashScope returns audio directly or JSON with base64
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('audio')) {
      // Direct audio binary response
      const buffer = await response.arrayBuffer();
      console.log(`[dialect-tts-demo] ✅ Alibaba TTS success (binary): ${buffer.byteLength} bytes`);
      return buffer;
    }
    
    // JSON response - may contain URL or base64
    const data = await response.json();
    console.log(`[dialect-tts-demo] Alibaba TTS response keys:`, JSON.stringify(data).slice(0, 300));
    
    // Check for audio URL in output
    const audioUrl = data.output?.audio?.url || data.output?.audio;
    if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
      // Fetch the audio file from the URL
      const audioRes = await fetch(audioUrl);
      if (audioRes.ok) {
        const buffer = await audioRes.arrayBuffer();
        console.log(`[dialect-tts-demo] ✅ Alibaba TTS success (URL fetch): ${buffer.byteLength} bytes`);
        return buffer;
      }
    }
    
    // Check for base64 audio data
    const audioBase64 = data.output?.audio?.data;
    if (audioBase64 && typeof audioBase64 === 'string') {
      const binaryStr = atob(audioBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      console.log(`[dialect-tts-demo] ✅ Alibaba TTS success (base64): ${bytes.length} bytes`);
      return bytes.buffer;
    }
    
    console.error('[dialect-tts-demo] Alibaba TTS: no audio in response', JSON.stringify(data).slice(0, 300));
    return null;
  } catch (error) {
    console.error('[dialect-tts-demo] Alibaba TTS exception:', error);
    return null;
  }
}

// ============================================
// CUSTOM TTS — transcreate → then speak
// ============================================
async function generateCustomTTS(
  text: string, 
  languageCode: string
): Promise<{ buffer: ArrayBuffer; provider: string; translatedText: string; wasTranslated: boolean; transcreationProvider?: string } | null> {
  const voiceEntry = lookupVoice(languageCode);
  if (!voiceEntry) return null;
  
  // Step 1: Transcreate text via zone-routed LLM
  const { translatedText, wasTranslated, transcreationProvider } = await translateTextForTTS(text, languageCode);
  
  // Step 2: TTS the transcreated text
  // For CJK languages: Alibaba Qwen3-TTS-Flash PRIMARY (Singapore)
  if (CJK_LANG_CODES.includes(languageCode)) {
    const alibabaBuffer = await generateAlibabaTTS(translatedText, languageCode);
    if (alibabaBuffer) return { buffer: alibabaBuffer, provider: 'alibaba_qwen3_tts', translatedText, wasTranslated, transcreationProvider };
  }

  // Azure Neural PRIMARY (all languages) / FALLBACK (CJK)
  const azureBuffer = await generateAzureTTS(translatedText, voiceEntry.voice);
  if (azureBuffer) return { buffer: azureBuffer, provider: 'azure_neural', translatedText, wasTranslated, transcreationProvider };
  
  // ElevenLabs FALLBACK
  const elBuffer = await generateElevenLabsTTS(translatedText);
  if (elBuffer) return { buffer: elBuffer, provider: 'elevenlabs', translatedText, wasTranslated, transcreationProvider };
  
  return null;
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  try {
    const body = await req.json();
    const { action, languageCode, mode, text: customText } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use: get_languages, generate_tts, custom_tts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Get all available languages grouped by tab
    if (action === 'get_languages') {
      const rateCheck = checkRateLimit(clientIP, 60);
      if (!rateCheck.allowed) {
        console.warn(`[dialect-tts-demo] Rate limited IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait and try again.', retryAfter: Math.ceil(rateCheck.resetIn / 1000) }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
        );
      }

      const mapEntries = (voices: Record<string, any>, tab: string) =>
        Object.entries(voices).map(([code, data]) => ({
          code,
          tab,
          transcreation: data.transcreation,
          literal: data.literal,
          region: data.region || undefined,
        }));

      return new Response(
        JSON.stringify({
          arabic: mapEntries(ARABIC_VOICES, 'arabic'),
          indian: mapEntries(INDIAN_VOICES, 'indian'),
          cjk: mapEntries(CJK_VOICES, 'cjk'),
          african: mapEntries(AFRICAN_VOICES, 'african'),
          latam: mapEntries(LATAM_VOICES, 'latam'),
          european: mapEntries(EUROPEAN_VOICES, 'european'),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: custom_tts — translate user text to target language, then TTS
    if (action === 'custom_tts') {
      const rateCheck = checkRateLimit(`${clientIP}:custom`, CUSTOM_TTS_LIMIT);
      if (!rateCheck.allowed) {
        console.warn(`[dialect-tts-demo] Custom TTS rate limited IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ error: 'Too many custom TTS requests. Please wait.', retryAfter: Math.ceil(rateCheck.resetIn / 1000) }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
        );
      }

      if (!customText || !languageCode) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: text, languageCode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const sanitized = sanitizeText(customText);
      if (sanitized.length < 2) {
        return new Response(
          JSON.stringify({ error: 'Text too short. Minimum 2 characters.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await generateCustomTTS(sanitized, languageCode);
      if (!result) {
        return new Response(
          JSON.stringify({ error: 'TTS generation failed. Language may not be supported.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const base64Audio = base64Encode(result.buffer);
      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio, 
          provider: result.provider, 
          languageCode,
          translatedText: result.translatedText,
          wasTranslated: result.wasTranslated,
          transcreationProvider: result.transcreationProvider,
          originalText: sanitized,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: generate_tts — pre-set transcreation sample
    if (action === 'generate_tts' && languageCode) {
      const rateCheck = checkRateLimit(clientIP, RATE_LIMIT_MAX_REQUESTS);
      if (!rateCheck.allowed) {
        console.warn(`[dialect-tts-demo] TTS rate limited IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait.', retryAfter: Math.ceil(rateCheck.resetIn / 1000) }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
        );
      }

      const voiceEntry = lookupVoice(languageCode);
      
      if (!voiceEntry) {
        return new Response(
          JSON.stringify({ error: 'Language code not supported', code: languageCode }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const text = mode === 'literal' ? voiceEntry.literal : voiceEntry.transcreation;
      let provider = 'azure_neural';
      let audioBuffer: ArrayBuffer | null = null;

      // CJK languages: Try Alibaba Qwen3 TTS first (Singapore)
      if (CJK_LANG_CODES.includes(languageCode)) {
        audioBuffer = await generateAlibabaTTS(text, languageCode);
        if (audioBuffer) provider = 'alibaba_qwen3_tts';
      }

      // Azure Neural (primary for non-CJK, fallback for CJK)
      if (!audioBuffer) {
        audioBuffer = await generateAzureTTS(text, voiceEntry.voice);
        provider = 'azure_neural';
      }

      // ElevenLabs final fallback
      if (!audioBuffer) {
        provider = 'elevenlabs';
        audioBuffer = await generateElevenLabsTTS(text);
      }

      if (!audioBuffer) {
        return new Response(
          JSON.stringify({ error: 'TTS generation failed - no providers available' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const base64Audio = base64Encode(audioBuffer);
      return new Response(
        JSON.stringify({ audioContent: base64Audio, provider, languageCode }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: get_languages, generate_tts, custom_tts' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[dialect-tts-demo] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
