/**
 * URL TO SCRIPT PANEL - Phase 1 Frontend (P0-9)
 * UI for scraping web URLs and converting to production-ready scripts
 * Uses urlToScriptService backend service with Universal AI
 */

import React, { useState, useCallback } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Link, 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download,
  Play,
  Clock,
  Globe,
  FileText,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  urlToScriptService, 
  UrlToScriptRequest, 
  UrlToScriptResult,
  ScriptOutputFormat
} from '@/services/urlToScriptService';

interface UrlToScriptPanelProps {
  onScriptGenerated?: (script: UrlToScriptResult['script']) => void;
  className?: string;
}

const OUTPUT_FORMATS: { value: ScriptOutputFormat; label: string; description: string }[] = [
  { value: 'video_script', label: 'Video Script', description: 'For video productions' },
  { value: 'podcast_script', label: 'Podcast Script', description: 'For audio podcasts' },
  { value: 'presentation_script', label: 'Presentation', description: 'For slide decks' },
  { value: 'tutorial_script', label: 'Tutorial', description: 'For how-to content' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'dramatic', label: 'Dramatic' },
];

const AI_PROVIDERS = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
];

export function UrlToScriptPanel({ onScriptGenerated, className }: UrlToScriptPanelProps) {
  // URL inputs
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [additionalUrls, setAdditionalUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  
  // Options
  const [outputFormat, setOutputFormat] = useState<ScriptOutputFormat>('video_script');
  const [tone, setTone] = useState('professional');
  const [duration, setDuration] = useState(120);
  const [targetAudience, setTargetAudience] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'gemini'>('gemini');
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);
  const [enhanceWithAI, setEnhanceWithAI] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<UrlToScriptResult | null>(null);

  const addAdditionalUrl = useCallback(() => {
    if (newUrl.trim() && additionalUrls.length < 5) {
      try {
        new URL(newUrl);
        setAdditionalUrls(prev => [...prev, newUrl.trim()]);
        setNewUrl('');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  }, [newUrl, additionalUrls]);

  const removeAdditionalUrl = useCallback((index: number) => {
    setAdditionalUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleConvert = async () => {
    if (!primaryUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!validateUrl(primaryUrl)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting...');
    setResult(null);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
        const messages = [
          'Crawling URL content...',
          'Extracting key information...',
          'Analyzing content structure...',
          'Generating script...',
          'Enhancing with AI...',
        ];
        setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 1000);

      const request: UrlToScriptRequest = {
        url: primaryUrl,
        additionalUrls: additionalUrls.length > 0 ? additionalUrls : undefined,
        outputFormat,
        duration,
        tone: tone as any,
        targetAudience: targetAudience || undefined,
        aiProvider,
        useKnowledgeBase,
        enhanceWithAI,
        includeImages,
      };

      const conversionResult = await urlToScriptService.convertUrlToScript(request);

      clearInterval(progressInterval);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            URL to Script
          </CardTitle>
          <CardDescription>
            Convert web content to production-ready scripts using Universal AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary URL */}
          <div className="space-y-2">
            <Label>Primary URL *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/article"
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
                className="flex-1"
              />
              {primaryUrl && validateUrl(primaryUrl) && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={primaryUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Additional URLs */}
          <div className="space-y-2">
            <Label>Additional URLs (Optional - up to 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/another-article"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAdditionalUrl()}
                disabled={additionalUrls.length >= 5}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={addAdditionalUrl}
                disabled={additionalUrls.length >= 5 || !newUrl.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {additionalUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {additionalUrls.map((url, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    <span className="max-w-[200px] truncate">{new URL(url).hostname}</span>
                    <button onClick={() => removeAdditionalUrl(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  <span className="font-medium text-sm">{format.label}</span>
                  <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
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
                  {AI_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
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
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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
                  <SelectItem value="60">1 min</SelectItem>
                  <SelectItem value="120">2 min</SelectItem>
                  <SelectItem value="180">3 min</SelectItem>
                  <SelectItem value="300">5 min</SelectItem>
                  <SelectItem value="600">10 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input
                placeholder="e.g., Professionals"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
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
                id="images" 
                checked={includeImages} 
                onCheckedChange={(c) => setIncludeImages(!!c)} 
              />
              <Label htmlFor="images" className="text-sm cursor-pointer">
                Extract Images
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="rag" 
                checked={useKnowledgeBase} 
                onCheckedChange={(c) => setUseKnowledgeBase(!!c)} 
              />
              <Label htmlFor="rag" className="text-sm cursor-pointer">
                Use Knowledge Base
              </Label>
            </div>
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={isProcessing || !primaryUrl.trim()}
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
                Generate Script from URL
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
            {result.success && result.script ? (
              <div className="space-y-4">
                {/* Source Info */}
                {result.crawledContent && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{result.crawledContent.title}</span>
                    </div>
                    <a 
                      href={result.crawledContent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      {result.crawledContent.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Script Scenes */}
                <ScrollArea className="h-[300px] rounded-lg border p-4">
                  {result.script.scenes.map((scene, index) => (
                    <div 
                      key={scene.id} 
                      className={cn(
                        "mb-4 pb-4",
                        index < result.script!.scenes.length - 1 && "border-b"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Scene {scene.sceneNumber}</Badge>
                        <span className="text-xs text-muted-foreground">{scene.duration}s</span>
                      </div>
                      <p className="text-sm mb-2">{scene.narration}</p>
                      {scene.visualDirection && (
                        <p className="text-xs text-muted-foreground italic">
                          📹 {scene.visualDirection}
                        </p>
                      )}
                      {scene.sourceQuote && (
                        <p className="text-xs text-primary/80 mt-1">
                          💬 "{scene.sourceQuote}"
                        </p>
                      )}
                    </div>
                  ))}
                </ScrollArea>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyScriptToClipboard} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Script
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Send to Vibe
                  </Button>
                </div>

                {/* Metadata */}
                {result.metadata && (
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <span>⏱️ {(result.metadata.processingTime / 1000).toFixed(1)}s</span>
                    <span>📝 {result.metadata.wordCount} words</span>
                    <span>🔗 {result.metadata.urlsProcessed} URL(s)</span>
                    <span>🤖 {result.metadata.aiProvider}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-500">{result.error || 'Unknown error occurred'}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UrlToScriptPanel;
