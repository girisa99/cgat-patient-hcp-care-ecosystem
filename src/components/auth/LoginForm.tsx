
import React, { useState } from 'react';
import { HealthcareButton } from '@/components/ui/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare-input';
import { HealthcareLabel } from '@/components/ui/healthcare-label';
import { HealthcareCard, HealthcareCardContent, HealthcareCardDescription, HealthcareCardHeader, HealthcareCardTitle } from '@/components/ui/healthcare-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading } = useAuthActions();

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
    
    if (isSignUp) {
      if (!selectedRole) {
        // Show error that role is required
        return;
      }
      await signUp(email, password, selectedRole);
    } else {
      await signIn(email, password);
    }
  };

  return (
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
  );
};

export default LoginForm;
