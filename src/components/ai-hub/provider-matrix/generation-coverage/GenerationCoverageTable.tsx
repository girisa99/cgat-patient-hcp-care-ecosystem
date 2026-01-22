/**
 * Generation Coverage Table - Optimized Cartesian Product Display
 * 
 * Implements:
 * 1. Lazy computation (on-demand row generation)
 * 2. Hash maps for O(1) lookups
 * 3. Flat table UI (no nested cards)
 * 4. Dynamic filtering based on category selection
 * 5. Status tracking (Complete/Partial/Pending/Gap)
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
}

// Lazy computation - only compute what's needed for current view
function* generateCoverageRows(
  contextType: 'industry' | 'framework' | 'visual' | 'output' | 'feature' | 'all',
  categoryFilter?: string
): Generator<CoverageRow> {
  
  const getMappingStatus = (mapping: ContextToCapabilityMapping): CoverageStatus => {
    const criticalCount = mapping.requiredFeatures.filter(f => f.priority === 'critical').length;
    const hasWarnings = mapping.constraints.some(c => c.severity === 'warning' || c.severity === 'incompatible');
    const hasProviders = Object.values(mapping.recommendedProviders).some(p => p && p.length > 0);
    
    if (criticalCount > 0 && hasProviders && !hasWarnings) return 'complete';
    if (criticalCount > 0 && hasProviders && hasWarnings) return 'partial';
    if (criticalCount > 0 && !hasProviders) return 'pending';
    if (!hasProviders) return 'gap';
    return 'new-opportunity';
  };
  
  const getFeatureStatus = (mapping: CapabilityToContextMapping): CoverageStatus => {
    const totalContexts = mapping.usedByIndustries.length + 
                          mapping.usedByFrameworks.length + 
                          mapping.usedByTemplates.length +
                          mapping.usedByVisuals.length + 
                          mapping.usedByOutputs.length;
    const hasDeps = mapping.dependsOn.length > 0 || mapping.enablesFeatures.length > 0;
    
    if (totalContexts >= 3 && hasDeps) return 'complete';
    if (totalContexts >= 1) return 'partial';
    if (hasDeps) return 'pending';
    return 'gap';
  };
  
  // Industry mappings
  if (contextType === 'all' || contextType === 'industry') {
    for (const mapping of INDUSTRY_CAPABILITY_MAPPINGS) {
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      
      yield {
        id: `industry:${mapping.contextId}`,
        contextType: 'industry',
        name: mapping.contextName,
        status: getMappingStatus(mapping),
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2)
      };
    }
  }
  
  // Framework mappings
  if (contextType === 'all' || contextType === 'framework') {
    for (const mapping of FRAMEWORK_CAPABILITY_MAPPINGS) {
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      
      yield {
        id: `framework:${mapping.contextId}`,
        contextType: 'framework',
        name: mapping.contextName,
        status: getMappingStatus(mapping),
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2)
      };
    }
  }
  
  // Visual mappings
  if (contextType === 'all' || contextType === 'visual') {
    for (const mapping of VISUAL_CAPABILITY_MAPPINGS) {
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      
      yield {
        id: `visual:${mapping.contextId}`,
        contextType: 'visual',
        name: mapping.contextName,
        status: getMappingStatus(mapping),
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2)
      };
    }
  }
  
  // Output mappings
  if (contextType === 'all' || contextType === 'output') {
    for (const mapping of OUTPUT_CAPABILITY_MAPPINGS) {
      const providers = Object.values(mapping.recommendedProviders)
        .filter(Boolean)
        .flatMap(p => p!.flatMap(x => x.providers));
      const models = mapping.recommendedModels.flatMap(m => m.modelIds);
      
      yield {
        id: `output:${mapping.contextId}`,
        contextType: 'output',
        name: mapping.contextName,
        status: getMappingStatus(mapping),
        criticalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'critical').length,
        recommendedFeatures: mapping.requiredFeatures.filter(f => f.priority === 'recommended').length,
        optionalFeatures: mapping.requiredFeatures.filter(f => f.priority === 'optional').length,
        providers: [...new Set(providers)],
        models: [...new Set(models)],
        scenarios: mapping.scenarios.length,
        useCases: mapping.useCases.length,
        constraints: mapping.constraints.length,
        crossDeps: 0,
        opportunities: mapping.useCases.slice(0, 2)
      };
    }
  }
  
  // Feature mappings (filtered by category if provided)
  if (contextType === 'all' || contextType === 'feature') {
    const features = categoryFilter && categoryFilter !== 'all'
      ? FEATURE_CONTEXT_MAPPINGS.filter(f => f.category === categoryFilter)
      : FEATURE_CONTEXT_MAPPINGS;
    
    for (const mapping of features) {
      const contextCount = LOOKUP_MAPS.featureToContexts.get(mapping.featureId)?.size || 0;
      
      yield {
        id: `feature:${mapping.featureId}`,
        contextType: 'feature',
        name: mapping.featureName,
        status: getFeatureStatus(mapping),
        criticalFeatures: mapping.usedByIndustries.filter(i => i.priority === 'primary').length,
        recommendedFeatures: mapping.usedByIndustries.filter(i => i.priority === 'secondary').length,
        optionalFeatures: 0,
        providers: [], // Will be enriched from forward mappings
        models: [],
        scenarios: contextCount,
        useCases: mapping.usedByTemplates.length,
        constraints: 0,
        crossDeps: mapping.dependsOn.length + mapping.enablesFeatures.length,
        gapReason: contextCount === 0 ? 'No context mappings defined' : undefined
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
  
  // Summary stats (computed from visible rows)
  const stats = useMemo(() => {
    const all = [...generateCoverageRows('all', selectedCategory)];
    return {
      total: all.length,
      complete: all.filter(r => r.status === 'complete').length,
      partial: all.filter(r => r.status === 'partial').length,
      pending: all.filter(r => r.status === 'pending').length,
      gap: all.filter(r => r.status === 'gap').length,
      opportunity: all.filter(r => r.status === 'new-opportunity').length,
      totalScenarios: all.reduce((sum, r) => sum + r.scenarios, 0),
      totalUseCases: all.reduce((sum, r) => sum + r.useCases, 0),
      totalConstraints: all.reduce((sum, r) => sum + r.constraints, 0),
      totalCrossDeps: all.reduce((sum, r) => sum + r.crossDeps, 0)
    };
  }, [selectedCategory]);
  
  const coveragePercent = stats.total > 0 
    ? Math.round(((stats.complete + stats.partial * 0.5) / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats Bar */}
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
          <span>•</span>
          <span>{stats.totalUseCases} use cases</span>
          <span>•</span>
          <span>{stats.totalCrossDeps} dependencies</span>
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
              <TableHead className="w-40">Name</TableHead>
              <TableHead className="w-20 text-center">Status</TableHead>
              <TableHead className="w-24 text-center">Features</TableHead>
              <TableHead className="w-32">Providers</TableHead>
              <TableHead className="w-32">Models</TableHead>
              <TableHead className="w-16 text-center">Scenarios</TableHead>
              <TableHead className="w-16 text-center">Use Cases</TableHead>
              <TableHead className="w-16 text-center">Deps</TableHead>
              <TableHead className="w-16 text-center">Warnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => {
              const statusConfig = STATUS_CONFIG[row.status];
              const contextBadge = CONTEXT_BADGES[row.contextType];
              const StatusIcon = statusConfig.icon;
              
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
                    <span className="text-xs font-medium truncate block max-w-[140px]" title={row.name}>
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
                      <span className="text-amber-500">/{row.recommendedFeatures}★</span>
                      <span className="text-muted-foreground">/{row.optionalFeatures}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-1.5">
                    <div className="flex flex-wrap gap-0.5">
                      {row.providers.slice(0, 3).map(p => (
                        <span key={p} className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary">
                          {p}
                        </span>
                      ))}
                      {row.providers.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{row.providers.length - 3}</span>
                      )}
                      {row.providers.length === 0 && (
                        <span className="text-[8px] text-muted-foreground italic">None</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-1.5">
                    <div className="flex flex-wrap gap-0.5">
                      {row.models.slice(0, 2).map(m => (
                        <span key={m} className="text-[8px] px-1 py-0.5 rounded bg-secondary/50">
                          {m}
                        </span>
                      ))}
                      {row.models.length > 2 && (
                        <span className="text-[8px] text-muted-foreground">+{row.models.length - 2}</span>
                      )}
                      {row.models.length === 0 && (
                        <span className="text-[8px] text-muted-foreground italic">—</span>
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
                      <Badge variant="outline" className="text-[9px] bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                        {row.crossDeps}
                      </Badge>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-1.5 text-center">
                    {row.constraints > 0 ? (
                      <Badge variant="outline" className="text-[9px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        {row.constraints}⚠
                      </Badge>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">✓</span>
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
          </TableBody>
        </Table>
      </ScrollArea>
      
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
        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-400 mb-2">
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
