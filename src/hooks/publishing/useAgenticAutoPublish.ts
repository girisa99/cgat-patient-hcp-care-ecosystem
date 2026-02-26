/**
 * useAgenticAutoPublish — React hook wrapping the Agentic Content Orchestrator
 *
 * Provides real-time progress tracking through the 8-agent pipeline,
 * visual style rotation display, and approve/reject/transcreate actions.
 * Same pattern as useAutoPublishDashboard but for agentic content generation.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  AgentRole,
  AgentStatus,
  AgenticBatchResult,
  AgenticOrchestratorConfig,
  AgenticContentContext,
} from '@/services/publishing/agenticContentOrchestrator';
import {
  orchestrateBatch,
  getDefaultConfig,
  getCurrentVisualStyle,
  getUpcomingVisualStyles,
  AGENT_PIPELINE_ORDER,
} from '@/services/publishing/agenticContentOrchestrator';
import type { VisualRotationSchedule } from '@/services/publishing/visualStyleRotation';
import type { AutoPublishContentItem } from '@/services/publishing/autoPublishContentEngine';
import { transcreateContent } from '@/services/publishing/autoPublishTranscreator';

// ─── Types ──────────────────────────────────────────────────────────

export interface AgenticProgress {
  totalItems: number;
  completedItems: number;
  currentItemIndex: number;
  agentProgress: Record<AgentRole, AgentStatus>;
}

export interface UseAgenticAutoPublishReturn {
  // Orchestration state
  isOrchestrating: boolean;
  currentAgent: AgentRole | null;
  progress: AgenticProgress;
  // Results
  batchResult: AgenticBatchResult | null;
  contentItems: AutoPublishContentItem[];
  // Visual style
  currentWeekStyle: VisualRotationSchedule;
  upcomingStyles: VisualRotationSchedule[];
  // Quality
  overallQualityScore: number;
  // Actions
  generateAgenticBatch: (configOverrides?: Partial<AgenticOrchestratorConfig>) => Promise<void>;
  approveItem: (itemId: string, notes?: string) => void;
  rejectItem: (itemId: string, reason: string) => void;
  transcreateItem: (itemId: string) => void;
  publishApproved: () => void;
  // Config
  config: AgenticOrchestratorConfig;
  updateConfig: (updates: Partial<AgenticOrchestratorConfig>) => void;
  // Error
  error: string | null;
}

// ─── Hook Implementation ────────────────────────────────────────────

export function useAgenticAutoPublish(): UseAgenticAutoPublishReturn {
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentRole | null>(null);
  const [batchResult, setBatchResult] = useState<AgenticBatchResult | null>(null);
  const [contentItems, setContentItems] = useState<AutoPublishContentItem[]>([]);
  const [config, setConfig] = useState<AgenticOrchestratorConfig>(getDefaultConfig());
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState<AgenticProgress>({
    totalItems: 0,
    completedItems: 0,
    currentItemIndex: 0,
    agentProgress: {
      creative_director: 'pending',
      scriptwriter: 'pending',
      visual_designer: 'pending',
      quality_reviewer: 'pending',
      voiceover_agent: 'pending',
      audio_mix_agent: 'pending',
      transcreation: 'pending',
      publish_coordinator: 'pending',
    },
  });

  // Visual style (memoized since it only changes weekly)
  const currentWeekStyle = useMemo(() => getCurrentVisualStyle(), []);
  const upcomingStyles = useMemo(() => getUpcomingVisualStyles(4), []);

  // Quality score
  const overallQualityScore = batchResult?.overallQualityScore ?? 0;

  // Progress callback for the orchestrator
  const handleProgress = useCallback((itemIndex: number, agent: AgentRole, status: AgentStatus) => {
    setCurrentAgent(agent);
    setProgress(prev => {
      const newProgress = { ...prev };
      newProgress.currentItemIndex = itemIndex;
      newProgress.agentProgress = { ...prev.agentProgress, [agent]: status };

      if (agent === 'publish_coordinator' && status === 'completed') {
        newProgress.completedItems = itemIndex + 1;
      }

      return newProgress;
    });
  }, []);

  // Generate agentic batch
  const generateAgenticBatch = useCallback(async (
    configOverrides?: Partial<AgenticOrchestratorConfig>,
  ) => {
    setIsOrchestrating(true);
    setError(null);
    setBatchResult(null);
    setContentItems([]);

    const mergedConfig = { ...config, ...configOverrides };

    setProgress({
      totalItems: mergedConfig.batchSize,
      completedItems: 0,
      currentItemIndex: 0,
      agentProgress: {
        creative_director: 'pending',
        scriptwriter: 'pending',
        visual_designer: 'pending',
        quality_reviewer: 'pending',
        voiceover_agent: 'pending',
        audio_mix_agent: 'pending',
        transcreation: 'pending',
        publish_coordinator: 'pending',
      },
    });

    try {
      const result = await orchestrateBatch(mergedConfig, handleProgress);
      setBatchResult(result);

      // Extract publish-ready items
      const items = result.items
        .filter((ctx): ctx is AgenticContentContext & { publishReadyItem: AutoPublishContentItem } =>
          ctx.publishReadyItem != null)
        .map(ctx => ctx.publishReadyItem);

      setContentItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Orchestration failed');
    } finally {
      setIsOrchestrating(false);
      setCurrentAgent(null);
    }
  }, [config, handleProgress]);

  // Approve item
  const approveItem = useCallback((itemId: string, notes?: string) => {
    setContentItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? {
              ...item,
              status: 'approved' as const,
              reviewNotes: notes,
              approvedBy: 'reviewer',
              approvedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  }, []);

  // Reject item
  const rejectItem = useCallback((itemId: string, reason: string) => {
    setContentItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, status: 'rejected' as const, reviewNotes: reason }
          : item,
      ),
    );
  }, []);

  // Transcreate a single item
  const transcreateItem = useCallback((itemId: string) => {
    setContentItems(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;

        const results = transcreateContent({
          titleEN: item.titleEN,
          bodyEN: item.bodyEN,
          ctaEN: item.ctaEN,
          hashtagsEN: item.hashtags,
          includeSubRegions: true,
        });

        const transcreations: Record<string, {
          title: string; body: string; cta: string;
          hashtags: string[]; language: string; isRTL: boolean;
        }> = {};

        for (const r of results) {
          const key = r.subRegionCode ? `${r.regionCode}_${r.subRegionCode}` : r.regionCode;
          transcreations[key] = {
            title: r.title,
            body: r.body,
            cta: r.cta,
            hashtags: r.hashtags,
            language: r.language,
            isRTL: r.isRTL,
          };
        }

        return { ...item, transcreations };
      }),
    );
  }, []);

  // Publish approved items (placeholder — actual publishing goes through platform service)
  const publishApproved = useCallback(() => {
    setContentItems(prev =>
      prev.map(item =>
        item.status === 'approved'
          ? { ...item, status: 'published' as const }
          : item,
      ),
    );
  }, []);

  // Update config
  const updateConfig = useCallback((updates: Partial<AgenticOrchestratorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    isOrchestrating,
    currentAgent,
    progress,
    batchResult,
    contentItems,
    currentWeekStyle,
    upcomingStyles,
    overallQualityScore,
    generateAgenticBatch,
    approveItem,
    rejectItem,
    transcreateItem,
    publishApproved,
    config,
    updateConfig,
    error,
  };
}
