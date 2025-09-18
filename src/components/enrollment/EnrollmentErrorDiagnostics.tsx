/**
 * ENROLLMENT ERROR DIAGNOSTICS
 * Quick diagnostic component to test enrollment form functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { smartRouteFieldsToTables, SMART_FIELD_MAPPINGS } from "@/utils/smartFieldRouting";
import { enrollmentDebugger } from "@/utils/enrollmentDebugger";

export const EnrollmentErrorDiagnostics: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults([]);
    enrollmentDebugger.clearLogs();

    const results: any[] = [];

    try {
      // Test 1: Database Connection
      results.push({ test: 'Database Connection', status: 'running' });
      setTestResults([...results]);

      const { data: connectionTest, error: connectionError } = await supabase
        .from('patient_enrollments')
        .select('id')
        .limit(1);

      if (connectionError) {
        results[results.length - 1] = { 
          test: 'Database Connection', 
          status: 'failed', 
          error: connectionError.message 
        };
      } else {
        results[results.length - 1] = { 
          test: 'Database Connection', 
          status: 'passed' 
        };
      }
      setTestResults([...results]);

      // Test 2: Table Schema Check
      results.push({ test: 'enrollment_consent Schema', status: 'running' });
      setTestResults([...results]);

      const { data: schemaTest, error: schemaError } = await supabase
        .from('enrollment_consent')
        .select('privacy_consent, treatment_consent, signature_date, final_signature')
        .limit(1);

      if (schemaError) {
        results[results.length - 1] = { 
          test: 'enrollment_consent Schema', 
          status: 'failed', 
          error: schemaError.message 
        };
      } else {
        results[results.length - 1] = { 
          test: 'enrollment_consent Schema', 
          status: 'passed',
          details: 'New columns are available'
        };
      }
      setTestResults([...results]);

      // Test 3: Field Mapping Test
      results.push({ test: 'Field Mapping', status: 'running' });
      setTestResults([...results]);

      const testFormData = {
        consent_treatment: true,
        consent_privacy: true,
        provider_name: 'Test Provider',
        patient_first_name: 'Test',
        patient_last_name: 'Patient'
      };

      enrollmentDebugger.debugFieldMapping(testFormData, SMART_FIELD_MAPPINGS);
      const tableUpdates = smartRouteFieldsToTables(testFormData);

      results[results.length - 1] = { 
        test: 'Field Mapping', 
        status: 'passed',
        details: `Mapped to ${tableUpdates.length} tables: ${tableUpdates.map(t => t.tableName).join(', ')}`
      };
      setTestResults([...results]);

      // Test 4: Consent Data Insert Test
      results.push({ test: 'Consent Data Insert', status: 'running' });
      setTestResults([...results]);

      const testEnrollmentId = crypto.randomUUID();
      const { data: authUser } = await supabase.auth.getUser();
      const userId = authUser.user?.id;

      if (!userId) {
        results[results.length - 1] = { 
          test: 'Consent Data Insert', 
          status: 'failed', 
          error: 'Not authenticated: user_id required for RLS' 
        };
        setTestResults([...results]);
      } else {
        // Ensure base patient_enrollments row exists to satisfy RLS
        await supabase.from('patient_enrollments').upsert({
          id: testEnrollmentId,
          user_id: userId,
          session_id: `diagnostic-${Date.now()}`,
          enrollment_source: 'diagnostic_test',
          enrollment_status: 'in_progress',
          current_section: 'consent_management',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        const { data: insertTest, error: insertError } = await supabase
          .from('enrollment_consent')
          .insert({
            enrollment_id: testEnrollmentId,
            consent_to_treatment: true,
            privacy_consent: true,
            patient_signature: 'Test Signature',
            signature_date: new Date().toISOString()
          })
          .select();

        if (insertError) {
          results[results.length - 1] = { 
            test: 'Consent Data Insert', 
            status: 'failed', 
            error: insertError.message 
          };
        } else {
          results[results.length - 1] = { 
            test: 'Consent Data Insert', 
            status: 'passed',
            details: 'Successfully inserted test consent data'
          };

          // Clean up test data
          await supabase.from('enrollment_consent').delete().eq('enrollment_id', testEnrollmentId);
          await supabase.from('patient_enrollments').delete().eq('id', testEnrollmentId);
        }
        setTestResults([...results]);
      }

      // Test 5: Patient Enrollment Insert Test
      results.push({ test: 'Patient Enrollment Insert', status: 'running' });
      setTestResults([...results]);

      if (!userId) {
        results[results.length - 1] = { 
          test: 'Patient Enrollment Insert', 
          status: 'failed', 
          error: 'Not authenticated: user_id required for RLS' 
        };
        setTestResults([...results]);
      } else {
        const { data: patientTest, error: patientError } = await supabase
          .from('patient_enrollments')
          .insert({
            user_id: userId, // Required by RLS
            session_id: `diagnostic-test-${Date.now()}`,
            enrollment_source: 'diagnostic_test',
            enrollment_status: 'in_progress',
            current_section: 'test',
            metadata: { test: true, diagnostic: true }
          })
          .select();

        if (patientError) {
          results[results.length - 1] = { 
            test: 'Patient Enrollment Insert', 
            status: 'failed', 
            error: patientError.message 
          };
        } else {
          results[results.length - 1] = { 
            test: 'Patient Enrollment Insert', 
            status: 'passed',
            details: 'Successfully inserted test patient data'
          };

          // Clean up test data
          if (patientTest && patientTest[0]) {
            await supabase
              .from('patient_enrollments')
              .delete()
              .eq('id', patientTest[0].id);
          }
        }
        setTestResults([...results]);
      }

    } catch (error: any) {
      results.push({ 
        test: 'General Error', 
        status: 'failed', 
        error: error.message 
      });
      setTestResults([...results]);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Play className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">PASSED</Badge>;
      case 'failed': return <Badge variant="destructive">FAILED</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">RUNNING</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <CardTitle>Enrollment System Diagnostics</CardTitle>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Tests...' : 'Run Diagnostics'}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This diagnostic tool tests the enrollment system components to identify any configuration issues.
          </AlertDescription>
        </Alert>

        {testResults.length > 0 && (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.test}</div>
                    {result.details && (
                      <div className="text-sm text-gray-600">{result.details}</div>
                    )}
                    {result.error && (
                      <div className="text-sm text-red-600">Error: {result.error}</div>
                    )}
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}

        {testResults.length === 0 && !isRunning && (
          <div className="text-center text-gray-500 py-8">
            Click "Run Diagnostics" to test the enrollment system components.
          </div>
        )}
      </CardContent>
    </Card>
  );
};