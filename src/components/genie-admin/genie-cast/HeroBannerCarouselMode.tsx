/**
 * Hero Banner Carousel Mode — Asset-Composed Edition
 * Each of 4 slides composes MULTIPLE asset types from the Regional Assets Lab
 * with rich Genie Suite messaging (products, industries, AI stats, demos).
 * 
 * Slide 1: Regional Identity → 3D Avatar + Hero Image + Brand Logo + Product Lineup
 * Slide 2: AI Pipeline → Hero Video/Infographic + Provider Map + Pipeline Stats  
 * Slide 3: Language Coverage → Typography Art + TTS Demo + Script Samples
 * Slide 4: Transcreation → Promo Clip + Social Previews + Before/After
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Globe, Eye, Wand2, Loader2, CheckCircle2,
  ArrowRight, BadgeCheck, Zap, ChevronLeft, ChevronRight,
  Image, Layers, Languages, Palette, Users, Play, Mic,
  Video, Box, BarChart3, Cpu, Monitor, MessageSquare,
  Lightbulb, GraduationCap, Building2, Heart, Briefcase, Star,
  RotateCcw, type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { REGION_LLM_ROUTING } from '@/config/regional-routing-registry';

// ─── GENIE SUITE PRODUCT LINEUP (logos loaded from brand-assets bucket) ───
interface GenieProduct {
  name: string;
  desc: string;
  logoUrl?: string;
}

const PRODUCT_IDS = ['spark', 'mind', 'vibe', 'deck', 'hub', 'cast', 'ask-genie'] as const;

// ─── AI PLATFORM STATS ──────────────────────────────────────────────────
const PLATFORM_STATS = [
  { value: '19', label: 'AI Providers', icon: Cpu },
  { value: '206', label: 'Pipelines', icon: Zap },
  { value: '50+', label: 'Languages', icon: Languages },
  { value: '140+', label: 'Dialects', icon: Mic },
  { value: '434+', label: 'Templates', icon: Layers },
  { value: '55+', label: 'Regions', icon: Globe },
];

// ─── INDUSTRY VERTICALS (shared constant) ───────────────────────────────
import { getVerticalShortLabels } from '@/constants/industryVerticals';
const INDUSTRY_VERTICALS = getVerticalShortLabels();

// ─── 12 CREATIVE STYLES (full Asset Lab set) ────────────────────────────
const CREATIVE_STYLES = [
  { id: 'photorealistic', label: 'Photorealistic', emoji: '📸' },
  { id: 'pixar', label: 'Pixar 3D', emoji: '🎬' },
  { id: 'anime', label: 'Anime/Ghibli', emoji: '🌸' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆' },
  { id: 'watercolor', label: 'Watercolor', emoji: '🎨' },
  { id: 'crayon', label: 'Crayon', emoji: '🖍️' },
  { id: 'claymation', label: 'Claymation', emoji: '🧱' },
  { id: 'comic', label: 'Comic', emoji: '💥' },
  { id: 'pop_art', label: 'Pop Art', emoji: '🎯' },
  { id: 'isometric', label: 'Isometric 3D', emoji: '🔷' },
  { id: 'stained_glass', label: 'Stained Glass', emoji: '🪟' },
  { id: 'ukiyoe', label: 'Ukiyo-e', emoji: '🏯' },
];

// ─── ASSET TYPES per slide (from the 20-type Asset Lab) ─────────────────
type AssetComposition = {
  primary: string;
  secondary: string[];
  description: string;
};

// ─── 4 HERO SLIDE CONFIGS — each uses DIFFERENT asset combinations ──────
export const HERO_BANNER_SLIDES = [
  {
    id: 'identity' as const,
    label: 'Regional Identity',
    icon: Globe,
    color: 'from-blue-600/20 to-cyan-500/10 border-blue-500/30',
    badgeColor: 'bg-blue-500',
    assets: {
      primary: '3D Avatar',
      secondary: ['Hero Image', 'Brand Logo', 'OG Image'],
      description: 'Regional 3D character + cultural hero visual + branded logo overlay',
    } as AssetComposition,
    genieContent: {
      focus: '7-Product Lineup',
      showProducts: true,
      showIndustries: true,
      showStats: false,
      showDemo: false,
    },
    purpose: 'Brand trust — Genie Suite as your regional AI content platform',
    positioning: 'Mind to Media: 7 AI products for any industry, any language',
    tone: 'Welcoming, empowering, culturally authentic',
    promptContext: `Create a hero banner headline for Genie Suite — the "Mind to Media" AI platform.
Focus: Introduce all 7 products (Spark, Mind, Vibe, Deck, Hub, Cast, Ask Genie).
Show how Genie Suite supports ANY industry with AI-powered content creation.
Include a regional 3D avatar character representing the local market.
The banner should feel premium, culturally authentic, and showcase the full product ecosystem.`,
    headline_hint: 'Genie Suite platform introduction with product lineup',
    cta_hint: 'Explore Genie Suite',
  },
  {
    id: 'pipeline' as const,
    label: 'AI Pipeline',
    icon: Layers,
    color: 'from-purple-600/20 to-violet-500/10 border-purple-500/30',
    badgeColor: 'bg-purple-500',
    assets: {
      primary: 'Infographic',
      secondary: ['Hero Video', 'Typography Art', 'Banner Ad'],
      description: 'Pipeline infographic + provider visualization + animated flow',
    } as AssetComposition,
    genieContent: {
      focus: 'AI Stats & Providers',
      showProducts: false,
      showIndustries: false,
      showStats: true,
      showDemo: true,
    },
    purpose: 'Technical credibility — 19 providers, 206 pipelines, multi-modal AI',
    positioning: '19 AI Providers orchestrated into 206 production pipelines',
    tone: 'Confident, innovative, technically impressive',
    promptContext: `Create a hero banner headline showcasing the AI pipeline powering Genie Suite.
Stats to highlight: 19 AI Providers, 206 Pipelines, 434+ Templates.
Providers include: Google Vertex (Veo 3, Imagen 3), OpenAI (GPT-4o, DALL-E), Anthropic (Claude), 
Azure Neural TTS, Alibaba (Qwen, Wan Video), ElevenLabs, DeepSeek, and more.
Show the multi-modal pipeline: Text → Script → Voice → Video → Distribution.
The banner should feel like a futuristic AI command center with provider logos and data flows.`,
    headline_hint: 'AI pipeline stats and provider showcase',
    cta_hint: 'See the Pipeline',
  },
  {
    id: 'languages' as const,
    label: 'Language Coverage',
    icon: Languages,
    color: 'from-emerald-600/20 to-teal-500/10 border-emerald-500/30',
    badgeColor: 'bg-emerald-500',
    assets: {
      primary: 'Typography Art',
      secondary: ['Audio Intro', 'YouTube Thumbnail', 'Social Stories'],
      description: 'Multi-script typography + TTS voice samples + social proof',
    } as AssetComposition,
    genieContent: {
      focus: 'Language Scale',
      showProducts: false,
      showIndustries: false,
      showStats: true,
      showDemo: true,
    },
    purpose: 'Localization proof — 50+ languages, 140+ dialects, native TTS',
    positioning: 'Every language. Every dialect. Native voice, not robotic translation.',
    tone: 'Inclusive, comprehensive, globally-minded',
    promptContext: `Create a hero banner headline for Genie Suite's language coverage.
Stats: 50+ Languages (BCP47), 140+ Regional Dialects, 15 Parent Regions, 55+ Sub-Regions.
Show multi-script text (Arabic, Hindi, Chinese, Japanese, Korean alongside English).
Highlight TTS capabilities: Azure Neural voices, Qwen3-TTS, ElevenLabs for natural speech.
Include audio waveform visualization to suggest voice generation.
The banner should celebrate linguistic diversity with script samples from multiple writing systems.`,
    headline_hint: 'Language diversity and TTS capabilities',
    cta_hint: 'Try Your Language',
  },
  {
    id: 'transcreation' as const,
    label: 'Transcreation',
    icon: Palette,
    color: 'from-amber-600/20 to-orange-500/10 border-amber-500/30',
    badgeColor: 'bg-amber-500',
    assets: {
      primary: 'Promo Clip',
      secondary: ['LinkedIn Post', 'Social Stories', 'WhatsApp Status'],
      description: 'Cultural adaptation showcase + social media previews + before/after',
    } as AssetComposition,
    genieContent: {
      focus: 'Cultural Depth',
      showProducts: true,
      showIndustries: true,
      showStats: false,
      showDemo: true,
    },
    purpose: 'Cultural depth — transcreation not translation, authentic local voice',
    positioning: 'AI-powered cultural adaptation for any industry, any market',
    tone: 'Sophisticated, authentic, culturally nuanced',
    promptContext: `Create a hero banner headline for Genie Suite's transcreation capabilities.
Key message: "Not Translation — Transcreation". Show the difference.
Demonstrate how content adapts culturally: same healthcare video in English vs Arabic (RTL) vs Hindi.
Include social media format previews (LinkedIn, Instagram Stories, WhatsApp Status) 
showing the same message transcreated for different cultures.
Show before (generic translation) vs after (cultural transcreation) comparison.
The banner should prove that Genie Suite understands culture, not just language.`,
    headline_hint: 'Transcreation vs translation differentiation',
    cta_hint: 'Experience Transcreation',
  },
] as const;

type SlideId = typeof HERO_BANNER_SLIDES[number]['id'];

// ─── Parent regions ─────────────────────────────────────────────────────
const PARENT_REGIONS = [
  { code: 'NAM', label: '🇺🇸 North America', subCount: 2 },
  { code: 'WESTERN', label: '🇪🇺 Europe', subCount: 15 },
  { code: 'MENA', label: '🇸🇦 MENA', subCount: 5 },
  { code: 'INDIA', label: '🇮🇳 India', subCount: 12 },
  { code: 'CJK', label: '🇯🇵 CJK', subCount: 4 },
  { code: 'SEA', label: '🇹🇭 Southeast Asia', subCount: 5 },
  { code: 'AFRICA', label: '🌍 Africa', subCount: 5 },
  { code: 'LATAM', label: '🇧🇷 LATAM', subCount: 5 },
  { code: 'CARIBBEAN', label: '🏝️ Caribbean', subCount: 2 },
  { code: 'OCEANIA', label: '🇦🇺 Oceania', subCount: 2 },
  { code: 'PAKISTAN', label: '🇵🇰 Pakistan', subCount: 1 },
  { code: 'BANGLADESH', label: '🇧🇩 Bangladesh', subCount: 1 },
  { code: 'TURKEY', label: '🇹🇷 Turkey', subCount: 1 },
];

interface SlideAsset {
  slideId: SlideId;
  status: 'empty' | 'generating' | 'preview' | 'approved';
  headline?: string;
  subheadline?: string;
  cta?: string;
  imageUrl?: string;
  llmProvider?: string;
  styleUsed?: string;
  assetTypes?: string[];
}

interface RegionCarousel {
  regionCode: string;
  slides: SlideAsset[];
  overallStatus: 'empty' | 'partial' | 'complete' | 'approved';
}

// ─── LLM zone resolver ──────────────────────────────────────────────────
function getRegionLLMZone(regionCode: string): string {
  if (regionCode.startsWith('NAM') || regionCode === 'NAM') return 'nam';
  if (regionCode.startsWith('EU_') || regionCode === 'WESTERN') return 'western';
  if (regionCode.startsWith('INDIA') || regionCode === 'INDIA') return 'india';
  if (regionCode.startsWith('CJK') || regionCode === 'CJK') return 'cjk';
  if (regionCode.startsWith('MENA') || regionCode === 'MENA') return 'mena';
  if (regionCode.startsWith('SEA') || regionCode === 'SEA') return 'sea';
  if (regionCode.startsWith('LATAM') || regionCode === 'LATAM') return 'latam';
  if (regionCode.startsWith('AFRICA') || regionCode === 'AFRICA') return 'africa';
  if (regionCode.startsWith('CARIBBEAN') || regionCode === 'CARIBBEAN') return 'caribbean';
  if (regionCode.startsWith('SA_PAKISTAN') || regionCode === 'PAKISTAN') return 'pakistan';
  if (regionCode.startsWith('SA_BANGLADESH') || regionCode === 'BANGLADESH') return 'india';
  if (regionCode.startsWith('OCEANIA') || regionCode === 'OCEANIA') return 'nam';
  if (regionCode === 'TURKEY' || regionCode.startsWith('EU_TURKEY')) return 'western';
  return 'nam';
}

function getLLMInfo(regionCode: string) {
  const zone = getRegionLLMZone(regionCode);
  const route = REGION_LLM_ROUTING[zone] || REGION_LLM_ROUTING['nam'];
  const names: Record<string, string> = {
    anthropic: 'Claude (Anthropic)', alibaba: 'Qwen Max (Alibaba)',
    gemini: 'Gemini Pro (Google)', openai: 'GPT-4o (OpenAI)',
  };
  return { provider: route.provider, model: route.model, displayName: names[route.provider] || route.provider };
}

// ─── COMPONENT ──────────────────────────────────────────────────────────
export const HeroBannerCarouselMode: React.FC = () => {
  const [primaryStyle, setPrimaryStyle] = useState('photorealistic');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['photorealistic']);
  const [regionCarousels, setRegionCarousels] = useState<Record<string, RegionCarousel>>({});
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptOverrides, setScriptOverrides] = useState<Record<string, Partial<Record<SlideId, string>>>>({});
  const [genieProducts, setGenieProducts] = useState<GenieProduct[]>([]);
  const [productLogosLoaded, setProductLogosLoaded] = useState(false);

  // Load product logos from brand-assets bucket
  useEffect(() => {
    const loadProductLogos = async () => {
      try {
        const { data: brandFiles } = await supabase.storage
          .from('brand-assets')
          .list('', { limit: 50 });

        const products: GenieProduct[] = [
          { name: 'Spark', desc: 'AI-Powered Ideation' },
          { name: 'Mind', desc: 'Script Writing & Enhancement' },
          { name: 'Vibe', desc: 'Recording Studio & Teleprompter' },
          { name: 'Deck', desc: 'AI Presentation Generation' },
          { name: 'Hub', desc: 'Your Creative Command Center' },
          { name: 'Cast', desc: 'Make It. Show It. Scale It.' },
          { name: 'Ask Genie', desc: 'Conversational AI Assistant' },
        ];

        if (brandFiles) {
          for (const product of products) {
            const logoFile = brandFiles.find(f => 
              f.name?.includes('logo') && 
              f.name?.toLowerCase().includes(product.name.toLowerCase().replace(/\s+/g, '-'))
            );
            if (logoFile) {
              const { data } = supabase.storage.from('brand-assets').getPublicUrl(logoFile.name);
              product.logoUrl = data.publicUrl;
            }
          }
        }

        setGenieProducts(products);
        setProductLogosLoaded(true);
      } catch (error) {
        console.error('Failed to load product logos:', error);
        setProductLogosLoaded(true);
      }
    };

    loadProductLogos();
  }, []);

  const toggleStyle = (id: string) => {
    if (id === primaryStyle) return; // Can't remove primary
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const setPrimary = (id: string) => {
    setPrimaryStyle(id);
    setSelectedStyles(prev => prev.includes(id) ? prev : [id, ...prev]);
  };

  const getOrCreateCarousel = (regionCode: string): RegionCarousel => {
    return regionCarousels[regionCode] || {
      regionCode,
      slides: HERO_BANNER_SLIDES.map(s => ({ slideId: s.id, status: 'empty' as const })),
      overallStatus: 'empty' as const,
    };
  };

  // Generate all 4 composed slides for a parent region
  const generateRegionCarousel = useCallback(async (regionCode: string) => {
    if (selectedStyles.length === 0) {
      toast.error('Select at least one creative style');
      return;
    }
    setIsGenerating(true);
    setActiveRegion(regionCode);
    const llm = getLLMInfo(regionCode);
    const regionLabel = PARENT_REGIONS.find(r => r.code === regionCode)?.label?.replace(/^.\s/, '') || regionCode;
    const activeStyle = primaryStyle;

    // Initialize as generating
    setRegionCarousels(prev => ({
      ...prev,
      [regionCode]: {
        regionCode,
        slides: HERO_BANNER_SLIDES.map(s => ({ slideId: s.id, status: 'generating' as const })),
        overallStatus: 'partial' as const,
      },
    }));

    const completedSlides: SlideAsset[] = [];

    for (let i = 0; i < HERO_BANNER_SLIDES.length; i++) {
      const slide = HERO_BANNER_SLIDES[i];
      setActiveSlideIndex(i);

      try {
        const override = scriptOverrides[regionCode]?.[slide.id];

        let headline = '', subheadline = '', cta = '';

        if (override) {
          headline = override;
          subheadline = '';
          cta = slide.cta_hint;
        } else {
          const { data: llmData, error: llmError } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              provider: llm.provider, model: llm.model,
              prompt: `${slide.promptContext}

Target region: ${regionLabel}
Creative style: ${primaryStyle}
Asset types used: ${slide.assets.primary} (lead) + ${slide.assets.secondary.join(', ')} (supporting)

Output as JSON:
{
  "headline": "${slide.headline_hint} — max 10 words, impactful, mentions Genie Suite",
  "subheadline": "Supporting text — max 25 words, include key stats or product names",
  "cta": "${slide.cta_hint} — max 4 words"
}

Output ONLY valid JSON.`,
              systemPrompt: `You are a premium brand copywriter for Genie Suite — the "Mind to Media" AI platform. 
Genie Suite has 7 products: Spark, Mind, Vibe, Deck, Hub, Cast, Ask Genie.
Platform stats: 19 AI Providers, 206 Pipelines, 50+ Languages, 140+ Dialects, 434+ Templates.
It supports ANY industry: Healthcare, Finance, EdTech, Tourism, Legal, and 50+ more.
Tone: ${slide.tone}. Write copy that sells the platform's capabilities, not just describes them.`,
              temperature: 0.7, maxTokens: 250,
            },
          });

          if (llmError) throw llmError;
          const content = llmData?.content || llmData?.text || '';

          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              headline = parsed.headline || '';
              subheadline = parsed.subheadline || '';
              cta = parsed.cta || slide.cta_hint;
            } else {
              headline = content.substring(0, 80);
              cta = slide.cta_hint;
            }
          } catch {
            headline = content.substring(0, 80);
            cta = slide.cta_hint;
          }
        }

        // Generate composed banner image
        const styleObj = CREATIVE_STYLES.find(s => s.id === primaryStyle);
        const { data: imgData } = await supabase.functions.invoke('ai-image-generator', {
          body: {
            prompt: `${styleObj?.label || 'Photorealistic'} style, ultra-premium hero banner for ${regionLabel}.
${slide.assets.description}.
Include visual elements: ${slide.assets.primary} as the main focal point, with ${slide.assets.secondary.join(', ')} as supporting elements.
${slide.genieContent.showProducts ? 'Show subtle product icons for 7 Genie Suite products.' : ''}
${slide.genieContent.showStats ? 'Include data visualization: 19 AI Providers, 206 Pipelines.' : ''}
${slide.genieContent.showDemo ? 'Show a mini UI preview or demo screen.' : ''}
${slide.genieContent.showIndustries ? 'Include industry icons: healthcare, finance, education.' : ''}
Modern premium design, wide 16:9 aspect ratio, rich composition with multiple layered elements.`,
            width: 1920, height: 1080, style: primaryStyle,
          },
        });
        const imageUrl = imgData?.imageUrl || imgData?.url || imgData?.data?.url;

        const slideAsset: SlideAsset = {
          slideId: slide.id, status: 'preview',
          headline, subheadline, cta, imageUrl,
          llmProvider: llm.displayName, styleUsed: styleObj?.label,
          assetTypes: [slide.assets.primary, ...slide.assets.secondary],
        };
        completedSlides.push(slideAsset);

        setRegionCarousels(prev => {
          const existing = prev[regionCode] || { regionCode, slides: [], overallStatus: 'partial' as const };
          const slides = HERO_BANNER_SLIDES.map((s, idx) => {
            if (idx < completedSlides.length) return completedSlides[idx];
            return existing.slides[idx] || { slideId: s.id, status: 'generating' as const };
          });
          return { ...prev, [regionCode]: { ...existing, slides, overallStatus: 'partial' } };
        });

        toast.success(`Slide ${i + 1}/4: ${slide.label} composed`);
      } catch (err) {
        completedSlides.push({ slideId: slide.id, status: 'empty' });
        toast.error(`Slide ${i + 1} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    setRegionCarousels(prev => ({
      ...prev,
      [regionCode]: {
        regionCode, slides: completedSlides,
        overallStatus: completedSlides.every(s => s.status === 'preview') ? 'complete' : 'partial',
      },
    }));
    setIsGenerating(false);
  }, [selectedStyles, scriptOverrides]);

  const approveRegion = useCallback((regionCode: string) => {
    setRegionCarousels(prev => {
      const carousel = prev[regionCode];
      if (!carousel) return prev;
      return {
        ...prev,
        [regionCode]: {
          ...carousel,
          slides: carousel.slides.map(s => ({ ...s, status: 'approved' as const })),
          overallStatus: 'approved' as const,
        },
      };
    });
    toast.success(`${PARENT_REGIONS.find(r => r.code === regionCode)?.label} approved!`);
  }, []);

  const activeCarousel = activeRegion ? getOrCreateCarousel(activeRegion) : null;
  const activeSlide = activeCarousel?.slides[activeSlideIndex];
  const activeSlideConfig = HERO_BANNER_SLIDES[activeSlideIndex];

  return (
    <div className="space-y-4">
      {/* ═══ HEADER + STYLE SELECTOR ═══ */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Hero Banner Composer
                <Badge variant="outline" className="text-[10px] ml-2">Asset Lab Integrated</Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                4 slides × 13 regions | Each slide = unique asset composition + Genie Suite messaging
              </CardDescription>
            </div>
          </div>
          {/* Primary + Alternate creative styles */}
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">🎨 Primary Style</p>
              <Badge variant="outline" className="text-[9px]">
                {CREATIVE_STYLES.find(s => s.id === primaryStyle)?.emoji} {CREATIVE_STYLES.find(s => s.id === primaryStyle)?.label}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CREATIVE_STYLES.map(s => {
                const isPrimary = s.id === primaryStyle;
                const isAlternate = selectedStyles.includes(s.id) && !isPrimary;
                return (
                  <button
                    key={s.id}
                    onClick={() => setPrimary(s.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] border transition-all relative',
                      isPrimary
                        ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30'
                        : isAlternate
                          ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                          : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                    )}
                  >
                    {isPrimary && <Star className="w-2.5 h-2.5 inline mr-0.5 fill-current" />}
                    {s.emoji} {s.label}
                  </button>
                );
              })}
            </div>
            {/* Alternate styles (quick-swap after generation) */}
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[10px] text-muted-foreground font-medium">🔄 Alternates (quick-swap)</p>
              <div className="flex flex-wrap gap-1">
                {CREATIVE_STYLES.filter(s => s.id !== primaryStyle).map(s => {
                  const selected = selectedStyles.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleStyle(s.id)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] border transition-all',
                        selected
                          ? 'bg-accent/50 text-accent-foreground border-accent/50'
                          : 'bg-transparent text-muted-foreground border-border/50 hover:bg-muted/30'
                      )}
                    >
                      {s.emoji} {selected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ═══ ASSET COMPOSITION MAP ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Slide Asset Composition — What Each Slide Contains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {HERO_BANNER_SLIDES.map((slide, i) => {
              const SlideIcon = slide.icon;
              return (
                <div key={slide.id} className={cn('rounded-xl border p-3 bg-gradient-to-br', slide.color)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold', slide.badgeColor)}>
                      {i + 1}
                    </div>
                    <h4 className="text-xs font-bold">{slide.label}</h4>
                  </div>

                  {/* Lead Asset */}
                  <div className="mb-2">
                    <Badge variant="outline" className="text-[9px] gap-1 mb-1">
                      <Box className="w-2.5 h-2.5" /> Lead: {slide.assets.primary}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {slide.assets.secondary.map(a => (
                        <Badge key={a} variant="secondary" className="text-[8px]">{a}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Genie Content Tags */}
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                    {slide.genieContent.showProducts && (
                      <Badge className="text-[8px] bg-primary/20 text-primary border-0">7 Products</Badge>
                    )}
                    {slide.genieContent.showStats && (
                      <Badge className="text-[8px] bg-purple-500/20 text-purple-600 border-0">AI Stats</Badge>
                    )}
                    {slide.genieContent.showIndustries && (
                      <Badge className="text-[8px] bg-amber-500/20 text-amber-600 border-0">Industries</Badge>
                    )}
                    {slide.genieContent.showDemo && (
                      <Badge className="text-[8px] bg-cyan-500/20 text-cyan-600 border-0">Demo Preview</Badge>
                    )}
                  </div>

                  <p className="text-[9px] text-muted-foreground mt-2 line-clamp-2">{slide.purpose}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══ PARENT REGION GRID ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Parent Regions — Click to Generate Composed Banners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {PARENT_REGIONS.map(region => {
              const carousel = regionCarousels[region.code];
              const status = carousel?.overallStatus || 'empty';
              const completedCount = carousel?.slides.filter(s => s.status === 'preview' || s.status === 'approved').length || 0;
              const llm = getLLMInfo(region.code);

              return (
                <button
                  key={region.code}
                  onClick={() => { setActiveRegion(region.code); setActiveSlideIndex(0); }}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all hover:shadow-md',
                    activeRegion === region.code && 'ring-2 ring-primary',
                    status === 'approved' && 'border-emerald-500/50 bg-emerald-500/5',
                    status === 'complete' && 'border-blue-500/50 bg-blue-500/5',
                    status === 'empty' && 'border-border hover:bg-muted/50',
                  )}
                >
                  <div className="text-sm font-medium">{region.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{llm.displayName}</div>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[0, 1, 2, 3].map(idx => (
                      <div
                        key={idx}
                        className={cn(
                          'w-3 h-1.5 rounded-full',
                          carousel?.slides[idx]?.status === 'approved' ? 'bg-emerald-500' :
                          carousel?.slides[idx]?.status === 'preview' ? 'bg-blue-500' :
                          carousel?.slides[idx]?.status === 'generating' ? 'bg-amber-500 animate-pulse' :
                          'bg-muted-foreground/20'
                        )}
                      />
                    ))}
                    <span className="text-[9px] text-muted-foreground ml-1">{completedCount}/4</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">{region.subCount} sub-regions</div>
                  {status === 'approved' && <Badge className="text-[8px] mt-1 bg-emerald-500">✓ Approved</Badge>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══ ACTIVE REGION — COMPOSED PREVIEW ═══ */}
      {activeRegion && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                {PARENT_REGIONS.find(r => r.code === activeRegion)?.label} — Composed Hero Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Zap className="w-2.5 h-2.5" /> {getLLMInfo(activeRegion).displayName}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  🎨 {selectedStyles.length} style{selectedStyles.length > 1 ? 's' : ''}
                </Badge>
                {activeCarousel?.overallStatus === 'complete' && (
                  <Button size="sm" onClick={() => approveRegion(activeRegion)} className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve All 4
                  </Button>
                )}
                {activeCarousel?.overallStatus !== 'approved' && (
                  <Button size="sm" onClick={() => generateRegionCarousel(activeRegion)} disabled={isGenerating} className="text-xs gap-1">
                    {isGenerating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Composing...</>
                    ) : (
                      <><Wand2 className="w-3.5 h-3.5" /> Compose 4 Slides</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Slide tabs */}
            <div className="flex gap-1.5">
              {HERO_BANNER_SLIDES.map((slide, i) => {
                const slideData = activeCarousel?.slides[i];
                const SlideIcon = slide.icon;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(i)}
                    className={cn(
                      'flex-1 rounded-lg border p-2 text-left transition-all text-xs bg-gradient-to-br',
                      slide.color,
                      activeSlideIndex === i && 'ring-2 ring-primary shadow-md',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <SlideIcon className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[11px]">{slide.label}</span>
                      {slideData?.status === 'preview' && <CheckCircle2 className="w-3 h-3 text-blue-500 ml-auto" />}
                      {slideData?.status === 'approved' && <BadgeCheck className="w-3 h-3 text-emerald-500 ml-auto" />}
                      {slideData?.status === 'generating' && <Loader2 className="w-3 h-3 text-amber-500 animate-spin ml-auto" />}
                    </div>
                    <div className="text-[9px] mt-0.5 opacity-75">Lead: {slide.assets.primary}</div>
                  </button>
                );
              })}
            </div>

            {/* ═══ COMPOSED BANNER MOCKUP ═══ */}
            <div className="rounded-xl border overflow-hidden bg-card relative">
              <div className="aspect-[16/9] max-h-[420px] relative flex items-center justify-center overflow-hidden">
                {activeSlide?.imageUrl ? (
                  <img src={activeSlide.imageUrl} alt={`${activeSlideConfig?.label} composed banner`} className="w-full h-full object-cover" />
                ) : activeSlide?.status === 'generating' ? (
                  <div className="flex flex-col items-center text-muted-foreground bg-gradient-to-br from-muted/50 to-muted/20 w-full h-full justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                      <Sparkles className="w-10 h-10 mb-2 text-primary" />
                    </motion.div>
                    <span className="text-sm font-medium">Composing {activeSlideConfig?.label}...</span>
                    <span className="text-[10px] mt-1">
                      Generating: {activeSlideConfig?.assets.primary} + {activeSlideConfig?.assets.secondary.join(' + ')}
                    </span>
                  </div>
                ) : (
                  /* Empty state — show what this slide WILL contain */
                  <div className="w-full h-full bg-gradient-to-br from-muted/30 to-muted/10 flex flex-col items-center justify-center p-6">
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-3', activeSlideConfig?.badgeColor)}>
                      {activeSlideConfig && <activeSlideConfig.icon className="w-7 h-7 text-white" />}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{activeSlideConfig?.label}</p>
                    <p className="text-[11px] text-muted-foreground text-center max-w-md mb-3">{activeSlideConfig?.assets.description}</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <Badge variant="outline" className="text-[9px]">🎯 {activeSlideConfig?.assets.primary}</Badge>
                      {activeSlideConfig?.assets.secondary.map(a => (
                        <Badge key={a} variant="secondary" className="text-[9px]">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ RICH TEXT + PRODUCT OVERLAY ═══ */}
                {activeSlide?.headline && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex">
                    <div className="p-6 md:p-8 max-w-lg flex flex-col justify-center">
                      <Badge className={cn('text-[10px] w-fit mb-2', activeSlideConfig?.badgeColor)}>
                        {activeSlideConfig?.label}
                      </Badge>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2">
                        {activeSlide.headline}
                      </h1>
                      {activeSlide.subheadline && (
                        <p className="text-sm text-white/80 mb-3">{activeSlide.subheadline}</p>
                      )}

                      {/* Genie Suite Product Logos (Slide 1 & 4) */}
                      {activeSlideConfig?.genieContent.showProducts && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-white/50 font-medium">🧠 Genie Suite</span>
                          </div>
                          <div className="flex gap-2">
                            <TooltipProvider delayDuration={200}>
                              {genieProducts.map(p => (
                                <Tooltip key={p.name}>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center cursor-default">
                                      <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center p-1">
                                        {p.logoUrl ? (
                                          <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" />
                                        ) : (
                                          <span className="text-[9px] text-white/40 font-bold">{p.name.charAt(0)}</span>
                                        )}
                                      </div>
                                      <span className="text-[7px] text-white/60 mt-0.5 font-medium">{p.name}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="text-[10px]">
                                    <p className="font-semibold">{p.name}</p>
                                    <p className="text-muted-foreground">{p.desc}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </TooltipProvider>
                          </div>
                        </div>
                      )}

                      {/* AI Stats (Slide 2 & 3) */}
                      {activeSlideConfig?.genieContent.showStats && (
                        <div className="flex gap-3 mb-3">
                          {PLATFORM_STATS.slice(0, 4).map(stat => (
                            <div key={stat.label} className="text-center">
                              <div className="text-lg font-bold text-white">{stat.value}</div>
                              <div className="text-[8px] text-white/60">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Industry Tags (Slide 1 & 4) */}
                      {activeSlideConfig?.genieContent.showIndustries && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {INDUSTRY_VERTICALS.slice(0, 6).map(ind => (
                            <Badge key={ind} variant="outline" className="text-[8px] text-white/80 border-white/20 bg-white/5">
                              {ind}
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-[8px] text-white/60 border-white/15">+44 more</Badge>
                        </div>
                      )}

                      {/* CTA */}
                      {activeSlide.cta && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground w-fit">
                          {activeSlide.cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      )}
                    </div>

                    {/* Right side — Demo preview hint (Slide 2, 3, 4) */}
                    {activeSlideConfig?.genieContent.showDemo && (
                      <div className="hidden lg:flex flex-col justify-center items-center flex-1 pr-8">
                        <div className="w-48 h-32 rounded-xl border border-white/20 bg-white/5 backdrop-blur flex flex-col items-center justify-center">
                          <Play className="w-8 h-8 text-white/40 mb-1" />
                          <span className="text-[10px] text-white/50">Interactive Demo</span>
                          <span className="text-[8px] text-white/30 mt-0.5">Try Deck • Video • TTS</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Slide nav dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70" onClick={() => setActiveSlideIndex(i => Math.max(0, i - 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {HERO_BANNER_SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setActiveSlideIndex(i)} className={cn('w-8 h-1.5 rounded-full transition-colors', i === activeSlideIndex ? 'bg-white' : 'bg-white/30')} />
                  ))}
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70" onClick={() => setActiveSlideIndex(i => Math.min(3, i + 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Asset type badges */}
                {activeSlide?.assetTypes && (
                  <div className="absolute top-3 left-3 flex gap-1">
                    {activeSlide.assetTypes.map(a => (
                      <Badge key={a} className="text-[8px] bg-black/60 text-white border-0 backdrop-blur">{a}</Badge>
                    ))}
                  </div>
                )}

                {activeSlide?.status === 'approved' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-500 text-white text-[10px] gap-1"><BadgeCheck className="w-3 h-3" /> Approved</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ 4-SLIDE THUMBNAIL STRIP ═══ */}
            <div className="grid grid-cols-4 gap-2">
              {HERO_BANNER_SLIDES.map((slide, i) => {
                const slideData = activeCarousel?.slides[i];
                const SlideIcon = slide.icon;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(i)}
                    className={cn(
                      'rounded-lg border overflow-hidden transition-all',
                      activeSlideIndex === i && 'ring-2 ring-primary',
                    )}
                  >
                    <div className="aspect-video relative bg-muted/50">
                      {slideData?.imageUrl ? (
                        <img src={slideData.imageUrl} className="w-full h-full object-cover" alt={slide.label} />
                      ) : (
                        <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br', slide.color)}>
                          <SlideIcon className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                      {slideData?.headline && (
                        <div className="absolute inset-0 bg-black/60 flex items-end p-1.5">
                          <span className="text-[8px] text-white font-medium line-clamp-2">{slideData.headline}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 text-[9px] font-medium text-center">{slide.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Detail panels */}
            {activeSlideConfig && (
              <div className="grid md:grid-cols-2 gap-3">
                {/* Composition + Context */}
                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <h4 className="text-xs font-semibold flex items-center gap-1.5">
                    <activeSlideConfig.icon className="w-3.5 h-3.5" />
                    {activeSlideConfig.label} — Composition
                  </h4>
                  <div className="space-y-1 text-[10px]">
                    <div><span className="text-muted-foreground">Lead Asset:</span> {activeSlideConfig.assets.primary}</div>
                    <div><span className="text-muted-foreground">Supporting:</span> {activeSlideConfig.assets.secondary.join(', ')}</div>
                    <div><span className="text-muted-foreground">Content Focus:</span> {activeSlideConfig.genieContent.focus}</div>
                    <div><span className="text-muted-foreground">Tone:</span> {activeSlideConfig.tone}</div>
                  </div>
                  {activeSlide?.llmProvider && (
                    <Badge variant="outline" className="text-[9px] gap-1"><Zap className="w-2.5 h-2.5" /> {activeSlide.llmProvider}</Badge>
                  )}
                  {activeSlide?.styleUsed && (
                    <Badge variant="outline" className="text-[9px] gap-1"><Palette className="w-2.5 h-2.5" /> {activeSlide.styleUsed}</Badge>
                  )}
                  {/* Alternate style quick-swap */}
                  {activeSlide?.status === 'preview' && selectedStyles.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-[9px] text-muted-foreground mb-1 font-medium flex items-center gap-1">
                        <RotateCcw className="w-2.5 h-2.5" /> Quick-swap to alternate style
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedStyles.filter(s => s !== primaryStyle).map(altId => {
                          const altStyle = CREATIVE_STYLES.find(s => s.id === altId);
                          return altStyle ? (
                            <Button
                              key={altId}
                              size="sm"
                              variant="outline"
                              className="text-[9px] h-6 px-2 gap-1"
                              onClick={() => {
                                setPrimary(altId);
                                toast.info(`Switched to ${altStyle.label} — regenerate to apply`);
                              }}
                            >
                              {altStyle.emoji} {altStyle.label}
                            </Button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Script Override */}
                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <h4 className="text-xs font-semibold">✏️ Manual Override</h4>
                  <Textarea
                    value={scriptOverrides[activeRegion]?.[activeSlideConfig.id] || ''}
                    onChange={e => {
                      const slideId = activeSlideConfig.id;
                      setScriptOverrides(prev => ({
                        ...prev,
                        [activeRegion]: { ...(prev[activeRegion] || {}), [slideId]: e.target.value },
                      }));
                    }}
                    className="text-xs min-h-[60px]"
                    placeholder={`Override headline for ${activeSlideConfig.label}...`}
                  />
                </div>
              </div>
            )}

            {/* Sub-region expansion */}
            {activeCarousel?.overallStatus === 'approved' && (
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Ready to Expand to Sub-Regions
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {PARENT_REGIONS.find(r => r.code === activeRegion)?.subCount} sub-regions will receive transcreated versions
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                    <ArrowRight className="w-3.5 h-3.5" /> Expand to Sub-Regions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ PROGRESS SUMMARY ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Generation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
            {PARENT_REGIONS.map(region => {
              const carousel = regionCarousels[region.code];
              const done = carousel?.slides.filter(s => s.status !== 'empty' && s.status !== 'generating').length || 0;
              return (
                <div key={region.code} className="p-2 rounded-lg border text-xs">
                  <div className="font-medium truncate">{region.label}</div>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={cn(
                        'w-4 h-1.5 rounded-full',
                        carousel?.slides[i]?.status === 'approved' ? 'bg-emerald-500' :
                        carousel?.slides[i]?.status === 'preview' ? 'bg-blue-500' :
                        'bg-muted-foreground/15'
                      )} />
                    ))}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{done}/4</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroBannerCarouselMode;
