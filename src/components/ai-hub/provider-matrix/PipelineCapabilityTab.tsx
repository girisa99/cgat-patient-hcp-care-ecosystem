/**
 * Pipeline Capability Tab
 * 
 * Comprehensive view of 100+ transformation pipelines with:
 * - Provider support mapping
 * - Vertical (product category) coverage
 * - Implementation status
 * - Quality metrics
 * - Category filtering
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Zap, 
  Clock, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Layers,
  Filter
} from 'lucide-react';
import { 
  PIPELINE_CAPABILITY_MATRIX, 
  PROVIDER_VERTICAL_MATRIX,
  type PipelineCapabilityEntry,
  type PipelineCategory,
  type ProductVertical,
  type SupportLevel
} from './pipelineCapabilityMatrix';

const CATEGORY_LABELS: Record<PipelineCategory, { label: string; icon: string }> = {
  presentation: { label: 'Presentation', icon: '📊' },
  video_production: { label: 'Video Production', icon: '🎬' },
  content_repurposing: { label: 'Content Repurposing', icon: '🔄' },
  training_ld: { label: 'Training & L&D', icon: '🎓' },
  marketing_advertising: { label: 'Marketing & Ads', icon: '📢' },
  social_media: { label: 'Social Media', icon: '📱' },
  sales_enablement: { label: 'Sales Enablement', icon: '💼' },
  customer_education: { label: 'Customer Education', icon: '📚' },
  localization: { label: 'Localization', icon: '🌍' },
  data_analytics: { label: 'Data Analytics', icon: '📈' },
  internal_comms: { label: 'Internal Comms', icon: '📣' },
  live_realtime: { label: 'Live & Real-time', icon: '🔴' },
  immersive_3d: { label: 'Immersive 3D', icon: '🥽' },
  audio_sfx: { label: 'Audio & SFX', icon: '🎵' },
};

const VERTICAL_LABELS: Record<ProductVertical, { label: string; short: string }> = {
  presentations: { label: 'Presentations', short: 'Deck' },
  ai_avatar: { label: 'AI Avatar', short: 'Avatar' },
  generative_video: { label: 'Generative Video', short: 'GenVid' },
  video_repurposing: { label: 'Video Repurposing', short: 'Repurp' },
  social_publishing: { label: 'Social Publishing', short: 'Social' },
  ld_training: { label: 'L&D Training', short: 'L&D' },
  marketing_ads: { label: 'Marketing & Ads', short: 'Ads' },
  localization: { label: 'Localization', short: 'i18n' },
  enterprise: { label: 'Enterprise', short: 'Ent' },
  data_analytics: { label: 'Data Analytics', short: 'Data' },
  internal_comms: { label: 'Internal Comms', short: 'Comms' },
  customer_education: { label: 'Customer Education', short: 'CustEd' },
  sales_enablement: { label: 'Sales Enablement', short: 'Sales' },
  live_realtime: { label: 'Live & Real-time', short: 'Live' },
  immersive_3d: { label: 'Immersive 3D', short: '3D' },
  collaboration: { label: 'Collaboration', short: 'Collab' },
};

const SUPPORT_ICONS: Record<SupportLevel, { icon: React.ReactNode; color: string }> = {
  full: { icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-emerald-500 bg-emerald-500/10' },
  partial: { icon: <AlertCircle className="h-3 w-3" />, color: 'text-amber-500 bg-amber-500/10' },
  planned: { icon: <Clock className="h-3 w-3" />, color: 'text-blue-500 bg-blue-500/10' },
  none: { icon: <XCircle className="h-3 w-3" />, color: 'text-muted-foreground/30' },
};

interface PipelineCapabilityTabProps {
  className?: string;
}

export const PipelineCapabilityTab: React.FC<PipelineCapabilityTabProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PipelineCategory | 'all'>('all');
  const [selectedVertical, setSelectedVertical] = useState<ProductVertical | 'all'>('all');
  
  // Filter pipelines
  const filteredPipelines = useMemo(() => {
    return PIPELINE_CAPABILITY_MATRIX.filter(p => {
      const matchesSearch = p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesVertical = selectedVertical === 'all' || 
                              (p.verticalSupport[selectedVertical] && p.verticalSupport[selectedVertical] !== 'none');
      return matchesSearch && matchesCategory && matchesVertical;
    });
  }, [searchTerm, selectedCategory, selectedVertical]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<PipelineCategory, { total: number; full: number; partial: number }> = {} as any;
    
    Object.keys(CATEGORY_LABELS).forEach(cat => {
      const catPipelines = PIPELINE_CAPABILITY_MATRIX.filter(p => p.category === cat);
      stats[cat as PipelineCategory] = {
        total: catPipelines.length,
        full: catPipelines.filter(p => p.qualityScore >= 80).length,
        partial: catPipelines.filter(p => p.qualityScore >= 50 && p.qualityScore < 80).length,
      };
    });
    
    return stats;
  }, []);

  // Overall metrics
  const overallMetrics = useMemo(() => {
    const total = PIPELINE_CAPABILITY_MATRIX.length;
    const avgQuality = Math.round(PIPELINE_CAPABILITY_MATRIX.reduce((acc, p) => acc + p.qualityScore, 0) / total);
    const avgAutomation = Math.round(PIPELINE_CAPABILITY_MATRIX.reduce((acc, p) => acc + p.automationLevel, 0) / total);
    const uniqueProviders = new Set(PIPELINE_CAPABILITY_MATRIX.flatMap(p => [...p.primaryProviders, ...p.fallbackProviders]));
    
    return { total, avgQuality, avgAutomation, providerCount: uniqueProviders.size };
  }, []);

  // Active verticals for selected category
  const activeVerticals: ProductVertical[] = ['presentations', 'ai_avatar', 'generative_video', 'ld_training', 'marketing_ads', 'localization', 'enterprise', 'sales_enablement'];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Total Pipelines</span>
          </div>
          <div className="text-2xl font-bold">{overallMetrics.total}</div>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Avg Quality</span>
          </div>
          <div className="text-2xl font-bold">{overallMetrics.avgQuality}%</div>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-muted-foreground">Avg Automation</span>
          </div>
          <div className="text-2xl font-bold">{overallMetrics.avgAutomation}%</div>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Providers</span>
          </div>
          <div className="text-2xl font-bold">{overallMetrics.providerCount}</div>
        </div>
      </div>

      {/* Category Quick Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          All ({PIPELINE_CAPABILITY_MATRIX.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([cat, { label, icon }]) => {
          const stats = categoryStats[cat as PipelineCategory];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as PipelineCategory)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                selectedCategory === cat 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {icon} {label} ({stats.total})
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedVertical} onValueChange={(v) => setSelectedVertical(v as ProductVertical | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Vertical" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            {Object.entries(VERTICAL_LABELS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Matrix Table */}
      <div className="border rounded-lg overflow-auto max-h-[500px]">
        <Table className="table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-[200px] font-semibold text-xs sticky left-0 bg-background z-20 border-r">
                Pipeline
              </TableHead>
              <TableHead className="w-[80px] text-xs text-center">Quality</TableHead>
              <TableHead className="w-[80px] text-xs text-center">Auto</TableHead>
              <TableHead className="w-[100px] text-xs">Providers</TableHead>
              {activeVerticals.map(v => (
                <TableHead key={v} className="w-[50px] text-xs text-center p-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-[8px]">{VERTICAL_LABELS[v].short}</span>
                      </TooltipTrigger>
                      <TooltipContent>{VERTICAL_LABELS[v].label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPipelines.map(pipeline => (
              <TableRow key={pipeline.pipelineId} className="hover:bg-muted/50">
                <TableCell className="sticky left-0 bg-background z-10 border-r">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{CATEGORY_LABELS[pipeline.category]?.icon}</span>
                          <div>
                            <div className="text-[11px] font-medium truncate max-w-[150px]">
                              {pipeline.displayName}
                            </div>
                            <div className="text-[9px] text-muted-foreground truncate max-w-[150px]">
                              {pipeline.description}
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-semibold">{pipeline.displayName}</p>
                        <p className="text-xs text-muted-foreground">{pipeline.description}</p>
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Required: </span>
                          {pipeline.requiredCapabilities.join(', ')}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Est. Time: </span>
                          {Math.round(pipeline.estimatedDurationSeconds / 60)}min
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] font-bold ${
                      pipeline.qualityScore >= 80 ? 'text-emerald-600' :
                      pipeline.qualityScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {pipeline.qualityScore}%
                    </span>
                    <Progress value={pipeline.qualityScore} className="h-1 w-10" />
                  </div>
                </TableCell>
                
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] font-bold ${
                      pipeline.automationLevel >= 80 ? 'text-purple-600' :
                      pipeline.automationLevel >= 60 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {pipeline.automationLevel}%
                    </span>
                    <Progress value={pipeline.automationLevel} className="h-1 w-10" />
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-0.5">
                    {pipeline.primaryProviders.slice(0, 3).map(p => (
                      <Badge key={p} variant="outline" className="text-[7px] px-1 py-0 h-4">
                        {PROVIDER_VERTICAL_MATRIX[p]?.name?.split(' ')[0] || p}
                      </Badge>
                    ))}
                    {pipeline.primaryProviders.length > 3 && (
                      <Badge variant="secondary" className="text-[7px] px-1 py-0 h-4">
                        +{pipeline.primaryProviders.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                {activeVerticals.map(v => {
                  const support = pipeline.verticalSupport[v] || 'none';
                  const { icon, color } = SUPPORT_ICONS[support];
                  return (
                    <TableCell key={v} className="text-center p-1">
                      <span className={`flex items-center justify-center w-5 h-5 rounded mx-auto ${color}`}>
                        {icon}
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filteredPipelines.length} of {PIPELINE_CAPABILITY_MATRIX.length} pipelines</span>
        <span>
          {filteredPipelines.filter(p => p.qualityScore >= 80).length} production-ready | 
          {filteredPipelines.filter(p => p.qualityScore < 80 && p.qualityScore >= 50).length} in development
        </span>
      </div>
    </div>
  );
};

export default PipelineCapabilityTab;
