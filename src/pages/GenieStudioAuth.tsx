/**
 * GENIE STUDIO AUTH PAGE
 * Dedicated authentication page for Genie Studio with proper branding
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { AuthStateManager } from '@/utils/auth/authStateManager';
import GenieStudioAuthLayout from '@/components/auth/GenieStudioAuthLayout';
import MasterAuthTabs from '@/components/auth/MasterAuthTabs';
import MasterAuthValidation from '@/components/auth/MasterAuthValidation';
import { useNavigate } from 'react-router-dom';

// Import Genie Studio logo
import genieStudioLogo from '@/assets/logos/genie-studio-horizontal.png';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

const GenieStudioAuth: React.FC = () => {
  const { isLoading: authLoading, refreshAuth, isAuthenticated } = useMasterAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
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

  // Note: Removed auto-redirect to allow viewing auth page design
  // Re-enable this if automatic redirect is needed for authenticated users:
  // useEffect(() => {
  //   if (!authLoading && isAuthenticated) {
  //     navigate('/genie-studio', { replace: true });
  //   }
  // }, [authLoading, isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = MasterAuthValidation.validateLogin(loginData.email, loginData.password);
      
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }

      const result = await AuthStateManager.secureSignIn(loginData.email, loginData.password);

      if (!result.success) {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Welcome to Genie Studio! 🎉",
        description: "Redirecting to your creative workspace..."
      });
      
      navigate('/genie-studio', { replace: true });
      
    } catch (error) {
      console.error('Login exception:', error);
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

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/genie-studio`,
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast({
            title: "Account Created! 🎉",
            description: "Welcome to Genie Studio! Redirecting..."
          });
          await refreshAuth(data.user.id);
          navigate('/genie-studio', { replace: true });
        } else {
          toast({
            title: "Account Created! ✨",
            description: "Please check your email to confirm your account and unlock Genie Studio."
          });
        }
      }
    } catch (error) {
      console.error('Signup exception:', error);
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
      <GenieStudioAuthLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </GenieStudioAuthLayout>
    );
  }

  return (
    <GenieStudioAuthLayout>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg">
              <img 
                src={genieStudioLogo} 
                alt="Genie Studio" 
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Genie Studio
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Sign in to access your AI-powered creative workspace
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
            showGoogleSignIn={true}
            googleRedirectTo={`${window.location.origin}/genie-studio-pricing`}
          />
          
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI-Powered • Secure • Enterprise Ready</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>By signing in, you agree to our</p>
              <p className="font-semibold text-purple-600 hover:underline cursor-pointer">
                Privacy Policy and Terms of Service
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GenieStudioAuthLayout>
  );
};

export default GenieStudioAuth;
