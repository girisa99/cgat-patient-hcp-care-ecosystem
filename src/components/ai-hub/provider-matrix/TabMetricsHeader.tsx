/**
 * Tab-Specific Metrics Header - ALIGNED & CONSISTENT
 * 
 * CRITICAL ALIGNMENT RULES:
 * - BASE METRICS (Features, Providers, LLMs) are IDENTICAL across all sources
 * - SCENARIOS & USE CASES: Feature Matrix shows base, others show +NEW only
 * - TOTAL = Base + All NEW (must equal individual breakdowns sum)
 * - Generation Coverage shows CONTEXT counts (Industries, Frameworks, etc.)
 */

import React, { useMemo } from 'react';
import { Check, Zap, Layers, Target, Info, AlertTriangle } from 'lucide-react';
import { calculateUnifiedMetrics, getGenerationCoverageStatsForCategory } from './generation-coverage/unifiedMetricsEngine';
import { CROSS_FUNCTIONAL_MAPPINGS, FEATURE_USE_CASES, ALL_FEATURES, FEATURE_IMPLEMENTATION_MATRIX } from './matrixData';
import type { FeatureCategory } from './types';

export type TabView = 'matrix' | 'category' | 'crossfunc' | 'coverage' | 'providers' | 'llm' | 'gaps';

interface TabMetricsHeaderProps {
  activeTab: TabView;
  selectedCategory: FeatureCategory | 'all';
  localFeatures?: typeof ALL_FEATURES;
  localMatrix?: typeof FEATURE_IMPLEMENTATION_MATRIX;
  onTabChange?: (tab: TabView) => void;
}

export const TabMetricsHeader: React.FC<TabMetricsHeaderProps> = ({
  activeTab,
  selectedCategory,
  localFeatures = ALL_FEATURES,
  localMatrix = FEATURE_IMPLEMENTATION_MATRIX,
  onTabChange
}) => {
  // Get unified metrics from single source of truth
  const metrics = useMemo(() => {
    return calculateUnifiedMetrics(selectedCategory, localMatrix);
  }, [selectedCategory, localMatrix]);

  // Get generation coverage context stats
  const coverageStats = useMemo(() => {
    return getGenerationCoverageStatsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Only show on matrix tab
  if (activeTab !== 'matrix') return null;

  // ============================================
  // BASE METRICS - Same across ALL sources
  // ============================================
  const BASE = {
    features: metrics.features.total,
    providers: metrics.providers.implemented,
    llms: metrics.llms.forCategory,
    implemented: metrics.features.implemented,
    partial: metrics.features.partial,
    gaps: metrics.features.notStarted,
  };

  // ============================================
  // SCENARIOS BREAKDOWN (additive check)
  // ============================================
  const SCENARIOS = {
    fromFeatureMatrix: metrics.scenarios.fromFeatureUseCases,
    newFromCrossFunc: metrics.scenarios.fromCrossFunctional,
    newFromGenCov: metrics.scenarios.fromGenerationCoverage,
    total: metrics.scenarios.total, // Deduplicated
  };

  // Verify: base + new1 + new2 should equal total (or close due to dedup)
  const scenarioSum = SCENARIOS.fromFeatureMatrix + SCENARIOS.newFromCrossFunc + SCENARIOS.newFromGenCov;
  const scenarioMismatch = scenarioSum !== SCENARIOS.total;

  // ============================================
  // USE CASES BREAKDOWN (additive check)
  // ============================================
  const USECASES = {
    fromFeatureMatrix: metrics.useCases.fromFeatureUseCases,
    newFromCrossFunc: metrics.useCases.fromCrossFunctional,
    newFromGenCov: metrics.useCases.fromGenerationCoverage,
    total: metrics.useCases.total, // Deduplicated
  };

  const useCaseSum = USECASES.fromFeatureMatrix + USECASES.newFromCrossFunc + USECASES.newFromGenCov;
  const useCaseMismatch = useCaseSum !== USECASES.total;

  // ============================================
  // CONTEXT COVERAGE (Generation Coverage specific)
  // ============================================
  const CONTEXT = {
    industries: coverageStats.industries,
    frameworks: coverageStats.frameworks,
    visuals: coverageStats.visuals,
    outputs: coverageStats.outputs,
  };

  // ============================================
  // STATUS METRICS
  // ============================================
  const STATUS = {
    gaps: metrics.gaps.total,
    opportunities: metrics.opportunities.total,
    coverage: metrics.coverage,
  };

  const categoryLabel = selectedCategory === 'all' ? 'All Categories' : selectedCategory;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>Metrics for <strong className="text-primary">{categoryLabel}</strong></span>
        </div>
        {(scenarioMismatch || useCaseMismatch) && (
          <div className="flex items-center gap-1 text-amber-500">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-[9px]">Dedup applied</span>
          </div>
        )}
      </div>

      {/* 4-Column Grid: Feature Matrix | Cross-Functional | Gen Coverage | Total */}
      <div className="grid grid-cols-4 gap-2">
        {/* FEATURE MATRIX */}
        <div 
          className="p-2 rounded-lg border border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer ring-2 ring-primary transition-all"
          onClick={() => onTabChange?.('matrix')}
        >
          <CardHeader icon={<Check className="h-3 w-3 text-emerald-500" />} title="Feature Matrix" sub="Base implementation" />
          <div className="space-y-0.5 mt-2">
            <Row label="Features" value={BASE.features} bold />
            <Row label="Providers" value={BASE.providers} />
            <Row label="LLMs" value={BASE.llms} />
            <Divider />
            <Row label="Scenarios" value={SCENARIOS.fromFeatureMatrix} />
            <Row label="Use Cases" value={USECASES.fromFeatureMatrix} />
            <Divider />
            <Row label="Implemented" value={BASE.implemented} type="success" />
            <Row label="Partial" value={BASE.partial} type="warning" />
            <Row label="Gaps" value={BASE.gaps} type="error" />
          </div>
        </div>

        {/* CROSS-FUNCTIONAL */}
        <div 
          className="p-2 rounded-lg border border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all"
          onClick={() => onTabChange?.('crossfunc')}
        >
          <CardHeader icon={<Zap className="h-3 w-3 text-purple-500" />} title="Cross-Functional" sub="Dependencies & links" />
          <div className="space-y-0.5 mt-2">
            <Row label="Features" value={BASE.features} muted />
            <Row label="Providers" value={BASE.providers} muted />
            <Row label="LLMs" value={BASE.llms} muted />
            <Divider />
            <Row label="+Scenarios" value={SCENARIOS.newFromCrossFunc} type="new" />
            <Row label="+Use Cases" value={USECASES.newFromCrossFunc} type="new" />
            <Divider />
            <Row label="Dependencies" value={metrics.gaps.features.length} type="dependency" />
            <Row label="Enhances" value={metrics.opportunities.potentialProviders.length} type="opportunity" />
            <Row label="—" value="" />
          </div>
        </div>

        {/* GENERATION COVERAGE */}
        <div 
          className="p-2 rounded-lg border border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer transition-all"
          onClick={() => onTabChange?.('coverage')}
        >
          <CardHeader icon={<Layers className="h-3 w-3 text-blue-500" />} title="Gen Coverage" sub="Context mappings" />
          <div className="space-y-0.5 mt-2">
            <Row label="Industries" value={CONTEXT.industries} bold />
            <Row label="Frameworks" value={CONTEXT.frameworks} bold />
            <Row label="Visuals" value={CONTEXT.visuals} bold />
            <Row label="Outputs" value={CONTEXT.outputs} bold />
            <Divider />
            <Row label="+Scenarios" value={SCENARIOS.newFromGenCov} type="new" />
            <Row label="+Use Cases" value={USECASES.newFromGenCov} type="new" />
            <Divider />
            <Row label="Models" value={coverageStats.models} />
          </div>
        </div>

        {/* TOTAL - UNIFIED */}
        <div 
          className="p-2 rounded-lg border border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-all"
          onClick={() => onTabChange?.('gaps')}
        >
          <CardHeader icon={<Target className="h-3 w-3 text-primary" />} title="Total" sub="Unified (deduplicated)" />
          <div className="space-y-0.5 mt-2">
            <Row label="Features" value={BASE.features} bold />
            <Row label="Providers" value={BASE.providers} bold />
            <Row label="LLMs" value={BASE.llms} bold />
            <Divider />
            <Row label="Scenarios" value={SCENARIOS.total} bold />
            <Row label="Use Cases" value={USECASES.total} bold />
            <Divider />
            <Row label="Gaps" value={STATUS.gaps} type="error" />
            <Row label="Opportunities" value={STATUS.opportunities} type="opportunity" />
            <Row label="Coverage" value={`${STATUS.coverage}%`} type={STATUS.coverage >= 80 ? 'success' : STATUS.coverage >= 50 ? 'warning' : 'error'} />
          </div>
        </div>
      </div>

      {/* Formula Breakdown */}
      <div className="text-[9px] text-muted-foreground border-t border-border/50 pt-2 space-y-1">
        <div className="flex flex-wrap gap-4">
          <span>
            <strong>Scenarios:</strong> {SCENARIOS.fromFeatureMatrix} (base) + {SCENARIOS.newFromCrossFunc} (cross) + {SCENARIOS.newFromGenCov} (gen) = <strong className="text-primary">{SCENARIOS.total}</strong> total
          </span>
          <span>
            <strong>Use Cases:</strong> {USECASES.fromFeatureMatrix} (base) + {USECASES.newFromCrossFunc} (cross) + {USECASES.newFromGenCov} (gen) = <strong className="text-primary">{USECASES.total}</strong> total
          </span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Implemented</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Gap</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> New/Opportunity</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Dependency</span>
        </div>
      </div>
    </div>
  );
};

// Card header component
const CardHeader: React.FC<{ icon: React.ReactNode; title: string; sub: string }> = ({ icon, title, sub }) => (
  <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/50">
    {icon}
    <div className="min-w-0">
      <div className="text-[10px] font-semibold truncate leading-tight">{title}</div>
      <div className="text-[8px] text-muted-foreground truncate">{sub}</div>
    </div>
  </div>
);

// Row component for metrics
const Row: React.FC<{ 
  label: string; 
  value: string | number; 
  bold?: boolean; 
  muted?: boolean;
  type?: 'success' | 'warning' | 'error' | 'new' | 'dependency' | 'opportunity';
}> = ({ label, value, bold, muted, type }) => {
  if (label === '—') return <div className="h-2" />;
  
  let valueClass = 'text-[10px] font-medium tabular-nums';
  
  if (type === 'success') valueClass += ' text-emerald-500';
  else if (type === 'warning') valueClass += ' text-amber-500';
  else if (type === 'error') valueClass += ' text-destructive';
  else if (type === 'new') valueClass += ' text-blue-500';
  else if (type === 'dependency') valueClass += ' text-purple-500';
  else if (type === 'opportunity') valueClass += ' text-blue-500';
  else if (muted) valueClass += ' text-muted-foreground/50';
  else if (bold) valueClass += ' text-foreground font-semibold';
  else valueClass += ' text-muted-foreground';

  return (
    <div className="flex items-center justify-between">
      <span className={`text-[8px] ${muted ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
};

// Divider component
const Divider: React.FC = () => <div className="h-px bg-border/30 my-1" />;

export default TabMetricsHeader;
