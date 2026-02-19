/**
 * SavedAudioCard - Display saved audio files with script viewing and download options
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Trash2, 
  Sparkles, 
  Volume2, 
  MoreVertical,
  Download,
  FileText,
  Eye,
  Headphones,
  FileAudio
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedAudioData {
  id: string;
  name: string;
  url?: string;
  timestamp: number;
  scriptText?: string; // Enhanced/clean script used for TTS
  originalScript?: string; // Original script before enhancement
  scriptType?: string;
  metadataType?: string;
}

interface SavedAudioCardProps {
  audio: SavedAudioData;
  isTTS?: boolean;
  isVoiceover?: boolean;
  onDelete: () => void;
}

export function SavedAudioCard({
  audio,
  isTTS = false,
  isVoiceover = false,
  onDelete
}: SavedAudioCardProps) {
  const [showScriptDialog, setShowScriptDialog] = useState(false);
  const [viewVersion, setViewVersion] = useState<'original' | 'enhanced'>('enhanced');
  const [audioError, setAudioError] = useState(false);
  
  const hasScript = !!(audio.scriptText || audio.originalScript);
  const hasOriginal = !!audio.originalScript;
  const hasEnhanced = !!audio.scriptText;
  
  // Download script as text file
  const handleDownloadScript = (version: 'original' | 'enhanced') => {
    let content = version === 'original' ? audio.originalScript : audio.scriptText;
    if (!content) content = audio.scriptText || audio.originalScript || '';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audio.name.replace(/[^a-zA-Z0-9]/g, '_')}_${version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Download audio file
  const handleDownloadAudio = async () => {
    if (!audio.url) return;
    
    try {
      const response = await fetch(audio.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${audio.name.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download audio:', err);
    }
  };
  
  const getVersionContent = () => {
    if (viewVersion === 'original' && audio.originalScript) {
      return audio.originalScript;
    }
    return audio.scriptText || audio.originalScript || 'No script available';
  };

  return (
    <>
      <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all group">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          isTTS ? "bg-green-500/10" : isVoiceover ? "bg-blue-500/10" : "bg-purple-500/10"
        )}>
          {isTTS ? (
            <Volume2 className="h-5 w-5 text-green-500" />
          ) : isVoiceover ? (
            <Mic className="h-5 w-5 text-blue-500" />
          ) : (
            <Headphones className="h-5 w-5 text-purple-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{audio.name}</p>
            <Badge variant="outline" className="text-xs shrink-0">
              {isTTS ? 'TTS' : isVoiceover ? 'Voiceover' : 'Audio'}
            </Badge>
            {hasScript && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30 shrink-0">
                <FileText className="h-3 w-3 mr-1" />
                Script
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(audio.timestamp).toLocaleDateString()}
          </p>
        </div>
        
        {audio.url && !audioError && (
          <audio
            src={audio.url}
            controls
            className="h-8 w-40"
            onError={() => setAudioError(true)}
          />
        )}
        {audioError && (
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">
            URL expired
          </Badge>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {hasScript && (
              <>
                <DropdownMenuItem onClick={() => setShowScriptDialog(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Script
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {audio.url && (
              <DropdownMenuItem onClick={handleDownloadAudio}>
                <Download className="h-4 w-4 mr-2" />
                Download Audio (MP3)
              </DropdownMenuItem>
            )}
            {hasOriginal && (
              <DropdownMenuItem onClick={() => handleDownloadScript('original')}>
                <FileText className="h-4 w-4 mr-2" />
                Download Original Script
              </DropdownMenuItem>
            )}
            {hasEnhanced && (
              <DropdownMenuItem onClick={() => handleDownloadScript('enhanced')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Download Enhanced Script
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* View Script Dialog */}
      <Dialog open={showScriptDialog} onOpenChange={setShowScriptDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-purple-500" />
              {audio.name}
            </DialogTitle>
            <DialogDescription>
              View the script used for this audio
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={viewVersion} onValueChange={(v) => setViewVersion(v as typeof viewVersion)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                {hasOriginal && (
                  <TabsTrigger value="original">
                    <FileText className="h-4 w-4 mr-2" />
                    Original
                  </TabsTrigger>
                )}
                {hasEnhanced && (
                  <TabsTrigger value="enhanced">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhanced (TTS)
                  </TabsTrigger>
                )}
              </TabsList>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadScript(viewVersion)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {getVersionContent()}
              </pre>
            </ScrollArea>
          </Tabs>
          
          {/* Audio Preview */}
          {audio.url && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border mt-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Audio Preview</span>
              </div>
              <audio src={audio.url} controls className="h-8" onError={() => setAudioError(true)} />
              {audioError && <span className="text-xs text-amber-600 ml-2">URL may have expired</span>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
