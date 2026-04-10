/**
 * Flow Shortcuts Utility
 * Smart step detection and auto-configuration for wizard flow
 */

export interface FlowShortcut {
  id: string;
  name: string;
  description: string;
  icon: string;
  skipsSteps: number[];
  autoConfig: Record<string, any>;
}

export interface FlowAutoConfig {
  industry?: string;
  segment?: string;
  template?: string;
  aiModel?: string;
  imageModel?: string;
  tones?: string[];
}

export const FLOW_SHORTCUTS: FlowShortcut[] = [
  {
    id: 'consulting-mckinsey',
    name: 'McKinsey Style',
    description: '7S Framework, MECE, Pyramid Principle',
    icon: '📊',
    skipsSteps: [2], // Skip template selection
    autoConfig: {
      template: 'mckinsey',
      tones: ['professional', 'analytical'],
      aiModel: 'claude-sonnet-4-6'
    }
  },
  {
    id: 'consulting-bcg',
    name: 'BCG Style',
    description: 'BCG Matrix, Growth-Share, Experience Curve',
    icon: '📈',
    skipsSteps: [2],
    autoConfig: {
      template: 'bcg',
      tones: ['strategic', 'data-driven'],
      aiModel: 'gpt-4o'
    }
  },
  {
    id: 'consulting-bain',
    name: 'Bain Style',
    description: 'Net Promoter, Results Delivery, Decision Insights',
    icon: '🎯',
    skipsSteps: [2],
    autoConfig: {
      template: 'bain',
      tones: ['results-oriented', 'customer-focused'],
      aiModel: 'claude-sonnet-4-6'
    }
  },
  {
    id: 'quick-pitch',
    name: 'Quick Pitch Deck',
    description: 'Fast startup pitch with minimal steps',
    icon: '🚀',
    skipsSteps: [2, 4], // Skip template and review
    autoConfig: {
      template: 'pitch-deck',
      tones: ['persuasive', 'energetic'],
      length: 'short'
    }
  },
  {
    id: 'educational',
    name: 'Educational Content',
    description: 'Training and learning materials',
    icon: '📚',
    skipsSteps: [],
    autoConfig: {
      template: 'educational',
      tones: ['informative', 'clear'],
      includeInfographics: true
    }
  }
];

/**
 * Detect which shortcut applies based on user selection
 */
export function detectFlowShortcut(config: FlowAutoConfig): FlowShortcut | null {
  if (config.industry === 'consulting') {
    if (config.segment === 'strategy') {
      return FLOW_SHORTCUTS.find(s => s.id === 'consulting-mckinsey') || null;
    }
  }
  return null;
}

/**
 * Get the next required step (skipping auto-configured steps)
 */
export function getNextRequiredStep(
  currentStep: number,
  totalSteps: number,
  shortcut: FlowShortcut | null
): number {
  let nextStep = currentStep + 1;
  
  if (shortcut) {
    while (shortcut.skipsSteps.includes(nextStep) && nextStep < totalSteps) {
      nextStep++;
    }
  }
  
  return Math.min(nextStep, totalSteps);
}

/**
 * Get the previous required step
 */
export function getPreviousRequiredStep(
  currentStep: number,
  shortcut: FlowShortcut | null
): number {
  let prevStep = currentStep - 1;
  
  if (shortcut) {
    while (shortcut.skipsSteps.includes(prevStep) && prevStep > 1) {
      prevStep--;
    }
  }
  
  return Math.max(prevStep, 1);
}

/**
 * Check if a step can be skipped
 */
export function canSkipStep(step: number, shortcut: FlowShortcut | null): boolean {
  if (!shortcut) return false;
  return shortcut.skipsSteps.includes(step);
}

/**
 * Generate step indicators for the wizard
 */
export function generateStepIndicators(
  totalSteps: number,
  currentStep: number,
  shortcut: FlowShortcut | null
): Array<{
  step: number;
  status: 'completed' | 'current' | 'upcoming' | 'skipped';
  isSkippable: boolean;
}> {
  return Array.from({ length: totalSteps }, (_, i) => {
    const step = i + 1;
    const isSkippable = canSkipStep(step, shortcut);
    
    let status: 'completed' | 'current' | 'upcoming' | 'skipped';
    if (step < currentStep) {
      status = isSkippable ? 'skipped' : 'completed';
    } else if (step === currentStep) {
      status = 'current';
    } else {
      status = 'upcoming';
    }
    
    return { step, status, isSkippable };
  });
}

/**
 * Apply consulting framework preset
 */
export function applyConsultingFrameworkPreset(
  frameworkId: string
): FlowAutoConfig {
  const framework = FLOW_SHORTCUTS.find(s => s.id === frameworkId);
  
  if (!framework) {
    return {};
  }
  
  return {
    ...framework.autoConfig,
    industry: 'consulting',
    segment: 'strategy'
  };
}

/**
 * Check if quick select mode is active
 */
export function isQuickSelectMode(shortcut: FlowShortcut | null): boolean {
  return shortcut !== null && shortcut.skipsSteps.length > 0;
}
