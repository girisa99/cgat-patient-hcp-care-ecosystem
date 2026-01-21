/**
 * Provider Capability Matrix - Comprehensive Dashboard
 * Shows all features × all providers with implementation status
 * 
 * Features:
 * - Legend for status icons
 * - Dynamic height based on category selection
 * - Inline editing capability
 */

import React, { useState, useMemo } from 'react';
import { Check, X, AlertCircle, Clock, Download, Search, Zap, Target, Plus, Save, Edit2, Info } from 'lucide-react';
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
  CATEGORY_IMPLEMENTATION_SUMMARY, 
  CRITICAL_GAPS,
  LLM_COMPARISONS,
  ROUTING_STRATEGY 
} from './matrixData';
import type { FeatureCategory, ImplementationStatus, ProviderId, Feature } from './types';

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
  const [view, setView] = useState<'matrix' | 'providers' | 'gaps' | 'llm'>('matrix');
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

  // Compute stats from actual matrix data
  const overallStats = useMemo(() => {
    const totals = Object.values(CATEGORY_IMPLEMENTATION_SUMMARY).reduce(
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
      coverage: Math.round(((totals.implemented + totals.partial * 0.5) / totals.total) * 100),
    };
  }, []);

  // Dynamic height - no scroll for single categories with few items
  const needsScroll = selectedCategory === 'all' || filteredFeatures.length > 15;

  const handleExport = () => {
    let csv = 'Feature,Category,Priority,';
    PROVIDER_SUMMARIES.forEach(p => csv += `${p.name},`);
    csv += '\n';
    
    localFeatures.forEach(f => {
      csv += `"${f.name}",${f.category},${f.priority},`;
      PROVIDER_SUMMARIES.forEach(p => {
        const impl = localMatrix[f.id]?.[p.id as ProviderId];
        csv += `${impl?.implementation || 'not_applicable'},`;
      });
      csv += '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'provider_capability_matrix.csv';
    a.click();
    toast.success('Matrix exported!');
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <MatrixLegend />

      {/* Stats Summary */}
      <div className="flex flex-wrap gap-3 py-3 px-4 rounded-lg bg-muted/30 border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium">{overallStats.implemented}</span>
          <span className="text-xs text-muted-foreground">Implemented</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-sm font-medium">{overallStats.partial}</span>
          <span className="text-xs text-muted-foreground">Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm font-medium">{overallStats.planned}</span>
          <span className="text-xs text-muted-foreground">Planned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
          <span className="text-sm font-medium">{overallStats.notStarted}</span>
          <span className="text-xs text-muted-foreground">Not Started</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Progress value={overallStats.coverage} className="w-24 h-2" />
          <span className="text-sm font-bold">{overallStats.coverage}%</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
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
            <Table>
              <TableHeader className="sticky top-0 z-20 bg-background">
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-30 min-w-[180px] border-r font-semibold">Feature</TableHead>
                  <TableHead className="min-w-[70px] bg-background">Cat</TableHead>
                  {PROVIDER_SUMMARIES.map(p => (
                    <TableHead key={p.id} className="text-center min-w-[90px] bg-background">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs font-medium">{p.name.split(' ')[0]}</span>
                              {p.status === 'configured' ? 
                                <Badge variant="outline" className="text-[8px] bg-emerald-500/10 border-emerald-500/30">✓</Badge> :
                                <Badge variant="outline" className="text-[8px] bg-amber-500/10 border-amber-500/30">!</Badge>
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
                  return (
                    <TableRow key={feature.id} className="hover:bg-muted/50">
                      <TableCell className="sticky left-0 bg-background font-medium border-r z-10">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{feature.name}</span>
                          {feature.priority === 'critical' && (
                            <Badge variant="destructive" className="text-[8px] px-1">!</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] px-1">
                          {CATEGORY_LABELS[feature.category]?.split(' ')[0]}
                        </Badge>
                      </TableCell>
                      {PROVIDER_SUMMARIES.map(p => {
                        const impl = featureImpl[p.id as ProviderId];
                        const isEditing = editingCell?.featureId === feature.id && editingCell?.providerId === p.id;
                        
                        return (
                          <TableCell key={`${feature.id}-${p.id}`} className="text-center">
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
                                  <TooltipContent>
                                    <p className="font-medium">{impl?.implementation || 'Not mapped'}</p>
                                    {impl?.confidence && <p className="text-xs">Confidence: {impl.confidence}%</p>}
                                    {impl?.notes && <p className="text-xs text-muted-foreground">{impl.notes}</p>}
                                    {impl?.edgeFunctionUsed && <p className="text-xs">Edge: {impl.edgeFunctionUsed}</p>}
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

        {/* Provider Summary Tab */}
        <TabsContent value="providers" className="mt-0">
          <div className="max-h-[600px] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROVIDER_SUMMARIES.map(provider => (
                <div 
                  key={provider.id} 
                  className={`p-4 rounded-lg border-2 ${
                    provider.status === 'configured' 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : 'border-amber-500/30 bg-amber-500/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{provider.name}</h3>
                      <Badge variant="outline" className={`text-[10px] mt-1 ${
                        provider.costTier === 'budget' ? 'bg-emerald-500/10 border-emerald-500/30' :
                        provider.costTier === 'standard' ? 'bg-blue-500/10 border-blue-500/30' :
                        provider.costTier === 'premium' ? 'bg-purple-500/10 border-purple-500/30' :
                        'bg-amber-500/10 border-amber-500/30'
                      }`}>
                        {provider.costTier}
                      </Badge>
                    </div>
                    <Badge variant={provider.status === 'configured' ? 'default' : 'secondary'} className="text-[10px]">
                      {provider.status === 'configured' ? '✅ Ready' : '⚠️ Needs Key'}
                    </Badge>
                  </div>
                  
                  <Progress value={(provider.implementedFeatures / provider.totalFeatures) * 100} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground mb-3">
                    {provider.implementedFeatures}/{provider.totalFeatures} features ({Math.round((provider.implementedFeatures / provider.totalFeatures) * 100)}%)
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {provider.capabilities.slice(0, 4).map(cap => (
                      <Badge key={cap} variant="outline" className="text-[9px]">{cap}</Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs space-y-1">
                    <p className="text-emerald-600">✓ {provider.strengths.slice(0, 2).join(', ')}</p>
                    {provider.weaknesses.length > 0 && (
                      <p className="text-muted-foreground">⚠ {provider.weaknesses[0]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* LLM Analysis Tab */}
        <TabsContent value="llm" className="mt-0">
          <div className="max-h-[600px] overflow-auto space-y-6">
            {/* Routing Strategy */}
            <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" />
                Routing Strategy: {ROUTING_STRATEGY.primary} → {ROUTING_STRATEGY.fallback}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">{ROUTING_STRATEGY.explanation}</p>
              <div className="flex gap-2 text-xs">
                <div className="flex-1 p-2 bg-emerald-500/10 rounded text-center">
                  <div className="font-bold text-emerald-600">1st: Best Quality</div>
                  <div className="text-muted-foreground">GPT-4o, Claude</div>
                </div>
                <div className="flex-1 p-2 bg-blue-500/10 rounded text-center">
                  <div className="font-bold text-blue-600">2nd: Balanced</div>
                  <div className="text-muted-foreground">Gemini, Qwen</div>
                </div>
                <div className="flex-1 p-2 bg-muted rounded text-center">
                  <div className="font-bold">3rd: Budget</div>
                  <div className="text-muted-foreground">DeepSeek</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted/50 rounded">
                <strong>Why not cheapest first?</strong> {ROUTING_STRATEGY.whyNotCheapestFirst}
              </p>
            </div>

            {/* LLM Comparison Table */}
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="min-w-[120px]">Model</TableHead>
                    <TableHead className="min-w-[80px]">Cost</TableHead>
                    <TableHead className="min-w-[60px]">Acc</TableHead>
                    <TableHead className="min-w-[150px]">Best Industries</TableHead>
                    <TableHead className="min-w-[150px]">Output Types</TableHead>
                    <TableHead className="min-w-[150px]">Input Strengths</TableHead>
                    <TableHead className="min-w-[200px]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {LLM_COMPARISONS.map(llm => (
                    <TableRow key={llm.model} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium text-sm">{llm.model}</div>
                        <Badge variant="outline" className="text-[8px]">{llm.provider}</Badge>
                      </TableCell>
                      <TableCell>{COST_BADGES[llm.costTier]}</TableCell>
                      <TableCell>
                        <div className={`text-sm font-bold ${
                          llm.accuracy >= 95 ? 'text-emerald-600' :
                          llm.accuracy >= 90 ? 'text-blue-600' : 'text-muted-foreground'
                        }`}>
                          {llm.accuracy}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {llm.bestForIndustries.map(ind => (
                            <Badge key={ind} variant="secondary" className="text-[8px]">{ind}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {llm.bestForOutputTypes.map(out => (
                            <Badge key={out} variant="outline" className="text-[8px]">{out}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {llm.inputStrengths.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">{llm.notes}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Azure vs OpenAI */}
            <div className="p-4 rounded-lg border bg-muted/20">
              <h3 className="font-semibold text-sm mb-2">🔷 Azure OpenAI vs Direct OpenAI</h3>
              <p className="text-xs text-muted-foreground mb-3">
                <strong>Current:</strong> Direct OpenAI. <strong>Azure OpenAI</strong> = same models + enterprise compliance.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium text-primary mb-1">Azure Advantages:</div>
                  <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                    <li>HIPAA/SOC2/GDPR built-in</li>
                    <li>Private VNet, Regional data</li>
                    <li>99.9% SLA</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">When to Use Azure:</div>
                  <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                    <li>Healthcare PHI data</li>
                    <li>Financial services (PCI-DSS)</li>
                    <li>Government/public sector</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs bg-muted p-2 rounded mt-3">
                <strong>Recommendation:</strong> Keep direct OpenAI for general use. Add Azure for HIPAA-required healthcare clients.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gaps" className="mt-0">
          <div className="max-h-[600px] overflow-auto">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Critical Gaps to Address (Using Configured Providers Only)
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Best Provider</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Effort</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CRITICAL_GAPS.map((gap, i) => (
                    <TableRow key={`gap-${i}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{gap.feature}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{gap.provider}</TableCell>
                      <TableCell>
                        <Badge variant={gap.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {gap.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{gap.effort}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{gap.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border text-xs text-muted-foreground">
              <strong>Note:</strong> All gaps can be addressed using currently configured providers (ModelsLab, ElevenLabs, Alibaba, etc.). 
              No need for Suno or Runway—their features are covered by existing providers' APIs.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderCapabilityMatrix;
