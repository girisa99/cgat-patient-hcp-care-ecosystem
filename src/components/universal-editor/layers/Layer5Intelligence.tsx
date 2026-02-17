/**
 * Layer 5: OUTPUT INTELLIGENCE
 * Analytics | A/B Testing | Improvement Suggestions | Repurpose
 */

import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Eye, Users, Share2,
  Clock, Target, Lightbulb, Sparkles, RefreshCw, ArrowRight,
  PlayCircle, FileVideo, FileImage, FileText, Smartphone,
  CheckCircle, AlertCircle, Info, Zap, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditor } from '../context/EditorContext';
import type { 
  AnalyticsData, 
  ABTest, 
  ImprovementSuggestion, 
  RepurposeOption 
} from '../types';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ANALYTICS: AnalyticsData = {
  views: 12450,
  engagement: 78,
  shares: 342,
  avgWatchTime: 145, // seconds
  completionRate: 65,
  conversionRate: 4.2,
  byPlatform: {
    youtube: { views: 8200, engagement: 82 },
    linkedin: { views: 3100, engagement: 71 },
    twitter: { views: 1150, engagement: 68 },
  },
  timeline: [
    { date: '2024-01-01', views: 120, engagement: 75 },
    { date: '2024-01-02', views: 450, engagement: 78 },
    { date: '2024-01-03', views: 890, engagement: 82 },
    { date: '2024-01-04', views: 1200, engagement: 79 },
    { date: '2024-01-05', views: 980, engagement: 81 },
  ],
};

const MOCK_AB_TESTS: ABTest[] = [
  {
    id: '1',
    name: 'Thumbnail Test',
    variants: [
      { id: 'a', name: 'Blue Background', elementChanges: {}, trafficPercent: 50, metrics: { views: 1200, engagement: 72, conversion: 3.8 } },
      { id: 'b', name: 'Gradient Background', elementChanges: {}, trafficPercent: 50, metrics: { views: 1180, engagement: 81, conversion: 4.5 } },
    ],
    status: 'running',
    startedAt: '2024-01-10',
  },
];

const MOCK_SUGGESTIONS: ImprovementSuggestion[] = [
  {
    id: '1',
    type: 'engagement',
    title: 'Add a hook in first 3 seconds',
    description: 'Videos with strong hooks have 40% higher retention. Consider adding a question or surprising stat.',
    impact: 'high',
    effort: 'low',
    autoApplicable: false,
  },
  {
    id: '2',
    type: 'accessibility',
    title: 'Add captions to video',
    description: '85% of social media videos are watched without sound. Auto-generated captions available.',
    impact: 'high',
    effort: 'low',
    autoApplicable: true,
  },
  {
    id: '3',
    type: 'seo',
    title: 'Optimize title for search',
    description: 'Your title could include more searchable keywords based on trending topics.',
    impact: 'medium',
    effort: 'low',
    autoApplicable: true,
  },
  {
    id: '4',
    type: 'visual',
    title: 'Increase text contrast',
    description: 'Some text may be hard to read on mobile. Increasing contrast will improve accessibility.',
    impact: 'medium',
    effort: 'low',
    autoApplicable: true,
  },
];

const MOCK_REPURPOSE: RepurposeOption[] = [
  {
    id: '1',
    name: 'YouTube Shorts',
    targetFormat: 'video-shorts',
    targetPlatform: 'YouTube',
    estimatedTime: 3,
    estimatedCredits: 25,
    requiredChanges: ['Crop to 9:16', 'Add hook', 'Trim to 60s'],
  },
  {
    id: '2',
    name: 'LinkedIn Carousel',
    targetFormat: 'image',
    targetPlatform: 'LinkedIn',
    estimatedTime: 2,
    estimatedCredits: 15,
    requiredChanges: ['Extract key points', 'Design slides', 'Add CTA'],
  },
  {
    id: '3',
    name: 'Blog Post',
    targetFormat: 'markdown',
    targetPlatform: 'Website',
    estimatedTime: 5,
    estimatedCredits: 20,
    requiredChanges: ['Transcribe', 'Reformat', 'Add images'],
  },
  {
    id: '4',
    name: 'Twitter Thread',
    targetFormat: 'social-post',
    targetPlatform: 'Twitter',
    estimatedTime: 2,
    estimatedCredits: 10,
    requiredChanges: ['Extract highlights', 'Format as thread'],
  },
];

// ============================================================================
// ANALYTICS PANEL
// ============================================================================

interface AnalyticsPanelProps {
  analytics: AnalyticsData;
  className?: string;
}

export function AnalyticsPanel({ analytics, className }: AnalyticsPanelProps) {
  const stats = [
    { label: 'Views', value: analytics.views.toLocaleString(), icon: <Eye className="h-4 w-4" />, trend: 12 },
    { label: 'Engagement', value: `${analytics.engagement}%`, icon: <Users className="h-4 w-4" />, trend: 5 },
    { label: 'Shares', value: analytics.shares.toLocaleString(), icon: <Share2 className="h-4 w-4" />, trend: -2 },
    { label: 'Avg. Watch', value: `${Math.floor(analytics.avgWatchTime! / 60)}:${String(analytics.avgWatchTime! % 60).padStart(2, '0')}`, icon: <Clock className="h-4 w-4" />, trend: 8 },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                {stat.icon}
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold">{stat.value}</span>
                <div className={cn(
                  "flex items-center text-xs",
                  stat.trend > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {stat.trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {Math.abs(stat.trend)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Funnel */}
        <div className="space-y-2">
          <p className="text-xs font-medium">Conversion Funnel</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Impressions → Views</span>
              <span className="font-medium">{analytics.completionRate}%</span>
            </div>
            <Progress value={analytics.completionRate} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span>Views → Conversions</span>
              <span className="font-medium">{analytics.conversionRate}%</span>
            </div>
            <Progress value={analytics.conversionRate! * 10} className="h-2" />
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium">By Platform</p>
          {Object.entries(analytics.byPlatform).map(([platform, data]) => (
            <div key={platform} className="flex items-center justify-between text-xs">
              <span className="capitalize">{platform}</span>
              <div className="flex items-center gap-4">
                <span>{data.views.toLocaleString()} views</span>
                <Badge variant="secondary" className="text-[10px]">
                  {data.engagement}% eng
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// A/B TESTING PANEL
// ============================================================================

interface ABTestingPanelProps {
  tests: ABTest[];
  className?: string;
}

export function ABTestingPanel({ tests, className }: ABTestingPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            A/B Testing
          </CardTitle>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            + New Test
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No active tests. Create one to optimize your content.
          </p>
        ) : (
          tests.map((test) => (
            <div key={test.id} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{test.name}</span>
                <Badge 
                  variant={test.status === 'running' ? 'default' : 'secondary'}
                  className="text-[10px]"
                >
                  {test.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {test.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        variant.id === 'a' ? "bg-blue-500" : "bg-green-500"
                      )} />
                      <span>{variant.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{variant.metrics.engagement}% eng</span>
                      <span className="font-medium">{variant.metrics.conversion}% conv</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {test.status === 'running' && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                    End Test
                  </Button>
                  <Button size="sm" className="flex-1 h-7 text-xs">
                    Pick Winner
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUGGESTIONS PANEL
// ============================================================================

interface SuggestionsPanelProps {
  suggestions: ImprovementSuggestion[];
  className?: string;
}

export function SuggestionsPanel({ suggestions, className }: SuggestionsPanelProps) {
  const impactColors = {
    high: 'text-green-500 bg-green-500/10',
    medium: 'text-yellow-500 bg-yellow-500/10',
    low: 'text-blue-500 bg-blue-500/10',
  };

  const typeIcons = {
    content: <FileText className="h-4 w-4" />,
    visual: <FileImage className="h-4 w-4" />,
    timing: <Clock className="h-4 w-4" />,
    accessibility: <Users className="h-4 w-4" />,
    seo: <Target className="h-4 w-4" />,
    engagement: <Zap className="h-4 w-4" />,
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          AI Suggestions
          <Badge variant="secondary" className="text-[10px]">
            {suggestions.length} tips
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {typeIcons[suggestion.type]}
                <span className="font-medium text-sm">{suggestion.title}</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-[10px]", impactColors[suggestion.impact])}
              >
                {suggestion.impact} impact
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
            <div className="flex gap-2">
              {suggestion.autoApplicable ? (
                <Button size="sm" className="h-7 text-xs gap-1 flex-1">
                  <Sparkles className="h-3 w-3" />
                  Auto-Apply
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                  Learn More
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// REPURPOSE PANEL
// ============================================================================

interface RepurposePanelProps {
  options: RepurposeOption[];
  className?: string;
}

export function RepurposePanel({ options, className }: RepurposePanelProps) {
  const formatIcons: Record<string, React.ReactNode> = {
    'video-shorts': <PlayCircle className="h-5 w-5" />,
    'image': <FileImage className="h-5 w-5" />,
    'markdown': <FileText className="h-5 w-5" />,
    'social-post': <Smartphone className="h-5 w-5" />,
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Repurpose Content
        </CardTitle>
        <CardDescription className="text-xs">
          Transform your content for different platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {options.map((option) => (
            <div 
              key={option.id}
              className="p-3 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  {formatIcons[option.targetFormat] || <LayoutGrid className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{option.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {option.estimatedCredits}c
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.targetPlatform} • {option.estimatedTime} min
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {option.requiredChanges.map((change, i) => (
                  <Badge key={i} variant="secondary" className="text-[9px]">
                    {change}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPLETE LAYER 5 DASHBOARD
// ============================================================================

interface Layer5IntelligenceProps {
  className?: string;
}

export function Layer5Intelligence({ className }: Layer5IntelligenceProps) {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className={cn("p-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="analytics" className="text-xs gap-1">
            <BarChart3 className="h-3 w-3" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="testing" className="text-xs gap-1">
            <Target className="h-3 w-3" />
            A/B Test
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs gap-1">
            <Lightbulb className="h-3 w-3" />
            Improve
          </TabsTrigger>
          <TabsTrigger value="repurpose" className="text-xs gap-1">
            <RefreshCw className="h-3 w-3" />
            Repurpose
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsPanel analytics={MOCK_ANALYTICS} />
        </TabsContent>

        <TabsContent value="testing">
          <ABTestingPanel tests={MOCK_AB_TESTS} />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsPanel suggestions={MOCK_SUGGESTIONS} />
        </TabsContent>

        <TabsContent value="repurpose">
          <RepurposePanel options={MOCK_REPURPOSE} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Layer5Intelligence;
