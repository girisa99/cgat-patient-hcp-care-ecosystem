/**
 * MultiModelComparisonPanel - Phase 2 UI Component
 * 
 * Side-by-side AI model comparison with quality scoring visualization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Sparkles, 
  Trophy, 
  Clock, 
  DollarSign, 
  Zap,
  BarChart3,
  Brain,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useMultiModelComparison } from '@/hooks/useMultiModelComparison';
import { QualityMetrics } from '@/services/ai/MultiModelComparisonService';
import { cn } from '@/lib/utils';

interface MultiModelComparisonPanelProps {
  initialPrompt?: string;
  onResponseSelect?: (modelId: string, content: string) => void;
  className?: string;
}

export const MultiModelComparisonPanel: React.FC<MultiModelComparisonPanelProps> = ({
  initialPrompt = '',
  onResponseSelect,
  className
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  
  const {
    isComparing,
    currentComparison,
    selectedModels,
    toggleModel,
    runComparison,
    getAvailableModels,
  } = useMultiModelComparison();

  const availableModels = getAvailableModels();

  const handleRunComparison = async () => {
    if (!prompt.trim()) return;
    await runComparison(prompt);
  };

  const renderQualityBar = (label: string, value: number, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="w-24 text-muted-foreground">{label}</span>
      <Progress value={value} className="flex-1 h-2" />
      <span className="w-8 text-right font-medium">{value}</span>
    </div>
  );

  const renderQualityMetrics = (metrics: QualityMetrics | null) => {
    if (!metrics) return null;
    
    return (
      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
        {renderQualityBar('Relevance', metrics.relevance, <Target className="h-3 w-3 text-blue-500" />)}
        {renderQualityBar('Coherence', metrics.coherence, <Brain className="h-3 w-3 text-purple-500" />)}
        {renderQualityBar('Creativity', metrics.creativity, <Lightbulb className="h-3 w-3 text-yellow-500" />)}
        {renderQualityBar('Accuracy', metrics.accuracy, <CheckCircle2 className="h-3 w-3 text-green-500" />)}
        {renderQualityBar('Complete', metrics.completeness, <BarChart3 className="h-3 w-3 text-orange-500" />)}
        <Separator className="my-2" />
        <div className="flex items-center justify-between font-medium">
          <span>Overall Score</span>
          <Badge variant={metrics.overall >= 80 ? 'default' : metrics.overall >= 60 ? 'secondary' : 'outline'}>
            {metrics.overall}/100
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Multi-Model Comparison
        </CardTitle>
        <CardDescription>
          Compare AI model responses side-by-side with quality scoring
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Models (2-4)</label>
          <div className="flex flex-wrap gap-2">
            {availableModels.map(model => (
              <div
                key={model.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                  selectedModels.includes(model.id) 
                    ? "bg-primary/10 border-primary" 
                    : "bg-background hover:bg-muted"
                )}
                onClick={() => toggleModel(model.id)}
              >
                <Checkbox 
                  checked={selectedModels.includes(model.id)}
                  onCheckedChange={() => toggleModel(model.id)}
                />
                <span className="text-sm">{model.displayName}</span>
                <Badge variant="outline" className="text-xs">
                  {model.provider}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt to compare across models..."
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleRunComparison}
            disabled={isComparing || !prompt.trim() || selectedModels.length < 2}
            className="w-full"
          >
            {isComparing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing {selectedModels.length} Models...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Run Comparison
              </>
            )}
          </Button>
        </div>

        {/* Results Grid */}
        {currentComparison && (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparison Results
            </h3>
            
            <div className={cn(
              "grid gap-4",
              currentComparison.responses.length === 2 ? "grid-cols-2" : 
              currentComparison.responses.length === 3 ? "grid-cols-3" : "grid-cols-2"
            )}>
              {currentComparison.responses.map(response => {
                const isWinner = response.modelId === currentComparison.winner;
                const metrics = currentComparison.qualityScores.get(response.modelId);
                
                return (
                  <Card 
                    key={response.modelId}
                    className={cn(
                      "relative transition-all",
                      isWinner && "ring-2 ring-primary shadow-lg",
                      response.error && "border-destructive"
                    )}
                  >
                    {/* Winner Badge */}
                    {isWinner && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge className="bg-primary text-primary-foreground shadow-md">
                          <Trophy className="h-3 w-3 mr-1" />
                          Winner
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{response.displayName}</span>
                        {metrics && (
                          <Badge variant="outline">{metrics.overall}/100</Badge>
                        )}
                      </CardTitle>
                      
                      {/* Stats */}
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {response.latencyMs}ms
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${response.estimatedCost.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {response.tokenCount} tokens
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Response Content */}
                      {response.error ? (
                        <div className="p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                          <span className="text-sm text-destructive">{response.error}</span>
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px]">
                          <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                        </ScrollArea>
                      )}
                      
                      {/* Quality Metrics */}
                      {renderQualityMetrics(metrics || null)}
                      
                      {/* Select Button */}
                      {onResponseSelect && !response.error && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => onResponseSelect(response.modelId, response.content)}
                        >
                          Use This Response
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiModelComparisonPanel;
