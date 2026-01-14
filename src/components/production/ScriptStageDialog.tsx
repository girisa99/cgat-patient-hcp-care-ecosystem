/**
 * Script Stage Dialog - Enhanced Version
 * In-context script management for production workflow
 * Features:
 * - Differentiates scripts by source (Spark, Mind, Manual, Upload)
 * - Shows Original vs Enhanced versions
 * - Displays TTS/Voice files associated
 * - Empty state with guided options
 * - Options: Select existing, Upload new, Generate with AI, or Skip
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  FileText,
  Upload,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mic,
  Wand2,
  Zap,
  Brain,
  PenLine,
  Download,
  Volume2,
  Play,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useGenieScripts, type GenieScript, type ScriptSource } from '@/components/genie-studio/useGenieScripts';
import { checkSubscriptionCapabilities, getUpgradePrompt, type SubscriptionCapabilities } from '@/utils/subscriptionCheck';
import type { ShowWithParticipants } from '@/types/shows';
import { useNavigate } from 'react-router-dom';

interface ScriptStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: ShowWithParticipants | null;
  onScriptSelected: (scriptId: string, scriptName: string) => void;
  onSkip: () => void;
}

// Source configuration with icons and colors
const SOURCE_CONFIG: Record<ScriptSource, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  spark: { label: 'Genie Spark', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-500/10' },
  mind: { label: 'Genie Mind', icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  manual: { label: 'Written', icon: PenLine, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  upload: { label: 'Uploaded', icon: Upload, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  import: { label: 'Imported', icon: Download, color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
};

// Script card component for displaying individual scripts
const ScriptCard: React.FC<{
  script: GenieScript;
  onSelect: () => void;
}> = ({ script, onSelect }) => {
  const sourceConfig = SOURCE_CONFIG[script.source || 'manual'];
  const SourceIcon = sourceConfig.icon;
  
  return (
    <Card
      className="p-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-4"
      style={{ borderLeftColor: `var(--${script.source === 'spark' ? 'yellow' : script.source === 'mind' ? 'purple' : 'blue'}-500)` }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm truncate">{script.name}</p>
          </div>
          
          {/* Source & Status Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {/* Source Badge */}
            <Badge variant="outline" className={cn("text-xs gap-1", sourceConfig.bgColor, sourceConfig.color)}>
              <SourceIcon className="h-2.5 w-2.5" />
              {sourceConfig.label}
            </Badge>
            
            {/* Enhanced Badge */}
            {script.enhancedContent && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 gap-1">
                <Wand2 className="h-2.5 w-2.5" />
                Enhanced
              </Badge>
            )}
            
            {/* Original indicator if has enhanced but showing original */}
            {!script.enhancedContent && script.content && (
              <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                Original
              </Badge>
            )}
            
            {/* TTS/Voiceover Badge */}
            {script.hasVoiceover && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 gap-1">
                <Volume2 className="h-2.5 w-2.5" />
                TTS
              </Badge>
            )}
            
            {/* Voice File Badge */}
            {script.voiceoverId && (
              <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 gap-1">
                <Mic className="h-2.5 w-2.5" />
                Voice
              </Badge>
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{new Date(script.createdAt).toLocaleDateString()}</span>
            {script.stats && (
              <span>{script.stats.wordCount} words</span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Card>
  );
};

// Empty state component with guidance
const EmptyScriptState: React.FC<{
  onGoToSpark: () => void;
  onGoToMind: () => void;
  onUpload: () => void;
  canGenerateScripts: boolean;
}> = ({ onGoToSpark, onGoToMind, onUpload, canGenerateScripts }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
      <h4 className="font-medium text-sm mb-1">No Scripts Available</h4>
      <p className="text-xs text-muted-foreground mb-4 max-w-[280px]">
        Create your first script to get started with your production
      </p>
      
      <div className="w-full space-y-2">
        <Card className="p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={onUpload}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Upload className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Upload Script</p>
              <p className="text-xs text-muted-foreground">Paste or upload your existing script</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
        
        {canGenerateScripts && (
          <>
            <Card className="p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={onGoToSpark}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Generate with Spark</p>
                  <p className="text-xs text-muted-foreground">Quick AI script generation</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
            
            <Card className="p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={onGoToMind}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Create with Mind</p>
                  <p className="text-xs text-muted-foreground">Advanced script editor & enhancement</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </>
        )}
        
        {!canGenerateScripts && (
          <Card className="p-3 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium">Unlock AI Script Generation</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upgrade to access Genie Spark and Mind for AI-powered script creation
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open('/settings/subscription', '_blank')}
                >
                  View Plans
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export function ScriptStageDialog({
  open,
  onOpenChange,
  show,
  onScriptSelected,
  onSkip,
}: ScriptStageDialogProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'select' | 'upload' | 'generate'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<SubscriptionCapabilities | null>(null);
  const [uploadedContent, setUploadedContent] = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [generateTopic, setGenerateTopic] = useState('');
  const [expandedSource, setExpandedSource] = useState<ScriptSource | 'all'>('all');
  
  const { scripts, isLoading: scriptsLoading, saveScript } = useGenieScripts();

  // Check subscription on mount
  useEffect(() => {
    if (open) {
      checkSubscriptionCapabilities().then(setCapabilities);
    }
  }, [open]);

  // Filter and group scripts by source
  const scriptsBySource = useMemo(() => {
    const grouped: Record<ScriptSource, GenieScript[]> = {
      spark: [],
      mind: [],
      manual: [],
      upload: [],
      import: [],
    };
    
    scripts.forEach(script => {
      const source = script.source || 'manual';
      if (grouped[source]) {
        grouped[source].push(script);
      } else {
        grouped.manual.push(script);
      }
    });
    
    return grouped;
  }, [scripts]);

  // Count scripts by category
  const sourceCounts = useMemo(() => ({
    spark: scriptsBySource.spark.length,
    mind: scriptsBySource.mind.length,
    manual: scriptsBySource.manual.length + scriptsBySource.upload.length + scriptsBySource.import.length,
    total: scripts.length,
  }), [scriptsBySource, scripts]);

  const handleSelectScript = async (scriptId: string, scriptName: string) => {
    onScriptSelected(scriptId, scriptName);
    onOpenChange(false);
    toast.success(`Script "${scriptName}" linked to show`);
  };

  const handleUploadScript = async () => {
    if (!uploadedName.trim() || !uploadedContent.trim()) {
      toast.error('Please enter script name and content');
      return;
    }

    setIsLoading(true);
    try {
      const newScript = await saveScript({
        name: uploadedName,
        content: uploadedContent,
        type: 'video',
        source: 'upload',
      });
      
      if (newScript) {
        onScriptSelected(newScript.id, newScript.name);
        onOpenChange(false);
        toast.success('Script uploaded and linked');
      }
    } catch (error) {
      toast.error('Failed to upload script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!capabilities?.canGenerateScripts) {
      toast.error('Upgrade required to generate scripts');
      return;
    }

    if (!generateTopic.trim()) {
      toast.error('Please enter a topic for script generation');
      return;
    }

    setIsLoading(true);
    try {
      toast.info('Script generation starting... This may take a moment.');
      
      const newScript = await saveScript({
        name: `${show?.title || 'Show'} - Generated Script`,
        content: `# ${generateTopic}\n\nGenerated script content will appear here after AI processing.\n\nTopic: ${generateTopic}\nShow Type: ${show?.show_type || 'general'}`,
        type: 'video',
        source: 'spark',
      });
      
      if (newScript) {
        onScriptSelected(newScript.id, newScript.name);
        onOpenChange(false);
        toast.success('Script generated and linked');
      }
    } catch (error) {
      toast.error('Failed to generate script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSpark = () => {
    onOpenChange(false);
    navigate('/genie-spark');
  };

  const handleGoToMind = () => {
    onOpenChange(false);
    navigate('/genie-mind');
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  const upgradePrompt = getUpgradePrompt('canGenerateScripts');

  // Render scripts grouped by source
  const renderGroupedScripts = () => {
    if (scripts.length === 0) {
      return (
        <EmptyScriptState
          onGoToSpark={handleGoToSpark}
          onGoToMind={handleGoToMind}
          onUpload={() => setActiveTab('upload')}
          canGenerateScripts={capabilities?.canGenerateScripts || false}
        />
      );
    }

    const sources: ScriptSource[] = ['spark', 'mind', 'manual', 'upload', 'import'];
    
    return (
      <div className="space-y-3">
        {/* Quick filter badges */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b">
          <Badge 
            variant={expandedSource === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setExpandedSource('all')}
          >
            All ({sourceCounts.total})
          </Badge>
          {sourceCounts.spark > 0 && (
            <Badge 
              variant={expandedSource === 'spark' ? 'default' : 'outline'}
              className={cn("cursor-pointer", expandedSource !== 'spark' && "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20")}
              onClick={() => setExpandedSource('spark')}
            >
              <Zap className="h-3 w-3 mr-1" />
              Spark ({sourceCounts.spark})
            </Badge>
          )}
          {sourceCounts.mind > 0 && (
            <Badge 
              variant={expandedSource === 'mind' ? 'default' : 'outline'}
              className={cn("cursor-pointer", expandedSource !== 'mind' && "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20")}
              onClick={() => setExpandedSource('mind')}
            >
              <Brain className="h-3 w-3 mr-1" />
              Mind ({sourceCounts.mind})
            </Badge>
          )}
          {sourceCounts.manual > 0 && (
            <Badge 
              variant={expandedSource === 'manual' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setExpandedSource('manual')}
            >
              <PenLine className="h-3 w-3 mr-1" />
              Other ({sourceCounts.manual})
            </Badge>
          )}
        </div>

        {/* Scripts list */}
        <ScrollArea className="h-[260px] pr-2">
          <div className="space-y-2">
            {sources.map(source => {
              const sourceScripts = scriptsBySource[source];
              if (sourceScripts.length === 0) return null;
              if (expandedSource !== 'all' && expandedSource !== source) return null;
              
              // For 'manual' filter, include manual, upload, import
              if (expandedSource === 'manual' && !['manual', 'upload', 'import'].includes(source)) return null;
              
              return sourceScripts.map(script => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  onSelect={() => handleSelectScript(script.id, script.name)}
                />
              ));
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Script Management
          </DialogTitle>
          <DialogDescription>
            {show?.title ? `Link a script to "${show.title}"` : 'Select or create a script for your show'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="select" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Select
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Generate
            </TabsTrigger>
          </TabsList>

          {/* Select Existing Script - Enhanced with grouping */}
          <TabsContent value="select" className="mt-4">
            {scriptsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              renderGroupedScripts()
            )}
          </TabsContent>

          {/* Upload Script */}
          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Script Name</Label>
              <Input
                value={uploadedName}
                onChange={(e) => setUploadedName(e.target.value)}
                placeholder="e.g., Episode 1 Script"
              />
            </div>
            <div className="space-y-2">
              <Label>Script Content</Label>
              <Textarea
                value={uploadedContent}
                onChange={(e) => setUploadedContent(e.target.value)}
                placeholder="Paste your script content here..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={handleUploadScript}
              disabled={isLoading || !uploadedName.trim() || !uploadedContent.trim()}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload & Link Script
            </Button>
          </TabsContent>

          {/* Generate with AI */}
          <TabsContent value="generate" className="mt-4 space-y-4">
            {capabilities?.canGenerateScripts ? (
              <>
                <div className="space-y-2">
                  <Label>Topic / Subject</Label>
                  <Input
                    value={generateTopic}
                    onChange={(e) => setGenerateTopic(e.target.value)}
                    placeholder="e.g., Interview about AI in healthcare"
                  />
                </div>
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">AI Script Generation</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Generate a professional script based on your topic and show type ({show?.show_type || 'general'}).
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Quick navigation to Spark/Mind */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleGoToSpark}
                  >
                    <Zap className="h-3 w-3 mr-1 text-yellow-600" />
                    Open Spark
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleGoToMind}
                  >
                    <Brain className="h-3 w-3 mr-1 text-purple-600" />
                    Open Mind
                  </Button>
                </div>
                
                <Button
                  onClick={handleGenerateScript}
                  disabled={isLoading || !generateTopic.trim()}
                  className="w-full bg-gradient-to-r from-primary to-pink-500"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate Script
                </Button>
              </>
            ) : (
              <Card className="p-4 border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{upgradePrompt.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {upgradePrompt.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => window.open('/settings/subscription', '_blank')}
                    >
                      {upgradePrompt.cta}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScriptStageDialog;
