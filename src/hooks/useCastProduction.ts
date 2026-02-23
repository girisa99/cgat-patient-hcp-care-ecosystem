/**
 * useCastProduction — React Hook for Cast Production Pipeline
 *
 * Bridges the CREATE flow UI to the production pipeline.
 * Manages job lifecycle: start → progress → complete/fail.
 *
 * Phase 6A: B-001 through B-006 enrichment wiring.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  assembleEnrichmentContext,
  calculateEnrichmentScore,
  buildRequestFromSession,
  startCastProduction,
  generateSceneScripts,
  type EnrichmentContext,
  type CastProductionRequest,
} from '@/services/production/castProductionBridge';
import { pipelineSupervisor } from '@/services/production/pipelineSupervisor';
import type { ProductionJob, PipelineTask } from '@/services/production/pipelineSupervisor';
import { getIntelligenceBus } from '@/services/brand-intelligence/crossProductIntelligenceBus';
import type { ContentFormat, ContentIntent } from '@/services/pipelineOrchestrator';
import type { ScriptGenerationMode } from '@/services/createFlowOrchestrator';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProductionState {
  status: 'idle' | 'preparing' | 'generating_scenes' | 'producing' | 'complete' | 'failed';
  job: ProductionJob | null;
  progress: number;
  currentTask: string;
  scenes: Array<{ sceneId: string; scriptText: string; visualDirection: string; duration: number }>;
  enrichment: EnrichmentContext | null;
  enrichmentScore: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface UseCastProductionReturn {
  // State
  state: ProductionState;
  isProducing: boolean;
  hasResults: boolean;

  // Actions
  startProduction: (params: {
    scriptContent: string;
    scriptTitle: string;
    inputMode: ScriptGenerationMode;
    intent: ContentIntent;
    selectedFormats: ContentFormat[];
    inputLanguage: string;
    outputLanguages: Array<{ code: string; adaptationLevel: 'light' | 'moderate' | 'deep' }>;
    videoStyles: string[];
    scenario: string;
    sceneStyle: string;
    quality: 'standard' | 'production' | 'cinematic';
    avatarGender: string;
    includeMusic: boolean;
    includeCaptions: boolean;
  }) => Promise<void>;

  cancelProduction: () => void;
  resetProduction: () => void;

  // Enrichment
  refreshEnrichment: (regionCode: string) => void;
  getEnrichmentScore: () => number;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCastProduction(): UseCastProductionReturn {
  const [state, setState] = useState<ProductionState>({
    status: 'idle',
    job: null,
    progress: 0,
    currentTask: '',
    scenes: [],
    enrichment: null,
    enrichmentScore: 0,
    error: null,
    startedAt: null,
    completedAt: null,
  });

  const jobPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeJobId = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jobPollRef.current) clearInterval(jobPollRef.current);
    };
  }, []);

  const isProducing = state.status === 'preparing' || state.status === 'generating_scenes' || state.status === 'producing';
  const hasResults = state.status === 'complete' && state.job !== null;

  // ─── Enrichment ──────────────────────────────────────────────────────────

  const refreshEnrichment = useCallback((regionCode: string) => {
    const bus = getIntelligenceBus();
    const profile = bus.getBrandProfile();
    const enrichment = assembleEnrichmentContext(profile, regionCode);
    const score = calculateEnrichmentScore(enrichment);

    setState(prev => ({
      ...prev,
      enrichment,
      enrichmentScore: score,
    }));
  }, []);

  const getEnrichmentScore = useCallback(() => {
    return state.enrichmentScore;
  }, [state.enrichmentScore]);

  // ─── Production ──────────────────────────────────────────────────────────

  const startProduction = useCallback(async (params: {
    scriptContent: string;
    scriptTitle: string;
    inputMode: ScriptGenerationMode;
    intent: ContentIntent;
    selectedFormats: ContentFormat[];
    inputLanguage: string;
    outputLanguages: Array<{ code: string; adaptationLevel: 'light' | 'moderate' | 'deep' }>;
    videoStyles: string[];
    scenario: string;
    sceneStyle: string;
    quality: 'standard' | 'production' | 'cinematic';
    avatarGender: string;
    includeMusic: boolean;
    includeCaptions: boolean;
  }) => {
    // Phase 1: Assemble enrichment
    setState(prev => ({
      ...prev,
      status: 'preparing',
      progress: 0,
      currentTask: 'Assembling enrichment context...',
      error: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    }));

    const bus = getIntelligenceBus();
    const profile = bus.getBrandProfile();
    const regionCode = bus.getRegionCode();
    const enrichment = assembleEnrichmentContext(profile, regionCode);
    const enrichmentScore = calculateEnrichmentScore(enrichment);

    setState(prev => ({
      ...prev,
      enrichment,
      enrichmentScore,
      progress: 10,
      currentTask: `Enrichment ready (score: ${enrichmentScore}/100)`,
    }));

    // Phase 2: Generate scene scripts
    setState(prev => ({
      ...prev,
      status: 'generating_scenes',
      progress: 15,
      currentTask: 'Generating scene scripts...',
    }));

    const request = buildRequestFromSession(
      {
        scriptContent: params.scriptContent,
        scriptTitle: params.scriptTitle,
        inputMode: params.inputMode,
        intent: params.intent,
        selectedFormats: params.selectedFormats,
        inputLanguage: params.inputLanguage,
        outputLanguages: params.outputLanguages,
        videoStyles: params.videoStyles,
        scenario: params.scenario,
        sceneStyle: params.sceneStyle,
        enrichmentScore,
      },
      enrichment,
      {
        quality: params.quality,
        avatarGender: params.avatarGender,
        includeMusic: params.includeMusic,
        includeCaptions: params.includeCaptions,
      },
    );

    try {
      const scenes = await generateSceneScripts(request);
      setState(prev => ({
        ...prev,
        scenes,
        progress: 30,
        currentTask: `${scenes.length} scenes generated`,
      }));
    } catch (err: any) {
      // Non-fatal: proceed with basic script
      setState(prev => ({
        ...prev,
        progress: 25,
        currentTask: 'Using input script (scene generation skipped)',
      }));
    }

    // Phase 3: Start production pipeline
    setState(prev => ({
      ...prev,
      status: 'producing',
      progress: 35,
      currentTask: 'Starting production pipeline...',
    }));

    try {
      const job = await startCastProduction(request, {
        onTaskUpdate: (task: PipelineTask) => {
          setState(prev => ({
            ...prev,
            currentTask: `${task.agentName}: ${task.status}`,
          }));
        },
        onProgress: (progress: number) => {
          // Map 0-100 pipeline progress to 35-95 of overall
          const mappedProgress = 35 + Math.round(progress * 0.6);
          setState(prev => ({
            ...prev,
            progress: mappedProgress,
          }));
        },
      });

      activeJobId.current = job.id;

      // Poll for completion
      jobPollRef.current = setInterval(() => {
        const currentJob = pipelineSupervisor.getJobStatus(job.id);
        if (!currentJob) return;

        if (currentJob.status === 'complete') {
          setState(prev => ({
            ...prev,
            status: 'complete',
            job: currentJob,
            progress: 100,
            currentTask: 'Production complete!',
            completedAt: new Date().toISOString(),
          }));
          if (jobPollRef.current) clearInterval(jobPollRef.current);
        } else if (currentJob.status === 'failed') {
          setState(prev => ({
            ...prev,
            status: 'failed',
            job: currentJob,
            error: currentJob.error || 'Production failed',
            currentTask: 'Production failed',
            completedAt: new Date().toISOString(),
          }));
          if (jobPollRef.current) clearInterval(jobPollRef.current);
        }
      }, 1000);
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: err.message || 'Failed to start production',
        currentTask: 'Failed to start',
        completedAt: new Date().toISOString(),
      }));
    }
  }, []);

  const cancelProduction = useCallback(() => {
    if (activeJobId.current) {
      pipelineSupervisor.cancelJob(activeJobId.current);
    }
    if (jobPollRef.current) clearInterval(jobPollRef.current);

    setState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      currentTask: 'Cancelled',
      completedAt: new Date().toISOString(),
    }));
  }, []);

  const resetProduction = useCallback(() => {
    if (jobPollRef.current) clearInterval(jobPollRef.current);
    activeJobId.current = null;

    setState({
      status: 'idle',
      job: null,
      progress: 0,
      currentTask: '',
      scenes: [],
      enrichment: null,
      enrichmentScore: 0,
      error: null,
      startedAt: null,
      completedAt: null,
    });
  }, []);

  return {
    state,
    isProducing,
    hasResults,
    startProduction,
    cancelProduction,
    resetProduction,
    refreshEnrichment,
    getEnrichmentScore,
  };
}
