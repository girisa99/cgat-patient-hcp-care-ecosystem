import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import { useMediaRecorder, RecordingMode } from '@/hooks/useMediaRecorder';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface RecordedVideo {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  duration: number;
  mode: RecordingMode;
  createdAt: Date;
  storagePath?: string;
}

interface UploadedMedia {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'audio' | 'image';
  createdAt: Date;
}

export const VideoRecorder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('record');
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('webcam');
  const [videoName, setVideoName] = useState('');
  const [recordings, setRecordings] = useState<RecordedVideo[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const previewRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isRecording,
    isPaused,
    duration,
    recordedBlob,
    recordedUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    webcamStream,
    combinedStream,
  } = useMediaRecorder();
  
  const { showSuccess, showError } = useMasterToast();

  // Show live preview
  useEffect(() => {
    if (previewRef.current) {
      if (isRecording) {
        previewRef.current.srcObject = combinedStream || webcamStream;
        previewRef.current.muted = true;
        previewRef.current.play().catch(console.error);
      } else if (recordedUrl) {
        previewRef.current.srcObject = null;
        previewRef.current.src = recordedUrl;
        previewRef.current.muted = false;
      }
    }
  }, [isRecording, webcamStream, combinedStream, recordedUrl]);

  // Load saved recordings metadata
  useEffect(() => {
    const saved = localStorage.getItem('recordedVideosMetadata');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const videos = parsed.map((v: any) => {
          let url = v.url;
          if (v.storagePath) {
            const { data } = supabase.storage.from('generated-videos').getPublicUrl(v.storagePath);
            url = data.publicUrl;
          }
          return { ...v, url, createdAt: new Date(v.createdAt) };
        });
        setRecordings(videos);
      } catch (e) {
        console.error('Failed to load recordings:', e);
      }
    }
    
    const savedMedia = localStorage.getItem('uploadedMediaMetadata');
    if (savedMedia) {
      try {
        const parsed = JSON.parse(savedMedia);
        setUploadedMedia(parsed.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })));
      } catch (e) {
        console.error('Failed to load uploaded media:', e);
      }
    }
  }, []);

  // Save metadata
  useEffect(() => {
    if (recordings.length > 0) {
      const metadata = recordings.map(r => ({
        id: r.id,
        name: r.name,
        duration: r.duration,
        mode: r.mode,
        createdAt: r.createdAt,
        storagePath: r.storagePath,
        url: r.storagePath ? '' : r.url,
      }));
      localStorage.setItem('recordedVideosMetadata', JSON.stringify(metadata));
    }
  }, [recordings]);

  useEffect(() => {
    if (uploadedMedia.length > 0) {
      localStorage.setItem('uploadedMediaMetadata', JSON.stringify(uploadedMedia));
    }
  }, [uploadedMedia]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    await startRecording(recordingMode);
  };

  const handleSaveRecording = async () => {
    if (!recordedBlob || !videoName.trim()) {
      showError('Please enter a name for the recording');
      return;
    }

    setIsSaving(true);
    try {
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

      const newRecording: RecordedVideo = {
        id: crypto.randomUUID(),
        name: videoName,
        url: urlData.publicUrl,
        blob: recordedBlob,
        duration,
        mode: recordingMode,
        createdAt: new Date(),
        storagePath: data.path,
      };

      setRecordings(prev => [newRecording, ...prev]);
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

        setUploadedMedia(prev => [...prev, {
          id: crypto.randomUUID(),
          name: file.name,
          url: urlData.publicUrl,
          type,
          createdAt: new Date(),
        }]);
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

  const handleDownload = async (video: RecordedVideo) => {
    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${video.name.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showSuccess('Video downloaded');
    } catch (err) {
      console.error('Download error:', err);
      showError('Failed to download video');
    }
  };

  const handleDeleteRecording = async (id: string) => {
    const recording = recordings.find(r => r.id === id);
    if (recording?.storagePath) {
      try {
        await supabase.storage.from('generated-videos').remove([recording.storagePath]);
      } catch (err) {
        console.error('Storage delete error:', err);
      }
    }
    setRecordings(prev => prev.filter(r => r.id !== id));
    showSuccess('Recording deleted');
  };

  const handleDeleteMedia = (id: string) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== id));
    showSuccess('Media deleted');
  };

  const getModeIcon = (mode: RecordingMode) => {
    switch (mode) {
      case 'webcam': return <Camera className="h-4 w-4" />;
      case 'screen': return <Monitor className="h-4 w-4" />;
      case 'screen+webcam': return <MonitorPlay className="h-4 w-4" />;
    }
  };

  const getMediaIcon = (type: 'video' | 'audio' | 'image') => {
    switch (type) {
      case 'video': return <FileVideo className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
    }
  };

  return (
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
              Library ({recordings.length + uploadedMedia.length})
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

            {/* Preview */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={previewRef}
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
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
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
                    variant={isPaused ? 'default' : 'outline'}
                    onClick={isPaused ? resumeRecording : pauseRecording}
                  >
                    {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button variant="destructive" onClick={stopRecording}>
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

            {uploadedMedia.length > 0 && (
              <div className="space-y-2">
                <Label>Recently Uploaded</Label>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {uploadedMedia.slice(0, 5).map((media) => (
                      <div
                        key={media.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        {getMediaIcon(media.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{media.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{media.type}</p>
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
            <ScrollArea className="h-[400px]">
              {recordings.length === 0 && uploadedMedia.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileVideo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recordings or uploads yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Recordings */}
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      {getModeIcon(recording.mode)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{recording.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(recording.duration)} • {recording.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(recording)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRecording(recording.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Uploaded Media */}
                  {uploadedMedia.map((media) => (
                    <div
                      key={media.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      {getMediaIcon(media.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{media.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {media.type} • {media.createdAt.toLocaleDateString()}
                        </p>
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
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
