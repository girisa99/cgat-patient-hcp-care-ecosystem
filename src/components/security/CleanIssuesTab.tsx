
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccurateIssuesProcessor } from './AccurateIssuesProcessor';
import EnhancedIssueTopicGroup from './EnhancedIssueTopicGroup';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import { Issue } from '@/types/issuesTypes';
import { markIssueAsReallyFixed } from './IssuesDataProcessor';
import { EnhancedAccuracyAssessment, AssessmentResult } from '@/utils/verification/EnhancedAccuracyAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CleanIssuesTabProps {
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const CleanIssuesTab: React.FC<CleanIssuesTabProps> = ({ 
  onReRunVerification,
  isReRunning = false 
}) => {
  const { toast } = useToast();
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  
  const {
    activeIssues,
    totalFixedCount,
    isScanning,
    lastScanTime,
    performComprehensiveScan,
    getCategorizedIssues
  } = useAccurateIssuesProcessor();

  const categorizedIssues = getCategorizedIssues();

  const topicIcons = {
    'Security Scanner': Shield,
    'Database Scanner': Database,
    'Code Quality Scanner': Code,
    'UI/UX Scanner': Bug,
    'System Issues': Bug
  };

  // Perform assessment on mount and when issues change
  useEffect(() => {
    performAccuracyAssessment();
  }, [activeIssues.length]);

  const performAccuracyAssessment = async () => {
    setIsAssessing(true);
    console.log('🔍 PERFORMING ACCURACY ASSESSMENT...');
    
    try {
      const result = EnhancedAccuracyAssessment.performFullAssessment();
      setAssessmentResult(result);
      
      console.log('📊 ASSESSMENT RESULTS:', {
        totalReported: result.accuracyReport.totalIssuesReported,
        actuallyFixed: result.accuracyReport.actuallyFixed,
        stillActive: result.accuracyReport.stillActive,
        falsePositives: result.accuracyReport.falsePositives,
        accuracy: result.accuracyReport.accuracyPercentage
      });
      
      if (result.accuracyReport.actuallyFixed > 0) {
        toast({
          title: "📊 Assessment Complete",
          description: `Found ${result.accuracyReport.actuallyFixed} issues that are actually fixed but still showing`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('❌ Assessment failed:', error);
      toast({
        title: "❌ Assessment Failed",
        description: "Failed to perform accuracy assessment",
        variant: "destructive",
      });
    } finally {
      setIsAssessing(false);
    }
  };

  // Handle manual fix application
  const handleRealIssueFixed = async (issue: Issue, fix: CodeFix) => {
    console.log('🔧 Manual fix applied:', { issue: issue.type, fix: fix.description });
    
    try {
      // Mark issue as really fixed in database
      await markIssueAsReallyFixed(issue);
      
      // Trigger fresh scan to update display
      await performComprehensiveScan();
      
      // Re-run assessment
      await performAccuracyAssessment();
      
      toast({
        title: "🛡️ Fix Applied Successfully",
        description: `${fix.description} - Issue resolved and database updated`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error applying fix:', error);
      toast({
        title: "❌ Fix Application Failed",
        description: "Failed to apply fix. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Assessment Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Enhanced Issue Assessment System</h3>
            </div>
            <p className="text-sm text-blue-700">
              Advanced accuracy verification with implementation detection.
              {lastScanTime && ` Last scanned: ${lastScanTime.toLocaleTimeString()}`}
            </p>
          </div>
          <Button 
            onClick={performAccuracyAssessment}
            disabled={isAssessing}
            variant="outline"
            className="ml-4"
          >
            {isAssessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Assessing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-assess Accuracy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Assessment Results Card */}
      {assessmentResult && (
        <Card className={`${
          assessmentResult.accuracyReport.accuracyPercentage >= 80 ? 'bg-green-50 border-green-200' : 
          assessmentResult.accuracyReport.accuracyPercentage >= 60 ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center ${
              assessmentResult.accuracyReport.accuracyPercentage >= 80 ? 'text-green-800' : 
              assessmentResult.accuracyReport.accuracyPercentage >= 60 ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {assessmentResult.accuracyReport.accuracyPercentage >= 80 ? 
                <CheckCircle className="h-5 w-5 mr-2" /> : 
                <AlertTriangle className="h-5 w-5 mr-2" />
              }
              Assessment Accuracy: {assessmentResult.accuracyReport.accuracyPercentage}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Actually Fixed</div>
                <div className="text-2xl font-bold text-green-600">
                  {assessmentResult.accuracyReport.actuallyFixed}
                </div>
              </div>
              <div>
                <div className="font-medium">Still Active</div>
                <div className="text-2xl font-bold text-red-600">
                  {assessmentResult.accuracyReport.stillActive}
                </div>
              </div>
              <div>
                <div className="font-medium">False Positives</div>
                <div className="text-2xl font-bold text-orange-600">
                  {assessmentResult.accuracyReport.falsePositives}
                </div>
              </div>
              <div>
                <div className="font-medium">Total Reported</div>
                <div className="text-2xl font-bold text-blue-600">
                  {assessmentResult.accuracyReport.totalIssuesReported}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats with Enhanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-800">{categorizedIssues.critical.length}</div>
          <div className="text-sm text-red-600">Critical Issues</div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-800">{categorizedIssues.high.length}</div>
          <div className="text-sm text-orange-600">High Priority</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">{categorizedIssues.medium.length}</div>
          <div className="text-sm text-yellow-600">Medium Priority</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-800">
            {categorizedIssues.byTopic['Database Scanner']?.length || 0}
          </div>
          <div className="text-sm text-purple-600">Database Issues</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{totalFixedCount}</div>
          <div className="text-sm text-green-600">Issues Fixed</div>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Active Issues ({categorizedIssues.total})
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Fixed Issues ({totalFixedCount})
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Assessment Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Issues by Topic */}
          {Object.entries(categorizedIssues.byTopic).map(([topic, issues]) => {
            if (issues.length === 0) return null;
            
            return (
              <EnhancedIssueTopicGroup
                key={topic}
                topic={topic}
                issues={issues}
                icon={topicIcons[topic as keyof typeof topicIcons] || Bug}
                onIssueFixed={handleRealIssueFixed}
              />
            );
          })}

          {/* No Issues State */}
          {categorizedIssues.total === 0 && !isScanning && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-medium text-green-900 mb-2">No Active Issues Found</h3>
              <p className="text-green-700">
                All identified issues have been resolved. Total fixes applied: {totalFixedCount}
              </p>
            </div>
          )}

          {/* Scanning State */}
          {(isScanning || isAssessing) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                {isAssessing ? 'Enhanced Assessment in Progress' : 'Comprehensive Scan in Progress'}
              </h3>
              <p className="text-blue-700">
                {isAssessing ? 
                  'Verifying actual implementation status and accuracy...' :
                  'Analyzing all code issues and syncing with database...'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fixed" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <div className="text-4xl font-bold text-green-600 mb-2">{totalFixedCount}</div>
              <p className="text-gray-600 mb-4">Total fixes successfully applied to the codebase</p>
              <div className="text-sm text-gray-500">
                {lastScanTime && `Last verified: ${lastScanTime.toLocaleString()}`}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          {assessmentResult && (
            <div className="space-y-4">
              {/* Security Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Implementation Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(assessmentResult.detailedFindings.securityIssues).map(([key, status]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                        <div className="text-sm text-gray-600">{status.implementationDetails.join(', ')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status.isImplemented ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {status.isImplemented ? 'Implemented' : 'Pending'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status.confidence === 'high' ? 'bg-blue-100 text-blue-800' :
                          status.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.confidence} confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Database Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database Implementation Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(assessmentResult.detailedFindings.databaseIssues).map(([key, status]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                        <div className="text-sm text-gray-600">{status.implementationDetails.join(', ')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status.isImplemented ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {status.isImplemented ? 'Implemented' : 'Pending'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status.confidence === 'high' ? 'bg-blue-100 text-blue-800' :
                          status.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.confidence} confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CleanIssuesTab;
