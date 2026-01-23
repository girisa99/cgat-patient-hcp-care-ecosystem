/**
 * Ecosystem Integration Map
 * 
 * Visual map of all 6 Genie products with:
 * - Interconnected features
 * - Cross-product dependencies
 * - Data flow visualization
 * - Integration status
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ArrowRight, 
  Sparkles,
  Brain,
  Film,
  Target,
  LayoutDashboard,
  MessageSquare,
  CheckCircle2,
  Layers,
  Zap
} from 'lucide-react';
import { 
  CROSS_FUNCTIONAL_MAPPINGS, 
  GENIE_PRODUCT_LABELS,
  ALL_FEATURES,
  FEATURE_IMPLEMENTATION_MATRIX,
  type GenieProduct 
} from './matrixData';
import type { FeatureCategory } from './types';

interface ProductNode {
  id: GenieProduct;
  name: string;
  emoji: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  categories: FeatureCategory[];
  featureCount: number;
  implementedCount: number;
  inboundDeps: GenieProduct[];
  outboundDeps: GenieProduct[];
}

const PRODUCT_CONFIG: Record<GenieProduct, { icon: React.ReactNode; color: string; categories: FeatureCategory[] }> = {
  spark: { 
    icon: <Sparkles className="h-5 w-5" />, 
    color: 'bg-amber-500', 
    categories: ['SCRIPT', 'INPUT']
  },
  mind: { 
    icon: <Brain className="h-5 w-5" />, 
    color: 'bg-purple-500', 
    categories: ['INPUT', 'SCRIPT', 'TRANSLATION']
  },
  vibe: { 
    icon: <Film className="h-5 w-5" />, 
    color: 'bg-rose-500', 
    categories: ['VIDEO', 'VOICE', 'AUDIO']
  },
  arc: { 
    icon: <Target className="h-5 w-5" />, 
    color: 'bg-blue-500', 
    categories: ['PUBLISHING', 'EXPORT']
  },
  deck: { 
    icon: <LayoutDashboard className="h-5 w-5" />, 
    color: 'bg-emerald-500', 
    categories: ['IMAGE', 'EXPORT', 'TRANSLATION']
  },
  hub: { 
    icon: <Layers className="h-5 w-5" />, 
    color: 'bg-slate-600', 
    categories: ['INTERACTIVE', 'EXPORT', 'PUBLISHING']
  },
  ask_genie: { 
    icon: <MessageSquare className="h-5 w-5" />, 
    color: 'bg-indigo-500', 
    categories: ['INPUT', 'SCRIPT']
  },
};

interface EcosystemIntegrationMapProps {
  selectedCategory?: FeatureCategory | 'all';
}

export const EcosystemIntegrationMap: React.FC<EcosystemIntegrationMapProps> = ({ 
  selectedCategory = 'all' 
}) => {
  const [selectedProduct, setSelectedProduct] = useState<GenieProduct | null>(null);

  // Build product nodes with dependency analysis (filtered by category)
  const productNodes = useMemo<ProductNode[]>(() => {
    const nodes: ProductNode[] = [];
    
    (Object.keys(PRODUCT_CONFIG) as GenieProduct[]).forEach(productId => {
      const config = PRODUCT_CONFIG[productId];
      const labelData = GENIE_PRODUCT_LABELS[productId];
      
      // Check if this product matches the category filter
      const matchesCategory = selectedCategory === 'all' || 
        config.categories.includes(selectedCategory as FeatureCategory);
      
      // Find features for this product (filtered by category if specified)
      const productFeatures = ALL_FEATURES.filter(f => {
        const matchesProductCategory = config.categories.includes(f.category);
        const matchesFilter = selectedCategory === 'all' || f.category === selectedCategory;
        return matchesProductCategory && matchesFilter;
      });
      
      // Count implementations
      const implemented = productFeatures.filter(f => {
        const impl = FEATURE_IMPLEMENTATION_MATRIX[f.id];
        if (!impl) return false;
        return Object.values(impl).some(p => p?.implementation === 'implemented');
      }).length;
      
      // Find cross-functional dependencies
      const mappings = CROSS_FUNCTIONAL_MAPPINGS.filter(m => 
        m.genieProducts?.includes(productId) &&
        (selectedCategory === 'all' || m.primaryCategory === selectedCategory)
      );
      
      const inboundDeps: Set<GenieProduct> = new Set();
      const outboundDeps: Set<GenieProduct> = new Set();
      
      mappings.forEach(m => {
        m.genieProducts?.forEach(p => {
          if (p !== productId) {
            // Check if this product requires or enables the other
            const hasRequires = m.relatedFeatures?.some(rf => rf.relationship === 'requires');
            const hasEnables = m.relatedFeatures?.some(rf => rf.relationship === 'enables');
            
            if (hasRequires) {
              inboundDeps.add(p);
            }
            if (hasEnables) {
              outboundDeps.add(p);
            }
          }
        });
      });
      
      nodes.push({
        id: productId,
        name: labelData.name,
        emoji: labelData.emoji,
        icon: config.icon,
        color: config.color,
        description: labelData.description,
        categories: config.categories,
        featureCount: productFeatures.length,
        implementedCount: implemented,
        inboundDeps: Array.from(inboundDeps),
        outboundDeps: Array.from(outboundDeps),
      });
    });
    
    return nodes;
  }, [selectedCategory]);

  // Overall ecosystem health
  const ecosystemHealth = useMemo(() => {
    const totalFeatures = productNodes.reduce((acc, p) => acc + p.featureCount, 0);
    const totalImplemented = productNodes.reduce((acc, p) => acc + p.implementedCount, 0);
    const coverage = totalFeatures > 0 ? Math.round((totalImplemented / totalFeatures) * 100) : 0;
    
    const totalConnections = productNodes.reduce((acc, p) => 
      acc + p.inboundDeps.length + p.outboundDeps.length, 0
    ) / 2; // Divide by 2 to avoid counting twice
    
    return { totalFeatures, totalImplemented, coverage, totalConnections };
  }, [productNodes]);

  return (
    <div className="space-y-4">
      {/* Ecosystem Health Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Products</span>
          </div>
          <div className="text-2xl font-bold">{productNodes.length}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Features</span>
          </div>
          <div className="text-2xl font-bold">{ecosystemHealth.totalFeatures}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">Implemented</span>
          </div>
          <div className="text-2xl font-bold">{ecosystemHealth.coverage}%</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Connections</span>
          </div>
          <div className="text-2xl font-bold">{ecosystemHealth.totalConnections}</div>
        </Card>
      </div>

      {/* Visual Product Map */}
      <div className="border rounded-lg p-6 bg-muted/20">
        <div className="grid grid-cols-4 gap-4">
          {productNodes.map((node) => {
            const coverage = node.featureCount > 0 
              ? Math.round((node.implementedCount / node.featureCount) * 100) 
              : 0;
            const isSelected = selectedProduct === node.id;
            
            return (
              <TooltipProvider key={node.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedProduct(isSelected ? null : node.id)}
                      className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      } bg-card`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-lg ${node.color} text-white flex items-center justify-center`}>
                          {node.icon}
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{node.emoji} {node.name}</div>
                          <div className="text-[10px] text-muted-foreground">{node.description}</div>
                        </div>
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-muted-foreground">Coverage</span>
                            <span className="font-medium">{coverage}%</span>
                          </div>
                          <Progress value={coverage} className="h-1" />
                        </div>
                        <div className="flex gap-2 text-[9px]">
                          <Badge variant="outline" className="px-1 py-0">
                            {node.featureCount} features
                          </Badge>
                          {node.inboundDeps.length > 0 && (
                            <Badge variant="secondary" className="px-1 py-0">
                              ←{node.inboundDeps.length}
                            </Badge>
                          )}
                          {node.outboundDeps.length > 0 && (
                            <Badge variant="secondary" className="px-1 py-0">
                              →{node.outboundDeps.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3">
                    <p className="font-semibold">{node.emoji} {node.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="font-medium">Categories: </span>
                        {node.categories.join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Features: </span>
                        {node.implementedCount}/{node.featureCount} implemented
                      </div>
                      {node.inboundDeps.length > 0 && (
                        <div>
                          <span className="font-medium text-blue-500">Depends on: </span>
                          {node.inboundDeps.map(d => GENIE_PRODUCT_LABELS[d].name).join(', ')}
                        </div>
                      )}
                      {node.outboundDeps.length > 0 && (
                        <div>
                          <span className="font-medium text-emerald-500">Enables: </span>
                          {node.outboundDeps.map(d => GENIE_PRODUCT_LABELS[d].name).join(', ')}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Central Hub Indicator */}
        <div className="text-center mt-4">
          <Badge variant="secondary" className="text-xs">
            🧞 Genie Hub is the Master Orchestrator — coordinates all products
          </Badge>
        </div>
      </div>

      {/* Selected Product Detail */}
      {selectedProduct && (
        <Card className="p-4 border-primary/50">
          {(() => {
            const node = productNodes.find(n => n.id === selectedProduct);
            if (!node) return null;
            
            return (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${node.color} text-white flex items-center justify-center`}>
                    {node.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{node.emoji} {node.name}</h3>
                    <p className="text-xs text-muted-foreground">{node.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-1">
                      {node.categories.map(cat => (
                        <Badge key={cat} variant="outline" className="text-[10px]">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Dependencies</h4>
                    <div className="flex flex-wrap gap-1">
                      {node.inboundDeps.map(dep => (
                        <Badge key={dep} variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-700">
                          ← {GENIE_PRODUCT_LABELS[dep].name}
                        </Badge>
                      ))}
                      {node.inboundDeps.length === 0 && (
                        <span className="text-xs text-muted-foreground">No dependencies</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Enables</h4>
                    <div className="flex flex-wrap gap-1">
                      {node.outboundDeps.map(dep => (
                        <Badge key={dep} variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700">
                          → {GENIE_PRODUCT_LABELS[dep].name}
                        </Badge>
                      ))}
                      {node.outboundDeps.length === 0 && (
                        <span className="text-xs text-muted-foreground">No outbound</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export default EcosystemIntegrationMap;
