/**
 * Dynamic Pipeline Selector Component
 * 
 * Allows users to select transformation pipelines dynamically from PIPELINE_CAPABILITY_MATRIX
 * Replaces hardcoded pipeline selection with intelligent context-based recommendations
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search,
  Zap,
  Star,
  Clock,
  Lock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useDynamicPipeline, 
  type PipelineContext, 
  type PipelineSelection 
} from '@/hooks/useDynamicPipeline';
import type { PipelineCategory } from '@/components/ai-hub/provider-matrix/pipelineCapabilityMatrix';

// Category display configuration
const CATEGORY_CONFIG: Record<PipelineCategory, { label: string; icon: string; color: string }> = {
  presentation: { label: 'Presentation', icon: '📊', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  video_production: { label: 'Video', icon: '🎬', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  content_repurposing: { label: 'Repurpose', icon: '🔄', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  training_ld: { label: 'Training', icon: '🎓', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  marketing_advertising: { label: 'Marketing', icon: '📢', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  social_media: { label: 'Social', icon: '📱', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  sales_enablement: { label: 'Sales', icon: '💼', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  customer_education: { label: 'Education', icon: '📚', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  localization: { label: 'Localization', icon: '🌍', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  data_analytics: { label: 'Analytics', icon: '📈', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  internal_comms: { label: 'Comms', icon: '📣', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  live_realtime: { label: 'Live', icon: '🔴', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  immersive_3d: { label: '3D/VR', icon: '🥽', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
  audio_sfx: { label: 'Audio', icon: '🎵', color: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20' },
};

interface DynamicPipelineSelectorProps {
  inputSource?: string;
  outputType?: string;
  onPipelineSelect: (pipelineId: string) => void;
  selectedPipelineId?: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Pipeline Card Component
 */
function PipelineCard({
  selection,
  isSelected,
  onSelect,
  compact,
}: {
  selection: PipelineSelection;
  isSelected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const { pipeline, matchScore, matchReasons, isRecommended, tierCompatible } = selection;
  const categoryConfig = CATEGORY_CONFIG[pipeline.category];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onSelect}
            disabled={!tierCompatible}
            className={cn(
              'w-full text-left rounded-lg border transition-all duration-200',
              'hover:shadow-md hover:border-primary/50',
              isSelected && 'ring-2 ring-primary border-primary bg-primary/5',
              !tierCompatible && 'opacity-50 cursor-not-allowed',
              compact ? 'p-2' : 'p-3'
            )}
          >
            <div className="flex items-start gap-2">
              {/* Category Icon */}
              <div className={cn(
                'flex-shrink-0 rounded-md flex items-center justify-center text-sm',
                compact ? 'w-6 h-6' : 'w-8 h-8',
                categoryConfig.color
              )}>
                {categoryConfig.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn(
                    'font-medium truncate',
                    compact ? 'text-xs' : 'text-sm'
                  )}>
                    {pipeline.displayName}
                  </span>
                  
                  {isRecommended && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Star className="h-2.5 w-2.5 mr-0.5" />
                      Best
                    </Badge>
                  )}
                  
                  {!tierCompatible && (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                  
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto" />
                  )}
                </div>
                
                {!compact && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {pipeline.description}
                  </p>
                )}
                
                {/* Match Score & Metrics */}
                <div className="flex items-center gap-2 mt-1">
                  {matchScore > 0 && (
                    <Badge variant="outline" className="h-4 px-1 text-[9px]">
                      <Zap className="h-2 w-2 mr-0.5" />
                      {matchScore}%
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="h-4 px-1 text-[9px]">
                    <Clock className="h-2 w-2 mr-0.5" />
                    {Math.ceil(pipeline.estimatedDurationSeconds / 60)}m
                  </Badge>
                  
                  {!compact && (
                    <Badge 
                      variant="outline" 
                      className={cn('h-4 px-1 text-[9px] border', categoryConfig.color)}
                    >
                      {categoryConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
              
              <ChevronRight className={cn(
                'flex-shrink-0 text-muted-foreground transition-transform',
                compact ? 'h-3 w-3' : 'h-4 w-4',
                isSelected && 'rotate-90'
              )} />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-medium">{pipeline.displayName}</p>
            <p className="text-xs text-muted-foreground">{pipeline.description}</p>
            {matchReasons.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {matchReasons.map((reason, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {reason}
                  </Badge>
                ))}
              </div>
            )}
            {!tierCompatible && (
              <p className="text-xs text-amber-500 pt-1">
                Upgrade to {pipeline.minimumTier} tier to unlock
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Main Dynamic Pipeline Selector
 */
export function DynamicPipelineSelector({
  inputSource,
  outputType,
  onPipelineSelect,
  selectedPipelineId,
  className,
  compact = false,
}: DynamicPipelineSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PipelineCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Initialize context from props
  const initialContext: PipelineContext = useMemo(() => ({
    inputSource,
    outputType,
    searchTerm,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  }), [inputSource, outputType, searchTerm, selectedCategory]);
  
  const {
    filteredPipelines,
    selectedPipeline,
    recommendedPipeline,
    selectPipeline,
    categories,
  } = useDynamicPipeline(initialContext);
  
  // Handle selection
  const handleSelect = (pipelineId: string) => {
    selectPipeline(pipelineId);
    onPipelineSelect(pipelineId);
  };
  
  // Filter by search term (local filter on top of hook)
  const displayedPipelines = useMemo(() => {
    if (!searchTerm.trim()) return filteredPipelines;
    const search = searchTerm.toLowerCase();
    return filteredPipelines.filter(s => 
      s.pipeline.displayName.toLowerCase().includes(search) ||
      s.pipeline.description.toLowerCase().includes(search)
    );
  }, [filteredPipelines, searchTerm]);
  
  // Filter by category
  const categoryFilteredPipelines = useMemo(() => {
    if (selectedCategory === 'all') return displayedPipelines;
    return displayedPipelines.filter(s => s.pipeline.category === selectedCategory);
  }, [displayedPipelines, selectedCategory]);

  return (
    <Card className={cn('border', className)}>
      <CardHeader className={compact ? 'py-2 px-3' : 'py-3 px-4'}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn('flex items-center gap-2', compact ? 'text-xs' : 'text-sm')}>
            <Sparkles className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            Select Pipeline
            <Badge variant="secondary" className={compact ? 'text-[9px]' : 'text-[10px]'}>
              {categoryFilteredPipelines.length} available
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn('pl-7', compact ? 'h-7 text-xs' : 'h-8 text-sm')}
          />
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'px-3 pb-3' : 'px-4 pb-4'}>
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as PipelineCategory | 'all')}>
          <ScrollArea className="w-full">
            <TabsList className="h-7 p-0.5 bg-muted/50 w-auto inline-flex">
              <TabsTrigger value="all" className="h-6 px-2 text-[10px]">
                All
              </TabsTrigger>
              {categories.slice(0, 6).map(cat => (
                <TabsTrigger key={cat} value={cat} className="h-6 px-2 text-[10px]">
                  {CATEGORY_CONFIG[cat]?.icon} {CATEGORY_CONFIG[cat]?.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          <TabsContent value={selectedCategory} className="mt-2">
            {/* Recommended Pipeline */}
            {recommendedPipeline && selectedCategory === 'all' && !searchTerm && (
              <div className="mb-3">
                <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  Recommended for your context
                </p>
                <PipelineCard
                  selection={categoryFilteredPipelines.find(p => p.pipeline.pipelineId === recommendedPipeline.pipelineId)!}
                  isSelected={selectedPipelineId === recommendedPipeline.pipelineId}
                  onSelect={() => handleSelect(recommendedPipeline.pipelineId)}
                  compact={compact}
                />
              </div>
            )}
            
            {/* Pipeline List */}
            <ScrollArea className={compact ? 'h-[180px]' : 'h-[250px]'}>
              <div className={cn(
                'space-y-1.5',
                viewMode === 'grid' && 'grid grid-cols-2 gap-1.5 space-y-0'
              )}>
                {categoryFilteredPipelines
                  .filter(p => !recommendedPipeline || p.pipeline.pipelineId !== recommendedPipeline.pipelineId || selectedCategory !== 'all' || searchTerm)
                  .map(selection => (
                    <PipelineCard
                      key={selection.pipeline.pipelineId}
                      selection={selection}
                      isSelected={selectedPipelineId === selection.pipeline.pipelineId}
                      onSelect={() => handleSelect(selection.pipeline.pipelineId)}
                      compact={compact || viewMode === 'grid'}
                    />
                  ))}
              </div>
              
              {categoryFilteredPipelines.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Filter className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pipelines match your filters</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {/* Selected Pipeline Preview */}
        {selectedPipeline && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedPipeline.displayName}</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                ~{Math.ceil(selectedPipeline.estimatedDurationSeconds / 60)} min
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {selectedPipeline.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact inline pipeline selector for embedding
 */
export function InlinePipelineSelector({
  inputSource,
  outputType,
  onPipelineSelect,
  selectedPipelineId,
  className,
}: Omit<DynamicPipelineSelectorProps, 'compact'>) {
  const initialContext: PipelineContext = useMemo(() => ({
    inputSource,
    outputType,
  }), [inputSource, outputType]);
  
  const { filteredPipelines, recommendedPipeline } = useDynamicPipeline(initialContext);
  
  // Show top 3 recommendations
  const topPipelines = filteredPipelines.slice(0, 3);
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground">Pipeline:</span>
      <div className="flex gap-1">
        {topPipelines.map(({ pipeline, isRecommended }) => (
          <Button
            key={pipeline.pipelineId}
            variant={selectedPipelineId === pipeline.pipelineId ? 'default' : 'outline'}
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => onPipelineSelect(pipeline.pipelineId)}
          >
            {isRecommended && <Star className="h-2.5 w-2.5 mr-1 text-amber-500" />}
            {pipeline.displayName}
          </Button>
        ))}
      </div>
    </div>
  );
}
