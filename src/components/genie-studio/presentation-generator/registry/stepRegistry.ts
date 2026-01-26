/**
 * Step Registry - Modular Wizard Step System
 * 
 * Enables adding new steps without code changes.
 * Each step is self-contained with its own component, validation, and metadata.
 * 
 * Architecture: Registry Pattern + Lazy Loading
 * 
 * Product Mapping:
 * - Step 0 (Input): Spark pipelines
 * - Step 1 (Configure): Mind enhancement
 * - Step 2 (Template): Deck visual design
 * - Step 3 (Output): Routes to Vibe (video), Deck (slides), or Cast (distribution)
 * - Step 4 (Agents): Cross-product orchestration
 * - Step 5 (Voice): Mind TTS + Vibe production
 * - Step 6 (Generate): Executes selected product pipeline
 * - Step 7 (Publish): Cast distribution engine
 */

import { ComponentType, lazy } from 'react';
import { LucideIcon } from 'lucide-react';
import { 
  Type, 
  Settings2, 
  Layout, 
  Layers, 
  Brain, 
  Mic, 
  Wand2, 
  Share2,
  Upload
} from 'lucide-react';
import { GenieProduct } from '@/constants/genie-products';

// ==========================================
// TYPES
// ==========================================

export type StepId = 
  | 'input'      // Step 0: Universal Input Gateway (Spark)
  | 'configure'  // Step 1: Industry, Segment, Content Type (Mind)
  | 'template'   // Step 2: Template & Branding (Deck)
  | 'output'     // Step 3: Output Type (Vibe/Deck/Cast routing)
  | 'agents'     // Step 4: AI Agent Selection (Cross-product)
  | 'voice'      // Step 5: Voice & Music Orchestration (Mind + Vibe)
  | 'generate'   // Step 6: Generation Engine (Selected product)
  | 'publish';   // Step 7: Publishing & Distribution (Cast)

export type StepCategory = 'input' | 'context' | 'agent' | 'execution';

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StepMetadata {
  id: StepId;
  label: string;
  shortLabel?: string; // For mobile
  icon: LucideIcon;
  description: string;
  category: StepCategory;
  order: number;
  
  // Product association
  primaryProduct?: GenieProduct;
  sharedProducts?: GenieProduct[];
  
  // Display options
  optional?: boolean;
  hiddenOnMobile?: boolean;
  collapsibleOnMobile?: boolean;
  
  // Dependencies
  requiredSteps?: StepId[];
  blockedBy?: StepId[];
  
  // Estimated time
  estimatedMinutes?: number;
  
  // Credits
  creditMultiplier?: number;
}

export interface StepConfig<T = any> {
  metadata: StepMetadata;
  
  // Default state
  defaultValue: T;
  
  // Validation
  validate: (value: T, context: WizardContext) => StepValidation;
  
  // Check if step can be skipped
  canSkip?: (context: WizardContext) => boolean;
  
  // Get summary for review
  getSummary?: (value: T) => string;
  
  // Component path for lazy loading
  componentPath?: string;
}

export interface WizardContext {
  currentStep: StepId;
  stepValues: Record<StepId, any>;
  globalTier: 'free' | 'pro' | 'enterprise';
  mode: 'auto' | 'hybrid' | 'custom';
  isMobile: boolean;
  isOffline: boolean;
  selectedProduct?: GenieProduct; // Track which product is being used
}

// ==========================================
// STEP REGISTRY
// ==========================================

const stepRegistry = new Map<StepId, StepConfig>();

// Register a step
export function registerStep<T>(config: StepConfig<T>): void {
  stepRegistry.set(config.metadata.id, config);
}

// Get a step config
export function getStep(id: StepId): StepConfig | undefined {
  return stepRegistry.get(id);
}

// Get all steps in order
export function getAllSteps(): StepConfig[] {
  return Array.from(stepRegistry.values())
    .sort((a, b) => a.metadata.order - b.metadata.order);
}

// Get visible steps for context
export function getVisibleSteps(context: WizardContext): StepConfig[] {
  return getAllSteps().filter(step => {
    // Hide mobile-hidden steps on mobile
    if (context.isMobile && step.metadata.hiddenOnMobile) {
      return false;
    }
    return true;
  });
}

// Get steps by category
export function getStepsByCategory(category: StepCategory): StepConfig[] {
  return getAllSteps().filter(step => step.metadata.category === category);
}

// Validate all steps
export function validateAllSteps(context: WizardContext): Record<StepId, StepValidation> {
  const results: Record<StepId, StepValidation> = {} as any;
  
  for (const step of getAllSteps()) {
    const value = context.stepValues[step.metadata.id];
    results[step.metadata.id] = step.validate(value, context);
  }
  
  return results;
}

// Check if step is accessible (dependencies met)
export function isStepAccessible(stepId: StepId, context: WizardContext): boolean {
  const step = getStep(stepId);
  if (!step) return false;
  
  // Check required steps are completed
  if (step.metadata.requiredSteps) {
    for (const requiredId of step.metadata.requiredSteps) {
      const requiredStep = getStep(requiredId);
      if (requiredStep) {
        const validation = requiredStep.validate(context.stepValues[requiredId], context);
        if (!validation.isValid) return false;
      }
    }
  }
  
  return true;
}

// ==========================================
// DEFAULT STEP CONFIGURATIONS
// ==========================================

// Step 0: Universal Input (Spark - Script Generation)
registerStep({
  metadata: {
    id: 'input',
    label: 'Input',
    shortLabel: 'In',
    icon: Upload,
    description: 'Add your source material (Document, PPT, Video, Audio, URL, Image)',
    category: 'input',
    order: 0,
    estimatedMinutes: 2,
    primaryProduct: 'spark', // Spark owns input processing
    sharedProducts: ['studio'],
  },
  defaultValue: {
    type: null,
    content: null,
    analysis: null,
    suggestions: null,
  },
  validate: (value, context) => {
    const errors: string[] = [];
    if (!value?.content) {
      errors.push('Please add source content');
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },
  getSummary: (value) => {
    if (!value?.type) return 'No input';
    return `${value.type}: ${value.content?.text?.substring(0, 50) || 'Content uploaded'}...`;
  },
});

// Step 1: Configure (Mind - Enhancement Context)
registerStep({
  metadata: {
    id: 'configure',
    label: 'Configure',
    shortLabel: 'Cfg',
    icon: Settings2,
    description: 'Select industry, segment & content type for AI optimization',
    category: 'context',
    order: 1,
    requiredSteps: ['input'],
    estimatedMinutes: 2,
    primaryProduct: 'mind', // Mind handles enhancement context
    sharedProducts: ['spark', 'studio'],
  },
  defaultValue: {
    industry: null,
    segment: null,
    contentType: null,
    framework: null,
  },
  validate: (value) => {
    const errors: string[] = [];
    if (!value?.industry) errors.push('Select an industry');
    if (!value?.contentType) errors.push('Select a content type');
    return { isValid: errors.length === 0, errors, warnings: [] };
  },
  getSummary: (value) => {
    if (!value?.industry) return 'Not configured';
    return `${value.industry} / ${value.contentType || 'General'}`;
  },
});

// Step 2: Template & Branding (Deck - Visual Design)
registerStep({
  metadata: {
    id: 'template',
    label: 'Template & Branding',
    shortLabel: 'Brand',
    icon: Layout,
    description: 'Choose templates, themes and branding for visual output',
    category: 'context',
    order: 2,
    collapsibleOnMobile: true,
    estimatedMinutes: 3,
    primaryProduct: 'deck', // Deck owns visual design
    sharedProducts: ['vibe', 'studio'],
  },
  defaultValue: {
    template: null,
    theme: null,
    brand: null,
  },
  validate: () => ({ isValid: true, errors: [], warnings: [] }), // Optional
  canSkip: () => true,
  getSummary: (value) => {
    if (!value?.template) return 'Default template';
    return value.template.name || 'Custom template';
  },
});

// Step 3: Output Type (Routes to Vibe, Deck, or Cast)
registerStep({
  metadata: {
    id: 'output',
    label: 'Output Type',
    shortLabel: 'Out',
    icon: Layers,
    description: 'Choose output: Slides (Deck), Video (Vibe), or Distribution (Cast)',
    category: 'context',
    order: 3,
    estimatedMinutes: 2,
    // This step determines which product handles the output
    // Video/Audio → Vibe, Slides/Infographic → Deck, Social → Cast
  },
  defaultValue: {
    outputType: 'presentation', // Default to Deck
    visualFeatures: [],
    quality: 'balanced',
    targetProduct: 'deck', // Tracks which product handles output
  },
  validate: (value) => {
    const errors: string[] = [];
    if (!value?.outputType) errors.push('Select an output type');
    return { isValid: errors.length === 0, errors, warnings: [] };
  },
  getSummary: (value) => {
    if (!value?.outputType) return 'Not selected';
    return value.outputType;
  },
});

// Step 4: Agents & Languages (Cross-product orchestration)
registerStep({
  metadata: {
    id: 'agents',
    label: 'Agents & Languages',
    shortLabel: 'AI',
    icon: Brain,
    description: 'Configure AI agents and multi-language settings',
    category: 'agent',
    order: 4,
    estimatedMinutes: 3,
    // Cross-product: Orchestrates all products via A2A
    sharedProducts: ['spark', 'mind', 'vibe', 'deck', 'cast'],
  },
  defaultValue: {
    agents: [],
    languages: ['en'],
    modelOverrides: {},
  },
  validate: (value) => {
    const errors: string[] = [];
    if (!value?.languages?.length) errors.push('Select at least one language');
    return { isValid: errors.length === 0, errors, warnings: [] };
  },
  getSummary: (value) => {
    const langs = value?.languages?.length || 1;
    const agents = value?.agents?.length || 0;
    return `${langs} language(s), ${agents} agent(s)`;
  },
});

// Step 5: Voice & Music Orchestration (Mind TTS + Vibe production)
registerStep({
  metadata: {
    id: 'voice',
    label: 'Voice & Music',
    shortLabel: 'Voice',
    icon: Mic,
    description: 'Configure TTS voiceover (Mind) and music (Vibe)',
    category: 'agent',
    order: 5,
    optional: true,
    collapsibleOnMobile: true,
    estimatedMinutes: 3,
    creditMultiplier: 1.5,
    primaryProduct: 'mind', // Mind handles TTS
    sharedProducts: ['vibe'], // Vibe handles audio production
  },
  defaultValue: {
    enabled: false,
    provider: 'elevenlabs',
    voiceId: null,
    persona: 'professional',
    speed: 1.0,
    pitch: 0,
    stability: 0.5,
    clarity: 0.75,
    backgroundMusic: false,
    musicVolume: 0.3,
    pauseBetweenSlides: 1,
  },
  validate: (value) => {
    const warnings: string[] = [];
    if (value?.enabled && !value?.voiceId) {
      warnings.push('No voice selected - will use default');
    }
    return { isValid: true, errors: [], warnings };
  },
  canSkip: () => true,
  getSummary: (value) => {
    if (!value?.enabled) return 'Disabled';
    return `${value.provider} - ${value.voiceId || 'Auto'}`;
  },
});

// Step 6: Generate (Executes selected product pipeline)
registerStep({
  metadata: {
    id: 'generate',
    label: 'Generate',
    shortLabel: 'Gen',
    icon: Wand2,
    description: 'Review and generate content with selected pipeline',
    category: 'execution',
    order: 6,
    requiredSteps: ['input', 'configure', 'output'],
    estimatedMinutes: 5,
    // Product determined by output type selection
    sharedProducts: ['spark', 'mind', 'vibe', 'deck'],
  },
  defaultValue: {
    status: 'idle',
    progress: 0,
    result: null,
  },
  validate: () => ({ isValid: true, errors: [], warnings: [] }),
  getSummary: (value) => {
    if (value?.status === 'complete') return 'Complete';
    if (value?.status === 'generating') return `${value.progress}%`;
    return 'Ready';
  },
});

// Step 7: Publish & Distribute (Cast - Distribution Engine)
registerStep({
  metadata: {
    id: 'publish',
    label: 'Publish',
    shortLabel: 'Pub',
    icon: Share2,
    description: 'Export and distribute via Genie Cast (multi-platform)',
    category: 'execution',
    order: 7,
    requiredSteps: ['generate'],
    optional: true,
    estimatedMinutes: 2,
    primaryProduct: 'cast', // Cast owns distribution
    sharedProducts: ['arc'], // Arc handles scheduling
  },
  defaultValue: {
    exportFormats: [],
    cloudPublish: false,
    platforms: [],
    scheduledDate: null,
  },
  validate: () => ({ isValid: true, errors: [], warnings: [] }),
  canSkip: () => true,
  getSummary: (value) => {
    const formats = value?.exportFormats?.length || 0;
    const platforms = value?.platforms?.length || 0;
    if (!formats && !platforms) return 'Not configured';
    return `${formats} exports, ${platforms} platforms`;
  },
});

// ==========================================
// STEP NAVIGATION HELPERS
// ==========================================

export function getNextStep(currentId: StepId, context: WizardContext): StepId | null {
  const steps = getVisibleSteps(context);
  const currentIndex = steps.findIndex(s => s.metadata.id === currentId);
  
  if (currentIndex < 0 || currentIndex >= steps.length - 1) return null;
  return steps[currentIndex + 1].metadata.id;
}

export function getPreviousStep(currentId: StepId, context: WizardContext): StepId | null {
  const steps = getVisibleSteps(context);
  const currentIndex = steps.findIndex(s => s.metadata.id === currentId);
  
  if (currentIndex <= 0) return null;
  return steps[currentIndex - 1].metadata.id;
}

export function getStepProgress(currentId: StepId, context: WizardContext): number {
  const steps = getVisibleSteps(context);
  const currentIndex = steps.findIndex(s => s.metadata.id === currentId);
  
  if (currentIndex < 0) return 0;
  return Math.round(((currentIndex + 1) / steps.length) * 100);
}

// ==========================================
// MOBILE LITE MODE
// ==========================================

export const MOBILE_LITE_STEPS: StepId[] = ['input', 'configure', 'generate'];

export function getMobileLiteSteps(): StepConfig[] {
  return MOBILE_LITE_STEPS.map(id => getStep(id)).filter(Boolean) as StepConfig[];
}

// ==========================================
// EXPORTS
// ==========================================

export const WIZARD_STEPS_V2 = getAllSteps().map(step => ({
  id: step.metadata.id,
  label: step.metadata.label,
  icon: step.metadata.icon,
  description: step.metadata.description,
  primaryProduct: step.metadata.primaryProduct,
  sharedProducts: step.metadata.sharedProducts,
}));

export { stepRegistry };

// ==========================================
// PRODUCT-AWARE ROUTING HELPERS
// ==========================================

/**
 * Get the primary product for a wizard step
 */
export function getStepProduct(stepId: StepId): GenieProduct | undefined {
  const step = getStep(stepId);
  return step?.metadata.primaryProduct;
}

/**
 * Get all products involved in a step
 */
export function getStepProducts(stepId: StepId): GenieProduct[] {
  const step = getStep(stepId);
  if (!step) return [];
  
  const products: GenieProduct[] = [];
  if (step.metadata.primaryProduct) {
    products.push(step.metadata.primaryProduct);
  }
  if (step.metadata.sharedProducts) {
    products.push(...step.metadata.sharedProducts);
  }
  return [...new Set(products)];
}

/**
 * Determine target product based on output type selection
 */
export function getTargetProductForOutput(outputType: string): GenieProduct {
  const videoOutputs = ['video-mp4', 'video-webm', 'animated-gif', 'podcast', 'webcast'];
  const slideOutputs = ['presentation', 'pptx', 'pdf', 'infographic', '3d-presentation'];
  const distributionOutputs = ['social-post', 'blog-post', 'youtube', 'tiktok', 'linkedin'];
  
  if (videoOutputs.includes(outputType)) return 'vibe';
  if (distributionOutputs.includes(outputType)) return 'cast';
  return 'deck'; // Default to Deck for slide-based outputs
}

/**
 * Get editor mode based on target product
 */
export function getEditorModeForProduct(product: GenieProduct): 'canvas' | 'timeline' | 'document' | 'hybrid' {
  switch (product) {
    case 'vibe': return 'timeline'; // Video/audio editing
    case 'deck': return 'canvas'; // Slide editing
    case 'spark': return 'document'; // Script editing
    case 'mind': return 'document'; // Content editing
    case 'cast': return 'canvas'; // Distribution dashboard
    case 'arc': return 'canvas'; // Kanban/scheduling
    default: return 'hybrid';
  }
}

/**
 * Step to product flow mapping
 */
export const STEP_PRODUCT_FLOW: Record<StepId, { primary: GenieProduct; triggers: GenieProduct[] }> = {
  input: { primary: 'spark', triggers: [] },
  configure: { primary: 'mind', triggers: ['spark'] },
  template: { primary: 'deck', triggers: [] },
  output: { primary: 'deck', triggers: ['vibe', 'cast'] }, // Routes based on selection
  agents: { primary: 'studio', triggers: ['spark', 'mind', 'vibe', 'deck'] },
  voice: { primary: 'mind', triggers: ['vibe'] },
  generate: { primary: 'studio', triggers: ['spark', 'mind', 'vibe', 'deck'] },
  publish: { primary: 'cast', triggers: ['arc'] },
};
