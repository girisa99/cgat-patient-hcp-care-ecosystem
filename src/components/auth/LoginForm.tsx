import React, { useState } from 'react';
import { HealthcareButton } from '@/components/ui/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare-input';
import { HealthcareLabel } from '@/components/ui/healthcare-label';
import { HealthcareCard, HealthcareCardContent, HealthcareCardDescription, HealthcareCardHeader, HealthcareCardTitle } from '@/components/ui/healthcare-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Eye, EyeOff, Mail, Lock, UserPlus, AlertCircle, LogOut, Users } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type UserRole = Database['public']['Enums']['user_role'];

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [isCreatingTestAccounts, setIsCreatingTestAccounts] = useState(false);
  const { signIn, signUp, signOut, loading } = useAuthActions();
  const { user } = useAuthContext();
  const { toast } = useToast();

  const roleOptions = [
    { value: 'superAdmin' as UserRole, label: 'Super Administrator' },
    { value: 'healthcareProvider' as UserRole, label: 'Healthcare Provider (HCP)' },
    { value: 'nurse' as UserRole, label: 'Nurse' },
    { value: 'caseManager' as UserRole, label: 'Care Manager' },
    { value: 'onboardingTeam' as UserRole, label: 'Onboarding Team' },
    { value: 'patientCaregiver' as UserRole, label: 'Patient/Caregiver' }
  ];

  // Updated test credentials with stronger passwords
  const testCredentials = [
    { email: 'superadmin@geniecellgene.com', password: 'SuperAdmin2024!Secure', role: 'superAdmin' as UserRole },
    { email: 'onboarding@geniecellgene.com', password: 'OnboardingTeam2024!Safe', role: 'onboardingTeam' as UserRole },
    { email: 'provider@geniecellgene.com', password: 'HealthcareProvider2024!Strong', role: 'healthcareProvider' as UserRole },
    { email: 'patient@geniecellgene.com', password: 'PatientCaregiver2024!Robust', role: 'patientCaregiver' as UserRole }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    console.log('🔐 Form submission:', { email, isSignUp, selectedRole });
    
    try {
      if (isSignUp) {
        if (!selectedRole) {
          setAuthError('Please select a role to continue');
          return;
        }
        console.log('📝 Starting signup process...');
        const result = await signUp(email, password, selectedRole);
        if (!result.success) {
          setAuthError(result.error || 'Failed to create account');
        }
      } else {
        console.log('🔑 Starting signin process...');
        const result = await signIn(email, password);
        if (!result.success) {
          const errorMsg = result.error || 'Invalid email or password';
          console.error('🚨 Sign in failed:', errorMsg);
          setAuthError(errorMsg);
          
          if (errorMsg.includes('Invalid login credentials')) {
            setAuthError(
              'Invalid email or password. The account may not exist. Try creating the test accounts first, or create a new account.'
            );
          }
        }
      }
    } catch (error) {
      console.error('💥 Authentication error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  const handleSignOut = async () => {
    console.log('🚪 Sign out requested');
    const result = await signOut();
    if (result.success) {
      // Clear form
      setEmail('');
      setPassword('');
      setSelectedRole('');
      setAuthError('');
    }
  };

  const fillTestCredentials = (creds: typeof testCredentials[0]) => {
    setEmail(creds.email);
    setPassword(creds.password);
    setSelectedRole(creds.role);
    setIsSignUp(false);
    setAuthError('');
  };

  const createAllTestAccounts = async () => {
    setIsCreatingTestAccounts(true);
    setAuthError('');
    
    console.log('🔧 Creating all test accounts with secure passwords...');
    let successCount = 0;
    let failCount = 0;
    
    for (const creds of testCredentials) {
      try {
        console.log(`Creating account: ${creds.email}`);
        const result = await signUp(creds.email, creds.password, creds.role);
        
        if (result.success) {
          successCount++;
          console.log(`✅ Created: ${creds.email}`);
        } else {
          failCount++;
          console.log(`❌ Failed to create: ${creds.email} - ${result.error}`);
          
          // If account already exists, that's not really a failure
          if (result.error?.includes('already registered')) {
            successCount++;
            failCount--;
            console.log(`ℹ️ Account already exists: ${creds.email}`);
          }
        }
        
        // Small delay between account creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failCount++;
        console.error(`💥 Error creating ${creds.email}:`, error);
      }
    }
    
    setIsCreatingTestAccounts(false);
    
    if (successCount > 0) {
      toast({
        title: "Test Accounts Ready",
        description: `${successCount} test accounts are now available for login.`,
      });
    }
    
    if (failCount > 0) {
      setAuthError(`Created ${successCount} accounts, but ${failCount} failed. Check console for details.`);
    }
  };

  // If user is already logged in, show sign out option
  if (user) {
    return (
      <div className="space-y-6">
        <HealthcareCard className="w-full max-w-md mx-auto shadow-lg">
          <HealthcareCardHeader className="text-center">
            <HealthcareCardTitle className="text-2xl">
              Welcome Back
            </HealthcareCardTitle>
            <HealthcareCardDescription>
              You are currently signed in as {user.email}
            </HealthcareCardDescription>
          </HealthcareCardHeader>
          
          <HealthcareCardContent>
            <HealthcareButton 
              onClick={handleSignOut}
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
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
          </HealthcareCardContent>
        </HealthcareCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HealthcareCard className="w-full max-w-md mx-auto shadow-lg">
        <HealthcareCardHeader className="text-center">
          <HealthcareCardTitle className="text-2xl">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </HealthcareCardTitle>
          <HealthcareCardDescription>
            {isSignUp 
              ? 'Register for secure access to GENIE platform' 
              : 'Sign in to access your GENIE portal'
            }
          </HealthcareCardDescription>
        </HealthcareCardHeader>
        
        <HealthcareCardContent>
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            {isSignUp && (
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
              disabled={loading || (isSignUp && !selectedRole)}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </HealthcareButton>
          </form>
          
          <div className="mt-6 text-center">
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
          </div>
          
          <div className="mt-4 text-center text-xs text-slate-500">
            By continuing, you agree to our terms of service and privacy policy
          </div>
        </HealthcareCardContent>
      </HealthcareCard>

      {/* Test Credentials Helper */}
      <HealthcareCard className="w-full max-w-md mx-auto shadow-sm bg-blue-50">
        <HealthcareCardHeader>
          <HealthcareCardTitle className="text-lg text-blue-800">Test Credentials</HealthcareCardTitle>
          <HealthcareCardDescription className="text-blue-600">
            Click to auto-fill credentials or create test accounts with secure passwords
          </HealthcareCardDescription>
        </HealthcareCardHeader>
        <HealthcareCardContent className="space-y-3">
          {/* Create All Test Accounts Button */}
          <div className="mb-4">
            <HealthcareButton
              onClick={createAllTestAccounts}
              disabled={isCreatingTestAccounts}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isCreatingTestAccounts ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Creating Secure Test Accounts...</span>
                </div>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create All Test Accounts
                </>
              )}
            </HealthcareButton>
          </div>

          {testCredentials.map((creds, index) => (
            <button
              key={index}
              onClick={() => fillTestCredentials(creds)}
              className="w-full text-left p-2 rounded border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
            >
              <div className="font-medium text-blue-800">{roleOptions.find(r => r.value === creds.role)?.label}</div>
              <div className="text-blue-600">{creds.email}</div>
              <div className="text-xs text-blue-500">Secure password included</div>
            </button>
          ))}
        </HealthcareCardContent>
      </HealthcareCard>
    </div>
  );
};

export default LoginForm;
