/**
 * CREATE tab sub-components for Genie Cast
 * Includes animated Pixar mascots, hero banners, and step components.
 */

export { QuickStartCard } from './QuickStartCard';
export { CreateStepProgress } from './CreateStepProgress';
export { CreateModeToggle } from './CreateModeToggle';
export { IntentSelector } from './IntentSelector';
export { AnimatedMascot, type MascotPose, type MascotCharacter } from './AnimatedMascot';
export { CreateHeroBanner, type CreatePageId } from './CreateHeroBanner';

export type CreateStep = 'intent' | 'template' | 'script' | 'style' | 'review';
