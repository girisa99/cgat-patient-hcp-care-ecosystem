
import { useState, useCallback } from 'react';
import { ComprehensiveSystemVerifier, ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';
import { useToast } from '@/hooks/use-toast';

interface UseComprehensiveVerificationResult {
  verificationResult: ComprehensiveVerificationResult | null;
  isVerifying: boolean;
  error: string | null;
  runComprehensiveVerification: () => Promise<void>;
  downloadComprehensiveReport: () => void;
}

export const useComprehensiveVerification = (): UseComprehensiveVerificationResult => {
  const [verificationResult, setVerificationResult] = useState<ComprehensiveVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runComprehensiveVerification = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      console.log('🚀 Starting comprehensive system verification...');
      
      toast({
        title: "🔍 Comprehensive Verification Started",
        description: "Running complete system health check and sync verification...",
        variant: "default",
      });

      const result = await ComprehensiveSystemVerifier.runCompleteVerification();
      
      setVerificationResult(result);
      
      // Show appropriate toast based on results
      if (result.overallStatus === 'critical') {
        toast({
          title: "🚨 Critical Issues Found",
          description: `${result.criticalIssuesFound} critical issues detected. Immediate action required.`,
          variant: "destructive",
        });
      } else if (result.overallStatus === 'warning') {
        toast({
          title: "⚠️ System Needs Attention",
          description: `${result.totalActiveIssues} issues found. Review recommendations.`,
          variant: "default",
        });
      } else {
        toast({
          title: "✅ System Verification Complete",
          description: `System is healthy. Health Score: ${result.systemHealth.overallHealthScore}/100`,
          variant: "default",
        });
      }

      // Additional sync status notification
      if (result.syncStatus !== 'in_sync') {
        toast({
          title: "🔄 Sync Issues Detected",
          description: `Database sync status: ${result.syncStatus.replace('_', ' ')}`,
          variant: "destructive",
        });
      }

      console.log('✅ Comprehensive verification completed successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Comprehensive verification failed';
      setError(errorMessage);
      
      toast({
        title: "❌ Comprehensive Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error('❌ Comprehensive verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  }, [toast]);

  const downloadComprehensiveReport = useCallback(() => {
    if (!verificationResult) {
      toast({
        title: "⚠️ No Report Available",
        description: "Please run verification first to generate a report.",
        variant: "default",
      });
      return;
    }

    const report = ComprehensiveSystemVerifier.generateComprehensiveReport(verificationResult);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive-system-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "📄 Report Downloaded",
      description: "Comprehensive system report has been downloaded.",
      variant: "default",
    });
  }, [verificationResult, toast]);

  return {
    verificationResult,
    isVerifying,
    error,
    runComprehensiveVerification,
    downloadComprehensiveReport
  };
};
