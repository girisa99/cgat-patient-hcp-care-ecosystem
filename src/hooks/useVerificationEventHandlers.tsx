
import { useEffect } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useToast } from '@/hooks/use-toast';

interface UseVerificationEventHandlersProps {
  onVerificationComplete: (summary: VerificationSummary) => void;
  onVerificationStarted: () => void;
  onVerificationStopped: () => void;
  onCriticalIssues: (summary: VerificationSummary) => void;
  onPeriodicScanComplete: (summary: VerificationSummary) => void;
}

export const useVerificationEventHandlers = ({
  onVerificationComplete,
  onVerificationStarted,
  onVerificationStopped,
  onCriticalIssues,
  onPeriodicScanComplete
}: UseVerificationEventHandlersProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const handleVerificationComplete = (event: CustomEvent) => {
      const summary = event.detail as VerificationSummary;
      onVerificationComplete(summary);
      showAutomaticNotification(summary);
    };

    const handleCriticalIssues = (event: CustomEvent) => {
      const summary = event.detail as VerificationSummary;
      onCriticalIssues(summary);
      toast({
        title: "🚨 Critical Issues Detected",
        description: `${summary.criticalIssues} critical issues found. Creation blocked automatically.`,
        variant: "destructive",
      });
    };

    const handlePeriodicScanComplete = (event: CustomEvent) => {
      const summary = event.detail as VerificationSummary;
      onPeriodicScanComplete(summary);
      if (summary.issuesFound > 0) {
        toast({
          title: "📊 Periodic Scan Alert",
          description: `Background scan found ${summary.issuesFound} issues.`,
          variant: "default",
        });
      }
    };

    const showAutomaticNotification = (summary: VerificationSummary) => {
      if (summary.criticalIssues > 0) {
        toast({
          title: "🚨 Critical Issues",
          description: `${summary.criticalIssues} critical issues detected and blocked automatically.`,
          variant: "destructive",
        });
      } else if (summary.issuesFound > 0) {
        toast({
          title: "⚠️ Issues Detected",
          description: `${summary.issuesFound} issues found. ${summary.autoFixesApplied} automatically fixed.`,
          variant: "default",
        });
      } else if (summary.autoFixesApplied > 0) {
        toast({
          title: "🔧 Auto-fixes Applied",
          description: `${summary.autoFixesApplied} issues automatically resolved.`,
          variant: "default",
        });
      }
    };

    // Add event listeners
    window.addEventListener('automated-verification-verification-complete', handleVerificationComplete);
    window.addEventListener('automated-verification-verification-started', onVerificationStarted);
    window.addEventListener('automated-verification-verification-stopped', onVerificationStopped);
    window.addEventListener('automated-verification-critical-issues-detected', handleCriticalIssues);
    window.addEventListener('automated-verification-periodic-scan-complete', handlePeriodicScanComplete);

    return () => {
      window.removeEventListener('automated-verification-verification-complete', handleVerificationComplete);
      window.removeEventListener('automated-verification-verification-started', onVerificationStarted);
      window.removeEventListener('automated-verification-verification-stopped', onVerificationStopped);
      window.removeEventListener('automated-verification-critical-issues-detected', handleCriticalIssues);
      window.removeEventListener('automated-verification-periodic-scan-complete', handlePeriodicScanComplete);
    };
  }, [onVerificationComplete, onVerificationStarted, onVerificationStopped, onCriticalIssues, onPeriodicScanComplete, toast]);
};
