/**
 * StepWizard — Liquid Glass responsive wizard layout
 * 
 * Desktop (≥768px): Vertical sidebar stepper (left) + content panel (right)
 * Mobile (<768px): Horizontal progress dots (top) + full-width card + sticky bottom nav
 * 
 * Features:
 * - Liquid Glass translucent surfaces with hero background
 * - Animated mascot with contextual dialogue per step
 * - RTL-aware layout flipping
 * - Transcreation labels (local language shown alongside English)
 * - Smooth framer-motion transitions
 * - AI-generated step thumbnails
 * - Pipeline & combination stats
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Sparkles, Zap, Layers, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStepWizard } from './StepWizardContext';
import { useIsMobile } from '@/hooks/use-mobile';
import sidebarBg from '@/assets/wizard-sidebar-bg.jpg';

interface StepWizardProps {
  /** Step content — either an array (one per step) or a single ReactNode (shown for all steps) */
  children: React.ReactNode[] | React.ReactNode;
  /** Custom class for the outer wrapper */
  className?: string;
  /** Label for the final action button */
  completeLabel?: string;
  localCompleteLabel?: string;
  nextLabel?: string;
  localNextLabel?: string;
  prevLabel?: string;
  localPrevLabel?: string;
}

// ── Desktop Sidebar Step ─────────────────────────────────────────────────────

const DesktopStepItem: React.FC<{
  step: { id: string; label: string; localLabel?: string; description?: string; localDescription?: string; icon?: React.ReactNode; thumbnail?: string };
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  direction: 'ltr' | 'rtl';
}> = ({ step, index, isActive, isCompleted, onClick, direction }) => (
  <button
    onClick={onClick}
    className={cn(
      'group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300',
      'hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      isActive && 'bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
      direction === 'rtl' && 'flex-row-reverse text-right',
    )}
    dir={direction}
  >
    {/* Step number / check */}
    <div className={cn(
      'relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300',
      isCompleted && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      isActive && !isCompleted && 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb,99,102,241),0.3)]',
      !isActive && !isCompleted && 'bg-white/[0.05] text-muted-foreground border border-white/10',
    )}>
      {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
      
      {/* Liquid glass shine */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      )}
    </div>

    {/* Labels */}
    <div className="flex-1 min-w-0">
      <p className={cn(
        'text-sm font-medium truncate transition-colors',
        isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80',
      )}>
        {step.label}
      </p>
      {step.localLabel && (
        <p className="text-xs text-muted-foreground/60 truncate mt-0.5 font-light">
          {step.localLabel}
        </p>
      )}
      {step.description && !step.localLabel && (
        <p className="text-xs text-muted-foreground/50 truncate mt-0.5">
          {step.description}
        </p>
      )}
    </div>

    {/* Thumbnail */}
    {step.thumbnail && (
      <div className={cn(
        'w-8 h-8 rounded-lg overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0',
        isActive && 'opacity-100',
      )}>
        <img src={step.thumbnail} alt="" className="w-full h-full object-cover" />
      </div>
    )}

    {/* Active indicator bar */}
    {isActive && (
      <motion.div
        layoutId="activeStepBar"
        className={cn(
          'absolute top-1 bottom-1 w-[3px] rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb,99,102,241),0.5)]',
          direction === 'rtl' ? 'right-0' : 'left-0',
        )}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    )}
  </button>
);

// ── Connector Line ───────────────────────────────────────────────────────────

const StepConnector: React.FC<{ isCompleted: boolean }> = ({ isCompleted }) => (
  <div className="flex justify-center py-0.5">
    <div className={cn(
      'w-[2px] h-4 rounded-full transition-colors duration-500',
      isCompleted ? 'bg-emerald-500/40' : 'bg-white/[0.06]',
    )} />
  </div>
);

// ── Mobile Progress Dots ─────────────────────────────────────────────────────

const MobileProgressDots: React.FC<{
  steps: { label: string; localLabel?: string }[];
  currentStep: number;
  completedSteps: Set<number>;
  onDotClick: (index: number) => void;
  direction: 'ltr' | 'rtl';
}> = ({ steps, currentStep, completedSteps, onDotClick, direction }) => (
  <div className="w-full" dir={direction}>
    {/* Dots row */}
    <div className="flex items-center justify-center gap-2 mb-2">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = completedSteps.has(i);
        return (
          <React.Fragment key={step.label}>
            {i > 0 && (
              <div className={cn(
                'h-[2px] w-6 rounded-full transition-colors duration-300',
                isCompleted || (completedSteps.has(i - 1)) ? 'bg-emerald-500/40' : 'bg-white/10',
              )} />
            )}
            <button
              onClick={() => onDotClick(i)}
              className={cn(
                'relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                isCompleted && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                isActive && !isCompleted && 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_12px_rgba(var(--primary-rgb,99,102,241),0.4)]',
                !isActive && !isCompleted && 'bg-white/[0.05] text-muted-foreground border border-white/10',
              )}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>

    {/* Current step label */}
    <div className="text-center">
      <p className="text-sm font-medium text-foreground">
        {steps[currentStep]?.label}
      </p>
      {steps[currentStep]?.localLabel && (
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          {steps[currentStep].localLabel}
        </p>
      )}
    </div>
  </div>
);

// ── Main StepWizard ──────────────────────────────────────────────────────────

export const StepWizard: React.FC<StepWizardProps> = ({
  children,
  className,
  completeLabel = 'Complete',
  localCompleteLabel,
  nextLabel = 'Next',
  localNextLabel,
  prevLabel = 'Back',
  localPrevLabel,
}) => {
  const {
    steps,
    currentStep,
    direction,
    completedSteps,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    progress,
  } = useStepWizard();

  const isMobile = useIsMobile();
  const childArray = Array.isArray(children) ? children : [children];
  const currentChild = childArray.length > 1 ? (childArray[currentStep] || childArray[childArray.length - 1]) : childArray[0];

  // Contextual mascot dialogues per step (must be before conditional return)
  const STEP_DIALOGUES = useMemo(() => [
    { emoji: '🧞', title: 'Hey Creator! 👋', message: "Welcome to the CREATE studio! Pick your content category & format — I'll match you with the best AI providers from 17+ models across 4 global zones. Let's build something amazing!", tip: '💡 Tip: Try "Healthcare + Short-form" for viral content' },
    { emoji: '🎨', title: "Great Choice! Let's Style It ⚡", message: "Now set your platform, language, and visual style. I'm auto-routing to the optimal AI pipeline for your region. The combination engine will mix styles across 43 presets!", tip: '💡 Tip: Regional routing auto-selects the best CDN & model' },
    { emoji: '📋', title: 'Pick Your Blueprint 🎬', message: "Each template includes pre-built scenes, timing curves, and AI routing logic. I've curated 25 pipelines — pick one and I'll pre-load all the scene configs for you!", tip: '💡 Tip: Templates with ⭐ are top performers in your region' },
    { emoji: '🚀', title: "Almost There! Final Touch 🎉", message: "Upload brand assets, hero banners, and regional configs. Once done, I'll orchestrate production across all pipelines simultaneously. Your content goes global!", tip: '💡 Tip: Drag & drop multiple assets — I batch-process them' },
  ], []);

  const currentDialogue = STEP_DIALOGUES[currentStep] || STEP_DIALOGUES[0];

  // Pipeline stats
  const pipelineStats = useMemo(() => ({
    providers: 17,
    styles: 43,
    pipelines: 25,
    zones: 4,
  }), []);

  // ── Mobile Layout ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className={cn('flex flex-col h-full min-h-0', className)} dir={direction}>
        {/* Top: Progress dots + liquid glass header */}
        <div className="sticky top-0 z-20 px-4 pt-3 pb-3 backdrop-blur-xl bg-background/60 border-b border-white/[0.06]">
          {/* Progress bar */}
          <div className="h-1 w-full bg-white/[0.06] rounded-full mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <MobileProgressDots
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onDotClick={goToStep}
            direction={direction}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: direction === 'rtl' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {currentChild}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky bottom nav */}
        <div className="sticky bottom-0 z-20 px-4 py-3 backdrop-blur-xl bg-background/80 border-t border-white/[0.06] flex items-center gap-3" dir={direction}>
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={!canGoPrev}
            className={cn(
              'flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.03]',
              direction === 'rtl' && 'flex-row-reverse',
            )}
          >
            {direction === 'rtl' ? <ChevronRight className="w-4 h-4 mr-1.5" /> : <ChevronLeft className="w-4 h-4 mr-1.5" />}
            <span className="flex flex-col items-start leading-tight">
              <span className="text-sm">{prevLabel}</span>
              {localPrevLabel && <span className="text-[10px] text-muted-foreground/50">{localPrevLabel}</span>}
            </span>
          </Button>
          <Button
            onClick={nextStep}
            className={cn(
              'flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_20px_rgba(var(--primary-rgb,99,102,241),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary-rgb,99,102,241),0.5)] transition-shadow',
              direction === 'rtl' && 'flex-row-reverse',
            )}
          >
            <span className="flex flex-col items-start leading-tight">
              <span className="text-sm">{isLastStep ? completeLabel : nextLabel}</span>
              {(isLastStep ? localCompleteLabel : localNextLabel) && (
                <span className="text-[10px] text-primary-foreground/60">
                  {isLastStep ? localCompleteLabel : localNextLabel}
                </span>
              )}
            </span>
            {isLastStep ? (
              <Sparkles className="w-4 h-4 ml-1.5" />
            ) : direction === 'rtl' ? (
              <ChevronLeft className="w-4 h-4 ml-1.5" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-1.5" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── Desktop Layout ───────────────────────────────────────────────────────
  return (
    <div className={cn('flex h-full min-h-0 gap-0', direction === 'rtl' && 'flex-row-reverse', className)} dir={direction}>
      {/* Sidebar stepper — Enhanced Liquid Glass panel with background */}
      <div className="w-[280px] flex-shrink-0 flex flex-col rounded-2xl overflow-hidden relative mr-4"
        style={{
          boxShadow: '0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Background image with overlay — lighter overlay to show image */}
        <div className="absolute inset-0 z-0">
          <img src={sidebarBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/35 to-background/50 backdrop-blur-[1px]" />
          {/* Animated ambient glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-cyan-500/10"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Glass border overlay */}
        <div className="absolute inset-0 z-[1] rounded-2xl border border-white/[0.1] pointer-events-none" />
        <div className="absolute inset-0 z-[1] rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />

        {/* Content (above background) */}
        <div className="relative z-[2] flex flex-col h-full p-3">
          {/* Progress indicator with animated gradient */}
          <div className="px-3 pt-2 pb-3 mb-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-foreground/70 font-medium">Progress</span>
              <motion.span 
                className="text-primary font-bold text-sm"
                key={progress}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {progress}%
              </motion.span>
            </div>
            <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden backdrop-blur-sm border border-white/[0.05]">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7), #10b981)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                />
              </motion.div>
            </div>
          </div>

          {/* Steps with enhanced styling */}
          <nav className="flex-1 space-y-0">
            {steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <DesktopStepItem
                  step={step}
                  index={i}
                  isActive={i === currentStep}
                  isCompleted={completedSteps.has(i)}
                  onClick={() => goToStep(i)}
                  direction={direction}
                />
                {i < steps.length - 1 && (
                  <StepConnector isCompleted={completedSteps.has(i)} />
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Pipeline & Combination Stats */}
          <div className="mt-3 px-2">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: Zap, label: 'AI Models', value: pipelineStats.providers, color: 'text-amber-400' },
                { icon: Layers, label: 'Styles', value: pipelineStats.styles, color: 'text-cyan-400' },
                { icon: Sparkles, label: 'Pipelines', value: pipelineStats.pipelines, color: 'text-purple-400' },
                { icon: Globe, label: 'Zones', value: pipelineStats.zones, color: 'text-emerald-400' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className={cn('w-3 h-3', stat.color)} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground/60 leading-none">{stat.label}</p>
                    <p className="text-xs font-bold text-foreground/90 leading-tight">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mascot with rich contextual dialogue */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mt-3 px-1"
            >
              <div className="relative rounded-xl overflow-hidden bg-white/[0.06] border border-white/[0.1] backdrop-blur-xl p-3">
                {/* Mascot glow */}
                <motion.div
                  className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary/25 blur-2xl"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-cyan-500/20 blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />
                <div className="relative flex items-start gap-3">
                  {/* Mascot avatar — larger and more animated */}
                  <motion.div
                    className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-500/20 border border-primary/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(var(--primary-rgb,99,102,241),0.3)]"
                    animate={{ 
                      y: [0, -4, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {currentDialogue.emoji}
                  </motion.div>
                  {/* Dialogue content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary mb-1">{currentDialogue.title}</p>
                    <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">{currentDialogue.message}</p>
                    {/* Tip callout */}
                    <motion.div 
                      className="text-[10px] text-cyan-400/90 bg-cyan-500/[0.08] border border-cyan-500/[0.12] rounded-lg px-2 py-1.5 leading-snug"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {currentDialogue.tip}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom action */}
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <Button
              onClick={nextStep}
              className={cn(
                'w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80',
                'shadow-[0_0_20px_rgba(var(--primary-rgb,99,102,241),0.25)]',
                'hover:shadow-[0_0_30px_rgba(var(--primary-rgb,99,102,241),0.45)]',
                'transition-all duration-300',
                direction === 'rtl' && 'flex-row-reverse',
              )}
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="text-sm font-medium">{isLastStep ? completeLabel : nextLabel}</span>
                {(isLastStep ? localCompleteLabel : localNextLabel) && (
                  <span className="text-[10px] text-primary-foreground/60">
                    {isLastStep ? localCompleteLabel : localNextLabel}
                  </span>
                )}
              </span>
              {isLastStep ? <Sparkles className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {currentChild}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StepWizard;
