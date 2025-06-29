
import { useState, useEffect } from 'react';
import { RealVerificationOrchestrator, RealSystemHealthResult } from '@/utils/verification/RealVerificationOrchestrator';
import { useToast } from '@/hooks/use-toast';

interface UseRealDatabaseValidationResult {
  healthScore: number;
  isSystemStable: boolean;
  criticalIssuesCount: number;
  totalActiveIssues: number;
  lastValidationTime: Date | null;
  databaseIssues: any[];
  isValidating: boolean;
  error: string | null;
  validateNow: () => Promise<void>;
  validationResult: RealSystemHealthResult | null;
}

export const useRealDatabaseValidation = (): UseRealDatabaseValidationResult => {
  const [validationResult, setValidationResult] = useState<RealSystemHealthResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateNow = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      console.log('🚀 Starting real database validation...');
      
      const result = await RealVerificationOrchestrator.performRealSystemValidation();
      
      setValidationResult(result);
      
      toast({
        title: "✅ Real Database Validation Complete",
        description: `Health Score: ${result.overallHealthScore}/100 • Issues: ${result.totalActiveIssues}`,
        variant: result.isSystemStable ? "default" : "destructive",
      });

      console.log('✅ Real database validation completed successfully');
      console.log('📊 Validation Result:', result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown validation error';
      setError(errorMessage);
      
      toast({
        title: "❌ Real Database Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error('❌ Real database validation failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate on mount
  useEffect(() => {
    validateNow();
  }, []);

  return {
    healthScore: validationResult?.overallHealthScore || 0,
    isSystemStable: validationResult?.isSystemStable || false,
    criticalIssuesCount: validationResult?.criticalIssuesCount || 0,
    totalActiveIssues: validationResult?.totalActiveIssues || 0,
    lastValidationTime: validationResult ? new Date(validationResult.lastValidationTime) : null,
    databaseIssues: validationResult?.databaseHealth.issues || [],
    isValidating,
    error,
    validateNow,
    validationResult
  };
};
