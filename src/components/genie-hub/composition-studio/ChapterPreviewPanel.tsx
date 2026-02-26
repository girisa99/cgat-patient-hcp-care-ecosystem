/**
 * CHAPTER PREVIEW PANEL
 * 
 * Inline preview panel for each chapter showing:
 * - Generated script with edit capability
 * - Multi-language audio player with language dropdown
 * - Video/image thumbnail preview
 * - Confidence scores for each asset
 * - Regenerate buttons for each asset type
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play, Pause, RotateCcw, Edit2, Check, X,
  Volume2, VolumeX, Video, FileText, Sparkles, Download,
  Image, Music, Loader2, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, Wand2, AlertCircle, Globe, CheckCircle2, Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfidenceScoreCard } from './ConfidenceScoreCard';

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

// Helper component to handle video preview with error fallback
const VideoPreviewWithFallback: React.FC<{
  url: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
}> = ({ url, onRegenerate, isRegenerating }) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Track previous URL to reset error state when URL changes
  const prevUrlRef = React.useRef(url);

  // Reset error and loading states when URL changes (e.g., after regeneration)
  React.useEffect(() => {
    if (prevUrlRef.current !== url) {
      setHasError(false);
      setIsLoading(true);
      prevUrlRef.current = url;
    }
  }, [url]);

  // Detect if URL is a video or image based on extension or content
  const isVideoUrl = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || 
                     url.includes('video/mp4') || url.includes('data:video');

  if (hasError) {
    return (
      <div className="text-center space-y-2 px-4 py-2">
        <AlertCircle className="w-5 h-5 mx-auto text-amber-500" />
        <p className="text-[10px] text-muted-foreground">Preview unavailable</p>
        <Button
          size="sm"
          variant="outline"
          className="h-5 text-[10px] px-2"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <><Loader2 className="w-2 h-2 mr-1 animate-spin" /> Regenerating...</>
          ) : (
            <><RefreshCw className="w-2 h-2 mr-1" /> Regenerate</>
          )}
        </Button>
      </div>
    );
  }

  if (isVideoUrl) {
    return (
      <div className="relative h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <video
          src={url}
          className="h-full w-full object-cover"
          muted
          loop
          autoPlay
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={url}
        alt="Video thumbnail"
        className="h-full w-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};


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
  primaryLanguage?: string;
  audioByLanguage?: Record<string, {
    languageCode: string;
    languageName: string;
    audioUrl?: string;
    base64?: string;
    duration?: number;
    provider?: string;
    confidenceScore?: number;
    status: 'pending' | 'generating' | 'complete' | 'error';
  }>;
  confidenceScores?: {
    script?: number;
    audio?: number;
    video?: number;
    music?: number;
  };
  onRegenerate: (chapterId: string, assetType: 'script' | 'audio' | 'video' | 'music') => Promise<void>;
  onRegenerateLanguage?: (chapterId: string, languageCode: string) => Promise<void>;
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
  primaryLanguage = 'en',
  audioByLanguage,
  confidenceScores,
  onRegenerate,
  onRegenerateLanguage,
  onUpdateScript,
  onApprove,
  onReject,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(assets.script?.content || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [selectedAudioLanguage, setSelectedAudioLanguage] = useState(primaryLanguage);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Language display names
  const LANGUAGE_NAMES: Record<string, string> = {
    'en': 'English', 'en-gb': 'English (UK)', 'es': 'Spanish', 'fr': 'French',
    'de': 'German', 'it': 'Italian', 'pt': 'Portuguese', 'ar': 'Arabic',
    'ar-sa': 'Arabic (Saudi)', 'ar-ae': 'Arabic (UAE)', 'hi': 'Hindi',
    'ta': 'Tamil', 'te': 'Telugu', 'bn': 'Bengali', 'zh': 'Chinese',
    'ja': 'Japanese', 'ko': 'Korean', 'ru': 'Russian', 'tr': 'Turkish',
  };

  // Get current audio source based on selected language
  const getCurrentAudioSrc = () => {
    // Check audioByLanguage first
    if (audioByLanguage && audioByLanguage[selectedAudioLanguage]) {
      const langAudio = audioByLanguage[selectedAudioLanguage];
      if (langAudio.audioUrl) return langAudio.audioUrl;
      if (langAudio.base64) return `data:audio/mpeg;base64,${langAudio.base64}`;
    }
    // Fall back to primary audio asset
    if (selectedAudioLanguage === primaryLanguage) {
      if (assets.audio?.url) return assets.audio.url;
      if (assets.audio?.base64) return `data:audio/mpeg;base64,${assets.audio.base64}`;
    }
    return null;
  };

  const audioSrc = getCurrentAudioSrc();
  const hasAudioContent = !!audioSrc;

  // Setup audio element when source changes
  useEffect(() => {
    // Clean up existing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioDuration(0);
    }
    
    if (audioSrc) {
      try {
        const audio = new Audio();
        
        // Handle load events BEFORE setting src
        const handleLoadedMetadata = () => {
          console.log('[ChapterPreview] Audio loaded, duration:', audio.duration);
          setAudioDuration(audio.duration || 0);
        };
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
        const handleError = (e: ErrorEvent) => {
          console.error('[ChapterPreview] Audio error:', e, 'src:', audioSrc?.slice(0, 100));
          setIsPlaying(false);
          toast.error('Audio failed to load - try regenerating');
        };
        const handleCanPlay = () => {
          console.log('[ChapterPreview] Audio can play');
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError as any);
        audio.addEventListener('canplay', handleCanPlay);
        
        // Now set the source
        audio.src = audioSrc;
        audio.load(); // Force load
        audioRef.current = audio;

        return () => {
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError as any);
          audio.removeEventListener('canplay', handleCanPlay);
          audio.pause();
          audio.src = '';
        };
      } catch (err) {
        console.error('[ChapterPreview] Failed to create audio:', err);
      }
    }
  }, [audioSrc]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

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

  const toggleAudioPlay = async () => {
    console.log('[ChapterPreview] toggleAudioPlay called, hasAudio:', hasAudioContent, 'isPlaying:', isPlaying);
    
    if (!audioSrc) {
      toast.error('No audio available');
      return;
    }
    
    // Create audio if not exists
    if (!audioRef.current) {
      try {
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('error', () => {
          console.error('[ChapterPreview] Audio play error');
          toast.error('Could not play audio');
          setIsPlaying(false);
        });
      } catch (err) {
        console.error('[ChapterPreview] Failed to create audio:', err);
        toast.error('Could not load audio');
        return;
      }
    }
    
    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('[ChapterPreview] Play failed:', e);
        toast.error('Could not play audio - try clicking again');
      }
    }
  };

  const toggleMusicPlay = async () => {
    const musicSrc = assets.music?.url || 
      (assets.music?.base64 ? `data:audio/mpeg;base64,${assets.music.base64}` : null);
    
    if (!musicSrc) {
      toast.error('No music generated yet. Click Generate to create background music.');
      return;
    }

    if (!musicRef.current) {
      try {
        const audio = new Audio(musicSrc);
        musicRef.current = audio;
        audio.volume = 0.5;
        audio.addEventListener('ended', () => setIsMusicPlaying(false));
        audio.addEventListener('error', () => {
          toast.error('Could not play music');
          setIsMusicPlaying(false);
        });
      } catch (err) {
        console.error('[ChapterPreview] Failed to create music audio:', err);
        toast.error('Could not load music');
        return;
      }
    }
    
    const audio = musicRef.current;
    
    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      try {
        await audio.play();
        setIsMusicPlaying(true);
      } catch (e) {
        console.error('[ChapterPreview] Music play failed:', e);
        toast.error('Could not play music');
      }
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              {assets.script?.status === 'pending' && assets.script?.content ? (
                <div className="space-y-1">
                  <p className="text-[10px] text-yellow-600 font-medium flex items-center gap-1">
                    ⏳ Preview (not yet generated)
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{assets.script.content}"
                  </p>
                </div>
              ) : assets.script?.content ? (
                <p className="text-sm text-muted-foreground">
                  {assets.script.content}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    No script generated yet.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => handleRegenerate('script')}
                    disabled={regenerating === 'script'}
                  >
                    {regenerating === 'script' ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                    ) : (
                      <><Wand2 className="w-3 h-3 mr-1" /> Generate Script</>
                    )}
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Audio Section with Multi-Language Support */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Voice</span>
              {getStatusBadge(assets.audio)}
              {confidenceScores?.audio && (
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  confidenceScores.audio >= 95 ? "border-primary/50 text-primary" :
                  confidenceScores.audio >= 80 ? "border-amber-500/50 text-amber-600" :
                  "border-destructive/50 text-destructive"
                )}>
                  {confidenceScores.audio}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Language Selector */}
              {audioByLanguage && Object.keys(audioByLanguage).length > 1 && (
                <Select value={selectedAudioLanguage} onValueChange={setSelectedAudioLanguage}>
                  <SelectTrigger className="h-6 w-[100px] text-[10px]">
                    <Globe className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(audioByLanguage).map(([lang, data]) => (
                      <SelectItem key={lang} value={lang} className="text-xs">
                        <div className="flex items-center gap-1">
                          <span>{LANGUAGE_NAMES[lang] || lang}</span>
                          {data.status === 'complete' && <CheckCircle2 className="w-2 h-2 text-primary" />}
                          {lang === primaryLanguage && <Badge variant="secondary" className="text-[8px] px-1">Pri</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {hasAudioContent && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={toggleAudioPlay}
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
          
          <div className="border rounded bg-muted/30 p-3">
            {assets.audio?.status === 'generating' ? (
              <div className="text-center space-y-2 py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">Generating audio...</p>
                <p className="text-[10px] text-muted-foreground">This takes ~10-30 seconds</p>
              </div>
            ) : hasAudioContent ? (
              <div className="space-y-2">
                {/* Progress bar */}
                <div 
                  className="h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
                  onClick={(e) => {
                    if (audioRef.current && audioDuration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = percent * audioDuration;
                    }
                  }}
                >
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${audioDuration ? (currentTime / audioDuration) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{formatTime(currentTime)} / {formatTime(audioDuration || assets.audio?.duration || 0)}</span>
                  <div className="flex items-center gap-2">
                    {audioByLanguage?.[selectedAudioLanguage]?.provider && (
                      <span>{audioByLanguage[selectedAudioLanguage].provider}</span>
                    )}
                    {assets.audio?.provider && !audioByLanguage?.[selectedAudioLanguage]?.provider && (
                      <span>{assets.audio.provider}</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 text-[10px] px-1"
                      onClick={() => {
                        if (audioSrc) {
                          const link = document.createElement('a');
                          link.href = audioSrc;
                          link.download = `${chapterTitle}-${selectedAudioLanguage}.mp3`;
                          link.click();
                          toast.success('Download started');
                        }
                      }}
                    >
                      <Download className="w-2 h-2 mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 py-4">
                <Volume2 className="w-6 h-6 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Voice not generated</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handleRegenerate('audio')}
                  disabled={regenerating === 'audio'}
                >
                  {regenerating === 'audio' ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="w-3 h-3 mr-1" /> Generate Voice</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Video Section with Inline Playback */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Visual</span>
              {getStatusBadge(assets.video)}
              {confidenceScores?.video && (
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  confidenceScores.video >= 95 ? "border-primary/50 text-primary" :
                  confidenceScores.video >= 80 ? "border-amber-500/50 text-amber-600" :
                  "border-destructive/50 text-destructive"
                )}>
                  {confidenceScores.video}%
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              {assets.video?.url && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowVideoDialog(true)}
                    title="Fullscreen preview"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      // Toggle inline video play
                      const video = videoRef.current;
                      if (video) {
                        if (isVideoPlaying) {
                          video.pause();
                          setIsVideoPlaying(false);
                        } else {
                          video.play().catch(console.error);
                          setIsVideoPlaying(true);
                        }
                      }
                    }}
                    title={isVideoPlaying ? "Pause" : "Play"}
                  >
                    {isVideoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                </>
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
          
          <div 
            className="h-[120px] border rounded bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer relative group"
            onClick={() => {
              if (assets.video?.url) {
                setShowVideoDialog(true);
              }
            }}
          >
            {assets.video?.status === 'generating' ? (
              <div className="text-center space-y-2 px-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">Generating visual...</p>
                <p className="text-[10px] text-muted-foreground">Videos may take 2-5 minutes</p>
              </div>
            ) : assets.video?.url ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={assets.video.url}
                  className="h-full w-full object-cover"
                  muted={!isVideoPlaying}
                  loop
                  playsInline
                  onEnded={() => setIsVideoPlaying(false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    const video = e.currentTarget;
                    if (isVideoPlaying) {
                      video.pause();
                      setIsVideoPlaying(false);
                    } else {
                      video.play().catch(console.error);
                      setIsVideoPlaying(true);
                    }
                  }}
                />
                {/* Play overlay when not playing */}
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-2 px-4">
                <Video className="w-6 h-6 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Visual not generated</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerate('video');
                  }}
                  disabled={regenerating === 'video'}
                >
                  {regenerating === 'video' ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="w-3 h-3 mr-1" /> Generate Visual</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Music Section with Playback */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Background</span>
              {getStatusBadge(assets.music)}
              {confidenceScores?.music && (
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  confidenceScores.music >= 95 ? "border-primary/50 text-primary" :
                  confidenceScores.music >= 80 ? "border-amber-500/50 text-amber-600" :
                  "border-destructive/50 text-destructive"
                )}>
                  {confidenceScores.music}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {(assets.music?.url || assets.music?.base64) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={toggleMusicPlay}
                >
                  {isMusicPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
              )}
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
          </div>
          
          <div className="h-[80px] border rounded bg-muted/30 flex items-center justify-center">
            {assets.music?.status === 'generating' ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">Generating music...</p>
              </div>
            ) : assets.music?.url || assets.music?.base64 ? (
              <div className="text-center space-y-1">
                <Music className={cn("w-6 h-6 mx-auto", isMusicPlaying ? "text-primary animate-pulse" : "text-muted-foreground")} />
                <p className="text-xs text-muted-foreground">
                  {isMusicPlaying ? 'Playing...' : 'Music ready'}
                </p>
                {assets.music.provider && (
                  <p className="text-[10px] text-muted-foreground">{assets.music.provider}</p>
                )}
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Music className="w-6 h-6 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No music yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-5 text-[10px]"
                  onClick={() => handleRegenerate('music')}
                  disabled={regenerating === 'music'}
                >
                  <Wand2 className="w-2 h-2 mr-1" /> Generate
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Score Section */}
      {(confidenceScores?.script || confidenceScores?.audio || confidenceScores?.video || confidenceScores?.music) && (
        <div className="pt-3 border-t">
          <ConfidenceScoreCard
            chapterId={chapterId}
            chapterTitle={chapterTitle}
            assets={[
              { 
                type: 'script' as const, 
                status: assets.script?.status || 'pending',
                overallScore: confidenceScores?.script,
                provider: 'gemini'
              },
              { 
                type: 'audio' as const, 
                status: assets.audio?.status || 'pending',
                overallScore: confidenceScores?.audio,
                provider: assets.audio?.provider || 'elevenlabs'
              },
              { 
                type: 'video' as const, 
                status: assets.video?.status || 'pending',
                overallScore: confidenceScores?.video,
                provider: assets.video?.provider || 'sora'
              },
              { 
                type: 'music' as const, 
                status: assets.music?.status || 'pending',
                overallScore: confidenceScores?.music,
                provider: assets.music?.provider || 'elevenlabs'
              },
            ]}
            onRegenerate={(cId, assetType) => handleRegenerate(assetType)}
            isRegenerating={regenerating}
          />
        </div>
      )}

      {/* Languages */}
      {languages.length > 1 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Available in:</p>
          <div className="flex flex-wrap gap-1">
            {languages.map(lang => (
              <Badge 
                key={lang} 
                variant={lang === selectedAudioLanguage ? 'default' : 'outline'} 
                className="text-xs cursor-pointer"
                onClick={() => setSelectedAudioLanguage(lang)}
              >
                {LANGUAGE_NAMES[lang] || lang.toUpperCase()}
                {audioByLanguage?.[lang]?.status === 'complete' && (
                  <CheckCircle2 className="w-2 h-2 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Video Fullscreen Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{chapterTitle} - Visual Preview</DialogTitle>
          </DialogHeader>
          {assets.video?.url && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={assets.video.url}
                className="w-full h-full"
                controls
                autoPlay
                onEnded={() => setShowVideoDialog(false)}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (assets.video?.url) {
                  const link = document.createElement('a');
                  link.href = assets.video.url;
                  link.download = `${chapterTitle}-video.mp4`;
                  link.click();
                  toast.success('Download started');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChapterPreviewPanel;
