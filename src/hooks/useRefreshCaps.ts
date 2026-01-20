/**
 * useRefreshCaps Hook - Manages regeneration/refresh limits
 * Tracks per-slide and per-presentation refresh counts
 */

import { useState, useCallback, useMemo } from 'react';

// Default caps by tier
export const REFRESH_CAPS_BY_TIER: Record<string, { slideLevel: number; presentationLevel: number; enhanceLevel: number }> = {
  free: { slideLevel: 3, presentationLevel: 10, enhanceLevel: 5 },
  starter: { slideLevel: 6, presentationLevel: 20, enhanceLevel: 10 },
  professional: { slideLevel: 15, presentationLevel: 50, enhanceLevel: 25 },
  enterprise: { slideLevel: Infinity, presentationLevel: Infinity, enhanceLevel: Infinity },
};

export interface RefreshState {
  slideRefreshes: Record<string, number>; // slideId -> count
  presentationRefreshes: number;
  slideEnhancements: Record<string, number>; // slideId -> count
}

export interface RefreshCaps {
  slideLevel: number;
  presentationLevel: number;
  enhanceLevel: number;
}

export interface UseRefreshCapsOptions {
  presentationId?: string;
  userTier?: string;
  customCaps?: Partial<RefreshCaps>;
  onCapReached?: (capType: 'slide' | 'presentation' | 'enhance', id?: string) => void;
}

export interface UseRefreshCapsReturn {
  // State
  state: RefreshState;
  caps: RefreshCaps;
  
  // Queries
  canRefreshSlide: (slideId: string) => boolean;
  canRefreshPresentation: () => boolean;
  canEnhanceSlide: (slideId: string) => boolean;
  getSlideRefreshCount: (slideId: string) => number;
  getSlideRefreshRemaining: (slideId: string) => number;
  getPresentationRefreshRemaining: () => number;
  getSlideEnhanceRemaining: (slideId: string) => number;
  
  // Actions
  recordSlideRefresh: (slideId: string) => boolean;
  recordPresentationRefresh: () => boolean;
  recordSlideEnhance: (slideId: string) => boolean;
  resetSlideRefresh: (slideId: string) => void;
  resetAllRefreshes: () => void;
  
  // Utilities
  isUnlimited: boolean;
}

export function useRefreshCaps(options: UseRefreshCapsOptions = {}): UseRefreshCapsReturn {
  const {
    userTier = 'free',
    customCaps,
    onCapReached,
  } = options;

  // Get caps based on tier
  const caps = useMemo((): RefreshCaps => {
    const tierCaps = REFRESH_CAPS_BY_TIER[userTier] || REFRESH_CAPS_BY_TIER.free;
    return {
      slideLevel: customCaps?.slideLevel ?? tierCaps.slideLevel,
      presentationLevel: customCaps?.presentationLevel ?? tierCaps.presentationLevel,
      enhanceLevel: customCaps?.enhanceLevel ?? tierCaps.enhanceLevel,
    };
  }, [userTier, customCaps]);

  const isUnlimited = userTier === 'enterprise' || (
    caps.slideLevel === Infinity && 
    caps.presentationLevel === Infinity
  );

  // State
  const [state, setState] = useState<RefreshState>({
    slideRefreshes: {},
    presentationRefreshes: 0,
    slideEnhancements: {},
  });

  // Queries
  const getSlideRefreshCount = useCallback((slideId: string): number => {
    return state.slideRefreshes[slideId] || 0;
  }, [state.slideRefreshes]);

  const getSlideRefreshRemaining = useCallback((slideId: string): number => {
    if (isUnlimited) return Infinity;
    return Math.max(0, caps.slideLevel - (state.slideRefreshes[slideId] || 0));
  }, [state.slideRefreshes, caps.slideLevel, isUnlimited]);

  const getPresentationRefreshRemaining = useCallback((): number => {
    if (isUnlimited) return Infinity;
    return Math.max(0, caps.presentationLevel - state.presentationRefreshes);
  }, [state.presentationRefreshes, caps.presentationLevel, isUnlimited]);

  const getSlideEnhanceRemaining = useCallback((slideId: string): number => {
    if (isUnlimited) return Infinity;
    return Math.max(0, caps.enhanceLevel - (state.slideEnhancements[slideId] || 0));
  }, [state.slideEnhancements, caps.enhanceLevel, isUnlimited]);

  const canRefreshSlide = useCallback((slideId: string): boolean => {
    if (isUnlimited) return true;
    const slideRemaining = getSlideRefreshRemaining(slideId);
    const presentationRemaining = getPresentationRefreshRemaining();
    return slideRemaining > 0 && presentationRemaining > 0;
  }, [getSlideRefreshRemaining, getPresentationRefreshRemaining, isUnlimited]);

  const canRefreshPresentation = useCallback((): boolean => {
    if (isUnlimited) return true;
    return getPresentationRefreshRemaining() > 0;
  }, [getPresentationRefreshRemaining, isUnlimited]);

  const canEnhanceSlide = useCallback((slideId: string): boolean => {
    if (isUnlimited) return true;
    return getSlideEnhanceRemaining(slideId) > 0;
  }, [getSlideEnhanceRemaining, isUnlimited]);

  // Actions
  const recordSlideRefresh = useCallback((slideId: string): boolean => {
    if (!canRefreshSlide(slideId)) {
      onCapReached?.('slide', slideId);
      return false;
    }

    setState(prev => ({
      ...prev,
      slideRefreshes: {
        ...prev.slideRefreshes,
        [slideId]: (prev.slideRefreshes[slideId] || 0) + 1,
      },
      presentationRefreshes: prev.presentationRefreshes + 1,
    }));

    return true;
  }, [canRefreshSlide, onCapReached]);

  const recordPresentationRefresh = useCallback((): boolean => {
    if (!canRefreshPresentation()) {
      onCapReached?.('presentation');
      return false;
    }

    setState(prev => ({
      ...prev,
      presentationRefreshes: prev.presentationRefreshes + 1,
    }));

    return true;
  }, [canRefreshPresentation, onCapReached]);

  const recordSlideEnhance = useCallback((slideId: string): boolean => {
    if (!canEnhanceSlide(slideId)) {
      onCapReached?.('enhance', slideId);
      return false;
    }

    setState(prev => ({
      ...prev,
      slideEnhancements: {
        ...prev.slideEnhancements,
        [slideId]: (prev.slideEnhancements[slideId] || 0) + 1,
      },
    }));

    return true;
  }, [canEnhanceSlide, onCapReached]);

  const resetSlideRefresh = useCallback((slideId: string): void => {
    setState(prev => {
      const { [slideId]: _, ...rest } = prev.slideRefreshes;
      const { [slideId]: __, ...enhanceRest } = prev.slideEnhancements;
      return {
        ...prev,
        slideRefreshes: rest,
        slideEnhancements: enhanceRest,
      };
    });
  }, []);

  const resetAllRefreshes = useCallback((): void => {
    setState({
      slideRefreshes: {},
      presentationRefreshes: 0,
      slideEnhancements: {},
    });
  }, []);

  return {
    state,
    caps,
    canRefreshSlide,
    canRefreshPresentation,
    canEnhanceSlide,
    getSlideRefreshCount,
    getSlideRefreshRemaining,
    getPresentationRefreshRemaining,
    getSlideEnhanceRemaining,
    recordSlideRefresh,
    recordPresentationRefresh,
    recordSlideEnhance,
    resetSlideRefresh,
    resetAllRefreshes,
    isUnlimited,
  };
}

export default useRefreshCaps;
