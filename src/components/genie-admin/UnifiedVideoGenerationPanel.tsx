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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Palette,
  RefreshCw,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MultiScreenshotGallery, ProductGallery } from './MultiScreenshotGallery';
import { VideoGenerationMatrix } from './VideoGenerationMatrix';
import { DEFAULT_PRODUCTION_CONFIG, REGIONAL_AVATARS, type ProductionModeConfig } from './FullProductionModeConfig';
import { TokenConsumptionBreakdown } from './TokenConsumptionBreakdown';
import { ProductChangeAlertPanel } from './ProductChangeAlertPanel';
import { MessagingImprovementPanel } from './MessagingImprovementPanel';
import { FeatureVideoGenerator } from './FeatureVideoGenerator';
import { GenieCastFlowDiagram } from './GenieCastFlowDiagram';
import { uploadBrandLogosToStorage } from '@/services/marketing/brandAssetUploadService';
import { GenieCastOverview, VideoStyleCards, AIProviderShowcase, type VideoStyleType } from './genie-cast';
import { StyleDrivenProductionConfig, deriveProductionRequirements } from './genie-cast/StyleDrivenProductionConfig';
import { getStylePipelineConfig, styleRequiresAvatar, styleRequires3D } from '@/config/video-style-pipeline-mapping';
import { useVideoStatusPolling } from '@/hooks/useVideoStatusPolling';
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

// Persistence key for tab state
const GENIE_CAST_TAB_KEY = 'genie_cast_active_tab';
const GENIE_CAST_STATE_KEY = 'genie_cast_panel_state';

export const UnifiedVideoGenerationPanel: React.FC = () => {
  // Persist tab state to prevent loss on navigation/refresh
  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'generate' | 'matrix' | 'library' | 'analytics' | 'alerts' | 'messaging' | 'flow'>(() => {
    try {
      const saved = localStorage.getItem(GENIE_CAST_TAB_KEY);
      if (saved && ['overview', 'screenshots', 'generate', 'matrix', 'library', 'analytics', 'alerts', 'messaging', 'flow'].includes(saved)) {
        return saved as any;
      }
    } catch { /* ignore */ }
    return 'overview';
  });
  
  // Video style selection (supports multi-select)
  const [selectedVideoStyles, setSelectedVideoStyles] = useState<VideoStyleType[]>(['educational']);
  const selectedVideoStyle = selectedVideoStyles[0] || 'educational'; // Primary style for generation
  
  // Persist other key state
  const [screenshotGalleries, setScreenshotGalleries] = useState<ProductGallery[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(GENIE_CAST_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.selectedLanguage || 'en';
      }
    } catch { /* ignore */ }
    return 'en';
  });
  const totalScreenshots = screenshotGalleries.reduce((sum, g) => sum + g.screenshots.length, 0);
  const [quality, setQuality] = useState<'preview' | 'production' | 'cinematic'>(() => {
    try {
      const saved = localStorage.getItem(GENIE_CAST_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.quality || 'production';
      }
    } catch { /* ignore */ }
    return 'production';
  });
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<Map<string, GeneratedVideo>>(new Map());
  const [existingVideos, setExistingVideos] = useState<ExistingVideo[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);
  
  // Video preview state
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);
  // Production config for avatar gender preference
  const [productionConfig, setProductionConfig] = useState<ProductionModeConfig>(DEFAULT_PRODUCTION_CONFIG);
  
  // Skip TTS regeneration if audio already exists (saves credits)
  const [skipExistingTTS, setSkipExistingTTS] = useState(true);
  
  // Status polling state
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Derive production requirements from selected styles
  const styleRequirements = useMemo(
    () => deriveProductionRequirements(selectedVideoStyles),
    [selectedVideoStyles]
  );
  
  // Video status polling for pending videos
  const { checkAllStatuses, isPolling } = useVideoStatusPolling({
    onVideoComplete: (video) => {
      console.log('[GenieCast] Video completed via polling:', video);
      loadExistingVideos(); // Refresh library
      // Update current video if it matches
      if (video.videoUrl) {
        setGeneratedVideos(prev => {
          const updated = new Map(prev);
          const langCode = selectedLanguage;
          const existing = updated.get(langCode);
          if (existing?.status === 'pending') {
            updated.set(langCode, {
              ...existing,
              status: 'complete',
              videoUrl: video.videoUrl,
              thumbnailUrl: video.thumbnailUrl,
            });
          }
          return updated;
        });
      }
    },
    onVideoFailed: (video) => {
      console.log('[GenieCast] Video failed via polling:', video);
    },
  });

  // Persist tab state when it changes
  useEffect(() => {
    console.log('[GenieCast] Persisting tab state:', activeTab);
    localStorage.setItem(GENIE_CAST_TAB_KEY, activeTab);
  }, [activeTab]);

  // Persist other key state when it changes
  useEffect(() => {
    const stateToSave = {
      selectedLanguage,
      quality,
      selectedVideoStyles,
      savedAt: Date.now(),
    };
    console.log('[GenieCast] Persisting panel state:', stateToSave);
    localStorage.setItem(GENIE_CAST_STATE_KEY, JSON.stringify(stateToSave));
  }, [selectedLanguage, quality, selectedVideoStyles]);

  // Log restoration on mount
  useEffect(() => {
    console.log('[GenieCast] Component mounted, restored state:', {
      activeTab,
      selectedLanguage,
      quality,
      selectedVideoStyles,
      styleRequirements,
    });
  }, []);

  const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);
  const totalDuration = CHAPTERS.reduce((sum, c) => sum + c.duration, 0);
  
  // Calculate estimated time based on style requirements
  const isFullProduction = styleRequirements.needsAvatar || styleRequirements.needsAnimation || styleRequirements.needs3D;
  const baseTime = 7; // minutes
  const productionMultiplier = isFullProduction ? productionConfig.estimatedTimeMultiplier : 1;
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
      // Get style-specific pipeline configuration
      const styleConfig = getStylePipelineConfig(selectedVideoStyle);
      console.log('[GenieCast] Using video style:', selectedVideoStyle, styleConfig);

      // Call the unified assembly edge function with production mode config + video style
      const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
        body: {
          language: selectedLanguage,
          quality,
          includeVisuals,
          // Skip TTS regeneration if audio already exists
          skipExistingTTS,
          // NEW: Video style configuration from style cards
          videoStyle: selectedVideoStyle,
          styleConfig: {
            videoProvider: styleConfig.videoProvider,
            avatarProvider: styleConfig.avatarProvider,
            animationProvider: styleConfig.animationProvider,
            ttsStyle: styleConfig.ttsStyle,
            visualEffect: styleConfig.visualEffect,
            scriptTone: styleConfig.scriptTone,
            pacing: styleConfig.pacing,
            toneModifier: styleConfig.toneModifier,
          },
          // Full Production Mode settings (derived from style requirements)
          fullProductionMode: isFullProduction,
          productionConfig: isFullProduction ? {
            avatar: {
              enabled: styleRequirements.needsAvatar,
              gender: productionConfig.avatarGender,
              placement: 'intro_outro',
              size: 'medium',
              style: selectedVideoStyle.includes('avatar') ? selectedVideoStyle.replace('ugc_avatar_', '') : 'photorealistic',
              providers: Array.from(styleRequirements.avatarProviders),
            },
            animations: {
              enabled: styleRequirements.needsAnimation,
              style: 'kinetic',
              intensity: 70,
              providers: Array.from(styleRequirements.animationProviders),
            },
            threeD: {
              enabled: styleRequirements.needs3D,
              style: 'rotating',
              quality: quality === 'cinematic' ? 'premium' : 'high',
              providers: Array.from(styleRequirements.threeDProviders),
            },
          } : null,
        },
      });

      if (error) throw error;

      // Update with results - check for pending generation status
      const isPending = data.generationStatus === 'pending';
      const updatedVideo: GeneratedVideo = {
        ...newVideo,
        status: data.success ? (isPending ? 'pending' : 'complete') : 'error',
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
        if (isPending) {
          toast.info(`TTS audio generated for ${langName}. Video file pending external processing.`, {
            description: data.message || 'Full video assembly requires manual processing.',
            duration: 8000,
          });
        } else {
          toast.success(`Video generated for ${langName}!`);
        }
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
      {/* Tabs - Responsive with scroll */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-1 p-1 bg-muted/50">
          <TabsTrigger value="overview" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <Camera className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Screenshots</span>
            <span className="sm:hidden">Shots</span>
            {totalScreenshots > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1">{totalScreenshots}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <Video className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Generate</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <Grid3X3 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Library</span>
            <span className="sm:hidden">Lib</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden md:inline">Messaging</span>
            <span className="md:hidden">Msg</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <Eye className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden md:inline">Analytics</span>
            <span className="md:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex-shrink-0 gap-1.5 px-3 text-xs whitespace-nowrap">
            <GitBranch className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Flow</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Compact Studio Hub */}
        <TabsContent value="overview" className="mt-4">
          <GenieCastOverview
            selectedStyles={selectedVideoStyles}
            onStylesChange={setSelectedVideoStyles}
            onNavigate={(tab) => setActiveTab(tab as any)}
          />
        </TabsContent>

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
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      const toastId = toast.loading('Syncing brand logos to storage...');
                      try {
                        const result = await uploadBrandLogosToStorage();
                        toast.dismiss(toastId);
                        if (result.success) {
                          toast.success(`Uploaded ${result.uploaded} logos to storage`);
                        } else {
                          toast.error(`Failed to upload logos: ${result.results.find(r => !r.success)?.error}`);
                        }
                      } catch (error) {
                        toast.dismiss(toastId);
                        toast.error('Failed to sync logos');
                      }
                    }}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Sync Logos
                  </Button>
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
          {/* Selected Styles Header - Compact */}
          {selectedVideoStyles.length > 0 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-2 flex-wrap">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Styles:</span>
                {selectedVideoStyles.slice(0, 4).map(styleId => (
                  <Badge key={styleId} variant="outline" className="text-[10px]">
                    {styleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                {selectedVideoStyles.length > 4 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{selectedVideoStyles.length - 4} more
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => setActiveTab('overview')}
              >
                Edit
              </Button>
            </div>
          )}

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

              {/* Style-Driven Production Configuration */}
              <StyleDrivenProductionConfig
                selectedStyles={selectedVideoStyles}
                selectedLanguage={selectedLanguage}
                onNavigateToOverview={() => setActiveTab('overview')}
                avatarGender={productionConfig.avatarGender}
                onAvatarGenderChange={(gender) => setProductionConfig(prev => ({ ...prev, avatarGender: gender }))}
                quality={quality}
                disabled={isGenerating}
              />

              {/* Reuse Existing TTS Toggle */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="skipTTS" className="text-sm font-medium flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Reuse Cached TTS Audio
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {skipExistingTTS 
                        ? 'Skip TTS regeneration if audio already exists (saves credits)' 
                        : 'Regenerate all TTS audio from scratch'}
                    </p>
                  </div>
                  <Switch 
                    id="skipTTS" 
                    checked={skipExistingTTS} 
                    onCheckedChange={setSkipExistingTTS}
                  />
                </div>
              </div>

              {/* Token Consumption Breakdown */}
              <TokenConsumptionBreakdown
                config={productionConfig}
                selectedLanguage={selectedLanguage}
                isFullProduction={isFullProduction}
              />

              {/* Video Info */}
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary" />
                  Output: 1 Full Video
                </div>
                <div className="text-xs text-muted-foreground">
                  {CHAPTERS.length} chapters • ~{Math.round(totalDuration / 60)} min content
                  {isFullProduction && (
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

              {/* Result - Pending status */}
              {currentVideo?.status === 'pending' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-warning/10 border border-warning/30 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning animate-pulse" />
                    <span className="font-medium text-warning">TTS Audio Generated - JSON2Video Assembly In Progress</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Text-to-Speech audio has been generated for all {currentVideo.chapters.filter(c => c.success).length} chapters. 
                    JSON2Video is now assembling the final video with synchronized audio and visuals.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 p-2 rounded">
                    {isPolling || isCheckingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Video rendering in progress - this may take 5-10 minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2"
                      disabled={isCheckingStatus}
                      onClick={async () => {
                        setIsCheckingStatus(true);
                        try {
                          await checkAllStatuses();
                          await loadExistingVideos();
                          toast.info('Status check complete - check Library tab for updates');
                        } catch (err) {
                          toast.error('Failed to check status');
                        } finally {
                          setIsCheckingStatus(false);
                        }
                      }}
                    >
                      {isCheckingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Check Status
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-2"
                      onClick={() => setActiveTab('library')}
                    >
                      <Layers className="w-4 h-4" />
                      View Library
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentVideo.chapters.filter(c => c.success).length}/{CHAPTERS.length} chapters • 
                    ~{Math.round(totalDuration / 60)} min • 
                    Entry saved to library
                  </p>
                </motion.div>
              )}

              {/* Result - Complete status */}
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        if (currentVideo?.videoUrl) {
                          setPreviewVideo({
                            url: currentVideo.videoUrl,
                            title: `${currentVideo.languageName} Marketing Video`
                          });
                        } else {
                          toast.error('Video URL not available yet');
                        }
                      }}
                    >
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

        {/* Library Tab - Genie Cast Specific (Landing Page Videos) */}
        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Genie Cast Video Library
              </CardTitle>
              <CardDescription className="space-y-1">
                <span className="block">
                  {existingVideos.length} complete marketing videos for landing pages
                </span>
                <span className="block text-xs text-muted-foreground/80">
                  <strong>Note:</strong> This is different from Create → Library which stores general content assets (scripts, recordings, media). 
                  This library specifically holds Genie Cast generated marketing videos.
                </span>
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
                        <Card 
                          key={video.id} 
                          className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          onClick={() => setPreviewVideo({
                            url: video.video_url,
                            title: `${video.language_name} Marketing Video`
                          })}
                        >
                          <div className="aspect-video bg-muted flex items-center justify-center relative group">
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="w-8 h-8 text-muted-foreground" />
                            )}
                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="w-6 h-6 text-primary ml-1" />
                              </div>
                            </div>
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

      {/* Video Preview Dialog */}
      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{previewVideo?.title || 'Video Preview'}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black">
            {previewVideo?.url && (
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedVideoGenerationPanel;
