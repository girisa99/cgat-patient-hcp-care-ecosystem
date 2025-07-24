/**
 * MASTER AUTHENTICATION FORM - REFACTORED FOR STABILITY
 * Unified login/signup component following stability framework principles
 * Version: master-auth-form-v2.0.0 (Phase 2 Refactoring)
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { AuthStateManager } from '@/utils/auth/authStateManager';
import HealthcareAuthLayout from './HealthcareAuthLayout';
import MasterAuthTabs from './MasterAuthTabs';
import MasterAuthValidation from './MasterAuthValidation';
import { useNavigate } from 'react-router-dom';

interface MasterAuthFormProps {
  onSuccess?: () => void;
  defaultTab?: 'login' | 'signup';
}

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export const MasterAuthForm: React.FC<MasterAuthFormProps> = ({ 
  onSuccess,
  defaultTab = 'login'
}) => {
  console.log('🔐 MasterAuthForm component rendering (v2.0.0)...');
  const { isLoading: authLoading, refreshAuth, isAuthenticated } = useMasterAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Form state management
  const [loginData, setLoginData] = useState<AuthFormData>({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate login data
      const validation = MasterAuthValidation.validateLogin(loginData.email, loginData.password);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }

      console.log('🔐 MASTER AUTH - Attempting secure login for:', loginData.email);
      
      // Use AuthStateManager for secure sign-in with proper cleanup
      const result = await AuthStateManager.secureSignIn(loginData.email, loginData.password);

      if (!result.success) {
        console.error('❌ Secure login failed:', result.error);
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Secure login successful - redirecting...');
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard..."
      });
      
      // AuthStateManager handles the redirect, so we don't need to do it here
      onSuccess?.();
      
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

    try {
      // Validate signup data
      const validation = MasterAuthValidation.validateSignup({
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword || '',
        firstName: signupData.firstName || '',
        lastName: signupData.lastName || ''
      });

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }

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
          await refreshAuth(data.user.id);
          onSuccess?.();
          navigate('/', { replace: true });
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
    const sanitizedValue = MasterAuthValidation.sanitizeInput(value);
    
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [field]: sanitizedValue }));
    } else {
      setSignupData(prev => ({ ...prev, [field]: sanitizedValue }));
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <HealthcareAuthLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </HealthcareAuthLayout>
    );
  }

  return (
    <HealthcareAuthLayout>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Healthcare Platform
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Secure access to your healthcare management system
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <MasterAuthTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loginData={loginData}
            signupData={signupData}
            isLoading={isLoading}
            onLogin={handleLogin}
            onSignup={handleSignup}
            onInputChange={handleInputChange}
          />
          
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant • SOC 2 Certified</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>By accessing this system, you agree to our</p>
              <p className="font-semibold text-primary hover:underline cursor-pointer">
                Privacy Policy and Terms of Service
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </HealthcareAuthLayout>
  );
};

export default MasterAuthForm;