/**
 * GENIE STUDIO AUTH PAGE
 * Clean authentication page for Genie Studio
 * Google OAuth as PRIMARY method - separate from patient/provider auth
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import GenieStudioAuthLayout from '@/components/auth/GenieStudioAuthLayout';
import { useNavigate } from 'react-router-dom';

const GenieStudioAuth: React.FC = () => {
  const { 
    isLoading: authLoading, 
    isAuthenticated,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useGenieStudioAuth();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/genie-studio', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle(`${window.location.origin}/genie-studio`);
    // Note: This will redirect, so loading state may not reset
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter your email and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await signInWithEmail(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/genie-studio', { replace: true });
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter your email and password',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await signUpWithEmail(email, password, { firstName, lastName });
    setIsLoading(false);

    if (result.success && !result.needsConfirmation) {
      navigate('/genie-studio', { replace: true });
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <GenieStudioAuthLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </GenieStudioAuthLayout>
    );
  }

  return (
    <GenieStudioAuthLayout>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold">
            <span className="text-foreground">Genie </span>
            <span className="text-primary">Studio</span>
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-2">
            Sign in to access your AI-powered creative workspace
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 space-y-6">
          {/* PRIMARY: Google Sign-in Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 border-2 font-semibold text-base hover:bg-muted/50 transition-all gap-3"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading && !showEmailForm ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email toggle button or form */}
          {!showEmailForm ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setShowEmailForm(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Use email instead
            </Button>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* Footer */}
          <div className="text-center space-y-3 pt-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered • Secure • Enterprise Ready</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>By signing in, you agree to our</p>
              <p className="font-semibold text-primary hover:underline cursor-pointer">
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
