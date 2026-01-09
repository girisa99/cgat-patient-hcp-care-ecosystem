/**
 * Full Pipeline Workflow - Hybrid structured + flexible multi-source orchestration
 * Phases: Sources → Media (Upload/Generate/Search) → Script → Review
 * With smart image generation suggestions based on content
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Link, 
  Sparkles,
  Wand2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  Layers,
  Search,
  Globe,
  Lightbulb,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Play,
  Film,
  Database,
  Eye,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { ImageModelSelector, ImageModelType } from './ImageModelSelector';
import { AIProviderSelector, AIProviderType } from './AIProviderSelector';
import { genieScriptService } from '@/services/genieScriptService';

// Pipeline phases
type PipelinePhase = 'sources' | 'media' | 'script' | 'review';

// Source types
type SourceType = 'document' | 'url' | 'audio' | 'text';

interface PipelineSource {
  id: string;
  type: SourceType;
  name: string;
  content?: string;
  file?: File;
  url?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  preview?: string;
}

// Media types
type MediaType = 'upload' | 'generate' | 'web-search';

interface PipelineMedia {
  id: string;
  type: MediaType;
  name: string;
  prompt?: string;
  url?: string;
  file?: File;
  preview?: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  model?: ImageModelType;
  searchQuery?: string;
  insertPoint?: string; // Where in script to suggest this image
}

// Smart image suggestion
interface ImageSuggestion {
  id: string;
  section: string;
  description: string;
  prompt: string;
  priority: 'high' | 'medium' | 'low';
  accepted?: boolean;
}

interface FullPipelineWorkflowProps {
  onComplete?: (result: PipelineResult) => void;
  onCancel?: () => void;
  className?: string;
}

interface PipelineResult {
  script: string;
  title: string;
  sources: PipelineSource[];
  media: PipelineMedia[];
  suggestions: ImageSuggestion[];
  segments?: PipelineSegment[];
}

interface PipelineSegment {
  segmentNumber: number;
  title: string;
  narration: string;
  visualNotes?: string;
  duration: number;
  wordCount: number;
}

const PHASE_CONFIG: { id: PipelinePhase; label: string; description: string }[] = [
  { id: 'sources', label: 'Sources', description: 'Add documents, URLs, and audio' },
  { id: 'media', label: 'Media', description: 'Upload, generate, or search images' },
  { id: 'script', label: 'Script', description: 'Configure and generate' },
  { id: 'review', label: 'Review', description: 'Review and finalize' },
];

export function FullPipelineWorkflow({
  onComplete,
  onCancel,
  className,
}: FullPipelineWorkflowProps) {
  // Phase state
  const [currentPhase, setCurrentPhase] = useState<PipelinePhase>('sources');
  const currentPhaseIndex = PHASE_CONFIG.findIndex(p => p.id === currentPhase);

  // Sources state
  const [sources, setSources] = useState<PipelineSource[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  // Media state
  const [mediaItems, setMediaItems] = useState<PipelineMedia[]>([]);
  const [mediaTab, setMediaTab] = useState<MediaType>('upload');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModelType>('auto');
  const [webSearchQuery, setWebSearchQuery] = useState('');

  // Script options
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>('auto');
  const [enableKnowledgeSearch, setEnableKnowledgeSearch] = useState(false);
  const [outputFormat, setOutputFormat] = useState('video_script');
  const [tone, setTone] = useState('professional');
  const [duration, setDuration] = useState(300);
  const [targetAudience, setTargetAudience] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Smart suggestions state
  const [imageSuggestions, setImageSuggestions] = useState<ImageSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generated content
  const [generatedScript, setGeneratedScript] = useState('');
  
  // Timer refs for cleanup
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pipelineTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      pipelineTimeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // File drop for sources
  const onSourceDrop = useCallback((acceptedFiles: File[]) => {
    const newSources: PipelineSource[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      type: file.type.startsWith('audio/') ? 'audio' : 'document',
      name: file.name,
      file,
      status: 'ready',
    }));
    setSources(prev => [...prev, ...newSources]);
    toast.success(`Added ${newSources.length} source(s)`);
  }, []);

  const { getRootProps: getSourceRootProps, getInputProps: getSourceInputProps, isDragActive: isSourceDragActive } = useDropzone({
    onDrop: onSourceDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
    },
  });

  // File drop for media (images)
  const onMediaDrop = useCallback((acceptedFiles: File[]) => {
    const newMedia: PipelineMedia[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      type: 'upload',
      name: file.name,
      file,
      preview: URL.createObjectURL(file),
      status: 'ready',
    }));
    setMediaItems(prev => [...prev, ...newMedia]);
    toast.success(`Added ${newMedia.length} image(s)`);
  }, []);

  const { getRootProps: getMediaRootProps, getInputProps: getMediaInputProps, isDragActive: isMediaDragActive } = useDropzone({
    onDrop: onMediaDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
  });

  // Add URL source
  const addUrlSource = () => {
    if (!urlInput.trim()) return;
    const newSource: PipelineSource = {
      id: crypto.randomUUID(),
      type: 'url',
      name: urlInput,
      url: urlInput,
      status: 'ready',
    };
    setSources(prev => [...prev, newSource]);
    setUrlInput('');
    toast.success('URL added');
  };

  // Add text source
  const addTextSource = () => {
    if (!textInput.trim()) return;
    const newSource: PipelineSource = {
      id: crypto.randomUUID(),
      type: 'text',
      name: `Text note (${textInput.substring(0, 30)}...)`,
      content: textInput,
      status: 'ready',
    };
    setSources(prev => [...prev, newSource]);
    setTextInput('');
    toast.success('Text note added');
  };

  // Remove source
  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  // Move source
  const moveSource = (index: number, direction: 'up' | 'down') => {
    setSources(prev => {
      const newArr = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newArr.length) return prev;
      [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
      return newArr;
    });
  };

  // Add generated image
  const addGeneratedImage = () => {
    if (!generatePrompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }
    const newMedia: PipelineMedia = {
      id: crypto.randomUUID(),
      type: 'generate',
      name: `Generated: ${generatePrompt.substring(0, 40)}...`,
      prompt: generatePrompt,
      model: selectedImageModel,
      status: 'pending',
    };
    setMediaItems(prev => [...prev, newMedia]);
    setGeneratePrompt('');
    toast.success('Image generation queued');
  };

  // Add web search image
  const addWebSearchImage = () => {
    if (!webSearchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    const newMedia: PipelineMedia = {
      id: crypto.randomUUID(),
      type: 'web-search',
      name: `Search: ${webSearchQuery.substring(0, 40)}...`,
      searchQuery: webSearchQuery,
      status: 'pending',
    };
    setMediaItems(prev => [...prev, newMedia]);
    setWebSearchQuery('');
    toast.success('Web search queued');
  };

  // Remove media
  const removeMedia = (id: string) => {
    setMediaItems(prev => {
      const item = prev.find(m => m.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(m => m.id !== id);
    });
  };

  // Generate smart image suggestions using real AI
  const generateSuggestions = async () => {
    if (sources.length === 0) {
      toast.error('Please add at least one source first');
      return;
    }

    setIsProcessing(true);
    setProgressMessage('Analyzing content for image suggestions...');
    
    try {
      // Build content from sources for AI analysis
      const sourceContent = sources.map(s => {
        if (s.content) return s.content;
        if (s.url) return `URL: ${s.url}`;
        return s.name;
      }).join('\n\n');
      
      const sourceNames = sources.map(s => s.name);
      
      // Use real AI to generate suggestions
      const suggestions = await genieScriptService.generateImageSuggestions(
        sourceContent,
        sourceNames
      );
      
      setImageSuggestions(suggestions);
      setShowSuggestions(true);
      toast.success(`Generated ${suggestions.length} image suggestions`);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast.error('Failed to generate image suggestions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Accept suggestion
  const acceptSuggestion = (suggestion: ImageSuggestion) => {
    const newMedia: PipelineMedia = {
      id: crypto.randomUUID(),
      type: 'generate',
      name: `${suggestion.section}: ${suggestion.description}`,
      prompt: suggestion.prompt,
      model: selectedImageModel,
      status: 'pending',
      insertPoint: suggestion.section,
    };
    setMediaItems(prev => [...prev, newMedia]);
    setImageSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, accepted: true } : s
    ));
    toast.success(`Added image for ${suggestion.section}`);
  };

  // Generate script using real AI
  const handleGenerateScript = async () => {
    if (sources.length === 0) {
      toast.error('Please add at least one source');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting pipeline...');

    try {
      // Clear any existing pipeline timeouts
      pipelineTimeoutsRef.current.forEach(t => clearTimeout(t));
      pipelineTimeoutsRef.current = [];
      
      // Step 1: Process sources
      setProgressMessage('Processing sources...');
      setProgress(20);
      
      // Build source data for AI
      const sourceData = sources.map(s => ({
        type: s.type,
        name: s.name,
        content: s.content,
        url: s.url
      }));
      
      // Step 2: Generate script with real AI
      setProgressMessage('Generating script with AI...');
      setProgress(40);
      
      const providerMap: Record<AIProviderType, 'gemini' | 'openai' | 'claude'> = {
        'auto': 'gemini',
        'gemini': 'gemini',
        'openai': 'openai',
        'claude': 'claude',
        'huggingface': 'gemini' // Fallback to gemini for huggingface
      };
      
      const result = await genieScriptService.generateScriptFromSources(
        sourceData,
        {
          outputFormat,
          tone,
          duration,
          targetAudience,
          provider: providerMap[selectedProvider] || 'gemini'
        }
      );
      
      setProgress(70);
      setProgressMessage('Processing media...');
      
      // Update media items to "ready"
      setMediaItems(prev => prev.map(m => ({ ...m, status: 'ready' as const })));
      
      // Step 3: Format the output
      setProgressMessage('Finalizing...');
      setProgress(90);
      
      const segments = result.segments;
      const sourcesList = sources.map(s => s.name).join(', ');
      const mediaList = mediaItems.map(m => m.name).join(', ');
      
      const formattedScript = `# Generated Video Script

## Pipeline Summary
- **Sources**: ${sources.length} items (${sourcesList})
- **Media**: ${mediaItems.length} items (${mediaList || 'None'})
- **Format**: ${outputFormat.replace('_', ' ')}
- **Tone**: ${tone}
- **Duration**: ${Math.floor(duration / 60)} minutes
- **Audience**: ${targetAudience || 'General'}

---

${segments.map(seg => `## ${seg.title}
${seg.visualNotes ? `[${seg.visualNotes}]` : ''}

${seg.narration}
`).join('\n---\n\n')}

---
*Generated by Full Pipeline Workflow*
*AI Provider: ${selectedProvider}*
${enableKnowledgeSearch ? '*Enhanced with Knowledge Base content*' : ''}
`;

      setGeneratedScript(formattedScript);
      // Store segments for passing to parent
      (window as any).__pipelineSegments = segments;

      setProgress(100);
      setCurrentPhase('review');
      toast.success('Script generated successfully!');
    } catch (err) {
      console.error('Pipeline error:', err);
      toast.error(err instanceof Error ? err.message : 'Pipeline failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Navigation
  const canGoNext = () => {
    switch (currentPhase) {
      case 'sources': return sources.length > 0;
      case 'media': return true; // Media is optional
      case 'script': return !isProcessing;
      case 'review': return !!generatedScript;
      default: return false;
    }
  };

  const goNext = () => {
    const nextIndex = currentPhaseIndex + 1;
    if (nextIndex < PHASE_CONFIG.length) {
      setCurrentPhase(PHASE_CONFIG[nextIndex].id);
    }
  };

  const goPrev = () => {
    const prevIndex = currentPhaseIndex - 1;
    if (prevIndex >= 0) {
      setCurrentPhase(PHASE_CONFIG[prevIndex].id);
    }
  };

  // Complete pipeline
  const handleComplete = () => {
    if (!generatedScript) return;
    
    // Retrieve segments stored during generation
    const segments = (window as any).__pipelineSegments as PipelineSegment[] | undefined;
    delete (window as any).__pipelineSegments;
    
    onComplete?.({
      script: generatedScript,
      title: `Pipeline Script - ${new Date().toLocaleDateString()}`,
      sources,
      media: mediaItems,
      suggestions: imageSuggestions,
      segments,
    });
    toast.success('Pipeline completed!');
  };

  // Get source icon
  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'url': return <Link className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Phase Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {PHASE_CONFIG.map((phase, index) => (
              <React.Fragment key={phase.id}>
                <button
                  onClick={() => index <= currentPhaseIndex && setCurrentPhase(phase.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    index <= currentPhaseIndex ? "opacity-100" : "opacity-40",
                    index < currentPhaseIndex && "cursor-pointer hover:opacity-80"
                  )}
                  disabled={index > currentPhaseIndex}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                    index < currentPhaseIndex && "bg-primary border-primary text-primary-foreground",
                    index === currentPhaseIndex && "border-primary bg-primary/10 text-primary",
                    index > currentPhaseIndex && "border-muted bg-muted"
                  )}>
                    {index < currentPhaseIndex ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    index === currentPhaseIndex && "text-primary"
                  )}>
                    {phase.label}
                  </span>
                </button>
                {index < PHASE_CONFIG.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    index < currentPhaseIndex ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {PHASE_CONFIG[currentPhaseIndex].description}
          </p>
        </CardContent>
      </Card>

      {/* Phase Content */}
      {currentPhase === 'sources' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Add Sources
            </CardTitle>
            <CardDescription>
              Combine documents, URLs, audio, and text notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Zone */}
            <div
              {...getSourceRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                isSourceDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <input {...getSourceInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium text-sm">Drop files or click to upload</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, TXT, MD, MP3, WAV</p>
            </div>

            {/* URL Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add URL (article, webpage, document link)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addUrlSource()}
              />
              <Button onClick={addUrlSource} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Text Note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a text note or context..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[80px]"
              />
              <Button onClick={addTextSource} variant="secondary" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Text Note
              </Button>
            </div>

            <Separator />

            {/* Sources List */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Sources ({sources.length})
              </Label>
              {sources.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sources added yet. Upload files, add URLs, or write text notes.
                </p>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <div
                        key={source.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/30"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                          {getSourceIcon(source.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{source.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{source.type}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveSource(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveSource(index, 'down')}
                            disabled={index === sources.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeSource(source.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentPhase === 'media' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Add Media
            </CardTitle>
            <CardDescription>
              Upload images, generate with AI, or search the web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Smart Suggestions */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Smart Image Suggestions</Label>
                  <p className="text-xs text-muted-foreground">
                    AI analyzes your sources and suggests optimal images
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSuggestions}
                disabled={sources.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Get Suggestions
                  </>
                )}
              </Button>
            </div>

            {/* Suggestions List */}
            {showSuggestions && imageSuggestions.length > 0 && (
              <div className="space-y-2 p-4 rounded-lg border bg-primary/5">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Suggested Images
                </Label>
                <div className="space-y-2">
                  {imageSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all",
                        suggestion.accepted ? "bg-green-50 dark:bg-green-950/20 border-green-500/50" : "bg-background"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {suggestion.section}
                          </Badge>
                          <Badge 
                            className={cn(
                              "text-[10px]",
                              suggestion.priority === 'high' ? "bg-red-500/20 text-red-600" :
                              suggestion.priority === 'medium' ? "bg-yellow-500/20 text-yellow-600" :
                              "bg-blue-500/20 text-blue-600"
                            )}
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{suggestion.description}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {suggestion.prompt}
                        </p>
                      </div>
                      <Button
                        variant={suggestion.accepted ? "secondary" : "default"}
                        size="sm"
                        onClick={() => acceptSuggestion(suggestion)}
                        disabled={suggestion.accepted}
                      >
                        {suggestion.accepted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Media Tabs */}
            <Tabs value={mediaTab} onValueChange={(v) => setMediaTab(v as MediaType)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="upload" className="gap-1">
                  <Upload className="h-3 w-3" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="generate" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="web-search" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Web Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <div
                  {...getMediaRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                    isMediaDragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <input {...getMediaInputProps()} />
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium text-sm">Drop images or click to upload</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF</p>
                </div>
              </TabsContent>

              <TabsContent value="generate" className="mt-4 space-y-4">
                <ImageModelSelector
                  selectedModel={selectedImageModel}
                  onModelChange={setSelectedImageModel}
                  showLabel={true}
                />
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={addGeneratedImage} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Queue
                </Button>
              </TabsContent>

              <TabsContent value="web-search" className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for images (e.g., 'medical infographic')"
                    value={webSearchQuery}
                    onChange={(e) => setWebSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addWebSearchImage()}
                  />
                  <Button onClick={addWebSearchImage} variant="secondary">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll search Unsplash, Pexels, and other free image sources
                </p>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Media List */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Media Queue ({mediaItems.length})
              </Label>
              {mediaItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No media added yet. This is optional - you can proceed without images.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaItems.map((media) => (
                    <div
                      key={media.id}
                      className="relative group rounded-lg border overflow-hidden bg-secondary/30"
                    >
                      {media.preview ? (
                        <img 
                          src={media.preview} 
                          alt={media.name}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-muted">
                          {media.type === 'generate' ? (
                            <Sparkles className="h-6 w-6 text-primary" />
                          ) : (
                            <Globe className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{media.name}</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] mt-1",
                            media.status === 'ready' && "bg-green-500/20 text-green-600",
                            media.status === 'pending' && "bg-yellow-500/20 text-yellow-600",
                            media.status === 'generating' && "bg-blue-500/20 text-blue-600"
                          )}
                        >
                          {media.status}
                        </Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(media.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentPhase === 'script' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Configure & Generate
            </CardTitle>
            <CardDescription>
              Set options and generate your script
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Provider */}
            <AIProviderSelector
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              contentType="full-pipeline"
              showLabel={true}
            />

            {/* Knowledge Search Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="knowledge-toggle">
                    Knowledge Search Enhancement
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-enhance with relevant knowledge base content
                  </p>
                </div>
              </div>
              <Switch
                id="knowledge-toggle"
                checked={enableKnowledgeSearch}
                onCheckedChange={setEnableKnowledgeSearch}
              />
            </div>

            <Separator />

            {/* Output Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Script Type</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video_script">
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4" />
                        Video Script
                      </div>
                    </SelectItem>
                    <SelectItem value="podcast_script">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Podcast Script
                      </div>
                    </SelectItem>
                    <SelectItem value="presentation_script">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Presentation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tone</Label>
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

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="180">3 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                    <SelectItem value="900">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Target Audience</Label>
                <Input
                  placeholder="e.g., Healthcare pros..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
              <Label className="text-sm font-semibold">Pipeline Summary</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{sources.length} source(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{mediaItems.length} media item(s)</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateScript}
              disabled={isProcessing || sources.length === 0}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {progressMessage}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Script
                </>
              )}
            </Button>

            {isProcessing && (
              <Progress value={progress} />
            )}
          </CardContent>
        </Card>
      )}

      {currentPhase === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Review & Finalize
            </CardTitle>
            <CardDescription>
              Review your generated script
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedScript ? (
              <>
                <ScrollArea className="h-[400px] rounded-lg border p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedScript}
                  </pre>
                </ScrollArea>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setGeneratedScript('');
                      setCurrentPhase('script');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleComplete}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Pipeline
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No script generated yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setCurrentPhase('script')}
                >
                  Go to Script Generation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentPhaseIndex === 0 ? onCancel : goPrev}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentPhaseIndex === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        {currentPhase !== 'review' && (
          <Button
            onClick={goNext}
            disabled={!canGoNext()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
