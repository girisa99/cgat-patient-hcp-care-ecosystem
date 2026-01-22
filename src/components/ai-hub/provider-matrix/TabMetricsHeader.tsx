/**
 * Tab-Specific Metrics Header - ALIGNED & CONSISTENT V3
 * 
 * ALIGNMENT RULES (FIXED):
 * 1. BASE METRICS (Features, Providers, LLMs) = SAME across ALL boxes
 * 2. SCENARIOS/USE CASES: 
 *    - Feature Matrix = base count
 *    - Cross-Functional = NEW only (not in Feature Matrix)
 *    - Gen Coverage = NEW only (not in Feature Matrix OR Cross-Functional)
 *    - Total = DEDUPLICATED unique count (NOT additive)
 * 3. Gen Coverage shows CONTEXT counts (Industries, Frameworks, Visuals, Outputs)
 * 4. Gaps/Opportunities track missing implementations
 */

import React, { useMemo } from 'react';
import { Check, Zap, Layers, Target, Info, ArrowRight } from 'lucide-react';
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
  // CONSISTENT BASE METRICS - Same across ALL cards
  // ============================================
  const BASE = {
    features: metrics.features.total,
    providers: metrics.providers.implemented,
    llms: metrics.llms.forCategory,
    implemented: metrics.features.implemented,
    partial: metrics.features.partial,
    notStarted: metrics.features.notStarted,
  };

  // ============================================
  // SCENARIOS - Breakdown showing NEW vs TOTAL
  // ============================================
  const SCENARIOS = {
    base: metrics.scenarios.fromFeatureUseCases,        // From Feature Matrix
    newFromCross: metrics.scenarios.fromCrossFunctional, // NEW in Cross-Functional
    newFromGen: metrics.scenarios.fromGenerationCoverage, // NEW in Gen Coverage
    total: metrics.scenarios.total,                      // DEDUPLICATED total
  };

  // ============================================
  // USE CASES - Breakdown showing NEW vs TOTAL
  // ============================================
  const USECASES = {
    base: metrics.useCases.fromFeatureUseCases,          // From Feature Matrix
    newFromCross: metrics.useCases.fromCrossFunctional,   // NEW in Cross-Functional
    newFromGen: metrics.useCases.fromGenerationCoverage,  // NEW in Gen Coverage
    total: metrics.useCases.total,                        // DEDUPLICATED total
  };

  // ============================================
  // CONTEXT COUNTS (Gen Coverage specific)
  // ============================================
  const CONTEXT = {
    industries: coverageStats.industries,
    frameworks: coverageStats.frameworks,
    visuals: coverageStats.visuals,
    outputs: coverageStats.outputs,
  };

  // ============================================
  // GAPS & OPPORTUNITIES
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
      </div>

      {/* 4-Column Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* FEATURE MATRIX - Base Implementation */}
        <MetricCard
          icon={<Check className="h-3 w-3 text-emerald-500" />}
          title="Feature Matrix"
          subtitle="Base implementation"
          borderColor="border-emerald-500/40"
          bgColor="bg-emerald-500/5"
          hoverColor="hover:bg-emerald-500/10"
          isActive={true}
          onClick={() => onTabChange?.('matrix')}
        >
          <Row label="Features" value={BASE.features} bold />
          <Row label="Providers" value={BASE.providers} />
          <Row label="LLMs" value={BASE.llms} />
          <Divider />
          <Row label="Scenarios" value={SCENARIOS.base} />
          <Row label="Use Cases" value={USECASES.base} />
          <Divider />
          <Row label="✓ Implemented" value={BASE.implemented} type="success" />
          <Row label="◐ Partial" value={BASE.partial} type="warning" />
          <Row label="○ Not Started" value={BASE.notStarted} type="muted" />
        </MetricCard>

        {/* CROSS-FUNCTIONAL - Dependencies & Links */}
        <MetricCard
          icon={<Zap className="h-3 w-3 text-purple-500" />}
          title="Cross-Functional"
          subtitle="Dependencies & links"
          borderColor="border-purple-500/40"
          bgColor="bg-purple-500/5"
          hoverColor="hover:bg-purple-500/10"
          onClick={() => onTabChange?.('crossfunc')}
        >
          <Row label="Features" value={BASE.features} muted />
          <Row label="Providers" value={BASE.providers} muted />
          <Row label="LLMs" value={BASE.llms} muted />
          <Divider />
          <Row label="+Scenarios" value={SCENARIOS.newFromCross} type="new" tooltip="New scenarios identified in cross-functional analysis" />
          <Row label="+Use Cases" value={USECASES.newFromCross} type="new" tooltip="New use cases from cross-functional mapping" />
          <Divider />
          <Row label="Dependencies" value={metrics.gaps.features.length} type="dependency" />
          <Row label="Enhances" value={metrics.opportunities.potentialProviders.length} type="opportunity" />
        </MetricCard>

        {/* GENERATION COVERAGE - Context Mappings */}
        <MetricCard
          icon={<Layers className="h-3 w-3 text-blue-500" />}
          title="Gen Coverage"
          subtitle="Context mappings"
          borderColor="border-blue-500/40"
          bgColor="bg-blue-500/5"
          hoverColor="hover:bg-blue-500/10"
          onClick={() => onTabChange?.('coverage')}
        >
          <Row label="Industries" value={CONTEXT.industries} bold />
          <Row label="Frameworks" value={CONTEXT.frameworks} bold />
          <Row label="Visuals" value={CONTEXT.visuals} bold />
          <Row label="Outputs" value={CONTEXT.outputs} bold />
          <Divider />
          <Row label="+Scenarios" value={SCENARIOS.newFromGen} type="new" tooltip="New scenarios from context analysis" />
          <Row label="+Use Cases" value={USECASES.newFromGen} type="new" tooltip="New use cases from context analysis" />
          <Divider />
          <Row label="Models" value={coverageStats.models} />
        </MetricCard>

        {/* TOTAL - Unified Deduplicated */}
        <MetricCard
          icon={<Target className="h-3 w-3 text-primary" />}
          title="Total"
          subtitle="Unified (deduplicated)"
          borderColor="border-primary/40"
          bgColor="bg-primary/5"
          hoverColor="hover:bg-primary/10"
          onClick={() => onTabChange?.('gaps')}
        >
          <Row label="Features" value={BASE.features} bold />
          <Row label="Providers" value={BASE.providers} bold />
          <Row label="LLMs" value={BASE.llms} bold />
          <Divider />
          <Row label="Scenarios" value={SCENARIOS.total} bold tooltip="Deduplicated unique scenarios" />
          <Row label="Use Cases" value={USECASES.total} bold tooltip="Deduplicated unique use cases" />
          <Divider />
          <Row label="Gaps" value={STATUS.gaps} type="error" />
          <Row label="Opportunities" value={STATUS.opportunities} type="opportunity" />
          <Row label="Coverage" value={`${STATUS.coverage}%`} type={STATUS.coverage >= 80 ? 'success' : STATUS.coverage >= 50 ? 'warning' : 'error'} />
        </MetricCard>
      </div>

      {/* Formula Breakdown - Shows the math */}
      <div className="text-[9px] text-muted-foreground border-t border-border/50 pt-2">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1">
            <strong>Scenarios:</strong>
            <span className="text-emerald-500">{SCENARIOS.base}</span>
            <span className="text-muted-foreground/50">+</span>
            <span className="text-purple-500">{SCENARIOS.newFromCross}</span>
            <span className="text-muted-foreground/50">+</span>
            <span className="text-blue-500">{SCENARIOS.newFromGen}</span>
            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50" />
            <strong className="text-primary">{SCENARIOS.total}</strong>
            <span className="text-muted-foreground/30">(deduplicated)</span>
          </div>
          <div className="flex items-center gap-1">
            <strong>Use Cases:</strong>
            <span className="text-emerald-500">{USECASES.base}</span>
            <span className="text-muted-foreground/50">+</span>
            <span className="text-purple-500">{USECASES.newFromCross}</span>
            <span className="text-muted-foreground/50">+</span>
            <span className="text-blue-500">{USECASES.newFromGen}</span>
            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50" />
            <strong className="text-primary">{USECASES.total}</strong>
            <span className="text-muted-foreground/30">(deduplicated)</span>
          </div>
        </div>
        <div className="flex gap-4 mt-1.5">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Base (Feature Matrix)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> +New (Cross-Func)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> +New (Gen Coverage)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Total (Unique)</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// METRIC CARD COMPONENT
// ============================================

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  borderColor: string;
  bgColor: string;
  hoverColor: string;
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  subtitle,
  borderColor,
  bgColor,
  hoverColor,
  isActive,
  onClick,
  children
}) => (
  <div 
    className={`p-2 rounded-lg border ${borderColor} ${bgColor} ${hoverColor} cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/50">
      {icon}
      <div className="min-w-0">
        <div className="text-[10px] font-semibold truncate leading-tight">{title}</div>
        <div className="text-[8px] text-muted-foreground truncate">{subtitle}</div>
      </div>
    </div>
    <div className="space-y-0.5 mt-2">
      {children}
    </div>
  </div>
);

// ============================================
// ROW COMPONENT
// ============================================

const Row: React.FC<{ 
  label: string; 
  value: string | number; 
  bold?: boolean; 
  muted?: boolean;
  type?: 'success' | 'warning' | 'error' | 'new' | 'dependency' | 'opportunity' | 'muted';
  tooltip?: string;
}> = ({ label, value, bold, muted, type, tooltip }) => {
  let valueClass = 'text-[10px] font-medium tabular-nums';
  
  if (type === 'success') valueClass += ' text-emerald-500';
  else if (type === 'warning') valueClass += ' text-amber-500';
  else if (type === 'error') valueClass += ' text-destructive';
  else if (type === 'new') valueClass += ' text-blue-500';
  else if (type === 'dependency') valueClass += ' text-purple-500';
  else if (type === 'opportunity') valueClass += ' text-blue-500';
  else if (type === 'muted' || muted) valueClass += ' text-muted-foreground/50';
  else if (bold) valueClass += ' text-foreground font-semibold';
  else valueClass += ' text-muted-foreground';

  return (
    <div className="flex items-center justify-between" title={tooltip}>
      <span className={`text-[8px] ${muted || type === 'muted' ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
};

// ============================================
// DIVIDER COMPONENT
// ============================================

const Divider: React.FC = () => <div className="h-px bg-border/30 my-1" />;

export default TabMetricsHeader;
