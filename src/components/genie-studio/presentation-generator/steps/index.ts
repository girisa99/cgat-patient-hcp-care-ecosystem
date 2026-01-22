/**
 * Modular Step Components - Central Export
 * 
 * Each step is self-contained and can be used independently.
 * Registry-based architecture allows adding steps without code changes.
 */

// Step Components
export { UnifiedInputStep, type UnifiedInputStepProps, type UnifiedInputState } from './UnifiedInputStep';
export { VoiceMusicStep, type VoiceMusicStepProps, type VoiceMusicState } from './VoiceMusicStep';

// Re-export PublishingPanel (already created)
export { PublishingPanel, type PublishingPanelProps, type PublishingState } from '../PublishingPanel';

// Types for step integration
export interface StepComponentProps<T> {
  value: T;
  onChange: (value: T) => void;
  isMobile?: boolean;
  isOffline?: boolean;
  globalTier?: 'free' | 'pro' | 'enterprise';
}

// Step state types for the wizard
export interface WizardStepStates {
  input: import('./UnifiedInputStep').UnifiedInputState;
  configure: ConfigureState;
  template: TemplateState;
  output: OutputState;
  agents: AgentsState;
  voice: import('./VoiceMusicStep').VoiceMusicState;
  generate: GenerateState;
  publish: import('../PublishingPanel').PublishingState;
}

// Placeholder types for other steps (to be refactored from PresentationWizard)
export interface ConfigureState {
  industry: string | null;
  segment: string | null;
  contentType: string | null;
  framework: string | null;
}

export interface TemplateState {
  template: { id: string; name: string } | null;
  theme: { id: string; name: string } | null;
  brand: { colors: { primary: string; secondary: string } } | null;
}

export interface OutputState {
  outputType: string;
  visualFeatures: string[];
  quality: 'fast' | 'balanced' | 'high';
}

export interface AgentsState {
  agents: string[];
  languages: string[];
  primaryLanguage: string;
  modelOverrides: Record<string, string>;
}

export interface GenerateState {
  status: 'idle' | 'generating' | 'complete' | 'error';
  progress: number;
  result: unknown;
  error?: string;
}

// Default states
export const DEFAULT_STEP_STATES: WizardStepStates = {
  input: {
    type: null,
    content: null,
    status: 'idle',
  },
  configure: {
    industry: null,
    segment: null,
    contentType: null,
    framework: null,
  },
  template: {
    template: null,
    theme: null,
    brand: null,
  },
  output: {
    outputType: 'presentation',
    visualFeatures: [],
    quality: 'balanced',
  },
  agents: {
    agents: [],
    languages: ['en'],
    primaryLanguage: 'en',
    modelOverrides: {},
  },
  voice: {
    enabled: false,
    provider: 'elevenlabs',
    voiceId: null,
    persona: 'professional',
    speed: 1.0,
    pitch: 0,
    stability: 0.5,
    clarity: 0.75,
    perLanguageVoices: {},
    backgroundMusic: false,
    musicTrack: null,
    musicVolume: 0.3,
    pauseBetweenSlides: 1,
    autoNarrate: true,
  },
  generate: {
    status: 'idle',
    progress: 0,
    result: null,
  },
  publish: {
    exportFormats: [],
    cloudEnabled: false,
    cloudUrl: null,
    platforms: [],
    scheduledDate: null,
    password: null,
    embedEnabled: false,
    analyticsEnabled: true,
  },
};
