/**
 * CreateSubWizard — Nested Liquid Glass wizard for CREATE tab's 4 sub-steps
 * 
 * Wraps Intent → Configure → Templates → Assets in a nested StepWizard
 * with Liquid Glass aesthetics, AI mascot, and contextual hints.
 * 
 * Syncs with parent's subTab state and castSession guards.
 */

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { StepWizardProvider, StepWizard, useStepWizard, type WizardStep } from '@/components/shared/step-wizard';
import { GenieMascot, type MascotHint } from '@/components/shared/GenieMascot';
import { Sparkles, Palette, LayoutTemplate, Image } from 'lucide-react';

// AI-generated step thumbnails
import intentThumb from '@/assets/wizard-icons/create-intent.png';
import configureThumb from '@/assets/wizard-icons/create-configure.png';
import templatesThumb from '@/assets/wizard-icons/create-templates.png';
import assetsThumb from '@/assets/wizard-icons/create-assets.png';

/** Maps sub-wizard step index → CREATE sub-tab key */
const STEP_TO_SUBTAB = ['intent', 'configure', 'templates', 'assets'] as const;
type CreateSubTab = typeof STEP_TO_SUBTAB[number];

interface CreateSubWizardProps {
  /** Current active sub-tab from parent */
  activeSubTab: string;
  /** Callback to change parent sub-tab */
  onSubTabChange: (subTab: string) => void;
  /** Direction for RTL */
  direction?: 'ltr' | 'rtl';
  /** The content for each step — rendered by parent */
  children: React.ReactNode;
}

/**
 * Bridge component that syncs nested wizard step ↔ parent subTab state
 */
const SubWizardBridge: React.FC<{
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  direction: 'ltr' | 'rtl';
  children: React.ReactNode;
}> = ({ activeSubTab, onSubTabChange, direction, children }) => {
  const { currentStep, goToStep, markStepComplete } = useStepWizard();
  // Guard ref prevents bidirectional sync loop that causes flickering.
  // When one side initiates a change, the ref blocks the other side from
  // echoing it back, breaking the parent→wizard→parent ping-pong cycle.
  const syncSourceRef = useRef<'parent' | 'wizard' | null>(null);

  // Sync: when parent changes subTab externally, update wizard step
  useEffect(() => {
    if (syncSourceRef.current === 'wizard') {
      syncSourceRef.current = null;
      return;
    }
    const targetIdx = STEP_TO_SUBTAB.indexOf(activeSubTab as CreateSubTab);
    if (targetIdx >= 0 && targetIdx !== currentStep) {
      syncSourceRef.current = 'parent';
      goToStep(targetIdx);
    }
  }, [activeSubTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync: when wizard step changes, update parent subTab
  useEffect(() => {
    if (syncSourceRef.current === 'parent') {
      syncSourceRef.current = null;
      return;
    }
    const currentSubTab = STEP_TO_SUBTAB[currentStep];
    if (currentSubTab && currentSubTab !== activeSubTab) {
      syncSourceRef.current = 'wizard';
      onSubTabChange(currentSubTab);
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      {/* Step content — mascot is shown in sidebar progress panel */}
      {children}
    </div>
  );
};

/** Contextual mascot hints — Cast dogfooding philosophy */
const MASCOT_HINTS: MascotHint[] = [
  {
    stepId: 'intent',
    message: "Make It. Show It. Scale It. — Pick your industry & format. Cast uses Universal Enrichment to auto-inject your brand context into every asset. We built this to market our own products. 🏗️",
    localMessage: undefined,
    icon: '🧞',
    pose: 'waving',
  },
  {
    stepId: 'configure',
    message: "Your enrichment layers are active — brand, audience, competitor insights all feeding into the pipeline. Cast auto-routes to the best AI model for your region. No agency needed. ⚡",
    icon: '🎨',
    pose: 'pointing',
  },
  {
    stepId: 'templates',
    message: "These are the same production blueprints we used for EP01–EP04. Each one wires up scenes, voiceover routing, and platform exports. Pick and ship. 🎬",
    icon: '📋',
    pose: 'thinking',
  },
  {
    stepId: 'assets',
    message: "Add your assets and Cast distributes across 14 regions, 6+ platforms. Universal Enrichment localizes everything. Make it once, scale it globally. 🌍",
    icon: '🚀',
    pose: 'celebrating',
  },
];

export const CreateSubWizard: React.FC<CreateSubWizardProps> = ({
  activeSubTab,
  onSubTabChange,
  direction = 'ltr',
  children,
}) => {
  const steps = useMemo<WizardStep[]>(() => [
    {
      id: 'intent',
      label: 'Content Intent',
      localLabel: direction === 'rtl' ? 'نية المحتوى' : undefined,
      description: 'Category, Format & Sub-Format',
      localDescription: direction === 'rtl' ? 'الفئة والتنسيق' : undefined,
      thumbnail: intentThumb,
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'configure',
      label: 'Style & Config',
      localLabel: direction === 'rtl' ? 'الأسلوب والإعداد' : undefined,
      description: 'Platform, Languages, Visual Style',
      localDescription: direction === 'rtl' ? 'المنصة واللغات' : undefined,
      thumbnail: configureThumb,
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'templates',
      label: 'Templates',
      localLabel: direction === 'rtl' ? 'القوالب' : undefined,
      description: 'Select a Blueprint',
      localDescription: direction === 'rtl' ? 'اختر قالبًا' : undefined,
      thumbnail: templatesThumb,
      icon: <LayoutTemplate className="w-4 h-4" />,
    },
    {
      id: 'assets',
      label: 'Assets',
      localLabel: direction === 'rtl' ? 'الأصول' : undefined,
      description: 'Brand, Banners & Regional',
      localDescription: direction === 'rtl' ? 'العلامة التجارية والأصول' : undefined,
      thumbnail: assetsThumb,
      icon: <Image className="w-4 h-4" />,
    },
  ], [direction]);

  // Determine initial step from activeSubTab
  const initialStep = useMemo(() => {
    const idx = STEP_TO_SUBTAB.indexOf(activeSubTab as CreateSubTab);
    return idx >= 0 ? idx : 0;
  }, []); // Only on mount

  return (
    <StepWizardProvider
      config={{
        steps,
        direction,
        locale: direction === 'rtl' ? 'ar' : 'en',
        allowJumpBack: true,
        onComplete: () => {
          // When CREATE sub-wizard completes, user can move to PRODUCE
        },
      }}
      initialStep={initialStep}
    >
      <StepWizard
        completeLabel="Go to Produce →"
        localCompleteLabel={direction === 'rtl' ? 'إلى الإنتاج ←' : undefined}
        nextLabel="Next"
        localNextLabel={direction === 'rtl' ? 'التالي' : undefined}
        prevLabel="Back"
        localPrevLabel={direction === 'rtl' ? 'السابق' : undefined}
      >
        <SubWizardBridge
          activeSubTab={activeSubTab}
          onSubTabChange={onSubTabChange}
          direction={direction}
        >
          {children}
        </SubWizardBridge>
      </StepWizard>
    </StepWizardProvider>
  );
};

export default CreateSubWizard;
