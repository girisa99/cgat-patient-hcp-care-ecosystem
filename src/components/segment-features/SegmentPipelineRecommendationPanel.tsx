/**
 * SegmentPipelineRecommendationPanel
 * 
 * UI component that shows cross-industry pipeline recommendations
 * during the wizard flow. Displays different positioning based on
 * user's selected industry.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  GraduationCap, Video, Shield, Globe, Clapperboard, BarChart3, Zap, Users,
  Sparkles, Lock, ChevronRight, Info, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSegmentPipelineRecommendations } from '@/hooks/useSegmentPipelineRecommendations';
import type { IndustryTag, CapabilityBundle, SegmentPipelineMapping } from '@/services/segmentPipelineMappingRegistry';
import type { SegmentType } from '@/hooks/useAICredits';

interface SegmentPipelineRecommendationPanelProps {
  industry?: IndustryTag;
  segment?: SegmentType;
  onSelect?: (mapping: SegmentPipelineMapping) => void;
  className?: string;
  compact?: boolean;
}

const bundleIcons: Record<CapabilityBundle, React.ReactNode> = {
  training: <GraduationCap className="h-4 w-4" />,
  tours: <Video className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  localization: <Globe className="h-4 w-4" />,
  content: <Clapperboard className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  automation: <Zap className="h-4 w-4" />,
  personalization: <Users className="h-4 w-4" />,
};

const tierColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'bg-blue-500/10 text-blue-500',
  creator: 'bg-purple-500/10 text-purple-500',
  pro: 'bg-amber-500/10 text-amber-500',
  business: 'bg-emerald-500/10 text-emerald-500',
  enterprise: 'bg-rose-500/10 text-rose-500',
};

export function SegmentPipelineRecommendationPanel({
  industry,
  segment,
  onSelect,
  className,
  compact = false,
}: SegmentPipelineRecommendationPanelProps) {
  const [activeBundle, setActiveBundle] = useState<CapabilityBundle | 'all'>('all');
  
  const {
    recommendations,
    recommendationsByBundle,
    availableBundles,
    stats,
    getPositioning,
    getCrossSuggestions,
    getCost,
    canAccess,
    CAPABILITY_BUNDLES,
  } = useSegmentPipelineRecommendations({ industry, segment });

  const displayMappings = activeBundle === 'all' 
    ? recommendations 
    : recommendationsByBundle[activeBundle] || [];

  if (!industry) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select an industry to see recommended features</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Recommended for {industry.charAt(0).toUpperCase() + industry.slice(1)}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stats.accessibleMappings} / {stats.industryMappings} accessible
            </Badge>
          </div>
          {stats.segmentDiscount > 0 && (
            <Badge variant="outline" className="w-fit text-xs text-emerald-600">
              {stats.segmentDiscount}% segment discount applied
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Bundle Filter Tabs */}
          <div className="border-b px-4 py-2">
            <ScrollArea className="w-full">
              <div className="flex gap-1 pb-1">
                <Button
                  variant={activeBundle === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => setActiveBundle('all')}
                >
                  All ({recommendations.length})
                </Button>
                {availableBundles.map(bundle => (
                  <Button
                    key={bundle}
                    variant={activeBundle === bundle ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs whitespace-nowrap gap-1"
                    onClick={() => setActiveBundle(bundle)}
                  >
                    {bundleIcons[bundle]}
                    {CAPABILITY_BUNDLES[bundle].name.split(' ')[0]}
                    ({recommendationsByBundle[bundle]?.length || 0})
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Mapping List */}
          <ScrollArea className={compact ? 'h-[200px]' : 'h-[300px]'}>
            <div className="p-3 space-y-2">
              {displayMappings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No features available in this category
                </div>
              ) : (
                displayMappings.map(mapping => {
                  const positioning = getPositioning(mapping.id);
                  const crossSuggestions = getCrossSuggestions(mapping.id);
                  const cost = getCost(mapping.id);
                  const accessible = canAccess(mapping);
                  
                  return (
                    <div
                      key={mapping.id}
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        accessible 
                          ? 'hover:border-primary/50 hover:bg-accent/50 cursor-pointer' 
                          : 'opacity-60 cursor-not-allowed',
                        onSelect && accessible && 'cursor-pointer'
                      )}
                      onClick={() => accessible && onSelect?.(mapping)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {positioning?.displayName || mapping.name}
                            </span>
                            {!accessible && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Requires {mapping.minTier} tier or higher
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {positioning?.tagline || mapping.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={cn('text-[10px]', tierColors[mapping.minTier])}>
                            {mapping.minTier}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {cost} credits
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Cross-industry suggestions */}
                      {crossSuggestions.length > 0 && !compact && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Info className="h-3 w-3" />
                          Also great for: 
                          {crossSuggestions.slice(0, 2).map((s, i) => (
                            <Badge key={s.industry} variant="outline" className="text-[10px] px-1">
                              {s.industry}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Use cases */}
                      {positioning?.useCases && !compact && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {positioning.useCases.slice(0, 3).map((uc: string, i: number) => (
                            <span key={i} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {uc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default SegmentPipelineRecommendationPanel;
