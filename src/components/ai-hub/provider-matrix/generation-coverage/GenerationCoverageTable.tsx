/**
 * Generation Coverage Table - Optimized Cartesian Product Display
 * 
 * Implements:
 * 1. Lazy computation (on-demand row generation)
 * 2. Hash maps for O(1) lookups
 * 3. Flat table UI (no nested cards)
 * 4. Dynamic filtering based on category selection
 * 5. Status tracking (Complete/Partial/Pending/Gap)
 * 6. UNIFIED METRICS - synced with parent tab and other matrix tabs
 */

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Check, AlertCircle, Clock, X, ChevronDown, ChevronRight, Zap, Target, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  INDUSTRY_CAPABILITY_MAPPINGS,
  FRAMEWORK_CAPABILITY_MAPPINGS,
  VISUAL_CAPABILITY_MAPPINGS,
  OUTPUT_CAPABILITY_MAPPINGS,
  FEATURE_CONTEXT_MAPPINGS
} from './generationCoverageRegistry';
import { calculateUnifiedMetrics } from './unifiedMetricsEngine';
import type { ContextToCapabilityMapping, CapabilityToContextMapping } from './types';
import type { FeatureCategory } from '../types';

// ==========================================
// OPTIMIZED DATA STRUCTURES (Hash Maps)
// ==========================================

// O(1) lookup maps - created once, used many times
const createLookupMaps = () => {
  const industryMap = new Map(INDUSTRY_CAPABILITY_MAPPINGS.map(m => [m.contextId, m]));
  const frameworkMap = new Map(FRAMEWORK_CAPABILITY_MAPPINGS.map(m => [m.contextId, m]));
  const visualMap = new Map(VISUAL_CAPABILITY_MAPPINGS.map(m => [m.contextId, m]));
  const outputMap = new Map(OUTPUT_CAPABILITY_MAPPINGS.map(m => [m.contextId, m]));
  const featureMap = new Map(FEATURE_CONTEXT_MAPPINGS.map(m => [m.featureId, m]));
  
  // Reverse lookup: feature → contexts that use it
  const featureToContexts = new Map<string, Set<string>>();
  
  [...INDUSTRY_CAPABILITY_MAPPINGS, ...FRAMEWORK_CAPABILITY_MAPPINGS, ...VISUAL_CAPABILITY_MAPPINGS, ...OUTPUT_CAPABILITY_MAPPINGS]
    .forEach(mapping => {
      mapping.requiredFeatures.forEach(f => {
        if (!featureToContexts.has(f.featureId)) {
          featureToContexts.set(f.featureId, new Set());
        }
        featureToContexts.get(f.featureId)!.add(`${mapping.contextType}:${mapping.contextId}`);
      });
    });
  
  return { industryMap, frameworkMap, visualMap, outputMap, featureMap, featureToContexts };
};

// Singleton pattern - compute once
const LOOKUP_MAPS = createLookupMaps();

// ==========================================
// STATUS COMPUTATION (Lazy/On-Demand)
// ==========================================

type CoverageStatus = 'complete' | 'partial' | 'pending' | 'gap' | 'new-opportunity';

// Dependency and implementability info
interface DependencyInfo {
  featureId: string;
  featureName: string;
  category: string;
  status: 'available' | 'partial' | 'missing';
  source: 'cross-functional' | 'feature-matrix' | 'gen-coverage';
}

interface ImplementabilityAnalysis {
  canImplementNow: boolean;
  blockedBy: DependencyInfo[];
  availableDeps: DependencyInfo[];
  reason: string;
  effort: 'low' | 'medium' | 'high';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface CoverageRow {
  id: string;
  contextType: 'industry' | 'framework' | 'visual' | 'output' | 'feature';
  name: string;
  status: CoverageStatus;
  criticalFeatures: number;
  recommendedFeatures: number;
  optionalFeatures: number;
  providers: string[];
  models: string[];
  scenarios: number;
  useCases: number;
  constraints: number;
  crossDeps: number;
  gapReason?: string;
  opportunities?: string[];
  // NEW: Dependency analysis
  implementability?: ImplementabilityAnalysis;
  warnings?: { type: string; message: string; source: string }[];
}

// Helper: Check if a context mapping has features matching the category filter
const contextMatchesCategory = (
  mapping: ContextToCapabilityMapping,
  categoryFilter?: string
): boolean => {
  if (!categoryFilter || categoryFilter === 'all') return true;
  
  // Check if any required feature's category matches the filter
  return mapping.requiredFeatures.some(rf => {
    // Get the feature category from the featureId
    // Features like 'document_upload' belong to INPUT, 'tts' to VOICE, etc.
    const featureMapping = FEATURE_CONTEXT_MAPPINGS.find(f => f.featureId === rf.featureId);
    return featureMapping?.category === categoryFilter;
  });
};

// Analyze implementability for a mapping
const analyzeImplementability = (
  mapping: ContextToCapabilityMapping | CapabilityToContextMapping,
  status: CoverageStatus
): ImplementabilityAnalysis => {
  const blockedBy: DependencyInfo[] = [];
  const availableDeps: DependencyInfo[] = [];
  
  if ('requiredFeatures' in mapping) {
    // Context mapping - check required features
    const contextMapping = mapping as ContextToCapabilityMapping;
    contextMapping.requiredFeatures.forEach(rf => {
      const featureMapping = FEATURE_CONTEXT_MAPPINGS.find(f => f.featureId === rf.featureId);
      const hasProviders = (featureMapping?.recommendedProviders?.length || 0) > 0;
      
      const depInfo: DependencyInfo = {
        featureId: rf.featureId,
        featureName: featureMapping?.featureName || rf.featureId,
        category: rf.category,
        status: hasProviders ? 'available' : 'missing',
        source: rf.category === 'INPUT' || rf.category === 'SCRIPT' ? 'feature-matrix' : 'cross-functional'
      };
      
      if (rf.priority === 'critical' && !hasProviders) {
        blockedBy.push(depInfo);
      } else {
        availableDeps.push(depInfo);
      }
    });
  } else {
    // Feature mapping - check dependsOn
    const featureMapping = mapping as CapabilityToContextMapping;
    featureMapping.dependsOn.forEach(dep => {
      const targetFeature = FEATURE_CONTEXT_MAPPINGS.find(f => f.featureId === dep.featureId);
      const hasProviders = (targetFeature?.recommendedProviders?.length || 0) > 0;
      
      const depInfo: DependencyInfo = {
        featureId: dep.featureId,
        featureName: targetFeature?.featureName || dep.featureId,
        category: dep.category,
        status: hasProviders ? 'available' : 'missing',
        source: 'cross-functional'
      };
      
      if (!hasProviders) {
        blockedBy.push(depInfo);
      } else {
        availableDeps.push(depInfo);
      }
    });
  }
  
  const canImplementNow = blockedBy.length === 0;
  const criticalBlockers = blockedBy.filter(b => b.status === 'missing');
  
  let reason = '';
  let effort: 'low' | 'medium' | 'high' = 'medium';
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  
  if (status === 'complete') {
    reason = '✅ Fully implemented - no action needed';
    effort = 'low';
    priority = 'low';
  } else if (canImplementNow) {
    reason = '🟢 Ready to implement - all dependencies available';
    effort = availableDeps.length > 3 ? 'medium' : 'low';
    priority = status === 'gap' ? 'high' : 'medium';
  } else if (criticalBlockers.length === 1) {
    reason = `🟡 Blocked by 1 feature: ${criticalBlockers[0].featureName} (${criticalBlockers[0].category})`;
    effort = 'medium';
    priority = 'high';
  } else {
    reason = `🔴 Blocked by ${criticalBlockers.length} missing features`;
    effort = 'high';
    priority = 'critical';
  }
  
  return { canImplementNow, blockedBy, availableDeps, reason, effort, priority };
};

// Generate warnings for partial/gap items
const generateWarnings = (
  mapping: ContextToCapabilityMapping | CapabilityToContextMapping,
  status: CoverageStatus
): { type: string; message: string; source: string }[] => {
  const warnings: { type: string; message: string; source: string }[] = [];
  
  if ('constraints' in mapping) {
    const contextMapping = mapping as ContextToCapabilityMapping;
    contextMapping.constraints.forEach(c => {
      if (c.severity === 'warning' || c.severity === 'incompatible') {
        warnings.push({
          type: c.severity,
          message: `${c.contextType}:${c.contextId} - ${c.reason}`,
          source: 'gen-coverage'
        });
      }
    });
  }
  
  if ('limitations' in mapping) {
    const featureMapping = mapping as CapabilityToContextMapping;
    featureMapping.limitations?.forEach(l => {
      warnings.push({
        type: 'limitation',
        message: l,
        source: 'cross-functional'
      });
    });
  }
  
  return warnings;
};

// Lazy computation - only compute what's needed for current view
// NOW PROPERLY FILTERS BY CATEGORY
function* generateCoverageRows(
  contextType: 'industry' | 'framework' | 'visual' | 'output' | 'feature' | 'all',
  categoryFilter?: string
): Generator<CoverageRow> {
  
  const getMappingStatus = (mapping: ContextToCapabilityMapping): CoverageStatus => {
    const criticalCount = mapping.requiredFeatures.filter(f => f.priority === 'critical').length;
    const recommendedCount = mapping.requiredFeatures.filter(f => f.priority === 'recommended').length;
    const hasWarnings = mapping.constraints.some(c => c.severity === 'warning' || c.severity === 'incompatible');
    const providerEntries = Object.values(mapping.recommendedProviders).filter(Boolean);
    const hasProviders = providerEntries.some(p => p && p.length > 0);
    const providerCount = providerEntries.reduce((sum, p) => sum + (p?.reduce((s, x) => s + x.providers.length, 0) || 0), 0);
    const hasModels = mapping.recommendedModels.length > 0;
    const modelCount = mapping.recommendedModels.reduce((sum, m) => sum + m.modelIds.length, 0);
    
    // Full coverage: critical features, multiple providers, multiple models, no warnings
    if (criticalCount >= 2 && providerCount >= 3 && modelCount >= 2 && !hasWarnings) return 'complete';
    // Partial: has critical features and some providers, but may have warnings or limited coverage
    if (criticalCount >= 1 && hasProviders && hasModels) return hasWarnings ? 'partial' : 'complete';
    // Pending: defined but missing providers/models
    if (criticalCount > 0 && (!hasProviders || !hasModels)) return 'pending';
    // Gap: no critical features or no providers at all
    if (!hasProviders && !hasModels) return 'gap';
    // New opportunity: has providers but no critical requirements defined
    if (hasProviders && criticalCount === 0 && recommendedCount === 0) return 'new-opportunity';
    return 'partial';
  };
  
  const getFeatureStatus = (mapping: CapabilityToContextMapping): CoverageStatus => {
    const totalContexts = mapping.usedByIndustries.length + 
                          mapping.usedByFrameworks.length + 
                          mapping.usedByTemplates.length +
                          mapping.usedByVisuals.length + 
                          mapping.usedByOutputs.length;
    const hasDeps = mapping.dependsOn.length > 0 || mapping.enablesFeatures.length > 0;
    const primaryCount = mapping.usedByIndustries.filter(i => i.priority === 'primary').length;
    
    // Check for inherited data from CROSS_FUNCTIONAL_MAPPINGS
    const hasProviders = (mapping.recommendedProviders?.length || 0) > 0;
    const hasScenarios = (mapping.scenarios?.length || 0) > 0;
    const hasUseCases = (mapping.useCases?.length || 0) > 0;
    
    // Complete: has providers + scenarios + dependencies + good context coverage
    if (hasProviders && hasScenarios && hasDeps && (totalContexts >= 3 || primaryCount >= 2)) return 'complete';
    // Partial: has some providers or context coverage
    if ((hasProviders || totalContexts >= 2) && (hasScenarios || hasDeps)) return 'partial';
    // Partial: used by some contexts
    if (totalContexts >= 2 || primaryCount >= 1) return 'partial';
    // Pending: has dependencies but not used anywhere
    if (hasDeps && totalContexts === 0) return 'pending';
    // New opportunity: has providers but limited context usage
    if (hasProviders && totalContexts < 2 && !hasDeps) return 'new-opportunity';
    // Gap: no usage and no dependencies and no providers
    if (!hasProviders && totalContexts === 0) return 'gap';
    return 'partial';
  };
  
  // Industry mappings - NOW FILTERED BY CATEGORY
  if (contextType === 'all' || contextType === 'industry') {
    for (const mapping of INDUSTRY_CAPABILITY_MAPPINGS) {
      // Skip if doesn't match category filter
      if (!contextMatchesCategory(mapping, categoryFilter)) continue;
      
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      const status = getMappingStatus(mapping);
      
      yield {
        id: `industry:${mapping.contextId}`,
        contextType: 'industry',
        name: mapping.contextName,
        status,
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2),
        implementability: analyzeImplementability(mapping, status),
        warnings: generateWarnings(mapping, status)
      };
    }
  }
  
  // Framework mappings - NOW FILTERED BY CATEGORY
  if (contextType === 'all' || contextType === 'framework') {
    for (const mapping of FRAMEWORK_CAPABILITY_MAPPINGS) {
      // Skip if doesn't match category filter
      if (!contextMatchesCategory(mapping, categoryFilter)) continue;
      
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      const status = getMappingStatus(mapping);
      
      yield {
        id: `framework:${mapping.contextId}`,
        contextType: 'framework',
        name: mapping.contextName,
        status,
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2),
        implementability: analyzeImplementability(mapping, status),
        warnings: generateWarnings(mapping, status)
      };
    }
  }
  
  // Visual mappings - NOW FILTERED BY CATEGORY
  if (contextType === 'all' || contextType === 'visual') {
    for (const mapping of VISUAL_CAPABILITY_MAPPINGS) {
      // Skip if doesn't match category filter
      if (!contextMatchesCategory(mapping, categoryFilter)) continue;
      
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      const status = getMappingStatus(mapping);
      
      yield {
        id: `visual:${mapping.contextId}`,
        contextType: 'visual',
        name: mapping.contextName,
        status,
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2),
        implementability: analyzeImplementability(mapping, status),
        warnings: generateWarnings(mapping, status)
      };
    }
  }
  
  // Output mappings - NOW FILTERED BY CATEGORY
  if (contextType === 'all' || contextType === 'output') {
    for (const mapping of OUTPUT_CAPABILITY_MAPPINGS) {
      // Skip if doesn't match category filter
      if (!contextMatchesCategory(mapping, categoryFilter)) continue;
      
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      const status = getMappingStatus(mapping);
      
      yield {
        id: `output:${mapping.contextId}`,
        contextType: 'output',
        name: mapping.contextName,
        status,
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2),
        implementability: analyzeImplementability(mapping, status),
        warnings: generateWarnings(mapping, status)
      };
    }
  }
  
  // Feature mappings (filtered by category if provided)
  // NOW includes inherited data from CROSS_FUNCTIONAL_MAPPINGS
  if (contextType === 'all' || contextType === 'feature') {
    const features = categoryFilter && categoryFilter !== 'all'
      ? FEATURE_CONTEXT_MAPPINGS.filter(f => f.category === categoryFilter)
      : FEATURE_CONTEXT_MAPPINGS;
    
    for (const mapping of features) {
      const contextCount = LOOKUP_MAPS.featureToContexts.get(mapping.featureId)?.size || 0;
      
      // Get inherited providers from the feature mapping (comes from CROSS_FUNCTIONAL_MAPPINGS)
      const inheritedProviders = mapping.recommendedProviders || [];
      
      // Get scenarios and use cases from the feature mapping (comes from FEATURE_USE_CASES)
      const inheritedScenarios = mapping.scenarios || [];
      const inheritedUseCases = mapping.useCases || [];
      
      const status = getFeatureStatus(mapping);
      
      yield {
        id: `feature:${mapping.featureId}`,
        contextType: 'feature',
        name: mapping.featureName,
        status,
        criticalFeatures: mapping.usedByIndustries.filter(i => i.priority === 'primary').length,
        recommendedFeatures: mapping.usedByIndustries.filter(i => i.priority === 'secondary').length,
        optionalFeatures: 0,
        providers: inheritedProviders as string[], // Now shows providers from CROSS_FUNCTIONAL_MAPPINGS
        models: mapping.recommendedLLMs || [],
        scenarios: inheritedScenarios.length || contextCount,
        useCases: inheritedUseCases.length || mapping.usedByTemplates.length,
        constraints: mapping.limitations?.length || 0,
        crossDeps: mapping.dependsOn.length + mapping.enablesFeatures.length,
        gapReason: contextCount === 0 && inheritedProviders.length === 0 ? 'No context mappings or providers defined' : undefined,
        opportunities: inheritedUseCases.slice(0, 2),
        implementability: analyzeImplementability(mapping, status),
        warnings: generateWarnings(mapping, status)
      };
    }
  }
}

// ==========================================
// STATUS BADGES & ICONS
// ==========================================

const STATUS_CONFIG: Record<CoverageStatus, { icon: React.ElementType; color: string; label: string }> = {
  complete: { icon: Check, color: 'text-emerald-500 bg-emerald-500/10', label: 'Complete' },
  partial: { icon: AlertCircle, color: 'text-amber-500 bg-amber-500/10', label: 'Partial' },
  pending: { icon: Clock, color: 'text-blue-500 bg-blue-500/10', label: 'Pending' },
  gap: { icon: X, color: 'text-destructive bg-destructive/10', label: 'Gap' },
  'new-opportunity': { icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10', label: 'Opportunity' }
};

const CONTEXT_BADGES: Record<string, { emoji: string; color: string }> = {
  industry: { emoji: '🏢', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  framework: { emoji: '📐', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  visual: { emoji: '🎨', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  output: { emoji: '📤', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  feature: { emoji: '⚡', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
};

// ==========================================
// MAIN TABLE COMPONENT
// ==========================================

interface GenerationCoverageTableProps {
  selectedCategory?: string;
  onRowSelect?: (row: CoverageRow) => void;
}

export const GenerationCoverageTable: React.FC<GenerationCoverageTableProps> = ({
  selectedCategory,
  onRowSelect
}) => {
  const [contextFilter, setContextFilter] = useState<'all' | 'industry' | 'framework' | 'visual' | 'output' | 'feature'>('all');
  const [statusFilter, setStatusFilter] = useState<CoverageStatus | 'all'>('all');
  
  // Lazy computation with useMemo - only compute visible rows
  const rows = useMemo(() => {
    const allRows = [...generateCoverageRows(contextFilter, selectedCategory)];
    
    if (statusFilter === 'all') return allRows;
    return allRows.filter(r => r.status === statusFilter);
  }, [contextFilter, selectedCategory, statusFilter]);
  
  // USE UNIFIED METRICS - synced with parent tab
  const unifiedMetrics = useMemo(() => {
    const categoryFilter = (selectedCategory === 'all' || !selectedCategory) 
      ? 'all' 
      : selectedCategory as FeatureCategory;
    return calculateUnifiedMetrics(categoryFilter);
  }, [selectedCategory]);
  
  // Stats derived from unified metrics (for consistency with parent tab)
  const stats = useMemo(() => {
    const all = [...generateCoverageRows('all', selectedCategory)];
    return {
      total: all.length,
      complete: all.filter(r => r.status === 'complete').length,
      partial: all.filter(r => r.status === 'partial').length,
      pending: all.filter(r => r.status === 'pending').length,
      gap: all.filter(r => r.status === 'gap').length,
      opportunity: all.filter(r => r.status === 'new-opportunity').length,
      // USE UNIFIED METRICS for scenarios/useCases to match parent tab
      totalScenarios: unifiedMetrics.scenarios.total,
      totalUseCases: unifiedMetrics.useCases.total,
      totalConstraints: all.reduce((sum, r) => sum + r.constraints + (r.warnings?.length || 0), 0),
      totalCrossDeps: all.reduce((sum, r) => sum + r.crossDeps, 0),
      // NEW: Show breakdown
      newScenarios: unifiedMetrics.scenarios.fromGenerationCoverage,
      newUseCases: unifiedMetrics.useCases.fromGenerationCoverage,
      // Implementability stats
      readyToImplement: all.filter(r => r.implementability?.canImplementNow && r.status !== 'complete').length,
      blockedByDeps: all.filter(r => !r.implementability?.canImplementNow && r.status !== 'complete').length
    };
  }, [selectedCategory, unifiedMetrics]);
  
  const coveragePercent = unifiedMetrics.coverage;

  return (
    <div className="space-y-4">
      {/* Summary Stats Bar - NOW SYNCED with parent */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/30 border text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span>Coverage:</span>
          <span className="text-primary font-bold">{coveragePercent}%</span>
        </div>
        
        <div className="h-4 w-px bg-border" />
        
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = stats[status === 'new-opportunity' ? 'opportunity' : status as keyof typeof stats] as number;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? 'all' : status as CoverageStatus)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                statusFilter === status ? 'ring-1 ring-primary' : 'hover:bg-muted/50'
              }`}
            >
              <config.icon className={`w-3 h-3 ${config.color.split(' ')[0]}`} />
              <span className="font-bold">{count}</span>
              <span className="text-muted-foreground">{config.label}</span>
            </button>
          );
        })}
        
        <div className="h-4 w-px bg-border" />
        
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>{stats.totalScenarios} scenarios</span>
          {stats.newScenarios > 0 && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 text-primary">+{stats.newScenarios}</Badge>}
          <span>•</span>
          <span>{stats.totalUseCases} use cases</span>
          {stats.newUseCases > 0 && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 text-primary">+{stats.newUseCases}</Badge>}
          <span>•</span>
          <span>{stats.totalCrossDeps} deps</span>
        </div>
        
        <div className="ml-auto">
          <Progress value={coveragePercent} className="w-24 h-2" />
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2">
        <Select value={contextFilter} onValueChange={(v) => setContextFilter(v as typeof contextFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Context Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contexts</SelectItem>
            <SelectItem value="industry">🏢 Industries</SelectItem>
            <SelectItem value="framework">📐 Frameworks</SelectItem>
            <SelectItem value="visual">🎨 Visuals</SelectItem>
            <SelectItem value="output">📤 Outputs</SelectItem>
            <SelectItem value="feature">⚡ Features</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Main Table */}
      <ScrollArea className="h-[450px] rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10">Type</TableHead>
              <TableHead className="w-36">Name</TableHead>
              <TableHead className="w-20 text-center">Status</TableHead>
              <TableHead className="w-24 text-center">Features</TableHead>
              <TableHead className="w-28">Providers</TableHead>
              <TableHead className="w-14 text-center">Scen.</TableHead>
              <TableHead className="w-14 text-center">Cases</TableHead>
              <TableHead className="w-14 text-center">Deps</TableHead>
              <TableHead className="w-20 text-center">Can Impl?</TableHead>
              <TableHead className="w-14 text-center">Warns</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => {
              const statusConfig = STATUS_CONFIG[row.status];
              const contextBadge = CONTEXT_BADGES[row.contextType];
              const StatusIcon = statusConfig.icon;
              const impl = row.implementability;
              
              return (
                <TableRow 
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowSelect?.(row)}
                >
                  <TableCell className="py-1.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm">{contextBadge.emoji}</span>
                        </TooltipTrigger>
                        <TooltipContent>{row.contextType}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  
                  <TableCell className="py-1.5">
                    <span className="text-xs font-medium truncate block max-w-[130px]" title={row.name}>
                      {row.name}
                    </span>
                  </TableCell>
                  
                  <TableCell className="py-1.5 text-center">
                    <Badge variant="outline" className={`text-[9px] ${statusConfig.color}`}>
                      <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-1.5 text-center">
                    <div className="flex items-center justify-center gap-0.5 text-[9px]">
                      <span className="text-destructive font-bold">{row.criticalFeatures}⚠</span>
                      <span className="text-warning">/{row.recommendedFeatures}★</span>
                      <span className="text-muted-foreground">/{row.optionalFeatures}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-1.5">
                    <div className="flex flex-wrap gap-0.5">
                      {row.providers.slice(0, 2).map(p => (
                        <span key={p} className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary">
                          {p}
                        </span>
                      ))}
                      {row.providers.length > 2 && (
                        <span className="text-[8px] text-muted-foreground">+{row.providers.length - 2}</span>
                      )}
                      {row.providers.length === 0 && (
                        <span className="text-[8px] text-muted-foreground italic">None</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-1.5 text-center">
                    <span className="text-xs font-medium">{row.scenarios}</span>
                  </TableCell>
                  
                  <TableCell className="py-1.5 text-center">
                    <span className="text-xs font-medium">{row.useCases}</span>
                  </TableCell>
                  
                  <TableCell className="py-1.5 text-center">
                    {row.crossDeps > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-[9px] bg-accent/50 text-accent-foreground border-accent">
                              {row.crossDeps}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="text-xs">
                              <strong>Dependencies:</strong>
                              {impl?.availableDeps?.map(d => (
                                <div key={d.featureId} className="text-muted-foreground">
                                  ✅ {d.featureName} ({d.category})
                                </div>
                              ))}
                              {impl?.blockedBy?.map(d => (
                                <div key={d.featureId} className="text-destructive">
                                  ❌ {d.featureName} ({d.category}) - {d.source}
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  
                  {/* Can Implement Now? */}
                  <TableCell className="py-1.5 text-center">
                    {impl ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge 
                              variant="outline" 
                              className={`text-[8px] ${
                                impl.canImplementNow 
                                  ? 'bg-primary/10 text-primary border-primary/30' 
                                  : 'bg-destructive/10 text-destructive border-destructive/30'
                              }`}
                            >
                              {impl.canImplementNow ? '✅ Ready' : `🔴 ${impl.blockedBy.length} blocked`}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="text-xs space-y-1">
                              <div className="font-medium">{impl.reason}</div>
                              <div className="flex gap-2 text-muted-foreground">
                                <span>Effort: {impl.effort}</span>
                                <span>Priority: {impl.priority}</span>
                              </div>
                              {impl.blockedBy.length > 0 && (
                                <div className="pt-1 border-t border-border mt-1">
                                  <strong className="text-destructive">Blocked by:</strong>
                                  {impl.blockedBy.map(b => (
                                    <div key={b.featureId}>
                                      • {b.featureName} ({b.category}) - from {b.source}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-1.5 text-center">
                    {(row.constraints > 0 || (row.warnings?.length || 0) > 0) ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30">
                              {row.constraints + (row.warnings?.length || 0)}⚠
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="text-xs space-y-1">
                              <strong>Warnings:</strong>
                              {row.warnings?.map((w, i) => (
                                <div key={i} className="text-muted-foreground">
                                  [{w.source}] {w.message}
                                </div>
                              ))}
                              {row.constraints > 0 && !row.warnings?.length && (
                                <div className="text-muted-foreground">{row.constraints} constraint(s)</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-[9px] text-primary">✓</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No mappings found for current filter
                </TableCell>
              </TableRow>
            )}
            
            {/* TOTALS ROW */}
            {rows.length > 0 && (
              <TableRow className="bg-muted/30 font-medium border-t-2 sticky bottom-0">
                <TableCell className="py-2" colSpan={2}>
                  <span className="text-xs font-bold">TOTALS ({rows.length} items)</span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <div className="flex flex-col gap-0.5 text-[9px]">
                    <span className="text-primary">{stats.complete}✓</span>
                    <span className="text-warning">{stats.partial}⚠</span>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <span className="text-[9px]">
                    {rows.reduce((sum, r) => sum + r.criticalFeatures, 0)} critical
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-[9px]">
                    {[...new Set(rows.flatMap(r => r.providers))].length} unique
                  </span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <span className="text-xs font-bold text-primary">{stats.totalScenarios}</span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <span className="text-xs font-bold text-primary">{stats.totalUseCases}</span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <span className="text-[9px]">{stats.totalCrossDeps}</span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <div className="flex flex-col gap-0.5 text-[9px]">
                    <span className="text-primary">
                      {rows.filter(r => r.implementability?.canImplementNow).length} ready
                    </span>
                    <span className="text-destructive">
                      {rows.filter(r => !r.implementability?.canImplementNow && r.status !== 'complete').length} blocked
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <span className="text-[9px]">{stats.totalConstraints}</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {/* Implementation Summary - NEW */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ready to Implement */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
            <Zap className="w-4 h-4" />
            {rows.filter(r => r.implementability?.canImplementNow && r.status !== 'complete').length} Ready to Implement Now
          </div>
          <div className="text-xs text-muted-foreground">
            All dependencies available. Can start implementation immediately.
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {rows.filter(r => r.implementability?.canImplementNow && r.status !== 'complete').slice(0, 5).map(r => (
              <Badge key={r.id} variant="outline" className="text-[8px]">{r.name}</Badge>
            ))}
            {rows.filter(r => r.implementability?.canImplementNow && r.status !== 'complete').length > 5 && (
              <span className="text-[9px] text-muted-foreground">
                +{rows.filter(r => r.implementability?.canImplementNow && r.status !== 'complete').length - 5} more
              </span>
            )}
          </div>
        </div>
        
        {/* Blocked - Need Dependencies */}
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
            <X className="w-4 h-4" />
            {rows.filter(r => !r.implementability?.canImplementNow && r.status !== 'complete').length} Blocked by Dependencies
          </div>
          <div className="text-xs text-muted-foreground">
            Require cross-functional features from other categories first.
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {/* Show unique blockers */}
            {[...new Set(
              rows.filter(r => !r.implementability?.canImplementNow)
                .flatMap(r => r.implementability?.blockedBy || [])
                .map(b => `${b.featureName} (${b.category})`)
            )].slice(0, 4).map(b => (
              <Badge key={b} variant="outline" className="text-[8px] text-destructive border-destructive/30">{b}</Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Gap Analysis Summary */}
      {stats.gap > 0 && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
            <X className="w-4 h-4" />
            {stats.gap} Coverage Gaps Identified
          </div>
          <div className="text-xs text-muted-foreground">
            These contexts lack provider coverage or feature mappings. Review and expand mappings to increase coverage.
          </div>
        </div>
      )}
      
      {/* Opportunities Summary */}
      {stats.opportunity > 0 && (
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            {stats.opportunity} New Opportunities
          </div>
          <div className="text-xs text-muted-foreground">
            These contexts have provider coverage but may benefit from additional scenarios and use cases.
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationCoverageTable;
