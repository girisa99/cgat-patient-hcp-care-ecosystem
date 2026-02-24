/**
 * ProduceEditStep — PRODUCE > Edit sub-tab
 *
 * Extracted from GenieCastConsolidatedTabs.tsx (lines 1654-2040).
 * This component renders the full Edit & Post-Production step, including:
 *   - Authoring stage progress
 *   - AI routing transparency
 *   - Scene script AI panel
 *   - Script-to-template mapper
 *   - Translation/transcreation toggle
 *   - A/V sync preview
 *   - Live generation preview
 *   - Production mode, timeline, and controls
 *   - Scene-aware teleprompter
 *   - Scene progress tracker
 *   - A/V sync status & pre-render validation
 *   - Multi-track video timeline editor
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Film,
  Volume2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Shared components
import { AuthoringStageIndicator } from '@/components/shared/AuthoringStageIndicator';
import { ScriptTemplateMapper } from '@/components/shared/ScriptTemplateMapper';
import { SceneScriptAIPanel } from '@/components/shared/SceneScriptAIPanel';
import { AVSyncPreview } from '@/components/shared/AVSyncPreview';
import { UnifiedScriptPanel } from '@/components/shared/UnifiedScriptPanel';
import { useUnifiedEditorState } from '@/hooks/useUnifiedEditorState';

// AI routing
import { RoutingDecisionCard } from '@/components/ai/RoutingDecisionCard';

// Translation / transcreation
import { TranslationTranscreationToggle } from '../TranslationTranscreationToggle';

// Live generation preview
import { LiveGenerationPreview } from '../LiveGenerationPreview';

// Production UI components
import {
  SceneProgressTracker,
  ProductionModePanel,
  ProductionTimeline,
  ProductionControlPanel,
  getDefaultProductionSettings,
  createTimelinePhases,
  deriveSceneRenderMode,
} from '../production';

// Video editing components
import { VideoTimelineEditor, SceneAwareTeleprompter } from '../editing';

// Production bridge utilities
import { buildRequestFromCastSession, assembleEnrichmentContext } from '@/services/production/castProductionBridge';

// ---------------------------------------------------------------------------
// Inline helper — duplicated from parent to keep this component self-contained
// ---------------------------------------------------------------------------
function detectTranscreationZone(dialectCode: string): string {
  if (!dialectCode) return 'global';
  const prefix = dialectCode.split('-')[0]?.toLowerCase();
  if (['ar', 'he', 'fa', 'tr'].includes(prefix) || dialectCode.startsWith('ar-')) return 'mena';
  if (['zh', 'ja', 'ko'].includes(prefix)) return 'cjk';
  if (['hi', 'te', 'ta', 'bn', 'ur', 'mr', 'gu', 'pa', 'ml', 'kn'].includes(prefix)) return 'india';
  if (['id', 'ms', 'th', 'vi', 'tl', 'my'].includes(prefix)) return 'sea';
  if (['sw', 'yo', 'am', 'ha', 'ig'].includes(prefix)) return 'africa';
  if (['fr', 'de', 'it', 'nl', 'pl', 'ru', 'uk', 'sv', 'da', 'no', 'fi', 'el', 'ro', 'cs'].includes(prefix)) return 'europe';
  if (['es', 'pt'].includes(prefix)) return 'latam';
  if (['en'].includes(prefix)) return 'western';
  return 'global';
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface ProduceEditStepProps {
  /** Unified authoring hook */
  authoring: {
    state: {
      currentStage: any;
      config: { enabledStages: any[] };
      templateMapping: any;
      isProcessing: boolean;
    };
    goToStage: (stage: any) => void;
    updateSceneScript: (sceneId: string, updates: any) => void;
    approveTemplateMapping: () => void;
    generateTTSForScene: (sceneId: string) => any;
    setSelectedDialects?: (dialects: string[]) => void;
    setTargetRegions?: (regions: string[]) => void;
  };
  /** AI routing intelligence hook */
  routing: {
    routingDecision: any;
    selectedModel: any;
    selectModel: (model: any) => void;
    analyzeQuery: (query: string) => any;
    selectCostOptimized: () => void;
    selectQualityOptimized: () => void;
    selectSpeedOptimized: () => void;
  };
  /** Genie cast session */
  castSession: {
    session: {
      approvedMessaging?: { hook?: string; mediumScript?: string };
      selectedTemplate?: { name?: string };
      selectedStyles?: string[];
      selectedRegion?: string;
      selectedDialects?: string[];
      productionSettings?: any;
      targetDuration: number;
      [key: string]: any;
    };
    goToStage: (stage: string) => void;
    updateSession: (updates: any) => void;
  };
  /** Cast production state */
  production: {
    state: {
      currentTask: string | null;
      progress: number;
      startedAt: string | null;
      status: string;
      scenes: any[];
    };
    startProduction: (params: any) => Promise<void>;
    cancelProduction: () => void;
    resetProduction: () => void;
  };
  /** Production session */
  productionSession: {
    session: {
      totalScenes: number;
      scenes: any[];
    };
    initializeFromMapping?: (mapping: any) => void;
    regenerateSceneTTS?: (sceneId: string) => void;
    regenerateSceneVideo?: (sceneId: string) => void;
  };
  /** Video timeline hook */
  videoTimeline: {
    state: {
      isPlaying: boolean;
      tracks: any[];
      totalDurationMs: number;
      [key: string]: any;
    };
    stats: { totalClips: number; [key: string]: any };
    play: () => void;
    pause: () => void;
    setPlayhead?: (ms: number) => void;
    importOfflineClip: (trackId: string, file: File, startMs: number, durationMs: number) => void;
    [key: string]: any;
  };
  /** A/V sync hook */
  avSync: {
    syncReport: {
      overallStatus: string;
      isReadyForRender: boolean;
      alignedCount: number;
      totalPairs: number;
      mismatchCount: number;
    };
    autoFixAll: () => void;
    validateForRender: () => { errors: string[]; warnings: string[] };
  };
  /** Clip operations */
  clipOps: any;
  /** Selected dialect codes */
  selectedDialectCodes: string[];
  /** Selected product ID */
  selectedProductId: string | null;
  /** Production quality setting */
  productionQuality: string;
  /** Generate callback */
  onGenerate: () => void;
  /** Navigate to a sub-tab within a main tab */
  setSubTab: (mainTab: string, subTab: string) => void;
  /** Set the active main tab */
  setActiveMainTab: (tab: string) => void;
  /** Set active production section */
  setProductionSection: (section: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const ProduceEditStep: React.FC<ProduceEditStepProps> = ({
  authoring,
  routing,
  castSession,
  production,
  productionSession,
  videoTimeline,
  avSync,
  clipOps,
  selectedDialectCodes,
  selectedProductId,
  productionQuality,
  onGenerate,
  setSubTab,
  setActiveMainTab,
  setProductionSection,
}) => {
  // Unified editor state — works for both single-scene and multi-scene Cast
  const unifiedEditor = useUnifiedEditorState({
    productContext: 'cast',
    templateMapping: authoring.state.templateMapping || undefined,
    initialContent: castSession.session.approvedMessaging?.mediumScript || '',
    initialTitle: castSession.session.selectedTemplate?.name || 'Script',
    onContentChange: (sceneId, content) => {
      authoring.updateSceneScript(sceneId, { editedText: content });
    },
    onTTSStale: (sceneId) => {
      toast.info(`Script changed — TTS for scene "${sceneId}" needs regeneration`);
    },
    onVideoStale: (sceneId) => {
      toast.info(`Content changed — video for scene "${sceneId}" needs regeneration`);
    },
  });

  return (
    <motion.div
      key="studio"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Step 2 of 3: Edit & Post-Production */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setSubTab('produce', 'generate')}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Generate
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setSubTab('produce', 'review')}>
          Continue to Review <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Authoring Stage Progress */}
      <div className="mb-4">
        <AuthoringStageIndicator
          currentStage={authoring.state.currentStage}
          enabledStages={authoring.state.config.enabledStages}
          variant="compact"
          onStageClick={(stage) => authoring.goToStage(stage)}
          isStageComplete={(stage) => {
            const stageIndex = authoring.state.config.enabledStages.indexOf(stage);
            const currentIndex = authoring.state.config.enabledStages.indexOf(authoring.state.currentStage);
            return stageIndex < currentIndex;
          }}
          progress={{
            current: authoring.state.config.enabledStages.indexOf(authoring.state.currentStage) + 1,
            total: authoring.state.config.enabledStages.length,
            percentage: ((authoring.state.config.enabledStages.indexOf(authoring.state.currentStage) + 1) / authoring.state.config.enabledStages.length) * 100,
          }}
        />
      </div>

      {/* AI Routing Transparency (compact in edit view) */}
      <RoutingDecisionCard
        decision={routing.routingDecision || (() => {
          const contextQuery = castSession.session.approvedMessaging?.hook
            || castSession.session.selectedTemplate?.name
            || 'Generate marketing video content';
          try {
            return routing.analyzeQuery(contextQuery);
          } catch {
            return null;
          }
        })()}
        selectedModel={routing.selectedModel}
        onModelSelect={routing.selectModel}
        onOptimizationSelect={(type) => {
          if (type === 'cost') routing.selectCostOptimized();
          else if (type === 'quality') routing.selectQualityOptimized();
          else routing.selectSpeedOptimized();
        }}
        taskType="video"
        zone={detectTranscreationZone(selectedDialectCodes[0] || 'en-US')}
        showFallbackChain={true}
        compact={true}
      />

      {/* AI Scene Script Generator — Suggest -> Approve per scene */}
      <SceneScriptAIPanel
        mapping={authoring.state.templateMapping || null}
        messaging={castSession.session.approvedMessaging}
        capabilities={castSession.session.selectedStyles}
        product={selectedProductId || undefined}
        region={castSession.session.selectedRegion}
        language={castSession.session.selectedDialects?.[0]}
        onSceneUpdate={(sceneId, updates) => {
          authoring.updateSceneScript(sceneId, updates);
        }}
      />

      {/* Unified Script Editor — single-scene or multi-scene, shared with Mind */}
      <UnifiedScriptPanel
        editor={unifiedEditor}
        showVisualPrompt
        renderActions={(scene) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1"
              onClick={() => {
                toast.info(`Generating TTS preview for "${scene.title}"...`);
                authoring.generateTTSForScene(scene.id);
              }}
            >
              <Volume2 className="w-3 h-3" /> Generate TTS
            </Button>
            {scene.status !== 'approved' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1 text-green-600"
                onClick={() => unifiedEditor.approveScene(scene.id)}
              >
                Approve Scene
              </Button>
            )}
          </div>
        )}
      />

      {/* Script-to-Template Mapper */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            Scene-to-Script Mapping
          </CardTitle>
          <CardDescription>
            Align your scripts to template scenes with duration estimation and variable injection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authoring.state.templateMapping ? (
          <ScriptTemplateMapper
            mapping={authoring.state.templateMapping}
            onSceneUpdate={(sceneId, updates) => {
              console.log('[Studio] Scene updated:', sceneId, updates);
              authoring.updateSceneScript(sceneId, updates);
            }}
            onApproveAll={() => {
              console.log('[Studio] Approve all scenes');
              authoring.approveTemplateMapping();
              toast.success('All scenes approved');
            }}
            onGenerateTTS={async (sceneId) => {
              console.log('[Studio] TTS Preview requested:', sceneId);
              toast.info(`Generating TTS preview...`);
              return authoring.generateTTSForScene(sceneId);
            }}
            isProcessing={authoring.state.isProcessing}
          />
          ) : (
            <div className="flex items-center justify-center h-24 border border-dashed rounded-lg bg-muted/20 text-sm text-muted-foreground">
              Select a template in CREATE to populate scene mapping
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation vs Transcreation Toggle */}
      <TranslationTranscreationToggle
        sourceText={castSession.session.approvedMessaging?.mediumScript || ''}
        sourceLanguage="en"
        region={detectTranscreationZone(selectedDialectCodes[0] || '')}
        onResult={(result) => {
          console.log('[Studio] Translation/Transcreation result:', result.mode, result.targetLanguage);
          toast.success(`${result.mode === 'translate' ? 'Translation' : 'Transcreation'} complete: ${result.targetLanguage}`);
        }}
        compact
      />

      {/* A/V Sync Preview */}
      {authoring.state.templateMapping ? (
      <>
      <AVSyncPreview
        mapping={authoring.state.templateMapping}
        onPlayScene={(sceneId) => {
          console.log('[Studio] Play scene:', sceneId);
          toast.info(`Playing scene preview for ${sceneId}...`);
        }}
        onSeek={(time) => {
          console.log('[Studio] Seek to:', time);
        }}
        onSyncFix={(sceneId, action) => {
          console.log('[Studio] Sync fix:', sceneId, action);
          toast.info(`Applying ${action} to fix sync...`);
        }}
      />

      {/* P2: Live Generation Preview */}
      <LiveGenerationPreview
        mapping={authoring.state.templateMapping}
        styleIntent="product-hero"
        region={selectedDialectCodes[0]?.startsWith('ar-') ? 'mena' :
                ['zh-CN', 'ja-JP', 'ko-KR'].includes(selectedDialectCodes[0] || '') ? 'cjk' :
                ['hi-IN', 'te-IN'].includes(selectedDialectCodes[0] || '') ? 'india' : 'global'}
        language={selectedDialectCodes[0] || 'en-US'}
        onTTSComplete={(results) => {
          console.log('[Studio] TTS generation complete:', results.length, 'scenes');
          toast.success(`TTS complete for ${results.length} scenes`);
        }}
        onVideoComplete={(results) => {
          console.log('[Studio] Video preview complete:', results.length, 'thumbnails');
          toast.success(`Video previews generated: ${results.length}`);
        }}
        onAssemblyComplete={(videoUrl) => {
          console.log('[Studio] Video assembly complete:', videoUrl);
          castSession.goToStage('approval');
          toast.success('Full production complete! Ready for review.');
          setSubTab('produce', 'review');
        }}
        showAdvancedControls={true}
      />

      {/* Phase 6E: Production Mode Panel (B-022 + B-023) */}
      <ProductionModePanel
        selectedStyles={(castSession.session.selectedStyles || []) as any}
        settings={(castSession.session.productionSettings || getDefaultProductionSettings()) as any}
        onSettingsChange={(updates) => {
          const current = castSession.session.productionSettings || getDefaultProductionSettings();
          castSession.updateSession({ productionSettings: { ...current, ...updates } });
        }}
        selectedLanguage={selectedDialectCodes[0] || 'en-US'}
      />

      {/* Phase 6E: Production Timeline — driven by real pipeline state */}
      <ProductionTimeline
        phases={createTimelinePhases(
          deriveSceneRenderMode(castSession.session.selectedStyles?.[0] || 'smart_storytelling'),
        )}
        currentPhaseId={production.state.currentTask || null}
        overallProgress={production.state.progress}
        elapsedMs={production.state.startedAt ? Date.now() - new Date(production.state.startedAt).getTime() : 0}
        estimatedTotalMs={castSession.session.targetDuration * 3000}
      />

      {/* Phase 6E: Production Controls — wired to real pipeline */}
      <ProductionControlPanel
        productionState={production.state}
        onStart={async () => {
          const session = castSession.session;
          const enrichment = assembleEnrichmentContext(null, session.selectedRegion || 'en');
          const request = buildRequestFromCastSession(session, enrichment);
          toast.info('Starting production pipeline...');
          try {
            await production.startProduction({
              scriptContent: request.scriptContent,
              scriptTitle: request.scriptTitle,
              inputMode: request.scriptMode,
              intent: request.intent,
              selectedFormats: request.selectedFormats,
              inputLanguage: request.inputLanguage,
              outputLanguages: request.outputLanguages,
              videoStyles: request.videoStyles,
              scenario: request.scenario,
              sceneStyle: request.sceneStyle,
              quality: request.quality,
              avatarGender: request.avatarGender,
              includeMusic: request.includeMusic,
              includeCaptions: request.includeCaptions,
            });
            toast.success('Production complete!');
            setSubTab('produce', 'review');
          } catch (err) {
            toast.error('Production failed — check pipeline status');
          }
        }}
        onCancel={() => {
          production.cancelProduction();
          toast.info('Production cancelled');
        }}
        onReset={() => {
          production.resetProduction();
          toast.info('Production reset');
        }}
      />

      {/* P3: Scene-Aware Teleprompter — narration + visual script editing */}
      {productionSession.session.totalScenes > 0 && (
        <SceneAwareTeleprompter
          productionSession={productionSession}
          isPlaying={videoTimeline.state.isPlaying}
          onPlay={() => videoTimeline.play()}
          onPause={() => videoTimeline.pause()}
          onSeekToScene={(sceneIndex) => {
            const scenes = productionSession.session.scenes;
            let targetMs = 0;
            for (let i = 0; i < sceneIndex && i < scenes.length; i++) {
              targetMs += scenes[i].actualAudioDurationMs || scenes[i].scriptedDurationMs;
            }
            (videoTimeline as any).seek?.(targetMs) ?? videoTimeline.setPlayhead?.(targetMs);
          }}
          onRegenerateTTS={(sceneId) => {
            productionSession.regenerateSceneTTS?.(sceneId);
            toast.info(`Regenerating TTS for scene: ${sceneId}`);
          }}
          onRegenerateVideo={(sceneId) => {
            productionSession.regenerateSceneVideo?.(sceneId);
            toast.info(`Regenerating video for scene: ${sceneId}`);
          }}
          onRecordScene={(sceneId) => {
            toast.info(`Recording mode for scene: ${sceneId}`);
          }}
        />
      )}

      {/* Scene Progress Tracker — per-scene render status from production pipeline */}
      {production.state.scenes.length > 0 && (
        <SceneProgressTracker
          scenes={production.state.scenes.map((scene, idx) => ({
            sceneId: scene.sceneId,
            sceneIndex: idx,
            title: scene.scriptText?.slice(0, 40) || `Scene ${idx + 1}`,
            renderMode: deriveSceneRenderMode(castSession.session.selectedStyles?.[0] || 'smart_storytelling') as any,
            status: production.state.status === 'complete' ? 'complete' as const : 'pending' as const,
            progress: production.state.status === 'complete' ? 100 : 0,
            audioUrl: null,
            videoUrl: null,
            duration: scene.duration || 8,
            error: null,
          }))}
          productionState={production.state as any}
          onRetryScene={(sceneId) => {
            toast.info(`Retrying scene: ${sceneId}`);
          }}
          onPreviewScene={(sceneId) => {
            toast.info(`Previewing scene: ${sceneId}`);
          }}
        />
      )}

      {/* P2: A/V Sync Status + Pre-Render Validation */}
      {videoTimeline.stats.totalClips > 0 && (
        <Card className={cn(
          'border',
          avSync.syncReport.overallStatus === 'perfect' && 'border-emerald-400/30 bg-emerald-50/10',
          avSync.syncReport.overallStatus === 'acceptable' && 'border-blue-400/30 bg-blue-50/10',
          avSync.syncReport.overallStatus === 'needs_attention' && 'border-amber-400/30 bg-amber-50/10',
          avSync.syncReport.overallStatus === 'critical' && 'border-red-400/30 bg-red-50/10',
        )}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm font-medium">A/V Sync</span>
                <Badge variant={avSync.syncReport.isReadyForRender ? 'default' : 'destructive'} className="text-[9px]">
                  {avSync.syncReport.overallStatus.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {avSync.syncReport.alignedCount}/{avSync.syncReport.totalPairs} aligned
                </span>
                {avSync.syncReport.mismatchCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={avSync.autoFixAll}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Auto-fix {avSync.syncReport.mismatchCount} mismatch{avSync.syncReport.mismatchCount > 1 ? 'es' : ''}
                  </Button>
                )}
              </div>
            </div>
            {/* Pre-render validation */}
            {(() => {
              const validation = avSync.validateForRender();
              if (validation.errors.length === 0 && validation.warnings.length === 0) return null;
              return (
                <div className="space-y-1 mt-2">
                  {validation.errors.map((err, i) => (
                    <div key={`err-${i}`} className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      {err}
                    </div>
                  ))}
                  {validation.warnings.map((warn, i) => (
                    <div key={`warn-${i}`} className="text-[10px] text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      {warn}
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Universal Multi-Track Timeline Editor */}
      <VideoTimelineEditor
        timeline={videoTimeline}
        clipOps={clipOps}
        onImportFile={(file) => {
          const videoTrack = videoTimeline.state.tracks.find(t => t.type === 'primary_video');
          if (!videoTrack) return;
          const trackId = file.type.startsWith('audio/')
            ? (videoTimeline.state.tracks.find(t => t.type === 'audio_voice')?.id || videoTrack.id)
            : videoTrack.id;
          videoTimeline.importOfflineClip(
            trackId,
            file,
            videoTimeline.state.totalDurationMs,
            file.type.startsWith('image/') ? 5000 : 30000,
          );
          toast.success(`Imported: ${file.name}`);
        }}
      />
      </>
      ) : (
        <div className="flex items-center justify-center h-24 border border-dashed rounded-lg bg-muted/20 text-sm text-muted-foreground">
          Select a template in CREATE to enable A/V sync and live generation
        </div>
      )}

      {/* Next: Continue to Review */}
      <div className="flex justify-end mt-4">
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setSubTab('produce', 'review')}
        >
          Continue to Review
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ProduceEditStep;
