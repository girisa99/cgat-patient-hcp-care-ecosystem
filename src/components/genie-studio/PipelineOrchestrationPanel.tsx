/**
 * PIPELINE ORCHESTRATION PANEL - Phase 1 Frontend
 * UI for full production pipeline orchestration
 * Uses mediaProductionOrchestrator backend service
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play,
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Link,
  Figma,
  PenTool,
  Video,
  Mic,
  Presentation,
  Film,
  Zap,
  Settings,
  ArrowRight,
  CircleDot,
  CircleCheck,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  mediaProductionOrchestrator, 
  ProductionPipelineConfig,
  PipelineResult,
  PipelineStage,
  InputSource,
  OutputType
} from '@/services/mediaProductionOrchestrator';

interface PipelineOrchestrationPanelProps {
  onPipelineComplete?: (result: PipelineResult) => void;
  className?: string;
}

const INPUT_SOURCES: { value: InputSource; label: string; icon: React.ReactNode; available: boolean }[] = [
  { value: 'document', label: 'Document', icon: <FileText className="h-4 w-4" />, available: true },
  { value: 'image', label: 'Image', icon: <ImageIcon className="h-4 w-4" />, available: true },
  { value: 'prompt', label: 'Text Prompt', icon: <PenTool className="h-4 w-4" />, available: true },
  { value: 'url', label: 'Web URL', icon: <Link className="h-4 w-4" />, available: true },
  { value: 'figma', label: 'Figma', icon: <Figma className="h-4 w-4" />, available: false },
  { value: 'miro', label: 'Miro', icon: <PenTool className="h-4 w-4" />, available: false },
  { value: 'canva', label: 'Canva', icon: <Presentation className="h-4 w-4" />, available: false },
  { value: 'whiteboard', label: 'Whiteboard', icon: <PenTool className="h-4 w-4" />, available: false },
];

const OUTPUT_TYPES: { value: OutputType; label: string; icon: React.ReactNode }[] = [
  { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="h-4 w-4" /> },
  { value: 'presentation', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> },
  { value: 'webinar', label: 'Webinar', icon: <Play className="h-4 w-4" /> },
  { value: 'animation', label: 'Animation', icon: <Film className="h-4 w-4" /> },
  { value: 'storyboard', label: 'Storyboard', icon: <PenTool className="h-4 w-4" /> },
];

const PIPELINE_STAGES: { stage: PipelineStage; label: string }[] = [
  { stage: 'input_processing', label: 'Input Processing' },
  { stage: 'content_extraction', label: 'Content Extraction' },
  { stage: 'script_generation', label: 'Script Generation' },
  { stage: 'media_generation', label: 'Media Generation' },
  { stage: 'post_processing', label: 'Post Processing' },
  { stage: 'complete', label: 'Complete' },
];

export function PipelineOrchestrationPanel({ onPipelineComplete, className }: PipelineOrchestrationPanelProps) {
  // Input configuration
  const [inputSource, setInputSource] = useState<InputSource>('document');
  const [inputContent, setInputContent] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  
  // Output configuration
  const [outputType, setOutputType] = useState<OutputType>('video');
  const [duration, setDuration] = useState(300);
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [includeMusic, setIncludeMusic] = useState(true);
  const [voiceOver, setVoiceOver] = useState(true);
  
  // Processing options
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'gemini'>('gemini');
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const [enhanceWithAI, setEnhanceWithAI] = useState(true);
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('');
  
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage | null>(null);
  const [stageProgress, setStageProgress] = useState(0);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const getStageStatus = (stage: PipelineStage): 'pending' | 'active' | 'complete' | 'failed' => {
    if (!currentStage) return 'pending';
    if (result?.success === false && currentStage === stage) return 'failed';
    
    const stageOrder = PIPELINE_STAGES.map(s => s.stage);
    const currentIdx = stageOrder.indexOf(currentStage);
    const stageIdx = stageOrder.indexOf(stage);
    
    if (stageIdx < currentIdx) return 'complete';
    if (stageIdx === currentIdx) return 'active';
    return 'pending';
  };

  const getInputData = () => {
    switch (inputSource) {
      case 'document':
        return { content: inputContent };
      case 'image':
        return { url: inputUrl };
      case 'prompt':
        return { prompt: inputPrompt };
      case 'url':
        return { url: inputUrl };
      default:
        return { content: inputContent };
    }
  };

  const handleExecute = async () => {
    // Validate input
    const inputData = getInputData();
    if (!inputData.content && !inputData.url && !inputData.prompt) {
      toast.error('Please provide input data');
      return;
    }

    setIsRunning(true);
    setCurrentStage('input_processing');
    setStageProgress(0);
    setResult(null);

    try {
      // Simulate stage progress
      const stages = PIPELINE_STAGES.filter(s => s.stage !== 'complete' && s.stage !== 'failed');
      
      for (let i = 0; i < stages.length; i++) {
        setCurrentStage(stages[i].stage);
        
        // Simulate progress within each stage
        for (let p = 0; p <= 100; p += 20) {
          setStageProgress(p);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      const config: ProductionPipelineConfig = {
        inputSource,
        inputData: getInputData(),
        outputType,
        outputOptions: {
          duration,
          resolution,
          includeMusic,
          voiceOver,
        },
        aiProvider,
        useKnowledgeBase,
        enhanceWithAI,
        tone: tone as any,
        targetAudience: targetAudience || undefined,
      };

      const pipelineResult = await mediaProductionOrchestrator.executePipeline(config);

      setCurrentStage('complete');
      setStageProgress(100);
      setResult(pipelineResult);

      if (pipelineResult.success) {
        toast.success('Pipeline completed successfully!');
        onPipelineComplete?.(pipelineResult);
      } else {
        toast.error(pipelineResult.error || 'Pipeline failed');
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      toast.error('An error occurred during pipeline execution');
      setResult({ 
        success: false, 
        pipelineId: '', 
        inputSource, 
        outputType, 
        stages: [], 
        totalDuration: 0,
        error: 'Pipeline execution failed' 
      });
    } finally {
      setIsRunning(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Pipeline Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Production Pipeline
          </CardTitle>
          <CardDescription>
            End-to-end orchestration from input to final media output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Source Selection */}
          <div className="space-y-3">
            <Label>Input Source</Label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {INPUT_SOURCES.map((source) => (
                <button
                  key={source.value}
                  onClick={() => source.available && setInputSource(source.value)}
                  disabled={!source.available}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1",
                    !source.available && "opacity-50 cursor-not-allowed",
                    inputSource === source.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {source.icon}
                  <span className="text-xs font-medium">{source.label}</span>
                  {!source.available && (
                    <Badge variant="outline" className="text-[10px] px-1">
                      Soon
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Input Data */}
          <div className="space-y-2">
            <Label>
              {inputSource === 'prompt' ? 'Text Prompt' : 
               inputSource === 'url' || inputSource === 'image' ? 'URL' : 
               'Content'}
            </Label>
            {inputSource === 'prompt' || inputSource === 'document' ? (
              <Textarea
                placeholder={inputSource === 'prompt' 
                  ? "Describe what you want to create..." 
                  : "Paste document content here..."}
                value={inputSource === 'prompt' ? inputPrompt : inputContent}
                onChange={(e) => inputSource === 'prompt' 
                  ? setInputPrompt(e.target.value) 
                  : setInputContent(e.target.value)}
                className="min-h-[120px]"
              />
            ) : (
              <Input
                placeholder="https://..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            )}
          </div>

          {/* Output Type Selection */}
          <div className="space-y-3">
            <Label>Output Type</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {OUTPUT_TYPES.map((output) => (
                <button
                  key={output.value}
                  onClick={() => setOutputType(output.value)}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1",
                    outputType === output.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {output.icon}
                  <span className="text-xs font-medium">{output.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select value={resolution} onValueChange={(v) => setResolution(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 min</SelectItem>
                  <SelectItem value="180">3 min</SelectItem>
                  <SelectItem value="300">5 min</SelectItem>
                  <SelectItem value="600">10 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="knowledge" 
                checked={useKnowledgeBase} 
                onCheckedChange={(c) => setUseKnowledgeBase(!!c)} 
              />
              <Label htmlFor="knowledge" className="text-sm cursor-pointer">
                Use Knowledge Base
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="enhance" 
                checked={enhanceWithAI} 
                onCheckedChange={(c) => setEnhanceWithAI(!!c)} 
              />
              <Label htmlFor="enhance" className="text-sm cursor-pointer">
                AI Enhancement
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="music" 
                checked={includeMusic} 
                onCheckedChange={(c) => setIncludeMusic(!!c)} 
              />
              <Label htmlFor="music" className="text-sm cursor-pointer">
                Background Music
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="voice" 
                checked={voiceOver} 
                onCheckedChange={(c) => setVoiceOver(!!c)} 
              />
              <Label htmlFor="voice" className="text-sm cursor-pointer">
                Voice Over
              </Label>
            </div>
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleExecute}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Pipeline...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Pipeline
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pipeline Progress */}
      {(isRunning || result) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Pipeline Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Stage Progress */}
              <div className="flex items-center justify-between gap-2">
                {PIPELINE_STAGES.filter(s => s.stage !== 'failed').map((stage, idx) => {
                  const status = getStageStatus(stage.stage);
                  return (
                    <React.Fragment key={stage.stage}>
                      <div className={cn(
                        "flex flex-col items-center gap-1",
                        status === 'complete' && "text-green-500",
                        status === 'active' && "text-primary",
                        status === 'failed' && "text-red-500",
                        status === 'pending' && "text-muted-foreground"
                      )}>
                        {status === 'complete' ? (
                          <CircleCheck className="h-6 w-6" />
                        ) : status === 'active' ? (
                          <CircleDot className="h-6 w-6 animate-pulse" />
                        ) : status === 'failed' ? (
                          <AlertCircle className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                        <span className="text-xs text-center">{stage.label}</span>
                      </div>
                      {idx < PIPELINE_STAGES.filter(s => s.stage !== 'failed').length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Current Stage Progress */}
              {isRunning && currentStage && currentStage !== 'complete' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{PIPELINE_STAGES.find(s => s.stage === currentStage)?.label}</span>
                    <span>{stageProgress}%</span>
                  </div>
                  <Progress value={stageProgress} />
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={cn(
                  "rounded-lg p-4 mt-4",
                  result.success ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900" 
                    : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {result.success ? 'Pipeline Complete' : 'Pipeline Failed'}
                    </span>
                  </div>

                  {result.success && result.output && (
                    <div className="space-y-2 text-sm">
                      {result.output.mediaUrl && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Media URL:</span>
                          <a href={result.output.mediaUrl} className="text-primary hover:underline truncate max-w-[200px]">
                            {result.output.mediaUrl}
                          </a>
                        </div>
                      )}
                      {result.output.duration && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{formatDuration(result.output.duration)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Time:</span>
                        <span>{(result.totalDuration / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  )}

                  {result.generatedScript && (
                    <div className="mt-4">
                      <Label className="text-sm mb-2 block">Generated Script</Label>
                      <ScrollArea className="h-[150px] rounded border p-2 bg-background">
                        <div className="text-sm">
                          <p className="font-medium mb-2">{result.generatedScript.title}</p>
                          {result.generatedScript.scenes.slice(0, 3).map((scene) => (
                            <div key={scene.id} className="mb-2 pb-2 border-b last:border-0">
                              <Badge variant="outline" className="text-xs mb-1">
                                Scene {scene.sceneNumber}
                              </Badge>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {scene.narration}
                              </p>
                            </div>
                          ))}
                          {result.generatedScript.scenes.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{result.generatedScript.scenes.length - 3} more scenes...
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {result.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {result.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
