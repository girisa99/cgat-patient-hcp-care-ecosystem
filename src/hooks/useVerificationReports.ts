
/**
 * Verification Reports Hook
 * Handles report generation and download functionality
 */

import { useCallback } from 'react';
import { ComprehensiveSystemVerifier, ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';
import { useToast } from './use-toast';

export const useVerificationReports = () => {
  const { toast } = useToast();

  /**
   * Download comprehensive report
   */
  const downloadComprehensiveReport = useCallback((verificationResult: ComprehensiveVerificationResult | null) => {
    if (!verificationResult) {
      toast({
        title: "⚠️ No Results Available",
        description: "Please run a verification first",
        variant: "destructive",
      });
      return;
    }

    try {
      const report = ComprehensiveSystemVerifier.generateComprehensiveReport(verificationResult);
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprehensive-verification-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📄 Report Downloaded",
        description: "Comprehensive verification report saved successfully",
        variant: "default",
      });

    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "❌ Download Failed",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    downloadComprehensiveReport
  };
};
