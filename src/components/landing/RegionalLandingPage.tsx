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
const RegionalHero: React.FC<{ config: RegionalConfig; productContext?: string | null }> = ({ config, productContext }) => {
  const { hero, stats, cta } = config;
  
  return (
    <section className={`relative ${hero.isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Primary Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Region badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <span className="text-2xl">{hero.flag}</span>
                <span className="text-muted-foreground text-sm">
                  {productContext 
                    ? `Genie ${productContext.charAt(0).toUpperCase() + productContext.slice(1)} for ${hero.regionName}`
                    : `Content optimized for ${hero.regionName}`
                  }
                </span>
              </div>
              {config.differentiators.heroBadge.includes('First') && (
                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-500/15 border border-yellow-500/30 rounded-full">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">
                    {config.differentiators.heroBadge}
                  </span>
                </div>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">One </span>
              <span className="text-primary">Platform.</span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-foreground">
                Every Market. The Only
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-foreground">
                One You Need.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground max-w-xl">
              AI-powered content production across 50+ industries in 140+ languages
            </p>

            {/* Transcreation message */}
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">
                Your content deserves more than word-for-word translation. Genie adapts tone,
                idioms, cultural references, and regional compliance — so your audience feels you were{' '}
                <span className="text-primary font-semibold underline">built for them</span>.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

            {/* Platform stats */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded">7 Products</span>
              <span>•</span>
              <span className="px-2 py-1 bg-muted rounded">206 Pipelines</span>
              <span>•</span>
              <span className="px-2 py-1 bg-muted rounded">15 AI Providers</span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
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
          </motion.div>

          {/* Right: Professional AI Video Showcase */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ProfessionalAvatarShowcase autoPlay={true} showControls={true} className="rounded-xl shadow-2xl" />
            <div className="absolute -top-4 -right-4 px-4 py-2 bg-primary rounded-lg shadow-lg animate-bounce z-20" style={{ animationDuration: '3s' }}>
              <p className="text-sm font-medium text-primary-foreground">🌍 {stats.dialects || stats.languages} Languages</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Embedded Marquee Banners ── */}
      <div className="relative pb-2 space-y-0">
        {/* Banner 1: For Every Industry ✦ Mind to Media */}
        <div className="overflow-hidden py-3 border-t border-border/40 bg-muted/30">
          <motion.div
            className="whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...Array(8)].map((_, i) => (
              <span key={`b1-${i}`} className="inline-flex items-center gap-5 mx-6 text-xl md:text-2xl font-black tracking-tight">
                <span className="text-primary">✦</span>
                <span className="text-foreground">For Every Industry</span>
                <span className="text-primary">✦</span>
                <span className="text-muted-foreground">Mind to</span>
                <span className="text-primary">Media</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Banner 2: We Speak Your Language • We Understand Your Market */}
        <div className="overflow-hidden py-2 bg-muted/20">
          <motion.div
            className="whitespace-nowrap"
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            {[...Array(8)].map((_, i) => (
              <span key={`b2-${i}`} className="inline-flex items-center gap-5 mx-6 text-base md:text-lg font-semibold">
                <span className="text-primary">We Speak Your Language.</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-muted-foreground">We Understand Your Market.</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Banner 3: Capability highlights */}
        <div className="overflow-hidden py-2 border-b border-border/40 bg-muted/10">
          <motion.div
            className="whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...Array(6)].map((_, i) => (
              <span key={`b3-${i}`} className="inline-flex items-center gap-5 mx-6 text-sm font-medium">
                <span className="text-primary/70">◆</span>
                <span className="text-muted-foreground">Transcreation, Not Translation</span>
                <span className="text-primary/70">◆</span>
                <span className="text-muted-foreground">50+ Industries</span>
                <span className="text-primary/70">◆</span>
                <span className="text-muted-foreground">140+ Languages</span>
                <span className="text-primary/70">◆</span>
                <span className="text-muted-foreground">First to Market</span>
                <span className="text-primary/70">◆</span>
                <span className="text-muted-foreground">Cultural Adaptation</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// INDUSTRIES SECTION
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
      <RegionalHero config={config} productContext={productContext} />
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
