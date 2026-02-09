/**
 * REGIONAL LANDING PAGE
 * 
 * Fully transcreated landing page per region.
 * Renders region-specific content: hero, providers, industries, language demo, pricing, SEO.
 * English is always present alongside native language content.
 */

import React, { useState } from 'react';
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, Play, Sparkles, Globe,
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
// HERO SECTION
// ============================================
// ============================================
// UNIFIED HERO CAROUSEL — All 4 heroes rolling left-to-right
// ============================================
const HeroCarousel: React.FC<{ config: RegionalConfig; productContext?: string | null }> = ({ config, productContext }) => {
  const { hero, stats, cta } = config;
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  const slides = [
    // Slide 0 — One Platform. Every Market.
    {
      id: 'platform',
      badge: `${hero.flag} ${productContext ? `Genie ${productContext.charAt(0).toUpperCase() + productContext.slice(1)} for ${hero.regionName}` : `Content optimized for ${hero.regionName}`}`,
      headline: ['One ', 'Platform.'],
      subtitle: 'Every Market. The Only One You Need.',
      description: 'AI-powered content production across 50+ industries in 140+ languages',
      type: 'platform' as const,
      bg: 'from-primary/5 via-background to-accent/5',
      accent: 'bg-primary/10',
    },
    // Slide 1 — Mind to Media
    {
      id: 'mind-to-media',
      badge: '✦ End-to-End Content Production',
      headline: ['Mind to ', 'Media'],
      subtitle: 'For Every Industry',
      description: 'From the first spark of an idea to polished, market-ready content — across video, presentations, audio, and documents.',
      type: 'pills' as const,
      pills: ['Ideation', 'Scripting', 'Production', 'Localization', 'Distribution'],
      bg: 'from-primary/8 via-background to-accent/5',
      accent: 'bg-primary/8',
    },
    // Slide 2 — We Speak Your Language
    {
      id: 'language',
      badge: '🌍 140+ Languages · 8 Global Regions',
      headline: ['We Speak Your ', 'Language.'],
      subtitle: 'We Understand Your Market.',
      description: 'Not just translation — we adapt tone, idioms, humor, cultural references, and regional compliance so your audience feels you were built for them.',
      type: 'stats' as const,
      stats: [
        { value: '140+', label: 'Languages' },
        { value: '30+', label: 'Dialects' },
        { value: '8', label: 'Regions' },
        { value: 'RTL', label: 'Full Support' },
      ],
      bg: 'from-accent/5 via-background to-primary/8',
      accent: 'bg-accent/8',
    },
    // Slide 3 — Transcreation
    {
      id: 'transcreation',
      badge: '🚀 First to Market',
      headline: ['Transcreation, ', 'Not Translation.'],
      subtitle: 'Cultural Adaptation at Scale',
      description: 'Translation converts words. Transcreation converts meaning — intent, emotion, and cultural context for every target market.',
      type: 'comparison' as const,
      comparison: {
        bad: { label: '❌ Translation', text: '"Our product helps you save time and money."', note: 'Word-for-word. Literal. Generic.' },
        good: { label: '✅ Transcreation', text: '"لأن وقتك أغلى من أي استثمار"', note: 'Culturally adapted. Emotionally resonant.' },
      },
      bg: 'from-primary/5 via-background to-accent/8',
      accent: 'bg-primary/6',
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

  return (
    <section className={`relative min-h-[85vh] overflow-hidden pt-16 ${hero.isRTL ? 'rtl' : 'ltr'}`}>
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-700`} />
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${slide.accent} rounded-full blur-3xl animate-pulse transition-all duration-700`} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: direction * 150 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center space-y-6 w-full"
        >
          {/* Badge */}
          <Badge variant="outline" className="border-primary/40 text-primary text-sm px-4 py-1.5">
            {slide.badge}
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight">
            <span className="text-foreground">{slide.headline[0]}</span>
            <span className="text-primary">{slide.headline[1]}</span>
          </h1>

          <p className="text-2xl md:text-3xl font-bold text-foreground">{slide.subtitle}</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{slide.description}</p>

          {/* Platform slide — region stats + CTA */}
          {slide.type === 'platform' && (
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-xl border border-border max-w-xl mx-auto">
                <p className="text-sm text-muted-foreground">
                  Your content deserves more than word-for-word translation. Genie adapts tone,
                  idioms, cultural references, and regional compliance — so your audience feels you were{' '}
                  <span className="text-primary font-semibold underline">built for them</span>.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <div className="text-center p-3 bg-card rounded-xl border border-border">
                  <p className="text-2xl font-bold text-foreground">{stats.audienceReach}</p>
                  <p className="text-xs text-muted-foreground">Audience Reach</p>
                </div>
                <div className="text-center p-3 bg-card rounded-xl border border-border">
                  <p className="text-2xl font-bold text-primary">{stats.dialects || stats.languages}</p>
                  <p className="text-xs text-muted-foreground">{stats.dialects ? 'Dialects' : 'Languages'}</p>
                </div>
                <div className="text-center p-3 bg-card rounded-xl border border-border">
                  <p className="text-2xl font-bold text-primary">{stats.costSavings}</p>
                  <p className="text-xs text-muted-foreground">Cost Savings</p>
                </div>
                <div className="text-center p-3 bg-card rounded-xl border border-border">
                  <p className="text-2xl font-bold text-foreground">{stats.localMetric.value}</p>
                  <p className="text-xs text-muted-foreground">{stats.localMetric.label}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-muted rounded">7 Products</span>
                <span>•</span>
                <span className="px-2 py-1 bg-muted rounded">206 Pipelines</span>
                <span>•</span>
                <span className="px-2 py-1 bg-muted rounded">15 AI Providers</span>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/genie-studio-auth?tab=signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-lg px-8 py-6">
                    {cta.primary}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/explore">
                  <Button size="lg" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted text-lg px-8 py-6">
                    <Play className="mr-2 h-4 w-4" />
                    {cta.secondary}
                  </Button>
                </Link>
              </div>
              <p className="text-muted-foreground text-xs">{cta.freeCredits}</p>
            </div>
          )}

          {/* Pills slide */}
          {slide.type === 'pills' && 'pills' in slide && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {(slide as any).pills.map((pill: string, i: number) => (
                <span key={pill} className="inline-flex items-center gap-2">
                  <span className="px-4 py-2 bg-card border border-border rounded-full text-sm font-semibold text-foreground">
                    {pill}
                  </span>
                  {i < (slide as any).pills.length - 1 && <ArrowRight className="w-4 h-4 text-primary/50" />}
                </span>
              ))}
            </div>
          )}

          {/* Stats slide */}
          {slide.type === 'stats' && 'stats' in slide && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
              {(slide as any).stats.map((stat: { value: string; label: string }) => (
                <div key={stat.label} className="text-center p-3 bg-card rounded-xl border border-border">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comparison slide */}
          {slide.type === 'comparison' && 'comparison' in slide && (
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
              <div className="p-6 bg-card rounded-2xl border border-border text-left space-y-3">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{(slide as any).comparison.bad.label}</p>
                <p className="text-foreground font-medium">{(slide as any).comparison.bad.text}</p>
                <p className="text-xs text-muted-foreground">{(slide as any).comparison.bad.note}</p>
              </div>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 text-left space-y-3">
                <p className="text-sm font-bold text-primary uppercase tracking-wider">{(slide as any).comparison.good.label}</p>
                <p className="text-foreground font-medium">{(slide as any).comparison.good.text}</p>
                <p className="text-xs text-muted-foreground">{(slide as any).comparison.good.note}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Scrolling marquee */}
      <div className="absolute bottom-14 left-0 right-0 overflow-hidden">
        <motion.div
          className="whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-6 mx-8 text-sm font-semibold opacity-20">
              <span className="text-primary">✦</span>
              <span className="text-foreground">One Platform</span>
              <span className="text-primary">•</span>
              <span className="text-foreground">Mind to Media</span>
              <span className="text-primary">•</span>
              <span className="text-foreground">We Speak Your Language</span>
              <span className="text-primary">◆</span>
              <span className="text-foreground">Transcreation, Not Translation</span>
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
