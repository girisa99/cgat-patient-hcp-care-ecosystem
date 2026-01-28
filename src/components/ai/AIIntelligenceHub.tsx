/**
 * AI Intelligence Hub - Unified Phase 1 & 2 Integration
 * 
 * Single component that combines:
 * - Phase 1: AI Routing Intelligence (query classification, model recommendation)
 * - Phase 2: Multi-Model Comparison (side-by-side AI comparison)
 * 
 * Can be used across the Genie ecosystem: Ask Genie, Admin, Deck, Spark, Mind, Vibe, etc.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  GitCompare, 
  Zap, 
  Info, 
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AIRoutingInsightsPanel } from './AIRoutingInsightsPanel';
import { MultiModelComparisonPanel } from './MultiModelComparisonPanel';
import { cn } from '@/lib/utils';

interface AIIntelligenceHubProps {
  /** Current user query for routing analysis */
  query?: string;
  /** Whether query includes attachments (images, files) */
  hasAttachments?: boolean;
  /** Callback when a model is recommended and selected */
  onModelSelect?: (modelId: string, provider: string) => void;
  /** Callback when a comparison response is selected */
  onResponseSelect?: (modelId: string, content: string) => void;
  /** Start in collapsed mode */
  defaultCollapsed?: boolean;
  /** Only show specific tab */
  singleTab?: 'routing' | 'comparison';
  /** Compact mode for embedding */
  compact?: boolean;
  className?: string;
}

export const AIIntelligenceHub: React.FC<AIIntelligenceHubProps> = ({
  query = '',
  hasAttachments = false,
  onModelSelect,
  onResponseSelect,
  defaultCollapsed = false,
  singleTab,
  compact = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [activeTab, setActiveTab] = useState<'routing' | 'comparison'>(singleTab || 'routing');

  // If single tab mode, just render that component
  if (singleTab === 'routing') {
    return (
      <AIRoutingInsightsPanel 
        query={query}
        hasAttachments={hasAttachments}
        onModelSelect={onModelSelect}
        className={className}
      />
    );
  }

  if (singleTab === 'comparison') {
    return (
      <MultiModelComparisonPanel
        initialPrompt={query}
        onResponseSelect={onResponseSelect}
        className={className}
      />
    );
  }

  // Full hub with both tabs
  return (
    <Card className={cn("relative", className)}>
      <CardHeader className={cn("pb-3", compact && "py-2 px-3")}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("flex items-center gap-2", compact ? "text-sm" : "text-base")}>
            <Brain className={cn(compact ? "h-4 w-4" : "h-5 w-5", "text-primary")} />
            AI Intelligence Hub
            <Badge variant="outline" className="ml-2 text-[10px]">
              Phase 1 & 2
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              <Zap className="h-3 w-3 mr-1" />
              50+ Models
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 p-0"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className={cn(compact && "px-3 pb-3")}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="routing" className="flex items-center gap-1.5 text-xs">
                <Settings2 className="h-3.5 w-3.5" />
                Smart Routing
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-1.5 text-xs">
                <GitCompare className="h-3.5 w-3.5" />
                Model Compare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="routing" className="mt-0">
              <AIRoutingInsightsPanel 
                query={query}
                hasAttachments={hasAttachments}
                onModelSelect={onModelSelect}
              />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <MultiModelComparisonPanel
                initialPrompt={query}
                onResponseSelect={onResponseSelect}
              />
            </TabsContent>
          </Tabs>

          {/* Provider Coverage Summary */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Info className="h-3.5 w-3.5" />
              <span className="font-medium">12+ Provider Coverage</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Gemini', color: 'bg-blue-100 text-blue-700' },
                { name: 'OpenAI', color: 'bg-green-100 text-green-700' },
                { name: 'Claude', color: 'bg-orange-100 text-orange-700' },
                { name: 'DeepSeek', color: 'bg-purple-100 text-purple-700' },
                { name: 'Alibaba', color: 'bg-red-100 text-red-700' },
                { name: 'Azure', color: 'bg-sky-100 text-sky-700' },
                { name: 'ModelsLab', color: 'bg-pink-100 text-pink-700' },
                { name: 'ElevenLabs', color: 'bg-yellow-100 text-yellow-700' },
                { name: 'Meshy', color: 'bg-teal-100 text-teal-700' },
                { name: 'DeepL', color: 'bg-indigo-100 text-indigo-700' },
                { name: 'Replicate', color: 'bg-slate-100 text-slate-700' },
                { name: 'GCP', color: 'bg-amber-100 text-amber-700' },
              ].map((provider) => (
                <Badge 
                  key={provider.name}
                  variant="outline" 
                  className={cn("text-[10px] px-1.5 py-0", provider.color)}
                >
                  {provider.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AIIntelligenceHub;
