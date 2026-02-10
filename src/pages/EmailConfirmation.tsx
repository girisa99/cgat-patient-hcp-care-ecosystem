/**
 * EMAIL CONFIRMATION PAGE
 * Shows confirmation status after user clicks email verification link
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Mail, Sparkles } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import GenieStudioAuthLayout from '@/components/auth/GenieStudioAuthLayout';

type ConfirmationStatus = 'loading' | 'success' | 'error';

const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkConfirmation = async () => {
      try {
        // Check for hash fragment (Supabase redirects with hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const errorDesc = hashParams.get('error_description');
        
        if (errorDesc) {
          setStatus('error');
          setErrorMessage(errorDesc);
          return;
        }

        if (accessToken) {
          // Valid confirmation - user is now logged in
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setStatus('success');
            // Auto-redirect after 3 seconds
            setTimeout(() => {
              navigate('/genie-studio');
            }, 3000);
            return;
          }
        }

        // Check if user is already authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email_confirmed_at) {
          setStatus('success');
          setTimeout(() => {
            navigate('/genie-studio');
          }, 3000);
        } else {
          // No valid confirmation found
          setStatus('error');
          setErrorMessage('Email confirmation failed or link has expired.');
        }
      } catch (error) {
        console.error('Confirmation check error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred during confirmation.');
      }
    };

    checkConfirmation();
  }, [navigate]);

  if (status === 'loading') {
    return (
      <GenieStudioAuthLayout>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-lg font-medium">Confirming your email...</p>
              <p className="text-sm text-muted-foreground mt-2">Please wait while we verify your account</p>
            </div>
          </CardContent>
        </Card>
      </GenieStudioAuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <GenieStudioAuthLayout>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full animate-pulse">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Email Confirmed! 🎉</CardTitle>
            <CardDescription className="text-base">
              Your email has been successfully verified. Welcome to Genie Suite!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Redirecting you to your creative workspace...
            </p>
            
            <Link to="/genie-studio" className="block">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Go to Genie Suite Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </GenieStudioAuthLayout>
    );
  }

  // Error state
  return (
    <GenieStudioAuthLayout>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Confirmation Failed</CardTitle>
          <CardDescription className="text-base">
            {errorMessage || 'We couldn\'t confirm your email address.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            The confirmation link may have expired or already been used.
          </p>
          
          <Link to="/genie-studio-auth" className="block">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Mail className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
          
          <p className="text-xs text-muted-foreground text-center">
            Need help? Contact support@genie.studio
          </p>
        </CardContent>
      </Card>
    </GenieStudioAuthLayout>
  );
};

export default EmailConfirmation;
