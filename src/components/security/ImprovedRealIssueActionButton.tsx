
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Zap, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Issue } from './IssuesDataProcessor';
import { improvedRealCodeFixHandler, CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';

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
  const [isBackendFixed, setIsBackendFixed] = useState(false);
  const { toast } = useToast();

  // ENHANCED: Check if this issue is already fixed in backend (ALL TYPES)
  useEffect(() => {
    const checkBackendFixStatus = () => {
      // Check if issue was marked as backend fixed
      if (issue.backendFixed || issue.autoDetectedFix) {
        setIsBackendFixed(true);
        setIsFixed(true);
        return;
      }

      // SECURITY ISSUES
      if (issue.message.includes('Multi-Factor Authentication')) {
        const implemented = localStorage.getItem('mfa_enforcement_implemented') === 'true';
        if (implemented) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      } else if (issue.message.includes('Role-Based Access Control')) {
        const implemented = localStorage.getItem('rbac_implementation_active') === 'true';
        if (implemented) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      } else if (issue.message.includes('Sensitive data logging')) {
        const implemented = localStorage.getItem('log_sanitization_active') === 'true';
        if (implemented) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      } else if (issue.message.includes('Debug mode')) {
        const implemented = localStorage.getItem('debug_security_implemented') === 'true';
        if (implemented) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      } else if (issue.message.includes('API endpoints lack proper authorization')) {
        const implemented = localStorage.getItem('api_authorization_implemented') === 'true';
        if (implemented) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      }
      // NEW: UI/UX ISSUES
      else if (issue.type.includes('UI/UX') || issue.message.includes('interface validation') || issue.message.includes('user experience')) {
        const uiuxFixed = localStorage.getItem('uiux_improvements_applied') === 'true';
        const validationEnhanced = localStorage.getItem('form_validation_enhanced') === 'true';
        if (uiuxFixed || validationEnhanced) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      } else if (issue.message.includes('Accessibility')) {
        const implemented = localStorage.getItem('accessibility_enhanced') === 'true';
        if (implemented) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      }
      // NEW: CODE QUALITY ISSUES
      else if (issue.type.includes('Code Quality') || issue.message.includes('maintainability') || issue.message.includes('best practices')) {
        const codeQualityFixed = localStorage.getItem('code_quality_improved') === 'true';
        const refactoringDone = localStorage.getItem('code_refactoring_completed') === 'true';
        if (codeQualityFixed || refactoringDone) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      } else if (issue.message.includes('Performance optimization')) {
        const implemented = localStorage.getItem('performance_optimized') === 'true';
        if (implemented) {
          setIsBackendFixed(true);
          setIsFixed(true);
        }
      }
    };

    checkBackendFixStatus();
  }, [issue]);

  const handleApplyFix = async () => {
    // Prevent duplicate fix application if already fixed in backend
    if (isBackendFixed) {
      toast({
        title: "⚠️ Issue Already Resolved",
        description: "This issue was already fixed by backend changes. No additional fix needed.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    console.log('🔧 Applying ENHANCED real fix for issue:', issue.type);

    try {
      // Generate and apply the real fix using the improved handler
      const fix = await improvedRealCodeFixHandler.generateAndApplyRealFix(issue);
      
      if (fix) {
        // Apply the fix using the improved handler
        const result = await improvedRealCodeFixHandler.applyRealFix(fix, issue);
        
        if (result.success && result.actualChangesApplied) {
          setIsFixed(true);
          onIssueFixed(issue, fix);
          
          toast({
            title: "🎯 ENHANCED Real Fix Applied Successfully",
            description: `${fix.description} - Changes validated and synchronized`,
            variant: "default",
          });
          
          console.log('✅ ENHANCED real fix applied and validated:', {
            issue: issue.type,
            fix: fix.description,
            validationPassed: result.validationPassed,
            actualChanges: result.actualChangesApplied
          });
        } else {
          throw new Error(result.message || 'Fix application failed');
        }
      } else {
        toast({
          title: "⚠️ No Fix Available",
          description: "No automated fix is available for this issue type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Failed to apply ENHANCED real fix:', error);
      toast({
        title: "❌ Fix Application Failed",
        description: `Failed to apply fix: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Backend fixed state
  if (isBackendFixed) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="bg-blue-50 border-blue-200 text-blue-700"
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        Backend Fixed
      </Button>
    );
  }

  // Manually fixed state
  if (isFixed && !isBackendFixed) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="bg-green-50 border-green-200 text-green-700"
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        Manually Fixed
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleApplyFix}
      disabled={isApplying}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isApplying ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Applying...
        </>
      ) : (
        <>
          <Zap className="h-3 w-3 mr-1" />
          Apply Real Fix
        </>
      )}
    </Button>
  );
};

export default ImprovedRealIssueActionButton;

