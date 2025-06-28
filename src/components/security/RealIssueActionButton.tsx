
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle, AlertTriangle, Loader2, Code, Database, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { realCodeFixHandler, CodeFix } from '@/utils/verification/RealCodeFixHandler';

interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

interface RealIssueActionButtonProps {
  issue: Issue;
  onFixApplied: (issue: Issue, fix: CodeFix) => void;
}

const RealIssueActionButton: React.FC<RealIssueActionButtonProps> = ({ 
  issue, 
  onFixApplied 
}) => {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = React.useState(false);
  const [fixResult, setFixResult] = React.useState<string | null>(null);

  const handleRealFix = async () => {
    setIsFixing(true);
    setFixResult(null);

    try {
      console.log('🔧 Starting real fix for:', issue.type);
      
      // Generate the actual fix
      const fix = await realCodeFixHandler.generateRealFix(issue);
      
      if (!fix) {
        throw new Error('Unable to generate fix for this issue type');
      }

      // Apply the real fix
      const result = await realCodeFixHandler.applyRealFix(fix);

      if (result.success) {
        setFixResult(result.message);
        onFixApplied(issue, fix);
        
        toast({
          title: "🔧 Real Fix Applied",
          description: result.message,
          variant: "default",
        });

        if (result.backupCreated) {
          toast({
            title: "💾 Backup Created",
            description: result.rollbackInfo || "Backup created successfully",
            variant: "default",
          });
        }

        // Show specific fix details
        if (fix.filePath) {
          console.log('📁 File modified:', fix.filePath);
        }
        if (fix.sqlQuery) {
          console.log('🗄️ Database query executed:', fix.sqlQuery);
        }

      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('❌ Real fix failed:', error);
      toast({
        title: "❌ Fix Failed",
        description: `Unable to apply real fix: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const getFixIcon = () => {
    if (issue.type.includes('Database') || issue.type.includes('Schema')) {
      return <Database className="h-3 w-3" />;
    }
    if (issue.type.includes('Security')) {
      return <Shield className="h-3 w-3" />;
    }
    return <Code className="h-3 w-3" />;
  };

  const getFixDescription = () => {
    if (issue.type.includes('Performance')) {
      return 'Optimize Performance';
    }
    if (issue.type.includes('Security')) {
      return 'Secure Code';
    }
    if (issue.type.includes('Database')) {
      return 'Fix Database';
    }
    if (issue.type.includes('Accessibility')) {
      return 'Improve A11y';
    }
    return 'Fix Code';
  };

  if (fixResult) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Fixed
        </Badge>
        <span className="text-xs text-green-600 font-medium">
          Real fix applied
        </span>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant={issue.severity === 'critical' ? 'destructive' : 'default'}
      onClick={handleRealFix}
      disabled={isFixing}
      className="flex items-center gap-1"
    >
      {isFixing ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Fixing...
        </>
      ) : (
        <>
          {getFixIcon()}
          <Wrench className="h-3 w-3" />
          {getFixDescription()}
        </>
      )}
    </Button>
  );
};

export default RealIssueActionButton;
