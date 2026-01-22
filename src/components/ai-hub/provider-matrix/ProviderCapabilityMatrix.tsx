/**
 * Provider Capability Matrix - Comprehensive Dashboard
 * Shows all features × all providers with implementation status
 * 
 * Features:
 * - Legend for status icons
 * - Dynamic height based on category selection
 * - Inline editing capability across all tabs
 * - Multi-sheet Excel export
 * - Generation Coverage Tab for Context ↔ Capability mapping
 */

import React, { useState, useMemo } from 'react';
import { Check, X, AlertCircle, Clock, Download, Search, Zap, Target, Plus, Save, Edit2, Info, FileSpreadsheet, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  ALL_FEATURES, 
  PROVIDER_SUMMARIES, 
  FEATURE_IMPLEMENTATION_MATRIX,
  CRITICAL_GAPS,
  LLM_COMPARISONS,
  ROUTING_STRATEGY,
  FEATURE_USE_CASES,
  CROSS_FUNCTIONAL_MAPPINGS,
  GENIE_PRODUCT_LABELS,
  type GenieProduct
} from './matrixData';
import type { FeatureCategory, ImplementationStatus, ProviderId, Feature } from './types';
import { GenerationCoverageTab } from './generation-coverage';
import { 
  GENERATION_COVERAGE_REGISTRY,
  INDUSTRY_CAPABILITY_MAPPINGS,
  FRAMEWORK_CAPABILITY_MAPPINGS,
  VISUAL_CAPABILITY_MAPPINGS,
  OUTPUT_CAPABILITY_MAPPINGS,
  FEATURE_CONTEXT_MAPPINGS,
  getGenerationCoverageStats
} from './generation-coverage/generationCoverageRegistry';

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  INPUT: '📥 Input',
  SCRIPT: '📝 Script',
  VOICE: '🎙️ Voice',
  AUDIO: '🎵 Audio',
  IMAGE: '🖼️ Image',
  VIDEO: '🎬 Video',
  ANIMATION: '✨ Animation',
  '3D': '🎲 3D',
  AR_VR: '🥽 AR/VR',
  VFX: '🎨 VFX',
  INTERACTIVE: '🎯 Interactive',
  TRANSLATION: '🌍 Translation',
  EXPORT: '📤 Export',
  PUBLISHING: '🚀 Publishing',
  USE_CASE: '💼 Use Case',
};

const STATUS_OPTIONS: { value: ImplementationStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'implemented', label: 'Implemented', icon: <Check className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-500/10' },
  { value: 'partial', label: 'Partial', icon: <AlertCircle className="w-4 h-4" />, color: 'text-amber-500 bg-amber-500/10' },
  { value: 'planned', label: 'Planned', icon: <Clock className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
  { value: 'not_started', label: 'Not Started', icon: <X className="w-4 h-4" />, color: 'text-muted-foreground bg-muted' },
  { value: 'not_applicable', label: 'N/A', icon: <span>—</span>, color: 'text-muted-foreground bg-transparent' },
];

const getStatusIcon = (status: ImplementationStatus | undefined) => {
  const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[4];
  return <span className={opt.color}>{opt.icon}</span>;
};

const COST_BADGES: Record<string, React.ReactNode> = {
  '$': <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px]">$ Budget</Badge>,
  '$$': <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-[10px]">$$ Standard</Badge>,
  '$$$': <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-[10px]">$$$ Premium</Badge>,
};

// Legend Component
const MatrixLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/30 border text-xs">
    <div className="flex items-center gap-1 font-medium text-muted-foreground">
      <Info className="w-3.5 h-3.5" /> Legend:
    </div>
    {STATUS_OPTIONS.map(opt => (
      <div key={opt.value} className="flex items-center gap-1.5">
        <span className={`flex items-center justify-center w-5 h-5 rounded ${opt.color}`}>
          {opt.icon}
        </span>
        <span className="text-muted-foreground">{opt.label}</span>
      </div>
    ))}
  </div>
);

// Add Feature Dialog
const AddFeatureDialog: React.FC<{
  onAdd: (feature: Feature) => void;
  existingCategories: FeatureCategory[];
}> = ({ onAdd, existingCategories }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FeatureCategory>('INPUT');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error('Please enter a feature name');
      return;
    }
    const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    onAdd({ id, name, category, priority });
    setName('');
    setOpen(false);
    toast.success(`Added "${name}" to ${category}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Feature
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Feature Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Real-time Preview"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FeatureCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {existingCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add Feature</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ProviderCapabilityMatrix: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'matrix' | 'providers' | 'gaps' | 'llm' | 'category' | 'crossfunc' | 'coverage'>('matrix');
  const [editMode, setEditMode] = useState(false);
  const [localFeatures, setLocalFeatures] = useState<Feature[]>([...ALL_FEATURES]);
  const [localMatrix, setLocalMatrix] = useState({ ...FEATURE_IMPLEMENTATION_MATRIX });
  const [editingCell, setEditingCell] = useState<{ featureId: string; providerId: string } | null>(null);

  const filteredFeatures = useMemo(() => {
    return localFeatures.filter(f => {
      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm, localFeatures]);

  // Compute per-feature stats dynamically from localMatrix
  const computeFeatureStats = (featureId: string) => {
    const featureImpl = localMatrix[featureId] || {};
    const statuses = Object.values(featureImpl).map(p => p?.implementation).filter(Boolean);
    
    return {
      implemented: statuses.filter(s => s === 'implemented').length,
      partial: statuses.filter(s => s === 'partial').length,
      planned: statuses.filter(s => s === 'planned').length,
      notStarted: statuses.filter(s => s === 'not_started').length,
      notApplicable: PROVIDER_SUMMARIES.length - statuses.length,
      total: PROVIDER_SUMMARIES.length,
      hasAnyImplementation: statuses.includes('implemented') || statuses.includes('partial'),
    };
  };

  // Compute category stats dynamically from localMatrix
  const computeCategoryStats = useMemo(() => {
    const categories: FeatureCategory[] = ['INPUT', 'SCRIPT', 'VOICE', 'AUDIO', 'IMAGE', 'VIDEO', 'ANIMATION', '3D', 'AR_VR', 'VFX', 'INTERACTIVE', 'TRANSLATION', 'EXPORT', 'PUBLISHING', 'USE_CASE'];
    
    const result: Record<FeatureCategory, { total: number; implemented: number; partial: number; planned: number; notStarted: number }> = {} as any;
    
    categories.forEach(category => {
      const categoryFeatures = localFeatures.filter(f => f.category === category);
      let implemented = 0, partial = 0, planned = 0, notStarted = 0;
      
      categoryFeatures.forEach(feature => {
        const featureImpl = localMatrix[feature.id];
        if (!featureImpl || Object.keys(featureImpl).length === 0) {
          notStarted++;
          return;
        }
        
        const statuses = Object.values(featureImpl).map(p => p?.implementation);
        if (statuses.includes('implemented')) {
          implemented++;
        } else if (statuses.includes('partial')) {
          partial++;
        } else if (statuses.includes('planned')) {
          planned++;
        } else {
          notStarted++;
        }
      });
      
      result[category] = { total: categoryFeatures.length, implemented, partial, planned, notStarted };
    });
    
    return result;
  }, [localMatrix, localFeatures]);

  // Compute overall stats from dynamic category stats
  const overallStats = useMemo(() => {
    const totals = Object.values(computeCategoryStats).reduce(
      (acc, cat) => ({
        total: acc.total + cat.total,
        implemented: acc.implemented + cat.implemented,
        partial: acc.partial + cat.partial,
        planned: acc.planned + cat.planned,
        notStarted: acc.notStarted + cat.notStarted,
      }),
      { total: 0, implemented: 0, partial: 0, planned: 0, notStarted: 0 }
    );
    return {
      ...totals,
      coverage: totals.total > 0 ? Math.round(((totals.implemented + totals.partial * 0.5) / totals.total) * 100) : 0,
    };
  }, [computeCategoryStats]);

  // Current category stats
  const currentCategoryStats = useMemo(() => {
    if (selectedCategory === 'all') return overallStats;
    return computeCategoryStats[selectedCategory] || { total: 0, implemented: 0, partial: 0, planned: 0, notStarted: 0 };
  }, [selectedCategory, computeCategoryStats, overallStats]);

  // Dynamic cross-functional metrics based on category
  const crossFunctionalMetrics = useMemo(() => {
    const categoryFeatures = selectedCategory === 'all' 
      ? localFeatures 
      : localFeatures.filter(f => f.category === selectedCategory);
    
    const featureIds = new Set(categoryFeatures.map(f => f.id));
    
    // Get mappings for this category's features
    const relevantMappings = CROSS_FUNCTIONAL_MAPPINGS.filter(m => 
      selectedCategory === 'all' || m.primaryCategory === selectedCategory || featureIds.has(m.primaryFeatureId)
    );
    
    // Collect unique scenarios, use cases, providers, LLMs, and Genie products
    const scenarios = new Set<string>();
    const useCases = new Set<string>();
    const providers = new Set<ProviderId>();
    const llms = new Set<string>();
    const genieProducts = new Set<GenieProduct>();
    
    relevantMappings.forEach(m => {
      m.scenarios?.forEach(s => scenarios.add(s));
      m.useCases?.forEach(u => useCases.add(u));
      m.recommendedProviders?.forEach(p => providers.add(p));
      m.recommendedLLMs?.forEach(l => llms.add(l));
      m.genieProducts?.forEach(g => genieProducts.add(g));
    });
    
    // Also add use cases from FEATURE_USE_CASES
    categoryFeatures.forEach(f => {
      const uc = FEATURE_USE_CASES[f.id];
      if (uc) {
        uc.scenarios?.forEach(s => scenarios.add(s));
        uc.bestFor?.forEach(b => useCases.add(b));
      }
    });
    
    // CRITICAL: Also add providers from the actual FEATURE_IMPLEMENTATION_MATRIX
    // This ensures we count all providers that have implementations for this category's features
    categoryFeatures.forEach(f => {
      const featureImpl = localMatrix[f.id];
      if (featureImpl) {
        Object.entries(featureImpl).forEach(([providerId, impl]) => {
          if (impl?.implementation === 'implemented' || impl?.implementation === 'partial') {
            providers.add(providerId as ProviderId);
          }
        });
      }
    });
    
    // Also add LLMs based on providers that are actually implemented
    providers.forEach(providerId => {
      const llmMatch = LLM_COMPARISONS.find(l => l.providerId === providerId);
      if (llmMatch) {
        llms.add(llmMatch.model);
      }
    });
    
    return {
      features: categoryFeatures.length,
      scenarios: scenarios.size,
      useCases: useCases.size,
      providers: providers.size,
      llms: llms.size,
      genieProducts: Array.from(genieProducts),
      mappings: relevantMappings,
    };
  }, [selectedCategory, localFeatures]);

  // Reverse dependency lookup: Find features that DEPEND ON a given feature
  const getRequiredByFeatures = useMemo(() => {
    const reverseMap: Record<string, Array<{ featureId: string; featureName: string; category: FeatureCategory; relationship: string }>> = {};
    
    CROSS_FUNCTIONAL_MAPPINGS.forEach(mapping => {
      mapping.relatedFeatures?.forEach(rf => {
        if (rf.relationship === 'requires') {
          if (!reverseMap[rf.featureId]) {
            reverseMap[rf.featureId] = [];
          }
          const primaryFeature = localFeatures.find(f => f.id === mapping.primaryFeatureId);
          reverseMap[rf.featureId].push({
            featureId: mapping.primaryFeatureId,
            featureName: primaryFeature?.name || mapping.primaryFeatureId,
            category: mapping.primaryCategory,
            relationship: 'required_by'
          });
        }
      });
    });
    
    return reverseMap;
  }, [localFeatures]);

  // Dynamic height - no scroll for single categories with few items
  const needsScroll = selectedCategory === 'all' || filteredFeatures.length > 15;

  // Get filtered features based on category selection
  const getFilteredFeaturesForExport = () => {
    return selectedCategory === 'all' ? localFeatures : localFeatures.filter(f => f.category === selectedCategory);
  };

  // Multi-sheet Excel export - respects category filter
  const handleExportExcel = (exportAll: boolean = false) => {
    const workbook = XLSX.utils.book_new();
    const featuresToExport = exportAll ? localFeatures : getFilteredFeaturesForExport();
    const categoryLabel = selectedCategory === 'all' ? 'All' : CATEGORY_LABELS[selectedCategory].replace(/[^\w\s]/g, '').trim();
    
    // Sheet 1: Feature Matrix (filtered)
    const matrixData: (string | number)[][] = [
      ['Feature', 'Category', 'Priority', ...PROVIDER_SUMMARIES.map(p => p.name)]
    ];
    featuresToExport.forEach(f => {
      const row: (string | number)[] = [f.name, f.category, f.priority];
      PROVIDER_SUMMARIES.forEach(p => {
        const impl = localMatrix[f.id]?.[p.id as ProviderId];
        row.push(impl?.implementation || 'N/A');
      });
      matrixData.push(row);
    });
    const matrixSheet = XLSX.utils.aoa_to_sheet(matrixData);
    XLSX.utils.book_append_sheet(workbook, matrixSheet, `Features - ${categoryLabel}`.slice(0, 31));
    
    // Sheet 2: Input Features (if INPUT selected or all)
    if (selectedCategory === 'all' || selectedCategory === 'INPUT' || exportAll) {
      const inputData: (string | number)[][] = [
        ['Feature', 'Description', 'Scenarios', 'Providers', 'Best For', 'Limitations']
      ];
      const inputFeatures = exportAll 
        ? localFeatures.filter(f => f.category === 'INPUT')
        : featuresToExport.filter(f => f.category === 'INPUT');
      inputFeatures.forEach(f => {
        const useCase = FEATURE_USE_CASES[f.id];
        const featureImpl = localMatrix[f.id] || {};
        const providers = Object.entries(featureImpl)
          .filter(([_, impl]) => impl?.implementation === 'implemented')
          .map(([id]) => PROVIDER_SUMMARIES.find(p => p.id === id)?.name || id);
        inputData.push([
          f.name,
          f.description || '',
          useCase?.scenarios?.join('; ') || '',
          providers.join('; '),
          useCase?.bestFor?.join('; ') || '',
          useCase?.limitations?.join('; ') || ''
        ]);
      });
      if (inputData.length > 1) {
        const inputSheet = XLSX.utils.aoa_to_sheet(inputData);
        XLSX.utils.book_append_sheet(workbook, inputSheet, 'Input Features');
      }
    }
    
    // Sheet 3: Providers Summary (filtered by features they support in selected category)
    const providerData: (string | number)[][] = [
      ['Provider', 'Status', 'Cost Tier', 'Implemented', 'Partial', 'Total', 'Coverage %', 'Capabilities', 'Strengths', 'Weaknesses']
    ];
    PROVIDER_SUMMARIES.forEach(p => {
      const implementedCount = featuresToExport.filter(f => 
        localMatrix[f.id]?.[p.id as ProviderId]?.implementation === 'implemented'
      ).length;
      const partialCount = featuresToExport.filter(f => 
        localMatrix[f.id]?.[p.id as ProviderId]?.implementation === 'partial'
      ).length;
      const totalCount = featuresToExport.length;
      
      providerData.push([
        p.name,
        p.status,
        p.costTier,
        implementedCount,
        partialCount,
        totalCount,
        totalCount > 0 ? Math.round((implementedCount / totalCount) * 100) : 0,
        p.capabilities.join('; '),
        p.strengths.join('; '),
        p.weaknesses.join('; ')
      ]);
    });
    const providerSheet = XLSX.utils.aoa_to_sheet(providerData);
    XLSX.utils.book_append_sheet(workbook, providerSheet, 'Providers');
    
    // Sheet 4: LLM Comparison (always include, it's model-focused)
    const llmData: (string | number)[][] = [
      ['Model', 'Provider', 'Cost Tier', 'Accuracy %', 'Industries', 'Output Types', 'Input Strengths', 'Notes']
    ];
    LLM_COMPARISONS.forEach(llm => {
      llmData.push([
        llm.model,
        llm.provider,
        llm.costTier,
        llm.accuracy,
        llm.bestForIndustries.join('; '),
        llm.bestForOutputTypes.join('; '),
        llm.inputStrengths.join('; '),
        llm.notes
      ]);
    });
    const llmSheet = XLSX.utils.aoa_to_sheet(llmData);
    XLSX.utils.book_append_sheet(workbook, llmSheet, 'LLM Analysis');
    
    // Sheet 5: Gap Analysis (filtered)
    const gapData: (string | number)[][] = [
      ['Feature', 'Category', 'Priority', 'Partial Providers', 'Missing Providers', 'Potential Providers']
    ];
    featuresToExport.forEach(feature => {
      const featureImpl = localMatrix[feature.id] || {};
      const statuses = Object.values(featureImpl).map(p => p?.implementation);
      if (!statuses.includes('implemented') || statuses.includes('partial')) {
        const providers = Object.entries(featureImpl);
        const partialProviders = providers.filter(([_, p]) => p?.implementation === 'partial').map(([id]) => PROVIDER_SUMMARIES.find(pr => pr.id === id)?.name || id);
        const missingProviders = PROVIDER_SUMMARIES.filter(p => !featureImpl[p.id as ProviderId]).map(p => p.name);
        gapData.push([
          feature.name,
          feature.category,
          feature.priority,
          partialProviders.join('; '),
          missingProviders.slice(0, 5).join('; '),
          missingProviders.slice(0, 3).join('; ')
        ]);
      }
    });
    const gapSheet = XLSX.utils.aoa_to_sheet(gapData);
    XLSX.utils.book_append_sheet(workbook, gapSheet, `Gaps - ${categoryLabel}`.slice(0, 31));
    
    // Sheet 6: Critical Gaps (always include)
    const criticalData: (string | number)[][] = [
      ['Feature', 'Provider', 'Priority', 'Effort', 'Notes']
    ];
    CRITICAL_GAPS.forEach(gap => {
      criticalData.push([gap.feature, gap.provider, gap.priority, gap.effort, gap.notes]);
    });
    const criticalSheet = XLSX.utils.aoa_to_sheet(criticalData);
    XLSX.utils.book_append_sheet(workbook, criticalSheet, 'Critical Gaps');
    
    // Download
    const filename = exportAll 
      ? 'provider_capability_matrix_full.xlsx' 
      : `provider_capability_matrix_${categoryLabel.toLowerCase().replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    toast.success(`Exported ${featuresToExport.length} features to Excel!`);
  };

  const handleAddFeature = (feature: Feature) => {
    setLocalFeatures(prev => [...prev, feature]);
    setLocalMatrix(prev => ({
      ...prev,
      [feature.id]: {},
    }));
  };

  const handleStatusChange = (featureId: string, providerId: string, newStatus: ImplementationStatus) => {
    setLocalMatrix(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [providerId]: {
          ...prev[featureId]?.[providerId as ProviderId],
          status: 'configured',
          implementation: newStatus,
        },
      },
    }));
    setEditingCell(null);
    toast.success('Status updated');
  };

  const handleSave = () => {
    // In a real app, this would save to database
    toast.success('Changes saved locally. Database persistence coming soon!');
    setEditMode(false);
  };

  const existingCategories = useMemo(() => 
    [...new Set(localFeatures.map(f => f.category))].filter(c => c !== 'USE_CASE') as FeatureCategory[],
    [localFeatures]
  );

  return (
    <div className={`${className} space-y-4`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Provider Capability Matrix</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {overallStats.total} features × {PROVIDER_SUMMARIES.length} providers | {overallStats.coverage}% coverage
          </p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <AddFeatureDialog onAdd={handleAddFeature} existingCategories={existingCategories} />
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportExcel(false)}>
                <FileSpreadsheet className="w-4 h-4 mr-1" /> Export {selectedCategory === 'all' ? 'All' : 'Filtered'}
              </Button>
              {selectedCategory !== 'all' && (
                <Button variant="ghost" size="sm" onClick={() => handleExportExcel(true)}>
                  <Download className="w-4 h-4 mr-1" /> Export All
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <MatrixLegend />

      {/* Stats Summary - Dynamic based on selected category */}
      <div className="space-y-2">
        {/* Implementation Stats Row */}
        <div className="flex flex-wrap gap-3 py-3 px-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {selectedCategory === 'all' ? 'All Categories' : CATEGORY_LABELS[selectedCategory]}:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-emerald-600">{currentCategoryStats.implemented}</span>
            <span className="text-xs text-muted-foreground">Implemented</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-sm font-bold text-amber-600">{currentCategoryStats.partial}</span>
            <span className="text-xs text-muted-foreground">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-sm font-bold text-blue-600">{currentCategoryStats.planned}</span>
            <span className="text-xs text-muted-foreground">Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
            <span className="text-sm font-bold">{currentCategoryStats.notStarted}</span>
            <span className="text-xs text-muted-foreground">Not Started</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">{currentCategoryStats.total} features</span>
            <Progress 
              value={currentCategoryStats.total > 0 
                ? Math.round(((currentCategoryStats.implemented + currentCategoryStats.partial * 0.5) / currentCategoryStats.total) * 100) 
                : 0
              } 
              className="w-20 h-2" 
            />
            <span className="text-sm font-bold">
              {currentCategoryStats.total > 0 
                ? Math.round(((currentCategoryStats.implemented + currentCategoryStats.partial * 0.5) / currentCategoryStats.total) * 100) 
                : 0}%
            </span>
          </div>
        </div>
        
        {/* Dynamic Cross-Functional Metrics Row */}
        <div className="flex flex-wrap gap-4 py-2 px-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Cross-Functional:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{crossFunctionalMetrics.features}</span>
            <span className="text-xs text-muted-foreground">Features</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{crossFunctionalMetrics.scenarios}</span>
            <span className="text-xs text-muted-foreground">Scenarios</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{crossFunctionalMetrics.useCases}</span>
            <span className="text-xs text-muted-foreground">Use Cases</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{crossFunctionalMetrics.providers}</span>
            <span className="text-xs text-muted-foreground">Providers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{crossFunctionalMetrics.llms}</span>
            <span className="text-xs text-muted-foreground">LLMs</span>
          </div>
          {/* Genie Suite Products */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-muted-foreground mr-1">Used in:</span>
            {crossFunctionalMetrics.genieProducts.slice(0, 5).map(product => (
              <TooltipProvider key={product}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm cursor-help">{GENIE_PRODUCT_LABELS[product]?.emoji}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{GENIE_PRODUCT_LABELS[product]?.name}</p>
                    <p className="text-xs text-muted-foreground">{GENIE_PRODUCT_LABELS[product]?.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {crossFunctionalMetrics.genieProducts.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{crossFunctionalMetrics.genieProducts.length - 5}</span>
            )}
          </div>
        </div>
        
        {/* Per-Category Breakdown when viewing all */}
        {selectedCategory === 'all' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(computeCategoryStats)
              .filter(([k]) => k !== 'USE_CASE')
              .map(([cat, stats]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as FeatureCategory)}
                  className="p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium truncate">{CATEGORY_LABELS[cat as FeatureCategory]?.split(' ')[1]}</span>
                    <span className="text-[10px] text-muted-foreground">{stats.total}</span>
                  </div>
                  <div className="flex gap-0.5 text-[9px]">
                    <span className="text-emerald-600 font-bold">{stats.implemented}✓</span>
                    {stats.partial > 0 && <span className="text-amber-600">/{stats.partial}⚠</span>}
                    {stats.planned > 0 && <span className="text-blue-600">/{stats.planned}🕐</span>}
                    {stats.notStarted > 0 && <span className="text-muted-foreground">/{stats.notStarted}✗</span>}
                  </div>
                  <Progress 
                    value={stats.total > 0 ? Math.round(((stats.implemented + stats.partial * 0.5) / stats.total) * 100) : 0}
                    className="h-1 mt-1"
                  />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
            <TabsTrigger value="category">
              {selectedCategory === 'all' ? '📋 Category Details' : CATEGORY_LABELS[selectedCategory]}
            </TabsTrigger>
            <TabsTrigger value="crossfunc">🔗 Cross-Functional</TabsTrigger>
            <TabsTrigger value="coverage">
              <Layers className="w-3 h-3 mr-1" />
              Generation Coverage
            </TabsTrigger>
            <TabsTrigger value="providers">By Provider</TabsTrigger>
            <TabsTrigger value="llm">LLM Analysis</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as FeatureCategory | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== 'USE_CASE').map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feature Matrix Tab */}
        <TabsContent value="matrix" className="mt-0">
          <div className={`border rounded-lg overflow-auto ${needsScroll ? 'max-h-[600px]' : ''}`}>
            <Table className="table-fixed">
              <TableHeader className="sticky top-0 z-20 bg-background">
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-30 w-[140px] border-r font-semibold text-xs">Feature</TableHead>
                  <TableHead className="w-[45px] bg-background text-xs px-1">Cat</TableHead>
                  <TableHead className="w-[80px] bg-background text-xs px-1">Stats</TableHead>
                  {PROVIDER_SUMMARIES.map(p => (
                    <TableHead key={p.id} className="text-center w-[55px] bg-background px-0.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] font-medium truncate max-w-[50px]">{p.name.split(' ')[0]}</span>
                              {p.status === 'configured' ? 
                                <Badge variant="outline" className="text-[6px] px-0.5 bg-emerald-500/10 border-emerald-500/30">✓</Badge> :
                                <Badge variant="outline" className="text-[6px] px-0.5 bg-amber-500/10 border-amber-500/30">!</Badge>
                              }
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs">{p.implementedFeatures}/{p.totalFeatures} features</p>
                            <p className="text-xs text-muted-foreground">{p.costTier} tier</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map(feature => {
                  const featureImpl = localMatrix[feature.id] || {};
                  const featureStats = computeFeatureStats(feature.id);
                  
                  return (
                    <TableRow key={feature.id} className="hover:bg-muted/50">
                      <TableCell className="sticky left-0 bg-background font-medium border-r z-10 w-[140px]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help text-left">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] truncate max-w-[110px]">{feature.name}</span>
                                {feature.priority === 'critical' && (
                                  <span className="text-[8px] text-destructive font-bold">●</span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs p-3 bg-popover border border-border shadow-lg">
                              <div className="space-y-2">
                                <div>
                                  <p className="font-semibold text-sm text-foreground">{feature.name}</p>
                                  {feature.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                                  )}
                                </div>
                                
                                {FEATURE_USE_CASES[feature.id] && (
                                  <>
                                    <div className="pt-1 border-t border-border/50">
                                      <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                        📋 Scenarios ({FEATURE_USE_CASES[feature.id].scenarios.length})
                                      </p>
                                      <p className="text-[10px] text-foreground">{FEATURE_USE_CASES[feature.id].scenarios.join(' • ')}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-medium text-muted-foreground mb-1">🎯 Best For</p>
                                      <p className="text-[10px] text-foreground">{FEATURE_USE_CASES[feature.id].bestFor.join(' • ')}</p>
                                    </div>
                                    {FEATURE_USE_CASES[feature.id].limitations && (
                                      <div>
                                        <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠️ Limitations</p>
                                        <p className="text-[10px] text-muted-foreground">{FEATURE_USE_CASES[feature.id].limitations?.join(' • ')}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                <div className="pt-1 border-t border-border/50 flex items-center gap-2 text-[10px]">
                                  <span className="text-primary font-medium">{featureStats.implemented}✓</span>
                                  {featureStats.partial > 0 && <span className="text-secondary-foreground">{featureStats.partial}⚠</span>}
                                  {featureStats.planned > 0 && <span className="text-muted-foreground">{featureStats.planned}🕐</span>}
                                  <span className="text-muted-foreground ml-auto">of {featureStats.total} providers</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="w-[45px] px-0.5">
                        <span className="text-[8px] text-muted-foreground">
                          {CATEGORY_LABELS[feature.category]?.split(' ')[0]}
                        </span>
                      </TableCell>
                      <TableCell className="w-[80px] px-1">
                        <div className="flex items-center gap-0.5 text-[9px]">
                          <span className="text-emerald-600 font-bold">{featureStats.implemented}✓</span>
                          {featureStats.partial > 0 && <span className="text-amber-500">/{featureStats.partial}⚠</span>}
                          {featureStats.planned > 0 && <span className="text-blue-500">/{featureStats.planned}🕐</span>}
                          <span className="text-muted-foreground">/{featureStats.notApplicable}—</span>
                        </div>
                      </TableCell>
                      {PROVIDER_SUMMARIES.map(p => {
                        const impl = featureImpl[p.id as ProviderId];
                        const isEditing = editingCell?.featureId === feature.id && editingCell?.providerId === p.id;
                        
                        return (
                          <TableCell key={`${feature.id}-${p.id}`} className="text-center w-[55px] px-0.5">
                            {editMode ? (
                              isEditing ? (
                                <Select
                                  value={impl?.implementation || 'not_applicable'}
                                  onValueChange={(v) => handleStatusChange(feature.id, p.id, v as ImplementationStatus)}
                                >
                                  <SelectTrigger className="h-7 w-20 text-[10px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-1">
                                          {opt.icon} {opt.label}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <button
                                  onClick={() => setEditingCell({ featureId: feature.id, providerId: p.id })}
                                  className="p-1 hover:bg-muted rounded transition-colors"
                                >
                                  {getStatusIcon(impl?.implementation)}
                                </button>
                              )
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    {getStatusIcon(impl?.implementation)}
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-2 bg-popover border border-border">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-foreground">{p.name}</span>
                                        {impl?.implementation && (
                                          <Badge variant="outline" className="text-[9px]">{impl.implementation}</Badge>
                                        )}
                                      </div>
                                      {impl?.confidence && (
                                        <div className="text-xs text-muted-foreground">
                                          Confidence: <span className="text-foreground font-medium">{impl.confidence}%</span>
                                        </div>
                                      )}
                                      {impl?.notes && (
                                        <p className="text-xs text-muted-foreground">{impl.notes}</p>
                                      )}
                                      {impl?.edgeFunctionUsed && (
                                        <p className="text-[10px] text-muted-foreground font-mono">fn: {impl.edgeFunctionUsed}</p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {selectedCategory !== 'all' && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {filteredFeatures.length} features in {CATEGORY_LABELS[selectedCategory]}
            </p>
          )}
        </TabsContent>

        {/* Provider Summary Tab - Table Format - Respects Category Filter */}
        <TabsContent value="providers" className="mt-0 space-y-3">
          {/* Summary Stats Bar - Dynamic based on category */}
          {(() => {
            const categoryFeatures = selectedCategory === 'all' ? localFeatures : localFeatures.filter(f => f.category === selectedCategory);
            const configuredCount = PROVIDER_SUMMARIES.filter(p => p.status === 'configured').length;
            const totalCoverage = PROVIDER_SUMMARIES.reduce((sum, p) => {
              const implemented = categoryFeatures.filter(f => 
                localMatrix[f.id]?.[p.id as ProviderId]?.implementation === 'implemented'
              ).length;
              return sum + (categoryFeatures.length > 0 ? (implemented / categoryFeatures.length) * 100 : 0);
            }, 0) / PROVIDER_SUMMARIES.length;
            
            return (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">
                      {selectedCategory === 'all' ? 'All Categories' : CATEGORY_LABELS[selectedCategory]}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-primary">{PROVIDER_SUMMARIES.length}</span>
                    <span className="text-muted-foreground">Providers</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-foreground">{configuredCount}</span>
                    <span className="text-muted-foreground">Configured</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-foreground">{totalCoverage.toFixed(0)}%</span>
                    <span className="text-muted-foreground">Avg Coverage</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-foreground">{categoryFeatures.length}</span>
                    <span className="text-muted-foreground">Features</span>
                  </div>
                </div>
                {editMode && (
                  <AddFeatureDialog onAdd={handleAddFeature} existingCategories={existingCategories} />
                )}
              </div>
            );
          })()}

          {/* Provider Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[140px] text-xs font-semibold">Provider</TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold text-center">Status</TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold text-center">Cost Tier</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold text-center">Coverage</TableHead>
                  <TableHead className="text-xs font-semibold">Capabilities</TableHead>
                  <TableHead className="text-xs font-semibold">Strengths</TableHead>
                  <TableHead className="text-xs font-semibold">Weaknesses</TableHead>
                  {editMode && <TableHead className="w-[80px] text-xs font-semibold text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROVIDER_SUMMARIES.map(provider => {
                  const categoryFeatures = selectedCategory === 'all' ? localFeatures : localFeatures.filter(f => f.category === selectedCategory);
                  const implementedCount = categoryFeatures.filter(f => 
                    localMatrix[f.id]?.[provider.id as ProviderId]?.implementation === 'implemented'
                  ).length;
                  const partialCount = categoryFeatures.filter(f => 
                    localMatrix[f.id]?.[provider.id as ProviderId]?.implementation === 'partial'
                  ).length;
                  const coveragePercent = categoryFeatures.length > 0 
                    ? ((implementedCount + partialCount * 0.5) / categoryFeatures.length) * 100 
                    : 0;

                  return (
                    <TableRow key={provider.id} className="hover:bg-muted/20">
                      <TableCell className="py-2">
                        <div className="font-medium text-sm text-foreground">{provider.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{provider.id}</div>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Badge 
                          variant={provider.status === 'configured' ? 'default' : 'secondary'} 
                          className="text-[9px]"
                        >
                          {provider.status === 'configured' ? '✅ Ready' : '⚠️ Needs Key'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Badge variant="outline" className={`text-[9px] ${
                          provider.costTier === 'budget' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                          provider.costTier === 'standard' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                          provider.costTier === 'premium' ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}>
                          {provider.costTier}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Progress value={coveragePercent} className="h-2 flex-1" />
                          <span className="text-[10px] font-medium w-10 text-right">
                            {implementedCount}
                            {partialCount > 0 && <span className="text-muted-foreground">+{partialCount}</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {provider.capabilities.slice(0, 5).map(cap => (
                            <Badge key={cap} variant="outline" className="text-[8px] py-0 h-4">{cap}</Badge>
                          ))}
                          {provider.capabilities.length > 5 && (
                            <Badge variant="outline" className="text-[8px] py-0 h-4 bg-muted">
                              +{provider.capabilities.length - 5}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-[10px] text-primary">
                          {provider.strengths.slice(0, 2).join(' • ')}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-[10px] text-muted-foreground">
                          {provider.weaknesses.length > 0 ? provider.weaknesses[0] : '—'}
                        </div>
                      </TableCell>
                      {editMode && (
                        <TableCell className="py-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px] px-2"
                            onClick={() => {
                              setSelectedCategory('all');
                              setSearchTerm('');
                              setView('matrix');
                              toast.info(`View ${provider.name} in Matrix`);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Category Details Tab - Dynamic based on selection */}
        <TabsContent value="category" className="mt-0 space-y-3">
          {/* Dynamic Summary Stats Bar */}
          {(() => {
            const categoryToShow = selectedCategory === 'all' ? 'INPUT' : selectedCategory;
            const categoryFeatures = localFeatures.filter(f => f.category === categoryToShow);
            const totalScenarios = categoryFeatures.reduce((sum, f) => sum + (FEATURE_USE_CASES[f.id]?.scenarios?.length || 0), 0);
            const totalBestFor = categoryFeatures.reduce((sum, f) => sum + (FEATURE_USE_CASES[f.id]?.bestFor?.length || 0), 0);
            const categoryStats = computeCategoryStats[categoryToShow] || { total: 0, implemented: 0, partial: 0, planned: 0, notStarted: 0 };
            
            return (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-muted-foreground">{CATEGORY_LABELS[categoryToShow]}:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-primary">{categoryStats.total}</span>
                    <span className="text-muted-foreground">Features</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-foreground">{totalScenarios}</span>
                    <span className="text-muted-foreground">Scenarios</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-foreground">{PROVIDER_SUMMARIES.length}</span>
                    <span className="text-muted-foreground">Providers</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-foreground">{totalBestFor}</span>
                    <span className="text-muted-foreground">Use Cases</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium">{categoryStats.implemented}/{categoryStats.total}</span>
                    <span className="text-muted-foreground">Implemented</span>
                  </div>
                  {editMode && (
                    <AddFeatureDialog onAdd={handleAddFeature} existingCategories={[categoryToShow]} />
                  )}
                </div>
              </div>
            );
          })()}

          {/* Category prompt when 'all' is selected */}
          {selectedCategory === 'all' && (
            <div className="p-3 rounded-lg border bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">
                Select a specific category from the dropdown above to see detailed feature information.
                <br />
                <span className="text-xs">Showing INPUT category as default. Use category filter to switch.</span>
              </p>
            </div>
          )}

          {/* Dynamic Category Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[140px] text-xs font-semibold">Feature</TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold">Scenarios</TableHead>
                  <TableHead className={`text-xs font-semibold ${editMode ? 'w-[200px]' : 'w-[120px]'}`}>
                    Providers {editMode && <span className="text-[9px] text-muted-foreground">(click to edit)</span>}
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold">Best For</TableHead>
                  <TableHead className="text-xs font-semibold">Limitations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const categoryToShow = selectedCategory === 'all' ? 'INPUT' : selectedCategory;
                  const categoryFeatures = localFeatures.filter(f => f.category === categoryToShow);
                  
                  if (categoryFeatures.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No features found in {CATEGORY_LABELS[categoryToShow]}
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return categoryFeatures.map(feature => {
                    const useCase = FEATURE_USE_CASES[feature.id];
                    const featureImpl = localMatrix[feature.id] || {};
                    const stats = computeFeatureStats(feature.id);
                    const providers = Object.entries(featureImpl)
                      .filter(([_, impl]) => impl?.implementation === 'implemented')
                      .map(([id]) => PROVIDER_SUMMARIES.find(p => p.id === id)?.name || id);
                    
                    return (
                      <TableRow key={feature.id} className="hover:bg-muted/30">
                        {/* Feature Column */}
                        <TableCell className="py-2 align-top">
                          <div className="font-medium text-xs text-foreground">{feature.name}</div>
                          {feature.description && (
                            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{feature.description}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] font-medium text-primary">{stats.implemented}✓</span>
                            {stats.partial > 0 && <span className="text-[9px] text-amber-600">{stats.partial}⚠</span>}
                            <span className="text-[9px] text-muted-foreground">/{stats.total}</span>
                          </div>
                        </TableCell>
                        
                        {/* Scenarios Column */}
                        <TableCell className="py-2 align-top">
                          {useCase?.scenarios && useCase.scenarios.length > 0 ? (
                            <div className="flex flex-wrap gap-0.5">
                              {useCase.scenarios.map((s, i) => (
                                <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-muted/50 text-foreground leading-tight">{s}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        
                        {/* Providers Column - with edit support */}
                        <TableCell className="py-2 align-top">
                          {editMode ? (
                            <div className="flex flex-wrap gap-1">
                              {PROVIDER_SUMMARIES.slice(0, 6).map(p => {
                                const impl = featureImpl[p.id as ProviderId];
                                const isEditing = editingCell?.featureId === feature.id && editingCell?.providerId === p.id;
                                
                                return isEditing ? (
                                  <Select
                                    key={p.id}
                                    value={impl?.implementation || 'not_applicable'}
                                    onValueChange={(v) => handleStatusChange(feature.id, p.id, v as ImplementationStatus)}
                                  >
                                    <SelectTrigger className="h-6 w-24 text-[9px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          <span className="flex items-center gap-1 text-[9px]">
                                            {opt.icon} {opt.label}
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <button
                                    key={p.id}
                                    onClick={() => setEditingCell({ featureId: feature.id, providerId: p.id })}
                                    className={`text-[8px] px-1.5 py-0.5 rounded border transition-colors ${
                                      impl?.implementation === 'implemented' 
                                        ? 'bg-primary/10 text-primary border-primary/20' 
                                        : impl?.implementation === 'partial'
                                        ? 'bg-secondary/50 text-secondary-foreground border-secondary/30'
                                        : 'bg-muted/30 text-muted-foreground border-border'
                                    }`}
                                  >
                                    {p.name.split(' ')[0]}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            providers.length > 0 ? (
                              <div className="flex flex-wrap gap-0.5">
                                {providers.slice(0, 5).map(name => (
                                  <span key={name} className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-primary leading-tight">{name}</span>
                                ))}
                                {providers.length > 5 && (
                                  <span className="text-[9px] text-muted-foreground">+{providers.length - 5}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[9px] text-muted-foreground">—</span>
                            )
                          )}
                        </TableCell>
                        
                        {/* Best For Column */}
                        <TableCell className="py-2 align-top">
                          {useCase?.bestFor && useCase.bestFor.length > 0 ? (
                            <div className="flex flex-wrap gap-0.5">
                              {useCase.bestFor.map((b, i) => (
                                <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-secondary/50 text-foreground leading-tight">{b}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        
                        {/* Limitations Column */}
                        <TableCell className="py-2 align-top">
                          {useCase?.limitations && useCase.limitations.length > 0 ? (
                            <span className="text-[9px] text-muted-foreground leading-tight">{useCase.limitations.join(' • ')}</span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* LLM Analysis Tab - Flattened Layout */}
        <TabsContent value="llm" className="mt-0 space-y-6">
          {/* Routing Strategy - Flat Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Routing Strategy: {ROUTING_STRATEGY.primary} → {ROUTING_STRATEGY.fallback}
            </h3>
            <p className="text-xs text-muted-foreground">{ROUTING_STRATEGY.explanation}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <div className="font-bold text-primary">1st: Best Quality</div>
                <div className="text-muted-foreground mt-1">GPT-4o, Claude</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border text-center">
                <div className="font-bold text-foreground">2nd: Balanced</div>
                <div className="text-muted-foreground mt-1">Gemini, Qwen</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border text-center">
                <div className="font-bold text-muted-foreground">3rd: Budget</div>
                <div className="text-muted-foreground mt-1">DeepSeek</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground p-2 bg-muted/30 rounded border">
              <strong>Why not cheapest first?</strong> {ROUTING_STRATEGY.whyNotCheapestFirst}
            </p>
          </div>

        {/* LLM Comparison Table - Dynamic based on category */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">
              Model Comparison {selectedCategory !== 'all' ? `- ${CATEGORY_LABELS[selectedCategory]}` : ''}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'All models available across all features' 
                : `Models with implementations in ${CATEGORY_LABELS[selectedCategory]} features`}
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="min-w-[100px] text-xs">Model</TableHead>
                    <TableHead className="w-[70px] text-xs">Cost</TableHead>
                    <TableHead className="w-[50px] text-xs">Acc</TableHead>
                    <TableHead className="min-w-[100px] text-xs">Category Features</TableHead>
                    <TableHead className="min-w-[120px] text-xs">Industries</TableHead>
                    <TableHead className="min-w-[120px] text-xs">Input Strengths</TableHead>
                    <TableHead className="min-w-[150px] text-xs">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    // Filter LLMs based on selected category
                    const categoryFeatures = selectedCategory === 'all' 
                      ? localFeatures 
                      : localFeatures.filter(f => f.category === selectedCategory);
                    
                    // Get providers that have implementations for this category's features
                    const categoryProviders = new Set<ProviderId>();
                    categoryFeatures.forEach(f => {
                      const featureImpl = localMatrix[f.id];
                      if (featureImpl) {
                        Object.entries(featureImpl).forEach(([providerId, impl]) => {
                          if (impl?.implementation === 'implemented' || impl?.implementation === 'partial') {
                            categoryProviders.add(providerId as ProviderId);
                          }
                        });
                      }
                    });
                    
                    // Filter and sort LLMs by relevance to this category
                    const filteredLLMs = selectedCategory === 'all' 
                      ? LLM_COMPARISONS 
                      : LLM_COMPARISONS.filter(llm => categoryProviders.has(llm.providerId));
                    
                    // Compute feature count per LLM for this category
                    const llmFeatureCounts = filteredLLMs.map(llm => {
                      const implementedCount = categoryFeatures.filter(f => 
                        localMatrix[f.id]?.[llm.providerId]?.implementation === 'implemented'
                      ).length;
                      const partialCount = categoryFeatures.filter(f => 
                        localMatrix[f.id]?.[llm.providerId]?.implementation === 'partial'
                      ).length;
                      return { llm, implementedCount, partialCount, total: implementedCount + partialCount };
                    }).sort((a, b) => b.total - a.total);
                    
                    if (llmFeatureCounts.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No LLM providers have implementations for {CATEGORY_LABELS[selectedCategory]} features
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    return llmFeatureCounts.map(({ llm, implementedCount, partialCount }) => (
                      <TableRow key={llm.model}>
                        <TableCell className="py-2">
                          <div className="font-medium text-xs">{llm.model}</div>
                          <span className="text-[9px] text-muted-foreground">{llm.provider}</span>
                        </TableCell>
                        <TableCell className="py-2">{COST_BADGES[llm.costTier]}</TableCell>
                        <TableCell className="py-2">
                          <span className={`text-xs font-bold ${
                            llm.accuracy >= 95 ? 'text-primary' : 'text-muted-foreground'
                          }`}>{llm.accuracy}%</span>
                        </TableCell>
                        {/* Category-specific feature count */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-emerald-600">{implementedCount}✓</span>
                            {partialCount > 0 && <span className="text-xs text-amber-600">{partialCount}⚠</span>}
                            <span className="text-[9px] text-muted-foreground">/ {categoryFeatures.length}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-0.5">
                            {llm.bestForIndustries.slice(0, 3).map(ind => (
                              <Badge key={ind} variant="secondary" className="text-[8px] px-1 py-0">{ind}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-[9px] text-muted-foreground">{llm.inputStrengths.slice(0, 3).join(', ')}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-[9px] text-muted-foreground">{llm.notes}</span>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Azure vs OpenAI - Flat Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">🔷 Azure OpenAI vs Direct OpenAI</h3>
            <p className="text-xs text-muted-foreground">
              <strong>Current:</strong> Direct OpenAI. <strong>Azure OpenAI</strong> = same models + enterprise compliance.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-medium text-primary mb-1">Azure Advantages:</div>
                <ul className="text-muted-foreground list-disc list-inside space-y-0.5 text-[11px]">
                  <li>HIPAA/SOC2/GDPR built-in</li>
                  <li>Private VNet, Regional data</li>
                  <li>99.9% SLA</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">When to Use Azure:</div>
                <ul className="text-muted-foreground list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Healthcare PHI data</li>
                  <li>Financial services (PCI-DSS)</li>
                  <li>Government/public sector</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Cross-Functional Mapping Tab - Genie Suite Integration */}
        <TabsContent value="crossfunc" className="mt-0 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              🔗 Cross-Functional Mapping {selectedCategory !== 'all' ? `- ${CATEGORY_LABELS[selectedCategory]}` : ''}
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <Badge variant="outline" className="bg-primary/10 border-primary/30">
                {crossFunctionalMetrics.mappings.length} Mappings
              </Badge>
              <Badge variant="outline" className="bg-secondary/30">
                {crossFunctionalMetrics.providers} Providers
              </Badge>
              <Badge variant="outline" className="bg-muted">
                {crossFunctionalMetrics.genieProducts.length} Products
              </Badge>
            </div>
          </div>
          
          {/* Genie Suite Product Grid - Enhanced Visibility */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {Object.entries(GENIE_PRODUCT_LABELS).map(([id, product]) => {
              const isUsed = crossFunctionalMetrics.genieProducts.includes(id as GenieProduct);
              const featureCount = crossFunctionalMetrics.mappings.filter(m => 
                m.genieProducts?.includes(id as GenieProduct)
              ).length;
              
              return (
                <TooltipProvider key={id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`p-3 rounded-lg border text-center cursor-help transition-all ${
                          isUsed 
                            ? 'bg-primary/15 border-primary/40 shadow-sm' 
                            : 'bg-muted/20 border-muted/50 opacity-40'
                        }`}
                      >
                        <span className="text-2xl block">{product.emoji}</span>
                        <div className={`text-xs font-semibold mt-1 ${isUsed ? 'text-foreground' : 'text-muted-foreground'}`}>{product.name}</div>
                        <div className={`text-[10px] font-medium ${isUsed ? 'text-primary' : 'text-muted-foreground'}`}>
                          {featureCount} {featureCount === 1 ? 'feature' : 'features'}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                      {isUsed && (
                        <p className="text-xs text-primary mt-2">
                          ✓ {featureCount} features from {selectedCategory === 'all' ? 'all categories' : CATEGORY_LABELS[selectedCategory]} are used in {product.name}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          
          {/* Summary Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/30 border text-xs">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Info className="w-3.5 h-3.5" /> Legend:
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/30">🔴 Requires</span>
              <span className="text-muted-foreground">= Must have dependency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded bg-muted/50 border border-muted">🟡 Enhances</span>
              <span className="text-muted-foreground">= Optional improvement</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">🟢 Enables</span>
              <span className="text-muted-foreground">= Unlocks capability</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/30">🔵 Alternative</span>
              <span className="text-muted-foreground">= Different approach</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/30">🟣 Required By</span>
              <span className="text-muted-foreground">= Other features depend on this</span>
            </div>
          </div>
          
          {/* Cross-Functional Mapping Table - Enhanced */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold w-[130px]">Feature</TableHead>
                  <TableHead className="text-xs font-semibold w-[70px]">Category</TableHead>
                  <TableHead className="text-xs font-semibold w-[140px]">Dependencies</TableHead>
                  <TableHead className="text-xs font-semibold w-[140px]">🟣 Required By</TableHead>
                  <TableHead className="text-xs font-semibold w-[100px]">Use Cases</TableHead>
                  <TableHead className="text-xs font-semibold w-[100px]">Scenarios</TableHead>
                  <TableHead className="text-xs font-semibold w-[90px]">Providers</TableHead>
                  <TableHead className="text-xs font-semibold w-[80px]">LLMs</TableHead>
                  <TableHead className="text-xs font-semibold w-[80px]">Genie Suite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crossFunctionalMetrics.mappings.map((mapping, i) => {
                  const feature = localFeatures.find(f => f.id === mapping.primaryFeatureId);
                  
                  // Get actual implemented providers from the matrix (not just recommended)
                  const featureImpl = localMatrix[mapping.primaryFeatureId] || {};
                  const actualProviders = Object.entries(featureImpl)
                    .filter(([_, impl]) => impl?.implementation === 'implemented' || impl?.implementation === 'partial')
                    .map(([providerId]) => ({
                      id: providerId as ProviderId,
                      name: PROVIDER_SUMMARIES.find(p => p.id === providerId)?.name || providerId,
                      status: featureImpl[providerId as ProviderId]?.implementation
                    }));
                  
                  // Get reverse dependencies - features that REQUIRE this feature
                  const requiredByFeatures = getRequiredByFeatures[mapping.primaryFeatureId] || [];
                  
                  return (
                    <TableRow key={i} className="hover:bg-muted/20">
                      <TableCell className="py-2.5">
                        <div className="font-semibold text-xs text-foreground">{feature?.name || mapping.primaryFeatureId}</div>
                        {feature?.description && (
                          <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{feature.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge variant="outline" className="text-[9px] py-0">
                          {CATEGORY_LABELS[mapping.primaryCategory]?.split(' ')[0]}
                          {CATEGORY_LABELS[mapping.primaryCategory]?.split(' ')[1]}
                        </Badge>
                      </TableCell>
                      {/* Related Features with relationship badges */}
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-0.5">
                          {mapping.relatedFeatures?.slice(0, 3).map((rf, j) => (
                            <TooltipProvider key={j}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded cursor-help font-medium ${
                                    rf.relationship === 'requires' ? 'bg-destructive/15 text-destructive border border-destructive/30' :
                                    rf.relationship === 'enables' ? 'bg-primary/15 text-primary border border-primary/30' :
                                    rf.relationship === 'alternative' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' :
                                    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {rf.relationship === 'requires' && '🔴'}
                                    {rf.relationship === 'enhances' && '🟡'}
                                    {rf.relationship === 'enables' && '🟢'}
                                    {rf.relationship === 'alternative' && '🔵'}
                                    {' '}{localFeatures.find(f => f.id === rf.featureId)?.name?.split(' ')[0] || rf.featureId.split('_')[0]}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs p-2">
                                  <p className="font-medium text-sm">{localFeatures.find(f => f.id === rf.featureId)?.name || rf.featureId}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {rf.relationship === 'requires' && '⚠️ Required for this feature'}
                                    {rf.relationship === 'enhances' && '✨ Enhances this feature'}
                                    {rf.relationship === 'enables' && '🚀 Enabled by this feature'}
                                    {rf.relationship === 'alternative' && '↔️ Alternative approach'}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-1">{CATEGORY_LABELS[rf.category]}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {(mapping.relatedFeatures?.length || 0) > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{mapping.relatedFeatures!.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      {/* Required By - Reverse Dependencies (features that REQUIRE this feature) */}
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-0.5">
                          {requiredByFeatures.length > 0 ? (
                            requiredByFeatures.slice(0, 3).map((rb, j) => (
                              <TooltipProvider key={j}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded cursor-help font-medium bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                                      🟣 {rb.featureName.split(' ')[0]}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-2">
                                    <p className="font-medium text-sm">{rb.featureName}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      ⚠️ This feature <strong>requires</strong> {feature?.name || mapping.primaryFeatureId}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{CATEGORY_LABELS[rb.category]}</p>
                                    <p className="text-[10px] text-primary mt-1.5">Completing this feature will unblock {rb.featureName}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))
                          ) : (
                            <span className="text-[9px] text-muted-foreground opacity-50">—</span>
                          )}
                          {requiredByFeatures.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{requiredByFeatures.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      {/* Use Cases - Full List with Tooltip */}
                      <TableCell className="py-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-wrap gap-0.5 cursor-help">
                                {mapping.useCases?.map((uc, j) => (
                                  <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">{uc}</span>
                                ))}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm p-3">
                              <p className="font-semibold text-xs mb-1.5">📋 Use Cases ({mapping.useCases?.length || 0})</p>
                              <ul className="text-[10px] space-y-1 text-muted-foreground">
                                {mapping.useCases?.map((uc, j) => (
                                  <li key={j} className="flex items-center gap-1">
                                    <span className="text-emerald-500">•</span> {uc}
                                  </li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      {/* Scenarios - Full List with Tooltip */}
                      <TableCell className="py-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-wrap gap-0.5 cursor-help">
                                {mapping.scenarios?.map((sc, j) => (
                                  <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-medium">{sc}</span>
                                ))}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm p-3">
                              <p className="font-semibold text-xs mb-1.5">🎯 Scenarios ({mapping.scenarios?.length || 0})</p>
                              <ul className="text-[10px] space-y-1 text-muted-foreground">
                                {mapping.scenarios?.map((sc, j) => (
                                  <li key={j} className="flex items-center gap-1">
                                    <span className="text-blue-500">•</span> {sc}
                                  </li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      {/* Providers - Show actual implemented providers from matrix */}
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-0.5">
                          {actualProviders.length > 0 ? (
                            <>
                              {actualProviders.slice(0, 3).map(p => (
                                <TooltipProvider key={p.id}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[7px] px-1 py-0 cursor-help ${
                                          p.status === 'implemented' 
                                            ? 'bg-primary/10 text-primary border-primary/30' 
                                            : 'bg-secondary/30 text-secondary-foreground border-secondary/30'
                                        }`}
                                      >
                                        {p.name.split(' ')[0]}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">{p.name}: {p.status === 'implemented' ? '✓ Fully implemented' : '⚠ Partial'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                              {actualProviders.length > 3 && (
                                <span className="text-[7px] text-muted-foreground">+{actualProviders.length - 3}</span>
                              )}
                            </>
                          ) : (
                            // Fallback to recommended providers if no implementations
                            mapping.recommendedProviders?.slice(0, 2).map(p => (
                              <Badge key={p} variant="outline" className="text-[7px] px-1 py-0 border-dashed opacity-60">
                                {PROVIDER_SUMMARIES.find(pr => pr.id === p)?.name?.split(' ')[0] || p}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      {/* LLMs */}
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-0.5">
                          {mapping.recommendedLLMs?.slice(0, 2).map((llm, j) => (
                            <span key={j} className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary">{llm.split(' ')[0]}</span>
                          ))}
                        </div>
                      </TableCell>
                      {/* Genie Suite Products */}
                      <TableCell className="py-2">
                        <div className="flex gap-0.5">
                          {mapping.genieProducts?.map(product => (
                            <TooltipProvider key={product}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm cursor-help">{GENIE_PRODUCT_LABELS[product]?.emoji}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium text-xs">{GENIE_PRODUCT_LABELS[product]?.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Gap Analysis Tab - Fully Dynamic with Cross-Functional Mapping */}
        <TabsContent value="gaps" className="mt-0 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Gap Analysis {selectedCategory !== 'all' ? `- ${CATEGORY_LABELS[selectedCategory]}` : ''}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedCategory === 'all' ? 'Showing all categories' : `Filtered by ${CATEGORY_LABELS[selectedCategory]}`}
              </span>
              {editMode && (
                <AddFeatureDialog onAdd={handleAddFeature} existingCategories={existingCategories} />
              )}
            </div>
          </div>
          
          {/* Edit mode indicator */}
          {editMode && (
            <div className="p-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground">
              Edit mode active — Click "Fix Now" to update feature status directly
            </div>
          )}
          
          {/* Dynamic Gap Analysis based on category selection */}
          {(() => {
            const categoryFeatures = selectedCategory === 'all' 
              ? localFeatures 
              : localFeatures.filter(f => f.category === selectedCategory);
            
            const gaps = categoryFeatures.filter(feature => {
              const featureImpl = localMatrix[feature.id] || {};
              const statuses = Object.values(featureImpl).map(p => p?.implementation);
              // Show features that are partial, planned, or not started
              return !statuses.includes('implemented') || statuses.includes('partial');
            }).map(feature => {
              const featureImpl = localMatrix[feature.id] || {};
              const providers = Object.entries(featureImpl);
              const partialProviders = providers.filter(([_, p]) => p?.implementation === 'partial').map(([id]) => id);
              const plannedProviders = providers.filter(([_, p]) => p?.implementation === 'planned').map(([id]) => id);
              const missingProviders = PROVIDER_SUMMARIES.filter(p => !featureImpl[p.id as ProviderId] || featureImpl[p.id as ProviderId]?.implementation === 'not_started');
              
              // Get use cases for this feature
              const useCase = FEATURE_USE_CASES[feature.id];
              
              // Get cross-functional mapping
              const crossFunc = CROSS_FUNCTIONAL_MAPPINGS.find(m => m.primaryFeatureId === feature.id);
              
              // Get related LLMs
              const criticalGap = CRITICAL_GAPS.find(g => g.featureId === feature.id);
              
              return {
                featureId: feature.id,
                feature: feature.name,
                category: feature.category,
                priority: feature.priority,
                partialProviders,
                plannedProviders,
                missingProviders,
                potentialProviders: missingProviders.slice(0, 3).map(p => p.name),
                notes: providers.find(([_, p]) => p?.notes)?.[1]?.notes || 'Integration opportunity',
                useCases: useCase?.scenarios?.slice(0, 3) || criticalGap?.relatedUseCases || [],
                relatedLLMs: crossFunc?.recommendedLLMs || criticalGap?.relatedLLMs || [],
                crossFunctional: crossFunc?.relatedFeatures?.slice(0, 3) || criticalGap?.crossFunctional?.flatMap(cf => 
                  cf.features.map(f => ({ featureId: f, category: cf.category, relationship: 'enhances' as const }))
                )?.slice(0, 3) || [],
              };
            });

            if (gaps.length === 0) {
              return (
                <div className="p-8 text-center border rounded-lg bg-primary/5">
                  <Check className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="font-medium text-foreground">All features in {selectedCategory === 'all' ? 'this view' : CATEGORY_LABELS[selectedCategory]} are fully implemented!</p>
                  <p className="text-xs text-muted-foreground mt-1">Select a different category to see gap analysis.</p>
                </div>
              );
            }

            return (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs w-[120px]">Feature</TableHead>
                      <TableHead className="text-xs w-[60px]">Priority</TableHead>
                      <TableHead className="text-xs w-[100px]">Partial In</TableHead>
                      <TableHead className="text-xs w-[100px]">Could Add</TableHead>
                      <TableHead className="text-xs w-[120px]">Use Cases</TableHead>
                      <TableHead className="text-xs w-[100px]">Cross-Functional</TableHead>
                      <TableHead className="text-xs w-[80px]">LLMs</TableHead>
                      {editMode && <TableHead className="text-xs w-[80px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gaps.slice(0, 20).map((gap, i) => (
                      <TableRow key={`gap-${i}`}>
                        <TableCell className="py-2">
                          <div className="font-medium text-xs">{gap.feature}</div>
                          <span className="text-[9px] text-muted-foreground">{CATEGORY_LABELS[gap.category]?.split(' ')[1]}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant={gap.priority === 'critical' ? 'destructive' : gap.priority === 'high' ? 'default' : 'secondary'} className="text-[9px]">
                            {gap.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-0.5">
                            {gap.partialProviders.length > 0 ? gap.partialProviders.map(p => (
                              <Badge key={p} variant="outline" className="text-[8px] bg-secondary/30">{PROVIDER_SUMMARIES.find(pr => pr.id === p)?.name || p}</Badge>
                            )) : <span className="text-[9px] text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-0.5">
                            {gap.potentialProviders.map(p => (
                              <Badge key={p} variant="outline" className="text-[8px] border-dashed">{p}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        {/* Use Cases Column */}
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-0.5">
                            {gap.useCases.length > 0 ? gap.useCases.slice(0, 2).map((uc, j) => (
                              <span key={j} className="text-[8px] px-1 py-0.5 rounded bg-muted/50 text-foreground">{uc}</span>
                            )) : <span className="text-[9px] text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        {/* Cross-Functional Column */}
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-0.5">
                            {gap.crossFunctional.length > 0 ? gap.crossFunctional.slice(0, 2).map((cf, j) => (
                              <TooltipProvider key={j}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className={`text-[8px] px-1 py-0.5 rounded cursor-help ${
                                      cf.relationship === 'requires' ? 'bg-destructive/10 text-destructive' :
                                      cf.relationship === 'enables' ? 'bg-primary/10 text-primary' :
                                      'bg-secondary/50 text-secondary-foreground'
                                    }`}>
                                      {CATEGORY_LABELS[cf.category]?.split(' ')[0]}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs">
                                    <p className="font-medium">{cf.featureId.replace(/_/g, ' ')}</p>
                                    <p className="text-muted-foreground">{cf.relationship}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )) : <span className="text-[9px] text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        {/* LLMs Column */}
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-0.5">
                            {gap.relatedLLMs.length > 0 ? gap.relatedLLMs.slice(0, 2).map((llm, j) => (
                              <span key={j} className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary">{llm.split(' ')[0]}</span>
                            )) : <span className="text-[9px] text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        {editMode && (
                          <TableCell className="py-2">
                            <div className="flex gap-1">
                              {gap.partialProviders.length > 0 && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 text-[9px] px-2"
                                  onClick={() => {
                                    handleStatusChange(gap.featureId, gap.partialProviders[0], 'implemented');
                                  }}
                                >
                                  ✓
                                </Button>
                              )}
                              {gap.missingProviders.length > 0 && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 text-[9px] px-2"
                                  onClick={() => {
                                    handleStatusChange(gap.featureId, gap.missingProviders[0].id, 'implemented');
                                  }}
                                >
                                  +
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })()}
          
          {/* Critical Integration Opportunities - Now Dynamic by Category */}
          {(() => {
            const filteredCriticalGaps = selectedCategory === 'all' 
              ? CRITICAL_GAPS 
              : CRITICAL_GAPS.filter(g => g.category === selectedCategory);
            
            if (filteredCriticalGaps.length === 0) return null;
            
            return (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-xs text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Critical Integration Opportunities {selectedCategory !== 'all' && `(${CATEGORY_LABELS[selectedCategory]})`}
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs w-[140px]">Feature</TableHead>
                        <TableHead className="text-xs w-[100px]">Provider</TableHead>
                        <TableHead className="text-xs w-[60px]">Priority</TableHead>
                        <TableHead className="text-xs w-[60px]">Effort</TableHead>
                        <TableHead className="text-xs w-[120px]">Use Cases</TableHead>
                        <TableHead className="text-xs w-[100px]">Cross-Functional</TableHead>
                        <TableHead className="text-xs">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCriticalGaps.map((gap, i) => (
                        <TableRow key={i}>
                          <TableCell className="py-2">
                            <div className="font-medium text-xs">{gap.feature}</div>
                            <span className="text-[9px] text-muted-foreground">{CATEGORY_LABELS[gap.category]?.split(' ')[1]}</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className="text-[9px] text-muted-foreground">{gap.provider.split('/')[0].trim()}</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant={gap.priority === 'critical' ? 'destructive' : gap.priority === 'high' ? 'default' : 'secondary'} className="text-[8px]">
                              {gap.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="outline" className={`text-[8px] ${
                              gap.effort === 'low' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                              gap.effort === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                              'bg-red-500/10 text-red-600 border-red-500/30'
                            }`}>
                              {gap.effort}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-wrap gap-0.5">
                              {gap.relatedUseCases?.slice(0, 2).map((uc, j) => (
                                <span key={j} className="text-[8px] px-1 py-0.5 rounded bg-muted/50">{uc}</span>
                              )) || <span className="text-[9px] text-muted-foreground">—</span>}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-wrap gap-0.5">
                              {gap.crossFunctional?.slice(0, 2).map((cf, j) => (
                                <TooltipProvider key={j}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-[8px] px-1 py-0.5 rounded bg-secondary/50 cursor-help">
                                        {CATEGORY_LABELS[cf.category]?.split(' ')[0]}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                      <p className="font-medium">{cf.features.join(', ')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )) || <span className="text-[9px] text-muted-foreground">—</span>}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className="text-[9px] text-muted-foreground">{gap.notes}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* Generation Coverage Tab */}
        <TabsContent value="coverage" className="mt-0">
          <GenerationCoverageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderCapabilityMatrix;
