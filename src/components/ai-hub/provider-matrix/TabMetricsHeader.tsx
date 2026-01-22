/**
 * Tab-Specific Metrics Header - ALIGNED VERSION
 * 
 * Shows comparison metrics with clickable navigation and consistent alignment.
 * Each card now includes: Features, Scenarios, Use Cases, Providers, LLMs, Gaps, Opportunities, Dependencies
 */

import React, { useMemo } from 'react';
import { Zap, Target, AlertTriangle, Check, Layers, Users, Brain, Info, Link2, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

interface MetricSource {
  name: string;
  features: number;
  scenarios: number;
  useCases: number;
  providers: number;
  llms: number;
  gaps: number;
  opportunities: number;
  dependencies: number;
}

export const TabMetricsHeader: React.FC<TabMetricsHeaderProps> = ({
  activeTab,
  selectedCategory,
  localFeatures = ALL_FEATURES,
  localMatrix = FEATURE_IMPLEMENTATION_MATRIX,
  onTabChange
}) => {
  // Calculate metrics for each data source - CATEGORY AWARE
  const metricSources = useMemo((): Record<string, MetricSource> => {
    const categoryFilter = selectedCategory === 'all' ? 'all' : selectedCategory;
    const categoryFeatures = categoryFilter === 'all' 
      ? localFeatures 
      : localFeatures.filter(f => f.category === categoryFilter);
    
    const featureIds = new Set(categoryFeatures.map(f => f.id));
    
    // 1. FEATURE MATRIX SOURCE
    let implementedCount = 0, partialCount = 0, plannedCount = 0, notStartedCount = 0;
    const matrixProviders = new Set<string>();
    categoryFeatures.forEach(f => {
      const featureImpl = localMatrix[f.id];
      if (!featureImpl || Object.keys(featureImpl).length === 0) {
        notStartedCount++;
        return;
      }
      const statuses = Object.values(featureImpl).map(p => p?.implementation);
      if (statuses.includes('implemented')) implementedCount++;
      else if (statuses.includes('partial')) partialCount++;
      else if (statuses.includes('planned')) plannedCount++;
      else notStartedCount++;
      
      Object.entries(featureImpl).forEach(([providerId, impl]) => {
        if (impl?.implementation === 'implemented' || impl?.implementation === 'partial') {
          matrixProviders.add(providerId);
        }
      });
    });
    
    const featureMatrixScenarios = new Set<string>();
    const featureMatrixUseCases = new Set<string>();
    categoryFeatures.forEach(f => {
      const uc = FEATURE_USE_CASES[f.id];
      if (uc) {
        uc.scenarios?.forEach(s => featureMatrixScenarios.add(s));
        uc.bestFor?.forEach(b => featureMatrixUseCases.add(b));
      }
    });
    
    const matrixLLMs = new Set<string>();
    matrixProviders.forEach(pid => {
      const llm = LLM_COMPARISONS.find(l => l.providerId === pid);
      if (llm) matrixLLMs.add(llm.model);
    });
    
    // 2. CROSS-FUNCTIONAL SOURCE
    const crossFuncMappings = CROSS_FUNCTIONAL_MAPPINGS.filter(m => 
      categoryFilter === 'all' || m.primaryCategory === categoryFilter || featureIds.has(m.primaryFeatureId)
    );
    const crossFuncScenarios = new Set<string>();
    const crossFuncUseCases = new Set<string>();
    const crossFuncProviders = new Set<string>();
    const crossFuncLLMs = new Set<string>();
    let crossFuncDependencies = 0;
    
    crossFuncMappings.forEach(m => {
      m.scenarios?.forEach(s => crossFuncScenarios.add(s));
      m.useCases?.forEach(u => crossFuncUseCases.add(u));
      m.recommendedProviders?.forEach(p => crossFuncProviders.add(p));
      m.recommendedLLMs?.forEach(l => crossFuncLLMs.add(l));
      // Count dependencies (requires relationships)
      crossFuncDependencies += m.relatedFeatures?.filter(rf => rf.relationship === 'requires').length || 0;
    });
    
    // 3. GENERATION COVERAGE SOURCE
    const coverageStats = getGenerationCoverageStatsForCategory(categoryFilter);
    
    // Gaps calculation
    const matrixGaps = notStartedCount;
    const crossFuncGaps = crossFuncMappings.filter(m => {
      const relatedFeatures = m.relatedFeatures?.filter(rf => rf.relationship === 'requires') || [];
      return relatedFeatures.some(rf => {
        const impl = localMatrix[rf.featureId];
        return !impl || Object.keys(impl).length === 0;
      });
    }).length;
    
    // Opportunities calculation
    const matrixOpportunities = partialCount + plannedCount; // Partial/planned are opportunities
    const crossFuncOpportunities = crossFuncMappings.filter(m =>
      m.relatedFeatures?.some(rf => rf.relationship === 'enhances')
    ).length;
    
    return {
      featureMatrix: {
        name: 'Feature Matrix',
        features: categoryFeatures.length,
        scenarios: featureMatrixScenarios.size,
        useCases: featureMatrixUseCases.size,
        providers: matrixProviders.size,
        llms: matrixLLMs.size,
        gaps: matrixGaps,
        opportunities: matrixOpportunities,
        dependencies: 0 // Feature Matrix doesn't track dependencies
      },
      crossFunctional: {
        name: 'Cross-Functional',
        features: crossFuncMappings.length,
        scenarios: crossFuncScenarios.size,
        useCases: crossFuncUseCases.size,
        providers: crossFuncProviders.size,
        llms: crossFuncLLMs.size,
        gaps: crossFuncGaps,
        opportunities: crossFuncOpportunities,
        dependencies: crossFuncDependencies
      },
      generationCoverage: {
        name: 'Gen Coverage',
        features: coverageStats.features,
        scenarios: coverageStats.newScenarios, // Only NEW scenarios
        useCases: coverageStats.newUseCases,   // Only NEW use cases
        providers: coverageStats.providers,
        llms: coverageStats.models,
        gaps: coverageStats.gaps,
        opportunities: coverageStats.opportunities,
        dependencies: 0 // Gen Coverage doesn't track dependencies directly
      },
      total: {
        name: 'Total',
        features: categoryFeatures.length,
        scenarios: featureMatrixScenarios.size + crossFuncScenarios.size + coverageStats.newScenarios,
        useCases: featureMatrixUseCases.size + crossFuncUseCases.size + coverageStats.newUseCases,
        providers: new Set([...matrixProviders, ...crossFuncProviders]).size,
        llms: new Set([...matrixLLMs, ...crossFuncLLMs]).size,
        gaps: matrixGaps, // Total gaps from feature matrix
        opportunities: matrixOpportunities + crossFuncOpportunities + coverageStats.opportunities,
        dependencies: crossFuncDependencies
      }
    };
  }, [selectedCategory, localFeatures, localMatrix]);

  // Only show comparison view for the matrix tab
  if (activeTab !== 'matrix') return null;

  const categoryLabel = selectedCategory === 'all' ? 'All Categories' : selectedCategory;

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>Comparison: Feature Matrix vs Cross-Functional vs Generation Coverage for <strong className="text-primary">{categoryLabel}</strong></span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {/* Feature Matrix - Click navigates to matrix tab */}
          <MetricCard 
            source={metricSources.featureMatrix} 
            color="emerald" 
            icon={<Check className="h-3.5 w-3.5" />}
            isActive
            onClick={() => onTabChange?.('matrix')}
          />
          {/* Cross-Functional - Click navigates to crossfunc tab */}
          <MetricCard 
            source={metricSources.crossFunctional} 
            color="purple" 
            icon={<Zap className="h-3.5 w-3.5" />}
            onClick={() => onTabChange?.('crossfunc')}
          />
          {/* Generation Coverage - Click navigates to coverage tab */}
          <MetricCard 
            source={metricSources.generationCoverage} 
            color="blue" 
            icon={<Layers className="h-3.5 w-3.5" />}
            onClick={() => onTabChange?.('coverage')}
          />
          {/* Total (Unified) - Click navigates to gaps tab */}
          <MetricCard 
            source={metricSources.total} 
            color="primary" 
            icon={<Target className="h-3.5 w-3.5" />}
            isTotal
            onClick={() => onTabChange?.('gaps')}
          />
        </div>
      </div>
    </div>
  );
};

// Compact metric card - ALIGNED 3x3 GRID with consistent layout
const MetricCard: React.FC<{
  source: MetricSource;
  color: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isTotal?: boolean;
  onClick?: () => void;
}> = ({ source, color, icon, isActive, isTotal, onClick }) => {
  const colorClasses: Record<string, string> = {
    emerald: 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10',
    purple: 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10',
    blue: 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10',
    primary: 'border-primary/40 bg-primary/5 hover:bg-primary/10',
  };
  
  return (
    <div 
      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${colorClasses[color] || colorClasses.primary} ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-border/50">
        {icon}
        <span className="text-[10px] font-semibold truncate">{source.name}</span>
      </div>
      
      {/* Metrics Grid - CONSISTENT 3x3 ALIGNED */}
      <div className="grid grid-cols-3 gap-1">
        {/* Row 1: Core counts */}
        <MetricCell label="FEAT" value={source.features} />
        <MetricCell label="SCEN" value={source.scenarios} />
        <MetricCell label="USE" value={source.useCases} />
        
        {/* Row 2: Provider/LLM */}
        <MetricCell label="PROV" value={source.providers} />
        <MetricCell label="LLM" value={source.llms} />
        <MetricCell label="DEP" value={source.dependencies} type="dependency" />
        
        {/* Row 3: Status indicators */}
        <MetricCell label="OPP" value={source.opportunities} type="opportunity" />
        <MetricCell label="GAP" value={source.gaps} type="gap" />
        <MetricCell label="⚡" value={isTotal ? '→' : '•'} type="action" />
      </div>
    </div>
  );
};

// Individual metric cell for consistent alignment
const MetricCell: React.FC<{
  label: string;
  value: number | string;
  type?: 'gap' | 'opportunity' | 'dependency' | 'action';
}> = ({ label, value, type }) => {
  let valueClass = 'font-bold text-xs leading-none';
  
  if (type === 'gap' && typeof value === 'number') {
    valueClass = value > 0 ? 'font-bold text-xs leading-none text-destructive' : 'font-bold text-xs leading-none text-emerald-500';
  } else if (type === 'opportunity' && typeof value === 'number') {
    valueClass = value > 0 ? 'font-bold text-xs leading-none text-amber-500' : 'font-bold text-xs leading-none text-muted-foreground';
  } else if (type === 'dependency' && typeof value === 'number') {
    valueClass = value > 0 ? 'font-bold text-xs leading-none text-purple-500' : 'font-bold text-xs leading-none text-muted-foreground';
  } else if (type === 'action') {
    valueClass = 'font-bold text-xs leading-none text-muted-foreground';
  }
  
  return (
    <div className="text-center py-1 px-0.5 rounded bg-background/50">
      <div className={valueClass}>
        {value}
      </div>
      <div className="text-[7px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
};

export default TabMetricsHeader;
