/**
 * DOCUMENT TO SCRIPT PANEL - Phase 1 Frontend
 * UI for uploading documents and converting to production-ready scripts
 * Uses documentToScriptService backend service
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Upload, 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download,
  Play,
  Clock,
  FileType,
  Sparkles,
  BookOpen,
  Film,
  Mic,
  Presentation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { 
  documentToScriptService, 
  DocumentToScriptRequest, 
  DocumentToScriptResult,
  OutputFormat,
  GeneratedScript
} from '@/services/documentToScriptService';
import { ContentSafetyBanner } from './ContentSafetyBanner';

interface DocumentToScriptPanelProps {
  onScriptGenerated?: (script: GeneratedScript) => void;
  className?: string;
}

const OUTPUT_FORMATS: { value: OutputFormat; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" />, description: 'For video productions with visual directions' },
  { value: 'podcast_script', label: 'Podcast Script', icon: <Mic className="h-4 w-4" />, description: 'Conversational format for audio podcasts' },
  { value: 'presentation_script', label: 'Presentation', icon: <Presentation className="h-4 w-4" />, description: 'Slide-by-slide speaker notes' },
  { value: 'webinar_script', label: 'Webinar Script', icon: <BookOpen className="h-4 w-4" />, description: 'Interactive webinar with Q&A sections' },
  { value: 'tutorial_script', label: 'Tutorial Script', icon: <Play className="h-4 w-4" />, description: 'Step-by-step instructional format' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'informative', label: 'Informative' },
];

export function DocumentToScriptPanel({ onScriptGenerated, className }: DocumentToScriptPanelProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'url'>('upload');
  const [documentContent, setDocumentContent] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Options
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('video_script');
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('');
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const [enhanceWithAI, setEnhanceWithAI] = useState(true);
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  
  // Timer ref for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<DocumentToScriptResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      
      // Read file content for text files
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocumentContent(e.target?.result as string || '');
        };
        reader.readAsText(file);
      }
      
      toast.success(`File uploaded: ${file.name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/html': ['.html'],
    },
    maxFiles: 1,
  });

  const handleConvert = async () => {
    // Validate input
    if (activeTab === 'upload' && !uploadedFile && !documentContent) {
      toast.error('Please upload a document or paste content');
      return;
    }
    if (activeTab === 'paste' && !documentContent.trim()) {
      toast.error('Please paste document content');
      return;
    }
    if (activeTab === 'url' && !documentUrl.trim()) {
      toast.error('Please enter a document URL');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting conversion...');
    setResult(null);

    try {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
        const messages = [
          'Extracting content...',
          'Analyzing document structure...',
          'Querying knowledge base...',
          'Generating script...',
          'Enhancing with AI...',
          'Finalizing...',
        ];
        setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 800);

      const request: DocumentToScriptRequest = {
        documentContent: activeTab === 'paste' ? documentContent : undefined,
        documentUrl: activeTab === 'url' ? documentUrl : undefined,
        outputFormat,
        duration,
        includeVisuals,
        includeSpeakerNotes,
        useKnowledgeBase,
        enhanceWithAI,
        tone: tone as any,
        targetAudience: targetAudience || undefined,
      };

      // If file was uploaded, read content
      if (activeTab === 'upload' && uploadedFile) {
        if (uploadedFile.type === 'text/plain' || uploadedFile.name.endsWith('.md')) {
          request.documentContent = documentContent;
        } else {
          // For binary files, we'd need to upload to storage first
          // For now, use the content if available
          request.documentContent = documentContent || `[Content from uploaded file: ${uploadedFile.name}]`;
        }
      }

      const conversionResult = await documentToScriptService.convertDocumentToScript(request);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(100);
      setProgressMessage('Complete!');
      setResult(conversionResult);

      if (conversionResult.success && conversionResult.script) {
        toast.success('Script generated successfully!');
        onScriptGenerated?.(conversionResult.script);
      } else {
        toast.error(conversionResult.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('An error occurred during conversion');
      setResult({ success: false, error: 'Conversion failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyScriptToClipboard = () => {
    if (result?.script) {
      const scriptText = result.script.scenes.map(scene => 
        `[Scene ${scene.sceneNumber}]\n${scene.narration}\n${scene.visualDirection ? `Visual: ${scene.visualDirection}` : ''}`
      ).join('\n\n');
      navigator.clipboard.writeText(scriptText);
      toast.success('Script copied to clipboard');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document to Script
          </CardTitle>
          <CardDescription>
            Upload documents or paste content to generate production-ready scripts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Safety Notice */}
          <ContentSafetyBanner variant="minimal" />

          {/* Input Method Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <FileType className="h-4 w-4" />
                Paste
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  uploadedFile && "border-green-500 bg-green-50 dark:bg-green-950/20"
                )}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, DOCX, PPTX, TXT, MD, HTML
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="paste" className="mt-4">
              <Textarea
                placeholder="Paste your document content here..."
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {documentContent.length} characters • ~{Math.ceil(documentContent.split(/\s+/).length / 150)} min read
              </p>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="space-y-2">
                <Label>Document URL</Label>
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter a direct link to a PDF, DOCX, or web page
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Output Format Selection */}
          <div className="space-y-3">
            <Label>Output Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {OUTPUT_FORMATS.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setOutputFormat(format.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    outputFormat === format.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {format.icon}
                    <span className="font-medium text-sm">{format.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {format.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label>Target Duration</Label>
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
                  <SelectItem value="1800">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience (optional)</Label>
              <Input
                placeholder="e.g., Healthcare professionals, Students..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="useKnowledge" 
                  checked={useKnowledgeBase} 
                  onCheckedChange={(c) => setUseKnowledgeBase(!!c)} 
                />
                <Label htmlFor="useKnowledge" className="text-sm cursor-pointer">
                  Use Knowledge Base (RAG)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="enhance" 
                  checked={enhanceWithAI} 
                  onCheckedChange={(c) => setEnhanceWithAI(!!c)} 
                />
                <Label htmlFor="enhance" className="text-sm cursor-pointer">
                  Enhance with AI
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="visuals" 
                  checked={includeVisuals} 
                  onCheckedChange={(c) => setIncludeVisuals(!!c)} 
                />
                <Label htmlFor="visuals" className="text-sm cursor-pointer">
                  Include Visual Directions
                </Label>
              </div>
            </div>
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(result.script.totalDuration)}
                  </Badge>
                  <Badge variant="outline">
                    {result.script.metadata.wordCount} words
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success && result.script ? (
              <div className="space-y-4">
                {/* Script Title */}
                <div>
                  <h3 className="font-semibold text-lg">{result.script.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.script.scenes.length} scenes • {result.script.format.replace('_', ' ')}
                  </p>
                </div>

                {/* Script Preview */}
                <ScrollArea className="h-[300px] rounded-lg border p-4">
                  <div className="space-y-4">
                    {result.script.scenes.map((scene, idx) => (
                      <div key={scene.id} className="space-y-2 pb-4 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Scene {scene.sceneNumber}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(scene.duration)}
                          </span>
                        </div>
                        <p className="text-sm">{scene.narration}</p>
                        {scene.visualDirection && (
                          <p className="text-xs text-muted-foreground italic">
                            📹 {scene.visualDirection}
                          </p>
                        )}
                        {scene.bRollSuggestions && scene.bRollSuggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {scene.bRollSuggestions.map((br, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {br}
                              </Badge>
                            ))}
                          </div>
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
                </div>

                {/* Metadata */}
                {result.metadata && (
                  <div className="text-xs text-muted-foreground flex gap-4">
                    <span>Processing: {(result.metadata.processingTime / 1000).toFixed(1)}s</span>
                    <span>Provider: {result.metadata.aiProvider}</span>
                    <span>Est. Duration: {formatDuration(result.metadata.estimatedDuration)}</span>
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
