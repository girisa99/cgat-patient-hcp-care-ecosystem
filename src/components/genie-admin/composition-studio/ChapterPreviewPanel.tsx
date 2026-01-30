/**
 * CHAPTER PREVIEW PANEL
 * 
 * Inline preview panel for each chapter showing:
 * - Generated script with edit capability
 * - Audio waveform/player
 * - Video/image thumbnail preview
 * - Regenerate buttons for each asset type
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play, Pause, RotateCcw, Edit2, Check, X,
  Volume2, Video, FileText, Sparkles, Download,
  Image, Music, Loader2, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GeneratedAsset {
  type: 'script' | 'audio' | 'video' | 'image' | 'music';
  status: 'pending' | 'generating' | 'complete' | 'error';
  content?: string; // For scripts
  url?: string; // For media
  base64?: string; // For audio
  duration?: number;
  provider?: string;
  error?: string;
}

interface ChapterPreviewPanelProps {
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  assets: {
    script?: GeneratedAsset;
    audio?: GeneratedAsset;
    video?: GeneratedAsset;
    music?: GeneratedAsset;
  };
  languages: string[];
  onRegenerate: (chapterId: string, assetType: 'script' | 'audio' | 'video' | 'music') => Promise<void>;
  onUpdateScript: (chapterId: string, newScript: string) => void;
  onApprove?: (chapterId: string) => void;
  onReject?: (chapterId: string, feedback: string) => void;
  className?: string;
}

export const ChapterPreviewPanel: React.FC<ChapterPreviewPanelProps> = ({
  chapterId,
  chapterTitle,
  chapterIndex,
  assets,
  languages,
  onRegenerate,
  onUpdateScript,
  onApprove,
  onReject,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(assets.script?.content || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleRegenerate = async (assetType: 'script' | 'audio' | 'video' | 'music') => {
    setRegenerating(assetType);
    try {
      await onRegenerate(chapterId, assetType);
      toast.success(`${assetType} regenerated successfully`);
    } catch (err) {
      toast.error(`Failed to regenerate ${assetType}`);
    } finally {
      setRegenerating(null);
    }
  };

  const handleSaveScript = () => {
    onUpdateScript(chapterId, editedScript);
    setIsEditing(false);
    toast.success('Script updated');
  };

  const playAudio = () => {
    if (assets.audio?.url || assets.audio?.base64) {
      const src = assets.audio.url || `data:audio/mpeg;base64,${assets.audio.base64}`;
      const audio = new Audio(src);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const getStatusBadge = (asset?: GeneratedAsset) => {
    if (!asset) return <Badge variant="outline" className="text-xs">Pending</Badge>;
    
    switch (asset.status) {
      case 'generating':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-xs">Generating...</Badge>;
      case 'complete':
        return <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  const hasAnyContent = assets.script?.content || assets.audio?.url || assets.video?.url;

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-4 bg-card/50",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Ch. {chapterIndex + 1}
          </Badge>
          <span className="font-medium text-sm">{chapterTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyContent && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-green-600 hover:text-green-700"
                onClick={() => onApprove?.(chapterId)}
              >
                <ThumbsUp className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-red-600 hover:text-red-700"
                onClick={() => onReject?.(chapterId, 'Needs revision')}
              >
                <ThumbsDown className="w-3 h-3 mr-1" /> Revise
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Script Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Script</span>
              {getStatusBadge(assets.script)}
            </div>
            <div className="flex gap-1">
              {!isEditing && assets.script?.content && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setEditedScript(assets.script?.content || '');
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => handleRegenerate('script')}
                disabled={regenerating === 'script'}
              >
                {regenerating === 'script' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                className="min-h-[100px] text-sm"
                placeholder="Enter script content..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveScript}>
                  <Check className="w-3 h-3 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[100px] border rounded p-2 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                {assets.script?.content || 'No script generated yet. Click regenerate to create.'}
              </p>
            </ScrollArea>
          )}
        </div>

        {/* Audio Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Voice</span>
              {getStatusBadge(assets.audio)}
            </div>
            <div className="flex gap-1">
              {(assets.audio?.url || assets.audio?.base64) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={isPlaying ? stopAudio : playAudio}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => handleRegenerate('audio')}
                disabled={regenerating === 'audio'}
              >
                {regenerating === 'audio' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="h-[100px] border rounded bg-muted/30 flex items-center justify-center">
            {assets.audio?.status === 'generating' ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">Generating audio...</p>
              </div>
            ) : assets.audio?.url || assets.audio?.base64 ? (
              <div className="text-center space-y-2">
                <Volume2 className="w-8 h-8 mx-auto text-green-500" />
                <p className="text-xs text-muted-foreground">
                  {assets.audio.duration ? `${assets.audio.duration}s` : 'Audio ready'}
                  {assets.audio.provider && ` • ${assets.audio.provider}`}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Volume2 className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No audio yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Visual</span>
              {getStatusBadge(assets.video)}
            </div>
            <div className="flex gap-1">
              {assets.video?.url && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(assets.video?.url, '_blank')}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => handleRegenerate('video')}
                disabled={regenerating === 'video'}
              >
                {regenerating === 'video' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="h-[100px] border rounded bg-muted/30 flex items-center justify-center overflow-hidden">
            {assets.video?.status === 'generating' ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">Generating visual...</p>
              </div>
            ) : assets.video?.url ? (
              <img 
                src={assets.video.url} 
                alt="Video thumbnail" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="text-center space-y-2">
                <Video className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No visual yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Music Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Background</span>
              {getStatusBadge(assets.music)}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => handleRegenerate('music')}
              disabled={regenerating === 'music'}
            >
              {regenerating === 'music' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
          
          <div className="h-[100px] border rounded bg-muted/30 flex items-center justify-center">
            {assets.music?.status === 'generating' ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">Generating music...</p>
              </div>
            ) : assets.music?.url || assets.music?.base64 ? (
              <div className="text-center space-y-2">
                <Music className="w-8 h-8 mx-auto text-purple-500" />
                <p className="text-xs text-muted-foreground">
                  {assets.music.provider || 'Music ready'}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Music className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No music yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Languages */}
      {languages.length > 1 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Available in:</p>
          <div className="flex flex-wrap gap-1">
            {languages.map(lang => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterPreviewPanel;
