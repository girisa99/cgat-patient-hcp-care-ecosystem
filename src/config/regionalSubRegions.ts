/**
 * REGIONAL SUB-REGIONS CONFIG
 * 
 * Sub-region/dialect selector data for each parent region.
 * Used by landing page dialect selector and dynamic transcreation.
 * Aligned with regionConfig.ts 16-parent, 56-zone hierarchy.
 */

export interface SubRegionOption {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  dialect?: string;
  culturalTone: string;
  emotionalRegister: string;
}

export const REGIONAL_SUB_REGIONS: Record<string, SubRegionOption[]> = {
  nam: [
    { code: 'NAM_US', label: 'United States', nativeLabel: 'United States', flag: '🇺🇸', culturalTone: 'confident-innovative', emotionalRegister: 'aspirational' },
    { code: 'NAM_CA', label: 'Canada', nativeLabel: 'Canada', flag: '🇨🇦', culturalTone: 'inclusive-progressive', emotionalRegister: 'warm-professional' },
  ],
  europe: [
    { code: 'EU_DACH', label: 'Germany/Austria/Swiss', nativeLabel: 'DACH', flag: '🇩🇪', culturalTone: 'precise-engineering', emotionalRegister: 'trust-efficiency' },
    { code: 'EU_FRANCE', label: 'France', nativeLabel: 'France', flag: '🇫🇷', culturalTone: 'elegant-intellectual', emotionalRegister: 'refined-sophistication' },
    { code: 'EU_IBERIA', label: 'Spain/Portugal', nativeLabel: 'Iberia', flag: '🇪🇸', culturalTone: 'passionate-expressive', emotionalRegister: 'warmth-community' },
    { code: 'EU_NORDIC', label: 'Nordic', nativeLabel: 'Norden', flag: '🇸🇪', culturalTone: 'minimalist-functional', emotionalRegister: 'understated-trust' },
    { code: 'EU_BENELUX', label: 'Benelux', nativeLabel: 'Benelux', flag: '🇳🇱', culturalTone: 'direct-pragmatic', emotionalRegister: 'no-nonsense-value' },
    { code: 'EU_ITALY', label: 'Italy', nativeLabel: 'Italia', flag: '🇮🇹', culturalTone: 'artisan-creative', emotionalRegister: 'passionate-beauty' },
  ],
  mena: [
    { code: 'MENA_GULF', label: 'Gulf States', nativeLabel: 'الخليج', flag: '🇦🇪', dialect: 'Khaleeji', culturalTone: 'aspirational-luxury', emotionalRegister: 'prestige-vision' },
    { code: 'MENA_LEVANT', label: 'Levant', nativeLabel: 'المشرق', flag: '🇱🇧', dialect: 'Levantine', culturalTone: 'cosmopolitan-creative', emotionalRegister: 'artistic-resilience' },
    { code: 'MENA_EGYPT', label: 'Egypt', nativeLabel: 'مصر', flag: '🇪🇬', dialect: 'Egyptian', culturalTone: 'witty-relatable', emotionalRegister: 'humor-warmth' },
    { code: 'MENA_MAGHREB', label: 'North Africa', nativeLabel: 'المغرب العربي', flag: '🇲🇦', dialect: 'Darija', culturalTone: 'vibrant-multicultural', emotionalRegister: 'pride-modernity' },
    { code: 'MENA_IRAQ', label: 'Iraq', nativeLabel: 'العراق', flag: '🇮🇶', dialect: 'Iraqi', culturalTone: 'heritage-forward', emotionalRegister: 'strength-renewal' },
    { code: 'MENA_YEMEN', label: 'Yemen', nativeLabel: 'اليمن', flag: '🇾🇪', dialect: 'Yemeni', culturalTone: 'poetic-traditional', emotionalRegister: 'dignity-connection' },
    { code: 'MENA_ISRAEL', label: 'Israel', nativeLabel: 'ישראל', flag: '🇮🇱', culturalTone: 'startup-chutzpah', emotionalRegister: 'bold-innovation' },
  ],
  india: [
    { code: 'INDIA_NORTH', label: 'North India', nativeLabel: 'उत्तर भारत', flag: '🇮🇳', dialect: 'Hindi Belt', culturalTone: 'bollywood-warm', emotionalRegister: 'family-aspiration' },
    { code: 'INDIA_SOUTH', label: 'South India', nativeLabel: 'தென் இந்தியா', flag: '🇮🇳', dialect: 'Dravidian', culturalTone: 'tech-heritage', emotionalRegister: 'pride-excellence' },
    { code: 'INDIA_EAST', label: 'East India', nativeLabel: 'পূর্ব ভারত', flag: '🇮🇳', dialect: 'Bengali/Odia', culturalTone: 'intellectual-artistic', emotionalRegister: 'cultural-depth' },
    { code: 'INDIA_WEST', label: 'West India', nativeLabel: 'पश्चिम भारत', flag: '🇮🇳', dialect: 'Gujarati/Marathi', culturalTone: 'entrepreneurial-vibrant', emotionalRegister: 'business-community' },
    { code: 'INDIA_PAN', label: 'Pan-India', nativeLabel: 'भारत', flag: '🇮🇳', culturalTone: 'unity-diversity', emotionalRegister: 'national-pride' },
  ],
  africa: [
    { code: 'AFRICA_EAST', label: 'East Africa', nativeLabel: 'Afrika Mashariki', flag: '🇰🇪', culturalTone: 'mobile-first-hustle', emotionalRegister: 'opportunity-growth' },
    { code: 'AFRICA_WEST', label: 'West Africa', nativeLabel: 'Afrique de l\'Ouest', flag: '🇳🇬', culturalTone: 'nollywood-vibrant', emotionalRegister: 'creativity-community' },
    { code: 'AFRICA_SOUTH', label: 'Southern Africa', nativeLabel: 'Southern Africa', flag: '🇿🇦', culturalTone: 'rainbow-nation', emotionalRegister: 'resilience-innovation' },
    { code: 'AFRICA_NORTH', label: 'North Africa', nativeLabel: 'شمال أفريقيا', flag: '🇪🇬', culturalTone: 'crossroads-modern', emotionalRegister: 'bridge-cultures' },
    { code: 'AFRICA_FRANCO', label: 'Francophone Africa', nativeLabel: 'Afrique francophone', flag: '🇸🇳', culturalTone: 'francophone-elegant', emotionalRegister: 'sophistication-unity' },
  ],
  sea: [
    { code: 'SEA_MALAY', label: 'Malaysia/Indonesia', nativeLabel: 'Melayu', flag: '🇲🇾', culturalTone: 'halal-economy', emotionalRegister: 'community-prosperity' },
    { code: 'SEA_THAI', label: 'Thailand', nativeLabel: 'ไทย', flag: '🇹🇭', culturalTone: 'sabai-creative', emotionalRegister: 'harmony-beauty' },
    { code: 'SEA_VIET', label: 'Vietnam', nativeLabel: 'Việt Nam', flag: '🇻🇳', culturalTone: 'dynamic-rising', emotionalRegister: 'ambition-resilience' },
    { code: 'SEA_PHIL', label: 'Philippines', nativeLabel: 'Pilipinas', flag: '🇵🇭', dialect: 'Taglish', culturalTone: 'bayanihan-warm', emotionalRegister: 'family-joy' },
    { code: 'SEA_PAN', label: 'Singapore/Pan-SEA', nativeLabel: 'Singapore', flag: '🇸🇬', culturalTone: 'kiasu-excellence', emotionalRegister: 'efficiency-premium' },
  ],
  cjk: [
    { code: 'CJK_CN', label: 'China', nativeLabel: '中国', flag: '🇨🇳', culturalTone: 'guochao-modern', emotionalRegister: 'national-pride-tech' },
    { code: 'CJK_JP', label: 'Japan', nativeLabel: '日本', flag: '🇯🇵', culturalTone: 'omotenashi-precision', emotionalRegister: 'respect-craftsmanship' },
    { code: 'CJK_KR', label: 'Korea', nativeLabel: '한국', flag: '🇰🇷', culturalTone: 'hallyu-trendy', emotionalRegister: 'cool-innovation' },
    { code: 'CJK_TW', label: 'Taiwan', nativeLabel: '台灣', flag: '🇹🇼', culturalTone: 'creative-artisan', emotionalRegister: 'warmth-quality' },
  ],
  latam: [
    { code: 'LATAM_MX', label: 'Mexico', nativeLabel: 'México', flag: '🇲🇽', culturalTone: 'calidez-creativa', emotionalRegister: 'warmth-humor' },
    { code: 'LATAM_BR', label: 'Brazil', nativeLabel: 'Brasil', flag: '🇧🇷', culturalTone: 'jeitinho-brasileiro', emotionalRegister: 'joy-rhythm' },
    { code: 'LATAM_CONE', label: 'Southern Cone', nativeLabel: 'Cono Sur', flag: '🇦🇷', culturalTone: 'porteño-intellectual', emotionalRegister: 'passion-debate' },
    { code: 'LATAM_ANDES', label: 'Andean', nativeLabel: 'Andino', flag: '🇨🇴', culturalTone: 'andean-authentic', emotionalRegister: 'heritage-progress' },
    { code: 'LATAM_CARIB', label: 'Caribbean Coast', nativeLabel: 'Caribe', flag: '🇻🇪', culturalTone: 'tropical-energetic', emotionalRegister: 'celebration-life' },
  ],
  caribbean: [
    { code: 'CARIBBEAN_EN', label: 'English Caribbean', nativeLabel: 'Caribbean', flag: '🇯🇲', culturalTone: 'island-vibes', emotionalRegister: 'irie-confidence' },
    { code: 'CARIBBEAN_FR', label: 'French Caribbean', nativeLabel: 'Caraïbes', flag: '🇭🇹', culturalTone: 'créole-fusion', emotionalRegister: 'artistic-resilience' },
  ],
  oceania: [
    { code: 'OCEANIA_AU', label: 'Australia', nativeLabel: 'Australia', flag: '🇦🇺', culturalTone: 'no-worries-direct', emotionalRegister: 'mateship-authenticity' },
    { code: 'OCEANIA_NZ', label: 'New Zealand', nativeLabel: 'Aotearoa', flag: '🇳🇿', culturalTone: 'kiwi-inclusive', emotionalRegister: 'aroha-sustainability' },
  ],
  turkey: [
    { code: 'TURKEY_ISTANBUL', label: 'Istanbul/Marmara', nativeLabel: 'İstanbul', flag: '🇹🇷', culturalTone: 'cosmopolitan-bridge', emotionalRegister: 'ambition-heritage' },
    { code: 'TURKEY_ANATOLIA', label: 'Anatolia', nativeLabel: 'Anadolu', flag: '🇹🇷', culturalTone: 'heartland-authentic', emotionalRegister: 'roots-modernity' },
  ],
  pakistan: [
    { code: 'PK_PUNJAB', label: 'Punjab', nativeLabel: 'پنجاب', flag: '🇵🇰', dialect: 'Punjabi', culturalTone: 'josh-energy', emotionalRegister: 'family-celebration' },
    { code: 'PK_SINDH', label: 'Sindh', nativeLabel: 'سندھ', flag: '🇵🇰', dialect: 'Sindhi', culturalTone: 'sufi-depth', emotionalRegister: 'mystical-heritage' },
    { code: 'PK_KPK', label: 'KPK/Pashto', nativeLabel: 'خیبر پختونخوا', flag: '🇵🇰', dialect: 'Pashto', culturalTone: 'pashtunwali-honor', emotionalRegister: 'courage-hospitality' },
    { code: 'PK_URDU', label: 'Urdu National', nativeLabel: 'اردو', flag: '🇵🇰', dialect: 'Standard Urdu', culturalTone: 'adab-refined', emotionalRegister: 'elegance-respect' },
  ],
  bangladesh: [
    { code: 'BD_DHAKA', label: 'Dhaka/Standard', nativeLabel: 'ঢাকা', flag: '🇧🇩', dialect: 'Standard Bengali', culturalTone: 'modern-urban', emotionalRegister: 'progress-youth' },
    { code: 'BD_CHITTAGONG', label: 'Chittagong', nativeLabel: 'চট্টগ্রাম', flag: '🇧🇩', dialect: 'Chittagongian', culturalTone: 'port-city-trade', emotionalRegister: 'enterprise-resilience' },
  ],
  eastern_europe: [
    { code: 'EE_UKRAINE', label: 'Ukraine', nativeLabel: 'Україна', flag: '🇺🇦', culturalTone: 'resilient-tech', emotionalRegister: 'strength-innovation' },
    { code: 'EE_BALKANS', label: 'Balkans', nativeLabel: 'Balkani', flag: '🇷🇸', culturalTone: 'bridge-cultures', emotionalRegister: 'passionate-authentic' },
    { code: 'EE_CAUCASUS', label: 'Caucasus', nativeLabel: 'კავკასია', flag: '🇬🇪', culturalTone: 'ancient-modern', emotionalRegister: 'pride-hospitality' },
  ],
  central_asia: [
    { code: 'CA_KZ', label: 'Kazakhstan', nativeLabel: 'Қазақстан', flag: '🇰🇿', culturalTone: 'steppe-ambition', emotionalRegister: 'vision-scale' },
    { code: 'CA_UZ', label: 'Uzbekistan', nativeLabel: 'Oʻzbekiston', flag: '🇺🇿', culturalTone: 'silk-road-revival', emotionalRegister: 'heritage-transformation' },
    { code: 'CA_AZ', label: 'Azerbaijan', nativeLabel: 'Azərbaycan', flag: '🇦🇿', culturalTone: 'crossroads-energy', emotionalRegister: 'fire-innovation' },
  ],
  south_asia: [
    { code: 'SA_NEPAL', label: 'Nepal', nativeLabel: 'नेपाल', flag: '🇳🇵', culturalTone: 'himalayan-humble', emotionalRegister: 'community-growth' },
    { code: 'SA_SRILANKA', label: 'Sri Lanka', nativeLabel: 'ශ්‍රී ලංකා', flag: '🇱🇰', culturalTone: 'island-resilience', emotionalRegister: 'serendipity-renewal' },
    { code: 'SA_BHUTAN', label: 'Bhutan', nativeLabel: 'འབྲུག', flag: '🇧🇹', culturalTone: 'gnh-mindful', emotionalRegister: 'happiness-balance' },
    { code: 'SA_MALDIVES', label: 'Maldives', nativeLabel: 'ދިވެހިރާއްޖެ', flag: '🇲🇻', culturalTone: 'paradise-premium', emotionalRegister: 'luxury-sustainability' },
  ],
};

/**
 * Get sub-regions for a given parent region slug
 */
export function getSubRegionsForRegion(regionSlug: string): SubRegionOption[] {
  return REGIONAL_SUB_REGIONS[regionSlug] || [];
}

/**
 * Get cultural tone descriptor for a sub-region
 */
export function getCulturalTone(regionSlug: string, subRegionCode?: string): string {
  const subRegions = REGIONAL_SUB_REGIONS[regionSlug];
  if (subRegionCode && subRegions) {
    const match = subRegions.find(sr => sr.code === subRegionCode);
    if (match) return match.culturalTone;
  }
  return subRegions?.[0]?.culturalTone || 'neutral-professional';
}
