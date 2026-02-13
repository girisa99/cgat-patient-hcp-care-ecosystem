/**
 * SEO Optimizer Panel - ENHANCED with 4 Premium Features
 * 
 * AI-powered SEO optimization for video content:
 * - Basic: Keyword research, title/description optimization, platform-specific copy
 * - Premium: Competitor Analysis, Real-time Trends, SERP Preview, Performance Tracking
 * 
 * GENIE CAST SEO DIFFERENTIATORS vs Traditional Agencies (WebFX, Thrive, etc.):
 * 
 * | Traditional Agencies | Genie Cast SEO |
 * |---------------------|----------------|
 * | Website-focused SEO | Video-first SEO (YouTube, TikTok, LinkedIn) |
 * | Manual keyword research | AI-automated keyword extraction |
 * | Monthly reports, slow turnaround | Real-time optimization during creation |
 * | Separate tools for each platform | Unified cross-platform optimization |
 * | Text-only optimization | Multimodal (script → audio → video → SEO) |
 * | $3K-$20K/mo agency retainer | Built-in to content creation workflow |
 * | No content generation | End-to-end: create video + optimize SEO |
 * 
 * PRICING MODEL (Hybrid Freemium - Industry Best Practice):
 * - FREE: Basic SEO analysis, platform optimization, keyword extraction
 * - PRO ($49/mo): SERP Preview, enhanced recommendations
 * - BUSINESS ($149/mo): Real-time Trends, Performance Tracking
 * - ENTERPRISE (Custom): Competitor Analysis, API access, white-label
 * 
 * Uses: dynamicMarketingRegistryService, master-ecosystem-registry, ai-universal-processor
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Sparkles,
  Hash,
  FileText,
  TrendingUp,
  Youtube,
  Linkedin,
  Globe,
  Copy,
  Check,
  RefreshCw,
  Zap,
  BarChart3,
  Target,
  Lightbulb,
  Users,
  Eye,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { dynamicMarketingRegistryService } from '@/services/marketing/dynamicMarketingRegistryService';
import { MASTER_AI_PROVIDERS, MASTER_VIDEO_STYLES } from '@/config/master-ecosystem-registry';

// Import premium SEO feature panels
import { CompetitorAnalysisPanel } from './seo/CompetitorAnalysisPanel';
import { RealTimeTrendsPanel } from './seo/RealTimeTrendsPanel';
import { SERPPreviewPanel } from './seo/SERPPreviewPanel';
import { PerformanceTrackingPanel } from './seo/PerformanceTrackingPanel';

// SEO Analysis Types
interface SEOAnalysis {
  score: number;
  title: {
    current: string;
    optimized: string;
    charCount: number;
    keywords: string[];
    score: number;
  };
  description: {
    current: string;
    optimized: string;
    charCount: number;
    keywords: string[];
    score: number;
  };
  tags: string[];
  hashtags: string[];
  keywords: {
    primary: string[];
    secondary: string[];
    longtail: string[];
  };
  platformOptimizations: {
    youtube: PlatformSEO;
    linkedin: PlatformSEO;
    tiktok: PlatformSEO;
  };
}

interface PlatformSEO {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  charLimits: { title: number; description: number };
  score: number;
}

interface VideoForSEO {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  language_name: string;
  product_name: string;
}

// Platform character limits
const PLATFORM_LIMITS = {
  youtube: { title: 100, description: 5000, tags: 500 },
  linkedin: { title: 200, description: 3000, hashtags: 30 },
  tiktok: { title: 150, description: 2200, hashtags: 100 },
};

// Industry keyword banks from ecosystem
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  technology: ['AI', 'automation', 'digital transformation', 'innovation', 'SaaS', 'productivity'],
  healthcare: ['patient care', 'telehealth', 'HIPAA', 'clinical', 'wellness', 'medical'],
  education: ['e-learning', 'training', 'skills', 'courses', 'certification', 'development'],
  marketing: ['content', 'engagement', 'ROI', 'brand', 'campaign', 'conversion'],
  enterprise: ['workflow', 'efficiency', 'scalability', 'integration', 'compliance', 'security'],
};

export const SEOOptimizerPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'keywords' | 'platforms'>('analyze');
  const [masterTab, setMasterTab] = useState<'basic' | 'competitors' | 'trends' | 'serp' | 'performance'>('basic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  
  // For demo, assume Business tier (would come from auth context)
  const userTier: 'free' | 'pro' | 'business' | 'enterprise' = 'business';
  
// Custom inputs for analysis
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [targetIndustry, setTargetIndustry] = useState<string>('technology');

  // Fetch videos from library
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['seo-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, title, description, language_name')
        .eq('generation_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      // Map to expected type with fallback values
      return (data || []).map(v => ({
        id: v.id,
        title: v.title,
        description: v.description,
        tags: [], // Generate from title/description
        language_name: v.language_name,
        product_name: products?.[0]?.name || 'Genie Suite',
      })) as VideoForSEO[];
    },
  });

  // Fetch products for context
  const { data: products } = useQuery({
    queryKey: ['seo-products'],
    queryFn: () => dynamicMarketingRegistryService.getProducts(),
  });

  // Fetch audiences for keyword enrichment
  const { data: audiences } = useQuery({
    queryKey: ['seo-audiences'],
    queryFn: () => dynamicMarketingRegistryService.getAudiences(),
  });

  // Get selected video
  const selectedVideo = useMemo(() => 
    videos?.find(v => v.id === selectedVideoId), 
    [videos, selectedVideoId]
  );

  // Generate SEO analysis - NOW WIRED TO AI UNIVERSAL PROCESSOR
  const analyzeSEO = async () => {
    if (!selectedVideo && !customTitle) {
      toast.error('Please select a video or enter a title');
      return;
    }

    setIsAnalyzing(true);

    try {
      const title = customTitle || selectedVideo?.title || '';
      const description = customDescription || selectedVideo?.description || '';
      const existingTags = selectedVideo?.tags || [];

      // Build keyword context from ecosystem
      const productKeywords = products?.flatMap(p => [
        p.name,
        ...(p.features || []),
        p.tagline || '',
      ].filter(Boolean)) || [];

      const audienceKeywords = audiences?.flatMap(a => [
        a.label,
        ...(a.pain_points || []),
        ...(a.messaging_angles || []),
      ].filter(Boolean)) || [];

      const industryKeywords = INDUSTRY_KEYWORDS[targetIndustry] || [];
      const contextKeywords = [...productKeywords, ...audienceKeywords, ...industryKeywords];

      // Call AI Universal Processor for real SEO analysis
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          action: 'analyze_seo',
          prompt: `Analyze this video content for SEO optimization:
            Title: "${title}"
            Description: "${description}"
            Industry: ${targetIndustry}
            Context Keywords: ${contextKeywords.slice(0, 20).join(', ')}
            
            Provide SEO recommendations including:
            1. Optimized title (max 100 chars)
            2. Optimized description (max 500 chars)
            3. Primary keywords (3)
            4. Secondary keywords (5)
            5. Long-tail keywords (5)
            6. Hashtags for social (10)
            7. Platform-specific titles for YouTube, LinkedIn, TikTok
            
            Return as JSON with structure:
            {
              "optimizedTitle": "...",
              "optimizedDescription": "...",
              "keywords": { "primary": [], "secondary": [], "longtail": [] },
              "hashtags": [],
              "platforms": { "youtube": {...}, "linkedin": {...}, "tiktok": {...} },
              "score": 0-100
            }`,
          systemPrompt: 'You are an expert SEO analyst specializing in video content optimization. Provide actionable, data-driven recommendations.',
          temperature: 0.3,
        }
      });

      if (aiError) {
        console.warn('AI analysis failed, using fallback:', aiError);
      }

      // Parse AI response or use fallback
      let analysis: SEOAnalysis;
      if (aiResult?.content) {
        try {
          const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            analysis = {
              score: parsed.score || 75,
              title: {
                current: title,
                optimized: parsed.optimizedTitle || title,
                charCount: title.length,
                keywords: parsed.keywords?.primary || [],
                score: parsed.score || 75,
              },
              description: {
                current: description,
                optimized: parsed.optimizedDescription || description,
                charCount: description.length,
                keywords: parsed.keywords?.secondary || [],
                score: parsed.score || 75,
              },
              tags: [...(parsed.keywords?.primary || []), ...(parsed.keywords?.secondary || [])],
              hashtags: parsed.hashtags || [],
              keywords: parsed.keywords || { primary: [], secondary: [], longtail: [] },
              platformOptimizations: {
                youtube: {
                  title: parsed.platforms?.youtube?.title || title,
                  description: parsed.platforms?.youtube?.description || description,
                  tags: parsed.keywords?.primary || [],
                  hashtags: parsed.hashtags?.slice(0, 3) || [],
                  charLimits: PLATFORM_LIMITS.youtube,
                  score: parsed.score || 75,
                },
                linkedin: {
                  title: parsed.platforms?.linkedin?.title || title,
                  description: parsed.platforms?.linkedin?.description || description,
                  tags: parsed.keywords?.secondary || [],
                  hashtags: parsed.hashtags?.slice(0, 5) || [],
                  charLimits: PLATFORM_LIMITS.linkedin,
                  score: parsed.score || 75,
                },
                tiktok: {
                  title: parsed.platforms?.tiktok?.title || title.slice(0, 50),
                  description: parsed.platforms?.tiktok?.description || description.slice(0, 150),
                  tags: parsed.keywords?.primary?.slice(0, 5) || [],
                  hashtags: parsed.hashtags?.slice(0, 8) || [],
                  charLimits: PLATFORM_LIMITS.tiktok,
                  score: parsed.score || 70,
                },
              },
            };
          } else {
            throw new Error('No JSON in response');
          }
        } catch {
          // Fallback to local generation
          analysis = generateSEOAnalysis(title, description, contextKeywords, existingTags);
        }
      } else {
        // Fallback to local generation
        analysis = generateSEOAnalysis(title, description, contextKeywords, existingTags);
      }

      setSeoAnalysis(analysis);
      toast.success('SEO analysis complete!');
    } catch (error) {
      console.error('SEO analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate SEO Analysis (client-side simulation - would be edge function in production)
  const generateSEOAnalysis = (
    title: string,
    description: string,
    contextKeywords: string[],
    existingTags: string[]
  ): SEOAnalysis => {
    // Extract keywords from title/description
    const words = `${title} ${description}`.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    words.forEach(w => {
      if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    // Sort by frequency
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    // Generate optimized title (add power words if missing)
    const powerWords = ['Ultimate', 'Complete', 'Essential', 'Powerful', 'Transform'];
    const hasPowerWord = powerWords.some(pw => title.toLowerCase().includes(pw.toLowerCase()));
    const optimizedTitle = hasPowerWord 
      ? title 
      : `${powerWords[Math.floor(Math.random() * powerWords.length)]} ${title}`;

    // Generate optimized description
    const brandName = products?.[0]?.name || 'Genie Suite';
    const optimizedDesc = description.length > 0
      ? `${description}\n\n🚀 Key Features:\n• AI-powered automation\n• Enterprise-grade security\n• 24/7 support\n\n#${brandName.replace(/\s+/g, '')} #AI #Productivity`
      : `Discover how ${title} transforms your workflow with cutting-edge AI technology. Join thousands of professionals already using ${brandName}.\n\n🚀 Features:\n• Smart automation\n• Real-time collaboration\n• Multi-language support`;

    // Generate tags from context
    const allTags = [
      ...existingTags,
      ...sortedWords.slice(0, 5),
      ...contextKeywords.slice(0, 10),
      'AI', 'productivity', 'automation',
    ].filter((tag, idx, arr) => arr.indexOf(tag) === idx).slice(0, 20);

    // Generate hashtags
    const hashtags = allTags.slice(0, 10).map(t => `#${t.replace(/\s+/g, '')}`);

    // Calculate scores
    const titleScore = Math.min(100, 60 + (title.length > 30 ? 20 : 0) + (hasPowerWord ? 20 : 0));
    const descScore = Math.min(100, 50 + (description.length > 100 ? 25 : 0) + (description.length > 500 ? 25 : 0));
    const overallScore = Math.round((titleScore + descScore) / 2);

    return {
      score: overallScore,
      title: {
        current: title,
        optimized: optimizedTitle.slice(0, 100),
        charCount: title.length,
        keywords: sortedWords.slice(0, 5),
        score: titleScore,
      },
      description: {
        current: description,
        optimized: optimizedDesc.slice(0, 500),
        charCount: description.length,
        keywords: sortedWords.slice(0, 10),
        score: descScore,
      },
      tags: allTags,
      hashtags,
      keywords: {
        primary: sortedWords.slice(0, 3),
        secondary: sortedWords.slice(3, 8),
        longtail: contextKeywords.slice(0, 5).map(k => `${k} tutorial`),
      },
      platformOptimizations: {
        youtube: {
          title: optimizedTitle.slice(0, PLATFORM_LIMITS.youtube.title),
          description: `${optimizedDesc}\n\n📌 Timestamps:\n0:00 Introduction\n1:00 Key Features\n3:00 Demo\n5:00 Next Steps`,
          tags: allTags.slice(0, 15),
          hashtags: hashtags.slice(0, 3),
          charLimits: PLATFORM_LIMITS.youtube,
          score: Math.min(100, overallScore + 5),
        },
        linkedin: {
          title: optimizedTitle.slice(0, PLATFORM_LIMITS.linkedin.title),
          description: `🎯 ${optimizedDesc.slice(0, 200)}\n\nLearn more about how AI is transforming ${targetIndustry}.\n\n${hashtags.slice(0, 5).join(' ')}`,
          tags: allTags.slice(0, 10),
          hashtags: hashtags.slice(0, 5),
          charLimits: PLATFORM_LIMITS.linkedin,
          score: Math.min(100, overallScore + 3),
        },
        tiktok: {
          title: optimizedTitle.slice(0, 50),
          description: `${hashtags.slice(0, 8).join(' ')}\n\n${optimizedDesc.slice(0, 100)}...`,
          tags: allTags.slice(0, 8),
          hashtags: hashtags.slice(0, 8),
          charLimits: PLATFORM_LIMITS.tiktok,
          score: Math.min(100, overallScore - 5),
        },
      },
    };
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderScoreBadge = (score: number) => {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <Badge className={`${color} text-white`}>
        {score}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Master Feature Tabs */}
      <Tabs value={masterTab} onValueChange={(v) => setMasterTab(v as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            Basic SEO
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Competitors
            <Badge variant="secondary" className="text-xs ml-1">PRO</Badge>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Trends
            <Badge variant="secondary" className="text-xs ml-1">BIZ</Badge>
          </TabsTrigger>
          <TabsTrigger value="serp" className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            SERP Preview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Performance
            <Badge variant="secondary" className="text-xs ml-1">BIZ</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Competitor Analysis */}
        <TabsContent value="competitors" className="mt-4">
          <CompetitorAnalysisPanel isPremium={userTier === 'business' || userTier === 'enterprise'} />
        </TabsContent>

        {/* Real-time Trends */}
        <TabsContent value="trends" className="mt-4">
          <RealTimeTrendsPanel isPremium={userTier === 'business' || userTier === 'enterprise'} />
        </TabsContent>

        {/* SERP Preview */}
        <TabsContent value="serp" className="mt-4">
          <SERPPreviewPanel isPremium={true} />
        </TabsContent>

        {/* Performance Tracking */}
        <TabsContent value="performance" className="mt-4">
          <PerformanceTrackingPanel isPremium={userTier === 'business' || userTier === 'enterprise'} />
        </TabsContent>

        {/* Basic SEO (original content) */}
        <TabsContent value="basic" className="mt-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            SEO Optimizer
          </CardTitle>
          <CardDescription>
            AI-powered optimization for video titles, descriptions, and tags across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Video Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Video</label>
              <Select 
                value={selectedVideoId || ''} 
                onValueChange={(v) => {
                  setSelectedVideoId(v);
                  const video = videos?.find(vid => vid.id === v);
                  if (video) {
                    setCustomTitle(video.title);
                    setCustomDescription(video.description || '');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a video..." />
                </SelectTrigger>
                <SelectContent>
                  {videos?.map(video => (
                    <SelectItem key={video.id} value={video.id}>
                      {video.title.slice(0, 40)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry Context */}
            <div>
              <label className="text-sm font-medium mb-2 block">Target Industry</label>
              <Select value={targetIndustry} onValueChange={setTargetIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Analyze Button */}
            <div className="flex items-end">
              <Button 
                onClick={analyzeSEO} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze SEO
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Custom Input */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter video title..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customTitle.length}/100 characters
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Enter video description..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customDescription.length}/5000 characters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {seoAnalysis && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Platforms
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analyze" className="space-y-4">
            {/* Overall Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Overall SEO Score</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on title, description, and keyword optimization
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">{seoAnalysis.score}%</div>
                    <Badge variant={seoAnalysis.score >= 80 ? 'default' : 'secondary'}>
                      {seoAnalysis.score >= 80 ? 'Excellent' : seoAnalysis.score >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </div>
                <Progress value={seoAnalysis.score} className="h-3" />
              </CardContent>
            </Card>

            {/* Title Optimization */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Title Optimization
                  </span>
                  {renderScoreBadge(seoAnalysis.title.score)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Current</label>
                  <p className="text-sm">{seoAnalysis.title.current || 'No title'}</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-green-600 font-medium">Optimized</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(seoAnalysis.title.optimized, 'title')}
                    >
                      {copiedField === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-sm font-medium">{seoAnalysis.title.optimized}</p>
                </div>
              </CardContent>
            </Card>

            {/* Description Optimization */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description Optimization
                  </span>
                  {renderScoreBadge(seoAnalysis.description.score)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-green-600 font-medium">Optimized Description</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(seoAnalysis.description.optimized, 'desc')}
                    >
                      {copiedField === 'desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-line">{seoAnalysis.description.optimized}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Keywords */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    Primary Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {seoAnalysis.keywords.primary.map((kw, idx) => (
                      <Badge key={idx} variant="destructive" className="cursor-pointer">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Keywords */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Secondary Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {seoAnalysis.keywords.secondary.map((kw, idx) => (
                      <Badge key={idx} variant="secondary" className="cursor-pointer">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Long-tail Keywords */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    Long-tail Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {seoAnalysis.keywords.longtail.map((kw, idx) => (
                      <Badge key={idx} variant="outline" className="cursor-pointer text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags & Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Suggested Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {seoAnalysis.tags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => copyToClipboard(tag, `tag-${idx}`)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(seoAnalysis.tags.join(', '), 'all-tags')}
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy All Tags
                </Button>
              </CardContent>
            </Card>

            {/* Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {seoAnalysis.hashtags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                      onClick={() => copyToClipboard(tag, `hash-${idx}`)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(seoAnalysis.hashtags.join(' '), 'all-hashtags')}
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy All Hashtags
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* YouTube */}
              <Card className="border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      YouTube
                    </span>
                    {renderScoreBadge(seoAnalysis.platformOptimizations.youtube.score)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Title ({seoAnalysis.platformOptimizations.youtube.title.length}/{PLATFORM_LIMITS.youtube.title})</label>
                    <p className="text-sm font-medium">{seoAnalysis.platformOptimizations.youtube.title}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {seoAnalysis.platformOptimizations.youtube.tags.slice(0, 5).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard(
                      `Title: ${seoAnalysis.platformOptimizations.youtube.title}\n\n${seoAnalysis.platformOptimizations.youtube.description}`,
                      'youtube'
                    )}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy YouTube Format
                  </Button>
                </CardContent>
              </Card>

              {/* LinkedIn */}
              <Card className="border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-500" />
                      LinkedIn
                    </span>
                    {renderScoreBadge(seoAnalysis.platformOptimizations.linkedin.score)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Title ({seoAnalysis.platformOptimizations.linkedin.title.length}/{PLATFORM_LIMITS.linkedin.title})</label>
                    <p className="text-sm font-medium">{seoAnalysis.platformOptimizations.linkedin.title}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Hashtags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {seoAnalysis.platformOptimizations.linkedin.hashtags.map((tag, idx) => (
                        <Badge key={idx} className="bg-blue-500 text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard(seoAnalysis.platformOptimizations.linkedin.description, 'linkedin')}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy LinkedIn Format
                  </Button>
                </CardContent>
              </Card>

              {/* TikTok */}
              <Card className="border-pink-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-pink-500" />
                      TikTok
                    </span>
                    {renderScoreBadge(seoAnalysis.platformOptimizations.tiktok.score)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Caption ({seoAnalysis.platformOptimizations.tiktok.description.length}/{PLATFORM_LIMITS.tiktok.description})</label>
                    <p className="text-sm">{seoAnalysis.platformOptimizations.tiktok.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => copyToClipboard(seoAnalysis.platformOptimizations.tiktok.description, 'tiktok')}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy TikTok Format
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!seoAnalysis && !isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ready to Optimize</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a video or enter a title to generate AI-powered SEO recommendations
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Youtube className="w-3 h-3" /> YouTube
              </span>
              <span className="flex items-center gap-1">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> TikTok
              </span>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOOptimizerPanel;
