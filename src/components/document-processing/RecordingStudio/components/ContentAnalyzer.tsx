/**
 * Content Analyzer Component - Sends recordings/imports to Mind for AI analysis
 * Enables the bidirectional Vibe → Mind → Vibe workflow
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  FileText, 
  Video, 
  Image, 
  Globe, 
  ArrowRight, 
  Brain,
  Wand2,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Mic,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import Mind logo for visual branding
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';

interface ContentToAnalyze {
  type: 'recording' | 'ppt' | 'pdf' | 'url' | 'image';
  name: string;
  source?: string; // URL or blob URL
  thumbnail?: string;
  metadata?: Record<string, any>;
}

interface AnalysisResult {
  script: {
    title: string;
    content: string;
    estimatedDuration: number;
  };
  suggestions: string[];
  keywords: string[];
}

interface ContentAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  content?: ContentToAnalyze;
  onScriptGenerated: (script: { title: string; content: string }) => void;
  onRequestTTS?: (scriptContent: string) => void;
  className?: string;
}

type AnalysisStage = 'select' | 'analyzing' | 'result' | 'generating-tts';

export function ContentAnalyzer({
  isOpen,
  onClose,
  content,
  onScriptGenerated,
  onRequestTTS,
  className
}: ContentAnalyzerProps) {
  const [stage, setStage] = useState<AnalysisStage>('select');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editedScript, setEditedScript] = useState('');
  const [selectedOutputs, setSelectedOutputs] = useState<Set<string>>(new Set(['script']));

  const contentTypeLabels: Record<ContentToAnalyze['type'], string> = {
    recording: 'Screen Recording',
    ppt: 'PowerPoint',
    pdf: 'PDF Document',
    url: 'Web Page',
    image: 'Image'
  };

  const contentTypeIcons: Record<ContentToAnalyze['type'], React.ReactNode> = {
    recording: <Video className="h-5 w-5" />,
    ppt: <FileText className="h-5 w-5" />,
    pdf: <FileText className="h-5 w-5" />,
    url: <Globe className="h-5 w-5" />,
    image: <Image className="h-5 w-5" />
  };

  const handleAnalyze = async () => {
    if (!content) return;
    
    setStage('analyzing');
    setAnalysisProgress(0);

    // Simulate analysis progress (in real implementation, this would be actual AI processing)
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // TODO: Replace with actual AI analysis call
      // This would call the documentToScriptService or imageToScriptService
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Mock result - in production this comes from AI
      const mockResult: AnalysisResult = {
        script: {
          title: `Script for ${content.name}`,
          content: `[Generated script based on ${content.type} analysis]\n\nThis is an AI-generated script that describes the key points from your ${contentTypeLabels[content.type].toLowerCase()}.\n\n1. Introduction to the topic\n2. Main concepts covered\n3. Key takeaways\n4. Conclusion and call to action\n\n[This would be replaced with actual AI-generated content based on the ${content.type} analysis]`,
          estimatedDuration: 3.5
        },
        suggestions: [
          'Add a hook at the beginning to capture attention',
          'Include transition phrases between sections',
          'End with a clear call-to-action'
        ],
        keywords: ['tutorial', 'walkthrough', 'guide', 'explanation']
      };

      setResult(mockResult);
      setEditedScript(mockResult.script.content);
      setStage('result');
      
      toast.success('Content analyzed! Script generated successfully.');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
      setStage('select');
    }
  };

  const handleUseScript = () => {
    if (!result) return;

    onScriptGenerated({
      title: result.script.title,
      content: editedScript
    });

    // If TTS is selected, also trigger TTS generation
    if (selectedOutputs.has('tts') && onRequestTTS) {
      onRequestTTS(editedScript);
    }

    toast.success('Script added to your library!');
    handleClose();
  };

  const handleClose = () => {
    setStage('select');
    setAnalysisProgress(0);
    setResult(null);
    setEditedScript('');
    setSelectedOutputs(new Set(['script']));
    onClose();
  };

  const toggleOutput = (output: string) => {
    setSelectedOutputs(prev => {
      const next = new Set(prev);
      if (next.has(output)) {
        next.delete(output);
      } else {
        next.add(output);
      }
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("max-w-2xl", className)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden p-0.5">
              <img src={genieMindLogo} alt="Genie Mind" className="h-full w-full object-contain rounded" />
            </div>
            <div>
              <DialogTitle className="text-xl">Analyze with Genie Mind</DialogTitle>
              <DialogDescription>
                AI-powered content analysis for script generation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stage: Select/Confirm Content */}
        {stage === 'select' && content && (
          <div className="space-y-6 py-4">
            {/* Content Preview */}
            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {contentTypeIcons[content.type]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{content.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {contentTypeLabels[content.type]}
                  </p>
                  {content.source && (
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                      {content.source}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0">
                  Ready to analyze
                </Badge>
              </div>
            </div>

            {/* What AI Will Do */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">What Genie Mind will do:</h4>
              <div className="grid gap-2">
                {[
                  { icon: Brain, label: 'Analyze visual and text content' },
                  { icon: FileText, label: 'Generate a narration script' },
                  { icon: Sparkles, label: 'Suggest improvements' },
                  { icon: Wand2, label: 'Optimize for voiceover' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Generate outputs:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'script', label: 'Script', icon: FileText, always: true },
                  { id: 'tts', label: 'TTS Audio', icon: Mic },
                  { id: 'music', label: 'Background Music', icon: Music }
                ].map((output) => (
                  <Button
                    key={output.id}
                    variant={selectedOutputs.has(output.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => !output.always && toggleOutput(output.id)}
                    disabled={output.always}
                    className="gap-2"
                  >
                    <output.icon className="h-4 w-4" />
                    {output.label}
                    {selectedOutputs.has(output.id) && <CheckCircle2 className="h-3 w-3" />}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stage: Analyzing */}
        {stage === 'analyzing' && (
          <div className="py-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Genie Mind is analyzing...</h3>
                <p className="text-sm text-muted-foreground">
                  Extracting content and generating your script
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {analysisProgress < 30 && "Extracting content..."}
                {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing structure..."}
                {analysisProgress >= 60 && analysisProgress < 90 && "Generating script..."}
                {analysisProgress >= 90 && "Finalizing..."}
              </p>
            </div>
          </div>
        )}

        {/* Stage: Result */}
        {stage === 'result' && result && (
          <div className="space-y-4 py-2">
            <Tabs defaultValue="script" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="script">Generated Script</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="script" className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{result.script.title}</h4>
                    <Badge variant="secondary">
                      ~{result.script.estimatedDuration.toFixed(1)} min
                    </Badge>
                  </div>
                  <Textarea
                    value={editedScript}
                    onChange={(e) => setEditedScript(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Edit your script here..."
                  />
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions" className="mt-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion, i) => (
                      <div 
                        key={i}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Flow indicator */}
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-primary/20">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Mind</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Script</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Video className="h-4 w-4 text-pink-500" />
              <span className="text-xs text-muted-foreground">Vibe</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {stage === 'select' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAnalyze}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze with Mind
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
          
          {stage === 'analyzing' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          
          {stage === 'result' && (
            <>
              <Button variant="outline" onClick={() => setStage('select')}>
                Start Over
              </Button>
              <Button 
                onClick={handleUseScript}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Use Script in Vibe
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
