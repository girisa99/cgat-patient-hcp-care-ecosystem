/**
 * SERP Preview Panel - Premium SEO Feature
 * 
 * Differentiators:
 * - Live preview of how content appears in YouTube/Google/TikTok search
 * - Character limit validation with visual indicators
 * - Thumbnail preview with click-through optimization
 * - Mobile vs Desktop preview modes
 * 
 * This is a key differentiator from traditional SEO agencies
 * that focus on website SEO, not video SERP optimization.
 */

import React, { useState, useMemo } from 'react';
import {
  Monitor,
  Smartphone,
  Youtube,
  Search,
  Globe,
  Eye,
  ThumbsUp,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SERPPreviewPanelProps {
  initialTitle?: string;
  initialDescription?: string;
  thumbnailUrl?: string;
  channelName?: string;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

// Character limits per platform
const CHAR_LIMITS = {
  youtube: { title: 100, description: 5000, displayedDesc: 120 },
  google: { title: 60, description: 160, displayedDesc: 160 },
  tiktok: { title: 150, description: 2200, displayedDesc: 100 },
  linkedin: { title: 200, description: 3000, displayedDesc: 150 },
};

export const SERPPreviewPanel: React.FC<SERPPreviewPanelProps> = ({
  initialTitle = '',
  initialDescription = '',
  thumbnailUrl = '',
  channelName = 'Genie Studio',
  isPremium = true,
  onUpgrade,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [platform, setPlatform] = useState<'youtube' | 'google' | 'tiktok' | 'linkedin'>('youtube');

  // Calculate character status
  const getCharStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 100) return { status: 'error', icon: XCircle, color: 'text-red-500' };
    if (percentage > 85) return { status: 'warning', icon: AlertTriangle, color: 'text-yellow-500' };
    return { status: 'good', icon: CheckCircle, color: 'text-green-500' };
  };

  const titleStatus = useMemo(() => getCharStatus(title.length, CHAR_LIMITS[platform].title), [title, platform]);
  const descStatus = useMemo(() => getCharStatus(description.length, CHAR_LIMITS[platform].description), [description, platform]);

  // Truncate for display
  const displayTitle = title.length > CHAR_LIMITS[platform].title 
    ? title.slice(0, CHAR_LIMITS[platform].title - 3) + '...' 
    : title;
    
  const displayDesc = description.length > CHAR_LIMITS[platform].displayedDesc
    ? description.slice(0, CHAR_LIMITS[platform].displayedDesc - 3) + '...'
    : description;

  // Premium gate
  if (!isPremium) {
    return (
      <Card className="border-dashed border-2 border-primary/30">
        <CardContent className="py-12 text-center">
          <Eye className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
          <h3 className="text-xl font-semibold mb-2">SERP Preview</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            See exactly how your video will appear in YouTube, Google, TikTok, and LinkedIn search results.
          </p>
          <Button onClick={onUpgrade} size="lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            SERP Preview
          </CardTitle>
          <CardDescription>
            Preview how your content appears in search results across platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Title</label>
                <span className={cn("text-xs flex items-center gap-1", titleStatus.color)}>
                  <titleStatus.icon className="w-3 h-3" />
                  {title.length}/{CHAR_LIMITS[platform].title}
                </span>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your video title..."
                className={cn(
                  titleStatus.status === 'error' && 'border-red-500',
                  titleStatus.status === 'warning' && 'border-yellow-500'
                )}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Description</label>
                <span className={cn("text-xs flex items-center gap-1", descStatus.color)}>
                  <descStatus.icon className="w-3 h-3" />
                  {description.length}/{CHAR_LIMITS[platform].description}
                </span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your description..."
                rows={2}
                className={cn(
                  descStatus.status === 'error' && 'border-red-500',
                  descStatus.status === 'warning' && 'border-yellow-500'
                )}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="w-4 h-4 mr-1" />
                Desktop
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile
              </Button>
            </div>
            <Tabs value={platform} onValueChange={(v) => setPlatform(v as any)}>
              <TabsList>
                <TabsTrigger value="youtube" className="flex items-center gap-1">
                  <Youtube className="w-3 h-3" />
                  YouTube
                </TabsTrigger>
                <TabsTrigger value="google" className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  Google
                </TabsTrigger>
                <TabsTrigger value="tiktok" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  TikTok
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  LinkedIn
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview - {platform.charAt(0).toUpperCase() + platform.slice(1)} ({viewMode})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn(
            "p-4 bg-background",
            viewMode === 'mobile' && "max-w-[375px] mx-auto"
          )}>
            {/* YouTube Preview */}
            {platform === 'youtube' && (
              <div className={cn(
                "flex gap-3",
                viewMode === 'mobile' && "flex-col"
              )}>
                {/* Thumbnail */}
                <div className={cn(
                  "relative bg-muted rounded-lg overflow-hidden flex-shrink-0",
                  viewMode === 'desktop' ? "w-[246px] h-[138px]" : "w-full aspect-video"
                )}>
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Youtube className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    4:32
                  </div>
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 text-foreground hover:text-primary cursor-pointer">
                    {displayTitle || 'Enter a title to preview'}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span>125K views</span>
                    <span>•</span>
                    <span>2 days ago</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-muted-foreground">{channelName}</span>
                    <CheckCircle className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {displayDesc || 'Enter a description to preview'}
                  </p>
                </div>
              </div>
            )}

            {/* Google Preview */}
            {platform === 'google' && (
              <div className="max-w-[600px]">
                <div className="text-xs text-muted-foreground mb-1">
                  youtube.com › watch
                </div>
                <h3 className="text-lg text-blue-600 hover:underline cursor-pointer font-medium">
                  {displayTitle || 'Enter a title to preview'} - YouTube
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {displayDesc || 'Enter a description to preview'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    4:32
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    125K views
                  </span>
                  <span>2 days ago</span>
                </div>
              </div>
            )}

            {/* TikTok Preview */}
            {platform === 'tiktok' && (
              <div className={cn(
                "bg-black rounded-xl overflow-hidden",
                viewMode === 'desktop' ? "w-[300px]" : "w-full"
              )}>
                <div className="aspect-[9/16] bg-gradient-to-b from-gray-800 to-gray-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-16 h-16 text-gray-600" />
                  </div>
                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/30" />
                      <span className="text-white text-sm font-medium">{channelName}</span>
                      <Button variant="secondary" size="sm" className="h-6 text-xs">
                        Follow
                      </Button>
                    </div>
                    <p className="text-white text-sm line-clamp-2">
                      {displayDesc || 'Enter a description to preview'} #fyp #viral
                    </p>
                  </div>
                  {/* Side actions */}
                  <div className="absolute right-3 bottom-20 flex flex-col gap-4 items-center">
                    <div className="flex flex-col items-center">
                      <ThumbsUp className="w-8 h-8 text-white" />
                      <span className="text-white text-xs">45.2K</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LinkedIn Preview */}
            {platform === 'linkedin' && (
              <div className="border rounded-lg overflow-hidden max-w-[550px]">
                <div className="p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium">{channelName}</div>
                    <div className="text-xs text-muted-foreground">Company • 50K followers</div>
                    <div className="text-xs text-muted-foreground">2h • 🌐</div>
                  </div>
                </div>
                <div className="px-3 pb-2">
                  <p className="text-sm line-clamp-3">
                    {displayDesc || 'Enter a description to preview'}
                  </p>
                </div>
                <div className="aspect-video bg-muted relative">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Video" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Globe className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-primary border-b-8 border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t">
                  <h4 className="font-medium text-sm">{displayTitle || 'Enter a title'}</h4>
                  <div className="text-xs text-muted-foreground">youtube.com</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Optimization Tips for {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {platform === 'youtube' && (
              <>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Include primary keyword in first 60 characters</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use numbers or brackets to increase CTR by 30%</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Add timestamps in description for chapters</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>First 3 lines of description visible without "Show more"</span>
                </div>
              </>
            )}
            {platform === 'google' && (
              <>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Keep title under 60 characters to avoid truncation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Meta description should be 150-160 characters</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Include call-to-action in description</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use power words: "Ultimate", "Complete", "Guide"</span>
                </div>
              </>
            )}
            {platform === 'tiktok' && (
              <>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>First 2 lines visible - hook immediately</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use 3-5 relevant hashtags, not more</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Include trending sounds for algorithm boost</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Niche hashtags perform better than generic #fyp</span>
                </div>
              </>
            )}
            {platform === 'linkedin' && (
              <>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>First 3 lines visible - start with a hook</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use line breaks for readability</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>3-5 hashtags at end, not inline</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Native video gets 5x more reach than links</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
