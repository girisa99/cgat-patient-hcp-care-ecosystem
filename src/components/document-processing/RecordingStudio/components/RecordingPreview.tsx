/**
 * Recording Preview Component - Shows recorded video with playback controls, 
 * trimming, transcription with filler word removal, script alignment,
 * export options (MP4/audio), captions, TTS for script additions, and upload
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, Square, Download, Trash2, Scissors, RotateCcw, Edit3, 
  FileText, Loader2, Sparkles, Save, X, RefreshCw, AlertCircle, CheckCircle2,
  FileVideo, FileAudio, Subtitles, Upload, Plus, Volume2, Wand2,
  Library, Film
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFFmpegTrim } from '../hooks/useFFmpegTrim';

interface RecordingPreviewProps {
  blob: Blob | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (options?: SaveOptions) => void;
  onDiscard: () => void;
  onTrim?: (startTime: number, endTime: number) => void;
  onEdit?: () => void;
  // Optional script to compare against
  scriptContent?: string;
  scriptTitle?: string;
  // Callback to update script with edited transcript
  onScriptUpdate?: (newContent: string) => void;
  // TTS generation callback for script additions
  onGenerateTTS?: (text: string) => Promise<{ audioUrl: string; audioBlob: Blob } | null>;
  // Upload new video callback
  onUploadVideo?: (file: File) => Promise<void>;
  // Recording metadata
  recordingName?: string;
}

interface SaveOptions {
  format: 'webm' | 'mp4';
  includeAudio: boolean;
  includeCaptions: boolean;
  captionsText?: string;
}

// Filler words to detect and optionally remove
const FILLER_WORDS = [
  'um', 'uh', 'uhh', 'umm', 'hmm', 'hm', 'ah', 'ahh', 'er', 'err',
  'like', 'you know', 'basically', 'literally', 'actually', 'honestly',
  'so', 'well', 'right', 'okay', 'ok', 'yeah', 'ya', 'yep',
  // Common speech disfluencies
  'i mean', 'sort of', 'kind of', 'you see',
];

// Silence/pause markers
const SILENCE_PATTERNS = [
  /\[silence\]/gi,
  /\[pause\]/gi,
  /\[long pause\]/gi,
  /\.\.\./g,
  /…/g,
];

export function RecordingPreview({
  blob,
  isOpen,
  onClose,
  onSave,
  onDiscard,
  onTrim,
  onEdit,
  scriptContent,
  scriptTitle,
  onScriptUpdate,
  onGenerateTTS,
  onUploadVideo,
  recordingName = 'Recording',
}: RecordingPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [showTrimControls, setShowTrimControls] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // FFmpeg for exports
  const ffmpeg = useFFmpegTrim();
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<'webm' | 'mp4'>('mp4');
  
  // Captions state
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [showCaptionsOnVideo, setShowCaptionsOnVideo] = useState(false);
  
  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [editedTranscript, setEditedTranscript] = useState<string>('');
  const [fillerWordsFound, setFillerWordsFound] = useState<string[]>([]);
  const [cleanedTranscript, setCleanedTranscript] = useState<string | null>(null);
  
  // Script addition TTS state
  const [additionalScript, setAdditionalScript] = useState('');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [generatedTTSUrl, setGeneratedTTSUrl] = useState<string | null>(null);
  
  // Script comparison state
  const [showScriptComparison, setShowScriptComparison] = useState(false);
  const [scriptDifferences, setScriptDifferences] = useState<{
    missing: string[];
    extra: string[];
    matched: number;
    total: number;
  } | null>(null);

  // Active tab for the side panel
  const [activeTab, setActiveTab] = useState<'preview' | 'transcript' | 'script' | 'export'>('preview');

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [blob]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);
    };
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setTranscription(null);
      setEditedTranscript('');
      setFillerWordsFound([]);
      setCleanedTranscript(null);
      setScriptDifferences(null);
      setActiveTab('preview');
      setAdditionalScript('');
      setGeneratedTTSUrl(null);
    }
  }, [isOpen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApplyTrim = () => {
    if (onTrim && trimStart < trimEnd) {
      onTrim(trimStart, trimEnd);
    }
  };

  // Export to MP4
  const handleExportMp4 = useCallback(async () => {
    if (!blob) return;
    
    setIsExporting(true);
    setExportProgress(10);
    
    try {
      toast.info('Loading FFmpeg for conversion...');
      const loaded = await ffmpeg.loadFFmpeg();
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      setExportProgress(30);
      toast.info('Converting to MP4...');
      
      const mp4Blob = await ffmpeg.convertToMp4(blob);
      
      if (mp4Blob) {
        setExportProgress(90);
        const url = URL.createObjectURL(mp4Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordingName}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        
        setExportProgress(100);
        toast.success('MP4 exported successfully!');
      }
    } catch (error) {
      console.error('MP4 export error:', error);
      toast.error('Failed to export MP4');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [blob, ffmpeg, recordingName]);

  // Export audio only
  const handleExportAudio = useCallback(async () => {
    if (!blob) return;
    
    setIsExporting(true);
    setExportProgress(10);
    
    try {
      toast.info('Extracting audio...');
      const loaded = await ffmpeg.loadFFmpeg();
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      setExportProgress(30);
      
      const audioBlob = await ffmpeg.extractAudio(blob);
      
      if (audioBlob) {
        setExportProgress(90);
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordingName}-audio.mp3`;
        a.click();
        URL.revokeObjectURL(url);
        
        setExportProgress(100);
        toast.success('Audio extracted successfully!');
      }
    } catch (error) {
      console.error('Audio export error:', error);
      toast.error('Failed to extract audio');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [blob, ffmpeg, recordingName]);

  // Export WebM directly
  const handleExportWebm = useCallback(() => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recordingName}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('WebM downloaded!');
  }, [blob, recordingName]);

  // Export captions as SRT
  const handleExportCaptions = useCallback(() => {
    if (!editedTranscript) {
      toast.error('No transcript to export');
      return;
    }
    
    // Simple SRT generation (single subtitle for now)
    const srtContent = `1
00:00:00,000 --> ${formatSrtTime(duration)}
${editedTranscript}
`;
    
    const srtBlob = new Blob([srtContent], { type: 'text/srt' });
    const url = URL.createObjectURL(srtBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recordingName}-captions.srt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Captions exported!');
  }, [editedTranscript, duration, recordingName]);

  const formatSrtTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Transcribe the recording
  const handleTranscribe = useCallback(async () => {
    if (!blob) {
      toast.error('No recording to transcribe');
      return;
    }

    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-to-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ audio: base64Audio }),
        }
      );

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { text } = await response.json();
      setTranscription(text);
      setEditedTranscript(text);
      
      // Detect filler words
      const foundFillers = detectFillerWords(text);
      setFillerWordsFound(foundFillers);
      
      // Auto-switch to transcript tab
      setActiveTab('transcript');
      
      toast.success('Transcription complete!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe recording');
    } finally {
      setIsTranscribing(false);
    }
  }, [blob]);

  // Detect filler words in text
  const detectFillerWords = (text: string): string[] => {
    const found: string[] = [];
    const lowerText = text.toLowerCase();
    
    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        found.push(...matches.map(() => filler));
      }
    });
    
    return found;
  };

  // Remove filler words and silences from transcript
  const cleanTranscript = useCallback(() => {
    let cleaned = editedTranscript;
    
    // Remove silence markers
    SILENCE_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Remove filler words (preserve sentence structure)
    FILLER_WORDS.forEach(filler => {
      const patterns = [
        new RegExp(`^${filler},?\\s*`, 'gim'),
        new RegExp(`\\s+${filler},?\\s+`, 'gi'),
        new RegExp(`,\\s*${filler},?\\s*`, 'gi'),
        new RegExp(`\\s+${filler}[.!?]`, 'gi'),
      ];
      
      patterns.forEach((pattern, idx) => {
        if (idx === 3) {
          cleaned = cleaned.replace(pattern, match => match.slice(-1));
        } else {
          cleaned = cleaned.replace(pattern, ' ');
        }
      });
    });
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/([.!?])\s*([.!?])/g, '$1');
    cleaned = cleaned.replace(/([.!?])([A-Z])/g, '$1 $2');
    
    setCleanedTranscript(cleaned);
    setEditedTranscript(cleaned);
    
    const removedCount = fillerWordsFound.length;
    toast.success(`Removed ${removedCount} filler word${removedCount !== 1 ? 's' : ''} and cleaned pauses`);
  }, [editedTranscript, fillerWordsFound]);

  // Compare transcript to script
  const compareToScript = useCallback(() => {
    if (!scriptContent || !editedTranscript) {
      toast.error('Need both script and transcript to compare');
      return;
    }

    const normalizeText = (text: string) => 
      text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2);

    const scriptWords = normalizeText(scriptContent);
    const transcriptWords = normalizeText(editedTranscript);

    const missing = scriptWords.filter(word => !transcriptWords.includes(word));
    const extra = transcriptWords.filter(word => !scriptWords.includes(word));
    const matched = scriptWords.filter(word => transcriptWords.includes(word)).length;
    
    setScriptDifferences({
      missing: [...new Set(missing)].slice(0, 20),
      extra: [...new Set(extra)].slice(0, 20),
      matched,
      total: scriptWords.length,
    });
    
    setShowScriptComparison(true);
    setActiveTab('script');
  }, [scriptContent, editedTranscript]);

  // Apply edited transcript back to script
  const applyTranscriptToScript = useCallback(() => {
    if (onScriptUpdate && editedTranscript) {
      onScriptUpdate(editedTranscript);
      toast.success('Script updated with transcript!');
    }
  }, [onScriptUpdate, editedTranscript]);

  // Generate TTS for additional script text
  const handleGenerateAdditionalTTS = useCallback(async () => {
    if (!additionalScript.trim()) {
      toast.error('Please enter text to convert to speech');
      return;
    }
    
    if (!onGenerateTTS) {
      toast.error('TTS generation not available');
      return;
    }
    
    setIsGeneratingTTS(true);
    try {
      const result = await onGenerateTTS(additionalScript);
      if (result) {
        setGeneratedTTSUrl(result.audioUrl);
        toast.success('TTS generated! You can preview and add to your recording.');
      }
    } catch (error) {
      console.error('TTS generation error:', error);
      toast.error('Failed to generate TTS');
    } finally {
      setIsGeneratingTTS(false);
    }
  }, [additionalScript, onGenerateTTS]);

  // Handle video upload
  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    
    if (onUploadVideo) {
      try {
        await onUploadVideo(file);
        toast.success('Video uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload video');
      }
    } else {
      // Just replace the current blob locally
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      toast.success('Video replaced!');
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUploadVideo]);

  // Save to library with options
  const handleSaveToLibrary = useCallback(() => {
    onSave({
      format: exportFormat,
      includeAudio: true,
      includeCaptions: captionsEnabled,
      captionsText: editedTranscript || undefined,
    });
  }, [onSave, exportFormat, captionsEnabled, editedTranscript]);

  if (!isOpen || !blob) return null;

  const matchPercentage = scriptDifferences 
    ? Math.round((scriptDifferences.matched / scriptDifferences.total) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Recording Preview</h3>
            {transcription && (
              <Badge variant="secondary" className="gap-1">
                <FileText className="w-3 h-3" />
                Transcribed
              </Badge>
            )}
            {fillerWordsFound.length > 0 && (
              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/30">
                <AlertCircle className="w-3 h-3" />
                {fillerWordsFound.length} filler words
              </Badge>
            )}
            {captionsEnabled && (
              <Badge variant="outline" className="gap-1 text-blue-600 border-blue-500/30">
                <Subtitles className="w-3 h-3" />
                Captions
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content - Video + Side Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Video */}
            <div className="relative aspect-video bg-black flex-shrink-0">
              {videoUrl && (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                  />
                  {/* Caption overlay */}
                  {showCaptionsOnVideo && editedTranscript && (
                    <div className="absolute bottom-8 left-4 right-4 text-center">
                      <div className="inline-block bg-black/80 px-4 py-2 rounded-lg">
                        <p className="text-white text-lg font-medium">
                          {editedTranscript.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Playback Controls */}
            <div className="p-4 space-y-4 border-t">
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={duration || 100}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">{formatTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button size="icon" variant="outline" onClick={togglePlay}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="outline" onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={showTrimControls ? 'default' : 'outline'}
                  onClick={() => setShowTrimControls(!showTrimControls)}
                  className="gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  Trim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="gap-2"
                >
                  {isTranscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                </Button>
                
                {/* Captions toggle */}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                  <Switch
                    id="captions-toggle"
                    checked={showCaptionsOnVideo}
                    onCheckedChange={setShowCaptionsOnVideo}
                    disabled={!editedTranscript}
                  />
                  <Label htmlFor="captions-toggle" className="text-xs">
                    <Subtitles className="w-3 h-3 inline mr-1" />
                    Captions
                  </Label>
                </div>
              </div>

              {/* Trim Controls */}
              {showTrimControls && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-16">Start: {formatTime(trimStart)}</span>
                    <Slider
                      value={[trimStart]}
                      onValueChange={([v]) => setTrimStart(Math.min(v, trimEnd - 0.5))}
                      max={duration}
                      step={0.1}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-16">End: {formatTime(trimEnd)}</span>
                    <Slider
                      value={[trimEnd]}
                      onValueChange={([v]) => setTrimEnd(Math.max(v, trimStart + 0.5))}
                      max={duration}
                      step={0.1}
                      className="flex-1"
                    />
                  </div>
                  <Button size="sm" onClick={handleApplyTrim} className="w-full">
                    Apply Trim ({formatTime(trimEnd - trimStart)})
                  </Button>
                </div>
              )}
              
              {/* Export Progress */}
              {isExporting && (
                <div className="p-3 bg-primary/10 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing... {exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          {/* Side Panel - Tabs for different features */}
          <div className="w-80 border-l flex flex-col bg-muted/20">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 m-2">
                <TabsTrigger value="export" className="text-xs">
                  Export
                </TabsTrigger>
                <TabsTrigger value="transcript" disabled={!transcription} className="text-xs">
                  Text
                </TabsTrigger>
                <TabsTrigger value="script" disabled={!scriptContent} className="text-xs">
                  Script
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">
                  Add
                </TabsTrigger>
              </TabsList>

              {/* Export Tab */}
              <TabsContent value="export" className="flex-1 flex flex-col p-2 pt-0 m-0">
                <div className="space-y-4">
                  <div className="p-3 bg-background/50 rounded-lg space-y-3">
                    <h4 className="text-sm font-medium">Download Options</h4>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportMp4}
                      disabled={isExporting}
                      className="w-full gap-2 justify-start"
                    >
                      <FileVideo className="w-4 h-4" />
                      Download MP4
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportWebm}
                      disabled={isExporting}
                      className="w-full gap-2 justify-start"
                    >
                      <Film className="w-4 h-4" />
                      Download WebM
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportAudio}
                      disabled={isExporting}
                      className="w-full gap-2 justify-start"
                    >
                      <FileAudio className="w-4 h-4" />
                      Extract Audio (MP3)
                    </Button>
                    
                    {editedTranscript && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportCaptions}
                        disabled={isExporting}
                        className="w-full gap-2 justify-start"
                      >
                        <Subtitles className="w-4 h-4" />
                        Download Captions (SRT)
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-3 bg-background/50 rounded-lg space-y-3">
                    <h4 className="text-sm font-medium">Upload New Video</h4>
                    <p className="text-xs text-muted-foreground">
                      Replace the current recording with a new video file.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Video
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-background/50 rounded-lg space-y-3">
                    <h4 className="text-sm font-medium">Save Settings</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="captions-save" className="text-xs">Include Captions</Label>
                      <Switch
                        id="captions-save"
                        checked={captionsEnabled}
                        onCheckedChange={setCaptionsEnabled}
                        disabled={!editedTranscript}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Format:</Label>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={exportFormat === 'mp4' ? 'default' : 'outline'}
                          onClick={() => setExportFormat('mp4')}
                          className="text-xs h-7"
                        >
                          MP4
                        </Button>
                        <Button
                          size="sm"
                          variant={exportFormat === 'webm' ? 'default' : 'outline'}
                          onClick={() => setExportFormat('webm')}
                          className="text-xs h-7"
                        >
                          WebM
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Transcript Tab */}
              <TabsContent value="transcript" className="flex-1 flex flex-col p-2 pt-0 m-0">
                {transcription ? (
                  <>
                    {/* Filler Word Actions */}
                    {fillerWordsFound.length > 0 && (
                      <div className="mb-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-amber-700">
                            {fillerWordsFound.length} filler words detected
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cleanTranscript}
                            className="h-6 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Clean
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(fillerWordsFound)].slice(0, 8).map((word, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {word}
                            </Badge>
                          ))}
                          {fillerWordsFound.length > 8 && (
                            <Badge variant="outline" className="text-xs">
                              +{fillerWordsFound.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Editable Transcript */}
                    <ScrollArea className="flex-1">
                      <Textarea
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                        className="min-h-[200px] text-sm resize-none"
                        placeholder="Transcription will appear here..."
                      />
                    </ScrollArea>

                    {/* Transcript Actions */}
                    <div className="flex gap-2 mt-2">
                      {scriptContent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={compareToScript}
                          className="flex-1 gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Compare
                        </Button>
                      )}
                      {onScriptUpdate && (
                        <Button
                          size="sm"
                          onClick={applyTranscriptToScript}
                          className="flex-1 gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Update Script
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Click "Transcribe" to get transcript
                  </div>
                )}
              </TabsContent>

              {/* Script Tab */}
              <TabsContent value="script" className="flex-1 flex flex-col p-2 pt-0 m-0">
                {scriptContent ? (
                  <>
                    {/* Script Comparison Results */}
                    {scriptDifferences && (
                      <div className="mb-2 space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="text-xs font-medium">Match Score</span>
                          <div className="flex items-center gap-2">
                            {matchPercentage >= 80 ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : matchPercentage >= 50 ? (
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm font-bold ${
                              matchPercentage >= 80 ? 'text-green-600' :
                              matchPercentage >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {matchPercentage}%
                            </span>
                          </div>
                        </div>

                        {scriptDifferences.missing.length > 0 && (
                          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <p className="text-xs font-medium text-red-700 mb-1">
                              Words from script not spoken:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {scriptDifferences.missing.map((word, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-500/30">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {scriptDifferences.extra.length > 0 && (
                          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-xs font-medium text-blue-700 mb-1">
                              Ad-libbed words:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {scriptDifferences.extra.map((word, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-blue-600 border-blue-500/30">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Original Script */}
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {scriptTitle || 'Original Script'}
                      </p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="text-sm p-2 bg-background/50 rounded border whitespace-pre-wrap">
                        {scriptContent}
                      </div>
                    </ScrollArea>

                    {/* Script Actions */}
                    {transcription && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={compareToScript}
                          className="w-full gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Compare with Transcript
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    No script selected
                  </div>
                )}
              </TabsContent>

              {/* Add Content Tab - TTS for additions */}
              <TabsContent value="preview" className="flex-1 flex flex-col p-2 pt-0 m-0">
                <div className="space-y-4">
                  <div className="p-3 bg-background/50 rounded-lg space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Add Script & Convert to TTS
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Add additional script text and automatically convert it to voiceover.
                    </p>
                    
                    <Textarea
                      value={additionalScript}
                      onChange={(e) => setAdditionalScript(e.target.value)}
                      placeholder="Enter additional script text to convert to speech..."
                      className="min-h-[100px] text-sm"
                    />
                    
                    <Button
                      size="sm"
                      onClick={handleGenerateAdditionalTTS}
                      disabled={isGeneratingTTS || !additionalScript.trim() || !onGenerateTTS}
                      className="w-full gap-2"
                    >
                      {isGeneratingTTS ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Generate TTS
                        </>
                      )}
                    </Button>
                    
                    {generatedTTSUrl && (
                      <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-xs font-medium text-green-700 mb-2">
                          TTS Generated!
                        </p>
                        <audio
                          src={generatedTTSUrl}
                          controls
                          className="w-full h-8"
                        />
                      </div>
                    )}
                  </div>
                  
                  {onScriptUpdate && (
                    <div className="p-3 bg-background/50 rounded-lg space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Append to Script
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Add the text above to your main script.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (additionalScript.trim()) {
                            onScriptUpdate((scriptContent || '') + '\n\n' + additionalScript);
                            toast.success('Script updated!');
                            setAdditionalScript('');
                          }
                        }}
                        disabled={!additionalScript.trim()}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Script
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onDiscard} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Discard
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Video
            </Button>
          )}
          <Button onClick={handleSaveToLibrary} className="gap-2">
            <Library className="w-4 h-4" />
            Save to Library
          </Button>
        </div>
      </div>
    </div>
  );
}
