/**
 * Marketing Content Dashboard
 * 
 * Complete UI for managing automated marketing content:
 * - View all 119 pipelines across 14 categories
 * - Review and approve content before publishing
 * - Template management and rotation
 * - Multi-language generation
 * - SEO optimization
 * - Publishing schedule
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Globe,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  FileText,
  Video,
  Image,
  Mic,
  Box,
  Glasses,
  Workflow,
  Presentation,
  GraduationCap,
  Share2,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  marketingContentManager,
  CATEGORY_METADATA,
  PIPELINE_MARKETING_CATALOG,
  MESSAGE_TEMPLATES,
  type PipelineCategory,
  type ContentStatus,
  type GeneratedContent,
} from '@/services/marketingContentManager';

// ============================================================================
// CATEGORY ICONS
// ============================================================================

const CATEGORY_ICONS: Record<PipelineCategory, React.ElementType> = {
  text_based: FileText,
  image_based: Image,
  voice_audio: Mic,
  document_ppt: Presentation,
  video_based: Video,
  '3d_based': Box,
  ar_vr_scene: Glasses,
  complex_multimodal: Workflow,
  presentation: Presentation,
  repurposing: RefreshCw,
  training_ld: GraduationCap,
  marketing_sales: TrendingUp,
  localization: Globe,
  social_publishing: Share2,
};

// ============================================================================
// STATUS COLORS
// ============================================================================

const STATUS_CONFIG: Record<ContentStatus, { color: string; label: string; icon: React.ElementType }> = {
  draft: { color: 'bg-muted text-muted-foreground', label: 'Draft', icon: Edit },
  pending_review: { color: 'bg-yellow-500/20 text-yellow-600', label: 'Pending Review', icon: Clock },
  approved: { color: 'bg-green-500/20 text-green-600', label: 'Approved', icon: CheckCircle },
  rejected: { color: 'bg-red-500/20 text-red-600', label: 'Rejected', icon: XCircle },
  scheduled: { color: 'bg-blue-500/20 text-blue-600', label: 'Scheduled', icon: Calendar },
  publishing: { color: 'bg-purple-500/20 text-purple-600', label: 'Publishing', icon: RefreshCw },
  published: { color: 'bg-emerald-500/20 text-emerald-600', label: 'Published', icon: CheckCircle },
  failed: { color: 'bg-red-500/20 text-red-600', label: 'Failed', icon: XCircle },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MarketingContentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<PipelineCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Get data from manager
  const pipelines = useMemo(() => {
    let filtered = PIPELINE_MARKETING_CATALOG;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.hook.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery]);

  const categories = Object.entries(CATEGORY_METADATA);
  const templates = Object.values(MESSAGE_TEMPLATES);
  const reviewQueue = marketingContentManager.getReviewQueue();
  const publishedContent = marketingContentManager.getPublishedContent();

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      const categoriesToGenerate = selectedCategory === 'all' 
        ? Object.keys(CATEGORY_METADATA) as PipelineCategory[]
        : [selectedCategory];

      for (let i = 0; i < categoriesToGenerate.length; i++) {
        const category = categoriesToGenerate[i];
        await marketingContentManager.generateCategoryContent(category, {
          languages: ['en', 'de', 'ja', 'ar', 'pt-BR'],
          pipelinesPerDay: 3,
        });
        setGenerationProgress(((i + 1) / categoriesToGenerate.length) * 100);
      }

      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = (contentId: string) => {
    marketingContentManager.reviewContent(contentId, {
      action: 'approve',
      reviewerId: 'current-user',
    });
    toast.success('Content approved');
  };

  const handleReject = (contentId: string, feedback: string) => {
    marketingContentManager.reviewContent(contentId, {
      action: 'reject',
      feedback,
      reviewerId: 'current-user',
    });
    toast.info('Content rejected');
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Marketing Content Engine
          </h1>
          <p className="text-muted-foreground">
            Dogfooding: Genie Suite marketing itself with 206 pipelines × 21 categories × 14 languages
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Daily Content
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <RefreshCw className="h-5 w-5 text-primary animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Generating content across categories...</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{PIPELINE_MARKETING_CATALOG.length}</p>
                <p className="text-xs text-muted-foreground">Total Pipelines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Target className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviewQueue.length}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedContent.length}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines ({pipelines.length})</TabsTrigger>
          <TabsTrigger value="review">Review Queue ({reviewQueue.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(([key, meta]) => {
              const Icon = CATEGORY_ICONS[key as PipelineCategory];
              const pipelineCount = PIPELINE_MARKETING_CATALOG.filter(
                p => p.category === key
              ).length;
              
              return (
                <Card 
                  key={key}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {
                    setSelectedCategory(key as PipelineCategory);
                    setActiveTab('pipelines');
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{meta.displayName}</CardTitle>
                        <CardDescription className="text-xs">
                          {pipelineCount} pipelines
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{meta.description}</p>
                    <p className="text-xs font-medium text-primary">
                      "{meta.marketingAngle}"
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {meta.targetAudience.slice(0, 2).map(audience => (
                        <Badge key={audience} variant="secondary" className="text-xs">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Pipelines Tab */}
        <TabsContent value="pipelines" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pipelines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => setSelectedCategory(v as PipelineCategory | 'all')}
                >
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(([key, meta]) => (
                      <SelectItem key={key} value={key}>
                        {meta.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Grid */}
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pipelines.map(pipeline => {
                const Icon = CATEGORY_ICONS[pipeline.category];
                const categoryMeta = CATEGORY_METADATA[pipeline.category];
                
                return (
                  <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{pipeline.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {pipeline.hook}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {categoryMeta.displayName}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Review Queue Tab */}
        <TabsContent value="review" className="space-y-4">
          {reviewQueue.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Content Pending Review</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Generate content to start the review workflow
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviewQueue.map(content => {
                const statusConfig = STATUS_CONFIG[content.status];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <Card key={content.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline">{content.pipelineName}</Badge>
                            <Badge variant="outline">
                              <Globe className="h-3 w-3 mr-1" />
                              {content.language}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium">{content.headline}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{content.hook}</p>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-muted-foreground">
                              SEO Score: {content.seo.seoScore}%
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {content.platforms.join(', ')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedContent(content)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleApprove(content.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleReject(content.id, 'Needs revision')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline">{template.format}</Badge>
                  </div>
                  <CardDescription>
                    Rotation Weight: {template.rotationWeight}% | Used: {template.usageCount} times
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1">Headlines ({template.headlineTemplates.length})</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {template.headlineTemplates[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">Hooks ({template.hookTemplates.length})</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {template.hookTemplates[0]}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.voiceTones.map(tone => (
                      <Badge key={tone} variant="secondary" className="text-xs">
                        {tone}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Publishing Schedule
              </CardTitle>
              <CardDescription>
                Automated daily publishing across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['LinkedIn', 'YouTube', 'TikTok', 'Instagram'].map(platform => (
                    <div key={platform} className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm">{platform}</h4>
                      <p className="text-2xl font-bold mt-1">3</p>
                      <p className="text-xs text-muted-foreground">posts/day</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Regional Schedule</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['🇺🇸 US', '🇪🇺 Europe', '🌏 Asia', '🇮🇳 India', '🇸🇦 MENA', '🌍 Africa', '🌎 LatAm'].map(region => (
                      <Badge key={region} variant="outline" className="justify-center py-2">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab - Internal Team Only */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Creator Leaderboard & Incentives
              </CardTitle>
              <CardDescription>
                Internal rewards program for Genie Suite team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly Leaderboard */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    This Week's Top Creators
                  </h3>
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Team Member 1', impressions: 45200, badge: '🥇' },
                      { rank: 2, name: 'Team Member 2', impressions: 38100, badge: '🥈' },
                      { rank: 3, name: 'Team Member 3', impressions: 29500, badge: '🥉' },
                      { rank: 4, name: 'Team Member 4', impressions: 21300, badge: '' },
                      { rank: 5, name: 'Team Member 5', impressions: 18700, badge: '' },
                    ].map((creator) => (
                      <div 
                        key={creator.rank}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          creator.rank <= 3 ? "bg-primary/5" : "bg-muted/50"
                        )}
                      >
                        <span className="text-lg w-8">{creator.badge || `#${creator.rank}`}</span>
                        <span className="flex-1 font-medium">{creator.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {creator.impressions.toLocaleString()} impressions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Incentives */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Active Incentive Programs
                  </h3>
                  <div className="space-y-3">
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">January Creator Challenge</h4>
                          <Badge className="bg-primary/10 text-primary">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Top 3 creators win Genie Credits + Featured Profile
                        </p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>🥇 1st Place:</span>
                            <span className="font-medium">1,000 Credits</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🥈 2nd Place:</span>
                            <span className="font-medium">500 Credits</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🥉 3rd Place:</span>
                            <span className="font-medium">250 Credits</span>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Ends: January 31, 2025
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">7-Day Streak Challenge</h4>
                          <Badge variant="secondary">Ongoing</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Publish content 7 days in a row for a bonus badge
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Available Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: '🚀', name: 'First Steps', desc: 'First publish' },
                    { icon: '🔥', name: 'Going Viral', desc: '10K impressions' },
                    { icon: '📅', name: 'Week Warrior', desc: '7-day streak' },
                    { icon: '💯', name: 'Century', desc: '100 posts' },
                    { icon: '🌟', name: 'Million Club', desc: '1M total views' },
                    { icon: '🎨', name: 'Format Explorer', desc: '5 formats used' },
                    { icon: '🌐', name: 'Platform Master', desc: 'All platforms' },
                    { icon: '🤖', name: 'AI Pioneer', desc: 'New feature first' },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{badge.name}</div>
                        <div className="text-xs text-muted-foreground">{badge.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Preview Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl">
          {selectedContent && (
            <>
              <DialogHeader>
                <DialogTitle>Content Preview</DialogTitle>
                <DialogDescription>
                  {selectedContent.pipelineName} • {selectedContent.language}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Headline</label>
                  <Input value={selectedContent.headline} readOnly className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Hook</label>
                  <Input value={selectedContent.hook} readOnly className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Body</label>
                  <Textarea value={selectedContent.body} readOnly className="mt-1" rows={4} />
                </div>
                
                <div>
                  <label className="text-sm font-medium">CTA</label>
                  <Input value={selectedContent.cta} readOnly className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">SEO Score</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedContent.seo.seoScore} className="flex-1" />
                    <span className="text-sm font-medium">{selectedContent.seo.seoScore}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Hashtags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedContent.seo.hashtags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedContent(null)}>
                  Close
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedContent.id);
                    setSelectedContent(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MarketingContentDashboard;
