/**
 * VibeLibraryTab - Recording Library Management for Genie Vibe
 * 
 * Phase 3 Features:
 * - Recording library with IndexedDB persistence
 * - FFmpeg trimming controls
 * - Studio Sound presets
 * - ContentAnalyzer integration for auto-chapters
 */

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Library,
  Play,
  Download,
  Trash2,
  Scissors,
  Music,
  FileAudio,
  FileVideo,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Headphones,
  RefreshCw,
  Clock,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import hooks from RecordingStudio
import {
  useRecordingLibrary,
  useFFmpegTrim,
  useStudioSound,
  STUDIO_PRESETS
} from '@/components/document-processing/RecordingStudio/hooks';

// Import ContentAnalyzer for auto-chapters
import { ContentAnalyzer } from '@/components/document-processing/RecordingStudio/components/ContentAnalyzer';

interface VibeLibraryTabProps {
  onRecordingSelect?: (url: string, name: string) => void;
  onScriptGenerated?: (script: { title: string; content: string }) => void;
}

export function VibeLibraryTab({ onRecordingSelect, onScriptGenerated }: VibeLibraryTabProps) {
  // Recording library hook
  const library = useRecordingLibrary();
  
  // FFmpeg hook for trimming
  const ffmpeg = useFFmpegTrim();
  
  // Studio sound hook
  const studioSound = useStudioSound();
  
  // Selected recording for editing
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Trim state
  const [showTrimDialog, setShowTrimDialog] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [trimDuration, setTrimDuration] = useState(0);
  
  // ContentAnalyzer state
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [analyzerContent, setAnalyzerContent] = useState<{
    type: 'recording';
    name: string;
    source?: string;
  } | null>(null);
  
  // Format helpers
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle preview
  const handlePreview = useCallback(async (id: number) => {
    const blob = await library.getRecordingBlob(id);
    if (blob) {
      // Revoke previous URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setSelectedId(id);
    }
  }, [library, previewUrl]);
  
  // Handle download
  const handleDownload = useCallback(async (id: number) => {
    await library.downloadRecording(id);
    toast.success('Recording downloaded!');
  }, [library]);
  
  // Handle delete
  const handleDelete = useCallback(async (id: number) => {
    await library.deleteRecording(id);
    if (selectedId === id) {
      setSelectedId(null);
      setPreviewUrl(null);
    }
    toast.success('Recording deleted');
  }, [library, selectedId]);
  
  // Open trim dialog
  const handleOpenTrim = useCallback(async (id: number) => {
    const recording = await library.getRecording(id);
    if (recording) {
      setSelectedId(id);
      setTrimStart(0);
      setTrimEnd(recording.duration);
      setTrimDuration(recording.duration);
      setShowTrimDialog(true);
      
      // Load FFmpeg if not loaded
      if (!ffmpeg.isLoaded) {
        await ffmpeg.loadFFmpeg();
      }
    }
  }, [library, ffmpeg]);
  
  // Execute trim
  const handleTrim = useCallback(async () => {
    if (!selectedId) return;
    
    const blob = await library.getRecordingBlob(selectedId);
    if (!blob) return;
    
    const trimmed = await ffmpeg.trimVideo(blob, trimStart, trimEnd, {
      outputFormat: 'webm',
      quality: 'high'
    });
    
    if (trimmed) {
      // Save as new recording
      const recording = await library.getRecording(selectedId);
      await library.saveRecording(trimmed, {
        name: `${recording?.name || 'Recording'} (trimmed)`,
        duration: trimEnd - trimStart
      });
      
      toast.success('Trimmed recording saved!');
      setShowTrimDialog(false);
    }
  }, [selectedId, library, ffmpeg, trimStart, trimEnd]);
  
  // Extract audio
  const handleExtractAudio = useCallback(async (id: number) => {
    const blob = await library.getRecordingBlob(id);
    if (!blob) return;
    
    if (!ffmpeg.isLoaded) {
      await ffmpeg.loadFFmpeg();
    }
    
    const audio = await ffmpeg.extractAudio(blob);
    if (audio) {
      const url = URL.createObjectURL(audio);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-audio.mp3';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Audio extracted!');
    }
  }, [library, ffmpeg]);
  
  // Convert to MP4
  const handleConvertToMp4 = useCallback(async (id: number) => {
    const blob = await library.getRecordingBlob(id);
    if (!blob) return;
    
    if (!ffmpeg.isLoaded) {
      await ffmpeg.loadFFmpeg();
    }
    
    const mp4 = await ffmpeg.convertToMp4(blob);
    if (mp4) {
      const url = URL.createObjectURL(mp4);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.mp4';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Converted to MP4!');
    }
  }, [library, ffmpeg]);
  
  // Analyze with ContentAnalyzer
  const handleAnalyze = useCallback(async (id: number) => {
    const recording = await library.getRecording(id);
    const blob = await library.getRecordingBlob(id);
    
    if (recording && blob) {
      const url = URL.createObjectURL(blob);
      setAnalyzerContent({
        type: 'recording',
        name: recording.name,
        source: url
      });
      setShowAnalyzer(true);
    }
  }, [library]);
  
  // Handle script generated from ContentAnalyzer
  const handleScriptGenerated = useCallback((script: { title: string; content: string }) => {
    if (onScriptGenerated) {
      onScriptGenerated(script);
    }
    setShowAnalyzer(false);
    setAnalyzerContent(null);
  }, [onScriptGenerated]);

  return (
    <div className="space-y-6">
      {/* ContentAnalyzer Dialog */}
      <ContentAnalyzer
        isOpen={showAnalyzer}
        onClose={() => {
          setShowAnalyzer(false);
          setAnalyzerContent(null);
        }}
        content={analyzerContent || undefined}
        onScriptGenerated={handleScriptGenerated}
      />
      
      {/* Trim Dialog */}
      <Dialog open={showTrimDialog} onOpenChange={setShowTrimDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Trim Recording
            </DialogTitle>
            <DialogDescription>
              Set start and end points to trim your recording
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Trim preview */}
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Start: </span>
                  <span className="font-mono">{formatDuration(trimStart)}</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div>
                  <span className="text-muted-foreground">End: </span>
                  <span className="font-mono">{formatDuration(trimEnd)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Output duration: {formatDuration(trimEnd - trimStart)}
              </p>
            </div>
            
            {/* Start time input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time (seconds)</label>
              <input
                type="range"
                min={0}
                max={trimDuration}
                step={0.1}
                value={trimStart}
                onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd - 1))}
                className="w-full"
              />
            </div>
            
            {/* End time input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time (seconds)</label>
              <input
                type="range"
                min={0}
                max={trimDuration}
                step={0.1}
                value={trimEnd}
                onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart + 1))}
                className="w-full"
              />
            </div>
            
            {/* FFmpeg status */}
            {ffmpeg.isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
                <Progress value={ffmpeg.progress} />
              </div>
            )}
            
            {ffmpeg.error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{ffmpeg.error}</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrimDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrim} disabled={ffmpeg.isProcessing}>
              {ffmpeg.isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Trimming...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Trim & Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Library className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Recording Library</h2>
            <p className="text-sm text-muted-foreground">
              Manage, trim, and process your recordings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => library.refresh()}
            disabled={library.isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", library.isLoading && "animate-spin")} />
          </Button>
          <Badge variant="secondary">
            {library.recordings.length} recordings
          </Badge>
        </div>
      </div>
      
      {/* Studio Sound Presets */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" />
            <span className="font-medium">Studio Sound</span>
          </div>
          <Badge variant={studioSound.settings.enabled ? 'default' : 'outline'}>
            {studioSound.activePreset}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.keys(STUDIO_PRESETS).map((preset) => (
            <Button
              key={preset}
              variant={studioSound.activePreset === preset ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => studioSound.applyPreset(preset)}
              className="capitalize"
            >
              {preset.replace('_', ' ')}
            </Button>
          ))}
        </div>
        
        {studioSound.settings.enabled && (
          <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Sliders className="h-3 w-3" />
              <span>Compressor: {studioSound.settings.compressor.enabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Music className="h-3 w-3" />
              <span>EQ: {studioSound.settings.eq.enabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Gate: {studioSound.settings.noiseGate.enabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Limiter: {studioSound.settings.limiter.enabled ? 'On' : 'Off'}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Preview Player */}
      {previewUrl && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            className="w-full h-full"
          />
        </div>
      )}
      
      {/* Recording List */}
      <ScrollArea className="h-[400px] pr-4">
        {library.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : library.recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Library className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No recordings yet</p>
            <p className="text-sm text-muted-foreground">
              Your recordings will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {library.recordings.map((recording) => (
              <div
                key={recording.id}
                className={cn(
                  "p-4 bg-card border rounded-lg transition-colors",
                  selectedId === recording.id && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div 
                    className="w-24 h-16 bg-muted rounded overflow-hidden flex items-center justify-center cursor-pointer"
                    onClick={() => handlePreview(recording.id)}
                  >
                    {recording.type === 'video' ? (
                      <FileVideo className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <FileAudio className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{recording.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(recording.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatSize(recording.size)}
                      </span>
                      <span>{formatDate(recording.timestamp)}</span>
                    </div>
                    {recording.scriptTitle && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Script: {recording.scriptTitle}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(recording.id)}
                      title="Preview"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenTrim(recording.id)}
                      title="Trim"
                    >
                      <Scissors className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAnalyze(recording.id)}
                      title="Analyze with AI"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExtractAudio(recording.id)}
                      title="Extract Audio"
                    >
                      <FileAudio className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleConvertToMp4(recording.id)}
                      title="Convert to MP4"
                    >
                      <FileVideo className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(recording.id)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(recording.id)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* FFmpeg processing indicator for this recording */}
                {selectedId === recording.id && ffmpeg.isProcessing && (
                  <div className="mt-3 space-y-1">
                    <Progress value={ffmpeg.progress} className="h-1" />
                    <p className="text-xs text-muted-foreground">
                      Processing: {ffmpeg.progress}%
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* FFmpeg loading status */}
      {ffmpeg.isLoading && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium">Loading FFmpeg</p>
            <p className="text-xs text-muted-foreground">Preparing video processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
