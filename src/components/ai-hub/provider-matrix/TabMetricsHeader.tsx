/**
 * Tab-Specific Metrics Header - UNIFIED & ALIGNED
 * 
 * Shows consistent metrics across all data sources with clear labeling.
 * 
 * KEY CONCEPT:
 * - AI Capabilities (FEAT, PROV, LLM) should be CONSISTENT across all sources
 * - Content Sources (SCEN, USE) show what each source contributes
 * - Status (GAP, OPP, DEP) shows implementation state
 * - Generation Coverage adds CONTEXT metrics (Industries, Frameworks, Visuals, Outputs)
 */

import React, { useMemo } from 'react';
import { Zap, Target, Check, Layers, Info, TrendingUp, AlertCircle } from 'lucide-react';
import { calculateUnifiedMetrics, getGenerationCoverageStatsForCategory } from './generation-coverage/unifiedMetricsEngine';
import { CROSS_FUNCTIONAL_MAPPINGS, FEATURE_USE_CASES, LLM_COMPARISONS, ALL_FEATURES, FEATURE_IMPLEMENTATION_MATRIX } from './matrixData';
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
  // Calculate UNIFIED metrics from single source of truth
  const unifiedMetrics = useMemo(() => {
    return calculateUnifiedMetrics(selectedCategory, localMatrix);
  }, [selectedCategory, localMatrix]);

  // Generation Coverage context stats
  const coverageStats = useMemo(() => {
    return getGenerationCoverageStatsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Cross-Functional specific counts
  const crossFuncStats = useMemo(() => {
    const categoryFilter = selectedCategory === 'all' ? 'all' : selectedCategory;
    const categoryFeatures = categoryFilter === 'all' 
      ? localFeatures 
      : localFeatures.filter(f => f.category === categoryFilter);
    const featureIds = new Set(categoryFeatures.map(f => f.id));

    const relevantMappings = CROSS_FUNCTIONAL_MAPPINGS.filter(m => 
      categoryFilter === 'all' || m.primaryCategory === categoryFilter || featureIds.has(m.primaryFeatureId)
    );

    const scenarios = new Set<string>();
    const useCases = new Set<string>();
    const providers = new Set<string>();
    const llms = new Set<string>();
    let dependencies = 0;
    let enhancements = 0;

    relevantMappings.forEach(m => {
      m.scenarios?.forEach(s => scenarios.add(s));
      m.useCases?.forEach(u => useCases.add(u));
      m.recommendedProviders?.forEach(p => providers.add(p));
      m.recommendedLLMs?.forEach(l => llms.add(l));
      m.relatedFeatures?.forEach(rf => {
        if (rf.relationship === 'requires') dependencies++;
        if (rf.relationship === 'enhances') enhancements++;
      });
    });

    return {
      mappings: relevantMappings.length,
      scenarios: scenarios.size,
      useCases: useCases.size,
      providers: providers.size,
      llms: llms.size,
      dependencies,
      enhancements
    };
  }, [selectedCategory, localFeatures]);

  // Only show comparison view for the matrix tab
  if (activeTab !== 'matrix') return null;

  const categoryLabel = selectedCategory === 'all' ? 'All Categories' : selectedCategory;

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>Metric Sources for <strong className="text-primary">{categoryLabel}</strong> — Click any card to navigate</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {/* FEATURE MATRIX - Base Features & Implementation */}
          <MetricCard 
            title="Feature Matrix"
            subtitle="Base features & status"
            icon={<Check className="h-3 w-3" />}
            color="emerald"
            isActive
            onClick={() => onTabChange?.('matrix')}
            rows={[
              { label: 'Features', value: unifiedMetrics.features.total, highlight: true },
              { label: 'Scenarios', value: unifiedMetrics.scenarios.fromFeatureUseCases },
              { label: 'Use Cases', value: unifiedMetrics.useCases.fromFeatureUseCases },
              { label: 'Providers', value: unifiedMetrics.providers.implemented },
              { label: 'LLMs', value: unifiedMetrics.llms.forCategory },
              { label: 'Implemented', value: unifiedMetrics.features.implemented, type: 'success' },
              { label: 'Partial', value: unifiedMetrics.features.partial, type: 'warning' },
              { label: 'Gaps', value: unifiedMetrics.features.notStarted, type: 'error' },
            ]}
          />

          {/* CROSS-FUNCTIONAL - Relationships & Dependencies */}
          <MetricCard 
            title="Cross-Functional"
            subtitle="Dependencies & relationships"
            icon={<Zap className="h-3 w-3" />}
            color="purple"
            onClick={() => onTabChange?.('crossfunc')}
            rows={[
              { label: 'Mappings', value: crossFuncStats.mappings, highlight: true },
              { label: '+Scenarios', value: unifiedMetrics.scenarios.fromCrossFunctional },
              { label: '+Use Cases', value: unifiedMetrics.useCases.fromCrossFunctional },
              { label: 'Rec. Prov', value: crossFuncStats.providers },
              { label: 'Rec. LLMs', value: crossFuncStats.llms },
              { label: 'Dependencies', value: crossFuncStats.dependencies, type: 'dependency' },
              { label: 'Enhances', value: crossFuncStats.enhancements, type: 'opportunity' },
              { label: '—', value: '' },
            ]}
          />

          {/* GENERATION COVERAGE - Context Mappings */}
          <MetricCard 
            title="Gen Coverage"
            subtitle="Context mappings"
            icon={<Layers className="h-3 w-3" />}
            color="blue"
            onClick={() => onTabChange?.('coverage')}
            rows={[
              { label: 'Industries', value: coverageStats.industries, highlight: true },
              { label: 'Frameworks', value: coverageStats.frameworks, highlight: true },
              { label: 'Visuals', value: coverageStats.visuals, highlight: true },
              { label: 'Outputs', value: coverageStats.outputs, highlight: true },
              { label: '+Scenarios', value: unifiedMetrics.scenarios.fromGenerationCoverage },
              { label: '+Use Cases', value: unifiedMetrics.useCases.fromGenerationCoverage },
              { label: 'Models', value: coverageStats.models },
              { label: 'Providers', value: coverageStats.providers },
            ]}
          />

          {/* TOTAL - Unified Aggregate */}
          <MetricCard 
            title="Total (Unified)"
            subtitle="Aggregated & deduplicated"
            icon={<Target className="h-3 w-3" />}
            color="primary"
            isTotal
            onClick={() => onTabChange?.('gaps')}
            rows={[
              { label: 'Features', value: unifiedMetrics.features.total, highlight: true },
              { label: 'Scenarios', value: unifiedMetrics.scenarios.total },
              { label: 'Use Cases', value: unifiedMetrics.useCases.total },
              { label: 'Providers', value: unifiedMetrics.providers.total },
              { label: 'LLMs', value: unifiedMetrics.llms.forCategory },
              { label: 'Gaps', value: unifiedMetrics.gaps.total, type: 'error' },
              { label: 'Opportunities', value: unifiedMetrics.opportunities.total, type: 'opportunity' },
              { label: 'Coverage', value: `${unifiedMetrics.coverage}%`, type: unifiedMetrics.coverage >= 80 ? 'success' : unifiedMetrics.coverage >= 50 ? 'warning' : 'error' },
            ]}
          />
        </div>

        {/* LEGEND - Explain what each number means */}
        <div className="flex flex-wrap gap-3 text-[9px] text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Implemented
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Partial/Opportunity
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-destructive" /> Gap/Missing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Dependency
          </span>
          <span className="text-muted-foreground/50">|</span>
          <span><strong>+Scenarios</strong> = Net-new from that source</span>
          <span><strong>Total</strong> = Deduplicated sum</span>
        </div>
      </div>
    </div>
  );
};

// Metric Row type
interface MetricRow {
  label: string;
  value: string | number;
  highlight?: boolean;
  type?: 'success' | 'warning' | 'error' | 'dependency' | 'opportunity';
}

// Compact metric card with 8 consistent rows
const MetricCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  rows: MetricRow[];
  isActive?: boolean;
  isTotal?: boolean;
  onClick?: () => void;
}> = ({ title, subtitle, icon, color, rows, isActive, isTotal, onClick }) => {
  const colorClasses: Record<string, string> = {
    emerald: 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10',
    purple: 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10',
    blue: 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10',
    primary: 'border-primary/40 bg-primary/5 hover:bg-primary/10',
  };
  
  const iconColorClasses: Record<string, string> = {
    emerald: 'text-emerald-500',
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    primary: 'text-primary',
  };
  
  return (
    <div 
      className={`p-2 rounded-lg border cursor-pointer transition-all ${colorClasses[color] || colorClasses.primary} ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-border/50">
        <span className={iconColorClasses[color]}>{icon}</span>
        <div className="min-w-0">
          <div className="text-[9px] font-semibold truncate leading-tight">{title}</div>
          <div className="text-[7px] text-muted-foreground truncate">{subtitle}</div>
        </div>
      </div>
      
      {/* Metrics - 2 columns, 4 rows */}
      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
        {rows.map((row, idx) => (
          <MetricRow key={idx} {...row} />
        ))}
      </div>
    </div>
  );
};

// Individual metric row for consistent alignment
const MetricRow: React.FC<MetricRow> = ({ label, value, highlight, type }) => {
  let valueClass = 'font-semibold text-[10px]';
  
  if (type === 'success') valueClass += ' text-emerald-500';
  else if (type === 'warning') valueClass += ' text-amber-500';
  else if (type === 'error') valueClass += ' text-destructive';
  else if (type === 'dependency') valueClass += ' text-purple-500';
  else if (type === 'opportunity') valueClass += ' text-blue-500';
  else if (highlight) valueClass += ' text-foreground';
  else valueClass += ' text-muted-foreground';

  if (label === '—') {
    return <div className="h-3" />; // Spacer
  }
  
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[8px] text-muted-foreground truncate">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
};

export default TabMetricsHeader;
