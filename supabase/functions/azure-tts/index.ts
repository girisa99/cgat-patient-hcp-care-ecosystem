/**
 * Azure Cognitive Services TTS Edge Function
 * Converts text to speech using Microsoft Azure Speech Services
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Azure Neural Voices (best quality)
const AZURE_VOICES = {
  // US English - Neural
  'en-US-JennyNeural': { name: 'en-US-JennyNeural', displayName: 'Jenny', gender: 'Female', style: ['cheerful', 'sad', 'angry'] },
  'en-US-GuyNeural': { name: 'en-US-GuyNeural', displayName: 'Guy', gender: 'Male', style: ['newscast'] },
  'en-US-AriaNeural': { name: 'en-US-AriaNeural', displayName: 'Aria', gender: 'Female', style: ['chat', 'customerservice', 'narration'] },
  'en-US-DavisNeural': { name: 'en-US-DavisNeural', displayName: 'Davis', gender: 'Male', style: ['chat', 'angry', 'cheerful'] },
  'en-US-AmberNeural': { name: 'en-US-AmberNeural', displayName: 'Amber', gender: 'Female', style: [] },
  'en-US-AnaNeural': { name: 'en-US-AnaNeural', displayName: 'Ana (Child)', gender: 'Female', style: [] },
  'en-US-AshleyNeural': { name: 'en-US-AshleyNeural', displayName: 'Ashley', gender: 'Female', style: [] },
  'en-US-BrandonNeural': { name: 'en-US-BrandonNeural', displayName: 'Brandon', gender: 'Male', style: [] },
  'en-US-ChristopherNeural': { name: 'en-US-ChristopherNeural', displayName: 'Christopher', gender: 'Male', style: [] },
  'en-US-CoraNeural': { name: 'en-US-CoraNeural', displayName: 'Cora', gender: 'Female', style: [] },
  'en-US-ElizabethNeural': { name: 'en-US-ElizabethNeural', displayName: 'Elizabeth', gender: 'Female', style: [] },
  'en-US-EricNeural': { name: 'en-US-EricNeural', displayName: 'Eric', gender: 'Male', style: [] },
  'en-US-JacobNeural': { name: 'en-US-JacobNeural', displayName: 'Jacob', gender: 'Male', style: [] },
  'en-US-JaneNeural': { name: 'en-US-JaneNeural', displayName: 'Jane', gender: 'Female', style: ['angry', 'cheerful', 'sad'] },
  'en-US-JasonNeural': { name: 'en-US-JasonNeural', displayName: 'Jason', gender: 'Male', style: ['angry', 'cheerful', 'sad'] },
  'en-US-MichelleNeural': { name: 'en-US-MichelleNeural', displayName: 'Michelle', gender: 'Female', style: [] },
  'en-US-MonicaNeural': { name: 'en-US-MonicaNeural', displayName: 'Monica', gender: 'Female', style: [] },
  'en-US-NancyNeural': { name: 'en-US-NancyNeural', displayName: 'Nancy', gender: 'Female', style: ['angry', 'cheerful', 'sad'] },
  'en-US-RogerNeural': { name: 'en-US-RogerNeural', displayName: 'Roger', gender: 'Male', style: [] },
  'en-US-SaraNeural': { name: 'en-US-SaraNeural', displayName: 'Sara', gender: 'Female', style: ['angry', 'cheerful', 'sad'] },
  'en-US-SteffanNeural': { name: 'en-US-SteffanNeural', displayName: 'Steffan', gender: 'Male', style: [] },
  'en-US-TonyNeural': { name: 'en-US-TonyNeural', displayName: 'Tony', gender: 'Male', style: ['angry', 'cheerful', 'sad'] },
  // UK English - Neural
  'en-GB-SoniaNeural': { name: 'en-GB-SoniaNeural', displayName: 'Sonia', gender: 'Female', style: ['cheerful', 'sad'] },
  'en-GB-RyanNeural': { name: 'en-GB-RyanNeural', displayName: 'Ryan', gender: 'Male', style: ['chat', 'cheerful'] },
  'en-GB-LibbyNeural': { name: 'en-GB-LibbyNeural', displayName: 'Libby', gender: 'Female', style: [] },
  'en-GB-AbbiNeural': { name: 'en-GB-AbbiNeural', displayName: 'Abbi', gender: 'Female', style: [] },
  'en-GB-AlfieNeural': { name: 'en-GB-AlfieNeural', displayName: 'Alfie', gender: 'Male', style: [] },
  'en-GB-BellaNeural': { name: 'en-GB-BellaNeural', displayName: 'Bella', gender: 'Female', style: [] },
  'en-GB-ElliotNeural': { name: 'en-GB-ElliotNeural', displayName: 'Elliot', gender: 'Male', style: [] },
  'en-GB-EthanNeural': { name: 'en-GB-EthanNeural', displayName: 'Ethan', gender: 'Male', style: [] },
  'en-GB-HollieNeural': { name: 'en-GB-HollieNeural', displayName: 'Hollie', gender: 'Female', style: [] },
  'en-GB-MaisieNeural': { name: 'en-GB-MaisieNeural', displayName: 'Maisie (Child)', gender: 'Female', style: [] },
  'en-GB-NoahNeural': { name: 'en-GB-NoahNeural', displayName: 'Noah', gender: 'Male', style: [] },
  'en-GB-OliverNeural': { name: 'en-GB-OliverNeural', displayName: 'Oliver', gender: 'Male', style: [] },
  'en-GB-OliviaNeural': { name: 'en-GB-OliviaNeural', displayName: 'Olivia', gender: 'Female', style: [] },
  'en-GB-ThomasNeural': { name: 'en-GB-ThomasNeural', displayName: 'Thomas', gender: 'Male', style: [] },
  // Australian English
  'en-AU-NatashaNeural': { name: 'en-AU-NatashaNeural', displayName: 'Natasha', gender: 'Female', style: [] },
  'en-AU-WilliamNeural': { name: 'en-AU-WilliamNeural', displayName: 'William', gender: 'Male', style: [] },
};

// Build SSML for Azure
function buildSSML(text: string, voice: string, rate?: number, pitch?: number, style?: string): string {
  const voiceConfig = AZURE_VOICES[voice as keyof typeof AZURE_VOICES] || AZURE_VOICES['en-US-JennyNeural'];
  const voiceName = voiceConfig.name;
  
  // Rate: 0.5 to 2.0, default 1.0 -> Azure uses percentage like "+20%" or "-10%"
  const rateValue = rate ? `${Math.round((rate - 1) * 100)}%` : '0%';
  // Pitch: -50 to 50, default 0 -> Azure uses "+20Hz" or "-10Hz"
  const pitchValue = pitch ? `${pitch > 0 ? '+' : ''}${pitch}Hz` : '0Hz';
  
  let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">`;
  ssml += `<voice name="${voiceName}">`;
  
  // Add style if supported
  if (style && voiceConfig.style?.includes(style)) {
    ssml += `<mstts:express-as style="${style}">`;
  }
  
  ssml += `<prosody rate="${rateValue}" pitch="${pitchValue}">`;
  ssml += escapeXml(text);
  ssml += `</prosody>`;
  
  if (style && voiceConfig.style?.includes(style)) {
    ssml += `</mstts:express-as>`;
  }
  
  ssml += `</voice></speak>`;
  
  return ssml;
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, speed, pitch, style } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Azure credentials
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY');
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';

    if (!speechKey) {
      console.error('Azure Speech credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Azure TTS not configured. Please add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get voice configuration
    const selectedVoice = voice || 'en-US-JennyNeural';
    const voiceConfig = AZURE_VOICES[selectedVoice as keyof typeof AZURE_VOICES] || AZURE_VOICES['en-US-JennyNeural'];

    // Build SSML
    const ssml = buildSSML(text, selectedVoice, speed, pitch, style);

    const endpoint = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

    console.log(`[Azure TTS] Generating: voice=${voiceConfig.name}, chars=${text.length}`);

    // Call Azure Speech API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'GenieStudio',
      },
      body: ssml,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Azure TTS] API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Azure TTS error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = base64Encode(new Uint8Array(audioBuffer));

    console.log(`[Azure TTS] Generated ${audioBuffer.byteLength} bytes of audio`);

    return new Response(
      JSON.stringify({
        audioContent: audioBase64,
        voice: voiceConfig.name,
        voiceName: voiceConfig.displayName,
        gender: voiceConfig.gender,
        charactersProcessed: text.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Azure TTS] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
