/**
 * Combination Teaser Service
 * 
 * PURPOSE: Smart teaser system to showcase premium combination features
 * - Shows watermarked previews at strategic intervals
 * - Rotates through different combination types (3D, Avatar, Immersive, Animation)
 * - Tracks user preferences via like/dislike
 * - Feeds data to Label Studio for AI learning
 * 
 * STRATEGY:
 * - First generation: Show video/animation teaser
 * - Second generation: Show avatar teaser
 * - Third generation: Show 3D/immersive teaser
 * - Rotate and personalize based on engagement
 */

import { labelStudioService } from './labelStudioBackgroundService';

// ============================================
// TYPES
// ============================================

export type CombinationType = 
  | 'animated_slides'
  | 'avatar_narrator'
  | '3d_elements'
  | 'immersive_journey'
  | 'kinetic_typography'
  | 'data_visualization'
  | 'talking_photo'
  | 'full_body_avatar';

export type TeaserScope = 'per_slide' | 'full_deck' | 'infographic' | 'journey_flow';

export interface TeaserPreview {
  id: string;
  combinationType: CombinationType;
  scope: TeaserScope;
  title: string;
  description: string;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  durationSeconds: number; // 30 or 60 seconds
  watermarkText: string;
  creditCost: number;
  tier: 'pro' | 'business' | 'enterprise';
}

export interface TeaserEngagement {
  teaserId: string;
  combinationType: CombinationType;
  action: 'like' | 'dislike' | 'skip' | 'interested' | 'not_now';
  timestamp: string;
  generationNumber: number; // Which generation this was shown on
  context: {
    industry?: string;
    contentType?: string;
    slideNumber?: number;
  };
}

export interface UserTeaserProfile {
  userId: string;
  generationCount: number;
  lastTeaserShown: CombinationType | null;
  lastTeaserTimestamp: string | null;
  preferences: Record<CombinationType, number>; // Score -100 to +100
  dismissedForSession: CombinationType[];
  convertedTypes: CombinationType[]; // Types user has purchased/used
}

// ============================================
// TEASER CATALOG
// ============================================

export const TEASER_CATALOG: Record<CombinationType, TeaserPreview> = {
  animated_slides: {
    id: 'teaser_animated_slides',
    combinationType: 'animated_slides',
    scope: 'full_deck',
    title: 'Animated Slide Transitions',
    description: 'Transform static slides into cinematic experiences with smooth animations, zoom effects, and dynamic transitions',
    thumbnailUrl: '/teasers/animated-slides-thumb.jpg',
    previewVideoUrl: '/teasers/animated-slides-30s.mp4',
    durationSeconds: 30,
    watermarkText: 'PREVIEW • Upgrade to Pro for full access',
    creditCost: 50,
    tier: 'pro'
  },
  avatar_narrator: {
    id: 'teaser_avatar_narrator',
    combinationType: 'avatar_narrator',
    scope: 'full_deck',
    title: 'AI Avatar Narrator',
    description: 'A professional AI presenter explains your content with natural gestures and expressions',
    thumbnailUrl: '/teasers/avatar-narrator-thumb.jpg',
    previewVideoUrl: '/teasers/avatar-narrator-30s.mp4',
    durationSeconds: 30,
    watermarkText: 'PREVIEW • Unlock AI Avatars with Pro',
    creditCost: 100,
    tier: 'pro'
  },
  '3d_elements': {
    id: 'teaser_3d_elements',
    combinationType: '3d_elements',
    scope: 'per_slide',
    title: '3D Product Visualization',
    description: 'Interactive 3D models that viewers can rotate and explore within your presentation',
    thumbnailUrl: '/teasers/3d-elements-thumb.jpg',
    previewVideoUrl: '/teasers/3d-elements-30s.mp4',
    durationSeconds: 30,
    watermarkText: 'PREVIEW • 3D Elements in Business tier',
    creditCost: 150,
    tier: 'business'
  },
  immersive_journey: {
    id: 'teaser_immersive_journey',
    combinationType: 'immersive_journey',
    scope: 'journey_flow',
    title: 'Immersive Story Journey',
    description: 'Take viewers on an emotional journey with spatial transitions, ambient audio, and cinematic storytelling',
    thumbnailUrl: '/teasers/immersive-journey-thumb.jpg',
    previewVideoUrl: '/teasers/immersive-journey-60s.mp4',
    durationSeconds: 60,
    watermarkText: 'PREVIEW • Immersive mode in Business',
    creditCost: 200,
    tier: 'business'
  },
  kinetic_typography: {
    id: 'teaser_kinetic_typography',
    combinationType: 'kinetic_typography',
    scope: 'per_slide',
    title: 'Kinetic Typography',
    description: 'Words come alive with motion - perfect for quotes, key messages, and emotional impact',
    thumbnailUrl: '/teasers/kinetic-type-thumb.jpg',
    previewVideoUrl: '/teasers/kinetic-type-30s.mp4',
    durationSeconds: 30,
    watermarkText: 'PREVIEW • Kinetic Text in Pro',
    creditCost: 40,
    tier: 'pro'
  },
  data_visualization: {
    id: 'teaser_data_viz',
    combinationType: 'data_visualization',
    scope: 'per_slide',
    title: 'Animated Data Stories',
    description: 'Charts and graphs that animate to reveal insights, making complex data engaging and memorable',
    thumbnailUrl: '/teasers/data-viz-thumb.jpg',
    previewVideoUrl: '/teasers/data-viz-30s.mp4',
    durationSeconds: 30,
    watermarkText: 'PREVIEW • Animated Charts in Pro',
    creditCost: 60,
    tier: 'pro'
  },
  talking_photo: {
    id: 'teaser_talking_photo',
    combinationType: 'talking_photo',
    scope: 'per_slide',
    title: 'Talking Photo Presenter',
    description: 'Bring any photo to life - historical figures, team photos, or product mascots that speak your message',
    thumbnailUrl: '/teasers/talking-photo-thumb.jpg',
    previewVideoUrl: '/teasers/talking-photo-30s.mp4',
    durationSeconds: 30,
    watermarkText: 'PREVIEW • Talking Photos in Pro',
    creditCost: 80,
    tier: 'pro'
  },
  full_body_avatar: {
    id: 'teaser_full_body_avatar',
    combinationType: 'full_body_avatar',
    scope: 'full_deck',
    title: 'Full-Body AI Presenter',
    description: 'A custom full-body avatar that walks, gestures, and presents your entire deck professionally',
    thumbnailUrl: '/teasers/full-body-thumb.jpg',
    previewVideoUrl: '/teasers/full-body-60s.mp4',
    durationSeconds: 60,
    watermarkText: 'PREVIEW • Full-Body Avatar in Business',
    creditCost: 300,
    tier: 'business'
  }
};

// ============================================
// TEASER SEQUENCE STRATEGY
// ============================================

// Which teaser to show based on generation count (rotating strategy)
const TEASER_SEQUENCE: CombinationType[][] = [
  // Generation 1: Start with animation (lowest barrier)
  ['animated_slides', 'kinetic_typography'],
  // Generation 2: Show avatar (high perceived value)
  ['avatar_narrator', 'talking_photo'],
  // Generation 3: Show data viz (practical value)
  ['data_visualization', 'animated_slides'],
  // Generation 4: Show 3D (wow factor)
  ['3d_elements', 'kinetic_typography'],
  // Generation 5: Show immersive (premium experience)
  ['immersive_journey', 'full_body_avatar'],
  // Generation 6+: Personalized based on engagement
];

// Interval between teasers (don't show every time)
const TEASER_INTERVAL = {
  minGenerationsBetween: 2, // Show teaser every 2-3 generations
  maxPerSession: 3, // Don't show more than 3 teasers per session
  cooldownAfterDismiss: 5, // Wait 5 generations after "not interested"
};

// ============================================
// SERVICE CLASS
// ============================================

class CombinationTeaserService {
  private static instance: CombinationTeaserService;
  private userProfile: UserTeaserProfile | null = null;
  private sessionTeaserCount: number = 0;
  private sessionStartTime: string = new Date().toISOString();

  private constructor() {
    this.loadUserProfile();
  }

  static getInstance(): CombinationTeaserService {
    if (!CombinationTeaserService.instance) {
      CombinationTeaserService.instance = new CombinationTeaserService();
    }
    return CombinationTeaserService.instance;
  }

  /**
   * Determine if we should show a teaser and which one
   */
  shouldShowTeaser(context: {
    generationNumber: number;
    userTier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
    industry?: string;
    contentType?: string;
  }): TeaserPreview | null {
    // Don't show teasers to business+ users (they have access to most features)
    if (['business', 'enterprise'].includes(context.userTier)) {
      return null;
    }

    // Check session limits
    if (this.sessionTeaserCount >= TEASER_INTERVAL.maxPerSession) {
      return null;
    }

    // Check generation interval
    const profile = this.getUserProfile();
    if (context.generationNumber < TEASER_INTERVAL.minGenerationsBetween) {
      return null;
    }

    // Check if enough generations since last teaser
    const generationsSinceLast = context.generationNumber - (profile.generationCount || 0);
    if (generationsSinceLast < TEASER_INTERVAL.minGenerationsBetween) {
      return null;
    }

    // Select appropriate teaser
    const teaser = this.selectTeaser(context, profile);
    return teaser;
  }

  /**
   * Select the best teaser based on context and user history
   */
  private selectTeaser(
    context: { generationNumber: number; userTier: string; industry?: string },
    profile: UserTeaserProfile
  ): TeaserPreview | null {
    // Get sequence index (wrap around)
    const sequenceIndex = Math.min(context.generationNumber - 1, TEASER_SEQUENCE.length - 1);
    const candidates = TEASER_SEQUENCE[sequenceIndex] || TEASER_SEQUENCE[0];

    // Filter out dismissed types
    const available = candidates.filter(type => 
      !profile.dismissedForSession.includes(type) &&
      !profile.convertedTypes.includes(type)
    );

    if (available.length === 0) {
      return null;
    }

    // Sort by user preference score (highest first)
    const sorted = available.sort((a, b) => 
      (profile.preferences[b] || 0) - (profile.preferences[a] || 0)
    );

    // Return highest-scored available teaser
    const selectedType = sorted[0];
    return TEASER_CATALOG[selectedType] || null;
  }

  /**
   * Record user engagement with teaser
   */
  recordEngagement(engagement: TeaserEngagement): void {
    const profile = this.getUserProfile();
    
    // Update preference score based on action
    const scoreChange = {
      'like': 20,
      'interested': 30,
      'skip': -5,
      'not_now': -10,
      'dislike': -25
    }[engagement.action];

    profile.preferences[engagement.combinationType] = 
      Math.max(-100, Math.min(100, 
        (profile.preferences[engagement.combinationType] || 0) + scoreChange
      ));

    // Track dismissals
    if (['dislike', 'not_now'].includes(engagement.action)) {
      profile.dismissedForSession.push(engagement.combinationType);
    }

    // Update generation tracking
    profile.generationCount = engagement.generationNumber;
    profile.lastTeaserShown = engagement.combinationType;
    profile.lastTeaserTimestamp = engagement.timestamp;

    // Increment session counter
    this.sessionTeaserCount++;

    // Save profile
    this.saveUserProfile(profile);

    // Send to Label Studio for AI learning
    this.sendToLabelStudio(engagement);
  }

  /**
   * Mark a combination type as converted (user purchased/used)
   */
  markAsConverted(combinationType: CombinationType): void {
    const profile = this.getUserProfile();
    if (!profile.convertedTypes.includes(combinationType)) {
      profile.convertedTypes.push(combinationType);
      this.saveUserProfile(profile);
    }
  }

  /**
   * Send engagement data to Label Studio for AI learning
   */
  private sendToLabelStudio(engagement: TeaserEngagement): void {
    labelStudioService.recordEvent({
      eventType: 'thumbnail_chosen', // Reusing existing event type
      context: {
        product: 'spark', // Teaser system spans products
        contentType: engagement.combinationType,
        originalValue: `teaser_${engagement.combinationType}`,
        selectedValue: engagement.action,
        userAction: engagement.action === 'like' || engagement.action === 'interested' 
          ? 'accept' 
          : engagement.action === 'dislike' 
            ? 'reject' 
            : 'ignore'
      },
      metadata: {
        teaserId: engagement.teaserId,
        generationNumber: engagement.generationNumber,
        ...engagement.context
      }
    });
  }

  /**
   * Get teaser recommendations based on content context
   */
  getContextualRecommendations(context: {
    industry?: string;
    contentType?: string;
    slideCount?: number;
    hasData?: boolean;
    hasPeople?: boolean;
    hasProducts?: boolean;
  }): CombinationType[] {
    const recommendations: CombinationType[] = [];

    // Data-heavy content → animated data viz
    if (context.hasData) {
      recommendations.push('data_visualization');
    }

    // People/team content → avatar or talking photo
    if (context.hasPeople) {
      recommendations.push('avatar_narrator', 'talking_photo');
    }

    // Product content → 3D elements
    if (context.hasProducts) {
      recommendations.push('3d_elements');
    }

    // Long decks → full-body avatar
    if ((context.slideCount || 0) > 10) {
      recommendations.push('full_body_avatar');
    }

    // Storytelling industries → immersive journey
    const storyIndustries = ['entertainment', 'education', 'nonprofit', 'tourism'];
    if (context.industry && storyIndustries.includes(context.industry.toLowerCase())) {
      recommendations.push('immersive_journey');
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('animated_slides', 'kinetic_typography');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Get all available teasers for the catalog view
   */
  getAllTeasers(): TeaserPreview[] {
    return Object.values(TEASER_CATALOG);
  }

  /**
   * Get teasers filtered by tier accessibility
   */
  getTeasersForTier(userTier: string): TeaserPreview[] {
    const tierOrder = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];
    const userTierIndex = tierOrder.indexOf(userTier);

    return Object.values(TEASER_CATALOG).filter(teaser => {
      const teaserTierIndex = tierOrder.indexOf(teaser.tier);
      return teaserTierIndex > userTierIndex; // Only show teasers for higher tiers
    });
  }

  // ============================================
  // PROFILE PERSISTENCE
  // ============================================

  private getUserProfile(): UserTeaserProfile {
    if (this.userProfile) return this.userProfile;
    return this.loadUserProfile();
  }

  private loadUserProfile(): UserTeaserProfile {
    try {
      const stored = localStorage.getItem('teaser_profile');
      if (stored) {
        this.userProfile = JSON.parse(stored);
        // Reset session-specific data
        this.userProfile!.dismissedForSession = [];
        return this.userProfile!;
      }
    } catch (e) {
      console.debug('[TeaserService] Failed to load profile');
    }

    // Default profile
    this.userProfile = {
      userId: '',
      generationCount: 0,
      lastTeaserShown: null,
      lastTeaserTimestamp: null,
      preferences: {} as Record<CombinationType, number>,
      dismissedForSession: [],
      convertedTypes: []
    };

    return this.userProfile;
  }

  private saveUserProfile(profile: UserTeaserProfile): void {
    this.userProfile = profile;
    try {
      localStorage.setItem('teaser_profile', JSON.stringify(profile));
    } catch (e) {
      console.debug('[TeaserService] Failed to save profile');
    }
  }

  /**
   * Reset session data (call when user starts new session)
   */
  resetSession(): void {
    this.sessionTeaserCount = 0;
    this.sessionStartTime = new Date().toISOString();
    if (this.userProfile) {
      this.userProfile.dismissedForSession = [];
    }
  }
}

// ============================================
// EXPORTS
// ============================================

export const combinationTeaserService = CombinationTeaserService.getInstance();

// React hook interface
export function useCombinationTeaser() {
  return {
    shouldShowTeaser: combinationTeaserService.shouldShowTeaser.bind(combinationTeaserService),
    recordEngagement: combinationTeaserService.recordEngagement.bind(combinationTeaserService),
    markAsConverted: combinationTeaserService.markAsConverted.bind(combinationTeaserService),
    getContextualRecommendations: combinationTeaserService.getContextualRecommendations.bind(combinationTeaserService),
    getAllTeasers: combinationTeaserService.getAllTeasers.bind(combinationTeaserService),
    getTeasersForTier: combinationTeaserService.getTeasersForTier.bind(combinationTeaserService),
    resetSession: combinationTeaserService.resetSession.bind(combinationTeaserService),
    TEASER_CATALOG
  };
}
