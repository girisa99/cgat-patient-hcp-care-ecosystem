/**
 * Amazon Polly TTS Edge Function
 * Converts text to speech using AWS Polly
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AWS Polly Neural Voices (best quality)
const POLLY_VOICES = {
  // US English - Neural
  'Matthew': { id: 'Matthew', engine: 'neural', lang: 'en-US', gender: 'Male' },
  'Joanna': { id: 'Joanna', engine: 'neural', lang: 'en-US', gender: 'Female' },
  'Kendra': { id: 'Kendra', engine: 'neural', lang: 'en-US', gender: 'Female' },
  'Kimberly': { id: 'Kimberly', engine: 'neural', lang: 'en-US', gender: 'Female' },
  'Salli': { id: 'Salli', engine: 'neural', lang: 'en-US', gender: 'Female' },
  'Joey': { id: 'Joey', engine: 'neural', lang: 'en-US', gender: 'Male' },
  'Justin': { id: 'Justin', engine: 'neural', lang: 'en-US', gender: 'Male' },
  'Kevin': { id: 'Kevin', engine: 'neural', lang: 'en-US', gender: 'Male' },
  'Ruth': { id: 'Ruth', engine: 'neural', lang: 'en-US', gender: 'Female' },
  'Stephen': { id: 'Stephen', engine: 'neural', lang: 'en-US', gender: 'Male' },
  // UK English - Neural
  'Amy': { id: 'Amy', engine: 'neural', lang: 'en-GB', gender: 'Female' },
  'Emma': { id: 'Emma', engine: 'neural', lang: 'en-GB', gender: 'Female' },
  'Brian': { id: 'Brian', engine: 'neural', lang: 'en-GB', gender: 'Male' },
  'Arthur': { id: 'Arthur', engine: 'neural', lang: 'en-GB', gender: 'Male' },
  // Australian English - Neural
  'Olivia': { id: 'Olivia', engine: 'neural', lang: 'en-AU', gender: 'Female' },
  // Generative (Long-form)
  'Matthew-generative': { id: 'Matthew', engine: 'generative', lang: 'en-US', gender: 'Male' },
  'Ruth-generative': { id: 'Ruth', engine: 'generative', lang: 'en-US', gender: 'Female' },
};

// AWS Signature V4 Helper
async function signAWSRequest(
  method: string,
  service: string,
  region: string,
  host: string,
  path: string,
  payload: string,
  accessKey: string,
  secretKey: string
): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  
  const canonicalUri = path;
  const canonicalQueryString = '';
  const payloadHash = await sha256Hex(payload);
  
  const canonicalHeaders = [
    `content-type:application/json`,
    `host:${host}`,
    `x-amz-date:${amzDate}`,
  ].join('\n') + '\n';
  
  const signedHeaders = 'content-type;host;x-amz-date';
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');
  
  // Calculate signature
  const kDate = hmac('sha256', `AWS4${secretKey}`, dateStamp, 'utf8', 'hex');
  const kRegion = hmac('sha256', hexToBytes(kDate), region, 'utf8', 'hex');
  const kService = hmac('sha256', hexToBytes(kRegion), service, 'utf8', 'hex');
  const kSigning = hmac('sha256', hexToBytes(kService), 'aws4_request', 'utf8', 'hex');
  const signature = hmac('sha256', hexToBytes(kSigning), stringToSign, 'utf8', 'hex');
  
  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    'Content-Type': 'application/json',
    'X-Amz-Date': amzDate,
    'Authorization': authorizationHeader,
  };
}

async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, speed, engine } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get AWS credentials
    const accessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const region = Deno.env.get('AWS_REGION') || 'us-east-1';

    if (!accessKey || !secretKey) {
      console.error('AWS credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'AWS Polly not configured. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get voice configuration
    const voiceConfig = POLLY_VOICES[voice as keyof typeof POLLY_VOICES] || POLLY_VOICES['Joanna'];
    const selectedEngine = engine || voiceConfig.engine || 'neural';

    // Build request payload
    const payload = JSON.stringify({
      Engine: selectedEngine,
      LanguageCode: voiceConfig.lang,
      OutputFormat: 'mp3',
      SampleRate: '24000',
      Text: text,
      TextType: 'text',
      VoiceId: voiceConfig.id,
    });

    const host = `polly.${region}.amazonaws.com`;
    const path = '/v1/speech';

    // Sign the request
    const headers = await signAWSRequest(
      'POST',
      'polly',
      region,
      host,
      path,
      payload,
      accessKey,
      secretKey
    );

    console.log(`[Amazon Polly] Generating TTS: voice=${voiceConfig.id}, engine=${selectedEngine}, chars=${text.length}`);

    // Call AWS Polly
    const response = await fetch(`https://${host}${path}`, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Amazon Polly] API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Polly API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = base64Encode(new Uint8Array(audioBuffer));

    console.log(`[Amazon Polly] Generated ${audioBuffer.byteLength} bytes of audio`);

    return new Response(
      JSON.stringify({
        audioContent: audioBase64,
        voice: voiceConfig.id,
        voiceName: voice,
        engine: selectedEngine,
        charactersProcessed: text.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Amazon Polly] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
