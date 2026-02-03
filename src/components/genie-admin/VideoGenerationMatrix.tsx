/**
 * VIDEO GENERATION MATRIX
 * 
 * Generate videos for all combinations:
 * - Per Language (14 languages)
 * - Per Product (8 products)
 * - Per Subscription Tier (Free/Starter/Pro/Enterprise)
 * - All combinations (Language × Product × Tier)
 * 
 * Now integrated with:
 * - Screenshots from Screenshots tab
 * - AI Messaging (hooks, CTAs, positioning)
 * - Localized scripts for all languages
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Play,
  Loader2,
  Film,
  Globe,
  CheckCircle,
  XCircle,
  Package,
  Crown,
  Grid3X3,
  Languages,
  Layers,
  Settings2,
  ArrowRight,
  AlertCircle,
  Camera,
  MessageSquare,
  RefreshCw,
  Image,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useGenieCastOrchestration } from '@/hooks/useGenieCastOrchestration';

// Languages with zone routing
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', zone: 'Claude' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', zone: 'MENA' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', zone: 'Gemini' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', zone: 'Alibaba' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', zone: 'Alibaba' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', zone: 'Claude' },
  { code: 'fr', name: 'French', flag: '🇫🇷', zone: 'Claude' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', zone: 'Claude' },
  { code: 'de', name: 'German', flag: '🇩🇪', zone: 'Claude' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', zone: 'Alibaba' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', zone: 'Gemini' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', zone: 'Gemini' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', zone: 'Gemini' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', zone: 'Gemini' },
];

// Products
const PRODUCTS = [
  { id: 'spark', name: 'Genie Spark', color: '#F97316', duration: 60 },
  { id: 'mind', name: 'Genie Mind', color: '#3B82F6', duration: 60 },
  { id: 'vibe', name: 'Genie Vibe', color: '#22C55E', duration: 75 },
  { id: 'deck', name: 'Genie Deck', color: '#EAB308', duration: 60 },
  { id: 'arc', name: 'Genie Arc', color: '#EC4899', duration: 60 },
  { id: 'studio', name: 'Genie Studio', color: '#9333EA', duration: 90 },
  { id: 'ask-genie', name: 'Ask Genie', color: '#06B6D4', duration: 45 },
  { id: 'cast', name: 'Genie Cast', color: '#EF4444', duration: 60 },
];

// Subscription Tiers
const TIERS = [
  { id: 'free', name: 'Free', color: '#6B7280', features: ['spark', 'ask-genie'] },
  { id: 'starter', name: 'Starter', color: '#22C55E', features: ['spark', 'mind', 'ask-genie'] },
  { id: 'pro', name: 'Pro', color: '#3B82F6', features: ['spark', 'mind', 'vibe', 'deck', 'ask-genie'] },
  { id: 'enterprise', name: 'Enterprise', color: '#9333EA', features: ['spark', 'mind', 'vibe', 'deck', 'arc', 'studio', 'ask-genie', 'cast'] },
];

export type GenerationMode = 'language' | 'product' | 'tier' | 'matrix';

interface GenerationJob {
  id: string;
  mode: GenerationMode;
  language?: string;
  product?: string;
  tier?: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  videoUrl?: string;
  error?: string;
  estimatedDuration: number;
}

interface VideoGenerationMatrixProps {
  onJobsUpdated?: (jobs: GenerationJob[]) => void;
  onNavigateToScreenshots?: () => void;
}

export const VideoGenerationMatrix: React.FC<VideoGenerationMatrixProps> = ({
  onJobsUpdated,
  onNavigateToScreenshots,
}) => {
  const [mode, setMode] = useState<GenerationMode>('language');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['spark', 'mind', 'vibe']);
  const [selectedTiers, setSelectedTiers] = useState<string[]>(['pro']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  
  // Integration toggles
  const [useApprovedMessaging, setUseApprovedMessaging] = useState(true);
  const [includeScreenshots, setIncludeScreenshots] = useState(true);

  // Orchestration hook for screenshots & messaging status
  const {
    products: productReadiness,
    isLoading: loadingReadiness,
    refreshScreenshots,
  } = useGenieCastOrchestration({ autoRefresh: false });

  // Calculate total jobs based on mode and selections
  const calculateJobs = useCallback((): GenerationJob[] => {
    const newJobs: GenerationJob[] = [];

    if (mode === 'language') {
      // One full video per language
      selectedLanguages.forEach(lang => {
        const langData = LANGUAGES.find(l => l.code === lang);
        newJobs.push({
          id: `lang-${lang}`,
          mode: 'language',
          language: lang,
          status: 'pending',
          progress: 0,
          estimatedDuration: 420, // ~7 min
        });
      });
    } else if (mode === 'product') {
      // One video per product per selected language
      selectedLanguages.forEach(lang => {
        selectedProducts.forEach(prod => {
          const prodData = PRODUCTS.find(p => p.id === prod);
          newJobs.push({
            id: `prod-${lang}-${prod}`,
            mode: 'product',
            language: lang,
            product: prod,
            status: 'pending',
            progress: 0,
            estimatedDuration: prodData?.duration || 60,
          });
        });
      });
    } else if (mode === 'tier') {
      // One video per tier per selected language
      selectedLanguages.forEach(lang => {
        selectedTiers.forEach(tier => {
          const tierData = TIERS.find(t => t.id === tier);
          const duration = tierData?.features.reduce((sum, f) => {
            const prod = PRODUCTS.find(p => p.id === f);
            return sum + (prod?.duration || 60);
          }, 0) || 180;
          
          newJobs.push({
            id: `tier-${lang}-${tier}`,
            mode: 'tier',
            language: lang,
            tier,
            status: 'pending',
            progress: 0,
            estimatedDuration: duration,
          });
        });
      });
    } else if (mode === 'matrix') {
      // All combinations: Language × Product × Tier
      selectedLanguages.forEach(lang => {
        selectedTiers.forEach(tier => {
          const tierData = TIERS.find(t => t.id === tier);
          tierData?.features.forEach(prod => {
            const prodData = PRODUCTS.find(p => p.id === prod);
            newJobs.push({
              id: `matrix-${lang}-${tier}-${prod}`,
              mode: 'matrix',
              language: lang,
              tier,
              product: prod,
              status: 'pending',
              progress: 0,
              estimatedDuration: prodData?.duration || 60,
            });
          });
        });
      });
    }

    return newJobs;
  }, [mode, selectedLanguages, selectedProducts, selectedTiers]);

  const pendingJobs = calculateJobs();
  const totalEstimatedTime = pendingJobs.reduce((sum, j) => sum + j.estimatedDuration, 0);

  // Toggle selection helpers
  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleTier = (id: string) => {
    setSelectedTiers(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  // Start generation
  const handleStartGeneration = async () => {
    if (pendingJobs.length === 0) {
      toast.error('Please select at least one item to generate');
      return;
    }

    setIsGenerating(true);
    setJobs(pendingJobs);
    setCurrentJobIndex(0);

    try {
      for (let i = 0; i < pendingJobs.length; i++) {
        setCurrentJobIndex(i);
        const job = pendingJobs[i];

        setJobs(prev => prev.map((j, idx) =>
          idx === i ? { ...j, status: 'generating', progress: 0 } : j
        ));

        // Simulate progress (replace with actual edge function call)
        for (let p = 0; p <= 100; p += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setJobs(prev => prev.map((j, idx) =>
            idx === i ? { ...j, progress: p } : j
          ));
        }

        // Call edge function
        const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
          body: {
            mode: job.mode,
            language: job.language,
            product: job.product,
            tier: job.tier,
          },
        });

        if (error) {
          setJobs(prev => prev.map((j, idx) =>
            idx === i ? { ...j, status: 'error', error: error.message } : j
          ));
        } else {
          setJobs(prev => prev.map((j, idx) =>
            idx === i ? { ...j, status: 'complete', videoUrl: data?.videoUrl, progress: 100 } : j
          ));
        }
      }

      toast.success(`Generated ${pendingJobs.length} video(s)!`);
      onJobsUpdated?.(jobs);
    } catch (err) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const completedJobs = jobs.filter(j => j.status === 'complete').length;
  const failedJobs = jobs.filter(j => j.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Grid3X3 className="w-5 h-5" />
          Video Generation Matrix
        </CardTitle>
        <CardDescription>
          Generate videos for any combination of languages, products, and subscription tiers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Integration Options */}
        <div className="flex items-center gap-6 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch 
              id="use-messaging" 
              checked={useApprovedMessaging}
              onCheckedChange={setUseApprovedMessaging}
            />
            <Label htmlFor="use-messaging" className="text-sm flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Use Approved Messaging
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              id="use-screenshots" 
              checked={includeScreenshots}
              onCheckedChange={setIncludeScreenshots}
            />
            <Label htmlFor="use-screenshots" className="text-sm flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Include Screenshots
            </Label>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refreshScreenshots()}
            className="ml-auto gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
        </div>

        {/* Mode Selection */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="language" className="gap-1 text-xs">
              <Languages className="w-3 h-3" />
              Per Language
            </TabsTrigger>
            <TabsTrigger value="product" className="gap-1 text-xs">
              <Package className="w-3 h-3" />
              Per Product
            </TabsTrigger>
            <TabsTrigger value="tier" className="gap-1 text-xs">
              <Crown className="w-3 h-3" />
              Per Tier
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-1 text-xs">
              <Grid3X3 className="w-3 h-3" />
              Full Matrix
            </TabsTrigger>
          </TabsList>

          {/* Language Selection (always shown) */}
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium">Select Languages</Label>
            <ScrollArea className="h-24">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <Badge
                    key={lang.code}
                    variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLanguage(lang.code)}
                  >
                    {lang.flag} {lang.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Product Selection (for product and matrix modes) */}
          <TabsContent value="product" className="mt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Products</Label>
                {includeScreenshots && (
                  <span className="text-xs text-muted-foreground">
                    {productReadiness.filter(p => p.screenshotCount > 0).length}/{productReadiness.length} have screenshots
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PRODUCTS.map(prod => {
                  const readiness = productReadiness.find(p => p.id === prod.id);
                  const hasScreenshots = (readiness?.screenshotCount || 0) > 0;
                  const hasMessaging = readiness?.hasApprovedMessaging || false;
                  
                  return (
                    <Tooltip key={prod.id}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => toggleProduct(prod.id)}
                          className={cn(
                            "p-2 rounded-lg border cursor-pointer transition-all text-center relative",
                            selectedProducts.includes(prod.id)
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                        >
                          <div
                            className="w-4 h-4 rounded-full mx-auto mb-1"
                            style={{ backgroundColor: prod.color }}
                          />
                          <span className="text-[11px]">{prod.name}</span>
                          
                          {/* Status indicators */}
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                            {hasScreenshots ? (
                              <Camera className="w-2.5 h-2.5 text-green-500" />
                            ) : (
                              <Camera className="w-2.5 h-2.5 text-muted-foreground/30" />
                            )}
                            {hasMessaging ? (
                              <FileText className="w-2.5 h-2.5 text-green-500" />
                            ) : (
                              <FileText className="w-2.5 h-2.5 text-muted-foreground/30" />
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <p className="font-medium">{prod.name}</p>
                          <p className={hasScreenshots ? 'text-green-500' : 'text-amber-500'}>
                            {hasScreenshots ? `${readiness?.screenshotCount} screenshots` : 'No screenshots'}
                          </p>
                          <p className={hasMessaging ? 'text-green-500' : 'text-amber-500'}>
                            {hasMessaging ? 'Messaging approved' : 'Using fallback messaging'}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              
              {/* Warning if no screenshots */}
              {includeScreenshots && selectedProducts.some(pid => {
                const r = productReadiness.find(p => p.id === pid);
                return !r || r.screenshotCount === 0;
              }) && (
                <Alert variant="default" className="border-amber-200 bg-amber-50/50">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-xs">
                    Some products don't have screenshots. 
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto ml-1 text-xs"
                      onClick={onNavigateToScreenshots}
                    >
                      Add screenshots →
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Tier Selection (for tier and matrix modes) */}
          <TabsContent value="tier" className="mt-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Subscription Tiers</Label>
              <div className="grid grid-cols-4 gap-2">
                {TIERS.map(tier => (
                  <div
                    key={tier.id}
                    onClick={() => toggleTier(tier.id)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      selectedTiers.includes(tier.id)
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-muted-foreground/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" style={{ color: tier.color }} />
                      <span className="text-sm font-medium">{tier.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {tier.features.length} products
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Matrix mode shows both */}
          <TabsContent value="matrix" className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Subscription Tiers</Label>
              <div className="grid grid-cols-4 gap-2">
                {TIERS.map(tier => (
                  <div
                    key={tier.id}
                    onClick={() => toggleTier(tier.id)}
                    className={cn(
                      "p-2 rounded-lg border cursor-pointer transition-all",
                      selectedTiers.includes(tier.id)
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-muted-foreground/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-3 h-3" style={{ color: tier.color }} />
                      <span className="text-xs font-medium">{tier.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Matrix mode generates all combinations. Selected: {selectedLanguages.length} languages × {selectedTiers.length} tiers = {pendingJobs.length} videos
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Summary & Generate */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {pendingJobs.length} video{pendingJobs.length !== 1 ? 's' : ''} to generate
            </p>
            <p className="text-xs text-muted-foreground">
              Estimated time: ~{Math.ceil(totalEstimatedTime / 60)} minutes
            </p>
          </div>
          <Button
            onClick={handleStartGeneration}
            disabled={isGenerating || pendingJobs.length === 0}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating ({currentJobIndex + 1}/{pendingJobs.length})
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate All
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        {jobs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{completedJobs} complete, {failedJobs} failed</span>
              <span>{Math.round((completedJobs / jobs.length) * 100)}%</span>
            </div>
            <Progress value={(completedJobs / jobs.length) * 100} />
            
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {jobs.map((job, idx) => (
                  <div
                    key={job.id}
                    className={cn(
                      "flex items-center gap-2 text-xs p-2 rounded",
                      job.status === 'generating' && "bg-primary/10",
                      job.status === 'complete' && "bg-accent/20",
                      job.status === 'error' && "bg-destructive/10"
                    )}
                  >
                    {job.status === 'pending' && <div className="w-3 h-3 rounded-full border" />}
                    {job.status === 'generating' && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                    {job.status === 'complete' && <CheckCircle className="w-3 h-3 text-accent-foreground" />}
                    {job.status === 'error' && <XCircle className="w-3 h-3 text-destructive" />}
                    <span className="flex-1 truncate">
                      {LANGUAGES.find(l => l.code === job.language)?.flag} {job.language}
                      {job.product && ` • ${PRODUCTS.find(p => p.id === job.product)?.name}`}
                      {job.tier && ` • ${TIERS.find(t => t.id === job.tier)?.name}`}
                    </span>
                    {job.status === 'generating' && <span>{job.progress}%</span>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoGenerationMatrix;
