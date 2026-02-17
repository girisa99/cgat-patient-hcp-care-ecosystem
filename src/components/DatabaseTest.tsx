
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DatabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any[] = [];

    // Test 1: Check if profiles table is accessible
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .limit(5);
      
      results.push({
        test: 'Profiles Table',
        status: error ? 'FAILED' : 'SUCCESS',
        data: error ? error.message : `${data?.length || 0} records`,
        details: error || data
      });
    } catch (error) {
      results.push({
        test: 'Profiles Table',
        status: 'ERROR',
        data: 'Exception occurred',
        details: error
      });
    }

    // Test 2: Check if roles table is accessible
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Roles Table',
        status: error ? 'FAILED' : 'SUCCESS',
        data: error ? error.message : `${data?.length || 0} records`,
        details: error || data
      });
    } catch (error) {
      results.push({
        test: 'Roles Table',
        status: 'ERROR',
        data: 'Exception occurred',
        details: error
      });
    }

    // Test 3: Check if user_roles table is accessible
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'User Roles Table',
        status: error ? 'FAILED' : 'SUCCESS',
        data: error ? error.message : `${data?.length || 0} records`,
        details: error || data
      });
    } catch (error) {
      results.push({
        test: 'User Roles Table',
        status: 'ERROR',
        data: 'Exception occurred',
        details: error
      });
    }

    // Test 4: Check if facilities table is accessible
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Facilities Table',
        status: error ? 'FAILED' : 'SUCCESS',
        data: error ? error.message : `${data?.length || 0} records`,
        details: error || data
      });
    } catch (error) {
      results.push({
        test: 'Facilities Table',
        status: 'ERROR',
        data: 'Exception occurred',
        details: error
      });
    }

    // Test 5: Check if modules table is accessible
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Modules Table',
        status: error ? 'FAILED' : 'SUCCESS',
        data: error ? error.message : `${data?.length || 0} records`,
        details: error || data
      });
    } catch (error) {
      results.push({
        test: 'Modules Table',
        status: 'ERROR',
        data: 'Exception occurred',
        details: error
      });
    }

    // Test 6: Check current user info
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      results.push({
        test: 'Current User',
        status: error ? 'FAILED' : 'SUCCESS',
        data: error ? error.message : user?.email || 'No user',
        details: error || { id: user?.id, email: user?.email }
      });
    } catch (error) {
      results.push({
        test: 'Current User',
        status: 'ERROR',
        data: 'Exception occurred',
        details: error
      });
    }

    // Test 7: Check if check_user_has_role function exists
    try {
      const { data, error } = await supabase.rpc('check_user_has_role', {
        check_user_id: '00000000-0000-0000-0000-000000000000',
        role_name: 'superAdmin'
      });
      
      results.push({
        test: 'check_user_has_role Function',
        status: error ? 'FAILED' : 'SUCCESS',
        data: error ? error.message : 'Function exists',
        details: error || data
      });
    } catch (error) {
      results.push({
        test: 'check_user_has_role Function',
        status: 'ERROR',
        data: 'Function missing or invalid',
        details: error
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const createMissingFunction = async () => {
    try {
      // Note: Cannot execute raw SQL through RPC, this would need to be done through migrations
      console.log('Function creation would need to be done through database migrations');
      runTests(); // Re-run tests
    } catch (error) {
      console.error('Exception creating function:', error);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto m-4">
      <CardHeader>
        <CardTitle>Database Connectivity Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Run Tests'}
            </Button>
            <Button onClick={createMissingFunction} variant="outline">
              Create Missing Function
            </Button>
          </div>

          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.test}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                    result.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{result.data}</div>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-500">Details</summary>
                    <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;
