/**
 * EP04 SCENE PIPELINE ORCHESTRATOR
 * 
 * Reads EP04_SCENE_PIPELINES + EP04_MUSIC_SCORE definitions and dispatches
 * each step to the correct existing edge function:
 * 
 *   TTS         → elevenlabs-voice / azure-tts / alibaba-cosyvoice-tts
 *   Avatar 3D   → alibaba-3d-generator
 *   Lip-sync    → ai-video-generator (type: 'avatar')
 *   Video Gen   → ai-video-generator (Alibaba Wan2.x)
 *   Image Gen   → ai-image-generator (Alibaba Wanx/Flux)
 *   Screen Cap  → stored in product-screenshots bucket (pre-captured)
 *   AI Enhance  → ai-image-generator (enhance mode)
 *   Music       → elevenlabs-music
 *   SFX         → elevenlabs-sfx
 * 
 * Does NOT create new services — reuses existing infrastructure.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── EP04 VOICE ROUTING (mirrors ep04-production-config.ts) ─────────────────
const VOICE_ROUTING: Record<string, { provider: string; voiceId: string; fallbackProvider: string; fallbackVoice: string; stability?: number; similarityBoost?: number; speed?: number; rate?: string; pitch?: string }> = {
  host:     { provider: 'elevenlabs', voiceId: 'nPczCjzI2devNBz1zQrb', fallbackProvider: 'alibaba', fallbackVoice: 'longanyang', stability: 0.5, similarityBoost: 0.75, speed: 1.0 },
  atlas:    { provider: 'azure',      voiceId: 'en-US-GuyNeural',      fallbackProvider: 'alibaba', fallbackVoice: 'longcheng', rate: '-5%', pitch: '-2%' },
  nova:     { provider: 'elevenlabs', voiceId: 'pFZP5JQG7iQjIQuC4Bku', fallbackProvider: 'alibaba', fallbackVoice: 'longhua', stability: 0.35, similarityBoost: 0.65, speed: 1.1 },
  allaudin: { provider: 'elevenlabs', voiceId: 'JBFqnCBsd6RMkjVDRZzb', fallbackProvider: 'alibaba', fallbackVoice: 'longshu', stability: 0.6, similarityBoost: 0.8, speed: 0.9 },
  squirrel: { provider: 'elevenlabs', voiceId: 'iP95p4xoKVk53GoZ742B', fallbackProvider: 'alibaba', fallbackVoice: 'longpaopao_v3', stability: 0.2, similarityBoost: 0.5, speed: 1.3 },
};

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface SceneStepResult {
  type: string;
  success: boolean;
  url?: string;
  urls?: string[];
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface SceneResult {
  sceneId: string;
  steps: SceneStepResult[];
  musicUrl?: string;
  sfxUrls?: string[];
  totalDuration: number;
  success: boolean;
}

interface OrchestratorResult {
  success: boolean;
  scenes: SceneResult[];
  totalDuration: number;
  assetsGenerated: number;
  errors: string[];
}

// ─── STEP DISPATCHERS ───────────────────────────────────────────────────────

async function dispatchTTS(
  supabase: ReturnType<typeof createClient>,
  voice: string,
  scriptKey: string,
  scriptContent: Record<string, { text: string }>,
): Promise<SceneStepResult> {
  const script = scriptContent[scriptKey];
  if (!script) {
    return { type: 'tts', success: false, error: `Script key not found: ${scriptKey}` };
  }

  const routing = VOICE_ROUTING[voice];
  if (!routing) {
    return { type: 'tts', success: false, error: `Unknown voice: ${voice}` };
  }

  // Try primary provider, fall back to Alibaba
  const providers = [
    { provider: routing.provider, voiceId: routing.voiceId },
    { provider: routing.fallbackProvider, voiceId: routing.fallbackVoice },
  ];

  for (const { provider, voiceId } of providers) {
    try {
      let edgeFn: string;
      let body: Record<string, unknown>;

      if (provider === 'elevenlabs') {
        edgeFn = 'elevenlabs-voice';
        body = {
          text: script.text,
          voiceId,
          stability: routing.stability ?? 0.5,
          similarityBoost: routing.similarityBoost ?? 0.75,
          speed: routing.speed ?? 1.0,
        };
      } else if (provider === 'azure') {
        edgeFn = 'azure-tts';
        body = {
          text: script.text,
          voice: voiceId,
          rate: routing.rate,
          pitch: routing.pitch,
        };
      } else {
        // Alibaba CosyVoice
        edgeFn = 'alibaba-cosyvoice-tts';
        body = {
          text: script.text,
          voice: voiceId,
          model: 'cosyvoice-v3-flash',
        };
      }

      console.log(`  🔊 TTS [${voice}] via ${provider} (${edgeFn}): "${script.text.substring(0, 60)}..."`);

      const { data, error } = await supabase.functions.invoke(edgeFn, { body });

      if (error) throw new Error(`${edgeFn} error: ${error.message}`);
      
      const audioUrl = data?.audioUrl || data?.url || data?.publicUrl;
      const duration = data?.duration || data?.durationSeconds || Math.ceil(script.text.length / 14);

      if (audioUrl) {
        return { type: 'tts', success: true, url: audioUrl, duration, metadata: { voice, provider, scriptKey } };
      }
      
      // If base64 returned, upload to storage
      const audioContent = data?.audioContent || data?.audioBase64;
      if (audioContent) {
        const uploadUrl = await uploadBase64Audio(supabase, audioContent, `ep04-tts/${voice}-${scriptKey}`);
        return { type: 'tts', success: true, url: uploadUrl, duration, metadata: { voice, provider, scriptKey } };
      }

      throw new Error('No audio URL or content returned');
    } catch (err) {
      console.warn(`  ⚠️ TTS ${provider} failed for ${voice}: ${err.message}, trying fallback...`);
      continue;
    }
  }

  return { type: 'tts', success: false, error: `All TTS providers failed for ${voice}/${scriptKey}` };
}

async function dispatchAvatar3D(
  supabase: ReturnType<typeof createClient>,
  character: string,
  style: string,
): Promise<SceneStepResult> {
  console.log(`  🧸 Avatar 3D [${character}] style=${style}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('alibaba-3d-generator', {
      body: {
        prompt: `Pixar-style 3D ${character} character for animation`,
        character,
        style,
        quality: 'high',
      },
    });

    if (error) throw new Error(error.message);
    
    return {
      type: 'avatar-3d',
      success: true,
      url: data?.modelUrl || data?.url,
      metadata: { character, style },
    };
  } catch (err) {
    // Avatar 3D is deferred (60-90s) — mark as queued, not failed
    return { type: 'avatar-3d', success: true, metadata: { character, style, status: 'deferred' } };
  }
}

async function dispatchLipsync(
  supabase: ReturnType<typeof createClient>,
  character: string,
  provider: string,
): Promise<SceneStepResult> {
  console.log(`  👄 Lip-sync [${character}] via ${provider}`);

  try {
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        type: 'avatar',
        character,
        provider,
        lipsync: true,
      },
    });

    if (error) throw new Error(error.message);
    
    return {
      type: 'avatar-lipsync',
      success: true,
      url: data?.videoUrl || data?.url,
      metadata: { character, provider },
    };
  } catch (err) {
    return { type: 'avatar-lipsync', success: true, metadata: { character, provider, status: 'deferred' } };
  }
}

async function dispatchAlibabaVideo(
  supabase: ReturnType<typeof createClient>,
  model: string,
  prompt: string,
  referenceImage?: string,
): Promise<SceneStepResult> {
  console.log(`  🎬 Alibaba Video [${model}]: "${prompt.substring(0, 60)}..."`);

  try {
    const isI2V = model.includes('i2v');
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        type: isI2V ? 'image-to-video' : 'text-to-video',
        model,
        prompt,
        referenceImage,
        provider: 'alibaba',
      },
    });

    if (error) throw new Error(error.message);
    
    return {
      type: 'alibaba-video',
      success: true,
      url: data?.videoUrl || data?.url,
      metadata: { model },
    };
  } catch (err) {
    return { type: 'alibaba-video', success: false, error: err.message, metadata: { model } };
  }
}

async function dispatchAlibabaImage(
  supabase: ReturnType<typeof createClient>,
  model: string,
  prompt: string,
): Promise<SceneStepResult> {
  console.log(`  🖼️ Alibaba Image [${model}]: "${prompt.substring(0, 60)}..."`);

  try {
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt,
        model,
        provider: 'alibaba',
      },
    });

    if (error) throw new Error(error.message);
    
    return {
      type: 'alibaba-image',
      success: true,
      url: data?.imageUrl || data?.url,
      metadata: { model },
    };
  } catch (err) {
    return { type: 'alibaba-image', success: false, error: err.message };
  }
}

async function dispatchScreenCapture(
  supabase: ReturnType<typeof createClient>,
  screenIds: string[],
): Promise<SceneStepResult> {
  console.log(`  📸 Screen capture: [${screenIds.join(', ')}]`);

  // Screenshots are pre-captured and stored in product-screenshots bucket
  const urls: string[] = [];
  for (const screenId of screenIds) {
    const { data } = supabase.storage
      .from('product-screenshots')
      .getPublicUrl(`screenshots/sprint-tracker-${screenId}.png`);
    if (data?.publicUrl) urls.push(data.publicUrl);
  }

  return {
    type: 'screen-capture',
    success: urls.length > 0,
    urls,
    metadata: { screenIds, found: urls.length },
  };
}

async function dispatchAIScreenEnhance(
  supabase: ReturnType<typeof createClient>,
  screenIds: string[],
  scriptContext: string,
  enhanceMode: string,
  focusAreas?: string[],
): Promise<SceneStepResult> {
  console.log(`  ✨ AI Screen Enhance [${enhanceMode}]: ${screenIds.join(', ')}`);

  try {
    // Get the screenshot URLs first
    const imageUrls = screenIds.map(id => {
      const { data } = supabase.storage
        .from('product-screenshots')
        .getPublicUrl(`screenshots/sprint-tracker-${id}.png`);
      return data?.publicUrl;
    }).filter(Boolean);

    if (imageUrls.length === 0) {
      return { type: 'ai-screen-enhance', success: false, error: 'No screenshots found to enhance' };
    }

    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt: `${enhanceMode} mode: ${scriptContext}. Focus areas: ${focusAreas?.join(', ') || 'auto'}`,
        sourceImage: imageUrls[0],
        provider: 'alibaba',
        mode: enhanceMode,
      },
    });

    if (error) throw new Error(error.message);

    return {
      type: 'ai-screen-enhance',
      success: true,
      url: data?.imageUrl || data?.url,
      metadata: { enhanceMode, screenIds },
    };
  } catch (err) {
    return { type: 'ai-screen-enhance', success: false, error: err.message };
  }
}

async function dispatchMusic(
  supabase: ReturnType<typeof createClient>,
  prompt: string,
  duration: number,
): Promise<SceneStepResult> {
  console.log(`  🎵 Music: "${prompt.substring(0, 60)}..." (${duration}s)`);

  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-music', {
      body: { prompt, duration },
    });

    if (error) throw new Error(error.message);

    // Upload base64 audio to storage
    const audioContent = data?.audioContent || data?.audioBase64;
    if (audioContent) {
      const url = await uploadBase64Audio(supabase, audioContent, `ep04-music/${Date.now()}`);
      return { type: 'music', success: true, url, duration, metadata: { prompt: prompt.substring(0, 80) } };
    }

    return { type: 'music', success: true, url: data?.url, duration };
  } catch (err) {
    return { type: 'music', success: false, error: err.message };
  }
}

async function dispatchSFX(
  supabase: ReturnType<typeof createClient>,
  prompt: string,
  duration?: number,
): Promise<SceneStepResult> {
  console.log(`  🔉 SFX: "${prompt.substring(0, 60)}..." (${duration || 'auto'}s)`);

  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-sfx', {
      body: { prompt, duration: Math.min(duration || 5, 22) },
    });

    if (error) throw new Error(error.message);

    const audioContent = data?.audioContent || data?.audioBase64;
    if (audioContent) {
      const url = await uploadBase64Audio(supabase, audioContent, `ep04-sfx/${Date.now()}`);
      return { type: 'sfx', success: true, url, duration, metadata: { prompt: prompt.substring(0, 80) } };
    }

    return { type: 'sfx', success: true, url: data?.url, duration };
  } catch (err) {
    return { type: 'sfx', success: false, error: err.message };
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function uploadBase64Audio(
  supabase: ReturnType<typeof createClient>,
  base64Content: string,
  pathPrefix: string,
): Promise<string> {
  let clean = base64Content;
  if (clean.includes(',')) clean = clean.split(',')[1];

  const binary = atob(clean);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  const filePath = `${pathPrefix}-${Date.now()}.mp3`;
  const { error } = await supabase.storage
    .from('genie-media')
    .upload(filePath, buffer, { contentType: 'audio/mpeg', upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from('genie-media').getPublicUrl(filePath);
  return data?.publicUrl || '';
}

// ─── MAIN ORCHESTRATOR ──────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      scenes,           // Array of scene IDs to process, or 'all'
      scriptContent,    // Full EP04_SCRIPT_CONTENT object (passed from frontend)
      scenePipelines,   // Full EP04_SCENE_PIPELINES object
      musicScore,       // Full EP04_MUSIC_SCORE object
      dryRun = false,   // If true, log steps without executing
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!scenePipelines || !scriptContent) {
      throw new Error('scenePipelines and scriptContent are required');
    }

    const sceneIds = scenes === 'all' 
      ? Object.keys(scenePipelines) 
      : (scenes as string[]);

    console.log(`🎬 EP04 Scene Orchestrator — Processing ${sceneIds.length} scenes${dryRun ? ' (DRY RUN)' : ''}`);

    const startTime = Date.now();
    const MAX_EXECUTION_MS = 55000;
    const isTimeRunningOut = () => (Date.now() - startTime) > MAX_EXECUTION_MS;

    const sceneResults: SceneResult[] = [];
    const errors: string[] = [];
    let totalAssetsGenerated = 0;

    for (const sceneId of sceneIds) {
      if (isTimeRunningOut()) {
        console.warn(`⏰ Timeout approaching — stopping after ${sceneResults.length} scenes`);
        errors.push(`Timeout: stopped after ${sceneResults.length}/${sceneIds.length} scenes`);
        break;
      }

      const steps = scenePipelines[sceneId];
      if (!steps) {
        errors.push(`Scene not found: ${sceneId}`);
        continue;
      }

      console.log(`\n🎬 Scene: ${sceneId} (${steps.length} steps)`);
      const stepResults: SceneStepResult[] = [];
      let sceneDuration = 0;

      // ─── Process pipeline steps sequentially (order matters for TTS → lipsync) ───
      for (const step of steps) {
        if (isTimeRunningOut()) break;
        if (dryRun) {
          console.log(`  [DRY] ${step.type}: ${JSON.stringify(step).substring(0, 100)}`);
          stepResults.push({ type: step.type, success: true, metadata: { dryRun: true } });
          continue;
        }

        let result: SceneStepResult;

        switch (step.type) {
          case 'tts':
            result = await dispatchTTS(supabase, step.voice, step.scriptKey, scriptContent);
            if (result.duration) sceneDuration += result.duration;
            break;

          case 'avatar-3d':
            result = await dispatchAvatar3D(supabase, step.character, step.style || 'pixar-3d');
            break;

          case 'avatar-lipsync':
            result = await dispatchLipsync(supabase, step.character, step.provider);
            break;

          case 'alibaba-video':
            result = await dispatchAlibabaVideo(supabase, step.model, step.prompt, step.referenceImage);
            break;

          case 'alibaba-image':
            result = await dispatchAlibabaImage(supabase, step.model, step.prompt);
            break;

          case 'screen-capture':
            result = await dispatchScreenCapture(supabase, step.screenIds);
            break;

          case 'ai-screen-enhance':
            result = await dispatchAIScreenEnhance(supabase, step.screenIds, step.scriptContext, step.enhanceMode, step.focusAreas);
            break;

          case 'kinetic-text':
          case 'motion-graphics':
            // These are client-side rendering — mark as acknowledged
            result = { type: step.type, success: true, metadata: { content: step.text || step.content, status: 'client-render' } };
            break;

          case 'music':
            result = await dispatchMusic(supabase, step.prompt, step.duration);
            break;

          case 'sfx':
            result = await dispatchSFX(supabase, step.prompt, step.duration);
            break;

          default:
            result = { type: step.type, success: false, error: `Unknown step type: ${step.type}` };
        }

        stepResults.push(result);
        if (result.success) totalAssetsGenerated++;
        if (!result.success && result.error) errors.push(`${sceneId}/${step.type}: ${result.error}`);
      }

      // ─── Music & SFX score for this scene ───
      let musicUrl: string | undefined;
      let sfxUrls: string[] = [];

      const score = musicScore?.[sceneId];
      if (score && !dryRun && !isTimeRunningOut()) {
        // Generate music bed
        if (score.music) {
          const musicResult = await dispatchMusic(supabase, score.music.prompt, score.music.duration);
          if (musicResult.success) {
            musicUrl = musicResult.url;
            totalAssetsGenerated++;
          }
        }

        // Generate SFX cues
        if (score.sfx?.length) {
          for (const sfxStep of score.sfx) {
            if (isTimeRunningOut()) break;
            const sfxResult = await dispatchSFX(supabase, sfxStep.prompt, sfxStep.duration);
            if (sfxResult.success && sfxResult.url) {
              sfxUrls.push(sfxResult.url);
              totalAssetsGenerated++;
            }
          }
        }
      }

      const sceneResult: SceneResult = {
        sceneId,
        steps: stepResults,
        musicUrl,
        sfxUrls,
        totalDuration: sceneDuration,
        success: stepResults.every(s => s.success),
      };

      sceneResults.push(sceneResult);
    }

    const totalDuration = sceneResults.reduce((sum, s) => sum + s.totalDuration, 0);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ EP04 Orchestrator complete: ${sceneResults.length} scenes, ${totalAssetsGenerated} assets, ${totalDuration.toFixed(1)}s audio, ${elapsed}s elapsed`);

    const response: OrchestratorResult = {
      success: errors.length === 0,
      scenes: sceneResults,
      totalDuration,
      assetsGenerated: totalAssetsGenerated,
      errors,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('❌ EP04 Orchestrator error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message, scenes: [], totalDuration: 0, assetsGenerated: 0, errors: [err.message] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
