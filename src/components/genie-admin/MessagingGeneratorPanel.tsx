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

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { MASTER_REGION_GROUPS, toggleParentRegion, getLanguagesForRegions, type RegionGroupConfig } from '@/config/regionConfig';
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
import { InlineTrainAIFeedback } from '@/components/genie-studio/InlineTrainAIFeedback';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';
import { PRODUCTION_CONTEXT_TONES, type ProductionCapability } from '@/services/marketing/aiMessagingGeneratorService';
import { audienceRelevanceService } from '@/services/audienceRelevanceService';
import { ThumbsUp, ThumbsDown, Film } from 'lucide-react';
import { VirtualizedMessagingMatrix } from './genie-cast/VirtualizedMessagingMatrix';
import { MessagingDataTable, type MessagingEntry, type MessagingStatus } from './genie-cast/MessagingDataTable';
import { toast } from 'sonner';

interface MessagingGeneratorPanelProps {
  className?: string;
  onMessagingApproved?: (productId: string, messaging: any) => void;
  /** Pre-selected product from the top-bar ProductSelector */
  initialProductId?: string;
  /** Pre-selected production capability from template/asset labs */
  initialProductionCapability?: ProductionCapability;
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

// Transcreation languages are now derived from MASTER_REGION_GROUPS via regionConfig.ts
// No hardcoded TRANSCREATION_LANGUAGES — uses Parent → Sub-Region expandable selector

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
  initialProductId,
  initialProductionCapability,
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

  // Regional detection for IP-based transcreation
  const { 
    selectedRegion, 
    detectedRegion, 
    regionName, 
    isRTL, 
    setRegion, 
    resetToDetected 
  } = useRegionalDetection();

  // Generation mode
  const [generationMode, setGenerationMode] = useState<GenerationMode>('single');
  const [transcreationMode, setTranscreationMode] = useState<TranscreationMode>('deferred');
  
  // Single product selection — sync with top-bar ProductSelector
  const [selectedProduct, setSelectedProduct] = useState<GenieProductId>(
    (initialProductId && initialProductId in products) ? initialProductId as GenieProductId : 'spark'
  );
  const [selectedProducts, setSelectedProducts] = useState<GenieProductId[]>(
    [(initialProductId && initialProductId in products) ? initialProductId as GenieProductId : 'spark']
  );
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['content_creators']);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [messagingType, setMessagingType] = useState<'product' | 'feature' | 'comparison' | 'tutorial'>('product');
  const [selectedCapability, setSelectedCapability] = useState<ProductionCapability | 'auto'>(
    initialProductionCapability || 'auto'
  );
  // Batch generation state
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  
  // AI suggestions
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isLoadingAISuggestions, setIsLoadingAISuggestions] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [aiSuggestedGroups, setAiSuggestedGroups] = useState<{ label: string; ids: string[]; reason: string }[]>([]);
  
  // UI state
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [selectedTranscreationRegions, setSelectedTranscreationRegions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'pending' | 'approved' | 'matrix'>('generate');

  // Derived languages from selected regions
  const derivedLanguages = useMemo(
    () => getLanguagesForRegions(selectedTranscreationRegions),
    [selectedTranscreationRegions]
  );

  // Toggle parent region (selects/deselects all children)
  const handleToggleParentRegion = useCallback((parentName: string) => {
    setSelectedTranscreationRegions(prev => toggleParentRegion(parentName, prev));
  }, []);

  // Toggle individual sub-region
  const handleToggleSubRegion = useCallback((code: string) => {
    setSelectedTranscreationRegions(prev =>
      prev.includes(code) ? prev.filter(r => r !== code) : [...prev, code]
    );
  }, []);

  // Sync with top-bar product selector when it changes
  React.useEffect(() => {
    if (initialProductId && initialProductId in products) {
      setSelectedProduct(initialProductId as GenieProductId);
      if (generationMode === 'single') {
        setSelectedProducts([initialProductId as GenieProductId]);
      }
    }
  }, [initialProductId, products, generationMode]);

  // Sync production capability from template/asset labs
  React.useEffect(() => {
    if (initialProductionCapability) {
      setSelectedCapability(initialProductionCapability);
    }
  }, [initialProductionCapability]);
  // Auto-select all products when mode changes to 'all_products'
  React.useEffect(() => {
    if (generationMode === 'all_products') {
      setSelectedProducts([...MAIN_PRODUCTS]);
    } else if (generationMode === 'single') {
      setSelectedProducts([selectedProduct]);
    }
  }, [generationMode, selectedProduct]);

  // Generate AI-powered audience suggestions based on context
  const generateAISuggestions = useCallback(async () => {
    setIsLoadingAISuggestions(true);
    try {
      const productName = products[selectedProduct]?.name || selectedProduct;
      const competitorNames = selectedCompetitors.map(c => {
        const found = competitors.find((comp: any) => comp.id === c);
        return found?.name || c;
      });
      const audienceList = targetAudiences.map((a: any) => `${a.id}: ${a.label}`).join(', ');
      
      // Fetch product knowledge from database to enrich the AI prompt
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: productKnowledge } = await supabase
        .from('product_knowledge_registry')
        .select('value_proposition, pain_points, key_benefits, use_cases, positioning_statement, differentiators')
        .eq('product_id', selectedProduct)
        .eq('is_current', true)
        .single();

      // Build enriched context from product knowledge
      let enrichedContext = `Product: ${productName}\nCampaign Type: ${messagingType}\nCompetitors: ${competitorNames.length > 0 ? competitorNames.join(', ') : 'None'}\n`;
      
      if (productKnowledge) {
        enrichedContext += `\nProduct Strategy Context:\n`;
        if (productKnowledge.value_proposition) enrichedContext += `- Value Proposition: ${productKnowledge.value_proposition}\n`;
        if (productKnowledge.positioning_statement) enrichedContext += `- Positioning: ${productKnowledge.positioning_statement}\n`;
        if (productKnowledge.pain_points && Array.isArray(productKnowledge.pain_points)) {
          enrichedContext += `- Pain Points Solved: ${productKnowledge.pain_points.join(', ')}\n`;
        }
        if (productKnowledge.key_benefits && Array.isArray(productKnowledge.key_benefits)) {
          enrichedContext += `- Key Benefits: ${productKnowledge.key_benefits.join(', ')}\n`;
        }
        if (productKnowledge.use_cases && Array.isArray(productKnowledge.use_cases)) {
          enrichedContext += `- Primary Use Cases: ${productKnowledge.use_cases.join(', ')}\n`;
        }
        if (productKnowledge.differentiators) enrichedContext += `- Differentiators: ${productKnowledge.differentiators}\n`;
      }

      // Inject learned relevance from feedback (Option C - learning loop)
      const relevanceContext = await audienceRelevanceService.getRelevanceContext(selectedProduct);
      if (relevanceContext) {
        enrichedContext += relevanceContext;
      }

      const prompt = `Based on this campaign context and product knowledge, suggest 3-4 target audience groups that best align with the product's value proposition, benefits, and use cases.

${enrichedContext}
Available Audiences: ${audienceList}

For each suggestion, provide:
- label: the audience group name
- ids: array of audience IDs from the Available Audiences list
- reason: why this group is ideal for this campaign given the product's positioning and pain points it solves (max 2 sentences, be specific about alignment)

Return ONLY valid JSON array like: [{"label":"Group Name","ids":["id1","id2"],"reason":"Why this group fits"}].`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: { action: 'generate_marketing_messaging', provider: 'anthropic', prompt, systemPrompt: 'You are a marketing strategist. Return ONLY a valid JSON array, no markdown fences.' },
      });
      if (error) throw error;
      const content = data?.content || data?.data?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const groups = JSON.parse(jsonMatch[0]);
        const validGroups = groups.map((g: any) => ({
          label: g.label,
          ids: (g.ids || []).filter((id: string) => targetAudiences.some((a: any) => a.id === id)),
          reason: g.reason || '',
        })).filter((g: any) => g.ids.length > 0);
        setAiSuggestedGroups(validGroups);
      }
    } catch (err) {
      console.error('[MessagingGenerator] AI suggestion failed:', err);
      setAiSuggestedGroups([
        { label: 'Creator Focus', ids: targetAudiences.slice(0, 3).map((a: any) => a.id), reason: 'Top content creation audiences' },
        { label: 'Business Focus', ids: targetAudiences.slice(3, 6).map((a: any) => a.id), reason: 'Business decision-makers' },
      ]);
    } finally {
      setIsLoadingAISuggestions(false);
    }
  }, [selectedProduct, selectedCompetitors, messagingType, products, competitors, targetAudiences]);

  // Auto-trigger AI suggestions when panel opens
  useEffect(() => {
    if (showAISuggestions && aiSuggestedGroups.length === 0) {
      generateAISuggestions();
    }
  }, [showAISuggestions]);

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
      productionCapability: selectedCapability !== 'auto' ? selectedCapability : undefined,
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
          productionCapability: selectedCapability !== 'auto' ? selectedCapability : undefined,
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
          productionCapability: selectedCapability !== 'auto' ? selectedCapability : undefined,
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

      {/* RLHF Feedback for generated messaging */}
      <div className="pt-2 border-t">
        <InlineTrainAIFeedback
          data={{
            context: 'content_generation',
            product: (messaging.productId || selectedProduct || 'spark') as any,
            contentId: messaging.id || `msg_${messaging.headline?.slice(0, 20)}`,
            originalContent: `Headline: ${messaging.headline}\nHook: ${messaging.hook}\nCTA: ${messaging.cta}\nValue Prop: ${messaging.valueProposition}`,
            metadata: { messagingType, audiences: selectedAudiences },
          }}
          variant="compact"
          showTextFeedback={true}
        />
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
                  
                  {/* AI-Powered Suggestions Panel */}
                  {showAISuggestions && (
                    <Card className="border-primary/20 bg-primary/5 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          AI Recommended Audiences
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] gap-1"
                          onClick={() => {
                            setAiSuggestedGroups([]);
                            generateAISuggestions();
                          }}
                          disabled={isLoadingAISuggestions}
                        >
                          <RefreshCw className={cn("w-3 h-3", isLoadingAISuggestions && "animate-spin")} />
                          {isLoadingAISuggestions ? 'Analyzing...' : 'Refresh'}
                        </Button>
                      </div>

                      {isLoadingAISuggestions ? (
                        <div className="space-y-2">
                          <Progress value={45} className="h-1" />
                          <p className="text-[10px] text-muted-foreground">
                            Analyzing product, competitors & regions for best audience fit...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                          {aiSuggestedGroups.map(group => {
                            const allSelected = group.ids.every(id => selectedAudiences.includes(id));
                            return (
                              <button
                                key={group.label}
                                className={cn(
                                  "w-full text-left rounded-md border p-2 transition-colors cursor-pointer",
                                  allSelected
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-background hover:bg-muted/50"
                                )}
                                onClick={() => {
                                  if (allSelected) {
                                    setSelectedAudiences(prev => prev.filter(id => !group.ids.includes(id)));
                                  } else {
                                    setSelectedAudiences(prev => [...new Set([...prev, ...group.ids])]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  {allSelected && <CheckCircle className="w-3 h-3 text-primary shrink-0" />}
                                  <span className="text-[11px] font-medium truncate">{group.label}</span>
                                  <span className="text-[9px] text-muted-foreground ml-auto shrink-0">
                                    {group.ids.length} audience{group.ids.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">{group.reason}</p>
                                {/* Like/Dislike feedback buttons */}
                                <div className="flex items-center gap-1 mt-1 justify-end" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    className={cn(
                                      "p-0.5 rounded transition-colors",
                                      feedbackGiven[group.label] === 'like'
                                        ? "text-primary bg-primary/20"
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    )}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setFeedbackGiven(prev => ({ ...prev, [group.label]: 'like' }));
                                      for (const audId of group.ids) {
                                        await audienceRelevanceService.recordFeedback(selectedProduct, audId, true);
                                      }
                                      toast.success('Feedback recorded — AI will learn this preference');
                                    }}
                                    title="This audience fits well"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    className={cn(
                                      "p-0.5 rounded transition-colors",
                                      feedbackGiven[group.label] === 'dislike'
                                        ? "text-destructive bg-destructive/20"
                                        : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    )}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setFeedbackGiven(prev => ({ ...prev, [group.label]: 'dislike' }));
                                      for (const audId of group.ids) {
                                        await audienceRelevanceService.recordFeedback(selectedProduct, audId, false);
                                      }
                                      toast.info('Feedback recorded — AI will deprioritize this audience');
                                    }}
                                    title="This audience doesn't fit"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </button>
                            );
                          })}
                          {aiSuggestedGroups.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-7 w-full"
                              onClick={() => {
                                const allIds = aiSuggestedGroups.flatMap(g => g.ids);
                                setSelectedAudiences(prev => [...new Set([...prev, ...allIds])]);
                              }}
                            >
                              Apply All AI Suggestions
                            </Button>
                          )}
                        </div>
                      )}
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

                {/* Regional Detection Banner */}
                <Card className="border-blue-200/50 bg-blue-50/30 dark:bg-blue-950/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium">Auto-Detected Region</p>
                        <p className="text-sm font-semibold">{regionName} ({selectedRegion.toUpperCase()})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRTL && (
                        <Badge variant="outline" className="text-[10px]">RTL</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px]"
                        onClick={resetToDetected}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    IP-based detection routes TTS/Video to optimal regional providers
                  </p>
                </Card>

                {/* Regional transcreation is handled by the global RegionSelector in the header */}

                {/* Production Context Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Film className="w-3.5 h-3.5" />
                    Production Context
                  </Label>
                  <Select 
                    value={selectedCapability} 
                    onValueChange={(v) => setSelectedCapability(v as ProductionCapability | 'auto')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect from template" />
                    </SelectTrigger>
                    <SelectContent className="z-[100000]">
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-primary" />
                          Auto (from template/style)
                        </div>
                      </SelectItem>
                      {Object.entries(PRODUCTION_CONTEXT_TONES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{config.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedCapability === 'auto' 
                      ? 'Will adapt tone based on selected template style'
                      : PRODUCTION_CONTEXT_TONES[selectedCapability as ProductionCapability]?.description || ''
                    }
                  </p>
                  {initialProductionCapability && selectedCapability !== initialProductionCapability && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 text-primary"
                      onClick={() => setSelectedCapability(initialProductionCapability)}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset to template default ({PRODUCTION_CONTEXT_TONES[initialProductionCapability]?.name})
                    </Button>
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
                  {latestMessaging ? 'Generated Messaging' : batchJobs.length > 0 ? 'Batch Results' : 'Preview'}
                </CardTitle>
                <CardDescription>
                  {latestMessaging 
                    ? `Generated for ${products[latestMessaging.productId as GenieProductId]?.name || latestMessaging.productId}`
                    : batchJobs.length > 0 
                      ? `${batchJobs.filter(j => j.status === 'complete').length}/${batchJobs.length} complete`
                      : 'Configure options and click Generate to create messaging'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Single product - show full card */}
                {latestMessaging && generationMode === 'single' ? (
                  <ScrollArea className="h-[600px] pr-4">
                    {renderMessagingCard(latestMessaging)}
                  </ScrollArea>
                ) : batchJobs.length > 0 ? (
                  /* Multi-product - show compact table grid */
                  <MessagingDataTable
                    entries={batchJobs.map(job => ({
                      id: job.id,
                      productId: job.productId,
                      audienceId: job.audienceId,
                      audienceLabel: job.audienceId.split(',').map(id => {
                        const aud = targetAudiences.find((a: any) => a.id === id);
                        return aud?.label || id;
                      }).join(', '),
                      regionCode: 'en_master',
                      regionLabel: 'English Master',
                      status: (job.status === 'complete' ? 'pending' : job.status === 'error' ? 'rejected' : 'draft') as MessagingStatus,
                      currentVersion: 1,
                      versions: job.messaging ? [{
                        version: 1,
                        messaging: job.messaging,
                        status: 'pending' as MessagingStatus,
                        createdAt: new Date().toISOString(),
                      }] : [],
                      messaging: job.messaging || undefined,
                      createdAt: new Date().toISOString(),
                    }))}
                    onApprove={(id) => {
                      const job = batchJobs.find(j => j.id === id);
                      if (job?.messaging) {
                        // Find the pending approval for this product
                        const pending = pendingApprovals.find(p => p.productId === job.productId);
                        if (pending) handleApprove(pending.id);
                      }
                    }}
                    onRegenerate={(_, productId, audienceId) => {
                      generateMessaging(productId, {
                        type: messagingType,
                        targetAudience: audienceId.split(','),
                        competitors: selectedCompetitors,
                        productionCapability: selectedCapability !== 'auto' ? selectedCapability : undefined,
                      });
                    }}
                    isGenerating={isGenerating || isBatchGenerating}
                    emptyMessage="No results yet"
                  />
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

        {/* Matrix View Tab - Using VirtualizedMessagingMatrix */}
        <TabsContent value="matrix" className="space-y-6 mt-6">
          <VirtualizedMessagingMatrix
            products={products}
            audiences={targetAudiences.map(a => ({ id: a.id, label: a.label }))}
            messagingData={(() => {
              // Build messaging data from approved + pending
              const data: Array<{
                id: string;
                productId: GenieProductId;
                audienceId: string;
                status: 'pending' | 'approved' | 'rejected' | 'missing';
                messaging?: { headline: string; hook: string; cta: string; valueProposition: string; };
                generatedAt?: string;
                approvedAt?: string;
              }> = [];
              
              // Create entries for all product × audience combinations
              MAIN_PRODUCTS.forEach(productId => {
                targetAudiences.forEach(audience => {
                  const approvedMsg = approvedByProduct[productId];
                  const pendingReq = pendingApprovals.find(p => p.productId === productId);
                  
                  if (approvedMsg) {
                    data.push({
                      id: `${productId}_${audience.id}_approved`,
                      productId,
                      audienceId: audience.id,
                      status: 'approved',
                      messaging: {
                        headline: approvedMsg.headline || '',
                        hook: approvedMsg.hook || '',
                        cta: approvedMsg.cta || '',
                        valueProposition: approvedMsg.valueProposition || '',
                      },
                      approvedAt: approvedMsg.approvedAt?.toISOString?.() || undefined,
                    });
                  } else if (pendingReq) {
                    data.push({
                      id: pendingReq.id,
                      productId,
                      audienceId: audience.id,
                      status: 'pending',
                      // Pending requests don't have messaging content yet
                      generatedAt: pendingReq.generatedAt?.toISOString?.() || undefined,
                    });
                  } else {
                    data.push({
                      id: `${productId}_${audience.id}_missing`,
                      productId,
                      audienceId: audience.id,
                      status: 'missing',
                    });
                  }
                });
              });
              
              return data;
            })()}
            onApprove={(itemId) => {
              const pending = pendingApprovals.find(p => p.id === itemId);
              if (pending) {
                handleApprove(itemId);
              }
            }}
            onReject={(itemId) => {
              rejectMessaging(itemId, 'admin');
            }}
            onGenerate={(productId, audienceId) => {
              generateMessaging(productId, {
                type: 'product',
                targetAudience: [audienceId],
                competitors: [],
              });
            }}
            onGenerateAll={handleMatrixGenerate}
            isGenerating={isBatchGenerating || isGenerating}
          />
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending" className="space-y-6 mt-6">
          <MessagingDataTable
            entries={pendingApprovals.map(request => ({
              id: request.id,
              productId: request.productId,
              audienceId: request.targetAudience?.[0] || 'general',
              audienceLabel: request.targetAudience?.map((id: string) => {
                const aud = targetAudiences.find((a: any) => a.id === id);
                return aud?.label || id;
              }).join(', ') || 'General',
              regionCode: 'en_master',
              regionLabel: 'English Master',
              status: 'pending' as MessagingStatus,
              currentVersion: 1,
              versions: [{
                version: 1,
                messaging: latestMessaging?.requestId === request.id ? latestMessaging : null,
                status: 'pending' as MessagingStatus,
                createdAt: request.generatedAt?.toISOString?.() || new Date().toISOString(),
              }],
              messaging: latestMessaging?.requestId === request.id ? latestMessaging : undefined,
              createdAt: request.generatedAt?.toISOString?.() || new Date().toISOString(),
              requestId: request.id,
            }))}
            onApprove={(_, requestId) => {
              if (requestId) handleApprove(requestId);
            }}
            onReject={(_, requestId) => {
              if (requestId) rejectMessaging(requestId, 'Not suitable');
            }}
            onRegenerate={(_, productId, audienceId) => {
              generateMessaging(productId, {
                type: messagingType,
                targetAudience: [audienceId],
                competitors: selectedCompetitors,
                productionCapability: selectedCapability !== 'auto' ? selectedCapability : undefined,
              });
            }}
            isGenerating={isGenerating}
            emptyMessage="No pending approvals"
            emptyIcon={<Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />}
          />
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-6 mt-6">
          <MessagingDataTable
            entries={Object.entries(approvedByProduct).map(([productId, messaging]) => ({
              id: `approved_${productId}`,
              productId: productId as GenieProductId,
              audienceId: 'all',
              audienceLabel: 'All Audiences',
              regionCode: 'en_master',
              regionLabel: 'English Master',
              status: 'approved' as MessagingStatus,
              currentVersion: (messaging as any)?.version || 1,
              versions: [{
                version: (messaging as any)?.version || 1,
                messaging,
                status: 'approved' as MessagingStatus,
                createdAt: (messaging as any)?.approvedAt?.toISOString?.() || new Date().toISOString(),
                approvedBy: 'admin',
              }],
              messaging,
              createdAt: (messaging as any)?.approvedAt?.toISOString?.() || new Date().toISOString(),
            }))}
            onRegenerate={(_, productId, audienceId) => {
              generateMessaging(productId, {
                type: messagingType,
                targetAudience: [audienceId],
                competitors: selectedCompetitors,
                productionCapability: selectedCapability !== 'auto' ? selectedCapability : undefined,
              });
            }}
            isGenerating={isGenerating}
            showActions={true}
            emptyMessage="No approved messaging yet"
            emptyIcon={<CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingGeneratorPanel;
