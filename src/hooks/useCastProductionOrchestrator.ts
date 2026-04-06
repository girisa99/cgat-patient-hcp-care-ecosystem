/**
 * useCastProductionOrchestrator — Universal Production Orchestrator
 *
 * Format-agnostic hook that reads ANY ScenePipelineStep[] config and dispatches
 * every step type through rate-limited async pools. Works for EP04 documentary,
 * webcasts, podcasts, PPT decks, or any future format.
 *
 * Features:
 * - Config-driven pipeline (no EP04-specific references)
 * - Extensible step dispatcher map
 * - Rate-limited async job pools per provider type
 * - Pause / Resume / Cancel controls
 * - Checkpoint persistence (save/load from DB)
 * - Segmented assembly for >30 min content (JSON2Video 30 min limit)
 * - Per-step-type progress tracking
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ScenePipelineStep } from '@/config/ep04-production-config';
import type { ScriptLine } from '@/config/ep04-script-content';
import { migrateModelId } from '@/config/provider-version-registry';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProductionOrchestratorConfig {
  /** Pipeline config — works for ANY format */
  scenePipelines: Record<string, ScenePipelineStep[]>;
  /** Optional script content for TTS steps */
  scriptContent?: Record<string, ScriptLine>;
  /** Language code for TTS / region routing */
  language: string;
  /** Parent region for provider routing (one of 16: NAM, EU, INDIA, etc.) */
  region?: string;
  /** Subregion for fine-grained routing (one of 62, e.g. 'us-east', 'uk', 'tamil-nadu') */
  subregion?: string;
  /** Quality tier affects resolution & model selection */
  quality: 'preview' | 'production' | 'cinematic';

  /** Rate limits per provider type (configurable, not hardcoded) */
  concurrency?: {
    video?: number;    // default 5 (Alibaba limit)
    tts?: number;      // default 10 (ElevenLabs Pro)
    image?: number;    // default 5
    lipsync?: number;  // default 3
  };

  /** Assembly output config */
  assembly?: {
    format: 'video' | 'audio' | 'slideshow' | 'pptx';
    maxSegmentDuration?: number; // default 1800s (30 min JSON2Video limit)
    resolution?: '720p' | '1080p' | '4k';
    transitions?: 'none' | 'fade' | 'slide' | 'zoom';
  };

  /** Project ID for checkpoint persistence */
  projectId?: string;

  /** Callbacks */
  onStepComplete?: (sceneId: string, step: StepResult) => void;
  onSceneComplete?: (sceneId: string, result: SceneResult) => void;
  onAllComplete?: (results: OrchestratorResult) => void;
}

export interface StepResult {
  stepIndex: number;
  stepType: string;
  status: 'complete' | 'failed' | 'skipped' | 'pending-async';
  outputUrl?: string;
  taskId?: string;    // for async jobs that need polling
  provider?: string;
  durationMs?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SceneResult {
  sceneId: string;
  steps: StepResult[];
  status: 'complete' | 'partial' | 'failed';
  totalDurationMs: number;
}

export interface OrchestratorResult {
  scenes: Map<string, SceneResult>;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalDurationMs: number;
}

export interface PendingJob {
  sceneId: string;
  stepIndex: number;
  stepType: string;
  taskId: string;
  provider: string;
  submittedAt: number;
}

export interface OrchestrationProgress {
  /** Per-step-type counts */
  byType: Record<string, { total: number; completed: number; failed: number; pending: number }>;
  /** Overall */
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  percentage: number;
  currentScene: string | null;
  currentStepType: string | null;
  status: 'idle' | 'generating' | 'paused' | 'assembling' | 'complete' | 'error';
}

export interface AssemblyResult {
  format: string;
  outputUrl?: string;
  segments?: Array<{ url: string; durationSeconds: number }>;
  totalDuration: number;
  status: 'complete' | 'failed';
  error?: string;
}

export interface OrchestrationCheckpoint {
  version: 1;
  configHash: string;
  completedSteps: Array<{
    sceneId: string;
    stepIndex: number;
    stepType: string;
    result: StepResult;
  }>;
  pendingJobs: Array<{
    sceneId: string;
    stepIndex: number;
    taskId: string;
    provider: string;
  }>;
  progress: OrchestrationProgress;
  savedAt: string;
}

// ── Async Job Pool ───────────────────────────────────────────────────────────
// Rate-limited concurrent job pool with backpressure.

class AsyncJobPool {
  private active = 0;
  private queue: Array<{
    job: () => Promise<StepResult>;
    resolve: (r: StepResult) => void;
    reject: (e: unknown) => void;
  }> = [];

  constructor(private maxConcurrent: number) {}

  async submit(job: () => Promise<StepResult>): Promise<StepResult> {
    if (this.active < this.maxConcurrent) {
      return this.run(job);
    }
    // Backpressure: wait in queue
    return new Promise((resolve, reject) => {
      this.queue.push({ job, resolve, reject });
    });
  }

  private async run(job: () => Promise<StepResult>): Promise<StepResult> {
    this.active++;
    try {
      return await job();
    } finally {
      this.active--;
      this.drain();
    }
  }

  private drain() {
    if (this.queue.length > 0 && this.active < this.maxConcurrent) {
      const next = this.queue.shift()!;
      this.run(next.job).then(next.resolve, next.reject);
    }
  }

  get pendingCount() { return this.queue.length; }
  get activeCount() { return this.active; }
}

// ── Step Dispatcher Context ──────────────────────────────────────────────────

interface DispatchContext {
  sceneId: string;
  language: string;
  /** Parent region (one of 16) */
  region: string;
  /** Subregion for fine-grained provider routing (one of 62) */
  subregion: string;
  quality: 'preview' | 'production' | 'cinematic';
  scriptContent?: Record<string, ScriptLine>;
  previousSteps: StepResult[];
}

// ── Step Dispatchers ─────────────────────────────────────────────────────────
// Each dispatcher is a pure function: (step, context) → Promise<StepResult>

async function dispatchTTS(
  step: ScenePipelineStep & { type: 'tts' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  const scriptLine = ctx.scriptContent?.[step.scriptKey];
  const text = scriptLine?.text || `Narration for ${step.scriptKey}`;
  try {
    const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
      body: {
        text,
        voice: step.voice,
        language: ctx.language,
        region: ctx.region,
        subregion: ctx.subregion,
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    return {
      stepIndex, stepType: 'tts', status: 'complete',
      outputUrl: data?.audioUrl || data?.url,
      provider: data?.provider || 'tts',
      durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'tts', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchAlibabaVideo(
  step: ScenePipelineStep & { type: 'alibaba-video' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('alibaba-video-generator', {
      body: {
        model: step.model,
        prompt: step.prompt,
        referenceImage: step.referenceImage,
        region: ctx.region,
        subregion: ctx.subregion,
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    // Alibaba video is async — returns a taskId for polling
    if (data?.taskId && data?.status === 'processing') {
      return {
        stepIndex, stepType: 'alibaba-video', status: 'pending-async',
        taskId: data.taskId, provider: 'alibaba',
        durationMs: Date.now() - start,
      };
    }
    return {
      stepIndex, stepType: 'alibaba-video', status: 'complete',
      outputUrl: data?.videoUrl || data?.url,
      provider: 'alibaba', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'alibaba-video', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchAlibabaImage(
  step: ScenePipelineStep & { type: 'alibaba-image' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt: step.prompt,
        model: step.model,
        aspectRatio: '16:9',
        region: ctx.region,
        subregion: ctx.subregion,
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    return {
      stepIndex, stepType: 'alibaba-image', status: 'complete',
      outputUrl: data?.imageUrl || data?.url,
      provider: 'alibaba-image', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'alibaba-image', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchLipsync(
  step: ScenePipelineStep & { type: 'avatar-lipsync' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  // Find the previous TTS result for this scene to get audio URL
  const ttsResult = ctx.previousSteps.find(s => s.stepType === 'tts' && s.status === 'complete');
  try {
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        type: 'avatar',
        character: step.character,
        provider: step.provider,
        audioUrl: ttsResult?.outputUrl,
        region: ctx.region,
        subregion: ctx.subregion,
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    if (data?.taskId && data?.status === 'processing') {
      return {
        stepIndex, stepType: 'avatar-lipsync', status: 'pending-async',
        taskId: data.taskId, provider: step.provider,
        durationMs: Date.now() - start,
      };
    }
    return {
      stepIndex, stepType: 'avatar-lipsync', status: 'complete',
      outputUrl: data?.videoUrl || data?.url,
      provider: step.provider, durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'avatar-lipsync', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchAvatar3D(
  step: ScenePipelineStep & { type: 'avatar-3d' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('alibaba-3d-generator', {
      body: {
        character: step.character,
        style: step.style || 'pixar-3d',
        region: ctx.region,
        subregion: ctx.subregion,
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    if (data?.taskId && data?.status === 'processing') {
      return {
        stepIndex, stepType: 'avatar-3d', status: 'pending-async',
        taskId: data.taskId, provider: 'alibaba-3d',
        durationMs: Date.now() - start,
      };
    }
    return {
      stepIndex, stepType: 'avatar-3d', status: 'complete',
      outputUrl: data?.modelUrl || data?.url,
      provider: 'alibaba-3d', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'avatar-3d', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchScreenEnhance(
  step: ScenePipelineStep & { type: 'ai-screen-enhance' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt: step.scriptContext,
        screenIds: step.screenIds,
        enhanceMode: step.enhanceMode,
        focusAreas: step.focusAreas,
        mode: 'enhance',
      },
    });
    if (error) throw error;
    return {
      stepIndex, stepType: 'ai-screen-enhance', status: 'complete',
      outputUrl: data?.imageUrl || data?.url,
      provider: 'screen-enhance', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'ai-screen-enhance', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchScreenCapture(
  step: ScenePipelineStep & { type: 'screen-capture' },
  stepIndex: number,
  _ctx: DispatchContext,
): Promise<StepResult> {
  // Screen captures are storage bucket lookups — no edge function needed
  return {
    stepIndex, stepType: 'screen-capture', status: 'complete',
    provider: 'storage',
    metadata: { screenIds: step.screenIds, multiCapture: step.multiCapture },
    durationMs: 0,
  };
}

async function dispatchMusic(
  step: ScenePipelineStep & { type: 'music' },
  stepIndex: number,
  _ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'generate-music',
        prompt: step.prompt,
        duration: step.duration,
        style: step.style,
      },
    });
    if (error) throw error;
    return {
      stepIndex, stepType: 'music', status: 'complete',
      outputUrl: data?.audioUrl || data?.url,
      provider: 'music', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'music', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchSFX(
  step: ScenePipelineStep & { type: 'sfx' },
  stepIndex: number,
  _ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'generate-sfx',
        prompt: step.prompt,
        duration: step.duration,
      },
    });
    if (error) throw error;
    return {
      stepIndex, stepType: 'sfx', status: 'complete',
      outputUrl: data?.audioUrl || data?.url,
      provider: 'sfx', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'sfx', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchTransition(
  step: ScenePipelineStep & { type: 'scene-transition' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('alibaba-video-generator', {
      body: {
        model: 'wan2.6-t2v',
        prompt: `Scene transition (${step.style}): ${step.prompt}`,
        duration: step.duration,
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    if (data?.taskId && data?.status === 'processing') {
      return {
        stepIndex, stepType: 'scene-transition', status: 'pending-async',
        taskId: data.taskId, provider: 'alibaba',
        durationMs: Date.now() - start,
      };
    }
    return {
      stepIndex, stepType: 'scene-transition', status: 'complete',
      outputUrl: data?.videoUrl || data?.url,
      provider: 'alibaba', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'scene-transition', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchStorybookFrame(
  step: ScenePipelineStep & { type: 'storybook-frame' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    // Image + i2v composite
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt: `Storybook ${step.variant} frame: ${step.prompt}`,
        aspectRatio: '16:9',
        style: 'illustration',
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    return {
      stepIndex, stepType: 'storybook-frame', status: 'complete',
      outputUrl: data?.imageUrl || data?.url,
      provider: 'storybook', durationMs: Date.now() - start,
      metadata: { variant: step.variant, duration: step.duration },
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'storybook-frame', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchCharInteraction(
  step: ScenePipelineStep & { type: 'character-interaction' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('alibaba-video-generator', {
      body: {
        model: 'wan2.6-t2v',
        prompt: `Character interaction (${step.style || 'group-shot'}): ${step.prompt}`,
        characters: step.characters,
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    if (data?.taskId && data?.status === 'processing') {
      return {
        stepIndex, stepType: 'character-interaction', status: 'pending-async',
        taskId: data.taskId, provider: 'alibaba',
        durationMs: Date.now() - start,
      };
    }
    return {
      stepIndex, stepType: 'character-interaction', status: 'complete',
      outputUrl: data?.videoUrl || data?.url,
      provider: 'alibaba', durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'character-interaction', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

async function dispatchNarratorScroll(
  step: ScenePipelineStep & { type: 'narrator-scroll' },
  stepIndex: number,
  ctx: DispatchContext,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt: `Narrator scroll visualization: ${step.prompt}`,
        aspectRatio: '16:9',
        style: 'infographic',
        quality: ctx.quality,
      },
    });
    if (error) throw error;
    return {
      stepIndex, stepType: 'narrator-scroll', status: 'complete',
      outputUrl: data?.imageUrl || data?.url,
      provider: 'narrator-scroll', durationMs: Date.now() - start,
      metadata: { duration: step.duration, dataContent: step.dataContent },
    };
  } catch (err: any) {
    return {
      stepIndex, stepType: 'narrator-scroll', status: 'failed',
      error: err.message, durationMs: Date.now() - start,
    };
  }
}

function skipClientRender(
  step: ScenePipelineStep,
  stepIndex: number,
): StepResult {
  // Client-side rendered steps (kinetic text, motion graphics) — no dispatch needed
  return {
    stepIndex, stepType: step.type, status: 'skipped',
    provider: 'client', durationMs: 0,
    metadata: step as unknown as Record<string, unknown>,
  };
}

// ── Step Dispatcher Map ──────────────────────────────────────────────────────
// Extensible: add new step type = add one function + one map entry.

type StepDispatcher = (step: any, stepIndex: number, ctx: DispatchContext) => Promise<StepResult>;

const STEP_DISPATCHERS: Record<string, StepDispatcher> = {
  'tts':                    dispatchTTS,
  'alibaba-video':          dispatchAlibabaVideo,
  'alibaba-image':          dispatchAlibabaImage,
  'avatar-lipsync':         dispatchLipsync,
  'avatar-3d':              dispatchAvatar3D,
  'ai-screen-enhance':      dispatchScreenEnhance,
  'screen-capture':         dispatchScreenCapture,
  'music':                  dispatchMusic,
  'sfx':                    dispatchSFX,
  'scene-transition':       dispatchTransition,
  'storybook-frame':        dispatchStorybookFrame,
  'character-interaction':  dispatchCharInteraction,
  'narrator-scroll':        dispatchNarratorScroll,
  'kinetic-text':           (step, idx) => Promise.resolve(skipClientRender(step, idx)),
  'motion-graphics':        (step, idx) => Promise.resolve(skipClientRender(step, idx)),
};

// Determine which pool a step type belongs to
function getPoolKey(stepType: string): 'video' | 'tts' | 'image' | 'lipsync' {
  switch (stepType) {
    case 'tts': return 'tts';
    case 'alibaba-video':
    case 'scene-transition':
    case 'character-interaction':
      return 'video';
    case 'avatar-lipsync':
    case 'avatar-3d':
      return 'lipsync';
    case 'alibaba-image':
    case 'ai-screen-enhance':
    case 'storybook-frame':
    case 'narrator-scroll':
      return 'image';
    default:
      return 'image'; // safe default
  }
}

// ── Utility: hash config for checkpoint validation ───────────────────────────

function hashConfig(config: ProductionOrchestratorConfig): string {
  const key = Object.keys(config.scenePipelines).sort().join(',');
  const stepCount = Object.values(config.scenePipelines)
    .reduce((sum, steps) => sum + steps.length, 0);
  return `${key}:${stepCount}:${config.quality}`;
}

// ── Build initial progress from config ───────────────────────────────────────

function buildInitialProgress(pipelines: Record<string, ScenePipelineStep[]>): OrchestrationProgress {
  const byType: Record<string, { total: number; completed: number; failed: number; pending: number }> = {};
  let totalSteps = 0;

  for (const steps of Object.values(pipelines)) {
    for (const step of steps) {
      if (!byType[step.type]) {
        byType[step.type] = { total: 0, completed: 0, failed: 0, pending: 0 };
      }
      byType[step.type].total++;
      totalSteps++;
    }
  }

  return {
    byType,
    totalSteps,
    completedSteps: 0,
    failedSteps: 0,
    percentage: 0,
    currentScene: null,
    currentStepType: null,
    status: 'idle',
  };
}

// ── Untyped DB client ────────────────────────────────────────────────────────
const db = supabase as any;

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCastProductionOrchestrator(config: ProductionOrchestratorConfig) {
  const [progress, setProgress] = useState<OrchestrationProgress>(
    () => buildInitialProgress(config.scenePipelines),
  );
  const [sceneResults, setSceneResults] = useState<Map<string, SceneResult>>(new Map());
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);

  // Pause/resume/cancel refs
  const pausePromiseRef = useRef<Promise<void> | null>(null);
  const resumeResolverRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  // Async job pools (one per provider type)
  const poolsRef = useRef({
    video: new AsyncJobPool(config.concurrency?.video ?? 5),
    tts: new AsyncJobPool(config.concurrency?.tts ?? 10),
    image: new AsyncJobPool(config.concurrency?.image ?? 5),
    lipsync: new AsyncJobPool(config.concurrency?.lipsync ?? 3),
  });

  // ── Progress updater ────────────────────────────────────────────────────

  const updateStepProgress = useCallback((
    stepType: string,
    status: 'complete' | 'failed',
    currentScene: string | null,
  ) => {
    setProgress(prev => {
      const byType = { ...prev.byType };
      if (byType[stepType]) {
        byType[stepType] = { ...byType[stepType] };
        if (status === 'complete') byType[stepType].completed++;
        else byType[stepType].failed++;
      }
      const completedSteps = prev.completedSteps + (status === 'complete' ? 1 : 0);
      const failedSteps = prev.failedSteps + (status === 'failed' ? 1 : 0);
      const done = completedSteps + failedSteps;
      return {
        ...prev,
        byType,
        completedSteps,
        failedSteps,
        percentage: prev.totalSteps > 0 ? Math.round((done / prev.totalSteps) * 100) : 0,
        currentScene,
        currentStepType: stepType,
      };
    });
  }, []);

  // ── Dispatch a single step ──────────────────────────────────────────────

  const dispatchStep = useCallback(async (
    sceneId: string,
    step: ScenePipelineStep,
    stepIndex: number,
    previousSteps: StepResult[],
  ): Promise<StepResult> => {
    const dispatcher = STEP_DISPATCHERS[step.type];
    if (!dispatcher) {
      console.warn(`[Orchestrator] Unknown step type: ${step.type}, skipping`);
      return { stepIndex, stepType: step.type, status: 'skipped', durationMs: 0 };
    }

    const ctx: DispatchContext = {
      sceneId,
      language: config.language,
      region: config.region || 'global',
      subregion: config.subregion || '',
      quality: config.quality,
      scriptContent: config.scriptContent,
      previousSteps,
    };

    const poolKey = getPoolKey(step.type);
    const pool = poolsRef.current[poolKey];

    const result = await pool.submit(() => dispatcher(step, stepIndex, ctx));

    // Track pending async jobs
    if (result.status === 'pending-async' && result.taskId) {
      setPendingJobs(prev => [...prev, {
        sceneId,
        stepIndex,
        stepType: step.type,
        taskId: result.taskId!,
        provider: result.provider || step.type,
        submittedAt: Date.now(),
      }]);
    }

    // Update progress
    if (result.status === 'complete' || result.status === 'skipped') {
      updateStepProgress(step.type, 'complete', sceneId);
    } else if (result.status === 'failed') {
      updateStepProgress(step.type, 'failed', sceneId);
    }

    // Callback
    config.onStepComplete?.(sceneId, result);

    return result;
  }, [config, updateStepProgress]);

  // ── Generate a single scene ─────────────────────────────────────────────

  const generateScene = useCallback(async (sceneId: string): Promise<SceneResult> => {
    const steps = config.scenePipelines[sceneId];
    if (!steps) {
      return { sceneId, steps: [], status: 'failed', totalDurationMs: 0 };
    }

    const sceneStart = Date.now();
    const stepResults: StepResult[] = [];

    for (let i = 0; i < steps.length; i++) {
      // Check pause
      if (pausePromiseRef.current) await pausePromiseRef.current;
      // Check cancel
      if (cancelledRef.current) break;

      const result = await dispatchStep(sceneId, steps[i], i, stepResults);
      stepResults.push(result);
    }

    const sceneResult: SceneResult = {
      sceneId,
      steps: stepResults,
      status: stepResults.every(s => s.status === 'complete' || s.status === 'skipped')
        ? 'complete'
        : stepResults.some(s => s.status === 'complete')
          ? 'partial'
          : 'failed',
      totalDurationMs: Date.now() - sceneStart,
    };

    setSceneResults(prev => new Map(prev).set(sceneId, sceneResult));
    config.onSceneComplete?.(sceneId, sceneResult);
    return sceneResult;
  }, [config, dispatchStep]);

  // ── Generate a single step ──────────────────────────────────────────────

  const generateStep = useCallback(async (
    sceneId: string,
    stepIndex: number,
  ): Promise<StepResult> => {
    const steps = config.scenePipelines[sceneId];
    if (!steps?.[stepIndex]) {
      return { stepIndex, stepType: 'unknown', status: 'failed', error: 'Step not found', durationMs: 0 };
    }

    const existingScene = sceneResults.get(sceneId);
    const previousSteps = existingScene?.steps.slice(0, stepIndex) || [];
    return dispatchStep(sceneId, steps[stepIndex], stepIndex, previousSteps);
  }, [config, sceneResults, dispatchStep]);

  // ── Generate all scenes ─────────────────────────────────────────────────

  const generateAll = useCallback(async (): Promise<OrchestratorResult> => {
    setIsGenerating(true);
    setIsComplete(false);
    cancelledRef.current = false;

    setProgress(buildInitialProgress(config.scenePipelines));
    setProgress(prev => ({ ...prev, status: 'generating' }));

    const allSceneResults = new Map<string, SceneResult>();
    const sceneIds = Object.keys(config.scenePipelines);
    const overallStart = Date.now();

    for (const sceneId of sceneIds) {
      if (cancelledRef.current) break;
      if (pausePromiseRef.current) await pausePromiseRef.current;

      setProgress(prev => ({ ...prev, currentScene: sceneId }));
      const result = await generateScene(sceneId);
      allSceneResults.set(sceneId, result);
    }

    const totalSteps = Array.from(allSceneResults.values())
      .reduce((sum, r) => sum + r.steps.length, 0);
    const completedSteps = Array.from(allSceneResults.values())
      .reduce((sum, r) => sum + r.steps.filter(s => s.status === 'complete' || s.status === 'skipped').length, 0);
    const failedSteps = Array.from(allSceneResults.values())
      .reduce((sum, r) => sum + r.steps.filter(s => s.status === 'failed').length, 0);

    const orchestratorResult: OrchestratorResult = {
      scenes: allSceneResults,
      totalSteps,
      completedSteps,
      failedSteps,
      skippedSteps: totalSteps - completedSteps - failedSteps,
      totalDurationMs: Date.now() - overallStart,
    };

    setSceneResults(allSceneResults);
    setIsGenerating(false);
    setIsComplete(true);
    setProgress(prev => ({
      ...prev,
      status: cancelledRef.current ? 'idle' : 'complete',
      currentScene: null,
      currentStepType: null,
    }));

    config.onAllComplete?.(orchestratorResult);
    toast.success(
      `Pipeline complete: ${completedSteps}/${totalSteps} steps` +
      (failedSteps > 0 ? ` (${failedSteps} failed)` : ''),
    );

    return orchestratorResult;
  }, [config, generateScene]);

  // ── Pause / Resume / Cancel ─────────────────────────────────────────────

  const pause = useCallback(() => {
    pausePromiseRef.current = new Promise(resolve => {
      resumeResolverRef.current = resolve;
    });
    isPausedRef.current = true;
    setIsPaused(true);
    setProgress(prev => ({ ...prev, status: 'paused' }));
    toast.info('Production paused');
  }, []);

  const resume = useCallback(() => {
    resumeResolverRef.current?.();
    pausePromiseRef.current = null;
    resumeResolverRef.current = null;
    isPausedRef.current = false;
    setIsPaused(false);
    setProgress(prev => ({ ...prev, status: 'generating' }));
    toast.info('Production resumed');
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    // Also resume if paused so the loop can exit
    resumeResolverRef.current?.();
    pausePromiseRef.current = null;
    resumeResolverRef.current = null;
    isPausedRef.current = false;
    setIsPaused(false);
    setIsGenerating(false);
    setProgress(prev => ({ ...prev, status: 'idle', currentScene: null, currentStepType: null }));
    toast.info('Production cancelled');
  }, []);

  // ── Poll pending async jobs ─────────────────────────────────────────────

  const pollPendingJobs = useCallback(async () => {
    if (pendingJobs.length === 0) return;

    const resolved: string[] = [];
    for (const job of pendingJobs) {
      try {
        const { data, error } = await supabase.functions.invoke('alibaba-video-generator', {
          body: { action: 'check-status', taskId: job.taskId },
        });
        if (error) continue;
        if (data?.status === 'completed' || data?.status === 'success') {
          resolved.push(job.taskId);
          // Update the scene result with the completed URL
          setSceneResults(prev => {
            const map = new Map(prev);
            const scene = map.get(job.sceneId);
            if (scene) {
              const updatedSteps = [...scene.steps];
              if (updatedSteps[job.stepIndex]) {
                updatedSteps[job.stepIndex] = {
                  ...updatedSteps[job.stepIndex],
                  status: 'complete',
                  outputUrl: data?.videoUrl || data?.url,
                };
              }
              map.set(job.sceneId, { ...scene, steps: updatedSteps });
            }
            return map;
          });
          updateStepProgress(job.stepType, 'complete', job.sceneId);
        } else if (data?.status === 'failed') {
          resolved.push(job.taskId);
          updateStepProgress(job.stepType, 'failed', job.sceneId);
        }
        // else: still processing, keep polling
      } catch {
        // Polling error — skip this cycle
      }
    }

    if (resolved.length > 0) {
      setPendingJobs(prev => prev.filter(j => !resolved.includes(j.taskId)));
    }
  }, [pendingJobs, updateStepProgress]);

  // ── Checkpoint persistence ──────────────────────────────────────────────

  const saveCheckpoint = useCallback(async () => {
    if (!config.projectId) return;
    const checkpoint: OrchestrationCheckpoint = {
      version: 1,
      configHash: hashConfig(config),
      completedSteps: Array.from(sceneResults.entries()).flatMap(([sceneId, scene]) =>
        scene.steps
          .filter(s => s.status === 'complete' || s.status === 'skipped')
          .map(s => ({ sceneId, stepIndex: s.stepIndex, stepType: s.stepType, result: s })),
      ),
      pendingJobs: pendingJobs.map(j => ({
        sceneId: j.sceneId, stepIndex: j.stepIndex,
        taskId: j.taskId, provider: j.provider,
      })),
      progress,
      savedAt: new Date().toISOString(),
    };

    try {
      // Fetch existing scene_config for the first scene to merge checkpoint
      const { error } = await db
        .from('cast_projects')
        .update({
          metadata: { orchestrationCheckpoint: checkpoint },
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.projectId);
      if (error) throw error;
      console.log('[Orchestrator] Checkpoint saved');
    } catch (err: any) {
      console.error('[Orchestrator] Checkpoint save error:', err);
    }
  }, [config, sceneResults, pendingJobs, progress]);

  const loadCheckpoint = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const { data, error } = await db
        .from('cast_projects')
        .select('metadata')
        .eq('id', projectId)
        .single();
      if (error) throw error;

      const checkpoint = (data?.metadata as any)?.orchestrationCheckpoint as OrchestrationCheckpoint | undefined;
      if (!checkpoint || checkpoint.version !== 1) return false;

      // Validate config hash
      if (checkpoint.configHash !== hashConfig(config)) {
        console.warn('[Orchestrator] Config changed since checkpoint — starting fresh');
        return false;
      }

      // Restore scene results
      const restoredScenes = new Map<string, SceneResult>();
      for (const entry of checkpoint.completedSteps) {
        if (!restoredScenes.has(entry.sceneId)) {
          restoredScenes.set(entry.sceneId, {
            sceneId: entry.sceneId, steps: [], status: 'partial', totalDurationMs: 0,
          });
        }
        restoredScenes.get(entry.sceneId)!.steps[entry.stepIndex] = entry.result;
      }
      setSceneResults(restoredScenes);

      // Restore pending jobs
      setPendingJobs(checkpoint.pendingJobs.map(j => ({
        ...j, stepType: '', submittedAt: Date.now(),
      })));

      // Restore progress
      setProgress(checkpoint.progress);

      toast.success('Checkpoint restored — resuming from last saved position');
      return true;
    } catch (err: any) {
      console.error('[Orchestrator] Checkpoint load error:', err);
      return false;
    }
  }, [config]);

  // ── Assembly ────────────────────────────────────────────────────────────

  const assembleOutput = useCallback(async (): Promise<AssemblyResult> => {
    setIsAssembling(true);
    setProgress(prev => ({ ...prev, status: 'assembling' }));

    try {
      // Calculate total duration from scene results
      const allSteps = Array.from(sceneResults.values()).flatMap(s => s.steps);
      const musicSteps = allSteps.filter(s => s.stepType === 'music' && s.metadata);
      const totalDuration = musicSteps.reduce((sum, s) => {
        const dur = (s.metadata as any)?.duration || 0;
        return sum + dur;
      }, 0) || 1620; // fallback ~27 min for EP04

      const maxSegment = config.assembly?.maxSegmentDuration ?? 1800; // 30 min
      const format = config.assembly?.format ?? 'video';

      // Build assembly payload — collect all output URLs per scene
      const scenePayloads = Array.from(sceneResults.entries()).map(([sceneId, scene]) => ({
        sceneId,
        assets: scene.steps
          .filter(s => s.outputUrl)
          .map(s => ({ type: s.stepType, url: s.outputUrl!, provider: s.provider })),
      }));

      if (totalDuration <= maxSegment) {
        // Single assembly call
        const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
          body: {
            scenes: scenePayloads,
            format,
            resolution: config.assembly?.resolution ?? '1080p',
            transitions: config.assembly?.transitions ?? 'fade',
            language: config.language,
          },
        });
        if (error) throw error;

        const result: AssemblyResult = {
          format,
          outputUrl: data?.videoUrl || data?.url,
          totalDuration,
          status: 'complete',
        };
        setIsAssembling(false);
        setProgress(prev => ({ ...prev, status: 'complete' }));
        toast.success('Assembly complete!');
        return result;
      }

      // Segmented assembly for >30 min content
      const sceneIds = Array.from(sceneResults.keys());
      const segments: Array<{ url: string; durationSeconds: number }> = [];
      let segmentScenes: typeof scenePayloads = [];
      let segmentDuration = 0;

      for (let i = 0; i < sceneIds.length; i++) {
        const sceneId = sceneIds[i];
        const sceneDur = Object.values(config.scenePipelines[sceneId] || [])
          .filter((s: any) => s.type === 'music')
          .reduce((sum: number, s: any) => sum + (s.duration || 0), 0) || 120; // ~2 min fallback per scene

        if (segmentDuration + sceneDur > maxSegment && segmentScenes.length > 0) {
          // Flush current segment
          const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
            body: {
              scenes: segmentScenes,
              format,
              resolution: config.assembly?.resolution ?? '1080p',
              transitions: config.assembly?.transitions ?? 'fade',
              language: config.language,
              isSegment: true,
            },
          });
          if (error) throw error;
          segments.push({ url: data?.videoUrl || data?.url, durationSeconds: segmentDuration });
          segmentScenes = [];
          segmentDuration = 0;
        }

        const payload = scenePayloads.find(s => s.sceneId === sceneId);
        if (payload) segmentScenes.push(payload);
        segmentDuration += sceneDur;
      }

      // Flush final segment
      if (segmentScenes.length > 0) {
        const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
          body: {
            scenes: segmentScenes,
            format,
            resolution: config.assembly?.resolution ?? '1080p',
            transitions: config.assembly?.transitions ?? 'fade',
            language: config.language,
            isSegment: true,
          },
        });
        if (error) throw error;
        segments.push({ url: data?.videoUrl || data?.url, durationSeconds: segmentDuration });
      }

      const result: AssemblyResult = {
        format,
        segments,
        totalDuration,
        status: 'complete',
      };
      setIsAssembling(false);
      setProgress(prev => ({ ...prev, status: 'complete' }));
      toast.success(`Assembly complete: ${segments.length} segments`);
      return result;
    } catch (err: any) {
      console.error('[Orchestrator] Assembly error:', err);
      setIsAssembling(false);
      setProgress(prev => ({ ...prev, status: 'error' }));
      toast.error(`Assembly failed: ${err.message}`);
      return {
        format: config.assembly?.format ?? 'video',
        totalDuration: 0,
        status: 'failed',
        error: err.message,
      };
    }
  }, [config, sceneResults]);

  // ── Computed: per-type summary for progress panel ───────────────────────

  const progressSummary = useMemo(() => {
    const types = Object.entries(progress.byType)
      .filter(([_, v]) => v.total > 0)
      .map(([type, v]) => ({ type, ...v }));
    return types;
  }, [progress.byType]);

  return {
    // Generation
    generateAll,
    generateScene,
    generateStep,

    // Control
    pause,
    resume,
    cancel,
    isPaused,

    // Progress
    progress,
    progressSummary,
    sceneResults,

    // Async job management
    pendingJobs,
    pollPendingJobs,

    // Checkpoint persistence
    saveCheckpoint,
    loadCheckpoint,

    // Assembly
    assembleOutput,

    // Status
    isGenerating,
    isComplete,
    isAssembling,
  };
}

export default useCastProductionOrchestrator;
