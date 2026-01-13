/**
 * Multi-File Merger - P1 #13
 * 
 * AI-powered arrangement of multiple video/audio files with transitions.
 * Flow: Import → AI Arrange → Add Transitions → Export
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Files,
  Upload,
  Sparkles,
  Merge,
  Play,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Film,
  Music,
  Loader2,
  CheckCircle,
  Settings,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration: number;
  size: number;
  url: string;
  thumbnail?: string;
  order: number;
  transition: TransitionType;
  aiSuggestion?: string;
}

type TransitionType = 'none' | 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom';

interface MergeSettings {
  outputFormat: 'mp4' | 'mov' | 'webm';
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  audioNormalize: boolean;
  addBackgroundMusic: boolean;
}

interface MultiFileMergerProps {
  onMergeComplete?: (outputUrl: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MultiFileMerger: React.FC<MultiFileMergerProps> = ({
  onMergeComplete,
  className,
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [settings, setSettings] = useState<MergeSettings>({
    outputFormat: 'mp4',
    resolution: '1080p',
    frameRate: 30,
    audioNormalize: true,
    addBackgroundMusic: false,
  });

  const transitions: { value: TransitionType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'dissolve', label: 'Dissolve' },
    { value: 'wipe', label: 'Wipe' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
  ];

  // Mock file upload
  const handleFilesUpload = useCallback(() => {
    const mockFiles: MediaFile[] = [
      {
        id: '1',
        name: 'intro_clip.mp4',
        type: 'video',
        duration: 15,
        size: 25000000,
        url: '/placeholder.svg',
        order: 0,
        transition: 'fade',
      },
      {
        id: '2',
        name: 'main_content.mp4',
        type: 'video',
        duration: 45,
        size: 75000000,
        url: '/placeholder.svg',
        order: 1,
        transition: 'dissolve',
      },
      {
        id: '3',
        name: 'demo_section.mp4',
        type: 'video',
        duration: 30,
        size: 50000000,
        url: '/placeholder.svg',
        order: 2,
        transition: 'slide',
      },
      {
        id: '4',
        name: 'outro.mp4',
        type: 'video',
        duration: 10,
        size: 15000000,
        url: '/placeholder.svg',
        order: 3,
        transition: 'fade',
      },
    ];
    setFiles(mockFiles);
  }, []);

  const aiArrange = useCallback(async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulate AI rearrangement with suggestions
    setFiles(prev => prev.map((f, i) => ({
      ...f,
      order: i,
      aiSuggestion: i === 0 ? 'Good intro placement' : 
                   i === prev.length - 1 ? 'Outro flows well here' :
                   `Optimal position based on content flow`,
      transition: i === 0 ? 'fade' : i === prev.length - 1 ? 'fade' : 'dissolve',
    })));
    
    setIsAnalyzing(false);
  }, []);

  const moveFile = useCallback((id: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newFiles = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];
      return newFiles.map((f, i) => ({ ...f, order: i }));
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id).map((f, i) => ({ ...f, order: i })));
    if (selectedFile === id) setSelectedFile(null);
  }, [selectedFile]);

  const updateTransition = useCallback((id: string, transition: TransitionType) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, transition } : f));
  }, []);

  const startMerge = useCallback(async () => {
    setIsMerging(true);
    setMergeProgress(0);

    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 100));
      setMergeProgress(i);
    }

    setIsMerging(false);
    onMergeComplete?.('/merged_output.mp4');
  }, [onMergeComplete]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / 1000000;
    return `${mb.toFixed(1)} MB`;
  };

  const totalDuration = files.reduce((sum, f) => sum + f.duration, 0);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Merge className="h-5 w-5 text-primary" />
          Multi-File Merger
        </CardTitle>
        <CardDescription>
          Import multiple files, let AI arrange them, and merge with transitions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Zone */}
        {files.length === 0 && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <Files className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
            <p className="text-muted-foreground mb-4">
              Support for MP4, MOV, WEBM, MP3, WAV, PNG, JPG
            </p>
            <Button onClick={handleFilesUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">{files.length} files</Badge>
                <Badge variant="outline">
                  {formatDuration(totalDuration)} total
                </Badge>
                <Badge variant="outline">
                  {formatSize(totalSize)}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={aiArrange}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  AI Arrange
                </Button>
                <Button variant="outline" onClick={handleFilesUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Add More
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[350px] border rounded-lg p-4">
              <div className="space-y-3">
                {files.sort((a, b) => a.order - b.order).map((file, index) => (
                  <div key={file.id}>
                    <div
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        selectedFile === file.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => setSelectedFile(file.id)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Reorder Controls */}
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveFile(file.id, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveFile(file.id, 'down');
                            }}
                            disabled={index === files.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Thumbnail */}
                        <div className="w-24 h-14 bg-muted rounded overflow-hidden flex items-center justify-center">
                          {file.type === 'video' && <Film className="h-6 w-6 text-muted-foreground" />}
                          {file.type === 'audio' && <Music className="h-6 w-6 text-muted-foreground" />}
                          {file.type === 'image' && (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{formatDuration(file.duration)}</span>
                            <span>{formatSize(file.size)}</span>
                            <Badge variant="secondary" className="text-xs">
                              {file.type}
                            </Badge>
                          </div>
                          {file.aiSuggestion && (
                            <p className="text-xs text-primary mt-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              {file.aiSuggestion}
                            </p>
                          )}
                        </div>

                        {/* Transition Select */}
                        <div className="w-32">
                          <Select
                            value={file.transition}
                            onValueChange={(v) => updateTransition(file.id, v as TransitionType)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {transitions.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Transition Indicator */}
                    {index < files.length - 1 && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-px w-8 bg-border" />
                          <span className="capitalize">{file.transition}</span>
                          <div className="h-px w-8 bg-border" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Settings */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <label className="text-xs font-medium">Format</label>
                <Select
                  value={settings.outputFormat}
                  onValueChange={(v) => setSettings(s => ({ ...s, outputFormat: v as MergeSettings['outputFormat'] }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Resolution</label>
                <Select
                  value={settings.resolution}
                  onValueChange={(v) => setSettings(s => ({ ...s, resolution: v as MergeSettings['resolution'] }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Frame Rate</label>
                <Select
                  value={settings.frameRate.toString()}
                  onValueChange={(v) => setSettings(s => ({ ...s, frameRate: parseInt(v) as MergeSettings['frameRate'] }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 fps</SelectItem>
                    <SelectItem value="30">30 fps</SelectItem>
                    <SelectItem value="60">60 fps</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 flex items-end gap-4">
                <Button variant="outline" size="sm">
                  <Settings className="mr-1 h-3 w-3" />
                  More Options
                </Button>
              </div>
            </div>

            {/* Merge Progress */}
            {isMerging && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Merging files...</span>
                  <span className="text-sm text-muted-foreground">{mergeProgress}%</span>
                </div>
                <Progress value={mergeProgress} className="h-2" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Preview Timeline
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={startMerge}
                  disabled={files.length < 2 || isMerging}
                >
                  {isMerging ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Merge className="mr-2 h-4 w-4" />
                  )}
                  {isMerging ? 'Processing...' : 'Merge Files'}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiFileMerger;
