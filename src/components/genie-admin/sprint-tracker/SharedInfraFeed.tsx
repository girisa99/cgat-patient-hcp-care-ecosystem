// Sprint Tracker — Shared Infrastructure Change Feed
//
// Auto-surfaces bidirectional change alerts between Claude ↔ Lovable.
// No manual input required — changes auto-generate from task completions.
// Each dev sees only alerts that AFFECT them, with a clear "what you need to do".

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, Info, Zap, Brain, CheckCircle2,
  ArrowRight, FileCode, ChevronDown, ChevronRight,
  RefreshCw, Bell, BellOff, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SHARED_INFRA_CHANGES,
  getSicAcks,
  setSicAck,
} from './data-shared-infra';
import type { Developer } from './types';
import type { SharedInfraChange, ChangeImpact, ChangeCategory } from './data-shared-infra';

// ─── Config ───────────────────────────────────────────────────────────────────

const IMPACT_CFG: Record<ChangeImpact, { label: string; icon: typeof AlertTriangle; cls: string; dot: string; rowBg: string }> = {
  breaking:  { label: 'BREAKING',  icon: AlertTriangle, cls: 'text-destructive bg-destructive/5 border-destructive/30', dot: 'bg-destructive',  rowBg: 'bg-destructive/5 border-destructive/20' },
  attention: { label: 'Attention', icon: AlertTriangle, cls: 'text-amber-700 bg-amber-50 border-amber-200',              dot: 'bg-amber-400',   rowBg: 'bg-amber-50/20 border-amber-200' },
  info:      { label: 'Info',      icon: Info,          cls: 'text-primary bg-primary/5 border-primary/20',              dot: 'bg-primary/60',  rowBg: 'bg-primary/5 border-primary/10' },
};

const CATEGORY_LABELS: Record<ChangeCategory, string> = {
  route: '🔗 Route', schema: '🗄 Schema', hook: '🪝 Hook',
  service: '⚙️ Service', config: '⚙️ Config', component: '🧩 Component',
  type: '📐 Type', auth: '🔐 Auth', navigation: '🧭 Nav',
};

const DEV_CFG = {
  claude:  { label: 'Claude',  Icon: Brain, cls: 'text-violet-600', tagCls: 'bg-violet-100 text-violet-700 border-violet-300' },
  lovable: { label: 'Lovable', Icon: Zap,   cls: 'text-pink-600',   tagCls: 'bg-pink-100 text-pink-700 border-pink-300' },
} as const;

// ─── Single change row ────────────────────────────────────────────────────────

function ChangeRow({
  change, viewAs, ackMap, onAck,
}: {
  change: SharedInfraChange;
  viewAs: Developer;
  ackMap: Record<string, { ackedAt: string }>;
  onAck: (id: string) => void;
}) {
  const [open, setOpen] = useState(change.impact === 'breaking');

  const ic     = IMPACT_CFG[change.impact];
  const ImpIcon = ic.icon;
  const from   = DEV_CFG[change.changedBy];
  const FromIcon = from.Icon;
  const impactMsg = change.impactOn[viewAs];
  const isAcked = !!ackMap[change.id];
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Show if: change affects viewAs OR was made by viewAs (their own log)
  const showRow = !!impactMsg || change.changedBy === viewAs;
  if (!showRow) return null;

  return (
    <div className={cn('rounded border text-xs overflow-hidden', ic.rowBg, isAcked && 'opacity-60')}>
      {/* Row header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black/5 transition-colors text-left"
      >
        {/* Impact dot + badge */}
        <span className={cn('w-2 h-2 rounded-full shrink-0', ic.dot)} />
        <span className={cn('text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 uppercase tracking-wide', ic.cls)}>
          {ic.label}
        </span>

        {/* Changed by */}
        <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0', from.tagCls)}>
          <FromIcon className="w-2.5 h-2.5 inline mr-0.5" />
          {from.label}
        </span>

        {/* Category */}
        <span className="text-[9px] text-muted-foreground shrink-0 hidden sm:block">
          {CATEGORY_LABELS[change.category]}
        </span>

        {/* What changed */}
        <span className="flex-1 min-w-0 truncate text-foreground font-medium">{change.what}</span>

        {/* Impact pill — shown for other dev */}
        {impactMsg && change.changedBy !== viewAs && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-foreground/10 text-foreground shrink-0 hidden md:block">
            Affects You
          </span>
        )}

        {/* Ack button or status */}
        {impactMsg && change.changedBy !== viewAs && !isAcked && (
          <button
            onClick={(e) => { e.stopPropagation(); onAck(change.id); }}
            className="text-[9px] font-bold px-2 py-0.5 rounded border border-green-400/50 bg-green-50 text-green-700 hover:bg-green-100 shrink-0 transition-colors"
          >
            ✓ Got it
          </button>
        )}
        {isAcked && (
          <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
        )}

        <span className="text-[9px] text-muted-foreground shrink-0">{fmtDate(change.timestamp)}</span>
        {open ? <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />}
      </button>

      {/* Expanded */}
      {open && (
        <div className="px-4 pb-3 pt-1 space-y-2 border-t border-border/20 bg-background/50">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">What Changed</p>
              <p className="text-[10px]">{change.what}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Why</p>
              <p className="text-[10px]">{change.why}</p>
            </div>
          </div>

          {/* File */}
          <div className="flex items-center gap-1">
            <FileCode className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="font-mono text-[9px] text-muted-foreground">{change.file}</span>
            {change.taskId && (
              <span className="ml-2 font-mono text-[8px] bg-muted border border-border px-1 py-0.5 rounded">{change.taskId}</span>
            )}
          </div>

          {/* Breaking detail */}
          {change.breakingDetail && (
            <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-destructive/5 border border-destructive/20">
              <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-destructive uppercase tracking-wide">Breaking — Action Required</p>
                <p className="text-[10px] text-destructive/80 mt-0.5">{change.breakingDetail}</p>
              </div>
            </div>
          )}

          {/* How to use */}
          {change.howToUse && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">How to Use</p>
              <p className="text-[10px] font-mono bg-muted border border-border/50 px-2 py-1 rounded">{change.howToUse}</p>
            </div>
          )}

          {/* Impact on each dev */}
          <div className="grid sm:grid-cols-2 gap-2 mt-1">
            {(['claude', 'lovable'] as Developer[]).map(dev => {
              const msg = change.impactOn[dev];
              const cfg = DEV_CFG[dev];
              const Icon = cfg.Icon;
              if (!msg) return (
                <div key={dev} className="flex items-center gap-1.5 text-[9px] text-muted-foreground/50">
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{cfg.label}: No action needed</span>
                </div>
              );
              return (
                <div key={dev} className={cn(
                  'flex items-start gap-1.5 px-2 py-1.5 rounded border text-[9px]',
                  dev === 'claude' ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-pink-50 border-pink-200 text-pink-800',
                )}>
                  <Icon className="w-3 h-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5">{cfg.label}:</p>
                    <p className="leading-relaxed">{msg}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ack confirmation */}
          {isAcked && (
            <p className="text-[9px] text-green-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Acknowledged at {new Date(ackMap[change.id].ackedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Auto-standup summary builder ─────────────────────────────────────────────
// Generates a full standup narrative from changes + task status (no manual input)

export function buildAutoStandupFromChanges(
  day: number,
  dev: Developer,
  changes: SharedInfraChange[],
): { yesterday: string; today: string; blockers: string } {
  const myChanges = changes.filter(c => c.changedBy === dev);
  const affectsMe = changes.filter(c => c.changedBy !== dev && c.impactOn[dev]);
  const breaking  = affectsMe.filter(c => c.impact === 'breaking');

  const yesterday = myChanges.length > 0
    ? `Completed Day ${day} work:\n` + myChanges.map(c => `• ${c.what} (${c.taskId ?? 'misc'})`).join('\n')
    : `No shared infrastructure changes made on Day ${day}.`;

  const today = affectsMe.length > 0
    ? `Monitoring ${affectsMe.length} cross-dev change${affectsMe.length > 1 ? 's' : ''} that affect my work:\n` +
      affectsMe.map(c => `• [${c.impact.toUpperCase()}] ${c.what} — from ${DEV_CFG[c.changedBy].label}`).join('\n')
    : 'No cross-dev changes to monitor.';

  const blockers = breaking.length > 0
    ? breaking.map(c => `BREAKING from ${DEV_CFG[c.changedBy].label}: ${c.breakingDetail ?? c.what}`).join('\n')
    : 'None';

  return { yesterday, today, blockers };
}

// ─── Main SharedInfraFeed component ──────────────────────────────────────────

interface SharedInfraFeedProps {
  day: number;
  /** If set, shows alerts filtered for this developer's perspective */
  viewAs?: Developer;
}

export const SharedInfraFeed: React.FC<SharedInfraFeedProps> = ({ day, viewAs = 'claude' }) => {
  const [ackMap, setAckMap] = useState(getSicAcks);
  const [devFilter, setDevFilter] = useState<Developer | 'all'>('all');
  const [impactFilter, setImpactFilter] = useState<ChangeImpact | 'all'>('all');
  const [showAcked, setShowAcked] = useState(false);

  const handleAck = (id: string) => {
    setSicAck(id);
    setAckMap(getSicAcks());
  };

  // Filter changes
  const allChanges = SHARED_INFRA_CHANGES;
  const filtered = allChanges.filter(c => {
    if (devFilter !== 'all' && c.changedBy !== devFilter) return false;
    if (impactFilter !== 'all' && c.impact !== impactFilter) return false;
    if (!showAcked && ackMap[c.id]) return false;
    return true;
  });

  const breaking  = allChanges.filter(c => c.impact === 'breaking' && !ackMap[c.id]).length;
  const attention = allChanges.filter(c => c.impact === 'attention' && !ackMap[c.id]).length;
  const unackedAffectingMe = allChanges.filter(c =>
    c.changedBy !== viewAs && c.impactOn[viewAs] && !ackMap[c.id]
  ).length;

  return (
    <section className="rounded-lg border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/40">
        <RefreshCw className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Shared Infrastructure Changes</span>
        <span className="text-[10px] text-muted-foreground">— Auto-populated · both devs see everything</span>

        {/* Alert counters */}
        <div className="ml-auto flex items-center gap-1.5">
          {breaking > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
              <AlertTriangle className="w-2.5 h-2.5" /> {breaking} breaking
            </span>
          )}
          {attention > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {attention} attention
            </span>
          )}
          {unackedAffectingMe > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              <Bell className="w-2.5 h-2.5" /> {unackedAffectingMe} need your ack
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/10 border-b border-border/30 flex-wrap">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">View as:</span>
        {(['claude', 'lovable'] as Developer[]).map(dev => {
          const cfg = DEV_CFG[dev];
          const Icon = cfg.Icon;
          return (
            <button
              key={dev}
              onClick={() => {}}  // viewAs is a prop — shows impact from that perspective
              className={cn(
                'flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors',
                viewAs === dev
                  ? dev === 'claude' ? 'bg-violet-100 border-violet-300 text-violet-700' : 'bg-pink-100 border-pink-300 text-pink-700'
                  : 'bg-muted border-border text-muted-foreground',
              )}
            >
              <Icon className="w-2.5 h-2.5" /> {cfg.label}
            </button>
          );
        })}
        <span className="text-muted-foreground/30">|</span>

        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Changed by:</span>
        {(['all', 'claude', 'lovable'] as const).map(f => (
          <button key={f} onClick={() => setDevFilter(f)}
            className={cn(
              'text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors',
              devFilter === f ? 'bg-foreground/10 border-border text-foreground' : 'text-muted-foreground border-transparent hover:border-border',
            )}
          >
            {f === 'all' ? 'All' : DEV_CFG[f].label}
          </button>
        ))}
        <span className="text-muted-foreground/30">|</span>

        {(['all', 'breaking', 'attention', 'info'] as const).map(f => (
          <button key={f} onClick={() => setImpactFilter(f)}
            className={cn(
              'text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors capitalize',
              impactFilter === f
                ? f === 'breaking' ? 'bg-red-100 border-red-300 text-red-700'
                  : f === 'attention' ? 'bg-amber-100 border-amber-200 text-amber-700'
                  : f === 'info' ? 'bg-blue-100 border-blue-200 text-blue-700'
                  : 'bg-foreground/10 border-border text-foreground'
                : 'text-muted-foreground border-transparent hover:border-border',
            )}
          >
            {f === 'all' ? 'All Impacts' : f}
          </button>
        ))}

        <button
          onClick={() => setShowAcked(s => !s)}
          className={cn(
            'ml-auto flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border transition-colors',
            showAcked ? 'bg-muted border-border text-foreground' : 'text-muted-foreground border-transparent hover:border-border',
          )}
        >
          {showAcked ? <Eye className="w-2.5 h-2.5" /> : <BellOff className="w-2.5 h-2.5" />}
          {showAcked ? 'Hiding acked' : 'Show acked'}
        </button>
      </div>

      {/* How it works explanation (only when empty) */}
      {filtered.length === 0 && (
        <div className="px-4 py-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {showAcked || allChanges.length === 0
              ? 'No shared infrastructure changes to show.'
              : 'All changes acknowledged ✓'}
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Changes auto-populate here when Claude or Lovable completes tasks that touch shared files.
            No manual input needed.
          </p>
        </div>
      )}

      {/* Change list */}
      {filtered.length > 0 && (
        <div className="p-3 space-y-2">
          {/* Unread banner */}
          {unackedAffectingMe > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-blue-50 border border-blue-200 text-[10px] text-blue-800">
              <Bell className="w-3 h-3 shrink-0" />
              <span className="font-semibold">{unackedAffectingMe} change{unackedAffectingMe > 1 ? 's' : ''} from the other dev need your acknowledgment</span>
              <ArrowRight className="w-3 h-3 shrink-0 ml-1" />
              <span>Click "✓ Got it" on each to confirm you've seen it</span>
            </div>
          )}

          {filtered.map(change => (
            <ChangeRow
              key={change.id}
              change={change}
              viewAs={viewAs}
              ackMap={ackMap}
              onAck={handleAck}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border/30 bg-muted/5">
        {(['breaking', 'attention', 'info'] as ChangeImpact[]).map(imp => {
          const ic = IMPACT_CFG[imp];
          const Icon = ic.icon;
          return (
            <div key={imp} className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className={cn('w-1.5 h-1.5 rounded-full', ic.dot)} />
              <span className="capitalize font-medium">{imp}</span>
              <span className="hidden sm:block">
                {imp === 'breaking' ? '— other dev must act' : imp === 'attention' ? '— review recommended' : '— FYI only'}
              </span>
            </div>
          );
        })}
        <span className="ml-auto text-[9px] text-muted-foreground">{allChanges.length} total changes</span>
      </div>
    </section>
  );
};
