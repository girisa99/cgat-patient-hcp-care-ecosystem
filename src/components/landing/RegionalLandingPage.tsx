/**
 * REGIONAL LANDING PAGE
 * 
 * Fully transcreated landing page per region.
 * Renders region-specific content: hero, providers, industries, language demo, pricing, SEO.
 * English is always present alongside native language content.
 */

import React, { useState } from 'react';
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, Play, Sparkles, Globe, Brain, Cpu, Zap, Eye, Mic, Languages, Layers, Wand2, Video, Image, FileText, AudioLines,
} from 'lucide-react';
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
// LocalizationDemoHub removed — consolidated into IndustryShowcases
import { ProfessionalAvatarShowcase } from '@/components/landing/video/ProfessionalAvatarShowcase';
import { ProductDetailShowcase } from '@/components/landing/ProductDetailShowcase';
// CrossFunctionalSection removed — capabilities now integrated into IndustryShowcases
import { DogfoodingProof } from '@/components/landing/DogfoodingProof';
import { IndustryShowcases } from '@/components/landing/IndustryShowcases';
import { RegionSwitcherNav } from '@/components/landing/RegionSwitcherNav';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

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
const AI_ORBS = [
  { icon: Brain, label: 'Claude', color: 'from-orange-400 to-amber-600', x: '8%', y: '18%', delay: 0, size: 44 },
  { icon: Sparkles, label: 'GPT-4o', color: 'from-emerald-400 to-teal-600', x: '88%', y: '22%', delay: 0.5, size: 40 },
  { icon: Zap, label: 'Gemini', color: 'from-blue-400 to-indigo-600', x: '12%', y: '72%', delay: 1, size: 38 },
  { icon: Cpu, label: 'DeepSeek', color: 'from-violet-400 to-purple-600', x: '82%', y: '68%', delay: 1.5, size: 36 },
  { icon: Eye, label: 'Vertex', color: 'from-sky-400 to-cyan-600', x: '5%', y: '45%', delay: 2, size: 34 },
  { icon: Mic, label: 'ElevenLabs', color: 'from-pink-400 to-rose-600', x: '92%', y: '48%', delay: 2.5, size: 36 },
  { icon: Languages, label: 'DeepL', color: 'from-teal-400 to-emerald-600', x: '18%', y: '88%', delay: 0.3, size: 32 },
  { icon: Layers, label: 'Meshy', color: 'from-amber-400 to-orange-600', x: '78%', y: '85%', delay: 0.8, size: 32 },
];

const FloatingOrbs: React.FC<{ activeSlide: number }> = ({ activeSlide }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {AI_ORBS.map((orb, i) => {
      const Icon = orb.icon;
      return (
        <motion.div
          key={orb.label}
          className="absolute"
          style={{ left: orb.x, top: orb.y }}
          animate={{
            y: [0, -12, 0, 8, 0],
            x: [0, 6, -4, 2, 0],
            opacity: [0.25, 0.5, 0.35, 0.5, 0.25],
            scale: [1, 1.08, 0.96, 1.05, 1],
          }}
          transition={{
            duration: 8 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        >
          <div className={`relative bg-gradient-to-br ${orb.color} rounded-2xl p-2.5 shadow-lg shadow-black/10 backdrop-blur-sm`} style={{ width: orb.size, height: orb.size }}>
            <Icon className="w-full h-full text-white/90" strokeWidth={1.5} />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-muted-foreground/60 whitespace-nowrap">
              {orb.label}
            </div>
          </div>
        </motion.div>
      );
    })}
    {/* Animated particles */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute w-1 h-1 rounded-full bg-primary/30"
        style={{
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
        }}
        animate={{
          opacity: [0, 0.6, 0],
          scale: [0, 1.5, 0],
          y: [0, -30 - Math.random() * 40],
        }}
        transition={{
          duration: 3 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 4 + activeSlide * 0.2,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

// ============================================
// PIPELINE VISUAL — Animated production flow
// ============================================
const PIPELINE_STEPS = [
  { icon: Wand2, label: 'Ideation', color: 'text-violet-500' },
  { icon: FileText, label: 'Scripting', color: 'text-blue-500' },
  { icon: Video, label: 'Production', color: 'text-emerald-500' },
  { icon: Languages, label: 'Localization', color: 'text-amber-500' },
  { icon: Globe, label: 'Distribution', color: 'text-rose-500' },
];

const AnimatedPipeline: React.FC = () => (
  <div className="flex items-center justify-center gap-1 sm:gap-2 pt-6 flex-wrap">
    {PIPELINE_STEPS.map((step, i) => {
      const Icon = step.icon;
      return (
        <React.Fragment key={step.label}>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center gap-1.5"
          >
            <motion.div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.12, rotate: 3 }}
              animate={{
                boxShadow: [
                  '0 4px 14px rgba(0,0,0,0.05)',
                  '0 8px 25px rgba(0,0,0,0.12)',
                  '0 4px 14px rgba(0,0,0,0.05)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            >
              <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color}`} />
            </motion.div>
            <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">{step.label}</span>
          </motion.div>
          {i < PIPELINE_STEPS.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
              className="hidden sm:flex items-center mb-5"
            >
              <div className="w-8 h-[2px] bg-gradient-to-r from-primary/40 to-primary/20 rounded-full" />
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              >
                <ArrowRight className="w-4 h-4 text-primary/50" />
              </motion.div>
            </motion.div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ============================================
// UNIFIED HERO CAROUSEL — 4 heroes, left-to-right
// ============================================
const HeroCarousel: React.FC<{ config: RegionalConfig; productContext?: string | null }> = ({ config, productContext }) => {
  const { hero, stats, cta } = config;
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  const slides = [
    {
      id: 'platform',
      badge: `${hero.flag} ${productContext ? `Genie ${productContext.charAt(0).toUpperCase() + productContext.slice(1)} for ${hero.regionName}` : `Content optimized for ${hero.regionName}`}`,
      headline: ['One ', 'Platform.'],
      subtitle: 'Every Market. The Only One You Need.',
      description: 'AI-powered content production across 50+ industries in 140+ languages — powered by 15 integrated AI providers.',
      type: 'platform' as const,
    },
    {
      id: 'mind-to-media',
      badge: '✦ End-to-End Content Production',
      headline: ['Mind to ', 'Media.'],
      subtitle: 'For Every Industry.',
      description: 'From the first spark of an idea to polished, market-ready content — across video, presentations, audio, and documents.',
      type: 'pipeline' as const,
    },
    {
      id: 'language',
      badge: '🌍 140+ Languages · 8 Global Regions',
      headline: ['We Speak Your ', 'Language.'],
      subtitle: 'We Understand Your Market.',
      description: 'Not just translation — we adapt tone, idioms, humor, cultural references, and regional compliance so your audience feels you were built for them.',
      type: 'stats' as const,
    },
    {
      id: 'transcreation',
      badge: '🚀 First to Market',
      headline: ['Transcreation, ', 'Not Translation.'],
      subtitle: 'Cultural Adaptation at Scale.',
      description: 'Translation converts words. Transcreation converts meaning — intent, emotion, and cultural context for every target market.',
      type: 'comparison' as const,
    },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const slide = slides[current];

  const bgGradients = [
    'from-primary/6 via-background to-accent/8',
    'from-violet-500/8 via-background to-blue-500/6',
    'from-emerald-500/6 via-background to-teal-500/8',
    'from-amber-500/6 via-background to-rose-500/8',
  ];

  return (
    <section className={`relative min-h-[92vh] overflow-hidden pt-16 ${hero.isRTL ? 'rtl' : 'ltr'}`}>
      {/* Multi-layer animated background */}
      <motion.div
        key={`bg-${current}`}
        className={`absolute inset-0 bg-gradient-to-br ${bgGradients[current]}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Animated mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
          animate={{
            x: ['-10%', '60%', '30%', '-10%'],
            y: ['10%', '50%', '80%', '10%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)' }}
          animate={{
            x: ['80%', '20%', '50%', '80%'],
            y: ['60%', '20%', '40%', '60%'],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating AI Provider orbs */}
      <FloatingOrbs activeSlide={current} />

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[75vh] z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: direction * 120, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 80, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-5 w-full"
          >
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-sm px-5 py-2 backdrop-blur-sm">
                {slide.badge}
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-8xl font-black leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-foreground">{slide.headline[0]}</span>
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {slide.headline[1]}
              </span>
            </motion.h1>

            <motion.p className="text-2xl md:text-3xl font-bold text-foreground/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {slide.subtitle}
            </motion.p>

            <motion.p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              {slide.description}
            </motion.p>

            {/* Platform slide */}
            {slide.type === 'platform' && (
              <motion.div className="space-y-6 pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {[
                    { value: stats.audienceReach, label: 'Audience Reach' },
                    { value: stats.dialects || stats.languages, label: stats.dialects ? 'Dialects' : 'Languages' },
                    { value: stats.costSavings, label: 'Cost Savings' },
                    { value: stats.localMetric.value, label: stats.localMetric.label },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                      whileHover={{ y: -3, scale: 1.03 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                    >
                      <p className="text-2xl font-black text-primary">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['7 Products', '206 Pipelines', '15 AI Providers'].map((item, i) => (
                    <motion.span
                      key={item}
                      className="px-3 py-1.5 bg-card/60 backdrop-blur-sm border border-border/40 rounded-full text-sm font-semibold text-muted-foreground"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 justify-center pt-2">
                  <Link to="/genie-studio-auth?tab=signup">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 text-lg px-8 py-6 rounded-xl">
                        {cta.primary}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/explore">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" variant="outline" className="border-border/60 text-muted-foreground hover:text-foreground hover:bg-card text-lg px-8 py-6 rounded-xl backdrop-blur-sm">
                        <Play className="mr-2 h-4 w-4" />
                        {cta.secondary}
                      </Button>
                    </motion.div>
                  </Link>
                </div>
                <p className="text-muted-foreground text-xs">{cta.freeCredits}</p>
              </motion.div>
            )}

            {/* Pipeline slide */}
            {slide.type === 'pipeline' && <AnimatedPipeline />}

            {/* Stats / Language slide */}
            {slide.type === 'stats' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-6">
                {[
                  { value: '140+', label: 'Languages', icon: Languages },
                  { value: '30+', label: 'Dialects', icon: Mic },
                  { value: '8', label: 'Regions', icon: Globe },
                  { value: 'RTL', label: 'Full Support', icon: Eye },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className="text-center p-5 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all group"
                      initial={{ opacity: 0, y: 20, rotateX: -15 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.3 + i * 0.12, type: 'spring' }}
                      whileHover={{ y: -5, scale: 1.05 }}
                    >
                      <Icon className="w-5 h-5 text-primary/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-3xl font-black text-primary">{stat.value}</p>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Comparison / Transcreation slide */}
            {slide.type === 'comparison' && (
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6">
                <motion.div
                  className="p-7 bg-card/60 backdrop-blur-sm rounded-2xl border border-destructive/20 text-left space-y-3 relative overflow-hidden"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/5 rounded-full blur-2xl" />
                  <p className="text-sm font-bold text-destructive uppercase tracking-wider">❌ Translation</p>
                  <p className="text-foreground font-medium text-lg">"Our product helps you save time and money."</p>
                  <p className="text-xs text-muted-foreground italic">Word-for-word. Literal. Generic.</p>
                </motion.div>
                <motion.div
                  className="p-7 bg-primary/5 backdrop-blur-sm rounded-2xl border border-primary/30 text-left space-y-3 relative overflow-hidden ring-1 ring-primary/10"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, type: 'spring' }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-primary/40" />
                  </motion.div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider">✅ Transcreation</p>
                  <p className="text-foreground font-medium text-lg" dir="rtl">"لأن وقتك أغلى من أي استثمار"</p>
                  <p className="text-xs text-muted-foreground italic" dir="ltr">Culturally adapted. Emotionally resonant.</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots with labels */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="group flex flex-col items-center gap-1.5"
          >
            <span className={`text-[10px] font-semibold transition-all duration-300 ${
              i === current ? 'text-primary opacity-100' : 'text-muted-foreground/0 group-hover:text-muted-foreground/60 opacity-0 group-hover:opacity-100'
            }`}>
              {['Platform', 'Pipeline', 'Languages', 'Transcreation'][i]}
            </span>
            <div className="relative">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? 'w-10 bg-primary shadow-lg shadow-primary/30' : 'w-2 bg-muted-foreground/25 group-hover:bg-muted-foreground/40'
              }`} />
              {i === current && (
                <motion.div
                  className="absolute inset-0 h-2 rounded-full bg-primary/40"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Rolling marquee */}
      <div className="absolute bottom-20 left-0 right-0 overflow-hidden z-10">
        <motion.div
          className="whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-10 text-sm font-semibold opacity-[0.08]">
              <span className="text-primary">✦</span>
              <span className="text-foreground">One Platform</span>
              <span className="text-primary">◈</span>
              <span className="text-foreground">Mind to Media</span>
              <span className="text-primary">◆</span>
              <span className="text-foreground">140+ Languages</span>
              <span className="text-primary">✦</span>
              <span className="text-foreground">Transcreation</span>
            </span>
          ))}
        </motion.div>
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
      <HeroCarousel config={config} productContext={productContext} />
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
