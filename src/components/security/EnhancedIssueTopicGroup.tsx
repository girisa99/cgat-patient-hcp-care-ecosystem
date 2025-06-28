
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Database, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  Wrench,
  Loader2,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RealIssueActionButton from './RealIssueActionButton';
import { realCodeFixHandler, CodeFix } from '@/utils/verification/RealCodeFixHandler';

interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

interface EnhancedIssueTopicGroupProps {
  topic: string;
  issues: Issue[];
  icon: React.ComponentType<any>;
  onIssueFixed: (issue: Issue, fix: CodeFix) => void;
}

const EnhancedIssueTopicGroup: React.FC<EnhancedIssueTopicGroupProps> = ({
  topic,
  issues,
  icon: Icon,
  onIssueFixed
}) => {
  const { toast } = useToast();
  const [isBulkFixing, setIsBulkFixing] = React.useState(false);
  const [fixedIssues, setFixedIssues] = React.useState<Set<string>>(new Set());

  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const activeIssues = issues.filter(issue => !fixedIssues.has(`${issue.type}-${issue.message}`));

  const handleBulkRealFix = async () => {
    setIsBulkFixing(true);
    
    try {
      console.log(`🔧 Starting bulk real fix for ${activeIssues.length} ${topic} issues`);
      
      let successCount = 0;
      let failureCount = 0;
      const results: string[] = [];

      for (const issue of activeIssues) {
        try {
          const fix = await realCodeFixHandler.generateRealFix(issue);
          
          if (fix) {
            const result = await realCodeFixHandler.applyRealFix(fix);
            
            if (result.success) {
              successCount++;
              results.push(`✅ ${issue.type}: ${result.message}`);
              onIssueFixed(issue, fix);
              setFixedIssues(prev => new Set(prev).add(`${issue.type}-${issue.message}`));
            } else {
              failureCount++;
              results.push(`❌ ${issue.type}: ${result.message}`);
            }
          } else {
            failureCount++;
            results.push(`❌ ${issue.type}: No fix available`);
          }
        } catch (error) {
          failureCount++;
          results.push(`❌ ${issue.type}: ${error}`);
        }
      }

      toast({
        title: "🔧 Bulk Real Fix Complete",
        description: `Fixed ${successCount}/${activeIssues.length} issues. ${failureCount} failed.`,
        variant: successCount > 0 ? "default" : "destructive",
      });

      console.log('✅ Bulk fix results:', results);

    } catch (error) {
      console.error('❌ Bulk fix failed:', error);
      toast({
        title: "❌ Bulk Fix Failed",
        description: `Failed to apply bulk fixes: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsBulkFixing(false);
    }
  };

  const handleSingleIssueFixed = (issue: Issue, fix: CodeFix) => {
    setFixedIssues(prev => new Set(prev).add(`${issue.type}-${issue.message}`));
    onIssueFixed(issue, fix);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle>{topic}</CardTitle>
            <Badge variant="outline">{activeIssues.length} active</Badge>
            {fixedIssues.size > 0 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {fixedIssues.size} fixed
              </Badge>
            )}
          </div>
          
          {activeIssues.length > 0 && (
            <Button
              size="sm"
              variant="default"
              onClick={handleBulkRealFix}
              disabled={isBulkFixing}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            >
              {isBulkFixing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Applying Real Fixes...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  <Wrench className="h-3 w-3" />
                  Fix All ({activeIssues.length})
                </>
              )}
            </Button>
          )}
        </div>
        
        <CardDescription>
          {criticalIssues.length > 0 && (
            <span className="text-red-600 font-medium">
              {criticalIssues.length} critical, 
            </span>
          )}
          {activeIssues.length > 0 ? (
            <span className="text-orange-600 font-medium">
              {' '}{activeIssues.length} issues need real fixes
            </span>
          ) : (
            <span className="text-green-600 font-medium">All issues fixed!</span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {issues.map((issue, index) => {
            const isFixed = fixedIssues.has(`${issue.type}-${issue.message}`);
            
            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  isFixed ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <span className="text-sm font-medium">{issue.type}</span>
                    {isFixed && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Fixed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">Source: {issue.source}</p>
                </div>
                
                <div className="ml-4">
                  {!isFixed ? (
                    <RealIssueActionButton
                      issue={issue}
                      onFixApplied={handleSingleIssueFixed}
                    />
                  ) : (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Real Fix Applied
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedIssueTopicGroup;
