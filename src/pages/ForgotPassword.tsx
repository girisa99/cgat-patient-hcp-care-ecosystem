/**
 * FORGOT PASSWORD PAGE
 * Allows users to request a password reset email
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useNavigate, Link } from 'react-router-dom';
import GenieStudioAuthLayout from '@/components/auth/GenieStudioAuthLayout';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useMasterAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message || "Failed to send reset email",
          variant: "destructive"
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "Email Sent! ✨",
        description: "Check your inbox for password reset instructions"
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <GenieStudioAuthLayout>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent password reset instructions to:
              <br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              Try Again
            </Button>
            
            <Link to="/genie-studio-auth" className="block">
              <Button 
                variant="ghost"
                className="w-full text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter your email and we'll send you reset instructions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="reset-email" className="text-sm font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-3 h-5 w-5" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <Link to="/genie-studio-auth" className="block">
              <Button 
                variant="ghost"
                className="w-full text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Genie Suite • Secure Password Reset</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </GenieStudioAuthLayout>
  );
};

export default ForgotPassword;
