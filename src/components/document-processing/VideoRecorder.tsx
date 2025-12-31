import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Camera,
  Monitor,
  MonitorPlay,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Upload,
  Download,
  Trash2,
  Image,
  Music,
  FileVideo,
  Loader2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Captions,
  FileText,
  Volume2,
  ExternalLink,
  Eye,
  Scissors,
} from 'lucide-react';
import { useMediaRecorder, RecordingMode } from '@/hooks/useMediaRecorder';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeleprompterPopup } from './TeleprompterPopup';
import { VideoEditor } from './VideoEditor';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  file_type: 'video' | 'audio' | 'image';
  storage_bucket: string;
  storage_path: string;
  duration_seconds?: number;
  source: 'upload' | 'recording' | 'generated';
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface ScriptItem {
  id: string;
  title: string;
  content: string;
}

export const VideoRecorder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('record');
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('webcam');
  const [videoName, setVideoName] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<MediaItem | null>(null);
  const [selectedScript, setSelectedScript] = useState<ScriptItem | null>(null);
  const [availableScripts, setAvailableScripts] = useState<ScriptItem[]>([]);
  const [isPlayingVoiceover, setIsPlayingVoiceover] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [showScriptTeleprompter, setShowScriptTeleprompter] = useState(false);
  const [showAudioTeleprompter, setShowAudioTeleprompter] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  
  const previewRef = useRef<HTMLVideoElement>(null);
  const fullscreenPreviewRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const voiceoverAudioRef = useRef<HTMLAudioElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    isRecording,
    isPaused,
    duration,
    recordedBlob,
    recordedUrl,
    error,
    isMicEnabled,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    toggleMic,
    webcamStream,
    combinedStream,
  } = useMediaRecorder();
  
  const { showSuccess, showError } = useMasterToast();

  // Show live preview
  useEffect(() => {
    const videoElement = isFullscreen ? fullscreenPreviewRef.current : previewRef.current;
    if (videoElement) {
      if (isRecording) {
        videoElement.srcObject = combinedStream || webcamStream;
        videoElement.muted = true;
        videoElement.play().catch(console.error);
      } else if (recordedUrl) {
        videoElement.srcObject = null;
        videoElement.src = recordedUrl;
        videoElement.muted = false;
      }
    }
  }, [isRecording, webcamStream, combinedStream, recordedUrl, isFullscreen]);

  // Load media from database and scripts
  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('generated_media')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const items: MediaItem[] = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          file_type: item.file_type,
          storage_bucket: item.storage_bucket,
          storage_path: item.storage_path,
          url: item.file_url || '',
          duration_seconds: item.duration_seconds,
          source: item.source,
          created_at: item.created_at,
          metadata: item.metadata,
        }));

        setMediaItems(items);
      } catch (e) {
        console.error('Failed to load media:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadMedia();

    // Load scripts from multiple sources
    const loadScripts = () => {
      const allScripts: ScriptItem[] = [];
      
      // Source 1: savedScripts (legacy)
      const savedScripts = localStorage.getItem('savedScripts');
      if (savedScripts) {
        try {
          const scripts = JSON.parse(savedScripts);
          scripts.forEach((s: any) => {
            allScripts.push({
              id: s.id || crypto.randomUUID(),
              title: s.title || 'Untitled Script',
              content: s.content || s.text || '',
            });
          });
        } catch (e) {
          console.error('Failed to load savedScripts:', e);
        }
      }
      
      // Source 2: generatedAudiosMetadata (scripts attached to generated audio)
      const audioMetadata = localStorage.getItem('generatedAudiosMetadata');
      if (audioMetadata) {
        try {
          const audios = JSON.parse(audioMetadata);
          audios.forEach((a: any) => {
            if (a.scriptText) {
              // Check if this script is already in the list (by content hash)
              const isDuplicate = allScripts.some(
                s => s.content.substring(0, 100) === a.scriptText.substring(0, 100)
              );
              if (!isDuplicate) {
                allScripts.push({
                  id: `audio-${a.id}`,
                  title: `${a.name} Script`,
                  content: a.scriptText,
                });
              }
            }
          });
        } catch (e) {
          console.error('Failed to load audio scripts:', e);
        }
      }
      
      // Add preset scripts if no scripts found
      if (allScripts.length === 0) {
        allScripts.push(
          {
            id: 'preset-video',
            title: 'Video Script - Patient Onboarding',
            content: `# AI Document Processing: Enterprise Edition
## Voice-Over Script

Hello everyone! If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the technical architecture and functional sides.

Technical Architecture Enhancements:
- Multi-Model AI Routing System
- Configuration-Driven Architecture
- Two-Stage Pipeline with Provider Abstraction

Let me walk you through the technical transformation.`,
          },
          {
            id: 'preset-audio',
            title: 'Audio Script - Introduction',
            content: `Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

Today I'm excited to share the evolution of our AI document processing platform from a weekend prototype to an enterprise-grade solution.

Let me walk you through the key improvements we've made.`,
          }
        );
      }
      
      setAvailableScripts(allScripts);
    };
    
    loadScripts();
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    await startRecording(recordingMode, micEnabled);
    // Start voiceover audio if selected
    if (selectedAudioFile && voiceoverAudioRef.current) {
      voiceoverAudioRef.current.play();
      setIsPlayingVoiceover(true);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.pause();
      voiceoverAudioRef.current.currentTime = 0;
      setIsPlayingVoiceover(false);
    }
  };

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleSaveRecording = async () => {
    if (!recordedBlob || !videoName.trim()) {
      showError('Please enter a name for the recording');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Please log in to save recordings');
        return;
      }

      // Upload to Supabase storage
      const fileName = `${Date.now()}_${videoName.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
      const { data, error: uploadError } = await supabase.storage
        .from('generated-videos')
        .upload(fileName, recordedBlob, {
          contentType: 'video/webm',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('generated-videos')
        .getPublicUrl(data.path);

      // Save to database
      const { data: dbData, error: dbError } = await supabase
        .from('generated_media')
        .insert({
          user_id: user.id,
          name: videoName,
          file_type: 'video',
          storage_bucket: 'generated-videos',
          storage_path: data.path,
          file_url: urlData.publicUrl,
          duration_seconds: duration,
          source: 'recording',
          metadata: { mode: recordingMode },
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newMedia: MediaItem = {
        id: dbData.id,
        name: videoName,
        url: urlData.publicUrl,
        file_type: 'video',
        storage_bucket: 'generated-videos',
        storage_path: data.path,
        duration_seconds: duration,
        source: 'recording',
        created_at: dbData.created_at,
        metadata: { mode: recordingMode },
      };

      setMediaItems(prev => [newMedia, ...prev]);
      showSuccess('Recording saved successfully');
      resetRecording();
      setVideoName('');
      setActiveTab('library');
    } catch (err) {
      console.error('Save error:', err);
      showError('Failed to save recording');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const type = file.type.startsWith('video/') 
          ? 'video' 
          : file.type.startsWith('audio/') 
            ? 'audio' 
            : file.type.startsWith('image/') 
              ? 'image' 
              : null;

        if (!type) {
          showError(`Unsupported file type: ${file.name}`);
          continue;
        }

        const bucket = type === 'video' ? 'generated-videos' : type === 'audio' ? 'generated-audio' : 'generated-media';
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        // Get user and save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbData, error: dbError } = await supabase
            .from('generated_media')
            .insert({
              user_id: user.id,
              name: file.name,
              file_type: type,
              storage_bucket: bucket,
              storage_path: data.path,
              file_url: urlData.publicUrl,
              file_size_bytes: file.size,
              source: 'upload',
            })
            .select()
            .single();

          if (!dbError && dbData) {
            const newMedia: MediaItem = {
              id: dbData.id,
              name: file.name,
              url: urlData.publicUrl,
              file_type: type,
              storage_bucket: bucket,
              storage_path: data.path,
              source: 'upload',
              created_at: dbData.created_at,
            };
            setMediaItems(prev => [newMedia, ...prev]);
          }
        }
      }
      showSuccess('Files uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to upload files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (media: MediaItem) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const ext = media.file_type === 'video' ? 'webm' : media.file_type === 'audio' ? 'mp3' : 'png';
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${media.name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showSuccess('File downloaded');
    } catch (err) {
      console.error('Download error:', err);
      showError('Failed to download file');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const media = mediaItems.find(m => m.id === id);
    if (!media) return;

    try {
      // Delete from storage
      await supabase.storage.from(media.storage_bucket).remove([media.storage_path]);
      
      // Delete from database
      await supabase.from('generated_media').delete().eq('id', id);
      
      setMediaItems(prev => prev.filter(m => m.id !== id));
      showSuccess('Media deleted');
    } catch (err) {
      console.error('Delete error:', err);
      showError('Failed to delete media');
    }
  };

  const handleSelectAudioFile = (mediaId: string) => {
    const audio = mediaItems.find(m => m.id === mediaId && m.file_type === 'audio');
    setSelectedAudioFile(audio || null);
    if (audio) {
      showSuccess(`Selected "${audio.name}" as voiceover`);
    }
  };

  const handleSelectScript = (scriptId: string) => {
    const script = availableScripts.find(s => s.id === scriptId);
    setSelectedScript(script || null);
    if (script) {
      setCaptionText(script.content);
      setShowCaptions(true);
      showSuccess(`Loaded script: "${script.title}"`);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'webcam': return <Camera className="h-4 w-4" />;
      case 'screen': return <Monitor className="h-4 w-4" />;
      case 'screen+webcam': return <MonitorPlay className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getMediaIcon = (type: 'video' | 'audio' | 'image') => {
    switch (type) {
      case 'video': return <FileVideo className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
    }
  };

  const audioFiles = mediaItems.filter(m => m.file_type === 'audio');
  const videoFiles = mediaItems.filter(m => m.file_type === 'video');
  const recordings = mediaItems.filter(m => m.source === 'recording');
  const uploads = mediaItems.filter(m => m.source === 'upload');

  const VideoPreview = ({ className = '', videoRef }: { className?: string; videoRef: React.RefObject<HTMLVideoElement> }) => (
    <div className={`relative aspect-video bg-muted rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        controls={!!recordedUrl && !isRecording}
      />
      {!isRecording && !recordedUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select a mode and start recording</p>
          </div>
        </div>
      )}
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-sm font-mono bg-background/80 px-2 py-1 rounded">
            {formatDuration(duration)}
          </span>
        </div>
      )}
      {/* Captions overlay */}
      {showCaptions && captionText && (
        <div className="absolute bottom-16 left-4 right-4">
          <div className="bg-black/70 text-white text-center py-2 px-4 rounded-lg">
            <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
              {captionText}
            </p>
          </div>
        </div>
      )}
      {/* Voiceover indicator */}
      {isPlayingVoiceover && (
        <div className="absolute top-4 right-4 bg-primary/80 text-primary-foreground px-2 py-1 rounded flex items-center gap-1">
          <Volume2 className="h-3 w-3" />
          <span className="text-xs">Voiceover</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Record
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <FileVideo className="h-4 w-4" />
                Library ({mediaItems.length})
              </TabsTrigger>
            </TabsList>

            {/* Record Tab */}
            <TabsContent value="record" className="space-y-4">
              {/* Recording Mode Selector */}
              <div className="space-y-2">
                <Label>Recording Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={recordingMode === 'webcam' ? 'default' : 'outline'}
                    onClick={() => setRecordingMode('webcam')}
                    disabled={isRecording}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Webcam
                  </Button>
                  <Button
                    variant={recordingMode === 'screen' ? 'default' : 'outline'}
                    onClick={() => setRecordingMode('screen')}
                    disabled={isRecording}
                    className="flex-1"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Screen
                  </Button>
                  <Button
                    variant={recordingMode === 'screen+webcam' ? 'default' : 'outline'}
                    onClick={() => setRecordingMode('screen+webcam')}
                    disabled={isRecording}
                    className="flex-1"
                  >
                    <MonitorPlay className="h-4 w-4 mr-2" />
                    Screen + Webcam
                  </Button>
                </div>
              </div>

              {/* Audio & Script Options */}
              <div className="grid grid-cols-2 gap-4">
                {/* Mic Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    <Label>Enable Microphone</Label>
                  </div>
                  <Switch
                    checked={micEnabled}
                    onCheckedChange={setMicEnabled}
                    disabled={isRecording}
                  />
                </div>

                {/* Captions Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Captions className="h-4 w-4" />
                    <Label>Show Captions</Label>
                  </div>
                  <Switch
                    checked={showCaptions}
                    onCheckedChange={setShowCaptions}
                  />
                </div>
              </div>

              {/* Voiceover & Script Selection */}
              <div className="grid grid-cols-2 gap-4">
                {/* Audio File Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Voiceover Audio
                  </Label>
                  <Select
                    value={selectedAudioFile?.id || 'none'}
                    onValueChange={(val) => handleSelectAudioFile(val === 'none' ? '' : val)}
                    disabled={isRecording}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audio file..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {audioFiles.map(audio => (
                        <SelectItem key={audio.id} value={audio.id}>
                          {audio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Script Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Script for Captions
                  </Label>
                  <Select
                    value={selectedScript?.id || 'none'}
                    onValueChange={(val) => handleSelectScript(val === 'none' ? '' : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select script..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableScripts.map(script => (
                        <SelectItem key={script.id} value={script.id}>
                          {script.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Teleprompter Controls */}
              {(selectedScript || selectedAudioFile) && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  <Label className="flex items-center gap-2 text-sm mr-2">
                    <Eye className="h-4 w-4" />
                    Teleprompter:
                  </Label>
                  {selectedScript && (
                    <Button
                      variant={showScriptTeleprompter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowScriptTeleprompter(!showScriptTeleprompter)}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Script
                      {showScriptTeleprompter && <Badge variant="secondary" className="ml-1">Open</Badge>}
                    </Button>
                  )}
                  {selectedAudioFile && (
                    <Button
                      variant={showAudioTeleprompter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowAudioTeleprompter(!showAudioTeleprompter)}
                      className="gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      Audio Cue
                      {showAudioTeleprompter && <Badge variant="secondary" className="ml-1">Open</Badge>}
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Click popup icon to open in separate window
                  </span>
                </div>
              )}

              {/* Custom Caption Input */}
              {showCaptions && !selectedScript && (
                <div className="space-y-2">
                  <Label>Custom Caption Text</Label>
                  <Input
                    placeholder="Enter caption text to display..."
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                  />
                </div>
              )}

              {/* Preview */}
              <div className="relative">
                <VideoPreview videoRef={previewRef} />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={handleToggleFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Hidden audio element for voiceover */}
              {selectedAudioFile && (
                <audio ref={voiceoverAudioRef} src={selectedAudioFile.url} preload="auto" />
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                {!isRecording && !recordedUrl && (
                  <Button onClick={handleStartRecording} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                )}
                
                {isRecording && (
                  <>
                    <Button
                      variant="outline"
                      onClick={toggleMic}
                    >
                      {isMicEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant={isPaused ? 'default' : 'outline'}
                      onClick={isPaused ? resumeRecording : pauseRecording}
                    >
                      {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button variant="destructive" onClick={handleStopRecording}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
                
                {recordedUrl && !isRecording && (
                  <>
                    <Input
                      placeholder="Video name..."
                      value={videoName}
                      onChange={(e) => setVideoName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveRecording} disabled={isSaving || !videoName.trim()}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button variant="outline" onClick={resetRecording}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*,image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Upload Media Files</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Videos, audio files, and images
                </p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Select Files
                </Button>
              </div>

              {uploads.length > 0 && (
                <div className="space-y-2">
                  <Label>Recently Uploaded</Label>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {uploads.slice(0, 5).map((media) => (
                        <div
                          key={media.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          {getMediaIcon(media.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{media.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{media.file_type}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMedia(media.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="space-y-4">
              {editingMedia ? (
                <VideoEditor
                  videoUrl={editingMedia.url}
                  videoName={editingMedia.name}
                  onClose={() => setEditingMedia(null)}
                  onSave={(blob, transcript) => {
                    console.log('Video saved with transcript:', transcript.substring(0, 100));
                    setEditingMedia(null);
                    showSuccess('Video saved with updated script');
                  }}
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  {mediaItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileVideo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No recordings or uploads yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* All Media Items */}
                      {mediaItems.map((media) => (
                        <div
                          key={media.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          {media.source === 'recording' && media.metadata?.mode 
                            ? getModeIcon(media.metadata.mode as string) 
                            : getMediaIcon(media.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{media.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {media.duration_seconds ? `${formatDuration(media.duration_seconds)} • ` : ''}
                              {media.source === 'recording' ? 'Recording' : 'Upload'} • 
                              {new Date(media.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {/* Edit button for videos only */}
                          {media.file_type === 'video' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingMedia(media)}
                              title="Edit video (trim, transcribe)"
                            >
                              <Scissors className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(media)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMedia(media.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-4" ref={fullscreenContainerRef}>
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Video Recording - Fullscreen
              </span>
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4">
            <VideoPreview className="flex-1 min-h-[60vh]" videoRef={fullscreenPreviewRef} />
            
            {/* Fullscreen Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording && !recordedUrl && (
                <Button onClick={handleStartRecording} size="lg">
                  <Camera className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              )}
              
              {isRecording && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleMic}
                  >
                    {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={isPaused ? 'default' : 'outline'}
                    size="lg"
                    onClick={isPaused ? resumeRecording : pauseRecording}
                  >
                    {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button variant="destructive" size="lg" onClick={handleStopRecording}>
                    <Square className="h-5 w-5 mr-2" />
                    Stop
                  </Button>
                </>
              )}
              
              {recordedUrl && !isRecording && (
                <>
                  <Input
                    placeholder="Video name..."
                    value={videoName}
                    onChange={(e) => setVideoName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button size="lg" onClick={handleSaveRecording} disabled={isSaving || !videoName.trim()}>
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button variant="outline" size="lg" onClick={resetRecording}>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Script Teleprompter Popup */}
      {selectedScript && (
        <TeleprompterPopup
          title={selectedScript.title}
          content={selectedScript.content}
          type="script"
          isOpen={showScriptTeleprompter}
          onClose={() => setShowScriptTeleprompter(false)}
          isRecording={isRecording}
        />
      )}

      {/* Audio Cue Teleprompter Popup */}
      {selectedAudioFile && (
        <TeleprompterPopup
          title={`Audio: ${selectedAudioFile.name}`}
          content={`Playing voiceover audio:\n\n${selectedAudioFile.name}\n\nThis audio will play automatically when you start recording.\n\nFollow along with your script and let the audio guide your presentation.`}
          type="audio"
          isOpen={showAudioTeleprompter}
          onClose={() => setShowAudioTeleprompter(false)}
          isRecording={isRecording}
        />
      )}
    </>
  );
};
