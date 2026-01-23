/**
 * Tab-Specific Metrics Header - V4 with User Explainer
 * 
 * ALIGNMENT RULES:
 * 1. BASE METRICS (Features, Providers, LLMs) = SAME across ALL boxes
 * 2. SCENARIOS/USE CASES with clear derivation:
 *    - Feature Matrix = base count (defined per feature)
 *    - Cross-Functional = +NEW only (discovered via dependencies)
 *    - Gen Coverage = +NEW only (discovered via industry/framework mapping)
 *    - Total = DEDUPLICATED unique count
 * 3. Users can EXPAND to see WHY numbers differ
 */

import React, { useMemo, useState } from 'react';
import { 
  Check, Zap, Layers, Target, Info, ArrowRight, 
  HelpCircle, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { calculateUnifiedMetrics, getGenerationCoverageStatsForCategory } from './generation-coverage/unifiedMetricsEngine';
import { CROSS_FUNCTIONAL_MAPPINGS, FEATURE_USE_CASES, ALL_FEATURES, FEATURE_IMPLEMENTATION_MATRIX } from './matrixData';
import type { FeatureCategory } from './types';
import { MetricsExplainer } from './MetricsExplainer';

export type TabView = 'matrix' | 'category' | 'crossfunc' | 'coverage' | 'providers' | 'llm' | 'gaps' | 'pipeline' | 'ecosystem' | 'priority' | 'blockers';

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
    base: metrics.scenarios.fromFeatureUseCases,
    newFromCross: metrics.scenarios.fromCrossFunctional,
    newFromGen: metrics.scenarios.fromGenerationCoverage,
    total: metrics.scenarios.total,
  };

  // ============================================
  // USE CASES - Breakdown showing NEW vs TOTAL
  // ============================================
  const USECASES = {
    base: metrics.useCases.fromFeatureUseCases,
    newFromCross: metrics.useCases.fromCrossFunctional,
    newFromGen: metrics.useCases.fromGenerationCoverage,
    total: metrics.useCases.total,
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

  // Calculate if numbers align (for user clarity)
  const scenarioSum = SCENARIOS.base + SCENARIOS.newFromCross + SCENARIOS.newFromGen;
  const useCaseSum = USECASES.base + USECASES.newFromCross + USECASES.newFromGen;
  const scenarioDupes = scenarioSum - SCENARIOS.total;
  const useCaseDupes = useCaseSum - USECASES.total;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>Metrics for <strong className="text-primary">{categoryLabel}</strong></span>
        </div>
        <div className="text-[9px] text-muted-foreground/70">
          Numbers are consistent • Click cards to navigate
        </div>
      </div>

      {/* 4-Column Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* FEATURE MATRIX - Base Implementation */}
        <MetricCard
          icon={<Check className="h-3 w-3 text-emerald-500" />}
          title="Feature Matrix"
          subtitle="Base definitions"
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
          <Row label="Scenarios" value={SCENARIOS.base} highlight="emerald" tooltip="Base scenarios defined per feature" />
          <Row label="Use Cases" value={USECASES.base} highlight="emerald" tooltip="Base use cases defined per feature" />
          <Divider />
          <Row label="✓ Impl" value={BASE.implemented} type="success" />
          <Row label="◐ Part" value={BASE.partial} type="warning" />
          <Row label="○ Not" value={BASE.notStarted} type="muted" />
        </MetricCard>

        {/* CROSS-FUNCTIONAL - Dependencies & Links */}
        <MetricCard
          icon={<Zap className="h-3 w-3 text-purple-500" />}
          title="Cross-Functional"
          subtitle="Via dependencies"
          borderColor="border-purple-500/40"
          bgColor="bg-purple-500/5"
          hoverColor="hover:bg-purple-500/10"
          onClick={() => onTabChange?.('crossfunc')}
        >
          <Row label="Features" value={BASE.features} muted />
          <Row label="Providers" value={BASE.providers} muted />
          <Row label="LLMs" value={BASE.llms} muted />
          <Divider />
          <Row 
            label="Deps" 
            value={metrics.gaps.features.length} 
            type="dependency"
            tooltip="Feature dependencies requiring orchestration"
          />
          <Row 
            label="Links" 
            value={metrics.opportunities.potentialProviders.length} 
            type="opportunity"
            tooltip="Cross-functional provider connections"
          />
        </MetricCard>

        {/* GENERATION COVERAGE - Context Mappings */}
        <MetricCard
          icon={<Layers className="h-3 w-3 text-blue-500" />}
          title="Gen Coverage"
          subtitle="Context analysis"
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
          <Row 
            label="Combos" 
            value={CONTEXT.industries + CONTEXT.frameworks + CONTEXT.visuals + CONTEXT.outputs} 
            bold
            tooltip="Total context combinations: Industry × Framework × Visual × Output permutations for generation"
          />
        </MetricCard>

        {/* TOTAL - Unified Deduplicated */}
        <MetricCard
          icon={<Target className="h-3 w-3 text-primary" />}
          title="Total"
          subtitle="Deduplicated"
          borderColor="border-primary/40"
          bgColor="bg-primary/5"
          hoverColor="hover:bg-primary/10"
          onClick={() => onTabChange?.('gaps')}
        >
          <Row label="Features" value={BASE.features} bold />
          <Row label="Providers" value={BASE.providers} bold />
          <Row label="LLMs" value={BASE.llms} bold />
          <Divider />
          <Row 
            label="Scenarios" 
            value={SCENARIOS.total} 
            bold 
            tooltip={`${SCENARIOS.total} unique scenarios (${scenarioDupes} duplicates removed)`}
          />
          <Row 
            label="Use Cases" 
            value={USECASES.total} 
            bold 
            tooltip={`${USECASES.total} unique use cases (${useCaseDupes} duplicates removed)`}
          />
          <Divider />
          <Row label="Gaps" value={STATUS.gaps} type="error" />
          <Row label="Opps" value={STATUS.opportunities} type="opportunity" />
          <Row label="Cover" value={`${STATUS.coverage}%`} type={STATUS.coverage >= 80 ? 'success' : STATUS.coverage >= 50 ? 'warning' : 'error'} />
        </MetricCard>
      </div>

      {/* Visual Derivation Formula with Color Coding */}
      <div className="bg-muted/30 rounded-lg p-2 space-y-2">
        {/* Scenarios Flow */}
        <div className="flex items-center gap-1 text-[9px]">
          <span className="font-medium w-16">Scenarios:</span>
          <FlowBadge color="emerald" value={SCENARIOS.base} label="Base" />
          <span className="text-muted-foreground">+</span>
          <FlowBadge color="purple" value={SCENARIOS.newFromCross} label="+Cross" isNew />
          <span className="text-muted-foreground">+</span>
          <FlowBadge color="blue" value={SCENARIOS.newFromGen} label="+Gen" isNew />
          <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
          <FlowBadge color="primary" value={SCENARIOS.total} label="Unique" isTotal />
          {scenarioDupes > 0 && (
            <span className="text-[8px] text-muted-foreground ml-1">
              ({scenarioDupes} dupes removed)
            </span>
          )}
        </div>

        {/* Use Cases Flow */}
        <div className="flex items-center gap-1 text-[9px]">
          <span className="font-medium w-16">Use Cases:</span>
          <FlowBadge color="emerald" value={USECASES.base} label="Base" />
          <span className="text-muted-foreground">+</span>
          <FlowBadge color="purple" value={USECASES.newFromCross} label="+Cross" isNew />
          <span className="text-muted-foreground">+</span>
          <FlowBadge color="blue" value={USECASES.newFromGen} label="+Gen" isNew />
          <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
          <FlowBadge color="primary" value={USECASES.total} label="Unique" isTotal />
          {useCaseDupes > 0 && (
            <span className="text-[8px] text-muted-foreground ml-1">
              ({useCaseDupes} dupes removed)
            </span>
          )}
        </div>
      </div>

      {/* User Explainer - Collapsible */}
      <MetricsExplainer
        scenarios={SCENARIOS}
        useCases={USECASES}
        categoryLabel={categoryLabel}
        onNavigate={(tab) => onTabChange?.(tab as TabView)}
      />
    </div>
  );
};

// ============================================
// FLOW BADGE COMPONENT
// ============================================

interface FlowBadgeProps {
  color: 'emerald' | 'purple' | 'blue' | 'primary';
  value: number;
  label: string;
  isNew?: boolean;
  isTotal?: boolean;
}

const FlowBadge: React.FC<FlowBadgeProps> = ({ color, value, label, isNew, isTotal }) => {
  const colorClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    purple: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
    blue: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    primary: 'bg-primary/20 text-primary border-primary/30',
  };

  return (
    <div className={`px-1.5 py-0.5 rounded border text-[9px] font-medium ${colorClasses[color]} ${isTotal ? 'font-bold' : ''}`}>
      {isNew && value > 0 && '+'}{value}
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
  highlight?: 'emerald' | 'purple' | 'blue';
  type?: 'success' | 'warning' | 'error' | 'new' | 'dependency' | 'opportunity' | 'muted';
  tooltip?: string;
}> = ({ label, value, bold, muted, highlight, type, tooltip }) => {
  let valueClass = 'text-[10px] font-medium tabular-nums';
  
  if (highlight === 'emerald') valueClass += ' text-emerald-600 font-semibold';
  else if (highlight === 'purple') valueClass += ' text-purple-600 font-semibold';
  else if (highlight === 'blue') valueClass += ' text-blue-600 font-semibold';
  else if (type === 'success') valueClass += ' text-emerald-500';
  else if (type === 'warning') valueClass += ' text-amber-500';
  else if (type === 'error') valueClass += ' text-destructive';
  else if (type === 'new') valueClass += ' text-blue-500';
  else if (type === 'dependency') valueClass += ' text-purple-500';
  else if (type === 'opportunity') valueClass += ' text-blue-500';
  else if (type === 'muted' || muted) valueClass += ' text-muted-foreground/50';
  else if (bold) valueClass += ' text-foreground font-semibold';
  else valueClass += ' text-muted-foreground';

  return (
    <div className="flex items-center justify-between group" title={tooltip}>
      <span className={`text-[8px] ${muted || type === 'muted' ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
        {label}
        {tooltip && <HelpCircle className="h-2 w-2 inline ml-0.5 opacity-0 group-hover:opacity-50" />}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
};

// ============================================
// DIVIDER COMPONENT
// ============================================

const Divider: React.FC = () => <div className="h-px bg-border/30 my-1" />;

export default TabMetricsHeader;
