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
  const [view, setView] = useState<'matrix' | 'providers' | 'gaps' | 'llm'>('matrix');

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
    <Card className={`${className} h-full flex flex-col overflow-hidden`}>
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

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2 flex-shrink-0">
            <TabsList>
              <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
              <TabsTrigger value="providers">By Provider</TabsTrigger>
              <TabsTrigger value="llm">LLM Capabilities</TabsTrigger>
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
          <TabsContent value="matrix" className="flex-1 overflow-hidden mt-0">
            <div className="h-[calc(100vh-400px)] min-h-[400px] overflow-auto border rounded-md">
              <Table className="relative">
                <TableHeader className="sticky top-0 z-20 bg-background">
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-30 min-w-[200px] border-r">Feature</TableHead>
                    <TableHead className="min-w-[80px] bg-background">Category</TableHead>
                    {PROVIDER_SUMMARIES.map(p => (
                      <TableHead key={p.id} className="text-center min-w-[100px] bg-background">
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
                        <TableCell className="sticky left-0 bg-background font-medium border-r z-10">
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
                        {PROVIDER_SUMMARIES.map(p => {
                          const impl = featureImpl[p.id as ProviderId];
                          return (
                            <TableCell key={`${feature.id}-${p.id}`} className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    {STATUS_ICONS[impl?.implementation || 'not_applicable']}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{impl?.implementation || 'Not mapped yet'}</p>
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
            </div>
          </TabsContent>

          {/* Provider Summary Tab */}
          <TabsContent value="providers" className="flex-1 overflow-auto mt-0">
            <div className="h-[calc(100vh-400px)] min-h-[400px] overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
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
            </div>
          </TabsContent>

          {/* LLM Capabilities Tab */}
          <TabsContent value="llm" className="flex-1 overflow-auto mt-0">
            <div className="h-[calc(100vh-400px)] min-h-[400px] overflow-auto">
              <div className="space-y-6 p-1">
                {/* Fallback Logic Explanation */}
                <Card className="border-2 border-dashed border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      ⚡ Fallback Routing Logic
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <p className="text-muted-foreground">
                      <strong>Current Strategy:</strong> Quality-First → Cost-Optimized fallback. Primary uses best-fit model for task, 
                      then falls back to lower-cost alternatives with acceptable quality.
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-primary/10 rounded">
                        <div className="font-bold">1st</div>
                        <div>Best Quality</div>
                      </div>
                      <div className="p-2 bg-secondary/50 rounded">
                        <div className="font-bold">2nd</div>
                        <div>Balanced</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-bold">3rd</div>
                        <div>Budget</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      <strong>Why not cheapest first?</strong> User experience prioritized over cost—critical tasks (healthcare, finance) 
                      need high accuracy. Cost optimization happens in fallback chain, not primary selection.
                    </p>
                  </CardContent>
                </Card>

                {/* LLM Comparison Table */}
                <div>
                  <h3 className="font-semibold mb-3">🧠 LLM Capabilities by Use Case</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Model</TableHead>
                        <TableHead>Best For Industries</TableHead>
                        <TableHead>Output Types</TableHead>
                        <TableHead>Input Understanding</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div>GPT-4o</div>
                          <Badge variant="outline" className="text-[8px]">OpenAI</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-[8px]">Healthcare</Badge>
                            <Badge variant="secondary" className="text-[8px]">Finance</Badge>
                            <Badge variant="secondary" className="text-[8px]">Legal</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[8px]">Long-form</Badge>
                            <Badge variant="outline" className="text-[8px]">Code</Badge>
                            <Badge variant="outline" className="text-[8px]">JSON</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">Vision, PDF, Audio, Complex docs</TableCell>
                        <TableCell><Badge className="bg-destructive/80 text-[8px]">$$$</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div>Gemini 2.5 Pro</div>
                          <Badge variant="outline" className="text-[8px]">Google</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-[8px]">Education</Badge>
                            <Badge variant="secondary" className="text-[8px]">Research</Badge>
                            <Badge variant="secondary" className="text-[8px]">Media</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[8px]">Multimodal</Badge>
                            <Badge variant="outline" className="text-[8px]">Image+Text</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">1M context, Video, Images</TableCell>
                        <TableCell><Badge className="bg-primary/80 text-[8px]">$$</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div>Claude 3.5 Sonnet</div>
                          <Badge variant="outline" className="text-[8px]">Anthropic</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-[8px]">Enterprise</Badge>
                            <Badge variant="secondary" className="text-[8px]">Compliance</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[8px]">Nuanced</Badge>
                            <Badge variant="outline" className="text-[8px]">Safety</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">200K context, Complex reasoning</TableCell>
                        <TableCell><Badge className="bg-destructive/80 text-[8px]">$$$</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div>DeepSeek V3</div>
                          <Badge variant="outline" className="text-[8px]">DeepSeek</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-[8px]">Tech</Badge>
                            <Badge variant="secondary" className="text-[8px]">Startups</Badge>
                            <Badge variant="secondary" className="text-[8px]">Code</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[8px]">Code</Badge>
                            <Badge variant="outline" className="text-[8px]">Math</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">Vision, Code repos</TableCell>
                        <TableCell><Badge className="bg-secondary/80 text-[8px]">$</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div>Qwen 2.5</div>
                          <Badge variant="outline" className="text-[8px]">Alibaba</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-[8px]">APAC</Badge>
                            <Badge variant="secondary" className="text-[8px]">E-commerce</Badge>
                            <Badge variant="secondary" className="text-[8px]">CJK</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[8px]">Multilingual</Badge>
                            <Badge variant="outline" className="text-[8px]">CJK Native</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">Chinese/Japanese/Korean docs</TableCell>
                        <TableCell><Badge className="bg-secondary/80 text-[8px]">$</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Azure vs Direct OpenAI */}
                <Card className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">🔷 Azure OpenAI vs Direct OpenAI</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    <p className="text-muted-foreground">
                      <strong>Current:</strong> Direct OpenAI integration. <strong>Azure OpenAI</strong> offers same models with enterprise benefits.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="font-medium text-primary">Azure OpenAI Advantages:</div>
                        <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                          <li>HIPAA/SOC2/GDPR compliance built-in</li>
                          <li>Private VNet integration</li>
                          <li>Regional data residency</li>
                          <li>Enterprise SLAs (99.9%)</li>
                          <li>Content filtering controls</li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">When to Use Azure:</div>
                        <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                          <li>Healthcare with PHI data</li>
                          <li>Financial services (PCI-DSS)</li>
                          <li>Government/public sector</li>
                          <li>Existing Azure infrastructure</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs bg-muted p-2 rounded">
                      <strong>Recommendation:</strong> Keep direct OpenAI for general use. Add Azure OpenAI for enterprise healthcare clients requiring HIPAA compliance.
                    </p>
                  </CardContent>
              </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gap Analysis Tab */}
          <TabsContent value="gaps" className="flex-1 overflow-auto mt-0">
            <div className="h-[calc(100vh-400px)] min-h-[400px] overflow-auto">
              <div className="space-y-4 p-1">
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
                      <TableRow key={`gap-${i}`}>
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProviderCapabilityMatrix;
