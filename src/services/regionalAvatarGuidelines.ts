/**
 * Regional Avatar & Character Guidelines Registry
 * 
 * Comprehensive registry for avatar appearance, gesture, expression,
 * and voice guidelines by region.
 * 
 * Used across: Genie Vibe (Avatar generation), Deck (video exports), Arc (publishing)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type GenderOption = 'male' | 'female' | 'non-binary' | 'all';
export type EyeContactLevel = 'direct' | 'moderate' | 'indirect' | 'respectful' | 'same-gender-direct';
export type VoicePace = 'slow' | 'measured' | 'medium' | 'medium-fast' | 'fast' | 'polite';
export type FormalityLevel = 'casual' | 'semi-formal' | 'formal' | 'very-formal';

export interface AvatarAppearancePreference {
  regionCode: string;
  regionName: string;
  variant?: string; // e.g., 'Corporate' vs 'Startup'
  genderOptions: GenderOption[];
  ageRange: string;
  attireStyle: string;
  groomingAppearance: string;
  culturalNotes?: string;
}

export interface AvatarGestureGuideline {
  regionCode: string;
  handGestures: string[];
  facialExpressions: string[];
  eyeContact: EyeContactLevel;
  gestureIntensity: 'minimal' | 'subtle' | 'moderate' | 'expressive';
  avoid: string[];
}

export interface AvatarVoiceCharacteristic {
  regionCode: string;
  pace: VoicePace;
  tone: string[];
  formalityLevel: FormalityLevel;
  voiceType: string;
  accentPreference?: string;
  languageNotes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR APPEARANCE PREFERENCES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const AVATAR_APPEARANCE_PREFERENCES: Record<string, AvatarAppearancePreference> = {
  'US_CORPORATE': {
    regionCode: 'US',
    regionName: 'United States',
    variant: 'Corporate',
    genderOptions: ['male', 'female', 'non-binary'],
    ageRange: '28-55',
    attireStyle: 'Business professional to smart casual',
    groomingAppearance: 'Diverse ethnicities, professional grooming',
    culturalNotes: 'Inclusive representation expected',
  },
  'US_STARTUP': {
    regionCode: 'US',
    regionName: 'United States',
    variant: 'Startup',
    genderOptions: ['male', 'female', 'non-binary', 'all'],
    ageRange: '22-40',
    attireStyle: 'Casual, hoodies OK, tech worker style',
    groomingAppearance: 'Diverse, approachable, relatable',
    culturalNotes: 'Casual and authentic preferred',
  },
  'UK': {
    regionCode: 'UK',
    regionName: 'United Kingdom',
    genderOptions: ['male', 'female'],
    ageRange: '30-55',
    attireStyle: 'Formal business, suit/blazer',
    groomingAppearance: 'Polished, conservative, professional',
  },
  'DE': {
    regionCode: 'DE',
    regionName: 'Germany',
    genderOptions: ['male', 'female'],
    ageRange: '30-55',
    attireStyle: 'Formal professional',
    groomingAppearance: 'Neat, precise, serious demeanor',
    culturalNotes: 'Precision and competence emphasized',
  },
  'FR': {
    regionCode: 'FR',
    regionName: 'France',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Chic business, stylish',
    groomingAppearance: 'Fashionable, elegant, refined',
    culturalNotes: 'Style and sophistication valued',
  },
  'JP': {
    regionCode: 'JP',
    regionName: 'Japan',
    genderOptions: ['male', 'female'],
    ageRange: '28-55',
    attireStyle: 'Very formal business (suit)',
    groomingAppearance: 'Conservative, neat, respectful expression',
    culturalNotes: 'Formality and respect essential',
  },
  'KR': {
    regionCode: 'KR',
    regionName: 'South Korea',
    genderOptions: ['male', 'female'],
    ageRange: '25-45',
    attireStyle: 'Formal but modern/trendy',
    groomingAppearance: 'K-beauty aesthetic, youthful, well-groomed',
    culturalNotes: 'Modern K-style appreciated',
  },
  'CN': {
    regionCode: 'CN',
    regionName: 'China',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Professional formal',
    groomingAppearance: 'Prosperous look, well-dressed',
    culturalNotes: 'Success and prosperity imagery valued',
  },
  'IN': {
    regionCode: 'IN',
    regionName: 'India',
    genderOptions: ['male', 'female'],
    ageRange: '28-55',
    attireStyle: 'Western or traditional (kurta/sari option)',
    groomingAppearance: 'Diverse regions, professional, warm smile',
    culturalNotes: 'Regional diversity important',
  },
  'SA': {
    regionCode: 'SA',
    regionName: 'Saudi Arabia',
    genderOptions: ['male', 'female'],
    ageRange: '30-55',
    attireStyle: 'Thobe/suit for men, abaya/hijab for women',
    groomingAppearance: 'Respectful, professional, modest',
    culturalNotes: 'Modest dress required, male default for business',
  },
  'AE': {
    regionCode: 'AE',
    regionName: 'United Arab Emirates',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Traditional (kandura) or Western suit',
    groomingAppearance: 'Luxury appearance, professional',
    culturalNotes: 'International business style acceptable',
  },
  'EG': {
    regionCode: 'EG',
    regionName: 'Egypt',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Business formal, hijab optional',
    groomingAppearance: 'Warm, professional, approachable',
  },
  'NG': {
    regionCode: 'NG',
    regionName: 'Nigeria',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Western or traditional (Ankara, agbada)',
    groomingAppearance: 'Bold, confident, professional',
    culturalNotes: 'Traditional attire shows cultural pride',
  },
  'KE': {
    regionCode: 'KE',
    regionName: 'Kenya',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Business professional',
    groomingAppearance: 'Modern African professional',
  },
  'ZA': {
    regionCode: 'ZA',
    regionName: 'South Africa',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Business professional',
    groomingAppearance: 'Diverse, modern, professional',
    culturalNotes: 'Rainbow nation diversity appreciated',
  },
  'BR': {
    regionCode: 'BR',
    regionName: 'Brazil',
    genderOptions: ['male', 'female'],
    ageRange: '25-50',
    attireStyle: 'Business casual, friendly',
    groomingAppearance: 'Diverse, warm, approachable',
  },
  'MX': {
    regionCode: 'MX',
    regionName: 'Mexico',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Business professional',
    groomingAppearance: 'Friendly, professional, warm',
  },
  'ID': {
    regionCode: 'ID',
    regionName: 'Indonesia',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Batik or formal, hijab option',
    groomingAppearance: 'Professional, modest, warm',
    culturalNotes: 'Modest dress respectful',
  },
  'TH': {
    regionCode: 'TH',
    regionName: 'Thailand',
    genderOptions: ['male', 'female'],
    ageRange: '28-50',
    attireStyle: 'Conservative business',
    groomingAppearance: 'Respectful, professional, Buddhist-appropriate',
    culturalNotes: 'Avoid disrespecting monarchy',
  },
  'AU': {
    regionCode: 'AU',
    regionName: 'Australia',
    genderOptions: ['male', 'female', 'non-binary'],
    ageRange: '25-55',
    attireStyle: 'Smart casual to business',
    groomingAppearance: 'Relaxed, friendly, professional',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR GESTURE & EXPRESSION GUIDELINES
// ═══════════════════════════════════════════════════════════════════════════════

export const AVATAR_GESTURE_GUIDELINES: Record<string, AvatarGestureGuideline> = {
  'US': {
    regionCode: 'US',
    handGestures: ['Open palms', 'Thumbs up OK', 'Pointing OK'],
    facialExpressions: ['Confident smile', 'Animated'],
    eyeContact: 'direct',
    gestureIntensity: 'moderate',
    avoid: [],
  },
  'UK': {
    regionCode: 'UK',
    handGestures: ['Subtle gestures'],
    facialExpressions: ['Professional smile', 'Restrained'],
    eyeContact: 'moderate',
    gestureIntensity: 'subtle',
    avoid: ['Overly enthusiastic expressions'],
  },
  'DE': {
    regionCode: 'DE',
    handGestures: ['Minimal', 'Purposeful gestures'],
    facialExpressions: ['Serious', 'Competent', 'Slight smile OK'],
    eyeContact: 'direct',
    gestureIntensity: 'minimal',
    avoid: ['Excessive gesturing'],
  },
  'FR': {
    regionCode: 'FR',
    handGestures: ['Expressive', 'Elegant gestures'],
    facialExpressions: ['Warm', 'Sophisticated'],
    eyeContact: 'direct',
    gestureIntensity: 'expressive',
    avoid: ['Stiff presentation'],
  },
  'JP': {
    regionCode: 'JP',
    handGestures: ['Bow gesture', 'Two-handed giving'],
    facialExpressions: ['Subtle smile', 'Composed'],
    eyeContact: 'indirect',
    gestureIntensity: 'subtle',
    avoid: ['Pointing', 'OK sign (means money)'],
  },
  'KR': {
    regionCode: 'KR',
    handGestures: ['Two-handed giving/receiving'],
    facialExpressions: ['Professional smile', 'Friendly'],
    eyeContact: 'moderate',
    gestureIntensity: 'moderate',
    avoid: ['One-hand give to elders'],
  },
  'CN': {
    regionCode: 'CN',
    handGestures: ['Two-handed giving', 'Nodding'],
    facialExpressions: ['Composed', 'Professional'],
    eyeContact: 'moderate',
    gestureIntensity: 'moderate',
    avoid: ['Pointing with one finger'],
  },
  'IN': {
    regionCode: 'IN',
    handGestures: ['Namaste option', 'Head wobble OK'],
    facialExpressions: ['Warm smile', 'Welcoming'],
    eyeContact: 'respectful',
    gestureIntensity: 'moderate',
    avoid: ['Left hand giving'],
  },
  'SA': {
    regionCode: 'SA',
    handGestures: ['Right hand emphasis', 'Heart touch'],
    facialExpressions: ['Warm', 'Hospitable'],
    eyeContact: 'same-gender-direct',
    gestureIntensity: 'moderate',
    avoid: ['Left hand gestures', 'Thumbs up varies'],
  },
  'AE': {
    regionCode: 'AE',
    handGestures: ['Right hand emphasis', 'Heart touch'],
    facialExpressions: ['Warm', 'Professional'],
    eyeContact: 'same-gender-direct',
    gestureIntensity: 'moderate',
    avoid: ['Left hand gestures'],
  },
  'BR': {
    regionCode: 'BR',
    handGestures: ['Warm', 'Expressive gestures'],
    facialExpressions: ['Warm smile', 'Engaging'],
    eyeContact: 'direct',
    gestureIntensity: 'expressive',
    avoid: ['Cold/distant demeanor'],
  },
  'MX': {
    regionCode: 'MX',
    handGestures: ['Warm', 'Friendly gestures'],
    facialExpressions: ['Warm smile', 'Friendly'],
    eyeContact: 'direct',
    gestureIntensity: 'expressive',
    avoid: ['Cold/distant demeanor'],
  },
  'NG': {
    regionCode: 'NG',
    handGestures: ['Respectful gestures'],
    facialExpressions: ['Warm', 'Confident'],
    eyeContact: 'respectful',
    gestureIntensity: 'moderate',
    avoid: ['Varies by ethnic group'],
  },
  'KE': {
    regionCode: 'KE',
    handGestures: ['Respectful gestures'],
    facialExpressions: ['Warm', 'Confident'],
    eyeContact: 'respectful',
    gestureIntensity: 'moderate',
    avoid: [],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR VOICE CHARACTERISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export const AVATAR_VOICE_CHARACTERISTICS: Record<string, AvatarVoiceCharacteristic> = {
  'US': {
    regionCode: 'US',
    pace: 'medium-fast',
    tone: ['Confident', 'Clear', 'Engaging'],
    formalityLevel: 'semi-formal',
    voiceType: 'Clear General American',
  },
  'UK': {
    regionCode: 'UK',
    pace: 'measured',
    tone: ['Authoritative', 'Calm'],
    formalityLevel: 'formal',
    voiceType: 'RP or educated regional',
    accentPreference: 'Received Pronunciation',
  },
  'DE': {
    regionCode: 'DE',
    pace: 'measured',
    tone: ['Precise', 'Direct', 'Competent'],
    formalityLevel: 'formal',
    voiceType: 'Clear Hochdeutsch',
    accentPreference: 'Standard German',
  },
  'FR': {
    regionCode: 'FR',
    pace: 'medium',
    tone: ['Melodic', 'Refined', 'Warm'],
    formalityLevel: 'formal',
    voiceType: 'Parisian French',
  },
  'JP': {
    regionCode: 'JP',
    pace: 'polite',
    tone: ['Respectful', 'Calm'],
    formalityLevel: 'very-formal',
    voiceType: 'Standard Japanese NHK-style',
    languageNotes: 'Use keigo (honorific speech)',
  },
  'KR': {
    regionCode: 'KR',
    pace: 'medium',
    tone: ['Professional', 'Warm'],
    formalityLevel: 'formal',
    voiceType: 'Standard Seoul Korean',
    languageNotes: 'Use 존댓말 (formal speech)',
  },
  'CN': {
    regionCode: 'CN',
    pace: 'medium-fast',
    tone: ['Clear', 'Confident'],
    formalityLevel: 'formal',
    voiceType: 'Standard Mandarin (普通话)',
  },
  'SA': {
    regionCode: 'SA',
    pace: 'measured',
    tone: ['Warm', 'Dignified'],
    formalityLevel: 'formal',
    voiceType: 'Gulf Arabic or MSA',
    accentPreference: 'Gulf accent preferred',
  },
  'EG': {
    regionCode: 'EG',
    pace: 'medium-fast',
    tone: ['Warm', 'Engaging'],
    formalityLevel: 'semi-formal',
    voiceType: 'Egyptian Arabic',
    accentPreference: 'Cairo accent',
  },
  'IN': {
    regionCode: 'IN',
    pace: 'medium',
    tone: ['Warm', 'Clear'],
    formalityLevel: 'semi-formal',
    voiceType: 'Indian English or Hindi',
    languageNotes: 'Multiple regional options available',
  },
  'BR': {
    regionCode: 'BR',
    pace: 'medium-fast',
    tone: ['Warm', 'Friendly'],
    formalityLevel: 'semi-formal',
    voiceType: 'Brazilian Portuguese',
    accentPreference: 'São Paulo or Rio accent',
  },
  'NG': {
    regionCode: 'NG',
    pace: 'medium',
    tone: ['Confident', 'Clear'],
    formalityLevel: 'formal',
    voiceType: 'Nigerian English',
  },
  'MX': {
    regionCode: 'MX',
    pace: 'medium',
    tone: ['Warm', 'Friendly'],
    formalityLevel: 'semi-formal',
    voiceType: 'Mexican Spanish',
    accentPreference: 'Neutral Mexican',
  },
  'AU': {
    regionCode: 'AU',
    pace: 'medium',
    tone: ['Relaxed', 'Friendly', 'Clear'],
    formalityLevel: 'semi-formal',
    voiceType: 'Australian English',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get avatar appearance preferences for a region
 */
export function getAvatarAppearanceForRegion(
  regionCode: string,
  variant?: 'corporate' | 'startup'
): AvatarAppearancePreference {
  if (variant) {
    const variantKey = `${regionCode}_${variant.toUpperCase()}`;
    if (AVATAR_APPEARANCE_PREFERENCES[variantKey]) {
      return AVATAR_APPEARANCE_PREFERENCES[variantKey];
    }
  }
  return AVATAR_APPEARANCE_PREFERENCES[regionCode] || AVATAR_APPEARANCE_PREFERENCES['US_CORPORATE'];
}

/**
 * Get gesture guidelines for a region
 */
export function getAvatarGestureGuidelinesForRegion(regionCode: string): AvatarGestureGuideline {
  return AVATAR_GESTURE_GUIDELINES[regionCode] || AVATAR_GESTURE_GUIDELINES['US'];
}

/**
 * Get voice characteristics for a region
 */
export function getAvatarVoiceCharacteristicsForRegion(regionCode: string): AvatarVoiceCharacteristic {
  return AVATAR_VOICE_CHARACTERISTICS[regionCode] || AVATAR_VOICE_CHARACTERISTICS['US'];
}

/**
 * Build complete avatar configuration for a region
 */
export function buildAvatarConfigForRegion(
  regionCode: string,
  variant?: 'corporate' | 'startup'
): {
  appearance: AvatarAppearancePreference;
  gestures: AvatarGestureGuideline;
  voice: AvatarVoiceCharacteristic;
} {
  return {
    appearance: getAvatarAppearanceForRegion(regionCode, variant),
    gestures: getAvatarGestureGuidelinesForRegion(regionCode),
    voice: getAvatarVoiceCharacteristicsForRegion(regionCode),
  };
}

/**
 * Get recommended avatar style for content type and region
 */
export function getRecommendedAvatarStyle(
  regionCode: string,
  contentType: 'corporate' | 'training' | 'marketing' | 'social'
): {
  formality: FormalityLevel;
  gestureIntensity: 'minimal' | 'subtle' | 'moderate' | 'expressive';
  variant: 'corporate' | 'startup';
} {
  const formalityByContent: Record<string, FormalityLevel> = {
    'corporate': 'formal',
    'training': 'semi-formal',
    'marketing': 'semi-formal',
    'social': 'casual',
  };

  const intensityByContent: Record<string, 'minimal' | 'subtle' | 'moderate' | 'expressive'> = {
    'corporate': 'subtle',
    'training': 'moderate',
    'marketing': 'expressive',
    'social': 'expressive',
  };

  return {
    formality: formalityByContent[contentType] || 'semi-formal',
    gestureIntensity: intensityByContent[contentType] || 'moderate',
    variant: contentType === 'social' || contentType === 'marketing' ? 'startup' : 'corporate',
  };
}

/**
 * Validate avatar configuration against regional guidelines
 */
export function validateAvatarForRegion(
  avatarConfig: {
    gender?: GenderOption;
    attire?: string;
    gestures?: string[];
  },
  regionCode: string
): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const appearance = getAvatarAppearanceForRegion(regionCode);
  const gestures = getAvatarGestureGuidelinesForRegion(regionCode);
  
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check gender
  if (avatarConfig.gender && !appearance.genderOptions.includes(avatarConfig.gender)) {
    warnings.push(`Gender option '${avatarConfig.gender}' may not be typical for ${appearance.regionName}`);
    suggestions.push(`Consider: ${appearance.genderOptions.join(', ')}`);
  }

  // Check for avoided gestures
  if (avatarConfig.gestures) {
    for (const gesture of avatarConfig.gestures) {
      for (const avoided of gestures.avoid) {
        if (gesture.toLowerCase().includes(avoided.toLowerCase())) {
          warnings.push(`Gesture '${gesture}' should be avoided in ${appearance.regionName}: ${avoided}`);
        }
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  };
}

/**
 * Get all supported regions for avatars
 */
export function getSupportedAvatarRegions(): string[] {
  return [...new Set([
    ...Object.keys(AVATAR_APPEARANCE_PREFERENCES).map(k => k.split('_')[0]),
    ...Object.keys(AVATAR_GESTURE_GUIDELINES),
    ...Object.keys(AVATAR_VOICE_CHARACTERISTICS),
  ])];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const RegionalAvatarGuidelinesRegistry = {
  appearancePreferences: AVATAR_APPEARANCE_PREFERENCES,
  gestureGuidelines: AVATAR_GESTURE_GUIDELINES,
  voiceCharacteristics: AVATAR_VOICE_CHARACTERISTICS,
  getAppearanceForRegion: getAvatarAppearanceForRegion,
  getGestureGuidelinesForRegion: getAvatarGestureGuidelinesForRegion,
  getVoiceCharacteristicsForRegion: getAvatarVoiceCharacteristicsForRegion,
  buildConfigForRegion: buildAvatarConfigForRegion,
  getRecommendedStyle: getRecommendedAvatarStyle,
  validateForRegion: validateAvatarForRegion,
  getSupportedRegions: getSupportedAvatarRegions,
};

export default RegionalAvatarGuidelinesRegistry;
