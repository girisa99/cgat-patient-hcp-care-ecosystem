/**
 * Implementation Priority Queue
 * 
 * Actionable roadmap showing what to build next based on:
 * - Dependencies (blocked vs ready)
 * - Business impact
 * - Effort estimation
 * - Cross-functional unlocks
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Zap, 
  Clock, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Lock,
  Unlock,
  TrendingUp,
  Filter
} from 'lucide-react';
import { 
  ALL_FEATURES, 
  FEATURE_IMPLEMENTATION_MATRIX,
  CROSS_FUNCTIONAL_MAPPINGS,
  FEATURE_USE_CASES,
  GENIE_PRODUCT_LABELS
} from './matrixData';
import type { FeatureCategory, Feature } from './types';

interface PriorityItem {
  feature: Feature;
  status: 'ready' | 'blocked' | 'partial' | 'implemented';
  blockers: string[];
  unlocks: string[];
  businessImpact: number; // 1-10
  effort: 'low' | 'medium' | 'high';
  priorityScore: number;
  scenarios: string[];
  useCases: string[];
  productsAffected: string[];
}

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
  SECURITY: '🔐 Security',
  BUSINESS: '💰 Business',
  USE_CASE: '💼 Use Case',
};

interface ImplementationPriorityQueueProps {
  selectedCategory?: FeatureCategory | 'all';
}

export const ImplementationPriorityQueue: React.FC<ImplementationPriorityQueueProps> = ({
  selectedCategory = 'all'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'blocked' | 'partial'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'effort'>('priority');

  // Build priority queue
  const priorityItems = useMemo<PriorityItem[]>(() => {
    const items: PriorityItem[] = [];
    
    const filteredFeatures = selectedCategory === 'all' 
      ? ALL_FEATURES 
      : ALL_FEATURES.filter(f => f.category === selectedCategory);
    
    filteredFeatures.forEach(feature => {
      const impl = FEATURE_IMPLEMENTATION_MATRIX[feature.id];
      const useCase = FEATURE_USE_CASES[feature.id];
      
      // Determine implementation status
      let status: PriorityItem['status'] = 'blocked';
      if (impl) {
        const statuses = Object.values(impl).map(p => p?.implementation);
        if (statuses.includes('implemented')) {
          status = 'implemented';
        } else if (statuses.includes('partial')) {
          status = 'partial';
        } else if (statuses.includes('planned')) {
          status = 'ready';
        }
      }
      
      // Find blockers (features this depends on)
      const blockers: string[] = [];
      const unlocks: string[] = [];
      const productsAffected: string[] = [];
      
      CROSS_FUNCTIONAL_MAPPINGS.forEach(m => {
        if (m.primaryFeatureId === feature.id) {
          // Find what this feature requires
          m.relatedFeatures?.forEach(rf => {
            if (rf.relationship === 'requires') {
              const reqFeature = ALL_FEATURES.find(f => f.id === rf.featureId);
              if (reqFeature) {
                const reqImpl = FEATURE_IMPLEMENTATION_MATRIX[rf.featureId];
                const isImplemented = reqImpl && Object.values(reqImpl).some(p => p?.implementation === 'implemented');
                if (!isImplemented) {
                  blockers.push(reqFeature.name);
                }
              }
            }
          });
          
          // Track products affected
          m.genieProducts?.forEach(p => {
            const label = GENIE_PRODUCT_LABELS[p];
            if (label && !productsAffected.includes(label.name)) {
              productsAffected.push(label.name);
            }
          });
        }
        
        // Find what this feature unlocks
        m.relatedFeatures?.forEach(rf => {
          if (rf.featureId === feature.id && rf.relationship === 'requires') {
            const parentFeature = ALL_FEATURES.find(f => f.id === m.primaryFeatureId);
            if (parentFeature && !unlocks.includes(parentFeature.name)) {
              unlocks.push(parentFeature.name);
            }
          }
        });
      });
      
      // Update status based on blockers
      if (status === 'blocked' && blockers.length === 0) {
        status = 'ready';
      } else if (blockers.length > 0 && status !== 'implemented' && status !== 'partial') {
        status = 'blocked';
      }
      
      // Calculate business impact (based on unlocks and use cases)
      const businessImpact = Math.min(10, 
        3 + // Base impact
        Math.min(3, unlocks.length) + // Unlocks bonus
        Math.min(2, (useCase?.scenarios?.length || 0) / 2) + // Scenarios bonus
        (feature.priority === 'critical' ? 2 : feature.priority === 'high' ? 1 : 0)
      );
      
      // Estimate effort
      const effort: PriorityItem['effort'] = 
        feature.category === '3D' || feature.category === 'AR_VR' || feature.category === 'VFX' 
          ? 'high' 
          : feature.category === 'VIDEO' || feature.category === 'ANIMATION'
            ? 'medium'
            : 'low';
      
      // Calculate priority score
      const priorityScore = 
        (status === 'ready' ? 100 : status === 'partial' ? 50 : 0) +
        (businessImpact * 10) +
        (unlocks.length * 15) +
        (effort === 'low' ? 20 : effort === 'medium' ? 10 : 0);
      
      items.push({
        feature,
        status,
        blockers,
        unlocks,
        businessImpact,
        effort,
        priorityScore,
        scenarios: useCase?.scenarios || [],
        useCases: useCase?.bestFor || [],
        productsAffected,
      });
    });
    
    return items;
  }, [selectedCategory]);

  // Filter and sort
  const displayItems = useMemo(() => {
    let filtered = priorityItems.filter(item => {
      const matchesSearch = item.feature.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus && item.status !== 'implemented';
    });
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
      if (sortBy === 'impact') return b.businessImpact - a.businessImpact;
      if (sortBy === 'effort') {
        const effortOrder = { low: 0, medium: 1, high: 2 };
        return effortOrder[a.effort] - effortOrder[b.effort];
      }
      return 0;
    });
    
    return filtered;
  }, [priorityItems, searchTerm, filterStatus, sortBy]);

  // Summary stats
  const stats = useMemo(() => ({
    ready: priorityItems.filter(i => i.status === 'ready').length,
    blocked: priorityItems.filter(i => i.status === 'blocked').length,
    partial: priorityItems.filter(i => i.status === 'partial').length,
    implemented: priorityItems.filter(i => i.status === 'implemented').length,
    total: priorityItems.length,
  }), [priorityItems]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="p-3 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-1">
            <Unlock className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">Ready</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.ready}</div>
        </Card>
        <Card className="p-3 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Partial</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.partial}</div>
        </Card>
        <Card className="p-3 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-muted-foreground">Blocked</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
        </Card>
        <Card className="p-3 border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Done</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.implemented}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
          </div>
          <div className="text-2xl font-bold">{Math.round((stats.implemented / stats.total) * 100)}%</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">By Priority</SelectItem>
            <SelectItem value="impact">By Impact</SelectItem>
            <SelectItem value="effort">By Effort</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Queue Table */}
      <div className="border rounded-lg overflow-auto max-h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead className="w-[200px]">Feature</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead className="w-[80px]">Impact</TableHead>
              <TableHead className="w-[80px]">Effort</TableHead>
              <TableHead className="w-[150px]">Blockers</TableHead>
              <TableHead className="w-[150px]">Unlocks</TableHead>
              <TableHead className="w-[100px]">Products</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.slice(0, 50).map((item, index) => (
              <TableRow key={item.feature.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">
                        <div>
                          <div className="text-sm font-medium">{item.feature.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {CATEGORY_LABELS[item.feature.category]}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-semibold">{item.feature.name}</p>
                        {item.scenarios.length > 0 && (
                          <p className="text-xs mt-1">
                            <span className="font-medium">Scenarios:</span> {item.scenarios.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {item.useCases.length > 0 && (
                          <p className="text-xs mt-1">
                            <span className="font-medium">Use Cases:</span> {item.useCases.slice(0, 3).join(', ')}
                          </p>
                        )}
                        <p className="text-xs mt-1 text-muted-foreground">
                          Priority Score: {item.priorityScore}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === 'ready' ? 'default' : 'secondary'}
                    className={`text-[10px] ${
                      item.status === 'ready' ? 'bg-emerald-500' :
                      item.status === 'partial' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                  >
                    {item.status === 'ready' ? <Unlock className="h-3 w-3 mr-1" /> :
                     item.status === 'partial' ? <AlertCircle className="h-3 w-3 mr-1" /> :
                     <Lock className="h-3 w-3 mr-1" />}
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Progress value={item.businessImpact * 10} className="w-12 h-2" />
                    <span className="text-[10px] font-medium">{item.businessImpact}/10</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      item.effort === 'low' ? 'border-emerald-500 text-emerald-600' :
                      item.effort === 'medium' ? 'border-amber-500 text-amber-600' :
                      'border-red-500 text-red-600'
                    }`}
                  >
                    {item.effort}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-0.5">
                    {item.blockers.slice(0, 2).map(b => (
                      <Badge key={b} variant="destructive" className="text-[8px] px-1 py-0">
                        {b.slice(0, 15)}...
                      </Badge>
                    ))}
                    {item.blockers.length > 2 && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0">
                        +{item.blockers.length - 2}
                      </Badge>
                    )}
                    {item.blockers.length === 0 && (
                      <span className="text-[10px] text-emerald-600">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-0.5">
                    {item.unlocks.slice(0, 2).map(u => (
                      <Badge key={u} variant="outline" className="text-[8px] px-1 py-0 border-emerald-500 text-emerald-600">
                        {u.slice(0, 15)}...
                      </Badge>
                    ))}
                    {item.unlocks.length > 2 && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0">
                        +{item.unlocks.length - 2}
                      </Badge>
                    )}
                    {item.unlocks.length === 0 && (
                      <span className="text-[10px] text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-0.5">
                    {item.productsAffected.slice(0, 2).map(p => (
                      <Badge key={p} variant="secondary" className="text-[8px] px-1 py-0">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="text-xs text-muted-foreground text-center">
        Showing {Math.min(50, displayItems.length)} of {displayItems.length} actionable items 
        (excluding {stats.implemented} completed)
      </div>
    </div>
  );
};

export default ImplementationPriorityQueue;
