/**
 * IMAGE TO SCRIPT PANEL - Phase 1 Frontend
 * UI for generating/uploading images and converting to scripts
 * Uses imageToScriptService backend service
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Image as ImageIcon, 
  Upload, 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download,
  Play,
  Clock,
  Sparkles,
  Film,
  Mic,
  Eye,
  RefreshCw,
  Link
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { 
  imageToScriptService, 
  ImageToScriptRequest, 
  ImageToScriptResult,
  ImageProvider,
  ScriptStyle
} from '@/services/imageToScriptService';

interface ImageToScriptPanelProps {
  onScriptGenerated?: (script: ImageToScriptResult['script']) => void;
  className?: string;
}

const IMAGE_PROVIDERS: { value: ImageProvider; label: string; description: string }[] = [
  { value: 'gemini', label: 'Gemini Imagen', description: 'High quality, fast generation' },
  { value: 'openai', label: 'DALL-E 3', description: 'Photorealistic, detailed images' },
  { value: 'replicate', label: 'Flux/Stable Diffusion', description: 'Versatile, many styles' },
  { value: 'huggingface', label: 'Hugging Face', description: 'Open models, experimental' },
];

const SCRIPT_STYLES: { value: ScriptStyle; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'narration', label: 'Narration', icon: <Mic className="h-4 w-4" />, description: 'Voice-over style narration' },
  { value: 'presentation', label: 'Presentation', icon: <Play className="h-4 w-4" />, description: 'Presentation with slides' },
  { value: 'documentary', label: 'Documentary', icon: <Film className="h-4 w-4" />, description: 'Documentary storytelling' },
  { value: 'commercial', label: 'Commercial', icon: <Sparkles className="h-4 w-4" />, description: 'Advertisement style' },
  { value: 'educational', label: 'Educational', icon: <Eye className="h-4 w-4" />, description: 'Teaching & explaining' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'informative', label: 'Informative' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
];

export function ImageToScriptPanel({ onScriptGenerated, className }: ImageToScriptPanelProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'upload' | 'url'>('generate');
  
  // Image generation
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageProvider, setImageProvider] = useState<ImageProvider>('gemini');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  
  // Script options
  const [scriptStyle, setScriptStyle] = useState<ScriptStyle>('narration');
  const [tone, setTone] = useState('professional');
  const [duration, setDuration] = useState(60);
  const [targetAudience, setTargetAudience] = useState('');
  
  // Timer ref for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timer and object URLs on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Revoke any object URLs to prevent memory leaks
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<ImageToScriptResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedImage(file);
      setUploadedImageUrl(URL.createObjectURL(file));
      toast.success(`Image uploaded: ${file.name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxFiles: 1,
  });

  const handleGenerate = async () => {
    // Validate input
    if (activeTab === 'generate' && !imagePrompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }
    if (activeTab === 'upload' && !uploadedImage) {
      toast.error('Please upload an image');
      return;
    }
    if (activeTab === 'url' && !existingImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting...');
    setResult(null);

    try {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
        const messages = activeTab === 'generate' 
          ? ['Generating image...', 'Analyzing composition...', 'Creating script...', 'Enhancing content...']
          : ['Analyzing image...', 'Extracting details...', 'Generating script...', 'Finalizing...'];
        setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 1000);

      const request: ImageToScriptRequest = {
        imagePrompt: activeTab === 'generate' ? imagePrompt : `Analyze this image: ${uploadedImage?.name || existingImageUrl}`,
        imageProvider: activeTab === 'generate' ? imageProvider : undefined,
        scriptStyle,
        duration,
        tone: tone as any,
        targetAudience: targetAudience || undefined,
        existingImageUrl: activeTab === 'url' ? existingImageUrl : activeTab === 'upload' ? uploadedImageUrl : undefined,
      };

      const generationResult = await imageToScriptService.generateImageAndScript(request);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(100);
      setProgressMessage('Complete!');
      setResult(generationResult);

      if (generationResult.success && generationResult.script) {
        toast.success('Script generated successfully!');
        onScriptGenerated?.(generationResult.script);
      } else {
        toast.error(generationResult.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('An error occurred during generation');
      setResult({ success: false, error: 'Generation failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyScriptToClipboard = () => {
    if (result?.script) {
      const scriptText = result.script.segments.map(seg => 
        `[${seg.type.toUpperCase()}]\n${seg.text}\n${seg.visualNotes ? `Visual: ${seg.visualNotes}` : ''}`
      ).join('\n\n');
      navigator.clipboard.writeText(scriptText);
      toast.success('Script copied to clipboard');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Image to Script
          </CardTitle>
          <CardDescription>
            Generate images or upload existing ones to create production-ready scripts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Method Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="mt-4 space-y-4">
              {/* Image Prompt */}
              <div className="space-y-2">
                <Label>Image Prompt</Label>
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <Label>Image Provider</Label>
                <div className="grid grid-cols-2 gap-3">
                  {IMAGE_PROVIDERS.map((provider) => (
                    <button
                      key={provider.value}
                      onClick={() => setImageProvider(provider.value)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        imageProvider === provider.value
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium text-sm">{provider.label}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {provider.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  uploadedImage && "border-green-500 bg-green-50 dark:bg-green-950/20"
                )}
              >
                <input {...getInputProps()} />
                {uploadedImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <img 
                      src={uploadedImageUrl} 
                      alt="Uploaded" 
                      className="max-h-48 rounded-lg object-contain"
                    />
                    <div className="text-center">
                      <p className="font-medium">{uploadedImage.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setUploadedImage(null); 
                        setUploadedImageUrl('');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">
                      {isDragActive ? 'Drop the image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, WebP, GIF
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={existingImageUrl}
                  onChange={(e) => setExistingImageUrl(e.target.value)}
                />
              </div>
              
              {existingImageUrl && (
                <div className="rounded-lg border p-4">
                  <img 
                    src={existingImageUrl} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg object-contain mx-auto"
                    onError={() => toast.error('Could not load image from URL')}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Script Style Selection */}
          <div className="space-y-3">
            <Label>Script Style</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {SCRIPT_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setScriptStyle(style.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    scriptStyle === style.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {style.icon}
                    <span className="font-medium text-sm">{style.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Duration: {duration}s</Label>
              <Slider
                value={[duration]}
                onValueChange={([v]) => setDuration(v)}
                min={15}
                max={300}
                step={15}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input
                placeholder="e.g., Marketing teams..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
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
                {activeTab === 'generate' ? 'Generating...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                {activeTab === 'generate' ? 'Generate Image & Script' : 'Analyze & Generate Script'}
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
        </CardContent>
      </Card>

      {/* Result Section */}
      {result && (
        <Card className={cn(result.success ? "border-green-500/50" : "border-red-500/50")}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {result.success ? 'Script Generated' : 'Generation Failed'}
              </div>
              {result.success && result.script && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(result.script.totalDuration)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                {/* Generated Image */}
                {result.imageUrl && (
                  <div className="rounded-lg border p-4 bg-muted/30">
                    <img 
                      src={result.imageUrl} 
                      alt="Generated" 
                      className="max-h-64 rounded-lg object-contain mx-auto"
                    />
                    {result.imageDescription && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {result.imageDescription}
                      </p>
                    )}
                  </div>
                )}

                {/* Script */}
                {result.script && (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg">{result.script.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {result.script.segments.length} segments
                      </p>
                    </div>

                    <ScrollArea className="h-[250px] rounded-lg border p-4">
                      <div className="space-y-4">
                        {result.script.segments.map((segment, idx) => (
                          <div key={segment.id} className="space-y-2 pb-4 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="capitalize">
                                {segment.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(segment.duration)}
                              </span>
                            </div>
                            <p className="text-sm">{segment.text}</p>
                            {segment.visualNotes && (
                              <p className="text-xs text-muted-foreground italic">
                                📹 {segment.visualNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={copyScriptToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Script
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={() => onScriptGenerated?.(result.script!)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Use Script
                      </Button>
                      <Button variant="ghost" onClick={() => { setResult(null); setProgress(0); }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </>
                )}

                {/* Metadata */}
                {result.metadata && (
                  <div className="text-xs text-muted-foreground flex gap-4">
                    <span>Processing: {(result.metadata.processingTime / 1000).toFixed(1)}s</span>
                    <span>Image: {result.metadata.imageProvider}</span>
                    <span>AI: {result.metadata.aiProvider}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-muted-foreground">{result.error || 'An error occurred'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
