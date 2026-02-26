/**
 * Regional Assets Lab
 * Generate → Preview → Approve → Publish pipeline for landing page assets.
 * Creative styles apply to ALL asset types. Extended asset & region coverage.
 * AI-generated narration via regional LLM routing (Qwen/Gemini/OpenAI/Claude).
 * Supports multi-selection for styles and asset types.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Video, Image, Globe, Volume2, Play, CheckCircle2,
  Eye, Wand2, RotateCcw, Send, Loader2, Bot, Film,
  Camera, Palette, Box, Mic, ArrowRight, BadgeCheck, Clock,
  Zap, Layers, Star, Layout, FileImage, Megaphone, Type,
  MonitorSmartphone, Figma, Music, Linkedin, Youtube, Twitter,
  MessageCircle, Mail, Headphones, Hash, Tv
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { REGION_LLM_ROUTING } from '@/config/regional-routing-registry';

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

// ─── Asset Types (20 types across 9 categories) ──────────────────────────
const ASSET_TYPES = [
  // Characters
  { id: 'avatar_3d', label: '3D Avatar', icon: Bot, category: 'characters', description: 'Animated character with lip-sync' },
  // Video
  { id: 'hero_video', label: 'Hero Video', icon: Film, category: 'video', description: 'Landing page hero background' },
  { id: 'promo_video', label: 'Promo Clip', icon: Video, category: 'video', description: '15s promotional video' },
  { id: 'youtube_intro', label: 'YouTube Intro', icon: Youtube, category: 'video', description: '5s branded YouTube intro' },
  // Images
  { id: 'hero_image', label: 'Hero Image', icon: Image, category: 'images', description: 'Landing page hero banner' },
  { id: 'thumbnail', label: 'Thumbnail', icon: Camera, category: 'images', description: 'Video/content thumbnail' },
  { id: 'infographic', label: 'Infographic', icon: Layers, category: 'images', description: 'Data visualization graphic' },
  { id: 'typography_art', label: 'Typography Art', icon: Type, category: 'images', description: 'Stylized text visual' },
  // Branding
  { id: 'og_image', label: 'OG Image', icon: MonitorSmartphone, category: 'branding', description: '1200×630 social preview' },
  { id: 'brand_logo', label: 'Brand Logo', icon: Figma, category: 'branding', description: 'Regional brand variant' },
  // Marketing
  { id: 'banner_ad', label: 'Banner Ad', icon: Layout, category: 'marketing', description: '728×90 display banner' },
  { id: 'email_header', label: 'Email Header', icon: Mail, category: 'marketing', description: '600×200 email banner' },
  // Social
  { id: 'social_story', label: 'Social Story', icon: FileImage, category: 'social', description: '1080×1920 IG/FB story' },
  { id: 'linkedin_post', label: 'LinkedIn Post', icon: Linkedin, category: 'social', description: '1200×627 LinkedIn image' },
  { id: 'linkedin_banner', label: 'LinkedIn Banner', icon: Linkedin, category: 'social', description: '1584×396 company banner' },
  { id: 'youtube_thumbnail', label: 'YouTube Thumbnail', icon: Youtube, category: 'social', description: '1280×720 video thumbnail' },
  { id: 'x_post', label: 'X / Twitter Post', icon: Twitter, category: 'social', description: '1200×675 post image' },
  { id: 'whatsapp_status', label: 'WhatsApp Status', icon: MessageCircle, category: 'social', description: '1080×1920 status image' },
  // Audio
  { id: 'audio_intro', label: 'Audio Intro', icon: Mic, category: 'audio', description: 'Regional audio greeting' },
  { id: 'podcast_cover', label: 'Podcast Cover', icon: Headphones, category: 'audio', description: '3000×3000 podcast art' },
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

// ─── All 15 Parent Regions → 55+ Sub-Regions ─────────────────────────────
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
  llmProvider?: string;
  llmModel?: string;
}

// ─── Region → LLM zone mapping ──────────────────────────────────────────
function getRegionLLMZone(regionCode: string): string {
  if (regionCode.startsWith('NAM')) return 'nam';
  if (regionCode === 'UK' || regionCode.startsWith('OCEANIA')) return 'oceania';
  if (regionCode.startsWith('EU_TURKEY')) return 'turkey';
  if (regionCode.startsWith('EU_EAST')) return 'eastern_europe';
  if (regionCode.startsWith('EU')) return 'eu';
  if (regionCode.startsWith('INDIA')) return 'india';
  if (regionCode === 'SA_PAKISTAN') return 'pakistan';
  if (regionCode === 'SA_BANGLADESH') return 'bangladesh';
  if (regionCode.startsWith('SA_')) return 'india';
  if (regionCode.startsWith('MENA')) return 'mena';
  if (regionCode.startsWith('CJK')) return 'cjk';
  if (regionCode.startsWith('SEA')) return 'sea';
  if (regionCode.startsWith('LATAM_CARIB')) return 'caribbean';
  if (regionCode.startsWith('LATAM')) return 'latam';
  if (regionCode.startsWith('AFRICA')) return 'africa';
  if (regionCode.startsWith('CAUC')) return 'eastern_europe';
  if (regionCode.startsWith('ASIA_CENTRAL')) return 'central_asia';
  return 'nam';
}

function getRegionLLMInfo(regionCode: string): { provider: string; model: string; displayName: string } {
  const zone = getRegionLLMZone(regionCode);
  const route = REGION_LLM_ROUTING[zone] || REGION_LLM_ROUTING['nam'];
  const displayNames: Record<string, string> = {
    anthropic: 'Claude (Anthropic)',
    alibaba: 'Qwen Max (Alibaba)',
    gemini: 'Gemini Pro (Google)',
    openai: 'GPT-4o (OpenAI)',
  };
  return {
    provider: route.provider,
    model: route.model,
    displayName: displayNames[route.provider] || route.provider,
  };
}

// ─── Asset-specific messaging context for LLM prompt ────────────────────
const ASSET_MESSAGING_CONTEXT: Record<string, { purpose: string; positioning: string; tone: string }> = {
  avatar_3d: { purpose: 'Welcome narration for landing page 3D avatar with lip-sync', positioning: 'Innovative AI healthcare platform', tone: 'Warm, professional, inviting' },
  hero_video: { purpose: 'Landing page hero video narration', positioning: 'Industry-leading healthcare technology', tone: 'Cinematic, confident, inspiring' },
  hero_image: { purpose: 'Hero banner headline/tagline copy', positioning: 'Transformative digital health', tone: 'Bold, concise, impactful' },
  og_image: { purpose: 'Social sharing preview text', positioning: 'Trusted healthcare AI platform', tone: 'Clear, professional' },
  brand_logo: { purpose: 'Brand tagline for regional variant', positioning: 'Local healthcare innovation', tone: 'Memorable, short' },
  thumbnail: { purpose: 'Video/content thumbnail text overlay', positioning: 'Must-see healthcare demo', tone: 'Attention-grabbing, curiosity-driven' },
  banner_ad: { purpose: 'Display ad copy with CTA', positioning: 'Healthcare AI solution', tone: 'Action-oriented, urgent' },
  social_story: { purpose: 'Instagram/Facebook story narration', positioning: 'Healthcare reimagined', tone: 'Casual, engaging, emoji-friendly' },
  infographic: { purpose: 'Data-driven infographic narration', positioning: 'Evidence-based healthcare outcomes', tone: 'Authoritative, data-focused' },
  promo_video: { purpose: '15-second promotional video script', positioning: 'Quick product showcase', tone: 'Dynamic, fast-paced, exciting' },
  audio_intro: { purpose: 'Audio greeting for regional visitors', positioning: 'Welcoming healthcare platform', tone: 'Warm, friendly, professional' },
  typography_art: { purpose: 'Stylized typographic headline', positioning: 'AI meets healthcare', tone: 'Artistic, minimal' },
  youtube_intro: { purpose: '5-second branded YouTube channel intro', positioning: 'Healthcare tech thought leader', tone: 'Energetic, branded' },
  email_header: { purpose: 'Email campaign header text', positioning: 'Healthcare updates & insights', tone: 'Professional, trustworthy' },
  linkedin_post: { purpose: 'LinkedIn thought leadership post image', positioning: 'Enterprise healthcare AI', tone: 'Professional, insightful' },
  linkedin_banner: { purpose: 'LinkedIn company page banner', positioning: 'Corporate healthcare identity', tone: 'Corporate, aspirational' },
  youtube_thumbnail: { purpose: 'YouTube video thumbnail', positioning: 'Must-watch healthcare content', tone: 'Click-worthy, bold' },
  x_post: { purpose: 'X/Twitter post image', positioning: 'Healthcare innovation update', tone: 'Concise, trending, shareable' },
  whatsapp_status: { purpose: 'WhatsApp status update image', positioning: 'Healthcare community update', tone: 'Personal, conversational' },
  podcast_cover: { purpose: 'Podcast cover art with title', positioning: 'Healthcare AI podcast', tone: 'Polished, distinctive' },
};

const SettingsIcon = Zap;

export const RegionalAssetsLab: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('NAM_US');
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>(['avatar_3d']);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['pixar']);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');
  const [narrationScript, setNarrationScript] = useState('');
  const [isAutoNarration, setIsAutoNarration] = useState(true);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [generatedNarration, setGeneratedNarration] = useState('');
  const [assets, setAssets] = useState<Record<string, AssetItem>>({});
  const [activeView, setActiveView] = useState<'pipeline' | 'generate' | 'review'>('pipeline');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  // Primary selections for preview (first selected)
  const primaryAssetType = selectedAssetTypes[0] || 'avatar_3d';
  const primaryStyle = selectedStyles[0] || 'pixar';

  const currentKey = `${selectedRegion}_${primaryAssetType}`;
  const currentAsset = assets[currentKey];
  const currentStatus: AssetStatus = currentAsset?.status || 'empty';

  const llmInfo = getRegionLLMInfo(selectedRegion);

  const filteredAssetTypes = assetCategoryFilter === 'all'
    ? ASSET_TYPES
    : ASSET_TYPES.filter(a => a.category === assetCategoryFilter);

  const toggleAssetType = (id: string) => {
    setSelectedAssetTypes(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(x => x !== id) : prev) : [...prev, id]
    );
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(x => x !== id) : prev) : [...prev, id]
    );
  };

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

  const needsNarration = (assetType: string) =>
    ['avatar_3d', 'hero_video', 'promo_video', 'audio_intro', 'youtube_intro'].includes(assetType);

  // ─── AI-Powered Narration Generation via Regional LLM ─────────────────
  const generateAINarration = useCallback(async () => {
    setIsGeneratingNarration(true);
    try {
      const regionLabel = ALL_REGIONS.find(r => r.code === selectedRegion)?.label?.replace(/^..\s/, '') || selectedRegion;
      const assetTypeLabel = ASSET_TYPES.find(a => a.id === primaryAssetType)?.label || primaryAssetType;
      const messaging = ASSET_MESSAGING_CONTEXT[primaryAssetType] || ASSET_MESSAGING_CONTEXT['hero_image'];
      const zone = getRegionLLMZone(selectedRegion);
      const route = REGION_LLM_ROUTING[zone] || REGION_LLM_ROUTING['nam'];

      const prompt = `Generate a narration script for a "${assetTypeLabel}" asset targeting the "${regionLabel}" region.

Purpose: ${messaging.purpose}
Positioning: ${messaging.positioning}
Desired Tone: ${messaging.tone}
Target Region: ${regionLabel}
Language Context: The narration should feel culturally relevant to ${regionLabel}.

Requirements:
- Keep it under 200 words for video/avatar narration, under 50 words for images/banners
- Use the Hook → Problem → Solution → CTA framework
- Make it specific to healthcare AI technology
- Reference the region naturally, not forced
- Output ONLY the narration text, no explanations`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: route.provider,
          model: route.model,
          prompt,
          systemPrompt: `You are an expert marketing copywriter specializing in healthcare technology. You create regionally-tailored narration scripts that feel authentic and culturally appropriate. Tone: ${messaging.tone}. Purpose: ${messaging.purpose}.`,
          temperature: 0.7,
          maxTokens: 500,
        },
      });

      if (error) throw error;
      const content = data?.content || data?.text || '';
      setGeneratedNarration(content);
      setNarrationScript(content);
      toast.success(`Narration generated via ${llmInfo.displayName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Narration generation failed';
      toast.error(msg);
    } finally {
      setIsGeneratingNarration(false);
    }
  }, [selectedRegion, primaryAssetType, llmInfo.displayName]);

  // Derive the active narration
  const activeNarration = isAutoNarration
    ? (generatedNarration || `Click "Generate Script" to create AI-powered narration via ${llmInfo.displayName}`)
    : narrationScript;

  const handleGenerate = useCallback(async () => {
    setGenerationError(null);

    // Batch: generate for all selected asset types × styles
    for (const assetType of selectedAssetTypes) {
      for (const styleId of selectedStyles) {
        const key = `${selectedRegion}_${assetType}`;
        setAssets(prev => ({ ...prev, [key]: { type: assetType, status: 'generating' } }));

        try {
          const { data: authData } = await supabase.auth.getSession();
          if (!authData.session?.access_token) {
            throw new Error('Please log in first to generate assets.');
          }

          const style = CREATIVE_STYLES.find(s => s.id === styleId);
          const regionLabel = ALL_REGIONS.find(r => r.code === selectedRegion)?.label || selectedRegion;
          const lang = getLang(selectedRegion);
          const stylePrompt = style?.promptHint || '';
          const script = isAutoNarration ? (generatedNarration || `Healthcare AI platform content for ${regionLabel}`) : narrationScript;

          if (assetType === 'avatar_3d') {
            setGenerationProgress(`🎨 Generating ${style?.label} portrait...`);
            const portraitRes = await supabase.functions.invoke('ai-image-generator', {
              body: {
                prompt: `${stylePrompt}, professional character portrait, front-facing bust shot, clean background, high quality for ${regionLabel}`,
                width: 1024, height: 1024, style: style?.id || 'photorealistic',
              },
            });
            const portraitUrl = portraitRes.data?.imageUrl || portraitRes.data?.url || portraitRes.data?.data?.url;
            if (!portraitUrl) {
              setAssets(prev => ({ ...prev, [key]: { type: assetType, status: 'preview', previewUrl: undefined, provider: style?.provider, style: style?.label, generatedAt: new Date(), narrationUsed: script, llmProvider: llmInfo.provider, llmModel: llmInfo.model } }));
              toast.info('Portrait generation pending — try Photorealistic style or retry.');
              continue;
            }

            setGenerationProgress('🎙 Generating regional voiceover...');
            const ttsRes = await supabase.functions.invoke('multi-provider-tts', {
              body: { text: script, languageCode: lang, region: selectedRegion, tier: 'premium' },
            });
            const audioUrl = ttsRes.data?.audioUrl || ttsRes.data?.data?.audioUrl || ttsRes.data?.audio_url;

            setGenerationProgress(`🤖 Creating ${style?.label} avatar video...`);
            const avatarRes = await supabase.functions.invoke('alibaba-avatar-generator', {
              body: {
                model: 'wan2.2-s2v', sourceImage: portraitUrl,
                ...(audioUrl && { audioUrl }),
                prompt: `${stylePrompt}, regional character for ${regionLabel}`,
                perspective: 'bust', duration: 10, fps: 30, resolution: '1080p',
              },
            });

            const modelUrl = avatarRes.data?.outputUrl || avatarRes.data?.data?.outputUrl;
            setAssets(prev => ({ ...prev, [key]: { type: assetType, status: 'preview', previewUrl: modelUrl || portraitUrl, provider: style?.provider, style: style?.label, generatedAt: new Date(), narrationUsed: script, llmProvider: llmInfo.provider, llmModel: llmInfo.model } }));
            toast.success(`${style?.label} avatar generated!`);

          } else if (['hero_video', 'promo_video', 'youtube_intro'].includes(assetType)) {
            const duration = assetType === 'youtube_intro' ? 5 : assetType === 'promo_video' ? 15 : 10;
            setGenerationProgress(`🎬 Generating ${style?.label} video...`);
            const videoRes = await supabase.functions.invoke('ai-video-generator', {
              body: { prompt: `${stylePrompt}, cinematic healthcare technology product video for ${regionLabel}`, duration, resolution: '1080p', type: 'hero' },
            });
            const videoUrl = videoRes.data?.videoUrl || videoRes.data?.url || videoRes.data?.data?.outputUrl;
            setAssets(prev => ({ ...prev, [key]: { type: assetType, status: 'preview', previewUrl: videoUrl || undefined, provider: style?.provider || 'Vertex Veo 3', style: style?.label, generatedAt: new Date(), narrationUsed: script, llmProvider: llmInfo.provider, llmModel: llmInfo.model } }));
            toast.success('Video generated!');

          } else if (assetType === 'audio_intro') {
            setGenerationProgress('🎵 Generating audio intro...');
            const ttsRes = await supabase.functions.invoke('multi-provider-tts', {
              body: { text: script, languageCode: lang, region: selectedRegion, tier: 'premium' },
            });
            if (ttsRes.error) throw new Error(`TTS failed: ${ttsRes.error.message}`);
            const audioUrl = ttsRes.data?.audioUrl || ttsRes.data?.data?.audioUrl || ttsRes.data?.audio_url;
            setAssets(prev => ({ ...prev, [key]: { type: assetType, status: 'preview', previewUrl: audioUrl || undefined, provider: 'Azure Neural TTS', style: style?.label, generatedAt: new Date(), narrationUsed: script, llmProvider: llmInfo.provider, llmModel: llmInfo.model } }));
            toast.success('Audio intro generated!');

          } else {
            const dims: Record<string, [number, number]> = {
              hero_image: [1920, 1080], og_image: [1200, 630], brand_logo: [512, 512],
              thumbnail: [640, 360], banner_ad: [728, 90], social_story: [1080, 1920],
              infographic: [800, 1200], typography_art: [1200, 600],
              email_header: [600, 200], linkedin_post: [1200, 627],
              linkedin_banner: [1584, 396], youtube_thumbnail: [1280, 720],
              x_post: [1200, 675], whatsapp_status: [1080, 1920],
              podcast_cover: [3000, 3000],
            };
            const [w, h] = dims[assetType] || [1024, 1024];
            const typeLabel = ASSET_TYPES.find(a => a.id === assetType)?.label || 'Image';
            setGenerationProgress(`🎨 Generating ${style?.label} ${typeLabel}...`);

            const imgRes = await supabase.functions.invoke('ai-image-generator', {
              body: { prompt: `${stylePrompt}, professional healthcare ${typeLabel.toLowerCase()} for ${regionLabel}, modern design`, width: w, height: h, style: style?.id || 'photorealistic' },
            });
            const imgUrl = imgRes.data?.imageUrl || imgRes.data?.url || imgRes.data?.data?.url;
            setAssets(prev => ({ ...prev, [key]: { type: assetType, status: 'preview', previewUrl: imgUrl || undefined, provider: style?.provider || 'Vertex Imagen 3', style: style?.label, generatedAt: new Date(), llmProvider: llmInfo.provider, llmModel: llmInfo.model } }));
            toast.success(`${typeLabel} generated!`);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Generation failed';
          setGenerationError(msg);
          setAssets(prev => ({ ...prev, [key]: { type: assetType, status: 'empty' } }));
          toast.error(msg);
        }
      }
    }
    setGenerationProgress('');
  }, [selectedRegion, selectedAssetTypes, selectedStyles, narrationScript, isAutoNarration, generatedNarration, llmInfo]);

  const handleApprove = useCallback(() => {
    const key = `${selectedRegion}_${primaryAssetType}`;
    setAssets(prev => ({ ...prev, [key]: { ...prev[key], status: 'approved' } }));
    toast.success('Asset approved! Ready to publish.');
  }, [selectedRegion, primaryAssetType]);

  const handlePublish = useCallback(() => {
    const key = `${selectedRegion}_${primaryAssetType}`;
    setAssets(prev => ({ ...prev, [key]: { ...prev[key], status: 'published' } }));
    toast.success('Published to regional landing page! 🚀');
  }, [selectedRegion, primaryAssetType]);

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
            <div className="flex items-center gap-2">
              {/* LLM Provider Badge */}
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5">
                <Zap className="w-3 h-3" /> {llmInfo.displayName}
              </Badge>
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
                { stage: '1. Script', icon: Type, desc: `LLM narration via ${llmInfo.displayName}`, color: 'bg-blue-500/10 text-blue-600' },
                { stage: '2. TTS', icon: Volume2, desc: 'Azure Neural / Qwen3 / ElevenLabs', color: 'bg-emerald-500/10 text-emerald-600' },
                { stage: '3. Portrait', icon: Camera, desc: 'Styled portrait via Imagen 3 / FLUX / Wan', color: 'bg-purple-500/10 text-purple-600' },
                { stage: '4. Synthesis', icon: Bot, desc: 'Wan 2.2 S2V lip-sync / Meshy 3D', color: 'bg-amber-500/10 text-amber-600' },
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
                <strong>Regional LLM Routing:</strong> Narration scripts are generated by the region's assigned LLM provider
                ({llmInfo.displayName} for {ALL_REGIONS.find(r => r.code === selectedRegion)?.label}).
                Messaging, positioning, and tone are tailored per asset type to ensure alignment between script, visuals, and TTS output.
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
                {/* LLM Provider indicator */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge variant="outline" className="text-[9px] gap-1">
                    <Zap className="w-2.5 h-2.5" /> LLM: {llmInfo.displayName}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] text-muted-foreground">{llmInfo.model}</Badge>
                </div>
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

              {/* Asset Type Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Asset Types <span className="text-primary">({selectedAssetTypes.length} selected)</span></label>
                  <button
                    onClick={() => setSelectedAssetTypes(filteredAssetTypes.map(a => a.id))}
                    className="text-[10px] text-primary hover:underline"
                  >Select All</button>
                </div>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-1 pr-2">
                    {filteredAssetTypes.map(at => {
                      const isSelected = selectedAssetTypes.includes(at.id);
                      return (
                        <button
                          key={at.id}
                          onClick={() => toggleAssetType(at.id)}
                          className={cn(
                            'w-full flex items-center gap-2 rounded-lg border p-2 text-left transition-all text-xs',
                            isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted/50'
                          )}
                        >
                          <div className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40')}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <at.icon className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{at.label}</div>
                            <div className="text-[10px] text-muted-foreground">{at.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Creative Style Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Creative Styles <span className="text-primary">({selectedStyles.length} selected)</span></label>
                  <button
                    onClick={() => setSelectedStyles(CREATIVE_STYLES.map(s => s.id))}
                    className="text-[10px] text-primary hover:underline"
                  >Select All</button>
                </div>
                <ScrollArea className="h-[160px]">
                  <div className="grid grid-cols-2 gap-1.5 pr-2">
                    {CREATIVE_STYLES.map(style => {
                      const isSelected = selectedStyles.includes(style.id);
                      return (
                        <button
                          key={style.id}
                          onClick={() => toggleStyle(style.id)}
                          className={cn(
                            'rounded-lg border p-2 text-left transition-all text-xs bg-gradient-to-br relative',
                            style.gradient, style.border,
                            isSelected && 'ring-2 ring-primary'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            </div>
                          )}
                          <span className="text-lg">{style.emoji}</span>
                          <div className="text-[10px] font-semibold mt-0.5">{style.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Narration Script — AI-powered or manual */}
              {selectedAssetTypes.some(needsNarration) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Narration Script</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsAutoNarration(!isAutoNarration)}
                        className={cn('text-[10px] px-2 py-0.5 rounded-full border transition-colors', isAutoNarration ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border text-muted-foreground')}
                      >
                        {isAutoNarration ? '✨ AI-Powered' : '✏️ Manual'}
                      </button>
                    </div>
                  </div>
                  {isAutoNarration ? (
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-muted/50 border border-dashed text-xs leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Badge variant="outline" className="text-[9px] gap-1"><Sparkles className="w-2.5 h-2.5" /> AI Script</Badge>
                          <Badge variant="outline" className="text-[9px] gap-1 text-muted-foreground"><Zap className="w-2.5 h-2.5" /> {llmInfo.displayName}</Badge>
                        </div>
                        <p className="text-muted-foreground">{activeNarration}</p>
                        {ASSET_MESSAGING_CONTEXT[primaryAssetType] && (
                          <div className="mt-2 pt-2 border-t border-dashed flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="text-[8px]">📌 {ASSET_MESSAGING_CONTEXT[primaryAssetType].positioning}</Badge>
                            <Badge variant="secondary" className="text-[8px]">🎭 {ASSET_MESSAGING_CONTEXT[primaryAssetType].tone}</Badge>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={generateAINarration}
                        disabled={isGeneratingNarration}
                        className="w-full text-xs gap-2"
                      >
                        {isGeneratingNarration ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating via {llmInfo.displayName}...</>
                        ) : (
                          <><Wand2 className="w-3.5 h-3.5" /> Generate Script via {llmInfo.displayName}</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Textarea value={narrationScript} onChange={e => setNarrationScript(e.target.value)} className="text-xs min-h-[80px]" placeholder="Enter custom narration script..." />
                  )}
                </div>
              )}

              {/* Batch Summary */}
              {(selectedAssetTypes.length > 1 || selectedStyles.length > 1) && (
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-[10px] font-medium text-accent-foreground">
                    📦 Batch: {selectedAssetTypes.length} asset type{selectedAssetTypes.length > 1 ? 's' : ''} × {selectedStyles.length} style{selectedStyles.length > 1 ? 's' : ''} = {selectedAssetTypes.length * selectedStyles.length} generations
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <Button onClick={handleGenerate} disabled={currentStatus === 'generating'} className="w-full gap-2">
                {currentStatus === 'generating' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Generate {selectedAssetTypes.length > 1 ? `${selectedAssetTypes.length} Assets` : ASSET_TYPES.find(a => a.id === primaryAssetType)?.label}</>
                )}
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
                  <p className="text-xs text-muted-foreground/70 mt-1">Select region, asset type(s) & creative style(s), then Generate</p>
                </div>
              )}

              {currentStatus === 'generating' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <Sparkles className="w-12 h-12 text-primary mb-3" />
                  </motion.div>
                  <p className="text-sm font-medium">AI Pipeline Active</p>
                  <p className="text-xs text-muted-foreground mt-1">{generationProgress || 'Processing...'}</p>
                  <div className="flex gap-1.5 mt-3">
                    <Badge variant="outline" className="text-[10px]">{CREATIVE_STYLES.find(s => s.id === primaryStyle)?.label}</Badge>
                    <Badge variant="outline" className="text-[10px] gap-1"><Zap className="w-2.5 h-2.5" /> {llmInfo.displayName}</Badge>
                  </div>
                </div>
              )}

              {(currentStatus === 'preview' || currentStatus === 'approved' || currentStatus === 'published') && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 overflow-hidden aspect-video flex items-center justify-center relative">
                    {currentAsset?.previewUrl ? (
                      primaryAssetType === 'audio_intro' ? (
                        <div className="flex flex-col items-center gap-3 p-4">
                          <Music className="w-12 h-12 text-primary/60" />
                          <audio controls src={currentAsset.previewUrl} className="w-full max-w-xs" />
                          <Badge className="text-[9px]">{currentAsset.provider}</Badge>
                        </div>
                      ) : ['hero_video', 'promo_video', 'youtube_intro'].includes(primaryAssetType) && currentAsset.previewUrl.endsWith('.mp4') ? (
                        <video controls src={currentAsset.previewUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={currentAsset.previewUrl} alt={`${currentAsset.style} ${ASSET_TYPES.find(a => a.id === primaryAssetType)?.label}`} className="object-contain w-full h-full" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Visual Provider</span>
                        <span className="font-medium">{currentAsset.provider}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">LLM Provider</span>
                        <span className="font-medium">{currentAsset.llmProvider ? getRegionLLMInfo(selectedRegion).displayName : '—'}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Style</span>
                        <span className="font-medium">{currentAsset.style || '—'}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Region</span>
                        <span className="font-medium">{ALL_REGIONS.find(r => r.code === selectedRegion)?.label}</span>
                      </div>
                    </div>
                  )}

                  {currentAsset?.narrationUsed && (
                    <div className="p-2 rounded bg-muted/30 border">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[10px] font-medium text-muted-foreground">📝 Narration Used</p>
                        <Badge variant="outline" className="text-[8px]">{getRegionLLMInfo(selectedRegion).displayName}</Badge>
                      </div>
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
                                  <button onClick={() => { setSelectedRegion(region.code); setSelectedAssetTypes([at.id]); setActiveView('generate'); }} className="inline-flex items-center gap-0.5">
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
