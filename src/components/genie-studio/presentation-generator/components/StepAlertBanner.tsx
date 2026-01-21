/**
 * Step Alert Banner - Horizontal card layout for alerts and tips
 * Displays as compact cards in a row at the top of each step
 */

import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Lightbulb, 
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type AlertType = 'info' | 'warning' | 'success' | 'action' | 'tip';

export interface StepAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

interface StepAlertBannerProps {
  alerts: StepAlert[];
  onDismiss?: (id: string) => void;
  className?: string;
}

const ALERT_STYLES: Record<AlertType, { bg: string; border: string; icon: React.ReactNode; iconColor: string }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: <Info className="h-3.5 w-3.5" />,
    iconColor: 'text-blue-600',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    iconColor: 'text-amber-600',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    iconColor: 'text-green-600',
  },
  action: {
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    iconColor: 'text-primary',
  },
  tip: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    iconColor: 'text-purple-600',
  },
};

export function StepAlertBanner({ alerts, onDismiss, className }: StepAlertBannerProps) {
  if (!alerts.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {alerts.map((alert) => {
        const styles = ALERT_STYLES[alert.type];
        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-md border",
              styles.bg,
              styles.border,
              "max-w-[320px]"
            )}
          >
            <div className={cn("shrink-0", styles.iconColor)}>{styles.icon}</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-foreground">
                {alert.title}
              </span>
              {alert.message && (
                <span className="text-[10px] text-muted-foreground ml-1 hidden sm:inline">
                  – {alert.message.length > 60 ? `${alert.message.slice(0, 60)}...` : alert.message}
                </span>
              )}
            </div>
            {alert.actionLabel && alert.onAction && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 px-1.5 text-[10px]"
                onClick={alert.onAction}
              >
                {alert.actionLabel}
                <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
              </Button>
            )}
            {alert.dismissible && onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Generate contextual alerts based on step and state
export function getStepAlerts(
  step: number,
  state: {
    inputContent?: string;
    hasUploadedFile?: boolean;
    industryCategory?: string;
    selectedTemplate?: any;
    outputSettings?: any;
    selectedLanguages?: string[];
    useAgenticGeneration?: boolean;
    primaryLanguage?: string;
    includeVoiceover?: boolean;
  }
): StepAlert[] {
  const alerts: StepAlert[] = [];

  switch (step) {
    case 0: // Input
      if (!state.inputContent || state.inputContent.length < 50) {
        alerts.push({
          id: 'input-required',
          type: 'action',
          title: 'Content Required',
          message: 'Enter at least 50 characters to proceed.',
        });
      }
      if (state.inputContent && state.inputContent.length >= 50 && state.inputContent.length < 200) {
        alerts.push({
          id: 'input-short',
          type: 'tip',
          title: 'Add More Content',
          message: '200+ chars helps AI generate better slides.',
        });
      }
      if (state.inputContent && state.inputContent.length >= 200) {
        alerts.push({
          id: 'input-ready',
          type: 'success',
          title: 'Ready!',
          message: `${state.inputContent.length.toLocaleString()} characters ready.`,
        });
      }
      break;

    case 1: // Configure
      if (!state.industryCategory) {
        alerts.push({
          id: 'industry-required',
          type: 'action',
          title: 'Select Industry',
          message: 'Choose an industry to optimize AI.',
        });
      }
      if (state.industryCategory) {
        alerts.push({
          id: 'industry-selected',
          type: 'success',
          title: 'Industry Set',
          message: 'AI optimized for your industry.',
        });
      }
      alerts.push({
        id: 'auto-mode-tip',
        type: 'tip',
        title: 'AI Auto Mode',
        message: 'Auto-selects best models for your content.',
      });
      break;

    case 2: // Template & Branding
      if (!state.selectedTemplate) {
        alerts.push({
          id: 'template-required',
          type: 'info',
          title: 'Choose Template',
          message: 'Pick a style for your presentation.',
        });
      }
      alerts.push({
        id: 'branding-tip',
        type: 'tip',
        title: 'Add Your Logo',
        message: 'Auto-extracts brand colors.',
      });
      break;

    case 3: // Output Type
      if (state.outputSettings?.outputType === '3d' || state.outputSettings?.outputType === 'video') {
        alerts.push({
          id: 'complex-output',
          type: 'warning',
          title: 'Extended Time',
          message: '3D/Video needs 2-4x more time.',
        });
      }
      if ((state.outputSettings?.outputTypes?.length || 0) > 2) {
        alerts.push({
          id: 'multi-output',
          type: 'info',
          title: 'Multi-Output',
          message: 'Each format uses additional credits.',
        });
      }
      alerts.push({
        id: 'output-tip',
        type: 'tip',
        title: 'Start Simple',
        message: '2D Static is fastest to review.',
      });
      break;

    case 4: // Agents & Languages
      if ((state.selectedLanguages?.length || 0) === 0) {
        alerts.push({
          id: 'language-required',
          type: 'action',
          title: 'Select Languages',
          message: 'Choose output languages.',
        });
      }
      if ((state.selectedLanguages?.length || 0) > 3) {
        alerts.push({
          id: 'many-languages',
          type: 'warning',
          title: 'Many Languages',
          message: `${state.selectedLanguages?.length} selected. Voiceover limited to 3.`,
        });
      }
      if (state.useAgenticGeneration) {
        alerts.push({
          id: 'agentic-mode',
          type: 'info',
          title: 'Agentic AI',
          message: 'Multi-agent for highest quality.',
        });
      }
      if (state.includeVoiceover) {
        alerts.push({
          id: 'voiceover-enabled',
          type: 'success',
          title: 'Voiceover On',
          message: 'Natural narration will be generated.',
        });
      }
      break;

    case 5: // Generate
      alerts.push({
        id: 'review-all',
        type: 'info',
        title: 'Final Review',
        message: 'Check settings before generating.',
      });
      alerts.push({
        id: 'generate-tip',
        type: 'tip',
        title: 'Auto-Saved',
        message: 'Results save automatically.',
      });
      break;
  }

  return alerts;
}

export default StepAlertBanner;
