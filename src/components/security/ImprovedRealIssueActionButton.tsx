
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

  // Check if this issue is already fixed in backend
  useEffect(() => {
    const checkBackendFixStatus = () => {
      // Check if issue was marked as backend fixed
      if (issue.backendFixed || issue.autoDetectedFix) {
        setIsBackendFixed(true);
        setIsFixed(true);
        return;
      }

      // Check specific implementation status for security issues
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
    console.log('🔧 Applying improved real fix for issue:', issue.type);

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
            title: "🎯 Real Fix Applied Successfully",
            description: `${fix.description} - Changes validated and synchronized`,
            variant: "default",
          });
          
          console.log('✅ Real fix applied and validated:', {
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
      console.error('❌ Failed to apply real fix:', error);
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
