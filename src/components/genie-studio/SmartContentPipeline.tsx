/**
 * Smart Content Pipeline - Unified AI Tools Experience
 * Single smart upload with file detection, AI provider selection, and post-generation actions
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  File,
  Play,
  Film,
  BookOpen,
  Presentation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { AIProviderSelector, AIProviderType } from './AIProviderSelector';
import { PostGenerationActions, GeneratedContent, PostAction } from './PostGenerationActions';

// Content type detection
type ContentType = 'document' | 'image' | 'audio' | 'url' | 'text';

interface DetectedFile {
  file: File;
  type: ContentType;
  preview?: string;
}

interface SmartContentPipelineProps {
  onSendToScriptEditor?: (content: GeneratedContent) => void;
  onSendToVibe?: (content: GeneratedContent) => void;
  onSaveToKnowledgeBase?: (content: GeneratedContent) => void;
  className?: string;
}

// Output format options
const OUTPUT_FORMATS = [
  { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
  { value: 'podcast_script', label: 'Podcast Script', icon: <Mic className="h-4 w-4" /> },
  { value: 'presentation_script', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> },
  { value: 'webinar_script', label: 'Webinar Script', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'tutorial_script', label: 'Tutorial Script', icon: <Play className="h-4 w-4" /> },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'dramatic', label: 'Dramatic' },
];

// File type detection helpers
const getFileType = (file: File): ContentType => {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Image files
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
    return 'image';
  }
  
  // Audio files
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(extension)) {
    return 'audio';
  }
  
  // Document files
  if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'md', 'html', 'rtf'].includes(extension) ||
      mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('presentation')) {
    return 'document';
  }
  
  return 'document'; // Default to document
};

const getContentTypeIcon = (type: ContentType) => {
  switch (type) {
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'image':
      return <ImageIcon className="h-5 w-5" />;
    case 'audio':
      return <Mic className="h-5 w-5" />;
    case 'url':
      return <Link className="h-5 w-5" />;
    case 'text':
      return <FileText className="h-5 w-5" />;
  }
};

const getContentTypeLabel = (type: ContentType) => {
  switch (type) {
    case 'document':
      return 'Document';
    case 'image':
      return 'Image';
    case 'audio':
      return 'Audio';
    case 'url':
      return 'URL';
    case 'text':
      return 'Text';
  }
};

export function SmartContentPipeline({
  onSendToScriptEditor,
  onSendToVibe,
  onSaveToKnowledgeBase,
  className,
}: SmartContentPipelineProps) {
  // Input state
  const [inputMode, setInputMode] = useState<'upload' | 'text' | 'url' | 'generate'>('upload');
  const [detectedFiles, setDetectedFiles] = useState<DetectedFile[]>([]);
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  
  // AI Provider
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>('auto');
  const [autoSelectProvider, setAutoSelectProvider] = useState(true);
  
  // Script options
  const [outputFormat, setOutputFormat] = useState('video_script');
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('');
  const [duration, setDuration] = useState(300);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine content type from current state
  const currentContentType = useMemo<ContentType>(() => {
    if (inputMode === 'upload' && detectedFiles.length > 0) {
      return detectedFiles[0].type;
    }
    if (inputMode === 'url') return 'url';
    if (inputMode === 'generate') return 'image';
    return 'text';
  }, [inputMode, detectedFiles]);

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: DetectedFile[] = acceptedFiles.map(file => {
      const type = getFileType(file);
      const preview = type === 'image' ? URL.createObjectURL(file) : undefined;
      return { file, type, preview };
    });
    
    setDetectedFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      const types = [...new Set(newFiles.map(f => f.type))];
      toast.success(`Detected ${newFiles.length} file(s): ${types.map(getContentTypeLabel).join(', ')}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setDetectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleGenerate = async () => {
    // Validate input
    if (inputMode === 'upload' && detectedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }
    if (inputMode === 'text' && !textContent.trim()) {
      toast.error('Please enter some text content');
      return;
    }
    if (inputMode === 'url' && !urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (inputMode === 'generate' && !imagePrompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setGeneratedContent(null);

    try {
      // Simulate processing with progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
        const messages = [
          'Analyzing content...',
          'Extracting key information...',
          'Querying knowledge base...',
          'Generating script...',
          'Optimizing for ' + outputFormat.replace('_', ' ') + '...',
          'Applying ' + tone + ' tone...',
          'Finalizing script...',
        ];
        setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 700);

      // Simulate API call (replace with actual service calls)
      await new Promise(resolve => setTimeout(resolve, 3500));

      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Complete!');

      // Create mock generated content
      const mockScript = `# Generated Script

## Introduction
Welcome to this ${outputFormat.replace('_', ' ')} about ${inputMode === 'upload' ? detectedFiles[0]?.file.name : inputMode === 'text' ? 'your content' : inputMode === 'url' ? urlInput : imagePrompt}.

## Main Content
This is a ${tone} script generated for ${targetAudience || 'general audience'}.

The content has been optimized for approximately ${Math.floor(duration / 60)} minutes of presentation time.

## Key Points
- Point 1: Important insight from your content
- Point 2: Supporting information
- Point 3: Call to action or conclusion

## Closing
Thank you for your attention. This script was generated using ${autoSelectProvider ? 'auto-selected AI' : selectedProvider} provider.
`;

      const content: GeneratedContent = {
        script: mockScript,
        title: inputMode === 'upload' 
          ? `Script from ${detectedFiles[0]?.file.name}` 
          : inputMode === 'url' 
            ? `Script from URL` 
            : inputMode === 'generate'
              ? `Script from Generated Image`
              : `Script from Text Input`,
        type: outputFormat as GeneratedContent['type'],
        duration,
        sourceType: currentContentType,
        metadata: {
          wordCount: mockScript.split(/\s+/).length,
          estimatedDuration: duration,
          provider: autoSelectProvider ? 'auto' : selectedProvider,
          timestamp: Date.now(),
        },
      };

      setGeneratedContent(content);
      toast.success('Script generated successfully!');
    } catch (err) {
      console.error('Generation error:', err);
      setError('An error occurred during generation');
      toast.error('Generation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePostAction = (action: PostAction) => {
    if (!generatedContent) return;

    switch (action) {
      case 'download':
        // Create and download file
        const blob = new Blob([generatedContent.script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedContent.title?.replace(/[^a-z0-9]/gi, '_') || 'script'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Script downloaded!');
        break;
        
      case 'script-editor':
        onSendToScriptEditor?.(generatedContent);
        toast.success('Sent to Script Editor');
        break;
        
      case 'vibe':
        onSendToVibe?.(generatedContent);
        toast.success('Sent to Vibe Recording');
        break;
        
      case 'knowledge-base':
        onSaveToKnowledgeBase?.(generatedContent);
        toast.success('Saved to Knowledge Base');
        break;
    }
  };

  const resetPipeline = () => {
    setDetectedFiles([]);
    setTextContent('');
    setUrlInput('');
    setImagePrompt('');
    setGeneratedContent(null);
    setError(null);
    setProgress(0);
  };

  // If we have generated content, show post-generation actions
  if (generatedContent) {
    return (
      <div className={cn("space-y-6", className)}>
        <PostGenerationActions
          content={generatedContent}
          onAction={handlePostAction}
        />
        
        <Button 
          variant="outline" 
          onClick={resetPipeline}
          className="w-full"
        >
          Generate Another Script
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Content Pipeline
          </CardTitle>
          <CardDescription>
            Upload any content → Select AI → Get production-ready scripts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Mode Selection */}
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span className="hidden sm:inline">URL</span>
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Generate</span>
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="mt-4 space-y-4">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                  isDragActive 
                    ? "border-primary bg-primary/5 scale-[1.02]" 
                    : "border-border hover:border-primary/50",
                  detectedFiles.length > 0 && "border-green-500/50"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center",
                    isDragActive ? "bg-primary/10" : "bg-secondary"
                  )}>
                    <Upload className={cn(
                      "h-7 w-7",
                      isDragActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium">
                      {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports documents (PDF, DOCX, PPTX), images, and audio files
                    </p>
                  </div>
                </div>
              </div>

              {/* Detected Files */}
              {detectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Detected Files ({detectedFiles.length})</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {detectedFiles.map((df, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/30"
                      >
                        {df.preview ? (
                          <img 
                            src={df.preview} 
                            alt={df.file.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                            {getContentTypeIcon(df.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{df.file.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {getContentTypeLabel(df.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(df.file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="mt-4 space-y-4">
              <Textarea
                placeholder="Paste your content here... (articles, notes, transcripts, etc.)"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                {textContent.length} characters • ~{Math.ceil(textContent.split(/\s+/).filter(Boolean).length / 150)} min read
              </p>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Enter URL</Label>
                <Input
                  placeholder="https://example.com/article or document URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  We'll extract content from web pages, PDF links, or other online documents
                </p>
              </div>
            </TabsContent>

            {/* Generate Image Tab */}
            <TabsContent value="generate" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Image Prompt</Label>
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  We'll generate an image and create a script based on it
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* AI Provider Selection */}
          <AIProviderSelector
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            autoSelect={autoSelectProvider}
            onAutoSelectChange={setAutoSelectProvider}
            contentType={currentContentType}
          />

          <Separator />

          {/* Output Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Output Options</Label>
            
            {/* Output Format */}
            <div className="space-y-2">
              <Label className="text-sm">Script Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {OUTPUT_FORMATS.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setOutputFormat(format.value)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      outputFormat === format.value
                        ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {format.icon}
                      <span className="text-xs font-medium">{format.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="180">3 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                    <SelectItem value="900">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  placeholder="e.g., Healthcare pros..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Script
              </>
            )}
          </Button>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">{progressMessage}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
