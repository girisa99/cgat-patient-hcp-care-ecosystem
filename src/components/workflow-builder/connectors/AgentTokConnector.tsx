import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Video, Upload, Calendar, BarChart3, Users, 
  Settings, Zap, PlayCircle, Hash, AtSign 
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AgentTokConfig {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  contentType: 'video' | 'image' | 'text' | 'story';
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    time: string;
    timezone: string;
  };
  content: {
    prompt: string;
    hashtags: string[];
    caption: string;
    duration?: number;
    quality: 'standard' | 'hd' | '4k';
  };
  automation: {
    aiGenerated: boolean;
    approvalRequired: boolean;
    autoRepost: boolean;
    engagement: boolean;
  };
  analytics: {
    trackViews: boolean;
    trackEngagement: boolean;
    reportFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

interface AgentTokConnectorProps {
  onConfigurationChange?: (config: AgentTokConfig) => void;
  onConnect?: (config: AgentTokConfig) => void;
  initialConfig?: Partial<AgentTokConfig>;
}

export const AgentTokConnector: React.FC<AgentTokConnectorProps> = ({
  onConfigurationChange,
  onConnect,
  initialConfig = {}
}) => {
  const { showSuccess, showError } = useMasterToast();
  const [config, setConfig] = useState<AgentTokConfig>({
    platform: 'tiktok',
    contentType: 'video',
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '09:00',
      timezone: 'UTC'
    },
    content: {
      prompt: '',
      hashtags: [],
      caption: '',
      duration: 30,
      quality: 'hd'
    },
    automation: {
      aiGenerated: true,
      approvalRequired: true,
      autoRepost: false,
      engagement: true
    },
    analytics: {
      trackViews: true,
      trackEngagement: true,
      reportFrequency: 'weekly'
    },
    ...initialConfig
  });

  const [newHashtag, setNewHashtag] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const updateConfig = (updates: Partial<AgentTokConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigurationChange?.(newConfig);
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !config.content.hashtags.includes(newHashtag.trim())) {
      const updatedHashtags = [...config.content.hashtags, newHashtag.trim()];
      updateConfig({
        content: { ...config.content, hashtags: updatedHashtags }
      });
      setNewHashtag('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    const updatedHashtags = config.content.hashtags.filter(h => h !== hashtag);
    updateConfig({
      content: { ...config.content, hashtags: updatedHashtags }
    });
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onConnect?.(config);
      showSuccess(`Connected to ${config.platform.toUpperCase()} successfully!`);
    } catch (error) {
      showError('Failed to connect to AgentTok. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const platformIcons = {
    tiktok: Video,
    youtube: PlayCircle,
    instagram: Upload,
    twitter: AtSign
  };

  const PlatformIcon = platformIcons[config.platform];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlatformIcon className="h-5 w-5" />
            AgentTok - Social Media Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select 
              value={config.platform} 
              onValueChange={(value: any) => updateConfig({ platform: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    TikTok
                  </div>
                </SelectItem>
                <SelectItem value="youtube">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    YouTube Shorts
                  </div>
                </SelectItem>
                <SelectItem value="instagram">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Instagram Reels
                  </div>
                </SelectItem>
                <SelectItem value="twitter">
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    Twitter/X
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select 
              value={config.contentType} 
              onValueChange={(value: any) => updateConfig({ contentType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Content</SelectItem>
                <SelectItem value="image">Image Post</SelectItem>
                <SelectItem value="text">Text Post</SelectItem>
                <SelectItem value="story">Story/Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Content Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Prompt */}
          <div className="space-y-2">
            <Label>Content Generation Prompt</Label>
            <Textarea
              placeholder="Describe the type of content you want to generate..."
              value={config.content.prompt}
              onChange={(e) => updateConfig({
                content: { ...config.content, prompt: e.target.value }
              })}
              rows={3}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label>Default Caption Template</Label>
            <Textarea
              placeholder="Enter your caption template..."
              value={config.content.caption}
              onChange={(e) => updateConfig({
                content: { ...config.content, caption: e.target.value }
              })}
              rows={2}
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add hashtag..."
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
              />
              <Button onClick={addHashtag} type="button">
                <Hash className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.content.hashtags.map((hashtag) => (
                <Badge 
                  key={hashtag} 
                  variant="secondary" 
                  className="cursor-pointer"
                  onClick={() => removeHashtag(hashtag)}
                >
                  #{hashtag} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Video Duration (for video content) */}
          {config.contentType === 'video' && (
            <div className="space-y-2">
              <Label>Video Duration (seconds)</Label>
              <Input
                type="number"
                min="15"
                max="180"
                value={config.content.duration}
                onChange={(e) => updateConfig({
                  content: { ...config.content, duration: parseInt(e.target.value) }
                })}
              />
            </div>
          )}

          {/* Quality */}
          <div className="space-y-2">
            <Label>Content Quality</Label>
            <Select 
              value={config.content.quality} 
              onValueChange={(value: any) => updateConfig({
                content: { ...config.content, quality: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Quality</SelectItem>
                <SelectItem value="hd">HD Quality</SelectItem>
                <SelectItem value="4k">4K Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling & Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Scheduling</Label>
            <Switch
              checked={config.schedule.enabled}
              onCheckedChange={(checked) => updateConfig({
                schedule: { ...config.schedule, enabled: checked }
              })}
            />
          </div>

          {config.schedule.enabled && (
            <>
              <div className="space-y-2">
                <Label>Posting Frequency</Label>
                <Select 
                  value={config.schedule.frequency} 
                  onValueChange={(value: any) => updateConfig({
                    schedule: { ...config.schedule, frequency: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Posting Time</Label>
                <Input
                  type="time"
                  value={config.schedule.time}
                  onChange={(e) => updateConfig({
                    schedule: { ...config.schedule, time: e.target.value }
                  })}
                />
              </div>
            </>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>AI Content Generation</Label>
              <Switch
                checked={config.automation.aiGenerated}
                onCheckedChange={(checked) => updateConfig({
                  automation: { ...config.automation, aiGenerated: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Require Approval</Label>
              <Switch
                checked={config.automation.approvalRequired}
                onCheckedChange={(checked) => updateConfig({
                  automation: { ...config.automation, approvalRequired: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto Engagement</Label>
              <Switch
                checked={config.automation.engagement}
                onCheckedChange={(checked) => updateConfig({
                  automation: { ...config.automation, engagement: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Track Views</Label>
            <Switch
              checked={config.analytics.trackViews}
              onCheckedChange={(checked) => updateConfig({
                analytics: { ...config.analytics, trackViews: checked }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Track Engagement</Label>
            <Switch
              checked={config.analytics.trackEngagement}
              onCheckedChange={(checked) => updateConfig({
                analytics: { ...config.analytics, trackEngagement: checked }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label>Report Frequency</Label>
            <Select 
              value={config.analytics.reportFrequency} 
              onValueChange={(value: any) => updateConfig({
                analytics: { ...config.analytics, reportFrequency: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Reports</SelectItem>
                <SelectItem value="weekly">Weekly Reports</SelectItem>
                <SelectItem value="monthly">Monthly Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Connection Button */}
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
        className="w-full"
        size="lg"
      >
        <Zap className="h-4 w-4 mr-2" />
        {isConnecting ? 'Connecting...' : `Connect to ${config.platform.toUpperCase()}`}
      </Button>
    </div>
  );
};