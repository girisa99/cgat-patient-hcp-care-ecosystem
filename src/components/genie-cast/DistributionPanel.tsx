/**
 * DISTRIBUTION PANEL
 * Multi-platform publishing with social API connections
 * Supports YouTube, LinkedIn, Facebook, TikTok, Instagram
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Share2,
  Video,
  Youtube,
  Linkedin,
  Facebook,
  Globe,
  Link2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Loader2,
  Settings,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Platform configuration — unified via useSocialPlatforms hook
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';

interface VideoItem {
  id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  generation_status: string;
}

interface PublishStatus {
  platform: string;
  status: 'pending' | 'publishing' | 'published' | 'failed';
  url?: string;
  error?: string;
}

export const DistributionPanel: React.FC = () => {
  const { distributionPlatforms: PLATFORMS } = useSocialPlatforms();
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatuses, setPublishStatuses] = useState<PublishStatus[]>([]);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [platformToConnect, setPlatformToConnect] = useState<string>('');

  // Fetch completed videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['distribution-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, title, video_url, thumbnail_url, description, generation_status')
        .eq('generation_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as VideoItem[];
    },
  });

  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform?.connected) {
      setPlatformToConnect(platformId);
      setShowConnectDialog(true);
      return;
    }
    
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  // Handle video selection
  const handleVideoSelect = (videoId: string) => {
    setSelectedVideo(videoId);
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setCustomTitle(video.title);
      setCustomDescription(video.description || '');
    }
  };

  // Simulate publishing
  const handlePublish = async () => {
    if (!selectedVideo || selectedPlatforms.length === 0) {
      toast.error('Please select a video and at least one platform');
      return;
    }

    setIsPublishing(true);
    
    // Initialize statuses
    const initialStatuses: PublishStatus[] = selectedPlatforms.map(p => ({
      platform: p,
      status: 'pending',
    }));
    setPublishStatuses(initialStatuses);

    // Simulate publishing to each platform
    for (const platformId of selectedPlatforms) {
      setPublishStatuses(prev => 
        prev.map(s => s.platform === platformId ? { ...s, status: 'publishing' } : s)
      );

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Random success/failure for demo
      const success = Math.random() > 0.2;
      setPublishStatuses(prev => 
        prev.map(s => s.platform === platformId ? {
          ...s,
          status: success ? 'published' : 'failed',
          url: success ? `https://${platformId}.com/video/123` : undefined,
          error: success ? undefined : 'API rate limit exceeded',
        } : s)
      );
    }

    setIsPublishing(false);
    toast.success('Publishing complete!');
  };

  // Copy video URL
  const copyVideoUrl = () => {
    const video = videos.find(v => v.id === selectedVideo);
    if (video?.video_url) {
      navigator.clipboard.writeText(video.video_url);
      toast.success('Video URL copied!');
    }
  };

  const selectedVideoData = videos.find(v => v.id === selectedVideo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Multi-Platform Distribution
              </CardTitle>
              <CardDescription>
                Publish your videos to multiple platforms simultaneously
              </CardDescription>
            </div>
            <Badge variant="outline">
              {PLATFORMS.filter(p => p.connected).length}/{PLATFORMS.length} Connected
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Selection */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedVideo} onValueChange={handleVideoSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a video..." />
              </SelectTrigger>
              <SelectContent>
                {videos.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{video.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedVideoData && (
              <div className="mt-4 space-y-3">
                {selectedVideoData.thumbnail_url && (
                  <img 
                    src={selectedVideoData.thumbnail_url} 
                    alt="Thumbnail"
                    className="w-full aspect-video rounded-lg object-cover bg-muted"
                  />
                )}
                
                {selectedVideoData.video_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={copyVideoUrl}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Video URL
                  </Button>
                )}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Selection & Publishing */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                
                return (
                  <div
                    key={platform.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      isSelected 
                        ? `${platform.borderColor} ${platform.bgColor}` 
                        : "border-border hover:border-primary/50",
                      !platform.connected && "opacity-60"
                    )}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-full", platform.bgColor)}>
                        <Icon className={cn("w-5 h-5", platform.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{platform.name}</span>
                          {platform.connected ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Link2 className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {platform.connected ? 'Connected' : 'Click to connect'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Custom metadata */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Enter video description..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handlePublish}
                disabled={!selectedVideo || selectedPlatforms.length === 0 || isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publish to {selectedPlatforms.length} Platform(s)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publishing Status */}
      {publishStatuses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Publishing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {publishStatuses.map((status) => {
                const platform = PLATFORMS.find(p => p.id === status.platform);
                const Icon = platform?.icon || Globe;
                
                return (
                  <div 
                    key={status.platform}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-5 h-5", platform?.color)} />
                      <span className="font-medium">{platform?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {status.status === 'pending' && (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      {status.status === 'publishing' && (
                        <Badge variant="outline" className="text-blue-600">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Publishing
                        </Badge>
                      )}
                      {status.status === 'published' && (
                        <>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                          {status.url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={status.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </>
                      )}
                      {status.status === 'failed' && (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connect Platform Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {PLATFORMS.find(p => p.id === platformToConnect)?.name}</DialogTitle>
            <DialogDescription>
              Connect your account to enable publishing to this platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              OAuth integration required. Connect your {PLATFORMS.find(p => p.id === platformToConnect)?.name} account to start publishing.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.info('OAuth flow would start here');
              setShowConnectDialog(false);
            }}>
              <Link2 className="w-4 h-4 mr-2" />
              Connect Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
