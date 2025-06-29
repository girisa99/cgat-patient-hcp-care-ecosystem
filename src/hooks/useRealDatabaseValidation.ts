
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
  allCategorizedIssues: {
    securityIssues: any[];
    databaseIssues: any[];
    codeQualityIssues: any[];
    systemIssues: any[];
    uiuxIssues: any[];
  };
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
      console.log('🚀 Starting comprehensive real database validation...');
      
      const result = await RealVerificationOrchestrator.performRealSystemValidation();
      
      setValidationResult(result);
      
      // Categorize issues for UI display
      const categorizedIssues = categorizeIssues(result.databaseHealth.issues);
      
      toast({
        title: "✅ Real Database Validation Complete",
        description: `Health Score: ${result.overallHealthScore}/100 • Issues: ${result.totalActiveIssues} • Synced to database`,
        variant: result.isSystemStable ? "default" : "destructive",
      });

      console.log('✅ Real database validation completed and synced to database');
      console.log('📊 Validation Result:', result);
      console.log('🗂️ Categorized Issues:', categorizedIssues);
      
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

  const categorizeIssues = (issues: any[]) => {
    const securityIssues = issues.filter(issue => 
      issue.type === 'missing_rls' || 
      issue.type === 'security_gap' ||
      issue.source?.toLowerCase().includes('security')
    );
    
    const databaseIssues = issues.filter(issue => 
      issue.type === 'schema_inconsistency' || 
      issue.type === 'constraint_violation' ||
      issue.source?.toLowerCase().includes('database')
    );
    
    const codeQualityIssues = issues.filter(issue => 
      issue.source?.toLowerCase().includes('code') ||
      issue.source?.toLowerCase().includes('quality')
    );
    
    const uiuxIssues = issues.filter(issue => 
      issue.source?.toLowerCase().includes('ui') ||
      issue.source?.toLowerCase().includes('ux')
    );
    
    const systemIssues = issues.filter(issue => 
      !securityIssues.includes(issue) &&
      !databaseIssues.includes(issue) &&
      !codeQualityIssues.includes(issue) &&
      !uiuxIssues.includes(issue)
    );

    return {
      securityIssues,
      databaseIssues,
      codeQualityIssues,
      uiuxIssues,
      systemIssues
    };
  };

  // Auto-validate on mount
  useEffect(() => {
    validateNow();
  }, []);

  const allCategorizedIssues = validationResult ? 
    categorizeIssues(validationResult.databaseHealth.issues) : 
    {
      securityIssues: [],
      databaseIssues: [],
      codeQualityIssues: [],
      uiuxIssues: [],
      systemIssues: []
    };

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
    validationResult,
    allCategorizedIssues
  };
};
