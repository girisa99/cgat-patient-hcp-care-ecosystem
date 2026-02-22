/**
 * StepWizard — Liquid Glass responsive wizard layout
 * 
 * Desktop (≥768px): Vertical sidebar stepper (left) + content panel (right)
 * Mobile (<768px): Horizontal progress dots (top) + full-width card + sticky bottom nav
 * 
 * Features:
 * - Liquid Glass translucent surfaces
 * - RTL-aware layout flipping
 * - Transcreation labels (local language shown alongside English)
 * - Smooth framer-motion transitions
 * - AI-generated step thumbnails
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStepWizard } from './StepWizardContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
      {/* Sidebar stepper — Liquid Glass panel */}
      <div className="w-[260px] flex-shrink-0 flex flex-col border-white/[0.06] bg-white/[0.02] backdrop-blur-xl rounded-2xl p-3 mr-4"
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderImage: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%) 1',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Progress indicator */}
        <div className="px-4 pt-2 pb-3 mb-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span className="text-primary font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
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

        {/* Bottom action */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
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
