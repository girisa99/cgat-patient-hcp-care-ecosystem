/**
 * Implementation Tracker Component
 * 
 * Shows NET NEW items to implement from all sources:
 * - Feature Matrix: Base features (implemented, partial, not started)
 * - Cross-Functional: New scenarios/use cases via dependencies
 * - Gen Coverage: New scenarios/use cases via context mapping
 * 
 * Tracks: Gaps, Opportunities, Missing, Not Started
 * Dynamic per category and totals
 */

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Target, Layers, Zap,
  ArrowRight, ChevronDown, ChevronUp, Filter, Plus, ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateUnifiedMetrics, getGenerationCoverageStatsForCategory } from './generation-coverage/unifiedMetricsEngine';
import { CROSS_FUNCTIONAL_MAPPINGS, FEATURE_USE_CASES, ALL_FEATURES, FEATURE_IMPLEMENTATION_MATRIX } from './matrixData';
import type { FeatureCategory } from './types';

export type ImplementationStatus = 'gap' | 'opportunity' | 'not-started' | 'missing' | 'partial';
export type SourceType = 'feature-matrix' | 'cross-functional' | 'gen-coverage';

interface ImplementationItem {
  id: string;
  name: string;
  type: 'scenario' | 'use-case' | 'feature' | 'provider';
  status: ImplementationStatus;
  source: SourceType;
  sourceDetail: string; // e.g., "Healthcare Industry", "TTS Feature Dependency"
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: FeatureCategory | 'all';
  dependencies?: string[];
  blockedBy?: string[];
}

interface ImplementationTrackerProps {
  selectedCategory: FeatureCategory | 'all';
  onNavigateToSource?: (source: SourceType, itemId?: string) => void;
}

export const ImplementationTracker: React.FC<ImplementationTrackerProps> = ({
  selectedCategory,
  onNavigateToSource
}) => {
  const [statusFilter, setStatusFilter] = useState<ImplementationStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Calculate all implementation items
  const implementationItems = useMemo(() => {
    const items: ImplementationItem[] = [];
    const metrics = calculateUnifiedMetrics(selectedCategory, FEATURE_IMPLEMENTATION_MATRIX);
    const coverageStats = getGenerationCoverageStatsForCategory(selectedCategory);
    
    // 1. GAPS from Feature Matrix (features with no implementation)
    metrics.gaps.features.forEach((featureName, index) => {
      items.push({
        id: `gap-feature-${index}`,
        name: featureName,
        type: 'feature',
        status: 'gap',
        source: 'feature-matrix',
        sourceDetail: 'No provider implementations',
        priority: 'critical',
        effort: 'high',
        category: selectedCategory,
      });
    });
    
    // 2. NOT STARTED features from Feature Matrix
    const categoryFeatures = selectedCategory === 'all' 
      ? ALL_FEATURES 
      : ALL_FEATURES.filter(f => f.category === selectedCategory);
    
    categoryFeatures.forEach(feature => {
      const impl = FEATURE_IMPLEMENTATION_MATRIX[feature.id];
      if (!impl || Object.keys(impl).length === 0) {
        // Already counted as gap
      } else {
        const allNotStarted = Object.values(impl).every(
          i => i?.implementation === 'not_started'
        );
        if (allNotStarted) {
          items.push({
            id: `not-started-${feature.id}`,
            name: feature.name,
            type: 'feature',
            status: 'not-started',
            source: 'feature-matrix',
            sourceDetail: 'Planned but not started',
            priority: 'high',
            effort: 'medium',
            category: feature.category,
          });
        }
      }
    });
    
    // 3. NEW SCENARIOS from Cross-Functional (via dependencies)
    const relevantCFM = CROSS_FUNCTIONAL_MAPPINGS.filter(m =>
      selectedCategory === 'all' || m.primaryCategory === selectedCategory
    );
    
    const baseScenarios = new Set<string>();
    categoryFeatures.forEach(f => {
      const uc = FEATURE_USE_CASES[f.id];
      if (uc?.scenarios) uc.scenarios.forEach(s => baseScenarios.add(s));
    });
    
    relevantCFM.forEach(mapping => {
      mapping.scenarios?.forEach(scenario => {
        if (!baseScenarios.has(scenario)) {
          items.push({
            id: `cross-scenario-${scenario.replace(/\s+/g, '-').toLowerCase()}`,
            name: scenario,
            type: 'scenario',
            status: 'opportunity',
            source: 'cross-functional',
            sourceDetail: `Via ${mapping.primaryFeatureId} dependency`,
            priority: 'medium',
            effort: 'low',
            category: mapping.primaryCategory,
          });
        }
      });
      
      mapping.useCases?.forEach(useCase => {
        const baseUseCases = new Set<string>();
        categoryFeatures.forEach(f => {
          const uc = FEATURE_USE_CASES[f.id];
          if (uc?.bestFor) uc.bestFor.forEach(b => baseUseCases.add(b));
        });
        
        if (!baseUseCases.has(useCase)) {
          items.push({
            id: `cross-usecase-${useCase.replace(/\s+/g, '-').toLowerCase()}`,
            name: useCase,
            type: 'use-case',
            status: 'opportunity',
            source: 'cross-functional',
            sourceDetail: `Via ${mapping.primaryFeatureId} dependency`,
            priority: 'medium',
            effort: 'low',
            category: mapping.primaryCategory,
          });
        }
      });
    });
    
    // 4. NEW SCENARIOS/USE CASES from Gen Coverage (via context mapping)
    metrics.opportunities.newScenarios.forEach(scenario => {
      items.push({
        id: `gen-scenario-${scenario.replace(/\s+/g, '-').toLowerCase()}`,
        name: scenario,
        type: 'scenario',
        status: 'opportunity',
        source: 'gen-coverage',
        sourceDetail: 'Discovered via Industry/Framework/Visual/Output mapping',
        priority: 'medium',
        effort: 'medium',
        category: selectedCategory,
      });
    });
    
    metrics.opportunities.newUseCases.forEach(useCase => {
      items.push({
        id: `gen-usecase-${useCase.replace(/\s+/g, '-').toLowerCase()}`,
        name: useCase,
        type: 'use-case',
        status: 'opportunity',
        source: 'gen-coverage',
        sourceDetail: 'Discovered via Industry/Framework/Visual/Output mapping',
        priority: 'medium',
        effort: 'medium',
        category: selectedCategory,
      });
    });
    
    // 5. MISSING PROVIDERS
    metrics.gaps.providers.forEach(providerName => {
      items.push({
        id: `missing-provider-${providerName.replace(/\s+/g, '-').toLowerCase()}`,
        name: providerName,
        type: 'provider',
        status: 'missing',
        source: 'feature-matrix',
        sourceDetail: 'Provider not integrated for this category',
        priority: 'high',
        effort: 'high',
        category: selectedCategory,
      });
    });
    
    return items;
  }, [selectedCategory]);

  // Filter items
  const filteredItems = useMemo(() => {
    return implementationItems.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      return true;
    });
  }, [implementationItems, statusFilter, sourceFilter]);

  // Group by source
  const groupedBySource = useMemo(() => {
    const groups: Record<SourceType, ImplementationItem[]> = {
      'feature-matrix': [],
      'cross-functional': [],
      'gen-coverage': [],
    };
    
    filteredItems.forEach(item => {
      groups[item.source].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  // Summary stats
  const summary = useMemo(() => ({
    total: implementationItems.length,
    gaps: implementationItems.filter(i => i.status === 'gap').length,
    opportunities: implementationItems.filter(i => i.status === 'opportunity').length,
    notStarted: implementationItems.filter(i => i.status === 'not-started').length,
    missing: implementationItems.filter(i => i.status === 'missing').length,
    bySource: {
      featureMatrix: implementationItems.filter(i => i.source === 'feature-matrix').length,
      crossFunctional: implementationItems.filter(i => i.source === 'cross-functional').length,
      genCoverage: implementationItems.filter(i => i.source === 'gen-coverage').length,
    },
  }), [implementationItems]);

  const categoryLabel = selectedCategory === 'all' ? 'All Categories' : selectedCategory;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Implementation Tracker</span>
          <Badge variant="outline" className="text-[9px]">{categoryLabel}</Badge>
        </div>
        <div className="text-[9px] text-muted-foreground">
          {summary.total} items to implement
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2">
        <SummaryCard
          icon={<AlertTriangle className="h-3 w-3 text-destructive" />}
          label="Gaps"
          value={summary.gaps}
          sublabel="No implementation"
          color="destructive"
          onClick={() => setStatusFilter(statusFilter === 'gap' ? 'all' : 'gap')}
          isActive={statusFilter === 'gap'}
        />
        <SummaryCard
          icon={<Plus className="h-3 w-3 text-blue-500" />}
          label="Opportunities"
          value={summary.opportunities}
          sublabel="New identified"
          color="blue"
          onClick={() => setStatusFilter(statusFilter === 'opportunity' ? 'all' : 'opportunity')}
          isActive={statusFilter === 'opportunity'}
        />
        <SummaryCard
          icon={<Clock className="h-3 w-3 text-amber-500" />}
          label="Not Started"
          value={summary.notStarted}
          sublabel="Planned"
          color="amber"
          onClick={() => setStatusFilter(statusFilter === 'not-started' ? 'all' : 'not-started')}
          isActive={statusFilter === 'not-started'}
        />
        <SummaryCard
          icon={<AlertTriangle className="h-3 w-3 text-purple-500" />}
          label="Missing"
          value={summary.missing}
          sublabel="Providers"
          color="purple"
          onClick={() => setStatusFilter(statusFilter === 'missing' ? 'all' : 'missing')}
          isActive={statusFilter === 'missing'}
        />
      </div>

      {/* Source Breakdown */}
      <div className="bg-muted/30 rounded-lg p-2">
        <div className="text-[9px] font-medium mb-1.5">Items by Source</div>
        <div className="flex gap-2">
          <SourceBadge
            icon={<CheckCircle2 className="h-3 w-3" />}
            label="Feature Matrix"
            value={summary.bySource.featureMatrix}
            color="emerald"
            onClick={() => setSourceFilter(sourceFilter === 'feature-matrix' ? 'all' : 'feature-matrix')}
            isActive={sourceFilter === 'feature-matrix'}
          />
          <SourceBadge
            icon={<Zap className="h-3 w-3" />}
            label="Cross-Functional"
            value={summary.bySource.crossFunctional}
            color="purple"
            onClick={() => setSourceFilter(sourceFilter === 'cross-functional' ? 'all' : 'cross-functional')}
            isActive={sourceFilter === 'cross-functional'}
          />
          <SourceBadge
            icon={<Layers className="h-3 w-3" />}
            label="Gen Coverage"
            value={summary.bySource.genCoverage}
            color="blue"
            onClick={() => setSourceFilter(sourceFilter === 'gen-coverage' ? 'all' : 'gen-coverage')}
            isActive={sourceFilter === 'gen-coverage'}
          />
        </div>
      </div>

      {/* Implementation Items by Source */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-7">
          <TabsTrigger value="all" className="text-[9px]">All ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="feature-matrix" className="text-[9px]">Feature ({groupedBySource['feature-matrix'].length})</TabsTrigger>
          <TabsTrigger value="cross-functional" className="text-[9px]">Cross ({groupedBySource['cross-functional'].length})</TabsTrigger>
          <TabsTrigger value="gen-coverage" className="text-[9px]">Gen ({groupedBySource['gen-coverage'].length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-2">
          <ScrollArea className="h-[300px]">
            <ItemList 
              items={filteredItems} 
              expandedItems={expandedItems}
              onToggleExpand={(id) => {
                const newSet = new Set(expandedItems);
                if (newSet.has(id)) newSet.delete(id);
                else newSet.add(id);
                setExpandedItems(newSet);
              }}
              onNavigate={onNavigateToSource}
            />
          </ScrollArea>
        </TabsContent>

        {(['feature-matrix', 'cross-functional', 'gen-coverage'] as SourceType[]).map(source => (
          <TabsContent key={source} value={source} className="mt-2">
            <ScrollArea className="h-[300px]">
              <ItemList 
                items={groupedBySource[source]} 
                expandedItems={expandedItems}
                onToggleExpand={(id) => {
                  const newSet = new Set(expandedItems);
                  if (newSet.has(id)) newSet.delete(id);
                  else newSet.add(id);
                  setExpandedItems(newSet);
                }}
                onNavigate={onNavigateToSource}
              />
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* What This Means */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 text-[8px]">
        <div className="font-semibold text-foreground mb-1">Understanding the Delta</div>
        <ul className="space-y-0.5 text-muted-foreground">
          <li>• <strong className="text-emerald-600">Feature Matrix:</strong> Gaps = features with zero implementations. Not Started = planned but not coded.</li>
          <li>• <strong className="text-purple-600">Cross-Functional:</strong> NEW scenarios/use cases discovered via feature DEPENDENCIES (e.g., TTS unlocks video narration).</li>
          <li>• <strong className="text-blue-600">Gen Coverage:</strong> NEW scenarios/use cases discovered by mapping to CONTEXTS (Industries, Frameworks, Outputs).</li>
          <li>• <strong>Total:</strong> Deduplicated unique count. The difference shows what each source DISCOVERED beyond base definitions.</li>
        </ul>
      </div>
    </div>
  );
};

// ============================================
// SUMMARY CARD
// ============================================

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel: string;
  color: 'destructive' | 'blue' | 'amber' | 'purple';
  onClick: () => void;
  isActive: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon, label, value, sublabel, color, onClick, isActive
}) => {
  const colorClasses = {
    destructive: 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10',
    blue: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10',
    amber: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10',
    purple: 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10',
  };

  return (
    <div 
      className={`p-2 rounded-lg border cursor-pointer transition-all ${colorClasses[color]} ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-[9px] font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[8px] text-muted-foreground">{sublabel}</div>
    </div>
  );
};

// ============================================
// SOURCE BADGE
// ============================================

interface SourceBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'emerald' | 'purple' | 'blue';
  onClick: () => void;
  isActive: boolean;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({
  icon, label, value, color, onClick, isActive
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  };

  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-1 rounded border cursor-pointer transition-all ${colorClasses[color]} ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-[9px]">{label}</span>
      <Badge variant="secondary" className="text-[8px] ml-1">{value}</Badge>
    </div>
  );
};

// ============================================
// ITEM LIST
// ============================================

interface ItemListProps {
  items: ImplementationItem[];
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
  onNavigate?: (source: SourceType, itemId?: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  items, expandedItems, onToggleExpand, onNavigate
}) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-[9px] text-muted-foreground">
        No items match current filters
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map(item => (
        <ItemRow 
          key={item.id} 
          item={item} 
          isExpanded={expandedItems.has(item.id)}
          onToggle={() => onToggleExpand(item.id)}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};

// ============================================
// ITEM ROW
// ============================================

interface ItemRowProps {
  item: ImplementationItem;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate?: (source: SourceType, itemId?: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, isExpanded, onToggle, onNavigate }) => {
  const statusColors = {
    'gap': 'bg-destructive/10 text-destructive border-destructive/30',
    'opportunity': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    'not-started': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    'missing': 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    'partial': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  };

  const sourceIcons = {
    'feature-matrix': <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
    'cross-functional': <Zap className="h-3 w-3 text-purple-500" />,
    'gen-coverage': <Layers className="h-3 w-3 text-blue-500" />,
  };

  const typeLabels = {
    'scenario': 'SCEN',
    'use-case': 'USE',
    'feature': 'FEAT',
    'provider': 'PROV',
  };

  return (
    <div className={`rounded border ${statusColors[item.status]} transition-all`}>
      <div 
        className="flex items-center gap-2 p-1.5 cursor-pointer hover:bg-black/5"
        onClick={onToggle}
      >
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {sourceIcons[item.source]}
        <Badge variant="outline" className="text-[7px] px-1 py-0">
          {typeLabels[item.type]}
        </Badge>
        <span className="text-[9px] font-medium flex-1 truncate">{item.name}</span>
        <Badge className="text-[7px]" variant="secondary">
          {item.status.replace('-', ' ')}
        </Badge>
      </div>

      {isExpanded && (
        <div className="px-2 pb-2 pt-1 border-t border-border/30 space-y-1">
          <div className="text-[8px] text-muted-foreground">
            <strong>Source:</strong> {item.sourceDetail}
          </div>
          <div className="text-[8px] text-muted-foreground">
            <strong>Priority:</strong> {item.priority} | <strong>Effort:</strong> {item.effort}
          </div>
          {item.dependencies && item.dependencies.length > 0 && (
            <div className="text-[8px] text-muted-foreground">
              <strong>Dependencies:</strong> {item.dependencies.join(', ')}
            </div>
          )}
          <button
            className="text-[8px] text-primary hover:underline flex items-center gap-0.5 mt-1"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.(item.source, item.id);
            }}
          >
            <ExternalLink className="h-2.5 w-2.5" />
            View in {item.source === 'feature-matrix' ? 'Feature Matrix' : item.source === 'cross-functional' ? 'Cross-Functional' : 'Gen Coverage'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImplementationTracker;
