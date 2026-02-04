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
 * This is different from MessagingImprovementPanel which handles
 * bi-weekly REFINEMENT of existing messaging based on user feedback.
 */

import React, { useState, useMemo } from 'react';
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
  Edit3,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Zap,
  LayoutGrid,
  AlertTriangle,
  Wand2,
  BookOpen,
  Hash,
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
import { Separator } from '@/components/ui/separator';
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

  const [selectedProduct, setSelectedProduct] = useState<GenieProductId>('spark');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['content_creators']);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [messagingType, setMessagingType] = useState<'product' | 'feature' | 'comparison' | 'tutorial'>('product');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'generate' | 'pending' | 'approved'>('generate');

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

  const handleGenerate = async () => {
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

  const handleApprove = (requestId: string) => {
    approveMessaging(requestId, 'admin');
    const pending = pendingApprovals.find(p => p.id === requestId);
    if (pending && onMessagingApproved) {
      onMessagingApproved(pending.productId, latestMessaging);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const renderMessagingCard = (messaging: any, isApproved: boolean = false) => (
    <div className="space-y-4">
      {/* Core Messaging */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Headline & Hook */}
        <Card className="border-orange-200/50 bg-orange-50/30 dark:bg-orange-950/10">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Headline & Hook
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Headline</Label>
              <div className="flex items-start gap-2">
                <p className="text-sm font-medium flex-1">{messaging.headline}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(messaging.headline, 'Headline')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hook</Label>
              <div className="flex items-start gap-2">
                <p className="text-sm flex-1">{messaging.hook}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(messaging.hook, 'Hook')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Sub-Hook</Label>
              <p className="text-sm text-muted-foreground">{messaging.subHook}</p>
            </div>
          </CardContent>
        </Card>

        {/* CTAs */}
        <Card className="border-green-200/50 bg-green-50/30 dark:bg-green-950/10">
          <CardHeader className="py-3 px-4">
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
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Value Proposition
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <p className="text-sm font-medium">{messaging.valueProposition}</p>
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

      {/* Confidence & Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Confidence: {Math.round((messaging.confidence || 0.85) * 100)}%
          </span>
          <span>Version: {messaging.version || 1}</span>
          <span>By: {messaging.generatedBy || 'ai-universal-processor'}</span>
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
            Generate hooks, CTAs, positioning, pain points, benefits, and script variants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            {Object.keys(approvedByProduct).length} Products Approved
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            {pendingApprovals.length} Pending
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            Generate New
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
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
                {/* Product Selection */}
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

                {/* Messaging Type */}
                <div className="space-y-2">
                  <Label className="text-sm">Messaging Type</Label>
                  <Select value={messagingType} onValueChange={(v) => setMessagingType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Overview</SelectItem>
                      <SelectItem value="feature">Feature Spotlight</SelectItem>
                      <SelectItem value="comparison">Competitive Comparison</SelectItem>
                      <SelectItem value="tutorial">Tutorial/How-To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Audiences */}
                <div className="space-y-2">
                  <Label className="text-sm">Target Audiences</Label>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {targetAudiences.map(audience => (
                      <div key={audience.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={audience.id}
                          checked={selectedAudiences.includes(audience.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAudiences(prev => [...prev, audience.id]);
                            } else {
                              setSelectedAudiences(prev => prev.filter(a => a !== audience.id));
                            }
                          }}
                        />
                        <Label htmlFor={audience.id} className="text-sm">
                          {audience.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitors (for comparison type) */}
                {messagingType === 'comparison' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Compare Against</Label>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {competitors.map(comp => (
                        <div key={comp.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={comp.id}
                            checked={selectedCompetitors.includes(comp.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCompetitors(prev => [...prev, comp.id]);
                              } else {
                                setSelectedCompetitors(prev => prev.filter(c => c !== comp.id));
                              }
                            }}
                          />
                          <Label htmlFor={comp.id} className="text-sm">
                            {comp.name}
                            <span className="text-xs text-muted-foreground ml-1">({comp.category})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button 
                  className="w-full gap-2" 
                  onClick={handleGenerate}
                  disabled={isGenerating || selectedAudiences.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Messaging
                    </>
                  )}
                </Button>
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
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No messaging generated yet</p>
                    <p className="text-sm">Select a product and generate messaging</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
