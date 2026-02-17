/**
 * Script Stage Dialog - Simplified Version
 * PURPOSE: Link an EXISTING script to a production show
 * NOTE: Script GENERATION is in Genie Spark/Mind, not here
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, ChevronRight, Loader2, ExternalLink, Mic, Wand2, Zap, Brain, PenLine, Download, Volume2, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useGenieScripts, type GenieScript, type ScriptSource } from '@/components/genie-studio/useGenieScripts';
import type { ShowWithParticipants } from '@/types/shows';
import { useNavigate } from 'react-router-dom';

interface ScriptStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: ShowWithParticipants | null;
  onScriptSelected: (scriptId: string, scriptName: string) => void;
  onSkip: () => void;
}

const SOURCE_CONFIG: Record<ScriptSource, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  spark: { label: 'Genie Spark', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-500/10' },
  mind: { label: 'Genie Mind', icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  manual: { label: 'Written', icon: PenLine, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  upload: { label: 'Uploaded', icon: Upload, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  import: { label: 'Imported', icon: Download, color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
};

const ScriptCard: React.FC<{ script: GenieScript; onSelect: () => void }> = ({ script, onSelect }) => {
  const sourceConfig = SOURCE_CONFIG[script.source || 'manual'];
  const SourceIcon = sourceConfig.icon;
  
  return (
    <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onSelect}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{script.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className={cn("text-xs gap-1", sourceConfig.bgColor, sourceConfig.color)}>
              <SourceIcon className="h-2.5 w-2.5" />
              {sourceConfig.label}
            </Badge>
            {script.enhancedContent && <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 gap-1"><Wand2 className="h-2.5 w-2.5" />Enhanced</Badge>}
            {script.hasVoiceover && <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 gap-1"><Volume2 className="h-2.5 w-2.5" />TTS</Badge>}
            {script.voiceoverId && <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 gap-1"><Mic className="h-2.5 w-2.5" />Voice</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{new Date(script.createdAt).toLocaleDateString()}</span>
            {script.stats && <span>{script.stats.wordCount} words</span>}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Card>
  );
};

export function ScriptStageDialog({ open, onOpenChange, show, onScriptSelected, onSkip }: ScriptStageDialogProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedContent, setUploadedContent] = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [expandedSource, setExpandedSource] = useState<ScriptSource | 'all'>('all');
  
  const { scripts, isLoading: scriptsLoading, saveScript } = useGenieScripts();

  const scriptsBySource = useMemo(() => {
    const grouped: Record<ScriptSource, GenieScript[]> = { spark: [], mind: [], manual: [], upload: [], import: [] };
    scripts.forEach(script => {
      const source = script.source || 'manual';
      (grouped[source] || grouped.manual).push(script);
    });
    return grouped;
  }, [scripts]);

  const sourceCounts = useMemo(() => ({
    spark: scriptsBySource.spark.length,
    mind: scriptsBySource.mind.length,
    manual: scriptsBySource.manual.length + scriptsBySource.upload.length + scriptsBySource.import.length,
    total: scripts.length,
  }), [scriptsBySource, scripts]);

  const handleSelectScript = (scriptId: string, scriptName: string) => {
    onScriptSelected(scriptId, scriptName);
    onOpenChange(false);
    toast.success(`Script "${scriptName}" linked`);
  };

  const handleUploadScript = async () => {
    if (!uploadedName.trim() || !uploadedContent.trim()) { toast.error('Enter name and content'); return; }
    setIsLoading(true);
    try {
      const newScript = await saveScript({ name: uploadedName, content: uploadedContent, type: 'video', source: 'upload' });
      if (newScript) { onScriptSelected(newScript.id, newScript.name); onOpenChange(false); toast.success('Script uploaded'); }
    } catch { toast.error('Upload failed'); }
    finally { setIsLoading(false); }
  };

  const handleGoToSpark = () => { onOpenChange(false); navigate('/genie-spark'); };
  const handleGoToMind = () => { onOpenChange(false); navigate('/genie-mind'); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Link Script</DialogTitle>
          <DialogDescription>{show?.title ? `Select a script for "${show.title}"` : 'Select or upload a script'}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'select' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select"><FileText className="h-3.5 w-3.5 mr-1.5" />Select Existing</TabsTrigger>
            <TabsTrigger value="upload"><Upload className="h-3.5 w-3.5 mr-1.5" />Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="mt-4">
            {scriptsLoading ? <div className="flex justify-center h-32"><Loader2 className="h-6 w-6 animate-spin" /></div> : scripts.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">No Scripts Yet</p>
                <p className="text-xs text-muted-foreground mb-4">Create in Genie Spark/Mind, then link here</p>
                <div className="space-y-2">
                  <Card className="p-3 cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('upload')}><div className="flex items-center gap-3"><Upload className="h-4 w-4 text-green-600" /><span className="text-sm">Upload Script</span><ArrowRight className="h-4 w-4 ml-auto" /></div></Card>
                  <Card className="p-3 cursor-pointer hover:bg-muted/50" onClick={handleGoToSpark}><div className="flex items-center gap-3"><Zap className="h-4 w-4 text-yellow-600" /><span className="text-sm">Create in Spark</span><ExternalLink className="h-4 w-4 ml-auto" /></div></Card>
                  <Card className="p-3 cursor-pointer hover:bg-muted/50" onClick={handleGoToMind}><div className="flex items-center gap-3"><Brain className="h-4 w-4 text-purple-600" /><span className="text-sm">Create in Mind</span><ExternalLink className="h-4 w-4 ml-auto" /></div></Card>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 pb-2 border-b">
                  <Badge variant={expandedSource === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setExpandedSource('all')}>All ({sourceCounts.total})</Badge>
                  {sourceCounts.spark > 0 && <Badge variant={expandedSource === 'spark' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setExpandedSource('spark')}><Zap className="h-3 w-3 mr-1" />Spark ({sourceCounts.spark})</Badge>}
                  {sourceCounts.mind > 0 && <Badge variant={expandedSource === 'mind' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setExpandedSource('mind')}><Brain className="h-3 w-3 mr-1" />Mind ({sourceCounts.mind})</Badge>}
                </div>
                <ScrollArea className="h-[260px]">
                  <div className="space-y-2">
                    {(['spark', 'mind', 'manual', 'upload', 'import'] as ScriptSource[]).map(source => 
                      scriptsBySource[source].filter(() => expandedSource === 'all' || expandedSource === source || (expandedSource === 'manual' && ['manual','upload','import'].includes(source))).map(script => 
                        <ScriptCard key={script.id} script={script} onSelect={() => handleSelectScript(script.id, script.name)} />
                      )
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-4">
            <Card className="p-3 bg-muted/30"><div className="flex items-start gap-2"><Info className="h-4 w-4 text-muted-foreground mt-0.5" /><p className="text-xs text-muted-foreground">Upload existing script. To <strong>generate</strong> with AI, use <Button variant="link" className="h-auto p-0 text-xs" onClick={handleGoToSpark}>Spark</Button> or <Button variant="link" className="h-auto p-0 text-xs" onClick={handleGoToMind}>Mind</Button>.</p></div></Card>
            <div className="space-y-2"><Label>Script Name</Label><Input value={uploadedName} onChange={(e) => setUploadedName(e.target.value)} placeholder="e.g., Episode 1 Script" /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={uploadedContent} onChange={(e) => setUploadedContent(e.target.value)} placeholder="Paste script..." rows={6} className="font-mono text-sm" /></div>
            <Button onClick={handleUploadScript} disabled={isLoading || !uploadedName.trim() || !uploadedContent.trim()} className="w-full">{isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}Upload & Link</Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2"><Button variant="ghost" onClick={() => { onSkip(); onOpenChange(false); }}>Skip</Button><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScriptStageDialog;
