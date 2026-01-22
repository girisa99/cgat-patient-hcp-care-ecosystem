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
import { Zap, Target, AlertTriangle, Check, Layers, Users, Brain, Info } from 'lucide-react';
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
}

interface MetricSource {
  name: string;
  features: number;
  scenarios: number;
  useCases: number;
  providers: number;
  llms: number;
  gaps: number;
  // Optional: context counts for Generation Coverage
  contexts?: {
    industries: number;
    frameworks: number;
    visuals: number;
    outputs: number;
  };
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
        name: 'Gen Coverage',
        features: coverageStats.features, // Feature mappings count
        scenarios: coverageStats.newScenarios, // Only NEW scenarios unique to generation coverage
        useCases: coverageStats.newUseCases, // Only NEW use cases unique to generation coverage
        providers: coverageStats.providers,
        llms: coverageStats.models,
        gaps: coverageStats.gaps,
        // Context counts for display
        contexts: {
          industries: coverageStats.industries,
          frameworks: coverageStats.frameworks,
          visuals: coverageStats.visuals,
          outputs: coverageStats.outputs
        }
      },
      total: {
        name: 'Total',
        features: categoryFeatures.length,
        // Total = Feature Matrix + Cross-Functional (deduplicated) + Generation Coverage new
        scenarios: featureMatrixScenarios.size + crossFuncScenarios.size + coverageStats.newScenarios,
        useCases: featureMatrixUseCases.size + crossFuncUseCases.size + coverageStats.newUseCases,
        providers: new Set([...matrixProviders, ...crossFuncProviders]).size,
        llms: new Set([...matrixLLMs, ...crossFuncLLMs]).size,
        gaps: matrixGaps
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
            description="Cross-Functional mappings & dependencies"
          />
        );
        
      case 'coverage':
        // Generation Coverage shows CONTEXT counts instead of features
        return (
          <GenerationCoverageMetrics 
            source={metricSources.generationCoverage}
            categoryLabel={categoryLabel}
          />
        );
        
      case 'providers':
        // By Provider shows provider-focused metrics
        return (
          <SingleSourceMetrics 
            source={metricSources.featureMatrix}
            categoryLabel={categoryLabel}
            icon={<Users className="h-4 w-4 text-emerald-500" />}
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

// Compact metric card for comparison view - ALIGNED GRID
const MetricCard: React.FC<{
  source: MetricSource;
  color: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isTotal?: boolean;
}> = ({ source, color, icon, isActive, isTotal }) => {
  const colorClasses: Record<string, string> = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    primary: 'border-primary/30 bg-primary/5',
    cyan: 'border-cyan-500/30 bg-cyan-500/5',
  };
  
  return (
    <div className={`p-2.5 rounded-lg border ${colorClasses[color] || colorClasses.primary} ${isActive ? 'ring-2 ring-primary' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-border/50">
        {icon}
        <span className="text-[10px] font-semibold truncate">{source.name}</span>
      </div>
      
      {/* Metrics Grid - 2x3 aligned */}
      <div className="grid grid-cols-3 gap-1.5 text-[9px]">
        <MetricCell label="Feat" value={source.features} />
        <MetricCell label="Scen" value={source.scenarios} />
        <MetricCell label="Use" value={source.useCases} />
        <MetricCell label="Prov" value={source.providers} />
        <MetricCell label="LLM" value={source.llms} />
        <MetricCell label="Gap" value={source.gaps} isGap />
      </div>
    </div>
  );
};

// Individual metric cell for consistent alignment
const MetricCell: React.FC<{
  label: string;
  value: number;
  isGap?: boolean;
}> = ({ label, value, isGap }) => (
  <div className="text-center py-0.5 px-1 rounded bg-background/50">
    <div className={`font-bold text-xs leading-none ${isGap ? (value > 0 ? 'text-destructive' : 'text-emerald-500') : ''}`}>
      {value}
    </div>
    <div className="text-[8px] text-muted-foreground uppercase tracking-wide">{label}</div>
  </div>
);

// Single source metrics display
const SingleSourceMetrics: React.FC<{
  source: MetricSource;
  categoryLabel: string;
  icon: React.ReactNode;
  description: string;
  focusOn?: 'providers' | 'llms';
}> = ({ source, categoryLabel, icon, description, focusOn }) => {
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

// Generation Coverage specific metrics display - shows CONTEXT counts
const GenerationCoverageMetrics: React.FC<{
  source: MetricSource;
  categoryLabel: string;
}> = ({ source, categoryLabel }) => {
  const contexts = source.contexts || { industries: 0, frameworks: 0, visuals: 0, outputs: 0 };
  const totalContexts = contexts.industries + contexts.frameworks + contexts.visuals + contexts.outputs;
  
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-blue-500" />
        <div>
          <div className="text-sm font-medium">Generation Coverage</div>
          <div className="text-[10px] text-muted-foreground">
            Contexts that require <span className="text-primary">{categoryLabel}</span> features
          </div>
        </div>
      </div>
      
      {/* Context Counts */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
          <span className="font-bold">{contexts.industries}</span>
          <span className="text-[9px] text-muted-foreground">Ind</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20">
          <span className="font-bold">{contexts.frameworks}</span>
          <span className="text-[9px] text-muted-foreground">Frm</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
          <span className="font-bold">{contexts.visuals}</span>
          <span className="text-[9px] text-muted-foreground">Vis</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20">
          <span className="font-bold">{contexts.outputs}</span>
          <span className="text-[9px] text-muted-foreground">Out</span>
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* New Scenarios & Use Cases */}
        <div className="text-center">
          <div className="font-bold text-primary">{source.scenarios}</div>
          <div className="text-[9px] text-muted-foreground">New Scen</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-primary">{source.useCases}</div>
          <div className="text-[9px] text-muted-foreground">New Use</div>
        </div>
        
        {/* Providers & Gaps */}
        <div className="text-center">
          <div className="font-bold">{source.providers}</div>
          <div className="text-[9px] text-muted-foreground">Prov</div>
        </div>
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

export default TabMetricsHeader;
