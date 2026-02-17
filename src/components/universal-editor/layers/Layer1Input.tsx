/**
 * Layer 1: UNIVERSAL INPUT
 * Drop Zone (Any file/URL/Screen/Voice/API) + AI Router + Intent Detection
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import {
  Upload, Link, MonitorPlay, Mic, Webhook, Camera,
  FileText, Image, Video, Music, Globe, Sparkles,
  ArrowRight, Loader2, X, Wand2, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEditor } from '../context/EditorContext';
import type { 
  UniversalInput, 
  InputSource, 
  DetectedInputType, 
  AIRouterResult,
  UserIntent
} from '../types';

// ============================================================================
// INPUT DETECTION
// ============================================================================

const MIME_TYPE_MAP: Record<string, DetectedInputType> = {
  'application/pdf': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'data',
  'text/csv': 'data',
  'application/json': 'data',
  'text/plain': 'text',
  'text/markdown': 'text',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/webm': 'audio',
};

function detectInputType(file: File): DetectedInputType {
  return MIME_TYPE_MAP[file.type] || 'document';
}

function detectUrlType(url: string): DetectedInputType {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || urlLower.includes('vimeo.com')) {
    return 'video';
  }
  if (urlLower.includes('slides.google.com') || urlLower.includes('canva.com')) {
    return 'presentation';
  }
  if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return 'image';
  }
  if (urlLower.match(/\.(mp4|mov|webm)$/)) {
    return 'video';
  }
  if (urlLower.match(/\.(mp3|wav|m4a)$/)) {
    return 'audio';
  }
  return 'url';
}

// ============================================================================
// INPUT TYPE ICONS
// ============================================================================

const InputTypeIcons: Record<DetectedInputType, React.ReactNode> = {
  document: <FileText className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  url: <Globe className="h-5 w-5" />,
  presentation: <MonitorPlay className="h-5 w-5" />,
  data: <FileText className="h-5 w-5" />,
  text: <FileText className="h-5 w-5" />,
  screen: <MonitorPlay className="h-5 w-5" />,
  mixed: <Sparkles className="h-5 w-5" />,
};

// ============================================================================
// DROP ZONE
// ============================================================================

interface UniversalDropZoneProps {
  onInputAdded: (input: UniversalInput) => void;
  className?: string;
  compact?: boolean;
}

export function UniversalDropZone({ 
  onInputAdded, 
  className,
  compact = false 
}: UniversalDropZoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    
    for (const file of acceptedFiles) {
      const input: UniversalInput = {
        id: uuidv4(),
        source: 'file-drop',
        detectedType: detectInputType(file),
        file,
        metadata: {
          name: file.name,
          size: file.size,
          mimeType: file.type,
        },
        createdAt: new Date().toISOString(),
      };
      
      onInputAdded(input);
    }
    
    setIsProcessing(false);
  }, [onInputAdded]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.*': ['.docx', '.pptx', '.xlsx'],
      'text/*': ['.txt', '.md', '.csv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          className
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
        <p className="text-xs text-muted-foreground mt-2">
          Drop files or click
        </p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
        isDragActive && isDragAccept && "border-primary bg-primary/5 scale-[1.02]",
        isDragActive && !isDragAccept && "border-destructive bg-destructive/5",
        !isDragActive && "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Processing files...</p>
        </div>
      ) : isDragActive ? (
        <div className="flex flex-col items-center gap-3">
          <Upload className="h-10 w-10 text-primary animate-bounce" />
          <p className="text-lg font-medium text-primary">Drop to import</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium">Drop any file to start</p>
            <p className="text-sm text-muted-foreground mt-1">
              Documents, images, videos, audio, presentations, data files
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['PDF', 'PPTX', 'Images', 'Video', 'Audio', 'CSV'].map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// URL INPUT
// ============================================================================

interface UrlInputProps {
  onInputAdded: (input: UniversalInput) => void;
  className?: string;
}

export function UrlInput({ onInputAdded, className }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    
    const input: UniversalInput = {
      id: uuidv4(),
      source: 'url-import',
      detectedType: detectUrlType(url),
      url: url.trim(),
      metadata: {
        name: new URL(url).hostname,
      },
      createdAt: new Date().toISOString(),
    };
    
    onInputAdded(input);
    setUrl('');
    setIsLoading(false);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Paste URL (YouTube, website, Google Slides...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="pl-9"
        />
      </div>
      <Button onClick={handleSubmit} disabled={!url.trim() || isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}

// ============================================================================
// NATURAL LANGUAGE INPUT
// ============================================================================

interface NaturalLanguageInputProps {
  onIntent: (intent: string) => void;
  className?: string;
}

export function NaturalLanguageInput({ onIntent, className }: NaturalLanguageInputProps) {
  const [text, setText] = useState('');

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wand2 className="h-4 w-4" />
        <span>What do you want to create?</span>
        <Badge variant="outline" className="text-[10px]">Optional</Badge>
      </div>
      <Textarea
        placeholder="E.g., 'Create a 2-minute explainer video from this PDF' or 'Turn these slides into social media posts'"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      {text.trim() && (
        <Button 
          size="sm" 
          onClick={() => onIntent(text)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Analyze Intent
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// INPUT PREVIEW CARD
// ============================================================================

interface InputPreviewCardProps {
  input: UniversalInput;
  onRemove: () => void;
  className?: string;
}

export function InputPreviewCard({ input, onRemove, className }: InputPreviewCardProps) {
  return (
    <Card className={cn("relative group", className)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            {InputTypeIcons[input.detectedType]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{input.metadata.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-[10px] capitalize">
                {input.detectedType}
              </Badge>
              {input.metadata.size && (
                <span className="text-[10px] text-muted-foreground">
                  {(input.metadata.size / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// AI ROUTER RESULT
// ============================================================================

interface AIRouterResultCardProps {
  result: AIRouterResult;
  onSelectPipeline: (pipelineId: string) => void;
  className?: string;
}

export function AIRouterResultCard({ 
  result, 
  onSelectPipeline,
  className 
}: AIRouterResultCardProps) {
  return (
    <Card className={cn("border-primary/50 bg-primary/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">AI Recommendation</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.intent.primaryGoal}
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence</span>
                <Badge variant={result.intent.confidence > 80 ? "default" : "secondary"}>
                  {result.intent.confidence}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Est. Time</span>
                <span className="font-medium">{result.estimatedTime} min</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Est. Credits</span>
                <span className="font-medium">{result.estimatedCredits}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onSelectPipeline(result.recommendedPipeline.id)}
              >
                Use Recommended
              </Button>
              <Button variant="outline" size="sm">
                See Alternatives
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPLETE LAYER 1 COMPONENT
// ============================================================================

interface Layer1InputProps {
  onComplete: () => void;
  className?: string;
}

export function Layer1Input({ onComplete, className }: Layer1InputProps) {
  const { project, addInput } = useEditor();
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'record' | 'voice'>('upload');
  const [aiResult, setAiResult] = useState<AIRouterResult | null>(null);

  const handleInputAdded = useCallback((input: UniversalInput) => {
    addInput(input);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiResult({
        input,
        intent: {
          primaryGoal: `Convert ${input.detectedType} to engaging content`,
          suggestedOutputs: ['video-standard', 'social-post', 'pdf'],
          suggestedPipelines: [],
          confidence: 87,
        },
        recommendedPipeline: {
          id: 'auto-video',
          name: 'Auto Video Creation',
          description: 'Automatically create video from your content',
          category: 'video-production',
          inputTypes: [input.detectedType],
          outputTypes: ['video-standard'],
          stages: [],
          estimatedTotalTime: 5,
          estimatedTotalCredits: 50,
          qualityLevel: 'advanced',
          popularity: 1250,
        },
        alternativePipelines: [],
        estimatedTime: 5,
        estimatedCredits: 50,
        qualityScore: 85,
      });
    }, 1500);
  }, [addInput]);

  const handleRemoveInput = (inputId: string) => {
    // Would dispatch remove action
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Methods Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">URL</span>
          </TabsTrigger>
          <TabsTrigger value="record" className="gap-2">
            <MonitorPlay className="h-4 w-4" />
            <span className="hidden sm:inline">Screen</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <UniversalDropZone onInputAdded={handleInputAdded} />
        </TabsContent>

        <TabsContent value="url" className="mt-4 space-y-4">
          <UrlInput onInputAdded={handleInputAdded} />
          <p className="text-xs text-muted-foreground text-center">
            Supports YouTube, Vimeo, Google Slides, websites, and direct media URLs
          </p>
        </TabsContent>

        <TabsContent value="record" className="mt-4">
          <Card className="p-8 text-center">
            <MonitorPlay className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 font-medium">Screen Recording</p>
            <p className="text-sm text-muted-foreground mt-1">
              Record your screen, window, or tab
            </p>
            <Button className="mt-4 gap-2">
              <Camera className="h-4 w-4" />
              Start Recording
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="mt-4">
          <Card className="p-8 text-center">
            <Mic className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 font-medium">Voice Input</p>
            <p className="text-sm text-muted-foreground mt-1">
              Speak your ideas and let AI create content
            </p>
            <Button className="mt-4 gap-2">
              <Mic className="h-4 w-4" />
              Start Speaking
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Imported Files */}
      {project.inputs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Imported Files ({project.inputs.length})</p>
          <div className="grid gap-2">
            {project.inputs.map((input) => (
              <InputPreviewCard
                key={input.id}
                input={input}
                onRemove={() => handleRemoveInput(input.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Natural Language Intent */}
      <NaturalLanguageInput onIntent={(text) => console.log('Intent:', text)} />

      {/* AI Router Result */}
      {aiResult && (
        <AIRouterResultCard
          result={aiResult}
          onSelectPipeline={(id) => {
            console.log('Selected pipeline:', id);
            onComplete();
          }}
        />
      )}

      {/* Continue Button */}
      {project.inputs.length > 0 && !aiResult && (
        <Button className="w-full" onClick={onComplete}>
          Continue to Pipeline Selection
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}

export default Layer1Input;
