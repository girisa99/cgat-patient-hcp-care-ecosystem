/**
 * Amazon Polly TTS Edge Function
 * Converts text to speech using AWS Polly
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

// HMAC-SHA256 using Web Crypto API
async function hmacSha256(key: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}

async function hmacSha256Hex(key: Uint8Array, message: string): Promise<string> {
  const signature = await hmacSha256(key, message);
  return Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  
  // Calculate signature using Web Crypto API
  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${secretKey}`), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  const signature = await hmacSha256Hex(kSigning, stringToSign);
  
  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    'Content-Type': 'application/json',
    'X-Amz-Date': amzDate,
    'Authorization': authorizationHeader,
  };
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
    const audioBase64 = base64Encode(audioBuffer);

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
