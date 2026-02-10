/**
 * GENIE STUDIO AUTH PAGE
 * Clean, modern authentication page matching corporate design
 * Google OAuth as PRIMARY method with email fallback
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Mail, Lock, User, Crown, ArrowLeft, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

// Product logos for showcase
import genieSparkLogo from '@/assets/logos/products/genie-spark.png';
import genieMindLogo from '@/assets/logos/products/genie-mind.png';
import genieVibeLogo from '@/assets/logos/products/genie-vibe.png';
import genieDeckLogo from '@/assets/logos/products/genie-deck.png';

// Tier display config
const TIER_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  free: { label: 'Free', color: 'bg-muted text-muted-foreground' },
  creator: { label: 'Creator', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  professional: { label: 'Professional', color: 'bg-primary/10 text-primary border-primary/20', icon: <Crown className="w-3 h-3" /> },
  studio: { label: 'Studio', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: <Crown className="w-3 h-3" /> },
  enterprise: { label: 'Enterprise', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Crown className="w-3 h-3" /> },
};

type SubscriptionTier = 'free' | 'creator' | 'professional' | 'studio' | 'enterprise';

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
  const [searchParams] = useSearchParams();
  
  // Get selected tier from URL (from pricing page)
  const selectedTier = (searchParams.get('tier') as SubscriptionTier) || 'free';
  const tierConfig = TIER_CONFIG[selectedTier] || TIER_CONFIG.free;
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );
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
    await signInWithGoogle(`${window.location.origin}/genie-studio?tier=${selectedTier}`);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/genie-landing" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Genie Suite
            </span>
          </Link>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/genie-landing')} 
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="pt-16 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-12 flex-col justify-center items-center">
          <div className="max-w-md text-center">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-20 w-auto mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Genie Suite
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              The complete AI-powered creative suite with 7 products and 206 pipelines.
            </p>
            
            {/* Product showcase */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { logo: genieSparkLogo, name: 'Spark', tagline: 'Ignite Ideas' },
                { logo: genieMindLogo, name: 'Mind', tagline: 'AI Understanding' },
                { logo: genieVibeLogo, name: 'Vibe', tagline: 'Script to Screen' },
                { logo: genieDeckLogo, name: 'Deck', tagline: 'Ideas to Impact' },
              ].map((product) => (
                <div key={product.name} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                  <img src={product.logo} alt={product.name} className="w-10 h-10 object-contain" />
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-md shadow-xl border-border bg-card">
            <CardHeader className="text-center pb-4">
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-4">
                <img src={genieSuiteLogo} alt="Genie Suite" className="h-12 w-auto" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-foreground">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {activeTab === 'login' 
                  ? 'Sign in to access your creative workspace' 
                  : 'Start your AI-powered creative journey'}
              </CardDescription>
              
              {/* Show selected tier if coming from pricing */}
              {selectedTier && selectedTier !== 'free' && (
                <div className="mt-4">
                  <Badge className={`${tierConfig.color} text-sm px-3 py-1 border`}>
                    {tierConfig.icon}
                    <span className="ml-1">Selected: {tierConfig.label} Plan</span>
                  </Badge>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* PRIMARY: Google Sign-in Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 font-medium hover:bg-muted/50 transition-all gap-3"
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
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Form */}
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
                  <TabsList className="grid w-full grid-cols-2 bg-muted">
                    <TabsTrigger value="login" className="data-[state=active]:bg-background">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-background">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-foreground">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-background border-border"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-foreground">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 bg-background border-border"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="firstName"
                              placeholder="John"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="pl-10 bg-background border-border"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-background border-border"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 bg-background border-border"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 bg-background border-border"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}

              {/* Footer */}
              <div className="text-center space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>7 Products • 206 Pipelines • One Platform</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GenieStudioAuth;
