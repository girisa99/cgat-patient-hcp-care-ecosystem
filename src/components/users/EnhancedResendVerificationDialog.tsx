
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailValidationHelper } from '@/utils/auth/emailValidationHelper';
import { Mail, AlertCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedResendVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  userName: string;
}

const EnhancedResendVerificationDialog: React.FC<EnhancedResendVerificationDialogProps> = ({
  open,
  onOpenChange,
  userEmail,
  userName
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [customEmail, setCustomEmail] = useState(userEmail);
  const [useCustomEmail, setUseCustomEmail] = useState(false);

  const resendVerificationEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('❌ Error resending verification email:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification email",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Email Sent",
        description: "Verification email has been sent successfully.",
      });
      return { success: true };
    } catch (error: any) {
      console.error('❌ Exception resending verification email:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const validateEmailAddress = async (email: string) => {
    setIsValidating(true);
    try {
      const result = await EmailValidationHelper.validateEmail(email);
      setValidationResult(result);
      console.log('📧 Email validation result:', result);
    } catch (error) {
      console.error('❌ Email validation failed:', error);
      setValidationResult({
        isValid: false,
        error: 'Failed to validate email',
        suggestions: ['Please try again or use a different email address']
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleResendEmail = async () => {
    const emailToUse = useCustomEmail ? customEmail : userEmail;
    console.log('📧 Resending verification email for:', emailToUse);
    
    // Validate email first
    await validateEmailAddress(emailToUse);
    
    // If validation passes, send the email
    if (validationResult?.isValid) {
      const result = await resendVerificationEmail(emailToUse);
      if (result.success) {
        setEmailSent(true);
        // Auto-close dialog after 3 seconds
        setTimeout(() => {
          onOpenChange(false);
          setEmailSent(false);
          setValidationResult(null);
        }, 3000);
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEmailSent(false);
    setValidationResult(null);
    setUseCustomEmail(false);
    setCustomEmail(userEmail);
  };

  const handleTestEmail = () => {
    const emailToTest = useCustomEmail ? customEmail : userEmail;
    validateEmailAddress(emailToTest);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Fix Email Verification Issues
          </DialogTitle>
          <DialogDescription>
            Resolve email delivery problems and resend verification emails
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">User Details</p>
                <p className="text-sm text-blue-700">
                  <strong>Name:</strong> {userName}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Original Email:</strong> {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Email Address Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="use-original"
                checked={!useCustomEmail}
                onChange={() => setUseCustomEmail(false)}
                className="h-4 w-4"
              />
              <Label htmlFor="use-original">Use original email address</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="use-custom"
                checked={useCustomEmail}
                onChange={() => setUseCustomEmail(true)}
                className="h-4 w-4"
              />
              <Label htmlFor="use-custom">Use different email address</Label>
            </div>
            
            {useCustomEmail && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="custom-email">Custom Email Address</Label>
                <Input
                  id="custom-email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter alternative email address"
                />
              </div>
            )}
          </div>

          {emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Email Sent Successfully!</p>
                  <p className="text-sm text-green-700">
                    Verification email has been sent to {useCustomEmail ? customEmail : userEmail}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800">
                    This will send a new email verification link to <strong>{useCustomEmail ? customEmail : userEmail}</strong>. 
                    The user will need to click the link in their email to verify their account.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {emailSent ? 'Close' : 'Cancel'}
            </Button>
            {!emailSent && (
              <>
                <Button 
                  onClick={handleTestEmail}
                  disabled={loading || isValidating}
                  variant="secondary"
                >
                  {isValidating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Testing...</span>
                    </div>
                  ) : (
                    'Test Email'
                  )}
                </Button>
                <Button 
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Verification Email
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedResendVerificationDialog;
