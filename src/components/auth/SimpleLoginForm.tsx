
import React, { useState } from 'react';
import { HealthcareButton } from '@/components/ui/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare-input';
import { HealthcareLabel } from '@/components/ui/healthcare-label';
import { HealthcareCard, HealthcareCardContent, HealthcareCardDescription, HealthcareCardHeader, HealthcareCardTitle } from '@/components/ui/healthcare-card';
import { useAuthContext } from '@/components/auth/SimpleAuthProvider';
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogOut } from 'lucide-react';

const SimpleLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { signIn, signOut, loading, user } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setDebugInfo('');
    
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password');
      return;
    }
    
    console.log('🔐 Form submission:', { email: email.trim() });
    
    const result = await signIn(email, password);
    if (!result.success && result.error) {
      setAuthError(result.error);
      
      // Add debug information for common issues
      if (result.error.includes('Invalid login credentials')) {
        setDebugInfo(`
Debug Info:
- Email entered: ${email.trim()}
- This could mean:
  1. User doesn't exist in database
  2. Password is incorrect
  3. User exists but email isn't confirmed
  4. Email format issues

Try these test credentials if available:
- superadmintest@geniecellgene.com
- Or check Supabase Auth > Users to see existing users
        `);
      }
    }
  };

  const handleSignOut = async () => {
    console.log('🚪 Sign out requested');
    const result = await signOut();
    if (result.success) {
      setEmail('');
      setPassword('');
      setAuthError('');
      setDebugInfo('');
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
            Welcome Back
          </HealthcareCardTitle>
          <HealthcareCardDescription>
            Sign in to access your GENIE portal
          </HealthcareCardDescription>
        </HealthcareCardHeader>
        
        <HealthcareCardContent>
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{authError}</div>
            </div>
          )}

          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <pre className="text-xs text-blue-800 whitespace-pre-wrap">{debugInfo}</pre>
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
            
            <HealthcareButton 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </HealthcareButton>
          </form>
          
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

export default SimpleLoginForm;
