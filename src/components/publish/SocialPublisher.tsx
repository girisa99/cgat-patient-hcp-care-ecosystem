/**
 * Social Publisher - Hybrid Approach
 * 
 * OAuth Login + Direct Post for:
 * - LinkedIn, Twitter/X, YouTube (Good API support)
 * 
 * Download + Manual Share for:
 * - Instagram, TikTok (Restricted APIs)
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Youtube, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Download,
  Upload,
  Link2,
  Check,
  Loader2,
  ExternalLink,
  Copy,
  Share2,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// TikTok icon component (not in Lucide)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'oauth' | 'download';
  connected: boolean;
  color: string;
  description: string;
}

interface SocialPublisherProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  onPublishComplete?: (platforms: string[]) => void;
  className?: string;
}

export const SocialPublisher: React.FC<SocialPublisherProps> = ({
  videoUrl,
  thumbnailUrl,
  defaultTitle = '',
  defaultDescription = '',
  onPublishComplete,
  className
}) => {
  // Platform states
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: Youtube, 
      type: 'oauth',
      connected: false, 
      color: 'text-red-500',
      description: 'Upload directly to your channel'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: Linkedin, 
      type: 'oauth',
      connected: false, 
      color: 'text-blue-600',
      description: 'Share to your professional network'
    },
    { 
      id: 'twitter', 
      name: 'X (Twitter)', 
      icon: Twitter, 
      type: 'oauth',
      connected: false, 
      color: 'text-foreground',
      description: 'Tweet your video'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      type: 'download',
      connected: false, 
      color: 'text-pink-500',
      description: 'Download for Reels/Stories'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: TikTokIcon, 
      type: 'download',
      connected: false, 
      color: 'text-foreground',
      description: 'Download for TikTok'
    },
  ]);

  // Content states
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishedPlatforms, setPublishedPlatforms] = useState<string[]>([]);

  // Connect via OAuth
  const handleConnect = useCallback(async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform || platform.type !== 'oauth') return;

    toast.info(`Connecting to ${platform.name}...`);
    
    try {
      // Use Supabase OAuth for supported providers
      let provider: 'google' | 'linkedin_oidc' | 'twitter' | null = null;
      
      switch (platformId) {
        case 'youtube':
          provider = 'google';
          break;
        case 'linkedin':
          provider = 'linkedin_oidc';
          break;
        case 'twitter':
          provider = 'twitter';
          break;
      }

      if (provider) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/genie-vibe?connected=${platformId}`,
            scopes: platformId === 'youtube' 
              ? 'https://www.googleapis.com/auth/youtube.upload'
              : undefined
          }
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('OAuth connection error:', error);
      toast.error(`Failed to connect to ${platform.name}`);
    }
  }, [platforms]);

  // Toggle platform selection
  const togglePlatform = useCallback((platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  }, []);

  // Download video for manual platforms
  const handleDownload = useCallback(async (platformId: string) => {
    if (!videoUrl) {
      toast.error('No video to download');
      return;
    }

    const platform = platforms.find(p => p.id === platformId);
    toast.info(`Preparing ${platform?.name} optimized video...`);

    try {
      // In production, this would call an edge function to optimize video
      // For now, trigger download
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${title || 'video'}-${platformId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Video downloaded! Open ${platform?.name} to upload.`, {
        action: {
          label: 'Open App',
          onClick: () => {
            // Deep links for mobile apps
            const deepLinks: Record<string, string> = {
              instagram: 'instagram://camera',
              tiktok: 'snssdk1233://camera'
            };
            window.open(deepLinks[platformId] || '#', '_blank');
          }
        }
      });

      setPublishedPlatforms(prev => [...prev, platformId]);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  }, [videoUrl, title, platforms]);

  // Publish to OAuth platforms
  const handlePublish = useCallback(async () => {
    const oauthPlatforms = selectedPlatforms.filter(id => {
      const p = platforms.find(p => p.id === id);
      return p?.type === 'oauth' && p.connected;
    });

    if (oauthPlatforms.length === 0) {
      toast.error('Please connect at least one platform');
      return;
    }

    if (!videoUrl) {
      toast.error('No video to publish');
      return;
    }

    setIsPublishing(true);
    setPublishProgress(0);

    try {
      // Simulate publishing progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 300));
        setPublishProgress(i);
      }

      // In production, this would call edge functions for each platform
      setPublishedPlatforms(prev => [...prev, ...oauthPlatforms]);
      toast.success(`Published to ${oauthPlatforms.length} platforms!`);
      onPublishComplete?.(oauthPlatforms);
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Publishing failed');
    } finally {
      setIsPublishing(false);
      setPublishProgress(0);
    }
  }, [selectedPlatforms, platforms, videoUrl, onPublishComplete]);

  // Copy share link
  const copyShareLink = useCallback(() => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success('Link copied to clipboard!');
    }
  }, [videoUrl]);

  const oauthPlatforms = platforms.filter(p => p.type === 'oauth');
  const downloadPlatforms = platforms.filter(p => p.type === 'download');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Content Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Post Details</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="title" className="text-xs">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* OAuth Platforms (Direct Post) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Direct Post</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Connect & Publish
          </Badge>
        </div>

        <div className="grid gap-2">
          {oauthPlatforms.map(platform => (
            <div
              key={platform.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                selectedPlatforms.includes(platform.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-muted", platform.color)}>
                  <platform.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {platform.name}
                    {publishedPlatforms.includes(platform.id) && (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{platform.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {platform.connected ? (
                  <Switch
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => togglePlatform(platform.id)}
                    disabled={publishedPlatforms.includes(platform.id)}
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(platform.id)}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Download Platforms (Manual Upload) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Download for Mobile Apps</span>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Download & Share
          </Badge>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Instagram and TikTok have limited API access. Download your video and upload directly in their apps for best results.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {downloadPlatforms.map(platform => (
              <Button
                key={platform.id}
                variant="outline"
                className={cn(
                  "h-auto py-3 flex flex-col gap-1",
                  publishedPlatforms.includes(platform.id) && "border-green-500/50 bg-green-500/5"
                )}
                onClick={() => handleDownload(platform.id)}
                disabled={!videoUrl}
              >
                <platform.icon className={cn("h-5 w-5", platform.color)} />
                <span className="text-xs">
                  {publishedPlatforms.includes(platform.id) ? 'Downloaded' : platform.name}
                </span>
                {publishedPlatforms.includes(platform.id) ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Download className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Publishing Progress */}
      {isPublishing && (
        <div className="space-y-2 p-3 bg-primary/5 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Publishing...
            </span>
            <span>{publishProgress}%</span>
          </div>
          <Progress value={publishProgress} className="h-1.5" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          className="flex-1 gap-2"
          onClick={handlePublish}
          disabled={isPublishing || selectedPlatforms.length === 0 || !videoUrl}
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Publish ({selectedPlatforms.length})
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={copyShareLink}
          disabled={!videoUrl}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SocialPublisher;
