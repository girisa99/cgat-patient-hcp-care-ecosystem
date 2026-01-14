/**
 * Script Stage Dialog
 * In-context script management for production workflow
 * Options: Select existing, Upload new, Generate with AI, or Skip
 */

import React, { useState, useEffect } from 'react';
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
import {
  FileText,
  Upload,
  Sparkles,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mic,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { checkSubscriptionCapabilities, getUpgradePrompt, type SubscriptionCapabilities } from '@/utils/subscriptionCheck';
import type { ShowWithParticipants } from '@/types/shows';

interface ScriptStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: ShowWithParticipants | null;
  onScriptSelected: (scriptId: string, scriptName: string) => void;
  onSkip: () => void;
}

export function ScriptStageDialog({
  open,
  onOpenChange,
  show,
  onScriptSelected,
  onSkip,
}: ScriptStageDialogProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'upload' | 'generate'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<SubscriptionCapabilities | null>(null);
  const [uploadedContent, setUploadedContent] = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [generateTopic, setGenerateTopic] = useState('');
  
  const { scripts, isLoading: scriptsLoading, saveScript } = useGenieScripts();

  // Check subscription on mount
  useEffect(() => {
    if (open) {
      checkSubscriptionCapabilities().then(setCapabilities);
    }
  }, [open]);

  // Filter scripts to user's own
  const availableScripts = scripts || [];

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
      // This would call the AI script generation service
      toast.info('Script generation starting... This may take a moment.');
      
      // For now, create a placeholder - real implementation would use AI
      const newScript = await saveScript({
        name: `${show?.title || 'Show'} - Generated Script`,
        content: `# ${generateTopic}\n\nGenerated script content will appear here after AI processing.\n\nTopic: ${generateTopic}\nShow Type: ${show?.show_type || 'general'}`,
        type: 'video',
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

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  const upgradePrompt = getUpgradePrompt('canGenerateScripts');

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

          {/* Select Existing Script */}
          <TabsContent value="select" className="mt-4">
            <ScrollArea className="h-[280px] pr-2">
              {scriptsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableScripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No scripts available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a script or generate one with AI
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableScripts.map((script) => (
                    <Card
                      key={script.id}
                      className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectScript(script.id, script.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{script.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {script.enhancedContent && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                                <Wand2 className="h-2 w-2 mr-1" />
                                Enhanced
                              </Badge>
                            )}
                            {script.voiceoverId && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                                <Mic className="h-2 w-2 mr-1" />
                                TTS
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(script.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
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
