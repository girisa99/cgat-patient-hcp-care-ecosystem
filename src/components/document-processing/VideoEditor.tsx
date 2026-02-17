import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Scissors,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  FileText,
  Wand2,
  Save,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Music,
  Layers,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface VideoEditorProps {
  videoUrl: string;
  videoName: string;
  videoId?: string;
  availableAudioFiles?: AudioFile[];
  onSave?: (editedBlob: Blob, transcript: string, audioSettings: AudioOverlaySettings | null) => void;
  onClose?: () => void;
}

interface AudioFile {
  id: string;
  name: string;
  url: string;
}

interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  type: 'speech' | 'silence' | 'filler';
  confidence: number;
}

type AudioMixMode = 'replace' | 'mix' | 'background';

interface AudioOverlaySettings {
  audioFileId: string;
  audioFileUrl: string;
  audioFileName: string;
  mixMode: AudioMixMode;
  originalVolume: number; // 0-1
  voiceoverVolume: number; // 0-1
}

// Storage key for persisting editor state
const getEditorStorageKey = (videoId: string) => `video-editor-${videoId}`;

interface EditorState {
  trimStart: number;
  trimEnd: number;
  transcript: TranscriptSegment[];
  editableScript: string;
  audioSettings: AudioOverlaySettings | null;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  videoUrl,
  videoName,
  videoId,
  availableAudioFiles = [],
  onSave,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const voiceoverRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Trim controls
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Transcription
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [editableScript, setEditableScript] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  
  // Audio overlay
  const [audioSettings, setAudioSettings] = useState<AudioOverlaySettings | null>(null);
  const [selectedAudioId, setSelectedAudioId] = useState<string>('none');
  const [mixMode, setMixMode] = useState<AudioMixMode>('replace');
  const [originalVolume, setOriginalVolume] = useState(0.3);
  const [voiceoverVolume, setVoiceoverVolume] = useState(1);
  
  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [stateLoaded, setStateLoaded] = useState(false);
  
  const { showSuccess, showError } = useMasterToast();

  // Load persisted state
  useEffect(() => {
    if (!videoId) {
      setStateLoaded(true);
      return;
    }
    
    try {
      const saved = localStorage.getItem(getEditorStorageKey(videoId));
      if (saved) {
        const state: EditorState = JSON.parse(saved);
        setTrimStart(state.trimStart);
        setTrimEnd(state.trimEnd);
        setTranscript(state.transcript || []);
        setEditableScript(state.editableScript || '');
        if (state.audioSettings) {
          setAudioSettings(state.audioSettings);
          setSelectedAudioId(state.audioSettings.audioFileId);
          setMixMode(state.audioSettings.mixMode);
          setOriginalVolume(state.audioSettings.originalVolume);
          setVoiceoverVolume(state.audioSettings.voiceoverVolume);
        }
        console.log('Loaded editor state for', videoId);
      }
    } catch (e) {
      console.error('Failed to load editor state:', e);
    }
    setStateLoaded(true);
  }, [videoId]);

  // Persist state changes
  useEffect(() => {
    if (!videoId || !stateLoaded) return;
    
    const state: EditorState = {
      trimStart,
      trimEnd,
      transcript,
      editableScript,
      audioSettings,
    };
    
    try {
      localStorage.setItem(getEditorStorageKey(videoId), JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save editor state:', e);
    }
  }, [videoId, trimStart, trimEnd, transcript, editableScript, audioSettings, stateLoaded]);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Only set trimEnd if not loaded from state
      if (trimEnd === 0) {
        setTrimEnd(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Sync voiceover audio
      if (voiceoverRef.current && audioSettings) {
        const voiceover = voiceoverRef.current;
        if (Math.abs(voiceover.currentTime - video.currentTime) > 0.3) {
          voiceover.currentTime = video.currentTime;
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (voiceoverRef.current) {
        voiceoverRef.current.pause();
      }
    };

    const handlePlay = () => {
      if (voiceoverRef.current && audioSettings) {
        voiceoverRef.current.play().catch(console.error);
      }
    };

    const handlePause = () => {
      if (voiceoverRef.current) {
        voiceoverRef.current.pause();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoUrl, audioSettings, trimEnd]);

  // Update video volume based on mix mode
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (audioSettings && mixMode !== 'replace') {
      videoRef.current.volume = originalVolume * volume;
    } else if (audioSettings && mixMode === 'replace') {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume;
    }
  }, [audioSettings, mixMode, originalVolume, volume]);

  // Update voiceover volume
  useEffect(() => {
    if (!voiceoverRef.current) return;
    voiceoverRef.current.volume = voiceoverVolume * volume;
  }, [voiceoverVolume, volume]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

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

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration));
    if (voiceoverRef.current) {
      voiceoverRef.current.currentTime = video.currentTime;
    }
  };

  const skipBack = () => seek(currentTime - 5);
  const skipForward = () => seek(currentTime + 5);

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    if (voiceoverRef.current) {
      voiceoverRef.current.muted = !isMuted;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    if (voiceoverRef.current) {
      voiceoverRef.current.playbackRate = rate;
    }
  };

  // Handle audio file selection
  const handleAudioSelect = (audioId: string) => {
    setSelectedAudioId(audioId);
    
    if (audioId === 'none') {
      setAudioSettings(null);
      return;
    }
    
    const audioFile = availableAudioFiles.find(a => a.id === audioId);
    if (audioFile) {
      setAudioSettings({
        audioFileId: audioFile.id,
        audioFileUrl: audioFile.url,
        audioFileName: audioFile.name,
        mixMode,
        originalVolume,
        voiceoverVolume,
      });
    }
  };

  // Update audio settings when mix mode changes
  const handleMixModeChange = (mode: AudioMixMode) => {
    setMixMode(mode);
    if (audioSettings) {
      setAudioSettings({
        ...audioSettings,
        mixMode: mode,
      });
    }
  };

  // Transcribe video using Hugging Face speech-to-text
  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setProcessingStatus('Extracting audio...');
    
    try {
      // Fetch video as blob
      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();
      
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(videoBlob);
      const base64Audio = await base64Promise;

      setProcessingStatus('Transcribing with AI...');
      
      // Call Hugging Face speech function
      const { data, error } = await supabase.functions.invoke('huggingface-speech', {
        body: {
          audio: base64Audio,
          agentType: 'transcription',
        },
      });

      if (error) throw error;

      const transcribedText = data?.text || '';
      
      // Parse transcript into segments
      const words = transcribedText.split(/\s+/).filter(Boolean);
      const avgWordDuration = duration / Math.max(words.length, 1);
      
      const segments: TranscriptSegment[] = [];
      let segmentCurrentTime = 0;
      let currentSegment: string[] = [];
      let segmentStart = 0;
      
      words.forEach((word, i) => {
        currentSegment.push(word);
        segmentCurrentTime += avgWordDuration;
        
        const fillerWords = ['um', 'uh', 'hmm', 'ah', 'like', 'you know', 'basically'];
        const isFillerWord = fillerWords.some(f => word.toLowerCase().includes(f));
        
        if (segmentCurrentTime - segmentStart >= 5 || i === words.length - 1) {
          segments.push({
            id: crypto.randomUUID(),
            start: segmentStart,
            end: segmentCurrentTime,
            text: currentSegment.join(' '),
            type: isFillerWord ? 'filler' : 'speech',
            confidence: data?.confidence || 0.85,
          });
          segmentStart = segmentCurrentTime;
          currentSegment = [];
        }
      });

      setTranscript(segments);
      setEditableScript(segments.map(s => s.text).join('\n\n'));
      setActiveTab('script');
      showSuccess('Transcription complete!');
    } catch (err) {
      console.error('Transcription error:', err);
      showError('Failed to transcribe video. Please try again.');
    } finally {
      setIsTranscribing(false);
      setProcessingStatus('');
    }
  };

  // Detect and mark silence/filler segments
  const detectSilenceAndFillers = useCallback(() => {
    if (transcript.length === 0) return;
    
    const fillerPatterns = [
      /\b(um|uh|uhm|hmm|ah|er|erm)\b/gi,
      /\b(like|you know|basically|literally|actually)\b/gi,
      /\b(so|well|okay|right)\b/gi,
    ];
    
    const updatedTranscript = transcript.map(segment => {
      let type: 'speech' | 'silence' | 'filler' = 'speech';
      
      for (const pattern of fillerPatterns) {
        if (pattern.test(segment.text)) {
          type = 'filler';
          break;
        }
      }
      
      if (segment.text.trim().length < 3) {
        type = 'silence';
      }
      
      return { ...segment, type };
    });
    
    setTranscript(updatedTranscript);
    showSuccess('Detected fillers and silence');
  }, [transcript, showSuccess]);

  const removeSegment = (id: string) => {
    setTranscript(prev => prev.filter(s => s.id !== id));
    setEditableScript(transcript.filter(s => s.id !== id).map(s => s.text).join('\n\n'));
  };

  const removeAllFillers = () => {
    const cleaned = transcript.filter(s => s.type === 'speech');
    setTranscript(cleaned);
    setEditableScript(cleaned.map(s => s.text).join('\n\n'));
    showSuccess('Removed all filler words and silence');
  };

  const handleSave = async () => {
    setIsProcessing(true);
    setProcessingStatus('Preparing video...');
    
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Update audio settings with current values
      const finalAudioSettings = audioSettings ? {
        ...audioSettings,
        mixMode,
        originalVolume,
        voiceoverVolume,
      } : null;
      
      if (onSave) {
        onSave(blob, editableScript, finalAudioSettings);
      }
      
      showSuccess('Video saved with updated settings!');
    } catch (err) {
      console.error('Save error:', err);
      showError('Failed to save video');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const jumpToSegment = (segment: TranscriptSegment) => {
    seek(segment.start);
  };

  const clearState = () => {
    if (videoId) {
      localStorage.removeItem(getEditorStorageKey(videoId));
    }
    setTrimStart(0);
    setTrimEnd(duration);
    setTranscript([]);
    setEditableScript('');
    setAudioSettings(null);
    setSelectedAudioId('none');
    setMixMode('replace');
    setOriginalVolume(0.3);
    setVoiceoverVolume(1);
    showSuccess('Editor state cleared');
  };

  return (
    <Card className="border-border/50 w-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          Video Editor - {videoName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearState} title="Clear all edits">
            <RotateCcw className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="audio">
              <Music className="h-4 w-4 mr-1" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="trim">Trim</TabsTrigger>
            <TabsTrigger value="script">
              Script {transcript.length > 0 && <Badge className="ml-1" variant="secondary">{transcript.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                playsInline
              />
              
              {/* Audio indicator */}
              {audioSettings && (
                <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  <span className="text-xs">{audioSettings.mixMode === 'replace' ? 'Voiceover' : 'Mixed'}</span>
                </div>
              )}
              
              {/* Processing overlay */}
              {(isTranscribing || isProcessing) && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">{processingStatus}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden voiceover audio */}
            {audioSettings && (
              <audio
                ref={voiceoverRef}
                src={audioSettings.audioFileUrl}
                preload="auto"
              />
            )}

            {/* Playback Controls */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={(v) => seek(v[0])}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={skipBack}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={skipForward}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <Label className="text-xs">Speed:</Label>
                  {[0.5, 1, 1.5, 2].map(rate => (
                    <Button
                      key={rate}
                      variant={playbackRate === rate ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handlePlaybackRateChange(rate)}
                      className="h-6 px-2 text-xs"
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Auto-Transcribe
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('audio')}>
                  <Music className="h-4 w-4 mr-2" />
                  Add Voiceover
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Audio Tab - Voiceover Settings */}
          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Select Voiceover Audio
                </Label>
                <Select value={selectedAudioId} onValueChange={handleAudioSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose audio file..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No voiceover</SelectItem>
                    {availableAudioFiles.map(audio => (
                      <SelectItem key={audio.id} value={audio.id}>
                        {audio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAudioId !== 'none' && (
                <>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Audio Mix Mode
                    </Label>
                    <RadioGroup value={mixMode} onValueChange={(v) => handleMixModeChange(v as AudioMixMode)}>
                      <div className="flex items-center space-x-2 p-3 rounded-lg bg-background border border-border">
                        <RadioGroupItem value="replace" id="replace" />
                        <Label htmlFor="replace" className="flex-1 cursor-pointer">
                          <div className="font-medium">Replace Original</div>
                          <div className="text-xs text-muted-foreground">Mute video audio, play only voiceover</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg bg-background border border-border">
                        <RadioGroupItem value="mix" id="mix" />
                        <Label htmlFor="mix" className="flex-1 cursor-pointer">
                          <div className="font-medium">Mix Both</div>
                          <div className="text-xs text-muted-foreground">Play both tracks, adjust volumes below</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg bg-background border border-border">
                        <RadioGroupItem value="background" id="background" />
                        <Label htmlFor="background" className="flex-1 cursor-pointer">
                          <div className="font-medium">Voiceover as Background</div>
                          <div className="text-xs text-muted-foreground">Lower voiceover volume, keep original prominent</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {mixMode !== 'replace' && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Original Audio Volume</Label>
                          <span className="text-sm text-muted-foreground">{Math.round(originalVolume * 100)}%</span>
                        </div>
                        <Slider
                          value={[originalVolume]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(v) => setOriginalVolume(v[0])}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Voiceover Volume</Label>
                          <span className="text-sm text-muted-foreground">{Math.round(voiceoverVolume * 100)}%</span>
                        </div>
                        <Slider
                          value={[voiceoverVolume]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(v) => setVoiceoverVolume(v[0])}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button onClick={() => setActiveTab('preview')} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Preview with Audio
                    </Button>
                  </div>
                </>
              )}

              {availableAudioFiles.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No audio files available</p>
                  <p className="text-xs">Upload or generate audio files first</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Trim Tab */}
          <TabsContent value="trim" className="space-y-4">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  playsInline
                  controls
                />
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Start Point</Label>
                    <span className="text-sm font-mono">{formatTime(trimStart)}</span>
                  </div>
                  <Slider
                    value={[trimStart]}
                    min={0}
                    max={duration}
                    step={0.1}
                    onValueChange={(v) => setTrimStart(Math.min(v[0], trimEnd - 1))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>End Point</Label>
                    <span className="text-sm font-mono">{formatTime(trimEnd)}</span>
                  </div>
                  <Slider
                    value={[trimEnd]}
                    min={0}
                    max={duration}
                    step={0.1}
                    onValueChange={(v) => setTrimEnd(Math.max(v[0], trimStart + 1))}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Selected duration:</span>
                  <Badge variant="secondary">{formatTime(trimEnd - trimStart)}</Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setTrimStart(0); setTrimEnd(duration); }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" onClick={() => seek(trimStart)}>
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Preview Start
                  </Button>
                  <Button variant="outline" onClick={() => seek(trimEnd - 2)}>
                    <ZoomOut className="h-4 w-4 mr-2" />
                    Preview End
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Script Tab */}
          <TabsContent value="script" className="space-y-4">
            {transcript.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No transcript yet</p>
                <Button onClick={handleTranscribe} disabled={isTranscribing}>
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Transcript
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={detectSilenceAndFillers}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Detect Fillers
                  </Button>
                  <Button variant="outline" size="sm" onClick={removeAllFillers}>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Remove Fillers & Silence
                  </Button>
                </div>

                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {transcript.map((segment) => (
                      <div
                        key={segment.id}
                        className={`p-3 rounded-lg cursor-pointer flex items-start gap-2 ${
                          segment.type === 'filler' 
                            ? 'bg-yellow-500/10 border border-yellow-500/30' 
                            : segment.type === 'silence'
                            ? 'bg-red-500/10 border border-red-500/30'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                        onClick={() => jumpToSegment(segment)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatTime(segment.start)} - {formatTime(segment.end)}
                            </span>
                            {segment.type !== 'speech' && (
                              <Badge variant={segment.type === 'filler' ? 'outline' : 'destructive'} className="text-xs">
                                {segment.type}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{segment.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); removeSegment(segment.id); }}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="space-y-2">
                  <Label>Edit Script</Label>
                  <Textarea
                    value={editableScript}
                    onChange={(e) => setEditableScript(e.target.value)}
                    className="min-h-[150px] font-mono text-sm"
                    placeholder="Transcript will appear here..."
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
