/**
 * Shared types for the Script Editor module
 * Extracted from ScriptEditorTab.tsx to enable module separation
 */

export type ScriptPurpose = 'video' | 'audio' | 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial';

export interface SavedScript {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'audio';
  purpose?: ScriptPurpose;
  showId?: string;
  showTitle?: string;
  createdAt: number;
  updatedAt: number;
  enhancedContent?: string;
  cleanContent?: string;
  draftContent?: string;
  draftStatus?: 'in_progress' | 'completed';
  draftChanges?: EnhancementChange[];
  stats?: ScriptStats;
  hasVoiceover?: boolean;
  voiceoverId?: string;
}

export interface ScriptStats {
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
  estimatedReadingMinutes: number;
  estimatedSpeakingMinutes: number;
  readabilityScore: 'easy' | 'moderate' | 'difficult';
}

export interface AnalysisRecommendation {
  id: string;
  type: 'pacing' | 'clarity' | 'engagement' | 'length' | 'readability' | 'pause' | 'break' | 'section';
  severity: 'info' | 'warning' | 'suggestion';
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  location?: string;
  accepted: boolean | null;
}

export interface PauseOpportunity {
  afterText: string;
  reason: string;
}

export interface SectionBreak {
  beforeText: string;
  sectionTitle: string;
}

export interface OverallAssessment {
  strengths: string[];
  weaknesses: string[];
  voiceoverReadiness: 'ready' | 'needs_minor_edits' | 'needs_significant_work';
  engagementScore?: number;
  topPriority?: string;
}

export interface EngagementAnalysis {
  openingHook?: { present: boolean; quality: 'weak' | 'moderate' | 'strong'; suggestion?: string };
  audienceConnection?: { score: number; uses_you: boolean; uses_questions: boolean; suggestions?: string[] };
  callToAction?: { present: boolean; clarity: 'weak' | 'moderate' | 'strong'; suggestion?: string };
  emotionalResonance?: { score: number; powerWords: number; suggestions?: string[] };
}

export interface EnhancementChange {
  id: string;
  type: 'modification' | 'addition' | 'removal' | 'formatting' | 'pause' | 'break' | 'pacing' | 'engagement' | 'conversational' | 'hook' | 'transition' | 'cta';
  original: string;
  enhanced: string;
  reason: string;
  accepted: boolean | null;
  position?: string;
}

export interface EnhancementMarkers {
  pausesAdded: number;
  sectionBreaksAdded: number;
  sentencesRewritten: number;
  engagementHooksAdded?: number;
  conversationalChanges?: number;
}

export interface EngagementScore {
  before: number;
  after: number;
  improvements: string[];
}

export interface ShowInfo {
  id: string;
  title: string;
  show_type: 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial' | 'other';
  current_stage: string;
}

export interface AnalysisResult {
  stats: ScriptStats;
  recommendations: AnalysisRecommendation[];
  pauseOpportunities?: PauseOpportunity[];
  sectionBreaks?: SectionBreak[];
  overallAssessment?: OverallAssessment;
  engagementAnalysis?: EngagementAnalysis;
}

export type AIProvider = 'gemini' | 'openai' | 'claude';
export type EnhancementFocus = 'engagement' | 'clarity' | 'pacing' | 'conversational' | 'balanced' | 'humor';
