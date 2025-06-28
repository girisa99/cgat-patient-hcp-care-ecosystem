
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wrench, Loader2, CheckCircle } from 'lucide-react';
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

  const handleApplyFix = async () => {
    setIsApplying(true);
    
    try {
      console.log('🔧 Starting real fix application for:', issue.type);
      
      // Generate the real fix
      const fix = await realCodeFixHandler.generateRealFix(issue);
      
      if (!fix) {
        console.log('❌ No fix available for this issue type');
        return;
      }

      // Apply the real fix with the issue context
      const result: FixResult = await realCodeFixHandler.applyRealFix(fix, issue);
      
      if (result.success) {
        console.log('✅ Real fix applied successfully:', result.message);
        setIsFixed(true);
        onFixApplied(issue, fix);
      } else {
        console.error('❌ Fix application failed:', result.message);
      }
      
    } catch (error) {
      console.error('❌ Error during fix application:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (isFixed) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        className="bg-green-50 border-green-200 text-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Fixed
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
          Applying Fix...
        </>
      ) : (
        <>
          <Wrench className="h-4 w-4 mr-1" />
          Apply Real Fix
        </>
      )}
    </Button>
  );
};

export default RealIssueActionButton;
