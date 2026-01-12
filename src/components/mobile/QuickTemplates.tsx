/**
 * Quick Templates (Social) Component
 * P1 Feature: Pre-built templates for TikTok, Reels, YouTube Shorts, etc.
 * One-tap application of social media format settings
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Video,
  Music,
  Zap,
  Clock,
  Smartphone,
  Monitor,
  Square,
  RectangleVertical,
  RectangleHorizontal,
  Star,
  TrendingUp,
  Sparkles,
  Check,
  Layout,
  Play,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Platform-specific template configurations
export interface SocialTemplate {
  id: string;
  name: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'facebook' | 'universal';
  category: 'short' | 'story' | 'post' | 'long' | 'live';
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  maxDuration: number; // seconds
  recommendedDuration: number;
  resolution: { width: number; height: number };
  features: string[];
  tips: string[];
  trending?: boolean;
  icon: React.ElementType;
  color: string;
  platformColor: string;
}

export interface TemplateConfig {
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  maxDuration: number;
  resolution: { width: number; height: number };
  platform: string;
  templateId: string;
}

interface QuickTemplatesProps {
  onSelectTemplate?: (config: TemplateConfig) => void;
  onApplyTemplate?: (template: SocialTemplate) => void;
  currentAspectRatio?: string;
  className?: string;
}

const SOCIAL_TEMPLATES: SocialTemplate[] = [
  // TikTok
  {
    id: 'tiktok-short',
    name: 'TikTok Short',
    platform: 'tiktok',
    category: 'short',
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedDuration: 30,
    resolution: { width: 1080, height: 1920 },
    features: ['Trending sounds', 'Duet-ready', 'Stitch-compatible'],
    tips: ['Hook in first 3 seconds', 'Use trending audio', 'Add text overlays'],
    trending: true,
    icon: Video,
    color: 'from-pink-500 to-cyan-500',
    platformColor: '#000000',
  },
  {
    id: 'tiktok-story',
    name: 'TikTok Story',
    platform: 'tiktok',
    category: 'story',
    aspectRatio: '9:16',
    maxDuration: 15,
    recommendedDuration: 15,
    resolution: { width: 1080, height: 1920 },
    features: ['Quick share', 'Disappearing', 'Casual feel'],
    tips: ['Behind-the-scenes', 'Quick updates', 'Personal moments'],
    icon: Clock,
    color: 'from-pink-500 to-cyan-500',
    platformColor: '#000000',
  },
  // Instagram
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    platform: 'instagram',
    category: 'short',
    aspectRatio: '9:16',
    maxDuration: 90,
    recommendedDuration: 30,
    resolution: { width: 1080, height: 1920 },
    features: ['Remix-ready', 'Shop tags', 'Audio library'],
    tips: ['Use trending audio', 'Add captions', 'Strong CTA'],
    trending: true,
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    platformColor: '#E4405F',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'instagram',
    category: 'story',
    aspectRatio: '9:16',
    maxDuration: 15,
    recommendedDuration: 15,
    resolution: { width: 1080, height: 1920 },
    features: ['Stickers', 'Polls', 'Links'],
    tips: ['Use interactive stickers', 'Add music', 'Swipe-up CTA'],
    icon: Clock,
    color: 'from-purple-500 to-pink-500',
    platformColor: '#E4405F',
  },
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    platform: 'instagram',
    category: 'post',
    aspectRatio: '1:1',
    maxDuration: 60,
    recommendedDuration: 30,
    resolution: { width: 1080, height: 1080 },
    features: ['Carousel support', 'Long captions', 'Hashtags'],
    tips: ['High quality visuals', 'Engaging caption', 'Relevant hashtags'],
    icon: Square,
    color: 'from-purple-500 to-pink-500',
    platformColor: '#E4405F',
  },
  // YouTube
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    platform: 'youtube',
    category: 'short',
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedDuration: 45,
    resolution: { width: 1080, height: 1920 },
    features: ['Monetizable', 'Subscribe button', 'SEO-friendly'],
    tips: ['Immediate value', 'Clear hook', 'End with CTA'],
    trending: true,
    icon: Video,
    color: 'from-red-500 to-red-600',
    platformColor: '#FF0000',
  },
  {
    id: 'youtube-standard',
    name: 'YouTube Video',
    platform: 'youtube',
    category: 'long',
    aspectRatio: '16:9',
    maxDuration: 600,
    recommendedDuration: 480,
    resolution: { width: 1920, height: 1080 },
    features: ['Full SEO', 'Chapters', 'Cards', 'End screens'],
    tips: ['Strong intro', 'Value-packed', 'Consistent branding'],
    icon: Monitor,
    color: 'from-red-500 to-red-600',
    platformColor: '#FF0000',
  },
  // LinkedIn
  {
    id: 'linkedin-video',
    name: 'LinkedIn Video',
    platform: 'linkedin',
    category: 'post',
    aspectRatio: '1:1',
    maxDuration: 180,
    recommendedDuration: 90,
    resolution: { width: 1080, height: 1080 },
    features: ['Professional', 'Captions required', 'Thought leadership'],
    tips: ['Educational content', 'Add captions', 'Professional tone'],
    icon: Square,
    color: 'from-blue-600 to-blue-700',
    platformColor: '#0A66C2',
  },
  {
    id: 'linkedin-story',
    name: 'LinkedIn Story',
    platform: 'linkedin',
    category: 'story',
    aspectRatio: '9:16',
    maxDuration: 20,
    recommendedDuration: 15,
    resolution: { width: 1080, height: 1920 },
    features: ['Professional updates', 'Behind-the-scenes', 'Quick tips'],
    tips: ['Business casual', 'Quick insights', 'Personal brand'],
    icon: RectangleVertical,
    color: 'from-blue-600 to-blue-700',
    platformColor: '#0A66C2',
  },
  // Twitter/X
  {
    id: 'twitter-video',
    name: 'X/Twitter Video',
    platform: 'twitter',
    category: 'post',
    aspectRatio: '16:9',
    maxDuration: 140,
    recommendedDuration: 60,
    resolution: { width: 1280, height: 720 },
    features: ['Thread-ready', 'Quote tweets', 'Viral potential'],
    tips: ['Punchy opening', 'Controversial takes', 'Conversation starter'],
    icon: RectangleHorizontal,
    color: 'from-gray-800 to-black',
    platformColor: '#000000',
  },
  // Facebook
  {
    id: 'facebook-reel',
    name: 'Facebook Reel',
    platform: 'facebook',
    category: 'short',
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedDuration: 30,
    resolution: { width: 1080, height: 1920 },
    features: ['Wide reach', 'Cross-post to IG', 'Monetizable'],
    tips: ['Entertainment focus', 'Trending sounds', 'Broad appeal'],
    icon: Video,
    color: 'from-blue-500 to-blue-600',
    platformColor: '#1877F2',
  },
  // Universal
  {
    id: 'universal-vertical',
    name: 'Universal Vertical',
    platform: 'universal',
    category: 'short',
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedDuration: 30,
    resolution: { width: 1080, height: 1920 },
    features: ['All platforms', 'One-size-fits-all', 'Maximum reach'],
    tips: ['Avoid platform-specific features', 'Universal audio', 'Clean design'],
    trending: true,
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-500',
    platformColor: '#10B981',
  },
  {
    id: 'universal-square',
    name: 'Universal Square',
    platform: 'universal',
    category: 'post',
    aspectRatio: '1:1',
    maxDuration: 60,
    recommendedDuration: 30,
    resolution: { width: 1080, height: 1080 },
    features: ['All feeds', 'Versatile', 'Easy to crop'],
    tips: ['Works everywhere', 'Safe zones respected', 'Consistent look'],
    icon: Square,
    color: 'from-emerald-500 to-teal-500',
    platformColor: '#10B981',
  },
];

const PLATFORM_FILTERS = [
  { id: 'all', name: 'All', icon: Layout },
  { id: 'tiktok', name: 'TikTok', icon: Video },
  { id: 'instagram', name: 'Instagram', icon: Video },
  { id: 'youtube', name: 'YouTube', icon: Video },
  { id: 'linkedin', name: 'LinkedIn', icon: Video },
  { id: 'universal', name: 'Universal', icon: Smartphone },
];

const CATEGORY_FILTERS = [
  { id: 'all', name: 'All Types' },
  { id: 'short', name: 'Short-Form' },
  { id: 'story', name: 'Stories' },
  { id: 'post', name: 'Posts' },
  { id: 'long', name: 'Long-Form' },
];

export const QuickTemplates: React.FC<QuickTemplatesProps> = ({
  onSelectTemplate,
  onApplyTemplate,
  currentAspectRatio,
  className,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SocialTemplate | null>(null);

  const filteredTemplates = SOCIAL_TEMPLATES.filter(template => {
    const matchesPlatform = selectedPlatform === 'all' || template.platform === selectedPlatform;
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.platform.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = useCallback((template: SocialTemplate) => {
    setSelectedTemplate(template);
    
    const config: TemplateConfig = {
      aspectRatio: template.aspectRatio,
      maxDuration: template.maxDuration,
      resolution: template.resolution,
      platform: template.platform,
      templateId: template.id,
    };
    
    onSelectTemplate?.(config);
    toast.success(`${template.name} template selected`, {
      description: `${template.aspectRatio} • ${template.maxDuration}s max • ${template.resolution.width}x${template.resolution.height}`,
    });
  }, [onSelectTemplate]);

  const handleApplyTemplate = useCallback((template: SocialTemplate) => {
    handleSelectTemplate(template);
    onApplyTemplate?.(template);
  }, [handleSelectTemplate, onApplyTemplate]);

  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className={cn('bg-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Templates
          <Badge variant="secondary" className="ml-auto">
            {filteredTemplates.length} templates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Platform Filter */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {PLATFORM_FILTERS.map(filter => (
              <Button
                key={filter.id}
                variant={selectedPlatform === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform(filter.id)}
                className="shrink-0"
              >
                <filter.icon className="h-4 w-4 mr-1" />
                {filter.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {CATEGORY_FILTERS.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
            {filteredTemplates.map(template => {
              const Icon = template.icon;
              const isSelected = selectedTemplate?.id === template.id;
              const isCurrentRatio = currentAspectRatio === template.aspectRatio;

              return (
                <Card
                  key={template.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md border-2',
                    isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-border',
                    isCurrentRatio && !isSelected && 'ring-1 ring-green-500/30'
                  )}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className={cn(
                            'p-2 rounded-lg bg-gradient-to-br',
                            template.color
                          )}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-1">
                            {template.name}
                            {template.trending && (
                              <TrendingUp className="h-3 w-3 text-orange-500" />
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {template.platform} • {template.category}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        {template.aspectRatio}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(template.maxDuration)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.resolution.width}×{template.resolution.height}
                      </Badge>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 2).map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.features.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Apply Button */}
                    <Button
                      size="sm"
                      className="w-full"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTemplate(template);
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Selected Template Tips */}
        {selectedTemplate && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Tips for {selectedTemplate.name}
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {selectedTemplate.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Zap className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickTemplates;
