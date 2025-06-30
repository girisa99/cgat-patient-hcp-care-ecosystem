
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type UserRole = Database['public']['Enums']['user_role'];

export const AuthTestComponent = () => {
  const [email, setEmail] = useState('admin@geniecellgene.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<UserRole>('superAdmin');
  const { signIn, user, session, isAuthenticated, loading } = useAuthContext();

  const handleTestSignIn = async () => {
    console.log('🧪 Testing sign in with:', { email, password });
    const result = await signIn(email, password);
    console.log('🧪 Sign in result:', result);
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
          <Button 
            onClick={handleTestSignIn} 
            disabled={loading}
            className="w-full"
          >
            Test Sign In
          </Button>

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
