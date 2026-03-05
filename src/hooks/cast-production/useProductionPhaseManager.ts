/**
 * useProductionPhaseManager
 *
 * Phase state machine for Cast production pipeline.
 * Manages: tts → tts_approved → visual → music → assembly → complete
 * Generic — works for any project type (video, podcast, educational, UGC).
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type ProductionPhase = 'tts' | 'tts_approved' | 'visual' | 'music' | 'assembly' | 'complete';

const PHASE_ORDER: ProductionPhase[] = ['tts', 'tts_approved', 'visual', 'music', 'assembly', 'complete'];

const PHASE_DB_STATUS: Record<ProductionPhase, string> = {
  tts: 'tts_production',
  tts_approved: 'visual_production',
  visual: 'visual_production',
  music: 'visual_production',
  assembly: 'generating',
  complete: 'review',
};

export interface PhaseManagerResult {
  phase: ProductionPhase;
  phaseIndex: number;
  setPhase: (phase: ProductionPhase) => void;
  advancePhase: () => void;
  canAdvanceTo: (target: ProductionPhase) => boolean;
  isPhaseComplete: (phase: ProductionPhase) => boolean;
  syncPhaseToDb: (projectId: string, phase: ProductionPhase) => Promise<void>;
}

export function useProductionPhaseManager(initialPhase: ProductionPhase = 'tts'): PhaseManagerResult {
  const [phase, setPhaseState] = useState<ProductionPhase>(initialPhase);

  const phaseIndex = PHASE_ORDER.indexOf(phase);

  const setPhase = useCallback((newPhase: ProductionPhase) => {
    setPhaseState(newPhase);
  }, []);

  const advancePhase = useCallback(() => {
    const currentIdx = PHASE_ORDER.indexOf(phase);
    if (currentIdx < PHASE_ORDER.length - 1) {
      const next = PHASE_ORDER[currentIdx + 1];
      setPhaseState(next);
      toast.success(`Advanced to ${next.replace('_', ' ')} phase`);
    }
  }, [phase]);

  const canAdvanceTo = useCallback((target: ProductionPhase) => {
    const targetIdx = PHASE_ORDER.indexOf(target);
    const currentIdx = PHASE_ORDER.indexOf(phase);
    return targetIdx > currentIdx;
  }, [phase]);

  const isPhaseComplete = useCallback((checkPhase: ProductionPhase) => {
    const checkIdx = PHASE_ORDER.indexOf(checkPhase);
    const currentIdx = PHASE_ORDER.indexOf(phase);
    return currentIdx > checkIdx;
  }, [phase]);

  const syncPhaseToDb = useCallback(async (projectId: string, targetPhase: ProductionPhase) => {
    const dbStatus = PHASE_DB_STATUS[targetPhase];
    if (!dbStatus) return;
    try {
      await supabase.from('cast_projects').update({ status: dbStatus }).eq('id', projectId);
    } catch (err) {
      console.warn('[PhaseManager] Failed to sync phase to DB:', err);
    }
  }, []);

  return { phase, phaseIndex, setPhase, advancePhase, canAdvanceTo, isPhaseComplete, syncPhaseToDb };
}
