/**
 * CreateStepProgress - Visual 1→2→3 stepper for CREATE workflow
 * 
 * Replaces sub-tab buttons with a clear progression indicator.
 * Shows completion state per step with clickable navigation.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutTemplate,
  MessageSquare,
  Settings2,
  Check,
  ChevronRight,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GenieCastSessionState } from '@/hooks/useGenieCastSession';

export type CreateStep = 'templates' | 'messaging' | 'production';

interface StepDef {
  id: CreateStep;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  getStatus: (session: GenieCastSessionState) => 'complete' | 'current' | 'upcoming';
  getDetail?: (session: GenieCastSessionState) => string;
}

const STEPS: StepDef[] = [
  {
    id: 'templates',
    label: 'Select Template',
    shortLabel: 'Template',
    icon: LayoutTemplate,
    getStatus: (s) => {
      if (s.selectedTemplate) return 'complete';
      return 'current';
    },
    getDetail: (s) => s.selectedTemplate?.name || '',
  },
  {
    id: 'messaging',
    label: 'Generate Messaging',
    shortLabel: 'Messaging',
    icon: MessageSquare,
    getStatus: (s) => {
      if (s.approvedMessaging) return 'complete';
      if (s.selectedTemplate) return 'current';
      return 'upcoming';
    },
    getDetail: (s) => s.approvedMessaging ? 'Approved' : '',
  },
  {
    id: 'production',
    label: 'Production Setup',
    shortLabel: 'Setup',
    icon: Settings2,
    getStatus: (s) => {
      if (s.selectedStyles.length > 0 || s.selectedDialects.length > 1) return 'complete';
      if (s.approvedMessaging) return 'current';
      return 'upcoming';
    },
    getDetail: (s) => {
      const parts: string[] = [];
      if (s.selectedStyles.length > 0) parts.push(`${s.selectedStyles.length} styles`);
      if (s.selectedDialects.length > 1) parts.push(`${s.selectedDialects.length} langs`);
      return parts.join(' · ');
    },
  },
];

interface CreateStepProgressProps {
  session: GenieCastSessionState;
  currentStep: CreateStep;
  onStepClick: (step: CreateStep) => void;
  onGoToProduce: () => void;
  canProduce: boolean;
  className?: string;
}

export const CreateStepProgress: React.FC<CreateStepProgressProps> = ({
  session,
  currentStep,
  onStepClick,
  onGoToProduce,
  canProduce,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1", className)}>
      {STEPS.map((step, idx) => {
        const status = step.getStatus(session);
        const detail = step.getDetail?.(session);
        const isCurrent = currentStep === step.id;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            {idx > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
            )}
            <button
              onClick={() => onStepClick(step.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0",
                "border",
                isCurrent && status !== 'complete' && "border-primary bg-primary/10 text-primary shadow-sm",
                isCurrent && status === 'complete' && "border-primary/50 bg-primary/10 text-primary shadow-sm",
                !isCurrent && status === 'complete' && "border-primary/30 bg-primary/5 text-primary/80 hover:bg-primary/10",
                !isCurrent && status === 'upcoming' && "border-muted text-muted-foreground hover:bg-muted/30",
                !isCurrent && status === 'current' && "border-muted-foreground/30 text-foreground hover:bg-muted/50"
              )}
            >
              {status === 'complete' ? (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              ) : (
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                  isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {idx + 1}
                </div>
              )}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.shortLabel}</span>
              {detail && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-0.5 max-w-[100px] truncate">
                  {detail}
                </Badge>
              )}
            </button>
          </React.Fragment>
        );
      })}

      {/* Go to Produce button */}
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
      <Button
        size="sm"
        variant={canProduce ? 'default' : 'outline'}
        onClick={onGoToProduce}
        disabled={!canProduce}
        className="gap-1 text-xs h-8 flex-shrink-0"
      >
        <Play className="w-3 h-3" />
        <span className="hidden sm:inline">Go to Produce</span>
        <span className="sm:hidden">Produce</span>
      </Button>
    </div>
  );
};
