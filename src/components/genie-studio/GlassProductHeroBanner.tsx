/**
 * GlassProductHeroBanner — Glassmorphic hero banner for all 7 Genie Suite products
 *
 * Features:
 * - Real glassmorphism: backdrop-blur-xl, frosted overlays, inner shine, glow orbs
 * - AI-generated or gradient+SVG fallback thumbnails (always shows something beautiful)
 * - Region/subregion-aware: adapts colors, patterns, cultural tone per user's zone
 * - Works for all 16 regions, 62 subregions, 85+ languages
 * - Uses LOCKED routing stack via routingEnforcementGateway
 * - RTL support for MENA/Hebrew regions
 * - Supabase-persisted region selection (same region flows Create → Produce → Publish)
 *
 * Products: Spark, Mind, Vibe, Deck, Hub, Cast, Ask Genie, Suite
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEcosystemRouting } from '@/hooks/useEcosystemRouting';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Brain, Film, Presentation, Target, Radio, MessageCircle, Palette,
  Globe, Cpu, Languages, Star, ArrowRight, ChevronRight, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateProductHeroThumbnail,
  getRegionVisualStyle,
  isRTLRegion,
  PRODUCT_HEROES,
  type GenieProduct,
  type ThumbnailResult,
} from '@/services/production/dashboardThumbnailService';
import { REGIONAL_SUB_REGIONS } from '@/config/regionalSubRegions';

// ── Product icon mapping ─────────────────────────────────────────────────────

const PRODUCT_ICONS: Record<GenieProduct, React.ReactNode> = {
  spark: <Sparkles className="w-5 h-5 text-white" />,
  mind: <Brain className="w-5 h-5 text-white" />,
  vibe: <Film className="w-5 h-5 text-white" />,
  deck: <Presentation className="w-5 h-5 text-white" />,
  hub: <Target className="w-5 h-5 text-white" />,
  cast: <Radio className="w-5 h-5 text-white" />,
  ask: <MessageCircle className="w-5 h-5 text-white" />,
  suite: <Palette className="w-5 h-5 text-white" />,
};

// ── Hook: AI thumbnail with gradient fallback ────────────────────────────────

function useProductHeroThumbnail(product: GenieProduct, regionCode: string) {
  return useQuery({
    queryKey: ['product-hero-thumb', product, regionCode],
    queryFn: () => generateProductHeroThumbnail(product, regionCode),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

// ── Resolve region from ecosystem routing ────────────────────────────────────

function useResolvedRegion(): { regionCode: string; countryCode: string; label: string; flag: string; culturalTone: string; zone: string; isRTL: boolean; llmProvider: string; ttsProvider: string } {
  const ecosystem = useEcosystemRouting();

  return useMemo(() => {
    const country = ecosystem.countryCode || 'US';
    const zone = ecosystem.zone || 'fallback';

    // Map country to subregion
    const countryToSubregion: Record<string, string> = {
      US: 'NAM_US', CA: 'NAM_CA', DE: 'EU_DACH', FR: 'EU_FRANCE', ES: 'EU_IBERIA', SE: 'EU_NORDIC', NL: 'EU_BENELUX', IT: 'EU_ITALY',
      AE: 'MENA_GULF', SA: 'MENA_GULF', EG: 'MENA_EGYPT', JO: 'MENA_LEVANT', MA: 'MENA_MAGHREB', IL: 'MENA_ISRAEL',
      IN: 'INDIA_PAN', CN: 'CJK_CN', JP: 'CJK_JP', KR: 'CJK_KR', TW: 'CJK_TW',
      MY: 'SEA_MALAY', TH: 'SEA_THAI', VN: 'SEA_VIET', PH: 'SEA_PHIL', SG: 'SEA_PAN',
      KE: 'AFRICA_EAST', NG: 'AFRICA_WEST', ZA: 'AFRICA_SOUTH',
      MX: 'LATAM_MX', BR: 'LATAM_BR', AR: 'LATAM_CONE', CO: 'LATAM_ANDES',
      AU: 'OCEANIA_AU', NZ: 'OCEANIA_NZ', TR: 'TURKEY_ISTANBUL', PK: 'PK_URDU', BD: 'BD_DHAKA',
    };
    const regionCode = countryToSubregion[country] || 'NAM_US';

    // Find subregion display info
    let label = 'Global';
    let flag = '🌐';
    let culturalTone = 'innovative-global';
    for (const group of Object.values(REGIONAL_SUB_REGIONS)) {
      const found = group.find(sr => sr.code === regionCode);
      if (found) {
        label = found.label;
        flag = found.flag;
        culturalTone = found.culturalTone;
        break;
      }
    }

    const routing = ecosystem.routing;
    return {
      regionCode,
      countryCode: country,
      label,
      flag,
      culturalTone,
      zone,
      isRTL: ecosystem.isRTL || isRTLRegion(regionCode),
      llmProvider: routing?.llm || 'Claude',
      ttsProvider: routing?.tts || 'Azure Neural',
    };
  }, [ecosystem]);
}

// ── Main Component ───────────────────────────────────────────────────────────

export interface GlassProductHeroBannerProps {
  product: GenieProduct;
  /** Override CTA text (default: product-specific) */
  ctaText?: string;
  /** Override CTA action */
  onCTAClick?: () => void;
  /** Show feature badges */
  showFeatures?: boolean;
  /** Show region context */
  showRegionContext?: boolean;
  /** Show AI provider info */
  showProviderInfo?: boolean;
  /** Compact mode (less padding) */
  compact?: boolean;
  className?: string;
}

const DEFAULT_CTA: Record<GenieProduct, string> = {
  spark: 'Create New Content',
  mind: 'Enhance Script',
  vibe: 'Start Production',
  deck: 'Create Presentation',
  hub: 'Open Command Center',
  cast: 'Publish Content',
  ask: 'Ask Genie',
  suite: 'Explore Suite',
};

export function GlassProductHeroBanner({
  product,
  ctaText,
  onCTAClick,
  showFeatures = true,
  showRegionContext = true,
  showProviderInfo = true,
  compact = false,
  className,
}: GlassProductHeroBannerProps) {
  const region = useResolvedRegion();
  const hero = PRODUCT_HEROES[product];
  const { data: thumb } = useProductHeroThumbnail(product, region.regionCode);
  const regionStyle = getRegionVisualStyle(region.regionCode);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.08]',
        region.isRTL && 'rtl',
        className,
      )}
      dir={region.isRTL ? 'rtl' : 'ltr'}
    >
      {/* Layer 1: AI thumbnail or gradient background */}
      <div className="absolute inset-0 z-0">
        {thumb?.imageUrl ? (
          <img
            src={thumb.imageUrl}
            alt={`${hero.name} hero`}
            className="w-full h-full object-cover opacity-25 blur-[2px] scale-105"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', hero.gradientFrom, hero.gradientVia, hero.gradientTo)} />
        )}
        {/* SVG pattern overlay */}
        {thumb?.svgPattern && (
          <div
            className="absolute inset-0 opacity-60"
            style={{ backgroundImage: thumb.svgPattern, backgroundRepeat: 'repeat' }}
          />
        )}
        {/* Glass frost */}
        <div className="absolute inset-0 backdrop-blur-xl bg-background/60" />
      </div>

      {/* Layer 2: Accent glow orbs */}
      <div className={cn(
        'absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20',
        hero.accentColor,
      )} />
      <div className={cn(
        'absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl opacity-10',
        hero.accentColor,
      )} />

      {/* Layer 3: Inner glass shine */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none z-[1]" />

      {/* Content */}
      <div className={cn('relative z-10', compact ? 'p-4' : 'p-6')}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: Product info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border backdrop-blur-md',
                hero.iconBg,
              )}>
                {PRODUCT_ICONS[product]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={cn('font-bold text-foreground', compact ? 'text-lg' : 'text-xl')}>
                    {hero.name}
                  </h1>
                  <span className="text-lg">{hero.emoji}</span>
                </div>
                <p className="text-xs text-muted-foreground/80 font-medium italic">{hero.tagline}</p>
              </div>
            </div>

            <p className={cn('text-muted-foreground leading-relaxed max-w-xl', compact ? 'text-xs' : 'text-sm')}>
              {hero.description}
            </p>

            {/* Feature badges */}
            {showFeatures && (
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                {hero.features.slice(0, compact ? 3 : 6).map(feature => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border backdrop-blur-sm bg-white/[0.04] border-white/[0.08] text-muted-foreground/70"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    {feature}
                  </span>
                ))}
              </div>
            )}

            {/* Region context + Provider info */}
            {(showRegionContext || showProviderInfo) && (
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {showRegionContext && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border backdrop-blur-sm bg-primary/5 border-primary/20 text-primary">
                    <Globe className="w-3 h-3" />
                    {region.flag} {region.label}
                  </div>
                )}
                {showProviderInfo && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border backdrop-blur-sm bg-white/[0.03] border-white/[0.06] text-muted-foreground/60">
                      <Cpu className="w-3 h-3" /> LLM: {region.llmProvider}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border backdrop-blur-sm bg-white/[0.03] border-white/[0.06] text-muted-foreground/60">
                      <Languages className="w-3 h-3" /> TTS: {region.ttsProvider}
                    </div>
                  </>
                )}
                {showRegionContext && region.culturalTone && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border backdrop-blur-sm bg-amber-500/5 border-amber-500/15 text-amber-300/70">
                    <Star className="w-3 h-3" /> {region.culturalTone}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: CTA button */}
          {onCTAClick && (
            <Button
              onClick={onCTAClick}
              size={compact ? 'default' : 'lg'}
              className={cn(
                'gap-2 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0',
                'bg-gradient-to-r',
                hero.gradientFrom.replace('/30', ''), hero.gradientTo.replace('/10', ''),
              )}
            >
              <Sparkles className="w-4 h-4" />
              {ctaText || DEFAULT_CTA[product]}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── All-Products Hero Grid ───────────────────────────────────────────────────

export interface AllProductsHeroGridProps {
  onProductClick?: (product: GenieProduct) => void;
  className?: string;
}

/**
 * Displays hero banners for ALL 7 Genie Suite products in a glassmorphic grid.
 * Each banner is region-aware with AI thumbnail backgrounds.
 */
export function AllProductsHeroGrid({ onProductClick, className }: AllProductsHeroGridProps) {
  const products: GenieProduct[] = ['spark', 'mind', 'vibe', 'deck', 'hub', 'cast', 'ask'];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Suite-level hero */}
      <GlassProductHeroBanner
        product="suite"
        onCTAClick={onProductClick ? () => onProductClick('suite') : undefined}
        showFeatures
        showRegionContext
        showProviderInfo
      />

      {/* Individual product heroes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {products.map(product => (
          <GlassProductHeroBanner
            key={product}
            product={product}
            compact
            showFeatures
            showRegionContext={false}
            showProviderInfo={false}
            onCTAClick={onProductClick ? () => onProductClick(product) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default GlassProductHeroBanner;
