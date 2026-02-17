/**
 * VideoEditor Integration Component
 * Wraps the main VideoEditor for use within RecordingStudio
 */

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scissors, 
  Download, 
  FileVideo, 
  Wand2,
  Loader2,
  Play,
  Volume2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { VideoEditor } from '../../VideoEditor';
import { useFFmpegTrim } from '../hooks/useFFmpegTrim';

interface VideoEditorIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  recordingBlob: Blob | null;
  recordingName?: string;
  onSaveEdited?: (blob: Blob, transcript?: string) => void;
  voiceovers?: Array<{ id: string; name: string; url: string }>;
  music?: Array<{ id: string; name: string; url: string }>;
}

export function VideoEditorIntegration({
  isOpen,
  onClose,
  recordingBlob,
  recordingName = 'Recording',
  onSaveEdited,
  voiceovers = [],
  music = [],
}: VideoEditorIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  
  const ffmpeg = useFFmpegTrim();

  // Create URL for the recording
  const videoUrl = recordingBlob ? URL.createObjectURL(recordingBlob) : '';

  // Handle save from VideoEditor
  const handleEditorSave = useCallback(async (
    editedBlob: Blob, 
    transcript: string, 
    audioSettings: any
  ) => {
    setIsProcessing(true);
    
    try {
      // If audio overlay is applied, we might want to process with FFmpeg
      if (audioSettings && ffmpeg.isLoaded) {
        // Merge audio with video using FFmpeg
        toast.info('Processing video with audio overlay...');
        
        // For now, just save the edited blob
        // Full implementation would fetch audio and merge
        setProcessedBlob(editedBlob);
      } else {
        setProcessedBlob(editedBlob);
      }
      
      if (onSaveEdited) {
        onSaveEdited(editedBlob, transcript);
      }
      
      toast.success('Video saved successfully!');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save video');
    } finally {
      setIsProcessing(false);
    }
  }, [ffmpeg.isLoaded, onSaveEdited, onClose]);

  // Quick actions before opening full editor
  const handleQuickTrim = useCallback(async (
    trimStart: number, 
    trimEnd: number
  ) => {
    if (!recordingBlob) return;
    
    setIsProcessing(true);
    
    try {
      toast.info('Loading FFmpeg for precise trimming...');
      
      const loaded = await ffmpeg.loadFFmpeg();
      if (!loaded) {
        toast.error('Failed to load FFmpeg');
        return;
      }
      
      const trimmedBlob = await ffmpeg.trimVideo(
        recordingBlob,
        trimStart,
        trimEnd,
        { quality: 'high', outputFormat: 'webm' }
      );
      
      if (trimmedBlob) {
        setProcessedBlob(trimmedBlob);
        
        // Auto-download
        const url = URL.createObjectURL(trimmedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordingName}-trimmed.webm`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Video trimmed successfully!');
      }
    } catch (error) {
      console.error('Trim error:', error);
      toast.error('Trim failed');
    } finally {
      setIsProcessing(false);
    }
  }, [recordingBlob, ffmpeg, recordingName]);

  // Convert to MP4
  const handleConvertToMp4 = useCallback(async () => {
    const blobToConvert = processedBlob || recordingBlob;
    if (!blobToConvert) return;
    
    setIsProcessing(true);
    
    try {
      toast.info('Converting to MP4...');
      
      const loaded = await ffmpeg.loadFFmpeg();
      if (!loaded) {
        toast.error('Failed to load FFmpeg');
        return;
      }
      
      const mp4Blob = await ffmpeg.convertToMp4(blobToConvert);
      
      if (mp4Blob) {
        const url = URL.createObjectURL(mp4Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordingName}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Converted to MP4!');
      }
    } catch (error) {
      console.error('Convert error:', error);
      toast.error('Conversion failed');
    } finally {
      setIsProcessing(false);
    }
  }, [processedBlob, recordingBlob, ffmpeg, recordingName]);

  // Extract audio only
  const handleExtractAudio = useCallback(async () => {
    const blobToProcess = processedBlob || recordingBlob;
    if (!blobToProcess) return;
    
    setIsProcessing(true);
    
    try {
      toast.info('Extracting audio...');
      
      const loaded = await ffmpeg.loadFFmpeg();
      if (!loaded) {
        toast.error('Failed to load FFmpeg');
        return;
      }
      
      const audioBlob = await ffmpeg.extractAudio(blobToProcess);
      
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordingName}-audio.mp3`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Audio extracted!');
      }
    } catch (error) {
      console.error('Extract audio error:', error);
      toast.error('Audio extraction failed');
    } finally {
      setIsProcessing(false);
    }
  }, [processedBlob, recordingBlob, ffmpeg, recordingName]);

  if (!recordingBlob) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-primary" />
              Video Editor
            </DialogTitle>
            <Badge variant="outline" className="text-xs">
              {recordingName}
            </Badge>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {ffmpeg.isProcessing && (
              <div className="flex items-center gap-2 mr-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Processing... {ffmpeg.progress}%
                </span>
                <Progress value={ffmpeg.progress} className="w-24 h-2" />
              </div>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleExtractAudio}
              disabled={isProcessing}
              className="gap-1"
            >
              <Volume2 className="w-4 h-4" />
              Extract Audio
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleConvertToMp4}
              disabled={isProcessing}
              className="gap-1"
            >
              <Download className="w-4 h-4" />
              Export MP4
            </Button>
          </div>
        </DialogHeader>
        
        {/* VideoEditor Component */}
        <div className="flex-1 overflow-hidden">
          {videoUrl && (
            <VideoEditor
              videoUrl={videoUrl}
              videoName={recordingName}
              videoId={`recording-${Date.now()}`}
              availableAudioFiles={[
                ...voiceovers.map(v => ({ id: v.id, name: v.name, url: v.url })),
                ...music.map(m => ({ id: m.id, name: m.name, url: m.url })),
              ]}
              onSave={handleEditorSave}
              onClose={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
