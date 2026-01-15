/**
 * MASTER AUTH TABS COMPONENT
 * Extracted tab logic from MasterAuthForm for better maintainability
 * Part of Stability Framework Phase 2 refactoring
 * Updated: Added Google OAuth and Okta OIDC support
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

interface MasterAuthTabsProps {
  activeTab: 'login' | 'signup';
  setActiveTab: (tab: 'login' | 'signup') => void;
  loginData: AuthFormData;
  signupData: AuthFormData;
  isLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
  onSignup: (e: React.FormEvent) => void;
  onInputChange: (formType: 'login' | 'signup', field: string, value: string) => void;
  hideSignupTab?: boolean;
  showGoogleSignIn?: boolean;
  showOktaSignIn?: boolean;
  googleRedirectTo?: string;
  oktaRedirectTo?: string;
}

export const MasterAuthTabs: React.FC<MasterAuthTabsProps> = ({
  activeTab,
  setActiveTab,
  loginData,
  signupData,
  isLoading,
  onLogin,
  onSignup,
  onInputChange,
  hideSignupTab = false,
  showGoogleSignIn = true,
  showOktaSignIn = true,
  googleRedirectTo,
  oktaRedirectTo
}) => {
  const { toast } = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oktaLoading, setOktaLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const redirectUrl = googleRedirectTo || `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast({
          title: "Google Sign-in Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Google sign-in exception:', error);
      toast({
        title: "Sign-in Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOktaSignIn = async () => {
    try {
      setOktaLoading(true);
      const redirectUrl = oktaRedirectTo || `${window.location.origin}/`;
      
      // Okta uses the generic OIDC provider in Supabase
      // The provider must be configured in Supabase Dashboard under Authentication > Providers
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'okta' as any, // Okta OIDC provider
        options: {
          redirectTo: redirectUrl,
          scopes: 'openid profile email'
        }
      });

      if (error) {
        console.error('Okta sign-in error:', error);
        
        // Check if Okta is not configured
        if (error.message.includes('provider') || error.message.includes('not enabled')) {
          toast({
            title: "Okta Not Configured",
            description: "Okta SSO needs to be configured in Supabase. Please contact your administrator.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Okta Sign-in Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Okta sign-in exception:', error);
      toast({
        title: "Sign-in Error",
        description: "An unexpected error occurred with Okta. Please try again.",
        variant: "destructive"
      });
    } finally {
      setOktaLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
      {hideSignupTab ? (
        <div className="mb-8 h-12 p-1 bg-muted/20 rounded-lg flex items-center justify-center">
          <div className="h-10 px-6 flex items-center justify-center text-sm font-semibold bg-background text-foreground rounded-md w-full">
            Sign In
          </div>
        </div>
      ) : (
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/20">
          <TabsTrigger 
            value="login" 
            className="h-10 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground transition-all duration-200"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="h-10 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground transition-all duration-200"
          >
            Create Account
          </TabsTrigger>
        </TabsList>
      )}

      <TabsContent value="login" className="space-y-6 mt-6">
        <form onSubmit={onLogin} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">
              Email Address
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email address"
                value={loginData.email}
                onChange={(e) => onInputChange('login', 'email', e.target.value)}
                className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => onInputChange('login', 'password', e.target.value)}
                className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                <Lock className="mr-3 h-5 w-5" />
                Sign In
              </>
            )}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a 
              href="/forgot-password" 
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Forgot your password?
            </a>
          </div>

          {/* OAuth Sign-in Section */}
          {(showGoogleSignIn || showOktaSignIn) && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons Grid */}
              <div className={`grid gap-3 ${showGoogleSignIn && showOktaSignIn ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {/* Google Sign-in Button */}
                {showGoogleSignIn && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-2 font-semibold text-sm hover:bg-muted/50 transition-all"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || oktaLoading || isLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    Google
                  </Button>
                )}

                {/* Okta Sign-in Button */}
                {showOktaSignIn && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-2 font-semibold text-sm hover:bg-muted/50 transition-all"
                    onClick={handleOktaSignIn}
                    disabled={oktaLoading || googleLoading || isLoading}
                  >
                    {oktaLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4 text-blue-600" />
                    )}
                    Okta SSO
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      </TabsContent>

      {!hideSignupTab && (
        <TabsContent value="signup" className="space-y-6 mt-6">
          <form onSubmit={onSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="signup-firstName" className="text-sm font-semibold text-foreground">
                  First Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="signup-firstName"
                    type="text"
                    placeholder="First name"
                    value={signupData.firstName || ''}
                    onChange={(e) => onInputChange('signup', 'firstName', e.target.value)}
                    className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="signup-lastName" className="text-sm font-semibold text-foreground">
                  Last Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="signup-lastName"
                    type="text"
                    placeholder="Last name"
                    value={signupData.lastName || ''}
                    onChange={(e) => onInputChange('signup', 'lastName', e.target.value)}
                    className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={signupData.email}
                  onChange={(e) => onInputChange('signup', 'email', e.target.value)}
                  className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={signupData.password}
                  onChange={(e) => onInputChange('signup', 'password', e.target.value)}
                  className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="signup-confirmPassword" className="text-sm font-semibold text-foreground">
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="signup-confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={signupData.confirmPassword || ''}
                  onChange={(e) => onInputChange('signup', 'confirmPassword', e.target.value)}
                  className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Creating your account...
                </>
              ) : (
                <>
                  <User className="mr-3 h-5 w-5" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default MasterAuthTabs;