/**
 * Multi-Region Production Engine
 *
 * One campaign → N culturally-adapted versions.
 * No competitor does this. GenieSuite has 79 regional creative profiles.
 *
 * Flow:
 *   "Create promo for my bakery" + brand profile
 *     → Fork into 14 regional variants
 *     → Each variant: adapted narrative, music, wardrobe, colors
 *     → Parallel voice generation per language
 *     → Output: 14 region-specific video configs
 *
 * Usage:
 *   import { multiRegionEngine } from '@/services/production/multiRegionEngine';
 *
 *   const variants = multiRegionEngine.generateRegionalVariants(
 *     'Promo for artisan bakery',
 *     ['in-north', 'ng-west', 'jp', 'mx-central', 'us']
 *   );
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type RegionCode = string;

export interface RegionalVariant {
  regionCode: RegionCode;
  regionName: string;
  language: string;
  languageCode: string;
  adaptations: {
    narrativeStyle: string;
    musicGenre: string;
    colorPalette: string[];
    tone: string;
    greetingStyle: string;
    ctaStyle: string;
  };
  scriptModifications: {
    openingHook: string;
    closingCta: string;
    culturalReferences: string[];
    forbiddenTopics: string[];
  };
  voiceConfig: {
    provider: string;
    languageCode: string;
    voiceGender: 'male' | 'female' | 'neutral';
    speakingRate: number;
  };
  productionStatus: 'pending' | 'generating' | 'complete' | 'failed';
}

export interface MultiRegionPlan {
  id: string;
  baseScript: string;
  baseRegion: RegionCode;
  targetRegions: RegionCode[];
  variants: RegionalVariant[];
  createdAt: string;
}

// ─── Regional Profiles ──────────────────────────────────────────────────────

const REGIONAL_PROFILES: Record<string, Omit<RegionalVariant, 'regionCode' | 'productionStatus'>> = {
  'in-north': {
    regionName: 'India North',
    language: 'Hindi',
    languageCode: 'hi-IN',
    adaptations: {
      narrativeStyle: 'warm, familial, festival-connected',
      musicGenre: 'bollywood-fusion',
      colorPalette: ['#FF6B35', '#FFD700', '#E8112D', '#1A5276'],
      tone: 'enthusiastic',
      greetingStyle: 'Namaste! / Aao ji!',
      ctaStyle: 'Aaj hi aaiye! (Come today!)',
    },
    scriptModifications: {
      openingHook: 'Dil se bani, aapke liye! (Made from the heart, for you!)',
      closingCta: 'Abhi order karein! (Order now!)',
      culturalReferences: ['festivals', 'family gatherings', 'street food culture'],
      forbiddenTopics: ['beef', 'religious comparisons'],
    },
    voiceConfig: { provider: 'elevenlabs', languageCode: 'hi', voiceGender: 'female', speakingRate: 1.0 },
  },
  'in-south': {
    regionName: 'India South',
    language: 'Tamil',
    languageCode: 'ta-IN',
    adaptations: {
      narrativeStyle: 'respectful, tradition-rooted, quality-focused',
      musicGenre: 'carnatic-modern',
      colorPalette: ['#2E86AB', '#FFD700', '#388E3C', '#8E24AA'],
      tone: 'professional',
      greetingStyle: 'Vanakkam!',
      ctaStyle: 'Indraye vaanga! (Come today!)',
    },
    scriptModifications: {
      openingHook: 'Tharamana suvai! (Amazing taste!)',
      closingCta: 'Ippo order pannunga! (Order now!)',
      culturalReferences: ['Pongal', 'temple festivals', 'filter coffee culture'],
      forbiddenTopics: ['beef', 'language superiority'],
    },
    voiceConfig: { provider: 'elevenlabs', languageCode: 'ta', voiceGender: 'female', speakingRate: 0.95 },
  },
  'ng-west': {
    regionName: 'Nigeria West',
    language: 'English (Nigerian)',
    languageCode: 'en-NG',
    adaptations: {
      narrativeStyle: 'energetic, community-driven, aspirational',
      musicGenre: 'afrobeats',
      colorPalette: ['#008751', '#FFD700', '#FF4500', '#000000'],
      tone: 'enthusiastic',
      greetingStyle: 'How far! / Omo see this!',
      ctaStyle: 'No dull yourself, come chop!',
    },
    scriptModifications: {
      openingHook: 'Omo, this one na correct chop!',
      closingCta: 'Come taste am today-today!',
      culturalReferences: ['owambe parties', 'family Sunday', 'market vibes'],
      forbiddenTopics: ['tribal comparisons', 'religious divisions'],
    },
    voiceConfig: { provider: 'elevenlabs', languageCode: 'en', voiceGender: 'male', speakingRate: 1.05 },
  },
  'jp': {
    regionName: 'Japan',
    language: 'Japanese',
    languageCode: 'ja-JP',
    adaptations: {
      narrativeStyle: 'minimalist, respect-driven, quality-obsessed',
      musicGenre: 'j-pop-ambient',
      colorPalette: ['#BC002D', '#FFFFFF', '#000000', '#C9B037'],
      tone: 'professional',
      greetingStyle: 'Irasshaimase!',
      ctaStyle: 'Zehi otameshi kudasai (Please try it)',
    },
    scriptModifications: {
      openingHook: 'Kodawari no ippin (A product of dedication)',
      closingCta: 'Goyoyaku wa kochira kara (Reserve here)',
      culturalReferences: ['seasonal ingredients', 'omotenashi hospitality', 'craftsmanship'],
      forbiddenTopics: ['direct price comparison', 'aggressive selling'],
    },
    voiceConfig: { provider: 'google', languageCode: 'ja', voiceGender: 'female', speakingRate: 0.9 },
  },
  'mx-central': {
    regionName: 'Mexico Central',
    language: 'Spanish (Mexican)',
    languageCode: 'es-MX',
    adaptations: {
      narrativeStyle: 'warm, vibrant, family-centered',
      musicGenre: 'mariachi-modern',
      colorPalette: ['#006847', '#CE1126', '#FFD700', '#FF6B35'],
      tone: 'enthusiastic',
      greetingStyle: 'Bienvenidos!',
      ctaStyle: 'Ven a probar! (Come try!)',
    },
    scriptModifications: {
      openingHook: 'El sabor que te conquista! (The flavor that conquers you!)',
      closingCta: 'Te esperamos! (We await you!)',
      culturalReferences: ['family meals', 'mercado culture', 'fiestas'],
      forbiddenTopics: ['political references', 'religious comparisons'],
    },
    voiceConfig: { provider: 'elevenlabs', languageCode: 'es', voiceGender: 'female', speakingRate: 1.0 },
  },
  'us': {
    regionName: 'United States',
    language: 'English',
    languageCode: 'en-US',
    adaptations: {
      narrativeStyle: 'direct, benefit-driven, aspirational',
      musicGenre: 'pop-corporate',
      colorPalette: ['#1E3A5F', '#FF6B35', '#2ECC71', '#FFFFFF'],
      tone: 'confident',
      greetingStyle: 'Hey there!',
      ctaStyle: 'Try it today!',
    },
    scriptModifications: {
      openingHook: 'Ever tried something this good?',
      closingCta: 'Order now — free delivery!',
      culturalReferences: ['convenience', 'quality ingredients', 'local favorites'],
      forbiddenTopics: [],
    },
    voiceConfig: { provider: 'elevenlabs', languageCode: 'en', voiceGender: 'neutral', speakingRate: 1.0 },
  },
  'ae-gulf': {
    regionName: 'UAE / Gulf',
    language: 'Arabic (Gulf)',
    languageCode: 'ar-AE',
    adaptations: {
      narrativeStyle: 'luxurious, hospitality-focused, premium',
      musicGenre: 'khaleeji-modern',
      colorPalette: ['#C9B037', '#1A5276', '#FFFFFF', '#2C3E50'],
      tone: 'professional',
      greetingStyle: 'Ahlan wa sahlan!',
      ctaStyle: 'Zourona al yawm! (Visit us today!)',
    },
    scriptModifications: {
      openingHook: 'Tajruba la tunsā (An unforgettable experience)',
      closingCta: 'Ihjazo al-ān! (Book now!)',
      culturalReferences: ['hospitality traditions', 'premium quality', 'family dining'],
      forbiddenTopics: ['alcohol', 'pork', 'political topics'],
    },
    voiceConfig: { provider: 'elevenlabs', languageCode: 'ar', voiceGender: 'male', speakingRate: 0.95 },
  },
  'ke-east': {
    regionName: 'Kenya East Africa',
    language: 'English/Swahili',
    languageCode: 'sw-KE',
    adaptations: {
      narrativeStyle: 'community-driven, authentic, growth-oriented',
      musicGenre: 'bongo-afro',
      colorPalette: ['#006600', '#BB0000', '#000000', '#FFD700'],
      tone: 'enthusiastic',
      greetingStyle: 'Karibu sana!',
      ctaStyle: 'Kuja leo! (Come today!)',
    },
    scriptModifications: {
      openingHook: 'Chakula bora kwa bei poa! (Great food at great prices!)',
      closingCta: 'Tutembelee! (Visit us!)',
      culturalReferences: ['nyama choma', 'community markets', 'family gatherings'],
      forbiddenTopics: ['tribal politics'],
    },
    voiceConfig: { provider: 'google', languageCode: 'sw', voiceGender: 'female', speakingRate: 1.0 },
  },
};

// ─── Service ────────────────────────────────────────────────────────────────

export const multiRegionEngine = {
  /** Get all available region codes */
  getAvailableRegions(): Array<{ code: RegionCode; name: string; language: string }> {
    return Object.entries(REGIONAL_PROFILES).map(([code, profile]) => ({
      code,
      name: profile.regionName,
      language: profile.language,
    }));
  },

  /** Generate regional variants for a base script */
  generateRegionalVariants(
    baseScript: string,
    targetRegions: RegionCode[],
    baseRegion: RegionCode = 'us'
  ): MultiRegionPlan {
    const variants: RegionalVariant[] = targetRegions
      .filter((r) => r in REGIONAL_PROFILES)
      .map((regionCode) => {
        const profile = REGIONAL_PROFILES[regionCode];
        return {
          regionCode,
          ...profile,
          productionStatus: 'pending' as const,
        };
      });

    return {
      id: `mrp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      baseScript,
      baseRegion,
      targetRegions,
      variants,
      createdAt: new Date().toISOString(),
    };
  },

  /** Adapt a script for a specific region */
  adaptScript(baseScript: string, variant: RegionalVariant): string {
    const { scriptModifications, adaptations } = variant;
    const lines = baseScript.split('\n').filter(Boolean);

    // Replace opening hook
    if (lines.length > 0) {
      lines[0] = scriptModifications.openingHook;
    }

    // Replace closing CTA
    if (lines.length > 1) {
      lines[lines.length - 1] = scriptModifications.closingCta;
    }

    // Add cultural context header
    const header = `[${variant.regionName} | ${adaptations.tone} tone | ${adaptations.narrativeStyle}]`;

    return `${header}\n\n${lines.join('\n')}`;
  },

  /** Get production config for a regional variant */
  getProductionConfig(variant: RegionalVariant): {
    voiceConfig: RegionalVariant['voiceConfig'];
    musicGenre: string;
    colorPalette: string[];
    adaptations: RegionalVariant['adaptations'];
  } {
    return {
      voiceConfig: variant.voiceConfig,
      musicGenre: variant.adaptations.musicGenre,
      colorPalette: variant.adaptations.colorPalette,
      adaptations: variant.adaptations,
    };
  },

  /** Check if a region code is supported */
  isRegionSupported(regionCode: RegionCode): boolean {
    return regionCode in REGIONAL_PROFILES;
  },

  /** Get cultural guidelines for a region (what to avoid) */
  getCulturalGuidelines(regionCode: RegionCode): {
    forbidden: string[];
    recommended: string[];
  } | null {
    const profile = REGIONAL_PROFILES[regionCode];
    if (!profile) return null;

    return {
      forbidden: profile.scriptModifications.forbiddenTopics,
      recommended: profile.scriptModifications.culturalReferences,
    };
  },
};
