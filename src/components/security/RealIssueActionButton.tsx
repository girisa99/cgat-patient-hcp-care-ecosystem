
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wrench, Loader2, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { realCodeFixHandler, CodeFix, FixResult } from '@/utils/verification/RealCodeFixHandler';
import { Issue } from './IssuesDataProcessor';

interface RealIssueActionButtonProps {
  issue: Issue;
  onFixApplied: (issue: Issue, fix: CodeFix) => void;
}

const RealIssueActionButton: React.FC<RealIssueActionButtonProps> = ({
  issue,
  onFixApplied
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [validationResults, setValidationResults] = useState<string[]>([]);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);

  // AUTOMATIC CHECK: Only enable if we can generate and validate a fix
  const canApplyFix = React.useMemo(() => {
    // Check if this is a known fixable issue type
    const fixableTypes = [
      'Multi-Factor Authentication',
      'Role-Based Access Control', 
      'Sensitive data logging',
      'Debug mode',
      'security headers',
      'encryption'
    ];
    
    return fixableTypes.some(type => 
      issue.message.toLowerCase().includes(type.toLowerCase()) ||
      issue.type.toLowerCase().includes('security')
    );
  }, [issue]);

  const handleApplyFix = async () => {
    setIsApplying(true);
    
    try {
      console.log('🔧 Starting AUTOMATIC fix application with validation for:', issue.type);
      
      // Generate the real fix
      const fix = await realCodeFixHandler.generateRealFix(issue);
      
      if (!fix) {
        console.log('❌ No fix available for this issue type');
        return;
      }

      console.log('🔍 Fix generated with validation checks:', fix.validationChecks?.length || 0);

      // Apply the real fix with AUTOMATIC validation
      const result: FixResult = await realCodeFixHandler.applyRealFix(fix, issue);
      setFixResult(result);
      
      if (result.validationResults) {
        setValidationResults(result.validationResults);
      }

      if (result.success && result.validationPassed) {
        console.log('✅ Real fix applied and AUTOMATICALLY VALIDATED:', result.message);
        setIsFixed(true);
        onFixApplied(issue, fix);
      } else if (result.success && !result.validationPassed) {
        console.log('⚠️ Fix applied but AUTOMATIC VALIDATION FAILED:', result.message);
      } else {
        console.error('❌ Fix application failed:', result.message);
      }
      
    } catch (error) {
      console.error('❌ Error during AUTOMATIC fix application:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Show validation results if fix was attempted
  if (fixResult && validationResults.length > 0) {
    const validationPassed = fixResult.validationPassed;
    
    return (
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled
          className={validationPassed ? 
            "bg-green-50 border-green-200 text-green-700" : 
            "bg-red-50 border-red-200 text-red-700"
          }
        >
          {validationPassed ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Fixed & Validated
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-1" />
              Validation Failed
            </>
          )}
        </Button>
        
        {/* Show validation details */}
        <div className="text-xs space-y-1 max-w-xs">
          {validationResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-1 rounded text-xs ${
                result.includes('✅') ? 'bg-green-50 text-green-700' : 
                result.includes('❌') ? 'bg-red-50 text-red-700' : 
                'bg-yellow-50 text-yellow-700'
              }`}
            >
              {result}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isFixed) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        className="bg-green-50 border-green-200 text-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Fixed & Validated
      </Button>
    );
  }

  if (!canApplyFix) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        className="bg-gray-50 border-gray-200 text-gray-500"
      >
        <AlertTriangle className="h-4 w-4 mr-1" />
        No Auto-Fix Available
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleApplyFix}
      disabled={isApplying}
      variant="outline"
      size="sm"
      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
    >
      {isApplying ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Applying & Validating...
        </>
      ) : (
        <>
          <Shield className="h-4 w-4 mr-1" />
          Apply Auto-Fix
        </>
      )}
    </Button>
  );
};

export default RealIssueActionButton;
