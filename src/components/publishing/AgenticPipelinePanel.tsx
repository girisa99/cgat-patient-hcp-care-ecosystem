/**
 * AgenticPipelinePanel — 8-Agent Pipeline Visualization & Content Review
 *
 * Shows real-time progress through CreativeDirector → Scriptwriter → VisualDesigner
 * → QualityReviewer → VoiceoverAgent → AudioMixAgent → TranscreationAgent → PublishCoordinator.
 * Displays visual style rotation, structured scripts, and approve/reject actions.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, CheckCircle, XCircle, Clock, Play, ThumbsUp,
  ThumbsDown, Globe, Eye, Palette, Sparkles, Bot, Mic, Music,
  Film, Layers, Gauge, Clapperboard,
} from 'lucide-react';
import { useAgenticAutoPublish } from '@/hooks/publishing/useAgenticAutoPublish';
import type { AgentRole, AgentStatus, AgenticContentContext } from '@/services/publishing/agenticContentOrchestrator';
import { AGENT_PIPELINE_ORDER, AGENT_LABELS } from '@/services/publishing/agenticContentOrchestrator';
import type { AutoPublishContentItem } from '@/services/publishing/autoPublishContentEngine';
import { executeProduction } from '@/services/publishing/agenticProductionBridge';
import type { AgenticProductionBridgeConfig, AgenticProductionResult, AgenticProductionPlan } from '@/services/publishing/agenticProductionBridge';
import type { ContentFormatId } from '@/types/publishing';
import { toast } from 'sonner';

// ─── Agent Status Icon ──────────────────────────────────────────────

function AgentStatusIcon({ status }: { status: AgentStatus }) {
  switch (status) {
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

function agentStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'running': return 'border-blue-500 bg-blue-500/10';
    case 'completed': return 'border-green-500 bg-green-500/10';
    case 'error': return 'border-red-500 bg-red-500/10';
    default: return 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
  }
}

// ─── Pipeline Visualization ─────────────────────────────────────────

function PipelineVisualizer({
  agentProgress,
  agentTimings,
}: {
  agentProgress: Record<AgentRole, AgentStatus>;
  agentTimings?: Record<AgentRole, number>;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {AGENT_PIPELINE_ORDER.map((agent, idx) => (
        <React.Fragment key={agent}>
          <div
            className={`flex flex-col items-center rounded-lg border-2 p-3 min-w-[110px] transition-all ${agentStatusColor(agentProgress[agent])}`}
          >
            <AgentStatusIcon status={agentProgress[agent]} />
            <span className="text-xs font-medium mt-1 text-center leading-tight">
              {AGENT_LABELS[agent]}
            </span>
            {agentTimings && agentTimings[agent] > 0 && (
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {(agentTimings[agent] / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          {idx < AGENT_PIPELINE_ORDER.length - 1 && (
            <span className="text-muted-foreground text-lg flex-shrink-0">&rarr;</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Visual Style Rotation Preview ──────────────────────────────────

function StyleRotationPreview({
  currentStyle,
  upcomingStyles,
}: {
  currentStyle: { label: string; styleFamily: string };
  upcomingStyles: Array<{ label: string; styleFamily: string }>;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Palette className="h-4 w-4 text-purple-500" />
      <span className="text-muted-foreground">Visual Style Rotation:</span>
      <div className="flex items-center gap-1.5">
        {[currentStyle, ...upcomingStyles.slice(1, 4)].map((style, idx) => (
          <React.Fragment key={style.styleFamily + idx}>
            <Badge
              variant={idx === 0 ? 'default' : 'outline'}
              className={idx === 0 ? 'bg-purple-600' : ''}
            >
              {idx === 0 && <span className="mr-1">●</span>}
              {style.label}
            </Badge>
            {idx < 3 && <span className="text-muted-foreground">&rarr;</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Structured Script Display ──────────────────────────────────────

function StructuredScriptCard({ item }: { item: AutoPublishContentItem }) {
  const script = item.structuredScript;
  if (!script) return null;

  const sections = [
    { label: 'Hook', value: script.hook, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Problem', value: script.problem, color: 'text-red-600 dark:text-red-400' },
    { label: 'Transformation', value: script.transformation, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Solution', value: script.solution, color: 'text-green-600 dark:text-green-400' },
    { label: 'CTA', value: script.cta, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-2 mt-2">
      {sections.map(({ label, value, color }) => (
        <div key={label} className="flex gap-2">
          <span className={`text-xs font-bold min-w-[100px] ${color}`}>{label}:</span>
          <span className="text-xs text-muted-foreground">{value}</span>
        </div>
      ))}
      {script.fictitiousName && (
        <div className="flex gap-2 mt-1">
          <span className="text-xs font-bold min-w-[100px] text-gray-500">Business:</span>
          <span className="text-xs text-muted-foreground">&ldquo;{script.fictitiousName}&rdquo;</span>
        </div>
      )}
    </div>
  );
}

// ─── Content Item Card ──────────────────────────────────────────────

function AgenticContentCard({
  item,
  onApprove,
  onReject,
  onTranscreate,
}: {
  item: AutoPublishContentItem;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onTranscreate: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<AgenticProductionResult | null>(null);

  const handleExecuteProduction = async () => {
    if (!item.productionPlan) return;
    setIsRendering(true);
    try {
      const bridgeConfig: AgenticProductionBridgeConfig = {
        sourceProduct: 'cast',
        regionCode: 'NAM',
        language: 'en',
        quality: 'production',
        enableCollaterals: true,
        enableQualityGate: true,
        outputPresets: ['1080p', 'vertical_9_16'],
      };
      // Build typed context from item data for production execution
      const ctx: Partial<AgenticContentContext> & { batchId: string; planId: string; itemIndex: number } = {
        batchId: item.itemId,
        planId: item.itemId,
        itemIndex: 0,
        script: item.structuredScript ? {
          hook: item.structuredScript.hook,
          problem: item.structuredScript.problem,
          transformation: item.structuredScript.transformation,
          solution: item.structuredScript.solution,
          cta: item.structuredScript.cta,
          fictitiousName: item.structuredScript.fictitiousName ?? '',
          industry: item.industry as any,
          productHighlight: 'cast' as any,
          estimatedDurationSec: item.productionPlan.totalTargetDurationSec,
        } : undefined,
        productionPlan: item.productionPlan ? {
          productionId: item.productionPlan.blueprintId,
          resolvedFormat: item.productionPlan.resolvedFormat as ContentFormatId,
        } as Partial<AgenticProductionPlan> as AgenticProductionPlan : undefined,
      };
      const result = await executeProduction(ctx as AgenticContentContext, bridgeConfig);
      setRenderResult(result);
      toast.success(`Production ${result.status}: ${Object.keys(result.exportUrls).length} exports`);
    } catch (err) {
      toast.error('Production failed — see logs');
    } finally {
      setIsRendering(false);
    }
  };

  const archetypeLabel = item.archetype.replace(/_/g, ' ');
  const industryLabel = item.industry.replace(/_/g, ' ');

  return (
    <Card className="border">
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">{archetypeLabel}</Badge>
              <Badge variant="outline" className="text-xs capitalize">{industryLabel}</Badge>
              {item.visualStyle && (
                <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950">
                  <Palette className="h-3 w-3 mr-1" />
                  {item.visualStyle.family}
                </Badge>
              )}
              {item.qualityScore != null && (
                <Badge
                  variant={item.qualityScore >= 85 ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {item.qualityScore}/100
                </Badge>
              )}
              {item.voiceoverDirection && (
                <Badge variant="outline" className="text-xs bg-cyan-50 dark:bg-cyan-950">
                  <Mic className="h-3 w-3 mr-1" />
                  {item.voiceoverDirection.provider} ({item.voiceoverDirection.totalDurationSec}s)
                </Badge>
              )}
              {item.audioMixDirection && (
                <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950">
                  <Music className="h-3 w-3 mr-1" />
                  {item.audioMixDirection.musicGenre} {item.audioMixDirection.musicBpm}bpm
                </Badge>
              )}
              {item.productionPlan && (
                <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700">
                  <Film className="h-3 w-3 mr-1" />
                  {item.productionPlan.sceneCount} scenes &middot; {item.productionPlan.resolvedFormat.replace(/_/g, ' ')}
                </Badge>
              )}
              {item.productionPlan && (
                <Badge variant="default" className="text-xs bg-emerald-600">
                  <Layers className="h-3 w-3 mr-1" />
                  Production Ready
                </Badge>
              )}
              <Badge
                variant={
                  item.status === 'approved' ? 'default'
                  : item.status === 'rejected' ? 'destructive'
                  : 'secondary'
                }
                className="text-xs capitalize"
              >
                {item.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm font-medium mt-2">{item.titleEN}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Structured script (always shown for agentic items) */}
        {item.structuredScript && <StructuredScriptCard item={item} />}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <div className="text-xs text-muted-foreground">
              <strong>Voice:</strong> {item.voiceCharacter.replace(/_/g, ' ')} |{' '}
              <strong>Tone:</strong> {item.tone} |{' '}
              <strong>Format:</strong> {item.template}
            </div>
            {/* Voiceover details */}
            {item.voiceoverDirection && (
              <div className="text-xs text-muted-foreground bg-cyan-50/50 dark:bg-cyan-950/50 rounded p-2">
                <Mic className="h-3 w-3 inline mr-1" />
                <strong>TTS:</strong> {item.voiceoverDirection.provider} |{' '}
                <strong>Voice:</strong> {item.voiceoverDirection.voiceId} ({item.voiceoverDirection.voiceGender}) |{' '}
                <strong>Duration:</strong> {item.voiceoverDirection.totalDurationSec}s |{' '}
                <strong>Sections:</strong> {item.voiceoverDirection.sectionCount} |{' '}
                <strong>SSML:</strong> {item.voiceoverDirection.ssmlEnabled ? 'Yes' : 'No'}
              </div>
            )}
            {/* Audio mix details */}
            {item.audioMixDirection && (
              <div className="text-xs text-muted-foreground bg-orange-50/50 dark:bg-orange-950/50 rounded p-2">
                <Music className="h-3 w-3 inline mr-1" />
                <strong>Music:</strong> {item.audioMixDirection.musicGenre} @ {item.audioMixDirection.musicBpm} BPM |{' '}
                <strong>Tracks:</strong> {item.audioMixDirection.trackCount} |{' '}
                <strong>SFX:</strong> {item.audioMixDirection.sfxCount} |{' '}
                <strong>Ducking:</strong> {item.audioMixDirection.ducking ? 'On' : 'Off'} |{' '}
                <strong>Export:</strong> {item.audioMixDirection.exportFormat.toUpperCase()}
              </div>
            )}
            {/* Production plan details */}
            {item.productionPlan && (
              <div className="text-xs text-muted-foreground bg-emerald-50/50 dark:bg-emerald-950/50 rounded p-2">
                <Film className="h-3 w-3 inline mr-1" />
                <strong>Production:</strong> {item.productionPlan.sceneCount} scenes |{' '}
                <strong>Format:</strong> {item.productionPlan.resolvedFormat.replace(/_/g, ' ')} |{' '}
                <strong>Chunking:</strong> {item.productionPlan.chunkingStrategy.replace(/_/g, ' ')} |{' '}
                <strong>Duration:</strong> {item.productionPlan.totalTargetDurationSec}s |{' '}
                <strong>Blueprint:</strong> {item.productionPlan.blueprintId.slice(0, 12)}...
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <strong>Transcreations:</strong> {Object.keys(item.transcreations).length} regions
            </div>
            <div className="flex flex-wrap gap-1">
              {item.hashtags.map(tag => (
                <span key={tag} className="text-[10px] text-blue-500">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {item.status === 'pending_review' && (
          <div className="flex items-center gap-2 mt-3 border-t pt-3">
            <Button
              size="sm"
              variant="default"
              onClick={() => onApprove(item.itemId)}
              className="bg-green-600 hover:bg-green-700"
            >
              <ThumbsUp className="h-3 w-3 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTranscreate(item.itemId)}
            >
              <Globe className="h-3 w-3 mr-1" /> Transcreate
            </Button>
            {item.productionPlan && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleExecuteProduction}
                disabled={isRendering}
                className="border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950"
              >
                {isRendering ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Rendering...</>
                ) : (
                  <><Clapperboard className="h-3 w-3 mr-1" /> Execute Production</>
                )}
              </Button>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Input
                placeholder="Reason..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="h-8 text-xs w-32"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => { onReject(item.itemId, rejectReason); setRejectReason(''); }}
                disabled={!rejectReason}
              >
                <ThumbsDown className="h-3 w-3 mr-1" /> Reject
              </Button>
            </div>
          </div>
        )}
        {/* Render result badge */}
        {renderResult && (
          <div className="mt-2 text-xs bg-emerald-50/50 dark:bg-emerald-950/50 rounded p-2">
            <Clapperboard className="h-3 w-3 inline mr-1" />
            <strong>Render:</strong> {renderResult.status} |{' '}
            <strong>Quality:</strong> {renderResult.qualityGate.score}/100 |{' '}
            <strong>Exports:</strong> {Object.keys(renderResult.exportUrls).length} |{' '}
            <strong>Collaterals:</strong> {renderResult.collaterals.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────

export interface AgenticPipelinePanelProps {
  className?: string;
}

export function AgenticPipelinePanel({ className }: AgenticPipelinePanelProps) {
  const {
    isOrchestrating,
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
  } = useAgenticAutoPublish();

  const [qualityTarget, setQualityTarget] = useState(config.qualityTarget);

  const pendingCount = contentItems.filter(i => i.status === 'pending_review').length;
  const approvedCount = contentItems.filter(i => i.status === 'approved').length;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Agentic Content Pipeline</CardTitle>
              {currentWeekStyle && (
                <Badge className="bg-purple-600 text-xs">
                  Week {currentWeekStyle.weekNumber}: {currentWeekStyle.label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Quality Target:</span>
                <Input
                  type="number"
                  min={50}
                  max={100}
                  value={qualityTarget}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setQualityTarget(val);
                    updateConfig({ qualityTarget: val });
                  }}
                  className="h-7 w-16 text-xs"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <Button
                onClick={() => generateAgenticBatch()}
                disabled={isOrchestrating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isOrchestrating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Orchestrating... ({progress.completedItems}/{progress.totalItems})
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Agentic Batch
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pipeline Visualization */}
          <PipelineVisualizer
            agentProgress={progress.agentProgress}
            agentTimings={batchResult?.agentTimings}
          />

          {/* Visual Style Rotation */}
          {currentWeekStyle && (
            <StyleRotationPreview
              currentStyle={currentWeekStyle}
              upcomingStyles={upcomingStyles}
            />
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Batch Summary */}
          {batchResult && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Batch: {batchResult.items.length} items
              </span>
              <span className="text-muted-foreground">
                Quality: <strong className={overallQualityScore >= 85 ? 'text-green-600' : 'text-amber-600'}>
                  {overallQualityScore}/100
                </strong>
              </span>
              <span className="text-muted-foreground">
                Time: {(batchResult.totalDurationMs / 1000).toFixed(1)}s
              </span>
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending review</Badge>
              )}
              {approvedCount > 0 && (
                <>
                  <Badge variant="default" className="bg-green-600">{approvedCount} approved</Badge>
                  <Button size="sm" variant="outline" onClick={publishApproved}>
                    Publish Approved ({approvedCount})
                  </Button>
                </>
              )}
            </div>
          )}

          <Separator />

          {/* Content Items */}
          {contentItems.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Generated Items ({contentItems.length})</h3>
              {contentItems.map(item => (
                <AgenticContentCard
                  key={item.itemId}
                  item={item}
                  onApprove={approveItem}
                  onReject={rejectItem}
                  onTranscreate={transcreateItem}
                />
              ))}
            </div>
          ) : !isOrchestrating ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click &ldquo;Generate Agentic Batch&rdquo; to run the 8-agent pipeline</p>
              <p className="text-xs mt-1">
                8 agents collaborate: Creative Director, Scriptwriter, Visual Designer, Quality Reviewer, Voiceover/TTS, Audio Mix, Transcreation, Publish
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default AgenticPipelinePanel;
