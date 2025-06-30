
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type UserRole = Database['public']['Enums']['user_role'];

export const AuthTestComponent = () => {
  const [email, setEmail] = useState('admin@geniecellgene.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<UserRole>('superAdmin');
  const { signIn, signUp, assignUserRole, loading } = useAuthActions();
  const { user, session, isAuthenticated } = useAuthContext();

  const handleTestSignIn = async () => {
    console.log('🧪 Testing sign in with:', { email, password });
    const result = await signIn(email, password);
    console.log('🧪 Sign in result:', result);
  };

  const handleCreateTestUser = async () => {
    console.log('🧪 Creating test user with:', { email, password, role });
    const result = await signUp(email, password, role);
    console.log('🧪 Sign up result:', result);
  };

  const handleAssignRole = async () => {
    if (user) {
      console.log('🧪 Assigning role to current user:', { userId: user.id, role });
      const result = await assignUserRole(user.id, role);
      console.log('🧪 Role assignment result:', result);
    }
  };

  const handleDirectDbTest = async () => {
    console.log('🧪 Testing direct database access...');
    
    try {
      // Test basic database connectivity
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*');
      
      console.log('🧪 Roles table:', { roles, rolesError });

      // Test user data
      if (user) {
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select(`
            *,
            roles (
              name,
              description
            )
          `)
          .eq('user_id', user.id);
        
        console.log('🧪 User roles:', { userRoles, userRolesError });

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('🧪 User profile:', { profile, profileError });
      }
    } catch (error) {
      console.error('🧪 Database test error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email</Label>
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-password">Password</Label>
          <Input
            id="test-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-role">Role</Label>
          <select
            id="test-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="superAdmin">Super Admin</option>
            <option value="onboardingTeam">Onboarding Team</option>
            <option value="healthcareProvider">Healthcare Provider</option>
            <option value="nurse">Nurse</option>
            <option value="caseManager">Case Manager</option>
            <option value="patientCaregiver">Patient Caregiver</option>
          </select>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleTestSignIn} 
            disabled={loading}
            className="w-full"
          >
            Test Sign In
          </Button>
          
          <Button 
            onClick={handleCreateTestUser} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Create Test User
          </Button>

          {user && (
            <Button 
              onClick={handleAssignRole} 
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              Assign Role to Current User
            </Button>
          )}

          <Button 
            onClick={handleDirectDbTest} 
            disabled={loading}
            variant="ghost"
            className="w-full"
          >
            Test Database Access
          </Button>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <h4 className="font-semibold mb-2">Current Auth State:</h4>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {user?.id || 'None'}</p>
          <p><strong>Email:</strong> {user?.email || 'None'}</p>
          <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
