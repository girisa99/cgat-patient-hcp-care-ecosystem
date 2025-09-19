/**
 * ENROLLMENT SYSTEM TESTER
 * Interactive testing interface for enrollment form functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Play,
  RotateCcw,
  Database
} from "lucide-react";
import { SmartMCPStepwiseAgent } from './SmartMCPStepwiseAgent';
import { EnrollmentErrorDiagnostics } from './EnrollmentErrorDiagnostics';
import { EnrollmentDebugPanel } from './EnrollmentDebugPanel';
import { enrollmentDebugger } from '@/utils/enrollmentDebugger';
import { getEnhancedFieldStatistics } from '@/utils/extendedConditionalFields';
import { AuthStatusChecker } from './AuthStatusChecker';
import { QuickHealthcareLogin } from './QuickHealthcareLogin';

export const EnrollmentSystemTester: React.FC = () => {
  const [testPatientId, setTestPatientId] = useState('');
  const [isTestingLive, setIsTestingLive] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Generate a test patient ID
  const generateTestPatientId = () => {
    const testId = `test-patient-${Date.now()}`;
    setTestPatientId(testId);
    return testId;
  };

  const startLiveTest = () => {
    if (!testPatientId) {
      generateTestPatientId();
    }
    setIsTestingLive(true);
    enrollmentDebugger.info('LIVE_TEST', 'Starting live enrollment test', { testPatientId });
  };

  const stopLiveTest = () => {
    setIsTestingLive(false);
    enrollmentDebugger.info('LIVE_TEST', 'Stopped live enrollment test', { testPatientId });
  };

  const handleTestComplete = (data: any) => {
    enrollmentDebugger.info('LIVE_TEST', 'Test enrollment completed successfully', data);
    setTestResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      status: 'completed',
      data
    }]);
    setIsTestingLive(false);
  };

  const fieldStats = getEnhancedFieldStatistics();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <CardTitle>Enrollment System Testing Suite</CardTitle>
            </div>
            <Badge variant="outline">
              Total Fields Available: {fieldStats.insurance.totalPossible + fieldStats.clinical.totalPossible + fieldStats.provider.totalPossible}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Field Expansion Summary:</strong>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>Insurance: {fieldStats.insurance.base} base → {fieldStats.insurance.totalPossible} total fields</div>
                <div>Clinical: {fieldStats.clinical.base} base → {fieldStats.clinical.totalPossible} total fields</div>
                <div>Provider: {fieldStats.provider.base} base → {fieldStats.provider.totalPossible} total fields</div>
              </div>
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="live-test" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="auth-check">Auth Status</TabsTrigger>
              <TabsTrigger value="live-test">Live Test</TabsTrigger>
              <TabsTrigger value="diagnostics">System Diagnostics</TabsTrigger>
              <TabsTrigger value="debug-logs">Debug Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="auth-check">
              <div className="space-y-4">
                <AuthStatusChecker />
                <QuickHealthcareLogin />
              </div>
            </TabsContent>

            <TabsContent value="live-test" className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="test-patient-id">Test Patient ID</Label>
                  <Input
                    id="test-patient-id"
                    value={testPatientId}
                    onChange={(e) => setTestPatientId(e.target.value)}
                    placeholder="Enter test patient ID or generate one"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={generateTestPatientId}
                  className="mt-6"
                >
                  Generate ID
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                {!isTestingLive ? (
                  <Button
                    onClick={startLiveTest}
                    disabled={!testPatientId}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Live Test</span>
                  </Button>
                ) : (
                  <Button
                    onClick={stopLiveTest}
                    variant="destructive"
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Stop Test</span>
                  </Button>
                )}
              </div>

              {/* Live Test Results */}
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Test Results:</h4>
                  {testResults.map((result, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Test Completed Successfully</span>
                        <Badge variant="outline">{new Date(result.timestamp).toLocaleTimeString()}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Patient ID: {testPatientId}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Enrollment Form */}
              {isTestingLive && testPatientId && (
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
                  <div className="mb-4">
                    <Badge className="bg-blue-100 text-blue-800">
                      🔴 LIVE TEST MODE - Patient ID: {testPatientId}
                    </Badge>
                  </div>
                  
                  <SmartMCPStepwiseAgent
                    patientId={testPatientId}
                    moduleType="live_test"
                    enrollmentSource="system_test"
                    onComplete={handleTestComplete}
                    onProgress={(progress) => {
                      enrollmentDebugger.info('LIVE_TEST', `Progress: ${progress}%`, { progress });
                    }}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="diagnostics">
              <EnrollmentErrorDiagnostics />
            </TabsContent>

            <TabsContent value="debug-logs">
              <EnrollmentDebugPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};