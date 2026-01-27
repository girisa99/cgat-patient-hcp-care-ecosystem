/**
 * DIALECT TTS DEMO - Landing Page Language Showcase
 * 
 * Provides TTS samples for Arabic dialects, Indian languages, and African languages
 * using Azure Neural TTS (primary) with ElevenLabs fallback.
 * 
 * Supports the spec's "True Localization, Not Translation" philosophy
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Arabic dialect voice mappings (Azure Neural TTS)
const ARABIC_VOICES: Record<string, { voice: string; region: string; sample: string }> = {
  'ar-msa': { voice: 'ar-SA-HamedNeural', region: 'Standard/Formal', sample: 'ابدأ بإنشاء فيديوهات رائعة اليوم' },
  'ar-SA': { voice: 'ar-SA-ZariyahNeural', region: 'Saudi Arabia', sample: 'ابدأ تسوّي فيديوهات حلوة اليوم' },
  'ar-gulf': { voice: 'ar-AE-FatimaNeural', region: 'UAE/Gulf', sample: 'ابدا سوّي فيديوهات حلوة اليوم' },
  'ar-EG': { voice: 'ar-EG-ShakirNeural', region: 'Egypt', sample: 'ابدأ اعمل فيديوهات جميلة النهارده' },
  'ar-levantine': { voice: 'ar-JO-TaimNeural', region: 'Levantine', sample: 'ابدأ اعمل فيديوهات حلوة اليوم' },
  'ar-maghrebi': { voice: 'ar-MA-MounaNeural', region: 'Morocco', sample: 'بدا دير فيديوهات زوينين اليوم' },
  'ar-IQ': { voice: 'ar-IQ-BasselNeural', region: 'Iraq', sample: 'ابدي سوّي فيديوهات حلوة اليوم' },
};

// Indian language voice mappings with code-mixing samples
const INDIAN_VOICES: Record<string, { voice: string; script: string; literal: string; transcreation: string }> = {
  'hi': { voice: 'hi-IN-MadhurNeural', script: 'Devanagari', literal: 'कृपया हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं', transcreation: 'AI course creator free में try करो! एकदम मस्त है!' },
  'bn': { voice: 'bn-IN-BashkarNeural', script: 'Bengali', literal: 'অনুগ্রহ করে আমাদের AI চালিত কোর্স নির্মাতা বিনামূল্যে ব্যবহার করুন', transcreation: 'AI course creator free তে try করো! একদম ভালো!' },
  'te': { voice: 'te-IN-MohanNeural', script: 'Telugu', literal: 'దయచేసి మా AI-ఆధారిత కోర్స్ క్రియేటర్‌ను ఉచితంగా ప్రయత్నించండి', transcreation: 'AI course creator ఫ్రీగా ట్రై చేయండి! చాలా బాగుంది!' },
  'ta': { voice: 'ta-IN-PallaviNeural', script: 'Tamil', literal: 'எங்கள் AI இயக்கும் பாடநெறி உருவாக்கியை இலவசமாக முயற்சிக்கவும்', transcreation: 'AI course creator free-ல try பண்ணுங்க! மிகவும் நல்லது!' },
  'mr': { voice: 'mr-IN-AarohiNeural', script: 'Devanagari', literal: 'कृपया आमचा AI-चालित कोर्स निर्माता विनामूल्य वापरून पहा', transcreation: 'AI course creator free मध्ये try करा! खूपच मस्त आहे!' },
  'gu': { voice: 'gu-IN-DhwaniNeural', script: 'Gujarati', literal: 'કૃપા કરીને અમારા AI-સંચાલિત કોર્સ ક્રિએટરને મફતમાં અજમાવો', transcreation: 'AI course creator free માં try કરો! એકદમ સરસ છે!' },
  'kn': { voice: 'kn-IN-SapnaNeural', script: 'Kannada', literal: 'ದಯವಿಟ್ಟು ನಮ್ಮ AI-ಚಾಲಿತ ಕೋರ್ಸ್ ಕ್ರಿಯೇಟರ್ ಅನ್ನು ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ', transcreation: 'AI course creator free ಯಲ್ಲಿ try ಮಾಡಿ! ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!' },
  'ml': { voice: 'ml-IN-MidhunNeural', script: 'Malayalam', literal: 'ഞങ്ങളുടെ AI പ്രവർത്തിപ്പിക്കുന്ന കോഴ്സ് ക്രിയേറ്റർ സൗജന്യമായി പരീക്ഷിക്കുക', transcreation: 'AI course creator free ആയി try ചെയ്യൂ! വളരെ നല്ലതാണ്!' },
  'pa': { voice: 'pa-IN-VaaniNeural', script: 'Gurmukhi', literal: 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ AI-ਸੰਚਾਲਿਤ ਕੋਰਸ ਕਰੀਏਟਰ ਨੂੰ ਮੁਫ਼ਤ ਵਿੱਚ ਅਜ਼ਮਾਓ', transcreation: 'AI course creator free ਵਿੱਚ try ਕਰੋ! ਬਹੁਤ ਵਧੀਆ ਹੈ!' },
};

// African language voice mappings
const AFRICAN_VOICES: Record<string, { voice: string; native: string; sample: string }> = {
  'sw': { voice: 'sw-KE-ZuriNeural', native: 'Kiswahili', sample: 'Anza kuunda video nzuri leo!' },
  'yo': { voice: 'yo-NG-EzeNeural', native: 'Yorùbá', sample: 'Bẹrẹ si da fidio lẹwa loni!' },
  'ha': { voice: 'ha-NG-LamisNeural', native: 'Hausa', sample: 'Fara ƙirƙirar bidiyo masu kyau yau!' },
  'zu': { voice: 'zu-ZA-ThandoNeural', native: 'isiZulu', sample: 'Qala ukwenza amavidiyo amahle namuhla!' },
  'am': { voice: 'am-ET-AmehaNeural', native: 'አማርኛ', sample: 'ዛሬ ድንቅ ቪዲዮዎችን መፍጠር ይጀምሩ!' },
  'af': { voice: 'af-ZA-AdriNeural', native: 'Afrikaans', sample: 'Begin vandag pragtige videos skep!' },
  'xh': { voice: 'xh-ZA-ThembaNeural', native: 'isiXhosa', sample: 'Qala ukwenza iividiyo ezintle namhlanje!' },
  'ig': { voice: 'en-NG-EzinneNeural', native: 'Igbo', sample: 'Bido imeputa vidio mara mma taa!' },
  'rw': { voice: 'rw-RW-RehemaNeural', native: 'Ikinyarwanda', sample: 'Tangira gukora amavidewo meza uyu munsi!' },
  'so': { voice: 'so-SO-UbaxNeural', native: 'Soomaali', sample: 'Bilow samaynta muuqaalo qurux badan maanta!' },
};

async function generateAzureTTS(text: string, voice: string): Promise<ArrayBuffer | null> {
  const azureKey = Deno.env.get('AZURE_SPEECH_KEY');
  const azureRegion = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  if (!azureKey) {
    console.log('[dialect-tts-demo] Azure key not configured');
    return null;
  }

  try {
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA">
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
      console.error(`[dialect-tts-demo] Azure TTS error: ${response.status}`);
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, languageCode, mode } = await req.json();

    // Action: Get available languages and samples (no audio generation)
    if (action === 'get_languages') {
      return new Response(
        JSON.stringify({
          arabic: Object.entries(ARABIC_VOICES).map(([code, data]) => ({
            code,
            region: data.region,
            sample: data.sample,
          })),
          indian: Object.entries(INDIAN_VOICES).map(([code, data]) => ({
            code,
            script: data.script,
            literal: data.literal,
            transcreation: data.transcreation,
          })),
          african: Object.entries(AFRICAN_VOICES).map(([code, data]) => ({
            code,
            native: data.native,
            sample: data.sample,
          })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Generate TTS audio for specific dialect
    if (action === 'generate_tts' && languageCode) {
      let text = '';
      let voice = '';
      let provider = 'azure';

      // Check Arabic dialects
      if (ARABIC_VOICES[languageCode]) {
        const dialect = ARABIC_VOICES[languageCode];
        voice = dialect.voice;
        text = dialect.sample;
      }
      // Check Indian languages
      else if (INDIAN_VOICES[languageCode]) {
        const lang = INDIAN_VOICES[languageCode];
        voice = lang.voice;
        // Use transcreation by default, literal if specified
        text = mode === 'literal' ? lang.literal : lang.transcreation;
      }
      // Check African languages
      else if (AFRICAN_VOICES[languageCode]) {
        const lang = AFRICAN_VOICES[languageCode];
        voice = lang.voice;
        text = lang.sample;
      }
      else {
        return new Response(
          JSON.stringify({ error: 'Language code not supported', code: languageCode }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try Azure first
      let audioBuffer = await generateAzureTTS(text, voice);

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

      // Return audio with metadata headers
      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'X-TTS-Provider': provider,
          'X-TTS-Language': languageCode,
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
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
