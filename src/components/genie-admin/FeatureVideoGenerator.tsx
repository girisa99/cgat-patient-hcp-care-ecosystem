/**
 * FeatureVideoGenerator
 * 
 * Component for generating individual feature-specific videos within the matrix.
 * Supports unique messaging per feature with marketing pipeline integration.
 */

import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Target,
  Users,
  Trophy,
  Play,
  Settings2,
  ChevronDown,
  Loader2,
  CheckCircle,
  PenLine,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAIMessaging } from '@/hooks/useAIMessaging';
import { GENIE_PRODUCTS, type GenieProductId } from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

interface FeatureVideoRequest {
  productId: GenieProductId;
  featureId: string;
  featureName: string;
  targetAudience: string[];
  competitors: string[];
  customHook?: string;
  customCTA?: string;
  videoLength: '30s' | '60s' | '90s';
  language: string;
}

interface FeatureVideoGeneratorProps {
  className?: string;
  onGenerateVideo?: (request: FeatureVideoRequest, messaging: any) => void;
}

export const FeatureVideoGenerator: React.FC<FeatureVideoGeneratorProps> = ({
  className,
  onGenerateVideo,
}) => {
  const {
    generateMessaging,
    approveMessaging,
    pendingApprovals,
    targetAudiences,
    competitors: competitorList,
    isGenerating,
    latestMessaging,
  } = useAIMessaging();

  const [selectedProduct, setSelectedProduct] = useState<GenieProductId | ''>('');
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['content_creators']);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [videoLength, setVideoLength] = useState<'30s' | '60s' | '90s'>('60s');
  const [customHook, setCustomHook] = useState('');
  const [customCTA, setCustomCTA] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [generatedMessagingId, setGeneratedMessagingId] = useState<string | null>(null);

  const product = selectedProduct ? GENIE_PRODUCTS[selectedProduct] : null;
  const features = product?.features || [] as { id: string; name: string; screens: string[] }[];

  const handleGenerateMessaging = async () => {
    if (!selectedProduct || !selectedFeature) {
      toast.error('Please select a product and feature');
      return;
    }

    const feature = features.find((f: { id: string }) => f.id === selectedFeature);
    if (!feature) return;

    const result = await generateMessaging(selectedProduct, {
      type: 'feature',
      featureId: selectedFeature,
      featureName: feature.name,
      targetAudience: selectedAudiences,
      competitors: selectedCompetitors,
    });

    if (result) {
      setGeneratedMessagingId(result.requestId);
    }
  };

  const handleGenerateVideo = () => {
    if (!selectedProduct || !selectedFeature || !latestMessaging) {
      toast.error('Generate and approve messaging first');
      return;
    }

    const feature = features.find((f: { id: string }) => f.id === selectedFeature);
    if (!feature) return;

    const request: FeatureVideoRequest = {
      productId: selectedProduct,
      featureId: selectedFeature,
      featureName: feature.name,
      targetAudience: selectedAudiences,
      competitors: selectedCompetitors,
      customHook: customHook || undefined,
      customCTA: customCTA || undefined,
      videoLength,
      language: selectedLanguage,
    };

    if (onGenerateVideo) {
      onGenerateVideo(request, latestMessaging);
    }

    toast.success(`Generating ${videoLength} video for ${feature.name}...`);
  };

  const handleApproveMessaging = () => {
    if (generatedMessagingId) {
      approveMessaging(generatedMessagingId, 'admin');
      toast.success('Messaging approved! Ready for video generation.');
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Film className="w-5 h-5 text-primary" />
          Feature Video Generator
        </CardTitle>
        <CardDescription>
          Create individual feature videos with unique messaging and positioning
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product & Feature Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Product</Label>
            <Select value={selectedProduct} onValueChange={(v) => {
              setSelectedProduct(v as GenieProductId);
              setSelectedFeature('');
            }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GENIE_PRODUCTS).map(([id, product]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#9333EA' }}
                      />
                      {product.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Feature</Label>
            <Select value={selectedFeature} onValueChange={setSelectedFeature} disabled={!selectedProduct}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select feature" />
              </SelectTrigger>
              <SelectContent>
                {features.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    {feature.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Target Audience
          </Label>
          <div className="flex flex-wrap gap-2">
            {targetAudiences.map((audience) => (
              <Badge
                key={audience.id}
                variant={selectedAudiences.includes(audience.id) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => {
                  if (selectedAudiences.includes(audience.id)) {
                    setSelectedAudiences(prev => prev.filter(a => a !== audience.id));
                  } else {
                    setSelectedAudiences(prev => [...prev, audience.id]);
                  }
                }}
              >
                {audience.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Competitors */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1.5">
            <Trophy className="w-3 h-3" />
            Competitor Differentiation (Optional)
          </Label>
          <div className="flex flex-wrap gap-2">
            {competitorList.slice(0, 6).map((comp) => (
              <Badge
                key={comp.id}
                variant={selectedCompetitors.includes(comp.id) ? "secondary" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => {
                  if (selectedCompetitors.includes(comp.id)) {
                    setSelectedCompetitors(prev => prev.filter(c => c !== comp.id));
                  } else {
                    setSelectedCompetitors(prev => [...prev, comp.id]);
                  }
                }}
              >
                vs {comp.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Video Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Video Length</Label>
            <Select value={videoLength} onValueChange={(v) => setVideoLength(v as any)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30s">30 seconds (Hook)</SelectItem>
                <SelectItem value="60s">60 seconds (Demo)</SelectItem>
                <SelectItem value="90s">90 seconds (Full)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs w-full justify-start">
              <Settings2 className="w-3 h-3" />
              Advanced Options
              <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform", showAdvanced && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <PenLine className="w-3 h-3" />
                Custom Hook (overrides AI)
              </Label>
              <Textarea
                placeholder="Enter a custom opening hook..."
                value={customHook}
                onChange={(e) => setCustomHook(e.target.value)}
                className="text-xs h-16 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Target className="w-3 h-3" />
                Custom CTA (overrides AI)
              </Label>
              <Textarea
                placeholder="Enter a custom call-to-action..."
                value={customCTA}
                onChange={(e) => setCustomCTA(e.target.value)}
                className="text-xs h-16 resize-none"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Generated Messaging Preview */}
        {latestMessaging && latestMessaging.featureId === selectedFeature && (
          <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                Generated Messaging
              </h4>
              {!latestMessaging.isApproved ? (
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={handleApproveMessaging}>
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </Button>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-xs">
              <p><span className="text-muted-foreground">Hook:</span> {latestMessaging.hook}</p>
              <p><span className="text-muted-foreground">Value:</span> {latestMessaging.valueProposition}</p>
              <p><span className="text-muted-foreground">CTA:</span> {latestMessaging.cta}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 gap-2"
            variant="outline"
            onClick={handleGenerateMessaging}
            disabled={!selectedProduct || !selectedFeature || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Messaging
              </>
            )}
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleGenerateVideo}
            disabled={!latestMessaging?.isApproved}
          >
            <Play className="w-4 h-4" />
            Generate Video
          </Button>
        </div>

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-3 h-3" />
            {pendingApprovals.length} messaging request{pendingApprovals.length !== 1 ? 's' : ''} pending approval
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Fix missing import
import { AlertCircle } from 'lucide-react';

export default FeatureVideoGenerator;
