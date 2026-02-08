/**
 * REGIONAL LANDING PAGE
 * 
 * Fully transcreated landing page per region.
 * Renders region-specific content: hero, providers, industries, language demo, pricing, SEO.
 * English is always present alongside native language content.
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, Play, Sparkles, Check, Globe, Zap, Users, 
  ChevronRight, Volume2, Shield, Cpu
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
const RegionalHero: React.FC<{ config: RegionalConfig }> = ({ config }) => {
  const { hero, stats, cta } = config;
  
  return (
    <section className={`relative min-h-[85vh] flex items-center pt-16 ${hero.isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Region badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <span className="text-2xl">{hero.flag}</span>
              <span className="text-muted-foreground text-sm">Content optimized for {hero.regionName}</span>
            </div>

            {/* Native headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {hero.nativeHeadline}
              </span>
            </h1>

            {/* English subtitle if different from native */}
            {hero.nativeHeadline !== hero.englishHeadline && (
              <p className="text-lg text-muted-foreground/80 italic">
                {hero.englishHeadline}
              </p>
            )}

            {/* Native subheadline */}
            <p className="text-xl text-muted-foreground max-w-xl">
              {hero.nativeSubheadline}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stats.audienceReach}</p>
                <p className="text-xs text-muted-foreground">Audience Reach</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-primary">{stats.dialects || stats.languages}</p>
                <p className="text-xs text-muted-foreground">{stats.dialects ? 'Dialects' : 'Languages'}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-accent">{stats.costSavings}</p>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
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
              <span className="px-2 py-1 bg-muted rounded">12 AI Providers</span>
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
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
                  <Play className="mr-2 h-4 w-4" />
                  {cta.secondary}
                </Button>
              </Link>
            </div>

            <p className="text-muted-foreground text-sm">{cta.freeCredits}</p>
          </motion.div>

          {/* Right: Zone-based AI routing visualization */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">AI Routing for {hero.regionName}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                We automatically select the best AI provider for your region and task
              </p>
              <div className="space-y-3">
                {config.zoneProviders.map((provider, i) => (
                  <motion.div
                    key={provider.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{provider.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{provider.task}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{provider.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
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
          Built for {config.hero.regionName} Industries
        </h2>
        <p className="text-lg text-muted-foreground">
          Transcreated content for your specific market and compliance needs
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
    </div>
  </section>
);

// ============================================
// TRANSCREATION SHOWCASE
// ============================================
const TranscreationShowcase: React.FC<{ config: RegionalConfig }> = ({ config }) => (
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          True Transcreation. Not Translation.
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          We adapt meaning, culture, and context — making content feel native to each audience.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">{config.languageShowcase.tabLabel}</h3>
          </div>
          <div className="divide-y divide-border">
            {config.languageShowcase.languages.map((lang, i) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{lang.nativeName}</span>
                    <Badge variant="outline" className="text-[10px]">{lang.region}</Badge>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    <Volume2 className="h-3 w-3 mr-1" />
                    {lang.azureVoice.split('-').slice(0, 2).join('-')}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase mb-1">
                      ✓ Transcreated
                    </p>
                    <p className={`text-sm text-foreground ${config.hero.isRTL ? 'text-right' : ''}`}>
                      {lang.transcreation}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-red-500 uppercase mb-1">
                      ✗ Literal Translation
                    </p>
                    <p className={`text-sm text-muted-foreground line-through ${config.hero.isRTL ? 'text-right' : ''}`}>
                      {lang.literal}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// REGION NAVIGATOR
// ============================================
const RegionNavigator: React.FC<{ currentSlug: RegionSlug }> = ({ currentSlug }) => {
  const allSlugs = getAllRegionSlugs();
  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
          Explore Other Regions
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {allSlugs.map(slug => {
            const r = REGIONAL_CONFIGS[slug];
            const isActive = slug === currentSlug;
            return (
              <Link
                key={slug}
                to={`/genie-landing/${slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                }`}
              >
                {r.hero.flag} {r.hero.regionName}
              </Link>
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
      <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
        Mind to Media.
        <br />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {config.hero.regionName}.
        </span>
      </h2>
      
      <p className="text-xl text-muted-foreground mb-4">
        {config.socialProof}
      </p>
      <p className="text-lg text-green-600 dark:text-green-400 mb-8">
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
            Schedule Demo
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
        <Link to="/genie-landing" className="text-muted-foreground hover:text-foreground transition flex items-center gap-1">
          <Globe className="h-4 w-4" />
          {config.hero.flag}
        </Link>
        <Link to="/products" className="text-muted-foreground hover:text-foreground transition">Products</Link>
        <Link to="/explore" className="text-muted-foreground hover:text-foreground transition">Explore</Link>
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
// MAIN COMPONENT
// ============================================
export const RegionalLandingPage: React.FC = () => {
  const { region } = useParams<{ region: string }>();

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
      <RegionalHero config={config} />
      <RegionNavigator currentSlug={regionSlug} />
      <RegionalIndustries config={config} />
      <TranscreationShowcase config={config} />
      <RegionalCTAFooter config={config} />
    </main>
  );
};

export default RegionalLandingPage;
