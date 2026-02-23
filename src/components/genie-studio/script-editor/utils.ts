/**
 * Utility functions for the Script Editor module
 */

import type { ScriptStats } from './types';

/**
 * Calculate reading/speaking stats from script content
 */
export function calculateStats(content: string): ScriptStats {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

  const readingWPM = 200;
  const speakingWPM = 130;

  let readability: 'easy' | 'moderate' | 'difficult' = 'moderate';
  if (avgWordsPerSentence < 12) readability = 'easy';
  else if (avgWordsPerSentence > 20) readability = 'difficult';

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    characterCount: content.length,
    estimatedReadingMinutes: Math.ceil(words.length / readingWPM),
    estimatedSpeakingMinutes: Math.ceil(words.length / speakingWPM),
    readabilityScore: readability
  };
}

/**
 * Analysis step definitions for progressive walkthrough
 */
export const ANALYSIS_STEPS = [
  { id: 'stats', label: 'Calculating word count & reading time', icon: 'BookOpen' },
  { id: 'readability', label: 'Analyzing readability & complexity', icon: 'Search' },
  { id: 'pacing', label: 'Checking pacing & natural pauses', icon: 'Clock' },
  { id: 'engagement', label: 'Evaluating audience engagement', icon: 'Sparkles' },
  { id: 'clarity', label: 'Reviewing clarity & structure', icon: 'FileCheck' },
  { id: 'ai', label: 'Getting AI recommendations', icon: 'Wand2' },
] as const;
