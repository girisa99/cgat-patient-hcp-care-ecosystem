/**
 * QUICK HEALTHCARE LOGIN
 * Temporary component for testing - creates healthcare provider account
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, UserPlus, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMasterAuth } from "@/hooks/useMasterAuth";

export const QuickHealthcareLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('');
const { toast } = useToast();
  const { refreshAuth } = useMasterAuth();

  const createAndLoginHealthcareProvider = async () => {
    setIsLoading(true);
    setAuthStatus('Creating healthcare provider account...');

    try {
      // First, try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: 'Healthcare',
            last_name: 'Provider',
            role: 'healthcareProvider'
          }
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('Signup error:', signUpError);
        setAuthStatus(`Signup failed: ${signUpError.message}`);
        toast({
          title: "Signup Failed",
          description: signUpError.message,
          variant: "destructive"
        });
        return;
      }

      // If signup succeeded or user already exists, try to sign in
      setAuthStatus('Signing in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        setAuthStatus(`Sign in failed: ${signInError.message}`);
        toast({
          title: "Sign In Failed", 
          description: signInError.message,
          variant: "destructive"
        });
        return;
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setAuthStatus(`Successfully logged in as: ${session.user.email}`);
        toast({
          title: "Success!",
          description: `Logged in as healthcare provider: ${session.user.email}`,
        });

        // Refresh auth context without full reload
        await refreshAuth();
        setAuthStatus('Session updated. You can continue.');
      } else {
        setAuthStatus('Login appeared successful but no session found');
      }

    } catch (error: any) {
      console.error('Authentication error:', error);
      setAuthStatus(`Error: ${error.message}`);
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setAuthStatus('Testing login...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthStatus(`Login failed: ${error.message}`);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user) {
        setAuthStatus(`Successfully logged in as: ${data.user.email}`);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.email}!`,
        });
        
        // Refresh auth context without full reload
        await refreshAuth();
        setAuthStatus('Session updated. You can continue.');
      }
    } catch (error: any) {
      setAuthStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Quick Healthcare Provider Login</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Testing Only:</strong> This creates a test healthcare provider account for diagnostic testing.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="test-email">Email</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="healthcare.provider@test.com"
            />
          </div>
          
          <div>
            <Label htmlFor="test-password">Password</Label>
            <Input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Healthcare123!"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={createAndLoginHealthcareProvider}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            <span>Create & Login</span>
          </Button>

          <Button
            onClick={testLogin}
            disabled={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogIn className="h-4 w-4" />
            <span>Test Login</span>
          </Button>
        </div>

        {authStatus && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Status:</p>
            <p className="text-sm text-gray-600">{authStatus}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};