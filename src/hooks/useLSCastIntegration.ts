/**
 * Label Studio Cast Integration
 * Captures training data across the entire Genie Cast pipeline:
 * CREATE (category/format/style selection, enrichment, template use)
 * PRODUCE (generation, scene editing, review/approval)
 * PUBLISH (platform selection, publish, schedule, SEO)
 */

import { useCallback } from 'react';
import { useLSUniversalOptional } from '@/components/label-studio/LSUniversalProvider';

// ============================================================================
// CREATE PHASE — Content Selection & Configuration
// ============================================================================

export const useLSCastIntegration = () => {
  const ls = useLSUniversalOptional();

  // ── CREATE: Category + Format Selection ──────────────────────────────────

  const captureCategorySelection = useCallback((
    categoryId: string,
    categoryName: string,
    previousCategoryId?: string
  ) => {
    ls?.captureData({
      type: 'cast_format_selection',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'create',
        action: 'category_select',
        categoryId,
        categoryName,
        previousCategoryId,
        wasChange: !!previousCategoryId && previousCategoryId !== categoryId,
      },
    });
  }, [ls]);

  const captureFormatSelection = useCallback((
    formatId: string,
    formatName: string,
    categoryId: string,
    subFormatId?: string
  ) => {
    ls?.captureData({
      type: 'cast_format_selection',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'create',
        action: 'format_select',
        formatId,
        formatName,
        categoryId,
        subFormatId,
        hasSubFormat: !!subFormatId,
      },
    });
  }, [ls]);

  // ── CREATE: Visual Style Selection ───────────────────────────────────────

  const captureStyleSelection = useCallback((
    styleIds: string[],
    styleNames: string[],
    selectionMethod: 'manual' | 'template' | 'ai_suggested'
  ) => {
    ls?.captureData({
      type: 'cast_style_selection',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'create',
        action: 'style_select',
        styleIds,
        styleNames,
        styleCount: styleIds.length,
        selectionMethod,
      },
    });
  }, [ls]);

  // ── CREATE: Enrichment & Configuration ───────────────────────────────────

  const captureEnrichmentConfig = useCallback((config: {
    enrichmentPrompt?: string;
    resolution?: string;
    aspectRatio?: string;
    targetDuration?: number;
    outputLanguages: string[];
    characterIds: string[];
    lipSyncEnabled: boolean;
    dubbingEnabled: boolean;
  }) => {
    ls?.captureData({
      type: 'cast_format_selection',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'create',
        action: 'enrichment_config',
        hasEnrichmentPrompt: !!config.enrichmentPrompt,
        enrichmentLength: config.enrichmentPrompt?.length || 0,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio,
        targetDuration: config.targetDuration,
        languageCount: config.outputLanguages.length,
        characterCount: config.characterIds.length,
        lipSyncEnabled: config.lipSyncEnabled,
        dubbingEnabled: config.dubbingEnabled,
      },
    });
  }, [ls]);

  // ── CREATE: Template Use ─────────────────────────────────────────────────

  const captureTemplateUse = useCallback((
    templateId: string,
    templateName: string,
    templateCategory: string,
    wasCustomized: boolean
  ) => {
    ls?.captureData({
      type: 'suggestion_relevance',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'create',
        action: 'template_use',
        templateId,
        templateName,
        templateCategory,
      },
      labels: { was_customized: wasCustomized },
    });
  }, [ls]);

  // ============================================================================
  // PRODUCE PHASE — Generation, Editing, Review
  // ============================================================================

  // ── PRODUCE: Generation Start & Complete ─────────────────────────────────

  const captureGenerationStart = useCallback((config: {
    formatName?: string;
    provider: string;
    region?: string;
    videoStyles: string[];
    scriptLength?: number;
    creditCost?: number;
  }) => {
    ls?.captureData({
      type: 'cast_generation',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'produce',
        action: 'generation_start',
        formatName: config.formatName,
        provider: config.provider,
        region: config.region,
        videoStyleCount: config.videoStyles.length,
        videoStyles: config.videoStyles,
        scriptLength: config.scriptLength,
        creditCost: config.creditCost,
      },
    });
  }, [ls]);

  const captureGenerationComplete = useCallback((result: {
    formatName?: string;
    provider: string;
    duration: number;
    success: boolean;
    outputUrl?: string;
    errorMessage?: string;
  }) => {
    ls?.captureData({
      type: 'cast_generation',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'produce',
        action: 'generation_complete',
        formatName: result.formatName,
        provider: result.provider,
        durationMs: result.duration,
        success: result.success,
        hasOutput: !!result.outputUrl,
        errorMessage: result.errorMessage,
      },
      labels: { generation_success: result.success },
    });
  }, [ls]);

  // ── PRODUCE: Scene Editing ───────────────────────────────────────────────

  const captureSceneEdit = useCallback((edit: {
    sceneIndex: number;
    editType: 'script_change' | 'style_change' | 'timing_change' | 'reorder' | 'delete' | 'add';
    previousValue?: string;
    newValue?: string;
  }) => {
    ls?.captureData({
      type: 'cast_scene_edit',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'produce',
        action: 'scene_edit',
        sceneIndex: edit.sceneIndex,
        editType: edit.editType,
        hasValueChange: edit.previousValue !== edit.newValue,
      },
    });
  }, [ls]);

  // ── PRODUCE: Review & Approval Gate ──────────────────────────────────────

  const captureReviewDecision = useCallback((decision: {
    approved: boolean;
    reason?: string;
    sceneCount: number;
    totalDuration?: number;
    revisionsCount: number;
  }) => {
    ls?.captureData({
      type: 'cast_review_approval',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'produce',
        action: 'review_decision',
        sceneCount: decision.sceneCount,
        totalDuration: decision.totalDuration,
        revisionsCount: decision.revisionsCount,
        reason: decision.reason,
      },
      labels: { approved: decision.approved },
    });
  }, [ls]);

  // ============================================================================
  // PUBLISH PHASE — Distribution, Scheduling, SEO
  // ============================================================================

  // ── PUBLISH: Platform Selection ──────────────────────────────────────────

  const capturePlatformSelection = useCallback((
    platforms: string[],
    totalAvailable: number
  ) => {
    ls?.captureData({
      type: 'cast_publish',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'publish',
        action: 'platform_select',
        selectedPlatforms: platforms,
        selectedCount: platforms.length,
        totalAvailable,
        selectionRatio: platforms.length / totalAvailable,
      },
    });
  }, [ls]);

  // ── PUBLISH: Publish Action ──────────────────────────────────────────────

  const capturePublishAction = useCallback((publish: {
    platform: string;
    success: boolean;
    publishType: 'immediate' | 'scheduled';
    errorMessage?: string;
  }) => {
    ls?.captureData({
      type: 'cast_publish',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'publish',
        action: 'publish_execute',
        targetPlatform: publish.platform,
        publishType: publish.publishType,
        success: publish.success,
        errorMessage: publish.errorMessage,
      },
      labels: { publish_success: publish.success },
    });
  }, [ls]);

  // ── PUBLISH: Schedule ────────────────────────────────────────────────────

  const captureScheduleAction = useCallback((schedule: {
    platform: string;
    scheduledTime: string;
    isReschedule: boolean;
  }) => {
    ls?.captureData({
      type: 'cast_publish',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'publish',
        action: 'schedule',
        targetPlatform: schedule.platform,
        scheduledTime: schedule.scheduledTime,
        isReschedule: schedule.isReschedule,
      },
    });
  }, [ls]);

  // ── PUBLISH: Thumbnail Selection ─────────────────────────────────────────

  const captureThumbnailSelection = useCallback((
    selectedIndex: number,
    totalOptions: number,
    isAIGenerated: boolean
  ) => {
    ls?.captureData({
      type: 'thumbnail_quality',
      source: 'cast',
      platform: 'desktop',
      data: {
        phase: 'publish',
        action: 'thumbnail_select',
        selectedIndex,
        totalOptions,
        isAIGenerated,
      },
    });
  }, [ls]);

  // ============================================================================
  // PIPELINE PERFORMANCE — End-to-End Metrics
  // ============================================================================

  const capturePipelineMetrics = useCallback((metrics: {
    totalDurationMs: number;
    createDurationMs?: number;
    produceDurationMs?: number;
    publishDurationMs?: number;
    formatName: string;
    provider: string;
    region?: string;
    creditCost: number;
    success: boolean;
  }) => {
    ls?.captureData({
      type: 'cast_pipeline_performance',
      source: 'cast',
      platform: 'desktop',
      data: {
        action: 'pipeline_complete',
        ...metrics,
      },
      labels: { pipeline_success: metrics.success },
    });
  }, [ls]);

  // ── Mode / Tab Navigation ────────────────────────────────────────────────

  const captureModeChange = useCallback((
    fromMode: string,
    toMode: string,
    fromSubTab?: string,
    toSubTab?: string
  ) => {
    ls?.captureData({
      type: 'cast_pipeline_performance',
      source: 'cast',
      platform: 'desktop',
      data: {
        action: 'mode_change',
        fromMode,
        toMode,
        fromSubTab,
        toSubTab,
      },
    });
  }, [ls]);

  return {
    // CREATE
    captureCategorySelection,
    captureFormatSelection,
    captureStyleSelection,
    captureEnrichmentConfig,
    captureTemplateUse,
    // PRODUCE
    captureGenerationStart,
    captureGenerationComplete,
    captureSceneEdit,
    captureReviewDecision,
    // PUBLISH
    capturePlatformSelection,
    capturePublishAction,
    captureScheduleAction,
    captureThumbnailSelection,
    // Pipeline
    capturePipelineMetrics,
    captureModeChange,
    // State
    isEnabled: ls?.isEnabled ?? false,
  };
};

// Re-export alias
export { useLSCastIntegration as useCastLS };
