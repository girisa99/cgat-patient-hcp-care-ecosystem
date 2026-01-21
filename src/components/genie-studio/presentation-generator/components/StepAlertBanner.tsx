/**
 * Step Alert Banner - Proactive Alerts for each wizard step
 * Shows contextual guidance, warnings, and required actions
 */

import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Lightbulb, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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

const ALERT_STYLES: Record<AlertType, { bg: string; border: string; icon: React.ReactNode; textColor: string }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: <Info className="h-4 w-4 text-blue-600" />,
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    textColor: 'text-green-700 dark:text-green-400',
  },
  action: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    icon: <AlertCircle className="h-4 w-4 text-primary" />,
    textColor: 'text-primary',
  },
  tip: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: <Lightbulb className="h-4 w-4 text-purple-600" />,
    textColor: 'text-purple-700 dark:text-purple-400',
  },
};

export function StepAlertBanner({ alerts, onDismiss, className }: StepAlertBannerProps) {
  if (!alerts.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {alerts.map((alert) => {
        const styles = ALERT_STYLES[alert.type];
        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              styles.bg,
              styles.border
            )}
          >
            <div className="mt-0.5 shrink-0">{styles.icon}</div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-sm font-medium", styles.textColor)}>
                  {alert.title}
                </span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {alert.type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {alert.message}
              </p>
              {alert.actionLabel && alert.onAction && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 text-xs"
                  onClick={alert.onAction}
                >
                  {alert.actionLabel}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
            {alert.dismissible && onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-muted-foreground hover:text-foreground"
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
          message: 'Enter at least 50 characters of content to proceed. You can describe your topic, paste text, upload a document, or provide a URL.',
        });
      }
      if (state.inputContent && state.inputContent.length >= 50 && state.inputContent.length < 200) {
        alerts.push({
          id: 'input-short',
          type: 'tip',
          title: 'More Content = Better Results',
          message: 'Adding more context (200+ chars) helps AI generate more accurate and detailed slides. Consider adding key points or examples.',
        });
      }
      if (state.inputContent && state.inputContent.length >= 200) {
        alerts.push({
          id: 'input-ready',
          type: 'success',
          title: 'Great Content!',
          message: `${state.inputContent.length.toLocaleString()} characters ready for AI processing. Click "Next" to configure your presentation.`,
        });
      }
      break;

    case 1: // Configure
      if (!state.industryCategory) {
        alerts.push({
          id: 'industry-required',
          type: 'action',
          title: 'Select Industry',
          message: 'Choose an industry category to optimize AI recommendations for terminology, design, and content structure.',
        });
      }
      if (state.industryCategory) {
        alerts.push({
          id: 'industry-selected',
          type: 'success',
          title: 'Industry Selected',
          message: 'AI models will now optimize for your industry-specific terminology and visual styles.',
        });
      }
      alerts.push({
        id: 'auto-mode-tip',
        type: 'tip',
        title: 'AI Auto Mode',
        message: 'Use "AI Auto" for intelligent model selection based on your content and industry. Switch to "Custom" for manual control.',
      });
      break;

    case 2: // Template & Branding
      if (!state.selectedTemplate) {
        alerts.push({
          id: 'template-required',
          type: 'info',
          title: 'Choose a Template',
          message: 'Select a template that matches your presentation style. AI will recommend templates based on your industry.',
        });
      }
      alerts.push({
        id: 'branding-tip',
        type: 'tip',
        title: 'Upload Your Logo',
        message: 'Upload your company logo to auto-extract brand colors and create a cohesive visual identity.',
      });
      break;

    case 3: // Output Type
      if (state.outputSettings?.outputType === '3d' || state.outputSettings?.outputType === 'video') {
        alerts.push({
          id: 'complex-output',
          type: 'warning',
          title: 'Extended Generation Time',
          message: '3D/Video outputs require 2-4x more generation time and credits. Consider starting with 2D for faster iteration.',
        });
      }
      if ((state.outputSettings?.outputTypes?.length || 0) > 2) {
        alerts.push({
          id: 'multi-output',
          type: 'info',
          title: 'Multiple Output Types',
          message: 'You\'ve selected multiple output formats. Each format will be generated separately, increasing total credits used.',
        });
      }
      alerts.push({
        id: 'output-tip',
        type: 'tip',
        title: 'Start Simple',
        message: '2D Static is fastest and most compatible. Use it for initial review, then add complexity if needed.',
      });
      break;

    case 4: // Agents & Languages
      if ((state.selectedLanguages?.length || 0) === 0) {
        alerts.push({
          id: 'language-required',
          type: 'action',
          title: 'Select Output Languages',
          message: 'Choose at least one output language for your presentation. Primary language is pre-selected from Step 0.',
        });
      }
      if ((state.selectedLanguages?.length || 0) > 3) {
        alerts.push({
          id: 'many-languages',
          type: 'warning',
          title: 'Multiple Languages',
          message: `${state.selectedLanguages?.length} languages selected. Voiceover is limited to 3 languages by default to manage costs.`,
        });
      }
      if (state.useAgenticGeneration) {
        alerts.push({
          id: 'agentic-mode',
          type: 'info',
          title: 'Agentic AI Enabled',
          message: 'Multi-agent architecture provides highest quality with specialized agents for text, visuals, and voice.',
        });
      }
      if (state.includeVoiceover) {
        alerts.push({
          id: 'voiceover-enabled',
          type: 'success',
          title: 'Voiceover Enabled',
          message: 'AI will generate natural-sounding narration for your slides. Each language gets a native-sounding voice.',
        });
      }
      break;

    case 5: // Generate
      alerts.push({
        id: 'review-all',
        type: 'info',
        title: 'Final Review',
        message: 'Review all your selections below. Check AI confidence scores and credit estimates before generating.',
      });
      alerts.push({
        id: 'generate-tip',
        type: 'tip',
        title: 'Save Your Work',
        message: 'Generated presentations are auto-saved. You can edit, regenerate specific slides, or export to multiple formats.',
      });
      break;
  }

  return alerts;
}

export default StepAlertBanner;
