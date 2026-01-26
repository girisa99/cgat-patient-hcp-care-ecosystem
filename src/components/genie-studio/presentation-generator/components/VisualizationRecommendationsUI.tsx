/**
 * Visualization Recommendations UI
 * 
 * Framework and industry-aware visual feature suggestions
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  BarChart3, 
  PieChart, 
  LineChart,
  TrendingUp,
  Layers,
  Globe,
  Target,
  Zap,
  CheckCircle2,
  Plus,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalTier } from '@/services/shared/globalTierService';

interface VisualizationRecommendation {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  tier: 1 | 2 | 3;
  matchScore: number;
  matchReason: string;
  category: 'chart' | 'diagram' | 'infographic' | '3d' | 'animation';
}

interface VisualizationRecommendationsUIProps {
  industry: string;
  framework: string;
  contentType: string;
  selectedFeatures: string[];
  onSelectFeature: (featureId: string) => void;
  globalTier: GlobalTier;
  className?: string;
}

// Industry to visualization mapping
const INDUSTRY_VISUALIZATIONS: Record<string, string[]> = {
  healthcare: ['patient-journey', 'timeline', 'process-flow', 'data-comparison'],
  finance: ['waterfall', 'candlestick', 'risk-matrix', 'portfolio-pie'],
  technology: ['architecture-diagram', 'api-flow', 'timeline', 'metrics-dashboard'],
  consulting: ['quadrant', 'matrix', 'pyramid', 'swot-diagram'],
  manufacturing: ['process-flow', 'gantt', 'supply-chain', 'quality-control'],
  retail: ['funnel', 'heatmap', 'customer-journey', 'sales-trend'],
  education: ['timeline', 'hierarchy', 'concept-map', 'comparison'],
};

// Framework to visualization mapping
const FRAMEWORK_VISUALIZATIONS: Record<string, string[]> = {
  'swot': ['swot-diagram', 'quadrant', 'matrix'],
  'porter-five': ['radar-chart', 'pentagon', 'force-diagram'],
  'value-chain': ['process-flow', 'chain-diagram', 'value-stream'],
  'growth-share-matrix': ['quadrant', 'bubble-chart', 'matrix'],
  'balanced-scorecard': ['scorecard', 'metrics-dashboard', 'kpi-cards'],
  'design-thinking': ['process-flow', 'empathy-map', 'journey-map'],
  'lean-startup': ['funnel', 'experiment-tracker', 'metrics-timeline'],
  'okr': ['hierarchy', 'progress-bars', 'alignment-diagram'],
};

// All available visualizations
const ALL_VISUALIZATIONS: VisualizationRecommendation[] = [
  // Charts
  { id: 'bar-chart', name: 'Bar Chart', description: 'Compare values across categories', icon: BarChart3, tier: 1, matchScore: 0, matchReason: '', category: 'chart' },
  { id: 'pie-chart', name: 'Pie Chart', description: 'Show proportions of a whole', icon: PieChart, tier: 1, matchScore: 0, matchReason: '', category: 'chart' },
  { id: 'line-chart', name: 'Line Chart', description: 'Show trends over time', icon: LineChart, tier: 1, matchScore: 0, matchReason: '', category: 'chart' },
  { id: 'waterfall', name: 'Waterfall Chart', description: 'Show cumulative effect of values', icon: TrendingUp, tier: 2, matchScore: 0, matchReason: '', category: 'chart' },
  { id: 'radar-chart', name: 'Radar Chart', description: 'Compare multiple variables', icon: Target, tier: 2, matchScore: 0, matchReason: '', category: 'chart' },
  
  // Diagrams
  { id: 'swot-diagram', name: 'SWOT Diagram', description: '2x2 strategic analysis grid', icon: Layers, tier: 1, matchScore: 0, matchReason: '', category: 'diagram' },
  { id: 'quadrant', name: 'Quadrant Matrix', description: 'Four-quadrant analysis grid', icon: Layers, tier: 1, matchScore: 0, matchReason: '', category: 'diagram' },
  { id: 'process-flow', name: 'Process Flow', description: 'Sequential step visualization', icon: Zap, tier: 1, matchScore: 0, matchReason: '', category: 'diagram' },
  { id: 'timeline', name: 'Timeline', description: 'Chronological event display', icon: TrendingUp, tier: 1, matchScore: 0, matchReason: '', category: 'diagram' },
  { id: 'hierarchy', name: 'Hierarchy Diagram', description: 'Organizational structure', icon: Layers, tier: 2, matchScore: 0, matchReason: '', category: 'diagram' },
  
  // Infographics
  { id: 'metrics-dashboard', name: 'Metrics Dashboard', description: 'KPI summary display', icon: BarChart3, tier: 2, matchScore: 0, matchReason: '', category: 'infographic' },
  { id: 'comparison-table', name: 'Comparison Table', description: 'Side-by-side feature comparison', icon: Layers, tier: 1, matchScore: 0, matchReason: '', category: 'infographic' },
  { id: 'funnel', name: 'Funnel Diagram', description: 'Conversion stage visualization', icon: Target, tier: 2, matchScore: 0, matchReason: '', category: 'infographic' },
  
  // 3D & Animation (Premium)
  { id: '3d-product', name: '3D Product View', description: 'Interactive 3D model display', icon: Globe, tier: 3, matchScore: 0, matchReason: '', category: '3d' },
  { id: '3d-scene', name: '3D Scene', description: 'Immersive 3D environment', icon: Globe, tier: 3, matchScore: 0, matchReason: '', category: '3d' },
  { id: 'animated-chart', name: 'Animated Charts', description: 'Motion-enhanced data viz', icon: Sparkles, tier: 2, matchScore: 0, matchReason: '', category: 'animation' },
  { id: 'kinetic-typography', name: 'Kinetic Typography', description: 'Animated text effects', icon: Sparkles, tier: 3, matchScore: 0, matchReason: '', category: 'animation' },
];

export const VisualizationRecommendationsUI: React.FC<VisualizationRecommendationsUIProps> = ({
  industry,
  framework,
  contentType,
  selectedFeatures,
  onSelectFeature,
  globalTier,
  className,
}) => {
  // Calculate recommendations based on context
  const recommendations = useMemo(() => {
    const tierNumeric = globalTier === 'premium' ? 3 : globalTier === 'advanced' ? 2 : 1;
    
    // Get industry-based recommendations
    const industryViz = INDUSTRY_VISUALIZATIONS[industry.toLowerCase()] || [];
    
    // Get framework-based recommendations
    const frameworkViz = FRAMEWORK_VISUALIZATIONS[framework.toLowerCase()] || [];
    
    // Score and filter visualizations
    return ALL_VISUALIZATIONS
      .map(viz => {
        let matchScore = 50; // Base score
        let matchReason = 'General recommendation';
        
        // Industry match
        if (industryViz.includes(viz.id)) {
          matchScore += 30;
          matchReason = `Recommended for ${industry}`;
        }
        
        // Framework match
        if (frameworkViz.includes(viz.id)) {
          matchScore += 25;
          matchReason = `Works well with ${framework}`;
        }
        
        // Content type boost
        if (contentType === 'video' && viz.category === 'animation') {
          matchScore += 15;
        }
        if (contentType === 'interactive' && viz.category === '3d') {
          matchScore += 15;
        }
        
        // Already selected penalty
        if (selectedFeatures.includes(viz.id)) {
          matchScore = 0;
        }
        
        // Tier restriction
        if (viz.tier > tierNumeric) {
          matchScore = Math.max(matchScore - 40, 10);
          matchReason = `Requires ${viz.tier === 3 ? 'Premium' : 'Advanced'} tier`;
        }
        
        return { ...viz, matchScore, matchReason };
      })
      .filter(viz => !selectedFeatures.includes(viz.id))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);
  }, [industry, framework, contentType, selectedFeatures, globalTier]);

  // Get tier badge styling
  const getTierBadge = (tier: 1 | 2 | 3) => {
    const tierNumeric = globalTier === 'premium' ? 3 : globalTier === 'advanced' ? 2 : 1;
    const isLocked = tier > tierNumeric;
    
    const styles = {
      1: 'bg-slate-100 text-slate-600',
      2: 'bg-blue-100 text-blue-600',
      3: 'bg-purple-100 text-purple-600',
    };
    
    const labels = { 1: 'Standard', 2: 'Advanced', 3: 'Premium' };
    
    return (
      <Badge className={cn(styles[tier], isLocked && 'opacity-50')}>
        {labels[tier]}
        {isLocked && ' 🔒'}
      </Badge>
    );
  };

  // Get match score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn('border-dashed', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Recommended Visualizations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on {industry || 'your industry'} and {framework || 'selected framework'}
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-2">
            {recommendations.map((viz) => {
              const tierNumeric = globalTier === 'premium' ? 3 : globalTier === 'advanced' ? 2 : 1;
              const isLocked = viz.tier > tierNumeric;
              const isSelected = selectedFeatures.includes(viz.id);
              
              return (
                <div
                  key={viz.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    isLocked ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50 cursor-pointer',
                    isSelected && 'bg-primary/10 border-primary'
                  )}
                  onClick={() => !isLocked && onSelectFeature(viz.id)}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    viz.category === 'chart' && 'bg-blue-100 text-blue-600',
                    viz.category === 'diagram' && 'bg-green-100 text-green-600',
                    viz.category === 'infographic' && 'bg-amber-100 text-amber-600',
                    viz.category === '3d' && 'bg-purple-100 text-purple-600',
                    viz.category === 'animation' && 'bg-pink-100 text-pink-600',
                  )}>
                    <viz.icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{viz.name}</span>
                      {getTierBadge(viz.tier)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {viz.description}
                    </p>
                    <p className={cn('text-xs mt-0.5', getScoreColor(viz.matchScore))}>
                      {viz.matchReason}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', getScoreColor(viz.matchScore))}>
                      {viz.matchScore}%
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : !isLocked ? (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {recommendations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Select an industry and framework to see recommendations
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Selected count */}
        {selectedFeatures.length > 0 && (
          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedFeatures.length} visualization{selectedFeatures.length > 1 ? 's' : ''} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => {}}>
              View All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualizationRecommendationsUI;
