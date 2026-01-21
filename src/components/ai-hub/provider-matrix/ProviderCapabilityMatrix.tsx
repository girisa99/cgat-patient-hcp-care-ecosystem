/**
 * Provider Capability Matrix - Comprehensive Dashboard
 * Shows all features × all providers with implementation status
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle, Clock, ChevronDown, Download, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ALL_FEATURES, PROVIDER_SUMMARIES, FEATURE_IMPLEMENTATION_MATRIX, CATEGORY_IMPLEMENTATION_SUMMARY, CRITICAL_GAPS } from './matrixData';
import type { FeatureCategory, ImplementationStatus, ProviderId } from './types';

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

const STATUS_ICONS: Record<ImplementationStatus, React.ReactNode> = {
  implemented: <Check className="w-4 h-4 text-primary" />,
  partial: <AlertCircle className="w-4 h-4 text-secondary-foreground" />,
  planned: <Clock className="w-4 h-4 text-accent-foreground" />,
  not_started: <X className="w-4 h-4 text-muted-foreground" />,
  not_applicable: <span className="text-muted-foreground">—</span>,
};

export const ProviderCapabilityMatrix: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'matrix' | 'providers' | 'gaps'>('matrix');

  const filteredFeatures = useMemo(() => {
    return ALL_FEATURES.filter(f => {
      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

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

  const handleExport = () => {
    let csv = 'Feature,Category,Priority,';
    PROVIDER_SUMMARIES.forEach(p => csv += `${p.name},`);
    csv += '\n';
    
    ALL_FEATURES.forEach(f => {
      csv += `"${f.name}",${f.category},${f.priority},`;
      PROVIDER_SUMMARIES.forEach(p => {
        const impl = FEATURE_IMPLEMENTATION_MATRIX[f.id]?.[p.id as ProviderId];
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

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-xl">Provider Capability Matrix</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {overallStats.total} features × {PROVIDER_SUMMARIES.length} providers | {overallStats.coverage}% coverage
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-5 gap-4 mt-4">
        {[
          { label: 'Implemented', value: overallStats.implemented, color: 'bg-primary' },
          { label: 'Partial', value: overallStats.partial, color: 'bg-secondary' },
          { label: 'Planned', value: overallStats.planned, color: 'bg-accent' },
          { label: 'Not Started', value: overallStats.notStarted, color: 'bg-muted' },
          { label: 'Total', value: overallStats.total, color: 'bg-foreground' },
        ].map(stat => (
            <div key={stat.label} className="text-center p-3 rounded-lg border bg-card">
              <div className={`w-3 h-3 rounded-full ${stat.color} mx-auto mb-1`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList>
              <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
              <TabsTrigger value="providers">By Provider</TabsTrigger>
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
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feature Matrix Tab */}
          <TabsContent value="matrix">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Feature</TableHead>
                    <TableHead className="w-20">Category</TableHead>
                    {PROVIDER_SUMMARIES.slice(0, 8).map(p => (
                      <TableHead key={p.id} className="text-center w-24">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <span className="text-xs">{p.name.split(' ')[0]}</span>
                              {p.status === 'configured' ? 
                                <Badge variant="outline" className="ml-1 text-[8px] bg-primary/10">✓</Badge> :
                                <Badge variant="outline" className="ml-1 text-[8px] bg-secondary/30">!</Badge>
                              }
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs">{p.implementedFeatures}/{p.totalFeatures} features</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeatures.map(feature => {
                    const featureImpl = FEATURE_IMPLEMENTATION_MATRIX[feature.id] || {};
                    return (
                      <TableRow key={feature.id}>
                        <TableCell className="sticky left-0 bg-background font-medium">
                          {feature.name}
                          {feature.priority === 'critical' && (
                            <Badge variant="destructive" className="ml-2 text-[8px]">Critical</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {CATEGORY_LABELS[feature.category]?.split(' ')[0]}
                          </Badge>
                        </TableCell>
                        {PROVIDER_SUMMARIES.slice(0, 8).map(p => {
                          const impl = featureImpl[p.id as ProviderId];
                          return (
                            <TableCell key={p.id} className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    {STATUS_ICONS[impl?.implementation || 'not_applicable']}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{impl?.implementation || 'Not applicable'}</p>
                                    {impl?.notes && <p className="text-xs text-muted-foreground">{impl.notes}</p>}
                                    {impl?.edgeFunctionUsed && <p className="text-xs">Edge: {impl.edgeFunctionUsed}</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          {/* Provider Summary Tab */}
          <TabsContent value="providers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROVIDER_SUMMARIES.map(provider => (
                <Card key={provider.id} className={provider.status === 'configured' ? 'border-primary/30' : 'border-secondary/30'}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <Badge variant={provider.status === 'configured' ? 'default' : 'secondary'}>
                        {provider.status === 'configured' ? '✅ Ready' : '⚠️ Needs Key'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(provider.implementedFeatures / provider.totalFeatures) * 100} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground mb-2">
                      {provider.implementedFeatures}/{provider.totalFeatures} features ({Math.round((provider.implementedFeatures / provider.totalFeatures) * 100)}%)
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.capabilities.slice(0, 4).map(cap => (
                        <Badge key={cap} variant="outline" className="text-[10px]">{cap}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-primary">✓ {provider.strengths.slice(0, 2).join(', ')}</p>
                    {provider.weaknesses.length > 0 && (
                      <p className="text-xs text-muted-foreground">⚠ {provider.weaknesses[0]}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gap Analysis Tab */}
          <TabsContent value="gaps">
            <div className="space-y-4">
              <h3 className="font-semibold">🚨 Critical Gaps to Address</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Best Provider</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Effort</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CRITICAL_GAPS.map((gap, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{gap.feature}</TableCell>
                      <TableCell>{gap.provider}</TableCell>
                      <TableCell>
                        <Badge variant={gap.priority === 'high' ? 'destructive' : 'secondary'}>{gap.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{gap.effort}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProviderCapabilityMatrix;
