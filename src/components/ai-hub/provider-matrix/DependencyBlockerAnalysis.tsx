/**
 * Dependency Blocker Analysis
 * 
 * Real-time view of:
 * - Blocked vs ready-to-implement items
 * - Dependency chains
 * - Unblocking recommendations
 * - Critical path analysis
 */

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Lock, 
  Unlock, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  Layers
} from 'lucide-react';
import { 
  ALL_FEATURES, 
  FEATURE_IMPLEMENTATION_MATRIX,
  CROSS_FUNCTIONAL_MAPPINGS,
  GENIE_PRODUCT_LABELS
} from './matrixData';
import type { FeatureCategory } from './types';

interface BlockerNode {
  featureId: string;
  featureName: string;
  category: FeatureCategory;
  isImplemented: boolean;
  blocksCount: number;
  blockedBy: string[];
  blocks: string[];
  criticalPath: boolean;
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

interface DependencyBlockerAnalysisProps {
  selectedCategory?: FeatureCategory | 'all';
}

export const DependencyBlockerAnalysis: React.FC<DependencyBlockerAnalysisProps> = ({
  selectedCategory = 'all'
}) => {
  const [showOnlyBlockers, setShowOnlyBlockers] = useState(false);

  // Build dependency graph
  const dependencyGraph = useMemo(() => {
    const nodes: Map<string, BlockerNode> = new Map();
    
    // Initialize all features
    ALL_FEATURES.forEach(feature => {
      if (selectedCategory !== 'all' && feature.category !== selectedCategory) return;
      
      const impl = FEATURE_IMPLEMENTATION_MATRIX[feature.id];
      const isImplemented = impl && Object.values(impl).some(p => p?.implementation === 'implemented');
      
      nodes.set(feature.id, {
        featureId: feature.id,
        featureName: feature.name,
        category: feature.category,
        isImplemented,
        blocksCount: 0,
        blockedBy: [],
        blocks: [],
        criticalPath: false,
      });
    });
    
    // Build dependency relationships
    CROSS_FUNCTIONAL_MAPPINGS.forEach(m => {
      const primaryNode = nodes.get(m.primaryFeatureId);
      if (!primaryNode) return;
      
      m.relatedFeatures?.forEach(rf => {
        if (rf.relationship === 'requires') {
          const requiredNode = nodes.get(rf.featureId);
          if (requiredNode) {
            // primaryFeature is blocked by requiredFeature
            primaryNode.blockedBy.push(rf.featureId);
            requiredNode.blocks.push(m.primaryFeatureId);
            requiredNode.blocksCount++;
          }
        }
      });
    });
    
    // Mark critical path (features that block the most other features)
    const sortedByBlocks = Array.from(nodes.values())
      .filter(n => !n.isImplemented && n.blocksCount > 0)
      .sort((a, b) => b.blocksCount - a.blocksCount);
    
    sortedByBlocks.slice(0, 10).forEach(n => {
      const node = nodes.get(n.featureId);
      if (node) node.criticalPath = true;
    });
    
    return nodes;
  }, [selectedCategory]);

  // Analysis stats
  const stats = useMemo(() => {
    const allNodes = Array.from(dependencyGraph.values());
    const implemented = allNodes.filter(n => n.isImplemented);
    const blocked = allNodes.filter(n => !n.isImplemented && n.blockedBy.length > 0);
    const ready = allNodes.filter(n => !n.isImplemented && n.blockedBy.length === 0);
    const criticalBlockers = allNodes.filter(n => n.criticalPath);
    
    // Calculate unblock potential (features that would unblock the most)
    const unblockPotential = allNodes
      .filter(n => !n.isImplemented)
      .sort((a, b) => b.blocksCount - a.blocksCount)
      .slice(0, 5);
    
    return {
      total: allNodes.length,
      implemented: implemented.length,
      blocked: blocked.length,
      ready: ready.length,
      criticalBlockers,
      unblockPotential,
    };
  }, [dependencyGraph]);

  // Get top blockers
  const topBlockers = useMemo(() => {
    return Array.from(dependencyGraph.values())
      .filter(n => !n.isImplemented && n.blocksCount > 0)
      .sort((a, b) => b.blocksCount - a.blocksCount)
      .slice(0, 10);
  }, [dependencyGraph]);

  // Get ready to implement
  const readyToImplement = useMemo(() => {
    return Array.from(dependencyGraph.values())
      .filter(n => !n.isImplemented && n.blockedBy.length === 0)
      .sort((a, b) => b.blocksCount - a.blocksCount)
      .slice(0, 10);
  }, [dependencyGraph]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-1">
            <Unlock className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">Ready to Implement</span>
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
            <span className="text-xs font-medium text-muted-foreground">Critical Path</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.criticalBlockers.length}</div>
          <p className="text-[10px] text-muted-foreground">High-impact blockers</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Implemented</span>
          </div>
          <div className="text-2xl font-bold">{stats.implemented}</div>
          <p className="text-[10px] text-muted-foreground">of {stats.total} total</p>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Blockers */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Top Blockers to Resolve</h3>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">
            Implementing these will unblock the most features
          </p>
          <div className="space-y-2">
            {topBlockers.map((node, index) => (
              <TooltipProvider key={node.featureId}>
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
                            <div className="text-xs font-medium">{node.featureName}</div>
                            <div className="text-[9px] text-muted-foreground">
                              {CATEGORY_LABELS[node.category]}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {node.criticalPath && (
                            <Badge variant="outline" className="text-[8px] border-amber-500 text-amber-600">
                              Critical
                            </Badge>
                          )}
                          <Badge variant="destructive" className="text-[10px]">
                            Blocks {node.blocksCount}
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={(node.blocksCount / Math.max(...topBlockers.map(n => n.blocksCount))) * 100} 
                        className="h-1 mt-2"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="font-semibold">{node.featureName}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Implementing this will unblock:
                    </p>
                    <div className="text-xs space-y-1">
                      {node.blocks.slice(0, 5).map(blocked => {
                        const blockedFeature = ALL_FEATURES.find(f => f.id === blocked);
                        return (
                          <div key={blocked} className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-emerald-500" />
                            {blockedFeature?.name || blocked}
                          </div>
                        );
                      })}
                      {node.blocks.length > 5 && (
                        <p className="text-muted-foreground">...and {node.blocks.length - 5} more</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {topBlockers.length === 0 && (
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
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">
            No dependencies - can start immediately
          </p>
          <div className="space-y-2">
            {readyToImplement.map((node, index) => (
              <TooltipProvider key={node.featureId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-4">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-xs font-medium">{node.featureName}</div>
                            <div className="text-[9px] text-muted-foreground">
                              {CATEGORY_LABELS[node.category]}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {node.blocksCount > 0 && (
                            <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600">
                              Unlocks {node.blocksCount}
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
                    <p className="font-semibold">{node.featureName}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      No blockers - ready for implementation
                    </p>
                    {node.blocksCount > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-emerald-500">Will enable: </span>
                        {node.blocks.slice(0, 3).map(blocked => {
                          const blockedFeature = ALL_FEATURES.find(f => f.id === blocked);
                          return blockedFeature?.name || blocked;
                        }).join(', ')}
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {readyToImplement.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All features have dependencies to resolve first
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
              features with no blockers to build momentum.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">2. Unblock Critical Path</h4>
            <p className="text-xs">
              Focus on <span className="font-semibold text-amber-600">{stats.criticalBlockers.length}</span> critical 
              blockers to unlock the most downstream features.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">3. Track Progress</h4>
            <p className="text-xs">
              Current progress: <span className="font-semibold">{Math.round((stats.implemented / stats.total) * 100)}%</span>.
              {stats.blocked > 0 && ` Resolve blockers to accelerate.`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DependencyBlockerAnalysis;
