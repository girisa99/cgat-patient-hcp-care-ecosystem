/**
 * Publish Panel
 * Final stage in the pipeline: Export, share, and publish recordings
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Share2, 
  Upload, 
  Youtube, 
  Instagram, 
  Film,
  FileVideo,
  FileAudio,
  Loader2,
  Check,
  Copy,
  Link,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import type { TimelineClip } from './MultiClipTimeline';

interface PublishPanelProps {
  clips?: TimelineClip[];
  totalDuration?: number;
  projectName?: string;
  onExport?: (format: string, quality: string) => Promise<void>;
  onShare?: () => void;
  className?: string;
}

// Export formats
const EXPORT_FORMATS = [
  { id: 'mp4', label: 'MP4 Video', icon: FileVideo, description: 'Universal video format' },
  { id: 'webm', label: 'WebM', icon: FileVideo, description: 'Web-optimized video' },
  { id: 'mp3', label: 'Audio Only', icon: FileAudio, description: 'Extract audio track' },
];

// Platform presets
const PLATFORM_PRESETS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, ratio: '16:9', maxDuration: 600 },
  { id: 'instagram-reels', name: 'Instagram Reels', icon: Instagram, ratio: '9:16', maxDuration: 90 },
  { id: 'tiktok', name: 'TikTok', icon: Film, ratio: '9:16', maxDuration: 180 },
];

// Quality options
const QUALITY_OPTIONS = [
  { id: '720p', label: '720p', description: 'HD - Good for web' },
  { id: '1080p', label: '1080p', description: 'Full HD - Recommended' },
  { id: '4k', label: '4K', description: 'Ultra HD - Best quality' },
];

export const PublishPanel: React.FC<PublishPanelProps> = ({
  clips = [],
  totalDuration = 0,
  projectName = 'My Project',
  onExport,
  onShare,
  className
}) => {
  const { shareContent, vibrate } = useMobileFeatures();
  
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = async () => {
    if (clips.length === 0) {
      toast.error('No clips to export. Add content first.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setExportProgress(i);
      }

      await onExport?.(selectedFormat, selectedQuality);
      
      setExportComplete(true);
      vibrate?.(500);
      toast.success('Export complete! Your file is ready to download.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const success = await shareContent({
      title: projectName,
      text: `Check out my video: ${projectName}`,
      url: window.location.href
    });
    
    if (success) {
      toast.success('Shared successfully!');
    }
    onShare?.();
  };

  const handleGenerateThumbnail = async () => {
    toast.info('Generating AI thumbnail...');
    // In production, this would call an AI service
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGeneratedThumbnail('https://via.placeholder.com/1280x720?text=AI+Thumbnail');
    vibrate?.(200);
    toast.success('Thumbnail generated!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Publish</span>
        </div>
        <Badge variant="outline" className="text-[10px] flex items-center gap-1">
          <Film className="h-2.5 w-2.5" />
          {clips.length} clips • {formatDuration(totalDuration)}
        </Badge>
      </div>

      {/* Empty State */}
      {clips.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium">Nothing to Publish Yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Record content and arrange it on the timeline first.
            </p>
          </CardContent>
        </Card>
      )}

      {clips.length > 0 && (
        <>
          {/* Platform Quick Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Platform Preset</label>
            <div className="flex gap-2">
              {PLATFORM_PRESETS.map(platform => (
                <Button
                  key={platform.id}
                  variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-10 flex flex-col gap-0.5 px-2"
                  onClick={() => {
                    setSelectedPlatform(platform.id);
                    // Auto-set format and quality based on platform
                    if (platform.id === 'youtube') {
                      setSelectedQuality('1080p');
                    } else {
                      setSelectedQuality('720p');
                    }
                  }}
                >
                  <platform.icon className="h-4 w-4" />
                  <span className="text-[10px]">{platform.name.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {EXPORT_FORMATS.map(format => (
                <Button
                  key={format.id}
                  variant={selectedFormat === format.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-auto py-2 flex flex-col gap-1"
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <format.icon className="h-4 w-4" />
                  <span className="text-[10px]">{format.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Quality</label>
            <div className="flex gap-2">
              {QUALITY_OPTIONS.map(quality => (
                <Button
                  key={quality.id}
                  variant={selectedQuality === quality.id ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedQuality(quality.id)}
                >
                  {quality.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Thumbnail Generator */}
          <Card className="bg-muted/30">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                AI Thumbnail
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {generatedThumbnail ? (
                <div className="relative aspect-video bg-muted rounded overflow-hidden">
                  <img 
                    src={generatedThumbnail} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2 h-7 text-xs"
                    onClick={handleGenerateThumbnail}
                  >
                    Regenerate
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleGenerateThumbnail}
                >
                  <ImageIcon className="h-3 w-3" />
                  Generate AI Thumbnail
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2 p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Exporting...
                </span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-1.5" />
            </div>
          )}

          {/* Export Complete */}
          {exportComplete && !isExporting && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Export Complete!</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={handleShare}>
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              className="w-full gap-2" 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {selectedFormat.toUpperCase()} ({selectedQuality})
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={copyLink}
              >
                <Link className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PublishPanel;
