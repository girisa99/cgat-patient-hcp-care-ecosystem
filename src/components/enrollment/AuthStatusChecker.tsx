/**
 * AUTH STATUS CHECKER
 * Simple component to check authentication status for debugging
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, LogIn, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMasterAuth } from '@/hooks/useMasterAuth';

export const AuthStatusChecker: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const { isAuthenticated, user, userRoles } = useMasterAuth();

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      setSupabaseUser(user);
      setAuthStatus({ user, error, isAuthenticated, userRoles });
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus({ error: error.message });
    }
  };

  useEffect(() => {
    checkAuth();
  }, [isAuthenticated]);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Authentication Status</CardTitle>
          </div>
          <Button onClick={checkAuth} variant="outline" size="sm">
            Refresh Status
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Master Auth Status</label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Supabase User</label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={supabaseUser?.id ? "default" : "destructive"}>
                {supabaseUser?.id ? "User Found" : "No User"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">User ID</label>
            <div className="mt-1 text-sm text-gray-800">
              {supabaseUser?.id || 'None'}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">User Email</label>
            <div className="mt-1 text-sm text-gray-800">
              {supabaseUser?.email || 'None'}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">User Roles</label>
            <div className="mt-1">
              {userRoles && userRoles.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {userRoles.map((role: string) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-500">No roles</span>
              )}
            </div>
          </div>
        </div>

        {!isAuthenticated && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Authentication Required:</strong> You need to log in to use the diagnostic tests.
                  The enrollment system uses Row Level Security (RLS) which requires authentication.
                </div>
                <Button onClick={handleLogin} className="ml-4">
                  <LogIn className="h-4 w-4 mr-2" />
                  Go to Login
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {authStatus && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Debug Info:</h4>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};