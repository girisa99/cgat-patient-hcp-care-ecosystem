
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Zap, CheckCircle, Loader2 } from 'lucide-react';
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
  const { toast } = useToast();

  const handleApplyFix = async () => {
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

  if (isFixed) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="bg-green-50 border-green-200 text-green-700"
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        Fixed
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
