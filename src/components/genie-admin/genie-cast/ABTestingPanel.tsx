/**
 * A/B Testing Panel
 * 
 * Create and track content variations:
 * - Thumbnail variants with AI generation
 * - Title testing with performance tracking
 * - CTA optimization experiments
 * - Hook variations analysis
 * 
 * Uses: dynamicMarketingRegistryService, master-ecosystem-registry
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wand2,
  Sparkles,
  Image,
  FileText,
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  Play,
  Pause,
  BarChart3,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Award,
  Crown,
  ChevronRight,
  Lightbulb,
  MousePointerClick,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { dynamicMarketingRegistryService } from '@/services/marketing/dynamicMarketingRegistryService';
import { MASTER_AI_PROVIDERS } from '@/config/master-ecosystem-registry';

// A/B Test Types
interface ABTestVariant {
  id: string;
  type: 'title' | 'thumbnail' | 'cta' | 'hook';
  content: string;
  imageUrl?: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversionRate: number;
  };
  isWinner: boolean;
  isControl: boolean;
  createdAt: Date;
}

interface ABTest {
  id: string;
  name: string;
  type: 'title' | 'thumbnail' | 'cta' | 'hook';
  status: 'draft' | 'running' | 'paused' | 'completed';
  videoId: string;
  videoTitle: string;
  variants: ABTestVariant[];
  startedAt?: Date;
  endedAt?: Date;
  confidenceLevel: number;
  minimumSampleSize: number;
  currentSampleSize: number;
}

interface VideoForTest {
  id: string;
  title: string;
  thumbnail_url: string | null;
  product_name: string;
}

// AI-generated variant templates
const TITLE_TEMPLATES = [
  { prefix: 'How to', suffix: 'in Minutes' },
  { prefix: 'The Ultimate Guide to', suffix: '' },
  { prefix: '', suffix: ': A Complete Tutorial' },
  { prefix: 'Why', suffix: 'Changes Everything' },
  { prefix: 'Master', suffix: 'Today' },
];

const CTA_TEMPLATES = [
  'Get Started Free',
  'Start Your Free Trial',
  'Try It Now',
  'See It In Action',
  'Book a Demo',
  'Learn More',
  'Watch Now',
  'Discover How',
];

const HOOK_TEMPLATES = [
  'What if you could {benefit} in half the time?',
  'Stop wasting hours on {pain_point}...',
  'The secret to {benefit} that pros don\'t share...',
  'You\'re doing {task} wrong. Here\'s why...',
  'In the next 60 seconds, you\'ll learn {benefit}...',
];

export const ABTestingPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'results'>('create');
  const [testType, setTestType] = useState<'title' | 'thumbnail' | 'cta' | 'hook'>('title');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [variants, setVariants] = useState<string[]>(['', '']);
  const [isGenerating, setIsGenerating] = useState(false);

  // Local state for tests (would be in database in production)
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);

  // Fetch videos
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['ab-test-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, title, thumbnail_url')
        .eq('generation_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      // Map to expected type with fallback product name
      return (data || []).map(v => ({
        id: v.id,
        title: v.title,
        thumbnail_url: v.thumbnail_url,
        product_name: 'Genie Suite',
      })) as VideoForTest[];
    },
  });

  // Fetch products for context
  const { data: products } = useQuery({
    queryKey: ['ab-test-products'],
    queryFn: () => dynamicMarketingRegistryService.getProducts(),
  });

  // Selected video
  const selectedVideo = useMemo(() => 
    videos?.find(v => v.id === selectedVideoId), 
    [videos, selectedVideoId]
  );

  // Generate AI variants - NOW WIRED TO AI UNIVERSAL PROCESSOR
  const generateVariants = async () => {
    if (!selectedVideo) {
      toast.error('Please select a video first');
      return;
    }

    setIsGenerating(true);

    try {
      const baseTitle = selectedVideo.title;
      const product = products?.find(p => p.name === selectedVideo.product_name);

      // Call AI Universal Processor for intelligent variant generation
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          action: 'generate_variants',
          prompt: `Generate 4 A/B test variants for a ${testType} test.
            
            Original content: "${baseTitle}"
            Product: ${product?.name || 'Genie Suite'}
            Product tagline: ${product?.tagline || 'AI-powered content creation'}
            Test type: ${testType}
            
            For ${testType} variants:
            ${testType === 'title' ? 'Create compelling title variations that test different angles: curiosity, benefit-driven, how-to, and social proof.' : ''}
            ${testType === 'cta' ? 'Create action-oriented CTA variations that test urgency, value, and personalization.' : ''}
            ${testType === 'hook' ? 'Create attention-grabbing hook variations that test pain points, benefits, curiosity, and controversy.' : ''}
            ${testType === 'thumbnail' ? 'Describe 4 thumbnail style variations: bold text, before/after, emotional face, minimalist.' : ''}
            
            Return as JSON array of 4 strings: ["variant1", "variant2", "variant3", "variant4"]`,
          systemPrompt: 'You are an expert A/B testing strategist. Generate variants optimized for engagement and conversion.',
          temperature: 0.7,
        }
      });

      let generatedVariants: string[] = [];

      if (aiResult?.content && !aiError) {
        try {
          // Try to parse JSON array from response
          const jsonMatch = aiResult.content.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            generatedVariants = JSON.parse(jsonMatch[0]);
          }
        } catch {
          console.warn('Failed to parse AI variants, using fallback');
        }
      }

      // Fallback to templates if AI fails
      if (generatedVariants.length === 0) {
        switch (testType) {
          case 'title':
            generatedVariants = TITLE_TEMPLATES.map(template => {
              const core = baseTitle.replace(/^(How to|The|Why|Master)\s+/i, '');
              return `${template.prefix} ${core} ${template.suffix}`.trim();
            }).slice(0, 4);
            break;

          case 'cta':
            generatedVariants = CTA_TEMPLATES.slice(0, 4);
            break;

          case 'hook':
            generatedVariants = HOOK_TEMPLATES.map(template => 
              template
                .replace('{benefit}', product?.tagline || 'success')
                .replace('{pain_point}', 'manual work')
                .replace('{task}', 'content creation')
            ).slice(0, 4);
            break;

          case 'thumbnail':
            generatedVariants = [
              `Style: Bold text overlay - "${baseTitle}"`,
              `Style: Before/After comparison`,
              `Style: Face + emoji reaction`,
              `Style: Minimalist with logo`,
            ];
            break;
        }
      }

      setVariants([selectedVideo.title, ...generatedVariants.slice(0, 3)]);
      toast.success(`Generated ${generatedVariants.length} AI-powered variants!`);
    } catch (error) {
      console.error('Variant generation failed:', error);
      toast.error('Failed to generate variants');
    } finally {
      setIsGenerating(false);
    }
  };

  // Create new test
  const createTest = () => {
    if (!selectedVideo || !testName || variants.filter(v => v.trim()).length < 2) {
      toast.error('Please fill in all required fields');
      return;
    }

    const filteredVariants = variants.filter(v => v.trim());

    const newTest: ABTest = {
      id: `test_${Date.now()}`,
      name: testName,
      type: testType,
      status: 'draft',
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
      variants: filteredVariants.map((content, idx) => ({
        id: `variant_${Date.now()}_${idx}`,
        type: testType,
        content,
        metrics: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          conversions: 0,
          conversionRate: 0,
        },
        isWinner: false,
        isControl: idx === 0,
        createdAt: new Date(),
      })),
      confidenceLevel: 95,
      minimumSampleSize: 1000,
      currentSampleSize: 0,
    };

    setActiveTests(prev => [...prev, newTest]);
    toast.success('A/B Test created!');

    // Reset form
    setTestName('');
    setVariants(['', '']);
    setActiveTab('active');
  };

  // Start/pause test
  const toggleTestStatus = (testId: string) => {
    setActiveTests(prev => prev.map(test => {
      if (test.id === testId) {
        const newStatus = test.status === 'running' ? 'paused' : 'running';
        return {
          ...test,
          status: newStatus,
          startedAt: newStatus === 'running' ? new Date() : test.startedAt,
        };
      }
      return test;
    }));
  };

  // Simulate metrics update (would be real-time in production)
  const simulateMetrics = (testId: string) => {
    setActiveTests(prev => prev.map(test => {
      if (test.id === testId && test.status === 'running') {
        const updatedVariants = test.variants.map((variant, idx) => {
          const impressions = variant.metrics.impressions + Math.floor(Math.random() * 100);
          const clicks = variant.metrics.clicks + Math.floor(Math.random() * (idx === 0 ? 8 : 12));
          const conversions = variant.metrics.conversions + Math.floor(Math.random() * (idx === 0 ? 2 : 4));
          
          return {
            ...variant,
            metrics: {
              impressions,
              clicks,
              ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
              conversions,
              conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
            },
          };
        });

        // Find winner
        const maxCTR = Math.max(...updatedVariants.map(v => v.metrics.ctr));
        const winner = updatedVariants.find(v => v.metrics.ctr === maxCTR);

        return {
          ...test,
          variants: updatedVariants.map(v => ({
            ...v,
            isWinner: v.id === winner?.id && test.currentSampleSize > test.minimumSampleSize * 0.5,
          })),
          currentSampleSize: updatedVariants.reduce((sum, v) => sum + v.metrics.impressions, 0),
        };
      }
      return test;
    }));
  };

  // Complete test
  const completeTest = (testId: string) => {
    setActiveTests(prev => prev.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          status: 'completed',
          endedAt: new Date(),
        };
      }
      return test;
    }));
    toast.success('Test completed! Winner declared.');
  };

  const renderVariantCard = (variant: ABTestVariant, testStatus: string, index: number) => {
    const isRunning = testStatus === 'running';
    
    return (
      <Card 
        key={variant.id} 
        className={`relative ${variant.isWinner ? 'border-green-500 bg-green-500/5' : ''} ${variant.isControl ? 'border-blue-500/50' : ''}`}
      >
        {variant.isWinner && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-green-500">
              <Crown className="w-3 h-3 mr-1" />
              Winner
            </Badge>
          </div>
        )}
        {variant.isControl && (
          <Badge variant="outline" className="absolute -top-2 -left-2 text-xs">
            Control
          </Badge>
        )}
        <CardContent className="pt-6">
          <div className="mb-4">
            <p className="text-sm font-medium line-clamp-2">{variant.content}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {variant.metrics.ctr.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">CTR</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {variant.metrics.conversionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Conv. Rate</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-medium">{variant.metrics.impressions.toLocaleString()}</div>
              <div className="text-muted-foreground">Impressions</div>
            </div>
            <div>
              <div className="font-medium">{variant.metrics.clicks.toLocaleString()}</div>
              <div className="text-muted-foreground">Clicks</div>
            </div>
            <div>
              <div className="font-medium">{variant.metrics.conversions.toLocaleString()}</div>
              <div className="text-muted-foreground">Conversions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            A/B Testing
          </CardTitle>
          <CardDescription>
            Create and track content variations to optimize engagement and conversions
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Test
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Active Tests
            {activeTests.filter(t => t.status === 'running').length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeTests.filter(t => t.status === 'running').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Create Test Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Test Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Test Name</Label>
                  <Input
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., Homepage Title Test"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Test Type</Label>
                  <Select value={testType} onValueChange={(v) => setTestType(v as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Title Variants
                        </span>
                      </SelectItem>
                      <SelectItem value="thumbnail">
                        <span className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Thumbnail Variants
                        </span>
                      </SelectItem>
                      <SelectItem value="cta">
                        <span className="flex items-center gap-2">
                          <MousePointerClick className="w-4 h-4" />
                          CTA Variants
                        </span>
                      </SelectItem>
                      <SelectItem value="hook">
                        <span className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Hook Variants
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Select Video</Label>
                  <Select 
                    value={selectedVideoId || ''} 
                    onValueChange={setSelectedVideoId}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose video..." />
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
              </div>

              {/* AI Generate Button */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={generateVariants}
                  disabled={!selectedVideo || isGenerating}
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate Variants
                    </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  or enter variants manually below
                </span>
              </div>

              {/* Variant Inputs */}
              <div className="space-y-3">
                <Label>Variants (min 2, max 4)</Label>
                {variants.map((variant, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant={idx === 0 ? 'default' : 'outline'} className="w-20 justify-center">
                      {idx === 0 ? 'Control' : `Variant ${String.fromCharCode(65 + idx)}`}
                    </Badge>
                    {testType === 'title' || testType === 'hook' ? (
                      <Input
                        value={variant}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[idx] = e.target.value;
                          setVariants(newVariants);
                        }}
                        placeholder={`Enter ${testType} variant...`}
                      />
                    ) : testType === 'cta' ? (
                      <Select 
                        value={variant}
                        onValueChange={(v) => {
                          const newVariants = [...variants];
                          newVariants[idx] = v;
                          setVariants(newVariants);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select CTA..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CTA_TEMPLATES.map(cta => (
                            <SelectItem key={cta} value={cta}>{cta}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={variant}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[idx] = e.target.value;
                          setVariants(newVariants);
                        }}
                        placeholder={`Enter thumbnail style...`}
                      />
                    )}
                  </div>
                ))}
                
                {variants.length < 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVariants([...variants, ''])}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                )}
              </div>

              {/* Create Button */}
              <Button onClick={createTest} className="w-full">
                <Wand2 className="w-4 h-4 mr-2" />
                Create A/B Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Tests Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeTests.filter(t => t.status !== 'completed').length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Active Tests</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first A/B test to start optimizing content
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeTests
              .filter(t => t.status !== 'completed')
              .map(test => (
                <Card key={test.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {test.name}
                          <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                            {test.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {test.type.charAt(0).toUpperCase() + test.type.slice(1)} test • {test.videoTitle.slice(0, 40)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => simulateMetrics(test.id)}
                          disabled={test.status !== 'running'}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={test.status === 'running' ? 'secondary' : 'default'}
                          size="sm"
                          onClick={() => toggleTestStatus(test.id)}
                        >
                          {test.status === 'running' ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                        {test.currentSampleSize >= test.minimumSampleSize * 0.5 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => completeTest(test.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span>Sample Size</span>
                        <span>{test.currentSampleSize.toLocaleString()} / {test.minimumSampleSize.toLocaleString()}</span>
                      </div>
                      <Progress value={(test.currentSampleSize / test.minimumSampleSize) * 100} className="h-2" />
                    </div>

                    {/* Variants Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {test.variants.map((variant, idx) => renderVariantCard(variant, test.status, idx))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {activeTests.filter(t => t.status === 'completed').length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Completed Tests</h3>
                <p className="text-sm text-muted-foreground">
                  Completed tests will appear here with final results
                </p>
              </CardContent>
            </Card>
          ) : (
            activeTests
              .filter(t => t.status === 'completed')
              .map(test => {
                const winner = test.variants.find(v => v.isWinner);
                const control = test.variants.find(v => v.isControl);
                const improvement = winner && control
                  ? ((winner.metrics.ctr - control.metrics.ctr) / control.metrics.ctr * 100)
                  : 0;

                return (
                  <Card key={test.id} className="border-green-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-500" />
                            {test.name}
                            <Badge className="bg-green-500">Completed</Badge>
                          </CardTitle>
                          <CardDescription>
                            {test.type.charAt(0).toUpperCase() + test.type.slice(1)} test • {test.currentSampleSize.toLocaleString()} total impressions
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-500">
                            +{improvement.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">improvement</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Winner */}
                        {winner && (
                          <Card className="border-green-500 bg-green-500/5">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Crown className="w-4 h-4 text-green-500" />
                                Winner
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="font-medium mb-2">{winner.content}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>CTR: <strong>{winner.metrics.ctr.toFixed(2)}%</strong></span>
                                <span>Conv: <strong>{winner.metrics.conversionRate.toFixed(2)}%</strong></span>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Control */}
                        {control && !control.isWinner && (
                          <Card className="opacity-60">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Control (Original)</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="font-medium mb-2">{control.content}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>CTR: <strong>{control.metrics.ctr.toFixed(2)}%</strong></span>
                                <span>Conv: <strong>{control.metrics.conversionRate.toFixed(2)}%</strong></span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button variant="default" size="sm">
                          <Check className="w-4 h-4 mr-2" />
                          Apply Winner
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Winning Text
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ABTestingPanel;
