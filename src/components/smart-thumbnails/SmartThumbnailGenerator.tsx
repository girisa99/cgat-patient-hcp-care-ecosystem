/**
 * SmartThumbnailGenerator - P3 Component for AI-powered thumbnail generation
 * 
 * Features:
 * - Multi-variant generation
 * - Platform-specific optimization
 * - A/B testing support
 * - Label Studio training integration
 * - CTR predictions
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Image,
  Sparkles,
  Wand2,
  Check,
  TrendingUp,
  BarChart3,
  Palette,
  User,
  Type,
  Smile,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  Play,
  RefreshCw,
  Download,
  Share2,
  FlaskConical,
  Target,
  Zap,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartThumbnails, SmartThumbnailVariant, SmartThumbnailConfig } from '@/hooks/useSmartThumbnails';

interface SmartThumbnailGeneratorProps {
  initialTitle?: string;
  initialDescription?: string;
  videoUrl?: string;
  onThumbnailGenerated?: (variant: SmartThumbnailVariant) => void;
  className?: string;
}

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'tiktok', label: 'TikTok', icon: Play, color: 'text-pink-500' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-purple-500' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-500' },
] as const;

export const SmartThumbnailGenerator: React.FC<SmartThumbnailGeneratorProps> = ({
  initialTitle = '',
  initialDescription = '',
  videoUrl,
  onThumbnailGenerated,
  className,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube']);
  const [variantCount, setVariantCount] = useState(3);
  const [enableABTest, setEnableABTest] = useState(false);
  const [overlayText, setOverlayText] = useState('');

  const {
    isGenerating,
    variants,
    selectedVariant,
    activeABTest,
    generateSmartThumbnails,
    selectVariant,
    getRecommendationsForPlatform,
  } = useSmartThumbnails();

  const handleGenerate = useCallback(async () => {
    const config: SmartThumbnailConfig = {
      title,
      description,
      videoUrl,
      targetPlatforms: selectedPlatforms as SmartThumbnailConfig['targetPlatforms'],
      generateVariants: variantCount,
      enableABTest,
      branding: overlayText ? { overlayText } : undefined,
    };

    const result = await generateSmartThumbnails(config);
    if (result && onThumbnailGenerated) {
      onThumbnailGenerated(result.bestVariant);
    }
  }, [title, description, videoUrl, selectedPlatforms, variantCount, enableABTest, overlayText, generateSmartThumbnails, onThumbnailGenerated]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSelectVariant = (variantId: string) => {
    selectVariant(variantId);
    const variant = variants.find(v => v.id === variantId);
    if (variant && onThumbnailGenerated) {
      onThumbnailGenerated(variant);
    }
  };

  return (
    <TooltipProvider>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Smart Thumbnail Generator
              </CardTitle>
              <CardDescription>
                AI-powered thumbnails with CTR predictions and A/B testing
              </CardDescription>
            </div>
            {activeABTest && (
              <Badge variant="secondary" className="gap-1">
                <FlaskConical className="h-3 w-3" />
                A/B Test Active
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="generate" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="gap-1">
                <Wand2 className="h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="variants" className="gap-1" disabled={variants.length === 0}>
                <Image className="h-4 w-4" />
                Variants ({variants.length})
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-1" disabled={variants.length === 0}>
                <BarChart3 className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="title">Content Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your video title..."
                    className="font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description for context..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overlay">Text Overlay (optional)</Label>
                  <Input
                    id="overlay"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Bold text to overlay..."
                  />
                </div>
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>Target Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <Button
                        key={platform.id}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePlatformToggle(platform.id)}
                        className="gap-1.5"
                      >
                        <Icon className={cn('h-4 w-4', isSelected ? '' : platform.color)} />
                        {platform.label}
                        {isSelected && <Check className="h-3 w-3" />}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Variants</Label>
                  <div className="flex gap-2">
                    {[2, 3, 5].map((count) => (
                      <Button
                        key={count}
                        variant={variantCount === count ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVariantCount(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Enable A/B Test
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Compare thumbnail performance across variants
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="abtest"
                      checked={enableABTest}
                      onCheckedChange={(checked) => setEnableABTest(!!checked)}
                    />
                    <label htmlFor="abtest" className="text-sm">
                      Track & compare CTR
                    </label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleGenerate}
                disabled={isGenerating || !title || selectedPlatforms.length === 0}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating {variantCount} Variants...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Smart Thumbnails
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      index={index}
                      isSelected={selectedVariant?.id === variant.id}
                      onSelect={() => handleSelectVariant(variant.id)}
                      recommendations={
                        selectedPlatforms[0]
                          ? getRecommendationsForPlatform(
                              variant.id,
                              selectedPlatforms[0] as any
                            )
                          : []
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights">
              {selectedVariant && (
                <InsightsPanel
                  variant={selectedVariant}
                  allVariants={variants}
                  platforms={selectedPlatforms as any[]}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface VariantCardProps {
  variant: SmartThumbnailVariant;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  recommendations: string[];
}

const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  index,
  isSelected,
  onSelect,
  recommendations,
}) => {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail Preview */}
          <div className="relative w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Image className="h-8 w-8" />
            </div>
            {isSelected && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            <div className="absolute bottom-1 left-1">
              <Badge variant="secondary" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
          </div>

          {/* Variant Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {variant.style}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {variant.dimensions.width}x{variant.dimensions.height}
                </span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">{variant.predictedCTR.toFixed(1)}%</span>
                <span className="text-xs text-muted-foreground">CTR</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1">
              {variant.features.hasFace && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <User className="h-3 w-3" /> Face
                </Badge>
              )}
              {variant.features.hasText && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Type className="h-3 w-3" /> Text
                </Badge>
              )}
              {variant.features.hasEmoji && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Smile className="h-3 w-3" /> Emoji
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs capitalize">
                {variant.features.emotionalTone}
              </Badge>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-1">
              <Palette className="h-3 w-3 text-muted-foreground" />
              {variant.features.primaryColors.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <p className="text-xs text-muted-foreground truncate">
                💡 {recommendations[0]}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface InsightsPanelProps {
  variant: SmartThumbnailVariant;
  allVariants: SmartThumbnailVariant[];
  platforms: ('youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter')[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  variant,
  allVariants,
  platforms,
}) => {
  const maxCTR = Math.max(...allVariants.map(v => v.predictedCTR));

  return (
    <div className="space-y-6">
      {/* CTR Comparison */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Predicted CTR Comparison
        </h4>
        <div className="space-y-2">
          {allVariants.map((v, index) => (
            <div key={v.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={cn(v.id === variant.id && 'font-medium')}>
                  Variant #{index + 1} ({v.style})
                </span>
                <span className="text-green-600 font-medium">
                  {v.predictedCTR.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={(v.predictedCTR / maxCTR) * 100}
                className={cn('h-2', v.id === variant.id && 'bg-primary/20')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Platform Scores */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Platform Optimization
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {variant.platformOptimization.map((opt) => {
            const platform = PLATFORMS.find(p => p.id === opt.platform);
            if (!platform) return null;
            const Icon = platform.icon;

            return (
              <Card key={opt.platform} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('h-4 w-4', platform.color)} />
                  <span className="text-sm font-medium">{platform.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={opt.score} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{opt.score}%</span>
                </div>
                {opt.recommendations[0] && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {opt.recommendations[0]}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Analysis */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Feature Impact
        </h4>
        <div className="space-y-2">
          <FeatureImpact
            label="Face Detection"
            active={variant.features.hasFace}
            impact={1.5}
          />
          <FeatureImpact
            label="Text Overlay"
            active={variant.features.hasText}
            impact={0.8}
          />
          <FeatureImpact
            label="Emoji Elements"
            active={variant.features.hasEmoji}
            impact={0.5}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};

interface FeatureImpactProps {
  label: string;
  active: boolean;
  impact: number;
}

const FeatureImpact: React.FC<FeatureImpactProps> = ({ label, active, impact }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-2 h-2 rounded-full',
          active ? 'bg-green-500' : 'bg-muted'
        )} />
        <span className={cn(!active && 'text-muted-foreground')}>{label}</span>
      </div>
      <span className={cn(
        'font-medium',
        active ? 'text-green-600' : 'text-muted-foreground'
      )}>
        {active ? `+${impact.toFixed(1)}% CTR` : 'Not detected'}
      </span>
    </div>
  );
};

export default SmartThumbnailGenerator;
