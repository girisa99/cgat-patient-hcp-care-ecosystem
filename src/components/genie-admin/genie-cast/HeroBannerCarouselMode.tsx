/**
 * Hero Banner Carousel Mode
 * Generates 4 hero banner slides per region, each with DISTINCT messaging context.
 * Mirrors the live landing page structure: Identity → Pipeline → Languages → Transcreation.
 * Parent-first workflow: generate at parent level, approve, then expand to sub-regions.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Globe, Eye, Wand2, Loader2, CheckCircle2, Clock,
  ArrowRight, BadgeCheck, Send, RotateCcw, Zap, ChevronLeft,
  ChevronRight, Image, Layers, Languages, Palette, Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { REGION_LLM_ROUTING } from '@/config/regional-routing-registry';

// ─── 4 Hero Slide Messaging Contexts (each is a DIFFERENT story) ─────────
export const HERO_BANNER_SLIDES = [
  {
    id: 'identity',
    label: 'Regional Identity',
    icon: Globe,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    purpose: 'Brand trust and cultural alignment for the region',
    positioning: 'Genie Suite as a locally-relevant, culturally-aware AI platform',
    tone: 'Warm, welcoming, culturally authentic',
    promptContext: 'Hero banner showcasing regional identity, cultural connection, and local healthcare values',
    headline_hint: 'Welcome / trust-building headline',
    cta_hint: 'Get Started / Explore',
  },
  {
    id: 'pipeline',
    label: 'AI Pipeline',
    icon: Layers,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    purpose: 'Technical credibility — showcase the multi-provider AI pipeline',
    positioning: '19 AI providers powering end-to-end content production',
    tone: 'Confident, innovative, technically impressive',
    promptContext: 'Hero banner showcasing AI pipeline, multi-provider orchestration, and technical capability',
    headline_hint: 'Technology / capability headline',
    cta_hint: 'See How It Works',
  },
  {
    id: 'languages',
    label: 'Language Coverage',
    icon: Languages,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    purpose: 'Localization proof — demonstrate language and dialect coverage',
    positioning: '50+ languages, 140+ dialects with native TTS and transcreation',
    tone: 'Inclusive, comprehensive, globally-minded',
    promptContext: 'Hero banner highlighting language support, native voices, and regional dialect coverage',
    headline_hint: 'Language / accessibility headline',
    cta_hint: 'Try Your Language',
  },
  {
    id: 'transcreation',
    label: 'Transcreation',
    icon: Palette,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    purpose: 'Cultural depth — show transcreation beyond translation',
    positioning: 'AI-powered cultural adaptation, not just word-for-word translation',
    tone: 'Sophisticated, authentic, culturally nuanced',
    promptContext: 'Hero banner demonstrating cultural transcreation, regional messaging adaptation, and authentic local voice',
    headline_hint: 'Cultural adaptation headline',
    cta_hint: 'Experience Transcreation',
  },
] as const;

type SlideId = typeof HERO_BANNER_SLIDES[number]['id'];

// ─── Parent regions for parent-first workflow ────────────────────────────
const PARENT_REGIONS = [
  { code: 'NAM', label: '🇺🇸 North America', subRegions: ['NAM_US', 'NAM_CA'] },
  { code: 'WESTERN', label: '🇪🇺 Europe', subRegions: ['EU_WEST_FR', 'EU_WEST_NL', 'EU_WEST_BE', 'EU_DACH_DE', 'EU_DACH_AT', 'EU_DACH_CH', 'EU_SOUTH_ES', 'EU_SOUTH_IT', 'EU_SOUTH_PT', 'EU_SOUTH_GR', 'EU_NORDIC_SE', 'EU_NORDIC_NO', 'EU_NORDIC_DK', 'EU_NORDIC_FI', 'EU_EAST_PL'] },
  { code: 'MENA', label: '🇸🇦 MENA', subRegions: ['MENA_GULF', 'MENA_LEVANT', 'MENA_EGYPT', 'MENA_MAGHREB', 'MENA_IRAQ'] },
  { code: 'INDIA', label: '🇮🇳 India', subRegions: ['INDIA_NORTH_HI', 'INDIA_SOUTH_TA', 'INDIA_SOUTH_TE', 'INDIA_SOUTH_KN', 'INDIA_SOUTH_ML', 'INDIA_WEST_MR', 'INDIA_WEST_GU', 'INDIA_EAST_BN', 'INDIA_EAST_OR', 'INDIA_CENTRAL_UR', 'INDIA_NORTH_PA', 'INDIA_NORTH_NE'] },
  { code: 'CJK', label: '🇯🇵 CJK', subRegions: ['CJK_JP', 'CJK_KR', 'CJK_CN', 'CJK_TW'] },
  { code: 'SEA', label: '🇹🇭 Southeast Asia', subRegions: ['SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_PHIL', 'SEA_PAN'] },
  { code: 'AFRICA', label: '🌍 Africa', subRegions: ['AFRICA_NORTH', 'AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_CENTRAL'] },
  { code: 'LATAM', label: '🇧🇷 LATAM', subRegions: ['LATAM_BR', 'LATAM_MX', 'LATAM_ANDES', 'LATAM_RIOPLATE', 'LATAM_CENTRAL'] },
  { code: 'CARIBBEAN', label: '🏝️ Caribbean', subRegions: ['CARIBBEAN_EN', 'CARIBBEAN_FR'] },
  { code: 'OCEANIA', label: '🇦🇺 Oceania', subRegions: ['OCEANIA_AU', 'OCEANIA_NZ'] },
  { code: 'PAKISTAN', label: '🇵🇰 Pakistan', subRegions: ['SA_PAKISTAN'] },
  { code: 'BANGLADESH', label: '🇧🇩 Bangladesh', subRegions: ['SA_BANGLADESH'] },
  { code: 'TURKEY', label: '🇹🇷 Turkey', subRegions: ['EU_TURKEY'] },
];

interface SlideAsset {
  slideId: SlideId;
  status: 'empty' | 'generating' | 'preview' | 'approved';
  headline?: string;
  subheadline?: string;
  cta?: string;
  imageUrl?: string;
  narration?: string;
  llmProvider?: string;
  styleUsed?: string;
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

// ─── Creative styles (subset for hero banners) ──────────────────────────
const HERO_STYLES = [
  { id: 'photorealistic', label: 'Photorealistic', emoji: '📸', promptHint: 'Photorealistic, studio lighting, ultra high detail, 8K quality' },
  { id: 'pixar', label: 'Pixar 3D', emoji: '🎬', promptHint: 'Pixar-style 3D animated, warm lighting, cinematic render' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆', promptHint: 'Cyberpunk style, neon lights, futuristic, holographic UI' },
  { id: 'watercolor', label: 'Watercolor', emoji: '🎨', promptHint: 'Watercolor painting style, soft edges, fluid strokes, pastel palette' },
];

export const HeroBannerCarouselMode: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [regionCarousels, setRegionCarousels] = useState<Record<string, RegionCarousel>>({});
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptOverrides, setScriptOverrides] = useState<Record<string, Partial<Record<SlideId, string>>>>({});
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const style = HERO_STYLES.find(s => s.id === selectedStyle) || HERO_STYLES[0];

  const getOrCreateCarousel = (regionCode: string): RegionCarousel => {
    return regionCarousels[regionCode] || {
      regionCode,
      slides: HERO_BANNER_SLIDES.map(s => ({ slideId: s.id, status: 'empty' as const })),
      overallStatus: 'empty' as const,
    };
  };

  // Generate all 4 slides for a parent region
  const generateRegionCarousel = useCallback(async (regionCode: string) => {
    setIsGenerating(true);
    setActiveRegion(regionCode);
    const llm = getLLMInfo(regionCode);
    const regionLabel = PARENT_REGIONS.find(r => r.code === regionCode)?.label?.replace(/^.\s/, '') || regionCode;

    // Initialize all slides as generating
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
        // Check for manual script override
        const override = scriptOverrides[regionCode]?.[slide.id];

        // Step 1: Generate messaging via regional LLM
        const scriptPrompt = override || `Generate hero banner copy for the "${slide.label}" slide targeting "${regionLabel}".

Purpose: ${slide.purpose}
Positioning: ${slide.positioning}
Tone: ${slide.tone}
Context: ${slide.promptContext}

Output as JSON:
{
  "headline": "${slide.headline_hint} — max 8 words, impactful",
  "subheadline": "Supporting text — max 20 words",
  "cta": "${slide.cta_hint} — max 4 words"
}

Output ONLY valid JSON, no explanation.`;

        let headline = '', subheadline = '', cta = '';

        if (override) {
          // User provided override text — use as headline
          headline = override;
          subheadline = '';
          cta = slide.cta_hint;
        } else {
          const { data: llmData, error: llmError } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              provider: llm.provider, model: llm.model,
              prompt: scriptPrompt,
              systemPrompt: `You are a healthcare marketing copywriter. Generate hero banner copy in JSON format. Tone: ${slide.tone}.`,
              temperature: 0.7, maxTokens: 200,
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
              headline = content.substring(0, 60);
              cta = slide.cta_hint;
            }
          } catch {
            headline = content.substring(0, 60);
            cta = slide.cta_hint;
          }
        }

        // Step 2: Generate banner image
        const { data: imgData } = await supabase.functions.invoke('ai-image-generator', {
          body: {
            prompt: `${style.promptHint}, professional healthcare hero banner for ${regionLabel}, ${slide.promptContext}, modern design, wide aspect ratio, 16:9`,
            width: 1920, height: 1080, style: selectedStyle,
          },
        });
        const imageUrl = imgData?.imageUrl || imgData?.url || imgData?.data?.url;

        const slideAsset: SlideAsset = {
          slideId: slide.id, status: 'preview',
          headline, subheadline, cta, imageUrl,
          llmProvider: llm.displayName, styleUsed: style.label,
        };
        completedSlides.push(slideAsset);

        // Update individual slide
        setRegionCarousels(prev => {
          const existing = prev[regionCode] || { regionCode, slides: [], overallStatus: 'partial' as const };
          const slides = [...HERO_BANNER_SLIDES.map((s, idx) => {
            if (idx < completedSlides.length) return completedSlides[idx];
            if (idx === i) return slideAsset;
            return existing.slides[idx] || { slideId: s.id, status: 'generating' as const };
          })];
          return { ...prev, [regionCode]: { ...existing, slides, overallStatus: 'partial' } };
        });

        toast.success(`Slide ${i + 1}/4: ${slide.label} generated`);
      } catch (err) {
        completedSlides.push({ slideId: slide.id, status: 'empty' });
        toast.error(`Slide ${i + 1} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Finalize
    setRegionCarousels(prev => ({
      ...prev,
      [regionCode]: {
        regionCode,
        slides: completedSlides,
        overallStatus: completedSlides.every(s => s.status === 'preview') ? 'complete' : 'partial',
      },
    }));
    setIsGenerating(false);
  }, [selectedStyle, style, scriptOverrides]);

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
    toast.success(`${PARENT_REGIONS.find(r => r.code === regionCode)?.label} hero carousel approved!`);
  }, []);

  const activeCarousel = activeRegion ? getOrCreateCarousel(activeRegion) : null;
  const activeSlide = activeCarousel?.slides[activeSlideIndex];
  const activeSlideConfig = HERO_BANNER_SLIDES[activeSlideIndex];

  return (
    <div className="space-y-4">
      {/* ═══ HEADER ═══ */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Hero Banner Carousel Generator
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                4 slides × {PARENT_REGIONS.length} parent regions | Each slide = different messaging context
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {HERO_STYLES.map(s => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={selectedStyle === s.id ? 'default' : 'outline'}
                  onClick={() => setSelectedStyle(s.id)}
                  className="text-xs gap-1"
                >
                  <span>{s.emoji}</span> {s.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ═══ PARENT REGION GRID ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Parent Regions — Click to Generate
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
                  onClick={() => {
                    setActiveRegion(region.code);
                    setActiveSlideIndex(0);
                    if (!carousel || status === 'empty') {
                      setExpandedRegion(region.code);
                    }
                  }}
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
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={cn(
                          'w-3 h-1.5 rounded-full',
                          carousel?.slides[i]?.status === 'approved' ? 'bg-emerald-500' :
                          carousel?.slides[i]?.status === 'preview' ? 'bg-blue-500' :
                          carousel?.slides[i]?.status === 'generating' ? 'bg-amber-500 animate-pulse' :
                          'bg-muted-foreground/20'
                        )}
                      />
                    ))}
                    <span className="text-[9px] text-muted-foreground ml-1">{completedCount}/4</span>
                  </div>
                  {status === 'approved' && <Badge className="text-[8px] mt-1.5 bg-emerald-500">✓ Approved</Badge>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══ ACTIVE REGION PREVIEW ═══ */}
      {activeRegion && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                {PARENT_REGIONS.find(r => r.code === activeRegion)?.label} — Hero Carousel Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Zap className="w-2.5 h-2.5" /> {getLLMInfo(activeRegion).displayName}
                </Badge>
                {activeCarousel?.overallStatus === 'complete' && (
                  <Button size="sm" onClick={() => approveRegion(activeRegion)} className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve All 4 Slides
                  </Button>
                )}
                {activeCarousel?.overallStatus !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => generateRegionCarousel(activeRegion)}
                    disabled={isGenerating}
                    className="text-xs gap-1"
                  >
                    {isGenerating && activeRegion === activeRegion ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Wand2 className="w-3.5 h-3.5" /> Generate 4 Slides</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 4-Slide Messaging Context Bar */}
            <div className="flex gap-1.5 mb-4">
              {HERO_BANNER_SLIDES.map((slide, i) => {
                const slideData = activeCarousel?.slides[i];
                const SlideIcon = slide.icon;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(i)}
                    className={cn(
                      'flex-1 rounded-lg border p-2 text-left transition-all text-xs',
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
                    <div className="text-[9px] mt-0.5 opacity-75 line-clamp-1">{slide.purpose}</div>
                  </button>
                );
              })}
            </div>

            {/* Hero Mockup Preview */}
            <div className="rounded-lg border overflow-hidden bg-black/90 relative">
              {/* Banner Image */}
              <div className="aspect-[16/9] max-h-[400px] relative flex items-center justify-center overflow-hidden">
                {activeSlide?.imageUrl ? (
                  <img
                    src={activeSlide.imageUrl}
                    alt={`${activeSlideConfig?.label} banner`}
                    className="w-full h-full object-cover"
                  />
                ) : activeSlide?.status === 'generating' ? (
                  <div className="flex flex-col items-center text-white/60">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                      <Sparkles className="w-10 h-10 mb-2" />
                    </motion.div>
                    <span className="text-sm">Generating {activeSlideConfig?.label}...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-white/30">
                    <Image className="w-10 h-10 mb-2" />
                    <span className="text-xs">Click "Generate 4 Slides" to create this banner</span>
                  </div>
                )}

                {/* Text Overlay (mockup of landing page) */}
                {activeSlide?.headline && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
                    <div className="p-6 md:p-10 max-w-xl">
                      <Badge className="mb-3 text-[10px]">{activeSlideConfig?.label}</Badge>
                      <h1 className="text-xl md:text-3xl font-bold text-white leading-tight mb-2">
                        {activeSlide.headline}
                      </h1>
                      {activeSlide.subheadline && (
                        <p className="text-sm md:text-base text-white/80 mb-4">{activeSlide.subheadline}</p>
                      )}
                      {activeSlide.cta && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          {activeSlide.cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Slide Navigation */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70 hover:text-white" onClick={() => setActiveSlideIndex(i => Math.max(0, i - 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {HERO_BANNER_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlideIndex(i)}
                      className={cn('w-8 h-1.5 rounded-full transition-colors', i === activeSlideIndex ? 'bg-white' : 'bg-white/30')}
                    />
                  ))}
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70 hover:text-white" onClick={() => setActiveSlideIndex(i => Math.min(3, i + 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status badge */}
                {activeSlide?.status === 'approved' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-500 text-white text-[10px] gap-1"><BadgeCheck className="w-3 h-3" /> Approved</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Slide Detail + Script Override */}
            {activeSlideConfig && (
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                {/* Messaging Context */}
                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <h4 className="text-xs font-semibold flex items-center gap-1.5">
                    <activeSlideConfig.icon className="w-3.5 h-3.5" />
                    {activeSlideConfig.label} — Messaging Context
                  </h4>
                  <div className="space-y-1">
                    <div className="text-[10px]"><span className="text-muted-foreground">Purpose:</span> {activeSlideConfig.purpose}</div>
                    <div className="text-[10px]"><span className="text-muted-foreground">Positioning:</span> {activeSlideConfig.positioning}</div>
                    <div className="text-[10px]"><span className="text-muted-foreground">Tone:</span> {activeSlideConfig.tone}</div>
                  </div>
                  {activeSlide?.llmProvider && (
                    <Badge variant="outline" className="text-[9px] gap-1"><Zap className="w-2.5 h-2.5" /> {activeSlide.llmProvider}</Badge>
                  )}
                </div>

                {/* Script Override */}
                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <h4 className="text-xs font-semibold">✏️ Manual Override (Optional)</h4>
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
                    placeholder={`Override headline for ${activeSlideConfig.label}... Leave empty for AI-generated`}
                  />
                  <p className="text-[9px] text-muted-foreground">
                    Override will be used as headline text. Leave empty to let {getLLMInfo(activeRegion).displayName} generate it.
                  </p>
                </div>
              </div>
            )}

            {/* Sub-Region Expansion (after approval) */}
            {activeCarousel?.overallStatus === 'approved' && (
              <div className="mt-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Users className="w-3.5 h-3.5" />
                      Ready to Expand to Sub-Regions
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {PARENT_REGIONS.find(r => r.code === activeRegion)?.subRegions.length || 0} sub-regions will receive transcreated versions of all 4 slides
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
            <Layers className="w-4 h-4 text-primary" />
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
                      <div
                        key={i}
                        className={cn(
                          'w-4 h-1.5 rounded-full',
                          carousel?.slides[i]?.status === 'approved' ? 'bg-emerald-500' :
                          carousel?.slides[i]?.status === 'preview' ? 'bg-blue-500' :
                          'bg-muted-foreground/15'
                        )}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{done}/4 slides</div>
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
