
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, AlertTriangle, Loader2, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseIssue } from '@/utils/verification/EnhancedDatabaseValidator';
import { DatabaseRealCodeFixHandler, DatabaseFixResult } from '@/utils/verification/DatabaseRealCodeFixHandler';

interface DatabaseIssueActionButtonProps {
  issue: DatabaseIssue;
  onFixApplied: (issue: DatabaseIssue, result: DatabaseFixResult) => void;
}

const DatabaseIssueActionButton: React.FC<DatabaseIssueActionButtonProps> = ({ 
  issue, 
  onFixApplied 
}) => {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = React.useState(false);
  const [fixResult, setFixResult] = React.useState<DatabaseFixResult | null>(null);

  const handleDatabaseFix = async () => {
    setIsFixing(true);

    try {
      console.log('🔧 Starting database fix for:', issue.type);
      
      const result = await DatabaseRealCodeFixHandler.applyDatabaseFix(issue);
      
      setFixResult(result);
      onFixApplied(issue, result);

      if (result.success) {
        toast({
          title: "🗄️ Database Fix Applied",
          description: result.message,
          variant: "default",
        });

        if (result.backupCreated) {
          toast({
            title: "💾 Backup Created",
            description: "Database backup created before applying fix",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "❌ Database Fix Failed",
          description: result.message,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ Database fix failed:', error);
      toast({
        title: "❌ Fix Failed",
        description: `Unable to apply database fix: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const getSeverityColor = () => {
    switch (issue.severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIssueTypeIcon = () => {
    switch (issue.type) {
      case 'missing_table': return '🗂️';
      case 'missing_column': return '📋';
      case 'rls_missing': return '🛡️';
      case 'constraint_missing': return '🔒';
      case 'index_missing': return '⚡';
      case 'foreign_key_missing': return '🔗';
      default: return '🗄️';
    }
  };

  if (fixResult?.success) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Fixed
        </Badge>
        <span className="text-xs text-green-600 font-medium">
          Database fix applied
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge className={getSeverityColor()}>
          {issue.severity.toUpperCase()}
        </Badge>
        <span className="text-xs font-medium">
          {getIssueTypeIcon()} {issue.type.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={issue.severity === 'critical' ? 'destructive' : 'default'}
          onClick={handleDatabaseFix}
          disabled={isFixing || !issue.autoFixable}
          className="flex items-center gap-1"
        >
          {isFixing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Fixing DB...
            </>
          ) : (
            <>
              <Database className="h-3 w-3" />
              <Wrench className="h-3 w-3" />
              Fix Database
            </>
          )}
        </Button>
        
        {!issue.autoFixable && (
          <Badge variant="outline" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Manual Review Required
          </Badge>
        )}
      </div>

      {issue.sqlFix && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            View SQL Fix
          </summary>
          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
            {issue.sqlFix}
          </pre>
        </details>
      )}
    </div>
  );
};

export default DatabaseIssueActionButton;
