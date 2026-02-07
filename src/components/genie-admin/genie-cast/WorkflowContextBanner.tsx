/**
 * WorkflowContextBanner - Persistent workflow state indicator
 * 
 * Shows the current production session context (selected template,
 * messaging status, progress) and provides guided next-step CTAs.
 * Appears at the top of CREATE and PRODUCE tabs.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutTemplate,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Circle,
  Film,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { GenieCastSessionState } from '@/hooks/useGenieCastSession';

interface WorkflowStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'complete' | 'current' | 'upcoming';
  detail?: string;
}

interface WorkflowContextBannerProps {
  session: GenieCastSessionState;
  currentSubTab: string;
  onNavigate: (mainTab: string, subTab: string) => void;
  onResetSession: () => void;
  className?: string;
}

export const WorkflowContextBanner: React.FC<WorkflowContextBannerProps> = ({
  session,
  currentSubTab,
  onNavigate,
  onResetSession,
  className,
}) => {
  const hasTemplate = !!session.selectedTemplate;
  const hasMessaging = !!session.approvedMessaging;
  const completedStages = session.completedStages.length;
  const totalStages = 8;
  const progressPercent = Math.round((completedStages / totalStages) * 100);

  // Build workflow steps
  const steps: WorkflowStep[] = [
    {
      id: 'templates',
      label: 'Template',
      icon: LayoutTemplate,
      status: hasTemplate ? 'complete' : currentSubTab === 'templates' ? 'current' : 'upcoming',
      detail: hasTemplate ? session.selectedTemplate?.name : undefined,
    },
    {
      id: 'messaging',
      label: 'Messaging',
      icon: MessageSquare,
      status: hasMessaging ? 'complete' : (hasTemplate && currentSubTab === 'messaging') ? 'current' : 'upcoming',
      detail: hasMessaging ? 'Approved' : undefined,
    },
    {
      id: 'studio',
      label: 'Production',
      icon: Film,
      status: session.completedStages.includes('template_mapping') ? 'complete' : (hasMessaging ? 'current' : 'upcoming'),
      detail: session.completedStages.includes('template_mapping') ? 'Mapped' : undefined,
    },
  ];

  // Determine next action
  const getNextAction = () => {
    if (!hasTemplate) {
      return {
        label: 'Select a Template to begin',
        action: () => onNavigate('create', 'templates'),
        variant: 'default' as const,
        show: currentSubTab !== 'templates',
      };
    }
    if (!hasMessaging) {
      return {
        label: 'Next: Generate Messaging',
        action: () => onNavigate('create', 'messaging'),
        variant: 'default' as const,
        show: currentSubTab !== 'messaging',
      };
    }
    if (!session.completedStages.includes('template_mapping')) {
      return {
        label: 'Next: Go to Studio',
        action: () => onNavigate('produce', 'studio'),
        variant: 'default' as const,
        show: true,
      };
    }
    return null;
  };

  const nextAction = getNextAction();

  // Don't show if nothing has been started and user is on templates tab
  const isEmpty = !hasTemplate && !hasMessaging && currentSubTab === 'templates';

  return (
    <AnimatePresence>
      {!isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "rounded-lg border bg-card/80 backdrop-blur-sm p-3 mb-4",
            hasTemplate && !hasMessaging && "border-primary/30 bg-primary/5",
            hasMessaging && "border-green-500/30 bg-green-500/5",
            className
          )}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Workflow Steps */}
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => {
                        if (step.id === 'studio') {
                          onNavigate('produce', 'studio');
                        } else {
                          onNavigate('create', step.id);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-xs whitespace-nowrap",
                        step.status === 'complete' && "bg-green-500/10 text-green-700 dark:text-green-400",
                        step.status === 'current' && "bg-primary/10 text-primary font-medium ring-1 ring-primary/20",
                        step.status === 'upcoming' && "text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      {step.status === 'complete' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : step.status === 'current' ? (
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{step.label}</span>
                      {step.detail && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[9px] px-1 py-0 h-4 hidden sm:inline-flex",
                            step.status === 'complete' && "bg-green-500/20 text-green-700 dark:text-green-400"
                          )}
                        >
                          {step.detail.length > 20 ? step.detail.substring(0, 20) + '…' : step.detail}
                        </Badge>
                      )}
                    </button>
                    {index < steps.length - 1 && (
                      <ChevronRight className={cn(
                        "w-3.5 h-3.5 shrink-0",
                        step.status === 'complete' ? "text-green-500/50" : "text-muted-foreground/30"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Progress + Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {completedStages > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Progress value={progressPercent} className="w-16 h-1.5" />
                  <span>{completedStages}/{totalStages}</span>
                </div>
              )}
              
              {nextAction?.show && (
                <Button
                  size="sm"
                  variant={nextAction.variant}
                  onClick={nextAction.action}
                  className="gap-1 text-xs h-7"
                >
                  {nextAction.label}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}

              {(hasTemplate || hasMessaging) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onResetSession}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  title="Reset workflow"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Selected Template Detail (compact) */}
          {hasTemplate && currentSubTab !== 'templates' && (
            <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
              <LayoutTemplate className="w-3 h-3 text-green-500" />
              <span>Using:</span>
              <span className="font-medium text-foreground">{session.selectedTemplate?.name}</span>
              <span>•</span>
              <span>{session.selectedTemplate?.sceneCount} scenes</span>
              <span>•</span>
              <span>{Math.floor((session.selectedTemplate?.estimatedDuration || 0) / 60)}:{String((session.selectedTemplate?.estimatedDuration || 0) % 60).padStart(2, '0')}</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-primary"
                onClick={() => onNavigate('create', 'templates')}
              >
                Change
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkflowContextBanner;
