/**
 * Dependency Blocker Analysis
 * 
 * Real-time view of:
 * - Blocked vs ready-to-implement items
 * - Dependency chains (features AND contexts)
 * - Unblocking recommendations
 * - Critical path analysis
 * 
 * UNIFIED DATA SOURCE: Uses getBlockerAnalysisData from unifiedMetricsEngine
 * This ensures data consistency with Generation Coverage tab
 */

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lock, 
  Unlock, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  Layers,
  Building2,
  Compass,
  Image,
  FileOutput
} from 'lucide-react';
import { getBlockerAnalysisData, type BlockedItem, type ReadyItem } from './generation-coverage/unifiedMetricsEngine';
import type { FeatureCategory } from './types';

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  INPUT: '📥 Input',
  SCRIPT: '📝 Script',
  VOICE: '🎙️ Voice',
  AUDIO: '🎵 Audio',
  SFX: '🔊 Sound Effects',
  IMAGE: '🖼️ Image',
  VIDEO: '🎬 Video',
  ANIMATION: '✨ Animation',
  '3D': '🎲 3D',
  AR_VR: '🥽 AR/VR',
  VFX: '🎨 VFX',
  INTERACTIVE: '🎯 Interactive',
  TRANSLATION: '🌍 Translation',
  EXPORT: '📤 Export',
  DOWNLOAD: '⬇️ Download',
  EDITING: '✏️ Editing',
  PIPELINE: '🔄 Pipeline',
  PUBLISHING: '🚀 Publishing',
  SECURITY: '🔐 Security',
  BUSINESS: '💰 Business',
  USE_CASE: '💼 Use Case',
};

const CONTEXT_TYPE_ICONS: Record<string, React.ElementType> = {
  industry: Building2,
  framework: Compass,
  visual: Image,
  output: FileOutput,
  feature: Zap
};

const CONTEXT_TYPE_COLORS: Record<string, string> = {
  industry: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  framework: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  visual: 'bg-green-500/20 text-green-400 border-green-500/30',
  output: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  feature: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};

interface DependencyBlockerAnalysisProps {
  selectedCategory?: FeatureCategory | 'all';
}

export const DependencyBlockerAnalysis: React.FC<DependencyBlockerAnalysisProps> = ({
  selectedCategory = 'all'
}) => {
  const [viewMode, setViewMode] = useState<'all' | 'features' | 'contexts'>('all');

  // Get unified blocker data
  const { blockedItems, readyItems, stats } = useMemo(() => {
    return getBlockerAnalysisData(selectedCategory);
  }, [selectedCategory]);

  // Filter by view mode
  const filteredBlocked = useMemo(() => {
    if (viewMode === 'all') return blockedItems;
    if (viewMode === 'features') return blockedItems.filter(b => b.type === 'feature');
    return blockedItems.filter(b => b.type === 'context');
  }, [blockedItems, viewMode]);

  const filteredReady = useMemo(() => {
    if (viewMode === 'all') return readyItems;
    if (viewMode === 'features') return readyItems.filter(r => r.type === 'feature');
    return readyItems.filter(r => r.type === 'context');
  }, [readyItems, viewMode]);

  // Top blockers (features that block the most others)
  const topBlockers = useMemo(() => {
    return blockedItems
      .filter(b => b.type === 'feature' && b.blocksCount > 0)
      .sort((a, b) => b.blocksCount - a.blocksCount)
      .slice(0, 10);
  }, [blockedItems]);

  // Context blockers
  const contextBlockers = useMemo(() => {
    return blockedItems
      .filter(b => b.type === 'context')
      .slice(0, 15);
  }, [blockedItems]);

  // Ready items sorted by unlock potential
  const topReadyItems = useMemo(() => {
    return filteredReady
      .sort((a, b) => b.unlocksCount - a.unlocksCount)
      .slice(0, 10);
  }, [filteredReady]);

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
          <p className="text-[10px] text-muted-foreground">No blockers</p>
        </Card>
        <Card className="p-3 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-muted-foreground">Blocked</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          <p className="text-[10px] text-muted-foreground">Has dependencies</p>
        </Card>
        <Card className="p-3 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Critical</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.criticalBlockers}</div>
          <p className="text-[10px] text-muted-foreground">High-impact</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Done</span>
          </div>
          <div className="text-2xl font-bold">{stats.implemented}</div>
          <p className="text-[10px] text-muted-foreground">Implemented</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Total</span>
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-[10px] text-muted-foreground">Items tracked</p>
        </Card>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border text-xs">
        <span className="text-muted-foreground font-medium">View:</span>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)} className="flex-1">
          <TabsList className="h-7">
            <TabsTrigger value="all" className="text-[10px] px-2 h-5">
              All ({blockedItems.length + readyItems.length})
            </TabsTrigger>
            <TabsTrigger value="features" className="text-[10px] px-2 h-5">
              <Zap className="h-3 w-3 mr-1" />
              Features ({blockedItems.filter(b => b.type === 'feature').length + readyItems.filter(r => r.type === 'feature').length})
            </TabsTrigger>
            <TabsTrigger value="contexts" className="text-[10px] px-2 h-5">
              <Building2 className="h-3 w-3 mr-1" />
              Contexts ({blockedItems.filter(b => b.type === 'context').length + readyItems.filter(r => r.type === 'context').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Category indicator */}
        {selectedCategory !== 'all' && (
          <Badge variant="outline" className="text-[10px]">
            Filtered: {CATEGORY_LABELS[selectedCategory as FeatureCategory] || selectedCategory}
          </Badge>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Blockers */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Top Blockers to Resolve</h3>
            <Badge variant="outline" className="ml-auto text-[9px]">
              {filteredBlocked.length} items
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">
            Resolving these will unblock the most features/contexts
          </p>
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {/* Feature blockers */}
            {topBlockers.length > 0 && (
              <div className="space-y-2">
                {topBlockers.map((node, index) => (
                  <BlockerRow key={node.id} node={node} index={index} maxBlocks={topBlockers[0]?.blocksCount || 1} />
                ))}
              </div>
            )}
            
            {/* Context blockers */}
            {viewMode !== 'features' && contextBlockers.length > 0 && (
              <>
                <div className="h-px bg-border my-2" />
                <div className="text-[10px] font-medium text-muted-foreground mb-1">Blocked Contexts:</div>
                <div className="space-y-2">
                  {contextBlockers.slice(0, 8).map((node, index) => (
                    <ContextBlockerRow key={node.id} node={node} />
                  ))}
                </div>
              </>
            )}
            
            {filteredBlocked.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No blockers found! 🎉
              </p>
            )}
          </div>
        </Card>

        {/* Ready to Implement */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Unlock className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Ready to Implement</h3>
            <Badge variant="outline" className="ml-auto text-[9px]">
              {filteredReady.length} items
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">
            No dependencies - can start immediately
          </p>
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {topReadyItems.map((node, index) => (
              <ReadyRow key={node.id} node={node} index={index} />
            ))}
            {filteredReady.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All items have dependencies to resolve first
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-4 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Recommended Next Steps</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">1. Quick Wins</h4>
            <p className="text-xs">
              Implement <span className="font-semibold text-emerald-600">{stats.ready}</span> ready 
              items with no blockers to build momentum.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">2. Unblock Critical Path</h4>
            <p className="text-xs">
              Focus on <span className="font-semibold text-amber-600">{stats.criticalBlockers}</span> critical 
              blockers to unlock the most downstream items.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">3. Track Progress</h4>
            <p className="text-xs">
              Current: <span className="font-semibold">{Math.round((stats.implemented / Math.max(stats.total, 1)) * 100)}%</span> done.
              {stats.blocked > 0 && ` Resolve blockers to accelerate.`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Blocker row component for features
const BlockerRow: React.FC<{ node: BlockedItem; index: number; maxBlocks: number }> = ({ node, index, maxBlocks }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`p-2 rounded-lg border ${
          node.criticalPath ? 'border-amber-500/50 bg-amber-500/5' : 'border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-4">
                {index + 1}
              </span>
              <div>
                <div className="text-xs font-medium">{node.name}</div>
                <div className="text-[9px] text-muted-foreground">
                  {typeof node.category === 'string' && CATEGORY_LABELS[node.category as FeatureCategory]}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {node.criticalPath && (
                <Badge variant="outline" className="text-[8px] border-amber-500 text-amber-600">
                  Critical
                </Badge>
              )}
              {node.blocksCount > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  Blocks {node.blocksCount}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px]">
                <Lock className="h-2.5 w-2.5 mr-0.5" />
                {node.blockedBy.length}
              </Badge>
            </div>
          </div>
          {node.blocksCount > 0 && (
            <Progress 
              value={(node.blocksCount / maxBlocks) * 100} 
              className="h-1 mt-2"
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <p className="font-semibold">{node.name}</p>
        <p className="text-xs text-muted-foreground mb-2">Blocked by:</p>
        <div className="text-xs space-y-1">
          {node.blockedBy.slice(0, 5).map((blocker, i) => (
            <div key={i} className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-red-500" />
              {blocker.featureName} ({CATEGORY_LABELS[blocker.category] || blocker.category})
            </div>
          ))}
        </div>
        {node.blocksCount > 0 && (
          <>
            <p className="text-xs text-muted-foreground mt-2 mb-1">Will unblock:</p>
            <div className="text-xs space-y-1">
              {node.blocks.slice(0, 3).map((blocked, i) => (
                <div key={i} className="flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-emerald-500" />
                  {blocked}
                </div>
              ))}
              {node.blocks.length > 3 && (
                <p className="text-muted-foreground">...and {node.blocks.length - 3} more</p>
              )}
            </div>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Context blocker row
const ContextBlockerRow: React.FC<{ node: BlockedItem }> = ({ node }) => {
  const Icon = node.contextType ? CONTEXT_TYPE_ICONS[node.contextType] : Building2;
  const colorClass = node.contextType ? CONTEXT_TYPE_COLORS[node.contextType] : '';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-2 rounded-lg border border-red-500/30 bg-red-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[9px] px-1 ${colorClass}`}>
                  <Icon className="h-2.5 w-2.5 mr-0.5" />
                  {node.contextType}
                </Badge>
                <span className="text-xs font-medium">{node.name}</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                <Lock className="h-2.5 w-2.5 mr-0.5" />
                {node.blockedBy.length} missing
              </Badge>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="font-semibold">{node.name}</p>
          <p className="text-xs text-muted-foreground mb-2">Missing critical features:</p>
          <div className="text-xs space-y-1">
            {node.blockedBy.map((blocker, i) => (
              <div key={i} className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-red-500" />
                {blocker.featureName} ({CATEGORY_LABELS[blocker.category] || blocker.category})
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Ready row component
const ReadyRow: React.FC<{ node: ReadyItem; index: number }> = ({ node, index }) => {
  const Icon = node.type === 'context' && node.contextType ? CONTEXT_TYPE_ICONS[node.contextType] : Zap;
  const colorClass = node.type === 'context' && node.contextType ? CONTEXT_TYPE_COLORS[node.contextType] : '';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground w-4">
                  {index + 1}
                </span>
                {node.type === 'context' && node.contextType && (
                  <Badge variant="outline" className={`text-[9px] px-1 ${colorClass}`}>
                    <Icon className="h-2.5 w-2.5" />
                  </Badge>
                )}
                <div>
                  <div className="text-xs font-medium">{node.name}</div>
                  <div className="text-[9px] text-muted-foreground">
                    {node.type === 'feature' && typeof node.category === 'string' && CATEGORY_LABELS[node.category as FeatureCategory]}
                    {node.type === 'context' && node.contextType}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {node.unlocksCount > 0 && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600">
                    Unlocks {node.unlocksCount}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px] bg-emerald-500 text-white">
                  <Zap className="h-3 w-3 mr-0.5" />
                  Ready
                </Badge>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="font-semibold">{node.name}</p>
          <p className="text-xs text-muted-foreground mb-2">
            No blockers - ready for implementation
          </p>
          {node.unlocksCount > 0 && (
            <div className="text-xs">
              <span className="font-medium text-emerald-500">Will enable: </span>
              {node.unlocks.slice(0, 3).join(', ')}
              {node.unlocks.length > 3 && ` +${node.unlocks.length - 3} more`}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 text-[10px]">
            <Badge variant="outline" className="text-[9px]">Effort: {node.effort}</Badge>
            <Badge variant="outline" className="text-[9px]">Priority: {node.priority}</Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DependencyBlockerAnalysis;