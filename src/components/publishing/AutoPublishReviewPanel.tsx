/**
 * AutoPublishReviewPanel — Internal review/approval dashboard
 * for AskGenie auto-generated creative content marketing.
 *
 * Shows pending review, approved, and published content items.
 * Supports generate, approve/reject, transcreate, and publish workflows.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2, Sparkles, Check, X, Globe, Send, Calendar,
  Filter, ChevronDown, ChevronUp, Eye, Edit3, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAutoPublishDashboard } from '@/hooks/publishing/useAutoPublishDashboard';
import type { AutoPublishContentItem } from '@/services/publishing/autoPublishContentEngine';
import { toast } from 'sonner';
import { AgenticPipelinePanel } from './AgenticPipelinePanel';

// ─── Archetype icons ──────────────────────────────────────────────────────

const ARCHETYPE_ICONS: Record<string, string> = {
  product_showcase: '\uD83C\uDFAC',
  tip_of_the_day: '\uD83D\uDCA1',
  how_it_works: '\uD83D\uDD27',
  before_after: '\u2728',
  industry_spotlight: '\uD83D\uDD26',
  behind_the_scenes: '\uD83C\uDFAD',
  user_story: '\uD83D\uDCDA',
  comparison: '\u2696\uFE0F',
  breaking_news_style: '\uD83D\uDCE1',
  entertainment_promo: '\uD83C\uDF89',
  thought_leadership: '\uD83E\uDDE0',
  quick_demo: '\u26A1',
  seasonal_contextual: '\uD83C\uDF1F',
  faq_explainer: '\u2753',
  regional_showcase: '\uD83C\uDF0D',
  journey_map: '\uD83D\uDDFA\uFE0F',
  infographic_stat: '\uD83D\uDCCA',
  emotional_narrative: '\uD83D\uDC9C',
  humor_sketch: '\uD83D\uDE02',
  mini_documentary: '\uD83C\uDFA5',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  pending_review: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  published: 'bg-blue-500/20 text-blue-400',
  scheduled: 'bg-purple-500/20 text-purple-400',
};

// ─── Component ────────────────────────────────────────────────────────────

interface AutoPublishReviewPanelProps {
  compact?: boolean;
  className?: string;
}

export const AutoPublishReviewPanel: React.FC<AutoPublishReviewPanelProps> = ({
  compact = false,
  className,
}) => {
  const [isAgenticMode, setIsAgenticMode] = useState(false);
  const dash = useAutoPublishDashboard();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleApprove = (item: AutoPublishContentItem) => {
    dash.approveItem(item.itemId);
    toast.success(`Approved: ${item.titleEN}`);
  };

  const handleReject = (item: AutoPublishContentItem) => {
    const reason = rejectReasons[item.itemId] || 'Rejected';
    dash.rejectItem(item.itemId, reason);
    toast.info(`Rejected: ${item.titleEN}`);
  };

  const handleTranscreate = async (item: AutoPublishContentItem) => {
    toast.info('Transcreating to all regions...');
    await dash.transcreateItem(item.itemId);
    toast.success(`Transcreated: ${item.titleEN} to 16 regions`);
  };

  const handlePublishAll = async () => {
    const results = await dash.publishApproved();
    toast.success(`Published ${results.length} items`);
  };

  const handleTranscreateAll = async () => {
    toast.info('Transcreating all approved items...');
    await dash.transcreateAll();
    toast.success('All approved items transcreated');
  };

  // ─── Compact mode (for AskGenie embed) ──────────────────────────────

  if (compact) {
    return (
      <Card className={cn('border-white/10 bg-card/80 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Auto-Publisher</CardTitle>
            <Badge variant="outline" className="text-xs">
              {dash.pendingReview.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={dash.generateNewBatch}
            disabled={dash.isGenerating}
          >
            {dash.isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Generate New Batch
          </Button>
          {dash.pendingReview.slice(0, 3).map(item => (
            <div key={item.itemId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
              <span className="truncate flex-1">
                {ARCHETYPE_ICONS[item.archetype] || '\uD83D\uDCDD'} {item.titleEN}
              </span>
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleApprove(item)}>
                  <Check className="h-3 w-3 text-green-400" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleReject(item)}>
                  <X className="h-3 w-3 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
          {dash.pendingReview.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{dash.pendingReview.length - 3} more items
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── Full mode ──────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mode Toggle: Standard / Agentic */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setIsAgenticMode(false)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            !isAgenticMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Standard
        </button>
        <button
          onClick={() => setIsAgenticMode(true)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            isAgenticMode ? 'bg-purple-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Agentic AI
        </button>
      </div>

      {/* Agentic mode: render AgenticPipelinePanel */}
      {isAgenticMode ? (
        <AgenticPipelinePanel />
      ) : (
      <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Auto-Publisher — Content Review Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Generate, review, and publish creative content across all segments and regions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Cadence: Every
            <input
              type="number"
              min={1}
              max={30}
              value={dash.cadenceDays}
              onChange={e => dash.setCadenceDays(Number(e.target.value) || 2)}
              className="w-10 h-6 text-center text-xs rounded border border-white/10 bg-white/5"
            />
            days
          </div>
          <Button
            size="sm"
            onClick={dash.generateNewBatch}
            disabled={dash.isGenerating}
            className="gap-2"
          >
            {dash.isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Generate New Batch
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-3 w-3" />
          Filters
          {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        {(['pending_review', 'approved', 'published', 'rejected'] as const).map(status => (
          <Badge
            key={status}
            className={cn(
              'cursor-pointer text-xs',
              dash.statusFilter === status ? STATUS_COLORS[status] : 'bg-white/5 text-muted-foreground',
            )}
            onClick={() => dash.filterByStatus(status)}
          >
            {status.replace('_', ' ')} ({dash.allItems.filter(i => i.status === status).length})
          </Badge>
        ))}
      </div>

      {showFilters && (
        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <p className="text-xs font-semibold mb-1">Industry</p>
                <div className="flex flex-wrap gap-1">
                  {['healthcare_pharma', 'travel_hospitality', 'pet_industry', 'education_edtech', 'entertainment_media', 'patient_access'].map(ind => (
                    <Badge
                      key={ind}
                      className={cn('cursor-pointer text-[10px]', dash.industryFilter === ind ? 'bg-primary/20 text-primary' : 'bg-white/5')}
                      onClick={() => dash.filterByIndustry(ind as any)}
                    >
                      {ind.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Archetype</p>
                <div className="flex flex-wrap gap-1">
                  {['product_showcase', 'tip_of_the_day', 'journey_map', 'humor_sketch', 'emotional_narrative', 'infographic_stat'].map(arch => (
                    <Badge
                      key={arch}
                      className={cn('cursor-pointer text-[10px]', dash.archetypeFilter === arch ? 'bg-primary/20 text-primary' : 'bg-white/5')}
                      onClick={() => dash.filterByArchetype(arch as any)}
                    >
                      {ARCHETYPE_ICONS[arch]} {arch.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Items */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-3">
          {dash.contentItems.length === 0 && (
            <Card className="border-white/10 bg-card/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No content yet</p>
                <p className="text-xs mt-1">Click "Generate New Batch" to create diverse content across all segments</p>
              </CardContent>
            </Card>
          )}

          {dash.contentItems.map(item => (
            <ContentItemCard
              key={item.itemId}
              item={item}
              isExpanded={expandedItems.has(item.itemId)}
              onToggleExpand={() => toggleExpand(item.itemId)}
              onApprove={() => handleApprove(item)}
              onReject={() => handleReject(item)}
              onTranscreate={() => handleTranscreate(item)}
              rejectReason={rejectReasons[item.itemId] || ''}
              onRejectReasonChange={v => setRejectReasons(prev => ({ ...prev, [item.itemId]: v }))}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Approved Actions */}
      {dash.approved.length > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-400">
                  Approved — Ready to Publish ({dash.approved.length} items)
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={handleTranscreateAll}>
                  <Globe className="h-3 w-3" /> Transcreate All
                </Button>
                <Button size="sm" className="gap-1" onClick={handlePublishAll}>
                  <Send className="h-3 w-3" /> Publish All Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Published Stats */}
      {dash.published.length > 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-3">
            <p className="text-sm text-blue-400">
              Published (last 30 days) — {dash.published.length} items
            </p>
          </CardContent>
        </Card>
      )}
      </>
      )}
    </div>
  );
};

// ─── Content Item Card ──────────────────────────────────────────────────

interface ContentItemCardProps {
  item: AutoPublishContentItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApprove: () => void;
  onReject: () => void;
  onTranscreate: () => void;
  rejectReason: string;
  onRejectReasonChange: (v: string) => void;
}

const ContentItemCard: React.FC<ContentItemCardProps> = ({
  item,
  isExpanded,
  onToggleExpand,
  onApprove,
  onReject,
  onTranscreate,
  rejectReason,
  onRejectReasonChange,
}) => {
  const icon = ARCHETYPE_ICONS[item.archetype] || '\uD83D\uDCDD';
  const archetypeLabel = item.archetype.replace(/_/g, ' ');
  const industryLabel = item.industry.replace(/_/g, ' ');
  const voiceLabel = item.voiceCharacter.replace(/_/g, ' ');
  const toneLabel = item.tone?.replace(/_/g, ' ') || '';
  const templateLabel = item.template?.replace(/_/g, ' ') || '';
  const transcreationCount = Object.keys(item.transcreations || {}).length;

  return (
    <Card className={cn('border-white/10 bg-card/60 transition-all', isExpanded && 'ring-1 ring-primary/30')}>
      <CardContent className="p-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggleExpand}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{icon}</span>
              <span className="text-sm font-semibold capitalize">{archetypeLabel}</span>
              <span className="text-sm text-muted-foreground">—</span>
              <span className="text-sm">{item.titleEN}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className="text-[10px] bg-white/5">Voice: {voiceLabel}</Badge>
              <Badge className="text-[10px] bg-white/5">Industry: {industryLabel}</Badge>
              <Badge className="text-[10px] bg-white/5">Format: {item.format.replace(/_/g, ' ')}</Badge>
              {toneLabel && <Badge className="text-[10px] bg-white/5">Tone: {toneLabel}</Badge>}
              {templateLabel && <Badge className="text-[10px] bg-white/5">Template: {templateLabel}</Badge>}
              <Badge className={cn('text-[10px]', STATUS_COLORS[item.status])}>
                {item.status.replace('_', ' ')}
              </Badge>
              {transcreationCount > 0 && (
                <Badge className="text-[10px] bg-teal-500/20 text-teal-400">
                  {transcreationCount} regions
                </Badge>
              )}
              {item.qualityScore != null && (
                <Badge className={cn('text-[10px]', item.qualityScore >= 85 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400')}>
                  Quality: {item.qualityScore}/100
                </Badge>
              )}
              {item.visualStyle && (
                <Badge className="text-[10px] bg-purple-500/20 text-purple-400">
                  Style: {item.visualStyle.family}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onToggleExpand}>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
            {/* Structured Script (if present from agentic pipeline) */}
            {item.structuredScript && (
              <div className="bg-white/5 rounded-lg p-3 space-y-1.5">
                {([
                  { label: 'Hook', key: 'hook' as const, color: 'text-amber-400' },
                  { label: 'Problem', key: 'problem' as const, color: 'text-red-400' },
                  { label: 'Transformation', key: 'transformation' as const, color: 'text-blue-400' },
                  { label: 'Solution', key: 'solution' as const, color: 'text-green-400' },
                  { label: 'CTA', key: 'cta' as const, color: 'text-purple-400' },
                ] as const).map(({ label, key, color }) => (
                  <div key={key} className="flex gap-2">
                    <span className={cn('text-xs font-bold min-w-[100px]', color)}>{label}:</span>
                    <span className="text-xs text-muted-foreground">{item.structuredScript![key]}</span>
                  </div>
                ))}
                {item.structuredScript.fictitiousName && (
                  <div className="flex gap-2 mt-1 pt-1 border-t border-white/5">
                    <span className="text-xs font-bold min-w-[100px] text-gray-400">Business:</span>
                    <span className="text-xs text-muted-foreground">&ldquo;{item.structuredScript.fictitiousName}&rdquo;</span>
                  </div>
                )}
              </div>
            )}
            <div className="bg-white/5 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground leading-relaxed">{item.bodyEN}</p>
              <p className="mt-2 text-xs text-primary">{item.ctaEN}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.hashtags.map(tag => (
                  <span key={tag} className="text-[10px] text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            {(item.status === 'draft' || item.status === 'pending_review') && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="gap-1 text-green-400 border-green-500/30" onClick={onApprove}>
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Textarea
                    placeholder="Reject reason..."
                    value={rejectReason}
                    onChange={e => onRejectReasonChange(e.target.value)}
                    className="h-8 text-xs min-h-0 resize-none"
                  />
                  <Button size="sm" variant="outline" className="gap-1 text-red-400 border-red-500/30 flex-shrink-0" onClick={onReject}>
                    <X className="h-3 w-3" /> Reject
                  </Button>
                </div>
                <Button size="sm" variant="outline" className="gap-1" onClick={onTranscreate}>
                  <Globe className="h-3 w-3" /> Transcreate
                </Button>
              </div>
            )}

            {item.status === 'approved' && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={onTranscreate}>
                  <Globe className="h-3 w-3" /> Transcreate to All Regions
                </Button>
              </div>
            )}

            {/* Transcreation preview */}
            {transcreationCount > 0 && (
              <div className="bg-teal-500/5 rounded-lg p-2">
                <p className="text-xs font-semibold text-teal-400 mb-1">
                  Transcreations ({transcreationCount})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {Object.entries(item.transcreations).slice(0, 8).map(([key, val]) => (
                    <div key={key} className="text-[10px] p-1 rounded bg-white/5 truncate">
                      <span className="font-mono text-muted-foreground">{key}</span>
                      {val.isRTL && <span className="ml-1 text-amber-400">[RTL]</span>}
                    </div>
                  ))}
                  {transcreationCount > 8 && (
                    <div className="text-[10px] p-1 rounded bg-white/5 text-muted-foreground">
                      +{transcreationCount - 8} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoPublishReviewPanel;
