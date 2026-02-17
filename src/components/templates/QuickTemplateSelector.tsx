/**
 * Quick Template Selector - P1 #83
 * 
 * Pre-built templates for TikTok, Reels, Shorts, and other formats.
 * Mobile-first design for quick content creation.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Clock,
  Smartphone,
  Monitor,
  Square,
  Film,
  Sparkles,
  Search,
  Star,
  TrendingUp,
  Zap,
  BookOpen,
  ShoppingBag,
  MessageSquare,
  Lightbulb,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';
export type Platform = 'tiktok' | 'reels' | 'shorts' | 'youtube' | 'linkedin' | 'twitter';
export type TemplateCategory = 'trending' | 'education' | 'product' | 'story' | 'promo' | 'testimonial';

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  platforms: Platform[];
  aspectRatio: AspectRatio;
  duration: number; // seconds
  structure: TemplateSection[];
  tags: string[];
  popularity: number;
  isNew?: boolean;
  isPremium?: boolean;
  previewUrl?: string;
  thumbnailColor: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  type: 'hook' | 'content' | 'cta' | 'transition' | 'b-roll';
  duration: number;
  prompt?: string;
  required: boolean;
}

interface QuickTemplateSelectorProps {
  onSelect: (template: VideoTemplate) => void;
  selectedPlatform?: Platform;
  className?: string;
}

// ============================================================================
// DATA
// ============================================================================

const TEMPLATES: VideoTemplate[] = [
  // TikTok/Reels/Shorts - 15-60 seconds
  {
    id: 'hook-story-cta',
    name: 'Hook → Story → CTA',
    description: 'Classic viral format: grab attention, tell story, drive action',
    category: 'trending',
    platforms: ['tiktok', 'reels', 'shorts'],
    aspectRatio: '9:16',
    duration: 30,
    structure: [
      { id: 'hook', name: 'Hook', type: 'hook', duration: 3, prompt: 'Attention-grabbing opening', required: true },
      { id: 'story', name: 'Main Story', type: 'content', duration: 22, prompt: 'Core message or story', required: true },
      { id: 'cta', name: 'Call to Action', type: 'cta', duration: 5, prompt: 'What should viewers do?', required: true },
    ],
    tags: ['viral', 'engagement', 'storytelling'],
    popularity: 95,
    thumbnailColor: 'bg-gradient-to-br from-pink-500 to-purple-600',
  },
  {
    id: 'tutorial-quick',
    name: '60-Second Tutorial',
    description: 'Quick how-to with step-by-step breakdown',
    category: 'education',
    platforms: ['tiktok', 'reels', 'shorts', 'youtube'],
    aspectRatio: '9:16',
    duration: 60,
    structure: [
      { id: 'intro', name: 'Problem Statement', type: 'hook', duration: 5, prompt: 'What problem are we solving?', required: true },
      { id: 'step1', name: 'Step 1', type: 'content', duration: 15, required: true },
      { id: 'step2', name: 'Step 2', type: 'content', duration: 15, required: true },
      { id: 'step3', name: 'Step 3', type: 'content', duration: 15, required: true },
      { id: 'result', name: 'Result & CTA', type: 'cta', duration: 10, prompt: 'Show the outcome', required: true },
    ],
    tags: ['tutorial', 'educational', 'how-to'],
    popularity: 88,
    thumbnailColor: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Highlight features with visual appeal',
    category: 'product',
    platforms: ['tiktok', 'reels', 'shorts'],
    aspectRatio: '9:16',
    duration: 30,
    structure: [
      { id: 'reveal', name: 'Product Reveal', type: 'hook', duration: 3, required: true },
      { id: 'feature1', name: 'Key Feature 1', type: 'content', duration: 7, required: true },
      { id: 'feature2', name: 'Key Feature 2', type: 'content', duration: 7, required: true },
      { id: 'feature3', name: 'Key Feature 3', type: 'content', duration: 7, required: true },
      { id: 'cta', name: 'Where to Buy', type: 'cta', duration: 6, required: true },
    ],
    tags: ['product', 'ecommerce', 'showcase'],
    popularity: 82,
    isNew: true,
    thumbnailColor: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    id: 'testimonial-story',
    name: 'Customer Story',
    description: 'Authentic testimonial with before/after',
    category: 'testimonial',
    platforms: ['tiktok', 'reels', 'youtube'],
    aspectRatio: '9:16',
    duration: 45,
    structure: [
      { id: 'problem', name: 'The Problem', type: 'hook', duration: 8, prompt: 'What challenge did they face?', required: true },
      { id: 'discovery', name: 'Finding Solution', type: 'content', duration: 10, required: true },
      { id: 'result', name: 'The Transformation', type: 'content', duration: 15, required: true },
      { id: 'recommendation', name: 'Recommendation', type: 'cta', duration: 12, required: true },
    ],
    tags: ['testimonial', 'social-proof', 'story'],
    popularity: 78,
    thumbnailColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
  {
    id: 'day-in-life',
    name: 'Day in My Life',
    description: 'Personal vlog-style content',
    category: 'story',
    platforms: ['tiktok', 'reels', 'youtube'],
    aspectRatio: '9:16',
    duration: 60,
    structure: [
      { id: 'morning', name: 'Morning Routine', type: 'content', duration: 15, required: true },
      { id: 'work', name: 'Work/Main Activity', type: 'content', duration: 20, required: true },
      { id: 'highlight', name: 'Day Highlight', type: 'content', duration: 15, required: true },
      { id: 'evening', name: 'Evening Wind-down', type: 'content', duration: 10, required: true },
    ],
    tags: ['vlog', 'lifestyle', 'authentic'],
    popularity: 85,
    thumbnailColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  // YouTube Long-form
  {
    id: 'youtube-explainer',
    name: 'YouTube Explainer',
    description: 'In-depth explanation with chapters',
    category: 'education',
    platforms: ['youtube'],
    aspectRatio: '16:9',
    duration: 600,
    structure: [
      { id: 'hook', name: 'Hook & Preview', type: 'hook', duration: 30, required: true },
      { id: 'intro', name: 'Introduction', type: 'content', duration: 60, required: true },
      { id: 'chapter1', name: 'Chapter 1', type: 'content', duration: 150, required: true },
      { id: 'chapter2', name: 'Chapter 2', type: 'content', duration: 150, required: true },
      { id: 'chapter3', name: 'Chapter 3', type: 'content', duration: 150, required: true },
      { id: 'conclusion', name: 'Conclusion & CTA', type: 'cta', duration: 60, required: true },
    ],
    tags: ['youtube', 'long-form', 'educational'],
    popularity: 75,
    isPremium: true,
    thumbnailColor: 'bg-gradient-to-br from-red-500 to-rose-600',
  },
  // LinkedIn Professional
  {
    id: 'linkedin-thought',
    name: 'LinkedIn Thought Leadership',
    description: 'Professional insight with authority',
    category: 'promo',
    platforms: ['linkedin'],
    aspectRatio: '1:1',
    duration: 90,
    structure: [
      { id: 'statement', name: 'Bold Statement', type: 'hook', duration: 10, required: true },
      { id: 'context', name: 'Context & Data', type: 'content', duration: 30, required: true },
      { id: 'insight', name: 'Your Insight', type: 'content', duration: 35, required: true },
      { id: 'cta', name: 'Engagement Ask', type: 'cta', duration: 15, required: true },
    ],
    tags: ['linkedin', 'professional', 'b2b'],
    popularity: 70,
    thumbnailColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
  },
  // Promo/Announcement
  {
    id: 'launch-announcement',
    name: 'Product Launch',
    description: 'Build hype for your launch',
    category: 'promo',
    platforms: ['tiktok', 'reels', 'shorts', 'twitter'],
    aspectRatio: '9:16',
    duration: 30,
    structure: [
      { id: 'tease', name: 'Teaser', type: 'hook', duration: 5, required: true },
      { id: 'reveal', name: 'Big Reveal', type: 'content', duration: 10, required: true },
      { id: 'features', name: 'Key Features', type: 'content', duration: 10, required: true },
      { id: 'launch', name: 'Launch Info', type: 'cta', duration: 5, required: true },
    ],
    tags: ['launch', 'announcement', 'hype'],
    popularity: 80,
    isNew: true,
    thumbnailColor: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',
  },
];

const PLATFORM_INFO: Record<Platform, { name: string; icon: React.ReactNode; color: string }> = {
  tiktok: { name: 'TikTok', icon: <Film className="h-4 w-4" />, color: 'text-black dark:text-white' },
  reels: { name: 'Reels', icon: <Film className="h-4 w-4" />, color: 'text-pink-500' },
  shorts: { name: 'Shorts', icon: <Play className="h-4 w-4" />, color: 'text-red-500' },
  youtube: { name: 'YouTube', icon: <Play className="h-4 w-4" />, color: 'text-red-600' },
  linkedin: { name: 'LinkedIn', icon: <MessageSquare className="h-4 w-4" />, color: 'text-blue-600' },
  twitter: { name: 'X/Twitter', icon: <MessageSquare className="h-4 w-4" />, color: 'text-slate-800' },
};

const CATEGORY_INFO: Record<TemplateCategory, { name: string; icon: React.ReactNode }> = {
  trending: { name: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  education: { name: 'Educational', icon: <BookOpen className="h-4 w-4" /> },
  product: { name: 'Product', icon: <ShoppingBag className="h-4 w-4" /> },
  story: { name: 'Story', icon: <Heart className="h-4 w-4" /> },
  promo: { name: 'Promo', icon: <Zap className="h-4 w-4" /> },
  testimonial: { name: 'Testimonial', icon: <MessageSquare className="h-4 w-4" /> },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const QuickTemplateSelector: React.FC<QuickTemplateSelectorProps> = ({
  onSelect,
  selectedPlatform,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesSearch = !searchQuery || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      const matchesPlatform = !selectedPlatform || template.platforms.includes(selectedPlatform);
      
      return matchesSearch && matchesCategory && matchesPlatform;
    }).sort((a, b) => b.popularity - a.popularity);
  }, [searchQuery, selectedCategory, selectedPlatform]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getAspectIcon = (ratio: AspectRatio) => {
    switch (ratio) {
      case '9:16': return <Smartphone className="h-3 w-3" />;
      case '16:9': return <Monitor className="h-3 w-3" />;
      case '1:1': return <Square className="h-3 w-3" />;
      case '4:5': return <Smartphone className="h-3 w-3" />;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Templates
        </CardTitle>
        <CardDescription>
          Pre-built structures for viral content on any platform
        </CardDescription>
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

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TemplateCategory | 'all')}>
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
              <TabsTrigger key={key} value={key} className="text-xs gap-1">
                {info.icon}
                {info.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Template Grid */}
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg border-2",
                  hoveredTemplate === template.id ? "border-primary" : "border-transparent"
                )}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => onSelect(template)}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", template.thumbnailColor)}>
                      <Film className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex gap-1">
                      {template.isNew && (
                        <Badge variant="default" className="text-xs bg-green-500">New</Badge>
                      )}
                      {template.isPremium && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                          <Star className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(template.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        {getAspectIcon(template.aspectRatio)}
                        {template.aspectRatio}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {template.popularity}%
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="flex flex-wrap gap-1">
                    {template.platforms.map(platform => (
                      <Badge 
                        key={platform} 
                        variant="outline" 
                        className={cn("text-xs", PLATFORM_INFO[platform].color)}
                      >
                        {PLATFORM_INFO[platform].icon}
                        <span className="ml-1">{PLATFORM_INFO[platform].name}</span>
                      </Badge>
                    ))}
                  </div>

                  {/* Structure Preview on Hover */}
                  {hoveredTemplate === template.id && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Structure:</p>
                      <div className="flex gap-1">
                        {template.structure.map((section, i) => (
                          <div 
                            key={section.id}
                            className={cn(
                              "h-2 rounded-full",
                              section.type === 'hook' && 'bg-red-400',
                              section.type === 'content' && 'bg-blue-400',
                              section.type === 'cta' && 'bg-green-400',
                              section.type === 'transition' && 'bg-amber-400',
                              section.type === 'b-roll' && 'bg-purple-400',
                            )}
                            style={{ flex: section.duration }}
                            title={`${section.name} (${section.duration}s)`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        {template.structure.map(section => (
                          <span key={section.id} className="truncate text-center" style={{ flex: section.duration }}>
                            {section.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No templates match your criteria</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickTemplateSelector;
