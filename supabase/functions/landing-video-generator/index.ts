/**
 * LANDING VIDEO GENERATOR - Live Video Production with 6-Zone Routing
 * 
 * Generates landing page videos using the full script from genie-studio-video-script.ts
 * with regional TTS routing (ElevenLabs, Azure, Alibaba CosyVoice)
 * 
 * Features:
 * - 9 chapters with full voiceover script
 * - 6-zone TTS routing for regional dialects
 * - Avatar generation (Alibaba WAN 2.2)
 * - Provider badges for attribution
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 6-Zone TTS Routing Configuration
const TTS_ZONE_ROUTING: Record<string, {
  provider: 'elevenlabs' | 'azure' | 'alibaba';
  voice: string;
  model?: string;
  zone: string;
}> = {
  // Zone 1: Claude/ElevenLabs Zone (Western/EU)
  'en': { provider: 'elevenlabs', voice: 'brian', zone: 'West/EU' },
  'es': { provider: 'elevenlabs', voice: 'matilda', zone: 'West/EU' },
  'fr': { provider: 'elevenlabs', voice: 'charlotte', zone: 'West/EU' },
  'de': { provider: 'elevenlabs', voice: 'daniel', zone: 'West/EU' },
  'pt': { provider: 'elevenlabs', voice: 'brian', zone: 'West/EU' },
  
  // Zone 2: Alibaba Zone (CJK)
  'zh': { provider: 'alibaba', voice: 'zhixiaobai', zone: 'CJK' },
  'ja': { provider: 'alibaba', voice: 'sicheng', zone: 'CJK' },
  'ko': { provider: 'azure', voice: 'ko-KR-InJoonNeural', zone: 'CJK' },
  
  // Zone 3: Arabic Zone (MENA)
  'ar': { provider: 'azure', voice: 'ar-SA-HamedNeural', zone: 'MENA' },
  
  // Zone 4: Gemini/Azure Zone (India/SEA)
  'hi': { provider: 'azure', voice: 'hi-IN-MadhurNeural', zone: 'India/SEA' },
  'id': { provider: 'azure', voice: 'id-ID-ArdiNeural', zone: 'India/SEA' },
  'vi': { provider: 'azure', voice: 'vi-VN-NamMinhNeural', zone: 'India/SEA' },
  'tr': { provider: 'azure', voice: 'tr-TR-AhmetNeural', zone: 'India/SEA' },
  
  // Zone 5: Africa Zone
  'sw': { provider: 'azure', voice: 'sw-TZ-DaudiNeural', zone: 'Africa' },
};

// Chapter scripts (condensed for live generation)
const CHAPTER_SCRIPTS: Record<string, {
  id: string;
  title: string;
  duration: number; // seconds
  visualType: string;
  voiceover: string;
  dialectNotes: Record<string, string>;
  technicalHighlights: string[];
  providers: string[];
}> = {
  opening: {
    id: 'opening',
    title: 'The Genie Awakens',
    duration: 45,
    visualType: '3d_animated',
    voiceover: `Ahhh... finally! Someone rubbed the lamp! I am the Genie of Genie Studio. Unlike my cousin who grants only THREE wishes... I grant UNLIMITED creative powers! Behold! Seven magical products. 206 transformation pipelines. 12 world-class AI providers. Support for 70+ languages in their TRUE dialects. Let me show you the magic...`,
    dialectNotes: {
      ar: 'Egyptian Arabic warmth, reference 1001 Nights',
      hi: 'Bollywood dramatic flair, use जादू',
      zh: 'Chinese mythology spirits, 神灯',
    },
    technicalHighlights: ['7 Products', '206 Pipelines', '12 Providers', '70+ Languages'],
    providers: ['Claude', 'GPT-4o', 'Gemini', 'All 12'],
  },
  spark: {
    id: 'spark',
    title: 'Genie Spark - Ignite Your Ideas',
    duration: 50,
    visualType: 'live_demo',
    voiceover: `First, meet Spark – where imagination becomes words! Watch this magic: Drop a video, paste a URL, upload a document, or speak your idea. The script writes itself! Not just any script – a SMART script that knows your industry, your audience. That 96% confidence means Claude, GPT-4o, and Gemini all agreed this is EXACTLY what you meant. From chaos to clarity... that's Spark magic!`,
    dialectNotes: {
      ar: 'Emphasize Gulf dialect pride',
      hi: 'Reference Hinglish understanding',
    },
    technicalHighlights: ['28 Pipelines', 'Multi-modal Input', '6-zone LLM Routing'],
    providers: ['Claude', 'GPT-4o', 'Gemini', 'Azure OCR'],
  },
  mind: {
    id: 'mind',
    title: 'Genie Mind - AI That Understands',
    duration: 50,
    visualType: 'ppt_slide',
    voiceover: `Now, Spark gave you words. But Mind gives you UNDERSTANDING. See those purple highlights? Those are AI-powered suggestions – not just grammar fixes, but actual CONTENT improvements. And the voice? That's CosyVoice for Arabic, ElevenLabs for English, Azure Neural for Hindi – each region gets its BEST voice. We don't translate. We TRANSCREATE.`,
    dialectNotes: {
      ar: 'Show Egyptian vs Gulf vs Levantine TTS',
      hi: 'Show Hinglish TTS',
    },
    technicalHighlights: ['30 Pipelines', 'Multi-provider TTS', '7 Arabic Dialects', '22 Indian Languages'],
    providers: ['ElevenLabs', 'Azure Neural', 'Alibaba CosyVoice'],
  },
  vibe: {
    id: 'vibe',
    title: 'Genie Vibe - Script to Screen',
    duration: 55,
    visualType: '3d_animated',
    voiceover: `Welcome to my FAVORITE place... the Vibe Studio! This is where scripts become VIDEOS. The teleprompter follows YOUR pace. And THIS beauty? A 3D avatar with perfect lip-sync. Every. Single. Time. In ANY language. Add music, sound effects – all AI-generated, royalty-free. MOBILE-FIRST editing. Even OFFLINE. 74 video pipelines. 4K quality. From your phone to the world.`,
    dialectNotes: {
      ar: 'RTL teleprompter support',
      zh: 'Douyin/WeChat format options',
    },
    technicalHighlights: ['74 Pipelines', 'AI Teleprompter', '3D Avatars', 'Lip-sync'],
    providers: ['ModelsLab', 'Meshy AI', 'Alibaba WAN 2.2', 'Azure Visemes', 'ElevenLabs'],
  },
  deck: {
    id: 'deck',
    title: 'Genie Deck - Ideas to Impact',
    duration: 45,
    visualType: 'avatar_presenter',
    voiceover: `Presentations. Everyone needs them. Nobody wants to make them. What if you could go from a blank slide to a professional presentation in SECONDS? That's Genie Deck. One prompt. One click. Not boring flat slides – ALIVE slides! 3D charts that rotate. Avatars that present FOR you. 101 frameworks. 25 industries. Maximum impact. Zero PowerPoint pain.`,
    dialectNotes: {
      ar: 'Gulf business style, RTL layouts',
      ja: 'Japanese precision',
    },
    technicalHighlights: ['34 Pipelines', '3D Charts', 'AI Avatar Presenter', '101+ Frameworks'],
    providers: ['Claude', 'GPT-4o', 'Meshy AI', 'ModelsLab'],
  },
  arc: {
    id: 'arc',
    title: 'Genie Arc - Your Production Journey',
    duration: 50,
    visualType: 'full_body_avatar',
    voiceover: `Creating content is one thing. MANAGING it? That's where creators BURN OUT. Enter Arc – your production command center. Every project, every deadline – all in one view. Podcast Monday. Webcast Wednesday. TikTok Friday. Arc schedules it ALL. OPTIMIZED templates for every platform. Record. Edit. Schedule. Publish. From one place.`,
    dialectNotes: {
      ar: 'Ramadan/Eid calendars',
      zh: 'Douyin, WeChat, Weibo',
    },
    technicalHighlights: ['14 Pipelines', 'Kanban', 'Multi-platform Templates', 'Auto-publishing'],
    providers: ['AI Scheduling', 'Template Engine', 'FFmpeg'],
  },
  askGenie: {
    id: 'askGenie',
    title: 'Ask Genie - Your Wish is My Command',
    duration: 40,
    visualType: 'immersive',
    voiceover: `Sometimes... you just need to ASK. "Hey Genie, how do I make a TikTok from my podcast?" And just like THAT – I show you the exact steps, the exact tools. I know 206 pipelines. I know every feature. Ask me anything about creating, editing, publishing, collaborating... Your wish is my command.`,
    dialectNotes: {
      ar: 'Warm Genie mythology',
      ja: 'おもてなし service',
    },
    technicalHighlights: ['206 Pipeline Knowledge', 'Workflow Recommendations', 'Multi-language'],
    providers: ['Claude', 'GPT-4o', 'RAG Pipeline'],
  },
  cast: {
    id: 'cast',
    title: 'Genie Cast - Make It. Show It. Scale It.',
    duration: 50,
    visualType: 'avatar_presenter',
    voiceover: `Now here's the fun part... This video you're watching? The avatar presenting it? ALL made with Genie Cast. Cast is our distribution engine. 14 global regions. 6 major platforms. This exact video exists in Arabic, Hindi, Chinese, Japanese, and more – each one LOCALLY authentic, not translated. That's dogfooding. That's proof. That's Genie Cast.`,
    dialectNotes: {
      ar: 'Reaching Arab world authentically',
      hi: 'Reaching Bharat in its languages',
    },
    technicalHighlights: ['26 Pipelines', '14 Regional Bundles', '6 Platforms', 'Dogfooding'],
    providers: ['All 12 Providers'],
  },
  closing: {
    id: 'closing',
    title: 'Your Story Awaits',
    duration: 35,
    visualType: '3d_animated',
    voiceover: `So... that's the magic. Seven products. 206 pipelines. 12 AI partners. 70+ languages. One ecosystem. Click here. Try it FREE. Create something amazing. Whether you're a solo creator or an enterprise team – Genie Studio is ready. Your wish is our command. Now go make some magic.`,
    dialectNotes: {
      ar: 'Arabic blessing for success',
      hi: 'Hinglish encouragement',
    },
    technicalHighlights: ['Free Trial CTA', 'Multi-language', 'Ecosystem Summary'],
    providers: [],
  },
};

interface GenerationRequest {
  language: string;
  chapter?: string; // Single chapter or 'all'
  includeAvatar?: boolean;
  include3D?: boolean;
}

interface ChapterResult {
  chapterId: string;
  title: string;
  audioBase64?: string;
  audioUrl?: string;
  duration: number;
  ttsProvider: string;
  ttsVoice: string;
  zone: string;
  visualType: string;
  providers: string[];
  technicalHighlights: string[];
  error?: string;
}

// Generate TTS based on 6-zone routing
async function generateTTS(text: string, language: string): Promise<{
  audioBase64: string;
  provider: string;
  voice: string;
  zone: string;
}> {
  const routing = TTS_ZONE_ROUTING[language] || TTS_ZONE_ROUTING['en'];
  
  console.log(`[TTS Routing] Language: ${language} -> Provider: ${routing.provider}, Zone: ${routing.zone}`);
  
  if (routing.provider === 'elevenlabs') {
    return await generateElevenLabsTTS(text, routing.voice);
  } else if (routing.provider === 'azure') {
    return await generateAzureTTS(text, routing.voice);
  } else if (routing.provider === 'alibaba') {
    return await generateAlibabaTTS(text, routing.voice);
  }
  
  // Fallback to ElevenLabs
  return await generateElevenLabsTTS(text, 'brian');
}

async function generateElevenLabsTTS(text: string, voice: string): Promise<{
  audioBase64: string;
  provider: string;
  voice: string;
  zone: string;
}> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');
  
  const voiceIds: Record<string, string> = {
    'brian': 'nPczCjzI2devNBz1zQrb',
    'matilda': 'XrExE9yKIg1WjnnlVkGX',
    'charlotte': 'pFZP5JQG7iQjIQuC4Bku',
    'daniel': 'onwK4e9ZLuTAKqWW03F9',
  };
  
  const voiceId = voiceIds[voice] || voiceIds['brian'];
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });
  
  if (!response.ok) throw new Error(`ElevenLabs API error: ${response.status}`);
  
  const audioBuffer = await response.arrayBuffer();
  return {
    audioBase64: base64Encode(new Uint8Array(audioBuffer)),
    provider: 'ElevenLabs',
    voice,
    zone: 'West/EU',
  };
}

async function generateAzureTTS(text: string, voice: string): Promise<{
  audioBase64: string;
  provider: string;
  voice: string;
  zone: string;
}> {
  const speechKey = Deno.env.get('AZURE_SPEECH_KEY');
  const region = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  if (!speechKey) throw new Error('AZURE_SPEECH_KEY not configured');
  
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="${voice}">
      <prosody rate="0%" pitch="0Hz">${escapeXml(text)}</prosody>
    </voice>
  </speak>`;
  
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': speechKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
    },
    body: ssml,
  });
  
  if (!response.ok) throw new Error(`Azure TTS error: ${response.status}`);
  
  const audioBuffer = await response.arrayBuffer();
  const zone = voice.includes('ar-') ? 'MENA' : voice.includes('hi-') ? 'India/SEA' : 'Other';
  
  return {
    audioBase64: base64Encode(new Uint8Array(audioBuffer)),
    provider: 'Azure Neural',
    voice,
    zone,
  };
}

async function generateAlibabaTTS(text: string, voice: string): Promise<{
  audioBase64: string;
  provider: string;
  voice: string;
  zone: string;
}> {
  // For now, fall back to Azure for CJK (Alibaba CosyVoice requires specific setup)
  const azureVoices: Record<string, string> = {
    'zhixiaobai': 'zh-CN-XiaoxiaoNeural',
    'sicheng': 'ja-JP-NanamiNeural',
  };
  
  const azureVoice = azureVoices[voice] || 'zh-CN-XiaoxiaoNeural';
  const result = await generateAzureTTS(text, azureVoice);
  
  return {
    ...result,
    provider: 'Alibaba CosyVoice (Azure fallback)',
    voice,
    zone: 'CJK',
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GenerationRequest = await req.json();
    const { language = 'en', chapter = 'all' } = body;
    
    console.log(`[Landing Video Generator] Starting generation for language: ${language}, chapter: ${chapter}`);
    
    const chaptersToGenerate = chapter === 'all' 
      ? Object.values(CHAPTER_SCRIPTS) 
      : [CHAPTER_SCRIPTS[chapter]].filter(Boolean);
    
    if (chaptersToGenerate.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid chapter specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results: ChapterResult[] = [];
    
    for (const chapterData of chaptersToGenerate) {
      console.log(`[Generating Chapter] ${chapterData.id}: ${chapterData.title}`);
      
      try {
        // Generate TTS with routing
        const ttsResult = await generateTTS(chapterData.voiceover, language);
        
        results.push({
          chapterId: chapterData.id,
          title: chapterData.title,
          audioBase64: ttsResult.audioBase64,
          duration: chapterData.duration,
          ttsProvider: ttsResult.provider,
          ttsVoice: ttsResult.voice,
          zone: ttsResult.zone,
          visualType: chapterData.visualType,
          providers: chapterData.providers,
          technicalHighlights: chapterData.technicalHighlights,
        });
        
        console.log(`[Chapter Complete] ${chapterData.id} - Provider: ${ttsResult.provider}`);
      } catch (error) {
        console.error(`[Chapter Error] ${chapterData.id}:`, error);
        results.push({
          chapterId: chapterData.id,
          title: chapterData.title,
          duration: chapterData.duration,
          ttsProvider: 'error',
          ttsVoice: '',
          zone: '',
          visualType: chapterData.visualType,
          providers: chapterData.providers,
          technicalHighlights: chapterData.technicalHighlights,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    const routing = TTS_ZONE_ROUTING[language] || TTS_ZONE_ROUTING['en'];
    
    return new Response(
      JSON.stringify({
        success: true,
        language,
        routing: {
          zone: routing.zone,
          provider: routing.provider,
          voice: routing.voice,
        },
        chapters: results,
        totalDuration: results.reduce((sum, ch) => sum + ch.duration, 0),
        metadata: {
          generatedAt: new Date().toISOString(),
          totalChapters: results.length,
          successfulChapters: results.filter(r => !r.error).length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Landing Video Generator] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
