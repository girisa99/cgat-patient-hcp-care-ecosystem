/**
 * Genie Spark - Smart Content Pipeline
 * "Ignite Your Ideas" - AI-powered content generation engine
 * Part of Genie Studio
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  Play,
  Film,
  BookOpen,
  Presentation,
  Layers,
  Video,
  Radio,
  GraduationCap,
  Search,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { AIProviderSelector, AIProviderType } from './AIProviderSelector';
import { ImageModelSelector, ImageModelType } from './ImageModelSelector';
import { PostGenerationActions, GeneratedContent, PostAction } from './PostGenerationActions';
import { FullPipelineWorkflow } from './FullPipelineWorkflow';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';

// Content type options
type ContentType = 'document' | 'image' | 'audio' | 'url' | 'full-pipeline';

interface ContentTypeOption {
  id: ContentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  acceptedFiles: string;
  outputFormats: { value: string; label: string; icon: React.ReactNode }[];
  defaultTone: string;
  defaultDuration: number;
}

const CONTENT_TYPES: ContentTypeOption[] = [
  {
    id: 'document',
    label: 'Document → Script',
    description: 'PDF, DOCX, PPTX, TXT, MD',
    icon: <FileText className="h-4 w-4" />,
    acceptedFiles: '.pdf,.docx,.pptx,.txt,.md,.html,.rtf',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Script', icon: <Mic className="h-4 w-4" /> },
      { value: 'presentation_script', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> },
      { value: 'webinar_script', label: 'Webinar Script', icon: <BookOpen className="h-4 w-4" /> },
      { value: 'tutorial_script', label: 'Tutorial Script', icon: <Play className="h-4 w-4" /> },
    ],
    defaultTone: 'professional',
    defaultDuration: 300,
  },
  {
    id: 'image',
    label: 'Image → Script',
    description: 'JPG, PNG, WebP, GIF or generate',
    icon: <ImageIcon className="h-4 w-4" />,
    acceptedFiles: '.jpg,.jpeg,.png,.webp,.gif,.svg',
    outputFormats: [
      { value: 'narration', label: 'Narration', icon: <Mic className="h-4 w-4" /> },
      { value: 'documentary', label: 'Documentary', icon: <Film className="h-4 w-4" /> },
      { value: 'commercial', label: 'Commercial', icon: <Sparkles className="h-4 w-4" /> },
      { value: 'educational', label: 'Educational', icon: <GraduationCap className="h-4 w-4" /> },
    ],
    defaultTone: 'informative',
    defaultDuration: 60,
  },
  {
    id: 'audio',
    label: 'Audio → Script',
    description: 'MP3, WAV, M4A (transcribe)',
    icon: <Mic className="h-4 w-4" />,
    acceptedFiles: '.mp3,.wav,.m4a,.ogg,.flac,.aac',
    outputFormats: [
      { value: 'transcript', label: 'Clean Transcript', icon: <FileText className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Format', icon: <Radio className="h-4 w-4" /> },
      { value: 'video_script', label: 'Video Script', icon: <Video className="h-4 w-4" /> },
    ],
    defaultTone: 'casual',
    defaultDuration: 600,
  },
  {
    id: 'url',
    label: 'URL → Script',
    description: 'Web pages, articles, online docs',
    icon: <Link className="h-4 w-4" />,
    acceptedFiles: '',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Script', icon: <Mic className="h-4 w-4" /> },
      { value: 'summary', label: 'Summary', icon: <FileText className="h-4 w-4" /> },
    ],
    defaultTone: 'informative',
    defaultDuration: 180,
  },
  {
    id: 'full-pipeline',
    label: 'Full Pipeline',
    description: 'Combine docs, images & audio into one script',
    icon: <Layers className="h-4 w-4" />,
    acceptedFiles: '.pdf,.docx,.pptx,.txt,.md,.jpg,.jpeg,.png,.webp,.mp3,.wav',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Script', icon: <Mic className="h-4 w-4" /> },
      { value: 'presentation_script', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> },
    ],
    defaultTone: 'professional',
    defaultDuration: 600,
  },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'informative', label: 'Informative' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 180, label: '3 minutes' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
];

interface DetectedFile {
  file: File;
  preview?: string;
}

interface SmartContentPipelineProps {
  onSendToScriptEditor?: (content: GeneratedContent) => void;
  onSendToVibe?: (content: GeneratedContent) => void;
  onSaveToKnowledgeBase?: (content: GeneratedContent) => void;
  className?: string;
}

export function SmartContentPipeline({
  onSendToScriptEditor,
  onSendToVibe,
  onSaveToKnowledgeBase,
  className,
}: SmartContentPipelineProps) {
  // Content type selection
  const [contentType, setContentType] = useState<ContentType>('document');
  const selectedContentType = CONTENT_TYPES.find(ct => ct.id === contentType)!;
  
  // Input state
  const [uploadedFiles, setUploadedFiles] = useState<DetectedFile[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState(''); // For image generation
  const [generateImage, setGenerateImage] = useState(false);
  
  // AI Provider
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>('auto');
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModelType>('auto');
  
  // Knowledge Search enhancement
  const [enableKnowledgeSearch, setEnableKnowledgeSearch] = useState(false);
  
  // Script options - update defaults when content type changes
  const [outputFormat, setOutputFormat] = useState(selectedContentType.outputFormats[0]?.value || 'video_script');
  const [tone, setTone] = useState(selectedContentType.defaultTone);
  const [duration, setDuration] = useState(selectedContentType.defaultDuration);
  const [targetAudience, setTargetAudience] = useState('');
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Timer ref for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timers and object URLs on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
      // Revoke any object URLs to prevent memory leaks
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  // Update defaults when content type changes
  const handleContentTypeChange = (newType: ContentType) => {
    setContentType(newType);
    const newTypeConfig = CONTENT_TYPES.find(ct => ct.id === newType)!;
    setOutputFormat(newTypeConfig.outputFormats[0]?.value || 'video_script');
    setTone(newTypeConfig.defaultTone);
    setDuration(newTypeConfig.defaultDuration);
    setUploadedFiles([]);
    setUrlInput('');
    setImagePrompt('');
    setGenerateImage(false);
    setGeneratedContent(null);
  };

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: DetectedFile[] = acceptedFiles.map(file => {
      const isImage = file.type.startsWith('image/');
      const preview = isImage ? URL.createObjectURL(file) : undefined;
      return { file, preview };
    });
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`Uploaded ${newFiles.length} file(s)`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedContentType.acceptedFiles ? 
      selectedContentType.acceptedFiles.split(',').reduce((acc, ext) => {
        const mimeType = ext === '.pdf' ? 'application/pdf' :
                        ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                        ext === '.pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
                        ext.match(/\.(jpg|jpeg|png|gif|webp|svg)/) ? `image/${ext.replace('.', '')}` :
                        ext.match(/\.(mp3|wav|ogg|m4a|flac|aac)/) ? `audio/${ext.replace('.', '')}` :
                        `text/${ext.replace('.', '')}`;
        return { ...acc, [mimeType]: [ext] };
      }, {} as Record<string, string[]>) : undefined,
    multiple: contentType === 'full-pipeline',
    disabled: contentType === 'url',
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleGenerate = async () => {
    // Validate input based on content type
    if (contentType === 'url' && !urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (contentType === 'image' && generateImage && !imagePrompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }
    if (contentType !== 'url' && !generateImage && uploadedFiles.length === 0) {
      toast.error('Please upload a file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setGeneratedContent(null);

    try {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
        const messages = {
          'document': ['Extracting document content...', 'Analyzing structure...', 'Generating script...'],
          'image': ['Analyzing image...', 'Extracting visual details...', 'Creating narrative...'],
          'audio': ['Transcribing audio...', 'Processing speech...', 'Formatting script...'],
          'url': ['Crawling URL...', 'Extracting content...', 'Generating script...'],
          'full-pipeline': ['Processing sources...', 'Orchestrating pipeline...', 'Synthesizing content...'],
        };
        const typeMessages = messages[contentType] || messages['document'];
        setProgressMessage(typeMessages[Math.floor(Math.random() * typeMessages.length)]);
      }, 700);

      // Simulate API call with tracked timeout
      await new Promise<void>(resolve => {
        simulationTimeoutRef.current = setTimeout(resolve, 3500);
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(100);
      setProgressMessage('Complete!');

      // Create mock generated content
      const sourceName = contentType === 'url' ? urlInput : 
                        contentType === 'image' && generateImage ? 'Generated Image' :
                        uploadedFiles[0]?.file.name || 'Content';
      
      const mockScript = `# Generated ${outputFormat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}

## Source: ${sourceName}
## Tone: ${tone} | Duration: ${Math.floor(duration / 60)} min | Audience: ${targetAudience || 'General'}

---

## Introduction
Welcome to this ${outputFormat.replace('_', ' ')} created from your ${contentType} content.

## Main Content
This is a ${tone} script optimized for ${targetAudience || 'your target audience'}.

Key insights from the source material:
- Point 1: Important information extracted
- Point 2: Supporting details and context
- Point 3: Actionable takeaways

## Conclusion
Thank you for watching. This content was processed using ${selectedProvider === 'auto' ? 'our smart AI selection' : selectedProvider}.

---
Generated by Smart Content Pipeline
`;

      const content: GeneratedContent = {
        script: mockScript,
        title: `Script from ${sourceName}`,
        type: outputFormat as GeneratedContent['type'],
        duration,
        sourceType: contentType === 'full-pipeline' ? 'document' : contentType,
        metadata: {
          wordCount: mockScript.split(/\s+/).length,
          estimatedDuration: duration,
          provider: selectedProvider,
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
    setUploadedFiles([]);
    setUrlInput('');
    setImagePrompt('');
    setGeneratedContent(null);
    setError(null);
    setProgress(0);
  };

  // Handle Full Pipeline completion
  const handlePipelineComplete = (result: { script: string; title: string }) => {
    const content: GeneratedContent = {
      script: result.script,
      title: result.title,
      type: 'video_script',
      duration: duration,
      sourceType: 'document',
      metadata: {
        wordCount: result.script.split(/\s+/).length,
        estimatedDuration: duration,
        provider: selectedProvider,
        timestamp: Date.now(),
      },
    };
    setGeneratedContent(content);
  };

  // Show post-generation actions if we have generated content
  if (generatedContent) {
    return (
      <div className={cn("space-y-6", className)}>
        <PostGenerationActions
          content={generatedContent}
          onAction={handlePostAction}
        />
        <Button variant="outline" onClick={resetPipeline} className="w-full">
          Generate Another Script
        </Button>
      </div>
    );
  }

  // Show Full Pipeline Workflow for full-pipeline content type
  if (contentType === 'full-pipeline') {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Content Type Selector - Always visible for switching */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => handleContentTypeChange(v as ContentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {selectedContentType.icon}
                      <span>{selectedContentType.label}</span>
                      <Badge variant="secondary" className="text-[10px] ml-2">
                        {selectedContentType.description}
                      </Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                          {ct.icon}
                        </div>
                        <div>
                          <div className="font-medium">{ct.label}</div>
                          <div className="text-xs text-muted-foreground">{ct.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <FullPipelineWorkflow
          onComplete={handlePipelineComplete}
          onCancel={() => handleContentTypeChange('document')}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-amber-500/20 bg-gradient-to-br from-background via-background to-amber-500/5">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img src={genieSparkLogo} alt="Genie Spark" className="h-12 w-auto" />
            </div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              AI Engine
            </Badge>
          </div>
          <CardDescription className="mt-2">
            Select content type → Upload → Configure → Generate Script
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Content Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">1. Select Content Type</Label>
            <Select value={contentType} onValueChange={(v) => handleContentTypeChange(v as ContentType)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {selectedContentType.icon}
                    <span>{selectedContentType.label}</span>
                    <Badge variant="secondary" className="text-[10px] ml-2">
                      {selectedContentType.description}
                    </Badge>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((ct) => (
                  <SelectItem key={ct.id} value={ct.id}>
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                        {ct.icon}
                      </div>
                      <div>
                        <div className="font-medium">{ct.label}</div>
                        <div className="text-xs text-muted-foreground">{ct.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Step 2: Upload/Input based on content type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">2. {contentType === 'url' ? 'Enter URL' : contentType === 'image' ? 'Upload or Generate Image' : 'Upload File'}</Label>
            
            {/* URL Input */}
            {contentType === 'url' && (
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com/article or document URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  We'll extract content from web pages, articles, or online documents
                </p>
              </div>
            )}

            {/* Image: Toggle between upload and generate */}
            {contentType === 'image' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={!generateImage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGenerateImage(false)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Image
                  </Button>
                  <Button
                    variant={generateImage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGenerateImage(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Generate Image
                  </Button>
                </div>

                {generateImage ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Describe the image you want to generate..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <ImageModelSelector
                      selectedModel={selectedImageModel}
                      onModelChange={setSelectedImageModel}
                      showLabel={true}
                    />
                  </div>
                ) : (
                  <UploadZone 
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    isDragActive={isDragActive}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={removeFile}
                    acceptedTypes={selectedContentType.description}
                    isImage
                  />
                )}
              </div>
            )}

            {/* Document, Audio: File Upload */}
            {(contentType === 'document' || contentType === 'audio') && (
              <UploadZone 
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                uploadedFiles={uploadedFiles}
                onRemoveFile={removeFile}
                acceptedTypes={selectedContentType.description}
                isMultiple={false}
              />
            )}
          </div>

          <Separator />

          {/* Step 3: AI Provider Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">3. AI Provider</Label>
            <AIProviderSelector
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              contentType={contentType}
              showLabel={false}
            />
            
            {/* Knowledge Search Enhancement Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="knowledge-search-toggle">
                    Knowledge Search Enhancement
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-enhance script with relevant knowledge base content
                  </p>
                </div>
              </div>
              <Switch
                id="knowledge-search-toggle"
                checked={enableKnowledgeSearch}
                onCheckedChange={setEnableKnowledgeSearch}
              />
            </div>
          </div>

          <Separator />

          {/* Step 4: Output Options */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">4. Output Options</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Output Format */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Script Type</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedContentType.outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          {format.icon}
                          {format.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tone</Label>
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

              {/* Duration */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Target Audience</Label>
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

// Upload Zone Component
interface UploadZoneProps {
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
  uploadedFiles: DetectedFile[];
  onRemoveFile: (index: number) => void;
  acceptedTypes: string;
  isImage?: boolean;
  isMultiple?: boolean;
}

function UploadZone({ 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  uploadedFiles, 
  onRemoveFile, 
  acceptedTypes,
  isImage,
  isMultiple 
}: UploadZoneProps) {
  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border hover:border-primary/50",
          uploadedFiles.length > 0 && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            isDragActive ? "bg-primary/10" : "bg-secondary"
          )}>
            <Upload className={cn(
              "h-6 w-6",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium text-sm">
              {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {acceptedTypes} {isMultiple && '(multiple files allowed)'}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {uploadedFiles.map((df, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg border bg-secondary/30"
            >
              {isImage && df.preview ? (
                <img 
                  src={df.preview} 
                  alt={df.file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{df.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(df.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
