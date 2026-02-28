/**
 * useCastSceneEnrichment — React hook for the Cast Scene Enrichment Engine.
 *
 * Used in Cast CREATE flow — when user finishes basic scene setup,
 * calls enrich() to auto-generate the full production pipeline config.
 *
 * This is NOT a recommendation engine — it BUILDS the entire pipeline:
 *   output.scenePipelines  → drop-in for EP04_SCENE_PIPELINES
 *   output.voiceConfig     → drop-in for EP04_VOICES
 *   output.transitions     → drop-in for EP04_STORYBOOK_TRANSITIONS
 *   output.musicScore      → drop-in for EP04_MUSIC_SCORE
 *
 * Every scene gets:
 *   1. Scene type classified (title_hook, problem_statement, etc.)
 *   2. Narrative arc position assigned (wonder → tension → triumph → warmth)
 *   3. Visual prompts generated (style + region + brand aware)
 *   4. Music + SFX composed (regional instruments + scene mood)
 *   5. Transitions assigned (narrative-aware, no consecutive repeats)
 *   6. Character interactions built (Alvin & Chipmunks dynamics)
 *   7. Storybook framing added (if enabled — bookends, scrolls)
 *   8. Voices assigned (unique per character, provider diversity)
 */

import { useState, useCallback } from 'react';
import {
  enrichScenes,
  type SceneEnrichmentInput,
  type SceneEnrichmentOutput,
} from '@/services/production/sceneEnrichmentEngine';

export function useCastSceneEnrichment() {
  const [output, setOutput] = useState<SceneEnrichmentOutput | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrich = useCallback((input: SceneEnrichmentInput): SceneEnrichmentOutput => {
    setIsEnriching(true);
    setError(null);
    try {
      const result = enrichScenes(input);
      setOutput(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scene enrichment failed';
      setError(message);
      throw err;
    } finally {
      setIsEnriching(false);
    }
  }, []);

  const reset = useCallback(() => {
    setOutput(null);
    setError(null);
  }, []);

  return { output, isEnriching, error, enrich, reset };
}
