/**
 * Generation Coverage Tab
 * 
 * Visualizes bidirectional mappings between high-level generation context
 * (Industry, Framework, Template, Visual Features, Output Types)
 * and low-level AI capabilities (Providers, Models, Features)
 * 
 * OPTIMIZATIONS IMPLEMENTED:
 * 1. Hash maps for O(1) lookups (LOOKUP_MAPS in GenerationCoverageTable)
 * 2. Generator functions for lazy/on-demand row computation
 * 3. Flat table view for high-density display (no nested cards)
 * 4. Dynamic filtering synced with category selection
 * 5. UNIFIED METRICS ENGINE - synced with other tabs
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Building2, Compass, Layers, Image, FileOutput, 
  ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronRight, Info, Zap, Target, Table2, LayoutGrid,
  TrendingUp, Sparkles
} from 'lucide-react';
import { 
  GENERATION_COVERAGE_REGISTRY,
  INDUSTRY_CAPABILITY_MAPPINGS,
  FRAMEWORK_CAPABILITY_MAPPINGS,
  VISUAL_CAPABILITY_MAPPINGS,
  OUTPUT_CAPABILITY_MAPPINGS,
  FEATURE_CONTEXT_MAPPINGS
} from './generationCoverageRegistry';
import { ContextToCapabilityMapping, CapabilityToContextMapping } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GenerationCoverageTable } from './GenerationCoverageTable';
import { calculateUnifiedMetrics, getGenerationCoverageStatsForCategory } from './unifiedMetricsEngine';
import type { FeatureCategory } from '../types';

type ViewMode = 'forward' | 'backward';
type DisplayMode = 'table' | 'cards';
type ContextType = 'industry' | 'framework' | 'visual' | 'output' | 'feature';

const CONTEXT_ICONS: Record<ContextType, React.ElementType> = {
  industry: Building2,
  framework: Compass,
  visual: Image,
  output: FileOutput,
  feature: Zap
};

const CONTEXT_COLORS: Record<ContextType, string> = {
  industry: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  framework: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  visual: 'bg-green-500/20 text-green-400 border-green-500/30',
  output: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  feature: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};

interface GenerationCoverageTabProps {
  selectedCategory?: string;
  onSelectContext?: (type: ContextType, id: string) => void;
}

export const GenerationCoverageTab: React.FC<GenerationCoverageTabProps> = ({ 
  selectedCategory,
  onSelectContext 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('forward');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('table');
  const [selectedContext, setSelectedContext] = useState<ContextType>('industry');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Get current mappings based on selected context
  const currentMappings = useMemo(() => {
    if (viewMode === 'forward') {
      switch (selectedContext) {
        case 'industry': return INDUSTRY_CAPABILITY_MAPPINGS;
        case 'framework': return FRAMEWORK_CAPABILITY_MAPPINGS;
        case 'visual': return VISUAL_CAPABILITY_MAPPINGS;
        case 'output': return OUTPUT_CAPABILITY_MAPPINGS;
        default: return [];
      }
    } else {
      return FEATURE_CONTEXT_MAPPINGS;
    }
  }, [viewMode, selectedContext]);

  // USE UNIFIED METRICS ENGINE - synced with other tabs
  const unifiedMetrics = useMemo(() => {
    const categoryFilter = (selectedCategory === 'all' || !selectedCategory) 
      ? 'all' 
      : selectedCategory as FeatureCategory;
    return calculateUnifiedMetrics(categoryFilter);
  }, [selectedCategory]);
  
  // Get generation coverage specific stats (filtered by category)
  const coverageStats = useMemo(() => {
    const categoryFilter = (selectedCategory === 'all' || !selectedCategory) 
      ? 'all' 
      : selectedCategory as FeatureCategory;
    return getGenerationCoverageStatsForCategory(categoryFilter);
  }, [selectedCategory]);

  // Summary stats - NOW FROM UNIFIED ENGINE
  const stats = useMemo(() => {
    return {
      industries: coverageStats.industries,
      frameworks: coverageStats.frameworks,
      visuals: coverageStats.visuals,
      outputs: coverageStats.outputs,
      features: unifiedMetrics.features.total,
      totalMappings: coverageStats.industries + coverageStats.frameworks + coverageStats.visuals + coverageStats.outputs,
      // These now match with other tabs!
      scenarios: unifiedMetrics.scenarios.total,
      useCases: unifiedMetrics.useCases.total,
      // NEW: Breakdown info
      newScenarios: coverageStats.newScenarios,
      newUseCases: coverageStats.newUseCases,
      providers: unifiedMetrics.providers.total,
      gaps: coverageStats.gaps,
      opportunities: coverageStats.opportunities
    };
  }, [unifiedMetrics, coverageStats]);

  // Category label for display
  const categoryLabel = selectedCategory === 'all' || !selectedCategory 
    ? 'All Categories' 
    : selectedCategory;

  return (
    <div className="space-y-4">
      {/* Category Indicator */}
      {selectedCategory && selectedCategory !== 'all' && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Showing metrics filtered for <strong className="text-primary">{categoryLabel}</strong> category
          </span>
        </div>
      )}

      {/* Header Stats Grid - Compact 2-row layout */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          {/* Row 1: Context counts */}
          <div className="flex items-center gap-2">
            {[
              { label: 'Industries', value: stats.industries, type: 'industry' as ContextType },
              { label: 'Frameworks', value: stats.frameworks, type: 'framework' as ContextType },
              { label: 'Visuals', value: stats.visuals, type: 'visual' as ContextType },
              { label: 'Outputs', value: stats.outputs, type: 'output' as ContextType },
              { label: 'Features', value: stats.features, type: 'feature' as ContextType },
            ].map((stat, idx) => {
              const Icon = CONTEXT_ICONS[stat.type];
              return (
                <Card 
                  key={`context-${idx}`} 
                  className={`cursor-pointer transition-all flex-1 ${selectedContext === stat.type ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => {
                    setSelectedContext(stat.type);
                    if (stat.type === 'feature') setViewMode('backward');
                    else setViewMode('forward');
                  }}
                >
                  <CardContent className="p-2 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <div>
                      <div className="text-sm font-bold">{stat.value}</div>
                      <div className="text-[8px] text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Row 2: Metrics with breakdown */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
              <Target className="h-3 w-3 text-primary" />
              <span className="font-bold">{stats.scenarios}</span>
              <span className="text-muted-foreground">Scenarios</span>
              {stats.newScenarios > 0 && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-primary/30 text-primary">+{stats.newScenarios}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
              <Zap className="h-3 w-3 text-foreground" />
              <span className="font-bold">{stats.useCases}</span>
              <span className="text-muted-foreground">Use Cases</span>
              {stats.newUseCases > 0 && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-primary/30 text-primary">+{stats.newUseCases}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
              <span className="font-bold">{stats.providers}</span>
              <span className="text-muted-foreground">Providers</span>
            </div>
            {stats.gaps > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/10">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                <span className="font-bold text-destructive">{stats.gaps}</span>
                <span className="text-muted-foreground">Gaps</span>
              </div>
            )}
            {stats.opportunities > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="font-bold text-primary">{stats.opportunities}</span>
                <span className="text-muted-foreground">Opps</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Display Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
          <Button
            variant={displayMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDisplayMode('table')}
            className="h-7 px-2"
          >
            <Table2 className="h-3.5 w-3.5 mr-1" />
            Table
          </Button>
          <Button
            variant={displayMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDisplayMode('cards')}
            className="h-7 px-2"
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1" />
            Cards
          </Button>
        </div>
      </div>

      {/* TABLE VIEW (Optimized) */}
      {displayMode === 'table' && (
        <GenerationCoverageTable selectedCategory={selectedCategory} />
      )}

      {/* CARDS VIEW (Original) */}
      {displayMode === 'cards' && (
        <>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-4 p-2 bg-muted/30 rounded-lg">
            <button 
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${viewMode === 'forward' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setViewMode('forward')}
            >
              <ArrowRight className="h-4 w-4" />
              Forward: Context → Capabilities
            </button>
            <button 
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${viewMode === 'backward' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setViewMode('backward')}
            >
              <ArrowLeft className="h-4 w-4" />
              Backward: Features → Contexts
            </button>
          </div>

          {/* Main Content */}
          {viewMode === 'forward' ? (
            <ForwardMappingView 
              mappings={currentMappings as ContextToCapabilityMapping[]}
              contextType={selectedContext}
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
            />
          ) : (
            <BackwardMappingView 
              mappings={FEATURE_CONTEXT_MAPPINGS}
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
            />
          )}
        </>
      )}
    </div>
  );
};

// Forward Mapping View: Context → Capabilities
interface ForwardMappingViewProps {
  mappings: ContextToCapabilityMapping[];
  contextType: ContextType;
  expandedRows: Set<string>;
  onToggleRow: (id: string) => void;
}

const ForwardMappingView: React.FC<ForwardMappingViewProps> = ({ 
  mappings, contextType, expandedRows, onToggleRow 
}) => {
  if (mappings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No mappings found for this context type
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2">
        {mappings.map(mapping => (
          <ForwardMappingRow 
            key={mapping.contextId}
            mapping={mapping}
            contextType={contextType}
            isExpanded={expandedRows.has(mapping.contextId)}
            onToggle={() => onToggleRow(mapping.contextId)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

interface ForwardMappingRowProps {
  mapping: ContextToCapabilityMapping;
  contextType: ContextType;
  isExpanded: boolean;
  onToggle: () => void;
}

const ForwardMappingRow: React.FC<ForwardMappingRowProps> = ({ 
  mapping, contextType, isExpanded, onToggle 
}) => {
  const Icon = CONTEXT_ICONS[contextType];
  const colorClass = CONTEXT_COLORS[contextType];
  
  const criticalFeatures = mapping.requiredFeatures.filter(f => f.priority === 'critical').length;
  const hasWarnings = mapping.constraints.some(c => c.severity === 'warning' || c.severity === 'incompatible');

  return (
    <Card className="overflow-hidden">
      <div 
        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        
        <Badge variant="outline" className={colorClass}>
          <Icon className="h-3 w-3 mr-1" />
          {mapping.contextName}
        </Badge>

        <div className="flex-1 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="text-[10px]">
                  {criticalFeatures} Critical
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Critical features required</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Provider badges */}
          <div className="flex gap-1">
            {Object.entries(mapping.recommendedProviders).slice(0, 3).map(([type, providers]) => (
              <TooltipProvider key={type}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-[9px] px-1">
                      {type.charAt(0).toUpperCase()}: {providers.flatMap(p => p.providers).slice(0, 2).join(', ')}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-medium">{type} providers</div>
                      {providers.map((p, i) => (
                        <div key={i} className="text-muted-foreground">{p.providers.join(', ')}: {p.reason}</div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {hasWarnings && (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        )}
        
        <Badge variant="outline" className="text-[10px]">
          {mapping.scenarios.length} scenarios
        </Badge>
      </div>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-3 space-y-3 bg-muted/20">
          {/* Required Features */}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground mb-1">Required Features</div>
            <div className="flex flex-wrap gap-1">
              {mapping.requiredFeatures.map(f => (
                <Badge 
                  key={f.featureId} 
                  variant={f.priority === 'critical' ? 'destructive' : f.priority === 'recommended' ? 'default' : 'secondary'}
                  className="text-[9px]"
                >
                  {f.featureId} ({f.category})
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommended Models */}
          {mapping.recommendedModels.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Recommended Models</div>
              <div className="flex flex-wrap gap-1">
                {mapping.recommendedModels.map((m, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-[9px]">
                          {m.type}: {m.modelIds.slice(0, 2).join(', ')} (T{m.tier})
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{m.reason}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* Compatible Contexts */}
          {mapping.compatibleWith && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Compatible With</div>
              <div className="flex flex-wrap gap-1">
                {mapping.compatibleWith.industries?.map(id => (
                  <Badge key={id} variant="outline" className={`text-[9px] ${CONTEXT_COLORS.industry}`}>{id}</Badge>
                ))}
                {mapping.compatibleWith.frameworks?.map(id => (
                  <Badge key={id} variant="outline" className={`text-[9px] ${CONTEXT_COLORS.framework}`}>{id}</Badge>
                ))}
                {mapping.compatibleWith.visuals?.map(id => (
                  <Badge key={id} variant="outline" className={`text-[9px] ${CONTEXT_COLORS.visual}`}>{id}</Badge>
                ))}
                {mapping.compatibleWith.outputs?.map(id => (
                  <Badge key={id} variant="outline" className={`text-[9px] ${CONTEXT_COLORS.output}`}>{id}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {mapping.constraints.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Constraints</div>
              <div className="space-y-1">
                {mapping.constraints.map((c, i) => (
                  <div key={i} className={`text-[10px] flex items-center gap-1 p-1 rounded ${
                    c.severity === 'incompatible' ? 'bg-red-500/20 text-red-400' :
                    c.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-muted'
                  }`}>
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">{c.contextId}:</span> {c.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenarios & Use Cases */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Scenarios</div>
              <div className="text-[10px] text-muted-foreground">
                {mapping.scenarios.join(' • ')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Use Cases</div>
              <div className="text-[10px] text-muted-foreground">
                {mapping.useCases.join(' • ')}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Backward Mapping View: Features → Contexts
interface BackwardMappingViewProps {
  mappings: CapabilityToContextMapping[];
  expandedRows: Set<string>;
  onToggleRow: (id: string) => void;
}

const BackwardMappingView: React.FC<BackwardMappingViewProps> = ({ 
  mappings, expandedRows, onToggleRow 
}) => {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2">
        {mappings.map(mapping => (
          <BackwardMappingRow 
            key={mapping.featureId}
            mapping={mapping}
            isExpanded={expandedRows.has(mapping.featureId)}
            onToggle={() => onToggleRow(mapping.featureId)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

interface BackwardMappingRowProps {
  mapping: CapabilityToContextMapping;
  isExpanded: boolean;
  onToggle: () => void;
}

const BackwardMappingRow: React.FC<BackwardMappingRowProps> = ({ 
  mapping, isExpanded, onToggle 
}) => {
  const totalUsage = 
    mapping.usedByIndustries.length +
    mapping.usedByFrameworks.length +
    mapping.usedByTemplates.length +
    mapping.usedByVisuals.length +
    mapping.usedByOutputs.length;

  return (
    <Card className="overflow-hidden">
      <div 
        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        
        <Badge variant="outline" className={CONTEXT_COLORS.feature}>
          <Zap className="h-3 w-3 mr-1" />
          {mapping.featureName}
        </Badge>

        <Badge variant="secondary" className="text-[10px]">
          {mapping.category}
        </Badge>

        <div className="flex-1" />

        <Badge variant="outline" className="text-[10px]">
          Used by {totalUsage} contexts
        </Badge>

        {mapping.dependsOn.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] text-yellow-400">
                  Depends: {mapping.dependsOn.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Depends on: {mapping.dependsOn.map(d => d.featureId).join(', ')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {mapping.enablesFeatures.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] text-green-400">
                  Enables: {mapping.enablesFeatures.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Enables: {mapping.enablesFeatures.map(d => d.featureId).join(', ')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-3 space-y-3 bg-muted/20">
          {/* Used By Industries */}
          {mapping.usedByIndustries.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Used by Industries</div>
              <div className="flex flex-wrap gap-1">
                {mapping.usedByIndustries.map(u => (
                  <Badge 
                    key={u.id} 
                    variant={u.priority === 'primary' ? 'default' : 'secondary'}
                    className={`text-[9px] ${CONTEXT_COLORS.industry}`}
                  >
                    {u.id} {u.priority === 'primary' && '★'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Used By Frameworks */}
          {mapping.usedByFrameworks.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Used by Frameworks</div>
              <div className="flex flex-wrap gap-1">
                {mapping.usedByFrameworks.map(u => (
                  <Badge 
                    key={u.id} 
                    variant={u.priority === 'primary' ? 'default' : 'secondary'}
                    className={`text-[9px] ${CONTEXT_COLORS.framework}`}
                  >
                    {u.id} {u.priority === 'primary' && '★'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Used By Outputs */}
          {mapping.usedByOutputs.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Used by Outputs</div>
              <div className="flex flex-wrap gap-1">
                {mapping.usedByOutputs.map(u => (
                  <Badge 
                    key={u.id} 
                    variant={u.priority === 'primary' ? 'default' : 'secondary'}
                    className={`text-[9px] ${CONTEXT_COLORS.output}`}
                  >
                    {u.id} {u.priority === 'primary' && '★'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Depends On</div>
              <div className="flex flex-wrap gap-1">
                {mapping.dependsOn.length > 0 ? mapping.dependsOn.map(d => (
                  <Badge key={d.featureId} variant="outline" className="text-[9px] text-yellow-400">
                    {d.featureId}
                  </Badge>
                )) : <span className="text-[10px] text-muted-foreground">None</span>}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Enables</div>
              <div className="flex flex-wrap gap-1">
                {mapping.enablesFeatures.length > 0 ? mapping.enablesFeatures.map(d => (
                  <Badge key={d.featureId} variant="outline" className="text-[9px] text-green-400">
                    {d.featureId}
                  </Badge>
                )) : <span className="text-[10px] text-muted-foreground">None</span>}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default GenerationCoverageTab;
