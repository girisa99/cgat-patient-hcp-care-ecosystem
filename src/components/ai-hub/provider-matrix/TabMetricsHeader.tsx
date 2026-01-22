/**
 * Tab-Specific Metrics Header
 * 
 * Shows only relevant metrics for each tab view.
 * - Feature Matrix: Shows comparison across all data sources (Feature Matrix vs Cross-Functional vs Generation Coverage)
 * - Cross-Functional: Shows only cross-functional metrics
 * - Generation Coverage: Shows only generation coverage metrics
 * - By Provider: Shows only provider metrics
 * - LLM Analysis: Shows only LLM metrics
 * - Gap Analysis: Shows only gap/opportunity metrics
 */

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Target, AlertTriangle, TrendingUp, Check, Layers, Users, Brain, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateUnifiedMetrics, getGenerationCoverageStatsForCategory } from './generation-coverage/unifiedMetricsEngine';
import { CROSS_FUNCTIONAL_MAPPINGS, FEATURE_USE_CASES, LLM_COMPARISONS, ALL_FEATURES, FEATURE_IMPLEMENTATION_MATRIX, PROVIDER_SUMMARIES } from './matrixData';
import type { FeatureCategory, ProviderId } from './types';

export type TabView = 'matrix' | 'category' | 'crossfunc' | 'coverage' | 'providers' | 'llm' | 'gaps';

interface TabMetricsHeaderProps {
  activeTab: TabView;
  selectedCategory: FeatureCategory | 'all';
  localFeatures?: typeof ALL_FEATURES;
  localMatrix?: typeof FEATURE_IMPLEMENTATION_MATRIX;
}

interface MetricSource {
  name: string;
  features: number;
  scenarios: number;
  useCases: number;
  providers: number;
  llms: number;
  gaps: number;
}

export const TabMetricsHeader: React.FC<TabMetricsHeaderProps> = ({
  activeTab,
  selectedCategory,
  localFeatures = ALL_FEATURES,
  localMatrix = FEATURE_IMPLEMENTATION_MATRIX
}) => {
  // Calculate metrics for each data source
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
    crossFuncMappings.forEach(m => {
      m.scenarios?.forEach(s => crossFuncScenarios.add(s));
      m.useCases?.forEach(u => crossFuncUseCases.add(u));
      m.recommendedProviders?.forEach(p => crossFuncProviders.add(p));
      m.recommendedLLMs?.forEach(l => crossFuncLLMs.add(l));
    });
    
    // 3. GENERATION COVERAGE SOURCE
    const coverageStats = getGenerationCoverageStatsForCategory(categoryFilter);
    const unifiedMetrics = calculateUnifiedMetrics(categoryFilter, localMatrix);
    
    // Gaps calculation
    const matrixGaps = notStartedCount;
    const crossFuncGaps = crossFuncMappings.filter(m => {
      const relatedFeatures = m.relatedFeatures?.filter(rf => rf.relationship === 'requires') || [];
      return relatedFeatures.some(rf => {
        const impl = localMatrix[rf.featureId];
        return !impl || Object.keys(impl).length === 0;
      });
    }).length;
    
    return {
      featureMatrix: {
        name: 'Feature Matrix',
        features: categoryFeatures.length,
        scenarios: featureMatrixScenarios.size,
        useCases: featureMatrixUseCases.size,
        providers: matrixProviders.size,
        llms: matrixLLMs.size,
        gaps: matrixGaps
      },
      crossFunctional: {
        name: 'Cross-Functional',
        features: crossFuncMappings.length,
        scenarios: crossFuncScenarios.size,
        useCases: crossFuncUseCases.size,
        providers: crossFuncProviders.size,
        llms: crossFuncLLMs.size,
        gaps: crossFuncGaps
      },
      generationCoverage: {
        name: 'Generation Coverage',
        features: coverageStats.industries + coverageStats.frameworks + coverageStats.visuals + coverageStats.outputs,
        scenarios: coverageStats.newScenarios,
        useCases: coverageStats.newUseCases,
        providers: unifiedMetrics.providers.total,
        llms: unifiedMetrics.llms.total,
        gaps: coverageStats.gaps
      },
      total: {
        name: 'Total (Unified)',
        features: categoryFeatures.length,
        scenarios: unifiedMetrics.scenarios.total,
        useCases: unifiedMetrics.useCases.total,
        providers: unifiedMetrics.providers.total,
        llms: unifiedMetrics.llms.total,
        gaps: unifiedMetrics.gaps.total
      }
    };
  }, [selectedCategory, localFeatures, localMatrix]);

  // Render based on active tab
  const renderTabMetrics = () => {
    const categoryLabel = selectedCategory === 'all' ? 'All Categories' : selectedCategory;
    
    switch (activeTab) {
      case 'matrix':
        // Feature Matrix shows COMPARISON VIEW
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              <span>Comparison: Feature Matrix vs Cross-Functional vs Generation Coverage for <strong className="text-primary">{categoryLabel}</strong></span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {/* Feature Matrix */}
              <MetricCard 
                source={metricSources.featureMatrix} 
                color="emerald" 
                icon={<Check className="h-3.5 w-3.5" />}
                isActive
              />
              {/* Cross-Functional */}
              <MetricCard 
                source={metricSources.crossFunctional} 
                color="purple" 
                icon={<Zap className="h-3.5 w-3.5" />}
              />
              {/* Generation Coverage */}
              <MetricCard 
                source={metricSources.generationCoverage} 
                color="blue" 
                icon={<Layers className="h-3.5 w-3.5" />}
              />
              {/* Total (Unified) */}
              <MetricCard 
                source={metricSources.total} 
                color="primary" 
                icon={<Target className="h-3.5 w-3.5" />}
                isTotal
              />
            </div>
          </div>
        );
        
      case 'crossfunc':
        // Cross-Functional shows only its metrics
        return (
          <SingleSourceMetrics 
            source={metricSources.crossFunctional}
            categoryLabel={categoryLabel}
            icon={<Zap className="h-4 w-4 text-purple-500" />}
            color="purple"
            description="Cross-Functional mappings & dependencies"
          />
        );
        
      case 'coverage':
        // Generation Coverage shows only its metrics
        return (
          <SingleSourceMetrics 
            source={metricSources.generationCoverage}
            categoryLabel={categoryLabel}
            icon={<Layers className="h-4 w-4 text-blue-500" />}
            color="blue"
            description="Industry/Framework/Visual/Output contexts"
          />
        );
        
      case 'providers':
        // By Provider shows provider-focused metrics
        return (
          <SingleSourceMetrics 
            source={metricSources.featureMatrix}
            categoryLabel={categoryLabel}
            icon={<Users className="h-4 w-4 text-emerald-500" />}
            color="emerald"
            description="Provider implementations"
            focusOn="providers"
          />
        );
        
      case 'llm':
        // LLM Analysis shows LLM-focused metrics
        return (
          <SingleSourceMetrics 
            source={metricSources.total}
            categoryLabel={categoryLabel}
            icon={<Brain className="h-4 w-4 text-cyan-500" />}
            color="cyan"
            description="LLM models & routing"
            focusOn="llms"
          />
        );
        
      case 'gaps':
        // Gap Analysis shows gaps & opportunities
        return (
          <GapMetrics 
            sources={metricSources}
            categoryLabel={categoryLabel}
          />
        );
        
      case 'category':
      default:
        // Category Details shows feature matrix metrics
        return (
          <SingleSourceMetrics 
            source={metricSources.featureMatrix}
            categoryLabel={categoryLabel}
            icon={<Target className="h-4 w-4 text-primary" />}
            color="primary"
            description="Feature implementation status"
          />
        );
    }
  };

  return (
    <div className="rounded-lg border bg-card p-3">
      {renderTabMetrics()}
    </div>
  );
};

// Compact metric card for comparison view
const MetricCard: React.FC<{
  source: MetricSource;
  color: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isTotal?: boolean;
}> = ({ source, color, icon, isActive, isTotal }) => {
  const colorClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    primary: 'border-primary/30 bg-primary/5',
    cyan: 'border-cyan-500/30 bg-cyan-500/5',
  };
  
  return (
    <div className={`p-2 rounded-lg border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary} ${isActive ? 'ring-2 ring-primary' : ''} ${isTotal ? 'col-span-1' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[10px] font-medium truncate">{source.name}</span>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[9px]">
        <div>
          <span className="font-bold">{source.features}</span>
          <span className="text-muted-foreground ml-0.5">feat</span>
        </div>
        <div>
          <span className="font-bold">{source.scenarios}</span>
          <span className="text-muted-foreground ml-0.5">scen</span>
        </div>
        <div>
          <span className="font-bold">{source.useCases}</span>
          <span className="text-muted-foreground ml-0.5">use</span>
        </div>
        <div>
          <span className="font-bold">{source.providers}</span>
          <span className="text-muted-foreground ml-0.5">prov</span>
        </div>
        <div>
          <span className="font-bold">{source.llms}</span>
          <span className="text-muted-foreground ml-0.5">llm</span>
        </div>
        <div>
          <span className={`font-bold ${source.gaps > 0 ? 'text-destructive' : 'text-emerald-500'}`}>{source.gaps}</span>
          <span className="text-muted-foreground ml-0.5">gap</span>
        </div>
      </div>
    </div>
  );
};

// Single source metrics display
const SingleSourceMetrics: React.FC<{
  source: MetricSource;
  categoryLabel: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  focusOn?: 'providers' | 'llms';
}> = ({ source, categoryLabel, icon, color, description, focusOn }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <div className="text-sm font-medium">{source.name}</div>
          <div className="text-[10px] text-muted-foreground">
            {description} • <span className="text-primary">{categoryLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        {(!focusOn || focusOn === 'providers') && (
          <>
            <div className="text-center">
              <div className="font-bold">{source.features}</div>
              <div className="text-[9px] text-muted-foreground">Features</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{source.scenarios}</div>
              <div className="text-[9px] text-muted-foreground">Scenarios</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{source.useCases}</div>
              <div className="text-[9px] text-muted-foreground">Use Cases</div>
            </div>
          </>
        )}
        <div className="text-center">
          <div className={`font-bold ${focusOn === 'providers' ? 'text-lg' : ''}`}>{source.providers}</div>
          <div className="text-[9px] text-muted-foreground">Providers</div>
        </div>
        {focusOn === 'llms' && (
          <div className="text-center">
            <div className="font-bold text-lg">{source.llms}</div>
            <div className="text-[9px] text-muted-foreground">LLMs</div>
          </div>
        )}
        {source.gaps > 0 && (
          <div className="text-center">
            <div className="font-bold text-destructive">{source.gaps}</div>
            <div className="text-[9px] text-muted-foreground">Gaps</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Gap-focused metrics display
const GapMetrics: React.FC<{
  sources: Record<string, MetricSource>;
  categoryLabel: string;
}> = ({ sources, categoryLabel }) => {
  const totalGaps = sources.featureMatrix.gaps + sources.crossFunctional.gaps + sources.generationCoverage.gaps;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <div>
          <div className="text-sm font-medium">Gap Analysis</div>
          <div className="text-[10px] text-muted-foreground">
            Implementation gaps & opportunities • <span className="text-primary">{categoryLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-3 py-1.5 rounded bg-destructive/10 border border-destructive/20 cursor-help">
                <span className="font-bold text-destructive">{sources.featureMatrix.gaps}</span>
                <span className="text-muted-foreground ml-1">Feature Matrix</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Features not yet implemented in any provider</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 cursor-help">
                <span className="font-bold text-amber-600">{sources.crossFunctional.gaps}</span>
                <span className="text-muted-foreground ml-1">Cross-Functional</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Dependency features missing implementations</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 cursor-help">
                <span className="font-bold text-blue-600">{sources.generationCoverage.gaps}</span>
                <span className="text-muted-foreground ml-1">Generation Coverage</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Contexts without sufficient provider coverage</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded bg-muted/50 border">
          <span className="text-muted-foreground">Total to Implement:</span>
          <span className="font-bold text-lg">{totalGaps}</span>
        </div>
      </div>
    </div>
  );
};

export default TabMetricsHeader;
