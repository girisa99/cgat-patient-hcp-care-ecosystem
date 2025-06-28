
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wrench, Loader2, CheckCircle, AlertTriangle, Shield, Code } from 'lucide-react';
import { improvedRealCodeFixHandler, CodeFix, FixResult } from '@/utils/verification/ImprovedRealCodeFixHandler';
import { Issue } from './IssuesDataProcessor';

interface ImprovedRealIssueActionButtonProps {
  issue: Issue;
  onIssueFixed: (issue: Issue, fix: CodeFix) => void;
}

const ImprovedRealIssueActionButton: React.FC<ImprovedRealIssueActionButtonProps> = ({
  issue,
  onIssueFixed
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [validationResults, setValidationResults] = useState<string[]>([]);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);

  // Check if this issue can be automatically fixed
  const canApplyFix = React.useMemo(() => {
    const fixablePatterns = [
      'Multi-Factor Authentication',
      'Role-Based Access Control', 
      'Sensitive data logging',
      'Debug mode',
      'authorization',
      'sanitized'
    ];
    
    return fixablePatterns.some(pattern => 
      issue.message.toLowerCase().includes(pattern.toLowerCase()) ||
      issue.type.toLowerCase().includes('security')
    );
  }, [issue]);

  const handleApplyRealFix = async () => {
    setIsApplying(true);
    
    try {
      console.log('🔧 Applying REAL CODE FIX with actual modifications for:', issue.type);
      
      // Generate and apply the real fix
      const fix = await improvedRealCodeFixHandler.generateAndApplyRealFix(issue);
      
      if (!fix) {
        console.log('❌ No real fix available for this issue type');
        return;
      }

      console.log('🔍 Real fix generated:', fix.description);

      // Apply the real fix with actual code modifications
      const result: FixResult = await improvedRealCodeFixHandler.applyRealFix(fix, issue);
      setFixResult(result);
      
      if (result.validationResults) {
        setValidationResults(result.validationResults);
      }

      if (result.success && result.validationPassed && result.actualChangesApplied) {
        console.log('✅ REAL FIX APPLIED with actual code changes:', result.message);
        setIsFixed(true);
        onIssueFixed(issue, fix);
      } else {
        console.log('⚠️ Fix application incomplete:', result.message);
      }
      
    } catch (error) {
      console.error('❌ Error during real fix application:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Show validation results if fix was attempted
  if (fixResult && validationResults.length > 0) {
    const validationPassed = fixResult.validationPassed && fixResult.actualChangesApplied;
    
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
              Real Fix Applied ✓
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-1" />
              Fix Incomplete
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
        Real Fix Applied ✓
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
      onClick={handleApplyRealFix}
      disabled={isApplying}
      variant="outline"
      size="sm"
      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
    >
      {isApplying ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Applying Real Fix...
        </>
      ) : (
        <>
          <Code className="h-4 w-4 mr-1" />
          Apply Real Code Fix
        </>
      )}
    </Button>
  );
};

export default ImprovedRealIssueActionButton;
