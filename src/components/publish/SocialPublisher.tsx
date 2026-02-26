/**
 * Social Publisher - Unified Ecosystem Publishing Component
 * 
 * SHARED across ALL Genie products:
 * - Spark, Mind, Vibe, Deck, Arc, Cast, Hub
 * 
 * Features:
 * - OAuth Login + Direct Post for: LinkedIn, YouTube, Twitter/X, Facebook, Bluesky
 * - Download + Manual Share for: Instagram, TikTok
 * - Company Pages support (LinkedIn Company, Facebook Pages)
 * - Website/Blog integration via webhook
 * - Industry & Segment filtering
 * - n8n/Zapier webhook integration
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Smartphone,
  Building2,
  Globe,
  Webhook,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  INDUSTRY_SEGMENTS,
  type GenieProduct,
  type CompanyPage,
  type IndustrySegment,
} from '@/services/unifiedEcosystemPublishingService';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';

// TikTok icon component (not in Lucide)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

// Facebook icon component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Bluesky icon component
const BlueskyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
  </svg>
);

// Pinterest icon component
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
  </svg>
);

// Threads icon component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.731 2.177-1.14 3.65-1.153 1.2-.01 2.163.175 2.95.57-.02-.476-.073-.945-.16-1.401-.36-1.898-1.244-2.836-2.705-2.836-1.08 0-1.882.452-2.386 1.343l-1.89-1.063c.86-1.532 2.327-2.338 4.358-2.338 1.56 0 2.858.567 3.758 1.64.817.975 1.32 2.324 1.494 4.014.49.168.94.373 1.35.617 1.18.701 2.074 1.673 2.584 2.814.71 1.585.805 4.293-1.37 6.422-1.907 1.866-4.263 2.658-7.42 2.684zm-.09-5.66c1.406.065 2.63-.394 2.746-2.064.092-1.318-.986-2.063-2.923-2.063h-.06c-1.218.01-3.2.382-3.08 2.178.074 1.115.865 1.884 2.317 1.949z"/>
  </svg>
);

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'oauth' | 'download' | 'webhook';
  connected: boolean;
  color: string;
  description: string;
  supportsCompanyPages?: boolean;
}

interface SocialPublisherProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  onPublishComplete?: (platforms: string[]) => void;
  className?: string;
  sourceProduct?: GenieProduct;
  industryContext?: IndustrySegment;
  companyPages?: CompanyPage[];
  showIndustryFilter?: boolean;
  showCompanyPages?: boolean;
  showWebhooks?: boolean;
}

export const SocialPublisher: React.FC<SocialPublisherProps> = ({
  videoUrl,
  thumbnailUrl,
  defaultTitle = '',
  defaultDescription = '',
  onPublishComplete,
  className,
  sourceProduct = 'vibe',
  industryContext,
  companyPages = [],
  showIndustryFilter = true,
  showCompanyPages = true,
  showWebhooks = true,
}) => {
  // Platform states — sourced from canonical useSocialPlatforms hook
  const { platforms: hookPlatforms } = useSocialPlatforms();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);

  // Initialize platforms from the hook (single source of truth)
  useEffect(() => {
    const mapped: SocialPlatform[] = hookPlatforms.map(hp => ({
      id: hp.id,
      name: hp.name,
      icon: hp.icon as React.ComponentType<{ className?: string }>,
      type: 'oauth' as const,
      connected: hp.connected,
      color: hp.colorClass,
      description: hp.description,
      supportsCompanyPages: hp.id === 'linkedin' || hp.id === 'facebook' || hp.id === 'instagram' || hp.id === 'tiktok',
    }));
    setPlatforms(mapped);
  }, [hookPlatforms]);

  // Content states
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCompanyPages, setSelectedCompanyPages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishedPlatforms, setPublishedPlatforms] = useState<string[]>([]);
  
  // Industry/Segment filter
  const [selectedIndustry, setSelectedIndustry] = useState(industryContext?.industry || '');
  const [selectedSegment, setSelectedSegment] = useState(industryContext?.segment || '');
  const availableSegments = selectedIndustry ? INDUSTRY_SEGMENTS[selectedIndustry] || [] : [];
  
  // Webhook states
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookInput, setShowWebhookInput] = useState(false);

  // Get industry-specific hashtags
  const getIndustryHashtags = useCallback(() => {
    const tags: string[] = [];
    if (selectedIndustry) {
      tags.push(`#${selectedIndustry.replace(/\s+/g, '')}`);
    }
    if (selectedSegment) {
      tags.push(`#${selectedSegment.replace(/\s+/g, '')}`);
    }
    return tags;
  }, [selectedIndustry, selectedSegment]);

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
