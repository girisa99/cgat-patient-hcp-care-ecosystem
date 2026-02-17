/**
 * Distribution Agent Panel
 * Multi-platform distribution UI with scheduling and cloud storage
 * Supports: Social Media, Professional, Cloud Storage (S3, Dropbox)
 * Integration: n8n MCP + Direct API + Hybrid
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Share2,
  Upload,
  Calendar,
  Clock,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Loader2,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Cloud,
  Link2,
  Zap,
  Settings2,
  ChevronRight,
  Timer,
  ExternalLink,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useDistributionAgent,
  AllPlatforms,
  SocialPlatform,
  ProfessionalPlatform,
  CloudPlatform,
  ScheduleType,
  IntegrationMode,
  DistributionRequest,
  DistributionResult,
  PLATFORM_SPECS,
} from '@/hooks/useDistributionAgent';

interface DistributionAgentPanelProps {
  videoUrl?: string;
  videoTitle?: string;
  onClose?: () => void;
  onDistributionComplete?: (results: DistributionResult[]) => void;
  className?: string;
}

// Platform Icons
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <span className="text-xs font-bold">TT</span>,
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  snapchat: <span className="text-xs font-bold">SC</span>,
  threads: <span className="text-xs font-bold">TH</span>,
  vimeo: <span className="text-xs font-bold">V</span>,
  wistia: <span className="text-xs font-bold">W</span>,
  brightcove: <span className="text-xs font-bold">BC</span>,
  s3: <Cloud className="h-4 w-4" />,
  dropbox: <Cloud className="h-4 w-4" />,
  google_drive: <Cloud className="h-4 w-4" />,
  onedrive: <Cloud className="h-4 w-4" />,
};

// Platform Colors
const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-500',
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  tiktok: 'bg-black',
  facebook: 'bg-blue-600',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-700',
  snapchat: 'bg-yellow-400',
  threads: 'bg-black',
  vimeo: 'bg-cyan-500',
  wistia: 'bg-blue-400',
  s3: 'bg-orange-500',
  dropbox: 'bg-blue-500',
  google_drive: 'bg-green-500',
  onedrive: 'bg-blue-600',
};

// Platform Categories
const SOCIAL_PLATFORMS: SocialPlatform[] = ['youtube', 'instagram', 'tiktok', 'facebook', 'twitter', 'linkedin', 'snapchat', 'threads'];
const PROFESSIONAL_PLATFORMS: ProfessionalPlatform[] = ['vimeo', 'wistia', 'brightcove', 'loom', 'vidyard'];
const CLOUD_PLATFORMS: CloudPlatform[] = ['s3', 'dropbox', 'google_drive', 'onedrive'];

export const DistributionAgentPanel: React.FC<DistributionAgentPanelProps> = ({
  videoUrl = '',
  videoTitle = '',
  onClose,
  onDistributionComplete,
  className,
}) => {
  // Hook
  const {
    isDistributing,
    progress,
    currentPlatform,
    queue,
    results,
    error,
    distribute,
    scheduleDistribution,
    getOptimalTiming,
    cancelDistribution,
    retryFailed,
    getPlatformSpec,
    validateForPlatform,
    generateMetadata,
  } = useDistributionAgent();

  // State
  const [selectedPlatforms, setSelectedPlatforms] = useState<AllPlatforms[]>([]);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('immediate');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [integrationMode, setIntegrationMode] = useState<IntegrationMode>('hybrid');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('platforms');
  
  // Metadata
  const [title, setTitle] = useState(videoTitle);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  
  // Cloud config
  const [cloudBucket, setCloudBucket] = useState('');
  const [cloudPath, setCloudPath] = useState('videos');

  // Toggle platform selection
  const togglePlatform = useCallback((platform: AllPlatforms) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  }, []);

  // Select all in category
  const selectCategory = useCallback((platforms: AllPlatforms[]) => {
    setSelectedPlatforms(prev => {
      const allSelected = platforms.every(p => prev.includes(p));
      if (allSelected) {
        return prev.filter(p => !platforms.includes(p));
      }
      return [...new Set([...prev, ...platforms])];
    });
  }, []);

  // Generate AI metadata
  const handleGenerateMetadata = useCallback(async () => {
    if (!videoUrl || selectedPlatforms.length === 0) {
      toast.error('Select platforms and ensure video is loaded');
      return;
    }

    const platform = selectedPlatforms[0];
    const metadata = await generateMetadata(videoUrl, platform);
    
    setTitle(metadata.title);
    setDescription(metadata.description);
    setTags(metadata.tags.join(', '));
    toast.success('AI generated metadata applied');
  }, [videoUrl, selectedPlatforms, generateMetadata]);

  // Get AI optimal timing
  const handleGetOptimalTiming = useCallback(async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Select platforms first');
      return;
    }

    const timing = await getOptimalTiming(selectedPlatforms);
    const firstPlatform = selectedPlatforms[0];
    const optimalDate = timing[firstPlatform];
    
    setScheduledDate(optimalDate.toISOString().split('T')[0]);
    setScheduledTime(optimalDate.toTimeString().slice(0, 5));
    setScheduleType('ai_optimized');
    toast.success('AI optimized timing applied');
  }, [selectedPlatforms, getOptimalTiming]);

  // Handle distribution
  const handleDistribute = useCallback(async () => {
    if (!videoUrl) {
      toast.error('No video to distribute');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    const request: DistributionRequest = {
      videoUrl,
      platforms: selectedPlatforms,
      schedule: {
        type: scheduleType,
        scheduledAt: scheduleType !== 'immediate' && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`)
          : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      integrationMode,
      n8nConfig: n8nWebhookUrl ? { webhookUrl: n8nWebhookUrl } : undefined,
      metadata: {
        title: title || 'Untitled Video',
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        visibility,
      },
      cloudConfig: cloudBucket ? { bucket: cloudBucket, path: cloudPath } : undefined,
    };

    if (scheduleType === 'immediate') {
      const distributionResults = await distribute(request);
      onDistributionComplete?.(distributionResults);
    } else {
      await scheduleDistribution(request);
      toast.success('Distribution scheduled!');
    }
  }, [
    videoUrl, selectedPlatforms, scheduleType, scheduledDate, scheduledTime,
    integrationMode, n8nWebhookUrl, title, description, tags, visibility,
    cloudBucket, cloudPath, distribute, scheduleDistribution, onDistributionComplete,
  ]);

  // Platform selection card
  const PlatformCard = ({ platform, selected }: { platform: AllPlatforms; selected: boolean }) => {
    const spec = PLATFORM_SPECS[platform];
    return (
      <button
        onClick={() => togglePlatform(platform)}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
          selected
            ? "border-primary bg-primary/10"
            : "border-muted hover:border-primary/50"
        )}
      >
        <div className={cn(
          "w-7 h-7 rounded flex items-center justify-center text-white",
          PLATFORM_COLORS[platform] || 'bg-muted'
        )}>
          {PLATFORM_ICONS[platform]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium capitalize">{platform.replace('_', ' ')}</p>
          <p className="text-[10px] text-muted-foreground">
            {spec.aspectRatio !== 'any' ? spec.aspectRatio : 'Any format'}
          </p>
        </div>
        {selected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
      </button>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Share2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Distribution Agent</CardTitle>
              <CardDescription className="text-xs">Multi-platform publish & schedule</CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="platforms" className="text-xs">Platforms</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
            <TabsTrigger value="metadata" className="text-xs">Metadata</TabsTrigger>
            <TabsTrigger value="queue" className="text-xs">Queue</TabsTrigger>
          </TabsList>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4 mt-4">
            {/* Social Platforms */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Social Media</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => selectCategory(SOCIAL_PLATFORMS)}
                >
                  {SOCIAL_PLATFORMS.every(p => selectedPlatforms.includes(p)) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SOCIAL_PLATFORMS.map(platform => (
                  <PlatformCard
                    key={platform}
                    platform={platform}
                    selected={selectedPlatforms.includes(platform)}
                  />
                ))}
              </div>
            </div>

            {/* Professional Platforms */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Professional</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => selectCategory(PROFESSIONAL_PLATFORMS)}
                >
                  Select All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PROFESSIONAL_PLATFORMS.slice(0, 4).map(platform => (
                  <PlatformCard
                    key={platform}
                    platform={platform}
                    selected={selectedPlatforms.includes(platform)}
                  />
                ))}
              </div>
            </div>

            {/* Cloud Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Cloud Storage</Label>
                <Badge variant="outline" className="text-[9px]">S3 + Dropbox</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CLOUD_PLATFORMS.map(platform => (
                  <PlatformCard
                    key={platform}
                    platform={platform}
                    selected={selectedPlatforms.includes(platform)}
                  />
                ))}
              </div>
            </div>

            {/* Integration Mode */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-medium">Integration Mode</Label>
              <div className="flex gap-2">
                {(['direct', 'n8n', 'hybrid'] as IntegrationMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setIntegrationMode(mode)}
                    className={cn(
                      "flex-1 p-2 rounded-lg border text-center transition-all",
                      integrationMode === mode
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <p className="text-xs font-medium capitalize">{mode}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {mode === 'direct' && 'API calls'}
                      {mode === 'n8n' && 'Workflow'}
                      {mode === 'hybrid' && 'Best of both'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* n8n Config (if selected) */}
            {(integrationMode === 'n8n' || integrationMode === 'hybrid') && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">n8n Webhook URL</Label>
                <Input
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n.com/webhook/..."
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Configure in n8n: Settings → MCP access → Enable
                </p>
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 mt-4">
            {/* Schedule Type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">When to Publish</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'immediate' as ScheduleType, label: 'Now', icon: <Zap className="h-3.5 w-3.5" /> },
                  { type: 'queue' as ScheduleType, label: 'Queue', icon: <Timer className="h-3.5 w-3.5" /> },
                  { type: 'ai_optimized' as ScheduleType, label: 'AI Optimal', icon: <Sparkles className="h-3.5 w-3.5" /> },
                  { type: 'calendar' as ScheduleType, label: 'Calendar', icon: <Calendar className="h-3.5 w-3.5" /> },
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => setScheduleType(type)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-all",
                      scheduleType === type
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <span className={cn(scheduleType === type ? "text-primary" : "text-muted-foreground")}>
                      {icon}
                    </span>
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date/Time picker for scheduled */}
            {scheduleType !== 'immediate' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* AI Optimization Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={handleGetOptimalTiming}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Get AI Optimal Time
                </Button>
              </div>
            )}

            {/* Cloud Config */}
            {selectedPlatforms.some(p => CLOUD_PLATFORMS.includes(p as CloudPlatform)) && (
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-xs font-medium">Cloud Storage Settings</Label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Bucket / Folder</Label>
                    <Input
                      value={cloudBucket}
                      onChange={(e) => setCloudBucket(e.target.value)}
                      placeholder="my-video-bucket"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Path</Label>
                    <Input
                      value={cloudPath}
                      onChange={(e) => setCloudPath(e.target.value)}
                      placeholder="videos/exports"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Video Metadata</Label>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] px-2"
                onClick={handleGenerateMetadata}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generate
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description..."
                  className="min-h-[60px] text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tags (comma separated)</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="video, content, creative"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-3 mt-4">
            {queue.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No queued distributions</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-2">
                  {queue.map((item) => (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-medium">
                            {item.request.platforms.length} platforms
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.createdAt.toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={item.status === 'completed' ? 'default' : 'secondary'}
                          className="text-[9px]"
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.results.map((result) => (
                          <div
                            key={result.platform}
                            className={cn(
                              "w-5 h-5 rounded flex items-center justify-center text-white text-[8px]",
                              result.status === 'success' ? PLATFORM_COLORS[result.platform] : 'bg-muted',
                              result.status === 'failed' && 'opacity-50'
                            )}
                            title={`${result.platform}: ${result.status}`}
                          >
                            {result.status === 'success' ? '✓' : result.status === 'failed' ? '✕' : '...'}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-1">
                        {item.results.some(r => r.status === 'failed') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => retryFailed(item.id)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry Failed
                          </Button>
                        )}
                        {item.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-destructive"
                            onClick={() => cancelDistribution(item.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Progress */}
        {isDistributing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>
                Distributing to {currentPlatform}...
              </span>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {results.length > 0 && !isDistributing && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="text-xs font-medium flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-green-500" />
              Distribution Complete
            </p>
            <div className="flex flex-wrap gap-1.5">
              {results.map((result) => (
                <a
                  key={result.platform}
                  href={result.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-colors",
                    result.status === 'success'
                      ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                      : result.status === 'failed'
                      ? "bg-red-500/10 text-red-600"
                      : "bg-yellow-500/10 text-yellow-600"
                  )}
                >
                  <span className="capitalize">{result.platform}</span>
                  {result.status === 'success' && result.url && (
                    <ExternalLink className="h-2.5 w-2.5" />
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full"
          onClick={handleDistribute}
          disabled={isDistributing || selectedPlatforms.length === 0}
        >
          {isDistributing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Distributing...
            </>
          ) : scheduleType === 'immediate' ? (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Distribute to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule for {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {/* Platform count summary */}
        {selectedPlatforms.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <span>{selectedPlatforms.filter(p => SOCIAL_PLATFORMS.includes(p as any)).length} social</span>
            <span>•</span>
            <span>{selectedPlatforms.filter(p => PROFESSIONAL_PLATFORMS.includes(p as any)).length} professional</span>
            <span>•</span>
            <span>{selectedPlatforms.filter(p => CLOUD_PLATFORMS.includes(p as any)).length} cloud</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DistributionAgentPanel;
