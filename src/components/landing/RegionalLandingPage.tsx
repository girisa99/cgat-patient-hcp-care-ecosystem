/**
 * REGIONAL LANDING PAGE
 * 
 * Fully transcreated landing page per region.
 * Renders region-specific content: hero, providers, industries, language demo, pricing, SEO.
 * English is always present alongside native language content.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, Play, Sparkles, Globe, Brain, Cpu, Zap, Eye, Mic, Languages, Layers, Wand2, Video, Image, FileText, AudioLines,
  Box, Palette, Volume2, Subtitles, MonitorPlay, VolumeX,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  REGIONAL_CONFIGS, 
  detectRegionFromTimezone, 
  getAllRegionSlugs,
  type RegionSlug, 
  type RegionalConfig 
} from '@/config/regionalLandingConfig';
import { RegionalPricingSection } from '@/components/landing/RegionalPricingSection';
import { ProfessionalAvatarShowcase } from '@/components/landing/video/ProfessionalAvatarShowcase';
import { ProductDetailShowcase } from '@/components/landing/ProductDetailShowcase';
import { DogfoodingProof } from '@/components/landing/DogfoodingProof';
import { IndustryShowcases } from '@/components/landing/IndustryShowcases';
import { RegionSwitcherNav } from '@/components/landing/RegionSwitcherNav';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';
// Region-specific hero backgrounds — all 4 slides per region
import heroRegionNam from '@/assets/hero-region-nam.jpg';
import heroNamPipeline from '@/assets/hero-nam-pipeline.jpg';
import heroNamLanguages from '@/assets/hero-nam-languages.jpg';
import heroNamTranscreation from '@/assets/hero-nam-transcreation.jpg';

import heroRegionEurope from '@/assets/hero-region-europe.jpg';
import heroEuropePipeline from '@/assets/hero-europe-pipeline.jpg';
import heroEuropeLanguages from '@/assets/hero-europe-languages.jpg';
import heroEuropeTranscreation from '@/assets/hero-europe-transcreation.jpg';

import heroRegionMena from '@/assets/hero-region-mena.jpg';
import heroMenaPipeline from '@/assets/hero-mena-pipeline.jpg';
import heroMenaLanguages from '@/assets/hero-mena-languages.jpg';
import heroMenaTranscreation from '@/assets/hero-mena-transcreation.jpg';

import heroRegionIndia from '@/assets/hero-region-india.jpg';
import heroIndiaPipeline from '@/assets/hero-india-pipeline.jpg';
import heroIndiaLanguages from '@/assets/hero-india-languages.jpg';
import heroIndiaTranscreation from '@/assets/hero-india-transcreation.jpg';

import heroRegionAfrica from '@/assets/hero-region-africa.jpg';
import heroAfricaPipeline from '@/assets/hero-africa-pipeline.jpg';
import heroAfricaLanguages from '@/assets/hero-africa-languages.jpg';
import heroAfricaTranscreation from '@/assets/hero-africa-transcreation.jpg';

import heroRegionApac from '@/assets/hero-region-apac.jpg';
import heroApacPipeline from '@/assets/hero-apac-pipeline.jpg';
import heroApacLanguages from '@/assets/hero-apac-languages.jpg';
import heroApacTranscreation from '@/assets/hero-apac-transcreation.jpg';

import heroRegionLatam from '@/assets/hero-region-latam.jpg';
import heroLatamPipeline from '@/assets/hero-latam-pipeline.jpg';
import heroLatamLanguages from '@/assets/hero-latam-languages.jpg';
import heroLatamTranscreation from '@/assets/hero-latam-transcreation.jpg';

import heroRegionCaribbean from '@/assets/hero-region-caribbean.jpg';
import heroCaribbeanPipeline from '@/assets/hero-caribbean-pipeline.jpg';
import heroCaribbeanLanguages from '@/assets/hero-caribbean-languages.jpg';
import heroCaribbeanTranscreation from '@/assets/hero-caribbean-transcreation.jpg';

const REGION_HERO_IMAGES: Record<RegionSlug, string[]> = {
  nam: [heroRegionNam, heroNamPipeline, heroNamLanguages, heroNamTranscreation],
  europe: [heroRegionEurope, heroEuropePipeline, heroEuropeLanguages, heroEuropeTranscreation],
  mena: [heroRegionMena, heroMenaPipeline, heroMenaLanguages, heroMenaTranscreation],
  india: [heroRegionIndia, heroIndiaPipeline, heroIndiaLanguages, heroIndiaTranscreation],
  africa: [heroRegionAfrica, heroAfricaPipeline, heroAfricaLanguages, heroAfricaTranscreation],
  apac: [heroRegionApac, heroApacPipeline, heroApacLanguages, heroApacTranscreation],
  latam: [heroRegionLatam, heroLatamPipeline, heroLatamLanguages, heroLatamTranscreation],
  caribbean: [heroRegionCaribbean, heroCaribbeanPipeline, heroCaribbeanLanguages, heroCaribbeanTranscreation],
};

// ============================================
// SEO HEAD COMPONENT
// ============================================
const RegionalSEOHead: React.FC<{ config: RegionalConfig; currentSlug: string }> = ({ config, currentSlug }) => {
  const allSlugs = getAllRegionSlugs();
  const baseUrl = 'https://cgat-patient-hcp-care-ecosystem.lovable.app';
  
  return (
    <Helmet>
      <html lang={config.seo.hreflang} dir={config.hero.isRTL ? 'rtl' : 'ltr'} />
      <title>{config.seo.title}</title>
      <meta name="description" content={config.seo.description} />
      <meta name="keywords" content={config.seo.keywords.join(', ')} />
      <meta property="og:title" content={config.seo.title} />
      <meta property="og:description" content={config.seo.description} />
      <meta property="og:locale" content={config.seo.ogLocale} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${baseUrl}/genie-landing/${currentSlug}`} />
      <link rel="canonical" href={`${baseUrl}/genie-landing/${currentSlug}`} />
      {/* Hreflang tags for all regions */}
      {allSlugs.map(slug => (
        <link 
          key={slug}
          rel="alternate" 
          hrefLang={REGIONAL_CONFIGS[slug].seo.hreflang} 
          href={`${baseUrl}/genie-landing/${slug}`} 
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/genie-landing`} />
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Genie Studio',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          description: config.seo.description,
          url: `${baseUrl}/genie-landing/${currentSlug}`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier with 50 credits',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1200',
          },
          availableLanguage: config.languageShowcase.languages.map(l => l.name),
        })}
      </script>
    </Helmet>
  );
};

// ============================================
// FLOATING AI PROVIDER ORBS
// ============================================
// ============================================
// AI PROVIDER BADGES — Floating provider showcase
// ============================================
const PROVIDER_SHOWCASE = [
  { label: 'Gemini 3 Pro', icon: Sparkles, gradient: 'from-blue-500 to-indigo-600', capability: 'Image & LLM' },
  { label: 'Vertex Veo 3', icon: Video, gradient: 'from-sky-400 to-cyan-600', capability: 'Video Gen' },
  { label: 'Claude 4', icon: Brain, gradient: 'from-orange-400 to-amber-600', capability: 'Transcreation' },
  { label: 'GPT-4o', icon: Sparkles, gradient: 'from-emerald-400 to-teal-600', capability: 'Content AI' },
  { label: 'Meshy AI', icon: Box, gradient: 'from-violet-400 to-purple-600', capability: '3D Models' },
  { label: 'Azure Neural', icon: Volume2, gradient: 'from-blue-400 to-blue-700', capability: 'TTS & Lipsync' },
  { label: 'ElevenLabs', icon: Mic, gradient: 'from-pink-400 to-rose-600', capability: 'Voice Clone' },
  { label: 'DeepL', icon: Languages, gradient: 'from-teal-400 to-emerald-600', capability: 'Translation' },
  { label: 'Alibaba Wan', icon: Eye, gradient: 'from-amber-400 to-orange-600', capability: 'Avatar Gen' },
  { label: 'ModelsLab', icon: Palette, gradient: 'from-fuchsia-400 to-pink-600', capability: 'Animation' },
  { label: 'Deepgram', icon: Subtitles, gradient: 'from-lime-400 to-green-600', capability: 'STT Nova 2' },
  { label: 'DeepSeek', icon: Cpu, gradient: 'from-indigo-400 to-violet-600', capability: 'Reasoning' },
];

const ProviderRibbon: React.FC = () => (
  <div className="relative overflow-hidden py-3">
    <motion.div
      className="flex gap-4 whitespace-nowrap"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    >
      {[...PROVIDER_SHOWCASE, ...PROVIDER_SHOWCASE].map((p, i) => {
        const Icon = p.icon;
        return (
          <div key={`${p.label}-${i}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
              <Icon className="w-3 h-3 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-bold text-white/90">{p.label}</span>
            <span className="text-[10px] text-white/40 font-medium">{p.capability}</span>
          </div>
        );
      })}
    </motion.div>
  </div>
);

// ============================================
// TEMPLATE PREVIEW CARDS — Floating glassmorphic
// ============================================
const TEMPLATE_PREVIEWS = [
  { title: 'Product Launch', style: 'Cinematic 4K', provider: 'Vertex Veo 3', badge: 'Video', color: 'border-sky-500/30' },
  { title: '3D Explainer', style: 'Pixar Quality', provider: 'Meshy AI', badge: '3D', color: 'border-violet-500/30' },
  { title: 'Avatar Presenter', style: 'Photorealistic', provider: 'Alibaba Wan', badge: 'Avatar', color: 'border-amber-500/30' },
  { title: 'Social Reel', style: 'UGC Authentic', provider: 'ModelsLab', badge: 'Animation', color: 'border-pink-500/30' },
];

const FloatingTemplateCards: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {TEMPLATE_PREVIEWS.map((tmpl, i) => (
        <motion.div
          key={tmpl.title}
          className={`absolute w-52 bg-black/50 backdrop-blur-xl rounded-xl border ${tmpl.color} p-3 shadow-2xl`}
          style={{
            left: `${10 + i * 22}%`,
            top: `${18 + (i % 2 === 0 ? 0 : 30)}%`,
          }}
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{
            opacity: [0, 0.85, 0.75],
            y: [40, 0, -5, 0],
            scale: [0.8, 1, 0.98, 1],
            rotate: [0, (i % 2 === 0 ? 2 : -2), 0],
          }}
          transition={{ delay: 0.5 + i * 0.2, duration: 1.5, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{tmpl.badge}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">{tmpl.provider}</span>
          </div>
          <p className="text-sm font-bold text-white/90 mb-1">{tmpl.title}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 1 + i * 0.3, duration: 2 }}
              />
            </div>
            <span className="text-[9px] text-white/40 font-mono">{tmpl.style}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// PIPELINE VISUAL — Cinematic production flow
// ============================================
const PIPELINE_STEPS = [
  { icon: Wand2, label: 'Ideation', provider: 'Gemini 3', color: 'from-violet-500 to-purple-600' },
  { icon: FileText, label: 'Script', provider: 'GPT-4o', color: 'from-emerald-500 to-teal-600' },
  { icon: Mic, label: 'Voice', provider: 'Azure TTS', color: 'from-blue-500 to-indigo-600' },
  { icon: Video, label: 'Video', provider: 'Vertex Veo', color: 'from-sky-500 to-cyan-600' },
  { icon: Box, label: '3D/Avatar', provider: 'Meshy + Wan', color: 'from-amber-500 to-orange-600' },
  { icon: Globe, label: 'Distribute', provider: '140+ Lang', color: 'from-rose-500 to-pink-600' },
];

const CinematicPipeline: React.FC = () => (
  <div className="flex items-center justify-center gap-1 sm:gap-3 pt-8 flex-wrap">
    {PIPELINE_STEPS.map((step, i) => {
      const Icon = step.icon;
      return (
        <React.Fragment key={step.label}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 180, damping: 20 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl relative overflow-hidden`}
              whileHover={{ scale: 1.15, rotate: 5 }}
              animate={{
                boxShadow: [
                  '0 4px 20px rgba(0,0,0,0.3)',
                  '0 12px 40px rgba(0,0,0,0.5)',
                  '0 4px 20px rgba(0,0,0,0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" strokeWidth={1.5} />
            </motion.div>
            <span className="text-xs font-bold text-white/90">{step.label}</span>
            <span className="text-[9px] text-white/40 font-medium">{step.provider}</span>
          </motion.div>
          {i < PIPELINE_STEPS.length - 1 && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
              className="hidden sm:flex items-center mb-8"
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
              >
                <ArrowRight className="w-5 h-5 text-white/30" />
              </motion.div>
            </motion.div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ============================================
// TTS VOICEOVER HOOK
// ============================================
const useHeroVoiceover = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create Audio element immediately in user gesture context
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;
    setIsSpeaking(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || (supabase as any).supabaseUrl}/functions/v1/ask-genie-voice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || (supabase as any).supabaseKey,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || (supabase as any).supabaseKey}`,
          },
          body: JSON.stringify({
            action: 'speak',
            text,
            language: 'en',
            provider: 'elevenlabs',
            voice: 'Brian',
          }),
        }
      );

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
};

// ============================================
// UNIFIED HERO CAROUSEL — Cinematic Enterprise
// ============================================
const HeroCarousel: React.FC<{ config: RegionalConfig; productContext?: string | null; regionSlug?: RegionSlug }> = ({ config, productContext, regionSlug = 'nam' }) => {
  const { hero, stats, cta } = config;
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const { speak, stop, isSpeaking } = useHeroVoiceover();

  const heroImages = REGION_HERO_IMAGES[regionSlug] || REGION_HERO_IMAGES.nam;

  const slides = [
    {
      id: 'platform',
      badge: `${hero.flag} ${productContext ? `Genie ${productContext.charAt(0).toUpperCase() + productContext.slice(1)} for ${hero.regionName}` : `Content optimized for ${hero.regionName}`}`,
      headline: ['One ', 'Platform.'],
      subtitle: 'Every Market. The Only One You Need.',
      description: '15 AI providers. 206 pipelines. 50+ industries. 140+ languages. From mind to media — the world\'s first all-in-one AI content production suite.',
      type: 'platform' as const,
    },
    {
      id: 'mind-to-media',
      badge: `${hero.flag} Mind to Media for ${hero.regionName}`,
      headline: ['Idea to ', 'Global Content.'],
      subtitle: 'In Minutes, Not Months.',
      description: 'From a single prompt — AI generates scripts, voices, avatars, 3D models, videos, and culturally adapted content for every market.',
      type: 'pipeline' as const,
    },
    {
      id: 'language',
      badge: `${hero.flag} ${stats.languages} Languages · ${stats.dialects || '30+'} Dialects · ${hero.regionName}`,
      headline: ['We Speak Your ', 'Language.'],
      subtitle: 'We Understand Your Market.',
      description: 'Not just translation — we adapt tone, idioms, humor, cultural references, and regional compliance so your audience feels you were built for them.',
      type: 'stats' as const,
    },
    {
      id: 'transcreation',
      badge: `${hero.flag} Transcreation for ${hero.regionName}`,
      headline: ['Transcreation, ', 'Not Translation.'],
      subtitle: 'Cultural Adaptation at Scale.',
      description: 'Translation converts words. Transcreation converts meaning — intent, emotion, and cultural context powered by zone-routed AI models.',
      type: 'comparison' as const,
    },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const slide = slides[current];

  return (
    <section className={`relative min-h-[100vh] overflow-hidden ${hero.isRTL ? 'rtl' : 'ltr'}`}>
      {/* Full-bleed hero image background with Ken Burns motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-img-${current}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <motion.img
            src={heroImages[current]}
            alt=""
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.06] }}
            transition={{ duration: 12, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          />
          {/* Deep cinematic overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent" />
          {/* Cinematic vignette */}
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 200px 60px rgba(0,0,0,0.6)' }} />
        </motion.div>
      </AnimatePresence>

      {/* Animated mesh gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
          animate={{ x: ['-10%', '60%', '-10%'], y: ['10%', '50%', '10%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, hsl(200, 80%, 60%) 0%, transparent 70%)' }}
          animate={{ x: ['10%', '-50%', '10%'], y: ['-10%', '-40%', '-10%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Ambient rising particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${70 + Math.random() * 30}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
              y: [0, -200 - Math.random() * 300],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Floating template preview cards (on platform slide) */}
      <FloatingTemplateCards visible={current === 0} />

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 pt-28 pb-20 flex flex-col items-center justify-center min-h-[85vh] z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: direction * 80, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 50, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-6 w-full"
          >
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: -15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}>
              <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 shadow-xl shadow-black/20">
                {slide.badge}
              </Badge>
            </motion.div>

            {/* Headline — massive cinematic type */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.92] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, type: 'spring', stiffness: 100 }}
            >
              <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{slide.headline[0]}</span>
              <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {slide.headline[1]}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-3xl font-bold text-white/90 drop-shadow-lg"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              {slide.subtitle}
            </motion.p>

            <motion.p
              className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            >
              {slide.description}
            </motion.p>

            {/* === SLIDE-SPECIFIC CONTENT === */}

            {/* Platform slide — Stats + CTAs */}
            {slide.type === 'platform' && (
              <motion.div className="space-y-6 pt-4" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {[
                    { value: stats.audienceReach, label: 'Audience Reach' },
                    { value: stats.dialects || stats.languages, label: stats.dialects ? 'Dialects' : 'Languages' },
                    { value: stats.costSavings, label: 'Cost Savings' },
                    { value: stats.localMetric.value, label: stats.localMetric.label },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
                      whileHover={{ y: -4, scale: 1.04 }}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.45 + i * 0.08, type: 'spring', stiffness: 180 }}
                    >
                      <p className="text-2xl font-black bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">{stat.value}</p>
                      <p className="text-[11px] text-white/60 font-semibold">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
                {/* HIGH-VISIBILITY CTAs */}
                <div className="flex flex-wrap gap-4 justify-center pt-3">
                  <Link to="/genie-studio-auth?tab=signup">
                    <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 hover:from-primary/90 hover:via-blue-400 hover:to-cyan-400 text-white font-bold shadow-[0_8px_32px_rgba(59,130,246,0.5)] text-lg px-10 py-7 rounded-xl border border-white/20 tracking-wide">
                        {cta.primary}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/explore">
                    <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" variant="outline" className="border-2 border-white/40 text-white font-bold hover:bg-white/15 hover:border-white/60 text-lg px-10 py-7 rounded-xl backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                        <Play className="mr-2 h-5 w-5" />
                        {cta.secondary}
                      </Button>
                    </motion.div>
                  </Link>
                </div>
                <p className="text-white/50 text-xs font-medium">{cta.freeCredits}</p>
              </motion.div>
            )}

            {/* Pipeline slide — Cinematic flow */}
            {slide.type === 'pipeline' && <CinematicPipeline />}

            {/* Stats / Language slide */}
            {slide.type === 'stats' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
                {[
                  { value: '140+', label: 'Languages', icon: Languages, glow: 'shadow-blue-500/30' },
                  { value: '30+', label: 'Dialects', icon: Mic, glow: 'shadow-violet-500/30' },
                  { value: '8', label: 'Regions', icon: Globe, glow: 'shadow-emerald-500/30' },
                  { value: 'RTL', label: 'Full Support', icon: Eye, glow: 'shadow-amber-500/30' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className={`text-center p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 hover:border-primary/50 transition-all group shadow-xl ${stat.glow}`}
                      initial={{ opacity: 0, y: 30, rotateX: -20 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.25 + i * 0.12, type: 'spring', stiffness: 150 }}
                      whileHover={{ y: -6, scale: 1.06 }}
                    >
                      <Icon className="w-6 h-6 text-white/40 mx-auto mb-3 group-hover:text-primary transition-colors" />
                      <p className="text-4xl font-black text-white drop-shadow-lg">{stat.value}</p>
                      <p className="text-xs text-white/50 font-semibold mt-1">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Comparison / Transcreation slide */}
            {slide.type === 'comparison' && (
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6">
                <motion.div
                  className="p-7 bg-red-950/40 backdrop-blur-xl rounded-2xl border border-red-500/25 text-left space-y-3 relative overflow-hidden"
                  initial={{ opacity: 0, x: -40, rotateY: -10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/15 rounded-full blur-3xl" />
                  <p className="text-sm font-bold text-red-400 uppercase tracking-wider">❌ Translation</p>
                  <p className="text-white font-semibold text-lg drop-shadow-md">"Our product helps you save time and money."</p>
                  <p className="text-xs text-white/50 italic">Word-for-word. Literal. Generic. No cultural context.</p>
                  <div className="flex gap-1.5 pt-2">
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-red-500/15 text-red-300/80 border border-red-500/25 font-semibold">DeepL Only</span>
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-red-500/15 text-red-300/80 border border-red-500/25 font-semibold">No Context</span>
                  </div>
                </motion.div>
                <motion.div
                  className="p-7 bg-emerald-950/40 backdrop-blur-xl rounded-2xl border border-primary/35 text-left space-y-3 relative overflow-hidden ring-1 ring-primary/15"
                  initial={{ opacity: 0, x: 40, rotateY: 10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.45, type: 'spring' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 rounded-full blur-3xl" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 15, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-primary/50" />
                  </motion.div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider">✅ Transcreation</p>
                  <p className="text-white font-semibold text-lg drop-shadow-md" dir="rtl">"لأن وقتك أغلى من أي استثمار"</p>
                  <p className="text-xs text-white/50 italic" dir="ltr">Culturally adapted. Emotionally resonant. Market-ready.</p>
                  <div className="flex gap-1.5 pt-2">
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-primary/15 text-primary/80 border border-primary/25 font-semibold">Gemini 3 Pro</span>
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-primary/15 text-primary/80 border border-primary/25 font-semibold">Zone-Routed</span>
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-primary/15 text-primary/80 border border-primary/25 font-semibold">MENA</span>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* TTS Voiceover Button — fixed bottom-right */}
      <motion.button
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-[0_4px_24px_rgba(59,130,246,0.5)] border-2 border-white/20 hover:shadow-[0_8px_40px_rgba(59,130,246,0.6)] transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isSpeaking) {
            stop();
          } else {
            speak(`${slide.headline.join('')} ${slide.subtitle}. ${slide.description}`);
          }
        }}
        title={isSpeaking ? 'Stop voiceover' : 'Listen to voiceover'}
      >
        {isSpeaking ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <VolumeX className="w-6 h-6" />
          </motion.div>
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
      </motion.button>

      {/* Provider ribbon — continuously scrolling */}
      <div className="absolute bottom-28 left-0 right-0 z-20">
        <ProviderRibbon />
      </div>

      {/* Navigation dots with labels */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5 z-20">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="group flex flex-col items-center gap-1.5"
          >
            <span className={`text-[10px] font-bold transition-all duration-300 ${
              i === current ? 'text-white opacity-100' : 'text-white/0 group-hover:text-white/60 opacity-0 group-hover:opacity-100'
            }`}>
              {['Platform', 'Pipeline', 'Languages', 'Transcreation'][i]}
            </span>
            <div className="relative">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-14 bg-gradient-to-r from-primary to-cyan-400 shadow-lg shadow-primary/50' : 'w-3 bg-white/25 group-hover:bg-white/50'
              }`} />
              {i === current && (
                <motion.div
                  className="absolute inset-0 h-2.5 rounded-full bg-primary/30"
                  animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
// ============================================
const RegionalIndustries: React.FC<{ config: RegionalConfig }> = ({ config }) => (
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Every Industry. Transcreated for {config.hero.regionName}.
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          50+ industries powered by <span className="text-primary font-semibold">15 AI providers</span> and{' '}
          <span className="text-primary font-semibold">206 pipelines</span> — culturally adapted for your market, 
          compliance requirements, and audience dialects.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {config.industries.map((industry, i) => (
          <motion.div
            key={industry.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-border hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{industry.icon}</span>
                  <h3 className="font-bold text-foreground">{industry.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{industry.useCase}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-6">
        Featured industries for {config.hero.regionName} — plus Oil & Gas, Pharma, Legal, Consulting, 
        Automotive, Telecom, Agriculture, Media, and 40+ more with the same transcreation quality.
      </p>
    </div>
  </section>
);

// ============================================
// TranscreationShowcase removed — consolidated into EverythingYouNeedSection

// ============================================
// REGION NAVIGATOR — Compact globe strip
// ============================================
const RegionNavigator: React.FC<{ currentSlug: RegionSlug }> = ({ currentSlug }) => {
  const allSlugs = getAllRegionSlugs();
  return (
    <section className="py-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            8 Global Regions · 140+ Languages
          </span>
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {allSlugs.map((slug, i) => {
            const r = REGIONAL_CONFIGS[slug];
            const isActive = slug === currentSlug;
            const langCount = r.languageShowcase?.languages?.length || 0;
            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/genie-landing/${slug}`}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/30'
                      : 'bg-card/80 backdrop-blur-sm border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card hover:shadow-md'
                  }`}
                >
                  <span className="text-lg leading-none">{r.hero.flag}</span>
                  <span>{r.hero.regionName}</span>
                  {langCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                    }`}>
                      {langCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA FOOTER
// ============================================
const RegionalCTAFooter: React.FC<{ config: RegionalConfig }> = ({ config }) => (
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-background" />
    <div className="relative max-w-4xl mx-auto px-4 text-center">
      <Badge variant="outline" className="mb-6 border-primary/40 text-primary">
        <Globe className="h-3 w-3 mr-1" />
        Ready for {config.hero.regionName}
      </Badge>
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
        Your Audience Deserves Content
        <br />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          That Feels Like Home.
        </span>
      </h2>
      
      <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
        We speak 140+ languages. We understand 50+ industries. We guide you from idea to global distribution.
      </p>
      <p className="text-lg text-primary font-semibold mb-8">
        💰 {config.comparisonSavings}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <Link to="/genie-studio-auth?tab=signup">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-lg px-8 py-6">
            {config.cta.primary}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/support">
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
            Schedule a Guided Demo
          </Button>
        </Link>
      </div>

      <p className="text-muted-foreground text-sm mb-2">
        <Link to="/genie-studio-auth" className="text-primary hover:underline font-medium">
          {config.cta.signIn}
        </Link>
      </p>
      <p className="text-muted-foreground text-sm">{config.cta.freeCredits}</p>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-border">
        <div className="flex justify-center items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-bold text-foreground">Genie Studio</span>
          <span className="text-muted-foreground">© 2026</span>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// NAVBAR
// ============================================
const RegionalNavbar: React.FC<{ config: RegionalConfig }> = ({ config }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-md">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/genie-landing" className="flex items-center gap-2">
        <Sparkles className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Genie Studio
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-6">
        <a href="#products" className="text-muted-foreground hover:text-foreground transition">Products</a>
        <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
        <a href="#languages" className="text-muted-foreground hover:text-foreground transition">Languages</a>
        <Link to="/explore">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Explore
          </Button>
        </Link>
        <RegionSwitcherNav variant="navbar" />
        <Link to="/genie-studio-auth">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
            {config.cta.primary}
          </Button>
        </Link>
      </div>
    </div>
  </nav>
);

// ============================================
// MAIN COMPONENT — Unified Landing Page
// ============================================
export const RegionalLandingPage: React.FC = () => {
  const { region } = useParams<{ region: string }>();
  const [searchParams] = useSearchParams();
  const productContext = searchParams.get('product');
  const [activeProduct, setActiveProduct] = useState('studio');

  // Validate region slug
  const regionSlug = region as RegionSlug;
  const config = REGIONAL_CONFIGS[regionSlug];

  if (!config) {
    // Auto-detect and redirect
    const detected = detectRegionFromTimezone();
    return <Navigate to={`/genie-landing/${detected}`} replace />;
  }

  return (
    <main className={`min-h-screen bg-background text-foreground ${config.hero.isRTL ? 'rtl' : 'ltr'}`}>
      <RegionalSEOHead config={config} currentSlug={regionSlug} />
      <RegionalNavbar config={config} />
      <HeroCarousel config={config} productContext={productContext} regionSlug={regionSlug} />
      <RegionNavigator currentSlug={regionSlug} />

      {/* Product Ecosystem — 7 Products, 206 Pipelines + Why Genie */}
      <section id="products" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              7 Products. 206 Pipelines. One Platform.
            </h2>
            <p className="text-xl text-muted-foreground">
              From idea to global distribution — every tool you need
            </p>
          </div>
          <ProductDetailShowcase 
            activeProduct={activeProduct} 
            onProductChange={setActiveProduct} 
          />

          {/* Differentiators moved to hero banner */}
        </div>
      </section>

      {/* Industry Showcases — See It In Action */}
      <IndustryShowcases region={regionSlug} config={config} />

      {/* Regional Pricing */}
      <section id="pricing">
        <RegionalPricingSection regionSlug={regionSlug} />
      </section>

      {/* Dogfooding Proof */}
      <DogfoodingProof />
      
      <RegionalCTAFooter config={config} />
    </main>
  );
};

export default RegionalLandingPage;
