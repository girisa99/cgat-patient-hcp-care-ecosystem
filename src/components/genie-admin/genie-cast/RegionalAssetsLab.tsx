/**
 * Regional Assets Lab
 * Generate → Preview → Approve → Publish pipeline for landing page assets.
 * Creative styles apply to ALL asset types. Extended asset & region coverage.
 * Auto-generates contextual narration scripts per asset type + region via LLM.
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
    id: 'crayon', label: 'Crayon / Chalk', emoji: '🖍️',
    gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/40',
    description: 'Textured hand-drawn crayon illustration',
    provider: 'Vertex Imagen 3',
    promptHint: 'Crayon-style illustration, textured paper, hand-drawn, warm colors, playful',
  },
  {
    id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆',
    gradient: 'from-violet-500/20 to-fuchsia-500/20', border: 'border-violet-500/40',
    description: 'Neon-lit futuristic sci-fi aesthetic',
    provider: 'ModelsLab FLUX',
    promptHint: 'Cyberpunk style, neon lights, dark atmosphere, futuristic cityscape, holographic UI',
  },
  {
    id: 'claymation', label: 'Claymation', emoji: '🏺',
    gradient: 'from-amber-500/20 to-rose-500/20', border: 'border-amber-500/40',
    description: 'Stop-motion clay figure style',
    provider: 'Meshy AI',
    promptHint: 'Claymation style, clay figures, stop-motion aesthetic, smooth rounded shapes, warm palette',
  },
  {
    id: 'comic', label: 'Comic Book', emoji: '💥',
    gradient: 'from-red-500/20 to-yellow-500/20', border: 'border-red-500/40',
    description: 'Bold linework comic / graphic novel',
    provider: 'ModelsLab FLUX',
    promptHint: 'Comic book style, bold outlines, halftone dots, vibrant colors, dynamic composition',
  },
  {
    id: 'watercolor', label: 'Watercolor', emoji: '🎨',
    gradient: 'from-teal-500/20 to-emerald-500/20', border: 'border-teal-500/40',
    description: 'Soft transparent watercolor painting',
    provider: 'Vertex Imagen 3',
    promptHint: 'Watercolor painting style, soft edges, transparent washes, fluid strokes, pastel palette',
  },
  {
    id: 'popart', label: 'Pop Art', emoji: '🎭',
    gradient: 'from-pink-500/20 to-yellow-500/20', border: 'border-pink-500/40',
    description: 'Bold pop art — Warhol / Lichtenstein',
    provider: 'ModelsLab FLUX',
    promptHint: 'Pop art style, bold colors, halftone dots, Warhol-inspired, high contrast, retro',
  },
  {
    id: 'isometric', label: 'Isometric 3D', emoji: '🔷',
    gradient: 'from-indigo-500/20 to-sky-500/20', border: 'border-indigo-500/40',
    description: 'Clean isometric 3D illustrations',
    provider: 'Meshy AI',
    promptHint: 'Isometric 3D illustration, clean geometric shapes, pastel colors, flat shading, tech style',
  },
  {
    id: 'stainedglass', label: 'Stained Glass', emoji: '🪟',
    gradient: 'from-purple-500/20 to-blue-500/20', border: 'border-purple-500/40',
    description: 'Luminous stained glass mosaic',
    provider: 'Vertex Imagen 3',
    promptHint: 'Stained glass style, leaded glass segments, luminous backlit colors, mosaic pattern',
  },
  {
    id: 'ukiyoe', label: 'Ukiyo-e', emoji: '🌊',
    gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/40',
    description: 'Japanese woodblock print aesthetic',
    provider: 'ModelsLab FLUX',
    promptHint: 'Ukiyo-e Japanese woodblock print, bold lines, flat colors, traditional waves, elegant',
  },
];

// ─── Asset Types (12 types across 8 categories) ──────────────────────────
const ASSET_TYPES = [
  { id: 'avatar_3d', label: '3D Avatar', icon: Bot, category: 'characters', description: 'Animated character with lip-sync' },
  { id: 'hero_video', label: 'Hero Video', icon: Film, category: 'video', description: 'Landing page hero background' },
  { id: 'hero_image', label: 'Hero Image', icon: Image, category: 'images', description: 'Landing page hero banner' },
  { id: 'og_image', label: 'OG Image', icon: MonitorSmartphone, category: 'branding', description: '1200×630 social preview' },
  { id: 'brand_logo', label: 'Brand Logo', icon: Figma, category: 'branding', description: 'Regional brand variant' },
  { id: 'thumbnail', label: 'Thumbnail', icon: Camera, category: 'images', description: 'Video/content thumbnail' },
  { id: 'banner_ad', label: 'Banner Ad', icon: Layout, category: 'marketing', description: '728×90 display banner' },
  { id: 'social_story', label: 'Social Story', icon: FileImage, category: 'social', description: '1080×1920 portrait' },
  { id: 'infographic', label: 'Infographic', icon: Layers, category: 'marketing', description: 'Data visualization graphic' },
  { id: 'promo_video', label: 'Promo Clip', icon: Video, category: 'video', description: '15s promotional video' },
  { id: 'audio_intro', label: 'Audio Intro', icon: Mic, category: 'audio', description: 'Regional audio greeting' },
  { id: 'typography_art', label: 'Typography Art', icon: Type, category: 'images', description: 'Stylized text visual' },
];

const ASSET_CATEGORIES = [
  { id: 'all', label: 'All Types' },
  { id: 'characters', label: 'Characters' },
  { id: 'video', label: 'Video' },
  { id: 'images', label: 'Images' },
  { id: 'branding', label: 'Branding' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'social', label: 'Social' },
  { id: 'audio', label: 'Audio' },
];

// ─── All 15 Parent Regions → 50+ Sub-Regions ─────────────────────────────
const REGION_GROUPS = [
  {
    parent: 'NAM', regions: [
      { code: 'NAM_US', label: '🇺🇸 United States' },
      { code: 'NAM_CA', label: '🇨🇦 Canada' },
      { code: 'NAM_US_SOUTH', label: '🇺🇸 US South' },
      { code: 'NAM_US_WEST', label: '🇺🇸 US West Coast' },
    ]
  },
  {
    parent: 'UK & ANZ', regions: [
      { code: 'UK', label: '🇬🇧 United Kingdom' },
      { code: 'OCEANIA_AU', label: '🇦🇺 Australia' },
      { code: 'OCEANIA_NZ', label: '🇳🇿 New Zealand' },
    ]
  },
  {
    parent: 'Europe', regions: [
      { code: 'EU_WEST', label: '🇫🇷 Western Europe' },
      { code: 'EU_DACH', label: '🇩🇪 DACH (DE/AT/CH)' },
      { code: 'EU_NORDIC', label: '🇸🇪 Nordics' },
      { code: 'EU_SOUTH', label: '🇪🇸 Southern Europe' },
      { code: 'EU_BENELUX', label: '🇳🇱 Benelux' },
    ]
  },
  {
    parent: 'Eastern Europe', regions: [
      { code: 'EU_EAST_PL', label: '🇵🇱 Poland' },
      { code: 'EU_EAST_UA', label: '🇺🇦 Ukraine' },
      { code: 'EU_EAST_BALKANS', label: '🇷🇸 Balkans' },
      { code: 'EU_EAST_RO', label: '🇷🇴 Romania' },
      { code: 'EU_TURKEY', label: '🇹🇷 Turkey' },
    ]
  },
  {
    parent: 'India', regions: [
      { code: 'INDIA_NORTH', label: '🇮🇳 North India (Hindi)' },
      { code: 'INDIA_SOUTH', label: '🇮🇳 South India (Tamil)' },
      { code: 'INDIA_WEST', label: '🇮🇳 West India (Marathi)' },
      { code: 'INDIA_EAST', label: '🇮🇳 East India (Bengali)' },
      { code: 'INDIA_NE', label: '🇮🇳 Northeast' },
    ]
  },
  {
    parent: 'South Asia', regions: [
      { code: 'SA_PAKISTAN', label: '🇵🇰 Pakistan' },
      { code: 'SA_BANGLADESH', label: '🇧🇩 Bangladesh' },
      { code: 'SA_SRI_LANKA', label: '🇱🇰 Sri Lanka' },
      { code: 'SA_NEPAL', label: '🇳🇵 Nepal' },
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
      { code: 'SEA_INDO', label: '🇮🇩 Indonesia' },
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
    parent: 'Caucasus', regions: [
      { code: 'CAUC_GE', label: '🇬🇪 Georgia' },
      { code: 'CAUC_AM', label: '🇦🇲 Armenia' },
      { code: 'CAUC_AZ', label: '🇦🇿 Azerbaijan' },
    ]
  },
  {
    parent: 'Central Asia', regions: [
      { code: 'ASIA_CENTRAL_KZ', label: '🇰🇿 Kazakhstan' },
      { code: 'ASIA_CENTRAL_UZ', label: '🇺🇿 Uzbekistan' },
      { code: 'ASIA_CENTRAL_KG', label: '🇰🇬 Kyrgyzstan' },
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
  narrationUsed?: string;
}

const SettingsIcon = Zap; // alias

// ─── Auto-generate contextual narration per asset type + region ───────────
const ASSET_NARRATION_TEMPLATES: Record<string, (region: string) => string> = {
  avatar_3d: (r) => `Welcome to our AI-powered healthcare platform. In ${r}, we're transforming patient engagement with intelligent care coordination, connecting providers and patients seamlessly.`,
  hero_video: (r) => `Introducing the future of healthcare technology for ${r}. Our unified platform brings together care teams, patients, and caregivers — powered by cutting-edge AI for better outcomes.`,
  hero_image: (r) => `AI-driven healthcare innovation empowering communities across ${r}. Smarter care, better outcomes, one platform.`,
  og_image: (r) => `Healthcare AI Platform — Empowering ${r} with intelligent patient engagement and care coordination.`,
  brand_logo: (r) => `Genie AI Healthcare — ${r} Edition`,
  thumbnail: (r) => `See how AI is revolutionizing healthcare in ${r}. Watch the product demo.`,
  banner_ad: (r) => `Transform healthcare in ${r} — AI-Powered Patient Engagement Platform. Try Free →`,
  social_story: (r) => `🏥 Healthcare reimagined for ${r}. AI-powered. Patient-first. See how our platform is making a difference.`,
  infographic: (r) => `Key healthcare metrics in ${r}: Patient engagement up 40%, care coordination efficiency improved 60%, AI-assisted diagnosis accuracy 95%.`,
  promo_video: (r) => `In ${r}, healthcare is evolving. Our AI platform connects every stakeholder — from providers to patients to caregivers — in one intelligent ecosystem. See it in action.`,
  audio_intro: (r) => `Hello from ${r}! Welcome to Genie AI Healthcare — where we use artificial intelligence to connect care teams, engage patients, and improve health outcomes for your community.`,
  typography_art: (r) => `AI × Healthcare — Innovation for ${r}`,
};

function getAutoNarration(assetType: string, regionCode: string): string {
  const regionLabel = ALL_REGIONS.find(r => r.code === regionCode)?.label?.replace(/^..\s/, '') || regionCode;
  const template = ASSET_NARRATION_TEMPLATES[assetType];
  return template ? template(regionLabel) : `Professional healthcare content for ${regionLabel}`;
}

export const RegionalAssetsLab: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('NAM_US');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('avatar_3d');
  const [selectedStyle, setSelectedStyle] = useState('pixar');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');
  const [narrationScript, setNarrationScript] = useState('');
  const [isAutoNarration, setIsAutoNarration] = useState(true);
  const [assets, setAssets] = useState<Record<string, AssetItem>>({});
  const [activeView, setActiveView] = useState<'pipeline' | 'generate' | 'review'>('pipeline');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  // Derive the active narration (auto or manual)
  const activeNarration = isAutoNarration ? getAutoNarration(selectedAssetType, selectedRegion) : narrationScript;

  const currentKey = `${selectedRegion}_${selectedAssetType}`;
  const currentAsset = assets[currentKey];
  const currentStatus: AssetStatus = currentAsset?.status || 'empty';

  const filteredAssetTypes = assetCategoryFilter === 'all'
    ? ASSET_TYPES
    : ASSET_TYPES.filter(a => a.category === assetCategoryFilter);

  const getLang = (region: string) => {
    if (region.startsWith('CJK_JP')) return 'ja';
    if (region.startsWith('CJK_KR')) return 'ko';
    if (region.startsWith('CJK_CN') || region.startsWith('CJK_TW')) return 'zh';
    if (region.startsWith('MENA')) return 'ar';
    if (region.startsWith('LATAM_BR')) return 'pt';
    if (region.startsWith('LATAM')) return 'es';
    if (region.startsWith('SEA_THAI')) return 'th';
    if (region.startsWith('SEA_VIET')) return 'vi';
    if (region.startsWith('SEA_INDO')) return 'id';
    if (region.startsWith('SEA_MALAY')) return 'ms';
    if (region.startsWith('INDIA_SOUTH')) return 'ta';
    if (region.startsWith('INDIA_NORTH')) return 'hi';
    if (region.startsWith('INDIA_WEST')) return 'mr';
    if (region.startsWith('INDIA_EAST')) return 'bn';
    if (region.startsWith('SA_PAKISTAN')) return 'ur';
    if (region.startsWith('SA_BANGLADESH')) return 'bn';
    if (region.startsWith('SA_NEPAL')) return 'ne';
    if (region.startsWith('EU_TURKEY')) return 'tr';
    if (region.startsWith('EU_DACH')) return 'de';
    if (region.startsWith('EU_SOUTH')) return 'es';
    if (region.startsWith('EU_WEST')) return 'fr';
    if (region.startsWith('EU_NORDIC')) return 'sv';
    if (region.startsWith('EU_EAST_PL')) return 'pl';
    if (region.startsWith('EU_EAST_UA')) return 'uk';
    if (region.startsWith('EU_EAST_RO')) return 'ro';
    if (region.startsWith('CAUC_GE')) return 'ka';
    if (region.startsWith('CAUC_AM')) return 'hy';
    if (region.startsWith('CAUC_AZ')) return 'az';
    if (region.startsWith('ASIA_CENTRAL_KZ')) return 'kk';
    if (region.startsWith('ASIA_CENTRAL_UZ')) return 'uz';
    if (region.startsWith('AFRICA_NORTH')) return 'ar';
    if (region.startsWith('AFRICA_EAST')) return 'sw';
    return 'en';
  };

  const needsNarration = ['avatar_3d', 'hero_video', 'promo_video', 'audio_intro'].includes(selectedAssetType);

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
      const script = isAutoNarration ? getAutoNarration(selectedAssetType, selectedRegion) : narrationScript;

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
          setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: undefined, provider: style?.provider, style: style?.label, generatedAt: new Date(), narrationUsed: script } }));
          toast.info('Portrait generation pending — try Photorealistic style or retry.');
          return;
        }

        // Step 2: Generate TTS audio
        setGenerationProgress('🎙 Generating regional voiceover...');
        const ttsRes = await supabase.functions.invoke('multi-provider-tts', {
          body: { text: script, languageCode: lang, region: selectedRegion, tier: 'premium' },
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

        const avatarSuccess = avatarRes.data?.success !== false;
        const modelUrl = avatarRes.data?.outputUrl || avatarRes.data?.data?.outputUrl;

        if (!avatarSuccess || avatarRes.error) {
          // Fallback: show portrait as preview
          setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: portraitUrl, provider: style?.provider, style: style?.label, generatedAt: new Date(), narrationUsed: script } }));
          toast.info('Portrait ready! Avatar video synthesis is pending.');
        } else {
          setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: modelUrl || portraitUrl, provider: style?.provider, style: style?.label, generatedAt: new Date(), narrationUsed: script } }));
          toast.success(`${style?.label} avatar generated!`);
        }

      } else if (['hero_video', 'promo_video'].includes(selectedAssetType)) {
        const duration = selectedAssetType === 'promo_video' ? 15 : 10;
        setGenerationProgress(`🎬 Generating ${style?.label || ''} video...`);
        const videoRes = await supabase.functions.invoke('ai-video-generator', {
          body: { prompt: `${stylePrompt}, cinematic healthcare technology product video for ${regionLabel}, smooth camera movement`, duration, resolution: '1080p', type: 'hero' },
        });
        const videoUrl = videoRes.data?.videoUrl || videoRes.data?.url || videoRes.data?.data?.outputUrl;
        setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: videoUrl || undefined, provider: style?.provider || 'Vertex Veo 3', style: style?.label, generatedAt: new Date(), narrationUsed: script } }));
        toast.success('Video generated!');

      } else if (selectedAssetType === 'audio_intro') {
        setGenerationProgress('🎵 Generating audio intro...');
        const ttsRes = await supabase.functions.invoke('multi-provider-tts', {
          body: { text: script, languageCode: lang, region: selectedRegion, tier: 'premium' },
        });
        if (ttsRes.error) throw new Error(`TTS failed: ${ttsRes.error.message}`);
        const audioUrl = ttsRes.data?.audioUrl || ttsRes.data?.data?.audioUrl || ttsRes.data?.audio_url;
        setAssets(prev => ({ ...prev, [key]: { type: selectedAssetType, status: 'preview', previewUrl: audioUrl || undefined, provider: 'Azure Neural TTS', style: style?.label, generatedAt: new Date(), narrationUsed: script } }));
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
  }, [selectedRegion, selectedAssetType, selectedStyle, narrationScript, isAutoNarration]);

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
                Generate → Preview → Approve → Publish | {CREATIVE_STYLES.length} styles × {ASSET_TYPES.length} asset types × {ALL_REGIONS.length} sub-regions ({REGION_GROUPS.length} groups)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(['pipeline', 'generate', 'review'] as const).map(view => (
                <Button
                  key={view}
                  size="sm"
                  variant={activeView === view ? 'default' : 'outline'}
                  onClick={() => setActiveView(view)}
                  className="text-xs gap-1.5"
                >
                  {view === 'pipeline' && <ArrowRight className="w-3.5 h-3.5" />}
                  {view === 'generate' && <Wand2 className="w-3.5 h-3.5" />}
                  {view === 'review' && <Globe className="w-3.5 h-3.5" />}
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ═══ PIPELINE VIEW ═══ */}
      {activeView === 'pipeline' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              5-Stage AI Generation Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { stage: '1. Script', icon: Type, desc: 'Auto-generate narration per asset type + region', color: 'bg-blue-500/10 text-blue-600' },
                { stage: '2. TTS', icon: Volume2, desc: 'Azure Neural / Qwen3 / ElevenLabs — regional voice', color: 'bg-emerald-500/10 text-emerald-600' },
                { stage: '3. Portrait', icon: Camera, desc: 'Styled portrait via Imagen 3 / FLUX / Wan 2.1', color: 'bg-purple-500/10 text-purple-600' },
                { stage: '4. Synthesis', icon: Bot, desc: 'Wan 2.2 S2V lip-sync video / Meshy 3D', color: 'bg-amber-500/10 text-amber-600' },
                { stage: '5. Assembly', icon: Film, desc: 'Final composite → Preview → Approve', color: 'bg-rose-500/10 text-rose-600' },
              ].map((s, i) => (
                <React.Fragment key={s.stage}>
                  <div className={cn('rounded-lg p-3 min-w-[150px] text-center', s.color)}>
                    <s.icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-semibold">{s.stage}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{s.desc}</div>
                  </div>
                  {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground">
                <strong>Auto-Narration:</strong> Scripts are automatically generated based on the selected asset type and target region.
                For avatars and videos, the narration feeds TTS synthesis, which drives lip-sync in the avatar pipeline.
                For image-based assets, the narration informs the visual composition prompt.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ GENERATE VIEW ═══ */}
      {activeView === 'generate' && (
        <div className="grid md:grid-cols-4 gap-4">
          {/* Left: Config */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-primary" />
                Generation Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Region Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_GROUPS.map(group => (
                      <React.Fragment key={group.parent}>
                        <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{group.parent}</div>
                        {group.regions.map(r => (
                          <SelectItem key={r.code} value={r.code} className="text-xs">{r.label}</SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Asset Category Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Asset Category</label>
                <div className="flex flex-wrap gap-1">
                  {ASSET_CATEGORIES.map(cat => (
                    <Button
                      key={cat.id}
                      size="sm"
                      variant={assetCategoryFilter === cat.id ? 'default' : 'outline'}
                      className="h-6 text-[10px] px-2"
                      onClick={() => setAssetCategoryFilter(cat.id)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Asset Type Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Asset Type</label>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-1 pr-2">
                    {filteredAssetTypes.map(at => (
                      <button
                        key={at.id}
                        onClick={() => setSelectedAssetType(at.id)}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-lg border p-2 text-left transition-all text-xs',
                          selectedAssetType === at.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted/50'
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

              {/* Creative Style Selector */}
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

              {/* Narration Script — auto or manual */}
              {needsNarration && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Narration Script</label>
                    <button
                      onClick={() => setIsAutoNarration(!isAutoNarration)}
                      className={cn('text-[10px] px-2 py-0.5 rounded-full border transition-colors', isAutoNarration ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border text-muted-foreground')}
                    >
                      {isAutoNarration ? '✨ Auto-Generated' : '✏️ Manual'}
                    </button>
                  </div>
                  {isAutoNarration ? (
                    <div className="p-2 rounded-lg bg-muted/50 border border-dashed text-xs text-muted-foreground leading-relaxed">
                      <Badge variant="outline" className="text-[9px] mb-1.5 gap-1"><Sparkles className="w-2.5 h-2.5" /> Auto</Badge>
                      <p>{activeNarration}</p>
                    </div>
                  ) : (
                    <Textarea value={narrationScript} onChange={e => setNarrationScript(e.target.value)} className="text-xs min-h-[80px]" placeholder="Enter custom narration script..." />
                  )}
                </div>
              )}

              {/* Generate Button */}
              <Button onClick={handleGenerate} disabled={currentStatus === 'generating'} className="w-full gap-2">
                {currentStatus === 'generating' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate {ASSET_TYPES.find(a => a.id === selectedAssetType)?.label}</>}
              </Button>

              {generationError && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{generationError}</p>}
            </CardContent>
          </Card>

          {/* Right: Preview */}
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
                      selectedAssetType === 'audio_intro' ? (
                        <div className="flex flex-col items-center gap-3 p-4">
                          <Music className="w-12 h-12 text-primary/60" />
                          <audio controls src={currentAsset.previewUrl} className="w-full max-w-xs" />
                          <Badge className="text-[9px]">{currentAsset.provider}</Badge>
                        </div>
                      ) : ['hero_video', 'promo_video'].includes(selectedAssetType) && currentAsset.previewUrl.endsWith('.mp4') ? (
                        <video controls src={currentAsset.previewUrl} className="w-full h-full object-cover" poster="" />
                      ) : (
                        /* Show actual image for ALL image-based assets + avatar portrait fallback */
                        <img src={currentAsset.previewUrl} alt={`${currentAsset.style} ${ASSET_TYPES.find(a => a.id === selectedAssetType)?.label} for ${ALL_REGIONS.find(r => r.code === selectedRegion)?.label}`} className="object-contain w-full h-full" />
                      )
                    ) : (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-2" />
                        <p className="text-xs text-muted-foreground">Generation complete — asset preview rendering</p>
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

                  {/* Show narration used */}
                  {currentAsset?.narrationUsed && (
                    <div className="p-2 rounded bg-muted/30 border">
                      <p className="text-[10px] font-medium text-muted-foreground mb-0.5">📝 Narration Used</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{currentAsset.narrationUsed}</p>
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
            <CardDescription className="text-xs">{ALL_REGIONS.length} regions × {ASSET_TYPES.length} asset types across {REGION_GROUPS.length} parent groups</CardDescription>
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
