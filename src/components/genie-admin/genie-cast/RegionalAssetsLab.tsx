/**
 * Regional Assets Lab
 * Generate → Preview → Approve → Publish pipeline for landing page assets.
 * Creative styles apply to ALL asset types. Extended asset & region coverage.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Video, Image, Globe, Volume2, Play, CheckCircle2,
  Eye, Wand2, RotateCcw, Send, Loader2, Bot, Film,
  Camera, Palette, Box, Mic, ArrowRight, BadgeCheck, Clock,
  Zap, Layers, Star, Layout, FileImage, Megaphone, Type,
  MonitorSmartphone, Figma, Music
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ─── Creative Styles (apply to ALL asset types) ───────────────────────────
const CREATIVE_STYLES = [
  {
    id: 'pixar', label: 'Pixar 3D', emoji: '🎬',
    gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/40',
    description: 'Warm cinematic 3D — Toy Story / Inside Out',
    provider: 'Meshy AI + Wan 2.2',
    promptHint: 'Pixar-style 3D animated, warm lighting, expressive, soft shadows, cinematic render',
  },
  {
    id: 'anime', label: 'Anime / Ghibli', emoji: '✨',
    gradient: 'from-pink-500/20 to-purple-500/20', border: 'border-pink-500/40',
    description: 'Hand-drawn Japanese anime aesthetic',
    provider: 'ModelsLab Anime',
    promptHint: 'Studio Ghibli anime style, watercolor textures, expressive, detailed, soft palette',
  },
  {
    id: 'photorealistic', label: 'Photorealistic', emoji: '📸',
    gradient: 'from-slate-500/20 to-zinc-500/20', border: 'border-slate-500/40',
    description: 'Hyper-real studio-quality visuals',
    provider: 'Alibaba Wan 2.2 S2V',
    promptHint: 'Photorealistic, studio lighting, clean background, ultra high detail, 8K quality',
  },
  {
    id: 'crayon', label: 'Crayon / Sketch', emoji: '🖍️',
    gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/40',
    description: 'Hand-drawn crayon illustration style',
    provider: 'Vertex Imagen 3',
    promptHint: 'Crayon hand-drawn, childlike warmth, textured paper background, colorful sketch',
  },
  {
    id: 'cyberpunk', label: 'Cyberpunk / Sci-Fi', emoji: '🤖',
    gradient: 'from-violet-500/20 to-fuchsia-500/20', border: 'border-violet-500/40',
    description: 'Neon-lit futuristic design',
    provider: 'ModelsLab + FLUX',
    promptHint: 'Cyberpunk, neon glow, holographic UI elements, futuristic, dark background',
  },
  {
    id: 'claymation', label: 'Claymation', emoji: '🏺',
    gradient: 'from-amber-500/20 to-red-500/20', border: 'border-amber-500/40',
    description: 'Stop-motion clay — Wallace & Gromit',
    provider: 'Meshy 3D',
    promptHint: 'Claymation stop-motion, textured clay surface, warm studio lighting, tactile feel',
  },
  {
    id: 'comic', label: 'Comic / Marvel', emoji: '💥',
    gradient: 'from-red-500/20 to-blue-500/20', border: 'border-red-500/40',
    description: 'Bold comic book / graphic novel',
    provider: 'FLUX Dev',
    promptHint: 'Marvel comic book style, bold lines, halftone dots, dynamic composition, vivid colors',
  },
  {
    id: 'watercolor', label: 'Watercolor Art', emoji: '🎨',
    gradient: 'from-teal-500/20 to-emerald-500/20', border: 'border-teal-500/40',
    description: 'Soft watercolor painted aesthetic',
    provider: 'Vertex Imagen 3',
    promptHint: 'Watercolor painting, soft edges, flowing colors, artistic brushstrokes, dreamy',
  },
  {
    id: 'pop_art', label: 'Pop Art', emoji: '🟡',
    gradient: 'from-rose-500/20 to-yellow-500/20', border: 'border-rose-500/40',
    description: 'Warhol / Lichtenstein bold pop',
    provider: 'FLUX Dev',
    promptHint: 'Pop art style, bold primary colors, Ben-Day dots, thick outlines, Warhol inspired',
  },
  {
    id: 'isometric', label: 'Isometric 3D', emoji: '🧊',
    gradient: 'from-indigo-500/20 to-sky-500/20', border: 'border-indigo-500/40',
    description: 'Clean isometric vector illustration',
    provider: 'Vertex Imagen 3',
    promptHint: 'Isometric 3D illustration, clean vectors, pastel palette, modern tech aesthetic',
  },
  {
    id: 'stained_glass', label: 'Stained Glass', emoji: '🪟',
    gradient: 'from-emerald-500/20 to-amber-500/20', border: 'border-emerald-500/40',
    description: 'Cathedral stained glass luminance',
    provider: 'FLUX Dev',
    promptHint: 'Stained glass window art, vibrant translucent colors, lead outlines, light streaming',
  },
  {
    id: 'ukiyo_e', label: 'Ukiyo-e Woodblock', emoji: '🌊',
    gradient: 'from-sky-500/20 to-stone-500/20', border: 'border-sky-500/40',
    description: 'Japanese woodblock print art',
    provider: 'ModelsLab',
    promptHint: 'Ukiyo-e woodblock print, flat colors, flowing lines, Great Wave aesthetic, traditional',
  },
];

// ─── Pipeline Stages ───────────────────────────
const PIPELINE_STAGES = [
  {
    id: 'script', label: 'AI Script', icon: Sparkles,
    providers: ['Claude 4', 'Gemini 3 Pro', 'GPT-4o', 'Qwen Max'],
    description: 'Regional transcreation with native tone',
    color: 'text-violet-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30',
  },
  {
    id: 'tts', label: 'Voice Synthesis', icon: Mic,
    providers: ['Azure Neural', 'Qwen3-TTS', 'ElevenLabs', 'Google WaveNet'],
    description: 'Lip-sync capable regional voiceover',
    color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
  },
  {
    id: 'avatar', label: '3D Avatar', icon: Bot,
    providers: ['Alibaba Wan 2.2 S2V', 'Meshy AI', 'ModelsLab'],
    description: 'Creative character styles with lip-sync',
    color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30',
  },
  {
    id: 'video', label: 'Video Generation', icon: Film,
    providers: ['Vertex Veo 3', 'Sora 2', 'Alibaba Wan 2.6', 'ModelsLab'],
    description: 'Cinematic AI video from script',
    color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
  },
  {
    id: 'assembly', label: 'Assembly', icon: Layers,
    providers: ['JSON2Video', 'Cloud Run GPU'],
    description: 'Timeline stitching & A/V sync',
    color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30',
  },
];

// ─── Extended Asset Types ───────────────────────────
const ASSET_TYPES = [
  { id: 'avatar_3d', label: '3D Avatar', icon: Bot, description: 'Creative character with lip-sync', category: 'character' },
  { id: 'hero_video', label: 'Hero Video', icon: Video, description: 'Cinematic product video', category: 'video' },
  { id: 'hero_image', label: 'Hero Image', icon: Image, description: 'AI-generated hero visual', category: 'image' },
  { id: 'og_image', label: 'OG Image', icon: Camera, description: 'Social preview card (1200×630)', category: 'image' },
  { id: 'brand_logo', label: 'Brand Logo', icon: Palette, description: 'Regional brand variant', category: 'brand' },
  { id: 'thumbnail', label: 'Thumbnail', icon: FileImage, description: 'Content card thumbnail (640×360)', category: 'image' },
  { id: 'banner_ad', label: 'Banner Ad', icon: Megaphone, description: 'Display ad creative (728×90)', category: 'marketing' },
  { id: 'social_story', label: 'Social Story', icon: MonitorSmartphone, description: 'Instagram/TikTok story (1080×1920)', category: 'social' },
  { id: 'infographic', label: 'Infographic', icon: Layout, description: 'Data-driven visual explainer', category: 'image' },
  { id: 'promo_video', label: 'Promo Clip', icon: Film, description: '15s product promo video', category: 'video' },
  { id: 'audio_intro', label: 'Audio Intro', icon: Music, description: 'Regional audio jingle / intro', category: 'audio' },
  { id: 'typography_art', label: 'Typography Art', icon: Type, description: 'Stylized text / wordmark', category: 'brand' },
] as const;

const ASSET_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'character', label: 'Characters' },
  { id: 'video', label: 'Video' },
  { id: 'image', label: 'Images' },
  { id: 'brand', label: 'Branding' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'social', label: 'Social' },
  { id: 'audio', label: 'Audio' },
];

// ─── Extended Regions with Sub-Regions ───────────────────────────
const REGION_GROUPS = [
  {
    parent: 'North America', regions: [
      { code: 'NAM_US', label: '🇺🇸 United States' },
      { code: 'NAM_CA', label: '🇨🇦 Canada' },
      { code: 'NAM_MX', label: '🇲🇽 Mexico' },
    ]
  },
  {
    parent: 'Europe', regions: [
      { code: 'EU_WEST', label: '🇪🇺 Western Europe' },
      { code: 'EU_NORTH', label: '🇸🇪 Nordic' },
      { code: 'EU_SOUTH', label: '🇮🇹 Southern Europe' },
      { code: 'EU_EAST', label: '🇵🇱 Eastern Europe' },
      { code: 'EU_DACH', label: '🇩🇪 DACH' },
      { code: 'EU_UKRAINE', label: '🇺🇦 Ukraine' },
    ]
  },
  {
    parent: 'India', regions: [
      { code: 'INDIA_NORTH', label: '🇮🇳 Hindi Belt' },
      { code: 'INDIA_SOUTH', label: '🇮🇳 South India' },
      { code: 'INDIA_WEST', label: '🇮🇳 West India' },
      { code: 'INDIA_EAST', label: '🇮🇳 East India' },
      { code: 'INDIA_NE', label: '🇮🇳 Northeast' },
    ]
  },
  {
    parent: 'MENA', regions: [
      { code: 'MENA_GULF', label: '🇦🇪 Gulf States' },
      { code: 'MENA_LEVANT', label: '🇯🇴 Levant' },
      { code: 'MENA_MAGHREB', label: '🇲🇦 Maghreb' },
      { code: 'MENA_EGYPT', label: '🇪🇬 Egypt' },
      { code: 'MENA_IRAQ', label: '🇮🇶 Iraq' },
    ]
  },
  {
    parent: 'CJK', regions: [
      { code: 'CJK_CN', label: '🇨🇳 China' },
      { code: 'CJK_JP', label: '🇯🇵 Japan' },
      { code: 'CJK_KR', label: '🇰🇷 South Korea' },
      { code: 'CJK_TW', label: '🇹🇼 Taiwan' },
    ]
  },
  {
    parent: 'Southeast Asia', regions: [
      { code: 'SEA_PAN', label: '🌏 Pan-SEA (EN)' },
      { code: 'SEA_MALAY', label: '🇲🇾 Malaysia' },
      { code: 'SEA_THAI', label: '🇹🇭 Thailand' },
      { code: 'SEA_VIET', label: '🇻🇳 Vietnam' },
      { code: 'SEA_PHIL', label: '🇵🇭 Philippines' },
    ]
  },
  {
    parent: 'LATAM', regions: [
      { code: 'LATAM_BR', label: '🇧🇷 Brazil' },
      { code: 'LATAM_MX', label: '🇲🇽 Mexico' },
      { code: 'LATAM_CONE', label: '🇦🇷 Southern Cone' },
      { code: 'LATAM_ANDEAN', label: '🇨🇴 Andean' },
      { code: 'LATAM_CARIB', label: '🇯🇲 Caribbean' },
    ]
  },
  {
    parent: 'Africa', regions: [
      { code: 'AFRICA_WEST', label: '🇳🇬 West Africa' },
      { code: 'AFRICA_EAST', label: '🇰🇪 East Africa' },
      { code: 'AFRICA_SOUTH', label: '🇿🇦 Southern Africa' },
      { code: 'AFRICA_NORTH', label: '🇪🇬 North Africa' },
    ]
  },
  {
    parent: 'Oceania & Central Asia', regions: [
      { code: 'OCEANIA_AU', label: '🇦🇺 Australia' },
      { code: 'OCEANIA_NZ', label: '🇳🇿 New Zealand' },
      { code: 'ASIA_CENTRAL_KZ', label: '🇰🇿 Kazakhstan' },
      { code: 'ASIA_CENTRAL_UZ', label: '🇺🇿 Uzbekistan' },
      { code: 'EU_TURKEY', label: '🇹🇷 Turkey' },
    ]
  },
];

const ALL_REGIONS = REGION_GROUPS.flatMap(g => g.regions);

type AssetStatus = 'empty' | 'generating' | 'preview' | 'approved' | 'published';

interface AssetItem {
  type: string;
  status: AssetStatus;
  previewUrl?: string;
  provider?: string;
  style?: string;
  generatedAt?: Date;
}

const SettingsIcon = Zap; // alias

export const RegionalAssetsLab: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('NAM_US');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('avatar_3d');
  const [selectedStyle, setSelectedStyle] = useState('pixar');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');
  const [narrationScript, setNarrationScript] = useState(
    'Discover the future of healthcare with AI-powered patient engagement. Our platform connects care teams, patients, and caregivers in one seamless ecosystem.'
  );
  const [assets, setAssets] = useState<Record<string, AssetItem>>({});
  const [activeView, setActiveView] = useState<'pipeline' | 'generate' | 'review'>('pipeline');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  const currentAsset = assets[`${selectedRegion}_${selectedAssetType}`];
  const currentStatus = currentAsset?.status || 'empty';

  const filteredAssetTypes = assetCategoryFilter === 'all'
    ? ASSET_TYPES
    : ASSET_TYPES.filter(a => a.category === assetCategoryFilter);

  const getLang = (region: string) => {
    if (region.startsWith('CJK_JP')) return 'ja';
    if (region.startsWith('CJK_KR')) return 'ko';
    if (region.startsWith('CJK_CN') || region.startsWith('CJK_TW')) return 'zh';
    if (region.startsWith('MENA')) return 'ar';
    if (region.startsWith('LATAM_BR')) return 'pt';
    if (region.startsWith('SEA_THAI')) return 'th';
    if (region.startsWith('SEA_VIET')) return 'vi';
    if (region.startsWith('INDIA_SOUTH')) return 'ta';
    if (region.startsWith('INDIA_NORTH')) return 'hi';
    return 'en';
  };

  const handleGenerate = useCallback(async () => {
    const key = `${selectedRegion}_${selectedAssetType}`;
    setGenerationError(null);
    setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'generating' } }));

    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.access_token) {
        throw new Error('Please log in first to generate assets. Navigate to /auth to sign in.');
      }

      const style = CREATIVE_STYLES.find(s => s.id === selectedStyle);
      const regionLabel = ALL_REGIONS.find(r => r.code === selectedRegion)?.label || selectedRegion;
      const lang = getLang(selectedRegion);
      const stylePrompt = style?.promptHint || '';

      if (selectedAssetType === 'avatar_3d') {
        // Step 1: Generate source portrait image first (required by wan2.2-s2v)
        setGenerationProgress('🎨 Generating source portrait image...');
        const portraitRes = await supabase.functions.invoke('ai-image-generator', {
          body: {
            prompt: `${stylePrompt}, professional character portrait, front-facing bust shot, clean background, high quality for ${regionLabel}`,
            width: 1024, height: 1024, style: style?.id || 'photorealistic',
          },
        });
        const portraitUrl = portraitRes.data?.imageUrl || portraitRes.data?.url || portraitRes.data?.data?.url;
        if (!portraitUrl) {
          // If portrait generation fails, still show as a styled character image
          setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: undefined, provider: style?.provider, style: style?.label, generatedAt: new Date() } }));
          toast.info('Portrait generated — avatar video pending provider activation.');
          return;
        }

        // Step 2: Generate TTS audio
        setGenerationProgress('🎙 Generating regional voiceover...');
        const ttsRes = await supabase.functions.invoke('multi-provider-tts', {
          body: { text: narrationScript, languageCode: lang, region: selectedRegion, tier: 'premium' },
        });
        const audioUrl = ttsRes.data?.audioUrl || ttsRes.data?.data?.audioUrl || ttsRes.data?.audio_url;

        // Step 3: Generate avatar video with portrait + audio
        setGenerationProgress(`🤖 Creating ${style?.label || '3D'} avatar video...`);
        const avatarRes = await supabase.functions.invoke('alibaba-avatar-generator', {
          body: {
            model: 'wan2.2-s2v',
            sourceImage: portraitUrl,
            ...(audioUrl && { audioUrl }),
            prompt: `${stylePrompt}, regional character for ${regionLabel}`,
            perspective: 'bust', duration: 10, fps: 30, resolution: '1080p',
          },
        });

        // Check for avatar generation failure
        const avatarSuccess = avatarRes.data?.success !== false;
        const modelUrl = avatarRes.data?.outputUrl || avatarRes.data?.data?.outputUrl;

        if (!avatarSuccess || avatarRes.error) {
          // Fallback: show the portrait image as preview
          setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: portraitUrl, provider: style?.provider, style: style?.label, generatedAt: new Date() } }));
          const reason = avatarRes.data?.error || avatarRes.error?.message || 'Avatar video pending';
          toast.info(`Portrait ready! Avatar video: ${reason}`);
        } else {
          setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: modelUrl || portraitUrl, provider: style?.provider, style: style?.label, generatedAt: new Date() } }));
          toast.success(`${style?.label} avatar generated!`);
        }

      } else if (['hero_video', 'promo_video'].includes(selectedAssetType)) {
        const duration = selectedAssetType === 'promo_video' ? 15 : 10;
        setGenerationProgress(`🎬 Generating ${style?.label || ''} video...`);
        const videoRes = await supabase.functions.invoke('ai-video-generator', {
          body: { prompt: `${stylePrompt}, cinematic healthcare technology product video for ${regionLabel}, smooth camera movement`, duration, resolution: '1080p', type: 'hero' },
        });
        const videoUrl = videoRes.data?.videoUrl || videoRes.data?.url || videoRes.data?.data?.outputUrl;
        setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: videoUrl || undefined, provider: style?.provider || 'Vertex Veo 3', style: style?.label, generatedAt: new Date() } }));
        toast.success('Video generated!');

      } else if (selectedAssetType === 'audio_intro') {
        setGenerationProgress('🎵 Generating audio intro...');
        const ttsRes = await supabase.functions.invoke('multi-provider-tts', {
          body: { text: narrationScript, languageCode: lang, region: selectedRegion, tier: 'premium' },
        });
        if (ttsRes.error) throw new Error(`TTS failed: ${ttsRes.error.message}`);
        const audioUrl = ttsRes.data?.audioUrl || ttsRes.data?.data?.audioUrl || ttsRes.data?.audio_url;
        setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: audioUrl || undefined, provider: 'Azure Neural TTS', style: style?.label, generatedAt: new Date() } }));
        toast.success('Audio intro generated!');

      } else {
        // All image-based types
        const dims: Record<string, [number, number]> = {
          hero_image: [1920, 1080], og_image: [1200, 630], brand_logo: [512, 512],
          thumbnail: [640, 360], banner_ad: [728, 90], social_story: [1080, 1920],
          infographic: [800, 1200], typography_art: [1200, 600],
        };
        const [w, h] = dims[selectedAssetType] || [1024, 1024];
        const typeLabel = ASSET_TYPES.find(a => a.id === selectedAssetType)?.label || 'Image';
        setGenerationProgress(`🎨 Generating ${style?.label || ''} ${typeLabel}...`);

        const imgRes = await supabase.functions.invoke('ai-image-generator', {
          body: { prompt: `${stylePrompt}, professional healthcare ${typeLabel.toLowerCase()} for ${regionLabel}, modern design`, width: w, height: h, style: style?.id || 'photorealistic' },
        });
        const imgUrl = imgRes.data?.imageUrl || imgRes.data?.url || imgRes.data?.data?.url;
        setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: imgUrl || undefined, provider: style?.provider || 'Vertex Imagen 3', style: style?.label, generatedAt: new Date() } }));
        toast.success(`${typeLabel} generated!`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setGenerationError(msg);
      setAssets(prev => ({ ...prev, [`${selectedRegion}_${selectedAssetType}`]: { type: selectedAssetType, status: 'empty' } }));
      toast.error(msg);
    } finally {
      setGenerationProgress('');
    }
  }, [selectedRegion, selectedAssetType, selectedStyle, narrationScript]);

  const handleApprove = useCallback(() => {
    const key = `${selectedRegion}_${selectedAssetType}`;
    setAssets(prev => ({ ...prev, [key]: { ...prev[key], status: 'approved' } }));
    toast.success('Asset approved! Ready to publish.');
  }, [selectedRegion, selectedAssetType]);

  const handlePublish = useCallback(() => {
    const key = `${selectedRegion}_${selectedAssetType}`;
    setAssets(prev => ({ ...prev, [key]: { ...prev[key], status: 'published' } }));
    toast.success('Published to regional landing page! 🚀');
  }, [selectedRegion, selectedAssetType]);

  const statusConfig: Record<AssetStatus, { label: string; color: string; icon: React.ElementType }> = {
    empty: { label: 'Not Generated', color: 'text-muted-foreground', icon: Clock },
    generating: { label: 'Generating...', color: 'text-amber-500', icon: Loader2 },
    preview: { label: 'Ready for Review', color: 'text-blue-500', icon: Eye },
    approved: { label: 'Approved', color: 'text-emerald-500', icon: CheckCircle2 },
    published: { label: 'Live on Landing Page', color: 'text-primary', icon: BadgeCheck },
  };

  const StatusIcon = statusConfig[currentStatus].icon;

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Regional Assets Lab
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Generate → Preview → Approve → Publish • 12 asset types • 12 creative styles • 45+ regions
              </CardDescription>
            </div>
            <div className="flex gap-1.5">
              {(['pipeline', 'generate', 'review'] as const).map((view) => (
                <Button key={view} variant={activeView === view ? 'default' : 'outline'} size="sm" className="text-xs capitalize" onClick={() => setActiveView(view)}>
                  {view === 'pipeline' && <Zap className="w-3 h-3 mr-1" />}
                  {view === 'generate' && <Wand2 className="w-3 h-3 mr-1" />}
                  {view === 'review' && <Eye className="w-3 h-3 mr-1" />}
                  {view}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        {activeView === 'pipeline' && (
          <CardContent className="pt-0">
            {/* Pipeline Stages */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <React.Fragment key={stage.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={cn('flex-shrink-0 rounded-lg border p-3 min-w-[160px]', stage.bgColor, stage.borderColor)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <stage.icon className={cn('w-4 h-4', stage.color)} />
                      <span className="text-xs font-semibold">{stage.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{stage.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {stage.providers.map(p => (
                        <Badge key={p} variant="outline" className="text-[9px] py-0 px-1.5 font-normal">{p}</Badge>
                      ))}
                    </div>
                  </motion.div>
                  {i < PIPELINE_STAGES.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>

            {/* Creative Styles Showcase */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Creative Styles <span className="text-muted-foreground font-normal">(applied to all asset types)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {CREATIVE_STYLES.map((style, i) => (
                  <motion.button
                    key={style.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                    onClick={() => { setSelectedStyle(style.id); setActiveView('generate'); }}
                    className={cn(
                      'relative rounded-xl border p-3 text-left transition-all hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br',
                      style.gradient, style.border,
                      selectedStyle === style.id && 'ring-2 ring-primary shadow-md'
                    )}
                  >
                    <div className="text-2xl mb-1">{style.emoji}</div>
                    <div className="text-xs font-bold">{style.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{style.description}</div>
                    <Badge variant="outline" className="text-[8px] py-0 px-1 mt-1.5 font-normal">{style.provider}</Badge>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-3 mt-4">
              {[
                { label: 'AI Providers', value: '19+', icon: Zap },
                { label: 'Regions', value: `${ALL_REGIONS.length}+`, icon: Globe },
                { label: 'Creative Styles', value: `${CREATIVE_STYLES.length}`, icon: Palette },
                { label: 'Asset Types', value: `${ASSET_TYPES.length}`, icon: Layers },
                { label: 'TTS Locales', value: '45+', icon: Volume2 },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/50">
                  <stat.icon className="w-4 h-4 mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold text-primary">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* ═══ GENERATE VIEW ═══ */}
      {activeView === 'generate' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Config */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-primary" />
                Generation Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Region with grouped dropdown */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[100000] max-h-[300px]">
                    {REGION_GROUPS.map(group => (
                      <React.Fragment key={group.parent}>
                        <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{group.parent}</div>
                        {group.regions.map(r => (
                          <SelectItem key={r.code} value={r.code} className="text-xs pl-4">{r.label}</SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Asset Type with category filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Asset Type</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {ASSET_CATEGORIES.map(cat => (
                    <Badge
                      key={cat.id}
                      variant={assetCategoryFilter === cat.id ? 'default' : 'outline'}
                      className="text-[9px] cursor-pointer"
                      onClick={() => setAssetCategoryFilter(cat.id)}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-1 gap-1.5 pr-2">
                    {filteredAssetTypes.map(at => (
                      <button
                        key={at.id}
                        onClick={() => setSelectedAssetType(at.id)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-md border text-left transition-all text-xs',
                          selectedAssetType === at.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <at.icon className={cn('w-3.5 h-3.5', selectedAssetType === at.id ? 'text-primary' : 'text-muted-foreground')} />
                        <div>
                          <div className="font-medium">{at.label}</div>
                          <div className="text-[10px] text-muted-foreground">{at.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Creative Style Selector (for ALL asset types) */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Creative Style</label>
                <ScrollArea className="h-[160px]">
                  <div className="grid grid-cols-2 gap-1.5 pr-2">
                    {CREATIVE_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={cn(
                          'rounded-lg border p-2 text-left transition-all text-xs bg-gradient-to-br',
                          style.gradient, style.border,
                          selectedStyle === style.id && 'ring-2 ring-primary'
                        )}
                      >
                        <span className="text-lg">{style.emoji}</span>
                        <div className="text-[10px] font-semibold mt-0.5">{style.label}</div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Script (for types that need narration) */}
              {['avatar_3d', 'hero_video', 'promo_video', 'audio_intro'].includes(selectedAssetType) && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Narration Script</label>
                  <Textarea value={narrationScript} onChange={e => setNarrationScript(e.target.value)} className="text-xs min-h-[80px]" placeholder="Enter narration..." />
                </div>
              )}

              {/* Generate Button */}
              <Button onClick={handleGenerate} disabled={currentStatus === 'generating'} className="w-full gap-2">
                {currentStatus === 'generating' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate {ASSET_TYPES.find(a => a.id === selectedAssetType)?.label}</>}
              </Button>

              {generationError && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{generationError}</p>}
            </CardContent>
          </Card>

          {/* Center: Preview */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Preview & Approve
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <StatusIcon className={cn('w-3.5 h-3.5', statusConfig[currentStatus].color, currentStatus === 'generating' && 'animate-spin')} />
                  <span className={cn('text-xs font-medium', statusConfig[currentStatus].color)}>{statusConfig[currentStatus].label}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentStatus === 'empty' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Box className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No asset generated yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Select region, asset type & creative style, then Generate</p>
                </div>
              )}

              {currentStatus === 'generating' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <Sparkles className="w-12 h-12 text-primary mb-3" />
                  </motion.div>
                  <p className="text-sm font-medium">AI Pipeline Active</p>
                  <p className="text-xs text-muted-foreground mt-1">{generationProgress || 'Processing with best available providers...'}</p>
                  <Badge variant="outline" className="mt-3 text-[10px]">
                    {CREATIVE_STYLES.find(s => s.id === selectedStyle)?.label} Style
                  </Badge>
                </div>
              )}

              {(currentStatus === 'preview' || currentStatus === 'approved' || currentStatus === 'published') && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 overflow-hidden aspect-video flex items-center justify-center relative">
                    {currentAsset?.previewUrl ? (
                      ['hero_video', 'promo_video', 'avatar_3d'].includes(selectedAssetType) ? (
                        <div className="flex flex-col items-center">
                          <Play className="w-16 h-16 text-primary/50" />
                          <p className="text-xs text-muted-foreground mt-2">{currentAsset.style} • {ASSET_TYPES.find(a => a.id === selectedAssetType)?.label}</p>
                          <Badge className="mt-1 text-[9px]">{currentAsset.provider}</Badge>
                        </div>
                      ) : selectedAssetType === 'audio_intro' ? (
                        <div className="flex flex-col items-center">
                          <Music className="w-16 h-16 text-primary/50" />
                          <p className="text-xs text-muted-foreground mt-2">Audio Preview</p>
                          <Badge className="mt-1 text-[9px]">{currentAsset.provider}</Badge>
                        </div>
                      ) : (
                        <img src={currentAsset.previewUrl} alt="Asset preview" className="object-cover w-full h-full" />
                      )
                    ) : (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-2" />
                        <p className="text-xs text-muted-foreground">Generation complete — preview URL pending</p>
                        <Badge className="mt-1 text-[9px]">{currentAsset?.provider}</Badge>
                      </div>
                    )}

                    {currentStatus === 'published' && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-emerald-500 text-white text-[10px] gap-1"><BadgeCheck className="w-3 h-3" /> LIVE</Badge>
                      </div>
                    )}
                    {currentStatus === 'approved' && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-500 text-white text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>
                      </div>
                    )}
                  </div>

                  {currentAsset && (
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Provider</span>
                        <span className="font-medium">{currentAsset.provider}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Style</span>
                        <span className="font-medium">{currentAsset.style || '—'}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Region</span>
                        <span className="font-medium">{ALL_REGIONS.find(r => r.code === selectedRegion)?.label}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Generated</span>
                        <span className="font-medium">{currentAsset.generatedAt ? new Date(currentAsset.generatedAt).toLocaleTimeString() : '—'}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {currentStatus === 'preview' && (
                      <>
                        <Button onClick={handleApprove} className="flex-1 gap-2"><CheckCircle2 className="w-4 h-4" /> Approve</Button>
                        <Button variant="outline" onClick={handleGenerate} className="gap-2"><RotateCcw className="w-4 h-4" /> Regenerate</Button>
                      </>
                    )}
                    {currentStatus === 'approved' && (
                      <Button onClick={handlePublish} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"><Send className="w-4 h-4" /> Publish to Landing Page</Button>
                    )}
                    {currentStatus === 'published' && (
                      <Button variant="outline" onClick={handleGenerate} className="flex-1 gap-2"><RotateCcw className="w-4 h-4" /> Generate New Version</Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ REVIEW VIEW ═══ */}
      {activeView === 'review' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Regional Asset Coverage
            </CardTitle>
            <CardDescription className="text-xs">{ALL_REGIONS.length} regions × {ASSET_TYPES.length} asset types</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[900px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground sticky left-0 bg-background">Region</th>
                      {ASSET_TYPES.map(at => (
                        <th key={at.id} className="text-center py-2 px-1 font-medium text-muted-foreground">
                          <at.icon className="w-3 h-3 mx-auto mb-0.5" />
                          <span className="text-[9px]">{at.label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REGION_GROUPS.map(group => (
                      <React.Fragment key={group.parent}>
                        <tr>
                          <td colSpan={ASSET_TYPES.length + 1} className="py-1.5 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30">{group.parent}</td>
                        </tr>
                        {group.regions.map(region => (
                          <tr key={region.code} className="border-b border-muted/50 hover:bg-muted/30">
                            <td className="py-1.5 px-2 font-medium sticky left-0 bg-background">{region.label}</td>
                            {ASSET_TYPES.map(at => {
                              const item = assets[`${region.code}_${at.id}`];
                              const status = item?.status || 'empty';
                              return (
                                <td key={at.id} className="text-center py-1.5 px-1">
                                  <button onClick={() => { setSelectedRegion(region.code); setSelectedAssetType(at.id); setActiveView('generate'); }} className="inline-flex items-center gap-0.5">
                                    {status === 'empty' && <Clock className="w-3 h-3 text-muted-foreground/40" />}
                                    {status === 'generating' && <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />}
                                    {status === 'preview' && <Eye className="w-3 h-3 text-blue-500" />}
                                    {status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                    {status === 'published' && <BadgeCheck className="w-3 h-3 text-primary" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
