
import React, { useState } from 'react';
import { HealthcareButton } from '@/components/ui/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare-input';
import { HealthcareLabel } from '@/components/ui/healthcare-label';
import { HealthcareCard, HealthcareCardContent, HealthcareCardDescription, HealthcareCardHeader, HealthcareCardTitle } from '@/components/ui/healthcare-card';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await signUp(email, password);
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
            ? 'Register for secure access to the healthcare portal' 
            : 'Sign in to access your healthcare portal'
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
          
          <HealthcareButton 
            type="submit" 
            className="w-full" 
            disabled={loading}
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
            onClick={() => setIsSignUp(!isSignUp)}
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
