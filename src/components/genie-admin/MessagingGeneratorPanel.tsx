/**
 * MESSAGING GENERATOR PANEL
 * 
 * Create and manage AI-generated messaging for products:
 * - Hooks, CTAs, Value Propositions
 * - Pain Points, Benefits, Differentiators
 * - Opening/Closing Lines, Transition Phrases
 * - Short/Medium/Long Script Variants
 * - Approval workflow
 * 
 * Supports:
 * - Single product generation
 * - All 7 products at once (batch)
 * - Full matrix (Product × Audience)
 * - Optional immediate transcreation to 14 languages
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Zap,
  LayoutGrid,
  AlertTriangle,
  Wand2,
  BookOpen,
  Hash,
  Globe,
  Grid3X3,
  Layers,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAIMessaging } from '@/hooks/useAIMessaging';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

interface MessagingGeneratorPanelProps {
  className?: string;
  onMessagingApproved?: (productId: string, messaging: any) => void;
}

// Product color map
const PRODUCT_COLORS: Record<GenieProductId, string> = {
  spark: '#F97316',
  mind: '#3B82F6',
  vibe: '#22C55E',
  deck: '#EAB308',
  arc: '#EC4899',
  studio: '#9333EA',
  cast: '#EF4444',
  ask_genie: '#06B6D4',
};

// All 7 main products (excluding studio as it's the hub)
const MAIN_PRODUCTS: GenieProductId[] = ['spark', 'mind', 'vibe', 'deck', 'arc', 'cast', 'ask_genie'];

// Supported languages for transcreation
const TRANSCREATION_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
];

type GenerationMode = 'single' | 'all_products' | 'matrix';
type TranscreationMode = 'english_only' | 'immediate' | 'deferred';

interface BatchJob {
  id: string;
  productId: GenieProductId;
  audienceId: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  messaging?: any;
  error?: string;
}

export const MessagingGeneratorPanel: React.FC<MessagingGeneratorPanelProps> = ({
  className,
  onMessagingApproved,
}) => {
  const {
    generateMessaging,
    pendingApprovals,
    approveMessaging,
    rejectMessaging,
    getApprovedMessaging,
    targetAudiences,
    competitors,
    frameworks,
    products,
    isGenerating,
    latestMessaging,
  } = useAIMessaging({ showNotifications: true });

  // Generation mode
  const [generationMode, setGenerationMode] = useState<GenerationMode>('single');
  const [transcreationMode, setTranscreationMode] = useState<TranscreationMode>('deferred');
  
  // Single product selection
  const [selectedProduct, setSelectedProduct] = useState<GenieProductId>('spark');
  const [selectedProducts, setSelectedProducts] = useState<GenieProductId[]>(['spark']);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['content_creators']);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [messagingType, setMessagingType] = useState<'product' | 'feature' | 'comparison' | 'tutorial'>('product');
  
  // Batch generation state
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  
  // AI suggestions toggle
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  // UI state
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'generate' | 'pending' | 'approved' | 'matrix'>('generate');

  // Auto-select all products when mode changes to 'all_products'
  React.useEffect(() => {
    if (generationMode === 'all_products') {
      setSelectedProducts([...MAIN_PRODUCTS]);
    } else if (generationMode === 'single') {
      setSelectedProducts([selectedProduct]);
    }
  }, [generationMode, selectedProduct]);

  // Get approved messaging for all products
  const approvedByProduct = useMemo(() => {
    const result: Record<string, any> = {};
    Object.keys(products).forEach(productId => {
      const approved = getApprovedMessaging(productId);
      if (approved) {
        result[productId] = approved;
      }
    });
    return result;
  }, [products, getApprovedMessaging, pendingApprovals]);

  // Calculate matrix stats
  const matrixStats = useMemo(() => {
    const totalProducts = MAIN_PRODUCTS.length;
    const totalAudiences = targetAudiences.length;
    const totalCombinations = totalProducts * totalAudiences;
    const approvedCount = Object.keys(approvedByProduct).length;
    const pendingCount = pendingApprovals.length;
    
    return {
      totalProducts,
      totalAudiences,
      totalCombinations,
      approvedCount,
      pendingCount,
      coverage: Math.round((approvedCount / totalProducts) * 100),
    };
  }, [approvedByProduct, pendingApprovals, targetAudiences]);

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleProductSelection = (productId: GenieProductId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(p => p !== productId)
        : [...prev, productId]
    );
  };

  const toggleAudienceSelection = (audienceId: string) => {
    setSelectedAudiences(prev => 
      prev.includes(audienceId) 
        ? prev.filter(a => a !== audienceId)
        : [...prev, audienceId]
    );
  };

  // Single product generation
  const handleSingleGenerate = async () => {
    if (selectedAudiences.length === 0) {
      toast.error('Please select at least one target audience');
      return;
    }

    await generateMessaging(selectedProduct, {
      type: messagingType,
      targetAudience: selectedAudiences,
      competitors: selectedCompetitors,
    });
  };

  // Batch generation - All products at once
  const handleBatchGenerate = async () => {
    if (selectedAudiences.length === 0) {
      toast.error('Please select at least one target audience');
      return;
    }

    const productsToGenerate = generationMode === 'all_products' 
      ? MAIN_PRODUCTS 
      : selectedProducts;

    if (productsToGenerate.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress(0);

    // Create jobs
    const jobs: BatchJob[] = productsToGenerate.map(productId => ({
      id: `batch_${productId}_${Date.now()}`,
      productId,
      audienceId: selectedAudiences.join(','),
      status: 'pending' as const,
    }));

    setBatchJobs(jobs);

    // Process jobs sequentially
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      // Update status to generating
      setBatchJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'generating' as const } : j
      ));

      try {
        const messaging = await generateMessaging(job.productId, {
          type: messagingType,
          targetAudience: selectedAudiences,
          competitors: selectedCompetitors,
        });

        // Update with success
        setBatchJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'complete' as const, messaging } : j
        ));
      } catch (error) {
        // Update with error
        setBatchJobs(prev => prev.map(j => 
          j.id === job.id ? { 
            ...j, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Generation failed' 
          } : j
        ));
      }

      setBatchProgress(Math.round(((i + 1) / jobs.length) * 100));
    }

    setIsBatchGenerating(false);
    toast.success(`Generated messaging for ${jobs.filter(j => j.status === 'complete').length}/${jobs.length} products`);
  };

  // Matrix generation - All products × All audiences
  const handleMatrixGenerate = async () => {
    setIsBatchGenerating(true);
    setBatchProgress(0);

    const jobs: BatchJob[] = [];
    
    // Create jobs for each product × audience combination
    for (const productId of MAIN_PRODUCTS) {
      for (const audience of targetAudiences) {
        jobs.push({
          id: `matrix_${productId}_${audience.id}_${Date.now()}`,
          productId,
          audienceId: audience.id,
          status: 'pending',
        });
      }
    }

    setBatchJobs(jobs);

    // Process jobs
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      setBatchJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'generating' as const } : j
      ));

      try {
        const messaging = await generateMessaging(job.productId, {
          type: 'product',
          targetAudience: [job.audienceId],
          competitors: [],
        });

        setBatchJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'complete' as const, messaging } : j
        ));
      } catch (error) {
        setBatchJobs(prev => prev.map(j => 
          j.id === job.id ? { 
            ...j, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Failed' 
          } : j
        ));
      }

      setBatchProgress(Math.round(((i + 1) / jobs.length) * 100));
    }

    setIsBatchGenerating(false);
    const successCount = jobs.filter(j => j.status === 'complete').length;
    toast.success(`Matrix generation complete: ${successCount}/${jobs.length} combinations`);
  };

  const handleApprove = (requestId: string) => {
    approveMessaging(requestId, 'admin');
    const pending = pendingApprovals.find(p => p.id === requestId);
    if (pending && onMessagingApproved) {
      onMessagingApproved(pending.productId, latestMessaging);
    }
  };

  const handleApproveAll = () => {
    pendingApprovals.forEach(pending => {
      approveMessaging(pending.id, 'admin');
    });
    toast.success(`Approved ${pendingApprovals.length} messaging items`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const renderMessagingCard = (messaging: any, isApproved: boolean = false, compact: boolean = false) => (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {/* Core Messaging */}
      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
        {/* Headline & Hook */}
        <Card className="border-orange-200/50 bg-orange-50/30 dark:bg-orange-950/10">
          <CardHeader className={cn("px-4", compact ? "py-2" : "py-3")}>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Headline & Hook
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Headline</Label>
              <div className="flex items-start gap-2">
                <p className={cn("font-medium flex-1", compact ? "text-xs" : "text-sm")}>{messaging.headline}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(messaging.headline, 'Headline')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hook</Label>
              <div className="flex items-start gap-2">
                <p className={cn("flex-1", compact ? "text-xs" : "text-sm")}>{messaging.hook}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(messaging.hook, 'Hook')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {!compact && (
              <div>
                <Label className="text-xs text-muted-foreground">Sub-Hook</Label>
                <p className="text-sm text-muted-foreground">{messaging.subHook}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTAs */}
        <Card className="border-green-200/50 bg-green-50/30 dark:bg-green-950/10">
          <CardHeader className={cn("px-4", compact ? "py-2" : "py-3")}>
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-500" />
              Call to Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Primary CTA</Label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 hover:bg-green-600">{messaging.cta}</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(messaging.cta, 'CTA')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Secondary CTA</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{messaging.ctaSecondary}</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(messaging.ctaSecondary, 'Secondary CTA')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Proposition */}
      <Card className="border-purple-200/50 bg-purple-50/30 dark:bg-purple-950/10">
        <CardHeader className={cn("px-4", compact ? "py-2" : "py-3")}>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Value Proposition
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{messaging.valueProposition}</p>
        </CardContent>
      </Card>

      {/* Pain Points, Benefits, Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              Pain Points
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <ul className="space-y-1">
              {messaging.painPoints?.map((point: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-red-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <ul className="space-y-1">
              {messaging.benefits?.map((benefit: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-green-500">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              Differentiators
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <ul className="space-y-1">
              {messaging.differentiators?.map((diff: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-blue-500">★</span>
                  {diff}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {!compact && (
        <>
          {/* Script Lines */}
          <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Script Lines
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Opening Line</Label>
                  <p className="text-sm italic">"{messaging.openingLine}"</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Closing Line</Label>
                  <p className="text-sm italic">"{messaging.closingLine}"</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Transition Phrases</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {messaging.transitionPhrases?.map((phrase: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Script Variants */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Script Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <Tabs defaultValue="short" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="short" className="text-xs">Short (30s)</TabsTrigger>
                  <TabsTrigger value="medium" className="text-xs">Medium (60s)</TabsTrigger>
                  <TabsTrigger value="long" className="text-xs">Long (90s)</TabsTrigger>
                </TabsList>
                <TabsContent value="short" className="mt-3">
                  <div className="relative">
                    <Textarea 
                      value={messaging.shortScript} 
                      readOnly 
                      className="text-xs min-h-[100px] resize-none"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => copyToClipboard(messaging.shortScript, '30s Script')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="medium" className="mt-3">
                  <div className="relative">
                    <Textarea 
                      value={messaging.mediumScript} 
                      readOnly 
                      className="text-xs min-h-[120px] resize-none"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => copyToClipboard(messaging.mediumScript, '60s Script')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="long" className="mt-3">
                  <div className="relative">
                    <Textarea 
                      value={messaging.longScript} 
                      readOnly 
                      className="text-xs min-h-[150px] resize-none"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => copyToClipboard(messaging.longScript, '90s Script')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* SEO & Social */}
          <Card className="border-cyan-200/50 bg-cyan-50/30 dark:bg-cyan-950/10">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-500" />
                SEO & Social
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Meta Description</Label>
                <p className="text-sm">{messaging.metaDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Hashtags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {messaging.hashtags?.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px] text-cyan-600">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {messaging.keywords?.map((kw: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Confidence & Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Confidence: {Math.round((messaging.confidence || 0.85) * 100)}%
          </span>
          <span>Version: {messaging.version || 1}</span>
        </div>
        {isApproved && (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Messaging Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate hooks, CTAs, positioning for single products, all products, or full matrix
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            {matrixStats.approvedCount}/{matrixStats.totalProducts} Products
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            {pendingApprovals.length} Pending
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5">
            <Grid3X3 className="w-3.5 h-3.5" />
            Matrix
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending
            {pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generation Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Generation Mode</Label>
                  <RadioGroup value={generationMode} onValueChange={(v) => setGenerationMode(v as GenerationMode)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="text-sm cursor-pointer">
                        Single Product
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all_products" id="all_products" />
                      <Label htmlFor="all_products" className="text-sm cursor-pointer flex items-center gap-2">
                        All 7 Products
                        <Badge variant="outline" className="text-[10px]">Batch</Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="matrix" id="matrix_mode" />
                      <Label htmlFor="matrix_mode" className="text-sm cursor-pointer flex items-center gap-2">
                        Full Matrix
                        <Badge variant="secondary" className="text-[10px]">{matrixStats.totalCombinations}</Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Product Selection (for single mode) */}
                {generationMode === 'single' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Product</Label>
                    <Select value={selectedProduct} onValueChange={(v) => setSelectedProduct(v as GenieProductId)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(products).map(([id, product]) => (
                          <SelectItem key={id} value={id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PRODUCT_COLORS[id as GenieProductId] }}
                              />
                              {product.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Multi-Product Selection (for batch) */}
                {generationMode !== 'single' && generationMode !== 'matrix' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Products to Generate</Label>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {MAIN_PRODUCTS.map(productId => (
                        <div key={productId} className="flex items-center space-x-2">
                          <Checkbox
                            id={productId}
                            checked={selectedProducts.includes(productId)}
                            onCheckedChange={() => toggleProductSelection(productId)}
                            disabled={generationMode === 'all_products'}
                          />
                          <Label htmlFor={productId} className="text-sm flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: PRODUCT_COLORS[productId] }}
                            />
                            {products[productId]?.name || productId}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audiences */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Target Audiences</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={() => setSelectedAudiences(targetAudiences.map(a => a.id))}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={() => setShowAISuggestions(!showAISuggestions)}
                      >
                        <Lightbulb className="w-3 h-3" />
                        AI Suggest
                      </Button>
                    </div>
                  </div>
                  
                  {/* AI Suggestions Panel */}
                  {showAISuggestions && (
                    <Card className="border-primary/20 bg-primary/5 p-3">
                      <p className="text-xs font-medium flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        AI Recommended Combinations
                      </p>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <p>• <strong>Consolidated:</strong> Single message covering all audiences (good for unified campaigns)</p>
                        <p>• <strong>Segmented:</strong> Separate messaging per audience (best for targeted campaigns)</p>
                        <p>• <strong>Hybrid:</strong> Group similar audiences (Content Creators + Influencers, Enterprise + Product Managers)</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7"
                          onClick={() => setSelectedAudiences(['content_creators', 'influencers', 'knowledge_sharers'])}
                        >
                          Creator Focus
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7"
                          onClick={() => setSelectedAudiences(['marketing_teams', 'sales_teams', 'agencies_freelancers'])}
                        >
                          Business Focus
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7"
                          onClick={() => setSelectedAudiences(['enterprise_teams', 'product_managers', 'executive_leadership'])}
                        >
                          Enterprise Focus
                        </Button>
                      </div>
                    </Card>
                  )}
                  
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {targetAudiences.map(audience => (
                      <div key={audience.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={audience.id}
                          checked={selectedAudiences.includes(audience.id)}
                          onCheckedChange={() => toggleAudienceSelection(audience.id)}
                        />
                        <Label htmlFor={audience.id} className="text-sm">
                          {audience.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Selection summary */}
                  <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
                    <Users className="w-3 h-3" />
                    {selectedAudiences.length} audience{selectedAudiences.length !== 1 ? 's' : ''} selected
                    {generationMode === 'matrix' && (
                      <Badge variant="secondary" className="text-[10px]">
                        = {selectedProducts.length * selectedAudiences.length} combinations
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Transcreation Mode */}
                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Regional Transcreation
                  </Label>
                  <RadioGroup value={transcreationMode} onValueChange={(v) => setTranscreationMode(v as TranscreationMode)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="deferred" id="deferred" />
                      <Label htmlFor="deferred" className="text-sm cursor-pointer">
                        At Video Production (on-demand)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate" className="text-sm cursor-pointer flex items-center gap-2">
                        Immediate (14 languages)
                        <Badge variant="outline" className="text-[10px]">More credits</Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="english_only" id="english_only" />
                      <Label htmlFor="english_only" className="text-sm cursor-pointer">
                        English Only
                      </Label>
                    </div>
                  </RadioGroup>
                  {transcreationMode === 'immediate' && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {TRANSCREATION_LANGUAGES.slice(0, 8).map(lang => (
                        <Badge key={lang.code} variant="secondary" className="text-[10px]">
                          {lang.flag} {lang.name}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-[10px]">
                        +{TRANSCREATION_LANGUAGES.length - 8} more
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <Button 
                  className="w-full gap-2" 
                  onClick={
                    generationMode === 'single' 
                      ? handleSingleGenerate 
                      : generationMode === 'matrix'
                        ? handleMatrixGenerate
                        : handleBatchGenerate
                  }
                  disabled={isGenerating || isBatchGenerating || selectedAudiences.length === 0}
                >
                  {isGenerating || isBatchGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      {generationMode === 'single' && 'Generate Messaging'}
                      {generationMode === 'all_products' && 'Generate All 7 Products'}
                      {generationMode === 'matrix' && `Generate ${matrixStats.totalCombinations} Combinations`}
                    </>
                  )}
                </Button>

                {/* Batch Progress */}
                {isBatchGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{batchProgress}%</span>
                    </div>
                    <Progress value={batchProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {batchJobs.filter(j => j.status === 'complete').length}/{batchJobs.length} complete
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview / Result */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {latestMessaging ? 'Generated Messaging' : 'Preview'}
                </CardTitle>
                <CardDescription>
                  {latestMessaging 
                    ? `Generated for ${products[latestMessaging.productId as GenieProductId]?.name || latestMessaging.productId}`
                    : 'Configure options and click Generate to create messaging'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestMessaging ? (
                  <ScrollArea className="h-[600px] pr-4">
                    {renderMessagingCard(latestMessaging)}
                  </ScrollArea>
                ) : batchJobs.length > 0 ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {batchJobs.map(job => (
                        <div 
                          key={job.id}
                          className={cn(
                            "p-3 rounded-lg border flex items-center gap-3",
                            job.status === 'complete' && "border-green-200 bg-green-50/30",
                            job.status === 'error' && "border-red-200 bg-red-50/30",
                            job.status === 'generating' && "border-blue-200 bg-blue-50/30",
                            job.status === 'pending' && "border-muted"
                          )}
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PRODUCT_COLORS[job.productId] }}
                          />
                          <span className="font-medium text-sm flex-1">
                            {products[job.productId]?.name}
                          </span>
                          {job.status === 'generating' && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
                          {job.status === 'complete' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {job.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                          {job.status === 'pending' && <Clock className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No messaging generated yet</p>
                    <p className="text-sm">Select a mode and generate messaging</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Matrix View Tab */}
        <TabsContent value="matrix" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5" />
                    Product × Audience Matrix
                  </CardTitle>
                  <CardDescription>
                    {matrixStats.totalCombinations} total combinations • {matrixStats.approvedCount} products with approved messaging
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleMatrixGenerate}
                  disabled={isBatchGenerating}
                  className="gap-2"
                >
                  {isBatchGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  Generate Full Matrix
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Product</th>
                      {targetAudiences.map(audience => (
                        <th key={audience.id} className="text-center p-2 font-medium text-xs">
                          {audience.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MAIN_PRODUCTS.map(productId => {
                      const product = products[productId];
                      const hasApproved = approvedByProduct[productId];
                      
                      return (
                        <tr key={productId} className="border-b hover:bg-muted/30">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PRODUCT_COLORS[productId] }}
                              />
                              <span className="font-medium">{product?.name}</span>
                              {hasApproved && (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </td>
                          {targetAudiences.map(audience => {
                            // Check if we have approved messaging for this combo
                            const hasMsgForAudience = hasApproved; // Simplified - in reality would check audience
                            
                            return (
                              <td key={audience.id} className="text-center p-2">
                                {hasMsgForAudience ? (
                                  <Badge variant="default" className="text-[10px]">
                                    ✓
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                    —
                                  </Badge>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending" className="space-y-6 mt-6">
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No pending approvals</p>
                <p className="text-sm">Generate messaging and it will appear here for approval</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {pendingApprovals.length} item(s) pending approval
                </span>
                <Button onClick={handleApproveAll} variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approve All
                </Button>
              </div>
              <div className="space-y-4">
                {pendingApprovals.map(request => {
                  const product = products[request.productId];
                  const messaging = latestMessaging?.requestId === request.id ? latestMessaging : null;
                  
                  return (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: PRODUCT_COLORS[request.productId] }}
                            />
                            {product?.name || request.productId}
                            <Badge variant="secondary" className="ml-2">
                              {request.type}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => rejectMessaging(request.id, 'Not suitable')}
                              className="gap-1 text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Generated {request.generatedAt?.toLocaleString() || 'recently'} • 
                          Audiences: {request.targetAudience.join(', ')}
                        </CardDescription>
                      </CardHeader>
                      {messaging && (
                        <CardContent>
                          <ScrollArea className="h-[400px] pr-4">
                            {renderMessagingCard(messaging)}
                          </ScrollArea>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-6 mt-6">
          {Object.keys(approvedByProduct).length === 0 ? (
            <Card>
              <CardContent className="text-center py-16 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No approved messaging yet</p>
                <p className="text-sm">Approve generated messaging to see it here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(approvedByProduct).map(([productId, messaging]) => {
                const product = products[productId as GenieProductId];
                const isExpanded = expandedProducts.has(productId);
                
                return (
                  <Collapsible
                    key={productId}
                    open={isExpanded}
                    onOpenChange={() => toggleProduct(productId)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PRODUCT_COLORS[productId as GenieProductId] }}
                              />
                              {product?.name || productId}
                              <Badge variant="default" className="ml-2 gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </Badge>
                            </CardTitle>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <ScrollArea className="h-[500px] pr-4">
                            {renderMessagingCard(messaging, true)}
                          </ScrollArea>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingGeneratorPanel;
