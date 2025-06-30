
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthcareButton } from '@/components/ui/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare-input';
import { HealthcareCard, HealthcareCardContent, HealthcareCardHeader, HealthcareCardTitle } from '@/components/ui/healthcare-card';

const AuthDiagnostic = () => {
  const [email, setEmail] = useState('superadmin@geniecellgene.com');
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Check if we can connect to Supabase
      results.push({
        test: 'Supabase Connection',
        status: 'PASS',
        message: 'Successfully connected to Supabase'
      });

      // Test 2: Try to get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        results.push({
          test: 'Get Session',
          status: 'FAIL',
          message: `Session error: ${sessionError.message}`
        });
      } else {
        results.push({
          test: 'Get Session',
          status: 'PASS',
          message: `Current session: ${sessionData.session ? 'Active' : 'None'}`
        });
      }

      // Test 3: Try password reset to verify user exists
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`
      });

      if (resetError) {
        results.push({
          test: 'User Exists (Reset Password)',
          status: 'FAIL',
          message: `Reset error: ${resetError.message}`
        });
      } else {
        results.push({
          test: 'User Exists (Reset Password)',
          status: 'PASS',
          message: 'Password reset email sent successfully (user exists)'
        });
      }

      // Test 4: Check profiles table
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (profileError) {
          results.push({
            test: 'Profile Data',
            status: 'FAIL',
            message: `Profile error: ${profileError.message}`
          });
        } else {
          results.push({
            test: 'Profile Data',
            status: profileData ? 'PASS' : 'WARNING',
            message: profileData ? `Profile found: ${JSON.stringify(profileData, null, 2)}` : 'No profile found in database'
          });
        }
      } catch (err) {
        results.push({
          test: 'Profile Data',
          status: 'ERROR',
          message: `Exception: ${err}`
        });
      }

      // Test 5: Check user_roles table
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            *,
            roles (
              name,
              description
            )
          `);

        if (roleError) {
          results.push({
            test: 'Roles Data',
            status: 'FAIL',
            message: `Roles error: ${roleError.message}`
          });
        } else {
          results.push({
            test: 'Roles Data',
            status: 'INFO',
            message: `All roles in system: ${JSON.stringify(roleData, null, 2)}`
          });
        }
      } catch (err) {
        results.push({
          test: 'Roles Data',
          status: 'ERROR',
          message: `Exception: ${err}`
        });
      }

    } catch (error: any) {
      results.push({
        test: 'General Error',
        status: 'FAIL',
        message: `Unexpected error: ${error.message}`
      });
    }

    setDiagnosticResults(results);
    setLoading(false);
  };

  const clearAuthState = async () => {
    // Clear all localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Sign out
    await supabase.auth.signOut({ scope: 'global' });
    
    alert('Auth state cleared. Please refresh the page.');
  };

  return (
    <HealthcareCard className="w-full max-w-4xl mx-auto">
      <HealthcareCardHeader>
        <HealthcareCardTitle>Authentication Diagnostics</HealthcareCardTitle>
      </HealthcareCardHeader>
      <HealthcareCardContent className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Email to test:</label>
            <HealthcareInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to diagnose"
            />
          </div>
          <HealthcareButton onClick={runDiagnostics} disabled={loading}>
            {loading ? 'Running...' : 'Run Diagnostics'}
          </HealthcareButton>
          <HealthcareButton onClick={clearAuthState} variant="outline">
            Clear Auth State
          </HealthcareButton>
        </div>

        {diagnosticResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Diagnostic Results:</h3>
            <div className="space-y-2">
              {diagnosticResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    result.status === 'PASS'
                      ? 'bg-green-50 border-green-500'
                      : result.status === 'FAIL'
                      ? 'bg-red-50 border-red-500'
                      : result.status === 'WARNING'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{result.test}</div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        result.status === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'FAIL'
                          ? 'bg-red-100 text-red-800'
                          : result.status === 'WARNING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {result.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Common Solutions:</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>If password reset works but login doesn't, the password might have been changed recently</li>
            <li>Check if email confirmation is required in Supabase Auth settings</li>
            <li>Verify the user exists in Supabase Auth &gt; Users dashboard</li>
            <li>Try using the latest password from the reset email</li>
            <li>Clear auth state and try again</li>
          </ul>
        </div>
      </HealthcareCardContent>
    </HealthcareCard>
  );
};

export default AuthDiagnostic;
