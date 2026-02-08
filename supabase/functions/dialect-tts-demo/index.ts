/**
 * DIALECT TTS DEMO - Landing Page Language Showcase
 * 
 * Provides TTS samples for ALL regional language tabs:
 * Arabic dialects, Indian languages, CJK, African, LATAM, European
 * using Azure Neural TTS (primary) with ElevenLabs fallback.
 * 
 * Supports the "True Transcreation, Not Translation" philosophy
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// VOICE REGISTRIES — ALL REGIONS
// ============================================

// Arabic dialect voice mappings (Azure Neural TTS)
const ARABIC_VOICES: Record<string, { voice: string; region: string; transcreation: string; literal: string }> = {
  'ar-SA': { voice: 'ar-SA-ZariyahNeural', region: 'Saudi Arabia', transcreation: 'ابدأ تسوي فيديوهات روعة — مجاناً!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-EG': { voice: 'ar-EG-ShakirNeural', region: 'Egypt', transcreation: 'ابدأ اعمل فيديوهات جامدة — ببلاش!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-AE': { voice: 'ar-AE-FatimaNeural', region: 'UAE/Gulf', transcreation: 'ابدا سوّي فيديوهات حلوة — مجان!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-LB': { voice: 'ar-JO-TaimNeural', region: 'Lebanon/Syria', transcreation: 'بلّش اعمل فيديوهات كتير حلوة!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-MA': { voice: 'ar-MA-MounaNeural', region: 'Morocco', transcreation: 'بدا دير فيديوهات زوينين!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-IQ': { voice: 'ar-IQ-BasselNeural', region: 'Iraq', transcreation: 'ابدي سوّي فيديوهات روعة!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  'ar-MSA': { voice: 'ar-SA-HamedNeural', region: 'Formal/News', transcreation: 'ابدأ بإنشاء مقاطع فيديو احترافية', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
};

// Indian language voice mappings with code-mixing samples
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

// CJK + Southeast Asian voices
const CJK_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'ja-JP': { voice: 'ja-JP-NanamiNeural', transcreation: 'AIで動画制作を始めよう — 無料で、すぐに使えます！', literal: '当社のAI動画制作ツールを無料でお試しください' },
  'zh-CN': { voice: 'zh-CN-XiaoxiaoNeural', transcreation: '用AI来创作精彩视频吧——完全免费，立即上手！', literal: '请免费试用我们的AI视频制作工具' },
  'ko-KR': { voice: 'ko-KR-SunHiNeural', transcreation: 'AI로 멋진 영상 만들어 보세요 — 무료로 바로 시작!', literal: '당사의 AI 비디오 제작 도구를 무료로 사용해 보세요' },
  'th-TH': { voice: 'th-TH-PremwadeeNeural', transcreation: 'เริ่มสร้างวิดีโอสุดเจ๋งด้วย AI — ฟรี ไม่มีข้อผูกมัด!', literal: 'กรุณาลองใช้เครื่องมือสร้างวิดีโอ AI ของเราฟรี' },
  'vi-VN': { voice: 'vi-VN-HoaiMyNeural', transcreation: 'Bắt đầu tạo video tuyệt vời với AI — miễn phí hoàn toàn!', literal: 'Vui lòng dùng thử công cụ tạo video AI của chúng tôi miễn phí' },
  'id-ID': { voice: 'id-ID-GadisNeural', transcreation: 'Mulai bikin video keren pakai AI — gratis, tanpa ribet!', literal: 'Silakan coba alat pembuat video AI kami secara gratis' },
};

// African language voices
const AFRICAN_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'sw-KE': { voice: 'sw-KE-ZuriNeural', transcreation: 'Anza kuunda video za kushangaza — bure kabisa!', literal: 'Begin creating excellent video content for free' },
  'yo-NG': { voice: 'yo-NG-EzeNeural', transcreation: 'Bẹ̀rẹ̀ ṣíṣe fidio to dára — ọfẹ́ ni!', literal: 'Begin creating excellent video content for free' },
  'ha-NG': { voice: 'ha-NG-LamisNeural', transcreation: 'Fara yin bidiyo mai kyau — ba tare da biyan kuɗi ba!', literal: 'Begin creating excellent video content for free' },
  'zu-ZA': { voice: 'zu-ZA-ThandoNeural', transcreation: 'Qala ukwenza amavidiyo amahle — mahhala!', literal: 'Begin creating excellent video content for free' },
  'am-ET': { voice: 'am-ET-AmehaNeural', transcreation: 'አስደናቂ ቪዲዮዎችን መፍጠር ጀምር — ነጻ!', literal: 'Begin creating excellent video content for free' },
};

// LATAM Spanish & Portuguese variants
const LATAM_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'es-MX': { voice: 'es-MX-DaliaNeural', transcreation: '¡Échale ganas y crea videos chidos con IA — es gratis, neta!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'pt-BR': { voice: 'pt-BR-FranciscaNeural', transcreation: 'Começa a criar vídeos incríveis com IA — de graça, sem pegadinha!', literal: 'Por favor, experimente nossa ferramenta de vídeo com IA gratuitamente' },
  'es-CO': { voice: 'es-CO-SalomeNeural', transcreation: '¡Empieza a crear videos bacanos con IA — gratis, parce!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'es-AR': { voice: 'es-AR-ElenaNeural', transcreation: '¡Arrancá a crear videos re piolas con IA — es gratis, posta!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'es-CL': { voice: 'es-CL-CatalinaNeural', transcreation: '¡Empieza a crear videos bacanes con IA — gratis, al tiro!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
  'es-PE': { voice: 'es-PE-AlexNeural', transcreation: '¡Empieza a crear videos chéveres con IA — es gratis, causa!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis' },
};

// European voices
const EUROPEAN_VOICES: Record<string, { voice: string; transcreation: string; literal: string }> = {
  'de-DE': { voice: 'de-DE-KatjaNeural', transcreation: 'Leg los mit genialen Videos — kostenlos und ohne Haken!', literal: 'Beginnen Sie mit der Erstellung hervorragender Videoinhalte' },
  'fr-FR': { voice: 'fr-FR-DeniseNeural', transcreation: 'Lancez-vous dans la création vidéo — c\'est gratuit et sans engagement !', literal: 'Commencez à créer d\'excellents contenus vidéo' },
  'es-ES': { voice: 'es-ES-ElviraNeural', transcreation: '¡Empieza a crear vídeos increíbles — gratis y sin compromiso!', literal: 'Comience a crear contenido de video excelente' },
  'it-IT': { voice: 'it-IT-ElsaNeural', transcreation: 'Inizia a creare video fantastici — è gratis, senza impegno!', literal: 'Inizia a creare contenuti video eccellenti' },
  'nl-NL': { voice: 'nl-NL-ColetteNeural', transcreation: 'Begin met het maken van geweldige video\'s — gratis en vrijblijvend!', literal: 'Begin met het maken van uitstekende video-inhoud' },
  'pl-PL': { voice: 'pl-PL-AgnieszkaNeural', transcreation: 'Zacznij tworzyć genialne filmy z AI — za darmo, bez zobowiązań!', literal: 'Proszę bezpłatnie wypróbować nasze narzędzie do tworzenia wideo AI' },
  'sv-SE': { voice: 'sv-SE-SofieNeural', transcreation: 'Börja skapa fantastiska videor med AI — gratis, inga krångel!', literal: 'Vänligen prova vårt AI-videoverktyg gratis' },
  'pt-PT': { voice: 'pt-PT-RaquelNeural', transcreation: 'Começa a criar vídeos espetaculares com IA — grátis e sem compromisso!', literal: 'Por favor, experimente a nossa ferramenta de criação de vídeo com IA gratuitamente' },
};

// Unified lookup — merges all registries
function lookupVoice(code: string): { voice: string; transcreation: string; literal: string } | null {
  return ARABIC_VOICES[code] || INDIAN_VOICES[code] || CJK_VOICES[code] 
    || AFRICAN_VOICES[code] || LATAM_VOICES[code] || EUROPEAN_VOICES[code] || null;
}

// ============================================
// TTS PROVIDERS
// ============================================

async function generateAzureTTS(text: string, voice: string): Promise<ArrayBuffer | null> {
  const azureKey = Deno.env.get('AZURE_SPEECH_KEY');
  const azureRegion = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  if (!azureKey) {
    console.log('[dialect-tts-demo] Azure key not configured');
    return null;
  }

  try {
    // Extract language from voice name (e.g., "ja-JP-NanamiNeural" -> "ja-JP")
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
// CUSTOM TEXT TTS — users type their own text
// ============================================
async function generateCustomTTS(text: string, languageCode: string): Promise<{ buffer: ArrayBuffer; provider: string } | null> {
  const voiceEntry = lookupVoice(languageCode);
  if (!voiceEntry) return null;
  
  // Try Azure first
  const azureBuffer = await generateAzureTTS(text, voiceEntry.voice);
  if (azureBuffer) return { buffer: azureBuffer, provider: 'azure' };
  
  // Fallback to ElevenLabs
  const elBuffer = await generateElevenLabsTTS(text);
  if (elBuffer) return { buffer: elBuffer, provider: 'elevenlabs' };
  
  return null;
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, languageCode, mode, text: customText } = await req.json();

    // Action: Get all available languages grouped by tab
    if (action === 'get_languages') {
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

    // Action: Generate TTS for custom user text
    if (action === 'custom_tts' && customText && languageCode) {
      const result = await generateCustomTTS(customText, languageCode);
      if (!result) {
        return new Response(
          JSON.stringify({ error: 'TTS generation failed' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return as base64 JSON for easy client consumption
      const base64Audio = base64Encode(new Uint8Array(result.buffer));
      return new Response(
        JSON.stringify({ audioContent: base64Audio, provider: result.provider, languageCode }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Generate TTS audio for pre-set transcreation sample
    if (action === 'generate_tts' && languageCode) {
      const voiceEntry = lookupVoice(languageCode);
      
      if (!voiceEntry) {
        return new Response(
          JSON.stringify({ error: 'Language code not supported', code: languageCode }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use transcreation by default, literal if specified
      const text = mode === 'literal' ? voiceEntry.literal : voiceEntry.transcreation;
      let provider = 'azure';

      // Try Azure first
      let audioBuffer = await generateAzureTTS(text, voiceEntry.voice);

      // Fallback to ElevenLabs
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

      // Return as base64 JSON for consistent client handling
      const base64Audio = base64Encode(new Uint8Array(audioBuffer));
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
