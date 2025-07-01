import React, { useState } from 'react';
import { HealthcareButton } from '@/components/ui/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare-input';
import { HealthcareLabel } from '@/components/ui/healthcare-label';
import { HealthcareCard, HealthcareCardContent, HealthcareCardDescription, HealthcareCardHeader, HealthcareCardTitle } from '@/components/ui/healthcare-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Eye, EyeOff, Mail, Lock, UserPlus, AlertCircle, LogOut, ArrowLeft, User } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';

type UserRole = Database['public']['Enums']['user_role'];

const ComprehensiveLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const { user, signOut } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { performRouting } = useIntelligentRouting();

  const roleOptions = [
    { value: 'superAdmin' as UserRole, label: 'Super Administrator' },
    { value: 'healthcareProvider' as UserRole, label: 'Healthcare Provider (HCP)' },
    { value: 'nurse' as UserRole, label: 'Nurse' },
    { value: 'caseManager' as UserRole, label: 'Care Manager' },
    { value: 'onboardingTeam' as UserRole, label: 'Onboarding Team' },
    { value: 'patientCaregiver' as UserRole, label: 'Patient/Caregiver' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    console.log('🔐 Form submission:', { email: email.trim(), isSignUp, selectedRole });
    
    try {
      if (isSignUp) {
        if (!selectedRole) {
          setAuthError('Please select a role to continue');
          setIsLoading(false);
          return;
        }
        
        console.log('📝 Starting signup process...');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              firstName: '',
              lastName: '',
              role: selectedRole
            }
          }
        });

        if (error) {
          console.error('❌ Sign up error:', error);
          setAuthError(error.message);
        } else if (data.user) {
          console.log('✅ Sign up successful:', data.user.email);
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account before signing in.",
          });
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setSelectedRole('');
        }
      } else {
        console.log('🔑 Starting signin process...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          console.error('❌ Sign in error:', error);
          let errorMessage = error.message;
          
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before signing in. Check your inbox for the verification email.';
          }
          
          setAuthError(errorMessage);
        } else if (data.user) {
          console.log('✅ Sign in successful:', data.user.email);
          toast({
            title: "Welcome Back!",
            description: "Successfully signed in to GENIE portal.",
          });
          
          // Use intelligent routing to redirect user
          setTimeout(() => {
            performRouting();
          }, 100);
        }
      }
    } catch (error: any) {
      console.error('💥 Authentication error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email.trim()) {
      setAuthError('Please enter your email address');
      return;
    }

    setIsSendingResetEmail(true);
    console.log('📧 Sending password reset email for:', email);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/`
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        setAuthError(error.message);
      } else {
        console.log('✅ Password reset email sent successfully');
        toast({
          title: "Password Reset Email Sent",
          description: `A password reset link has been sent to ${email}. Please check your inbox and spam folder.`,
        });
        setIsForgotPassword(false);
        setEmail('');
      }
    } catch (error: any) {
      console.error('💥 Exception during password reset:', error);
      setAuthError('An unexpected error occurred while sending the password reset email. Please try again.');
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleSignOut = async () => {
    console.log('🚪 Sign out requested');
    const result = await signOut();
    if (result.success) {
      setEmail('');
      setPassword('');
      setSelectedRole('');
      setAuthError('');
      navigate('/', { replace: true });
    }
  };

  const navigateToDashboard = () => {
    performRouting();
  };

  // If user is already logged in, show welcome screen with navigation options
  if (user) {
    return (
      <div className="space-y-6">
        <HealthcareCard className="w-full max-w-md mx-auto shadow-lg">
          <HealthcareCardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <HealthcareCardTitle className="text-2xl">
              Welcome Back!
            </HealthcareCardTitle>
            <HealthcareCardDescription>
              You are signed in as {user.email}
            </HealthcareCardDescription>
          </HealthcareCardHeader>
          
          <HealthcareCardContent className="space-y-3">
            <HealthcareButton 
              onClick={navigateToDashboard}
              className="w-full" 
              size="lg"
            >
              Go to Dashboard
            </HealthcareButton>
            
            <div className="grid grid-cols-2 gap-2">
              <HealthcareButton 
                onClick={() => navigate('/users')}
                variant="outline"
                size="sm"
              >
                Users
              </HealthcareButton>
              <HealthcareButton 
                onClick={() => navigate('/patients')}
                variant="outline"
                size="sm"
              >
                Patients
              </HealthcareButton>
              <HealthcareButton 
                onClick={() => navigate('/facilities')}
                variant="outline"
                size="sm"
              >
                Facilities
              </HealthcareButton>
              <HealthcareButton 
                onClick={() => navigate('/modules')}
                variant="outline"
                size="sm"
              >
                Modules
              </HealthcareButton>
            </div>
            
            <div className="border-t pt-3">
              <HealthcareButton 
                onClick={handleSignOut}
                variant="danger"
                className="w-full" 
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing Out...</span>
                  </div>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </>
                )}
              </HealthcareButton>
            </div>
          </HealthcareCardContent>
        </HealthcareCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HealthcareCard className="w-full max-w-md mx-auto shadow-lg">
        <HealthcareCardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
          </div>
          <HealthcareCardTitle className="text-2xl">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'GENIE Portal'}
          </HealthcareCardTitle>
          <HealthcareCardDescription>
            {isForgotPassword 
              ? 'Enter your email address to receive a password reset link'
              : isSignUp 
                ? 'Register for secure access to the GENIE Cell & Gene Therapy platform' 
                : 'Sign in to access your personalized healthcare portal'
            }
          </HealthcareCardDescription>
        </HealthcareCardHeader>
        
        <HealthcareCardContent>
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 whitespace-pre-line">{authError}</div>
            </div>
          )}

          <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <HealthcareLabel htmlFor="email">Email Address</HealthcareLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <HealthcareInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {!isForgotPassword && (
              <div className="space-y-2">
                <HealthcareLabel htmlFor="password">Password</HealthcareLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <HealthcareInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isForgotPassword && isSignUp && (
              <div className="space-y-2">
                <HealthcareLabel htmlFor="role">Select Your Role</HealthcareLabel>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                  <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)} required>
                    <SelectTrigger className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                      <SelectValue placeholder="Choose your role in cell & gene therapy" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-lg">
                      {roleOptions.map((role) => (
                        <SelectItem 
                          key={role.value} 
                          value={role.value}
                          className="hover:bg-slate-50 focus:bg-slate-50"
                        >
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <HealthcareButton 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isSendingResetEmail || (!isForgotPassword && isSignUp && !selectedRole)}
              size="lg"
            >
              {isLoading || isSendingResetEmail ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {isForgotPassword 
                      ? 'Sending Reset Email...' 
                      : isSignUp 
                        ? 'Creating Account...' 
                        : 'Signing In...'
                    }
                  </span>
                </div>
              ) : (
                isForgotPassword 
                  ? 'Send Reset Email' 
                  : isSignUp 
                    ? 'Create Account' 
                    : 'Sign In'
              )}
            </HealthcareButton>
          </form>
          
          <div className="mt-6 space-y-3 text-center">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setAuthError('');
                }}
                className="flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setSelectedRole('');
                    setAuthError('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Create one"
                  }
                </button>
                
                {!isSignUp && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setAuthError('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Test Credentials:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Email: superadmintest@geniecellgene.com</div>
              <div>Or check your Supabase dashboard for existing users</div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-slate-500">
            By continuing, you agree to our terms of service and privacy policy
          </div>
        </HealthcareCardContent>
      </HealthcareCard>
    </div>
  );
};

export default ComprehensiveLoginForm;
