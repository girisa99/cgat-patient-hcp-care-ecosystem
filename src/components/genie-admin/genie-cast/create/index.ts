/**
 * CREATE tab sub-components for Genie Cast
 * Includes animated Pixar mascots, hero banners, step components,
 * extracted configure step, and session summary.
 */

export { QuickStartCard } from './QuickStartCard';
export { CreateStepProgress } from './CreateStepProgress';
export { CreateModeToggle } from './CreateModeToggle';
export { IntentSelector } from './IntentSelector';
export { AnimatedMascot, type MascotPose, type MascotCharacter } from './AnimatedMascot';
export { CreateHeroBanner, type CreatePageId } from './CreateHeroBanner';
export { CreateConfigureStep } from './CreateConfigureStep';
export { CreateSessionSummary } from './CreateSessionSummary';
export { DocumentImportPanel } from './DocumentImportPanel';
export { type GenerationMode } from './IntentSelector';

export type CreateStep = 'intent' | 'template' | 'script' | 'style' | 'review';
