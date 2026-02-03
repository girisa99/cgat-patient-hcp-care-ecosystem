/**
 * UNIFIED VIDEO GENERATION PANEL
 * 
 * Generates ONE complete video per language with all 9 chapters stitched together.
 * Supports multiple generation modes: per language, per product, per tier, or full matrix.
 * Uses Genie Cast pipeline for professional marketing videos.
 * 
 * Flow:
 * 1. Upload Screenshots (unlimited per product) → 2. Select mode → 3. Generate → 4. Preview → 5. Publish
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Loader2,
  Film,
  Globe,
  CheckCircle,
  XCircle,
  Sparkles,
  Mic,
  Video,
  Eye,
  Upload,
  RotateCcw,
  Languages,
  Clock,
  Layers,
  Camera,
  Grid3X3,
  Crown,
  User,
  Box,
  Zap,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MultiScreenshotGallery, ProductGallery } from './MultiScreenshotGallery';
import { VideoGenerationMatrix } from './VideoGenerationMatrix';
import { FullProductionModeConfig, DEFAULT_PRODUCTION_CONFIG, REGIONAL_AVATARS, type ProductionModeConfig } from './FullProductionModeConfig';
import { TokenConsumptionBreakdown } from './TokenConsumptionBreakdown';
import { ProductChangeAlertPanel } from './ProductChangeAlertPanel';
import { MessagingImprovementPanel } from './MessagingImprovementPanel';
import { FeatureVideoGenerator } from './FeatureVideoGenerator';
import { GenieCastFlowDiagram } from './GenieCastFlowDiagram';

// Supported languages with zone routing
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', zone: 'Claude Zone', tts: 'ElevenLabs' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', zone: 'MENA Zone', tts: 'Azure Neural' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', zone: 'Gemini Zone', tts: 'Azure Neural' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', zone: 'Gemini Zone', tts: 'Azure Neural' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', zone: 'Gemini Zone', tts: 'Azure Neural' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', zone: 'Gemini Zone', tts: 'Azure Neural' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', zone: 'Gemini Zone', tts: 'Azure Neural' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', zone: 'Alibaba Zone', tts: 'CosyVoice' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', zone: 'Alibaba Zone', tts: 'CosyVoice' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', zone: 'Alibaba Zone', tts: 'Azure Neural' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', zone: 'Claude Zone', tts: 'ElevenLabs' },
  { code: 'fr', name: 'French', flag: '🇫🇷', zone: 'Claude Zone', tts: 'ElevenLabs' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', zone: 'Claude Zone', tts: 'Azure Neural' },
  { code: 'de', name: 'German', flag: '🇩🇪', zone: 'Claude Zone', tts: 'Azure Neural' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', zone: 'Gemini Zone', tts: 'Azure Neural' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', zone: 'Gemini Zone', tts: 'Azure Neural' },
];

// 9 chapters that get stitched into one video
const CHAPTERS = [
  { id: 'opening', product: 'Genie Studio', duration: 45, color: '#9333EA' },
  { id: 'spark', product: 'Genie Spark', duration: 50, color: '#F97316' },
  { id: 'mind', product: 'Genie Mind', duration: 50, color: '#3B82F6' },
  { id: 'vibe', product: 'Genie Vibe', duration: 55, color: '#22C55E' },
  { id: 'deck', product: 'Genie Deck', duration: 45, color: '#EAB308' },
  { id: 'arc', product: 'Genie Arc', duration: 50, color: '#EC4899' },
  { id: 'ask-genie', product: 'Ask Genie', duration: 40, color: '#06B6D4' },
  { id: 'cast', product: 'Genie Cast', duration: 50, color: '#EF4444' },
  { id: 'closing', product: 'Genie Studio', duration: 30, color: '#9333EA' },
];

interface GeneratedVideo {
  language: string;
  languageName: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  totalDuration: number;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  chapters: Array<{
    id: string;
    product: string;
    success: boolean;
    error?: string;
  }>;
  providers: {
    tts: string;
    video: string;
  };
  error?: string;
  generatedAt?: Date;
}

interface ExistingVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  language_code: string;
  language_name: string;
  duration_seconds: number;
  is_active: boolean;
  created_at: string;
}

export const UnifiedVideoGenerationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'screenshots' | 'generate' | 'matrix' | 'library' | 'analytics' | 'alerts' | 'messaging' | 'flow'>('screenshots');
  const [screenshotGalleries, setScreenshotGalleries] = useState<ProductGallery[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const totalScreenshots = screenshotGalleries.reduce((sum, g) => sum + g.screenshots.length, 0);
  const [quality, setQuality] = useState<'preview' | 'production' | 'cinematic'>('production');
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<Map<string, GeneratedVideo>>(new Map());
  const [existingVideos, setExistingVideos] = useState<ExistingVideo[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);
  
  // Full Production Mode state
  const [enableFullProduction, setEnableFullProduction] = useState(false);
  const [productionConfig, setProductionConfig] = useState<ProductionModeConfig>(DEFAULT_PRODUCTION_CONFIG);

  const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);
  const totalDuration = CHAPTERS.reduce((sum, c) => sum + c.duration, 0);
  
  // Calculate estimated time based on production mode
  const baseTime = 7; // minutes
  const productionMultiplier = enableFullProduction ? productionConfig.estimatedTimeMultiplier : 1;
  const estimatedTime = Math.round(baseTime * productionMultiplier);

  // Load existing videos from database
  useEffect(() => {
    loadExistingVideos();
  }, []);

  const loadExistingVideos = async () => {
    setLoadingExisting(true);
    try {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('*')
        .eq('content_type', 'full_demo')
        .eq('placement', 'hero_showcase')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingVideos((data || []) as ExistingVideo[]);
    } catch (err) {
      console.error('Failed to load existing videos:', err);
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedLanguage) {
      toast.error('Please select a language');
      return;
    }

    setIsGenerating(true);
    const langName = selectedLang?.name || selectedLanguage;

    // Initialize generation state
    const newVideo: GeneratedVideo = {
      language: selectedLanguage,
      languageName: langName,
      totalDuration,
      status: 'generating',
      progress: 0,
      chapters: CHAPTERS.map(c => ({ id: c.id, product: c.product, success: false })),
      providers: {
        tts: selectedLang?.tts || 'Azure Neural',
        video: selectedLang?.zone.includes('Alibaba') ? 'Alibaba WAN' : 'Vertex AI',
      },
    };

    setGeneratedVideos(prev => new Map(prev).set(selectedLanguage, newVideo));

    try {
      // Call the unified assembly edge function with production mode config
      const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
        body: {
          language: selectedLanguage,
          quality,
          includeVisuals,
          // Full Production Mode settings
          fullProductionMode: enableFullProduction,
          productionConfig: enableFullProduction ? {
            avatar: {
              enabled: productionConfig.enableAvatar,
              gender: productionConfig.avatarGender,
              placement: productionConfig.avatarPlacement,
              size: productionConfig.avatarSize,
            },
            animations: {
              enabled: productionConfig.enableAnimations,
              style: productionConfig.transitionStyle,
              intensity: productionConfig.animationIntensity,
            },
            threeD: {
              enabled: productionConfig.enable3D,
              style: productionConfig.threeDStyle,
              quality: productionConfig.renderQuality,
            },
          } : null,
        },
      });

      if (error) throw error;

      // Update with results
      const updatedVideo: GeneratedVideo = {
        ...newVideo,
        status: data.success ? 'complete' : 'error',
        progress: 100,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        chapters: data.chapters?.map((c: any) => ({
          id: c.chapterId,
          product: c.product,
          success: c.success,
          error: c.error,
        })) || newVideo.chapters,
        providers: data.providers || newVideo.providers,
        error: data.error,
        generatedAt: new Date(),
      };

      setGeneratedVideos(prev => new Map(prev).set(selectedLanguage, updatedVideo));

      if (data.success) {
        toast.success(`Video generated for ${langName}!`);
        loadExistingVideos(); // Refresh library
      } else {
        toast.error(`Generation failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setGeneratedVideos(prev => {
        const updated = new Map(prev);
        const video = updated.get(selectedLanguage);
        if (video) {
          updated.set(selectedLanguage, {
            ...video,
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
        return updated;
      });
      toast.error('Video generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentVideo = generatedVideos.get(selectedLanguage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            Genie Cast Video Studio
          </h2>
          <p className="text-muted-foreground text-sm">
            Generate complete marketing videos with all 9 chapters stitched together
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          Powered by Genie Cast
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-8 max-w-5xl">
          <TabsTrigger value="screenshots" className="gap-1 text-xs">
            <Camera className="w-3.5 h-3.5" />
            Screenshots
            {totalScreenshots > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px]">{totalScreenshots}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-1 text-xs">
            <Video className="w-3.5 h-3.5" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1 text-xs">
            <Grid3X3 className="w-3.5 h-3.5" />
            Matrix
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-1 text-xs">
            <Layers className="w-3.5 h-3.5" />
            Library
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="messaging" className="gap-1 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1 text-xs">
            <Eye className="w-3.5 h-3.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="flow" className="gap-1 text-xs">
            <GitBranch className="w-3.5 h-3.5" />
            Flow
          </TabsTrigger>
        </TabsList>

        {/* Screenshots Tab - Multi-Gallery */}
        <TabsContent value="screenshots" className="space-y-6">
          <MultiScreenshotGallery
            onGalleriesUpdated={(galleries) => {
              setScreenshotGalleries(galleries);
              const total = galleries.reduce((sum, g) => sum + g.screenshots.length, 0);
              if (total > 0) {
                toast.success(`${total} screenshots ready for video generation`);
              }
            }}
          />
          
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Camera className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">Unlimited Screenshots Per Product</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple screenshots for each product. Drag to reorder. These will be used as visual highlights during voiceover in the generated videos.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('generate')} className="gap-2">
                    <Play className="w-4 h-4" />
                    Quick Generate
                  </Button>
                  <Button onClick={() => setActiveTab('matrix')} className="gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    Full Matrix
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matrix Tab - New */}
        <TabsContent value="matrix" className="space-y-6">
          <VideoGenerationMatrix 
            onNavigateToScreenshots={() => setActiveTab('screenshots')}
          />
        </TabsContent>

        {/* Generate Tab - Flat Layout */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Configuration - Flat without Card wrapper */}
            <div className="lg:col-span-1 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Configuration</h3>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Languages className="w-4 h-4" />
                  Target Language
                </Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                          <Badge variant="secondary" className="text-[10px] ml-auto">
                            {lang.zone}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLang && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      <Mic className="w-2.5 h-2.5 mr-1" />
                      {selectedLang.tts}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      <Video className="w-2.5 h-2.5 mr-1" />
                      {selectedLang.zone.includes('Alibaba') ? 'Alibaba WAN' : 'Vertex AI'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Quality Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Quality</Label>
                <Select value={quality} onValueChange={(v) => setQuality(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preview">Preview (480p, fast)</SelectItem>
                    <SelectItem value="production">Production (1080p)</SelectItem>
                    <SelectItem value="cinematic">Cinematic (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Toggles */}
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="visuals" className="text-sm">Product Screenshots</Label>
                <Switch 
                  id="visuals" 
                  checked={includeVisuals} 
                  onCheckedChange={setIncludeVisuals}
                />
              </div>

              {/* Full Production Mode Toggle */}
              <div className={cn(
                "p-3 rounded-lg border transition-all",
                enableFullProduction 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-muted/20 border-border"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Crown className={cn("w-4 h-4", enableFullProduction ? "text-primary" : "text-muted-foreground")} />
                    <Label htmlFor="fullprod" className="text-sm font-medium">Full Production Mode</Label>
                  </div>
                  <Switch 
                    id="fullprod" 
                    checked={enableFullProduction} 
                    onCheckedChange={setEnableFullProduction}
                  />
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  {enableFullProduction ? (
                    <>
                      <User className="w-3 h-3" /> Avatar
                      <Sparkles className="w-3 h-3" /> Animations
                      <Box className="w-3 h-3" /> 3D
                    </>
                  ) : (
                    'Add AI Avatar, animations, and 3D showcases'
                  )}
                </div>
              </div>

              {/* Full Production Mode Config (when enabled) */}
              {enableFullProduction && (
                <FullProductionModeConfig
                  config={productionConfig}
                  onConfigChange={setProductionConfig}
                  selectedLanguage={selectedLanguage}
                  disabled={isGenerating}
                />
              )}

              {/* Token Consumption Breakdown */}
              <TokenConsumptionBreakdown
                config={productionConfig}
                selectedLanguage={selectedLanguage}
                isFullProduction={enableFullProduction}
              />

              {/* Video Info */}
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary" />
                  Output: 1 Full Video
                </div>
                <div className="text-xs text-muted-foreground">
                  {CHAPTERS.length} chapters • ~{Math.round(totalDuration / 60)} min content
                  {enableFullProduction && (
                    <span className="ml-1 text-primary font-medium">
                      • ~{estimatedTime} min to generate
                    </span>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Full Video
                  </>
                )}
              </Button>
            </div>

            {/* Right: Chapters & Progress - Flat */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">9 Chapters → 1 Video</h3>
                <span className="text-xs text-muted-foreground ml-auto">All chapters stitched together</span>
              </div>

              {/* Chapter Grid */}
              <div className="grid grid-cols-3 gap-3">
                {CHAPTERS.map((chapter) => {
                  const chapterStatus = currentVideo?.chapters.find(c => c.id === chapter.id);
                  const isActive = isGenerating && currentVideo?.status === 'generating';

                  return (
                    <motion.div
                      key={chapter.id}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        isActive && "border-primary bg-primary/5",
                        chapterStatus?.success && "border-green-600/50 bg-green-600/5",
                        chapterStatus?.error && "border-destructive/50 bg-destructive/5"
                      )}
                      animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: chapter.color }}
                        />
                        <span className="text-xs font-medium truncate">{chapter.product}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{chapter.duration}s</span>
                        {chapterStatus?.success && <CheckCircle className="w-3 h-3 text-green-600" />}
                        {chapterStatus?.error && <XCircle className="w-3 h-3 text-destructive" />}
                        {isActive && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Generating {selectedLang?.name} video...
                      </span>
                      <span className="font-medium">{currentVideo?.progress || 0}%</span>
                    </div>
                    <Progress value={currentVideo?.progress || 0} className="h-2" />
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        TTS: {currentVideo?.providers.tts}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Video: {currentVideo?.providers.video}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              {currentVideo?.status === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-600/10 border border-green-600/30 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Video Generated Successfully!</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Publish to Landing
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentVideo.chapters.filter(c => c.success).length}/{CHAPTERS.length} chapters • 
                    ~{Math.round(totalDuration / 60)} min • 
                    Saved to library
                  </p>
                </motion.div>
              )}

              {currentVideo?.status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="font-medium">Generation Failed</span>
                  </div>
                  <p className="text-sm text-destructive">{currentVideo.error}</p>
                  <Button size="sm" variant="outline" onClick={handleGenerate} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Retry
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Generated Videos Library</CardTitle>
              <CardDescription>
                {existingVideos.length} complete videos ready for landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExisting ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : existingVideos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No videos generated yet</p>
                  <p className="text-sm">Generate your first video in the Generate tab</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {existingVideos.map(video => {
                      const lang = LANGUAGES.find(l => l.code === video.language_code);
                      return (
                        <Card key={video.id} className="overflow-hidden">
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{lang?.flag}</span>
                              <span className="font-medium text-sm truncate">{video.language_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{Math.round(video.duration_seconds / 60)} min</span>
                              {video.is_active && (
                                <Badge variant="outline" className="text-[10px] ml-auto">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab - Product Change Detection */}
        <TabsContent value="alerts" className="space-y-6">
          <ProductChangeAlertPanel
            onCaptureScreenshots={(productId) => {
              toast.info(`Navigating to capture screenshots for ${productId}`);
              setActiveTab('screenshots');
            }}
            onRegenerateVideo={(productId) => {
              toast.info(`Starting video regeneration for ${productId}`);
              setActiveTab('generate');
            }}
          />
          <FeatureVideoGenerator
            onGenerateVideo={(request, messaging) => {
              toast.success(`Generated feature video for ${request.featureName}`);
              loadExistingVideos();
            }}
          />
        </TabsContent>

        {/* Messaging Improvement Tab */}
        <TabsContent value="messaging" className="space-y-6">
          <MessagingImprovementPanel
            onApplyImprovement={(id, newMessaging) => {
              toast.success('Messaging improvement applied');
            }}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Video Analytics</CardTitle>
              <CardDescription>
                View counts and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Analytics coming soon</p>
                <p className="text-sm">Track video performance across regions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flow Diagram Tab */}
        <TabsContent value="flow" className="space-y-6">
          <GenieCastFlowDiagram />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedVideoGenerationPanel;
