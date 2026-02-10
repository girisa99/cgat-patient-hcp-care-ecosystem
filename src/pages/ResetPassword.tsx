/**
 * RESET PASSWORD PAGE
 * Allows users to set a new password after clicking reset link
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, CheckCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import GenieStudioAuthLayout from '@/components/auth/GenieStudioAuthLayout';
import MasterAuthValidation from '@/components/auth/MasterAuthValidation';

const ResetPassword: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user came from a valid reset link
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setValidSession(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are the same",
        variant: "destructive"
      });
      return;
    }

    const securityCheck = MasterAuthValidation.meetsSecurityRequirements(password);
    if (!securityCheck.isValid) {
      toast({
        title: "Password Too Weak",
        description: securityCheck.message,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message || "Failed to update password",
          variant: "destructive"
        });
        return;
      }

      setResetComplete(true);
      toast({
        title: "Password Updated! 🎉",
        description: "Your password has been successfully changed"
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/genie-studio-auth');
      }, 3000);
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <GenieStudioAuthLayout>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
              <p className="text-muted-foreground">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </GenieStudioAuthLayout>
    );
  }

  if (!validSession) {
    return (
      <GenieStudioAuthLayout>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-red-600">Invalid or Expired Link</CardTitle>
            <CardDescription className="text-base">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Link to="/forgot-password">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                Request New Reset Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </GenieStudioAuthLayout>
    );
  }

  if (resetComplete) {
    return (
      <GenieStudioAuthLayout>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Complete!</CardTitle>
            <CardDescription className="text-base">
              Your password has been successfully updated. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Link to="/genie-studio-auth">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                Go to Login Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </GenieStudioAuthLayout>
    );
  }

  return (
    <GenieStudioAuthLayout>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Create a strong password for your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                New Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-3 h-5 w-5" />
                  Update Password
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Genie Suite • Secure Password Update</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </GenieStudioAuthLayout>
  );
};

export default ResetPassword;
