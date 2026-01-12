/**
 * Scene Analyzer Panel Component
 * Multi-provider AI scene analysis with provider selection
 * Part of the Guided Production Experience
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  Brain,
  Zap,
  Eye,
  Camera,
  Film,
  Palette,
  Users,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  LayoutGrid,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSceneAnalyzer, SceneAnalysis, AnalyzeSceneOptions } from '@/hooks/useSceneAnalyzer';
import { UniversalAIProviderType } from '@/services/aiProviderService';

interface SceneAnalyzerPanelProps {
  frames?: (string | Blob | File)[];
  onAnalysisComplete?: (analyses: SceneAnalysis[]) => void;
  onSuggestionApply?: (suggestion: any) => void;
  className?: string;
  compact?: boolean;
}

// Provider configurations with icons and descriptions
const PROVIDER_CONFIG: Record<string, { 
  name: string; 
  icon: React.ReactNode; 
  description: string;
  color: string;
}> = {
  openai: {
    name: 'OpenAI GPT-4o',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Excellent reasoning & accuracy',
    color: 'text-emerald-500'
  },
  claude: {
    name: 'Anthropic Claude',
    icon: <Brain className="h-4 w-4" />,
    description: 'Nuanced understanding',
    color: 'text-orange-500'
  },
  gemini: {
    name: 'Google Gemini',
    icon: <Zap className="h-4 w-4" />,
    description: 'Fast multimodal analysis',
    color: 'text-blue-500'
  },
  lovable: {
    name: 'Lovable AI Gateway',
    icon: <Eye className="h-4 w-4" />,
    description: 'Auto-provisioned, balanced',
    color: 'text-purple-500'
  }
};

// Analysis depth options
const DEPTH_OPTIONS = [
  { value: 'quick', label: 'Quick', description: '~2s per frame' },
  { value: 'standard', label: 'Standard', description: '~5s per frame' },
  { value: 'detailed', label: 'Detailed', description: '~10s per frame' }
];

// Focus area options
const FOCUS_AREAS = [
  { id: 'objects', label: 'Objects', icon: <LayoutGrid className="h-3 w-3" /> },
  { id: 'faces', label: 'Faces', icon: <Users className="h-3 w-3" /> },
  { id: 'emotions', label: 'Emotions', icon: <Sparkles className="h-3 w-3" /> },
  { id: 'composition', label: 'Composition', icon: <Palette className="h-3 w-3" /> },
  { id: 'quality', label: 'Quality', icon: <Eye className="h-3 w-3" /> }
];

export function SceneAnalyzerPanel({
  frames = [],
  onAnalysisComplete,
  onSuggestionApply,
  className,
  compact = false
}: SceneAnalyzerPanelProps) {
  const {
    isAnalyzing,
    progress,
    currentScene,
    totalScenes,
    analyses,
    error,
    analyzeScene,
    analyzeMultipleScenes,
    suggestArrangement,
    clearAnalyses,
    getAvailableProviders,
    visionModels
  } = useSceneAnalyzer();

  // Configuration state
  const [selectedProvider, setSelectedProvider] = useState<UniversalAIProviderType>('gemini');
  const [analysisDepth, setAnalysisDepth] = useState<'quick' | 'standard' | 'detailed'>('standard');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(['objects', 'emotions', 'composition']);
  const [autoArrange, setAutoArrange] = useState(true);
  const [selectedTab, setSelectedTab] = useState('analyze');

  // Available providers
  const availableProviders = useMemo(() => getAvailableProviders(), [getAvailableProviders]);

  // Handle single frame analysis
  const handleAnalyzeSingleFrame = useCallback(async (frame: string | Blob | File) => {
    const options: AnalyzeSceneOptions = {
      provider: selectedProvider,
      analysisDepth,
      focusAreas: selectedFocusAreas as any[]
    };

    const result = await analyzeScene(frame, options);
    if (result && onAnalysisComplete) {
      onAnalysisComplete([result]);
    }
  }, [selectedProvider, analysisDepth, selectedFocusAreas, analyzeScene, onAnalysisComplete]);

  // Handle batch analysis
  const handleAnalyzeAll = useCallback(async () => {
    if (frames.length === 0) return;

    const options: AnalyzeSceneOptions = {
      provider: selectedProvider,
      analysisDepth,
      focusAreas: selectedFocusAreas as any[]
    };

    const results = await analyzeMultipleScenes(frames, options);
    
    if (results.length > 0) {
      if (autoArrange && results.length > 1) {
        await suggestArrangement(results, options);
      }
      onAnalysisComplete?.(results);
    }
  }, [frames, selectedProvider, analysisDepth, selectedFocusAreas, autoArrange, analyzeMultipleScenes, suggestArrangement, onAnalysisComplete]);

  // Toggle focus area
  const toggleFocusArea = useCallback((areaId: string) => {
    setSelectedFocusAreas(prev => 
      prev.includes(areaId)
        ? prev.filter(a => a !== areaId)
        : [...prev, areaId]
    );
  }, []);

  // Get quality color
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get mood color
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'bg-green-500/10 text-green-500';
      case 'negative': return 'bg-red-500/10 text-red-500';
      case 'mixed': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Scene Analyzer</span>
            </div>
            <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as UniversalAIProviderType)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map(providerId => (
                  <SelectItem key={providerId} value={providerId}>
                    <div className="flex items-center gap-2">
                      <span className={PROVIDER_CONFIG[providerId]?.color}>
                        {PROVIDER_CONFIG[providerId]?.icon}
                      </span>
                      <span>{PROVIDER_CONFIG[providerId]?.name?.split(' ')[0]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAnalyzing ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Analyzing scene {currentScene} of {totalScenes}...
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleAnalyzeAll}
              disabled={frames.length === 0}
              className="w-full"
              size="sm"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Analyze {frames.length || 'No'} Frames
            </Button>
          )}

          {analyses.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              ✓ {analyses.length} scenes analyzed
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Scene Analyzer
            </CardTitle>
            <CardDescription>
              AI-powered scene analysis for smart editing
            </CardDescription>
          </div>
          {analyses.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAnalyses}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="results" disabled={analyses.length === 0}>
              Results ({analyses.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">AI Provider</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableProviders.map(providerId => {
                  const config = PROVIDER_CONFIG[providerId];
                  const isSelected = selectedProvider === providerId;
                  return (
                    <button
                      key={providerId}
                      onClick={() => setSelectedProvider(providerId)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className={config?.color}>{config?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{config?.name?.split(' ')[0]}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{config?.description}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Focus Areas</Label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(area => (
                  <button
                    key={area.id}
                    onClick={() => toggleFocusArea(area.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all",
                      selectedFocusAreas.includes(area.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {area.icon}
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Depth */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Analysis Depth</Label>
              <div className="flex gap-2">
                {DEPTH_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setAnalysisDepth(option.value as any)}
                    className={cn(
                      "flex-1 p-2 rounded-lg border text-center transition-all",
                      analysisDepth === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-[10px] text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Arrange Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm font-medium">Auto-Arrange Scenes</Label>
                <p className="text-xs text-muted-foreground">Suggest optimal scene order</p>
              </div>
              <Switch checked={autoArrange} onCheckedChange={setAutoArrange} />
            </div>

            {/* Analyze Button */}
            {isAnalyzing ? (
              <div className="space-y-3">
                <Progress value={progress} />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing scene {currentScene} of {totalScenes}...
                </div>
              </div>
            ) : (
              <Button onClick={handleAnalyzeAll} className="w-full" disabled={frames.length === 0}>
                <Wand2 className="h-4 w-4 mr-2" />
                Analyze {frames.length} Frame{frames.length !== 1 ? 's' : ''}
              </Button>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-3">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-3">
                {analyses.map((analysis, index) => (
                  <Card key={analysis.sceneId} className="overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">Scene {index + 1}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {analysis.description}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px]", getMoodColor(analysis.emotions.mood))}
                        >
                          {analysis.emotions.mood}
                        </Badge>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className={cn("text-lg font-bold", getQualityColor(analysis.quality.overall))}>
                            {analysis.quality.overall}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Quality</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold text-foreground">
                            {analysis.objects.length}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Objects</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold text-foreground">
                            {analysis.faces.length}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Faces</p>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {analysis.suggestions.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium flex items-center gap-1">
                            <Lightbulb className="h-3 w-3 text-yellow-500" />
                            Suggestions
                          </p>
                          {analysis.suggestions.slice(0, 3).map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => onSuggestionApply?.(suggestion)}
                              className="w-full flex items-center justify-between p-2 text-left bg-muted/30 hover:bg-muted rounded text-xs transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[9px]",
                                    suggestion.priority === 'high' ? 'border-red-500 text-red-500' :
                                    suggestion.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                    'border-muted-foreground'
                                  )}
                                >
                                  {suggestion.type}
                                </Badge>
                                <span className="text-muted-foreground">{suggestion.description}</span>
                              </div>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Provider Badge */}
                      <div className="mt-2 pt-2 border-t flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          {PROVIDER_CONFIG[analysis.metadata.provider]?.icon}
                          <span>{analysis.metadata.model}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {analysis.metadata.processingTime}ms
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Available Vision Models</h4>
                <div className="space-y-2">
                  {Object.entries(visionModels).map(([provider, models]) => (
                    <div key={provider} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={PROVIDER_CONFIG[provider]?.color}>
                          {PROVIDER_CONFIG[provider]?.icon}
                        </span>
                        <span className="font-medium text-sm">{PROVIDER_CONFIG[provider]?.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {models.map(model => (
                          <Badge key={model} variant="outline" className="text-[10px]">
                            {model.split('/').pop()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Pro Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Gemini is fastest for quick analysis</li>
                  <li>• Claude excels at nuanced emotional detection</li>
                  <li>• OpenAI provides most accurate object detection</li>
                  <li>• Use Detailed depth for professional projects</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default SceneAnalyzerPanel;
