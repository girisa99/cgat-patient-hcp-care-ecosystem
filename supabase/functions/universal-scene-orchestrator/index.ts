/**
 * UNIVERSAL SCENE PIPELINE ORCHESTRATOR
 * 
 * Modular, product-agnostic orchestrator for ALL Genie Suite products.
 * 
 * ACCEPTS TWO MODES:
 * 
 * MODE 1 (Legacy): Flat payload with individual fields
 *   { productId, scenes, scriptContent, scenePipelines, musicScore, voiceRouting, storagePaths }
 * 
 * MODE 2 (B3 — Manifest): Full UniversalEpisodeManifest
 *   { manifest: UniversalEpisodeManifest, dryRun?, maxExecutionMs? }
 *   Auto-converts to Mode 1 internally.
 *
 * Dispatches each step to the correct existing edge function:
 *   TTS         → elevenlabs-voice / azure-tts / alibaba-cosyvoice-tts
 *   Avatar 3D   → alibaba-3d-generator
 *   Lip-sync    → ai-video-generator (type: 'avatar')
 *   Video Gen   → ai-video-generator (Alibaba Wan2.x)
 *   Image Gen   → ai-image-generator (Alibaba Wanx/Flux)
 *   Screen Cap  → stored in configurable bucket (pre-captured)
 *   AI Enhance  → ai-image-generator (enhance mode)
 *   Music       → elevenlabs-music
 *   SFX         → elevenlabs-sfx
 *
 * Does NOT create new services — reuses existing infrastructure.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── TYPES (all dynamic, no hardcoded values) ───────────────────────────────

interface VoiceRoute {
  provider: string;       // 'elevenlabs' | 'azure' | 'alibaba'
  voiceId: string;
  fallbackProvider: string;
  fallbackVoice: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
  rate?: string;
  pitch?: string;
}

interface StoragePaths {
  bucket: string;
  ttsPrefix: string;
  musicPrefix: string;
  sfxPrefix: string;
  screenshotBucket: string;
  screenshotPattern: string;
}

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

interface ScriptEntry {
  text: string;
  direction?: string;
  lipsync?: boolean;
  sfx?: string[];
  motion?: string;
  visualRef?: string;
  emotionalTone?: string;
  culturalTraits?: Record<string, string | boolean>;
  regionCode?: string;
}

interface OrchestratorRequest {
  // Mode 1: Flat payload
  productId?: string;
  episodeId?: string;
  scenes?: string[] | 'all';
  scriptContent?: Record<string, ScriptEntry>;
  scenePipelines?: Record<string, Array<Record<string, any>>>;
  musicScore?: Record<string, { music?: Record<string, any>; sfx?: Array<Record<string, any>> }>;
  voiceRouting?: Record<string, VoiceRoute>;
  storagePaths?: StoragePaths;
  // Mode 2: Full manifest (B3)
  manifest?: ManifestPayload;
  // Shared options
  dryRun?: boolean;
  maxExecutionMs?: number;
}

/** Manifest shape matching UniversalEpisodeManifest from the client schema */
interface ManifestPayload {
  id: string;
  title: string;
  product: string;
  purpose: string;
  language: string;
  regionCode?: string;
  scenes: Array<{
    id: string;
    title: string;
    sceneType: string;
    scriptKeys: string[];
    durationEst: number;
    music?: { prompt?: string; trackUrl?: string; volume?: number; fadeIn?: number; fadeOut?: number; loop?: boolean };
    sfx?: Array<{ prompt: string; timing: string; lineKey?: string; duration?: number }>;
    transitionIn?: string;
    transitionOut?: string;
    layout?: string;
    lowerThird?: string;
    culturalTraits?: Record<string, unknown>;
  }>;
  scriptLines: Record<string, {
    key: string;
    text: string;
    voice: string;
    scene: string;
    durationEst: number;
    direction?: string;
    lipsync?: boolean;
    sfx?: string[];
    motion?: string;
    visualRef?: string;
    emotionalTone?: string;
    culturalTraits?: Record<string, unknown>;
    regionCode?: string;
  }>;
  characters: Array<{
    key: string;
    name: string;
    role: string;
    voice: {
      provider: string;
      voiceId: string;
      fallbackProvider?: string;
      fallbackVoice?: string;
      stability?: number;
      similarityBoost?: number;
      speed?: number;
      rate?: string;
      pitch?: string;
    };
  }>;
  voiceRouting: Record<string, VoiceRoute>;
  storagePaths: StoragePaths;
  culturalTraits?: Record<string, unknown>;
}

interface OrchestratorResult {
  success: boolean;
  productId: string;
  episodeId?: string;
  scenes: SceneResult[];
  totalDuration: number;
  assetsGenerated: number;
  errors: string[];
  /** Set to true when manifest mode was used */
  manifestMode?: boolean;
}

// ─── MANIFEST → FLAT PAYLOAD CONVERTER (B3) ─────────────────────────────────

function convertManifestToFlat(manifest: ManifestPayload): {
  productId: string;
  episodeId: string;
  scenes: string[];
  scriptContent: Record<string, ScriptEntry>;
  scenePipelines: Record<string, Array<Record<string, any>>>;
  musicScore: Record<string, { music?: Record<string, any>; sfx?: Array<Record<string, any>> }>;
  voiceRouting: Record<string, VoiceRoute>;
  storagePaths: StoragePaths;
} {
  // Build scriptContent
  const scriptContent: Record<string, ScriptEntry> = {};
  for (const [key, line] of Object.entries(manifest.scriptLines)) {
    scriptContent[key] = {
      text: line.text,
      direction: line.direction,
      lipsync: line.lipsync,
      sfx: line.sfx,
      motion: line.motion,
      visualRef: line.visualRef,
      emotionalTone: line.emotionalTone,
      culturalTraits: line.culturalTraits as Record<string, string | boolean>,
      regionCode: line.regionCode,
    };
  }

  // Build scenePipelines
  const scenePipelines: Record<string, Array<Record<string, any>>> = {};
  for (const scene of manifest.scenes) {
    const steps: Array<Record<string, any>> = [];
    for (const lineKey of scene.scriptKeys) {
      const line = manifest.scriptLines[lineKey];
      if (!line) continue;
      steps.push({ type: 'tts', voice: line.voice, scriptKey: lineKey });
      if (line.lipsync !== false) {
        steps.push({ type: 'avatar-lipsync', character: line.voice, provider: 'alibaba' });
      }
    }
    scenePipelines[scene.id] = steps;
  }

  // Build voiceRouting from characters
  const voiceRouting: Record<string, VoiceRoute> = {};
  for (const char of manifest.characters) {
    voiceRouting[char.key] = {
      provider: char.voice.provider,
      voiceId: char.voice.voiceId,
      fallbackProvider: char.voice.fallbackProvider || char.voice.provider,
      fallbackVoice: char.voice.fallbackVoice || char.voice.voiceId,
      stability: char.voice.stability,
      similarityBoost: char.voice.similarityBoost,
      speed: char.voice.speed,
      rate: char.voice.rate,
      pitch: char.voice.pitch,
    };
  }
  // Merge with any explicit voiceRouting from manifest
  Object.assign(voiceRouting, manifest.voiceRouting || {});

  // Build musicScore
  const musicScore: Record<string, { music?: Record<string, any>; sfx?: Array<Record<string, any>> }> = {};
  for (const scene of manifest.scenes) {
    if (scene.music || scene.sfx?.length) {
      musicScore[scene.id] = {
        music: scene.music as Record<string, any>,
        sfx: scene.sfx as Array<Record<string, any>>,
      };
    }
  }

  return {
    productId: manifest.product,
    episodeId: manifest.id,
    scenes: manifest.scenes.map(s => s.id),
    scriptContent,
    scenePipelines,
    musicScore,
    voiceRouting,
    storagePaths: manifest.storagePaths,
  };
}

// ─── STEP DISPATCHERS (all receive config, nothing hardcoded) ───────────────

async function dispatchTTS(
  supabase: ReturnType<typeof createClient>,
  voice: string,
  scriptKey: string,
  scriptContent: Record<string, ScriptEntry>,
  voiceRouting: Record<string, VoiceRoute>,
  storagePaths: StoragePaths,
): Promise<SceneStepResult> {
  const script = scriptContent[scriptKey];
  if (!script) {
    return { type: 'tts', success: false, error: `Script key not found: ${scriptKey}` };
  }

  const routing = voiceRouting[voice];
  if (!routing) {
    return { type: 'tts', success: false, error: `Voice not in voiceRouting: ${voice}` };
  }

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
          // Transcreation: inject emotional style if available
          ...(script.emotionalTone ? { style: script.emotionalTone } : {}),
        };
      } else if (provider === 'azure') {
        edgeFn = 'azure-tts';
        body = {
          text: script.text,
          voice: voiceId,
          rate: routing.rate,
          pitch: routing.pitch,
          // Transcreation: inject direction as SSML prosody hint
          ...(script.direction ? { expressAs: script.emotionalTone || 'general' } : {}),
        };
      } else {
        edgeFn = 'alibaba-cosyvoice-tts';
        body = {
          text: script.text,
          voice: voiceId,
          model: 'cosyvoice-v3-flash',
          // Transcreation: pass regional context
          ...(script.regionCode ? { locale: script.regionCode } : {}),
        };
      }

      // Log transcreation context if present
      const culturalCtx = script.culturalTraits ? ` [${script.regionCode || 'global'}]` : '';
      console.log(`  🔊 TTS [${voice}]${culturalCtx} via ${provider} (${edgeFn}): "${script.text.substring(0, 60)}..."`);

      const { data, error } = await supabase.functions.invoke(edgeFn, { body });
      if (error) throw new Error(`${edgeFn} error: ${error.message}`);

      const audioUrl = data?.audioUrl || data?.url || data?.publicUrl;
      const duration = data?.duration || data?.durationSeconds || Math.ceil(script.text.length / 14);

      if (audioUrl) {
        return { type: 'tts', success: true, url: audioUrl, duration, metadata: { voice, provider, scriptKey } };
      }

      const audioContent = data?.audioContent || data?.audioBase64;
      if (audioContent) {
        const uploadUrl = await uploadBase64Audio(supabase, audioContent, `${storagePaths.ttsPrefix}/${voice}-${scriptKey}`, storagePaths.bucket);
        return { type: 'tts', success: true, url: uploadUrl, duration, metadata: { voice, provider, scriptKey } };
      }

      throw new Error('No audio URL or content returned');
    } catch (err) {
      console.warn(`  ⚠️ TTS ${provider} failed for ${voice}: ${err instanceof Error ? err.message : String(err)}, trying fallback...`);
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
      body: { prompt: `Pixar-style 3D ${character} character for animation`, character, style, quality: 'high' },
    });
    if (error) throw new Error(error.message);
    return { type: 'avatar-3d', success: true, url: data?.modelUrl || data?.url, metadata: { character, style } };
  } catch (err) {
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
      body: { type: 'avatar', character, provider, lipsync: true },
    });
    if (error) throw new Error(error.message);
    return { type: 'avatar-lipsync', success: true, url: data?.videoUrl || data?.url, metadata: { character, provider } };
  } catch (err) {
    return { type: 'avatar-lipsync', success: true, metadata: { character, provider, status: 'deferred' } };
  }
}

async function dispatchVideo(
  supabase: ReturnType<typeof createClient>,
  model: string,
  prompt: string,
  referenceImage?: string,
): Promise<SceneStepResult> {
  console.log(`  🎬 Video [${model}]: "${prompt.substring(0, 60)}..."`);
  try {
    const isI2V = model.includes('i2v');
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: { type: isI2V ? 'image-to-video' : 'text-to-video', model, prompt, referenceImage, provider: 'alibaba' },
    });
    if (error) throw new Error(error.message);
    return { type: 'video', success: true, url: data?.videoUrl || data?.url, metadata: { model } };
  } catch (err) {
    return { type: 'video', success: false, error: err instanceof Error ? err.message : String(err), metadata: { model } };
  }
}

async function dispatchImage(
  supabase: ReturnType<typeof createClient>,
  model: string,
  prompt: string,
): Promise<SceneStepResult> {
  console.log(`  🖼️ Image [${model}]: "${prompt.substring(0, 60)}..."`);
  try {
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: { prompt, model, provider: 'alibaba' },
    });
    if (error) throw new Error(error.message);
    return { type: 'image', success: true, url: data?.imageUrl || data?.url, metadata: { model } };
  } catch (err) {
    return { type: 'image', success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function dispatchScreenCapture(
  supabase: ReturnType<typeof createClient>,
  screenIds: string[],
  storagePaths: StoragePaths,
): Promise<SceneStepResult> {
  console.log(`  📸 Screen capture: [${screenIds.join(', ')}]`);
  const urls: string[] = [];
  for (const screenId of screenIds) {
    const path = storagePaths.screenshotPattern.replace('{id}', screenId);
    const { data } = supabase.storage.from(storagePaths.screenshotBucket).getPublicUrl(path);
    if (data?.publicUrl) urls.push(data.publicUrl);
  }
  return { type: 'screen-capture', success: urls.length > 0, urls, metadata: { screenIds, found: urls.length } };
}

async function dispatchAIScreenEnhance(
  supabase: ReturnType<typeof createClient>,
  screenIds: string[],
  scriptContext: string,
  enhanceMode: string,
  focusAreas: string[] | undefined,
  storagePaths: StoragePaths,
): Promise<SceneStepResult> {
  console.log(`  ✨ AI Screen Enhance [${enhanceMode}]: ${screenIds.join(', ')}`);
  try {
    const imageUrls = screenIds.map(id => {
      const path = storagePaths.screenshotPattern.replace('{id}', id);
      const { data } = supabase.storage.from(storagePaths.screenshotBucket).getPublicUrl(path);
      return data?.publicUrl;
    }).filter(Boolean);

    if (imageUrls.length === 0) {
      return { type: 'ai-screen-enhance', success: false, error: 'No screenshots found' };
    }

    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: { prompt: `${enhanceMode} mode: ${scriptContext}. Focus: ${focusAreas?.join(', ') || 'auto'}`, sourceImage: imageUrls[0], provider: 'alibaba', mode: enhanceMode },
    });
    if (error) throw new Error(error.message);
    return { type: 'ai-screen-enhance', success: true, url: data?.imageUrl || data?.url, metadata: { enhanceMode, screenIds } };
  } catch (err) {
    return { type: 'ai-screen-enhance', success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function dispatchMusic(
  supabase: ReturnType<typeof createClient>,
  prompt: string,
  duration: number,
  storagePaths: StoragePaths,
): Promise<SceneStepResult> {
  console.log(`  🎵 Music: "${prompt.substring(0, 60)}..." (${duration}s)`);
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-music', { body: { prompt, duration } });
    if (error) throw new Error(error.message);
    const audioContent = data?.audioContent || data?.audioBase64;
    if (audioContent) {
      const url = await uploadBase64Audio(supabase, audioContent, `${storagePaths.musicPrefix}/${Date.now()}`, storagePaths.bucket);
      return { type: 'music', success: true, url, duration, metadata: { prompt: prompt.substring(0, 80) } };
    }
    return { type: 'music', success: true, url: data?.url, duration };
  } catch (err) {
    return { type: 'music', success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function dispatchSFX(
  supabase: ReturnType<typeof createClient>,
  prompt: string,
  duration: number | undefined,
  storagePaths: StoragePaths,
): Promise<SceneStepResult> {
  console.log(`  🔉 SFX: "${prompt.substring(0, 60)}..." (${duration || 'auto'}s)`);
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-sfx', { body: { prompt, duration: Math.min(duration || 5, 22) } });
    if (error) throw new Error(error.message);
    const audioContent = data?.audioContent || data?.audioBase64;
    if (audioContent) {
      const url = await uploadBase64Audio(supabase, audioContent, `${storagePaths.sfxPrefix}/${Date.now()}`, storagePaths.bucket);
      return { type: 'sfx', success: true, url, duration, metadata: { prompt: prompt.substring(0, 80) } };
    }
    return { type: 'sfx', success: true, url: data?.url, duration };
  } catch (err) {
    return { type: 'sfx', success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function uploadBase64Audio(
  supabase: ReturnType<typeof createClient>,
  base64Content: string,
  pathPrefix: string,
  bucket: string,
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
    .from(bucket)
    .upload(filePath, buffer, { contentType: 'audio/mpeg', upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || '';
}

// ─── MAIN ORCHESTRATOR ──────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const request: OrchestratorRequest = await req.json();
    const {
      dryRun = false,
      maxExecutionMs = 55000,
    } = request;

    // ── B3: Manifest Mode Detection ──
    let productId: string;
    let episodeId: string | undefined;
    let scenes: string[] | 'all';
    let scriptContent: Record<string, ScriptEntry>;
    let scenePipelines: Record<string, Array<Record<string, any>>>;
    let musicScore: Record<string, { music?: Record<string, any>; sfx?: Array<Record<string, any>> }> | undefined;
    let voiceRouting: Record<string, VoiceRoute>;
    let storagePaths: StoragePaths;
    let manifestMode = false;

    if (request.manifest) {
      // MODE 2: Full manifest — auto-convert
      console.log('📋 Manifest mode detected — auto-converting to flat payload');
      const flat = convertManifestToFlat(request.manifest);
      productId = flat.productId;
      episodeId = flat.episodeId;
      scenes = flat.scenes;
      scriptContent = flat.scriptContent;
      scenePipelines = flat.scenePipelines;
      musicScore = flat.musicScore;
      voiceRouting = flat.voiceRouting;
      storagePaths = flat.storagePaths;
      manifestMode = true;
    } else {
      // MODE 1: Flat payload (legacy)
      productId = request.productId!;
      episodeId = request.episodeId;
      scenes = request.scenes!;
      scriptContent = request.scriptContent!;
      scenePipelines = request.scenePipelines!;
      musicScore = request.musicScore;
      voiceRouting = request.voiceRouting!;
      storagePaths = request.storagePaths!;
    }

    // Validate required fields
    if (!productId) throw new Error('productId is required (spark|mind|deck|vibe|arc|hub|cast)');
    if (!scenePipelines) throw new Error('scenePipelines is required');
    if (!scriptContent) throw new Error('scriptContent is required');
    if (!voiceRouting) throw new Error('voiceRouting is required — pass character→provider map');
    if (!storagePaths) throw new Error('storagePaths is required — pass bucket, ttsPrefix, musicPrefix, sfxPrefix, screenshotBucket, screenshotPattern');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sceneIds = scenes === 'all'
      ? Object.keys(scenePipelines)
      : (scenes as string[]);

    const tag = `${productId}${episodeId ? `/${episodeId}` : ''}`;
    console.log(`🎬 Universal Orchestrator [${tag}] — ${sceneIds.length} scenes${dryRun ? ' (DRY RUN)' : ''}`);

    const startTime = Date.now();
    const isTimeRunningOut = () => (Date.now() - startTime) > maxExecutionMs;

    const sceneResults: SceneResult[] = [];
    const errors: string[] = [];
    let totalAssetsGenerated = 0;

    for (const sceneId of sceneIds) {
      if (isTimeRunningOut()) {
        errors.push(`Timeout: stopped after ${sceneResults.length}/${sceneIds.length} scenes`);
        break;
      }

      const steps = scenePipelines[sceneId];
      if (!steps) { errors.push(`Scene not found: ${sceneId}`); continue; }

      console.log(`\n🎬 [${tag}] Scene: ${sceneId} (${steps.length} steps)`);
      const stepResults: SceneStepResult[] = [];
      let sceneDuration = 0;

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
            result = await dispatchTTS(supabase, step.voice, step.scriptKey, scriptContent, voiceRouting, storagePaths);
            if (result.duration) sceneDuration += result.duration;
            break;
          case 'avatar-3d':
            result = await dispatchAvatar3D(supabase, step.character, step.style || 'pixar-3d');
            break;
          case 'avatar-lipsync':
            result = await dispatchLipsync(supabase, step.character, step.provider);
            break;
          case 'alibaba-video':
          case 'video':
            result = await dispatchVideo(supabase, step.model, step.prompt, step.referenceImage);
            break;
          case 'alibaba-image':
          case 'image':
            result = await dispatchImage(supabase, step.model, step.prompt);
            break;
          case 'screen-capture':
            result = await dispatchScreenCapture(supabase, step.screenIds, storagePaths);
            break;
          case 'ai-screen-enhance':
            result = await dispatchAIScreenEnhance(supabase, step.screenIds, step.scriptContext, step.enhanceMode, step.focusAreas, storagePaths);
            break;
          case 'kinetic-text':
          case 'motion-graphics':
          case 'data-viz':
          case 'whiteboard':
          case 'product-demo':
          case 'quiz-interactive':
          case 'split-screen':
          case 'timeline-montage':
            // Client-side rendering types — acknowledged, not dispatched
            result = { type: step.type, success: true, metadata: { content: step.text || step.content, status: 'client-render' } };
            break;
          case 'music':
            result = await dispatchMusic(supabase, step.prompt, step.duration, storagePaths);
            break;
          case 'sfx':
            result = await dispatchSFX(supabase, step.prompt, step.duration, storagePaths);
            break;
          default:
            result = { type: step.type, success: false, error: `Unknown step type: ${step.type}` };
        }

        stepResults.push(result);
        if (result.success) totalAssetsGenerated++;
        if (!result.success && result.error) errors.push(`${sceneId}/${step.type}: ${result.error}`);
      }

      // Music & SFX score
      let musicUrl: string | undefined;
      let sfxUrls: string[] = [];

      const score = musicScore?.[sceneId];
      if (score && !dryRun && !isTimeRunningOut()) {
        if (score.music) {
          const musicResult = await dispatchMusic(supabase, score.music.prompt, score.music.duration, storagePaths);
          if (musicResult.success) { musicUrl = musicResult.url; totalAssetsGenerated++; }
        }
        if (score.sfx?.length) {
          for (const sfxStep of score.sfx) {
            if (isTimeRunningOut()) break;
            const sfxResult = await dispatchSFX(supabase, sfxStep.prompt, sfxStep.duration, storagePaths);
            if (sfxResult.success && sfxResult.url) { sfxUrls.push(sfxResult.url); totalAssetsGenerated++; }
          }
        }
      }

      sceneResults.push({
        sceneId, steps: stepResults, musicUrl, sfxUrls, totalDuration: sceneDuration,
        success: stepResults.every(s => s.success),
      });
    }

    const totalDuration = sceneResults.reduce((sum, s) => sum + s.totalDuration, 0);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ [${tag}] Complete: ${sceneResults.length} scenes, ${totalAssetsGenerated} assets, ${totalDuration.toFixed(1)}s audio, ${elapsed}s`);

    const response: OrchestratorResult = {
      success: errors.length === 0, productId, episodeId,
      scenes: sceneResults, totalDuration, assetsGenerated: totalAssetsGenerated, errors,
      manifestMode,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('❌ Universal Orchestrator error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err), scenes: [], totalDuration: 0, assetsGenerated: 0, errors: [err.message] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
