/**
 * SavedScriptCard - Display saved scripts with version viewing and download options
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
  Video, 
  Mic, 
  Trash2, 
  Sparkles, 
  Edit3, 
  Volume2, 
  MoreHorizontal,
  Download,
  FileText,
  Eye,
  FileAudio
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScriptStats {
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
  estimatedReadingMinutes: number;
  estimatedSpeakingMinutes: number;
  readabilityScore: 'easy' | 'moderate' | 'difficult';
}

interface SavedScript {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'audio';
  createdAt: number;
  updatedAt: number;
  enhancedContent?: string;
  cleanContent?: string;
  draftContent?: string;
  draftStatus?: 'in_progress' | 'completed';
  draftChanges?: any[];
  stats?: ScriptStats;
  hasVoiceover?: boolean;
  voiceoverId?: string;
}

interface SavedScriptCardProps {
  script: SavedScript;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  voiceoverUrl?: string;
}

export function SavedScriptCard({
  script,
  isSelected,
  onSelect,
  onDelete,
  voiceoverUrl
}: SavedScriptCardProps) {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewVersion, setViewVersion] = useState<'original' | 'enhanced' | 'clean'>('original');
  
  const isVideo = script.type === 'video';
  const Icon = isVideo ? Video : Mic;
  const iconColor = isVideo ? 'text-red-500' : 'text-purple-500';
  
  // Download script as text file
  const handleDownloadScript = (version: 'original' | 'enhanced' | 'clean') => {
    let content = script.content;
    let suffix = 'original';
    
    if (version === 'enhanced' && script.enhancedContent) {
      content = script.enhancedContent;
      suffix = 'enhanced';
    } else if (version === 'clean' && script.cleanContent) {
      content = script.cleanContent;
      suffix = 'clean-tts';
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name.replace(/[^a-zA-Z0-9]/g, '_')}_${suffix}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Download voiceover audio
  const handleDownloadVoiceover = async () => {
    if (!voiceoverUrl) return;
    
    try {
      const response = await fetch(voiceoverUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script.name.replace(/[^a-zA-Z0-9]/g, '_')}_voiceover.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download voiceover:', err);
    }
  };
  
  const getVersionContent = () => {
    switch (viewVersion) {
      case 'enhanced':
        return script.enhancedContent || script.content;
      case 'clean':
        return script.cleanContent || script.content;
      default:
        return script.content;
    }
  };

  return (
    <>
      <div
        className={cn(
          "p-4 rounded-lg border transition-all group cursor-pointer",
          isSelected 
            ? "border-primary bg-primary/5" 
            : "border-border/50 hover:border-primary/30"
        )}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon className={cn("h-4 w-4 flex-shrink-0", iconColor)} />
            <h4 className="font-medium truncate">{script.name}</h4>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Versions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDownloadScript('original')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Original
                </DropdownMenuItem>
                {script.enhancedContent && (
                  <DropdownMenuItem onClick={() => handleDownloadScript('enhanced')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Download Enhanced
                  </DropdownMenuItem>
                )}
                {script.cleanContent && (
                  <DropdownMenuItem onClick={() => handleDownloadScript('clean')}>
                    <FileAudio className="h-4 w-4 mr-2" />
                    Download Clean (TTS)
                  </DropdownMenuItem>
                )}
                {script.hasVoiceover && voiceoverUrl && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDownloadVoiceover}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Voiceover (MP3)
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {script.content.slice(0, 100)}...
        </p>
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {script.stats?.wordCount || 0} words
          </span>
          {script.enhancedContent && (
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
          )}
          {script.cleanContent && (
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
              <FileAudio className="h-3 w-3 mr-1" />
              TTS Ready
            </Badge>
          )}
          {script.draftStatus === 'in_progress' && (
            <Badge variant="secondary" className="text-xs">
              <Edit3 className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}
          {script.hasVoiceover && (
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
              <Volume2 className="h-3 w-3 mr-1" />
              Voiceover
            </Badge>
          )}
        </div>
      </div>
      
      {/* View Versions Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", iconColor)} />
              {script.name}
            </DialogTitle>
            <DialogDescription>
              View different versions of your script
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={viewVersion} onValueChange={(v) => setViewVersion(v as typeof viewVersion)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="original">
                  <FileText className="h-4 w-4 mr-2" />
                  Original
                </TabsTrigger>
                {script.enhancedContent && (
                  <TabsTrigger value="enhanced">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhanced
                  </TabsTrigger>
                )}
                {script.cleanContent && (
                  <TabsTrigger value="clean">
                    <FileAudio className="h-4 w-4 mr-2" />
                    Clean (TTS)
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
          
          {/* Script Stats */}
          {script.stats && (
            <div className="grid grid-cols-3 gap-4 mt-4 p-3 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-lg font-semibold">{script.stats.wordCount}</p>
                <p className="text-xs text-muted-foreground">Words</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">~{script.stats.estimatedSpeakingMinutes}m</p>
                <p className="text-xs text-muted-foreground">Speaking Time</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  script.stats.readabilityScore === 'easy' && "bg-green-500/10 text-green-600",
                  script.stats.readabilityScore === 'moderate' && "bg-yellow-500/10 text-yellow-600",
                  script.stats.readabilityScore === 'difficult' && "bg-red-500/10 text-red-600"
                )}>
                  {script.stats.readabilityScore}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Readability</p>
              </div>
            </div>
          )}
          
          {/* Voiceover Download */}
          {script.hasVoiceover && voiceoverUrl && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30 mt-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Voiceover Available</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleDownloadVoiceover}>
                <Download className="h-4 w-4 mr-2" />
                Download MP3
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
