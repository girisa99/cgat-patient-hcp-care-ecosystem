/**
 * MASTER AUTHENTICATION FORM - SINGLE SOURCE OF TRUTH
 * Unified login/signup component following master consolidation principles
 * Version: master-auth-form-v1.0.0
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import HealthcareAuthLayout from './HealthcareAuthLayout';

interface MasterAuthFormProps {
  onSuccess?: () => void;
  defaultTab?: 'login' | 'signup';
}

export const MasterAuthForm: React.FC<MasterAuthFormProps> = ({ 
  onSuccess,
  defaultTab = 'login'
}) => {
  const { isLoading: authLoading, refreshAuth } = useMasterAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 MASTER AUTH - Attempting login for:', loginData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard..."
        });
        
        // Refresh auth state
        await refreshAuth();
        
        // Call success callback
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }
    } catch (error) {
      console.error('💥 Login exception:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 MASTER AUTH - Attempting signup for:', signupData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName
          }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error.message);
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        console.log('✅ Signup successful:', data.user.email);
        if (data.user.email_confirmed_at) {
          toast({
            title: "Account Created",
            description: "Account created successfully! Redirecting..."
          });
          await refreshAuth();
          setTimeout(() => {
            onSuccess?.();
          }, 1500);
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to confirm your account."
          });
        }
      }
    } catch (error) {
      console.error('💥 Signup exception:', error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    formType: 'login' | 'signup',
    field: string,
    value: string
  ) => {
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setSignupData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (authLoading) {
    return (
      <HealthcareAuthLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </HealthcareAuthLayout>
    );
  }

  return (
    <HealthcareAuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to GENIE</CardTitle>
          <CardDescription>
            Secure access to healthcare management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-firstName"
                        type="text"
                        placeholder="First name"
                        value={signupData.firstName}
                        onChange={(e) => handleInputChange('signup', 'firstName', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-lastName"
                        type="text"
                        placeholder="Last name"
                        value={signupData.lastName}
                        onChange={(e) => handleInputChange('signup', 'lastName', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => handleInputChange('signup', 'email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signupData.password}
                      onChange={(e) => handleInputChange('signup', 'password', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="signup-confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => handleInputChange('signup', 'confirmPassword', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          

          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>By signing in, you agree to our</p>
            <p className="font-medium">Privacy Policy and Terms of Service</p>
          </div>
        </CardContent>
      </Card>
    </HealthcareAuthLayout>
  );
};

export default MasterAuthForm;